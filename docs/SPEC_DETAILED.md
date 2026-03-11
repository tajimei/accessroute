# AccessRoute - 仕様書（詳細版）

## 1. プロダクト概要

### 1.1 コンセプト
AccessRoute は、移動に制約のあるユーザー（車椅子利用者、ベビーカー利用者、杖使用者、高齢者同行者等）に向けた、バリアフリー対応のトラベルナビゲーションアプリである。ユーザーの身体状況・同行者情報に基づき、最適なルートとスポットを提案する。

### 1.2 対象プラットフォーム
- iOS / Android（Expo SDK 54 + React Native 0.81）
- Web（expo-router による Web 対応）

### 1.3 対応地域
全国10地域 + 新幹線網をカバー:
北海道、東北、関東、中部、北陸、関西、中国、四国、九州、新幹線

---

## 2. アーキテクチャ

### 2.1 システム構成図

```
┌─────────────────────────────────────────────────────────────┐
│                    モバイルアプリ (Expo/React Native)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │ ホーム画面 │ │ルート検索 │ │AIチャット │ │ 独自鉄道ルーター  ││
│  │(index.tsx)│ │(route.tsx)│ │(chat.tsx) │ │(transitRouter.ts)││
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Google Maps WebView (MapViewWrapper.tsx)                 ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (Bearer Token)
┌──────────────────────▼──────────────────────────────────────┐
│              Cloud Functions v2 (Firebase)                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌────────┐ ┌──────────────┐ │
│  │ Auth  │ │ Route │ │ Spots │ │Geocode │ │    Chat      │ │
│  │Router │ │Router │ │Router │ │Router  │ │   Router     │ │
│  └───────┘ └───────┘ └───────┘ └────────┘ └──────┬───────┘ │
│  ┌──────────────────────────────────────┐         │         │
│  │ scoring.ts / mapsApi.ts / Firestore  │         │         │
│  └──────────────────────────────────────┘         │         │
└───────────────────────────────────────────────────┼─────────┘
                                                    │ HTTP
┌───────────────────────────────────────────────────▼─────────┐
│              AI推論サーバー (FastAPI + vLLM)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ /v1/chat     │ │/v1/extract   │ │ /health              │ │
│  │ (対話応答)    │ │(ニーズ抽出)   │ │ (ヘルスチェック)      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Expo SDK 54, React Native 0.81, TypeScript 5.8, expo-router |
| マップ | Google Maps JavaScript API (WebView内) |
| バックエンド | Firebase Cloud Functions v2, Express.js, TypeScript |
| データベース | Cloud Firestore |
| 認証 | Firebase Authentication (REST API) |
| AI | FastAPI, vLLM / transformers, 日本語LLM |
| CI/CD | GitHub Actions |

---

## 3. データモデル

### 3.1 ユーザープロファイル

```typescript
type MobilityType = "wheelchair" | "stroller" | "cane" | "walk" | "other";
type Companion = "child" | "elderly" | "disability";
type AvoidCondition = "stairs" | "slope" | "crowd" | "dark";
type PreferCondition = "restroom" | "rest_area" | "covered";

