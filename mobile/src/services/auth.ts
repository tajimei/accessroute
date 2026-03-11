// Firebase Auth REST API を直接使用（firebase SDK 不要）
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY, AUTH_BASE_URL, TOKEN_REFRESH_URL } from './firebase';

const STORAGE_KEYS = {
  idToken: 'authToken',
  refreshToken: 'authRefreshToken',
  userId: 'authUserId',
  expiresAt: 'authExpiresAt',
};

interface AuthResult {
  idToken: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
}

async function saveAuth(result: AuthResult): Promise<void> {
  const expiresAt = Date.now() + parseInt(result.expiresIn, 10) * 1000;
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.idToken, result.idToken],
    [STORAGE_KEYS.refreshToken, result.refreshToken],
    [STORAGE_KEYS.userId, result.localId],
    [STORAGE_KEYS.expiresAt, expiresAt.toString()],
  ]);
}

async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}

async function authRequest(endpoint: string, body: Record<string, unknown>): Promise<AuthResult> {
  const res = await fetch(`${AUTH_BASE_URL}/${endpoint}?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorCode = data?.error?.message || 'UNKNOWN_ERROR';
    const err = new Error(getErrorMessage(errorCode));
    (err as any).code = `auth/${errorCode.toLowerCase().replace(/_/g, '-')}`;
    throw err;
  }
  return data as AuthResult;
}

/**
 * 匿名サインイン
 */
export async function signInAnonymously(): Promise<string> {
  const result = await authRequest('accounts:signUp', { returnSecureToken: true });
  await saveAuth(result);
  return result.localId;
}

/**
 * メール・パスワードでサインイン
 */
export async function signInWithEmail(email: string, password: string): Promise<string> {
  const result = await authRequest('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });
  await saveAuth(result);
  return result.localId;
}

/**
 * メール・パスワードで新規登録
 */
export async function signUpWithEmail(email: string, password: string): Promise<string> {
  const result = await authRequest('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });
  await saveAuth(result);
  return result.localId;
}

/**
 * サインアウト
 */
export async function signOut(): Promise<void> {
  await clearAuth();
}

/**
 * 現在のユーザーIDを取得
 */
export async function getCurrentUserId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.userId);
}

/**
 * IDトークンを取得（期限切れの場合はリフレッシュ）
 */
export async function getIdToken(): Promise<string | null> {
  const [token, refreshToken, expiresAtStr] = await AsyncStorage.multiGet([
    STORAGE_KEYS.idToken,
    STORAGE_KEYS.refreshToken,
    STORAGE_KEYS.expiresAt,
  ]).then(r => r.map(([, v]) => v));

  if (!token || !refreshToken) {
    console.warn('[Auth] トークンまたはリフレッシュトークンが未保存');
    return null;
  }

  const expiresAt = parseInt(expiresAtStr || '0', 10);
  const now = Date.now();
  // 5分前にリフレッシュ
  if (now > expiresAt - 5 * 60 * 1000) {
    console.log('[Auth] トークン期限切れ/まもなく切れるためリフレッシュ');
    try {
      return await refreshIdToken(refreshToken);
    } catch (e) {
      console.error('[Auth] トークンリフレッシュ失敗:', e);
      return null;
    }
  }
  return token;
}

async function refreshIdToken(refreshToken: string): Promise<string> {
  const res = await fetch(`${TOKEN_REFRESH_URL}?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Token refresh failed');

  const expiresAt = Date.now() + parseInt(data.expires_in, 10) * 1000;
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.idToken, data.id_token],
    [STORAGE_KEYS.refreshToken, data.refresh_token],
    [STORAGE_KEYS.expiresAt, expiresAt.toString()],
  ]);
  return data.id_token;
}

/**
 * ログイン状態を確認
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getIdToken();
  return token !== null;
}

function getErrorMessage(code: string): string {
  switch (code) {
    case 'EMAIL_NOT_FOUND':
      return 'アカウントが見つかりません';
    case 'INVALID_PASSWORD':
    case 'INVALID_LOGIN_CREDENTIALS':
      return 'メールアドレスまたはパスワードが間違っています';
    case 'EMAIL_EXISTS':
      return 'このメールアドレスは既に使用されています';
    case 'WEAK_PASSWORD':
      return 'パスワードが弱すぎます（6文字以上にしてください）';
    case 'INVALID_EMAIL':
      return 'メールアドレスの形式が正しくありません';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER':
      return 'ログイン試行回数が多すぎます。しばらくしてからお試しください';
    default:
      return '認証に失敗しました。もう一度お試しください';
  }
}
