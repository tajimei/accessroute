"""負荷テストスクリプト。

asyncio + aiohttp ベースの同時接続テストを実行し、
/v1/chat と /v1/extract-needs への並列リクエスト性能を計測する。
"""

import argparse
import asyncio
import json
import statistics
import time
from dataclasses import dataclass, field
from typing import Any

import aiohttp


@dataclass
class RequestResult:
    """個別リクエストの結果。"""

    endpoint: str
    status_code: int
    latency_ms: float
    success: bool
    error: str | None = None


@dataclass
class LoadTestConfig:
    """負荷テストの設定。"""

    base_url: str = "http://localhost:8000"
    concurrent_users: int = 10
    total_requests: int = 100
    ramp_up_seconds: float = 5.0
    timeout_seconds: float = 30.0


@dataclass
class LoadTestReport:
    """負荷テストの結果レポート。"""

    config: dict[str, Any] = field(default_factory=dict)
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    error_rate: float = 0.0
    total_duration_seconds: float = 0.0
    throughput_rps: float = 0.0
    latency_avg_ms: float = 0.0
    latency_p50_ms: float = 0.0
    latency_p95_ms: float = 0.0
    latency_p99_ms: float = 0.0
    latency_min_ms: float = 0.0
    latency_max_ms: float = 0.0
    endpoint_stats: dict[str, dict[str, Any]] = field(default_factory=dict)
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """辞書形式に変換する。"""
        return {
            "config": self.config,
            "summary": {
                "total_requests": self.total_requests,
                "successful_requests": self.successful_requests,
                "failed_requests": self.failed_requests,
                "error_rate": round(self.error_rate, 4),
                "total_duration_seconds": round(self.total_duration_seconds, 2),
                "throughput_rps": round(self.throughput_rps, 2),
            },
            "latency": {
                "avg_ms": round(self.latency_avg_ms, 2),
                "p50_ms": round(self.latency_p50_ms, 2),
                "p95_ms": round(self.latency_p95_ms, 2),
                "p99_ms": round(self.latency_p99_ms, 2),
                "min_ms": round(self.latency_min_ms, 2),
                "max_ms": round(self.latency_max_ms, 2),
            },
            "endpoint_stats": self.endpoint_stats,
            "errors": self.errors[:20],  # エラーは最大20件
        }


# テスト用リクエストペイロード
CHAT_PAYLOADS: list[dict[str, Any]] = [
    {
        "messages": [
            {"role": "user", "content": "車椅子で東京駅周辺を観光したいです。"}
        ],
        "max_tokens": 256,
        "temperature": 0.7,
    },
    {
        "messages": [
            {"role": "user", "content": "ベビーカーで京都を回りたいです。階段は避けたいです。"}
        ],
        "max_tokens": 256,
        "temperature": 0.7,
    },
    {
        "messages": [
            {"role": "user", "content": "足が悪いので休憩場所の多いルートを教えてください。"},
        ],
        "max_tokens": 256,
        "temperature": 0.7,
    },
]

EXTRACT_PAYLOADS: list[dict[str, Any]] = [
    {
        "messages": [
            {"role": "user", "content": "車椅子を使っています。段差は避けたいです。"},
        ]
    },
    {
        "messages": [
            {"role": "user", "content": "杖をついています。500メートルくらいが限界です。"},
        ]
    },
    {
        "messages": [
            {"role": "user", "content": "ベビーカーで子供と出かけたいです。休憩場所が欲しいです。"},
        ]
    },
]


async def send_request(
    session: aiohttp.ClientSession,
    base_url: str,
    endpoint: str,
    payload: dict[str, Any],
    timeout: float,
) -> RequestResult:
    """単一リクエストを送信し結果を返す。"""
    url = f"{base_url}{endpoint}"
    start = time.perf_counter()
    try:
        async with session.post(
            url,
            json=payload,
            timeout=aiohttp.ClientTimeout(total=timeout),
        ) as response:
            latency = (time.perf_counter() - start) * 1000
            await response.read()
            return RequestResult(
                endpoint=endpoint,
                status_code=response.status,
                latency_ms=latency,
                success=(200 <= response.status < 300),
            )
    except asyncio.TimeoutError:
        latency = (time.perf_counter() - start) * 1000
        return RequestResult(
            endpoint=endpoint,
            status_code=0,
            latency_ms=latency,
            success=False,
            error="タイムアウト",
        )
    except aiohttp.ClientError as e:
        latency = (time.perf_counter() - start) * 1000
        return RequestResult(
            endpoint=endpoint,
            status_code=0,
            latency_ms=latency,
            success=False,
            error=str(e),
        )


