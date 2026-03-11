"""エッジケースのテスト。

空メッセージ、超長文、特殊文字・絵文字、不正JSON、
同時リクエスト時の応答整合性を検証する。
"""

import asyncio
import json
from typing import Any
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient


class MockModelBackend:
    """テスト用モックバックエンド。"""

    def __init__(self) -> None:
        self.config = MagicMock()
        self.config.model_name = "mock-model"
        self.loaded = True
        self._error: str | None = None

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """テスト応答を返す。"""
        if any("抽出" in m.get("content", "") or "分析" in m.get("content", "") for m in messages):
            return '{"needs": {"mobility_type": "wheelchair"}, "confidence": 0.5, "missing_fields": ["companions"]}'
        return "テスト応答です。"

    async def generate_async(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """非同期テスト応答を返す。"""
        return self.generate(messages, max_tokens, temperature)

    def health_check(self) -> dict[str, Any]:
        """ヘルスチェック。"""
        return {"status": "ok"}


@pytest.fixture
def mock_backend() -> MockModelBackend:
    """モックバックエンド。"""
    return MockModelBackend()


@pytest.fixture
def client(mock_backend: MockModelBackend) -> TestClient:
    """TestClient。"""
    import server

    server.backend = mock_backend  # type: ignore[assignment]
    return TestClient(server.app)


class TestEmptyMessage:
    """空メッセージのテスト。"""

    def test_empty_content(self, client: TestClient) -> None:
        """空のcontentを含むメッセージが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={"messages": [{"role": "user", "content": ""}]},
        )
        # 空メッセージでもサーバーはクラッシュしない
        assert response.status_code in (200, 422)

    def test_empty_messages_list(self, client: TestClient) -> None:
        """空のメッセージリストが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={"messages": []},
        )
        assert response.status_code in (200, 422)

    def test_whitespace_only_content(self, client: TestClient) -> None:
        """空白のみのcontentが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={"messages": [{"role": "user", "content": "   \n\t  "}]},
        )
        assert response.status_code in (200, 422)

    def test_extract_empty_content(self, client: TestClient) -> None:
        """空contentでのニーズ抽出が処理されること。"""
        response = client.post(
            "/v1/extract-needs",
            json={"messages": [{"role": "user", "content": ""}]},
        )
        assert response.status_code in (200, 422)


class TestLongMessage:
    """超長文メッセージのテスト。"""

    def test_very_long_message_10000_chars(self, client: TestClient) -> None:
        """10000文字以上のメッセージが処理されること。"""
        long_text = "車椅子で東京を観光したいです。" * 500  # 約7500文字
        long_text += "段差は避けたいです。" * 500  # さらに約5000文字
        assert len(long_text) > 10000

        response = client.post(
            "/v1/chat",
            json={"messages": [{"role": "user", "content": long_text}]},
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data

    def test_very_long_message_extract(self, client: TestClient) -> None:
        """超長文でのニーズ抽出が処理されること。"""
        long_text = "杖を使っています。" * 1000
        response = client.post(
            "/v1/extract-needs",
            json={"messages": [{"role": "user", "content": long_text}]},
        )
        assert response.status_code == 200

    def test_many_messages_in_history(self, client: TestClient) -> None:
        """大量のメッセージ履歴が処理されること。"""
        messages = []
        for i in range(100):
            if i % 2 == 0:
                messages.append({"role": "user", "content": f"質問{i}"})
            else:
                messages.append({"role": "assistant", "content": f"回答{i}"})

        response = client.post(
            "/v1/chat",
            json={"messages": messages},
        )
        assert response.status_code == 200


class TestSpecialCharacters:
    """特殊文字・絵文字を含む入力のテスト。"""

    def test_emoji_in_message(self, client: TestClient) -> None:
        """絵文字を含むメッセージが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子で観光したいです！楽しみ！"}
                ]
            },
        )
        assert response.status_code == 200

    def test_special_unicode_characters(self, client: TestClient) -> None:
        """特殊Unicode文字を含むメッセージが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "東京\u200b駅\u00a0周辺\u3000を観光\ufeffしたい"}
                ]
            },
        )
        assert response.status_code == 200

    def test_html_tags_in_message(self, client: TestClient) -> None:
        """HTMLタグを含むメッセージが処理されること（XSS防止確認）。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "<script>alert('xss')</script>車椅子です"}
                ]
            },
        )
        assert response.status_code == 200
        data = response.json()
        # レスポンスにスクリプトタグがそのまま含まれていないこと
        assert "<script>" not in data.get("reply", "")

    def test_newlines_and_tabs(self, client: TestClient) -> None:
        """改行・タブを含むメッセージが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子です\n段差は\t避けたいです\r\n"}
                ]
            },
        )
        assert response.status_code == 200

    def test_sql_injection_attempt(self, client: TestClient) -> None:
        """SQLインジェクション風の入力が安全に処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "'; DROP TABLE users; --"}
                ]
            },
        )
        assert response.status_code == 200

    def test_null_bytes(self, client: TestClient) -> None:
        """NULLバイトを含むメッセージが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子\x00です"}
                ]
            },
        )
        # NULLバイトはJSONで拒否される可能性がある
        assert response.status_code in (200, 422)


class TestInvalidJsonRequests:
    """不正なJSON形式のリクエストのテスト。"""

    def test_missing_required_field(self, client: TestClient) -> None:
        """必須フィールドが欠落している場合422を返すこと。"""
        response = client.post("/v1/chat", json={})
        assert response.status_code == 422

    def test_wrong_field_type(self, client: TestClient) -> None:
        """フィールドの型が不正な場合422を返すこと。"""
        response = client.post(
            "/v1/chat",
            json={"messages": "not_a_list"},
        )
        assert response.status_code == 422

    def test_invalid_role_value(self, client: TestClient) -> None:
        """不正なrole値の場合422を返すこと。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "hacker", "content": "test"}]
            },
        )
        assert response.status_code == 422

    def test_missing_content_field(self, client: TestClient) -> None:
        """contentフィールドが欠落している場合422を返すこと。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user"}]
            },
        )
        assert response.status_code == 422

    def test_negative_max_tokens(self, client: TestClient) -> None:
        """負のmax_tokensが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "max_tokens": -1,
            },
        )
        # 負の値はサーバーが受け入れるかバリデーションで弾くか
        assert response.status_code in (200, 422)

    def test_invalid_temperature(self, client: TestClient) -> None:
        """不正なtemperatureが処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "temperature": 100.0,
            },
        )
        assert response.status_code in (200, 422)

    def test_extra_unknown_fields_ignored(self, client: TestClient) -> None:
        """未知のフィールドが無視されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
                "unknown_field": "value",
            },
        )
        assert response.status_code == 200

    def test_extract_needs_wrong_type(self, client: TestClient) -> None:
        """ニーズ抽出でmessagesの型が不正な場合422を返すこと。"""
        response = client.post(
            "/v1/extract-needs",
            json={"messages": 123},
        )
        assert response.status_code == 422


