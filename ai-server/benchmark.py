"""モデル比較ベンチマークスクリプト。

テスト会話データを用いて複数モデルの応答品質を比較する。
評価項目: 日本語自然さ、ニーズ抽出正確性、応答速度。
"""

import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from parser import parse_json_response

# テストデータをファイルから読み込み
TEST_DATA_DIR = Path(__file__).parent / "test_data"


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


@dataclass
class BenchmarkResult:
    """個別テストケースのベンチマーク結果。"""

    model_name: str
    test_name: str
    chat_response: str = ""
    chat_latency_ms: float = 0.0
    extracted_needs: dict[str, Any] = field(default_factory=dict)
    extraction_latency_ms: float = 0.0
    needs_accuracy: float = 0.0
    is_natural_japanese: bool = True


@dataclass
class ModelBenchmark:
    """モデル全体のベンチマーク結果。"""

    model_name: str
    avg_chat_latency_ms: float = 0.0
    avg_extraction_latency_ms: float = 0.0
    avg_needs_accuracy: float = 0.0
    results: list[BenchmarkResult] = field(default_factory=list)


def calculate_needs_accuracy(
    extracted: dict[str, Any], expected: dict[str, Any]
) -> float:
    """抽出されたニーズと期待値の一致度を計算する。"""
    if not extracted or not expected:
        return 0.0

    total_fields = len(expected)
    matched = 0

    for key, expected_value in expected.items():
        actual_value = extracted.get(key)
        if actual_value is None:
            continue

        if isinstance(expected_value, list):
            # リスト型: 期待値の要素がすべて含まれているか
            if isinstance(actual_value, list):
                expected_set = set(expected_value)
                actual_set = set(actual_value)
                if expected_set.issubset(actual_set):
                    matched += 1
                else:
                    # 部分一致の割合
                    overlap = len(expected_set & actual_set)
                    matched += overlap / len(expected_set) if expected_set else 0
        elif expected_value == actual_value:
            matched += 1
        elif isinstance(expected_value, (int, float)) and isinstance(
            actual_value, (int, float)
        ):
            # 数値型: 20%以内の誤差を許容
            if abs(expected_value - actual_value) / max(abs(expected_value), 1) < 0.2:
                matched += 1

    return matched / total_fields if total_fields > 0 else 0.0


def run_benchmark(
    model_names: list[str], backend_type: str = "vllm"
) -> list[ModelBenchmark]:
    """複数モデルのベンチマークを実行する。"""
    from config import ModelConfig
    from model_manager import create_backend

    conversations = load_test_conversations()
    expected_outputs = load_expected_outputs()
    results: list[ModelBenchmark] = []

    for model_name in model_names:
        print(f"\n{'='*60}")
        print(f"モデル: {model_name}")
        print(f"{'='*60}")

        # モデルロード
        import os

        os.environ["MODEL_NAME"] = model_name
        os.environ["MODEL_BACKEND"] = backend_type
        config = ModelConfig()

        model_backend = create_backend(config)

        try:
            model_backend.load()
        except Exception as e:
            print(f"  モデルロード失敗: {e}")
            continue

        benchmark = ModelBenchmark(model_name=model_name)

        for test_case in conversations:
            test_id = test_case["id"]
            test_name = test_case["name"]
            print(f"\n  テスト: {test_name}")

            result = BenchmarkResult(
                model_name=model_name,
                test_name=test_name,
            )

            # チャット応答テスト
            from server import load_prompt

            chat_messages = [
                {"role": "system", "content": load_prompt("chat_system.txt")}
            ] + test_case["messages"]

            start = time.perf_counter()
            try:
                result.chat_response = model_backend.generate(
                    chat_messages,
                    max_tokens=512,
                    temperature=0.7,
                )
            except Exception as e:
                result.chat_response = f"エラー: {e}"
            result.chat_latency_ms = (time.perf_counter() - start) * 1000

            print(f"    チャット応答 ({result.chat_latency_ms:.0f}ms):")
            print(f"    {result.chat_response[:100]}...")

            # ニーズ抽出テスト
            extract_messages = [
                {"role": "system", "content": load_prompt("extract_needs_system.txt")}
            ] + test_case["messages"]

            start = time.perf_counter()
            try:
                raw_extraction = model_backend.generate(
                    extract_messages,
                    max_tokens=512,
                    temperature=0.1,
                )
                parsed = parse_json_response(raw_extraction)
                result.extracted_needs = parsed.get("needs", {})
            except Exception as e:
                result.extracted_needs = {}
                print(f"    抽出エラー: {e}")
            result.extraction_latency_ms = (time.perf_counter() - start) * 1000

            # 正確性を評価（期待出力がある場合）
            expected = expected_outputs.get(test_id, {})
            expected_needs = expected.get("needs", {})
            # null値を除いて比較
            filtered_expected = {
                k: v for k, v in expected_needs.items() if v is not None
            }
            result.needs_accuracy = calculate_needs_accuracy(
                result.extracted_needs, filtered_expected
            )

            print(f"    ニーズ抽出 ({result.extraction_latency_ms:.0f}ms):")
            print(
                f"    抽出結果: {json.dumps(result.extracted_needs, ensure_ascii=False)}"
            )
            print(f"    正確性: {result.needs_accuracy:.1%}")

            benchmark.results.append(result)

        # 平均値を計算
        if benchmark.results:
            benchmark.avg_chat_latency_ms = sum(
                r.chat_latency_ms for r in benchmark.results
            ) / len(benchmark.results)
            benchmark.avg_extraction_latency_ms = sum(
                r.extraction_latency_ms for r in benchmark.results
            ) / len(benchmark.results)
            benchmark.avg_needs_accuracy = sum(
                r.needs_accuracy for r in benchmark.results
            ) / len(benchmark.results)

        results.append(benchmark)

    # サマリー出力
    _print_summary(results)
    return results


def _print_summary(benchmarks: list[ModelBenchmark]) -> None:
    """ベンチマーク結果のサマリーを表示する。"""
    print(f"\n{'='*60}")
    print("ベンチマーク結果サマリー")
    print(f"{'='*60}")
    print(
        f"{'モデル名':<35} {'チャット(ms)':<12} {'抽出(ms)':<10} {'正確性':<8}"
    )
    print("-" * 65)
    for b in benchmarks:
        print(
            f"{b.model_name:<35} "
            f"{b.avg_chat_latency_ms:>10.0f} "
            f"{b.avg_extraction_latency_ms:>8.0f} "
            f"{b.avg_needs_accuracy:>6.1%}"
        )
    print()

    # 推奨モデル
    if benchmarks:
        best = max(benchmarks, key=lambda b: b.avg_needs_accuracy)
        print(
            f"推奨モデル（正確性基準）: {best.model_name} ({best.avg_needs_accuracy:.1%})"
        )
        fastest = min(benchmarks, key=lambda b: b.avg_chat_latency_ms)
        print(
            f"推奨モデル（速度基準）: {fastest.model_name} ({fastest.avg_chat_latency_ms:.0f}ms)"
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="AccessRoute AI モデルベンチマーク")
    parser.add_argument(
        "--models",
        nargs="+",
        default=[
            "cyberagent/calm3-22b-chat",
            "elyza/Llama-3-ELYZA-JP-8B",
            "rinna/llama-3-youko-8b-instruct",
        ],
        help="比較するモデル名のリスト",
    )
    parser.add_argument(
        "--backend",
        choices=["vllm", "transformers"],
        default="vllm",
        help="推論バックエンド",
    )
    args = parser.parse_args()

    run_benchmark(args.models, args.backend)
