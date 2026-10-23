// HTTP Client for BA-VES Platform
// Supports Bearer Token, Silent Refresh on 401, BYOK headers, and standard error handling.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5291";

const ACCESS_TOKEN_KEY = "baves_access_token";
const REFRESH_TOKEN_KEY = "baves_refresh_token";
const USER_KEY = "baves_user_profile";
const BYOK_CONFIG_KEY = "baves_byok_config";

export interface ByokConfig {
  provider: "OpenAI" | "Gemini";
  model: string;
  apiKey: string;
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function setStoredTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredByokConfig(): ByokConfig | null {
  const raw = localStorage.getItem(BYOK_CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ByokConfig;
  } catch {
    return null;
  }
}

export function setStoredByokConfig(config: ByokConfig) {
  localStorage.setItem(BYOK_CONFIG_KEY, JSON.stringify(config));
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const tokens = getStoredTokens();
  const byok = getStoredByokConfig();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (tokens.accessToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${tokens.accessToken}`;
  }

  // Inject BYOK headers if configured
  if (byok && byok.apiKey) {
    headers["X-AI-Provider"] = byok.provider;
    headers["X-AI-Model"] = byok.model;
    headers["X-AI-Key"] = byok.apiKey;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(0, err.message || "Lỗi kết nối tới máy chủ.");
  }

  // Handle 401 Unauthorized for silent refresh
  if (response.status === 401 && !isRetry && !endpoint.includes("/api/auth/")) {
    if (tokens.refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setStoredTokens(data.accessToken, data.refreshToken);
            onRefreshed(data.accessToken);
            isRefreshing = false;
            return request<T>(endpoint, options, true);
          } else {
            clearStoredAuth();
            isRefreshing = false;
            window.location.hash = "#login";
            throw new ApiError(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
        } catch (err) {
          clearStoredAuth();
          isRefreshing = false;
          window.location.hash = "#login";
          throw err;
        }
      } else {
        // Queue pending requests while refresh is running
        return new Promise<T>((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            const retryHeaders = {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            };
            resolve(request<T>(endpoint, { ...options, headers: retryHeaders }, true));
          });
        });
      }
    }
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = "Đã xảy ra lỗi máy chủ.";
    if (data && typeof data === "object") {
      if (data.detail) {
        errorMessage = data.detail;
      } else if (data.title) {
        errorMessage = data.title;
      } else if (data.errors) {
        const errorList = Object.values(data.errors).flat();
        if (errorList.length > 0) errorMessage = String(errorList[0]);
      }
    } else if (typeof data === "string" && data.length > 0) {
      errorMessage = data;
    }
    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: "GET", headers }),
  post: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    }),
  put: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    }),
  delete: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: "DELETE", headers }),
};
