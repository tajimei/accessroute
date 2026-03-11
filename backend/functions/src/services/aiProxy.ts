// AI推論サーバーへのプロキシ

import {
  ChatMessage,
  ChatResponse,
  ExtractNeedsResponse,
  UserProfile,
  AIChatApiResponse,
  AIExtractNeedsApiResponse,
  AIHealthResponse,
} from "../types";
import { defineString } from "firebase-functions/params";
import https from "https";
import http from "http";
import { Response as ExpressResponse } from "express";

// AI推論サーバーのURLは Firebase の環境変数で管理
const aiServerUrl = defineString("AI_SERVER_URL");

// タイムアウト設定（30秒）
const REQUEST_TIMEOUT_MS = 30000;

// ストリーミングタイムアウト（60秒）
const STREAM_TIMEOUT_MS = 60000;

// リトライ設定
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ============================================================
// フォールバック応答（改善版：複数キーワード組み合わせ＋プロファイル考慮）
// ============================================================

/** キーワードパターン定義。priority が高いほど優先的にマッチする */
interface FallbackPattern {
  /** マッチするキーワード群（全て含まれる場合にマッチ） */
  keywords: string[];
  /** 返却メッセージ生成関数（プロファイル情報を考慮可能） */
  reply: (profile?: UserProfile | null) => string;
  /** 優先度（大きいほど優先） */
  priority: number;
}

