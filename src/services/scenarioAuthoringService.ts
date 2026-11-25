import { apiClient } from "./apiClient";

export interface CreateScenarioPayload {
  applicationId: number;
  code: string;
  title: string;
  description?: string;
  summary?: string;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  baRole?: string;
  /** Deprecated — scenario chỉ dùng sprints. */
  assignment?: string;
}

export interface ScenarioSummaryDto {
  id: number;
  applicationId: number;
  code: string;
  title: string;
  description?: string | null;
  status?: string | number;
  initialVersionId?: number;
  currentDraftVersionId?: number;
  hasPublishedVersion?: boolean;
  createdAt?: string;
}

export interface UpdatePersonaPayload {
  code: string;
  name: string;
  stakeholderRole: string;
  department?: string;
  responsibilities?: string;
  goals?: string;
  painPoints?: string;
  businessConcerns?: string;
  communicationStyle?: string;
  personality?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateKnowledgeAccessPayload {
  personaCode: string;
  accessType?: number;
  disclosureRule?: string;
  isHidden?: boolean;
}

export interface UpdateKnowledgeItemPayload {
  code: string;
  title: string;
  content: string;
  category?: number;
  importance?: number;
  accessList: UpdateKnowledgeAccessPayload[];
}

export interface UpdateScenarioEventPayload {
  title: string;
  description: string;
  triggerType?: number;
  triggerConditionJson?: string;
  eventContent: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ScenarioVersionSummaryDto {
  id: number;
  scenarioId: number;
  versionNo: number;
  summary?: string | null;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface DiscardDraftResultDto {
  discardedVersionId: number;
  scenarioId: number;
  scenarioDeleted: boolean;
  fallbackVersionId?: number | null;
  fallbackVersionNo?: number | null;
  fallbackSummary?: string | null;
}

export interface ScenarioSprintDto {
  sprintNo: number;
  focus: string;
  durationValue: number;
  durationUnit: "days" | "weeks" | string;
  templateCodes: string[];
}

export interface ScenarioSprintListDto {
  scenarioVersionId: number;
  scenarioId: number;
  sprints: ScenarioSprintDto[];
}

export interface AuthoringPersonaDto {
  id: number;
  name: string;
  stakeholderRole: string;
  department?: string;
  responsibilities?: string;
  goals?: string;
  painPoints?: string;
  businessConcerns?: string;
  communicationStyle?: string;
  personality?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface KnowledgeAccessDto {
  personaId: number;
  personaName: string;
  accessType: number;
  disclosureRule?: string;
  isHidden: boolean;
}

export interface AuthoringKnowledgeItemDto {
  id: number;
  code: string;
  title: string;
  content: string;
  category: number;
  importance: number;
  accessList: KnowledgeAccessDto[];
}

export interface AuthoringBusinessRuleDto {
  id: number;
  code: string;
  title: string;
  description: string;
  isHidden: boolean;
  importance: number;
}

export interface AuthoringScenarioEventDto {
  id: number;
  title: string;
  description: string;
  triggerType: number;
  triggerConditionJson?: string;
  eventContent: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ScenarioDefinitionDto {
  id: number;
  scenarioId: number;
  scenarioCode: string;
  scenarioTitle: string;
  versionNo: number;
  summary?: string;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  baRole: string;
  /** Deprecated — luôn rỗng; dùng `sprints`. */
  assignment?: string;
  inScope?: string;
  outOfScope?: string;
  knownConstraints?: string;
  difficulty: number;
  isFreeAccess?: boolean;
  isPublished: boolean;
  createdAt: string;
  publishedAt?: string;
  personas: AuthoringPersonaDto[];
  knowledgeItems: AuthoringKnowledgeItemDto[];
  businessRules: AuthoringBusinessRuleDto[];
  events: AuthoringScenarioEventDto[];
  reviewState?: string;
  reviewComment?: string | null;
  submittedForReviewAt?: string | null;
  reviewedAt?: string | null;
  /** Lộ trình sprint (bảng ScenarioSprints). */
  sprints?: ScenarioSprintDto[];
}

export interface ScenarioReviewDecisionDto {
  versionId: number;
  scenarioId: number;
  scenarioCode: string;
  scenarioTitle: string;
  versionNo: number;
  status: string;
  isPublished: boolean;
  reviewComment?: string | null;
  submittedForReviewAt?: string | null;
  reviewedAt?: string | null;
  reviewedByUserId?: number | null;
}

export interface ScenarioReviewQueueItemDto {
  versionId: number;
  scenarioId: number;
  code: string;
  title: string;
  description?: string | null;
  versionNo: number;
  status: string;
  summary?: string | null;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  baRole: string;
  assignment: string;
  inScope?: string | null;
  outOfScope?: string | null;
  knownConstraints?: string | null;
  personaCount: number;
  knowledgeItemCount: number;
  businessRuleCount: number;
  eventCount: number;
  createdByUserId: number;
  submittedForReviewAt?: string | null;
  reviewComment?: string | null;
  reviewedAt?: string | null;
  reviewedByUserId?: number | null;
}

export interface UpdateScenarioDefinitionPayload {
  summary?: string;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  baRole?: string;
  /** Deprecated — luôn gửi rỗng. */
  assignment?: string;
  inScope?: string;
  outOfScope?: string;
  knownConstraints?: string;
  difficulty?: number;
  isFreeAccess?: boolean;
  personas?: UpdatePersonaPayload[];
  knowledgeItems?: UpdateKnowledgeItemPayload[];
  businessRules?: Array<{
    code: string;
    title: string;
    description: string;
    isHidden?: boolean;
    importance?: number;
  }>;
  events?: UpdateScenarioEventPayload[];
  /** Thay toàn bộ lộ trình sprint (ScenarioSprints). */
  sprints?: Array<{
    focus: string;
    durationValue?: number;
    durationUnit?: string;
    templateCodes?: string[];
  }>;
}

export const scenarioAuthoringService = {
  // FE-09: Form Tạo Kịch bản mới: POST /api/scenarios
  async createScenario(payload: CreateScenarioPayload): Promise<ScenarioSummaryDto> {
    return apiClient.post<ScenarioSummaryDto>("/api/scenarios", payload);
  },

  // FE-10: Nút Tạo Version mới cho Scenario: POST /api/scenarios/{id}/versions
  async createVersion(
    scenarioId: number,
    copyFromLatest = true,
    summary?: string
  ): Promise<ScenarioVersionSummaryDto> {
    return apiClient.post<ScenarioVersionSummaryDto>(`/api/scenarios/${scenarioId}/versions`, {
      copyFromLatest,
      ...(summary != null && summary.trim() ? { summary: summary.trim() } : {}),
    });
  },

  /** Hủy bản nháp / bị từ chối: DELETE /api/scenario-versions/{id} */
  async discardDraft(versionId: number): Promise<DiscardDraftResultDto> {
    return apiClient.delete<DiscardDraftResultDto>(`/api/scenario-versions/${versionId}`);
  },

  /** Sprint API — bảng scenario.ScenarioSprints. */
  async getSprints(versionId: number): Promise<ScenarioSprintListDto> {
    return apiClient.get<ScenarioSprintListDto>(`/api/scenario-versions/${versionId}/sprints`);
  },

  async replaceSprints(
    versionId: number,
    sprints: Array<{
      focus: string;
      durationValue?: number;
      durationUnit?: string;
      templateCodes?: string[];
    }>
  ): Promise<ScenarioSprintListDto> {
    return apiClient.put<ScenarioSprintListDto>(`/api/scenario-versions/${versionId}/sprints`, {
      sprints,
    });
  },

  async addSprint(
    versionId: number,
    sprint: {
      focus: string;
      durationValue?: number;
      durationUnit?: string;
      templateCodes?: string[];
    }
  ): Promise<ScenarioSprintListDto> {
    return apiClient.post<ScenarioSprintListDto>(`/api/scenario-versions/${versionId}/sprints`, sprint);
  },

  async updateSprint(
    versionId: number,
    sprintNo: number,
    sprint: {
      focus: string;
      durationValue?: number;
      durationUnit?: string;
      templateCodes?: string[];
    }
  ): Promise<ScenarioSprintListDto> {
    return apiClient.put<ScenarioSprintListDto>(
      `/api/scenario-versions/${versionId}/sprints/${sprintNo}`,
      sprint
    );
  },

  async deleteSprint(versionId: number, sprintNo: number): Promise<ScenarioSprintListDto> {
    return apiClient.delete<ScenarioSprintListDto>(
      `/api/scenario-versions/${versionId}/sprints/${sprintNo}`
    );
  },

  // FE-11: Màn hình Soạn thảo: GET /api/scenario-versions/{id}/definition
  async getDefinition(versionId: number): Promise<ScenarioDefinitionDto> {
    return apiClient.get<ScenarioDefinitionDto>(`/api/scenario-versions/${versionId}/definition`);
  },

  // FE-11: Form chỉnh sửa & Lưu: PUT /api/scenario-versions/{id}/definition
  async updateDefinition(
    versionId: number,
    payload: UpdateScenarioDefinitionPayload
  ): Promise<ScenarioDefinitionDto> {
    return apiClient.put<ScenarioDefinitionDto>(
      `/api/scenario-versions/${versionId}/definition`,
      payload
    );
  },

  async submitForReview(versionId: number): Promise<ScenarioReviewDecisionDto> {
    return apiClient.post<ScenarioReviewDecisionDto>(
      `/api/scenario-versions/${versionId}/submit-review`,
      {}
    );
  },

  async approveVersion(versionId: number): Promise<ScenarioReviewDecisionDto> {
    return apiClient.post<ScenarioReviewDecisionDto>(
      `/api/scenario-versions/${versionId}/approve`,
      {}
    );
  },

  async rejectVersion(versionId: number, comment: string): Promise<ScenarioReviewDecisionDto> {
    return apiClient.post<ScenarioReviewDecisionDto>(
      `/api/scenario-versions/${versionId}/reject`,
      { comment }
    );
  },

  async listReviewQueue(): Promise<ScenarioReviewQueueItemDto[]> {
    return apiClient.get<ScenarioReviewQueueItemDto[]>("/api/scenario-versions/review-queue");
  },

  async listReviewedByMe(): Promise<ScenarioReviewQueueItemDto[]> {
    return apiClient.get<ScenarioReviewQueueItemDto[]>("/api/scenario-versions/reviewed-by-me");
  },

  async listMyVersions(): Promise<ScenarioReviewQueueItemDto[]> {
    return apiClient.get<ScenarioReviewQueueItemDto[]>("/api/scenario-versions/mine");
  },
};
