import { apiClient } from "./apiClient";

export enum ScopeType {
  Global = 0,
  Industry = 1,
  Application = 2,
  Scenario = 3,
}

export enum PlanType {
  Subscription = 0,
  OneTime = 1,
  Custom = 2,
}

export enum PlanStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export enum OrderStatus {
  Pending = 0,
  Paid = 1,
  Cancelled = 2,
  Expired = 3,
}

export interface PlanScopeDto {
  id: number;
  scopeType: ScopeType;
  scopeId: number | null;
}

export interface PlanDto {
  id: number;
  code: string;
  name: string;
  description: string;
  planType: PlanType;
  price: number;
  currency: string;
  durationDays: number | null;
  sessionQuota: number | null;
  reviewCredits: number;
  consultationCredits: number;
  status: PlanStatus;
  displayOrder: number;
  scopes: PlanScopeDto[];
}

export interface CreateOrderRequest {
  planId: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface OrderDto {
  id: number;
  orderCode: number | string;
  userId: number;
  planId: number;
  planName: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  checkoutUrl: string | null;
  qrCode: string | null;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
}

export interface EntitlementDto {
  id: number;
  userId: number;
  scopeType: ScopeType;
  scopeId: number | null;
  scopeCode: string | null;
  scopeName: string | null;
  startsAt: string;
  expiresAt: string | null;
  remainingSessions: number | null;
  isActive: boolean;
}

export interface CreditSummaryDto {
  userId: number;
  credits: number;
  timestamp: string;
}

export interface CreditBalanceSummaryDto {
  userId: number;
  reviewCredits: number;
  consultationCredits: number;
  lastUpdated: string;
  recentLedgers: {
    id: number;
    creditType: string;
    amount: number;
    reason: string;
    createdAt: string;
  }[];
}

export const fallbackPlans: PlanDto[] = [
  {
    id: 1,
    code: "FREE",
    name: "Gói Học viên Cơ bản",
    description: "Trải nghiệm các kịch bản nền tảng và nhận xét AI cơ bản.",
    planType: PlanType.Subscription,
    price: 0,
    currency: "VND",
    durationDays: null,
    sessionQuota: 5,
    reviewCredits: 0,
    consultationCredits: 0,
    status: PlanStatus.Published,
    displayOrder: 1,
    scopes: [],
  },
  {
    id: 2,
    code: "PRO",
    name: "Gói BA Thực chiến Pro",
    description: "Mở khóa toàn bộ kịch bản đa ngành, sự kiện khẩn cấp và 1 lượt chuyên gia thẩm định.",
    planType: PlanType.Subscription,
    price: 199000,
    currency: "VND",
    durationDays: 30,
    sessionQuota: null,
    reviewCredits: 1,
    consultationCredits: 1,
    status: PlanStatus.Published,
    displayOrder: 2,
    scopes: [],
  },
  {
    id: 3,
    code: "ENTERPRISE",
    name: "Gói Trường học / Doanh nghiệp",
    description: "Dành cho trường đại học hoặc trung tâm đào tạo quản lý nhiều lớp sinh viên.",
    planType: PlanType.Custom,
    price: 990000,
    currency: "VND",
    durationDays: 90,
    sessionQuota: null,
    reviewCredits: 5,
    consultationCredits: 3,
    status: PlanStatus.Published,
    displayOrder: 3,
    scopes: [],
  },
];

export const commerceService = {
  // 1. GET /api/plans: Lấy danh sách các gói cước đang mở bán
  async getPlans(): Promise<PlanDto[]> {
    try {
      const data = await apiClient.get<PlanDto[]>("/api/plans");
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return fallbackPlans;
    } catch (e) {
      console.warn("Không thể tải danh sách gói từ /api/plans, sử dụng danh sách mẫu:", e);
      return fallbackPlans;
    }
  },

  // 2. GET /api/plans/{id}: Xem chi tiết một gói theo ID
  async getPlanById(id: number): Promise<PlanDto> {
    try {
      return await apiClient.get<PlanDto>(`/api/plans/${id}`);
    } catch {
      return fallbackPlans.find((p) => p.id === id) || fallbackPlans[0];
    }
  },

  // 3. POST /api/orders: Tạo đơn hàng mua gói và nhận link thanh toán PayOS / VietQR
  async createOrder(request: CreateOrderRequest): Promise<OrderDto> {
    return apiClient.post<OrderDto>("/api/orders", request);
  },

  // 4. GET /api/orders/{id}: Lấy trạng thái đơn hàng (dùng để polling sau khi người dùng quét mã)
  async getOrderById(id: number): Promise<OrderDto> {
    return apiClient.get<OrderDto>(`/api/orders/${id}`);
  },

  // 5. GET /api/orders/me: Lịch sử đơn hàng của người dùng hiện tại
  async getMyOrders(): Promise<OrderDto[]> {
    try {
      return await apiClient.get<OrderDto[]>("/api/orders/me");
    } catch (e) {
      console.warn("Không thể tải lịch sử đơn hàng từ /api/orders/me:", e);
      return [];
    }
  },

  // 6. POST /api/orders/{id}/cancel: Hủy đơn hàng đang chờ thanh toán
  async cancelOrder(id: number): Promise<void> {
    return apiClient.post<void>(`/api/orders/${id}/cancel`);
  },

  // 7. GET /api/me/entitlements: Danh sách quyền truy cập kịch bản của người dùng hiện tại
  async getMyEntitlements(): Promise<EntitlementDto[]> {
    try {
      return await apiClient.get<EntitlementDto[]>("/api/me/entitlements");
    } catch (e) {
      console.warn("Không thể tải quyền truy cập từ /api/me/entitlements:", e);
      return [];
    }
  },

  // 8. GET /api/me/review-credits: Số dư credit gửi bài cho Chuyên gia chấm
  async getMyReviewCredits(): Promise<CreditSummaryDto> {
    return apiClient.get<CreditSummaryDto>("/api/me/review-credits");
  },

  // 9. GET /api/me/consultation-credits: Số dư credit đặt lịch 1-on-1 với Chuyên gia
  async getMyConsultationCredits(): Promise<CreditSummaryDto> {
    return apiClient.get<CreditSummaryDto>("/api/me/consultation-credits");
  },

  // 10. GET /api/me/credits-summary: Tổng hợp toàn bộ số dư credit (Review và Consultation)
  async getMyCreditsSummary(): Promise<CreditBalanceSummaryDto | null> {
    try {
      return await apiClient.get<CreditBalanceSummaryDto>("/api/me/credits-summary");
    } catch (e) {
      console.warn("Không thể tải số dư credit từ /api/me/credits-summary:", e);
      return null;
    }
  },
};

