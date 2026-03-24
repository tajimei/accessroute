# AccessRoute

ユーザーの身体状況（車椅子、ベビーカー、杖歩行、高齢者等）に合わせたバリアフリールート検索・スポット提案を行うiOSアプリケーション。AIチャットによる対話的なニーズ抽出と、**Yahoo! JAPAN API**から取得する精緻なアクセシビリティ情報を組み合わせた、日本国内での最適な移動サポートを特徴とする。

## アーキテクチャ

```text
+------------------+       +----------------------+       +--------------------+
|                  |       |                      |       |                    |
|   iOS App        |<----->|   Firebase Backend   |<----->|   AI Server        |
|   (SwiftUI)      | REST  |   (Cloud Functions)  | HTTP  |   (vLLM + FastAPI) |
|   (MapKit)       |  API  |   (Firestore)        |       |                    |
+------------------+       +----------------------+       +--------------------+
        |                          |
        |                          |
        v                          v
+------------------+       +----------------------+
| Yahoo! JAPAN API |       | Firebase Auth        |
| (施設属性データ)   |       | (認証・認可)          |
+------------------+       +----------------------+
データフローユーザー登録: iOSアプリで移動手段（車椅子、ベビーカー、杖等）や回避したい条件（階段、急坂、段差等）をプロファイルとして登録。対話型ニーズ抽出: AIチャットとの対話により、「荷物が重い」「今日は足の調子が悪い」といった動的なニーズをリアルタイムに把握。アクセシビリティ統合: MapKitをベースとした地図表示に、**Yahoo! JAPAN API（ローカル検索/施設詳細API）**から取得したバリアフリー属性（エレベーター、スロープ、多目的トイレ等の有無）を統合。最適ルート算出: Backendがユーザーの特性とYahoo!の最新施設データを照合し、物理的な障壁を最小化したバリアフリー最適ルートを生成。スポット可視化: ルート沿いにあるアクセシブルな休憩所や授乳室、トイレを地図上に重畳表示し、快適な移動を支援。技術スタックレイヤー技術iOSSwift / SwiftUI / MapKit / Yahoo! JAPAN APIBackendFirebase (Firestore, Cloud Functions v2 TypeScript, Auth)AIHugging Face 日本語LLM / vLLM / Docker / FastAPICI/CDGitHub Actionsディレクトリ構成Plaintextaccessroute/
├── CLAUDE.md                # エージェント共通設定
├── README.md                # このファイル
├── CONTRIBUTING.md          # コントリビューションガイド
├── ios/                     # iOS アプリ (iOS-Agent)
│   ├── AccessRoute/         # SwiftUI ビュー / ViewModels / MapKit連携
│   │   ├── Models/          # データモデル
│   │   ├── Views/           # UI実装
│   │   ├── ViewModels/      # ビジネスロジック
│   │   └── Services/        # Yahoo! API連携・位置情報
│   └── AccessRouteTests/    # ユニットテスト・UIテスト
├── backend/                 # Firebase Backend (Backend-Agent)
│   ├── functions/           # Cloud Functions ソースコード
│   │   ├── src/             # Yahoo! APIプロキシロジック (TypeScript)
│   └── firestore.rules      # Firestore セキュリティルール
├── ai-server/               # AI 推論サーバー (AI-Agent)
│   ├── Dockerfile
│   ├── server.py            # FastAPI サーバー
│   └── prompts/             # システムプロンプトテンプレート
└── docs/                    # 共有仕様・ドキュメント (Docs-Agent)
    ├── api-spec.yaml        # API 仕様書
    └── setup-guide.md       # 環境構築ガイド
セットアップ手順iOSXcode 15以上をインストール。ios/AccessRoute.xcodeproj を開き、依存関係を解決。Info.plist に Yahoo! JAPAN Client ID を設定。シミュレータまたは実機でビルドを実行。BackendNode.js 18以上、Firebase CLIをインストール。backend/functions/src/config.ts に Yahoo! APIキーを設定。firebase emulators:start でローカル環境を起動、または firebase deploy でデプロイ。AI ServerDocker、Python 3.10以上をインストール。cd ai-server && docker build -t accessroute-ai .docker run -p 8000:8000 accessroute-ai で起動。開発フローコミット規約Conventional Commits に準拠し、feat:, fix:, docs:, chore: 等のプレフィックスを使用する。品質基準アクセシビリティ: VoiceOverによる全画面動作確認を必須とする。データ精度: Yahoo! APIの最新施設情報を活用し、属性情報の正答率 90%以上を目標とする。セキュリティ: APIキーのクライアント側露出をゼロにし、すべてBackend経由でセキュアに管理。ライセンスMIT LicenseCopyright (c) 2026 AccessRoute
