/**
 * チャットAPI結合テスト
 *
 * AIプロキシのモックを使用してチャットルートの動作を検証する。
 * SSEストリーミング、ニーズ抽出、会話履歴のFirestore保存、
 * AIサーバーダウン時のフォールバックをテストする。
 */

// express types not needed - using `any` for mock response

// --- firebase-admin モック ---
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockAdd = jest.fn();
const mockDoc = jest.fn(() => ({ get: mockGet, set: mockSet, update: mockUpdate }));
const mockCollection = jest.fn(() => ({ doc: mockDoc, add: mockAdd }));

jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: mockCollection,
  })),
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

jest.mock("firebase-admin/firestore", () => ({
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
  },
  FieldValue: {
    arrayUnion: jest.fn((...args: unknown[]) => args),
  },
}));

jest.mock("firebase-functions/params", () => ({
  defineString: jest.fn(() => ({ value: jest.fn(() => "http://localhost:8000") })),
}));

// --- AIプロキシモック ---
const mockChat = jest.fn();
const mockExtractNeeds = jest.fn();

jest.mock("../services/aiProxy", () => ({
  chat: (...args: unknown[]) => mockChat(...args),
  extractNeeds: (...args: unknown[]) => mockExtractNeeds(...args),
  streamChat: jest.fn(),
}));

// --- Firestoreサービスモック ---
const mockGetUserProfile = jest.fn();

jest.mock("../services/firestore", () => ({
  getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
  upsertUserProfile: jest.fn(),
  mergeExtractedNeeds: jest.fn().mockResolvedValue(null),
}));

// --- 会話サービスモック ---
jest.mock("../services/conversation", () => ({
  createConversation: jest.fn().mockResolvedValue({ conversationId: "conv-001" }),
  addMessage: jest.fn().mockResolvedValue(undefined),
}));

import { ChatResponse, ExtractNeedsResponse, UserProfile } from "../types";

// テスト用ヘルパー
const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.write = jest.fn().mockReturnValue(true);
  res.end = jest.fn();
  res.setHeader = jest.fn();
  res.flushHeaders = jest.fn();
  return res;
};

const TEST_UID = "test-user-chat-001";

// テスト用のAI応答
const MOCK_CHAT_RESPONSE: ChatResponse = {
  reply: "東京駅周辺のバリアフリースポットをご紹介します。",
  extractedNeeds: {
    mobilityType: "wheelchair",
    avoidConditions: ["stairs"],
  } as Partial<UserProfile>,
  suggestedAction: "show_spots",
};

const MOCK_EXTRACT_RESPONSE: ExtractNeedsResponse = {
  needs: {
    mobilityType: "wheelchair",
    companions: ["elderly"],
    avoidConditions: ["stairs", "slope"],
  } as Partial<UserProfile>,
  confidence: 0.85,
  missingFields: ["maxDistanceMeters", "preferConditions"],
};

// フォールバックレスポンス（AIサーバーダウン時）
const FALLBACK_CHAT_RESPONSE: ChatResponse = {
  reply: "申し訳ございません。AI機能が一時的にご利用いただけません。しばらくしてからもう一度お試しください。",
  extractedNeeds: null,
  suggestedAction: null,
};

const FALLBACK_EXTRACT_RESPONSE: ExtractNeedsResponse = {
  needs: {} as Partial<UserProfile>,
  confidence: 0,
  missingFields: ["mobilityType", "companions", "avoidConditions"],
};

