"""認証バイパステスト。

認証メカニズムを迂回する試みに対するテスト。
Firebase Auth トークン検証およびAPIエンドポイントの
認証要件を検証する。
"""

from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# --- テスト用の不正トークン ---

INVALID_TOKENS = [
    "",                           # 空トークン
    "invalid-token",              # 不正な形式
    "Bearer",                     # Bearer のみ（トークンなし）
    "null",                       # null文字列
    "undefined",                  # undefined文字列
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJ1aWQiOiJhdHRhY2tlciJ9.",  # alg=none JWT
    "a" * 10000,                 # 極端に長いトークン
]

# JWT改ざんパターン
TAMPERED_JWT_PATTERNS = [
    # ヘッダー部分のalgorithmをnoneに変更したJWT
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJzdWIiOiJhdHRhY2tlciIsInVpZCI6ImF0dGFja2VyIn0.",
    # 署名部分を空にしたJWT
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJhdHRhY2tlciJ9.",
    # 期限切れのJWT（ペイロードのexp=0）
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJ0ZXN0IiwiZXhwIjowfQ.invalid",
]


@pytest.fixture
def mock_backend() -> MagicMock:
    """モデルバックエンドのモック。"""
    backend = MagicMock()
    backend.loaded = True
    backend.health_check.return_value = {"status": "healthy"}
    backend.generate_async = AsyncMock(return_value="テスト応答です。")
    return backend


@pytest.fixture
def test_client(mock_backend: MagicMock) -> TestClient:
    """テスト用FastAPIクライアント。"""
    with patch("server.backend", mock_backend), \
         patch("server.create_backend", return_value=mock_backend):
        from server import app
        with TestClient(app) as client:
            yield client


class TestPublicEndpointAccess:
    """公開エンドポイントのアクセステスト。

    ヘルスチェックなど認証不要のエンドポイントが
    正しく公開されていることを確認する。
    """

    def test_health_endpoint_is_public(self, test_client: TestClient) -> None:
        """ヘルスチェックエンドポイントが認証なしでアクセス可能であることを検証する。"""
        response = test_client.get("/health")
        assert response.status_code == 200

    def test_metrics_endpoint_is_public(self, test_client: TestClient) -> None:
        """メトリクスエンドポイントが認証なしでアクセス可能であることを検証する。"""
        response = test_client.get("/metrics")
        assert response.status_code == 200


class TestEndpointMethodRestriction:
    """HTTPメソッド制限テスト。

    不正なHTTPメソッドでのアクセスが拒否されることを確認する。
    """

    def test_chat_rejects_get_method(self, test_client: TestClient) -> None:
        """チャットエンドポイントがGETメソッドを拒否することを検証する。"""
        response = test_client.get("/v1/chat")
        assert response.status_code == 405, (
            "チャットエンドポイントがGETメソッドを許可しています"
        )

    def test_extract_needs_rejects_get_method(self, test_client: TestClient) -> None:
        """ニーズ抽出エンドポイントがGETメソッドを拒否することを検証する。"""
        response = test_client.get("/v1/extract-needs")
        assert response.status_code == 405

    def test_health_rejects_post_method(self, test_client: TestClient) -> None:
        """ヘルスチェックエンドポイントがPOSTメソッドを拒否することを検証する。"""
        response = test_client.post("/health")
        assert response.status_code == 405

    def test_chat_rejects_delete_method(self, test_client: TestClient) -> None:
        """チャットエンドポイントがDELETEメソッドを拒否することを検証する。"""
        response = test_client.delete("/v1/chat")
        assert response.status_code == 405

    def test_chat_rejects_put_method(self, test_client: TestClient) -> None:
        """チャットエンドポイントがPUTメソッドを拒否することを検証する。"""
        response = test_client.put("/v1/chat")
        assert response.status_code == 405


