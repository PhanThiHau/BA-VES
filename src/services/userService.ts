import { apiClient } from "./apiClient";
import type { UserProfile } from "./authService";

export interface UpdateProfilePayload {
  fullName: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserRolesPayload {
  roles: string[];
}

export interface UpdateUserStatusPayload {
  status: "Active" | "Suspended" | "Archived" | number;
}

export const userService = {
  // GET /api/users/me: Lấy thông tin cá nhân của người dùng hiện tại
  async getMe(): Promise<UserProfile> {
    return apiClient.get<UserProfile>("/api/users/me");
  },

  // PUT /api/users/me: Cập nhật thông tin cá nhân (họ tên, ảnh đại diện)
  async updateMe(payload: UpdateProfilePayload): Promise<UserProfile> {
    return apiClient.put<UserProfile>("/api/users/me", payload);
  },

  // POST /api/users/me/change-password: Đổi mật khẩu tài khoản hiện tại
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/api/users/me/change-password", payload);
  },

  // GET /api/users: Lấy danh sách tài khoản người dùng (Admin / Instructor)
  async getUsers(params?: {
    search?: string;
    role?: string;
    status?: string | number;
  }): Promise<UserProfile[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.role && params.role !== "ALL") searchParams.append("role", params.role);
    if (params?.status !== undefined && params.status !== "ALL") searchParams.append("status", String(params.status));
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiClient.get<UserProfile[]>(`/api/users${qs}`);
  },

  // GET /api/users/{id}: Lấy thông tin chi tiết một tài khoản theo ID
  async getUserById(id: number): Promise<UserProfile> {
    return apiClient.get<UserProfile>(`/api/users/${id}`);
  },

  // PUT /api/users/{id}/roles: Admin cập nhật vai trò người dùng (LEARNER, INSTRUCTOR, BAEXPERT, ADMIN)
  async updateUserRoles(id: number, roles: string[]): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/api/users/${id}/roles`, { roles });
  },

  // PATCH /api/users/{id}/status: Admin cập nhật trạng thái tài khoản (Active = 0, Suspended = 1, Archived = 2)
  async updateUserStatus(id: number, status: "Active" | "Suspended" | "Archived" | number): Promise<UserProfile> {
    return apiClient.patch<UserProfile>(`/api/users/${id}/status`, { status });
  },
};

