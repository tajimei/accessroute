// Cloud Functions エントリポイント

import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import express from "express";
import cors from "cors";

import { verifyAuth } from "./middleware/auth";
import { rateLimiter } from "./middleware/rateLimit";
import { sanitizeInput, securityHeaders, getCorsOptions } from "./middleware/security";
import { getEnvironmentConfig } from "./config/environments";
import authRouter from "./routes/auth";
import routeRouter from "./routes/route";
import spotsRouter from "./routes/spots";
import chatRouter from "./routes/chat";
import geocodeRouter from "./routes/geocode";
import { deleteExpiredConversations } from "./services/conversation";

// Firebase Admin 初期化
admin.initializeApp();

// 環境設定の取得
const envConfig = getEnvironmentConfig();

// Express アプリ作成
const app = express();

// セキュリティミドルウェア（最初に適用）
app.use(securityHeaders);

// CORS設定（本番用は許可オリジンを明示的に指定）
if (envConfig.environment === "development") {
  app.use(cors({ origin: true }));
} else {
  app.use(cors(getCorsOptions()));
}

// リクエストボディのパース
app.use(express.json({ limit: "1mb" }));

// 入力サニタイズ（XSS対策）
app.use(sanitizeInput);

// レート制限
app.use(rateLimiter);

// 構造化ログ出力（Cloud Logging対応）
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logEntry = {
      severity: res.statusCode >= 500 ? "ERROR" : res.statusCode >= 400 ? "WARNING" : "INFO",
      message: `${req.method} ${req.path} ${res.statusCode}`,
      httpRequest: {
        requestMethod: req.method,
        requestUrl: req.originalUrl,
        status: res.statusCode,
        latency: `${duration / 1000}s`,
        remoteIp: req.headers["x-forwarded-for"] ?? req.ip,
        userAgent: req.headers["user-agent"],
      },
    };
    if (envConfig.logLevel === "debug" || res.statusCode >= 400) {
      console.log(JSON.stringify(logEntry));
    }
  });
  next();
});

// 認証ミドルウェアを全APIルートに適用
app.use("/api", verifyAuth);

// ルーティング
app.use("/api/auth", authRouter);
app.use("/api/route", routeRouter);
app.use("/api/spots", spotsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/geocode", geocodeRouter);
// /api/extract-needs は chat ルーター内で処理
app.use("/api", chatRouter);

// ヘルスチェックエンドポイント（認証不要）
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Cloud Functions v2 としてエクスポート（メモリ・タイムアウト・最小インスタンス設定）
export const api = onRequest(
  {
    memory: `${envConfig.memoryMb}MiB` as "256MiB" | "512MiB",
    timeoutSeconds: envConfig.timeoutSeconds,
    minInstances: envConfig.minInstances,
    maxInstances: envConfig.maxInstances,
    region: "asia-northeast1",
  },
  app
);

// 期限切れ会話の定期削除（毎日午前3時 JST）
export const cleanupExpiredConversations = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "Asia/Tokyo",
    memory: "256MiB",
    region: "asia-northeast1",
  },
  async () => {
    const deletedCount = await deleteExpiredConversations();
    console.log(JSON.stringify({
      severity: "INFO",
      message: `期限切れ会話を ${deletedCount} 件削除しました`,
    }));
  }
);
