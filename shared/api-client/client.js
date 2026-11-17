import { mockHandleRequest } from '../mock-api/mockAdapter.js';

const ACCESS_KEY = 'app_access_token';
const REFRESH_KEY = 'app_refresh_token';
const USER_KEY = 'app_user';

let accessToken = typeof window !== 'undefined' ? (localStorage.getItem(ACCESS_KEY) || localStorage.getItem('brightloop_access_token')) : null;
let refreshToken = typeof window !== 'undefined' ? (localStorage.getItem(REFRESH_KEY) || localStorage.getItem('brightloop_refresh_token')) : null;

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    if (access) {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem('brightloop_access_token', access);
    }
    if (refresh) {
      localStorage.setItem(REFRESH_KEY, refresh);
      localStorage.setItem('brightloop_refresh_token', refresh);
    }
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('brightloop_access_token');
    localStorage.removeItem('brightloop_refresh_token');
    localStorage.removeItem('brightloop_user');
  }
}

export function getAccessToken() {
  return accessToken;
}

export async function apiClient(endpoint, options = {}) {
  const useMockExplicit =
    typeof window !== 'undefined' &&
    (window.__USE_MOCK__ === true || import.meta?.env?.VITE_USE_MOCK === 'true');
  const normalizedEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (useMockExplicit) {
    return await mockHandleRequest(normalizedEndpoint, options);
  }

  const baseUrl = (typeof window !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) || (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:5000');
  const url = `${baseUrl}${normalizedEndpoint}`;

  // Refresh token from memory or storage
  if (!accessToken && typeof window !== 'undefined') {
    accessToken = localStorage.getItem(ACCESS_KEY) || localStorage.getItem('brightloop_access_token');
  }

  const headers = {
    ...(options.headers || {}),
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      return Promise.reject({
        status: response.status,
        message: errorJson?.message || response.statusText,
        error: errorJson?.error || {},
      });
    }

    return await response.json();
  } catch (error) {
    // If backend is down or network error, fallback to mock adapter gracefully
    console.warn(`[API Client] Network error contacting ${url}. Falling back to offline mock engine.`, error);
    return await mockHandleRequest(normalizedEndpoint, options);
  }
}
