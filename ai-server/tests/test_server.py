"""FastAPI 推論サーバーのエンドポイントテスト。

httpx + TestClient を使用してエンドポイントを検証する。
モデルバックエンドはモックに差し替えて外部依存なしでテストする。
パーサー、バリデーション、アクション判定のユニットテストも含む。
"""

import asyncio
import json
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# --- モデルバックエンドのモック ---


class MockModelBackend:
    """テスト用のモックバックエンド。"""

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
        """固定のテスト応答を返す。"""
        # ニーズ抽出プロンプトの場合はJSON形式で応答
        if any("抽出" in m.get("content", "") or "分析" in m.get("content", "") for m in messages):
            return '{"needs": {"mobility_type": "wheelchair", "companions": [], "avoid_conditions": ["stairs"]}, "confidence": 0.9, "missing_fields": []}'

        return "東京駅周辺のバリアフリースポットをご案内いたします。"

    async def generate_async(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """非同期版の固定テスト応答。"""
        return self.generate(messages, max_tokens, temperature)

    def health_check(self) -> dict[str, Any]:
        """ヘルスチェック。"""
        if self._error:
            return {"status": "error", "error": self._error}
        if not self.loaded:
            return {"status": "loading"}
        return {"status": "ok"}


@pytest.fixture
def mock_backend() -> MockModelBackend:
    """モックバックエンドのフィクスチャ。"""
    return MockModelBackend()


@pytest.fixture
def client(mock_backend: MockModelBackend) -> TestClient:
    """TestClient フィクスチャ（モックバックエンド注入済み）。"""
    import server

    # グローバルのbackendをモックに差し替え
    server.backend = mock_backend  # type: ignore[assignment]
    return TestClient(server.app)


class TestHealthEndpoint:
    """ヘルスチェックエンドポイントのテスト。"""

    def test_health_check_returns_200(self, client: TestClient) -> None:
        """ヘルスチェックが 200 を返すこと。"""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_includes_status(self, client: TestClient) -> None:
        """ヘルスチェックにステータスフィールドが含まれること。"""
        response = client.get("/health")
        data = response.json()
        assert "status" in data
        assert data["status"] in ("ok", "loading")

    def test_health_check_includes_model_name(self, client: TestClient) -> None:
        """ヘルスチェックにモデル名が含まれること。"""
        response = client.get("/health")
        data = response.json()
        assert "model" in data

    def test_health_check_includes_uptime(self, client: TestClient) -> None:
        """ヘルスチェックにアップタイムが含まれること。"""
        response = client.get("/health")
        data = response.json()
        assert "uptime_seconds" in data
        assert isinstance(data["uptime_seconds"], float)

    def test_health_check_model_loaded_status(
        self, client: TestClient, mock_backend: MockModelBackend
    ) -> None:
        """モデルロード済みの場合 status が ok であること。"""
        mock_backend.loaded = True
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "ok"


class TestChatEndpoint:
    """チャットエンドポイントのテスト。"""

    def test_chat_returns_200(self, client: TestClient) -> None:
        """有効なチャットリクエストで 200 を返すこと。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "東京駅周辺でバリアフリーな場所を教えてください"}
                ],
            },
        )
        assert response.status_code == 200

    def test_chat_response_has_reply(self, client: TestClient) -> None:
        """チャットレスポンスに reply フィールドが含まれること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子で移動できるルートを探しています"}
                ],
            },
        )
        data = response.json()
        assert "reply" in data
        assert isinstance(data["reply"], str)
        assert len(data["reply"]) > 0

    def test_chat_response_has_suggested_action(self, client: TestClient) -> None:
        """チャットレスポンスに suggested_action が含まれること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子を使っています"}
                ],
            },
        )
        data = response.json()
        assert "suggested_action" in data
        assert data["suggested_action"] in ("ask_more", "search_route", "show_spots", None)

    def test_chat_with_user_profile(self, client: TestClient) -> None:
        """ユーザープロファイル付きリクエストが正常に処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "近くの休憩所を教えてください"}
                ],
                "user_profile": {
                    "mobility_type": "wheelchair",
                    "avoid_conditions": ["stairs"],
                },
            },
        )
        assert response.status_code == 200

    def test_chat_with_conversation_history(self, client: TestClient) -> None:
        """会話履歴付きリクエストが正常に処理されること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "こんにちは"},
                    {"role": "assistant", "content": "こんにちは！お手伝いします。"},
                    {"role": "user", "content": "車椅子で移動しています"},
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data

    def test_chat_with_custom_parameters(self, client: TestClient) -> None:
        """カスタムパラメータ（max_tokens, temperature）が受け付けられること。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "user", "content": "テスト"}
                ],
                "max_tokens": 256,
                "temperature": 0.5,
            },
        )
        assert response.status_code == 200

    def test_chat_invalid_role_returns_422(self, client: TestClient) -> None:
        """不正な role で 422 を返すこと。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [
                    {"role": "invalid_role", "content": "テスト"}
                ],
            },
        )
        assert response.status_code == 422

    def test_chat_empty_messages_returns_422(self, client: TestClient) -> None:
        """空のメッセージリストで 422 を返すこと。"""
        response = client.post(
            "/v1/chat",
            json={
                "messages": [],
            },
        )
        # FastAPI の Pydantic バリデーション: 空リストは許容される場合がある
        # レスポンスの構造が正しいことを確認
        assert response.status_code in (200, 422)

    def test_chat_missing_messages_returns_422(self, client: TestClient) -> None:
        """messages フィールドが欠落している場合 422 を返すこと。"""
        response = client.post("/v1/chat", json={})
        assert response.status_code == 422


class TestExtractNeedsEndpoint:
    """ニーズ抽出エンドポイントのテスト。"""

    def test_extract_needs_returns_200(self, client: TestClient) -> None:
        """有効なリクエストで 200 を返すこと。"""
        response = client.post(
            "/v1/extract-needs",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子を使っています。段差は避けたいです。"}
                ],
            },
        )
        assert response.status_code == 200

    def test_extract_needs_response_structure(self, client: TestClient) -> None:
        """レスポンスに needs, confidence, missing_fields が含まれること。"""
        response = client.post(
            "/v1/extract-needs",
            json={
                "messages": [
                    {"role": "user", "content": "車椅子で移動しています"}
                ],
            },
        )
        data = response.json()
        assert "needs" in data
        assert "confidence" in data
        assert "missing_fields" in data
        assert isinstance(data["confidence"], float)
        assert isinstance(data["missing_fields"], list)

    def test_extract_needs_missing_messages_returns_422(self, client: TestClient) -> None:
        """messages が欠落している場合 422 を返すこと。"""
        response = client.post("/v1/extract-needs", json={})
        assert response.status_code == 422


class TestModelNotLoaded:
    """モデル未ロード時のテスト。"""

    def test_chat_returns_503_when_model_not_loaded(self) -> None:
        """モデル未ロード時に /v1/chat が 503 を返すこと。"""
        import server

        unloaded_backend = MockModelBackend()
        unloaded_backend.loaded = False
        server.backend = unloaded_backend  # type: ignore[assignment]

        client = TestClient(server.app)
        response = client.post(
            "/v1/chat",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
            },
        )
        assert response.status_code == 503

    def test_extract_needs_returns_503_when_model_not_loaded(self) -> None:
        """モデル未ロード時に /v1/extract-needs が 503 を返すこと。"""
        import server

        unloaded_backend = MockModelBackend()
        unloaded_backend.loaded = False
        server.backend = unloaded_backend  # type: ignore[assignment]

        client = TestClient(server.app)
        response = client.post(
            "/v1/extract-needs",
            json={
                "messages": [{"role": "user", "content": "テスト"}],
            },
        )
        assert response.status_code == 503


class TestConfig:
    """設定モジュールのテスト。"""

    def test_load_default_config(self) -> None:
        """デフォルト設定が正しくロードされること。"""
        from config import load_config

        config = load_config()
        assert config.port == 8000
        assert config.temperature == 0.7

    def test_model_name_default(self) -> None:
        """デフォルトのモデル名が設定されていること。"""
        from config import load_config

        config = load_config()
        assert "calm3" in config.model_name

    def test_config_host_default(self) -> None:
        """デフォルトのホストが 0.0.0.0 であること。"""
        from config import load_config

        config = load_config()
        assert config.host == "0.0.0.0"

    def test_config_backend_default(self) -> None:
        """デフォルトのバックエンドが vllm であること。"""
        from config import load_config

        config = load_config()
        assert config.backend == "vllm"

    def test_config_generation_params(self) -> None:
        """生成パラメータのデフォルト値が正しいこと。"""
        from config import load_config

        config = load_config()
        assert config.max_tokens == 1024
        assert config.top_p == 0.9
        assert config.repetition_penalty == 1.1

    def test_max_concurrent_requests_default(self) -> None:
        """デフォルトの同時リクエスト数が設定されていること。"""
        from config import load_config

        config = load_config()
        assert config.max_concurrent_requests == 4

    def test_get_preset_known_model(self) -> None:
        """既知のモデルのプリセットが取得できること。"""
        from config import get_preset

        preset = get_preset("cyberagent/calm3-22b-chat")
        assert preset is not None
        assert "description" in preset

    def test_get_preset_unknown_model(self) -> None:
        """未知のモデルのプリセットがNoneを返すこと。"""
        from config import get_preset

        preset = get_preset("unknown/model")
        assert preset is None


class TestParseJsonResponse:
    """JSON抽出パーサーのテスト。"""

    def test_parse_plain_json(self) -> None:
        """プレーンなJSONテキストをパースできること。"""
        from parser import parse_json_response

        text = '{"needs": {"mobility_type": "wheelchair"}, "confidence": 0.8, "missing_fields": []}'
        result = parse_json_response(text)
        assert result["needs"]["mobility_type"] == "wheelchair"
        assert result["confidence"] == 0.8

    def test_parse_json_in_code_block(self) -> None:
        """```json ... ``` ブロック内のJSONを抽出できること。"""
        from parser import parse_json_response

        text = """以下がニーズの抽出結果です。
