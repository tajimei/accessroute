// セキュリティミドルウェア（入力サニタイズ、セキュリティヘッダー、CORS設定）

import { Request, Response, NextFunction } from "express";

// ============================================================
// 入力サニタイズ（XSS対策）
// ============================================================

/**
 * HTMLの特殊文字をエスケープする
 */
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};

/**
 * 値を再帰的にサニタイズする
 * 文字列値のHTMLタグをエスケープ
 */
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return escapeHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
};

/**
 * オブジェクトのすべての文字列値をサニタイズする
 */
const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
};

/**
 * リクエストボディの入力サニタイズミドルウェア
 * XSS攻撃を防ぐためにHTMLタグをエスケープ
 */
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body as Record<string, unknown>);
  }

  // クエリパラメータもサニタイズ
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        (req.query as Record<string, string>)[key] = escapeHtml(value);
      }
    }
  }

  next();
};

// ============================================================
// セキュリティヘッダー（Helmet相当）
// ============================================================

/**
 * セキュリティヘッダーを設定するミドルウェア
 * Helmet パッケージ相当の基本的なセキュリティヘッダーを設定
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // XSSフィルタの有効化
  res.setHeader("X-XSS-Protection", "0");

  // MIMEタイプスニッフィングの防止
  res.setHeader("X-Content-Type-Options", "nosniff");

  // クリックジャッキング対策
  res.setHeader("X-Frame-Options", "DENY");

  // Referrer情報の制限
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'"
  );

  // HTTP Strict Transport Security（HTTPS強制）
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // サーバー情報の非表示
  res.removeHeader("X-Powered-By");

  // Permissions-Policy（機能制限）
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  next();
};

// ============================================================
// CORS設定（本番用）
// ============================================================

// 環境変数から許可オリジンを取得（カンマ区切り）
const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(",").map((o) => o.trim());
  }

  // デフォルト: 開発環境のオリジン
  return [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5001",
  ];
};

/**
 * 本番用のCORS設定オプションを取得する
 */
export const getCorsOptions = (): {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
} => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // オリジンなし（サーバー間通信やモバイルアプリ）は許可
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS拒否: ${origin}`);
        callback(new Error("CORSポリシーにより拒否されました"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Retry-After"],
    credentials: true,
    maxAge: 86400, // 24時間プリフライトキャッシュ
  };
};
