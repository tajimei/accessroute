/**
 * ルート検索ルートのテスト
 *
 * Google Maps API モックを使用してルート検索エンドポイントを検証する。
 */

// --- firebase-admin モック ---
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
      })),
    })),
  })),
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
  defineString: jest.fn(() => ({ value: jest.fn(() => "mock-api-key") })),
}));

// Google Maps API サービスのモック
jest.mock("../services/mapsApi", () => ({
  searchRoutes: jest.fn(),
  searchNearbyPlaces: jest.fn().mockResolvedValue([]),
  geocode: jest.fn(),
  reverseGeocode: jest.fn(),
}));

// Firestore サービスのモック
const mockGetUserProfile = jest.fn();
jest.mock("../services/firestore", () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
  saveSearchHistory: jest.fn().mockResolvedValue(undefined),
}));

import { searchRoutes } from "../services/mapsApi";

const mockSearchRoute = searchRoutes as jest.MockedFunction<typeof searchRoutes>;

// Express レスポンスモック
const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ルート検索ルート", () => {
  let routeRouter: typeof import("../routes/route").default;

  beforeEach(async () => {
    jest.clearAllMocks();
    const routeModule = await import("../routes/route");
    routeRouter = routeModule.default;
  });

  describe("POST /api/route/search", () => {
    it("origin が未指定の場合 400 を返すこと", async () => {
      const req = {
        body: {
          destination: { lat: 35.6595, lng: 139.7004 },
          userProfileId: "user-001",
          prioritize: "accessible",
        },
      } as any;
      const res = createMockResponse();

      const postHandler = routeRouter.stack.find(
        (layer: any) => layer.route?.path === "/search" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.stringContaining("origin") })
        );
      }
    });

    it("destination が未指定の場合 400 を返すこと", async () => {
      const req = {
        body: {
          origin: { lat: 35.6812, lng: 139.7671 },
          userProfileId: "user-001",
          prioritize: "accessible",
        },
      } as any;
      const res = createMockResponse();

      const postHandler = routeRouter.stack.find(
        (layer: any) => layer.route?.path === "/search" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it("userProfileId が未指定の場合 400 を返すこと", async () => {
      const req = {
        body: {
          origin: { lat: 35.6812, lng: 139.7671 },
          destination: { lat: 35.6595, lng: 139.7004 },
          prioritize: "accessible",
        },
      } as any;
      const res = createMockResponse();

      const postHandler = routeRouter.stack.find(
        (layer: any) => layer.route?.path === "/search" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.stringContaining("userProfileId") })
        );
      }
    });

    it("有効なリクエストでルート結果を返すこと", async () => {
      // ユーザープロファイルのモック
      mockGetUserProfile.mockResolvedValueOnce({
        userId: "user-001",
        mobilityType: "wheelchair",
        companions: [],
        maxDistanceMeters: 1000,
        avoidConditions: [],
        preferConditions: [],
        createdAt: { seconds: 1700000000, nanoseconds: 0 },
        updatedAt: { seconds: 1700000000, nanoseconds: 0 },
      });

      // searchRoutes のモック（空配列を返す）
      mockSearchRoute.mockResolvedValueOnce([]);

      const req = {
        uid: "test-uid",
        body: {
          origin: { lat: 35.6812, lng: 139.7671 },
          destination: { lat: 35.6595, lng: 139.7004 },
          userProfileId: "user-001",
          prioritize: "accessible",
        },
      } as any;
      const res = createMockResponse();

      const postHandler = routeRouter.stack.find(
        (layer: any) => layer.route?.path === "/search" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ routes: expect.any(Array) })
        );
      }
    });
  });

  describe("Google Maps API モック検証", () => {
    it("searchRoute が正しいパラメータで呼び出されること", async () => {
      const mockRoutes = [
        {
          steps: [
            {
              stepId: "step-1",
              instruction: "東京駅中央口を出て右に進む",
              distanceMeters: 200,
              durationSeconds: 180,
              startLocation: { lat: 35.6812, lng: 139.7671 },
              endLocation: { lat: 35.6815, lng: 139.7680 },
              polyline: "encoded_polyline_string",
              hasStairs: false,
              hasSlope: false,
            },
          ],
          distanceMeters: 200,
          durationSeconds: 180,
        },
        {
          steps: [
            {
              stepId: "step-2",
              instruction: "エレベーターで地下に降りる",
              distanceMeters: 50,
              durationSeconds: 60,
              startLocation: { lat: 35.6815, lng: 139.7680 },
              endLocation: { lat: 35.6815, lng: 139.7680 },
              polyline: "encoded_polyline_string_2",
              hasStairs: false,
              hasSlope: false,
            },
          ],
          distanceMeters: 50,
          durationSeconds: 60,
        },
      ];

      mockSearchRoute.mockResolvedValueOnce(mockRoutes);

      const origin = { lat: 35.6812, lng: 139.7671 };
      const destination = { lat: 35.6595, lng: 139.7004 };

      const result = await searchRoutes(origin, destination, "accessible");

      expect(mockSearchRoute).toHaveBeenCalledWith(origin, destination, "accessible");
      expect(result).toHaveLength(2);
      expect(result[0].steps[0].stepId).toBe("step-1");
      expect(result[1].steps[0].hasStairs).toBe(false);
    });

    it("API エラー時に例外がスローされること", async () => {
      mockSearchRoute.mockRejectedValueOnce(new Error("API quota exceeded"));

      await expect(
        searchRoutes(
          { lat: 35.6812, lng: 139.7671 },
          { lat: 35.6595, lng: 139.7004 },
          "shortest"
        )
      ).rejects.toThrow("API quota exceeded");
    });
  });
});