async def worker(
    worker_id: int,
    session: aiohttp.ClientSession,
    config: LoadTestConfig,
    request_queue: asyncio.Queue[tuple[str, dict[str, Any]]],
    results: list[RequestResult],
) -> None:
    """ワーカー: キューからリクエストを取り出して送信する。"""
    while True:
        try:
            endpoint, payload = request_queue.get_nowait()
        except asyncio.QueueEmpty:
            break

        result = await send_request(
            session, config.base_url, endpoint, payload, config.timeout_seconds
        )
        results.append(result)
        request_queue.task_done()


def _calculate_percentile(sorted_values: list[float], percentile: float) -> float:
    """ソート済みリストからパーセンタイル値を計算する。"""
    if not sorted_values:
        return 0.0
    idx = int(len(sorted_values) * percentile / 100)
    idx = min(idx, len(sorted_values) - 1)
    return sorted_values[idx]


def generate_report(
    results: list[RequestResult],
    config: LoadTestConfig,
    duration: float,
) -> LoadTestReport:
    """結果からレポートを生成する。"""
    report = LoadTestReport(
        config={
            "base_url": config.base_url,
            "concurrent_users": config.concurrent_users,
            "total_requests": config.total_requests,
            "ramp_up_seconds": config.ramp_up_seconds,
        },
        total_requests=len(results),
        total_duration_seconds=duration,
    )

    if not results:
        return report

    report.successful_requests = sum(1 for r in results if r.success)
    report.failed_requests = report.total_requests - report.successful_requests
    report.error_rate = report.failed_requests / report.total_requests
    report.throughput_rps = report.total_requests / duration if duration > 0 else 0

    # レイテンシ統計
    latencies = sorted(r.latency_ms for r in results)
    report.latency_avg_ms = statistics.mean(latencies)
    report.latency_min_ms = latencies[0]
    report.latency_max_ms = latencies[-1]
    report.latency_p50_ms = _calculate_percentile(latencies, 50)
    report.latency_p95_ms = _calculate_percentile(latencies, 95)
    report.latency_p99_ms = _calculate_percentile(latencies, 99)

    # エンドポイント別統計
    endpoints = {r.endpoint for r in results}
    for ep in endpoints:
        ep_results = [r for r in results if r.endpoint == ep]
        ep_latencies = sorted(r.latency_ms for r in ep_results)
        ep_success = sum(1 for r in ep_results if r.success)
        report.endpoint_stats[ep] = {
            "total": len(ep_results),
            "success": ep_success,
            "error_rate": round(1 - ep_success / len(ep_results), 4) if ep_results else 0,
            "avg_ms": round(statistics.mean(ep_latencies), 2),
            "p50_ms": round(_calculate_percentile(ep_latencies, 50), 2),
            "p95_ms": round(_calculate_percentile(ep_latencies, 95), 2),
            "p99_ms": round(_calculate_percentile(ep_latencies, 99), 2),
        }

    # エラー収集
    report.errors = [
        f"{r.endpoint}: {r.error}" for r in results if r.error
    ]

    return report


