/**
 * 認証・プロファイルルートのテスト
 *
 * Firestore モックを使用してプロファイルの CRUD 操作を検証する。
 */

import { Request, NextFunction } from "express";
import { Timestamp } from "firebase-admin/firestore";

// --- firebase-admin モック ---
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockGet, set: mockSet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));

const mockFirestore = Object.assign(
  jest.fn(() => ({
    collection: mockCollection,
  })),
  {
    Timestamp: {
      now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
    },
  }
);

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: mockFirestore,
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

// firebase-admin/firestore の Timestamp モック
jest.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
  },
}));

// firebase-functions モック
jest.mock("firebase-functions/params", () => ({
  defineString: jest.fn(() => ({ value: jest.fn(() => "mock-value") })),
}));

import { getUserProfile, upsertUserProfile } from "../services/firestore";
import { UserProfile, UserProfileInput } from "../types";

// テスト用ヘルパー: Express レスポンスモックを作成
const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// テスト用のプロファイルデータ
const TEST_UID = "test-user-001";
const TEST_PROFILE_INPUT: UserProfileInput = {
  mobilityType: "wheelchair",
  companions: ["elderly"],
  maxDistanceMeters: 500,
  avoidConditions: ["stairs", "slope"],
  preferConditions: ["restroom"],
};

