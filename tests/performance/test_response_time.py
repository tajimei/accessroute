"""APIレスポンスタイム検証テスト。

各エンドポイントのレスポンスタイムが品質基準を満たしていることを検証する。
モックバックエンドを使用して、サーバー処理のオーバーヘッドを計測する。
"""

import asyncio
import statistics
import time
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# --- パフォーマンス基準値（ミリ秒） ---

# ヘルスチェック: 50ms以内
HEALTH_CHECK_THRESHOLD_MS = 50.0

# チャットエンドポイント（モデル推論除く）: 100ms以内
CHAT_OVERHEAD_THRESHOLD_MS = 100.0

# ニーズ抽出エンドポイント（モデル推論除く）: 100ms以内
EXTRACT_NEEDS_OVERHEAD_THRESHOLD_MS = 100.0

# メトリクスエンドポイント: 50ms以内
METRICS_THRESHOLD_MS = 50.0

# 計測の繰り返し回数
MEASUREMENT_ITERATIONS = 10


@pytest.fixture
def mock_backend() -> MagicMock:
    """即座に応答するモデルバックエンドのモック。

    モデル推論時間を除いたサーバーオーバーヘッドのみを計測するため、
    遅延なしで応答するモックを使用する。
    """
    backend = MagicMock()
    backend.loaded = True
    backend.health_check.return_value = {"status": "healthy"}

    # 推論は即座に結果を返す（サーバーオーバーヘッドのみ計測）
    backend.generate_async = AsyncMock(
        return_value='{"needs": {"mobility_type": "wheelchair"}, "confidence": 0.8, "missing_fields": []}'
    )
    return backend


@pytest.fixture
def test_client(mock_backend: MagicMock) -> TestClient:
    """テスト用FastAPIクライアント。"""
    with patch("server.backend", mock_backend), \
         patch("server.create_backend", return_value=mock_backend):
        from server import app
        with TestClient(app) as client:
            yield client


def _measure_response_time_ms(func: Any, iterations: int = MEASUREMENT_ITERATIONS) -> dict[str, float]:
    """レスポンスタイムを複数回計測し、統計情報を返す。

    Returns:
        mean, median, p95, p99, min, max の統計値（ミリ秒）
    """
    times: list[float] = []

    for _ in range(iterations):
        start = time.perf_counter()
        func()
        elapsed_ms = (time.perf_counter() - start) * 1000
        times.append(elapsed_ms)

    times.sort()
    p95_index = int(len(times) * 0.95)
    p99_index = int(len(times) * 0.99)

    return {
        "mean": statistics.mean(times),
        "median": statistics.median(times),
        "p95": times[min(p95_index, len(times) - 1)],
        "p99": times[min(p99_index, len(times) - 1)],
        "min": min(times),
        "max": max(times),
    }


class TestHealthCheckPerformance:
    """ヘルスチェックエンドポイントのパフォーマンステスト。"""

    def test_health_response_time(self, test_client: TestClient) -> None:
        """ヘルスチェックが基準時間内に応答することを検証する。"""
        stats = _measure_response_time_ms(
            lambda: test_client.get("/health")
        )

        assert stats["p95"] < HEALTH_CHECK_THRESHOLD_MS, (
            f"ヘルスチェックのP95レスポンスタイムが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {HEALTH_CHECK_THRESHOLD_MS}ms)\n"
            f"統計: mean={stats['mean']:.1f}ms, median={stats['median']:.1f}ms, "
            f"p99={stats['p99']:.1f}ms, max={stats['max']:.1f}ms"
        )

    def test_health_returns_correct_structure(self, test_client: TestClient) -> None:
        """ヘルスチェックが正しい構造のレスポンスを返すことを検証する。"""
        response = test_client.get("/health")
        assert response.status_code == 200

        body = response.json()
        assert "status" in body
        assert "model" in body
        assert "uptime_seconds" in body


class TestChatEndpointPerformance:
    """チャットエンドポイントのパフォーマンステスト。"""

    def test_chat_overhead_response_time(self, test_client: TestClient) -> None:
        """チャットエンドポイントのサーバーオーバーヘッドが基準時間内であることを検証する。"""
        chat_request = {
            "messages": [{"role": "user", "content": "東京駅周辺のバリアフリースポットを教えてください"}],
            "max_tokens": 256,
            "temperature": 0.7,
            "stream": False,
        }

        stats = _measure_response_time_ms(
            lambda: test_client.post("/v1/chat", json=chat_request)
        )

        assert stats["p95"] < CHAT_OVERHEAD_THRESHOLD_MS, (
            f"チャットエンドポイントのP95オーバーヘッドが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {CHAT_OVERHEAD_THRESHOLD_MS}ms)\n"
            f"統計: mean={stats['mean']:.1f}ms, median={stats['median']:.1f}ms"
        )

    def test_chat_with_profile_overhead(self, test_client: TestClient) -> None:
        """ユーザープロファイル付きチャットのオーバーヘッドが許容範囲内であることを検証する。"""
        chat_request = {
            "messages": [{"role": "user", "content": "近くのレストランを教えてください"}],
            "user_profile": {
                "mobilityType": "wheelchair",
                "companions": ["elderly", "child"],
                "maxDistanceMeters": 500,
                "avoidConditions": ["stairs", "slope"],
                "preferConditions": ["restroom", "elevator"],
            },
            "max_tokens": 256,
            "temperature": 0.7,
            "stream": False,
        }

        stats = _measure_response_time_ms(
            lambda: test_client.post("/v1/chat", json=chat_request)
        )

        assert stats["p95"] < CHAT_OVERHEAD_THRESHOLD_MS, (
            f"プロファイル付きチャットのP95オーバーヘッドが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {CHAT_OVERHEAD_THRESHOLD_MS}ms)"
        )

    def test_chat_with_long_history_overhead(self, test_client: TestClient) -> None:
        """長い会話履歴付きチャットのオーバーヘッドが許容範囲内であることを検証する。"""
        # 20ターンの会話履歴を生成
        messages: list[dict[str, str]] = []
        for i in range(20):
            messages.append({"role": "user", "content": f"ユーザーメッセージ {i}"})
            messages.append({"role": "assistant", "content": f"アシスタント応答 {i}"})
        messages.append({"role": "user", "content": "最後の質問です"})

        chat_request = {
            "messages": messages,
            "max_tokens": 256,
            "temperature": 0.7,
            "stream": False,
        }

        # 長い会話履歴でもオーバーヘッドの増加が許容範囲内
        stats = _measure_response_time_ms(
            lambda: test_client.post("/v1/chat", json=chat_request),
            iterations=5,
        )

        # 長い履歴の場合は基準を2倍に緩和
        threshold = CHAT_OVERHEAD_THRESHOLD_MS * 2
        assert stats["p95"] < threshold, (
            f"長い会話履歴でのP95オーバーヘッドが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {threshold}ms)"
        )


