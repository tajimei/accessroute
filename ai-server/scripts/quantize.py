"""モデル量子化スクリプト。

GPTQ / AWQ 量子化を実行し、量子化前後のベンチマーク比較を行う。
auto-gptq / autoawq を使用して指定モデルを量子化し、
品質・速度・メモリ使用量を比較する。
"""

import argparse
import gc
import json
import logging
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ベンチマーク用テストプロンプト
BENCHMARK_PROMPTS = [
    "車椅子で東京駅周辺を観光したいです。おすすめのルートを教えてください。",
    "ベビーカーで京都を回りたいです。階段は避けたいのですが、おすすめの場所はありますか？",
    "杖をついています。500メートルくらいが限界なのですが、大阪で楽しめる場所はありますか？",
]


@dataclass
class BenchmarkMetrics:
    """ベンチマーク結果。"""

    model_name: str
    quantization: str  # "none", "gptq", "awq"
    model_size_mb: float = 0.0
    gpu_memory_mb: float = 0.0
    avg_latency_ms: float = 0.0
    avg_tokens_per_sec: float = 0.0
    sample_outputs: list[str] = field(default_factory=list)


def get_gpu_memory_mb() -> float:
    """現在のGPUメモリ使用量を取得する（MB）。"""
    if torch.cuda.is_available():
        return torch.cuda.memory_allocated() / 1024 / 1024
    return 0.0


def get_model_size_mb(model_path: str) -> float:
    """モデルディレクトリのサイズを取得する（MB）。"""
    path = Path(model_path)
    if not path.exists():
        return 0.0
    total = sum(f.stat().st_size for f in path.rglob("*") if f.is_file())
    return total / 1024 / 1024


def clear_gpu_memory() -> None:
    """GPUメモリを解放する。"""
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        torch.cuda.synchronize()


# --- GPTQ量子化 ---


def run_gptq_quantization(
    model_name: str,
    output_dir: str,
    bits: int = 4,
    group_size: int = 128,
    dataset_name: str = "c4",
    num_samples: int = 128,
) -> str:
    """GPTQ量子化を実行する。

    Args:
        model_name: 元モデルのHugging Face名またはパス
        output_dir: 量子化モデルの保存先
        bits: 量子化ビット数（デフォルト: 4）
        group_size: グループサイズ（デフォルト: 128）
        dataset_name: キャリブレーションデータセット
        num_samples: キャリブレーションサンプル数

    Returns:
        量子化モデルの保存パス
    """
    from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig

    logger.info("GPTQ量子化開始: %s (bits=%d, group_size=%d)", model_name, bits, group_size)

    # 量子化設定
    quantize_config = BaseQuantizeConfig(
        bits=bits,
        group_size=group_size,
        desc_act=False,
    )

    # トークナイザーをロード
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    # モデルをロード
    logger.info("元モデルをロード中...")
    model = AutoGPTQForCausalLM.from_pretrained(
        model_name,
        quantize_config=quantize_config,
        trust_remote_code=True,
    )

    # キャリブレーションデータの準備
    logger.info("キャリブレーションデータを準備中 (dataset=%s, samples=%d)...", dataset_name, num_samples)
    calibration_data = _prepare_calibration_data(tokenizer, dataset_name, num_samples)

    # 量子化実行
    logger.info("量子化を実行中...")
    start_time = time.time()
    model.quantize(calibration_data)
    elapsed = time.time() - start_time
    logger.info("量子化完了 (%.1f秒)", elapsed)

    # 保存
    save_path = os.path.join(output_dir, f"{Path(model_name).name}-GPTQ-{bits}bit")
    os.makedirs(save_path, exist_ok=True)
    model.save_quantized(save_path)
    tokenizer.save_pretrained(save_path)
    logger.info("量子化モデルを保存しました: %s", save_path)

    return save_path


# --- AWQ量子化 ---