describe("認証・プロファイルルート", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================
  // Firestore サービス層テスト
  // ============================

  describe("getUserProfile", () => {
    it("存在するプロファイルを取得できること", async () => {
      const mockProfileData: UserProfile = {
        userId: TEST_UID,
        mobilityType: "wheelchair",
        companions: ["elderly"],
        maxDistanceMeters: 500,
        avoidConditions: ["stairs", "slope"],
        preferConditions: ["restroom"],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockProfileData,
      });

      const result = await getUserProfile(TEST_UID);

      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith(TEST_UID);
      expect(result).toEqual(mockProfileData);
    });

    it("存在しないプロファイルで null を返すこと", async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });

      const result = await getUserProfile("non-existent-user");

      expect(result).toBeNull();
    });
  });

  describe("upsertUserProfile", () => {
    it("新規プロファイルを作成できること", async () => {
      // getUserProfile が null を返す（新規ユーザー）
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });
      mockSet.mockResolvedValueOnce(undefined);

      const result = await upsertUserProfile(TEST_UID, TEST_PROFILE_INPUT);

      expect(result.userId).toBe(TEST_UID);
      expect(result.mobilityType).toBe("wheelchair");
      expect(result.companions).toEqual(["elderly"]);
      expect(result.maxDistanceMeters).toBe(500);
      expect(result.avoidConditions).toEqual(["stairs", "slope"]);
      expect(result.preferConditions).toEqual(["restroom"]);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("既存プロファイルを更新できること", async () => {
      const existingProfile: UserProfile = {
        userId: TEST_UID,
        mobilityType: "walk",
        companions: [],
        maxDistanceMeters: 1000,
        avoidConditions: [],
        preferConditions: [],
        createdAt: { seconds: 1690000000, nanoseconds: 0 } as Timestamp,
        updatedAt: { seconds: 1690000000, nanoseconds: 0 } as Timestamp,
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => existingProfile,
      });
      mockSet.mockResolvedValueOnce(undefined);

      const updateInput: UserProfileInput = {
        mobilityType: "wheelchair",
        avoidConditions: ["stairs"],
      };

      const result = await upsertUserProfile(TEST_UID, updateInput);

      // 更新後のデータを検証
      expect(result.mobilityType).toBe("wheelchair");
      expect(result.avoidConditions).toEqual(["stairs"]);
      // createdAt は既存の値を保持
      expect(result.createdAt).toEqual(existingProfile.createdAt);
    });

    it("オプションフィールドが未指定の場合デフォルト値が設定されること", async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });
      mockSet.mockResolvedValueOnce(undefined);

      const minimalInput: UserProfileInput = {
        mobilityType: "walk",
      };

      const result = await upsertUserProfile(TEST_UID, minimalInput);

      expect(result.companions).toEqual([]);
      expect(result.maxDistanceMeters).toBe(1000);
      expect(result.avoidConditions).toEqual([]);
      expect(result.preferConditions).toEqual([]);
    });
  });

  // ============================
  // ルートハンドラテスト
  // ============================

  describe("GET /api/auth/profile ハンドラ", () => {
    // ルートハンドラを直接インポートしてテスト
    let authRouter: typeof import("../routes/auth").default;

    beforeEach(async () => {
      jest.resetModules();
      // モックを再設定
      jest.doMock("firebase-admin", () => ({
        initializeApp: jest.fn(),
        firestore: Object.assign(
          jest.fn(() => ({
            collection: mockCollection,
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

      const routeModule = await import("../routes/auth");
      authRouter = routeModule.default;
    });

    it("プロファイルが存在しない場合 404 を返すこと", async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });

      const req = {
        uid: TEST_UID,
      } as any;
      const res = createMockResponse();

      // ルーターからGETハンドラを取得して直接呼び出す
      const getHandler = authRouter.stack.find(
        (layer: any) => layer.route?.path === "/profile" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.any(String) })
        );
      }
    });

    it("プロファイルが存在する場合プロファイルを返すこと", async () => {
      const profileData: UserProfile = {
        userId: TEST_UID,
        mobilityType: "wheelchair",
        companions: [],
        maxDistanceMeters: 1000,
        avoidConditions: ["stairs"],
        preferConditions: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => profileData,
      });

      const req = { uid: TEST_UID } as any;
      const res = createMockResponse();

      const getHandler = authRouter.stack.find(
        (layer: any) => layer.route?.path === "/profile" && layer.route?.methods?.get
      );

      if (getHandler) {
        await getHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(profileData);
      }
    });
  });

  describe("POST /api/auth/profile ハンドラ", () => {
    let authRouter: typeof import("../routes/auth").default;

    beforeEach(async () => {
      jest.resetModules();
      jest.doMock("firebase-admin", () => ({
        initializeApp: jest.fn(),
        firestore: Object.assign(
          jest.fn(() => ({
            collection: mockCollection,
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

      const routeModule = await import("../routes/auth");
      authRouter = routeModule.default;
    });

    it("mobilityType が未指定の場合 400 を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        body: {},
      } as any;
      const res = createMockResponse();

      const postHandler = authRouter.stack.find(
        (layer: any) => layer.route?.path === "/profile" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.stringContaining("mobilityType") })
        );
      }
    });

    it("有効なリクエストでプロファイルを作成できること", async () => {
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => undefined,
      });
      mockSet.mockResolvedValueOnce(undefined);

      const req = {
        uid: TEST_UID,
        body: TEST_PROFILE_INPUT,
      } as any;
      const res = createMockResponse();

      const postHandler = authRouter.stack.find(
        (layer: any) => layer.route?.path === "/profile" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: TEST_UID,
            mobilityType: "wheelchair",
          })
        );
      }
    });
  });

  // ============================
  // 認証ミドルウェアテスト
  // ============================

  describe("verifyAuth ミドルウェア", () => {
    let verifyAuth: typeof import("../middleware/auth").verifyAuth;
    let mockVerifyIdToken: jest.Mock;

    beforeEach(async () => {
      jest.resetModules();
      mockVerifyIdToken = jest.fn();
      jest.doMock("firebase-admin", () => ({
        initializeApp: jest.fn(),
        auth: jest.fn(() => ({
          verifyIdToken: mockVerifyIdToken,
        })),
        firestore: Object.assign(
          jest.fn(() => ({
            collection: mockCollection,
          })),
          {
            Timestamp: {
              now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
            },
          }
        ),
      }));

      const authModule = await import("../middleware/auth");
      verifyAuth = authModule.verifyAuth;
    });

    it("Authorization ヘッダーがない場合 401 を返すこと", async () => {
      const req = { headers: {} } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;

      await verifyAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("Bearer プレフィックスがない場合 401 を返すこと", async () => {
      const req = {
        headers: { authorization: "InvalidToken123" },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;

      await verifyAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("有効なトークンで next() が呼ばれること", async () => {
      mockVerifyIdToken.mockResolvedValueOnce({ uid: TEST_UID });

      const req = {
        headers: { authorization: "Bearer valid-token" },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;

      await verifyAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).uid).toBe(TEST_UID);
    });

    it("無効なトークンで 401 を返すこと", async () => {
      mockVerifyIdToken.mockRejectedValueOnce(new Error("Token expired"));

      const req = {
        headers: { authorization: "Bearer expired-token" },
      } as Request;
      const res = createMockResponse();
      const next = jest.fn() as NextFunction;

      await verifyAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
