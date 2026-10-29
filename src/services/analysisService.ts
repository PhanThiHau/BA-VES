import { apiClient } from "./apiClient";

export enum AnalysisItemType {
  Finding = 0,
  Requirement = 1,
  BusinessRule = 2,
  Constraint = 3,
  Risk = 4,
  OpenQuestion = 5,
  Conflict = 6,
  Assumption = 7,
}

export enum AnalysisItemStatus {
  Draft = 0,
  Confirmed = 1,
  Resolved = 2,
  Archived = 3,
}

export enum PriorityLevel {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

export interface AnalysisItemDto {
  id: number;
  sessionId: number;
  parentAnalysisItemId?: number | null;
  itemType: AnalysisItemType | number;
  code: string;
  title: string;
  description: string;
  priority?: PriorityLevel | number | null;
  status: AnalysisItemStatus | number;
  metadataJson?: string | null;
  createdByUserId: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateAnalysisItemPayload {
  parentAnalysisItemId?: number | null;
  itemType: AnalysisItemType | number;
  title: string;
  description: string;
  priority?: PriorityLevel | number | null;
  metadataJson?: string | null;
}

export interface UpdateAnalysisItemPayload {
  title?: string;
  description?: string;
  priority?: PriorityLevel | number | null;
  status?: AnalysisItemStatus | number;
  parentAnalysisItemId?: number | null;
  metadataJson?: string | null;
}

export const analysisItemTypeLabels: Record<number, string> = {
  [AnalysisItemType.Finding]: "Phát hiện (Finding)",
  [AnalysisItemType.Requirement]: "Yêu cầu (Requirement)",
  [AnalysisItemType.BusinessRule]: "Quy tắc nghiệp vụ (Business Rule)",
  [AnalysisItemType.Constraint]: "Ràng buộc (Constraint)",
  [AnalysisItemType.Risk]: "Rủi ro (Risk)",
  [AnalysisItemType.OpenQuestion]: "Câu hỏi mở (Open Question)",
  [AnalysisItemType.Conflict]: "Xung đột (Conflict)",
  [AnalysisItemType.Assumption]: "Giả định (Assumption)",
};

export const analysisItemStatusLabels: Record<number, { text: string; tone: "amber" | "green" | "navy" | "gray" }> = {
  [AnalysisItemStatus.Draft]: { text: "Bản nháp", tone: "amber" },
  [AnalysisItemStatus.Confirmed]: { text: "Đã xác nhận", tone: "green" },
  [AnalysisItemStatus.Resolved]: { text: "Đã giải quyết", tone: "navy" },
  [AnalysisItemStatus.Archived]: { text: "Lưu trữ", tone: "gray" },
};

export const analysisService = {
  // API #1: GET /api/sessions/{sessionId}/analysis-items
  async getAnalysisItems(
    sessionId: number,
    itemType?: AnalysisItemType | number,
    status?: AnalysisItemStatus | number
  ): Promise<AnalysisItemDto[]> {
    const params = new URLSearchParams();
    if (itemType !== undefined) params.append("itemType", String(itemType));
    if (status !== undefined) params.append("status", String(status));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<AnalysisItemDto[]>(`/api/sessions/${sessionId}/analysis-items${qs}`);
  },

  // API #2: POST /api/sessions/{sessionId}/analysis-items
  async createAnalysisItem(
    sessionId: number,
    payload: CreateAnalysisItemPayload
  ): Promise<AnalysisItemDto> {
    return apiClient.post<AnalysisItemDto>(
      `/api/sessions/${sessionId}/analysis-items`,
      payload
    );
  },

  // API #3: PATCH /api/sessions/{sessionId}/analysis-items/{itemId}
  async updateAnalysisItem(
    sessionId: number,
    itemId: number,
    payload: UpdateAnalysisItemPayload
  ): Promise<AnalysisItemDto> {
    return apiClient.patch<AnalysisItemDto>(
      `/api/sessions/${sessionId}/analysis-items/${itemId}`,
      payload
    );
  },

  // API #4: DELETE /api/sessions/{sessionId}/analysis-items/{itemId}
  async deleteAnalysisItem(sessionId: number, itemId: number): Promise<void> {
    return apiClient.delete<void>(`/api/sessions/${sessionId}/analysis-items/${itemId}`);
  },
};
