import { apiClient } from "./apiClient";

export interface PlannedQuestionDto {
  id: number;
  stakeholderPersonaId: number | null;
  topic?: string | null;
  informationNeed?: string | null;
  question: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
  displayOrder: number;
  status: "Planned" | "Asked" | "Skipped" | string;
  createdAt: string;
}

export interface BAPlanDto {
  id: number;
  sessionId: number;
  objective: string;
  approach?: string | null;
  status: "Draft" | "Ready" | string;
  createdAt: string;
  updatedAt?: string | null;
  questions: PlannedQuestionDto[];
}

export interface PlannedQuestionInput {
  stakeholderPersonaId?: number | null;
  topic?: string | null;
  informationNeed?: string | null;
  question: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
  displayOrder?: number;
}

export interface UpsertPlanPayload {
  objective: string;
  approach?: string | null;
  questions?: PlannedQuestionInput[] | null;
}

export interface AddPlannedQuestionPayload {
  stakeholderPersonaId?: number | null;
  topic?: string | null;
  informationNeed?: string | null;
  question: string;
  priority: "Low" | "Medium" | "High" | "Critical" | string;
}

export interface UpdatePlannedQuestionPayload {
  stakeholderPersonaId?: number | null;
  topic?: string | null;
  informationNeed?: string | null;
  question?: string;
  priority?: "Low" | "Medium" | "High" | "Critical" | string;
  status?: "Planned" | "Asked" | "Skipped" | string;
}

export const planningService = {
  // API 8: GET /api/sessions/{id}/plan
  async getPlan(sessionId: number): Promise<BAPlanDto> {
    return apiClient.get<BAPlanDto>(`/api/sessions/${sessionId}/plan`);
  },

  // API 9: PUT /api/sessions/{id}/plan
  async upsertPlan(sessionId: number, payload: UpsertPlanPayload): Promise<BAPlanDto> {
    return apiClient.put<BAPlanDto>(`/api/sessions/${sessionId}/plan`, payload);
  },

  // API 10: POST /api/sessions/{id}/plan/questions
  async addPlannedQuestion(sessionId: number, payload: AddPlannedQuestionPayload): Promise<PlannedQuestionDto> {
    return apiClient.post<PlannedQuestionDto>(`/api/sessions/${sessionId}/plan/questions`, payload);
  },

  // API 11: PATCH /api/planned-questions/{id} (hỗ trợ cả fallback /planned-questions/{id})
  async updatePlannedQuestion(questionId: number, payload: UpdatePlannedQuestionPayload): Promise<PlannedQuestionDto> {
    try {
      return await apiClient.patch<PlannedQuestionDto>(`/api/planned-questions/${questionId}`, payload);
    } catch {
      return await apiClient.patch<PlannedQuestionDto>(`/planned-questions/${questionId}`, payload);
    }
  },

  // API 12: DELETE /api/planned-questions/{id} (hỗ trợ cả fallback /planned-questions/{id})
  async deletePlannedQuestion(questionId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/planned-questions/${questionId}`);
    } catch {
      await apiClient.delete(`/planned-questions/${questionId}`);
    }
  },
};
