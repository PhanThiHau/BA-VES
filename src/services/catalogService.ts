import { apiClient } from "./apiClient";

export interface IndustryItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: number | string;
  displayOrder: number;
}

export interface ApplicationItem {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: number | string;
  displayOrder: number;
  industry: {
    id: number;
    code: string;
    name: string;
  };
}

export interface ScenarioItem {
  id: number;
  applicationId: number;
  code: string;
  title: string;
  description: string | null;
  status: number | string;
  hasPublishedVersion: boolean;
  application: {
    id: number;
    code: string;
    name: string;
  };
}

export interface ScenarioContextDto {
  scenarioVersionId: number;
  scenarioCode: string;
  scenarioTitle: string;
  versionNo: number;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  summary: string | null;
  baRole: string;
  assignment: string;
  inScope: string | null;
  outOfScope: string | null;
  knownConstraints: string | null;
  difficulty: number | string;
}

export const catalogService = {
  // FE-06: Dropdown Ngành: GET /api/industries
  async getIndustries(): Promise<IndustryItem[]> {
    return apiClient.get<IndustryItem[]>("/api/industries");
  },

  // FE-06: Dropdown Ứng dụng: GET /api/applications?industryId={id}
  async getApplications(industryId?: number): Promise<ApplicationItem[]> {
    const query = industryId ? `?industryId=${industryId}` : "";
    return apiClient.get<ApplicationItem[]>(`/api/applications${query}`);
  },

  // FE-06: Danh sách Kịch bản: GET /api/scenarios?applicationId={id}&isPublished=true
  async getScenarios(applicationId?: number, isPublished = true): Promise<ScenarioItem[]> {
    const params = new URLSearchParams();
    if (applicationId) params.append("applicationId", String(applicationId));
    if (isPublished !== undefined) params.append("isPublished", String(isPublished));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<ScenarioItem[]>(`/api/scenarios${qs}`);
  },

  // FE-07: Màn hình Đọc bối cảnh & Đề bài: GET /api/scenario-versions/{id}/context
  async getScenarioContext(versionId: number): Promise<ScenarioContextDto> {
    return apiClient.get<ScenarioContextDto>(`/api/scenario-versions/${versionId}/context`);
  },
};
