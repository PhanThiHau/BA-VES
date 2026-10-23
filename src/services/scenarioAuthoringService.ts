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
  assignment: string;
}

export interface ScenarioSummaryDto {
  id: number;
  applicationId: number;
  code: string;
  title: string;
  currentDraftVersionId?: number;
  hasPublishedVersion: boolean;
}

export interface ScenarioVersionSummaryDto {
  id: number;
  scenarioId: number;
  versionNo: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
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
  assignment: string;
  inScope?: string;
  outOfScope?: string;
  knownConstraints?: string;
  difficulty: number;
  isPublished: boolean;
  createdAt: string;
  publishedAt?: string;
  personas: AuthoringPersonaDto[];
  knowledgeItems: AuthoringKnowledgeItemDto[];
  businessRules: AuthoringBusinessRuleDto[];
  events: AuthoringScenarioEventDto[];
}

export interface UpdateScenarioDefinitionPayload {
  summary?: string;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  baRole?: string;
  assignment: string;
  inScope?: string;
  outOfScope?: string;
  knownConstraints?: string;
  difficulty?: number;
  personas?: any[];
  knowledgeItems?: any[];
  businessRules?: any[];
  events?: any[];
}

export const scenarioAuthoringService = {
  // FE-09: Form Tạo Kịch bản mới: POST /api/scenarios
  async createScenario(payload: CreateScenarioPayload): Promise<ScenarioSummaryDto> {
    return apiClient.post<ScenarioSummaryDto>("/api/scenarios", payload);
  },

  // FE-10: Nút Tạo Version mới cho Scenario: POST /api/scenarios/{id}/versions
  async createVersion(
    scenarioId: number,
    cloneFromPreviousVersion = true
  ): Promise<ScenarioVersionSummaryDto> {
    return apiClient.post<ScenarioVersionSummaryDto>(`/api/scenarios/${scenarioId}/versions`, {
      cloneFromPreviousVersion,
    });
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

  // FE-12: Nút Xuất bản Kịch bản: POST /api/scenario-versions/{id}/publish
  async publishVersion(versionId: number): Promise<ScenarioVersionSummaryDto> {
    return apiClient.post<ScenarioVersionSummaryDto>(
      `/api/scenario-versions/${versionId}/publish`,
      {}
    );
  },
};