class TestConcurrentRequests:
    """同時リクエスト時の応答整合性テスト。"""

    def test_concurrent_chat_requests(self, client: TestClient) -> None:
        """複数のチャットリクエストが同時に処理されること。"""
        import concurrent.futures

        payloads = [
            {"messages": [{"role": "user", "content": f"テスト{i}"}]}
            for i in range(5)
        ]

        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(
                    client.post, "/v1/chat", json=payload
                )
                for payload in payloads
            ]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        for result in results:
            assert result.status_code == 200
            data = result.json()
            assert "reply" in data

    def test_concurrent_mixed_endpoints(self, client: TestClient) -> None:
        """チャットとニーズ抽出が同時に処理されること。"""
        import concurrent.futures

        def chat_request() -> Any:
            return client.post(
                "/v1/chat",
                json={"messages": [{"role": "user", "content": "車椅子です"}]},
            )

        def extract_request() -> Any:
            return client.post(
                "/v1/extract-needs",
                json={"messages": [{"role": "user", "content": "杖を使っています"}]},
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            futures = []
            for i in range(3):
                futures.append(executor.submit(chat_request))
                futures.append(executor.submit(extract_request))

            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        for result in results:
            assert result.status_code == 200

    def test_concurrent_health_and_chat(self, client: TestClient) -> None:
        """ヘルスチェックとチャットが同時に処理されること。"""
        import concurrent.futures

        def health_request() -> Any:
            return client.get("/health")

        def chat_request() -> Any:
            return client.post(
                "/v1/chat",
                json={"messages": [{"role": "user", "content": "テスト"}]},
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [
                executor.submit(health_request),
                executor.submit(health_request),
                executor.submit(chat_request),
                executor.submit(chat_request),
            ]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        for result in results:
            assert result.status_code == 200
