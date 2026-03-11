// アクセシビリティスコア計算ロジック

import { RouteStep, UserProfile, SpotSummary } from "../types";

/**
 * ルートのアクセシビリティスコアを計算する
 * スコアは 0-100 の範囲で、高いほどアクセシブル
 *
 * 基本ペナルティ:
 * - 階段回避時: 1箇所あたり -30
 * - 急勾配(>8%)回避時: -25、中勾配(5-8%): -15
 * - 未舗装路（車椅子/ベビーカー）: -20
 *
 * 加点要素（nearbySpots指定時）:
 * - 希望条件に合うスポットが近くにある場合 +5（上限15）
 */
export const calculateRouteScore = (
  steps: RouteStep[],
  profile: UserProfile,
  nearbySpots?: SpotSummary[]
): number => {
  if (steps.length === 0) return 100;

  let totalPenalty = 0;
  let totalBonus = 0;
  const avoidSet = new Set(profile.avoidConditions);
  const preferSet = new Set(profile.preferConditions);

  for (const step of steps) {
    // 階段ペナルティ
    if (step.hasStairs && avoidSet.has("stairs")) {
      totalPenalty += 30;
    }

    // 急勾配ペナルティ
    if (step.hasSlope && avoidSet.has("slope")) {
      const grade = step.slopeGrade ?? 0;
      if (grade > 8) {
        totalPenalty += 25;
      } else if (grade >= 5) {
        totalPenalty += 15;
      }
    }

    // 未舗装路ペナルティ（車椅子・ベビーカー使用時）
    if (
      step.surfaceType &&
      step.surfaceType !== "paved" &&
      (profile.mobilityType === "wheelchair" || profile.mobilityType === "stroller")
    ) {
      totalPenalty += 20;
    }
  }

  // 乗り換えペナルティ（transit モードの場合）
  // transitDetail を持つステップ数から乗り換え回数を算出
  const transitSteps = steps.filter((s) => s.transitDetail);
  const transferCount = Math.max(0, transitSteps.length - 1);
  if (transferCount > 0) {
    // 1回の乗り換えにつき -10、車椅子・ベビーカー・高齢者同行時は -15
    const isHighImpact =
      profile.mobilityType === "wheelchair" ||
      profile.mobilityType === "stroller" ||
      profile.companions.includes("elderly");
    const penaltyPerTransfer = isHighImpact ? 15 : 10;
    totalPenalty += transferCount * penaltyPerTransfer;
  }

  // 希望条件に基づくボーナス（近くにスポットがある場合）
  if (nearbySpots && nearbySpots.length > 0) {
    for (const spot of nearbySpots) {
      if (preferSet.has("restroom") && spot.category === "restroom") {
        totalBonus += 5;
      }
      if (preferSet.has("rest_area") && (spot.category === "rest_area" || spot.category === "park")) {
        totalBonus += 5;
      }
    }
    // ボーナス上限: 15点
    totalBonus = Math.min(totalBonus, 15);
  }

  // 0-100 の範囲にクランプ
  return Math.max(0, Math.min(100, 100 - totalPenalty + totalBonus));
};

/**
 * 同行者・モビリティタイプを考慮した拡張スコアを計算する
 * ルート検索結果のランキング用（表示スコアではなくソート用）
 */
