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

  // API 13: POST /api/sessions/{sessionId}/agents/{agentId}/messages
  async sendMessage(sessionId: number, agentId: number, content: string): Promise<SendMessageResponseDto> {
    return apiClient.post<SendMessageResponseDto>(
      `/api/sessions/${sessionId}/agents/${agentId}/messages`,
      { content }
    );
  },

  // API 14: GET /api/sessions/{sessionId}/agents/{agentId}/messages
  async getMessages(
    sessionId: number,
    agentId: number,
    limit = 100,
    beforeSeq?: number
  ): Promise<AgentMessagesListDto> {
    const qs = beforeSeq ? `?limit=${limit}&beforeSeq=${beforeSeq}` : `?limit=${limit}`;
    return apiClient.get<AgentMessagesListDto>(
      `/api/sessions/${sessionId}/agents/${agentId}/messages${qs}`
    );
  },
};

export interface AgentMessageDto {
  id: number;
  sessionAgentId: number;
  senderRole: "Learner" | "Stakeholder" | "System" | string;
  content: string;
  sequenceNumber: number;
  createdAt: string;
}

export interface SendMessageResponseDto {
  learnerMessage: AgentMessageDto;
  stakeholderMessage: AgentMessageDto;
  usedKnowledgeItemIds?: number[];
}

export interface AgentMessagesListDto {
  sessionId: number;
  agentId: number;
  totalCount: number;
  messages: AgentMessageDto[];
}
