"""モデル管理モジュール。

vLLM / transformers バックエンドの切替、ヘルスチェック、
OOM対策、量子化モデルのロード対応を行う。
"""

import asyncio
import logging
from typing import Any

from config import ModelConfig

logger = logging.getLogger(__name__)


class ModelBackend:
    """モデル推論バックエンドの基底クラス。"""

    def __init__(self, config: ModelConfig) -> None:
        self.config = config
        self.model: Any = None
        self.tokenizer: Any = None
        self.loaded = False
        self._error: str | None = None

    def load(self) -> None:
        """モデルをロードする。"""
        raise NotImplementedError

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """テキストを生成する。"""
        raise NotImplementedError

    async def generate_async(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """非同期でテキストを生成する（デフォルトはスレッドプールで同期版を実行）。"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self.generate, messages, max_tokens, temperature
        )

    def health_check(self) -> dict[str, Any]:
        """モデルの状態を返す。"""
        if self._error:
            return {"status": "error", "error": self._error}
        if not self.loaded:
            return {"status": "loading"}
        return {"status": "ok"}

    def _format_messages(self, messages: list[dict[str, str]]) -> str:
        """メッセージリストをプロンプト文字列にフォーマットする。"""
        parts: list[str] = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                parts.append(f"システム: {content}")
            elif role == "user":
                parts.append(f"ユーザー: {content}")
            elif role == "assistant":
                parts.append(f"アシスタント: {content}")
        parts.append("アシスタント: ")
        return "\n\n".join(parts)


class VLLMBackend(ModelBackend):
    """vLLMバックエンド。AsyncLLMEngineを使用した非同期推論対応。"""

    def load(self) -> None:
        """vLLMエンジンでモデルをロードする。"""
        try:
            from vllm import LLM, SamplingParams  # noqa: F401

            kwargs: dict[str, Any] = {
                "model": self.config.model_name,
                "tensor_parallel_size": self.config.tensor_parallel_size,
                "gpu_memory_utilization": self.config.gpu_memory_utilization,
                "trust_remote_code": True,
            }

            # 量子化モデル対応
            if self.config.quantization:
                kwargs["quantization"] = self.config.quantization
                logger.info(
                    "量子化モード: %s でモデルをロードします", self.config.quantization
                )

            self.model = LLM(**kwargs)
            self.loaded = True
            logger.info("vLLMモデルロード完了: %s", self.config.model_name)

        except torch_oom_error() as e:
            self._handle_oom()
        except Exception as e:
            self._error = str(e)
            logger.error("vLLMモデルロード失敗: %s", e)
            raise

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """vLLMでテキストを生成する。"""
        from vllm import SamplingParams

        prompt = self._format_messages(messages)
        params = SamplingParams(
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=self.config.top_p,
            repetition_penalty=self.config.repetition_penalty,
        )
        outputs = self.model.generate([prompt], params)
        return outputs[0].outputs[0].text.strip()

    def _handle_oom(self) -> None:
        """OOMエラー時のフォールバック処理。"""
        logger.warning(
            "GPUメモリ不足を検出。gpu_memory_utilization を下げて再試行します"
        )
        try:
            from vllm import LLM

            reduced_util = max(0.5, self.config.gpu_memory_utilization - 0.15)
            if reduced_util >= self.config.gpu_memory_utilization:
                self._error = "OOMフォールバック失敗: gpu_memory_utilization をこれ以上削減できません"
                logger.error(self._error)
                raise RuntimeError(self._error)
            kwargs: dict[str, Any] = {
                "model": self.config.model_name,
                "tensor_parallel_size": self.config.tensor_parallel_size,
                "gpu_memory_utilization": reduced_util,
                "trust_remote_code": True,
            }
            if self.config.quantization:
                kwargs["quantization"] = self.config.quantization

            self.model = LLM(**kwargs)
            self.loaded = True
            logger.info(
                "OOMフォールバック成功: gpu_memory_utilization=%.2f", reduced_util
            )
        except Exception as e:
            self._error = f"OOMフォールバック失敗: {e}"
            logger.error(self._error)
            raise


class TransformersBackend(ModelBackend):
    """Hugging Face transformersバックエンド。"""

    def load(self) -> None:
        """transformersでモデルをロードする。"""
        try:
            import torch
            from transformers import AutoModelForCausalLM, AutoTokenizer

            self.tokenizer = AutoTokenizer.from_pretrained(
                self.config.model_name, trust_remote_code=True
            )

            model_kwargs: dict[str, Any] = {
                "torch_dtype": torch.float16,
                "device_map": self.config.device,
                "trust_remote_code": True,
            }

            # 量子化モデル対応
            if self.config.quantization == "gptq":
                from transformers import GPTQConfig

                model_kwargs["quantization_config"] = GPTQConfig(
                    bits=4, use_exllama=True
                )
                logger.info("GPTQ量子化モードでロードします")
            elif self.config.quantization == "awq":
                model_kwargs["quantization_config"] = {"quant_method": "awq"}
                logger.info("AWQ量子化モードでロードします")

            self.model = AutoModelForCausalLM.from_pretrained(
                self.config.model_name, **model_kwargs
            )
            self.loaded = True
            logger.info("transformersモデルロード完了: %s", self.config.model_name)

        except RuntimeError as e:
            if "out of memory" in str(e).lower():
                self._handle_oom()
            else:
                self._error = str(e)
                logger.error("transformersモデルロード失敗: %s", e)
                raise
        except Exception as e:
            self._error = str(e)
            logger.error("transformersモデルロード失敗: %s", e)
            raise

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """transformersでテキストを生成する。"""
        import torch

        # tokenizer の apply_chat_template を試行、なければ手動フォーマット
        if hasattr(self.tokenizer, "apply_chat_template"):
            prompt = self.tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
        else:
            prompt = self._format_messages(messages)

        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.model.device)
        with torch.no_grad():
            output_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=self.config.top_p,
                repetition_penalty=self.config.repetition_penalty,
                do_sample=temperature > 0,
            )
        # 入力部分を除いた生成テキストのみをデコード
        generated = output_ids[0][inputs["input_ids"].shape[1] :]
        return self.tokenizer.decode(generated, skip_special_tokens=True).strip()

    def _handle_oom(self) -> None:
        """OOMエラー時のフォールバック: 8bit量子化でリトライ。"""
        logger.warning("GPUメモリ不足。8bit量子化で再試行します")
        try:
            import torch
            from transformers import AutoModelForCausalLM, BitsAndBytesConfig

            quantization_config = BitsAndBytesConfig(load_in_8bit=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.config.model_name,
                quantization_config=quantization_config,
                device_map=self.config.device,
                trust_remote_code=True,
            )
            self.loaded = True
            logger.info("OOMフォールバック成功: 8bit量子化")
        except Exception as e:
            self._error = f"OOMフォールバック失敗: {e}"
            logger.error(self._error)
            raise


class MockBackend(ModelBackend):
    """モックバックエンド。モデルなしでダミー応答を返す（開発・テスト用）。"""

    # ユーザー入力に応じたダミー応答パターン
    _RESPONSES: dict[str, str] = {
        "車椅子": "車椅子での移動ですね。エレベーターやスロープが整備されたルートをご提案します。目的地はどちらですか？",
        "ベビーカー": "ベビーカーでのお出かけですね！お子さんの年齢はおいくつですか？授乳室やおむつ替えスポットも一緒にお探しします。",
        "高齢": "ご一緒される方のことを考えて、無理のないルートをお探ししますね。一度にどのくらい歩けますか？",
        "東京": "東京でしたら、東京スカイツリーはエレベーター完備で車椅子でも楽しめますよ。お台場も平坦で移動しやすいです。他に気になるエリアはありますか？",
        "京都": "京都でしたら、京都水族館は全館バリアフリーでおすすめです。京都駅からも近くて便利ですよ。どなたとお出かけですか？",
    }
    _DEFAULT_RESPONSE = "ご相談ありがとうございます！どんな移動手段をお使いですか？また、どなたかとご一緒ですか？行きたい場所や気になるエリアがあれば教えてください。"

    # ニーズ抽出用のキーワードマッピング
    _NEEDS_KEYWORDS: dict[str, dict[str, str | list[str]]] = {
        "車椅子": {"mobility_type": "wheelchair"},
        "ベビーカー": {"mobility_type": "stroller"},
        "杖": {"mobility_type": "cane"},
        "子供": {"companions": ["child"]},
        "子ども": {"companions": ["child"]},
        "高齢": {"companions": ["elderly"]},
        "母": {"companions": ["elderly"]},
        "階段": {"avoid_conditions": ["stairs"]},
        "坂": {"avoid_conditions": ["slope"]},
        "トイレ": {"prefer_conditions": ["restroom"]},
    }

    def load(self) -> None:
        """モックモードではモデルロード不要。"""
        self.loaded = True
        logger.info("モックバックエンドを起動しました（開発・テスト用）")

    def generate(
        self,
        messages: list[dict[str, str]],
        max_tokens: int,
        temperature: float,
    ) -> str:
        """ユーザー入力のキーワードに応じたダミー応答を返す。"""
        # システムプロンプトにニーズ抽出指示が含まれている場合はJSON形式で返す
        system_msg = ""
        for msg in messages:
            if msg["role"] == "system":
                system_msg = msg["content"]
                break

        if "JSON" in system_msg and ("抽出" in system_msg or "extract" in system_msg.lower()):
            return self._generate_needs_json(messages)

        # 最新のユーザーメッセージを取得
        user_msg = ""
        for msg in reversed(messages):
            if msg["role"] == "user":
                user_msg = msg["content"]
                break

        # キーワードマッチで応答選択
        for keyword, response in self._RESPONSES.items():
            if keyword in user_msg:
                return response

        return self._DEFAULT_RESPONSE

    def _generate_needs_json(self, messages: list[dict[str, str]]) -> str:
        """ニーズ抽出用のJSON応答を生成する。"""
        import json

        # 全ユーザーメッセージを結合
        all_user_text = " ".join(
            msg["content"] for msg in messages if msg["role"] == "user"
        )
        needs = self.extract_needs_from_text(all_user_text)

        # confidence 算出（検出フィールド数に応じて）
        total_fields = 5
        detected = sum(1 for v in needs.values() if v)
        confidence = min(detected / total_fields, 1.0)

        return json.dumps({
            "needs": needs,
            "confidence": round(confidence, 2),
            "missing_fields": [
                f for f in ["mobility_type", "companions", "max_distance_meters",
                           "avoid_conditions", "prefer_conditions"]
                if f not in needs
            ]
        }, ensure_ascii=False)

    def extract_needs_from_text(self, user_messages: str) -> dict:
        """テキストからダミーのニーズ抽出を行う。"""
        needs: dict = {}
        for keyword, mapping in self._NEEDS_KEYWORDS.items():
            if keyword in user_messages:
                for key, value in mapping.items():
                    if isinstance(value, list):
                        existing = needs.get(key, [])
                        needs[key] = list(set(existing + value))
                    else:
                        needs[key] = value
        return needs


def torch_oom_error() -> tuple[type[Exception], ...]:
    """torch の OOM エラー型を返す（torch未インストール時は空タプル）。"""
    try:
        import torch
        return (torch.cuda.OutOfMemoryError,)
    except (ImportError, AttributeError):
        return ()


def create_backend(config: ModelConfig) -> ModelBackend:
    """設定に基づいてバックエンドを生成する。"""
    if config.backend == "mock":
        return MockBackend(config)
    elif config.backend == "vllm":
        return VLLMBackend(config)
    elif config.backend == "transformers":
        return TransformersBackend(config)
    else:
        raise ValueError(f"未対応のバックエンド: {config.backend}")
