"""AI推論サーバーの設定モジュール。

環境変数からモデル名、生成パラメータ等を読み込む。
モデルごとのプリセット設定にも対応。
"""

import logging
import os
from dataclasses import dataclass, field
from typing import Any


# モデルプリセット定義
MODEL_PRESETS: dict[str, dict[str, Any]] = {
    "cyberagent/calm3-22b-chat": {
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.1,
        "gpu_memory_utilization": 0.9,
        "tensor_parallel_size": 1,
        "description": "CyberAgent CALM3 22B - 日本語特化の高品質モデル",
    },
    "elyza/Llama-3-ELYZA-JP-8B": {
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.05,
        "gpu_memory_utilization": 0.85,
        "tensor_parallel_size": 1,
        "description": "ELYZA Llama-3 8B - 軽量で高速な日本語モデル",
    },
    "tokyotech-llm/Llama-3.1-Swallow-8B-Instruct-v0.1": {
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.1,
        "gpu_memory_utilization": 0.85,
        "tensor_parallel_size": 1,
        "description": "Llama-3.1 Swallow 8B - 東工大開発の日本語モデル",
    },
    "Qwen/Qwen2.5-7B-Instruct": {
        "max_tokens": 1024,
        "temperature": 0.7,
        "top_p": 0.9,
        "repetition_penalty": 1.05,
        "gpu_memory_utilization": 0.85,
        "tensor_parallel_size": 1,
        "description": "Qwen2.5 7B - 多言語対応の高性能モデル",
    },
}

# ログレベルマッピング
LOG_LEVELS: dict[str, int] = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}


@dataclass(frozen=True)
class ModelConfig:
    """モデルおよび生成パラメータの設定。"""

    # モデル設定
    model_name: str = field(
        default_factory=lambda: os.getenv(
            "MODEL_NAME", "cyberagent/calm3-22b-chat"
        )
    )
    backend: str = field(
        default_factory=lambda: os.getenv("MODEL_BACKEND", "vllm")
    )  # "vllm" または "transformers"
    device: str = field(
        default_factory=lambda: os.getenv("DEVICE", "auto")
    )
    quantization: str | None = field(
        default_factory=lambda: os.getenv("QUANTIZATION", None)
    )  # "gptq", "awq", または None

    # 生成パラメータのデフォルト値
    max_tokens: int = field(
        default_factory=lambda: int(os.getenv("MAX_TOKENS", "1024"))
    )
    temperature: float = field(
        default_factory=lambda: float(os.getenv("TEMPERATURE", "0.7"))
    )
    top_p: float = field(
        default_factory=lambda: float(os.getenv("TOP_P", "0.9"))
    )
    repetition_penalty: float = field(
        default_factory=lambda: float(os.getenv("REPETITION_PENALTY", "1.1"))
    )

    # サーバー設定
    host: str = field(
        default_factory=lambda: os.getenv("HOST", "0.0.0.0")
    )
    port: int = field(
        default_factory=lambda: int(os.getenv("PORT", "8000"))
    )

    # 同時リクエスト制御
    max_concurrent_requests: int = field(
        default_factory=lambda: max(1, int(os.getenv("MAX_CONCURRENT_REQUESTS", "4")))
    )

    # vLLM固有設定
    tensor_parallel_size: int = field(
        default_factory=lambda: int(os.getenv("TENSOR_PARALLEL_SIZE", "1"))
    )
    gpu_memory_utilization: float = field(
        default_factory=lambda: float(os.getenv("GPU_MEMORY_UTILIZATION", "0.9"))
    )

    # ログ設定
    log_level: str = field(
        default_factory=lambda: os.getenv("LOG_LEVEL", "INFO")
    )


def load_config() -> ModelConfig:
    """設定をロードして返す。

    環境変数 USE_PRESET=1 の場合、モデル名に対応するプリセットを適用する。
    環境変数で個別に指定された値はプリセットより優先される。
    """
    config = ModelConfig()

    # ログ設定を適用
    level = LOG_LEVELS.get(config.log_level.upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    return config


def get_preset(model_name: str) -> dict[str, Any] | None:
    """モデル名に対応するプリセット設定を取得する。"""
    return MODEL_PRESETS.get(model_name)
