import { apiClient } from "./apiClient";

export interface SessionAgentDto {
  id: number;
  personaId: number;
  name: string;
  stakeholderRole: string;
  trustLevel: number;
  patienceLevel: number;
  cooperationLevel: number;
}

export interface SessionDto {
  id: number;
  scenarioVersionId: number;
  assignmentId: number | null;
  attemptNo: number;
  status: number | string;
  startedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
  agents: SessionAgentDto[];
}

export const simulationService = {
  // FE-08: Khởi tạo Phiên thực hành: POST /api/sessions
  async startSession(scenarioVersionId: number): Promise<SessionDto> {
    return apiClient.post<SessionDto>("/api/sessions", { scenarioVersionId });
  },

  // Lấy chi tiết session
  async getSession(id: number): Promise<SessionDto> {
    return apiClient.get<SessionDto>(`/api/sessions/${id}`);
  },

  // Lấy danh sách Stakeholder Agents
  async getSessionAgents(id: number): Promise<SessionAgentDto[]> {
    return apiClient.get<SessionAgentDto[]>(`/api/sessions/${id}/agents`);
  },
};
