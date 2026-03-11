"""AI応答品質ベンチマークスクリプト。

test_data/test_conversations.json の全パターンを入力し、
test_data/expected_outputs.json と照合して正答率を自動計算する。
モックモードとライブモードを切り替えてCI/CDで実行可能。
"""

import argparse
import json
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from parser import (
    determine_action,
    determine_missing_fields,
    parse_json_response,
    validate_extracted_needs,
)

# テストデータのディレクトリ
TEST_DATA_DIR = Path(__file__).parent / "test_data"

# 品質基準の閾値
QUALITY_THRESHOLD = 0.80  # 正答率80%以上が目標


# --- データロード ---


def load_test_conversations() -> list[dict[str, Any]]:
    """テスト会話データを読み込む。"""
    path = TEST_DATA_DIR / "test_conversations.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def load_expected_outputs() -> dict[str, dict[str, Any]]:
    """期待出力データをID辞書として読み込む。"""
    path = TEST_DATA_DIR / "expected_outputs.json"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return {item["id"]: item["expected"] for item in data}


# --- モックバックエンド ---


class MockModelBackend:
    """CI/CD用のモックバックエンド。

    期待出力を直接JSON文字列として返すことで、
    モデルなしでパイプラインの正確性をテストする。
    """

    def __init__(self, expected_outputs: dict[str, dict[str, Any]]) -> None:
        self.expected_outputs = expected_outputs
        self._current_test_id: str | None = None

    def set_current_test(self, test_id: str) -> None:
        """現在のテストケースIDを設定する。"""
        self._current_test_id = test_id

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int = 512,
        temperature: float = 0.1,
    ) -> str:
        """期待出力をJSON文字列として返す。"""
        if self._current_test_id and self._current_test_id in self.expected_outputs:
            expected = self.expected_outputs[self._current_test_id]
            # ニーズ抽出プロンプトの場合
            is_extraction = any(
                "抽出" in m.get("content", "") or "分析" in m.get("content", "")
                for m in messages
            )
            if is_extraction:
                return json.dumps(
                    {
                        "needs": expected.get("needs", {}),
                        "confidence": (
                            expected.get("confidence_min", 0.5)
                            + expected.get("confidence_max", 0.8)
                        )
                        / 2,
                        "missing_fields": expected.get("missing_fields", []),
                    },
                    ensure_ascii=False,
                )
            # チャット応答の場合
            return "テスト応答: バリアフリー情報をお伝えします。"

        return '{"needs": {}, "confidence": 0.0, "missing_fields": []}'


# --- 結果データ構造 ---


@dataclass
class FieldResult:
    """フィールド単位の評価結果。"""

    field_name: str
    total: int = 0
    correct: int = 0
    partial: float = 0.0

    @property
    def accuracy(self) -> float:
        """正答率を返す。"""
        if self.total == 0:
            return 0.0
        return (self.correct + self.partial) / self.total


@dataclass
class TestCaseResult:
    """テストケース単位の評価結果。"""

    test_id: str
    test_name: str
    needs_accuracy: float = 0.0
    confidence_in_range: bool = False
    suggested_action_correct: bool = False
    field_results: dict[str, bool] = field(default_factory=dict)
    extracted_needs: dict[str, Any] = field(default_factory=dict)
    expected_needs: dict[str, Any] = field(default_factory=dict)
    latency_ms: float = 0.0


@dataclass
class BenchmarkReport:
    """ベンチマーク全体のレポート。"""

    mode: str  # "mock" または "live"
    total_cases: int = 0
    field_results: dict[str, FieldResult] = field(default_factory=dict)
    action_correct_count: int = 0
    confidence_in_range_count: int = 0
    overall_needs_accuracy: float = 0.0
    test_results: list[TestCaseResult] = field(default_factory=list)
    passed: bool = False


# --- 評価ロジック ---


def evaluate_field(
    field_name: str,
    extracted_value: Any,
    expected_value: Any,
) -> tuple[bool, float]:
    """フィールド単位の一致度を評価する。

    Returns:
        (完全一致か, 部分一致スコア)
    """
    # 期待値がnullの場合、抽出値もnull/未設定なら正解
    if expected_value is None:
        if extracted_value is None:
            return True, 0.0
        # 期待値がnullなのに何か抽出されている場合は不正解
        return False, 0.0

    # 抽出値がnullの場合は不正解
    if extracted_value is None:
        return False, 0.0

    # リスト型の比較
    if isinstance(expected_value, list):
        if not isinstance(extracted_value, list):
            return False, 0.0
        expected_set = set(expected_value)
        actual_set = set(extracted_value)
        if expected_set == actual_set:
            return True, 0.0
        if expected_set and expected_set.issubset(actual_set):
            return True, 0.0
        if expected_set:
            overlap = len(expected_set & actual_set)
            return False, overlap / len(expected_set)
        return True, 0.0

    # 数値型の比較（20%以内の誤差を許容）
    if isinstance(expected_value, (int, float)) and isinstance(
        extracted_value, (int, float)
    ):
        if expected_value == 0:
            return extracted_value == 0, 0.0
        if abs(expected_value - extracted_value) / max(abs(expected_value), 1) < 0.2:
            return True, 0.0
        return False, 0.0

    # 文字列型の比較
    return expected_value == extracted_value, 0.0