interface UserProfile {
  userId: string;
  mobilityType: MobilityType;
  companions: Companion[];
  maxDistanceMeters: number;
  avoidConditions: AvoidCondition[];
  preferConditions: PreferCondition[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3.2 ルートデータ

```typescript
type RoutePriority = "shortest" | "safest" | "accessible";
type TransportMode = "walking" | "transit" | "driving" | "bicycling";

interface RouteRequest {
  origin: LatLng;
  destination: LatLng;
  userProfileId: string;
  prioritize: RoutePriority;
  mode?: TransportMode;
}

interface RouteResult {
  routeId: string;
  accessibilityScore: number; // 0-100
  distanceMeters: number;
  durationMinutes: number;
  steps: RouteStep[];
  warnings: string[];
  nearbySpots: SpotSummary[];
}

interface RouteStep {
  stepId: string;
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  startLocation: LatLng;
  endLocation: LatLng;
  polyline: string; // encoded polyline
  hasStairs: boolean;
  hasSlope: boolean;
  slopeGrade?: number; // 勾配 %
  surfaceType?: string;
  transitDetail?: TransitDetail;
}
```

### 3.3 乗換情報

```typescript
interface TransitDetail {
  lineName: string;       // 路線名（例: "JR山手線"）
  lineShortName?: string;
  lineColor?: string;     // 路線カラー（例: "#9ACD32"）
  vehicleType: "train" | "subway" | "bus" | "tram" | "ferry" | "other";
  departureStop: string;  // 乗車駅
  arrivalStop: string;    // 降車駅
  departureTime?: string;
  arrivalTime?: string;
  numStops: number;       // 停車駅数
  headSign?: string;      // 行先表示
}

interface MultiModalRoute {
  routeId: string;
  totalDistanceMeters: number;
  totalDurationMinutes: number;
  departureTime?: string;
  arrivalTime?: string;
  accessibilityScore: number;
  legs: WaypointLeg[];
  warnings: string[];
  fare?: number;
}

interface WaypointLeg {
  legIndex: number;
  mode: TransportMode;
  origin: LatLng;
  destination: LatLng;
  originName?: string;
  destinationName?: string;
  distanceMeters: number;
  durationMinutes: number;
  steps: RouteStep[];
  transitDetails?: TransitDetail[];
}
```

### 3.4 スポットデータ

```typescript
type SpotCategory = "restroom" | "rest_area" | "restaurant" | "cafe"
  | "park" | "kids_space" | "nursing_room" | "elevator" | "parking" | "other";

interface SpotSummary {
  spotId: string;
  name: string;
  category: SpotCategory;
  location: LatLng;
  accessibilityScore: number;
  distanceFromRoute?: number;
}

interface SpotDetail extends SpotSummary {
  description?: string;
  address: string;
  openingHours?: string;
  phoneNumber?: string;
  website?: string;
  accessibility: AccessibilityInfo;
  photoUrls: string[];
}

interface AccessibilityInfo {
  wheelchairAccessible: boolean;
  hasElevator: boolean;
  hasAccessibleRestroom: boolean;
  hasBabyChangingStation: boolean;
  hasNursingRoom: boolean;
  floorType: "flat" | "steps" | "slope" | "mixed";
  notes: string[];
}
```

### 3.5 AIチャットデータ

```typescript
interface ChatRequest {
  userId: string;
  message: string;
  conversationHistory: ChatMessage[];
}

interface ChatResponse {
  reply: string;
  extractedNeeds?: Partial<UserProfile>;
  suggestedAction: "ask_more" | "search_route" | "show_spots";
}

interface ExtractNeedsResponse {
  needs: Partial<UserProfile>;
  confidence: number; // 0.0-1.0
  missingFields: string[];
}
```

### 3.6 鉄道データ

```typescript
interface StationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[];
  prefecture?: string;
  hasElevator?: boolean;
  isWheelchairAccessible?: boolean;
  hasEscalator?: boolean;
  hasAccessibleRestroom?: boolean;
}

interface LineData {
  id: string;
  name: string;
  company?: string;
  color?: string;
  vehicleType: "train" | "subway" | "monorail" | "tram" | "bus";
  stationIds: string[];
  isLoop?: boolean;
  avgIntervalMinutes?: number;
  trackPoints?: Record<string, Array<{ lat: number; lng: number }>>;
}

interface RegionData {
  stations: StationData[];
  lines: LineData[];
}
```

---

## 4. API仕様

### 4.1 認証

全APIは Firebase Auth の ID トークンによる Bearer Token 認証を要求。

```
Authorization: Bearer <firebase-id-token>
```

### 4.2 エンドポイント一覧

#### 4.2.1 認証・プロファイル

**GET /api/auth/profile**
- 説明: ログインユーザーのプロファイルを取得
- レスポンス: `UserProfile`
- エラー: 404（未作成時）

**POST /api/auth/profile**
- 説明: プロファイルの作成・更新
- リクエスト: `{ mobilityType, companions?, maxDistanceMeters?, avoidConditions?, preferConditions? }`
- バリデーション: `mobilityType` は必須、有効な値のみ
- レスポンス: 更新後の `UserProfile`

#### 4.2.2 ルート検索

**POST /api/route/search**
- 説明: バリアフリールートを検索
- リクエスト:
  ```json
  {
    "origin": { "lat": 35.6812, "lng": 139.7671 },
    "destination": { "lat": 35.6896, "lng": 139.7006 },
    "userProfileId": "uid123",
    "prioritize": "accessible",
    "mode": "transit"
  }
  ```
- バリデーション:
  - lat: -90〜90, lng: -180〜180
  - prioritize: "shortest" | "safest" | "accessible"
  - mode: "walking" | "transit" | "driving" | "bicycling"
- 処理フロー:
  1. ユーザープロファイル取得
  2. Google Maps Directions API 呼び出し
  3. 各ルートのスコア計算（calculateRouteScore / calculateWeightedRouteScore）
  4. 警告生成（generateWarnings）
  5. 周辺スポット検索（preferConditions がある場合）
  6. ソート（accessible/safest: スコア順、shortest: 距離順）
- レスポンス: `{ routes: RouteResult[] }`

#### 4.2.3 スポット検索

**GET /api/spots/nearby**
- パラメータ: `lat`, `lng`, `radiusMeters`(デフォルト500, 最大5000), `category`(任意)
- レスポンス: `{ spots: SpotSummary[] }`
- 外部API: Google Places API

**GET /api/spots/:spotId**
- レスポンス: `SpotDetail`（Firestoreキャッシュ優先、なければPlaces APIから取得）

#### 4.2.4 ジオコーディング

**POST /api/geocode**
- リクエスト: `{ address: string }`
- レスポンス: `{ location: { lat, lng } }`

**POST /api/geocode/reverse**
- リクエスト: `{ lat: number, lng: number }`
- レスポンス: `{ address: string }`

**POST /api/geocode/autocomplete**
- リクエスト: `{ input: string }`（2〜200文字）
- レスポンス: `{ predictions: [{ description, place_id }] }`

#### 4.2.5 AIチャット

**POST /api/chat**
- リクエスト: `ChatRequest`（message: 2000文字以下）
- クエリ: `?stream=true` でSSEストリーミング対応
- レスポンス: `ChatResponse`
- 副作用: extractedNeeds がある場合、プロファイルに自動マージ

**POST /api/extract-needs**
- リクエスト: `{ conversationHistory: ChatMessage[] }`
- レスポンス: `ExtractNeedsResponse`

### 4.3 AI推論サーバーAPI（内部）

**POST /v1/chat**
- リクエスト: `{ messages[], user_profile?, max_tokens?, temperature? }`
- レスポンス: `{ reply, extracted_needs, suggested_action, confidence }`

**POST /v1/extract-needs**
- リクエスト: `{ messages[] }`
- レスポンス: `{ needs, confidence, missing_fields }`

**GET /health**
- レスポンス: `{ status, model, uptime_seconds }`

---

## 5. スコアリングシステム

### 5.1 ルートスコア（calculateRouteScore）

基準スコア: 100点

**ペナルティ:**

| 条件 | 減点 | 適用条件 |
|------|------|----------|
| 階段あり | -30/箇所 | avoidConditions に "stairs" |
| 急勾配(>8%) | -25 | avoidConditions に "slope" |
| 中勾配(5-8%) | -15 | avoidConditions に "slope" |
| 未舗装路 | -20 | mobilityType が wheelchair/stroller |
| 乗換 | -10〜-15/回 | transit モード時 |

**ボーナス:**
- preferConditions に合うスポットが近くにある: +5/件（上限15点）

**スコア範囲:** 0〜100（クランプ）

### 5.2 重み付きスコア（calculateWeightedRouteScore）

同行者がいる場合に適用。ペナルティをカテゴリ分けし、同行者タイプ別の重み係数を乗算。

| 同行者タイプ | 階段重み | 坂道重み | その他重み |
|-------------|---------|---------|----------|
| child | 1.3 | 1.2 | 1.2 |
| elderly | 1.5 | 1.5 | 1.3 |
| disability | 2.0 | 1.5 | 1.5 |

複数同行者がいる場合は各カテゴリの最大値を使用。

### 5.3 警告生成（generateWarnings）

以下の条件で日本語の警告メッセージを生成:

| 対象 | 条件 | メッセージ例 |
|------|------|-------------|
| 全般 | avoidConditionsに該当 | "このルートには階段があります" |
| 車椅子 | 階段あり | "車椅子での通行に階段があります" |
| ベビーカー | 階段あり | "ベビーカーでの通行に階段があります" |
| 杖使用者 | 階段/急坂あり | "杖での移動に階段/急な坂があります" |
| 高齢者同行 | 階段/急坂あり | "〜(同行者にご注意ください)" |
| 障がい者同行 | 階段/急坂あり | "〜(同行者にご注意ください)" |
| 全般 | 乗換2回以上 | "乗り換えが{n}回あります" |

### 5.4 スポットスコア（calculateSpotScore）

基準スコア: 50点

| 設備 | 加減点 |
|------|--------|
| 車椅子対応（本人が車椅子） | +20 |
| 車椅子対応（その他） | +10 |
| エレベーター | +15 |
| アクセシブルトイレ | +10 |
| おむつ交換台（子連れ） | +10 |
| 授乳室（子連れ） | +10 |
| フラットな床 | +10 |
| 階段のみ | -20 |

---

## 6. 独自鉄道ルーティングエンジン

### 6.1 概要

Google Maps Directions API の Transit モードの代替として、クライアント側で独自の経路探索を実装。全国の鉄道駅・路線データをアプリに内蔵し、Dijkstraアルゴリズムで最適経路を探索する。

### 6.2 データ規模

| 項目 | 数量 |
|------|------|
| 総駅数 | 1,500+ |
| 総路線数 | 120+ |
| 対応地域 | 10地域 |
| 徒歩乗換ペア | 50+ |

### 6.3 空間インデックス

- グリッドサイズ: 0.1度（約11km四方）
- 検索時に周辺9グリッドを探索（約33km圏）
- 候補が見つからない場合はブルートフォースにフォールバック

### 6.4 経路探索アルゴリズム

**MinHeap（優先度キュー）:**
- バイナリヒープによる O(log N) の挿入・取り出し
- コスト最小のノードを効率的に取得

**Dijkstraの状態空間:**
- 状態: `(stationId, lineId)` のペア
- 同じ駅でも異なる路線からの到着を別状態として管理
- 乗り換え検出: 前の路線と異なる路線への遷移

**コスト計算:**
- 同一路線の駅間移動: `avgIntervalMinutes`（デフォルト2分）
- 乗り換えペナルティ: 8分（TRANSFER_PENALTY_MINUTES）
- 徒歩移動: 80m/分で計算
- 徒歩乗換: WALKING_TRANSFER_PAIRSで定義された時間

**枝刈り:**
- 乗り換え4回以上を除外
- MAX_ITERATIONS: 50,000ノードで打ち切り
- bestCostによる重複状態の除外

### 6.5 候補ルートのスコアリング

- 所要時間 + 段階的乗換ペナルティ（1回目12分, 2回目15分, 3回目18分）
- 500m超の徒歩距離にペナルティ
- アクセシビリティスコア: 基準90点、乗換-5/回、長距離徒歩-10〜15
- ユーザープロファイル連携:
  - 車椅子/ベビーカー: 乗換ペナルティ2.0倍
  - 高齢者: 乗換1.8倍、徒歩距離2.0倍

### 6.6 ポリライン生成

- **Catmull-Romスプライン補間**: 全駅座標を通過する滑らかな曲線
- **車両タイプ別テンション**: 地下鉄0.2（直線的）、新幹線0.35、在来線0.4
- **trackPointsデータ**: 主要区間の実際の線路形状を反映
- **Google Directions API連携**: `enhanceTransitPolylines()`で実データ取得可能

### 6.7 徒歩乗換ペア（抜粋）

| 駅A | 駅B | 徒歩時間 |
|-----|-----|---------|
| 東京 | 大手町 | 3分 |
| 日比谷 | 有楽町 | 2分 |
| 原宿 | 明治神宮前 | 1分 |
| 田町 | 三田 | 2分 |
| 新宿三丁目 | 新宿 | 4分 |
| 蒲田 | 京急蒲田 | 8分 |
| 溜池山王 | 赤坂見附 | 4分 |

---

## 7. 画面仕様

### 7.1 ホーム画面（index.tsx）

- Google Maps マップ表示
- 場所検索バー（オートコンプリート対応）
- 周辺スポットの自動取得（マップ移動時、500msデバウンス）
- スポットカテゴリ別カラーコード表示
- スポット詳細モーダル
- ルート検索画面への遷移ボタン

### 7.2 ルート検索画面（route.tsx）

- 出発地・経由地・目的地の入力（ジオコーディング対応）
- 移動手段切替（徒歩/電車/車/自転車）
- ルート優先度設定（最短/安全/アクセシブル）
- 検索結果のマップ表示（路線カラー対応ポリライン）
- 乗換駅マーカー・路線情報表示
- ステップバイステップの経路案内
- 警告表示（バリアフリー関連）
- アクセシビリティスコア表示（色分け: 80+緑, 50-80橙, 50未満赤）

### 7.3 AIチャット画面（chat.tsx）

- AIアシスタントとの日本語対話
- ニーズ自動抽出・プロファイル更新
- SSEストリーミングによるリアルタイム応答表示
- 会話履歴管理

### 7.4 スポット一覧画面（spots.tsx）

- 周辺スポットのグリッド/リスト表示
- カテゴリフィルタリング
- アクセシビリティスコア表示
- バリアフリー設備情報表示

### 7.5 プロフィール画面（profile.tsx）

- 移動方法選択（MobilityType）
- 同行者情報設定（Companion[]）
- 回避条件チェックボックス（AvoidCondition[]）
- 希望条件チェックボックス（PreferCondition[]）
- 最大移動距離スライダー

---

## 8. マップ表示仕様（MapViewWrapper.tsx）

### 8.1 描画要素

| 要素 | 仕様 |
|------|------|
| ルートポリライン | 路線カラー、太さ7px（transit）/4px（walking） |
| 非選択ルート | 色: #AAAAAA、不透明度: 0.5 |
| 徒歩区間 | 灰色点線（CIRCLE repeat 12px） |
| 乗換駅マーカー | モード別カラー、InfoWindow付き |
| 出発地/目的地 | 緑/赤マーカー |

### 8.2 セキュリティ対策

- `escapeHtml()`: InfoWindowコンテンツのHTMLエスケープ（&, <, >, ", '）
- `escapeJsString()`: JS文字列リテラルのエスケープ（\, ', ", 改行, </）
- `(0,0)`座標フィルタ: bounds計算からnull island座標を除外

---

## 9. バックエンド詳細

### 9.1 Cloud Functions 設定

- リージョン: asia-northeast1
- ランタイム: Node.js
- メモリ: 256-512MB
- CORS: 有効

### 9.2 ミドルウェアスタック

1. `securityHeaders` - X-Content-Type-Options, X-Frame-Options, CSP
2. `cors` - Cross-Origin対応
3. `express.json` - ボディパース（上限1MB）
4. `sanitizeInput` - XSS対策の入力サニタイズ
5. `rateLimiter` - レート制限
6. `verifyAuth` - Firebase Auth 検証（/api パスに適用）

### 9.3 外部API連携（mapsApi.ts）

| 関数 | 用途 | APIキーチェック |
|------|------|----------------|
| `searchRoutes()` | Directions API | あり |
| `searchNearbyPlaces()` | Places API | あり |
| `getPlaceDetails()` | Places API | あり |
| `geocode()` | Geocoding API | あり |
| `reverseGeocode()` | Geocoding API | あり |
| `placesAutocomplete()` | Places Autocomplete API | あり |
| `estimateSlopeGrade()` | 勾配推定（キーワードフォールバック） | N/A |

### 9.4 Firestoreコレクション

| コレクション | 用途 |
|-------------|------|
| `users` | ユーザープロファイル |
| `conversations` | 会話履歴 |
| `spotCache` | スポットキャッシュ |
| `searchHistory` | 検索履歴 |

### 9.5 スケジュール処理

- `cleanupExpiredConversations`: 毎日03:00 JST に期限切れ会話を削除

---

## 10. AI推論サーバー詳細

### 10.1 構成

- フレームワーク: FastAPI
- モデルバックエンド: vLLM（高速推論）/ transformers（フォールバック）
- 同時リクエスト: Semaphore（デフォルト4並列）
- ストリーミング: SSE対応

### 10.2 機能

- 日本語自然言語対話
- ユーザーニーズの構造化抽出
- プロンプトキャッシング
- リソース監視（CPU/メモリ/GPU）
- グレースフルシャットダウン

---

## 11. セキュリティ仕様

### 11.1 認証

- Firebase Authentication（REST API ベース）
- IDトークン有効期限: 1時間
- バックエンドで Firebase Admin SDK により検証

### 11.2 APIキー管理

- Google Maps API キー: Cloud Functions 環境変数で管理
- Firebase API キー: `.env` ファイル（EXPO_PUBLIC_FIREBASE_API_KEY）
- クライアント側APIキー: マップタイル読み込み用のみ（EXPO_PUBLIC_GOOGLE_MAPS_API_KEY）
- `.gitignore` に `.env` を登録

### 11.3 入力検証

- 座標範囲チェック（lat: -90〜90, lng: -180〜180）
- 文字列長制限（メッセージ: 2000文字、住所: 200文字）
- 列挙型のホワイトリスト検証

### 11.4 XSS/インジェクション対策

- HTMLエスケープ（InfoWindowコンテンツ）
- JSエスケープ（WebView内JS生成）
- 入力サニタイズミドルウェア
- transportMode ホワイトリスト検証

---

## 12. テスト仕様

### 12.1 バックエンドテスト（Jest）

| テストファイル | テスト数 | 対象 |
|--------------|---------|------|
| auth.test.ts | - | 認証・プロファイルCRUD |
| route.test.ts | - | ルート検索・スコアリング連携 |
| scoring.test.ts | 58 | スコア計算・重み付け・警告生成 |
| spots.test.ts | - | スポット検索・詳細取得 |
| chat.test.ts | - | AIチャット・ニーズ抽出 |
| **合計** | **105** | |

### 12.2 モバイルテスト（Jest + ts-jest）

| テストファイル | テスト数 | 対象 |
|--------------|---------|------|
| transitRouter.test.ts | 36 | MinHeap、Dijkstra、経路探索、データ整合性 |
| stationCoordinates.test.ts | 6 | 全駅座標バリデーション |
| **合計** | **42** | |

### 12.3 座標バリデーションテスト

- 全駅が日本国内（lat: 24-46, lng: 122-146）
- (0,0)座標なし
- 隣接駅間距離: 50m〜50km（新幹線は100km）
- 重複定義駅の座標差: 500m以内

---

## 13. 品質基準

| 項目 | 基準 |
|------|------|
| テストカバレッジ | 最低60% |
| アクセシビリティ | VoiceOver 全画面動作確認 |
| AI応答精度 | ニーズ抽出正答率 80%以上 |
| パフォーマンス | 画面遷移 0.3秒以内 |
| セキュリティ | APIキーのクライアント露出ゼロ |
| タップターゲット | 最小 44x44pt |
| 対応 | Dynamic Type, VoiceOver, 高コントラスト |

---

## 14. ディレクトリ構成

```
accessroute/
├── CLAUDE.md                          # プロジェクト規約
├── docs/
│   ├── api-spec.yaml                  # REST API仕様
│   ├── ai-api-spec.yaml               # AI推論サーバーAPI仕様
│   ├── data-models.ts                 # 共通データ型定義
│   ├── SPEC_SUMMARY.md                # 仕様書（概要版）
│   └── SPEC_DETAILED.md               # 仕様書（詳細版）
├── mobile/
│   ├── app/(tabs)/
│   │   ├── index.tsx                  # ホーム画面（マップ・スポット）
│   │   ├── route.tsx                  # ルート検索画面（2233行）
│   │   ├── chat.tsx                   # AIチャット画面
│   │   ├── spots.tsx                  # スポット一覧画面
│   │   └── profile.tsx                # プロフィール画面
│   ├── src/
│   │   ├── components/
│   │   │   └── MapViewWrapper.tsx     # Google Maps WebViewラッパー
│   │   ├── services/
│   │   │   ├── api.ts                 # バックエンドAPI呼び出し
│   │   │   ├── transitRouter.ts       # 独自鉄道ルーティングエンジン
│   │   │   ├── directions.ts          # Directions APIパーサー
│   │   │   ├── geocoding.ts           # ジオコーディング（サーバー経由）
│   │   │   └── firebase.ts            # Firebase Auth
│   │   ├── data/
│   │   │   ├── types.ts               # 鉄道データ型定義
│   │   │   ├── index.ts               # 全地域データ統合
│   │   │   └── regions/
│   │   │       ├── shinkansen.ts      # 新幹線
│   │   │       ├── kanto_jr.ts        # 関東JR
│   │   │       ├── kanto_private.ts   # 関東私鉄
│   │   │       ├── kanto_metro.ts     # 東京メトロ・都営
│   │   │       ├── kansai.ts          # 関西
│   │   │       ├── chubu.ts           # 中部
│   │   │       ├── tohoku.ts          # 東北
│   │   │       ├── hokuriku.ts        # 北陸
│   │   │       ├── chugoku.ts         # 中国
│   │   │       ├── shikoku.ts         # 四国
│   │   │       ├── kyushu.ts          # 九州
│   │   │       └── hokkaido.ts        # 北海道
│   │   └── __tests__/
│   │       ├── transitRouter.test.ts  # ルーターテスト（36件）
│   │       └── stationCoordinates.test.ts # 座標テスト（6件）
│   ├── .env                           # 環境変数（gitignore対象）
│   ├── .env.example                   # 環境変数テンプレート
│   └── package.json
├── backend/
│   └── functions/
│       └── src/
│           ├── index.ts               # エントリポイント・ミドルウェア
│           ├── routes/
│           │   ├── auth.ts            # 認証ルーター
│           │   ├── route.ts           # ルート検索ルーター
│           │   ├── spots.ts           # スポット検索ルーター
│           │   ├── chat.ts            # AIチャットルーター
│           │   └── geocode.ts         # ジオコーディングルーター
│           ├── services/
│           │   └── mapsApi.ts         # Google Maps API呼び出し
│           ├── utils/
│           │   └── scoring.ts         # スコアリングロジック
│           └── __tests__/             # テスト（105件）
├── ai-server/
│   ├── server.py                      # FastAPI推論サーバー
│   ├── Dockerfile
│   └── prompts/                       # システムプロンプト
└── .github/workflows/                 # CI/CD
```
