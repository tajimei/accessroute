"""AccessRoute AI推論サーバー。

FastAPIベースのAIチャット・ニーズ抽出サーバー。
vLLM または transformers バックエンドでモデルをロードし推論を行う。
SSEストリーミング、同時リクエスト制御、グレースフルシャットダウンに対応。
"""

import asyncio
import json
import logging
import re
import signal
import time
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, AsyncGenerator

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel, Field

from config import ModelConfig, load_config
from model_manager import ModelBackend, create_backend
from monitor import ResourceMonitor, get_monitor
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
    stream: bool = False


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

config: ModelConfig = load_config()
start_time: float = time.time()
backend: ModelBackend | None = None
request_semaphore: asyncio.Semaphore = asyncio.Semaphore(4)
_shutdown_event: asyncio.Event = asyncio.Event()
monitor: ResourceMonitor = get_monitor()


# --- ライフサイクル管理 ---


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """アプリケーションのライフサイクル管理。起動時にモデルロード、終了時にクリーンアップ。"""
    global backend, config, start_time, request_semaphore, _shutdown_event

    config = load_config()
    start_time = time.time()
    request_semaphore = asyncio.Semaphore(config.max_concurrent_requests)
    _shutdown_event = asyncio.Event()

    # モニタリング開始
    monitor = get_monitor()
    monitor.start()

    # シグナルハンドラ登録（グレースフルシャットダウン）
    loop = asyncio.get_event_loop()
    for sig in (signal.SIGTERM, signal.SIGINT):
        try:
            loop.add_signal_handler(sig, _handle_shutdown_signal)
        except NotImplementedError:
            # Windows ではシグナルハンドラが使えない場合がある
            pass

    # モデルロード
    backend = create_backend(config)
    try:
        backend.load()
        logger.info("モデルロード完了: %s (backend=%s)", config.model_name, config.backend)
    except Exception as e:
        logger.error("モデルロード失敗: %s", e)
        backend.loaded = False

    yield

    # クリーンアップ
    logger.info("サーバーシャットダウン中...")
    monitor.stop()
    _shutdown_event.set()
    backend = None


def _handle_shutdown_signal() -> None:
    """シャットダウンシグナルを受け取り、グレースフルにシャットダウンする。"""
    logger.info("シャットダウンシグナルを受信しました")
    _shutdown_event.set()


# --- アプリケーション初期化 ---

app = FastAPI(
    title="AccessRoute AI推論サーバー",
    version="1.0.0",
    description="バリアフリールート・スポット提案のためのAI推論API",
    lifespan=lifespan,
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def get_backend() -> ModelBackend:
    """ロード済みバックエンドを取得する。"""
    if backend is None or not backend.loaded:
        raise HTTPException(status_code=503, detail="モデルがロードされていません")
    return backend


# --- リクエストログミドルウェア ---


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next: Any) -> Any:
    """リクエストログ: リクエストID、処理時間、エンドポイントを記録する。"""
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    start = time.perf_counter()

    response = await call_next(request)

    duration_ms = (time.perf_counter() - start) * 1000
    endpoint = request.url.path

    logger.info(
        "[%s] %s %s -> %d (%.1fms)",
        request_id,
        request.method,
        endpoint,
        response.status_code,
        duration_ms,
    )

    # モニターにリクエストを記録
    is_error = response.status_code >= 400
    monitor.record_request(endpoint, duration_ms, is_error)

    # レスポンスヘッダにリクエストIDを付与
    response.headers["X-Request-ID"] = request_id
    return response


# --- エンドポイント ---


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """ヘルスチェックエンドポイント。"""
    if backend is None:
        status = "loading"
    else:
        health_info = backend.health_check()
        status = health_info["status"]

    return HealthResponse(
        status=status,
        model=config.model_name,
        uptime_seconds=round(time.time() - start_time, 1),
    )


@app.get("/metrics")
async def metrics() -> PlainTextResponse:
    """Prometheusメトリクスエンドポイント。"""
    return PlainTextResponse(
        content=monitor.get_prometheus_metrics(),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


@app.post("/v1/chat")
async def chat(request: AIChatRequest, raw_request: Request) -> Any:
    """AIチャット応答生成エンドポイント。ストリーミング対応。"""
    model = get_backend()

    async with request_semaphore:
        # システムプロンプトを先頭に挿入
        system_prompt = load_prompt("chat_system.txt")
        messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]

        # ユーザープロファイルがあればコンテキストに追加
        if request.user_profile:
            sanitized_profile = _sanitize_profile(request.user_profile)
            profile_text = (
                f"\n\nユーザーの既知のプロファイル情報: "
                f"{json.dumps(sanitized_profile, ensure_ascii=False)}"
            )
            messages[0]["content"] += profile_text

        # 会話履歴を追加（リクエスト内のsystemメッセージはスキップ）
        for msg in request.messages:
            if msg.role != "system":
                messages.append({"role": msg.role, "content": msg.content})

        if request.stream:
            return StreamingResponse(
                _stream_chat_response(model, messages, request),
                media_type="text/event-stream",
            )

        # 非ストリーミング: 通常のJSON応答
        reply = await model.generate_async(
            messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )

        # ニーズ抽出を同時に実行
        extracted = await _try_extract_needs_async(model, request.messages)

        # バリデーションとアクション判定
        needs_data: dict[str, Any] | None = None
        suggested_action: str | None = None
        confidence = 0.0

        if extracted:
            raw_needs = extracted.get("needs", {})
            validated_needs = validate_extracted_needs(raw_needs)
            missing = determine_missing_fields(validated_needs)
            confidence = extracted.get("confidence", 0.0)
            # 会話履歴をdictリストに変換して渡す
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