def evaluate_test_case(
    test_id: str,
    test_name: str,
    extracted: dict[str, Any],
    expected: dict[str, Any],
    confidence: float,
    suggested_action: str | None,
) -> TestCaseResult:
    """テストケースの評価を行う。"""
    result = TestCaseResult(
        test_id=test_id,
        test_name=test_name,
        extracted_needs=extracted,
        expected_needs=expected.get("needs", {}),
    )

    expected_needs = expected.get("needs", {})
    needs_fields = [
        "mobility_type",
        "companions",
        "max_distance_meters",
        "avoid_conditions",
        "prefer_conditions",
    ]

    correct_count = 0
    partial_sum = 0.0
    total_count = 0

    for field_name in needs_fields:
        expected_value = expected_needs.get(field_name)
        extracted_value = extracted.get(field_name)

        is_correct, partial_score = evaluate_field(
            field_name, extracted_value, expected_value
        )
        result.field_results[field_name] = is_correct

        total_count += 1
        if is_correct:
            correct_count += 1
        else:
            partial_sum += partial_score

    result.needs_accuracy = (
        (correct_count + partial_sum) / total_count if total_count > 0 else 0.0
    )

    # confidence の範囲チェック
    conf_min = expected.get("confidence_min", 0.0)
    conf_max = expected.get("confidence_max", 1.0)
    result.confidence_in_range = conf_min <= confidence <= conf_max

    # suggested_action の正否
    expected_action = expected.get("suggested_action")
    result.suggested_action_correct = suggested_action == expected_action

    return result


# --- ベンチマーク実行 ---


def run_quality_benchmark(
    mode: str = "mock",
    model_name: str | None = None,
    backend_type: str = "vllm",
) -> BenchmarkReport:
    """品質ベンチマークを実行する。

    Args:
        mode: "mock" (モックモード) または "live" (ライブモード)
        model_name: ライブモードで使用するモデル名
        backend_type: ライブモードで使用するバックエンド種別
    """
    conversations = load_test_conversations()
    expected_outputs = load_expected_outputs()

    report = BenchmarkReport(mode=mode, total_cases=len(conversations))

    # フィールド結果の初期化
    needs_fields = [
        "mobility_type",
        "companions",
        "max_distance_meters",
        "avoid_conditions",
        "prefer_conditions",
    ]
    for f in needs_fields:
        report.field_results[f] = FieldResult(field_name=f)

    # バックエンド準備
    if mode == "mock":
        mock_backend = MockModelBackend(expected_outputs)
    else:
        # ライブモード: 実際のモデルをロード
        import os

        from config import ModelConfig
        from model_manager import create_backend

        if model_name:
            os.environ["MODEL_NAME"] = model_name
        os.environ["MODEL_BACKEND"] = backend_type
        config = ModelConfig()
        live_backend = create_backend(config)
        live_backend.load()

    for test_case in conversations:
        test_id = test_case["id"]
        test_name = test_case["name"]
        messages = test_case["messages"]
        expected = expected_outputs.get(test_id, {})

        # ニーズ抽出の実行
        start = time.perf_counter()

        if mode == "mock":
            mock_backend.set_current_test(test_id)
            # ニーズ抽出プロンプトをシミュレート
            extraction_messages = [
                {"role": "system", "content": "ニーズを分析・抽出してください"}
            ] + messages
            raw = mock_backend.generate(extraction_messages)
        else:
            from server import load_prompt

            extraction_messages = [
                {"role": "system", "content": load_prompt("extract_needs_system.txt")}
            ] + messages
            raw = live_backend.generate(
                extraction_messages, max_tokens=512, temperature=0.1
            )

        latency_ms = (time.perf_counter() - start) * 1000

        # レスポンスのパースとバリデーション
        parsed = parse_json_response(raw)
        raw_needs = parsed.get("needs", {})
        validated_needs = validate_extracted_needs(raw_needs)
        confidence = parsed.get("confidence", 0.0)
        missing = determine_missing_fields(validated_needs)
        suggested_action = determine_action(validated_needs, confidence, missing)

        # 評価
        case_result = evaluate_test_case(
            test_id=test_id,
            test_name=test_name,
            extracted=validated_needs,
            expected=expected,
            confidence=confidence,
            suggested_action=suggested_action,
        )
        case_result.latency_ms = latency_ms

        # フィールド別結果の集計
        for f in needs_fields:
            report.field_results[f].total += 1
            is_correct, partial = evaluate_field(
                f,
                validated_needs.get(f),
                expected.get("needs", {}).get(f),
            )
            if is_correct:
                report.field_results[f].correct += 1
            else:
                report.field_results[f].partial += partial

        if case_result.suggested_action_correct:
            report.action_correct_count += 1
        if case_result.confidence_in_range:
            report.confidence_in_range_count += 1

        report.test_results.append(case_result)

    # 全体の正答率を計算
    if report.test_results:
        report.overall_needs_accuracy = sum(
            r.needs_accuracy for r in report.test_results
        ) / len(report.test_results)

    # 合否判定
    report.passed = report.overall_needs_accuracy >= QUALITY_THRESHOLD

    return report


