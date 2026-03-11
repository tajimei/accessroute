"""JSON抽出パーサーのテスト。

server.py 内の _parse_json_response 関数を検証する。
様々な形式のテキストからJSONを正しく抽出できることを確認する。
"""

import pytest


class TestParseJsonResponse:
    """parse_json_response 関数のテスト。"""

    @pytest.fixture(autouse=True)
    def setup(self) -> None:
        """テスト対象関数をインポートする。"""
        from parser import parse_json_response

        self.parse = parse_json_response

    # --- 正常系: 純粋なJSON文字列 ---

    def test_parse_pure_json(self) -> None:
        """純粋なJSON文字列をパースできること。"""
        text = '{"needs": {"mobility_type": "wheelchair"}, "confidence": 0.9, "missing_fields": []}'
        result = self.parse(text)
        assert result["needs"]["mobility_type"] == "wheelchair"
        assert result["confidence"] == 0.9
        assert result["missing_fields"] == []

    def test_parse_nested_json(self) -> None:
        """ネストされたJSONをパースできること。"""
        text = '{"needs": {"mobility_type": "stroller", "companions": ["child", "elderly"], "avoid_conditions": ["stairs", "slope"]}, "confidence": 0.85, "missing_fields": ["max_distance_meters"]}'
        result = self.parse(text)
        assert result["needs"]["mobility_type"] == "stroller"
        assert "child" in result["needs"]["companions"]
        assert "elderly" in result["needs"]["companions"]

    # --- 正常系: ```json ブロック内のJSON ---

    def test_parse_json_in_code_block(self) -> None:
        """```json コードブロック内のJSONを抽出できること。"""
        text = """分析結果は以下の通りです。

```json
{"needs": {"mobility_type": "cane"}, "confidence": 0.7, "missing_fields": ["companions"]}
```

以上です。"""
        result = self.parse(text)
        assert result["needs"]["mobility_type"] == "cane"
        assert result["confidence"] == 0.7

    def test_parse_json_in_code_block_without_lang(self) -> None:
        """言語指定なしのコードブロック内のJSONを抽出できること。"""
        text = """結果:

```
{"needs": {"mobility_type": "walk"}, "confidence": 0.5, "missing_fields": ["avoid_conditions"]}
```"""
        result = self.parse(text)
        assert result["needs"]["mobility_type"] == "walk"

    # --- 正常系: テキスト中に埋め込まれたJSON ---

    def test_parse_json_embedded_in_text(self) -> None:
        """テキスト中に埋め込まれたJSONを抽出できること。"""
        text = '会話を分析した結果、以下のニーズが特定されました: {"needs": {"mobility_type": "wheelchair", "avoid_conditions": ["stairs"]}, "confidence": 0.8, "missing_fields": []} 以上の分析結果です。'
        result = self.parse(text)
        assert result["needs"]["mobility_type"] == "wheelchair"
        assert "stairs" in result["needs"]["avoid_conditions"]

    # --- 異常系: パース不可能なテキスト ---

    def test_parse_invalid_text_returns_default(self) -> None:
        """パースできないテキストの場合デフォルト値を返すこと。"""
        text = "これはJSONではない普通のテキストです。"
        result = self.parse(text)
        assert result["needs"] == {}
        assert result["confidence"] == 0.0
        assert len(result["missing_fields"]) > 0

    def test_parse_empty_string_returns_default(self) -> None:
        """空文字列の場合デフォルト値を返すこと。"""
        result = self.parse("")
        assert result["needs"] == {}
        assert result["confidence"] == 0.0

    def test_parse_malformed_json_returns_default(self) -> None:
        """不正なJSON形式の場合デフォルト値を返すこと。"""
        text = '{"needs": {"mobility_type": "wheelchair"'  # 閉じ括弧なし
        result = self.parse(text)
        # 不正なJSONなのでデフォルト値が返る
        assert "needs" in result

    # --- エッジケース ---

    def test_parse_json_with_japanese_values(self) -> None:
        """日本語を含むJSONをパースできること。"""
        text = '{"needs": {"mobility_type": "wheelchair"}, "confidence": 0.9, "missing_fields": [], "notes": "車椅子利用者"}'
        result = self.parse(text)
        assert result["needs"]["mobility_type"] == "wheelchair"

    def test_parse_json_with_null_values(self) -> None:
        """null値を含むJSONをパースできること。"""
        text = '{"needs": {"mobility_type": null, "companions": null}, "confidence": 0.3, "missing_fields": ["mobility_type", "companions"]}'
        result = self.parse(text)
        assert result["needs"]["mobility_type"] is None
        assert result["confidence"] == 0.3

    def test_parse_json_with_numeric_distance(self) -> None:
        """数値型の距離を含むJSONをパースできること。"""
        text = '{"needs": {"mobility_type": "stroller", "max_distance_meters": 500}, "confidence": 0.75, "missing_fields": []}'
        result = self.parse(text)
        assert result["needs"]["max_distance_meters"] == 500


