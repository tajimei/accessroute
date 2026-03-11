# AccessRoute - CLAUDE.md

## プロジェクト概要
アクセシブル・トラベルナビアプリ。ユーザーの身体状況（車椅子、ベビーカー、高齢者等）に合わせたバリアフリールート・スポット提案を行うiOSアプリ。

## 技術スタック
- iOS: Swift / SwiftUI / Google Maps SDK for iOS
- Backend: Firebase (Firestore, Cloud Functions TypeScript, Auth)
- AI: Hugging Face 日本語LLM / vLLM / Docker / FastAPI
- CI/CD: GitHub Actions

## ディレクトリ構成
```
accessroute/
├── CLAUDE.md              # このファイル
├── ios/                   # iOS-Agent の作業領域
│   ├── AccessRoute/       # メインアプリ
│   └── AccessRouteTests/  # テスト
├── backend/               # Backend-Agent の作業領域
│   ├── functions/         # Cloud Functions
│   └── firestore.rules    # セキュリティルール
├── ai-server/             # AI-Agent の作業領域
│   ├── Dockerfile
│   ├── server.py
│   └── prompts/           # システムプロンプト
├── docs/                  # 共有仕様 + Docs-Agent
│   ├── api-spec.yaml      # iOS <-> Backend REST API仕様
│   ├── ai-api-spec.yaml   # Backend <-> AI推論サーバー仕様
│   └── data-models.ts     # 共通データ型定義
└── .github/workflows/     # Test-Agent の CI/CD
```

## コーディング規約

### Swift (iOS)
- SwiftLint 準拠
- MVVM アーキテクチャ
- async/await を優先使用
- コメント・ドキュメントは日本語
- 最小タップターゲット 44x44pt
- Dynamic Type, VoiceOver, 高コントラスト対応必須

### TypeScript (Backend)
- ESLint + Prettier、strict mode
- Cloud Functions は v2 を使用
- APIキーはすべてサーバーサイドで管理（クライアント露出禁止）

### Python (AI Server)
- Black + Ruff でフォーマット
- 型ヒント必須
- Docstring は Google Style

## エージェント作業ルール
- 自分の担当ディレクトリ外のファイルを直接変更しない
- 他エージェントへの依存は /docs/ 内の仕様書を参照
- API仕様の変更は Orchestrator の承認を経る
- テストなしのPRはマージ不可
- コミットメッセージは Conventional Commits 準拠 (feat:, fix:, docs:, test:, chore:)

## ブランチ戦略
- main: 本番リリース用
- develop: 開発統合ブランチ
- feature/{agent}-{機能名}: 機能開発
- fix/{agent}-{修正内容}: バグ修正

## 品質基準
- テストカバレッジ: 最低60%
- アクセシビリティ: VoiceOver 全画面動作確認
- AI応答: ニーズ抽出正答率 80%以上（ベンチマーク）
- パフォーマンス: 画面遷移 0.3秒以内
- セキュリティ: APIキーのクライアント露出ゼロ