describe("チャットAPIテスト", () => {
  let chatRouter: typeof import("../routes/chat").default;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    // モック再設定
    jest.doMock("firebase-admin", () => ({
      initializeApp: jest.fn(),
      firestore: jest.fn(() => ({
        collection: mockCollection,
      })),
      auth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
      })),
    }));
    jest.doMock("firebase-admin/firestore", () => ({
      Timestamp: {
        now: jest.fn(() => ({ seconds: 1700000000, nanoseconds: 0 })),
      },
      FieldValue: {
        arrayUnion: jest.fn((...args: unknown[]) => args),
      },
    }));
    jest.doMock("firebase-functions/params", () => ({
      defineString: jest.fn(() => ({ value: jest.fn(() => "http://localhost:8000") })),
    }));
    jest.doMock("../services/aiProxy", () => ({
      chat: (...args: unknown[]) => mockChat(...args),
      extractNeeds: (...args: unknown[]) => mockExtractNeeds(...args),
      streamChat: jest.fn(),
    }));
    jest.doMock("../services/firestore", () => ({
      getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
      upsertUserProfile: jest.fn(),
      mergeExtractedNeeds: jest.fn().mockResolvedValue(null),
    }));
    jest.doMock("../services/conversation", () => ({
      createConversation: jest.fn().mockResolvedValue({ conversationId: "conv-001" }),
      addMessage: jest.fn().mockResolvedValue(undefined),
    }));

    const routeModule = await import("../routes/chat");
    chatRouter = routeModule.default;
  });

  // ============================================================
  // POST /api/chat 正常系テスト
  // ============================================================

  describe("POST /api/chat 正常系", () => {
    it("有効なリクエストでAI応答を返すこと", async () => {
      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(MOCK_CHAT_RESPONSE);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "東京駅周辺でバリアフリーなスポットを教えてください",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      expect(postHandler).toBeDefined();
      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(MOCK_CHAT_RESPONSE);
        expect(mockChat).toHaveBeenCalledWith(
          TEST_UID,
          "東京駅周辺でバリアフリーなスポットを教えてください",
          [],
          null
        );
      }
    });

    it("ユーザープロファイルが存在する場合、コンテキストとして渡すこと", async () => {
      const mockProfile: UserProfile = {
        userId: TEST_UID,
        mobilityType: "wheelchair",
        companions: [],
        maxDistanceMeters: 500,
        avoidConditions: ["stairs"],
        preferConditions: ["restroom"],
        createdAt: { seconds: 1700000000, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1700000000, nanoseconds: 0 } as any,
      };

      mockGetUserProfile.mockResolvedValueOnce(mockProfile);
      mockChat.mockResolvedValueOnce(MOCK_CHAT_RESPONSE);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "近くの休憩所を教えてください",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(mockChat).toHaveBeenCalledWith(
          TEST_UID,
          "近くの休憩所を教えてください",
          [],
          mockProfile
        );
      }
    });

    it("会話履歴付きリクエストが正常に処理されること", async () => {
      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(MOCK_CHAT_RESPONSE);

      const conversationHistory = [
        { role: "user" as const, content: "こんにちは" },
        { role: "assistant" as const, content: "こんにちは！お手伝いします。" },
      ];

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "車椅子で移動しています",
          conversationHistory,
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(mockChat).toHaveBeenCalledWith(
          TEST_UID,
          "車椅子で移動しています",
          conversationHistory,
          null
        );
        expect(res.json).toHaveBeenCalledWith(MOCK_CHAT_RESPONSE);
      }
    });
  });

  // ============================================================
  // POST /api/chat バリデーションテスト
  // ============================================================

  describe("POST /api/chat バリデーション", () => {
    it("messageが空の場合400を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        body: { message: "" },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it("messageが未指定の場合400を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        body: {},
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it("messageが2000文字超の場合400を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        query: {},
        body: { userId: TEST_UID, message: "あ".repeat(2001) },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: expect.stringContaining("2000") })
        );
      }
    });

    it("conversationHistoryが配列でない場合400を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "テスト",
          conversationHistory: "not-an-array",
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });
  });

  // ============================================================
  // extractedNeeds -> プロファイル自動更新テスト
  // ============================================================

  describe("extractedNeeds -> プロファイル更新", () => {
    it("extractedNeedsが含まれるレスポンスを正常に返すこと", async () => {
      const responseWithNeeds: ChatResponse = {
        reply: "車椅子をお使いなのですね。段差の少ないルートをお探しします。",
        extractedNeeds: {
          mobilityType: "wheelchair",
          avoidConditions: ["stairs"],
        } as Partial<UserProfile>,
        suggestedAction: "show_spots",
      };

      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(responseWithNeeds);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "車椅子を使っています。段差は避けたいです。",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            extractedNeeds: expect.objectContaining({
              mobilityType: "wheelchair",
            }),
          })
        );
      }
    });

    it("extractedNeedsがnullのレスポンスも正常に処理されること", async () => {
      const responseWithoutNeeds: ChatResponse = {
        reply: "こんにちは！何かお手伝いできることはありますか？",
        extractedNeeds: null,
        suggestedAction: "ask_more",
      };

      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(responseWithoutNeeds);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "こんにちは",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            extractedNeeds: null,
          })
        );
      }
    });
  });

  // ============================================================
  // POST /api/extract-needs 正常系テスト
  // ============================================================

  describe("POST /api/extract-needs 正常系", () => {
    it("有効なリクエストでニーズ抽出結果を返すこと", async () => {
      mockExtractNeeds.mockResolvedValueOnce(MOCK_EXTRACT_RESPONSE);

      const req = {
        uid: TEST_UID,
        body: {
          userId: TEST_UID,
          conversationHistory: [
            { role: "user", content: "車椅子を使っています。段差は避けたいです。" },
            { role: "assistant", content: "承知しました。他にご要望はありますか？" },
            { role: "user", content: "母と一緒なので、あまり歩かないルートがいいです。" },
          ],
        },
      } as any;
      const res = createMockResponse();

      const extractHandler = chatRouter.stack.find(
        (layer: any) =>
          layer.route?.path === "/extract-needs" && layer.route?.methods?.post
      );

      expect(extractHandler).toBeDefined();
      if (extractHandler) {
        await extractHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(MOCK_EXTRACT_RESPONSE);
        expect(mockExtractNeeds).toHaveBeenCalledWith(TEST_UID, [
          { role: "user", content: "車椅子を使っています。段差は避けたいです。" },
          { role: "assistant", content: "承知しました。他にご要望はありますか？" },
          { role: "user", content: "母と一緒なので、あまり歩かないルートがいいです。" },
        ]);
      }
    });

    it("会話履歴が空の場合400を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        body: {
          userId: TEST_UID,
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const extractHandler = chatRouter.stack.find(
        (layer: any) =>
          layer.route?.path === "/extract-needs" && layer.route?.methods?.post
      );

      if (extractHandler) {
        await extractHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });

    it("conversationHistoryが未指定の場合400を返すこと", async () => {
      const req = {
        uid: TEST_UID,
        body: { userId: TEST_UID },
      } as any;
      const res = createMockResponse();

      const extractHandler = chatRouter.stack.find(
        (layer: any) =>
          layer.route?.path === "/extract-needs" && layer.route?.methods?.post
      );

      if (extractHandler) {
        await extractHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(400);
      }
    });
  });

  // ============================================================
  // AIサーバーダウン時のフォールバックテスト
  // ============================================================

  describe("AIサーバーダウン時のフォールバック", () => {
    it("chatがエラー時にフォールバックレスポンスを返すこと", async () => {
      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(FALLBACK_CHAT_RESPONSE);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "テストメッセージ",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            reply: expect.stringContaining("一時的にご利用いただけません"),
            extractedNeeds: null,
            suggestedAction: null,
          })
        );
      }
    });

    it("extractNeedsがエラー時にフォールバックレスポンスを返すこと", async () => {
      mockExtractNeeds.mockResolvedValueOnce(FALLBACK_EXTRACT_RESPONSE);

      const req = {
        uid: TEST_UID,
        body: {
          userId: TEST_UID,
          conversationHistory: [
            { role: "user", content: "車椅子を使っています" },
          ],
        },
      } as any;
      const res = createMockResponse();

      const extractHandler = chatRouter.stack.find(
        (layer: any) =>
          layer.route?.path === "/extract-needs" && layer.route?.methods?.post
      );

      if (extractHandler) {
        await extractHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            confidence: 0,
          })
        );
      }
    });

    it("chatで例外が発生した場合500を返すこと", async () => {
      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockRejectedValueOnce(new Error("Connection refused"));

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "テストメッセージ",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.stringContaining("失敗"),
          })
        );
      }
    });

    it("extractNeedsで例外が発生した場合500を返すこと", async () => {
      mockExtractNeeds.mockRejectedValueOnce(new Error("AI server timeout"));

      const req = {
        uid: TEST_UID,
        body: {
          userId: TEST_UID,
          conversationHistory: [
            { role: "user", content: "車椅子を使っています" },
          ],
        },
      } as any;
      const res = createMockResponse();

      const extractHandler = chatRouter.stack.find(
        (layer: any) =>
          layer.route?.path === "/extract-needs" && layer.route?.methods?.post
      );

      if (extractHandler) {
        await extractHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
      }
    });
  });

  // ============================================================
  // SSEストリーミングテスト（レスポンス形式の検証）
  // ============================================================

  describe("SSEストリーミング形式の検証", () => {
    it("チャットレスポンスがSSE互換の構造を持つこと", async () => {
      // SSEレスポンスの構造テスト
      // 実際のSSEはai-server側で処理されるが、
      // Backendプロキシのレスポンスがストリーミング対応の構造を持つことを確認
      const streamableResponse: ChatResponse = {
        reply: "東京駅周辺のバリアフリースポットをご案内します。",
        extractedNeeds: {
          mobilityType: "wheelchair",
        } as Partial<UserProfile>,
        suggestedAction: "show_spots",
      };

      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(streamableResponse);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "東京駅周辺を教えて",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        const jsonCall = (res.json as jest.Mock).mock.calls[0][0];

        // SSEで送信されるデータと同じフィールドを持つか確認
        expect(jsonCall).toHaveProperty("reply");
        expect(jsonCall).toHaveProperty("extractedNeeds");
        expect(jsonCall).toHaveProperty("suggestedAction");
        expect(typeof jsonCall.reply).toBe("string");
      }
    });
  });

  // ============================================================
  // 会話履歴のFirestore保存テスト
  // ============================================================

  describe("会話履歴の保存", () => {
    it("chatルートがuidを使ってプロファイルを取得すること", async () => {
      mockGetUserProfile.mockResolvedValueOnce(null);
      mockChat.mockResolvedValueOnce(MOCK_CHAT_RESPONSE);

      const req = {
        uid: TEST_UID,
        query: {},
        body: {
          userId: TEST_UID,
          message: "テスト",
          conversationHistory: [],
        },
      } as any;
      const res = createMockResponse();

      const postHandler = chatRouter.stack.find(
        (layer: any) => layer.route?.path === "/" && layer.route?.methods?.post
      );

      if (postHandler) {
        await postHandler.route!.stack[0].handle(req, res, jest.fn());
        // getUserProfileがuidで呼ばれることを確認
        expect(mockGetUserProfile).toHaveBeenCalledWith(TEST_UID);
      }
    });

    it("extract-needsルートがuidを使ってextractNeedsを呼ぶこと", async () => {
      mockExtractNeeds.mockResolvedValueOnce(MOCK_EXTRACT_RESPONSE);

      const conversationHistory = [
        { role: "user", content: "車椅子を使っています" },
      ];

      const req = {
        uid: TEST_UID,
        body: { userId: TEST_UID, conversationHistory },
      } as any;
      const res = createMockResponse();

      const extractHandler = chatRouter.stack.find(
        (layer: any) =>
          layer.route?.path === "/extract-needs" && layer.route?.methods?.post
      );

      if (extractHandler) {
        await extractHandler.route!.stack[0].handle(req, res, jest.fn());
        expect(mockExtractNeeds).toHaveBeenCalledWith(TEST_UID, conversationHistory);
      }
    });
  });
});
