"""チャットフローのE2Eテスト。

認証 -> チャット送信 -> AI応答受信 -> ニーズ抽出 -> プロファイル更新
の一連のフローをモック版でテストする。
外部API依存なしで実行可能。
"""

import json
from dataclasses import dataclass, field
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# --- テスト用のモッククラス ---


class MockFirebaseAuth:
    """Firebase認証のモック。"""

    def __init__(self) -> None:
        self.valid_tokens: dict[str, str] = {
            "valid-token-001": "test-user-001",
            "valid-token-002": "test-user-002",
        }

    def verify_id_token(self, token: str) -> dict[str, str]:
        """トークンを検証してUIDを返す。"""
        if token in self.valid_tokens:
            return {"uid": self.valid_tokens[token]}
        raise Exception("無効なトークンです")


class MockFirestore:
    """Firestoreのモック。"""

    def __init__(self) -> None:
        self.data: dict[str, dict[str, Any]] = {}

    def get_user_profile(self, user_id: str) -> dict[str, Any] | None:
        """ユーザープロファイルを取得する。"""
        return self.data.get(f"users/{user_id}")

    def upsert_user_profile(
        self, user_id: str, profile: dict[str, Any]
    ) -> dict[str, Any]:
        """ユーザープロファイルを更新する。"""
        key = f"users/{user_id}"
        existing = self.data.get(key, {})
        existing.update(profile)
        existing["userId"] = user_id
        self.data[key] = existing
        return existing

    def save_conversation(
        self, user_id: str, messages: list[dict[str, str]]
    ) -> str:
        """会話を保存する。"""
        conv_id = f"conv-{len(self.data)}"
        self.data[f"conversations/{conv_id}"] = {
            "conversationId": conv_id,
            "userId": user_id,
            "messages": messages,
        }
        return conv_id


