// AIチャット関連のルーティング

import { Router } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import * as aiProxy from "../services/aiProxy";
import { getUserProfile, mergeExtractedNeeds } from "../services/firestore";
import { ChatRequest, ExtractNeedsRequest, MergeOptions } from "../types";
import {
  createConversation,
  addMessage,
} from "../services/conversation";

const router = Router();

/**
 * POST /api/chat
 * AIチャット応答を取得する
 * stream=true クエリパラメータでSSEストリーミングモードに切り替え
 */
router.post("/", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const chatRequest = req.body as ChatRequest;

    // バリデーション: userId
    if (!chatRequest.userId || typeof chatRequest.userId !== "string") {
      res.status(400).json({ error: "userId は必須です" });
      return;
    }

    // バリデーション: message
    if (!chatRequest.message || typeof chatRequest.message !== "string") {
      res.status(400).json({ error: "message は必須です" });
      return;
    }

    if (chatRequest.message.length > 2000) {
      res.status(400).json({ error: "message は2000文字以内にしてください" });
      return;
    }

    // 認可チェック: リクエストの userId が認証済み uid と一致するか確認
    if (chatRequest.userId !== uid) {
      res.status(403).json({ error: "Unauthorized: user ID mismatch" });
      return;
    }

    // バリデーション: conversationHistory
    if (!Array.isArray(chatRequest.conversationHistory)) {
      res.status(400).json({ error: "conversationHistory は配列である必要があります" });
      return;
    }

    // ユーザープロファイルを取得してコンテキストとして渡す
    const profile = await getUserProfile(uid);

    // SSEストリーミングモードかどうか判定
    const isStream = req.query.stream === "true";

    if (isStream) {
      // SSEストリーミングモード
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      try {
        const result = await aiProxy.streamChat(
          uid,
          chatRequest.message,
          chatRequest.conversationHistory,
          profile,
          res
        );

        // extractedNeeds がある場合、プロファイルに自動マージ（confidence を渡す）
        if (result.extractedNeeds && Object.keys(result.extractedNeeds).length > 0) {
          const mergeOpts: MergeOptions = {
            confidence: result.confidence,
            source: "chat-stream",
          };
          mergeExtractedNeeds(uid, result.extractedNeeds, mergeOpts).catch((err) =>
            console.error("プロファイルマージエラー:", err)
          );
        }

        // 会話履歴をFirestoreに保存（非同期）
        saveConversationAsync(uid, chatRequest.message, result.reply);
      } catch (streamError) {
        console.error("ストリーミングエラー:", streamError);
        // ストリーミング中のエラーはSSEイベントで通知
        res.write(`data: ${JSON.stringify({ error: "ストリーミング中にエラーが発生しました" })}\n\n`);
        res.end();
      }
    } else {
      // 非ストリーミングモード
      const response = await aiProxy.chat(
        uid,
        chatRequest.message,
        chatRequest.conversationHistory,
        profile
      );

      // extractedNeeds がある場合、プロファイルに自動マージ（confidence を渡す）
      if (response.extractedNeeds && Object.keys(response.extractedNeeds).length > 0) {
        const mergeOpts: MergeOptions = {
          confidence: response.confidence,
          source: "chat",
        };
        mergeExtractedNeeds(uid, response.extractedNeeds, mergeOpts).catch((err) =>
          console.error("プロファイルマージエラー:", err)
        );
      }

      // 会話履歴をFirestoreに保存（非同期）
      saveConversationAsync(uid, chatRequest.message, response.reply);

      res.json(response);
    }
  } catch (error) {
    console.error("チャットエラー:", error);
    res.status(500).json({ error: "チャット応答の取得に失敗しました" });
  }
});

/**
 * POST /api/extract-needs
 * 会話からユーザーニーズを抽出する
 */
router.post("/extract-needs", async (req, res) => {
  try {
    const { uid } = req as AuthenticatedRequest;
    const extractRequest = req.body as ExtractNeedsRequest;

    // バリデーション: userId
    if (!extractRequest.userId || typeof extractRequest.userId !== "string") {
      res.status(400).json({ error: "userId は必須です" });
      return;
    }

    // 認可チェック: リクエストの userId が認証済み uid と一致するか確認
    if (extractRequest.userId !== uid) {
      res.status(403).json({ error: "Unauthorized: user ID mismatch" });
      return;
    }

    // バリデーション: conversationHistory
    if (
      !extractRequest.conversationHistory ||
      !Array.isArray(extractRequest.conversationHistory) ||
      extractRequest.conversationHistory.length === 0
    ) {
      res.status(400).json({ error: "conversationHistory は必須です" });
      return;
    }

    const response = await aiProxy.extractNeeds(uid, extractRequest.conversationHistory);

    // 抽出結果をプロファイルにマージ（confidence を渡す）
    if (response.needs && Object.keys(response.needs).length > 0) {
      const mergeOpts: MergeOptions = {
        confidence: response.confidence,
        source: "extract-needs",
      };
      mergeExtractedNeeds(uid, response.needs, mergeOpts).catch((err) =>
        console.error("プロファイルマージエラー:", err)
      );
    }

    res.json(response);
  } catch (error) {
    console.error("ニーズ抽出エラー:", error);
    res.status(500).json({ error: "ニーズ抽出に失敗しました" });
  }
});

/**
 * 会話履歴をFirestoreに非同期保存する
 * レスポンスをブロックしないよう非同期で実行
 */
const saveConversationAsync = (userId: string, userMessage: string, aiReply: string): void => {
  (async () => {
    try {
      // 新しい会話を作成
      const conversation = await createConversation(userId);
      // ユーザーメッセージとAI応答を保存
      await addMessage(conversation.conversationId, "user", userMessage);
      await addMessage(conversation.conversationId, "assistant", aiReply);
    } catch (err) {
      console.error("会話履歴保存エラー:", err);
    }
  })();
};

export default router;
