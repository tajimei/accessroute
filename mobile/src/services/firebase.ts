// Firebase Auth REST API を直接使用（SDKなし - Expo Go 互換性のため）
const FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '';
const AUTH_BASE_URL = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_REFRESH_URL = 'https://securetoken.googleapis.com/v1/token';

export { FIREBASE_API_KEY, AUTH_BASE_URL, TOKEN_REFRESH_URL };