def run_awq_quantization(
    model_name: str,
    output_dir: str,
    bits: int = 4,
    group_size: int = 128,
    zero_point: bool = True,
) -> str:
    """AWQ量子化を実行する。

    Args:
        model_name: 元モデルのHugging Face名またはパス
        output_dir: 量子化モデルの保存先
        bits: 量子化ビット数（デフォルト: 4）
        group_size: グループサイズ（デフォルト: 128）
        zero_point: ゼロポイント量子化を使用するか

    Returns:
        量子化モデルの保存パス
    """
    from awq import AutoAWQForCausalLM

    logger.info("AWQ量子化開始: %s (bits=%d, group_size=%d)", model_name, bits, group_size)

    # 量子化設定
    quant_config = {
        "zero_point": zero_point,
        "q_group_size": group_size,
        "w_bit": bits,
        "version": "GEMM",
    }

    # トークナイザーをロード
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    # モデルをロード
    logger.info("元モデルをロード中...")
    model = AutoAWQForCausalLM.from_pretrained(
        model_name,
        trust_remote_code=True,
    )

    # 量子化実行
    logger.info("量子化を実行中...")
    start_time = time.time()
    model.quantize(tokenizer, quant_config=quant_config)
    elapsed = time.time() - start_time
    logger.info("量子化完了 (%.1f秒)", elapsed)

    # 保存
    save_path = os.path.join(output_dir, f"{Path(model_name).name}-AWQ-{bits}bit")
    os.makedirs(save_path, exist_ok=True)
    model.save_quantized(save_path)
    tokenizer.save_pretrained(save_path)
    logger.info("量子化モデルを保存しました: %s", save_path)

    return save_path


# --- キャリブレーションデータ ---


def _prepare_calibration_data(
    tokenizer: Any,
    dataset_name: str,
    num_samples: int,
) -> list[dict[str, Any]]:
    """キャリブレーション用データを準備する。"""
    try:
        from datasets import load_dataset

        dataset = load_dataset(dataset_name, split=f"train[:{num_samples}]")
        text_key = "text" if "text" in dataset.column_names else dataset.column_names[0]
        examples = []
        for sample in dataset:
            text = sample[text_key]
            tokenized = tokenizer(text, return_tensors="pt", truncation=True, max_length=2048)
            examples.append(tokenized)
        return examples
    except Exception as e:
        logger.warning("データセット '%s' の読み込みに失敗。日本語テキストで代替します: %s", dataset_name, e)
        # フォールバック: 組み込みのテキストを使用
        fallback_texts = BENCHMARK_PROMPTS * (num_samples // len(BENCHMARK_PROMPTS) + 1)
        examples = []
        for text in fallback_texts[:num_samples]:
            tokenized = tokenizer(text, return_tensors="pt", truncation=True, max_length=2048)
            examples.append(tokenized)
        return examples


# --- ベンチマーク ---


def run_benchmark(
    model_name: str,
    quantization: str = "none",
    max_new_tokens: int = 128,
) -> BenchmarkMetrics:
    """モデルのベンチマークを実行する。

    Args:
        model_name: モデル名またはパス
        quantization: 量子化方式 ("none", "gptq", "awq")
        max_new_tokens: 生成トークン数

    Returns:
        ベンチマーク結果
    """
    metrics = BenchmarkMetrics(
        model_name=model_name,
        quantization=quantization,
    )

    logger.info("ベンチマーク開始: %s (quantization=%s)", model_name, quantization)

    clear_gpu_memory()

    # モデルロード
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

    load_kwargs: dict[str, Any] = {
        "trust_remote_code": True,
        "device_map": "auto",
    }

    if quantization == "gptq":
        from auto_gptq import AutoGPTQForCausalLM
        model = AutoGPTQForCausalLM.from_quantized(
            model_name,
            device_map="auto",
            trust_remote_code=True,
        )
    elif quantization == "awq":
        from awq import AutoAWQForCausalLM
        model = AutoAWQForCausalLM.from_quantized(
            model_name,
            fuse_layers=True,
            trust_remote_code=True,
        )
    else:
        load_kwargs["torch_dtype"] = torch.float16
        model = AutoModelForCausalLM.from_pretrained(model_name, **load_kwargs)

    # GPUメモリ使用量を記録
    metrics.gpu_memory_mb = get_gpu_memory_mb()
    metrics.model_size_mb = get_model_size_mb(model_name)

    logger.info("GPUメモリ使用量: %.1f MB", metrics.gpu_memory_mb)

    # 推論ベンチマーク
    latencies: list[float] = []
    tokens_per_sec_list: list[float] = []

    for prompt in BENCHMARK_PROMPTS:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device if hasattr(model, "device") else "cuda")

        # ウォームアップ
        with torch.no_grad():
            _ = model.generate(**inputs, max_new_tokens=10)

        # 計測
        torch.cuda.synchronize()
        start = time.perf_counter()
        with torch.no_grad():
            output_ids = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
            )
        torch.cuda.synchronize()
        elapsed_ms = (time.perf_counter() - start) * 1000

        # 生成トークン数を計算
        generated_tokens = output_ids.shape[1] - inputs["input_ids"].shape[1]
        tps = generated_tokens / (elapsed_ms / 1000) if elapsed_ms > 0 else 0

        latencies.append(elapsed_ms)
        tokens_per_sec_list.append(tps)

        # 出力テキストを記録
        generated = output_ids[0][inputs["input_ids"].shape[1]:]
        output_text = tokenizer.decode(generated, skip_special_tokens=True)
        metrics.sample_outputs.append(output_text[:200])

        logger.info("  プロンプト: %s...", prompt[:30])
        logger.info("  レイテンシ: %.0fms, %.1f tokens/s", elapsed_ms, tps)

    metrics.avg_latency_ms = sum(latencies) / len(latencies) if latencies else 0
    metrics.avg_tokens_per_sec = sum(tokens_per_sec_list) / len(tokens_per_sec_list) if tokens_per_sec_list else 0

    # メモリ解放
    del model
    del tokenizer
    clear_gpu_memory()

    return metrics