class TestDetermineAction:
    """determine_action 関数のテスト。"""

    @pytest.fixture(autouse=True)
    def setup(self) -> None:
        """テスト対象関数をインポートする。"""
        from parser import determine_action

        self.determine = determine_action

    def test_none_input_returns_ask_more(self) -> None:
        """入力が None の場合 ask_more を返すこと。"""
        action, reason = self.determine(None, 0.0, [])
        assert action == "ask_more"
        assert isinstance(reason, str)

    def test_high_confidence_no_missing_returns_search_route(self) -> None:
        """高い信頼度で欠落フィールドなしの場合 search_route を返すこと。"""
        needs = {"mobility_type": "wheelchair"}
        action, reason = self.determine(needs, 0.9, [])
        assert action == "search_route"
        assert isinstance(reason, str)

    def test_medium_confidence_returns_show_spots(self) -> None:
        """中程度の信頼度の場合 show_spots を返すこと。"""
        needs = {"mobility_type": "cane"}
        action, reason = self.determine(needs, 0.6, ["companions", "max_distance_meters"])
        assert action == "show_spots"

    def test_low_confidence_returns_ask_more(self) -> None:
        """低い信頼度の場合 ask_more を返すこと。"""
        needs = {"mobility_type": "walk"}
        action, reason = self.determine(needs, 0.3, ["mobility_type", "companions"])
        assert action == "ask_more"

    def test_high_confidence_with_missing_fields_returns_search_route(self) -> None:
        """高い信頼度で1つ欠落の場合 search_route を返すこと。"""
        needs = {"mobility_type": "wheelchair"}
        action, reason = self.determine(needs, 0.85, ["max_distance_meters"])
        assert action == "search_route"

    def test_boundary_confidence_0_8(self) -> None:
        """信頼度が丁度 0.8 で欠落なしの場合 search_route を返すこと。"""
        needs = {"mobility_type": "wheelchair"}
        action, reason = self.determine(needs, 0.8, [])
        assert action == "search_route"

    def test_boundary_confidence_0_6(self) -> None:
        """信頼度が丁度 0.6 の場合 show_spots を返すこと。"""
        needs = {"mobility_type": "cane"}
        action, reason = self.determine(needs, 0.6, ["companions"])
        assert action == "show_spots"

    def test_destination_in_messages_lowers_threshold(self) -> None:
        """会話履歴に目的地がある場合、閾値が下がること。"""
        needs = {"mobility_type": "wheelchair"}
        msgs = [{"role": "user", "content": "東京駅に行きたいです"}]
        action, reason = self.determine(needs, 0.75, ["max_distance_meters"], msgs)
        assert action == "search_route"
        assert "目的地言及あり" in reason

    def test_spot_intent_detected(self) -> None:
        """スポット探し意図が検出された場合、show_spotsを返すこと。"""
        needs = {"mobility_type": "wheelchair"}
        msgs = [{"role": "user", "content": "近くのおすすめスポットを探しています"}]
        action, reason = self.determine(needs, 0.4, ["companions", "max_distance_meters"], msgs)
        assert action == "show_spots"
        assert "意図=spot" in reason

    def test_confidence_adjusted_by_long_history(self) -> None:
        """長い会話履歴でconfidenceが補正されること。"""
        needs = {"mobility_type": "wheelchair"}
        msgs = [
            {"role": "user", "content": "こんにちは"},
            {"role": "assistant", "content": "こんにちは"},
            {"role": "user", "content": "車椅子です"},
            {"role": "assistant", "content": "承知しました"},
            {"role": "user", "content": "階段は避けたい"},
            {"role": "assistant", "content": "わかりました"},
            {"role": "user", "content": "近くの場所を教えて"},
        ]
        action, reason = self.determine(needs, 0.43, ["max_distance_meters"], msgs)
        # 4ターン: +0.06 → 0.49 >= 0.45 → show_spots
        assert action == "show_spots"
        assert "会話長で補正" in reason

    def test_action_reason_always_returned(self) -> None:
        """アクション理由が常に返されること。"""
        needs = {"mobility_type": "walk"}
        action, reason = self.determine(needs, 0.5, [])
        assert len(reason) > 0
        assert "confidence=" in reason