export const calculateWeightedRouteScore = (
  steps: RouteStep[],
  profile: UserProfile,
  nearbySpots?: SpotSummary[]
): number => {
  const weights = calculateCompanionWeights(profile);
  const avoidSet = new Set(profile.avoidConditions);

  // ペナルティをカテゴリ別に計算し、それぞれに対応する重みを適用
  let stairsPenalty = 0;
  let slopePenalty = 0;
  let otherPenalty = 0;

  for (const step of steps) {
    // 階段ペナルティ
    if (step.hasStairs && avoidSet.has("stairs")) {
      stairsPenalty += 30;
    }

    // 勾配ペナルティ
    if (step.hasSlope && avoidSet.has("slope")) {
      const grade = step.slopeGrade ?? 0;
      if (grade >= 5) {
        slopePenalty += grade > 8 ? 25 : 15;
      }
    }

    // 未舗装路ペナルティ
    if (
      step.surfaceType &&
      step.surfaceType !== "paved" &&
      (profile.mobilityType === "wheelchair" || profile.mobilityType === "stroller")
    ) {
      otherPenalty += 20;
    }
  }

  // 乗り換えペナルティ
  const transitSteps = steps.filter((s) => s.transitDetail);
  const transferCount = Math.max(0, transitSteps.length - 1);
  if (transferCount > 0) {
    const isHighImpact =
      profile.mobilityType === "wheelchair" ||
      profile.mobilityType === "stroller" ||
      profile.companions.includes("elderly");
    const penaltyPerTransfer = isHighImpact ? 15 : 10;
    otherPenalty += transferCount * penaltyPerTransfer;
  }

  // 各カテゴリのペナルティに対応する重みを適用
  const weightedPenalty =
    stairsPenalty * weights.stairsPenalty +
    slopePenalty * weights.slopePenalty +
    otherPenalty * weights.otherPenalty;

  // ボーナス計算
  let totalBonus = 0;
  if (nearbySpots && nearbySpots.length > 0) {
    const preferSet = new Set(profile.preferConditions);
    for (const spot of nearbySpots) {
      if (preferSet.has("restroom") && spot.category === "restroom") {
        totalBonus += 5;
      }
      if (preferSet.has("rest_area") && (spot.category === "rest_area" || spot.category === "park")) {
        totalBonus += 5;
      }
    }
    totalBonus = Math.min(totalBonus, 15);
  }

  return Math.max(0, Math.min(100, Math.round(100 - weightedPenalty + totalBonus)));
};

/**
 * 同行者に応じたペナルティ重み係数を計算する
 */
const calculateCompanionWeights = (
  profile: UserProfile
): { stairsPenalty: number; slopePenalty: number; otherPenalty: number } => {
  let stairsPenalty = 1.0;
  let slopePenalty = 1.0;
  let otherPenalty = 1.0;

  for (const companion of profile.companions) {
    switch (companion) {
      case "child":
        stairsPenalty = Math.max(stairsPenalty, 1.3);
        slopePenalty = Math.max(slopePenalty, 1.2);
        otherPenalty = Math.max(otherPenalty, 1.2);
        break;
      case "elderly":
        stairsPenalty = Math.max(stairsPenalty, 1.5);
        slopePenalty = Math.max(slopePenalty, 1.5);
        otherPenalty = Math.max(otherPenalty, 1.3);
        break;
      case "disability":
        stairsPenalty = Math.max(stairsPenalty, 2.0);
        slopePenalty = Math.max(slopePenalty, 1.5);
        otherPenalty = Math.max(otherPenalty, 1.5);
        break;
    }
  }

  return { stairsPenalty, slopePenalty, otherPenalty };
};

/**
 * スポットのアクセシビリティスコアを計算する
 * スコアは 0-100 の範囲で、高いほどアクセシブル
 */
export const calculateSpotScore = (
  accessibility: {
    wheelchairAccessible: boolean;
    hasElevator: boolean;
    hasAccessibleRestroom: boolean;
    hasBabyChangingStation: boolean;
    hasNursingRoom: boolean;
    floorType: string;
  },
  profile: UserProfile
): number => {
  let score = 50; // 基準スコア

  // 車椅子対応
  if (accessibility.wheelchairAccessible) {
    score += profile.mobilityType === "wheelchair" ? 20 : 10;
  }

  // エレベーターあり
  if (accessibility.hasElevator) {
    score += 10;
  }

  // バリアフリートイレあり
  if (accessibility.hasAccessibleRestroom) {
    score += 10;
  }

  // おむつ交換台あり（子連れの場合加点）
  if (accessibility.hasBabyChangingStation && profile.companions.includes("child")) {
    score += 10;
  }

  // 授乳室あり（子連れの場合加点）
  if (accessibility.hasNursingRoom && profile.companions.includes("child")) {
    score += 10;
  }

  // フラットな床
  if (accessibility.floorType === "flat") {
    score += 10;
  } else if (accessibility.floorType === "steps") {
    score -= 20;
  }

  // 0-100 の範囲にクランプ
  return Math.max(0, Math.min(100, score));
};

