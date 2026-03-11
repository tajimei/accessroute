// Firestore アクセスヘルパー

import * as admin from "firebase-admin";
import {
  UserProfile,
  UserProfileInput,
  SpotDetail,
  SpotSummary,
  Companion,
  AvoidCondition,
  PreferCondition,
  MobilityType,
  MergeOptions,
  MergeResult,
  MergeHistoryEntry,
} from "../types";

const getDb = () => admin.firestore();

// コレクション参照
const usersCollection = () => getDb().collection("users");
const spotsCollection = () => getDb().collection("spots");
const spotsCacheCollection = () => getDb().collection("spots_cache");
const searchHistoryCollection = () => getDb().collection("search_history");
const mergeHistoryCollection = () => getDb().collection("merge_history");

// キャッシュの有効期限（24時間）
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ============================================================
// マージ関連の定数
// ============================================================

/** confidence がこの閾値未満の場合、マージをスキップする */
const CONFIDENCE_THRESHOLD = 0.5;

/** 配列フィールドの最大要素数 */
const MAX_ARRAY_LENGTH: Record<string, number> = {
  companions: 10,
  avoidConditions: 20,
  preferConditions: 20,
};

/** マージ履歴の最大保存件数（ユーザーあたり） */
const MAX_MERGE_HISTORY = 50;

/** MobilityType の有効値セット */
const VALID_MOBILITY_TYPES: ReadonlySet<string> = new Set<MobilityType>([
  "wheelchair",
  "stroller",
  "cane",
  "walk",
  "other",
]);

/** Companion の有効値セット */
const VALID_COMPANIONS: ReadonlySet<string> = new Set<Companion>([
  "child",
  "elderly",
  "disability",
]);

/** AvoidCondition の有効値セット */
const VALID_AVOID_CONDITIONS: ReadonlySet<string> = new Set<AvoidCondition>([
  "stairs",
  "slope",
  "crowd",
  "dark",
]);

/** PreferCondition の有効値セット */
const VALID_PREFER_CONDITIONS: ReadonlySet<string> = new Set<PreferCondition>([
  "restroom",
  "rest_area",
  "covered",
]);

/** mobilityType の矛盾ペア定義（同時に成立しにくい組み合わせ） */
const MOBILITY_CONFLICT_PAIRS: ReadonlyArray<[MobilityType, MobilityType]> = [
  ["wheelchair", "walk"],
  ["wheelchair", "cane"],
  ["stroller", "cane"],
];

/** maxDistanceMeters の有効範囲 */
const MIN_DISTANCE_METERS = 50;
const MAX_DISTANCE_METERS = 50000;

// ============================================================
// ユーザープロファイル
// ============================================================

/**
 * ユーザープロファイルを取得する
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const doc = await usersCollection().doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
};

/**
 * ユーザープロファイルを作成・更新する
 */
export const upsertUserProfile = async (
  userId: string,
  input: UserProfileInput
): Promise<UserProfile> => {
  const now = admin.firestore.Timestamp.now();
  const existingProfile = await getUserProfile(userId);

  const profileData: UserProfile = {
    userId,
    mobilityType: input.mobilityType,
    companions: input.companions ?? [],
    maxDistanceMeters: input.maxDistanceMeters ?? 1000,
    avoidConditions: input.avoidConditions ?? [],
    preferConditions: input.preferConditions ?? [],
    createdAt: existingProfile?.createdAt ?? now,
    updatedAt: now,
  };

  await usersCollection().doc(userId).set(profileData, { merge: true });
  return profileData;
};

// ============================================================
// バリデーションヘルパー
// ============================================================

/**
 * MobilityType の値が有効かどうか検証する
 */
const isValidMobilityType = (value: unknown): value is MobilityType => {
  return typeof value === "string" && VALID_MOBILITY_TYPES.has(value);
};

/**
 * 配列フィールドの各要素が有効な値かどうかフィルタリングする
 */
const filterValidValues = <T extends string>(
  values: T[],
  validSet: ReadonlySet<string>
): T[] => {
  return values.filter((v) => typeof v === "string" && validSet.has(v));
};

/**
 * maxDistanceMeters が有効な範囲内かどうか検証する
 */
const isValidDistance = (value: unknown): value is number => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= MIN_DISTANCE_METERS &&
    value <= MAX_DISTANCE_METERS
  );
};

// ============================================================
// 矛盾検出ヘルパー
// ============================================================

/**
 * mobilityType の変更が既存値と矛盾するかどうか検出する
 * 例: 既存 wheelchair → 新規 walk は矛盾の可能性あり
 */
