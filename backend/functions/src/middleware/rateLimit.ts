// レート制限ミドルウェア（IPベース、エンドポイント別制限）

import { Request, Response, NextFunction } from "express";

// レート制限の設定型
interface RateLimitConfig {
  // ウィンドウサイズ（ミリ秒）
  windowMs: number;
  // ウィンドウ内の最大リクエスト数
  maxRequests: number;
  // レート制限超過時のレスポンスメッセージ
  message: string;
}

// IPごとのリクエスト記録
interface RequestRecord {
  count: number;
  resetAt: number;
}

// メモリ内ストア（Cloud Functions のインスタンスごと）
const stores = new Map<string, Map<string, RequestRecord>>();

// デフォルトのレート制限設定
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分
  maxRequests: 60,
  message: "リクエスト数が制限を超えました。しばらくしてからお試しください。",
};

// エンドポイント別のレート制限設定
const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  "/api/chat": {
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: "チャットリクエスト数が制限を超えました。しばらくしてからお試しください。",
  },
  "/api/extract-needs": {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: "ニーズ抽出リクエスト数が制限を超えました。しばらくしてからお試しください。",
  },
  "/api/route/search": {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "ルート検索リクエスト数が制限を超えました。しばらくしてからお試しください。",
  },
  "/api/spots/nearby": {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "スポット検索リクエスト数が制限を超えました。しばらくしてからお試しください。",
  },
  "/api/auth/profile": {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: "プロファイルリクエスト数が制限を超えました。しばらくしてからお試しください。",
  },
};

/**
 * リクエストからクライアントIPを取得する
 * Cloud Functions では x-forwarded-for ヘッダーを使用
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.ip ?? "unknown";
};

/**
 * エンドポイントパスに対応するレート制限設定を取得する
 */
const getConfigForPath = (path: string): RateLimitConfig => {
  // 完全一致を優先
  if (ENDPOINT_CONFIGS[path]) {
    return ENDPOINT_CONFIGS[path];
  }

  // プレフィックスマッチ
  for (const [endpoint, config] of Object.entries(ENDPOINT_CONFIGS)) {
    if (path.startsWith(endpoint)) {
      return config;
    }
  }

  return DEFAULT_CONFIG;
};

/**
 * 期限切れのレコードをクリーンアップする
 */
const cleanupExpiredRecords = (store: Map<string, RequestRecord>): void => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now >= record.resetAt) {
      store.delete(key);
    }
  }
};

/**
 * レート制限ミドルウェアを作成する
 * IPアドレスとエンドポイントの組み合わせでリクエスト数を制限
 */
export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientIp = getClientIp(req);
  const path = req.path;
  const config = getConfigForPath(path);

  // ストアキー: エンドポイントパスごとにストアを分離
  const storeKey = path;
  if (!stores.has(storeKey)) {
    stores.set(storeKey, new Map());
  }
  const store = stores.get(storeKey)!;

  // 定期的にクリーンアップ（100リクエストごと）
  if (store.size > 100) {
    cleanupExpiredRecords(store);
  }

  const now = Date.now();
  const record = store.get(clientIp);

  if (!record || now >= record.resetAt) {
    // 新しいウィンドウを開始
    store.set(clientIp, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    next();
    return;
  }

  // 既存ウィンドウ内のリクエスト
  record.count++;

  if (record.count > config.maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: config.message,
      retryAfter: retryAfterSeconds,
    });
    return;
  }

  next();
};
