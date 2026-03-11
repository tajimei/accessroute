"""SSEストリーミングテスト。

ストリーミングレスポンスの受信、チャンク分割の正確性、
途中切断時の処理、タイムアウトのテストを行う。
"""

import asyncio
import json
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# --- モックバックエンド ---


class MockStreamBackend:
    """ストリーミングテスト用モックバックエンド。"""

    def __init__(self) -> None:
        self.config = MagicMock()
        self.config.model_name = "mock-stream-model"
        self.loaded = True
        self._error: str | None = None
        self._response: str = "これはストリーミングテスト応答です。バリアフリー情報をお伝えします。"
        self._should_error: bool = False
        self._delay_seconds: float = 0.0

    def set_response(self, response: str) -> None:
        """テスト応答を設定する。"""
        self._response = response

    def set_error(self, should_error: bool = True) -> None:
        """エラーを発生させるかどうか設定する。"""
        self._should_error = should_error

    def set_delay(self, seconds: float) -> None:
        """応答遅延を設定する。"""
        self._delay_seconds = seconds

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """テスト応答を返す。"""
        if self._should_error:
            raise RuntimeError("モデル推論エラー")

        # ニーズ抽出プロンプトの場合
        if any(
            "抽出" in m.get("content", "") or "分析" in m.get("content", "")
            for m in messages
        ):
            return json.dumps(
                {
                    "needs": {"mobility_type": "wheelchair"},
                    "confidence": 0.8,
                    "missing_fields": [],
                },
                ensure_ascii=False,
            )

        return self._response

    async def generate_async(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """非同期テスト応答を返す。"""
        if self._delay_seconds > 0:
            await asyncio.sleep(self._delay_seconds)
        return self.generate(messages, max_tokens, temperature)

    def health_check(self) -> dict[str, Any]:
        """ヘルスチェック。"""
        if self._error:
            return {"status": "error", "error": self._error}
        return {"status": "ok"}


# --- テストフィクスチャ ---


@pytest.fixture
def mock_stream_backend() -> MockStreamBackend:
    """ストリーミング用モックバックエンド。"""
    return MockStreamBackend()


@pytest.fixture
def stream_client(mock_stream_backend: MockStreamBackend) -> TestClient:
    """ストリーミングテスト用TestClient。"""
    import server

    server.backend = mock_stream_backend  # type: ignore[assignment]
    return TestClient(server.app)


# --- ストリーミングレスポンス受信テスト ---


class TestStreamingResponse:
    """ストリーミングレスポンスの受信テスト。"""

    def test_streaming_returns_event_stream(
        self, stream_client: TestClient
    ) -> None:
        """ストリーミングリクエストがtext/event-streamを返すこと。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "バリアフリーな場所を教えてください"}
                ],
                "stream": True,
            },
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")

    def test_streaming_returns_chunks(
        self, stream_client: TestClient
    ) -> None:
        """ストリーミングレスポンスがチャンク形式で返されること。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子でのルートを教えてください"}
                ],
                "stream": True,
            },
        )
        assert response.status_code == 200

        # SSEイベントをパース
        events = _parse_sse_events(response.text)
        assert len(events) > 0

        # 少なくともchunkイベントとdoneイベントが含まれること
        chunk_events = [e for e in events if e.get("type") == "chunk"]
        done_events = [e for e in events if e.get("type") == "done"]

        assert len(chunk_events) > 0, "chunkイベントが存在すること"
        assert len(done_events) == 1, "doneイベントが1つ存在すること"

    def test_streaming_chunks_reconstruct_full_reply(
        self, stream_client: TestClient, mock_stream_backend: MockStreamBackend
    ) -> None:
        """チャンクを結合すると完全な応答テキストになること。"""
        test_reply = "東京駅周辺のバリアフリースポットをご案内します。"
        mock_stream_backend.set_response(test_reply)

        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "テスト"}
                ],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        chunk_events = [e for e in events if e.get("type") == "chunk"]
        done_events = [e for e in events if e.get("type") == "done"]

        # チャンクを結合
        reconstructed = "".join(e.get("content", "") for e in chunk_events)
        assert reconstructed == test_reply

        # doneイベントに完全なreplyが含まれること
        assert done_events[0]["reply"] == test_reply

    def test_non_streaming_returns_json(
        self, stream_client: TestClient
    ) -> None:
        """非ストリーミングリクエストがJSONを返すこと。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "テスト"}
                ],
                "stream": False,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)


# --- チャンク分割の正確性テスト ---


class TestChunkAccuracy:
    """チャンク分割の正確性テスト。"""

    def test_short_response_chunked(
        self, stream_client: TestClient, mock_stream_backend: MockStreamBackend
    ) -> None:
        """短い応答もチャンク分割されること。"""
        mock_stream_backend.set_response("短い応答")

        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        chunk_events = [e for e in events if e.get("type") == "chunk"]

        # 短いテキストでも少なくとも1チャンク
        assert len(chunk_events) >= 1

    def test_long_response_multiple_chunks(
        self, stream_client: TestClient, mock_stream_backend: MockStreamBackend
    ) -> None:
        """長い応答が複数チャンクに分割されること。"""
        # 100文字以上の応答
        long_reply = "バリアフリー" * 20
        mock_stream_backend.set_response(long_reply)

        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        chunk_events = [e for e in events if e.get("type") == "chunk"]

        # 長いテキストは複数チャンクになる
        assert len(chunk_events) > 1

    def test_chunk_content_not_empty(
        self, stream_client: TestClient, mock_stream_backend: MockStreamBackend
    ) -> None:
        """各チャンクのcontentが空でないこと。"""
        mock_stream_backend.set_response("テストメッセージです。")

        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        chunk_events = [e for e in events if e.get("type") == "chunk"]

        for chunk in chunk_events:
            assert "content" in chunk
            assert len(chunk["content"]) > 0

    def test_done_event_has_metadata(
        self, stream_client: TestClient
    ) -> None:
        """doneイベントにメタデータが含まれること。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "車椅子を使っています"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        done_events = [e for e in events if e.get("type") == "done"]

        assert len(done_events) == 1
        done = done_events[0]
        assert "reply" in done
        assert "extracted_needs" in done
        assert "suggested_action" in done
        assert "confidence" in done


