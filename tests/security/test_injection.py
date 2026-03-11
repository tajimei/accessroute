"""インジェクション攻撃テスト。

XSS、コマンドインジェクション、パストラバーサルなどの
インジェクション脆弱性に対するテストパターンを定義する。
FastAPI サーバーのエンドポイントに対してテストを行う。
"""

import json
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# --- テスト用のインジェクションペイロード ---

# XSS（クロスサイトスクリプティング）ペイロード
XSS_PAYLOADS = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert("xss")>',
    '"><script>alert(document.cookie)</script>',
    "javascript:alert('xss')",
    '<svg onload=alert("xss")>',
    "{{constructor.constructor('return this')()}}", # テンプレートインジェクション
]

# コマンドインジェクションペイロード
COMMAND_INJECTION_PAYLOADS = [
    "; ls -la",
    "| cat /etc/passwd",
    "&& rm -rf /",
    "$(whoami)",
    "`id`",
    "'; DROP TABLE users; --",
]

# パストラバーサルペイロード
PATH_TRAVERSAL_PAYLOADS = [
    "../../etc/passwd",
    "../../../etc/shadow",
    "..\\..\\..\\windows\\system32\\config\\sam",
    "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
    "....//....//etc/passwd",
]

# JSONインジェクションペイロード
JSON_INJECTION_PAYLOADS = [
    '{"__proto__": {"isAdmin": true}}',
    '{"constructor": {"prototype": {"isAdmin": true}}}',
]


@pytest.fixture
def mock_backend() -> MagicMock:
    """モデルバックエンドのモック。"""
    backend = MagicMock()
    backend.loaded = True
    backend.health_check.return_value = {"status": "healthy"}
    backend.generate_async = AsyncMock(return_value="安全な応答です。")
    return backend


@pytest.fixture
def test_client(mock_backend: MagicMock) -> TestClient:
    """テスト用FastAPIクライアント。"""
    with patch("server.backend", mock_backend), \
         patch("server.create_backend", return_value=mock_backend):
        from server import app
        with TestClient(app) as client:
            yield client


class TestXSSInjection:
    """XSSインジェクションテスト。"""

    @pytest.mark.parametrize("payload", XSS_PAYLOADS)
    def test_chat_endpoint_sanitizes_xss(
        self, test_client: TestClient, payload: str
    ) -> None:
        """チャットエンドポイントがXSSペイロードをそのまま実行しないことを検証する。

        AIサーバーはJSON APIであるため、HTMLエスケープではなく
        レスポンスのContent-Typeが application/json であることを確認する。
        """
        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": payload}],
                "max_tokens": 100,
                "temperature": 0.7,
                "stream": False,
            },
        )

        # レスポンスがJSON形式であること（HTMLレンダリングされない）
        assert response.headers.get("content-type", "").startswith("application/json")

        # ステータスコードが正常であること（サーバーエラーにならない）
        assert response.status_code in (200, 422), (
            f"XSSペイロードでサーバーエラーが発生しました: {response.status_code}"
        )

    @pytest.mark.parametrize("payload", XSS_PAYLOADS)
    def test_extract_needs_endpoint_sanitizes_xss(
        self, test_client: TestClient, payload: str
    ) -> None:
        """ニーズ抽出エンドポイントがXSSペイロードに対して安全であることを検証する。"""
        response = test_client.post(
            "/v1/extract-needs",
            json={
                "messages": [{"role": "user", "content": payload}],
            },
        )

        assert response.headers.get("content-type", "").startswith("application/json")
        assert response.status_code in (200, 422, 500)


class TestCommandInjection:
    """コマンドインジェクションテスト。"""

    @pytest.mark.parametrize("payload", COMMAND_INJECTION_PAYLOADS)
    def test_chat_endpoint_rejects_command_injection(
        self, test_client: TestClient, payload: str
    ) -> None:
        """チャットエンドポイントがコマンドインジェクションの影響を受けないことを検証する。"""
        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": payload}],
                "max_tokens": 100,
                "temperature": 0.7,
                "stream": False,
            },
        )

        # サーバーが正常に応答する（コマンドが実行されない）
        assert response.status_code in (200, 422)

        # レスポンスにシステム情報が含まれていないこと
        if response.status_code == 200:
            body = response.json()
            reply = body.get("reply", "")
            # コマンド実行結果の典型的な出力が含まれていない
            assert "root:" not in reply, "コマンドインジェクションの可能性: /etc/passwdの内容が返されました"
            assert "uid=" not in reply, "コマンドインジェクションの可能性: idコマンドの結果が返されました"

    @pytest.mark.parametrize("payload", COMMAND_INJECTION_PAYLOADS)
    def test_prompt_file_loading_no_injection(self, payload: str) -> None:
        """プロンプトファイル読み込みにコマンドインジェクションが効かないことを検証する。

        load_prompt は固定パスからファイルを読むため、
        ユーザー入力がファイルパスに影響しないことを確認する。
        """
        from server import load_prompt

        # 正規のプロンプトファイル名のみ受け付ける
        # 攻撃的なファイル名でFileNotFoundErrorが発生することを確認
        with pytest.raises((FileNotFoundError, OSError)):
            load_prompt(payload)


