#!/bin/bash
# AccessRoute Firebase デプロイスクリプト
# 使い方: ./scripts/deploy.sh [環境] [コンポーネント]
# 環境: dev | staging | prod（デフォルト: dev）
# コンポーネント: all | functions | firestore | indexes | hosting（デフォルト: all）

set -euo pipefail

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# スクリプトのディレクトリを基準にプロジェクトルートを特定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 引数パース
ENVIRONMENT="${1:-dev}"
COMPONENT="${2:-all}"

# 環境ごとのFirebaseプロジェクトID
case "${ENVIRONMENT}" in
  dev)
    PROJECT_ID="accessroute-dev"
    ;;
  staging)
    PROJECT_ID="accessroute-staging"
    ;;
  prod)
    PROJECT_ID="accessroute-prod"
    ;;
  *)
    echo -e "${RED}エラー: 不明な環境 '${ENVIRONMENT}'${NC}"
    echo "使用可能な環境: dev, staging, prod"
    exit 1
    ;;
esac

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} AccessRoute デプロイ${NC}"
echo -e "${GREEN} 環境: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "${GREEN} プロジェクト: ${YELLOW}${PROJECT_ID}${NC}"
echo -e "${GREEN} コンポーネント: ${YELLOW}${COMPONENT}${NC}"
echo -e "${GREEN}========================================${NC}"

# 本番デプロイ時は確認
if [ "${ENVIRONMENT}" = "prod" ]; then
  echo -e "${RED}警告: 本番環境へのデプロイです。続行しますか？ (y/N)${NC}"
  read -r confirm
  if [ "${confirm}" != "y" ] && [ "${confirm}" != "Y" ]; then
    echo "デプロイを中止しました。"
    exit 0
  fi
fi

# Firebaseプロジェクトを選択
echo -e "${YELLOW}Firebaseプロジェクトを選択中...${NC}"
cd "${PROJECT_DIR}"
firebase use "${PROJECT_ID}"

# Cloud Functions デプロイ
deploy_functions() {
  echo -e "${YELLOW}Cloud Functions をデプロイ中...${NC}"
  cd "${PROJECT_DIR}/functions"

  echo "  TypeScript ビルド..."
  npm run build

  echo "  Lint チェック..."
  npm run lint

  echo "  デプロイ実行..."
  cd "${PROJECT_DIR}"
  firebase deploy --only functions --project "${PROJECT_ID}"

  echo -e "${GREEN}Cloud Functions デプロイ完了${NC}"
}

# Firestore ルールデプロイ
deploy_firestore() {
  echo -e "${YELLOW}Firestore ルールをデプロイ中...${NC}"
  cd "${PROJECT_DIR}"
  firebase deploy --only firestore:rules --project "${PROJECT_ID}"
  echo -e "${GREEN}Firestore ルール デプロイ完了${NC}"
}

# Firestore インデックスデプロイ
deploy_indexes() {
  echo -e "${YELLOW}Firestore インデックスをデプロイ中...${NC}"
  cd "${PROJECT_DIR}"
  firebase deploy --only firestore:indexes --project "${PROJECT_ID}"
  echo -e "${GREEN}Firestore インデックス デプロイ完了${NC}"
}

# Firebase Hosting デプロイ
deploy_hosting() {
  echo -e "${YELLOW}Firebase Hosting をデプロイ中...${NC}"
  cd "${PROJECT_DIR}"
  firebase deploy --only hosting --project "${PROJECT_ID}"
  echo -e "${GREEN}Firebase Hosting デプロイ完了${NC}"
}

# コンポーネント別デプロイ
case "${COMPONENT}" in
  all)
    deploy_functions
    deploy_firestore
    deploy_indexes
    deploy_hosting
    ;;
  functions)
    deploy_functions
    ;;
  firestore)
    deploy_firestore
    ;;
  indexes)
    deploy_indexes
    ;;
  hosting)
    deploy_hosting
    ;;
  *)
    echo -e "${RED}エラー: 不明なコンポーネント '${COMPONENT}'${NC}"
    echo "使用可能なコンポーネント: all, functions, firestore, indexes, hosting"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} デプロイ完了！${NC}"
echo -e "${GREEN}========================================${NC}"
