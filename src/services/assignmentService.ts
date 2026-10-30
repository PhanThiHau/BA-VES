import { apiClient } from "./apiClient";

export type AssignmentStatus = "Draft" | "Scheduled" | "Active" | "Closed" | "Archived" | number;

export interface AssignmentSummaryDto {
  id: number;
  title: string;
  scenarioVersionId: number;
  cohortId: number | null;
  cohortCode: string | null;
  cohortName: string | null;
  learnerId: number | null;
  rubricId: number | null;
  assignedByUserId: number;
  startAt: string | null;
  dueAt: string | null;
  maxAttempts: number | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface AssignmentDetailDto {
  id: number;
  title: string;
  instructions: string | null;
  scenarioVersionId: number;
  cohortId: number | null;
  cohortCode: string | null;
  cohortName: string | null;
  learnerId: number | null;
  rubricId: number | null;
  assignedByUserId: number;
  startAt: string | null;
  dueAt: string | null;
  maxAttempts: number | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface LearnerAssignmentDto {
  id: number;
  title: string;
  instructions: string | null;
  scenarioVersionId: number;
  cohortId: number | null;
  cohortCode: string | null;
  cohortName: string | null;
  startAt: string | null;
  dueAt: string | null;
  maxAttempts: number | null;
  assignmentStatus: AssignmentStatus;
  progressStatus: string;
  attemptsUsed: number;
  remainingAttempts: number | null;
  latestSessionId: number | null;
  isOverdue: boolean;
}

export interface GradebookEntryDto {
  learnerId: number;
  fullName: string;
  email: string | null;
  attemptsUsed: number;
  latestSessionId: number | null;
  latestSubmissionId: number | null;
  progressStatus: string;
  isLate: boolean;
  submittedAt: string | null;
  finalizedAt: string | null;
  aiSuggestedScore: number | null;
  expertFinalScore: number | null;
  reviewerId: number | null;
}

export interface AssignmentGradebookDto {
  assignmentId: number;
  title: string;
  scenarioVersionId: number;
  cohortId: number | null;
  cohortCode: string | null;
  cohortName: string | null;
  dueAt: string | null;
  maxAttempts: number | null;
  totalRecipients: number;
  notStartedCount: number;
  inProgressCount: number;
  submittedCount: number;
  gradedCount: number;
  lateSubmissionCount: number;
  averageAiScore: number | null;
  averageFinalScore: number | null;
  entries: GradebookEntryDto[];
}

export interface CreateAssignmentPayload {
  title: string;
  instructions?: string | null;
  scenarioVersionId: number;
  cohortId?: number | null;
  learnerId?: number | null;
  rubricId?: number | null;
  startAt?: string | null;
  dueAt?: string | null;
  maxAttempts?: number | null;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentPayload {
  title: string;
  instructions?: string | null;
  rubricId?: number | null;
  startAt?: string | null;
  dueAt?: string | null;
  maxAttempts?: number | null;
}

export const assignmentService = {
  // 1. Quản lý Bài tập (Assignments)
  async getAssignments(cohortId?: number, status?: AssignmentStatus): Promise<AssignmentSummaryDto[]> {
    const params = new URLSearchParams();
    if (cohortId !== undefined) params.append("cohortId", cohortId.toString());
    if (status !== undefined) params.append("status", status.toString());
    const qs = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<AssignmentSummaryDto[]>(`/api/assignments${qs}`);
  },

  async getAssignmentById(id: number): Promise<AssignmentDetailDto> {
    return apiClient.get<AssignmentDetailDto>(`/api/assignments/${id}`);
  },

  async createAssignment(payload: CreateAssignmentPayload): Promise<AssignmentDetailDto> {
    return apiClient.post<AssignmentDetailDto>("/api/assignments", payload);
  },

  async updateAssignment(id: number, payload: UpdateAssignmentPayload): Promise<AssignmentDetailDto> {
    return apiClient.put<AssignmentDetailDto>(`/api/assignments/${id}`, payload);
  },

  async publishAssignment(id: number): Promise<AssignmentDetailDto> {
    return apiClient.post<AssignmentDetailDto>(`/api/assignments/${id}/publish`);
  },

  async closeAssignment(id: number): Promise<AssignmentDetailDto> {
    return apiClient.post<AssignmentDetailDto>(`/api/assignments/${id}/close`);
  },

  // 2. Sổ điểm & Báo cáo tiến độ (Gradebook)
  async getAssignmentGradebook(id: number): Promise<AssignmentGradebookDto> {
    return apiClient.get<AssignmentGradebookDto>(`/api/assignments/${id}/gradebook`);
  },

  async exportAssignmentGradebookCsv(id: number): Promise<string> {
    return apiClient.get<string>(`/api/assignments/${id}/gradebook/export`);
  },

  // 3. Học viên: Danh sách bài tập được giao & Bắt đầu làm bài
  async getMyAssignments(): Promise<LearnerAssignmentDto[]> {
    return apiClient.get<LearnerAssignmentDto[]>("/api/me/assignments");
  },

  async startAssignmentSession(id: number): Promise<any> {
    return apiClient.post<any>(`/api/assignments/${id}/start`);
  },
};