async def run_load_test(config: LoadTestConfig) -> LoadTestReport:
    """負荷テストを実行する。"""
    print(f"負荷テスト開始: {config.concurrent_users}並列, {config.total_requests}リクエスト")
    print(f"対象: {config.base_url}")
    print(f"ランプアップ: {config.ramp_up_seconds}秒")
    print()

    # リクエストキューを作成
    request_queue: asyncio.Queue[tuple[str, dict[str, Any]]] = asyncio.Queue()
    for i in range(config.total_requests):
        # /v1/chat と /v1/extract-needs を交互に投入
        if i % 2 == 0:
            payload = CHAT_PAYLOADS[i % len(CHAT_PAYLOADS)]
            request_queue.put_nowait(("/v1/chat", payload))
        else:
            payload = EXTRACT_PAYLOADS[i % len(EXTRACT_PAYLOADS)]
            request_queue.put_nowait(("/v1/extract-needs", payload))

    results: list[RequestResult] = []

    # ランプアップ: ワーカーを段階的に起動
    ramp_up_interval = config.ramp_up_seconds / config.concurrent_users if config.concurrent_users > 0 else 0

    start_time = time.perf_counter()

    async with aiohttp.ClientSession() as session:
        tasks: list[asyncio.Task[None]] = []
        for worker_id in range(config.concurrent_users):
            if worker_id > 0 and ramp_up_interval > 0:
                await asyncio.sleep(ramp_up_interval)
            task = asyncio.create_task(
                worker(worker_id, session, config, request_queue, results)
            )
            tasks.append(task)

        await asyncio.gather(*tasks)

    duration = time.perf_counter() - start_time

    # レポート生成
    report = generate_report(results, config, duration)

    # コンソール出力
    _print_report(report)

    return report


def _print_report(report: LoadTestReport) -> None:
    """レポートをコンソールに出力する。"""
    print(f"\n{'='*60}")
    print("負荷テスト結果")
    print(f"{'='*60}")
    print(f"合計リクエスト: {report.total_requests}")
    print(f"成功: {report.successful_requests}")
    print(f"失敗: {report.failed_requests}")
    print(f"エラー率: {report.error_rate:.2%}")
    print(f"実行時間: {report.total_duration_seconds:.2f}秒")
    print(f"スループット: {report.throughput_rps:.2f} req/s")
    print()
    print("レイテンシ:")
    print(f"  平均: {report.latency_avg_ms:.2f}ms")
    print(f"  p50:  {report.latency_p50_ms:.2f}ms")
    print(f"  p95:  {report.latency_p95_ms:.2f}ms")
    print(f"  p99:  {report.latency_p99_ms:.2f}ms")
    print(f"  最小: {report.latency_min_ms:.2f}ms")
    print(f"  最大: {report.latency_max_ms:.2f}ms")

    if report.endpoint_stats:
        print()
        print("エンドポイント別:")
        for ep, stats in report.endpoint_stats.items():
            print(f"  {ep}:")
            print(f"    リクエスト数: {stats['total']}, 成功: {stats['success']}, エラー率: {stats['error_rate']:.2%}")
            print(f"    平均: {stats['avg_ms']:.2f}ms, p50: {stats['p50_ms']:.2f}ms, p95: {stats['p95_ms']:.2f}ms")

    if report.errors:
        print()
        print(f"エラー一覧（最大20件）:")
        for err in report.errors[:20]:
            print(f"  - {err}")


def main() -> None:
    """メインエントリポイント。"""
    parser = argparse.ArgumentParser(description="AccessRoute AI推論サーバー負荷テスト")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="対象サーバーのベースURL（デフォルト: http://localhost:8000）",
    )
    parser.add_argument(
        "--concurrent",
        type=int,
        default=10,
        help="同時接続数（デフォルト: 10）",
    )
    parser.add_argument(
        "--requests",
        type=int,
        default=100,
        help="リクエスト総数（デフォルト: 100）",
    )
    parser.add_argument(
        "--ramp-up",
        type=float,
        default=5.0,
        help="ランプアップ時間（秒、デフォルト: 5.0）",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=30.0,
        help="リクエストタイムアウト（秒、デフォルト: 30.0）",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="結果をJSON形式で出力するファイルパス",
    )

    args = parser.parse_args()

    config = LoadTestConfig(
        base_url=args.url,
        concurrent_users=args.concurrent,
        total_requests=args.requests,
        ramp_up_seconds=args.ramp_up,
        timeout_seconds=args.timeout,
    )

    report = asyncio.run(run_load_test(config))

    # JSON出力
    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(report.to_dict(), f, ensure_ascii=False, indent=2)
        print(f"\n結果をJSON出力しました: {args.output}")


if __name__ == "__main__":
    main()