const detectMobilityConflict = (
  existingType: MobilityType,
  newType: MobilityType
): boolean => {
  if (existingType === newType) return false;
  return MOBILITY_CONFLICT_PAIRS.some(
    ([a, b]) =>
      (existingType === a && newType === b) ||
      (existingType === b && newType === a)
  );
};

// ============================================================
// マージ履歴管理
// ============================================================

/**
 * マージ履歴を保存する（undo のため）
 * 古い履歴は MAX_MERGE_HISTORY を超えた分を削除する
 */
const saveMergeHistory = async (entry: MergeHistoryEntry): Promise<void> => {
  // 新しい履歴を追加
  await mergeHistoryCollection().add(entry);

  // 古い履歴を削除（MAX_MERGE_HISTORY を超えた分）
  const snapshot = await mergeHistoryCollection()
    .where("userId", "==", entry.userId)
    .orderBy("mergedAt", "desc")
    .offset(MAX_MERGE_HISTORY)
    .get();

  if (!snapshot.empty) {
    const batch = getDb().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
};

/**
 * ユーザーのマージ履歴を取得する（直近の件数指定可能）
 */
export const getMergeHistory = async (
  userId: string,
  limit = 10
): Promise<MergeHistoryEntry[]> => {
  const snapshot = await mergeHistoryCollection()
    .where("userId", "==", userId)
    .orderBy("mergedAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return { ...data, historyId: doc.id } as MergeHistoryEntry;
  });
};

/**
 * マージ履歴を使ってプロファイルを直前の状態に巻き戻す（undo）
 */
export const undoLastMerge = async (
  userId: string
): Promise<UserProfile | null> => {
  const history = await getMergeHistory(userId, 1);
  if (history.length === 0) return null;

  const lastEntry = history[0];
  const now = admin.firestore.Timestamp.now();

  // beforeSnapshot の値で上書きして巻き戻す
  const restoreData: Record<string, unknown> = {
    ...lastEntry.beforeSnapshot,
    updatedAt: now,
  };

  // fieldUpdatedAt も巻き戻す（beforeSnapshot に含まれていない場合はクリア）
  delete restoreData.createdAt;
  delete restoreData.userId;

  await usersCollection().doc(userId).update(restoreData);

  // 使用済み履歴を削除
  if (lastEntry.historyId) {
    await mergeHistoryCollection().doc(lastEntry.historyId).delete();
  }

  return getUserProfile(userId);
};

// ============================================================
// メインマージロジック
// ============================================================

/**
 * AIが抽出したニーズを既存プロファイルにマージする（改善版）
 *
 * マージ戦略:
 * - confidence が閾値未満の場合はマージをスキップ
 * - 空・null のフィールドは上書きしない
 * - 配列フィールドは既存値とユニオン（重複排除 + 最大数制限）
 * - スカラーフィールドは矛盾検出後、問題なければ上書き
 * - 矛盾検出時は上書きせず conflictFlags を設定
 * - フィールドごとの更新タイムスタンプを記録
 * - マージ履歴を保存（undo 可能）
 * - 不正な値はバリデーションで除外
 */
