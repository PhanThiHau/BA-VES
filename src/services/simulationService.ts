import { apiClient } from "./apiClient";

export interface SessionAgentDto {
  id: number;
  personaId: number;
  name: string;
  stakeholderRole: string;
  trustLevel: number;
  patienceLevel: number;
  cooperationLevel: number;
  initials?: string;
  color?: string;
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

export interface SessionHistoryItemDto {
  id: number;
  scenarioVersionId: number;
  assignmentId: number | null;
  attemptNo: number;
  status: string | number;
  agentCount: number;
  messageCount: number;
  startedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
}

export interface AgentMessageDto {
  id: number;
  sessionId?: number;
  sessionAgentId?: number;
  senderType?: "Learner" | "Stakeholder" | "System" | number | string;
  senderRole?: "Learner" | "Stakeholder" | "System" | string;
  content: string;
  sequenceNumber?: number;
  createdAt: string;
}

export interface SendMessageResponseDto {
  learnerMessage: AgentMessageDto;
  stakeholderMessage: AgentMessageDto;
  usedKnowledgeItemIds?: number[];
}

export interface AgentMessagePageDto {
  items: AgentMessageDto[];
  page: number;
  pageSize: number;
  total: number;
}

export type AgentMessagesListDto = AgentMessagePageDto & {
  messages?: AgentMessageDto[];
  totalCount?: number;
};

export interface CoachFeedbackDto {
  id: number;
  sessionId: number;
  strengths: string[];
  gaps: string[];
  unclearPoints: string[];
  improvementHints: string[];
  promptVersion?: string;
  createdAt: string;
}

export interface SessionEventDto {
  id: number;
  sessionId: number;
  scenarioEventId: number;
  triggerSource: "Automatic" | "Manual" | "Instructor" | string;
  triggeredAt: string;
  sequenceNo: number;
  eventContentSnapshot: string;
}

export interface SessionEventPageDto {
  items: SessionEventDto[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ScenarioEventAvailabilityDto {
  id: number;
  title: string;
  description: string;
  triggerType: "Manual" | "MessageCount" | "TimeElapsed" | "Condition" | "AfterSprintEnds" | string;
  displayOrder: number;
  isTriggered: boolean;
  triggeredAt: string | null;
  afterSprintNo?: number | null;
  isUnlocked?: boolean;
  unlockHint?: string | null;
}

export interface TriggerSessionEventResultDto {
  sessionId: number;
  scenarioEventId: number;
  alreadyTriggered: boolean;
  eventTitle: string;
  triggeredAt: string;
}

export const simulationService = {
  // FE-08: Khởi tạo Phiên thực hành: POST /api/sessions
  async startSession(scenarioVersionId: number): Promise<SessionDto> {
    return apiClient.post<SessionDto>("/api/sessions", { scenarioVersionId });
  },

  // Lấy chi tiết session: GET /api/sessions/{id}
  async getSession(id: number): Promise<SessionDto> {
    return apiClient.get<SessionDto>(`/api/sessions/${id}`);
  },

  // Lấy danh sách Stakeholder Agents: GET /api/sessions/{id}/agents
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
    page = 1,
    pageSize = 100
  ): Promise<AgentMessagePageDto> {
    return apiClient.get<AgentMessagePageDto>(
      `/api/sessions/${sessionId}/agents/${agentId}/messages?page=${page}&pageSize=${pageSize}`
    );
  },

  // API: GET /api/sessions (Lấy lịch sử các phiên thực hành của tôi)
  async getMySessions(filters?: {
    status?: string | number;
    scenarioVersionId?: number;
    assignmentId?: number;
  }): Promise<SessionHistoryItemDto[]> {
    const params = new URLSearchParams();
    if (filters?.status !== undefined) params.append("status", String(filters.status));
    if (filters?.scenarioVersionId !== undefined) params.append("scenarioVersionId", String(filters.scenarioVersionId));
    if (filters?.assignmentId !== undefined) params.append("assignmentId", String(filters.assignmentId));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<SessionHistoryItemDto[]>(`/api/sessions${qs}`);
  },

  // API: POST /api/sessions/{id}/complete (Chốt hoàn thành phiên)
  async completeSession(id: number): Promise<SessionDto> {
    return apiClient.post<SessionDto>(`/api/sessions/${id}/complete`);
  },

  // API: POST /api/sessions/{id}/abandon (Hủy bỏ phiên thực hành)
  async abandonSession(id: number): Promise<SessionDto> {
    return apiClient.post<SessionDto>(`/api/sessions/${id}/abandon`);
  },

  // API: GET /api/sessions/{sessionId}/events (Lấy danh sách sự kiện đã kích hoạt trong phiên)
  async getSessionEvents(sessionId: number, page = 1, pageSize = 20): Promise<SessionEventPageDto> {
    return apiClient.get<SessionEventPageDto>(`/api/sessions/${sessionId}/events?page=${page}&pageSize=${pageSize}`);
  },

  // API: GET /api/sessions/{sessionId}/event-catalog (Lấy danh mục sự kiện kịch bản kèm trạng thái)
  async getSessionEventCatalog(sessionId: number): Promise<ScenarioEventAvailabilityDto[]> {
    return apiClient.get<ScenarioEventAvailabilityDto[]>(`/api/sessions/${sessionId}/event-catalog`);
  },

  // API: POST /api/sessions/{sessionId}/events/{eventId}/trigger (Kích hoạt biến cố thủ công)
  async triggerSessionEvent(sessionId: number, eventId: number): Promise<TriggerSessionEventResultDto> {
    return apiClient.post<TriggerSessionEventResultDto>(`/api/sessions/${sessionId}/events/${eventId}/trigger`);
  },

  // API: POST /api/sessions/{sessionId}/coach-feedback (Yêu cầu AI Coach nhận xét hội thoại)
  async requestCoachFeedback(sessionId: number): Promise<CoachFeedbackDto> {
    return apiClient.post<CoachFeedbackDto>(`/api/sessions/${sessionId}/coach-feedback`);
  },

  // API: GET /api/sessions/{sessionId}/coach-feedback (Đọc nhận xét mới nhất đã lưu của AI Coach)
  async getCoachFeedback(sessionId: number): Promise<CoachFeedbackDto> {
    return apiClient.get<CoachFeedbackDto>(`/api/sessions/${sessionId}/coach-feedback`);
  },

  async getSprintBoard(sessionId: number): Promise<SprintBoardDto> {
    return apiClient.get<SprintBoardDto>(`/api/sessions/${sessionId}/sprints`);
  },

  async reviewSprint(
    sessionId: number,
    sprintNo: number,
    learnerReply: string,
    finalizeSprint: boolean
  ): Promise<SprintReviewTurnDto> {
    return apiClient.post<SprintReviewTurnDto>(`/api/sessions/${sessionId}/sprints/${sprintNo}/review`, {
      learnerReply,
      finalizeSprint,
    });
  },
};

export interface SprintDiscussionMessageDto {
  speaker: string;
  content: string;
}

export interface SprintTaskDto {
  sprintNo: number;
  name: string;
  focus: string;
  status: string;
  score?: number | null;
  decision?: string | null;
  digest?: string | null;
  challengeQuestions: string[];
  improvementNotes?: string[];
  chairSpeakerName?: string | null;
  chairReply?: string | null;
  discussion?: SprintDiscussionMessageDto[];
  /** Thời hạn tương đối: số ngày/tuần từ lúc bắt đầu sprint hiện tại. */
  durationValue?: number;
  durationUnit?: "days" | "weeks" | string;
  requiredTemplateCodes?: string[];
  submittedTemplateCodes?: string[];
  missingTemplateCodes?: string[];
}

export interface SprintFinalEvaluationDto {
  averageScore?: number | null;
  summary: string;
  sprints: Array<{ sprintNo: number; score?: number | null; decision?: string | null; digest?: string | null }>;
}

export interface PriorSprintReassessmentDto {
  sprintNo: number;
  previousScore?: number | null;
  reassessedScore?: number | null;
  improved: boolean;
  notes: string;
}

export interface SprintBoardDto {
  sessionId: number;
  currentSprintNo: number;
  totalSprints: number;
  projectFinalized: boolean;
  sprints: SprintTaskDto[];
  finalEvaluation?: SprintFinalEvaluationDto | null;
  currentSprintStartedAt?: string | null;
  currentSprintDueAt?: string | null;
  sprintDurationMinutes: number;
  isOverdue: boolean;
  minutesRemaining?: number | null;
  reviewRequired: boolean;
}

export interface SprintReviewTurnDto {
  sprintNo: number;
  status: string;
  chairSpeakerName: string;
  chairReply: string;
  challengeQuestions: string[];
  score?: number | null;
  decision?: string | null;
  digest?: string | null;
  projectFinalized: boolean;
  finalEvaluation?: SprintFinalEvaluationDto | null;
  reviewPhase: string;
  revealNumericScore: boolean;
  improvementNotes: string[];
  priorSprintReassessment?: PriorSprintReassessmentDto | null;
}
