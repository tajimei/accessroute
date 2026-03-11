"""プロンプトのリグレッションテスト。

テスト会話データを入力し、モックバックエンドを通じて
期待するJSON構造が出力されるかを検証する。
モデルなしでも動作するようモック対応済み。
"""

import json
from pathlib import Path
from unittest.mock import MagicMock

import pytest

# テスト会話データ（benchmark.py の TEST_CONVERSATIONS を基にした検証用データ）
TEST_CONVERSATIONS = [
    {
        "name": "車椅子ユーザー基本会話",
        "messages": [
            {"role": "user", "content": "こんにちは、東京駅周辺でバリアフリーな観光スポットを探しています。"},
            {"role": "assistant", "content": "こんにちは！東京駅周辺の観光スポットをお探しですね。移動手段はどのようになさっていますか？"},
            {"role": "user", "content": "車椅子を使っています。段差が多い場所は避けたいです。"},
        ],
        "expected_needs": {
            "mobility_type": "wheelchair",
            "avoid_conditions": ["stairs"],
        },
    },
    {
        "name": "ベビーカー＋高齢者同伴",
        "messages": [
            {"role": "user", "content": "来週、母と一緒に子供を連れて京都に行きたいんですが。"},
            {"role": "assistant", "content": "京都旅行、素敵ですね！お母様とお子様連れとのことですが、お母様のお体の具合はいかがですか？"},
            {"role": "user", "content": "母は80歳で杖をついています。子供は2歳でベビーカーです。あまり長い距離は歩けないので、500メートルくらいが限界です。"},
        ],
        "expected_needs": {
            "mobility_type": "stroller",
            "companions": ["child", "elderly"],
            "max_distance_meters": 500,
            "avoid_conditions": ["stairs", "slope"],
        },
    },
    {
        "name": "高齢者の一人旅",
        "messages": [
            {"role": "user", "content": "足が悪いので休憩できる場所が多いルートを教えてください。雨でも大丈夫な場所がいいです。"},
        ],
        "expected_needs": {
            "mobility_type": "walk",
            "prefer_conditions": ["rest_area", "covered"],
        },
    },
    {
        "name": "混雑回避希望",
        "messages": [
            {"role": "user", "content": "杖を使っているのですが、人混みが苦手です。トイレが近くにある場所だと安心です。"},
        ],
        "expected_needs": {
            "mobility_type": "cane",
            "avoid_conditions": ["crowd"],
            "prefer_conditions": ["restroom"],
        },
    },
]


class MockExtractBackend:
    """ニーズ抽出をシミュレートするモックバックエンド。

    テスト会話の内容をキーワード分析し、期待されるJSON構造を返す。
    実際のLLMモデルは使用しない。
    """

    def __init__(self) -> None:
        self.config = MagicMock()
        self.config.model_name = "mock-extract-model"
        self.loaded = True

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """会話内容に基づいてニーズ抽出JSONを生成する。"""
        # 全メッセージのテキストを結合して分析
        all_text = " ".join(m["content"] for m in messages if m["role"] != "system")

        needs: dict = {}
        missing: list[str] = []
        confidence = 0.5

        # mobility_type の判定
        if "車椅子" in all_text:
            needs["mobility_type"] = "wheelchair"
            confidence += 0.15
        elif "ベビーカー" in all_text:
            needs["mobility_type"] = "stroller"
            confidence += 0.15
        elif "杖" in all_text:
            needs["mobility_type"] = "cane"
            confidence += 0.15
        elif "足が悪い" in all_text or "歩け" in all_text:
            needs["mobility_type"] = "walk"
            confidence += 0.1
        else:
            missing.append("mobility_type")

        # companions の判定
        companions = []
        if "子供" in all_text or "子連れ" in all_text or "ベビーカー" in all_text:
            companions.append("child")
        if "母" in all_text or "高齢" in all_text or "80歳" in all_text:
            companions.append("elderly")
        if companions:
            needs["companions"] = companions
            confidence += 0.1

        # max_distance_meters の判定
        if "500メートル" in all_text or "500m" in all_text.lower():
            needs["max_distance_meters"] = 500
            confidence += 0.1
        elif "長い距離" in all_text and "歩けない" in all_text:
            needs["max_distance_meters"] = 500
            confidence += 0.05

        # avoid_conditions の判定
        avoid = []
        if "段差" in all_text or "階段" in all_text:
            avoid.append("stairs")
        if "坂" in all_text or "勾配" in all_text:
            avoid.append("slope")
        if "ベビーカー" in all_text and "母" in all_text:
            # ベビーカー + 高齢者なら坂も回避
            if "slope" not in avoid:
                avoid.append("slope")
        if "人混み" in all_text or "混雑" in all_text:
            avoid.append("crowd")
        if avoid:
            needs["avoid_conditions"] = avoid
            confidence += 0.1

        # prefer_conditions の判定
        prefer = []
        if "休憩" in all_text:
            prefer.append("rest_area")
        if "トイレ" in all_text:
            prefer.append("restroom")
        if "雨" in all_text or "屋根" in all_text:
            prefer.append("covered")
        if prefer:
            needs["prefer_conditions"] = prefer
            confidence += 0.05

        # 信頼度のクランプ
        confidence = min(1.0, confidence)

        result = {
            "needs": needs,
            "confidence": round(confidence, 2),
            "missing_fields": missing,
        }
        return json.dumps(result, ensure_ascii=False)