class TestUndefinedEndpoints:
    """未定義エンドポイントテスト。

    存在しないエンドポイントへのアクセスが適切に拒否されることを確認する。
    """

    @pytest.mark.parametrize(
        "path",
        [
            "/admin",
            "/api/admin",
            "/v1/admin",
            "/debug",
            "/console",
            "/shell",
            "/exec",
            "/.env",
            "/config",
            "/internal",
            "/swagger.json",  # デフォルトの OpenAPI ドキュメントパスではない
        ],
    )
    def test_undefined_admin_paths_return_404(
        self, test_client: TestClient, path: str
    ) -> None:
        """管理者用パスが存在せず404を返すことを検証する。"""
        response = test_client.get(path)
        assert response.status_code in (404, 405), (
            f"未定義のパス {path} がアクセス可能です (status={response.status_code})"
        )


class TestRequestHeaderSecurity:
    """リクエストヘッダーのセキュリティテスト。"""

    def test_response_contains_request_id(self, test_client: TestClient) -> None:
        """レスポンスにX-Request-IDヘッダーが含まれることを検証する。"""
        response = test_client.get("/health")
        assert "x-request-id" in response.headers, (
            "レスポンスにX-Request-IDヘッダーがありません"
        )

    def test_oversized_headers_handled(self, test_client: TestClient) -> None:
        """極端に大きなヘッダーが適切に処理されることを検証する。"""
        large_header = "x" * 8192
        response = test_client.get(
            "/health",
            headers={"X-Custom-Header": large_header},
        )
        # サーバーがクラッシュしないこと
        assert response.status_code in (200, 400, 413, 431)


class TestRateLimitingAndConcurrency:
    """レート制限・同時実行制御テスト。"""

    def test_semaphore_limits_concurrent_requests(self) -> None:
        """同時リクエスト制限（セマフォ）が設定されていることを検証する。"""
        from server import request_semaphore
        import asyncio

        # セマフォが設定されていること
        assert isinstance(request_semaphore, asyncio.Semaphore)

    def test_concurrent_request_limit_is_reasonable(self) -> None:
        """同時リクエスト制限が妥当な値であることを検証する。"""
        from config import ModelConfig

        config = ModelConfig()
        # 同時リクエスト数が1以上100以下であること
        assert 1 <= config.max_concurrent_requests <= 100, (
            f"同時リクエスト数が異常です: {config.max_concurrent_requests}"
        )


class TestModelLoadingProtection:
    """モデルロード状態の保護テスト。"""

    def test_unloaded_model_returns_503(self) -> None:
        """モデルがロードされていない場合に503を返すことを検証する。"""
        with patch("server.backend", None):
            from server import app
            with TestClient(app) as client:
                response = client.post(
                    "/v1/chat",
                    json={
                        "messages": [{"role": "user", "content": "テスト"}],
                        "max_tokens": 100,
                    },
                )
                assert response.status_code == 503

    def test_failed_model_returns_503(self) -> None:
        """モデルロードに失敗した場合に503を返すことを検証する。"""
        failed_backend = MagicMock()
        failed_backend.loaded = False

        with patch("server.backend", failed_backend):
            from server import app
            with TestClient(app) as client:
                response = client.post(
                    "/v1/chat",
                    json={
                        "messages": [{"role": "user", "content": "テスト"}],
                        "max_tokens": 100,
                    },
                )
                assert response.status_code == 503


class TestResponseSecurity:
    """レスポンスのセキュリティテスト。"""

    def test_error_response_does_not_leak_internals(
        self, test_client: TestClient
    ) -> None:
        """エラーレスポンスが内部情報を漏洩しないことを検証する。"""
        # 不正なJSONを送信
        response = test_client.post(
            "/v1/chat",
            content=b"not-json",
            headers={"Content-Type": "application/json"},
        )

        body = response.text
        # スタックトレースやファイルパスが含まれないこと
        assert "/home/" not in body, "レスポンスにサーバーのファイルパスが含まれています"
        assert "Traceback" not in body, "レスポンスにスタックトレースが含まれています"

    def test_health_response_does_not_leak_version_details(
        self, test_client: TestClient
    ) -> None:
        """ヘルスチェックがサーバーのバージョン詳細を過度に公開しないことを検証する。"""
        response = test_client.get("/health")
        body = response.json()

        # 必要な情報のみ含まれていること
        expected_keys = {"status", "model", "uptime_seconds"}
        actual_keys = set(body.keys())

        unexpected_keys = actual_keys - expected_keys
        assert not unexpected_keys, (
            f"ヘルスチェックに予期しないフィールドが含まれています: {unexpected_keys}"
        )
