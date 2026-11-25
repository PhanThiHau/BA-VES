import { apiClient } from "./apiClient";

export type PlanType = "ScenarioSingle" | "AppBundle" | "Subscription" | "Addon";
export type PlanStatus = "Draft" | "Published" | "Archived";
export type OrderStatus = "Pending" | "Paid" | "Cancelled" | "Expired" | "Failed" | "Refunded";

export interface PlanScopeDto {
  id: number;
  scopeType: "Scenario" | "Application" | "Industry" | "Domain" | "All" | string | number;
  scopeId?: number | null;
}

export interface PlanDto {
  id: number;
  code: string;
  name: string;
  description: string;
  planType: PlanType;
  price: number;
  currency: string;
  durationDays?: number;
  sessionQuota?: number;
  reviewCredits: number;
  consultationCredits: number;
  status: PlanStatus;
  displayOrder: number;
  scopes: PlanScopeDto[];
}

export interface CreateOrderRequest {
  planId: number;
  /** scenarioId / applicationId / industryId khi gói có ScopeId null */
  targetScopeId?: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface OrderLineDto {
  id: number;
  planId: number;
  planCode: string;
  planName: string;
  unitPrice: number;
  currency: string;
  targetScopeId?: number | null;
  targetLabel?: string | null;
  displayOrder: number;
}

export interface OrderDto {
  id: number;
  orderCode: number;
  userId: number;
  planId: number;
  planName: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  checkoutUrl?: string;
  qrCode?: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  lines?: OrderLineDto[] | null;
}

export interface CartItemDto {
  id: number;
  planId: number;
  planCode: string;
  planName: string;
  unitPrice: number;
  currency: string;
  targetScopeId?: number | null;
  targetLabel?: string | null;
  scopeType?: string | null;
  createdAt: string;
}

export interface CartDto {
  id: number;
  userId: number;
  items: CartItemDto[];
  totalAmount: number;
  currency: string;
  updatedAt: string;
}

export interface AddCartItemRequest {
  planId: number;
  targetScopeId?: number;
  targetLabel?: string;
}

export interface EntitlementDto {
  id: number;
  userId: number;
  sourceType: string;
  sourceOrderId?: number;
  scopeType: string;
  scopeId?: number;
  startsAt: string;
  endsAt?: string;
  sessionQuota?: number;
  sessionsUsed: number;
  status: string;
  createdAt: string;
}

export interface CreditSummaryDto {
  userId: number;
  credits: number;
  asOf: string;
}

export function entitlementCoversScenario(
  entitlements: EntitlementDto[],
  target: {
    scenarioId?: number;
    versionId?: number;
    applicationId?: number;
    industryId?: number;
    isFreeAccess?: boolean;
  }
): boolean {
  // Scenario Beginner được gắn miễn phí — không cần entitlement mua
  if (target.isFreeAccess) return true;

  const active = entitlements.filter((item) => isActiveEntitlement(item.status));
  return active.some((item) => {
    const scope = normalizeScope(item.scopeType);
    if (scope === "All") return true;
    if (scope === "Scenario") {
      return item.scopeId == null || item.scopeId === target.scenarioId || item.scopeId === target.versionId;
    }
    if (scope === "Application") return item.scopeId === target.applicationId;
    if (scope === "Industry") return item.scopeId === target.industryId;
    return false;
  });
}

function isActiveEntitlement(status: string | number) {
  return status === "Active" || status === 0 || status === "0";
}

function normalizeScope(scopeType: string | number) {
  if (scopeType === "All" || scopeType === 3 || scopeType === "3") return "All";
  if (scopeType === "Scenario" || scopeType === 2 || scopeType === "2") return "Scenario";
  if (scopeType === "Application" || scopeType === 1 || scopeType === "1") return "Application";
  if (scopeType === "Industry" || scopeType === 0 || scopeType === "0") return "Industry";
  return String(scopeType);
}

export const commerceService = {
  // Plans
  getPlans: async (): Promise<PlanDto[]> => {
    return apiClient.get<PlanDto[]>("/api/plans");
  },

  getPlanById: async (id: number): Promise<PlanDto> => {
    return apiClient.get<PlanDto>(`/api/plans/${id}`);
  },

  // Orders
  createOrder: async (request: CreateOrderRequest, idempotencyKey?: string): Promise<OrderDto> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    return apiClient.post<OrderDto>("/api/orders", request, headers);
  },

  getOrderById: async (id: number): Promise<OrderDto> => {
    return apiClient.get<OrderDto>(`/api/orders/${id}`);
  },

  getMyOrders: async (): Promise<OrderDto[]> => {
    return apiClient.get<OrderDto[]>("/api/orders/me");
  },

  cancelOrder: async (id: number): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/api/orders/${id}/cancel`);
  },

  // Cart
  getCart: async (): Promise<CartDto> => {
    return apiClient.get<CartDto>("/api/cart");
  },

  addCartItem: async (request: AddCartItemRequest): Promise<CartDto> => {
    return apiClient.post<CartDto>("/api/cart/items", request);
  },

  removeCartItem: async (itemId: number): Promise<CartDto> => {
    return apiClient.delete<CartDto>(`/api/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<CartDto> => {
    return apiClient.delete<CartDto>("/api/cart");
  },

  checkoutCart: async (
    request?: { returnUrl?: string; cancelUrl?: string },
    idempotencyKey?: string
  ): Promise<OrderDto> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
    return apiClient.post<OrderDto>("/api/cart/checkout", request ?? {}, headers);
  },

  // Entitlements & Credits
  getMyEntitlements: async (): Promise<EntitlementDto[]> => {
    return apiClient.get<EntitlementDto[]>("/api/me/entitlements");
  },

  getReviewCredits: async (): Promise<CreditSummaryDto> => {
    return apiClient.get<CreditSummaryDto>("/api/me/review-credits");
  },

  getConsultationCredits: async (): Promise<CreditSummaryDto> => {
    return apiClient.get<CreditSummaryDto>("/api/me/consultation-credits");
  },

  // Helper for demo / test: Simulate successful PayOS Webhook payment
  simulatePayOsWebhook: async (orderCode: number, amount: number): Promise<{ code: string; message: string }> => {
    const payload = {
      code: "00",
      desc: "Success",
      data: {
        orderCode,
        amount,
        description: "Thanh toán thành công qua PayOS",
        accountNumber: "VNASP8888",
        reference: `MOCK-${Date.now()}`,
        transactionDateTime: new Date().toISOString(),
        currency: "VND",
        paymentLinkId: `mock-link-${orderCode}`,
        code: "00",
        desc: "Thành công",
      },
      signature: "MOCK_VALID_SIGNATURE",
    };
    return apiClient.post<{ code: string; message: string }>("/api/payments/payos/webhook", payload);
  },
};