async def _stream_chat_response(
    model: ModelBackend,
    messages: list[dict[str, str]],
    request: AIChatRequest,
) -> AsyncGenerator[str, None]:
    """SSE形式でチャット応答をストリーミングする。"""
    try:
        # 現時点では全文生成してからチャンク分割で送信
        reply = await model.generate_async(
            messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
        )

        # テキストをチャンクに分割して送信
        chunk_size = 20  # 文字数
        for i in range(0, len(reply), chunk_size):
            chunk = reply[i : i + chunk_size]
            event_data = json.dumps(
                {"type": "chunk", "content": chunk}, ensure_ascii=False
            )
            yield f"data: {event_data}\n\n"
            await asyncio.sleep(0.05)  # クライアントの処理時間を考慮

        # ニーズ抽出
        extracted = await _try_extract_needs_async(model, request.messages)

        needs_data: dict[str, Any] | None = None
        suggested_action: str | None = None
        action_reason: str | None = None
        confidence = 0.0

        if extracted:
            raw_needs = extracted.get("needs", {})
            validated_needs = validate_extracted_needs(raw_needs)
            missing = determine_missing_fields(validated_needs)
            confidence = extracted.get("confidence", 0.0)
            # 会話履歴をdictリストに変換して渡す
            msgs = [
                {"role": m.role, "content": m.content}
                for m in request.messages
                if m.role != "system"
            ]
            suggested_action, action_reason = determine_action(
                validated_needs, confidence, missing, msgs
            )
            needs_data = validated_needs if validated_needs else None

        # 完了イベントを送信
        done_data = json.dumps(
            {
                "type": "done",
                "reply": reply,
                "extracted_needs": needs_data,
                "suggested_action": suggested_action,
                "action_reason": action_reason,
                "confidence": confidence,
            },
            ensure_ascii=False,
        )
        yield f"data: {done_data}\n\n"

    except Exception as e:
        error_data = json.dumps(
            {"type": "error", "message": str(e)}, ensure_ascii=False
        )
        yield f"data: {error_data}\n\n"


@app.post("/v1/extract-needs", response_model=ExtractNeedsResponse)
async def extract_needs(request: ExtractNeedsRequest) -> ExtractNeedsResponse:
    """ニーズ抽出エンドポイント。"""
    model = get_backend()

    async with request_semaphore:
        result = await _run_needs_extraction_async(model, request.messages)

        raw_needs = result.get("needs", {})
        validated_needs = validate_extracted_needs(raw_needs)
        confidence = result.get("confidence", 0.0)

        # missing_fields: モデル出力 + バリデーション後の不足フィールドをマージ
        model_missing = result.get("missing_fields", [])
        validation_missing = determine_missing_fields(validated_needs)
        all_missing = list(set(model_missing) | set(validation_missing))

        # 会話履歴をdictリストに変換してアクション判定に渡す
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


# --- 内部ヘルパー関数 ---


def _sanitize_profile(profile: dict[str, Any]) -> dict[str, Any]:
    """プロファイル辞書内の文字列値から改行・制御文字を除去する。"""
    sanitized: dict[str, Any] = {}
    for key, value in profile.items():
        if isinstance(value, str):
            sanitized[key] = re.sub(r"[\x00-\x1f\x7f]", "", value)
        elif isinstance(value, dict):
            sanitized[key] = _sanitize_profile(value)
        elif isinstance(value, list):
            sanitized[key] = [
                re.sub(r"[\x00-\x1f\x7f]", "", v) if isinstance(v, str) else v
                for v in value
            ]
        else:
            sanitized[key] = value
    return sanitized


async def _try_extract_needs_async(
    model: ModelBackend, messages: list[ChatMessage]
) -> dict[str, Any] | None:
    """チャット応答時にニーズ抽出を非同期で試行する（失敗時はNone）。"""
    try:
        return await _run_needs_extraction_async(model, messages)
    except Exception:
        logger.warning("ニーズ抽出に失敗しました", exc_info=True)
        return None


async def _run_needs_extraction_async(
    model: ModelBackend, messages: list[ChatMessage]
) -> dict[str, Any]:
    """ニーズ抽出を非同期で実行する。"""
    system_prompt = load_prompt("extract_needs_system.txt")
    extraction_messages: list[dict[str, str]] = [
        {"role": "system", "content": system_prompt}
    ]

    # 会話履歴を追加
    for msg in messages:
        if msg.role != "system":
            extraction_messages.append({"role": msg.role, "content": msg.content})

    raw = await model.generate_async(
        extraction_messages,
        max_tokens=512,
        temperature=0.1,  # 構造化出力のため低温度
    )

    # JSON部分を抽出してパース
    return parse_json_response(raw)


# --- メインエントリポイント ---

if __name__ == "__main__":
    _config = load_config()
    uvicorn.run(
        "server:app",
        host=_config.host,
        port=_config.port,
        reload=False,
    )
