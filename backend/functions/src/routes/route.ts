// ルート検索関連のルーティング

import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { RouteRequest, RouteResponse, RouteResult, RoutePriority, TransportMode, SpotSummary } from "../types";
import { Timestamp } from "firebase-admin/firestore";
import { searchRoutes, searchNearbyPlaces } from "../services/mapsApi";
import { getUserProfile, saveSearchHistory } from "../services/firestore";
import { calculateRouteScore, calculateWeightedRouteScore, generateWarnings } from "../utils/scoring";
import { v4Fallback } from "../utils/uuid";

const router = Router();

// バリデーション用の定数
const VALID_PRIORITIES: RoutePriority[] = ["shortest", "safest", "accessible"];
const VALID_MODES: TransportMode[] = ["walking", "transit", "driving", "bicycling"];

/**
 * POST /api/route/search
 * バリアフリールートを検索する
 */
router.post("/search", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const routeRequest = req.body as RouteRequest;

    // バリデーション
    if (
      !routeRequest.origin ||
      typeof routeRequest.origin.lat !== "number" ||
      typeof routeRequest.origin.lng !== "number"
    ) {
      res.status(400).json({ error: "origin（lat, lng）は必須です" });
      return;
    }

    if (
      !routeRequest.destination ||
      typeof routeRequest.destination.lat !== "number" ||
      typeof routeRequest.destination.lng !== "number"
    ) {
      res.status(400).json({ error: "destination（lat, lng）は必須です" });
      return;
    }

    // 座標範囲バリデーション
    if (
      routeRequest.origin.lat < -90 || routeRequest.origin.lat > 90 ||
      routeRequest.origin.lng < -180 || routeRequest.origin.lng > 180
    ) {
      res.status(400).json({ error: "origin の座標が範囲外です（lat: -90〜90, lng: -180〜180）" });
      return;
    }

    if (
      routeRequest.destination.lat < -90 || routeRequest.destination.lat > 90 ||
      routeRequest.destination.lng < -180 || routeRequest.destination.lng > 180
    ) {
      res.status(400).json({ error: "destination の座標が範囲外です（lat: -90〜90, lng: -180〜180）" });
      return;
    }

    if (!routeRequest.userProfileId) {
      res.status(400).json({ error: "userProfileId は必須です" });
      return;
    }

    if (routeRequest.prioritize && !VALID_PRIORITIES.includes(routeRequest.prioritize)) {
      res.status(400).json({ error: "prioritize は shortest, safest, accessible のいずれかです" });
      return;
    }

    if (routeRequest.mode && !VALID_MODES.includes(routeRequest.mode)) {
      res.status(400).json({ error: "mode は walking, transit, driving, bicycling のいずれかです" });
      return;
    }

    // ユーザープロファイル取得（未作成の場合はデフォルトで続行）
    const profile = await getUserProfile(routeRequest.userProfileId) ?? {
      userId: uid,
      mobilityType: "walk",
      companions: [],
      maxDistanceMeters: 5000,
      preferConditions: [],
      avoidConditions: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Google Maps Directions API でルート取得
    const rawRoutes = await searchRoutes(
      routeRequest.origin,
      routeRequest.destination,
      routeRequest.prioritize ?? "accessible",
      routeRequest.mode ?? "walking"
    );

    // 各ルートに対してスコア計算・警告生成・近隣スポット取得
    const routes = await Promise.all(
      rawRoutes.map(async (rawRoute, index) => {
        // ルートの中間地点で周辺スポットを検索（希望条件がある場合）
        let nearbySpots: SpotSummary[] = [];
        if (profile.preferConditions.length > 0 && rawRoute.steps.length > 0) {
          const midIdx = Math.floor(rawRoute.steps.length / 2);
          const midPoint = rawRoute.steps[midIdx].startLocation;
          try {
            nearbySpots = await searchNearbyPlaces(midPoint.lat, midPoint.lng, 300);
          } catch {
            nearbySpots = [];
          }
        }

        // 同行者の重みを考慮したスコアを使用（ランキングと表示の両方に適用）
        const accessibilityScore = profile.companions.length > 0
          ? calculateWeightedRouteScore(rawRoute.steps, profile, nearbySpots)
          : calculateRouteScore(rawRoute.steps, profile, nearbySpots);
        const warnings = generateWarnings(rawRoute.steps, profile);

        return {
          routeId: v4Fallback(`route_${index}`),
          accessibilityScore,
          distanceMeters: rawRoute.distanceMeters,
          durationMinutes: Math.round(rawRoute.durationSeconds / 60),
          steps: rawRoute.steps,
          warnings,
          nearbySpots: nearbySpots ?? [],
        };
      })
    );

    // アクセシビリティスコア順にソート（prioritize に応じて）
    const typedRoutes = routes as RouteResult[];
    if (routeRequest.prioritize === "accessible" || routeRequest.prioritize === "safest") {
      typedRoutes.sort((a, b) => b.accessibilityScore - a.accessibilityScore);
    } else {
      typedRoutes.sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    const response: RouteResponse = { routes: typedRoutes };

    // 検索履歴を非同期で保存（レスポンスを待たない）
    saveSearchHistory(uid, "route", {
      origin: routeRequest.origin,
      destination: routeRequest.destination,
      prioritize: routeRequest.prioritize,
      resultCount: routes.length,
    }).catch((err) => console.error("検索履歴保存エラー:", err));

    res.json(response);
  } catch (error) {
    console.error("ルート検索エラー:", error);
    res.status(500).json({ error: "ルート検索に失敗しました" });
  }
});

export default router;
