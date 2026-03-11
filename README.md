# AccessRoute

ユーザーの身体状況（車椅子、ベビーカー、杖歩行、高齢者等）に合わせたバリアフリールート検索・スポット提案を行うiOSアプリケーション。AIチャットによる対話的なニーズ抽出と、アクセシビリティ情報に基づいた最適ルートの提示を特徴とする。

## アーキテクチャ

```
+------------------+       +----------------------+       +--------------------+
|                  |       |                      |       |                    |
|   iOS App        |<----->|   Firebase Backend   |<----->|   AI Server        |
|   (SwiftUI)      | REST  |   (Cloud Functions)  | HTTP  |   (vLLM + FastAPI) |
|                  |  API  |   (Firestore)        |       |                    |
+------------------+       +----------------------+       +--------------------+
        |                          |
        |                          |
        v                          v
+------------------+       +----------------------+
| Google Maps SDK  |       | Firebase Auth        |
| (地図・ルート表示) |       | (認証・認可)          |
+------------------+       +----------------------+
```

### データフロー

1. ユーザーがiOSアプリでプロファイル（移動手段、回避条件等）を登録
2. AIチャットで対話的にニーズを抽出、または直接ルート検索を実行
3. Backend が Google Maps API とユーザープロファイルを組み合わせてバリアフリールートを生成
4. ルート沿いのアクセシブルスポット（トイレ、休憩所等）を併せて提示

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| iOS | Swift / SwiftUI / Google Maps SDK for iOS |
| Backend | Firebase (Firestore, Cloud Functions v2 TypeScript, Auth) |
| AI | Hugging Face 日本語LLM / vLLM / Docker / FastAPI |
| CI/CD | GitHub Actions |

## ディレクトリ構成

```
accessroute/
├── CLAUDE.md                # エージェント共通設定
├── README.md                # このファイル
├── CONTRIBUTING.md          # コントリビューションガイド
├── ios/                     # iOS アプリ (iOS-Agent)
│   ├── AccessRoute/         # メインアプリソース
│   │   ├── Models/          # データモデル
│   │   ├── Views/           # SwiftUI ビュー
│   │   ├── ViewModels/      # MVVM ViewModel
│   │   └── Services/        # API通信・位置情報等
│   └── AccessRouteTests/    # ユニットテスト・UIテスト
├── backend/                 # Firebase Backend (Backend-Agent)
│   ├── functions/           # Cloud Functions ソースコード
│   │   ├── src/             # TypeScript ソース
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── firestore.rules      # Firestore セキュリティルール
├── ai-server/               # AI 推論サーバー (AI-Agent)
│   ├── Dockerfile
│   ├── server.py            # FastAPI サーバー
│   ├── config.py            # 設定ファイル
│   └── prompts/             # システムプロンプトテンプレート
├── docs/                    # 共有仕様・ドキュメント (Docs-Agent)
│   ├── api-spec.yaml        # iOS <-> Backend REST API 仕様
│   ├── ai-api-spec.yaml     # Backend <-> AI Server API 仕様
│   ├── data-models.ts       # 共通データ型定義
│   └── setup-guide.md       # 環境構築ガイド
└── .github/workflows/       # CI/CD パイプライン (Test-Agent)
```

## セットアップ手順

各コンポーネントの詳細なセットアップ手順は [docs/setup-guide.md](docs/setup-guide.md) を参照。

### iOS

```bash
# 前提条件: Xcode 15以上、CocoaPods or Swift Package Manager
cd ios/
# SPM を使用する場合は Xcode でプロジェクトを開き、依存を解決
open AccessRoute.xcodeproj
# CocoaPods を使用する場合
pod install
open AccessRoute.xcworkspace
```

### Backend

```bash
# 前提条件: Node.js 18以上、Firebase CLI
cd backend/functions/
npm install
# Firebase エミュレータ起動
firebase emulators:start
```

### AI Server

```bash
# 前提条件: Docker, Python 3.10以上、CUDA対応GPU（推奨）
cd ai-server/
# Docker で起動
docker build -t accessroute-ai .
docker run -p 8000:8000 --gpus all accessroute-ai
# ローカル開発（Docker不使用）
pip install -r requirements.txt
python server.py
```

## 開発フロー

### ブランチ戦略

| ブランチ | 用途 |
|---------|------|
| `main` | 本番リリース用。直接コミット禁止 |
| `develop` | 開発統合ブランチ。各 feature ブランチのマージ先 |
| `feature/{agent}-{機能名}` | 機能開発（例: `feature/ios-map-view`） |
| `fix/{agent}-{修正内容}` | バグ修正（例: `fix/backend-auth-error`） |

### コミット規約

Conventional Commits に準拠する。

```
<type>: <description>

[optional body]
```

type の種類:

- `feat:` -- 新機能の追加
- `fix:` -- バグ修正
- `docs:` -- ドキュメントの変更
- `test:` -- テストの追加・修正
- `chore:` -- ビルド・ツール設定等の変更
- `refactor:` -- リファクタリング

### 品質基準

- テストカバレッジ: 最低60%
- アクセシビリティ: VoiceOver 全画面動作確認
- AI応答: ニーズ抽出正答率 80%以上
- パフォーマンス: 画面遷移 0.3秒以内
- セキュリティ: APIキーのクライアント露出ゼロ

## API仕様

- iOS <-> Backend: [docs/api-spec.yaml](docs/api-spec.yaml)
- Backend <-> AI Server: [docs/ai-api-spec.yaml](docs/ai-api-spec.yaml)
- 共通データ型: [docs/data-models.ts](docs/data-models.ts)

## ライセンス

MIT License

Copyright (c) 2026 AccessRoute

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
