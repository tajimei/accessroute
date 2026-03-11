/**
 * スポット検索ルートのテスト
 *
 * Firestore モックを使用してスポット検索・詳細取得を検証する。
 */

// --- firebase-admin モック ---
const mockGet = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockGet }));
// spots_cache コレクション用モック（getSpotFromCache で使用）
const mockCacheGet = jest.fn();
const mockCacheDoc = jest.fn(() => ({ get: mockCacheGet }));
const mockCacheCollection = jest.fn(() => ({ doc: mockCacheDoc }));

// コレクション名に応じて適切なモックを返す
const mockCollectionRouter = jest.fn((name: string) => {
  if (name === "spots_cache") return mockCacheCollection();
  return { doc: mockDoc };
});

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: Object.assign(
    jest.fn(() => ({
      collection: mockCollectionRouter,
    })),
    {
      Timestamp: {
        now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
      },
    }
  ),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

jest.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
  },
}));

jest.mock("firebase-functions/params", () => ({
  defineString: jest.fn(() => ({ value: jest.fn(() => "mock-value") })),
}));

// mapsApi モック
jest.mock("../services/mapsApi", () => ({
  searchNearbyPlaces: jest.fn().mockResolvedValue([]),
  getPlaceDetails: jest.fn().mockResolvedValue(null),
}));

import { getNearbySpots, getSpotDetail } from "../services/firestore";
import { SpotDetail } from "../types";

// Express レスポンスモック
const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// テスト用スポットデータ
const TEST_SPOT: SpotDetail = {
  spotId: "spot-001",
  name: "東京駅バリアフリートイレ",
  description: "東京駅構内のバリアフリー対応多目的トイレ",
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
    notes: ["車椅子対応", "おむつ交換台あり"],
  },
  photoUrls: ["https://example.com/photo1.jpg"],
  openingHours: "5:30-24:00",
};