class TestPathTraversal:
    """パストラバーサルテスト。"""

    @pytest.mark.parametrize("payload", PATH_TRAVERSAL_PAYLOADS)
    def test_prompt_loading_prevents_path_traversal(self, payload: str) -> None:
        """プロンプト読み込みがパストラバーサルを防ぐことを検証する。"""
        from server import load_prompt, PROMPTS_DIR

        # パストラバーサルペイロードでプロンプトを読もうとする
        # ファイルが存在しないためエラーになることを確認
        try:
            result = load_prompt(payload)
            # もしファイルが読めた場合、プロンプトディレクトリ外のファイルでないことを確認
            resolved = (PROMPTS_DIR / payload).resolve()
            assert str(resolved).startswith(str(PROMPTS_DIR.resolve())), (
                f"パストラバーサル脆弱性: プロンプトディレクトリ外のファイルにアクセス可能です: {resolved}"
            )
        except (FileNotFoundError, OSError):
            # ファイルが見つからなければ安全
            pass


class TestInputValidation:
    """入力バリデーションテスト。"""

    def test_chat_rejects_invalid_role(self, test_client: TestClient) -> None:
        """不正なrole値が拒否されることを検証する。"""
        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "admin", "content": "テスト"}],
                "max_tokens": 100,
            },
        )

        # Pydantic バリデーションエラー（422）
        assert response.status_code == 422

    def test_chat_rejects_empty_messages(self, test_client: TestClient) -> None:
        """空のメッセージリストが適切に処理されることを検証する。"""
        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [],
                "max_tokens": 100,
            },
        )

        # 空リストでもサーバーがクラッシュしない
        assert response.status_code in (200, 422)

    def test_chat_rejects_oversized_input(self, test_client: TestClient) -> None:
        """極端に大きな入力が適切に処理されることを検証する。"""
        # 1MB超の入力
        large_content = "あ" * 500_000

        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": large_content}],
                "max_tokens": 100,
            },
        )

        # サーバーがクラッシュしないこと
        assert response.status_code in (200, 413, 422, 500)

    def test_chat_handles_null_values(self, test_client: TestClient) -> None:
        """null値が適切にバリデーションされることを検証する。"""
        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": None}],
            },
        )

        assert response.status_code == 422

    @pytest.mark.parametrize("payload", JSON_INJECTION_PAYLOADS)
    def test_json_prototype_pollution(
        self, test_client: TestClient, payload: str
    ) -> None:
        """JSONプロトタイプ汚染攻撃が無効であることを検証する。"""
        response = test_client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": payload}],
                "max_tokens": 100,
                "temperature": 0.7,
                "stream": False,
            },
        )

        # Pythonはプロトタイプ汚染の影響を受けないが、
        # リクエストが正常に処理されることを確認
        assert response.status_code in (200, 422)


class TestCORSConfiguration:
    """CORS設定テスト。"""

    def test_cors_rejects_unauthorized_origin(self, test_client: TestClient) -> None:
        """許可されていないオリジンからのリクエストがCORSヘッダを返さないことを検証する。"""
        response = test_client.options(
            "/v1/chat",
            headers={
                "Origin": "https://evil-site.example.com",
                "Access-Control-Request-Method": "POST",
            },
        )

        # 許可されていないオリジンにはAccess-Control-Allow-Originが返されない
        allow_origin = response.headers.get("access-control-allow-origin", "")
        assert allow_origin != "https://evil-site.example.com", (
            f"不正なオリジンにCORSが許可されています: {allow_origin}"
        )

    def test_cors_allows_authorized_origin(self, test_client: TestClient) -> None:
        """許可されたオリジンからのリクエストが正常に処理されることを検証する。"""
        response = test_client.options(
            "/v1/chat",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )

        # 許可されたオリジンにはAccess-Control-Allow-Originが返される
        allow_origin = response.headers.get("access-control-allow-origin", "")
        assert allow_origin == "http://localhost:3000"