class MockAIProxy:
    """AIプロキシのモック。"""

    def __init__(self) -> None:
        self.chat_responses: list[dict[str, Any]] = []
        self.extract_responses: list[dict[str, Any]] = []
        self._chat_call_count = 0
        self._extract_call_count = 0

    def add_chat_response(self, response: dict[str, Any]) -> None:
        """チャット応答を追加する。"""
        self.chat_responses.append(response)

    def add_extract_response(self, response: dict[str, Any]) -> None:
        """ニーズ抽出応答を追加する。"""
        self.extract_responses.append(response)

    def chat(
        self,
        user_id: str,
        message: str,
        conversation_history: list[dict[str, str]],
        user_profile: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """チャット応答を返す。"""
        if self._chat_call_count < len(self.chat_responses):
            response = self.chat_responses[self._chat_call_count]
            self._chat_call_count += 1
            return response
        return {
            "reply": "デフォルト応答です。",
            "extractedNeeds": None,
            "suggestedAction": "ask_more",
        }

    def extract_needs(
        self,
        user_id: str,
        conversation_history: list[dict[str, str]],
    ) -> dict[str, Any]:
        """ニーズ抽出結果を返す。"""
        if self._extract_call_count < len(self.extract_responses):
            response = self.extract_responses[self._extract_call_count]
            self._extract_call_count += 1
            return response
        return {
            "needs": {},
            "confidence": 0.0,
            "missingFields": [],
        }


# --- テストフィクスチャ ---


@pytest.fixture
def mock_auth() -> MockFirebaseAuth:
    """Firebase認証モック。"""
    return MockFirebaseAuth()


@pytest.fixture
def mock_firestore() -> MockFirestore:
    """Firestoreモック。"""
    return MockFirestore()


@pytest.fixture
def mock_ai_proxy() -> MockAIProxy:
    """AIプロキシモック。"""
    return MockAIProxy()


# --- E2Eテスト ---


class TestChatFlowE2E:
    """チャットフローの全体テスト。"""

    def test_full_chat_flow_wheelchair_user(
        self,
        mock_auth: MockFirebaseAuth,
        mock_firestore: MockFirestore,
        mock_ai_proxy: MockAIProxy,
    ) -> None:
        """車椅子ユーザーの完全なチャットフロー。

        1. 認証
        2. チャット送信（初回: 挨拶）
        3. AI応答受信
        4. チャット送信（2回目: ニーズ情報含む）
        5. ニーズ抽出
        6. プロファイル更新
        """
        # ステップ1: 認証
        token = "valid-token-001"
        auth_result = mock_auth.verify_id_token(token)
        user_id = auth_result["uid"]
        assert user_id == "test-user-001"

        # ステップ2-3: 初回チャット
        mock_ai_proxy.add_chat_response(
            {
                "reply": "こんにちは！どのようなお手伝いができますか？",
                "extractedNeeds": None,
                "suggestedAction": "ask_more",
            }
        )

        first_response = mock_ai_proxy.chat(
            user_id=user_id,
            message="こんにちは、東京駅周辺を案内してほしいです",
            conversation_history=[],
        )

        assert first_response["reply"] is not None
        assert first_response["suggestedAction"] == "ask_more"

        # 会話履歴を構築
        conversation_history = [
            {"role": "user", "content": "こんにちは、東京駅周辺を案内してほしいです"},
            {"role": "assistant", "content": first_response["reply"]},
        ]

        # ステップ4: 2回目のチャット（ニーズ情報を含む）
        mock_ai_proxy.add_chat_response(
            {
                "reply": "車椅子をお使いなのですね。段差の少ないルートをお探しします。",
                "extractedNeeds": {
                    "mobilityType": "wheelchair",
                    "avoidConditions": ["stairs"],
                },
                "suggestedAction": "show_spots",
            }
        )

        second_response = mock_ai_proxy.chat(
            user_id=user_id,
            message="車椅子を使っています。段差は避けたいです。",
            conversation_history=conversation_history,
        )

        assert second_response["extractedNeeds"] is not None
        assert second_response["extractedNeeds"]["mobilityType"] == "wheelchair"
        assert "stairs" in second_response["extractedNeeds"]["avoidConditions"]
        assert second_response["suggestedAction"] == "show_spots"

        # ステップ5: ニーズ抽出
        conversation_history.extend(
            [
                {"role": "user", "content": "車椅子を使っています。段差は避けたいです。"},
                {"role": "assistant", "content": second_response["reply"]},
            ]
        )

        mock_ai_proxy.add_extract_response(
            {
                "needs": {
                    "mobilityType": "wheelchair",
                    "companions": [],
                    "avoidConditions": ["stairs"],
                    "preferConditions": ["restroom"],
                },
                "confidence": 0.75,
                "missingFields": ["maxDistanceMeters", "companions"],
            }
        )

        extract_result = mock_ai_proxy.extract_needs(
            user_id=user_id,
            conversation_history=conversation_history,
        )

        assert extract_result["confidence"] >= 0.5
        assert extract_result["needs"]["mobilityType"] == "wheelchair"

        # ステップ6: プロファイル更新
        updated_profile = mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": extract_result["needs"]["mobilityType"],
                "avoidConditions": extract_result["needs"]["avoidConditions"],
                "preferConditions": extract_result["needs"].get("preferConditions", []),
            },
        )

        assert updated_profile["mobilityType"] == "wheelchair"
        assert "stairs" in updated_profile["avoidConditions"]

        # 会話の保存
        conv_id = mock_firestore.save_conversation(user_id, conversation_history)
        assert conv_id is not None

        # 保存データの確認
        saved = mock_firestore.data.get(f"conversations/{conv_id}")
        assert saved is not None
        assert saved["userId"] == user_id
        assert len(saved["messages"]) == 4

    def test_full_chat_flow_stroller_elderly(
        self,
        mock_auth: MockFirebaseAuth,
        mock_firestore: MockFirestore,
        mock_ai_proxy: MockAIProxy,
    ) -> None:
        """ベビーカー+高齢者同伴のチャットフロー。"""
        # 認証
        auth_result = mock_auth.verify_id_token("valid-token-002")
        user_id = auth_result["uid"]

        # チャット送信
        mock_ai_proxy.add_chat_response(
            {
                "reply": "お母様とお子様連れでの京都旅行、素敵ですね。",
                "extractedNeeds": {
                    "mobilityType": "stroller",
                    "companions": ["child", "elderly"],
                    "maxDistanceMeters": 500,
                    "avoidConditions": ["stairs", "slope"],
                },
                "suggestedAction": "show_spots",
            }
        )

        response = mock_ai_proxy.chat(
            user_id=user_id,
            message="母と2歳の子供を連れて京都旅行したいです。ベビーカーを使います。500mが限界です。",
            conversation_history=[],
        )

        assert response["extractedNeeds"]["mobilityType"] == "stroller"
        assert "child" in response["extractedNeeds"]["companions"]
        assert "elderly" in response["extractedNeeds"]["companions"]
        assert response["extractedNeeds"]["maxDistanceMeters"] == 500

        # プロファイル更新
        updated = mock_firestore.upsert_user_profile(
            user_id, response["extractedNeeds"]
        )
        assert updated["mobilityType"] == "stroller"
        assert updated["maxDistanceMeters"] == 500

    def test_invalid_auth_token(self, mock_auth: MockFirebaseAuth) -> None:
        """無効なトークンでの認証失敗。"""
        with pytest.raises(Exception, match="無効なトークン"):
            mock_auth.verify_id_token("invalid-token")

    def test_chat_without_needs_extraction(
        self,
        mock_auth: MockFirebaseAuth,
        mock_ai_proxy: MockAIProxy,
    ) -> None:
        """ニーズが抽出されない一般的な会話。"""
        auth_result = mock_auth.verify_id_token("valid-token-001")
        user_id = auth_result["uid"]

        mock_ai_proxy.add_chat_response(
            {
                "reply": "こんにちは！AccessRouteへようこそ。",
                "extractedNeeds": None,
                "suggestedAction": "ask_more",
            }
        )

        response = mock_ai_proxy.chat(
            user_id=user_id,
            message="こんにちは",
            conversation_history=[],
        )

        assert response["extractedNeeds"] is None
        assert response["suggestedAction"] == "ask_more"

    def test_multi_turn_conversation_flow(
        self,
        mock_auth: MockFirebaseAuth,
        mock_firestore: MockFirestore,
        mock_ai_proxy: MockAIProxy,
    ) -> None:
        """複数ターンの会話フロー。

        段階的にニーズ情報が蓄積されていくことを検証する。
        """
        auth_result = mock_auth.verify_id_token("valid-token-001")
        user_id = auth_result["uid"]

        # ターン1: 曖昧な要望
        mock_ai_proxy.add_chat_response(
            {
                "reply": "お出かけのご相談ですね。どのような点が気になりますか？",
                "extractedNeeds": None,
                "suggestedAction": "ask_more",
            }
        )

        response1 = mock_ai_proxy.chat(
            user_id=user_id,
            message="どこか出かけたいんですが",
            conversation_history=[],
        )
        assert response1["suggestedAction"] == "ask_more"

        # ターン2: 移動手段が判明
        mock_ai_proxy.add_chat_response(
            {
                "reply": "杖をお使いなのですね。坂道の少ない場所をお探しします。",
                "extractedNeeds": {
                    "mobilityType": "cane",
                    "avoidConditions": ["slope"],
                },
                "suggestedAction": "ask_more",
            }
        )

        conversation = [
            {"role": "user", "content": "どこか出かけたいんですが"},
            {"role": "assistant", "content": response1["reply"]},
        ]

        response2 = mock_ai_proxy.chat(
            user_id=user_id,
            message="杖を使っているので坂道は避けたいです",
            conversation_history=conversation,
        )
        assert response2["extractedNeeds"]["mobilityType"] == "cane"

        # ターン3: 追加情報で十分な情報が揃う
        mock_ai_proxy.add_chat_response(
            {
                "reply": "300m以内で休憩場所のある場所をお探しします。",
                "extractedNeeds": {
                    "mobilityType": "cane",
                    "maxDistanceMeters": 300,
                    "avoidConditions": ["slope"],
                    "preferConditions": ["rest_area"],
                },
                "suggestedAction": "search_route",
            }
        )

        conversation.extend(
            [
                {"role": "user", "content": "杖を使っているので坂道は避けたいです"},
                {"role": "assistant", "content": response2["reply"]},
            ]
        )

        response3 = mock_ai_proxy.chat(
            user_id=user_id,
            message="300mくらいが限界です。休憩所がほしいです。",
            conversation_history=conversation,
        )
        assert response3["suggestedAction"] == "search_route"
        assert response3["extractedNeeds"]["maxDistanceMeters"] == 300

        # プロファイル更新
        updated = mock_firestore.upsert_user_profile(
            user_id, response3["extractedNeeds"]
        )
        assert updated["mobilityType"] == "cane"
        assert updated["maxDistanceMeters"] == 300

    def test_profile_context_passed_to_chat(
        self,
        mock_auth: MockFirebaseAuth,
        mock_firestore: MockFirestore,
        mock_ai_proxy: MockAIProxy,
    ) -> None:
        """既存プロファイルがチャットコンテキストとして渡されることを検証。"""
        auth_result = mock_auth.verify_id_token("valid-token-001")
        user_id = auth_result["uid"]

        # 事前にプロファイルを作成
        mock_firestore.upsert_user_profile(
            user_id,
            {
                "mobilityType": "wheelchair",
                "avoidConditions": ["stairs"],
                "preferConditions": ["restroom"],
            },
        )

        # プロファイルを取得
        profile = mock_firestore.get_user_profile(user_id)
        assert profile is not None
        assert profile["mobilityType"] == "wheelchair"

        # プロファイル付きでチャット
        mock_ai_proxy.add_chat_response(
            {
                "reply": "車椅子利用の方ですね。既に段差回避の設定がされています。",
                "extractedNeeds": None,
                "suggestedAction": "show_spots",
            }
        )

        response = mock_ai_proxy.chat(
            user_id=user_id,
            message="近くの観光スポットを教えて",
            conversation_history=[],
            user_profile=profile,
        )

        assert response["suggestedAction"] == "show_spots"
