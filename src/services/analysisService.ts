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

export enum EvidenceRelationshipType {
  Supports = 0,
  Contradicts = 1,
  Clarifies = 2,
  Confirms = 3,
}

export const evidenceRelationshipLabels: Record<number, { text: string; tone: "green" | "red" | "amber" | "navy" }> = {
  [EvidenceRelationshipType.Supports]: { text: "Hỗ trợ (Supports)", tone: "green" },
  [EvidenceRelationshipType.Contradicts]: { text: "Mâu thuẫn (Contradicts)", tone: "red" },
  [EvidenceRelationshipType.Clarifies]: { text: "Làm rõ (Clarifies)", tone: "amber" },
  [EvidenceRelationshipType.Confirms]: { text: "Xác nhận (Confirms)", tone: "navy" },
};

export interface EvidenceLinkDto {
  id: number;
  analysisItemId: number;
  messageId: number;
  relationshipType: EvidenceRelationshipType | number;
  createdAt: string;
}

export interface EvidenceLinkDetailDto {
  id: number;
  analysisItemId: number;
  messageId: number;
  relationshipType: EvidenceRelationshipType | number;
  senderType?: string | null;
  messageContent?: string | null;
  createdAt: string;
}

export interface CreateEvidenceLinkPayload {
  messageId: number;
  relationshipType: EvidenceRelationshipType | number;
}

export interface ConfirmAnalysisItemPayload {
  agentId?: number | null;
  personaId?: number | null;
  evidenceNote?: string | null;
}

export interface AnalysisConfirmationResultDto {
  analysisItemId: number;
  code: string;
  title: string;
  itemStatus: AnalysisItemStatus | number;
  agentId: number;
  personaId: number;
  personaName: string;
  stakeholderRole: string;
  outcome: string; // "Confirmed" | "Disputed" | "InsufficientInformation"
  reasoning: string;
  suggestedClarification?: string | null;
  evidenceMessageIds: number[];
  confirmedAt: string;
}

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

  // API #5: GET /api/analysis-items/{itemId}/evidence
  async getEvidenceLinks(itemId: number): Promise<EvidenceLinkDetailDto[]> {
    return apiClient.get<EvidenceLinkDetailDto[]>(`/api/analysis-items/${itemId}/evidence`);
  },

  // API #6: POST /api/analysis-items/{itemId}/evidence
  async addEvidenceLink(
    itemId: number,
    payload: CreateEvidenceLinkPayload
  ): Promise<EvidenceLinkDto> {
    return apiClient.post<EvidenceLinkDto>(
      `/api/analysis-items/${itemId}/evidence`,
      payload
    );
  },

  // API #7: DELETE /api/analysis-items/{itemId}/evidence/{linkId}
  async removeEvidenceLink(
    itemId: number,
    linkId: number
  ): Promise<EvidenceLinkDto> {
    return apiClient.delete<EvidenceLinkDto>(
      `/api/analysis-items/${itemId}/evidence/${linkId}`
    );
  },

  // API #8: POST /api/analysis-items/{itemId}/confirmation
  async confirmAnalysisItem(
    itemId: number,
    payload: ConfirmAnalysisItemPayload,
    byokHeaders?: { provider?: string; model?: string; apiKey?: string }
  ): Promise<AnalysisConfirmationResultDto> {
    const headers: Record<string, string> = {};
    if (byokHeaders?.provider) headers["X-AI-Provider"] = byokHeaders.provider;
    if (byokHeaders?.model) headers["X-AI-Model"] = byokHeaders.model;
    if (byokHeaders?.apiKey) headers["X-AI-Key"] = byokHeaders.apiKey;
    return apiClient.post<AnalysisConfirmationResultDto>(
      `/api/analysis-items/${itemId}/confirmation`,
      payload,
      Object.keys(headers).length > 0 ? headers : undefined
    );
  },
};
