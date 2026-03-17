import {
  UserProfile,
  RouteRequest,
  RouteResponse,
  SpotSummary,
  SpotDetail,
  ChatResponse,
  ChatMessage,
} from '../types';
import { getIdToken } from './auth';

// エミュレータ使用時はローカルURLに切り替え
const USE_EMULATOR = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';
const BASE_URL = USE_EMULATOR
  ? 'http://172.29.57.67:5001/accessroute-18207/asia-northeast1/api/api'
  : 'https://asia-northeast1-accessroute-18207.cloudfunctions.net/api/api';

// API呼び出しタイムアウト（Cloud Functions コールドスタートに十分な時間を確保）
const API_TIMEOUT_MS = 30000;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  queryParams?: Record<string, string>,
): Promise<T> {
  let token: string | null = null;
  if (USE_EMULATOR) {
    token = 'emulator-token';
  } else {
    try {
      token = await getIdToken();
    } catch (e) {
      console.warn('[API] トークン取得失敗:', e);
    }

    if (!token) {
      throw new Error('認証トークンがありません。ログインしてください。');
    }
  }

  let url = `${BASE_URL}${path}`;

  if (queryParams) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    console.log(`[API] ${method} ${path}`);
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      console.error(`[API] Error ${res.status}: ${errorBody}`);
      throw new Error(`API Error ${res.status}: ${errorBody}`);
    }

    return res.json();
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      console.error(`[API] タイムアウト (${API_TIMEOUT_MS}ms): ${method} ${path}`);
      throw new Error(`API タイムアウト: サーバーが応答しません`);
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

// プロファイル
export async function getProfile(): Promise<UserProfile> {
  return request('GET', '/auth/profile');
}

export async function saveProfile(
  profile: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<UserProfile> {
  return request('POST', '/auth/profile', profile);
}

// ルート検索
export async function searchRoute(req: RouteRequest): Promise<RouteResponse> {
  return request('POST', '/route/search', req);
}

// ルート検索（テキスト地名対応、ジオコーディング+ルート検索を一括実行）
export async function searchRouteByName(req: {
  originText?: string;
  destinationText?: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  userProfileId: string;
  prioritize?: string;
  mode?: string;
}): Promise<RouteResponse & { resolvedOrigin: { lat: number; lng: number }; resolvedDestination: { lat: number; lng: number } }> {
  return request('POST', '/route/search-by-name', req);
}

// スポット
export async function getNearbySpots(
  lat: number,
  lng: number,
  radiusMeters = 500,
): Promise<SpotSummary[]> {
  const res = await request<{ spots: SpotSummary[] }>('GET', '/spots/nearby', undefined, {
    lat: lat.toString(),
    lng: lng.toString(),
    radiusMeters: radiusMeters.toString(),
  });
  return res.spots ?? [];
}

// YOLPスポット検索
export async function getNearbySpotsByYOLP(
  lat: number,
  lng: number,
  radiusMeters = 500,
  query?: string,
): Promise<SpotSummary[]> {
  const params: Record<string, string> = {
    lat: lat.toString(),
    lng: lng.toString(),
    radiusMeters: radiusMeters.toString(),
  };
  if (query) {
    params.query = query;
  }
  const res = await request<{ spots: SpotSummary[] }>('GET', '/spots/nearby/yolp', undefined, params);
  return res.spots ?? [];
}

export async function getSpotDetail(spotId: string): Promise<SpotDetail> {
  return request('GET', `/spots/${spotId}`);
}

// ジオコーディング
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number }> {
  const res = await request<{ location: { lat: number; lng: number } }>('POST', '/geocode', {
    address,
  });
  return res.location;
}

export async function reverseGeocodeLocation(
  lat: number,
  lng: number,
): Promise<string> {
  const res = await request<{ address: string }>('POST', '/geocode/reverse', { lat, lng });
  return res.address;
}

export async function getPlaceSuggestions(
  input: string,
): Promise<Array<{ description: string; place_id: string }>> {
  // バックエンドAPIを試行
  try {
    const res = await request<{ predictions: Array<{ description: string; place_id: string }> }>(
      'POST',
      '/geocode/autocomplete',
      { input },
    );
    return res.predictions ?? [];
  } catch (error) {
    console.warn('[API] オートコンプリートAPI失敗、Nominatimフォールバック:', error);
  }

  // フォールバック: Nominatim（OpenStreetMap）でオートコンプリート
  return fetchNominatimSuggestions(input);
}

/**
 * Nominatim（OpenStreetMap）を使ったフォールバックオートコンプリート
 * バックエンドAPIが利用不可の場合に使用（APIキー不要）
 */
async function fetchNominatimSuggestions(
  input: string,
): Promise<Array<{ description: string; place_id: string }>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const params = new URLSearchParams({
      q: input,
      format: 'json',
      limit: '5',
      countrycodes: 'jp',
      'accept-language': 'ja',
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'AccessRoute-App/1.0' },
      signal: controller.signal,
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.slice(0, 5).map((item: { display_name?: string; place_id?: number }) => ({
      description: item.display_name ?? '',
      place_id: `nominatim_${item.place_id ?? ''}`,
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

// チャット
export async function sendChat(
  userId: string,
  message: string,
  history: ChatMessage[],
): Promise<ChatResponse> {
  return request('POST', '/chat', {
    userId,
    message,
    conversationHistory: history.map((m) => ({ role: m.role, content: m.content })),
  });
}

/**
 * ストリーミングチャット。チャンクごとにonChunkを呼び出し、
 * 完了時にonDoneで最終レスポンスを返す。
 */
export async function sendChatStream(
  userId: string,
  message: string,
  history: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: (response: ChatResponse) => void,
): Promise<void> {
  let token: string | null = null;
  if (USE_EMULATOR) {
    token = 'emulator-token';
  } else {
    token = await getIdToken();
    if (!token) {
      throw new Error('認証トークンがありません。ログインしてください。');
    }
  }

  const url = `${BASE_URL}/chat/stream`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        message,
        conversationHistory: history.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(`API Error ${res.status}: ${errorBody}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('ストリーミングレスポンスを取得できません');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);
          if (event.type === 'chunk') {
            onChunk(event.content);
          } else if (event.type === 'done') {
            onDone({
              reply: event.reply,
              extractedNeeds: event.extracted_needs,
              suggestedAction: event.suggested_action,
              confidence: event.confidence,
            } as ChatResponse);
          }
        } catch {
          // JSON解析失敗は無視
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
