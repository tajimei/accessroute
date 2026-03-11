# フォールバック手順書 - AccessRoute AI推論サーバー

## 概要

プライマリGPUサーバーがダウンした場合のクラウドGPU切替手順。
想定復旧時間（RTO）: 30分以内。

---

## 1. 障害検知

### 自動検知

- `scripts/healthcheck.sh` が3回連続失敗を検知し、コンテナ再起動を試行
- 再起動後もヘルスチェックが失敗する場合、GPU障害と判断

### 手動確認

```bash
# サーバーの状態確認
curl -s http://localhost:8000/health | jq .

# GPUの状態確認
nvidia-smi

# コンテナログ確認
docker compose -f docker-compose.prod.yaml logs --tail=50 ai-server

# システムリソース確認
free -h
df -h
```

---

## 2. 障害レベル判定

| レベル | 症状 | 対応 |
|--------|------|------|
| L1 | コンテナクラッシュ、GPU正常 | コンテナ再起動 |
| L2 | OOMエラー、GPU正常 | 量子化モデルに切替 |
| L3 | GPU認識不可、ハードウェア障害 | クラウドGPUへ切替 |

---

## 3. L1: コンテナ再起動

```bash
# コンテナを再起動
docker compose -f docker-compose.prod.yaml restart ai-server

# 状態確認（モデルロードに2-5分かかる場合がある）
watch -n 5 'curl -s http://localhost:8000/health | jq .'
```

---

## 4. L2: 量子化モデルへの切替

GPUメモリ不足（OOM）の場合、量子化モデルに切り替える。

```bash
# docker-compose.prod.yaml の環境変数を変更
# QUANTIZATION=gptq に設定されていることを確認

# メモリ使用量を減らす設定で再起動
GPU_MEMORY_UTILIZATION=0.7 docker compose -f docker-compose.prod.yaml up -d ai-server
```

---

## 5. L3: クラウドGPUへの切替

### 5.1 前提条件

- クラウドGPUプロバイダのアカウント（以下いずれか）:
  - RunPod
  - Lambda Labs
  - Vast.ai
- Dockerイメージがレジストリにプッシュ済み
- モデルファイルがHugging Face Hub上にある（プライベートの場合はトークン必要）

### 5.2 RunPod での切替手順

#### Step 1: GPUインスタンスを起動

```bash
# RunPod CLI でインスタンス作成（A100 80GB推奨）
runpodctl create pod \
  --name accessroute-ai \
  --gpuType "NVIDIA A100 80GB" \
  --gpuCount 1 \
  --imageName "your-registry/accessroute-ai:latest" \
  --volumeSize 50 \
  --ports "8000/http" \
  --env "MODEL_NAME=cyberagent/calm3-22b-chat" \
  --env "MODEL_BACKEND=vllm" \
  --env "QUANTIZATION=gptq" \
  --env "GPU_MEMORY_UTILIZATION=0.9" \
  --env "HF_TOKEN=${HF_TOKEN}"
```

#### Step 2: 接続確認

```bash
# RunPod のエンドポイントURLを取得
CLOUD_URL="https://<pod-id>-8000.proxy.runpod.net"

# ヘルスチェック（モデルロードまで数分待つ）
for i in $(seq 1 30); do
  STATUS=$(curl -sf "$CLOUD_URL/health" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "waiting")
  echo "[$i/30] Status: $STATUS"
  if [ "$STATUS" = "ok" ]; then
    echo "クラウドGPUサーバー起動完了"
    break
  fi
  sleep 10
done
```

#### Step 3: DNS / プロキシの切替

```bash
# Nginx のアップストリームをクラウドに切替
# /etc/nginx/conf.d/upstream.conf を編集
sudo sed -i "s|server 127.0.0.1:8000;|server <cloud-ip>:8000;|" \
  /etc/nginx/conf.d/accessroute-ai.conf

# Nginx をリロード
sudo nginx -t && sudo systemctl reload nginx
```

### 5.3 Lambda Labs での切替手順

```bash
# Lambda CLI でインスタンス作成
lambda instance create \
  --instance-type gpu_1x_a100_sxm4 \
  --region us-east-1 \
  --ssh-key-name my-key \
  --name accessroute-ai

# SSH接続してDockerを起動
ssh ubuntu@<lambda-ip> << 'REMOTE'
  git clone <your-repo> /opt/accessroute
  cd /opt/accessroute/ai-server
  docker compose -f docker-compose.prod.yaml up -d
REMOTE
```

### 5.4 Vast.ai での切替手順

```bash
# Vast.ai CLI でインスタンス検索・作成
vastai search offers 'gpu_name=A100 num_gpus=1 rentable=true' \
  --order 'dph_total'

vastai create instance <offer-id> \
  --image your-registry/accessroute-ai:latest \
  --disk 50 \
  --env "MODEL_NAME=cyberagent/calm3-22b-chat" \
  --env "MODEL_BACKEND=vllm"
```

---

## 6. 復旧後のフォールバック

プライマリGPUが復旧した場合:

```bash
# 1. プライマリサーバーを起動
sudo systemctl start accessroute-ai

# 2. ヘルスチェック確認
curl -s http://localhost:8000/health | jq .

# 3. Nginx をプライマリに切り戻し
sudo sed -i "s|server <cloud-ip>:8000;|server 127.0.0.1:8000;|" \
  /etc/nginx/conf.d/accessroute-ai.conf
sudo nginx -t && sudo systemctl reload nginx

# 4. クラウドGPUインスタンスを停止（課金停止）
runpodctl stop pod <pod-id>
# または
runpodctl remove pod <pod-id>
```

---

## 7. チェックリスト

### 定期確認（週次）

- [ ] `nvidia-smi` でGPU温度・メモリ使用量が正常範囲内
- [ ] ヘルスチェックスクリプトが稼働中
- [ ] クラウドGPUプロバイダのアカウントとクレジットが有効
- [ ] Dockerイメージが最新版でレジストリにプッシュ済み

### 障害発生時

- [ ] 障害レベルを判定（L1/L2/L3）
- [ ] 該当手順に従って対応
- [ ] バックエンドサーバー（Cloud Functions）のAI_SERVER_URLを更新
- [ ] ヘルスチェックで復旧を確認
- [ ] 障害レポートを記録
