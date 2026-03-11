// 環境別設定（dev / staging / prod）

// 環境タイプ
export type Environment = "development" | "staging" | "production";

// 環境設定の型定義
export interface EnvironmentConfig {
  // 環境名
  environment: Environment;
  // Firebase プロジェクトID
  projectId: string;
  // API エンドポイント（Cloud Functions）
  apiBaseUrl: string;
  // AI推論サーバーURL
  aiServerUrl: string;
  // 許可オリジン（CORS）
  allowedOrigins: string[];
  // ログレベル
  logLevel: "debug" | "info" | "warn" | "error";
  // レート制限の倍率（開発時は緩和）
  rateLimitMultiplier: number;
  // キャッシュTTL（ミリ秒）
  cacheTtlMs: number;
  // 最小インスタンス数（コールドスタート対策）
  minInstances: number;
  // 最大インスタンス数
  maxInstances: number;
  // メモリ設定（MB）
  memoryMb: number;
  // タイムアウト設定（秒）
  timeoutSeconds: number;
}

// 開発環境設定
const developmentConfig: EnvironmentConfig = {
  environment: "development",
  projectId: "accessroute-dev",
  apiBaseUrl: "http://localhost:5001/accessroute-dev/us-central1/api",
  aiServerUrl: "http://localhost:8000",
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5001",
  ],
  logLevel: "debug",
  rateLimitMultiplier: 10, // 開発時はレート制限を緩和
  cacheTtlMs: 5 * 60 * 1000, // 5分
  minInstances: 0,
  maxInstances: 1,
  memoryMb: 256,
  timeoutSeconds: 60,
};

// ステージング環境設定
const stagingConfig: EnvironmentConfig = {
  environment: "staging",
  projectId: "accessroute-staging",
  apiBaseUrl: "https://us-central1-accessroute-staging.cloudfunctions.net/api",
  aiServerUrl: "https://ai-staging.accessroute.example.com",
  allowedOrigins: [
    "https://staging.accessroute.example.com",
  ],
  logLevel: "info",
  rateLimitMultiplier: 2, // ステージングは少し緩和
  cacheTtlMs: 12 * 60 * 60 * 1000, // 12時間
  minInstances: 0,
  maxInstances: 5,
  memoryMb: 512,
  timeoutSeconds: 120,
};

// 本番環境設定
const productionConfig: EnvironmentConfig = {
  environment: "production",
  projectId: "accessroute-prod",
  apiBaseUrl: "https://us-central1-accessroute-prod.cloudfunctions.net/api",
  aiServerUrl: "https://ai.accessroute.example.com",
  allowedOrigins: [
    "https://accessroute.example.com",
    "https://www.accessroute.example.com",
  ],
  logLevel: "warn",
  rateLimitMultiplier: 1, // 本番はデフォルトのレート制限
  cacheTtlMs: 24 * 60 * 60 * 1000, // 24時間
  minInstances: 1, // コールドスタート対策
  maxInstances: 10,
  memoryMb: 512,
  timeoutSeconds: 120,
};

// 環境設定マップ
const configs: Record<Environment, EnvironmentConfig> = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

/**
 * 現在の環境を検出する
 * FUNCTIONS_EMULATOR が設定されている場合は開発環境
 * NODE_ENV または GCLOUD_PROJECT から判定
 */
export const detectEnvironment = (): Environment => {
  // Firebase Emulator 実行中
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return "development";
  }

  // NODE_ENV による判定
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "production") {
    // プロジェクトIDからステージングか本番かを判定
    const projectId = process.env.GCLOUD_PROJECT ?? "";
    if (projectId.includes("staging")) {
      return "staging";
    }
    return "production";
  }

  return "development";
};

/**
 * 現在の環境設定を取得する
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = detectEnvironment();
  return configs[env];
};

/**
 * 指定した環境の設定を取得する
 */
export const getConfigForEnvironment = (env: Environment): EnvironmentConfig => {
  return configs[env];
};
