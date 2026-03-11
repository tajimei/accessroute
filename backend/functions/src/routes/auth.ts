// 認証・プロファイル関連のルーティング

import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import { getUserProfile, upsertUserProfile } from "../services/firestore";
import { UserProfileInput } from "../types";

const router = Router();

/**
 * GET /api/auth/profile
 * ユーザープロファイルを取得する
 */
router.get("/profile", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const profile = await getUserProfile(uid);

    if (!profile) {
      res.status(404).json({ error: "プロファイルが見つかりません" });
      return;
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "プロファイルの取得に失敗しました" });
  }
});

/**
 * POST /api/auth/profile
 * ユーザープロファイルを作成・更新する
 */
router.post("/profile", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const input = req.body as UserProfileInput;

    // バリデーション: mobilityType は必須
    if (!input.mobilityType) {
      res.status(400).json({ error: "mobilityType は必須です" });
      return;
    }

    const profile = await upsertUserProfile(uid, input);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "プロファイルの保存に失敗しました" });
  }
});

export default router;
