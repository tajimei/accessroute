"""メモリ・リソースモニタリングモジュール。

GPU/CPU/RAMの使用量を定期取得し、ログファイル出力と
Prometheusメトリクス形式での出力を行う。
psutil がなくても /proc から情報を読み取る。
"""

import logging
import os
import subprocess
import threading
import time
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass
class GPUMetrics:
    """GPU メトリクス。"""

    gpu_id: int = 0
    name: str = "N/A"
    memory_used_mb: float = 0.0
    memory_total_mb: float = 0.0
    memory_utilization_pct: float = 0.0
    gpu_utilization_pct: float = 0.0
    temperature_c: float = 0.0


@dataclass
class SystemMetrics:
    """システム全体のメトリクス。"""

    timestamp: float = 0.0
    cpu_percent: float = 0.0
    ram_used_mb: float = 0.0
    ram_total_mb: float = 0.0
    ram_percent: float = 0.0
    gpu_metrics: list[GPUMetrics] = field(default_factory=list)


@dataclass
class RequestMetrics:
    """リクエストカウンターメトリクス。"""

    total_requests: int = 0
    chat_requests: int = 0
    extract_requests: int = 0
    health_requests: int = 0
    error_count: int = 0
    total_latency_ms: float = 0.0

    @property
    def avg_latency_ms(self) -> float:
        """平均レイテンシ（ミリ秒）。"""
        if self.total_requests == 0:
            return 0.0
        return self.total_latency_ms / self.total_requests


def _read_cpu_percent() -> float:
    """/proc/stat からCPU使用率を概算する。"""
    try:
        with open("/proc/stat", encoding="utf-8") as f:
            line = f.readline()
        parts = line.split()
        if len(parts) < 5:
            return 0.0
        # user + nice + system / (user + nice + system + idle)
        user = int(parts[1])
        nice = int(parts[2])
        system = int(parts[3])
        idle = int(parts[4])
        total = user + nice + system + idle
        if total == 0:
            return 0.0
        return round((user + nice + system) / total * 100, 1)
    except (OSError, ValueError, IndexError):
        return 0.0


def _read_memory_info() -> tuple[float, float, float]:
    """/proc/meminfo からメモリ情報を読み取る。(used_mb, total_mb, percent)"""
    try:
        mem_info: dict[str, int] = {}
        with open("/proc/meminfo", encoding="utf-8") as f:
            for line in f:
                parts = line.split()
                if len(parts) >= 2:
                    key = parts[0].rstrip(":")
                    mem_info[key] = int(parts[1])  # kB単位

        total_kb = mem_info.get("MemTotal", 0)
        available_kb = mem_info.get("MemAvailable", 0)
        used_kb = total_kb - available_kb
        total_mb = total_kb / 1024
        used_mb = used_kb / 1024
        percent = (used_kb / total_kb * 100) if total_kb > 0 else 0.0
        return round(used_mb, 1), round(total_mb, 1), round(percent, 1)
    except (OSError, ValueError, KeyError):
        return 0.0, 0.0, 0.0