# --- レポート出力 ---


def print_table_report(report: BenchmarkReport) -> None:
    """テーブル形式でレポートを出力する。"""
    print(f"\n{'=' * 70}")
    print(f"  AI応答品質ベンチマーク結果 (モード: {report.mode})")
    print(f"{'=' * 70}")

    # テストケース別結果
    print(f"\n{'テストケース':<30} {'正答率':>8} {'Action':>8} {'Conf':>6} {'時間(ms)':>10}")
    print("-" * 70)
    for r in report.test_results:
        action_mark = "OK" if r.suggested_action_correct else "NG"
        conf_mark = "OK" if r.confidence_in_range else "NG"
        print(
            f"  {r.test_name:<28} {r.needs_accuracy:>7.1%} {action_mark:>8} {conf_mark:>6} {r.latency_ms:>9.0f}"
        )

    # フィールド別正答率
    print(f"\n{'フィールド別正答率':}")
    print("-" * 50)
    print(f"  {'フィールド':<25} {'正答率':>8} {'正解/合計':>12}")
    print("-" * 50)
    for f_name, f_result in report.field_results.items():
        print(
            f"  {f_name:<25} {f_result.accuracy:>7.1%} {f_result.correct:>5}/{f_result.total:<5}"
        )

    # サマリー
    print(f"\n{'=' * 70}")
    print(f"  全体ニーズ抽出正答率: {report.overall_needs_accuracy:.1%} (目標: {QUALITY_THRESHOLD:.0%})")
    print(
        f"  suggested_action正答率: {report.action_correct_count}/{report.total_cases} "
        f"({report.action_correct_count / report.total_cases:.1%})"
    )
    print(
        f"  confidence範囲内率: {report.confidence_in_range_count}/{report.total_cases} "
        f"({report.confidence_in_range_count / report.total_cases:.1%})"
    )
    status = "PASSED" if report.passed else "FAILED"
    print(f"  結果: {status}")
    print(f"{'=' * 70}\n")


def save_json_report(report: BenchmarkReport, output_path: str) -> None:
    """JSON形式でレポートを保存する。"""
    data: dict[str, Any] = {
        "mode": report.mode,
        "total_cases": report.total_cases,
        "overall_needs_accuracy": round(report.overall_needs_accuracy, 4),
        "quality_threshold": QUALITY_THRESHOLD,
        "passed": report.passed,
        "suggested_action_accuracy": round(
            report.action_correct_count / report.total_cases, 4
        )
        if report.total_cases > 0
        else 0.0,
        "confidence_in_range_rate": round(
            report.confidence_in_range_count / report.total_cases, 4
        )
        if report.total_cases > 0
        else 0.0,
        "field_accuracies": {
            name: round(result.accuracy, 4)
            for name, result in report.field_results.items()
        },
        "test_cases": [
            {
                "test_id": r.test_id,
                "test_name": r.test_name,
                "needs_accuracy": round(r.needs_accuracy, 4),
                "confidence_in_range": r.confidence_in_range,
                "suggested_action_correct": r.suggested_action_correct,
                "field_results": r.field_results,
                "latency_ms": round(r.latency_ms, 1),
            }
            for r in report.test_results
        ],
    }

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"JSONレポートを保存しました: {output_path}")


# --- メインエントリポイント ---


def main() -> None:
    """メイン関数。"""
    parser = argparse.ArgumentParser(
        description="AccessRoute AI応答品質ベンチマーク"
    )
    parser.add_argument(
        "--mode",
        choices=["mock", "live"],
        default="mock",
        help="実行モード: mock（モデルなし）/ live（実モデル使用）",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=None,
        help="ライブモードで使用するモデル名",
    )
    parser.add_argument(
        "--backend",
        choices=["vllm", "transformers"],
        default="vllm",
        help="ライブモードの推論バックエンド",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="JSONレポートの出力先パス",
    )
    parser.add_argument(
        "--ci",
        action="store_true",
        help="CI/CDモード: 正答率が閾値未満の場合にexit code 1を返す",
    )
    args = parser.parse_args()

    # ベンチマーク実行
    report = run_quality_benchmark(
        mode=args.mode,
        model_name=args.model,
        backend_type=args.backend,
    )

    # テーブルレポート出力
    print_table_report(report)

    # JSONレポート保存
    if args.output:
        save_json_report(report, args.output)

    # CI/CDモードでの終了コード制御
    if args.ci and not report.passed:
        print(
            f"品質基準未達: {report.overall_needs_accuracy:.1%} < {QUALITY_THRESHOLD:.0%}"
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
