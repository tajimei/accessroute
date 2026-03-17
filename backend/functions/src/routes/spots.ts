// スポット関連のルーティング

import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { SpotCategory } from "../types";
import {
  getSpotDetail,
  cacheSpotDetail,
  getSpotFromCache,
  batchCacheSpotSummaries,
  saveSearchHistory,
} from "../services/firestore";
import { searchNearbyPlaces, getPlaceDetails } from "../services/mapsApi";
import { searchNearbyYOLP } from "../services/yolpApi";
import { calculateSpotScore } from "../utils/scoring";
import { getUserProfile } from "../services/firestore";

const router = Router();

// 有効なカテゴリ一覧
const VALID_CATEGORIES: SpotCategory[] = [
  "restroom",
  "rest_area",
  "restaurant",
  "cafe",
  "park",
  "kids_space",
  "nursing_room",
  "elevator",
  "parking",
  "other",
];

/**
 * GET /api/spots/nearby
 * 周辺スポットを検索する
 */
router.get("/nearby", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusMeters = parseInt(req.query.radiusMeters as string, 10) || 500;
    const category = req.query.category as string | undefined;

    // バリデーション
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: "lat と lng は必須です" });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: "lat/lng の値が範囲外です" });
      return;
    }

    if (radiusMeters < 1 || radiusMeters > 5000) {
      res.status(400).json({ error: "radiusMeters は 1〜5000 の範囲で指定してください" });
      return;
    }

    if (category && !VALID_CATEGORIES.includes(category as SpotCategory)) {
      res.status(400).json({ error: `category は ${VALID_CATEGORIES.join(", ")} のいずれかです` });
      return;
    }

    // Google Places API で検索
    let spots: Awaited<ReturnType<typeof searchNearbyPlaces>>;
    try {
      spots = await searchNearbyPlaces(
        lat,
        lng,
        radiusMeters,
        category as SpotCategory | undefined
      );
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : String(apiError);
      console.error("Google Places API呼び出しエラー:", message);
      // APIキー未設定・無効、またはPlaces API無効の場合は明確なエラーを返す
      if (message.includes("REQUEST_DENIED") || message.includes("key")) {
        res.status(503).json({ error: "スポット検索サービスが一時的に利用できません" });
        return;
      }
      res.status(502).json({ error: "外部サービスからのスポット検索に失敗しました" });
      return;
    }

    // ユーザープロファイルがあればスコアを再計算
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        for (const spot of spots) {
          // 簡易スコア（詳細取得時に正確なスコアを計算）
          spot.accessibilityScore = 50;
        }
      }
    } catch (profileError) {
      // プロファイル取得失敗はスポット検索を妨げない
      console.warn("ユーザープロファイル取得エラー（スポット検索は続行）:", profileError);
    }

    // キャッシュに保存（非同期）
    batchCacheSpotSummaries(spots).catch((err) =>
      console.error("スポットキャッシュ保存エラー:", err)
    );

    // 検索履歴を保存（非同期）
    saveSearchHistory(uid, "spot", {
      lat,
      lng,
      radiusMeters,
      category,
      resultCount: spots.length,
    }).catch((err) => console.error("検索履歴保存エラー:", err));

    res.json({ spots });
  } catch (error) {
    console.error("スポット検索エラー:", error);
    res.status(500).json({ error: "スポット検索に失敗しました" });
  }
});

/**
 * GET /api/spots/nearby/yolp
 * Yahoo! YOLP API で周辺スポットを検索する
 */
router.get("/nearby/yolp", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusMeters = parseInt(req.query.radiusMeters as string, 10) || 500;
    const query = req.query.query as string | undefined;

    // バリデーション
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: "lat と lng は必須です" });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({ error: "lat/lng の値が範囲外です" });
      return;
    }

    if (radiusMeters < 1 || radiusMeters > 50000) {
      res.status(400).json({ error: "radiusMeters は 1〜50000 の範囲で指定してください" });
      return;
    }

    let spots: Awaited<ReturnType<typeof searchNearbyYOLP>>;
    try {
      spots = await searchNearbyYOLP(lat, lng, radiusMeters, query);
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : String(apiError);
      console.error("YOLP API呼び出しエラー:", message);
      if (message.includes("YOLP_APP_ID")) {
        res.status(503).json({ error: "YOLPスポット検索サービスが一時的に利用できません" });
        return;
      }
      res.status(502).json({ error: "YOLP外部サービスからのスポット検索に失敗しました" });
      return;
    }

    // 検索履歴を保存（非同期）
    saveSearchHistory(uid, "spot", {
      lat,
      lng,
      radiusMeters,
      query,
      resultCount: spots.length,
    }).catch((err) => console.error("検索履歴保存エラー:", err));

    res.json({ spots });
  } catch (error) {
    console.error("YOLPスポット検索エラー:", error);
    res.status(500).json({ error: "YOLPスポット検索に失敗しました" });
  }
});

/**
 * GET /api/spots/:spotId
 * スポット詳細を取得する
 */
router.get("/:spotId", async (req, res) => {
  try {
    const { uid } = req as unknown as AuthenticatedRequest;
    const { spotId } = req.params;

    if (!spotId) {
      res.status(400).json({ error: "spotId は必須です" });
      return;
    }

    // まずキャッシュを確認
    let spot = await getSpotFromCache(spotId);

    // キャッシュになければFirestoreを確認
    if (!spot) {
      spot = await getSpotDetail(spotId);
    }

    // Firestoreにもなければ Google Places API で取得
    if (!spot) {
      spot = await getPlaceDetails(spotId);

      if (!spot) {
        res.status(404).json({ error: "スポットが見つかりません" });
        return;
      }

      // ユーザープロファイルがあればスコアを計算
      const profile = await getUserProfile(uid);
      if (profile) {
        spot.accessibilityScore = calculateSpotScore(spot.accessibility, profile);
      }

      // キャッシュに保存（非同期）
      cacheSpotDetail(spot).catch((err) =>
        console.error("スポット詳細キャッシュ保存エラー:", err)
      );
    }

    res.json(spot);
  } catch (error) {
    console.error("スポット詳細取得エラー:", error);
    res.status(500).json({ error: "スポット詳細の取得に失敗しました" });
  }
});

export default router;
