// Firebase Auth トークン検証ミドルウェア

import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";

// 認証済みリクエストの型拡張
export interface AuthenticatedRequest extends Request {
  uid: string;
}

/**
 * Firebase Auth IDトークンを検証するミドルウェア
 * Authorization ヘッダーから Bearer トークンを取得し、検証する
 */
export const verifyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "認証トークンが必要です" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as AuthenticatedRequest).uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: "無効な認証トークンです" });
  }
};
