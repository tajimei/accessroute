"""AccessRoute AI推論サーバー（軽量版）。

FastAPIベースのAIチャット・ニーズ抽出サーバー。
Hugging Face Inference API（OpenAI互換）経由でモデルを呼び出す。
GPU不要で即座に起動可能。
"""

import json
import logging
import time
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

from config import load_config
from parser import (
    determine_action,
    determine_missing_fields,
    parse_json_response,
    validate_extracted_needs,
)

logger = logging.getLogger(__name__)

# --- Pydanticモデル定義 ---


class ChatMessage(BaseModel):
    """チャットメッセージ。"""

    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class AIChatRequest(BaseModel):
    """AIチャットリクエスト。"""

    messages: list[ChatMessage]
    user_profile: dict[str, Any] | None = None
    max_tokens: int = 1024
    temperature: float = 0.7


class ExtractedNeeds(BaseModel):
    """抽出されたユーザーニーズ。"""

    mobility_type: str | None = None
    companions: list[str] | None = None
    max_distance_meters: float | None = None
    avoid_conditions: list[str] | None = None
    prefer_conditions: list[str] | None = None


class AIChatResponse(BaseModel):
    """AIチャットレスポンス。"""

    reply: str
    extracted_needs: ExtractedNeeds | None = None
    suggested_action: str | None = None
    confidence: float = 0.0


class ExtractNeedsRequest(BaseModel):
    """ニーズ抽出リクエスト。"""

    messages: list[ChatMessage]


class ExtractNeedsResponse(BaseModel):
    """ニーズ抽出レスポンス。"""

    needs: ExtractedNeeds
    confidence: float
    missing_fields: list[str]
    suggested_action: str
    action_reason: str


class HealthResponse(BaseModel):
    """ヘルスチェックレスポンス。"""

    status: str
    model: str
    uptime_seconds: float


# --- プロンプト読み込み ---

PROMPTS_DIR = Path(__file__).parent / "prompts"
_prompt_cache: dict[str, str] = {}


def load_prompt(filename: str) -> str:
    """プロンプトファイルを読み込む（キャッシュ付き）。"""
    if filename not in _prompt_cache:
        path = PROMPTS_DIR / filename
        _prompt_cache[filename] = path.read_text(encoding="utf-8")
    return _prompt_cache[filename]


# --- グローバル状態 ---

config = load_config()
start_time: float = time.time()
client = OpenAI(base_url=config.base_url, api_key=config.api_key)


# --- アプリケーション初期化 ---

app = FastAPI(
    title="AccessRoute AI推論サーバー",
    version="1.0.0",
    description="バリアフリールート・スポット提案のためのAI推論API（軽量版）",
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8081",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# --- エンドポイント ---


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """ヘルスチェックエンドポイント。"""
    return HealthResponse(
        status="ok",
        model=config.model_name,
        uptime_seconds=round(time.time() - start_time, 1),
    )


@app.post("/v1/chat")
async def chat(request: AIChatRequest) -> AIChatResponse:
    """AIチャット応答生成エンドポイント。"""
    try:
        # システムプロンプトを先頭に挿入
        system_prompt = load_prompt("chat_system.txt")
        messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]

        # ユーザープロファイルがあればコンテキストに追加
        if request.user_profile:
            profile_text = (
                f"\n\nユーザーの既知のプロファイル情報: "
                f"{json.dumps(request.user_profile, ensure_ascii=False)}"
            )
            messages[0]["content"] += profile_text

        # 会話履歴を追加（リクエスト内のsystemメッセージはスキップ）
        for msg in request.messages:
            if msg.role != "system":
                messages.append({"role": msg.role, "content": msg.content})

        # HF Inference API呼び出し
        response = client.chat.completions.create(
            model=config.model_name,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=0.8,
        )
        reply = response.choices[0].message.content

        # ニーズ抽出を同時に実行
        extracted = _try_extract_needs(request.messages)

        needs_data: dict[str, Any] | None = None
        suggested_action: str | None = None
        confidence = 0.0

        if extracted:
            raw_needs = extracted.get("needs", {})
            validated_needs = validate_extracted_needs(raw_needs)
            missing = determine_missing_fields(validated_needs)
            confidence = extracted.get("confidence", 0.0)
            msgs = [
                {"role": m.role, "content": m.content}
                for m in request.messages
                if m.role != "system"
            ]
            suggested_action, _ = determine_action(
                validated_needs, confidence, missing, msgs
            )
            needs_data = validated_needs if validated_needs else None

        return AIChatResponse(
            reply=reply,
            extracted_needs=ExtractedNeeds(**needs_data) if needs_data else None,
            suggested_action=suggested_action,
            confidence=confidence,
        )

    except Exception as e:
        logger.error("チャット応答生成に失敗: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/extract-needs", response_model=ExtractNeedsResponse)
async def extract_needs(request: ExtractNeedsRequest) -> ExtractNeedsResponse:
    """ニーズ抽出エンドポイント。"""
    try:
        result = _run_needs_extraction(request.messages)

        raw_needs = result.get("needs", {})
        validated_needs = validate_extracted_needs(raw_needs)
        confidence = result.get("confidence", 0.0)

        model_missing = result.get("missing_fields", [])
        validation_missing = determine_missing_fields(validated_needs)
        all_missing = list(set(model_missing) | set(validation_missing))

        msgs = [
            {"role": m.role, "content": m.content}
            for m in request.messages
            if m.role != "system"
        ]
        suggested_action, action_reason = determine_action(
            validated_needs, confidence, all_missing, msgs
        )

        return ExtractNeedsResponse(
            needs=ExtractedNeeds(**validated_needs),
            confidence=confidence,
            missing_fields=all_missing,
            suggested_action=suggested_action,
            action_reason=action_reason,
        )

    except Exception as e:
        logger.error("ニーズ抽出に失敗: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# --- 内部ヘルパー関数 ---


def _try_extract_needs(messages: list[ChatMessage]) -> dict[str, Any] | None:
    """チャット応答時にニーズ抽出を試行する（失敗時はNone）。"""
    try:
        return _run_needs_extraction(messages)
    except Exception:
        logger.warning("ニーズ抽出に失敗しました", exc_info=True)
        return None


def _run_needs_extraction(messages: list[ChatMessage]) -> dict[str, Any]:
    """ニーズ抽出を実行する。"""
    system_prompt = load_prompt("extract_needs_system.txt")
    extraction_messages: list[dict[str, str]] = [
        {"role": "system", "content": system_prompt}
    ]

    for msg in messages:
        if msg.role != "system":
            extraction_messages.append({"role": msg.role, "content": msg.content})

    response = client.chat.completions.create(
        model=config.model_name,
        messages=extraction_messages,
        max_tokens=512,
        temperature=0.1,
    )

    raw = response.choices[0].message.content
    return parse_json_response(raw)


# --- メインエントリポイント ---

if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host=config.host,
        port=config.port,
        reload=True,
    )