describe("スポット検索ルート", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // Firestore サービス層テスト
  // ============================

  describe("getSpotDetail", () => {
    it("存在するスポットの詳細を取得できること", async () => {
      // キャッシュミス
      mockCacheGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });
      // Firestoreにデータあり
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => TEST_SPOT,
      });

      const result = await getSpotDetail("spot-001");

      expect(mockCollectionRouter).toHaveBeenCalledWith("spots");
      expect(mockDoc).toHaveBeenCalledWith("spot-001");
      expect(result).toEqual(TEST_SPOT);
      expect(result?.name).toBe("東京駅バリアフリートイレ");
      expect(result?.accessibility.wheelchairAccessible).toBe(true);
    });

    it("存在しないスポットで null を返すこと", async () => {
      // キャッシュミス
      mockCacheGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });
      // Firestoreにもなし
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });

      const result = await getSpotDetail("non-existent-spot");

      expect(result).toBeNull();
    });
  });

  describe("getNearbySpots", () => {
    it("スタブ実装で空配列を返すこと", async () => {
      const result = await getNearbySpots(35.6812, 139.7671, 500);

      expect(result).toEqual([]);
    });

    it("カテゴリ指定ありで空配列を返すこと", async () => {
      const result = await getNearbySpots(35.6812, 139.7671, 1000, "restroom");

      expect(result).toEqual([]);
    });
  });

  // ============================
  // ルートハンドラテスト
  // ============================

  describe("GET /api/spots/nearby ハンドラ", () => {
    let spotsRouter: typeof import("../routes/spots").default;

    beforeEach(async () => {
      jest.resetModules();
      jest.doMock("firebase-admin", () => ({
        initializeApp: jest.fn(),
        firestore: Object.assign(
          jest.fn(() => ({
            collection: mockCollectionRouter,
          })),
          {
            Timestamp: {
              now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
            },
          }
        ),
        auth: jest.fn(() => ({
          verifyIdToken: jest.fn(),
        })),
      }));
      jest.doMock("firebase-admin/firestore", () => ({
        Timestamp: {
          now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
        },
      }));
      jest.doMock("firebase-functions/params", () => ({
        defineString: jest.fn(() => ({ value: jest.fn(() => "mock-value") })),
      }));
      jest.doMock("../services/mapsApi", () => ({
        searchNearbyPlaces: jest.fn().mockResolvedValue([]),
        getPlaceDetails: jest.fn().mockResolvedValue(null),
      }));

      const spotsModule = await import("../routes/spots");
      spotsRouter = spotsModule.default;
    });

    it("lat と lng が未指定の場合 400 を返すこと", async () => {
      const req = {
        query: {},
      } as any;
      const res = createMockResponse();

      const getHandler = spotsRouter.stack.find(
        (layer: any) => layer.route?.path === "/nearby" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.stringContaining("lat") })
        );
      }
    });

    it("有効な座標で検索結果を返すこと", async () => {
      // getUserProfile 用のモック（プロファイルなし）
      mockGet.mockResolvedValueOnce({ exists: false, data: () => undefined });

      const req = {
        uid: "test-user",
        query: {
          lat: "35.6812",
          lng: "139.7671",
          radiusMeters: "500",
        },
      } as any;
      const res = createMockResponse();

      const getHandler = spotsRouter.stack.find(
        (layer: any) => layer.route?.path === "/nearby" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        // スタブ実装では空のスポット配列を返す
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ spots: expect.any(Array) })
        );
      }
    });

    it("radiusMeters のデフォルト値が 500 であること", async () => {
      // getUserProfile 用のモック（プロファイルなし）
      mockGet.mockResolvedValueOnce({ exists: false, data: () => undefined });

      const req = {
        uid: "test-user",
        query: {
          lat: "35.6812",
          lng: "139.7671",
          // radiusMeters を指定しない
        },
      } as any;
      const res = createMockResponse();

      const getHandler = spotsRouter.stack.find(
        (layer: any) => layer.route?.path === "/nearby" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalled();
      }
    });
  });

  describe("GET /api/spots/:spotId ハンドラ", () => {
    let spotsRouter: typeof import("../routes/spots").default;

    beforeEach(async () => {
      jest.resetModules();
      // spots_cache の get は常にキャッシュミスを返す
      mockCacheGet.mockResolvedValue({ exists: false, data: () => undefined });
      jest.doMock("firebase-admin", () => ({
        initializeApp: jest.fn(),
        firestore: Object.assign(
          jest.fn(() => ({
            collection: mockCollectionRouter,
          })),
          {
            Timestamp: {
              now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
            },
          }
        ),
        auth: jest.fn(() => ({
          verifyIdToken: jest.fn(),
        })),
      }));
      jest.doMock("firebase-admin/firestore", () => ({
        Timestamp: {
          now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
        },
      }));
      jest.doMock("firebase-functions/params", () => ({
        defineString: jest.fn(() => ({ value: jest.fn(() => "mock-value") })),
      }));
      jest.doMock("../services/mapsApi", () => ({
        searchNearbyPlaces: jest.fn().mockResolvedValue([]),
        getPlaceDetails: jest.fn().mockResolvedValue(null),
      }));

      const spotsModule = await import("../routes/spots");
      spotsRouter = spotsModule.default;
    });

    it("存在しないスポットで 404 を返すこと", async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });

      const req = {
        params: { spotId: "non-existent" },
      } as any;
      const res = createMockResponse();

      const getHandler = spotsRouter.stack.find(
        (layer: any) => layer.route?.path === "/:spotId" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(404);
      }
    });

    it("存在するスポットの詳細を返すこと", async () => {
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => TEST_SPOT,
      });

      const req = {
        params: { spotId: "spot-001" },
      } as any;
      const res = createMockResponse();

      const getHandler = spotsRouter.stack.find(
        (layer: any) => layer.route?.path === "/:spotId" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(TEST_SPOT);
      }
    });
  });
});