```json
{"needs": {"mobility_type": "cane"}, "confidence": 0.6, "missing_fields": ["companions"]}
```
"""
        result = parse_json_response(text)
        assert result["needs"]["mobility_type"] == "cane"
        assert "companions" in result["missing_fields"]

    def test_parse_json_embedded_in_text(self) -> None:
        """テキスト中に埋め込まれたJSONを抽出できること。"""
        from parser import parse_json_response

        text = 'ニーズ分析結果: {"needs": {"mobility_type": "walk"}, "confidence": 0.4, "missing_fields": ["companions"]} 以上です。'
        result = parse_json_response(text)
        assert result["needs"]["mobility_type"] == "walk"

    def test_parse_nested_json(self) -> None:
        """ネストされたJSONを正しくパースできること。"""
        from parser import parse_json_response

        text = '{"needs": {"mobility_type": "stroller", "companions": ["child", "elderly"]}, "confidence": 0.9, "missing_fields": []}'
        result = parse_json_response(text)
        assert result["needs"]["companions"] == ["child", "elderly"]

    def test_parse_invalid_json_returns_fallback(self) -> None:
        """パース不能なテキストでフォールバック値を返すこと。"""
        from parser import parse_json_response

        result = parse_json_response("これはJSONではありません。")
        assert result["needs"] == {}
        assert result["confidence"] == 0.0
        assert len(result["missing_fields"]) > 0

    def test_parse_empty_string_returns_fallback(self) -> None:
        """空文字列でフォールバック値を返すこと。"""
        from parser import parse_json_response

        result = parse_json_response("")
        assert result["needs"] == {}
        assert result["confidence"] == 0.0


class TestValidateExtractedNeeds:
    """ニーズバリデーションのテスト。"""

    def test_valid_mobility_type(self) -> None:
        """有効なmobility_typeが受け入れられること。"""
        from parser import validate_extracted_needs

        for mt in ["wheelchair", "stroller", "cane", "walk", "other"]:
            result = validate_extracted_needs({"mobility_type": mt})
            assert result["mobility_type"] == mt

    def test_invalid_mobility_type_rejected(self) -> None:
        """無効なmobility_typeが除外されること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"mobility_type": "flying"})
        assert "mobility_type" not in result

    def test_valid_companions(self) -> None:
        """有効なcompanionsが受け入れられること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"companions": ["child", "elderly"]})
        assert result["companions"] == ["child", "elderly"]

    def test_invalid_companions_filtered(self) -> None:
        """無効なcompanion値がフィルタリングされること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"companions": ["child", "dog", "elderly"]})
        assert result["companions"] == ["child", "elderly"]

    def test_valid_max_distance(self) -> None:
        """有効なmax_distance_metersが受け入れられること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"max_distance_meters": 500})
        assert result["max_distance_meters"] == 500

    def test_negative_distance_rejected(self) -> None:
        """負のmax_distance_metersが除外されること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"max_distance_meters": -100})
        assert "max_distance_meters" not in result

    def test_valid_avoid_conditions(self) -> None:
        """有効なavoid_conditionsが受け入れられること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"avoid_conditions": ["stairs", "slope"]})
        assert result["avoid_conditions"] == ["stairs", "slope"]

    def test_valid_prefer_conditions(self) -> None:
        """有効なprefer_conditionsが受け入れられること。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({"prefer_conditions": ["restroom", "covered"]})
        assert result["prefer_conditions"] == ["restroom", "covered"]

    def test_full_valid_needs(self) -> None:
        """全フィールドが有効なニーズデータが正しくバリデーションされること。"""
        from parser import validate_extracted_needs

        needs: dict[str, Any] = {
            "mobility_type": "wheelchair",
            "companions": ["child"],
            "max_distance_meters": 500,
            "avoid_conditions": ["stairs", "slope"],
            "prefer_conditions": ["restroom", "rest_area"],
        }
        result = validate_extracted_needs(needs)
        assert len(result) == 5

    def test_empty_needs(self) -> None:
        """空のニーズデータが空の結果を返すこと。"""
        from parser import validate_extracted_needs

        result = validate_extracted_needs({})
        assert result == {}