def compare_benchmarks(results: list[BenchmarkMetrics]) -> None:
    """ベンチマーク結果を比較表示する。"""
    print(f"\n{'=' * 80}")
    print("量子化ベンチマーク比較結果")
    print(f"{'=' * 80}")
    print(
        f"{'モデル':<40} {'量子化':<8} {'GPUメモリ(MB)':>14} "
        f"{'レイテンシ(ms)':>14} {'tokens/s':>10}"
    )
    print("-" * 90)
    for m in results:
        name = Path(m.model_name).name if "/" in m.model_name else m.model_name
        print(
            f"{name:<40} {m.quantization:<8} "
            f"{m.gpu_memory_mb:>13.0f} "
            f"{m.avg_latency_ms:>13.0f} "
            f"{m.avg_tokens_per_sec:>9.1f}"
        )

    # 元モデルとの比較
    if len(results) >= 2:
        base = results[0]
        print(f"\n--- 元モデル比較 (ベースライン: {Path(base.model_name).name}) ---")
        for m in results[1:]:
            mem_ratio = (m.gpu_memory_mb / base.gpu_memory_mb * 100) if base.gpu_memory_mb > 0 else 0
            speed_ratio = (m.avg_tokens_per_sec / base.avg_tokens_per_sec * 100) if base.avg_tokens_per_sec > 0 else 0
            print(f"  {m.quantization}: メモリ {mem_ratio:.0f}% / 速度 {speed_ratio:.0f}%")

    print()

    # サンプル出力の比較
    print("--- サンプル出力比較 ---")
    for i, prompt in enumerate(BENCHMARK_PROMPTS):
        print(f"\nプロンプト: {prompt[:50]}...")
        for m in results:
            name = Path(m.model_name).name if "/" in m.model_name else m.model_name
            output = m.sample_outputs[i] if i < len(m.sample_outputs) else "(なし)"
            print(f"  [{m.quantization}] {output[:100]}...")


