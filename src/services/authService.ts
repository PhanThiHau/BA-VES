import { apiClient, clearStoredAuth, getStoredTokens, setStoredTokens } from "./apiClient";

export interface UserProfile {
  id: number;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  status: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserProfile;
  tokenType: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  // FE-01: Màn hình Đăng ký
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/api/auth/register", payload);
    setStoredTokens(res.accessToken, res.refreshToken);
    return res;
  },

  // FE-02: Màn hình Đăng nhập
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/api/auth/login", payload);
    setStoredTokens(res.accessToken, res.refreshToken);
    return res;
  },

  // FE-03: Silent Refresh
  async refresh(): Promise<AuthResponse> {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) throw new Error("Không có refresh token.");
    const res = await apiClient.post<AuthResponse>("/api/auth/refresh", { refreshToken });
    setStoredTokens(res.accessToken, res.refreshToken);
    return res;
  },

  // FE-03: Logout
  async logout(): Promise<void> {
    const { refreshToken } = getStoredTokens();
    try {
      if (refreshToken) {
        await apiClient.post("/api/auth/logout", { refreshToken });
      }
    } finally {
      clearStoredAuth();
    }
  },

  // FE-04: Lấy thông tin user hiện tại
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/api/users/me");
  },
};
