import { apiClient } from "./apiClient";

export interface BabokTaskDto {
  id: number;
  knowledgeAreaCode: string;
  knowledgeAreaName: string;
  code: string;
  name: string;
  purpose: string | null;
  description: string | null;
  babokVersion: string;
  displayOrder: number;
}

export interface RubricCriterionDetailDto {
  id: number;
  rubricId: number;
  babokTaskId: number;
  babokTaskCode: string | null;
  babokTaskName: string | null;
  code: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  evidenceGuidance: string | null;
  displayOrder: number;
  isRequired: boolean;
}

export interface RubricDetailDto {
  id: number;
  scenarioVersionId: number;
  createdByUserId: number;
  name: string;
  version: number;
  description: string | null;
  status: "Draft" | "Published" | "Archived" | number;
  createdAt: string;
  updatedAt: string | null;
  criteria: RubricCriterionDetailDto[];
}

export interface RubricCriterionInputPayload {
  babokTaskId: number;
  code: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  evidenceGuidance?: string | null;
  displayOrder?: number;
  isRequired?: boolean;
}

export interface CreateRubricPayload {
  scenarioVersionId: number;
  name: string;
  description?: string | null;
  publishImmediately?: boolean;
  criteria: RubricCriterionInputPayload[];
}

export interface UpdateRubricPayload {
  name: string;
  description?: string | null;
  criteria: RubricCriterionInputPayload[];
}

export interface AIFeedbackCriterionScoreDto {
  rubricCriterionId: number;
  criterionCode: string;
  criterionName: string;
  score: number;
  maxScore: number;
  comment: string | null;
  evidenceSnippet: string | null;
}

export interface AIPracticeFeedbackDto {
  id: number;
  submissionId: number;
  status: string;
  suggestedScore: number | null;
  confidence: number | null;
  overallFeedback: string | null;
  criterionScores: AIFeedbackCriterionScoreDto[];
  evaluatedAt: string;
  strengths?: string[];
  weaknesses?: string[];
}

export interface ReviewRequestDto {
  id: number;
  submissionId: number;
  learnerId: number;
  assignedReviewerId: number | null;
  requestNote: string | null;
  status: "Pending" | "Accepted" | "Completed" | "Rejected" | string;
  requestedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
}

export interface HumanReviewCriterionScoreDto {
  rubricCriterionId: number;
  criterionCode: string;
  criterionName: string;
  score: number;
  maxScore: number;
  comment: string | null;
}

export interface HumanReviewDto {
  id: number;
  submissionId: number;
  rubricId: number;
  reviewerId: number;
  finalScore: number;
  overallFeedback: string | null;
  criterionScores: HumanReviewCriterionScoreDto[];
  reviewedAt: string;
}

export interface ArtifactSnapshotDto {
  id: number;
  artifactId: number;
  versionNumber: number;
  structuredContentJson: string;
  plainTextContent: string;
  createdAt: string;
}

export interface PlanSnapshotDto {
  id: number;
  sessionId: number;
  scopeSummary?: string | null;
  plannedQuestions?: any[];
}

export interface AnalysisItemSnapshotDto {
  id: number;
  sessionId: number;
  category: string;
  code: string;
  title: string;
  description: string;
  status: string;
}

export interface ReviewCaseDossierDto {
  reviewRequestId: number;
  submissionId: number;
  sessionId: number;
  learnerId: number;
  status: string;
  requestNote: string | null;
  requestedAt: string;
  artifact: ArtifactSnapshotDto;
  plan?: PlanSnapshotDto | null;
  analysisItems: AnalysisItemSnapshotDto[];
  aiFeedback?: AIPracticeFeedbackDto | null;
  rubricCriteria: RubricCriterionDetailDto[];
}

export interface FinalSubmissionReportDto {
  submissionId: number;
  sessionId: number;
  status: string;
  aiFeedback?: AIPracticeFeedbackDto | null;
  expertReview?: HumanReviewDto | null;
  finalScore: number | null;
  submittedAt: string;
  finalizedAt: string | null;
}