export const mergeExtractedNeeds = async (
  userId: string,
  extractedNeeds: Partial<UserProfile>,
  options: MergeOptions = {}
): Promise<MergeResult | null> => {
  const { confidence = 1.0, source = "ai-extract" } = options;

  const existing = await getUserProfile(userId);
  if (!existing) return null;

  // confidence チェック: 閾値未満ならスキップ
  if (confidence < CONFIDENCE_THRESHOLD) {
    return {
      profile: existing,
      skipped: true,
      skipReason: `confidence ${confidence} が閾値 ${CONFIDENCE_THRESHOLD} 未満のためスキップ`,
      conflicts: [],
      updatedFields: [],
    };
  }

  const now = admin.firestore.Timestamp.now();
  const updates: Record<string, unknown> = { updatedAt: now };
  const fieldTimestamps: Record<string, admin.firestore.Timestamp> = {
    ...(existing.fieldUpdatedAt ?? {}),
  };
  const conflicts: string[] = [];
  const updatedFields: string[] = [];

  // --- mobilityType ---
  if (extractedNeeds.mobilityType) {
    if (!isValidMobilityType(extractedNeeds.mobilityType)) {
      // 不正な値は無視
      console.warn(
        `不正な mobilityType を検出: ${extractedNeeds.mobilityType}`
      );
    } else if (detectMobilityConflict(existing.mobilityType, extractedNeeds.mobilityType)) {
      // 矛盾検出: 上書きせず conflictFlags に記録
      conflicts.push(
        `mobilityType: 既存「${existing.mobilityType}」と新規「${extractedNeeds.mobilityType}」が矛盾`
      );
    } else {
      updates.mobilityType = extractedNeeds.mobilityType;
      fieldTimestamps.mobilityType = now;
      updatedFields.push("mobilityType");
    }
  }

  // --- maxDistanceMeters ---
  if (extractedNeeds.maxDistanceMeters != null) {
    if (!isValidDistance(extractedNeeds.maxDistanceMeters)) {
      console.warn(
        `不正な maxDistanceMeters を検出: ${extractedNeeds.maxDistanceMeters}（有効範囲: ${MIN_DISTANCE_METERS}〜${MAX_DISTANCE_METERS}）`
      );
    } else {
      updates.maxDistanceMeters = extractedNeeds.maxDistanceMeters;
      fieldTimestamps.maxDistanceMeters = now;
      updatedFields.push("maxDistanceMeters");
    }
  }

  // --- 配列フィールド: バリデーション + ユニオン + 最大数制限 ---
  const mergeArrayField = <T extends string>(
    fieldName: string,
    existingValues: T[],
    newValues: T[] | undefined,
    validSet: ReadonlySet<string>
  ): void => {
    if (!newValues || newValues.length === 0) return;

    // バリデーション: 不正な値をフィルタリング
    const validated = filterValidValues(newValues, validSet);
    if (validated.length === 0) {
      console.warn(`${fieldName}: 有効な値がないためスキップ`);
      return;
    }

    // ユニオン（重複排除）
    const merged = [...new Set([...existingValues, ...validated])] as T[];

    // 最大数制限（古い要素を優先して残す）
    const maxLen = MAX_ARRAY_LENGTH[fieldName] ?? 20;
    const limited = merged.slice(0, maxLen);

    if (limited.length !== existingValues.length ||
      !limited.every((v, i) => v === existingValues[i])) {
      updates[fieldName] = limited;
      fieldTimestamps[fieldName] = now;
      updatedFields.push(fieldName);
    }
  };

  mergeArrayField(
    "companions",
    existing.companions,
    extractedNeeds.companions,
    VALID_COMPANIONS
  );
  mergeArrayField(
    "avoidConditions",
    existing.avoidConditions,
    extractedNeeds.avoidConditions,
    VALID_AVOID_CONDITIONS
  );
  mergeArrayField(
    "preferConditions",
    existing.preferConditions,
    extractedNeeds.preferConditions,
    VALID_PREFER_CONDITIONS
  );

  // conflictFlags を更新（既存のフラグとマージ）
  const allConflicts = [
    ...new Set([...(existing.conflictFlags ?? []), ...conflicts]),
  ];
  if (allConflicts.length > 0) {
    updates.conflictFlags = allConflicts;
  }

  // fieldUpdatedAt を更新
  if (updatedFields.length > 0) {
    updates.fieldUpdatedAt = fieldTimestamps;
  }

  // updatedAt 以外に実質的な更新がなければスキップ
  const hasRealUpdates = updatedFields.length > 0 || conflicts.length > 0;
  if (!hasRealUpdates) {
    return {
      profile: existing,
      skipped: true,
      skipReason: "更新対象のフィールドなし",
      conflicts: [],
      updatedFields: [],
    };
  }

  // マージ前のスナップショットを保存（undo 用）
  const beforeSnapshot: Partial<UserProfile> = {
    mobilityType: existing.mobilityType,
    companions: [...existing.companions],
    maxDistanceMeters: existing.maxDistanceMeters,
    avoidConditions: [...existing.avoidConditions],
    preferConditions: [...existing.preferConditions],
    fieldUpdatedAt: existing.fieldUpdatedAt
      ? { ...existing.fieldUpdatedAt }
      : undefined,
    conflictFlags: existing.conflictFlags
      ? [...existing.conflictFlags]
      : undefined,
  };

  // Firestore に更新を書き込む
  await usersCollection().doc(userId).update(updates);

  const updatedProfile: UserProfile = {
    ...existing,
    ...updates,
    createdAt: existing.createdAt,
  } as UserProfile;

  // マージ後のスナップショット
  const afterSnapshot: Partial<UserProfile> = {
    mobilityType: updatedProfile.mobilityType,
    companions: [...updatedProfile.companions],
    maxDistanceMeters: updatedProfile.maxDistanceMeters,
    avoidConditions: [...updatedProfile.avoidConditions],
    preferConditions: [...updatedProfile.preferConditions],
    fieldUpdatedAt: updatedProfile.fieldUpdatedAt,
    conflictFlags: updatedProfile.conflictFlags,
  };

  // マージ履歴を非同期で保存（レスポンスをブロックしない）
  saveMergeHistory({
    userId,
    beforeSnapshot,
    afterSnapshot,
    appliedChanges: updates,
    confidence,
    conflicts,
    source,
    mergedAt: now,
  }).catch((err) => console.error("マージ履歴保存エラー:", err));

  return {
    profile: updatedProfile,
    skipped: false,
    conflicts,
    updatedFields,
  };
};