/**
 * ルートに対する警告メッセージを生成する
 */
export const generateWarnings = (steps: RouteStep[], profile: UserProfile): string[] => {
  const warnings: string[] = [];
  const avoidSet = new Set(profile.avoidConditions);

  let stairsCount = 0;
  let steepSlopeCount = 0;
  let unpavedCount = 0;

  for (const step of steps) {
    if (step.hasStairs) stairsCount++;
    if (step.hasSlope && (step.slopeGrade ?? 0) > 8) steepSlopeCount++;
    if (step.surfaceType && step.surfaceType !== "paved") unpavedCount++;
  }

  if (stairsCount > 0 && avoidSet.has("stairs")) {
    warnings.push(`このルートには${stairsCount}箇所の階段があります`);
  } else if (
    stairsCount > 0 &&
    (profile.companions.includes("elderly") || profile.companions.includes("disability"))
  ) {
    // avoidConditions に stairs がなくても、高齢者・障がい者同行時は警告を出す
    warnings.push(`このルートには${stairsCount}箇所の階段があります（同行者にご注意ください）`);
  } else if (
    stairsCount > 0 &&
    (profile.mobilityType === "wheelchair" || profile.mobilityType === "stroller")
  ) {
    // 車椅子・ベビーカー使用時は avoidConditions に stairs がなくても階段を警告
    const label = profile.mobilityType === "wheelchair" ? "車椅子" : "ベビーカー";
    warnings.push(`このルートには${stairsCount}箇所の階段があります（${label}でのご利用にご注意ください）`);
  } else if (stairsCount > 0 && profile.mobilityType === "cane") {
    // 杖使用時も階段を警告
    warnings.push(`このルートには${stairsCount}箇所の階段があります（杖でのご利用にご注意ください）`);
  }

  if (steepSlopeCount > 0 && avoidSet.has("slope")) {
    warnings.push(`このルートには${steepSlopeCount}箇所の急な坂道があります`);
  } else if (
    steepSlopeCount > 0 &&
    (profile.companions.includes("elderly") || profile.companions.includes("disability"))
  ) {
    // avoidConditions に slope がなくても、高齢者・障がい者同行時は警告を出す
    warnings.push(`このルートには${steepSlopeCount}箇所の急な坂道があります（同行者にご注意ください）`);
  } else if (
    steepSlopeCount > 0 &&
    (profile.mobilityType === "wheelchair" || profile.mobilityType === "stroller")
  ) {
    // 車椅子・ベビーカー使用時は坂道も警告
    const label = profile.mobilityType === "wheelchair" ? "車椅子" : "ベビーカー";
    warnings.push(`このルートには${steepSlopeCount}箇所の急な坂道があります（${label}でのご利用にご注意ください）`);
  } else if (steepSlopeCount > 0 && profile.mobilityType === "cane") {
    // 杖使用時も急坂を警告
    warnings.push(`このルートには${steepSlopeCount}箇所の急な坂道があります（杖でのご利用にご注意ください）`);
  }

  if (
    unpavedCount > 0 &&
    (profile.mobilityType === "wheelchair" || profile.mobilityType === "stroller")
  ) {
    warnings.push(`このルートには${unpavedCount}箇所の未舗装区間があります`);
  }

  // 乗り換え回数の警告
  const transitStepCount = steps.filter((s) => s.transitDetail).length;
  const transfers = Math.max(0, transitStepCount - 1);
  if (transfers >= 2) {
    warnings.push(`このルートは${transfers}回の乗り換えが必要です`);
  }

  return warnings;
};