@pytest.fixture
def mock_extract_backend() -> MockExtractBackend:
    """モック抽出バックエンドのフィクスチャ。"""
    return MockExtractBackend()


class TestPromptSystemFiles:
    """プロンプトファイルの存在と内容のリグレッションテスト。"""

    def test_chat_system_prompt_exists(self) -> None:
        """チャットシステムプロンプトファイルが存在すること。"""
        path = Path(__file__).parent.parent / "prompts" / "chat_system.txt"
        assert path.exists(), f"プロンプトファイルが見つかりません: {path}"

    def test_extract_needs_prompt_exists(self) -> None:
        """ニーズ抽出プロンプトファイルが存在すること。"""
        path = Path(__file__).parent.parent / "prompts" / "extract_needs_system.txt"
        assert path.exists(), f"プロンプトファイルが見つかりません: {path}"

    def test_chat_prompt_contains_role_definition(self) -> None:
        """チャットプロンプトに役割定義が含まれること。"""
        path = Path(__file__).parent.parent / "prompts" / "chat_system.txt"
        content = path.read_text(encoding="utf-8")
        assert "AccessRoute" in content
        assert "コンシェルジュ" in content or "役割" in content

    def test_chat_prompt_contains_accessibility_knowledge(self) -> None:
        """チャットプロンプトにバリアフリー知識が含まれること。"""
        path = Path(__file__).parent.parent / "prompts" / "chat_system.txt"
        content = path.read_text(encoding="utf-8")
        assert "車椅子" in content
        assert "ベビーカー" in content

    def test_extract_prompt_contains_output_format(self) -> None:
        """ニーズ抽出プロンプトに出力フォーマット定義が含まれること。"""
        path = Path(__file__).parent.parent / "prompts" / "extract_needs_system.txt"
        content = path.read_text(encoding="utf-8")
        assert "mobility_type" in content
        assert "companions" in content
        assert "confidence" in content

    def test_extract_prompt_contains_mobility_types(self) -> None:
        """ニーズ抽出プロンプトに全 mobility_type が定義されていること。"""
        path = Path(__file__).parent.parent / "prompts" / "extract_needs_system.txt"
        content = path.read_text(encoding="utf-8")
        for mobility_type in ("wheelchair", "stroller", "cane", "walk", "other"):
            assert mobility_type in content, f"mobility_type '{mobility_type}' がプロンプトに含まれていません"

    def test_extract_prompt_contains_avoid_conditions(self) -> None:
        """ニーズ抽出プロンプトに全 avoid_conditions が定義されていること。"""
        path = Path(__file__).parent.parent / "prompts" / "extract_needs_system.txt"
        content = path.read_text(encoding="utf-8")
        for condition in ("stairs", "slope", "crowd", "dark"):
            assert condition in content, f"avoid_condition '{condition}' がプロンプトに含まれていません"