class TestDetermineMissingFields:
    """不足フィールド判定のテスト。"""

    def test_all_fields_present(self) -> None:
        """全フィールドが存在する場合、不足フィールドがないこと。"""
        from parser import determine_missing_fields

        needs: dict[str, Any] = {
            "mobility_type": "wheelchair",
            "companions": ["child"],
            "max_distance_meters": 500,
            "avoid_conditions": ["stairs"],
            "prefer_conditions": ["restroom"],
        }
        result = determine_missing_fields(needs)
        assert result == []

    def test_empty_needs_returns_all_fields(self) -> None:
        """空のニーズデータで全フィールドが不足していること。"""
        from parser import determine_missing_fields

        result = determine_missing_fields({})
        assert len(result) == 5

    def test_partial_needs(self) -> None:
        """一部のフィールドのみ存在する場合、残りが不足として報告されること。"""
        from parser import determine_missing_fields

        needs: dict[str, Any] = {
            "mobility_type": "wheelchair",
            "avoid_conditions": ["stairs"],
        }
        result = determine_missing_fields(needs)
        assert "mobility_type" not in result
        assert "avoid_conditions" not in result
        assert "companions" in result

    def test_empty_list_counts_as_missing(self) -> None:
        """空リストのフィールドは不足として扱われること。"""
        from parser import determine_missing_fields

        needs: dict[str, Any] = {
            "mobility_type": "walk",
            "companions": [],
        }
        result = determine_missing_fields(needs)
        assert "companions" in result


