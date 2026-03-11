// ジオコーディング関連のルーティング

import { Router } from "express";
import { geocode, reverseGeocode, placesAutocomplete } from "../services/mapsApi";

const router = Router();

/**
 * エラーメッセージからHTTPステータスコードを判定するヘルパー
 * API設定エラー（REQUEST_DENIED等）は503、その他は500
 */
const getErrorStatus = (message: string): number => {
  if (
    message.includes("GOOGLE_MAPS_API_KEY") ||
    message.includes("REQUEST_DENIED") ||
    message.includes("OVER_QUERY_LIMIT")
  ) {
    return 503;
  }
  return 500;
};

/**
 * POST /api/geocode
 * 住所・地名から座標を取得する
 */
router.post("/", async (req, res) => {
  try {
    const { address } = req.body as { address?: string };

    // バリデーション
    if (!address || typeof address !== "string" || address.trim().length === 0) {
      res.status(400).json({ error: "address は必須です" });
      return;
    }

    if (address.length > 500) {
      res.status(400).json({ error: "address は500文字以内で指定してください" });
      return;
    }

    const location = await geocode(address.trim());

    if (!location) {
      res.status(404).json({ error: `場所が見つかりません: ${address}` });
      return;
    }

    res.json({ location });
  } catch (error) {
    console.error("ジオコーディングエラー:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = getErrorStatus(message);
    if (status === 503) {
      res.status(503).json({ error: "ジオコーディングサービスが一時的に利用できません" });
      return;
    }
    res.status(500).json({ error: "ジオコーディングに失敗しました" });
  }
});

/**
 * POST /api/geocode/reverse
 * 座標から住所を取得する
 */
router.post("/reverse", async (req, res) => {
  try {
    const { lat, lng } = req.body as { lat?: number; lng?: number };

    // バリデーション
    if (typeof lat !== "number" || typeof lng !== "number") {
      res.status(400).json({ error: "lat と lng は必須です（数値）" });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: "lat/lng の値が範囲外です" });
      return;
    }

    const address = await reverseGeocode({ lat, lng });

    if (!address) {
      res.status(404).json({ error: "住所が見つかりません" });
      return;
    }

    res.json({ address });
  } catch (error) {
    console.error("リバースジオコーディングエラー:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = getErrorStatus(message);
    if (status === 503) {
      res.status(503).json({ error: "ジオコーディングサービスが一時的に利用できません" });
      return;
    }
    res.status(500).json({ error: "リバースジオコーディングに失敗しました" });
  }
});

/**
 * POST /api/geocode/autocomplete
 * 場所名のオートコンプリート候補を取得する
 */
router.post("/autocomplete", async (req, res) => {
  try {
    const { input } = req.body as { input?: string };

    // バリデーション
    if (!input || typeof input !== "string" || input.trim().length < 2) {
      res.status(400).json({ error: "input は2文字以上の文字列が必須です" });
      return;
    }

    if (input.length > 200) {
      res.status(400).json({ error: "input は200文字以内で指定してください" });
      return;
    }

    const predictions = await placesAutocomplete(input.trim());

    res.json({ predictions });
  } catch (error) {
    console.error("オートコンプリートエラー:", error);
    const message = error instanceof Error ? error.message : String(error);
    const status = getErrorStatus(message);
    if (status === 503) {
      res.status(503).json({ error: "オートコンプリートサービスが一時的に利用できません" });
      return;
    }
    res.status(500).json({ error: "オートコンプリートに失敗しました" });
  }
});

export default router;