/**
 * プロファイルの conflictFlags をクリアする（ユーザーが矛盾を確認・解決した後に呼ぶ）
 */
export const clearConflictFlags = async (
  userId: string,
  fieldsToResolve?: string[]
): Promise<UserProfile | null> => {
  const existing = await getUserProfile(userId);
  if (!existing) return null;

  const currentFlags = existing.conflictFlags ?? [];
  if (currentFlags.length === 0) return existing;

  let newFlags: string[];
  if (fieldsToResolve) {
    // 指定フィールドに関連するフラグのみ除去
    newFlags = currentFlags.filter(
      (flag) => !fieldsToResolve.some((field) => flag.includes(field))
    );
  } else {
    // 全フラグをクリア
    newFlags = [];
  }

  const updates: Record<string, unknown> = {
    conflictFlags: newFlags,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await usersCollection().doc(userId).update(updates);
  return { ...existing, ...updates } as UserProfile;
};

// ============================================================
// スポットデータ（Firestore直接）
// ============================================================

/**
 * Firestoreから周辺スポットを検索する（キャッシュ優先）
 * Geohash未導入のため、キャッシュがなければ空を返す
 */
export const getNearbySpots = async (
  _lat: number,
  _lng: number,
  _radiusMeters: number,
  _category?: string
): Promise<SpotSummary[]> => {
  // Geohash ベースの地理クエリは将来実装
  // 現在はGoogle Places API経由で取得したデータをキャッシュから検索
  return [];
};

/**
 * スポット詳細を取得する（キャッシュ優先）
 */
export const getSpotDetail = async (spotId: string): Promise<SpotDetail | null> => {
  // まずキャッシュを確認
  const cached = await getSpotFromCache(spotId);
  if (cached) return cached;

  // Firestoreの spots コレクションを確認
  const doc = await spotsCollection().doc(spotId).get();
  if (!doc.exists) return null;
  return doc.data() as SpotDetail;
};

// ============================================================
// スポットキャッシュ（Google Places APIの結果をキャッシュ）
// ============================================================

/**
 * キャッシュからスポットデータを取得する
 */
export const getSpotFromCache = async (spotId: string): Promise<SpotDetail | null> => {
  const doc = await spotsCacheCollection().doc(spotId).get();
  if (!doc.exists) return null;

  const data = doc.data();
  if (!data) return null;

  // TTLチェック
  const cachedAt = data.cachedAt?.toMillis?.() ?? 0;
  if (Date.now() - cachedAt > CACHE_TTL_MS) {
    return null; // 期限切れ
  }

  return data.spotDetail as SpotDetail;
};

/**
 * スポットデータをキャッシュに保存する
 */
export const cacheSpotDetail = async (spotDetail: SpotDetail): Promise<void> => {
  await spotsCacheCollection().doc(spotDetail.spotId).set({
    spotDetail,
    cachedAt: admin.firestore.Timestamp.now(),
  });
};

/**
 * 複数のスポットデータをバッチでキャッシュに保存する
 */
export const batchCacheSpotSummaries = async (spots: SpotSummary[]): Promise<void> => {
  if (spots.length === 0) return;

  const batch = getDb().batch();
  const now = admin.firestore.Timestamp.now();

  for (const spot of spots) {
    const ref = spotsCacheCollection().doc(spot.spotId);
    batch.set(
      ref,
      {
        spotSummary: spot,
        cachedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();
};

// ============================================================
// 検索履歴
// ============================================================

/**
 * ユーザーの検索履歴を保存する
 */
export const saveSearchHistory = async (
  userId: string,
  searchType: "route" | "spot",
  query: Record<string, unknown>
): Promise<void> => {
  await searchHistoryCollection().add({
    userId,
    searchType,
    query,
    createdAt: admin.firestore.Timestamp.now(),
  });
};

/**
 * ユーザーの検索履歴を取得する（直近20件）
 */
export const getSearchHistory = async (
  userId: string,
  limit = 20
): Promise<Array<{ searchType: string; query: Record<string, unknown>; createdAt: admin.firestore.Timestamp }>> => {
  const snapshot = await searchHistoryCollection()
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      searchType: data.searchType as string,
      query: data.query as Record<string, unknown>,
      createdAt: data.createdAt as admin.firestore.Timestamp,
    };
  });
};