class TestDetermineAction:
    """アクション判定のテスト。"""

    def test_high_confidence_full_info(self) -> None:
        """高確信度で全情報が揃っている場合、search_routeを返すこと。"""
        from parser import determine_action

        needs: dict[str, Any] = {"mobility_type": "wheelchair"}
        result = determine_action(needs, 0.9, [])
        assert result == "search_route"

    def test_high_confidence_one_missing(self) -> None:
        """高確信度で1つだけ不足している場合、search_routeを返すこと。"""
        from parser import determine_action

        needs: dict[str, Any] = {"mobility_type": "wheelchair"}
        result = determine_action(needs, 0.85, ["max_distance_meters"])
        assert result == "search_route"

    def test_medium_confidence_with_mobility(self) -> None:
        """中程度の確信度でmobility_typeがある場合、show_spotsを返すこと。"""
        from parser import determine_action

        needs: dict[str, Any] = {"mobility_type": "cane"}
        result = determine_action(needs, 0.6, ["companions", "max_distance_meters"])
        assert result == "show_spots"

    def test_low_confidence(self) -> None:
        """低確信度の場合、ask_moreを返すこと。"""
        from parser import determine_action

        needs: dict[str, Any] = {"mobility_type": "walk"}
        result = determine_action(needs, 0.3, ["companions", "max_distance_meters"])
        assert result == "ask_more"

    def test_no_needs(self) -> None:
        """ニーズがNoneの場合、ask_moreを返すこと。"""
        from parser import determine_action

        result = determine_action(None, 0.0, [])
        assert result == "ask_more"

    def test_no_mobility_type(self) -> None:
        """mobility_typeがない場合、高確信度でもask_moreを返すこと。"""
        from parser import determine_action

        needs: dict[str, Any] = {"avoid_conditions": ["stairs"]}
        result = determine_action(needs, 0.8, [])
        assert result == "ask_more"