# --- メインエントリポイント ---


def main() -> None:
    """メイン関数。"""
    parser = argparse.ArgumentParser(
        description="AccessRoute AI モデル量子化スクリプト"
    )
    subparsers = parser.add_subparsers(dest="command", help="実行するコマンド")

    # 量子化コマンド
    quant_parser = subparsers.add_parser("quantize", help="モデルを量子化する")
    quant_parser.add_argument(
        "--model", type=str, required=True,
        help="量子化するモデル名（例: cyberagent/calm3-22b-chat）",
    )
    quant_parser.add_argument(
        "--method", type=str, choices=["gptq", "awq"], required=True,
        help="量子化方式（gptq または awq）",
    )
    quant_parser.add_argument(
        "--output-dir", type=str, default="./quantized_models",
        help="量子化モデルの出力先ディレクトリ（デフォルト: ./quantized_models）",
    )
    quant_parser.add_argument(
        "--bits", type=int, default=4,
        help="量子化ビット数（デフォルト: 4）",
    )
    quant_parser.add_argument(
        "--group-size", type=int, default=128,
        help="グループサイズ（デフォルト: 128）",
    )
    quant_parser.add_argument(
        "--num-samples", type=int, default=128,
        help="キャリブレーションサンプル数（デフォルト: 128、GPTQのみ）",
    )

    # ベンチマークコマンド
    bench_parser = subparsers.add_parser("benchmark", help="量子化前後のベンチマークを実行する")
    bench_parser.add_argument(
        "--model", type=str, required=True,
        help="元モデル名",
    )
    bench_parser.add_argument(
        "--quantized-models", type=str, nargs="*", default=[],
        help="量子化済みモデルのパス（複数指定可）",
    )
    bench_parser.add_argument(
        "--quantization-types", type=str, nargs="*", default=[],
        help="各量子化モデルの方式（gptq, awq、--quantized-modelsと同じ順序）",
    )
    bench_parser.add_argument(
        "--max-tokens", type=int, default=128,
        help="生成トークン数（デフォルト: 128）",
    )
    bench_parser.add_argument(
        "--output", type=str, default=None,
        help="結果をJSONファイルに出力するパス",
    )

    args = parser.parse_args()

    if args.command == "quantize":
        os.makedirs(args.output_dir, exist_ok=True)

        if args.method == "gptq":
            result_path = run_gptq_quantization(
                model_name=args.model,
                output_dir=args.output_dir,
                bits=args.bits,
                group_size=args.group_size,
                num_samples=args.num_samples,
            )
        else:
            result_path = run_awq_quantization(
                model_name=args.model,
                output_dir=args.output_dir,
                bits=args.bits,
                group_size=args.group_size,
            )

        print(f"\n量子化完了: {result_path}")

    elif args.command == "benchmark":
        results: list[BenchmarkMetrics] = []

        # 元モデルのベンチマーク
        base_result = run_benchmark(args.model, "none", args.max_tokens)
        results.append(base_result)

        # 量子化モデルのベンチマーク
        for model_path, quant_type in zip(args.quantized_models, args.quantization_types):
            quant_result = run_benchmark(model_path, quant_type, args.max_tokens)
            results.append(quant_result)

        # 比較表示
        compare_benchmarks(results)

        # JSON出力
        if args.output:
            output_data = []
            for m in results:
                output_data.append({
                    "model_name": m.model_name,
                    "quantization": m.quantization,
                    "model_size_mb": round(m.model_size_mb, 1),
                    "gpu_memory_mb": round(m.gpu_memory_mb, 1),
                    "avg_latency_ms": round(m.avg_latency_ms, 1),
                    "avg_tokens_per_sec": round(m.avg_tokens_per_sec, 1),
                    "sample_outputs": m.sample_outputs,
                })
            with open(args.output, "w", encoding="utf-8") as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
            print(f"結果をJSONに保存しました: {args.output}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