class TestNeedsExtractionRegression:
    """ニーズ抽出のリグレッションテスト。

    モックバックエンドを使用して、テスト会話から期待されるJSON構造が
    出力されるかを検証する。
    """

    def test_wheelchair_user_extraction(self, mock_extract_backend: MockExtractBackend) -> None:
        """車椅子ユーザーの会話からニーズを正しく抽出できること。"""
        conv = TEST_CONVERSATIONS[0]
        raw = mock_extract_backend.generate(conv["messages"], 512, 0.1)
        result = json.loads(raw)

        assert result["needs"]["mobility_type"] == "wheelchair"
        assert "stairs" in result["needs"].get("avoid_conditions", [])
        assert result["confidence"] >= 0.5

    def test_stroller_elderly_extraction(self, mock_extract_backend: MockExtractBackend) -> None:
        """ベビーカー＋高齢者同伴の会話からニーズを正しく抽出できること。"""
        conv = TEST_CONVERSATIONS[1]
        raw = mock_extract_backend.generate(conv["messages"], 512, 0.1)
        result = json.loads(raw)

        assert result["needs"]["mobility_type"] == "stroller"
        assert "child" in result["needs"].get("companions", [])
        assert "elderly" in result["needs"].get("companions", [])
        assert result["needs"].get("max_distance_meters") == 500

    def test_elderly_solo_extraction(self, mock_extract_backend: MockExtractBackend) -> None:
        """高齢者一人旅の会話からニーズを正しく抽出できること。"""
        conv = TEST_CONVERSATIONS[2]
        raw = mock_extract_backend.generate(conv["messages"], 512, 0.1)
        result = json.loads(raw)

        assert result["needs"]["mobility_type"] == "walk"
        assert "rest_area" in result["needs"].get("prefer_conditions", [])
        assert "covered" in result["needs"].get("prefer_conditions", [])

    def test_crowd_avoidance_extraction(self, mock_extract_backend: MockExtractBackend) -> None:
        """混雑回避希望の会話からニーズを正しく抽出できること。"""
        conv = TEST_CONVERSATIONS[3]
        raw = mock_extract_backend.generate(conv["messages"], 512, 0.1)
        result = json.loads(raw)

        assert result["needs"]["mobility_type"] == "cane"
        assert "crowd" in result["needs"].get("avoid_conditions", [])
        assert "restroom" in result["needs"].get("prefer_conditions", [])

    def test_extraction_output_json_structure(self, mock_extract_backend: MockExtractBackend) -> None:
        """全テストケースで出力JSONが正しい構造を持つこと。"""
        for conv in TEST_CONVERSATIONS:
            raw = mock_extract_backend.generate(conv["messages"], 512, 0.1)
            result = json.loads(raw)

            # 必須フィールドの存在確認
            assert "needs" in result, f"テスト '{conv['name']}': needs フィールドが欠落"
            assert "confidence" in result, f"テスト '{conv['name']}': confidence フィールドが欠落"
            assert "missing_fields" in result, f"テスト '{conv['name']}': missing_fields フィールドが欠落"

            # 型の確認
            assert isinstance(result["needs"], dict)
            assert isinstance(result["confidence"], (int, float))
            assert isinstance(result["missing_fields"], list)

            # 信頼度の範囲確認
            assert 0.0 <= result["confidence"] <= 1.0, (
                f"テスト '{conv['name']}': confidence が 0-1 の範囲外: {result['confidence']}"
            )

    def test_extraction_confidence_increases_with_info(
        self, mock_extract_backend: MockExtractBackend
    ) -> None:
        """情報量が多いほど信頼度が高くなること。"""
        # 情報が少ない会話
        sparse_messages = [
            {"role": "user", "content": "旅行したいです。"},
        ]
        sparse_raw = mock_extract_backend.generate(sparse_messages, 512, 0.1)
        sparse_result = json.loads(sparse_raw)

        # 情報が多い会話
        rich_messages = [
            {"role": "user", "content": "車椅子を使っています。段差は避けたいです。子供連れで、500メートルくらいが限界です。"},
        ]
        rich_raw = mock_extract_backend.generate(rich_messages, 512, 0.1)
        rich_result = json.loads(rich_raw)

        assert rich_result["confidence"] > sparse_result["confidence"], (
            f"情報量の多い会話の信頼度 ({rich_result['confidence']}) が"
            f"少ない会話 ({sparse_result['confidence']}) より低い"
        )


class TestLoadPrompt:
    """プロンプト読み込み関数のテスト。"""

    def test_load_existing_prompt(self) -> None:
        """存在するプロンプトファイルを読み込めること。"""
        from server import load_prompt

        content = load_prompt("chat_system.txt")
        assert len(content) > 0
        assert "AccessRoute" in content

    def test_load_nonexistent_prompt_raises_error(self) -> None:
        """存在しないプロンプトファイルでエラーが発生すること。"""
        from server import load_prompt

        with pytest.raises(FileNotFoundError):
            load_prompt("nonexistent_prompt.txt")