export const assessmentService = {
  // 1. BABOK Tasks & Rubrics
  async getBabokTasks(): Promise<BabokTaskDto[]> {
    return apiClient.get<BabokTaskDto[]>("/api/babok-tasks");
  },

  async getRubrics(scenarioVersionId?: number): Promise<RubricDetailDto[]> {
    const qs = scenarioVersionId ? `?scenarioVersionId=${scenarioVersionId}` : "";
    return apiClient.get<RubricDetailDto[]>(`/api/rubrics${qs}`);
  },

  async getRubricById(id: number): Promise<RubricDetailDto> {
    return apiClient.get<RubricDetailDto>(`/api/rubrics/${id}`);
  },

  // POST /api/rubrics: Giảng viên / Quản trị viên tạo mới bộ tiêu chí Rubric
  async createRubric(payload: CreateRubricPayload): Promise<RubricDetailDto> {
    return apiClient.post<RubricDetailDto>("/api/rubrics", payload);
  },

  // PUT /api/rubrics/{id}: Giảng viên / Quản trị viên cập nhật bộ tiêu chí Rubric (Draft)
  async updateRubric(id: number, payload: UpdateRubricPayload): Promise<RubricDetailDto> {
    return apiClient.put<RubricDetailDto>(`/api/rubrics/${id}`, payload);
  },

  // POST /api/rubrics/{id}/publish: Giảng viên / Quản trị viên phát hành Rubric
  async publishRubric(id: number): Promise<RubricDetailDto> {
    return apiClient.post<RubricDetailDto>(`/api/rubrics/${id}/publish`);
  },

  // 2. Chấm điểm tự động bằng AI (AI Assessor)
  async evaluateSubmission(submissionId: number): Promise<AIPracticeFeedbackDto> {
    return apiClient.post<AIPracticeFeedbackDto>(`/api/submissions/${submissionId}/evaluate`);
  },

  async getAiFeedback(submissionId: number): Promise<AIPracticeFeedbackDto> {
    return apiClient.get<AIPracticeFeedbackDto>(`/api/submissions/${submissionId}/ai-feedback`);
  },

  // 3. Yêu cầu Chuyên gia / Giảng viên chấm điểm (Human Review)
  async requestReview(submissionId: number, requestNote?: string): Promise<ReviewRequestDto> {
    return apiClient.post<ReviewRequestDto>(`/api/submissions/${submissionId}/review-requests`, {
      requestNote,
    });
  },

  async getReviewRequests(status?: string): Promise<ReviewRequestDto[]> {
    const qs = status ? `?status=${status}` : "";
    return apiClient.get<ReviewRequestDto[]>(`/api/review-requests${qs}`);
  },

  async acceptReviewRequest(id: number): Promise<void> {
    return apiClient.post<void>(`/api/review-requests/${id}/accept`);
  },

  // GET /api/review-requests/{id}/case: Lấy hồ sơ kiểm thử nghiệp vụ (Case Dossier) để chấm bài
  async getReviewCaseDossier(id: number): Promise<ReviewCaseDossierDto> {
    return apiClient.get<ReviewCaseDossierDto>(`/api/review-requests/${id}/case`);
  },

  async completeReview(
    id: number,
    payload: {
      overallFeedback: string;
      criterionScores: { rubricCriterionId: number; score: number; comment?: string }[];
    }
  ): Promise<HumanReviewDto> {
    return apiClient.post<HumanReviewDto>(`/api/review-requests/${id}/complete`, payload);
  },

  // 4. Báo cáo tổng hợp đánh giá
  async getFinalReport(submissionId: number): Promise<FinalSubmissionReportDto> {
    return apiClient.get<FinalSubmissionReportDto>(`/api/submissions/${submissionId}/report`);
  },
};
