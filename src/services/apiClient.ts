// HTTP Client for BA-VES Platform
// Supports Bearer Token, Silent Refresh on 401, BYOK headers, and standard error handling.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5291";

const ACCESS_TOKEN_KEY = "baves_access_token";
const REFRESH_TOKEN_KEY = "baves_refresh_token";
const USER_KEY = "baves_user_profile";
const BYOK_CONFIG_KEY = "baves_byok_config";
const AI_USAGE_LOGS_KEY = "baves_ai_usage_logs";

export interface ByokConfig {
  provider: "OpenAI" | "Gemini";
  model: string;
  apiKey: string;
}

export interface AiUsageEntry {
  id: string;
  timestamp: string;
  keyMask: string;
  provider: "OpenAI" | "Gemini" | string;
  model: string;
  endpoint: string;
  feature: string;
  status: "success" | "error";
  statusCode: number;
  durationMs: number;
  tokens: number;
  isEstimatedTokens: boolean;
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim();
  if (!trimmed) return "Chưa gắn";
  if (trimmed.length <= 10) return `${trimmed.slice(0, 3)}***${trimmed.slice(-2)}`;
  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}

export function getAiUsageLogs(): AiUsageEntry[] {
  const raw = localStorage.getItem(AI_USAGE_LOGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearAiUsageLogs() {
  localStorage.removeItem(AI_USAGE_LOGS_KEY);
}

function resolveAiFeatureLabel(endpoint: string): string {
  if (endpoint.includes("/api/ai/connections/validate")) return "Kiểm tra kết nối AI";
  if (endpoint.includes("/coach")) return "AI Coach";
  if (endpoint.includes("/events")) return "Biến cố mô phỏng";
  if (endpoint.includes("/messages")) return "Phỏng vấn Stakeholder AI";
  if (endpoint.includes("/analysis")) return "Phân tích yêu cầu AI";
  if (endpoint.includes("/assessment")) return "Chấm điểm & Đánh giá AI";
  if (endpoint.includes("/planning")) return "Lập kế hoạch BA";
  return "Tác vụ AI";
}

function isAiTrackedEndpoint(endpoint: string, method: string): boolean {
  if (endpoint.includes("/api/ai")) return true;
  if (method !== "GET") {
    return (
      endpoint.includes("/simulations") ||
      endpoint.includes("/analysis") ||
      endpoint.includes("/assessment") ||
      endpoint.includes("/coach")
    );
  }
  return false;
}

function recordAiUsage(entry: AiUsageEntry) {
  try {
    const existing = getAiUsageLogs();
    const updated = [entry, ...existing].slice(0, 200);
    localStorage.setItem(AI_USAGE_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
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

export function clearStoredByokConfig() {
  localStorage.removeItem(BYOK_CONFIG_KEY);
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

  const method = (options.method || "GET").toUpperCase();
  const shouldTrackAi = Boolean(headers["X-AI-Key"] && isAiTrackedEndpoint(endpoint, method));
  const startedAt = shouldTrackAi ? Date.now() : 0;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    if (shouldTrackAi) {
      recordAiUsage({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        keyMask: maskApiKey(headers["X-AI-Key"]),
        provider: headers["X-AI-Provider"] || "Unknown",
        model: headers["X-AI-Model"] || "Unknown",
        endpoint,
        feature: resolveAiFeatureLabel(endpoint),
        status: "error",
        statusCode: 0,
        durationMs: Date.now() - startedAt,
        tokens: 0,
        isEstimatedTokens: true,
      });
    }
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
            window.location.hash = "#/login";
            throw new ApiError(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          }
        } catch (err) {
          clearStoredAuth();
          isRefreshing = false;
          window.location.hash = "#/login";
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
      const fieldErrors =
        data.errors ||
        (data.extensions && typeof data.extensions === "object"
          ? data.extensions.errors
          : undefined);
      if (fieldErrors && typeof fieldErrors === "object") {
        const errorList = Object.values(fieldErrors).flat().filter(Boolean);
        if (errorList.length > 0) {
          errorMessage = errorList.map(String).join("\n");
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.title) {
          errorMessage = data.title;
        }
      } else if (data.detail) {
        errorMessage = data.detail;
      } else if (data.title) {
        errorMessage = data.title;
      }
    } else if (typeof data === "string" && data.length > 0) {
      errorMessage = data;
    }
    if (shouldTrackAi) {
      recordAiUsage({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        keyMask: maskApiKey(headers["X-AI-Key"]),
        provider: headers["X-AI-Provider"] || "Unknown",
        model: headers["X-AI-Model"] || "Unknown",
        endpoint,
        feature: resolveAiFeatureLabel(endpoint),
        status: "error",
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        tokens: 0,
        isEstimatedTokens: true,
      });
    }
    throw new ApiError(response.status, errorMessage, data);
  }

  if (shouldTrackAi) {
    const reportedTokens =
      (data && typeof data === "object" && (
        data.usage?.totalTokens ??
        data.usage?.total_tokens ??
        data.tokenUsage?.totalTokens ??
        data.tokensUsed
      )) ||
      0;
    const reqSize = typeof options.body === "string" ? options.body.length : 0;
    const resSize = typeof data === "string" ? data.length : JSON.stringify(data ?? "").length;
    const estimatedTokens = Math.max(1, Math.ceil((reqSize + resSize) / 4));
    recordAiUsage({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      keyMask: maskApiKey(headers["X-AI-Key"]),
      provider: headers["X-AI-Provider"] || "Unknown",
      model: headers["X-AI-Model"] || "Unknown",
      endpoint,
      feature: resolveAiFeatureLabel(endpoint),
      status: "success",
      statusCode: response.status,
      durationMs: Date.now() - startedAt,
      tokens: Number(reportedTokens) > 0 ? Number(reportedTokens) : estimatedTokens,
      isEstimatedTokens: !(Number(reportedTokens) > 0),
    });
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
  patch: <T>(url: string, body?: any, headers?: Record<string, string>) =>
    request<T>(url, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    }),
  delete: <T>(url: string, headers?: Record<string, string>) =>
    request<T>(url, { method: "DELETE", headers }),
};
