// 会話管理サービス

import * as admin from "firebase-admin";
import { Conversation, ConversationMessage, ChatRole } from "../types";
import { v4Fallback } from "../utils/uuid";

const getDb = () => admin.firestore();

// コレクション参照
const conversationsCollection = () => getDb().collection("conversations");

// 会話の有効期限（30日）
const CONVERSATION_TTL_DAYS = 30;

/**
 * 新しい会話を作成する
 */
export const createConversation = async (userId: string): Promise<Conversation> => {
  const now = admin.firestore.Timestamp.now();
  const expiresAt = admin.firestore.Timestamp.fromMillis(
    now.toMillis() + CONVERSATION_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  const conversationId = v4Fallback("conv");

  const conversation: Conversation = {
    conversationId,
    userId,
    messages: [],
    createdAt: now,
    updatedAt: now,
    expiresAt,
  };

  await conversationsCollection().doc(conversationId).set(conversation);
  return conversation;
};

/**
 * 会話を取得する
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  const doc = await conversationsCollection().doc(conversationId).get();
  if (!doc.exists) return null;
  return doc.data() as Conversation;
};

/**
 * 会話にメッセージを追加する
 */
export const addMessage = async (
  conversationId: string,
  role: ChatRole,
  content: string
): Promise<void> => {
  const now = admin.firestore.Timestamp.now();
  const message: ConversationMessage = {
    role,
    content,
    timestamp: now,
  };

  await conversationsCollection().doc(conversationId).update({
    messages: admin.firestore.FieldValue.arrayUnion(message),
    updatedAt: now,
  });
};

/**
 * ユーザーの会話一覧を取得する（直近10件）
 */
export const getUserConversations = async (
  userId: string,
  limit = 10
): Promise<Conversation[]> => {
  const snapshot = await conversationsCollection()
    .where("userId", "==", userId)
    .orderBy("updatedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as Conversation);
};

/**
 * 期限切れの会話を削除する（定期実行用）
 */
export const deleteExpiredConversations = async (): Promise<number> => {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await conversationsCollection()
    .where("expiresAt", "<=", now)
    .limit(100)
    .get();

  if (snapshot.empty) return 0;

  const batch = getDb().batch();
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();
  return snapshot.size;
};