const FALLBACK_PATTERNS: FallbackPattern[] = [
  // 複数キーワードの組み合わせ（高優先度）
  {
    keywords: ["車椅子", "東京"],
    reply: () =>
      "車椅子で東京のお出かけですね！東京スカイツリーはエレベーター完備で車椅子でも楽しめます。お台場も平坦で移動しやすいですよ。具体的なエリアや目的地はありますか？",
    priority: 20,
  },
  {
    keywords: ["車椅子", "京都"],
    reply: () =>
      "車椅子で京都ですね！京都水族館は全館バリアフリーでおすすめです。平安神宮の神苑も一部バリアフリー対応しています。他に気になるスポットはありますか？",
    priority: 20,
  },
  {
    keywords: ["車椅子", "大阪"],
    reply: () =>
      "車椅子で大阪ですね！海遊館はバリアフリー完備で、あべのハルカスもエレベーターで全フロアアクセスできます。どのエリアに行かれますか？",
    priority: 20,
  },
  {
    keywords: ["ベビーカー", "東京"],
    reply: () =>
      "ベビーカーで東京のお出かけですね！上野動物園はベビーカー貸出もあり、授乳室も完備です。お台場のダイバーシティも広くて移動しやすいですよ。お子さんの年齢はおいくつですか？",
    priority: 20,
  },
  {
    keywords: ["トイレ", "車椅子"],
    reply: () =>
      "車椅子対応の多機能トイレをお探しですね。エリアを教えていただければ、近くのバリアフリートイレを詳しくお調べします。",
    priority: 20,
  },
  {
    keywords: ["階段", "車椅子"],
    reply: () =>
      "階段を避けた車椅子対応ルートですね。エレベーターやスロープを優先したルートをご提案できます。目的地はどちらですか？",
    priority: 20,
  },
  {
    keywords: ["高齢", "階段"],
    reply: () =>
      "階段を避けたルートで、ご高齢の方にも無理のないコースをお探ししますね。途中に休憩できるベンチや椅子があるルートもご提案できます。目的地はどちらですか？",
    priority: 20,
  },

  // 単独キーワード（中優先度）
  {
    keywords: ["車椅子"],
    reply: () =>
      "車椅子での移動ですね。エレベーターやスロープが整備されたルートをご提案します。目的地はどちらですか？",
    priority: 10,
  },
  {
    keywords: ["ベビーカー"],
    reply: () =>
      "ベビーカーでのお出かけですね！お子さんの年齢はおいくつですか？授乳室やおむつ替えスポットも一緒にお探しします。",
    priority: 10,
  },
  {
    keywords: ["高齢"],
    reply: () =>
      "ご一緒される方のことを考えて、無理のないルートをお探ししますね。一度にどのくらい歩けますか？",
    priority: 10,
  },
  {
    keywords: ["杖"],
    reply: () =>
      "杖をお使いなのですね。段差が少なく、滑りにくい路面のルートを優先してご提案します。目的地はどちらですか？",
    priority: 10,
  },
  {
    keywords: ["子ども"],
    reply: () =>
      "お子さんとのお出かけですね！キッズスペースや授乳室がある施設も一緒にお探しします。お子さんの年齢を教えていただけますか？",
    priority: 10,
  },
  {
    keywords: ["子供"],
    reply: () =>
      "お子さんとのお出かけですね！キッズスペースや授乳室がある施設も一緒にお探しします。お子さんの年齢を教えていただけますか？",
    priority: 10,
  },
  {
    keywords: ["東京"],
    reply: () =>
      "東京でしたら、東京スカイツリーはエレベーター完備で車椅子でも楽しめますよ。お台場も平坦で移動しやすいです。他に気になるエリアはありますか？",
    priority: 10,
  },
  {
    keywords: ["京都"],
    reply: () =>
      "京都でしたら、京都水族館は全館バリアフリーでおすすめです。京都駅からも近くて便利ですよ。どなたとお出かけですか？",
    priority: 10,
  },
  {
    keywords: ["大阪"],
    reply: () =>
      "大阪でしたら、海遊館やあべのハルカスはバリアフリー設備が充実していますよ。どんな移動手段をお使いですか？",
    priority: 10,
  },
  {
    keywords: ["名古屋"],
    reply: () =>
      "名古屋でしたら、名古屋城は天守閣にエレベーターがあります。名古屋港水族館もバリアフリーですよ。どんな移動手段をお使いですか？",
    priority: 10,
  },
  {
    keywords: ["福岡"],
    reply: () =>
      "福岡でしたら、キャナルシティ博多はバリアフリー対応で、福岡タワーもエレベーター完備です。どんな移動手段をお使いですか？",
    priority: 10,
  },
  {
    keywords: ["横浜"],
    reply: () =>
      "横浜でしたら、みなとみらいエリアは歩道が広く平坦で移動しやすいですよ。赤レンガ倉庫もバリアフリー対応しています。どんな移動手段をお使いですか？",
    priority: 10,
  },
  {
    keywords: ["トイレ"],
    reply: () =>
      "バリアフリートイレをお探しですね。目的地のエリアを教えていただければ、近くの多機能トイレをお調べします。",
    priority: 10,
  },
  {
    keywords: ["階段"],
    reply: () =>
      "階段を避けたルートをお探しですね。エレベーターやスロープを優先したルートをご提案できます。目的地はどちらですか？",
    priority: 10,
  },
  {
    keywords: ["スロープ"],
    reply: () =>
      "スロープのあるルートをお探しですね。バリアフリー対応の経路をご提案します。目的地はどちらですか？",
    priority: 10,
  },
  {
    keywords: ["エレベーター"],
    reply: () =>
      "エレベーターのある経路をお探しですね。駅や施設のエレベーター位置を含めたルートをご提案できます。目的地はどちらですか？",
    priority: 10,
  },
  {
    keywords: ["休憩"],
    reply: () =>
      "休憩スポットをお探しですね。ベンチや休憩所がある場所を含めたルートをご提案します。どのエリアですか？",
    priority: 10,
  },
  {
    keywords: ["授乳"],
    reply: () =>
      "授乳室をお探しですね。エリアを教えていただければ、近くの授乳室がある施設をお調べします。",
    priority: 10,
  },
  {
    keywords: ["おむつ"],
    reply: () =>
      "おむつ替えスペースをお探しですね。エリアを教えていただければ、近くの対応施設をお調べします。",
    priority: 10,
  },
  {
    keywords: ["バリアフリー"],
    reply: () =>
      "バリアフリーの情報をお探しですね。具体的にどのエリアや施設について知りたいですか？移動手段も教えていただけると、より的確なご提案ができます。",
    priority: 10,
  },
  {
    keywords: ["観光"],
    reply: () =>
      "観光のご計画ですね！どちらのエリアをお考えですか？移動手段やご一緒される方の情報を教えていただければ、アクセシブルなスポットをご提案します。",
    priority: 10,
  },
  {
    keywords: ["旅行"],
    reply: () =>
      "ご旅行のご計画ですね！行き先はお決まりですか？移動手段やご一緒される方の情報を教えていただければ、バリアフリーなプランをご提案します。",
    priority: 10,
  },
  {
    keywords: ["駐車場"],
    reply: () =>
      "駐車場をお探しですね。車椅子対応の優先駐車スペースがある施設をお調べします。どのエリアですか？",
    priority: 10,
  },
];