class TestExtractNeedsPerformance:
    """ニーズ抽出エンドポイントのパフォーマンステスト。"""

    def test_extract_needs_overhead_response_time(
        self, test_client: TestClient
    ) -> None:
        """ニーズ抽出エンドポイントのサーバーオーバーヘッドが基準時間内であることを検証する。"""
        extract_request = {
            "messages": [
                {"role": "user", "content": "車椅子で東京駅周辺を観光したいです"},
                {"role": "assistant", "content": "車椅子でのご利用ですね。"},
                {"role": "user", "content": "段差は避けたいです。500mくらいが限界です。"},
            ],
        }

        stats = _measure_response_time_ms(
            lambda: test_client.post("/v1/extract-needs", json=extract_request)
        )

        assert stats["p95"] < EXTRACT_NEEDS_OVERHEAD_THRESHOLD_MS, (
            f"ニーズ抽出のP95オーバーヘッドが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {EXTRACT_NEEDS_OVERHEAD_THRESHOLD_MS}ms)"
        )


class TestMetricsPerformance:
    """メトリクスエンドポイントのパフォーマンステスト。"""

    def test_metrics_response_time(self, test_client: TestClient) -> None:
        """メトリクスエンドポイントが基準時間内に応答することを検証する。"""
        stats = _measure_response_time_ms(
            lambda: test_client.get("/metrics")
        )

        assert stats["p95"] < METRICS_THRESHOLD_MS, (
            f"メトリクスのP95レスポンスタイムが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {METRICS_THRESHOLD_MS}ms)"
        )


class TestValidationPerformance:
    """バリデーションのパフォーマンステスト。"""

    def test_invalid_request_rejection_speed(self, test_client: TestClient) -> None:
        """不正なリクエストが高速に拒否されることを検証する。"""
        invalid_request = {
            "messages": [{"role": "invalid_role", "content": "テスト"}],
        }

        stats = _measure_response_time_ms(
            lambda: test_client.post("/v1/chat", json=invalid_request)
        )

        # バリデーションエラーはモデル推論より速く返るべき
        assert stats["p95"] < HEALTH_CHECK_THRESHOLD_MS, (
            f"バリデーションエラーのP95レスポンスタイムが基準超過: "
            f"{stats['p95']:.1f}ms (基準: {HEALTH_CHECK_THRESHOLD_MS}ms)"
        )


class TestPerformanceReport:
    """パフォーマンスレポート生成テスト。"""

    def test_generate_performance_summary(self, test_client: TestClient) -> None:
        """全エンドポイントのパフォーマンスサマリーを生成する。

        テスト結果としてパフォーマンスレポートを出力する。
        """
        results: dict[str, dict[str, float]] = {}

        # ヘルスチェック
        results["GET /health"] = _measure_response_time_ms(
            lambda: test_client.get("/health")
        )

        # メトリクス
        results["GET /metrics"] = _measure_response_time_ms(
            lambda: test_client.get("/metrics")
        )

        # チャット
        results["POST /v1/chat"] = _measure_response_time_ms(
            lambda: test_client.post(
                "/v1/chat",
                json={
                    "messages": [{"role": "user", "content": "テスト"}],
                    "max_tokens": 100,
                    "stream": False,
                },
            )
        )

        # ニーズ抽出
        results["POST /v1/extract-needs"] = _measure_response_time_ms(
            lambda: test_client.post(
                "/v1/extract-needs",
                json={
                    "messages": [{"role": "user", "content": "車椅子で移動したい"}],
                },
            )
        )

        # レポート出力
        report_lines = ["\n===== パフォーマンスレポート =====\n"]
        for endpoint, stats in results.items():
            report_lines.append(f"  {endpoint}:")
            report_lines.append(f"    平均: {stats['mean']:.1f}ms")
            report_lines.append(f"    中央値: {stats['median']:.1f}ms")
            report_lines.append(f"    P95: {stats['p95']:.1f}ms")
            report_lines.append(f"    P99: {stats['p99']:.1f}ms")
            report_lines.append(f"    最小: {stats['min']:.1f}ms")
            report_lines.append(f"    最大: {stats['max']:.1f}ms")
            report_lines.append("")

        report = "\n".join(report_lines)
        print(report)

        # 全エンドポイントが計測されたことを確認
        assert len(results) == 4