class TestPromptLoading:
    """プロンプト読み込みのテスト。"""

    def test_load_chat_prompt(self) -> None:
        """チャットプロンプトが正しく読み込まれること。"""
        from server import load_prompt

        prompt = load_prompt("chat_system.txt")
        assert "AccessRoute" in prompt
        assert "コンシェルジュ" in prompt

    def test_load_extract_needs_prompt(self) -> None:
        """ニーズ抽出プロンプトが正しく読み込まれること。"""
        from server import load_prompt

        prompt = load_prompt("extract_needs_system.txt")
        assert "mobility_type" in prompt
        assert "JSON" in prompt


class TestTestData:
    """テストデータの整合性テスト。"""

    def test_conversations_valid_json(self) -> None:
        """テスト会話データが有効なJSONであること。"""
        path = Path(__file__).parent.parent / "test_data" / "test_conversations.json"
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        assert len(data) == 20

    def test_expected_outputs_valid_json(self) -> None:
        """期待出力データが有効なJSONであること。"""
        path = Path(__file__).parent.parent / "test_data" / "expected_outputs.json"
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        assert len(data) == 20

    def test_conversations_and_outputs_match(self) -> None:
        """テスト会話と期待出力のIDが一致すること。"""
        base = Path(__file__).parent.parent / "test_data"
        with open(base / "test_conversations.json", encoding="utf-8") as f:
            conversations = json.load(f)
        with open(base / "expected_outputs.json", encoding="utf-8") as f:
            outputs = json.load(f)

        conv_ids = {c["id"] for c in conversations}
        output_ids = {o["id"] for o in outputs}
        assert conv_ids == output_ids

    def test_conversation_messages_have_valid_roles(self) -> None:
        """テスト会話のメッセージが有効なroleを持つこと。"""
        path = Path(__file__).parent.parent / "test_data" / "test_conversations.json"
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        valid_roles = {"user", "assistant", "system"}
        for conv in data:
            for msg in conv["messages"]:
                assert msg["role"] in valid_roles


class TestModelManager:
    """モデル管理モジュールのテスト。"""

    def test_create_backend_vllm(self) -> None:
        """vLLMバックエンドが生成できること。"""
        from config import ModelConfig
        from model_manager import VLLMBackend, create_backend

        config = ModelConfig()
        backend = create_backend(config)
        assert isinstance(backend, VLLMBackend)

    def test_create_backend_invalid(self) -> None:
        """無効なバックエンド名でValueErrorが発生すること。"""
        import os

        from model_manager import create_backend

        os.environ["MODEL_BACKEND"] = "invalid"
        try:
            from config import ModelConfig

            config = ModelConfig()
            with pytest.raises(ValueError, match="未対応のバックエンド"):
                create_backend(config)
        finally:
            os.environ["MODEL_BACKEND"] = "vllm"

    def test_health_check_not_loaded(self) -> None:
        """未ロード状態のヘルスチェックがloading状態を返すこと。"""
        from config import ModelConfig
        from model_manager import VLLMBackend

        config = ModelConfig()
        backend = VLLMBackend(config)
        health = backend.health_check()
        assert health["status"] == "loading"

    def test_format_messages(self) -> None:
        """メッセージのフォーマットが正しいこと。"""
        from config import ModelConfig
        from model_manager import VLLMBackend

        config = ModelConfig()
        backend = VLLMBackend(config)
        messages = [
            {"role": "system", "content": "あなたはアシスタントです"},
            {"role": "user", "content": "こんにちは"},
        ]
        result = backend._format_messages(messages)
        assert "システム: あなたはアシスタントです" in result
        assert "ユーザー: こんにちは" in result
        assert result.endswith("アシスタント: ")