/** ユーザープロファイルに基づくデフォルトフォールバックメッセージを生成する */
const getDefaultFallback = (profile?: UserProfile | null): string => {
  if (!profile) {
    return "ご相談ありがとうございます！どんな移動手段をお使いですか？また、どなたかとご一緒ですか？行きたい場所や気になるエリアがあれば教えてください。";
  }

  const parts: string[] = ["ご相談ありがとうございます！"];

  // プロファイル情報を反映した応答を構築
  const mobilityLabels: Record<string, string> = {
    wheelchair: "車椅子をお使い",
    stroller: "ベビーカーでの移動",
    cane: "杖をお使い",
    walk: "徒歩での移動",
  };

  if (profile.mobilityType && mobilityLabels[profile.mobilityType]) {
    parts.push(`${mobilityLabels[profile.mobilityType]}なのですね。`);
  }

  if (profile.companions && profile.companions.length > 0) {
    const companionLabels: Record<string, string> = {
      child: "お子さん",
      elderly: "ご高齢の方",
      disability: "お身体の不自由な方",
    };
    const companionNames = profile.companions
      .map((c) => companionLabels[c] || c)
      .filter(Boolean);
    if (companionNames.length > 0) {
      parts.push(`${companionNames.join("と")}とご一緒なのですね。`);
    }
  }

  parts.push("行きたい場所や気になるエリアがあれば教えてください。");

  return parts.join("");
};

/**
 * フォールバック応答を取得する（改善版）
 * 複数キーワードの組み合わせマッチングとプロファイル考慮に対応
 */
const getFallbackResponse = (
  message: string,
  userProfile?: UserProfile | null
): ChatResponse => {
  // マッチするパターンを全て収集し、優先度でソート
  const matches = FALLBACK_PATTERNS.filter((pattern) =>
    pattern.keywords.every((kw) => message.includes(kw))
  ).sort((a, b) => {
    // 優先度が同じ場合はキーワード数が多い方を優先
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.keywords.length - a.keywords.length;
  });

  if (matches.length > 0) {
    return {
      reply: matches[0].reply(userProfile),
      extractedNeeds: null,
      suggestedAction: null,
    };
  }

  return {
    reply: getDefaultFallback(userProfile),
    extractedNeeds: null,
    suggestedAction: null,
  };
};

const FALLBACK_EXTRACT_RESPONSE: ExtractNeedsResponse = {
  needs: {},
  confidence: 0,
  missingFields: ["mobilityType", "companions", "avoidConditions"],
};

// ヘルスチェックのキャッシュ
let lastHealthCheck: { status: AIHealthResponse["status"]; checkedAt: number } | null = null;
const HEALTH_CHECK_CACHE_MS = 30000; // 30秒間キャッシュ

// ============================================================
// 内部ヘルパー
// ============================================================

/** HTTPリクエストを送信してJSONレスポンスを取得する */
const postJson = async (url: string, body: unknown): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const jsonBody = JSON.stringify(body);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(jsonBody),
      },
    };

    const req = transport.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: string) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`AIサーバーエラー: HTTP ${res.statusCode} - ${data.substring(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`AIサーバーレスポンスのパースエラー: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error("AIサーバーリクエストがタイムアウトしました"));
    });

    req.write(jsonBody);
    req.end();
  });
};

