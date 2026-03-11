# 開発環境セットアップガイド

AccessRoute の各コンポーネントの開発環境構築手順を説明する。

## 目次

- [iOS 開発環境](#ios-開発環境)
- [Backend 開発環境](#backend-開発環境)
- [AI Server 開発環境](#ai-server-開発環境)
- [環境変数一覧](#環境変数一覧)

---

## iOS 開発環境

### 前提条件

- macOS 14 (Sonoma) 以上
- Xcode 15 以上
- Apple Developer アカウント（実機テスト時）

### セットアップ手順

#### 1. Xcode のインストール

App Store から Xcode をインストールし、コマンドラインツールを設定する。

```bash
xcode-select --install
```

#### 2. 依存パッケージの管理

本プロジェクトでは Swift Package Manager (SPM) を推奨する。

**SPM の場合:**

Xcode でプロジェクトを開くと、依存パッケージが自動的に解決される。

```bash
cd ios/
open AccessRoute.xcodeproj
```

**CocoaPods の場合:**

```bash
# CocoaPods のインストール（未導入の場合）
sudo gem install cocoapods

cd ios/
pod install
open AccessRoute.xcworkspace
```

#### 3. Google Maps SDK API キーの取得

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」 > 「ライブラリ」から以下を有効化:
   - Maps SDK for iOS
   - Directions API
   - Places API
4. 「APIとサービス」 > 「認証情報」からAPIキーを作成
5. APIキーにiOSアプリのバンドルIDで制限を設定
6. `ios/AccessRoute/` 配下に `Secrets.plist` を作成し、APIキーを記載:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>GOOGLE_MAPS_API_KEY</key>
    <string>YOUR_API_KEY_HERE</string>
</dict>
</plist>
```

`Secrets.plist` は `.gitignore` に追加済みのため、リポジトリにはコミットされない。

#### 4. SwiftLint のインストール

```bash
brew install swiftlint
```

---

## Backend 開発環境

### 前提条件

- Node.js 18 以上
- npm 9 以上
- Firebase CLI

### セットアップ手順

#### 1. Node.js のインストール

```bash
# nvm を使用する場合
nvm install 18
nvm use 18

# Homebrew を使用する場合
brew install node@18
```

#### 2. Firebase CLI のインストール

```bash
npm install -g firebase-tools

# ログイン
firebase login
```

#### 3. プロジェクトの初期化

```bash
cd backend/functions/
npm install
```

#### 4. Firebase エミュレータのセットアップ

```bash
# エミュレータのインストール
firebase setup:emulators:firestore
firebase setup:emulators:auth
firebase setup:emulators:functions

# エミュレータの起動
firebase emulators:start
```

エミュレータ UI は http://localhost:4000 でアクセスできる。

#### 5. ESLint / Prettier の確認

```bash
cd backend/functions/
npx eslint --check src/
npx prettier --check src/
```

---

## AI Server 開発環境

### 前提条件

- Python 3.10 以上
- Docker (本番環境)
- CUDA 対応 GPU（推奨、CPU でも動作可能）

### セットアップ手順

#### 1. Python 環境の構築

```bash
cd ai-server/

# venv を使用
python3 -m venv .venv
source .venv/bin/activate

# 依存パッケージのインストール
pip install -r requirements.txt
```

#### 2. Docker でのセットアップ（推奨）

```bash
cd ai-server/

# イメージのビルド
docker build -t accessroute-ai .

# GPU 使用で起動
docker run -p 8000:8000 --gpus all accessroute-ai

# CPU のみで起動（開発用）
docker run -p 8000:8000 accessroute-ai
```

#### 3. GPU 設定（NVIDIA GPU の場合）

```bash
# NVIDIA ドライバーの確認
nvidia-smi

# NVIDIA Container Toolkit のインストール（Docker GPU 対応）
# Ubuntu の場合:
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

#### 4. ローカルでの起動（Docker 不使用）

```bash
cd ai-server/
source .venv/bin/activate
python server.py
```

サーバーは http://localhost:8000 で起動する。ヘルスチェックは `GET /health` で確認できる。

#### 5. コードフォーマット

```bash
# Black でフォーマット
black .

# Ruff でリント
ruff check .
```

---

## 環境変数一覧

### iOS

| 変数名 | 説明 | 設定場所 |
|--------|------|---------|
| `GOOGLE_MAPS_API_KEY` | Google Maps SDK APIキー | `Secrets.plist` |

### Backend (Cloud Functions)

| 変数名 | 説明 | 設定方法 |
|--------|------|---------|
| `GOOGLE_MAPS_API_KEY` | Google Maps Directions API キー | `firebase functions:config:set` |
| `AI_SERVER_URL` | AI推論サーバーのURL | `firebase functions:config:set` |
| `FIREBASE_PROJECT_ID` | Firebase プロジェクトID | 自動設定 |

```bash
# 設定例
firebase functions:config:set \
  maps.api_key="YOUR_GOOGLE_MAPS_API_KEY" \
  ai.server_url="https://ai.accessroute.example.com"
```

### AI Server

| 変数名 | 説明 | デフォルト値 |
|--------|------|------------|
| `MODEL_NAME` | 使用するHugging Faceモデル名 | -- |
| `PORT` | サーバーポート | `8000` |
| `MAX_TOKENS` | 最大生成トークン数 | `1024` |
| `DEFAULT_TEMPERATURE` | デフォルトの温度パラメータ | `0.7` |
| `GPU_MEMORY_UTILIZATION` | GPU メモリ使用率 | `0.9` |
| `LOG_LEVEL` | ログレベル | `info` |

```bash
# .env ファイルの例
MODEL_NAME=your-model-name
PORT=8000
MAX_TOKENS=1024
DEFAULT_TEMPERATURE=0.7
GPU_MEMORY_UTILIZATION=0.9
LOG_LEVEL=info
```

`.env` ファイルは `.gitignore` に追加済みのため、リポジトリにはコミットされない。