class ResourceMonitor:
    """リソースモニター。定期的にシステムリソースを取得する。"""

    def __init__(
        self,
        interval_seconds: float = 10.0,
        log_file: str | None = None,
    ) -> None:
        self._interval = interval_seconds
        self._log_file = log_file
        self._running = False
        self._thread: threading.Thread | None = None
        self._lock = threading.Lock()
        self._latest_metrics: SystemMetrics = SystemMetrics()
        self._request_metrics = RequestMetrics()
        self._file_logger: logging.Logger | None = None

        if log_file:
            self._setup_file_logger(log_file)

    def _setup_file_logger(self, log_file: str) -> None:
        """ファイルロガーを設定する。"""
        self._file_logger = logging.getLogger("monitor.file")
        self._file_logger.setLevel(logging.INFO)
        self._file_logger.handlers.clear()
        handler = logging.FileHandler(log_file, encoding="utf-8")
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
        )
        self._file_logger.addHandler(handler)

    def start(self) -> None:
        """モニタリングを開始する。"""
        if self._running:
            return
        self._running = True
        self._thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()
        logger.info("リソースモニタリング開始 (間隔: %.1f秒)", self._interval)

    def stop(self) -> None:
        """モニタリングを停止する。"""
        self._running = False
        if self._thread:
            self._thread.join(timeout=self._interval + 1)
        logger.info("リソースモニタリング停止")

    def record_request(self, endpoint: str, latency_ms: float, is_error: bool = False) -> None:
        """リクエストを記録する。"""
        with self._lock:
            self._request_metrics.total_requests += 1
            self._request_metrics.total_latency_ms += latency_ms

            if endpoint == "/v1/chat":
                self._request_metrics.chat_requests += 1
            elif endpoint == "/v1/extract-needs":
                self._request_metrics.extract_requests += 1
            elif endpoint == "/health":
                self._request_metrics.health_requests += 1

            if is_error:
                self._request_metrics.error_count += 1

    def get_latest_metrics(self) -> SystemMetrics:
        """最新のシステムメトリクスを取得する。"""
        with self._lock:
            return self._latest_metrics

    def get_request_metrics(self) -> RequestMetrics:
        """リクエストメトリクスを取得する。"""
        with self._lock:
            return RequestMetrics(
                total_requests=self._request_metrics.total_requests,
                chat_requests=self._request_metrics.chat_requests,
                extract_requests=self._request_metrics.extract_requests,
                health_requests=self._request_metrics.health_requests,
                error_count=self._request_metrics.error_count,
                total_latency_ms=self._request_metrics.total_latency_ms,
            )

    def get_prometheus_metrics(self) -> str:
        """Prometheus形式でメトリクスを出力する。"""
        lines: list[str] = []
        metrics = self.get_latest_metrics()
        req_metrics = self.get_request_metrics()

        # CPU
        lines.append("# HELP accessroute_cpu_percent CPU使用率")
        lines.append("# TYPE accessroute_cpu_percent gauge")
        lines.append(f"accessroute_cpu_percent {metrics.cpu_percent}")

        # RAM
        lines.append("# HELP accessroute_ram_used_bytes RAM使用量（バイト）")
        lines.append("# TYPE accessroute_ram_used_bytes gauge")
        lines.append(f"accessroute_ram_used_bytes {metrics.ram_used_mb * 1024 * 1024:.0f}")

        lines.append("# HELP accessroute_ram_total_bytes RAM合計（バイト）")
        lines.append("# TYPE accessroute_ram_total_bytes gauge")
        lines.append(f"accessroute_ram_total_bytes {metrics.ram_total_mb * 1024 * 1024:.0f}")

        lines.append("# HELP accessroute_ram_percent RAM使用率")
        lines.append("# TYPE accessroute_ram_percent gauge")
        lines.append(f"accessroute_ram_percent {metrics.ram_percent}")

        # GPU
        for gpu in metrics.gpu_metrics:
            gpu_id = str(gpu.gpu_id)
            lines.append("# HELP accessroute_gpu_memory_used_bytes GPUメモリ使用量")
            lines.append("# TYPE accessroute_gpu_memory_used_bytes gauge")
            lines.append(
                f'accessroute_gpu_memory_used_bytes{{gpu="{gpu_id}"}} '
                f"{gpu.memory_used_mb * 1024 * 1024:.0f}"
            )

            lines.append("# HELP accessroute_gpu_memory_total_bytes GPUメモリ合計")
            lines.append("# TYPE accessroute_gpu_memory_total_bytes gauge")
            lines.append(
                f'accessroute_gpu_memory_total_bytes{{gpu="{gpu_id}"}} '
                f"{gpu.memory_total_mb * 1024 * 1024:.0f}"
            )

            lines.append("# HELP accessroute_gpu_utilization_percent GPU使用率")
            lines.append("# TYPE accessroute_gpu_utilization_percent gauge")
            lines.append(
                f'accessroute_gpu_utilization_percent{{gpu="{gpu_id}"}} '
                f"{gpu.gpu_utilization_pct}"
            )

        # リクエストメトリクス
        lines.append("# HELP accessroute_requests_total 総リクエスト数")
        lines.append("# TYPE accessroute_requests_total counter")
        lines.append(f"accessroute_requests_total {req_metrics.total_requests}")

        lines.append("# HELP accessroute_requests_chat チャットリクエスト数")
        lines.append("# TYPE accessroute_requests_chat counter")
        lines.append(f"accessroute_requests_chat {req_metrics.chat_requests}")

        lines.append("# HELP accessroute_requests_extract ニーズ抽出リクエスト数")
        lines.append("# TYPE accessroute_requests_extract counter")
        lines.append(f"accessroute_requests_extract {req_metrics.extract_requests}")

        lines.append("# HELP accessroute_errors_total エラー数")
        lines.append("# TYPE accessroute_errors_total counter")
        lines.append(f"accessroute_errors_total {req_metrics.error_count}")

        lines.append("# HELP accessroute_avg_latency_ms 平均レイテンシ（ミリ秒）")
        lines.append("# TYPE accessroute_avg_latency_ms gauge")
        lines.append(f"accessroute_avg_latency_ms {req_metrics.avg_latency_ms:.2f}")

        return "\n".join(lines) + "\n"

    def _monitor_loop(self) -> None:
        """モニタリングループ。"""
        while self._running:
            try:
                metrics = self._collect_metrics()
                with self._lock:
                    self._latest_metrics = metrics

                if self._file_logger:
                    try:
                        self._log_metrics(metrics)
                    except Exception:
                        logger.debug("メトリクスのファイル出力に失敗", exc_info=True)

            except Exception:
                logger.debug("メトリクス収集中にエラー発生", exc_info=True)

            time.sleep(self._interval)

    def _collect_metrics(self) -> SystemMetrics:
        """システムメトリクスを収集する。"""
        metrics = SystemMetrics(timestamp=time.time())

        # CPU
        metrics.cpu_percent = _read_cpu_percent()

        # RAM
        metrics.ram_used_mb, metrics.ram_total_mb, metrics.ram_percent = _read_memory_info()

        # GPU（nvidia-smi パース）
        metrics.gpu_metrics = self._collect_gpu_metrics()

        return metrics

    def _collect_gpu_metrics(self) -> list[GPUMetrics]:
        """nvidia-smi を呼び出してGPUメトリクスを収集する。"""
        try:
            result = subprocess.run(
                [
                    "nvidia-smi",
                    "--query-gpu=index,name,memory.used,memory.total,utilization.gpu,temperature.gpu",
                    "--format=csv,noheader,nounits",
                ],
                capture_output=True,
                text=True,
                timeout=5,
            )
            if result.returncode != 0:
                return []

            gpu_list: list[GPUMetrics] = []
            for line in result.stdout.strip().split("\n"):
                if not line.strip():
                    continue
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 6:
                    gpu_list.append(
                        GPUMetrics(
                            gpu_id=int(parts[0]),
                            name=parts[1],
                            memory_used_mb=float(parts[2]),
                            memory_total_mb=float(parts[3]),
                            memory_utilization_pct=float(parts[2]) / float(parts[3]) * 100 if float(parts[3]) > 0 else 0,
                            gpu_utilization_pct=float(parts[4]),
                            temperature_c=float(parts[5]),
                        )
                    )
            return gpu_list

        except (FileNotFoundError, subprocess.TimeoutExpired):
            return []
        except Exception:
            logger.debug("GPU メトリクス収集失敗", exc_info=True)
            return []

    def _log_metrics(self, metrics: SystemMetrics) -> None:
        """メトリクスをログファイルに書き込む。"""
        if not self._file_logger:
            return

        parts = [
            f"CPU={metrics.cpu_percent:.1f}%",
            f"RAM={metrics.ram_used_mb:.0f}/{metrics.ram_total_mb:.0f}MB({metrics.ram_percent:.1f}%)",
        ]

        for gpu in metrics.gpu_metrics:
            parts.append(
                f"GPU{gpu.gpu_id}={gpu.memory_used_mb:.0f}/{gpu.memory_total_mb:.0f}MB"
                f"(util={gpu.gpu_utilization_pct:.0f}%,temp={gpu.temperature_c:.0f}C)"
            )

        req = self.get_request_metrics()
        parts.append(f"Requests={req.total_requests}(err={req.error_count})")
        parts.append(f"AvgLatency={req.avg_latency_ms:.1f}ms")

        self._file_logger.info(" ".join(parts))


# グローバルモニターインスタンス
_monitor: ResourceMonitor | None = None


def get_monitor() -> ResourceMonitor:
    """グローバルモニターインスタンスを取得する。"""
    global _monitor
    if _monitor is None:
        log_file = os.getenv("MONITOR_LOG_FILE", "monitor.log")
        interval = float(os.getenv("MONITOR_INTERVAL", "10"))
        _monitor = ResourceMonitor(
            interval_seconds=interval,
            log_file=log_file,
        )
    return _monitor