/** GETリクエストを送信してJSONレスポンスを取得する */
const getJson = async (url: string): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname,
      method: "GET",
    };

    const req = transport.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: string) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`AIサーバーエラー: HTTP ${res.statusCode}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`AIサーバーレスポンスのパースエラー`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("ヘルスチェックがタイムアウトしました"));
    });

    req.end();
  });
};

/** リトライ付きでリクエストを送信する */
const postJsonWithRetry = async (url: string, body: unknown): Promise<unknown> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await postJson(url, body);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`AIサーバーリクエスト失敗 (試行 ${attempt + 1}/${MAX_RETRIES}):`, lastError.message);

      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  throw lastError;
};

// ============================================================
// フィールド名のファジーマッチング用マッピング
// ============================================================

/** AIサーバーから返る可能性のあるフィールド名のバリエーションをマッピングする */
const FIELD_NAME_ALIASES: Record<string, string[]> = {
  mobility_type: [
    "mobility_type",
    "mobilityType",
    "mobility",
    "move_type",
    "movement_type",
    "transport_type",
    "移動手段",
  ],
  companions: [
    "companions",
    "companion",
    "同行者",
    "together_with",
    "with_whom",
  ],
  max_distance_meters: [
    "max_distance_meters",
    "maxDistanceMeters",
    "max_distance",
    "distance",
    "walking_distance",
    "最大距離",
  ],
  avoid_conditions: [
    "avoid_conditions",
    "avoidConditions",
    "avoid",
    "避ける条件",
    "ng_conditions",
  ],
  prefer_conditions: [
    "prefer_conditions",
    "preferConditions",
    "prefer",
    "preferences",
    "希望条件",
    "ok_conditions",
  ],
};

/** ファジーマッチングで正規化されたフィールド名を返す */
const resolveFieldName = (rawName: string): string | null => {
  for (const [canonical, aliases] of Object.entries(FIELD_NAME_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === rawName.toLowerCase())) {
      return canonical;
    }
  }
  return null;
};

/**
 * AIサーバーのレスポンスをアプリの型に変換する（snake_case -> camelCase）
 * ファジーマッチングにより予期しないフィールド名にも対応する
 */
const convertExtractedNeeds = (
  needs: AIChatApiResponse["extracted_needs"]
): Partial<UserProfile> | null => {
  if (!needs || typeof needs !== "object") return null;

  const result: Record<string, unknown> = {};

  // 既知フィールドの直接マッピング（高速パス）
  if (needs.mobility_type) result.mobilityType = needs.mobility_type;
  if (needs.companions) result.companions = needs.companions;
  if (needs.max_distance_meters) result.maxDistanceMeters = needs.max_distance_meters;
  if (needs.avoid_conditions) result.avoidConditions = needs.avoid_conditions;
  if (needs.prefer_conditions) result.preferConditions = needs.prefer_conditions;

  // ファジーマッチング：既知フィールド以外のキーから情報を抽出
  const knownKeys = new Set([
    "mobility_type",
    "companions",
    "max_distance_meters",
    "avoid_conditions",
    "prefer_conditions",
  ]);

  for (const [key, value] of Object.entries(needs as Record<string, unknown>)) {
    if (knownKeys.has(key) || value == null) continue;

    const canonicalName = resolveFieldName(key);
    if (!canonicalName) {
      console.warn(`convertExtractedNeeds: 未知のフィールド名 "${key}" をスキップしました`);
      continue;
    }

    // 正規化されたフィールド名に対応するcamelCaseキーに変換
    const camelCaseMap: Record<string, string> = {
      mobility_type: "mobilityType",
      companions: "companions",
      max_distance_meters: "maxDistanceMeters",
      avoid_conditions: "avoidConditions",
      prefer_conditions: "preferConditions",
    };
    const camelKey = camelCaseMap[canonicalName];
    if (camelKey && !(camelKey in result)) {
      result[camelKey] = value;
    }
  }

  return Object.keys(result).length > 0 ? (result as Partial<UserProfile>) : null;
};

/** ユーザープロファイルをAIサーバー形式に変換する */
const convertProfileToAIFormat = (profile: UserProfile): Record<string, unknown> => {
  return {
    mobility_type: profile.mobilityType,
    companions: profile.companions,
    max_distance_meters: profile.maxDistanceMeters,
    avoid_conditions: profile.avoidConditions,
    prefer_conditions: profile.preferConditions,
  };
};

/** ユーザープロファイルを自然言語のサマリーに変換する */
const buildProfileSummary = (profile: UserProfile): string => {
  const parts: string[] = [];

  const mobilityLabels: Record<string, string> = {
    wheelchair: "車椅子ユーザー",
    stroller: "ベビーカー利用",
    cane: "杖使用",
    walk: "徒歩",
    other: "その他の移動手段",
  };
  if (profile.mobilityType) {
    parts.push(`移動手段: ${mobilityLabels[profile.mobilityType] || profile.mobilityType}`);
  }

  if (profile.companions && profile.companions.length > 0) {
    const companionLabels: Record<string, string> = {
      child: "子ども",
      elderly: "高齢者",
      disability: "身体障害者",
    };
    const names = profile.companions.map((c) => companionLabels[c] || c);
    parts.push(`同行者: ${names.join(", ")}`);
  }

  if (profile.maxDistanceMeters) {
    parts.push(`最大歩行距離: ${profile.maxDistanceMeters}m`);
  }

  if (profile.avoidConditions && profile.avoidConditions.length > 0) {
    const avoidLabels: Record<string, string> = {
      stairs: "階段",
      slope: "急斜面",
      crowd: "混雑",
      dark: "暗い場所",
    };
    const names = profile.avoidConditions.map((c) => avoidLabels[c] || c);
    parts.push(`避けたい条件: ${names.join(", ")}`);
  }

  if (profile.preferConditions && profile.preferConditions.length > 0) {
    const preferLabels: Record<string, string> = {
      restroom: "トイレ近く",
      rest_area: "休憩所あり",
      covered: "屋根付き",
    };
    const names = profile.preferConditions.map((c) => preferLabels[c] || c);
    parts.push(`希望条件: ${names.join(", ")}`);
  }

  return parts.join(" / ");
};

/**
 * AI推論サーバー用のメッセージ配列を構築する（改善版）
 * ユーザープロファイル・会話コンテキスト・抽出済みニーズをシステムメッセージに含める
 */
const buildAIMessages = (
  message: string,
  conversationHistory: ChatMessage[],
  userProfile?: UserProfile | null,
  extractedNeeds?: Partial<UserProfile> | null
): Array<{ role: string; content: string }> => {
  const systemParts: string[] = [];

  // ユーザープロファイル情報をシステムメッセージに組み込む
  if (userProfile) {
    const summary = buildProfileSummary(userProfile);
    if (summary) {
      systemParts.push(`【ユーザー情報】${summary}`);
    }
  }

  // 過去に抽出済みのニーズ情報を含める
  if (extractedNeeds && Object.keys(extractedNeeds).length > 0) {
    const needsParts: string[] = [];
    if (extractedNeeds.mobilityType) needsParts.push(`移動手段: ${extractedNeeds.mobilityType}`);
    if (extractedNeeds.companions) needsParts.push(`同行者: ${extractedNeeds.companions.join(", ")}`);
    if (extractedNeeds.avoidConditions) needsParts.push(`避けたい: ${extractedNeeds.avoidConditions.join(", ")}`);
    if (extractedNeeds.preferConditions) needsParts.push(`希望: ${extractedNeeds.preferConditions.join(", ")}`);
    if (needsParts.length > 0) {
      systemParts.push(`【会話から抽出済みのニーズ】${needsParts.join(" / ")}`);
    }
  }

  // 会話のターン数情報
  const turnCount = conversationHistory.length;
  if (turnCount > 0) {
    systemParts.push(`【会話コンテキスト】現在${Math.ceil(turnCount / 2)}ターン目の会話です。`);
  }

  const messages: Array<{ role: string; content: string }> = [];

  // システムメッセージがある場合は先頭に追加
  if (systemParts.length > 0) {
    messages.push({ role: "system", content: systemParts.join("\n") });
  }

  // 会話履歴
  messages.push(
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  );

  // 現在のユーザーメッセージ
  messages.push({ role: "user", content: message });

  return messages;
};

// ============================================================
// 公開API
// ============================================================

/**
 * AIチャット応答を取得する（非ストリーミング版）
 * AI推論サーバーの /v1/chat エンドポイントを呼び出す
 */
export const chat = async (
  _userId: string,
  message: string,
  conversationHistory: ChatMessage[],
  userProfile?: UserProfile | null,
  extractedNeeds?: Partial<UserProfile> | null
): Promise<ChatResponse> => {
  try {
    const baseUrl = aiServerUrl.value();
    const messages = buildAIMessages(message, conversationHistory, userProfile, extractedNeeds);

    const requestBody: Record<string, unknown> = {
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    };

    if (userProfile) {
      requestBody.user_profile = convertProfileToAIFormat(userProfile);
    }

    const response = (await postJsonWithRetry(
      `${baseUrl}/v1/chat`,
      requestBody
    )) as AIChatApiResponse;

    return {
      reply: response.reply,
      extractedNeeds: convertExtractedNeeds(response.extracted_needs ?? null),
      suggestedAction: (response.suggested_action as ChatResponse["suggestedAction"]) ?? null,
      confidence: response.confidence ?? undefined,
    };
  } catch (error) {
    console.error("AIチャットエラー:", error);
    return getFallbackResponse(message, userProfile);
  }
};

/**
 * AIチャット応答をSSEストリーミングで取得する
 * AI推論サーバーの /v1/chat エンドポイントをストリーミングモードで呼び出し、
 * Express Response に直接 SSE チャンクを書き込む
 */
export const streamChat = async (
  _userId: string,
  message: string,
  conversationHistory: ChatMessage[],
  userProfile: UserProfile | null | undefined,
  res: ExpressResponse,
  extractedNeeds?: Partial<UserProfile> | null
): Promise<{
  reply: string;
  extractedNeeds: Partial<UserProfile> | null;
  suggestedAction: ChatResponse["suggestedAction"];
  confidence?: number;
}> => {
  const baseUrl = aiServerUrl.value();
  const messages = buildAIMessages(message, conversationHistory, userProfile, extractedNeeds);

  const requestBody: Record<string, unknown> = {
    messages,
    max_tokens: 1024,
    temperature: 0.7,
    stream: true,
  };

  if (userProfile) {
    requestBody.user_profile = convertProfileToAIFormat(userProfile);
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`${baseUrl}/v1/chat`);
    const isHttps = parsedUrl.protocol === "https:";
    const transport = isHttps ? https : http;

    const jsonBody = JSON.stringify(requestBody);

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(jsonBody),
        Accept: "text/event-stream",
      },
    };

    /** ストリーミングエラー時にクライアントにエラーイベントを送信しフォールバックする */
    const handleStreamError = (err: Error): void => {
      console.error("ストリーミングエラー:", err.message);

      // クライアント接続が生きていればエラーイベントを送信してフォールバック応答を返す
      if (!res.writableEnded) {
        try {
          const fallback = getFallbackResponse(message, userProfile);
          res.write(
            `data: ${JSON.stringify({ error: "ストリーミング中にエラーが発生しました。再試行します。" })}\n\n`
          );
          res.write(`data: ${JSON.stringify({ chunk: fallback.reply })}\n\n`);
          res.write(
            `data: ${JSON.stringify({ done: true, extractedNeeds: null, suggestedAction: null })}\n\n`
          );
          res.end();
          resolve({
            reply: fallback.reply,
            extractedNeeds: null,
            suggestedAction: null,
            confidence: undefined,
          });
        } catch (writeErr) {
          console.error("フォールバック応答の書き込みにも失敗:", writeErr);
          reject(err);
        }
      } else {
        reject(err);
      }
    };

    const req = transport.request(options, (upstream) => {
      // ストリーミング以外のステータスコードの場合はエラー
      if (upstream.statusCode && upstream.statusCode >= 400) {
        let errorData = "";
        upstream.on("data", (chunk: Buffer) => {
          errorData += chunk.toString();
        });
        upstream.on("end", () => {
          handleStreamError(
            new Error(`AIサーバーエラー: HTTP ${upstream.statusCode} - ${errorData.substring(0, 200)}`)
          );
        });
        return;
      }

      let fullReply = "";
      let streamExtractedNeeds: Partial<UserProfile> | null = null;
      let suggestedAction: ChatResponse["suggestedAction"] = null;
      let confidence: number | undefined;
      // SSEパーサー: チャンク境界をまたぐ行を正しく処理するためのバッファ
      let sseBuffer = "";

      upstream.on("data", (chunk: Buffer) => {
        sseBuffer += chunk.toString();
        // 完全な行のみ処理し、不完全な最終行はバッファに残す
        const lastNewline = sseBuffer.lastIndexOf("\n");
        if (lastNewline === -1) return;

        const completeData = sseBuffer.substring(0, lastNewline);
        sseBuffer = sseBuffer.substring(lastNewline + 1);

        const lines = completeData.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            // テキストチャンクを転送
            if (parsed.reply_chunk) {
              fullReply += parsed.reply_chunk;
              if (!res.writableEnded) {
                res.write(`data: ${JSON.stringify({ chunk: parsed.reply_chunk })}\n\n`);
              }
            }

            // メタデータ（最終チャンクに含まれる場合）
            if (parsed.extracted_needs) {
              streamExtractedNeeds = convertExtractedNeeds(parsed.extracted_needs);
            }
            if (parsed.suggested_action) {
              suggestedAction = parsed.suggested_action as ChatResponse["suggestedAction"];
            }
            if (parsed.confidence != null) {
              confidence = parsed.confidence;
            }
          } catch {
            // パース不能な行は無視（部分的なJSONの可能性）
          }
        }
      });

      upstream.on("end", () => {
        // バッファに残ったデータを処理
        if (sseBuffer.trim()) {
          const remainingLines = sseBuffer.split("\n");
          for (const line of remainingLines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.reply_chunk) {
                fullReply += parsed.reply_chunk;
                if (!res.writableEnded) {
                  res.write(`data: ${JSON.stringify({ chunk: parsed.reply_chunk })}\n\n`);
                }
              }
              if (parsed.extracted_needs) {
                streamExtractedNeeds = convertExtractedNeeds(parsed.extracted_needs);
              }
              if (parsed.suggested_action) {
                suggestedAction = parsed.suggested_action as ChatResponse["suggestedAction"];
              }
              if (parsed.confidence != null) {
                confidence = parsed.confidence;
              }
            } catch {
              // パース不能な残りデータは無視
            }
          }
        }

        // 完了イベントを送信
        if (!res.writableEnded) {
          res.write(
            `data: ${JSON.stringify({
              done: true,
              extractedNeeds: streamExtractedNeeds,
              suggestedAction,
            })}\n\n`
          );
          res.end();
        }
        resolve({
          reply: fullReply,
          extractedNeeds: streamExtractedNeeds,
          suggestedAction,
          confidence,
        });
      });

      upstream.on("error", (err) => {
        handleStreamError(err);
      });
    });

    req.on("error", (err) => {
      handleStreamError(err);
    });

    req.setTimeout(STREAM_TIMEOUT_MS, () => {
      req.destroy();
      handleStreamError(new Error("AIサーバーストリーミングがタイムアウトしました"));
    });

    req.write(jsonBody);
    req.end();
  });
};

/**
 * 会話からユーザーニーズを抽出する
 * AI推論サーバーの /v1/extract-needs エンドポイントを呼び出す
 */
export const extractNeeds = async (
  _userId: string,
  conversationHistory: ChatMessage[]
): Promise<ExtractNeedsResponse> => {
  try {
    const baseUrl = aiServerUrl.value();

    const messages = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = (await postJsonWithRetry(`${baseUrl}/v1/extract-needs`, {
      messages,
    })) as AIExtractNeedsApiResponse;

    // snake_case -> camelCase 変換（ファジーマッチング対応）
    const rawNeeds = response.needs as Record<string, unknown>;
    const needs: Partial<UserProfile> = {};

    // ファジーマッチングで各フィールドを抽出
    for (const [key, value] of Object.entries(rawNeeds)) {
      if (value == null) continue;

      const canonicalName = resolveFieldName(key) ?? key;
      switch (canonicalName) {
        case "mobility_type":
          needs.mobilityType = value as UserProfile["mobilityType"];
          break;
        case "companions":
          needs.companions = value as UserProfile["companions"];
          break;
        case "max_distance_meters":
          needs.maxDistanceMeters = value as number;
          break;
        case "avoid_conditions":
          needs.avoidConditions = value as UserProfile["avoidConditions"];
          break;
        case "prefer_conditions":
          needs.preferConditions = value as UserProfile["preferConditions"];
          break;
        default:
          console.warn(`extractNeeds: 未知のフィールド名 "${key}" をスキップしました`);
          break;
      }
    }

    return {
      needs,
      confidence: response.confidence,
      missingFields: response.missing_fields,
    };
  } catch (error) {
    console.error("ニーズ抽出エラー:", error);
    return FALLBACK_EXTRACT_RESPONSE;
  }
};

/**
 * AI推論サーバーのヘルスチェック
 * 結果を30秒間キャッシュして頻繁なリクエストを防ぐ
 */
export const checkHealth = async (): Promise<AIHealthResponse> => {
  // キャッシュが有効な場合はキャッシュを返す
  if (lastHealthCheck && Date.now() - lastHealthCheck.checkedAt < HEALTH_CHECK_CACHE_MS) {
    return { status: lastHealthCheck.status };
  }

  try {
    const baseUrl = aiServerUrl.value();
    const response = (await getJson(`${baseUrl}/health`)) as AIHealthResponse;

    lastHealthCheck = {
      status: response.status,
      checkedAt: Date.now(),
    };

    return response;
  } catch (error) {
    console.error("ヘルスチェックエラー:", error);

    lastHealthCheck = {
      status: "error",
      checkedAt: Date.now(),
    };

    return { status: "error" };
  }
};

/**
 * AI推論サーバーが利用可能かチェックする
 */
export const isAvailable = async (): Promise<boolean> => {
  const health = await checkHealth();
  return health.status === "ok";
};
