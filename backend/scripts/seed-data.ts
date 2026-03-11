// 初期データ投入スクリプト
// 使い方: npx ts-node scripts/seed-data.ts

import * as admin from "firebase-admin";

// Firebase Admin 初期化（ローカルエミュレータ or サービスアカウント）
admin.initializeApp();

const db = admin.firestore();

// サンプルスポットデータ（東京都内のバリアフリースポット）
const sampleSpots = [
  {
    spotId: "sample_spot_001",
    name: "東京駅 多目的トイレ（丸の内北口）",
    description: "車椅子対応の多目的トイレ。おむつ交換台、オストメイト対応設備あり。",
    category: "restroom",
    location: { lat: 35.6812, lng: 139.7671 },
    address: "東京都千代田区丸の内1丁目",
    accessibilityScore: 90,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["オストメイト対応", "手すりあり"],
    },
    photoUrls: [],
    openingHours: "5:30-24:00",
  },
  {
    spotId: "sample_spot_002",
    name: "皇居外苑 休憩所",
    description: "バリアフリー対応の休憩所。スロープ完備、車椅子でのアクセス可能。",
    category: "rest_area",
    location: { lat: 35.6825, lng: 139.7580 },
    address: "東京都千代田区皇居外苑",
    accessibilityScore: 85,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: false,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: true,
      floorType: "flat",
      notes: ["スロープあり", "ベンチ多数"],
    },
    photoUrls: [],
    openingHours: "9:00-17:00",
  },
  {
    spotId: "sample_spot_003",
    name: "KITTE 丸の内（授乳室・ベビールーム）",
    description: "5階にベビールーム完備。授乳室、おむつ交換台、調乳用温水器あり。",
    category: "nursing_room",
    location: { lat: 35.6808, lng: 139.7653 },
    address: "東京都千代田区丸の内2-7-2",
    accessibilityScore: 95,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: true,
      floorType: "flat",
      notes: ["調乳用温水器あり", "個室授乳室3室"],
    },
    photoUrls: [],
    openingHours: "11:00-21:00",
  },
  {
    spotId: "sample_spot_004",
    name: "日比谷公園",
    description: "広々としたバリアフリー公園。車椅子でも散策しやすい舗装路あり。",
    category: "park",
    location: { lat: 35.6735, lng: 139.7560 },
    address: "東京都千代田区日比谷公園",
    accessibilityScore: 80,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: false,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["舗装散策路あり", "車椅子用トイレ2箇所"],
    },
    photoUrls: [],
    openingHours: "24時間",
  },
  {
    spotId: "sample_spot_005",
    name: "東京ミッドタウン日比谷 バリアフリーレストラン",
    description: "車椅子対応テーブル席のあるレストラン。エレベーター直結。",
    category: "restaurant",
    location: { lat: 35.6741, lng: 139.7589 },
    address: "東京都千代田区有楽町1-1-2",
    accessibilityScore: 88,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["車椅子対応テーブルあり", "アレルギー対応メニューあり"],
    },
    photoUrls: [],
    openingHours: "11:00-23:00",
  },
  {
    spotId: "sample_spot_006",
    name: "丸の内オアゾ エレベーター",
    description: "地下1階から6階まで直通のバリアフリーエレベーター。",
    category: "elevator",
    location: { lat: 35.6827, lng: 139.7646 },
    address: "東京都千代田区丸の内1-6-4",
    accessibilityScore: 92,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: false,
      hasBabyChangingStation: false,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["音声案内あり", "点字ボタンあり", "車椅子対応"],
    },
    photoUrls: [],
  },
  {
    spotId: "sample_spot_007",
    name: "東京国際フォーラム キッズスペース",
    description: "地上広場のキッズスペース。ベビーカーでのアクセス可能。",
    category: "kids_space",
    location: { lat: 35.6769, lng: 139.7638 },
    address: "東京都千代田区丸の内3-5-1",
    accessibilityScore: 82,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: true,
      floorType: "flat",
      notes: ["見守りスタッフあり", "対象年齢3-8歳"],
    },
    photoUrls: [],
    openingHours: "10:00-18:00",
  },
  {
    spotId: "sample_spot_008",
    name: "丸の内パークビル 身障者用駐車場",
    description: "車椅子利用者専用の駐車スペース。エレベーター直結。",
    category: "parking",
    location: { lat: 35.6790, lng: 139.7638 },
    address: "東京都千代田区丸の内2-6-1",
    accessibilityScore: 85,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: false,
      hasBabyChangingStation: false,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["車椅子利用者専用2台分", "予約制"],
    },
    photoUrls: [],
    openingHours: "7:00-23:00",
  },
  {
    spotId: "sample_spot_009",
    name: "スターバックス 丸の内ビル店",
    description: "バリアフリー対応カフェ。車椅子でも入りやすい広い通路。",
    category: "cafe",
    location: { lat: 35.6815, lng: 139.7643 },
    address: "東京都千代田区丸の内2-4-1",
    accessibilityScore: 78,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: false,
      hasBabyChangingStation: false,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["テーブル間隔広め", "ストロー提供あり"],
    },
    photoUrls: [],
    openingHours: "7:00-22:00",
  },
  {
    spotId: "sample_spot_010",
    name: "有楽町マルイ バリアフリートイレ",
    description: "各フロアにバリアフリートイレ設置。オストメイト対応。",
    category: "restroom",
    location: { lat: 35.6749, lng: 139.7630 },
    address: "東京都千代田区有楽町2-7-1",
    accessibilityScore: 87,
    accessibility: {
      wheelchairAccessible: true,
      hasElevator: true,
      hasAccessibleRestroom: true,
      hasBabyChangingStation: true,
      hasNursingRoom: false,
      floorType: "flat",
      notes: ["各フロアに設置", "オストメイト対応"],
    },
    photoUrls: [],
    openingHours: "11:00-21:00",
  },
];

/**
 * スポットデータを投入する
 */
const seedSpots = async (): Promise<void> => {
  console.log("スポットデータを投入中...");

  const batch = db.batch();
  const spotsCollection = db.collection("spots");

  for (const spot of sampleSpots) {
    const ref = spotsCollection.doc(spot.spotId);
    batch.set(ref, {
      ...spot,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });
  }

  await batch.commit();
  console.log(`  ${sampleSpots.length} 件のスポットデータを投入しました。`);
};

/**
 * メイン処理
 */
const main = async (): Promise<void> => {
  console.log("========================================");
  console.log(" AccessRoute 初期データ投入");
  console.log("========================================");

  try {
    await seedSpots();

    console.log("");
    console.log("========================================");
    console.log(" 初期データ投入完了！");
    console.log("========================================");
  } catch (error) {
    console.error("初期データ投入エラー:", error);
    process.exit(1);
  }
};

main();