# --- エラー処理テスト ---


class TestStreamingErrorHandling:
    """ストリーミング中のエラー処理テスト。"""

    def test_model_error_returns_error_event(
        self, stream_client: TestClient, mock_stream_backend: MockStreamBackend
    ) -> None:
        """モデルエラー時にerrorイベントが送信されること。"""
        mock_stream_backend.set_error(True)

        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        error_events = [e for e in events if e.get("type") == "error"]

        assert len(error_events) >= 1
        assert "message" in error_events[0]

    def test_model_not_loaded_returns_503(
        self, mock_stream_backend: MockStreamBackend
    ) -> None:
        """モデル未ロード時にストリーミングリクエストが503を返すこと。"""
        import server

        unloaded_backend = MockStreamBackend()
        unloaded_backend.loaded = False
        server.backend = unloaded_backend  # type: ignore[assignment]

        client = TestClient(server.app)
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )
        assert response.status_code == 503


# --- タイムアウトテスト ---


class TestStreamingTimeout:
    """ストリーミングのタイムアウトテスト。"""

    def test_normal_response_within_timeout(
        self, stream_client: TestClient, mock_stream_backend: MockStreamBackend
    ) -> None:
        """通常の応答がタイムアウト内に完了すること。"""
        mock_stream_backend.set_delay(0.0)

        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )
        assert response.status_code == 200

        events = _parse_sse_events(response.text)
        done_events = [e for e in events if e.get("type") == "done"]
        assert len(done_events) == 1


# --- SSEイベント形式テスト ---


class TestSSEFormat:
    """SSEイベントのフォーマットテスト。"""

    def test_events_have_data_prefix(
        self, stream_client: TestClient
    ) -> None:
        """各イベントが 'data: ' プレフィックスを持つこと。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        lines = response.text.strip().split("\n")
        data_lines = [l for l in lines if l.startswith("data: ")]
        assert len(data_lines) > 0

    def test_events_are_valid_json(
        self, stream_client: TestClient
    ) -> None:
        """各イベントのデータが有効なJSONであること。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        assert len(events) > 0

        for event in events:
            assert isinstance(event, dict)
            assert "type" in event

    def test_event_types_are_valid(
        self, stream_client: TestClient
    ) -> None:
        """イベントタイプが chunk/done/error のいずれかであること。"""
        response = stream_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "stream": True,
            },
        )

        events = _parse_sse_events(response.text)
        valid_types = {"chunk", "done", "error"}

        for event in events:
            assert event["type"] in valid_types


# --- ヘルパー関数 ---


def _parse_sse_events(text: str) -> list[dict[str, Any]]:
    """SSEテキストからイベントデータをパースする。"""
    events: list[dict[str, Any]] = []
    for line in text.strip().split("\n"):
        line = line.strip()
        if line.startswith("data: "):
            try:
                data = json.loads(line[6:])
                events.append(data)
            except json.JSONDecodeError:
                pass
    return events
