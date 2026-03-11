# コントリビューションガイド

AccessRoute プロジェクトへの貢献方法について説明する。

## コントリビューションの流れ

1. Issue を確認し、作業対象を決定する
2. `develop` ブランチから feature/fix ブランチを作成する
3. 変更を実装し、テストを追加する
4. Conventional Commits に従ってコミットする
5. PR を作成し、レビューを依頼する
6. レビュー承認後、`develop` にマージする

## ブランチの作成

```bash
# develop から最新を取得
git checkout develop
git pull origin develop

# feature ブランチを作成
git checkout -b feature/{agent}-{機能名}

# 例
git checkout -b feature/ios-profile-screen
git checkout -b fix/backend-auth-validation
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

- ESLint + Prettier 準拠、strict mode
- Cloud Functions は v2 を使用
- APIキーはすべてサーバーサイドで管理（クライアント露出禁止）

### Python (AI Server)

- Black + Ruff でフォーマット
- 型ヒント必須
- Docstring は Google Style

## PR 作成ガイドライン

### PR タイトル

Conventional Commits 形式に従う。

```
feat(ios): プロファイル編集画面を追加
fix(backend): 認証トークン検証のエラーハンドリングを修正
docs: API仕様書を更新
```

### PR 本文テンプレート

```markdown
## 概要
変更内容の要約を1-3行で記述する。

## 変更点
- 変更点1
- 変更点2

## テスト
- [ ] ユニットテストを追加・更新した
- [ ] 既存テストが全て通過する
- [ ] （iOS）VoiceOver で動作確認した

## 関連 Issue
closes #xxx
```

### PR のルール

- テストなしの PR はマージ不可
- 最低1名のレビュー承認が必要
- CI が全て通過していること
- コンフリクトが解消されていること

## エージェント別の作業領域ルール

本プロジェクトは複数のAIエージェントが協調して開発を行う。各エージェントは担当ディレクトリ内でのみファイルを変更する。

| エージェント | 担当ディレクトリ | 役割 |
|------------|----------------|------|
| iOS-Agent | `ios/` | iOS アプリの開発 |
| Backend-Agent | `backend/` | Firebase Backend の開発 |
| AI-Agent | `ai-server/` | AI 推論サーバーの開発 |
| Docs-Agent | `docs/`, `README.md`, `CONTRIBUTING.md` | ドキュメント管理 |
| Test-Agent | `.github/workflows/` | CI/CD パイプライン構築 |

### 作業領域のルール

- 自分の担当ディレクトリ外のファイルを直接変更しない
- 他エージェントの機能に依存する場合は `docs/` 内の仕様書を参照する
- API 仕様の変更は Orchestrator の承認を経てから行う
- 共通データ型（`docs/data-models.ts`）の変更は全エージェントに影響するため、慎重に扱う
