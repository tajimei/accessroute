# AccessRoute

ユーザーの身体状況（車椅子、ベビーカー、杖歩行、高齢者等）に合わせたバリアフリールート検索・スポット提案を行うiOSアプリケーション。AIチャットによる対話的なニーズ抽出と、**Yahoo! JAPAN API**から取得する精緻なアクセシビリティ情報を組み合わせた、日本国内での最適な移動サポートを特徴とする。

## アーキテクチャ

```

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
```

## データフロー
```

[ ユーザー ]
      |
      | (1) 移動特性・回避条件の入力
      v
[ iOS App (SwiftUI) ] <----------+
      |                          | (5) ルート・スポット表示
      | (2) ニーズ抽出 (AI対話)   |
      v                          |
[ AI Server / Backend ] ---------+
      |
      | (3) データ照合
      v
[ Yahoo! JAPAN API ]
      | (4) アクセシビリティ情報取得
      +--------------------------------------------->
```

## 処理ステップ

| ステップ | 内容 |
|----------|------|
| 1 | ユーザーが移動手段・回避条件を入力 |
| 2 | AIチャットが動的なニーズを抽出 |
| 3 | Backendがユーザー特性と地図データを照合 |
| 4 | Yahoo! JAPAN APIから施設情報を取得 |
| 5 | 最適ルートとスポットを地図上に表示 |

---

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| iOS | Swift / SwiftUI / MapKit |
| Backend | Firebase (Firestore, Cloud Functions v2, Auth) |
| AI | Hugging Face 日本語LLM / vLLM / FastAPI / Docker |
| External API | Yahoo! JAPAN API |
| CI/CD | GitHub Actions |

---

## ディレクトリ構成
```

accessroute/
├── CLAUDE.md
├── README.md
├── ios/
│   ├── AccessRoute/
│   └── AccessRouteTests/
├── backend/
│   ├── functions/
│   └── firestore.rules
├── ai-server/
│   ├── Dockerfile
│   ├── server.py
│   └── prompts/
└── docs/
    ├── api-spec.yaml
    └── setup-guide.md
```
---

## 特徴

- ユーザーの身体状況に応じたルート最適化
- AIチャットによるリアルタイムなニーズ抽出
- バリアフリー情報（エレベーター・スロープ等）の統合表示
- ルート沿いの休憩所・トイレ等の可視化

---

## セットアップ

### 1. リポジトリをクローン

git clone https://github.com/tajimei/accessroute.git
cd accessroute

### 2. iOSアプリ

- Xcodeで ios/AccessRoute を開く
- ビルドして実行

### 3. Backend

cd backend/functions
npm install
firebase deploy

### 4. AIサーバー

cd ai-server
docker build -t accessroute-ai .
docker run -p 8000:8000 accessroute-ai

---

## 今後の改善

- リアルタイム混雑情報の統合
- ユーザー行動データに基づく推薦精度向上
- 多言語対応

---

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
