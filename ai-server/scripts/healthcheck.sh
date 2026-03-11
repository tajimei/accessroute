#!/bin/bash
# ============================================================
# AccessRoute AI推論サーバー - ヘルスチェック監視スクリプト
#
# /health エンドポイントを定期チェックし、
# 3回連続失敗でコンテナを自動再起動する。
#
# 使い方:
#   chmod +x scripts/healthcheck.sh
#   ./scripts/healthcheck.sh                    # デフォルト設定で実行
#   ./scripts/healthcheck.sh --interval 30      # 30秒間隔
#   ./scripts/healthcheck.sh --url http://host:8000/health
#
# cron設定例（1分間隔で実行）:
#   * * * * * /opt/accessroute/ai-server/scripts/healthcheck.sh --single
# ============================================================

set -euo pipefail

# --- デフォルト設定 ---
HEALTH_URL="${HEALTH_URL:-http://localhost:8000/health}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
FAIL_THRESHOLD=3
CONTAINER_NAME="${CONTAINER_NAME:-accessroute-ai-server}"
COMPOSE_FILE="${COMPOSE_FILE:-/opt/accessroute/ai-server/docker-compose.prod.yaml}"
STATE_FILE="/tmp/accessroute-healthcheck-failures"
LOG_FILE="/var/log/accessroute-healthcheck.log"
SINGLE_MODE=false

# --- 引数パース ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        --url)
            HEALTH_URL="$2"
            shift 2
            ;;
        --interval)
            CHECK_INTERVAL="$2"
            shift 2
            ;;
        --container)
            CONTAINER_NAME="$2"
            shift 2
            ;;
        --compose-file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        --single)
            SINGLE_MODE=true
            shift
            ;;
        --help)
            echo "使い方: $0 [オプション]"
            echo ""
            echo "オプション:"
            echo "  --url URL           ヘルスチェックURL（デフォルト: http://localhost:8000/health）"
            echo "  --interval SECONDS  チェック間隔（秒、デフォルト: 60）"
            echo "  --container NAME    コンテナ名（デフォルト: accessroute-ai-server）"
            echo "  --compose-file PATH docker-compose.yamlのパス"
            echo "  --single            1回だけチェックして終了（cron用）"
            echo "  --help              このヘルプを表示"
            exit 0
            ;;
        *)
            echo "不明なオプション: $1" >&2
            exit 1
            ;;
    esac
done

# --- ログ関数 ---
log() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$LOG_FILE" 2>/dev/null || echo "[$timestamp] $1"
}

# --- ヘルスチェック実行 ---
check_health() {
    local http_code
    http_code=$(curl -sf -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")

    if [[ "$http_code" == "200" ]]; then
        return 0
    else
        return 1
    fi
}

# --- 失敗カウント管理 ---
get_failure_count() {
    if [[ -f "$STATE_FILE" ]]; then
        cat "$STATE_FILE"
    else
        echo "0"
    fi
}

set_failure_count() {
    echo "$1" > "$STATE_FILE"
}

reset_failure_count() {
    set_failure_count 0
}

# --- コンテナ再起動 ---
restart_container() {
    log "警告: ${FAIL_THRESHOLD}回連続でヘルスチェックに失敗しました。コンテナを再起動します..."

    if [[ -f "$COMPOSE_FILE" ]]; then
        log "docker compose で再起動: $COMPOSE_FILE"
        docker compose -f "$COMPOSE_FILE" restart ai-server 2>&1 | tee -a "$LOG_FILE"
    else
        log "docker restart で再起動: $CONTAINER_NAME"
        docker restart "$CONTAINER_NAME" 2>&1 | tee -a "$LOG_FILE"
    fi

    reset_failure_count
    log "コンテナ再起動を実行しました。次のチェックまで待機します。"
}

# --- 単一チェック ---
run_single_check() {
    local failures
    failures=$(get_failure_count)

    if check_health; then
        if [[ "$failures" -gt 0 ]]; then
            log "ヘルスチェック回復: $HEALTH_URL (連続失敗: ${failures} → 0)"
        fi
        reset_failure_count
    else
        failures=$((failures + 1))
        set_failure_count "$failures"
        log "ヘルスチェック失敗 (${failures}/${FAIL_THRESHOLD}): $HEALTH_URL"

        if [[ "$failures" -ge "$FAIL_THRESHOLD" ]]; then
            restart_container
        fi
    fi
}

# --- メイン処理 ---
main() {
    log "ヘルスチェック監視開始: URL=$HEALTH_URL, 間隔=${CHECK_INTERVAL}秒, 閾値=${FAIL_THRESHOLD}回"
    reset_failure_count

    while true; do
        run_single_check
        sleep "$CHECK_INTERVAL"
    done
}

# 実行
if [[ "$SINGLE_MODE" == true ]]; then
    run_single_check
else
    main
fi
