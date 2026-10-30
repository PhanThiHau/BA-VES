import { apiClient } from "./apiClient";

export type CohortStatus = "Draft" | "Active" | "Completed" | "Archived" | number;
export type CohortMemberStatus = "Active" | "Removed" | "Completed" | number;

export interface CohortSummaryDto {
  id: number;
  instructorId: number;
  code: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: CohortStatus;
  activeMemberCount: number;
  assignmentCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CohortDetailDto {
  id: number;
  instructorId: number;
  code: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: CohortStatus;
  activeMemberCount: number;
  activeAssignmentCount: number;
  totalAssignmentCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface LearnerCohortDto {
  cohortId: number;
  instructorId: number;
  code: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  cohortStatus: CohortStatus;
  memberStatus: CohortMemberStatus;
  joinedAt: string;
  activeAssignmentCount: number;
}

export interface CohortMemberDto {
  id: number;
  cohortId: number;
  learnerId: number;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  status: CohortMemberStatus;
  joinedAt: string;
}

export interface BatchAddCohortMembersResultDto {
  cohortId: number;
  addedCount: number;
  reactivatedCount: number;
  alreadyActiveCount: number;
  notFoundIdentities: string[];
  addedOrReactivatedMembers: CohortMemberDto[];
}

export interface CohortCriterionBenchmarkDto {
  criterionCode: string;
  criterionName: string;
  maxScore: number;
  evaluatedCount: number;
  averageScore: number;
  averageAchievementPercent: number;
  belowThresholdCount: number;
}

export interface CohortLearnerAnalyticsDto {
  learnerId: number;
  fullName: string;
  email: string | null;
  sessionsStartedCount: number;
  submissionsCount: number;
  finalizedReviewsCount: number;
  averageAiScore: number | null;
  averageFinalScore: number | null;
}

export interface CohortAnalyticsDto {
  cohortId: number;
  code: string;
  name: string;
  activeMemberCount: number;
  totalAssignmentCount: number;
  totalSessionsStarted: number;
  totalSubmissionsCount: number;
  totalFinalizedReviewsCount: number;
  classAverageAiScore: number | null;
  classAverageExpertScore: number | null;
  completionRatePercent: number;
  criterionBenchmarks: CohortCriterionBenchmarkDto[];
  learnerSummaries: CohortLearnerAnalyticsDto[];
}

export interface CreateCohortPayload {
  code: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: CohortStatus;
}

export interface UpdateCohortPayload {
  code: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export const cohortService = {
  // 1. Quản lý Lớp học (Cohorts)
  async getCohorts(status?: CohortStatus): Promise<CohortSummaryDto[]> {
    const qs = status !== undefined ? `?status=${status}` : "";
    return apiClient.get<CohortSummaryDto[]>(`/api/cohorts${qs}`);
  },

  async getCohortById(id: number): Promise<CohortDetailDto> {
    return apiClient.get<CohortDetailDto>(`/api/cohorts/${id}`);
  },

  async createCohort(payload: CreateCohortPayload): Promise<CohortDetailDto> {
    return apiClient.post<CohortDetailDto>("/api/cohorts", payload);
  },

  async updateCohort(id: number, payload: UpdateCohortPayload): Promise<CohortDetailDto> {
    return apiClient.put<CohortDetailDto>(`/api/cohorts/${id}`, payload);
  },

  async updateCohortStatus(id: number, status: CohortStatus): Promise<CohortDetailDto> {
    return apiClient.patch<CohortDetailDto>(`/api/cohorts/${id}/status`, { status });
  },

  async deleteCohort(id: number): Promise<void> {
    return apiClient.delete<void>(`/api/cohorts/${id}`);
  },

  async getCohortAnalytics(id: number): Promise<CohortAnalyticsDto> {
    return apiClient.get<CohortAnalyticsDto>(`/api/cohorts/${id}/analytics`);
  },

  // 2. Lớp học của Học viên hiện tại
  async getMyCohorts(): Promise<LearnerCohortDto[]> {
    return apiClient.get<LearnerCohortDto[]>("/api/me/cohorts");
  },

  // 3. Quản lý Thành viên Lớp học (Cohort Members)
  async getCohortMembers(cohortId: number): Promise<CohortMemberDto[]> {
    return apiClient.get<CohortMemberDto[]>(`/api/cohorts/${cohortId}/members`);
  },

  async addCohortMember(
    cohortId: number,
    payload: { learnerId?: number; email?: string }
  ): Promise<CohortMemberDto> {
    return apiClient.post<CohortMemberDto>(`/api/cohorts/${cohortId}/members`, payload);
  },

  async batchAddCohortMembers(
    cohortId: number,
    payload: { learnerIds?: number[]; emails?: string[] }
  ): Promise<BatchAddCohortMembersResultDto> {
    return apiClient.post<BatchAddCohortMembersResultDto>(`/api/cohorts/${cohortId}/members/batch`, payload);
  },

  async removeCohortMember(cohortId: number, learnerId: number): Promise<void> {
    return apiClient.delete<void>(`/api/cohorts/${cohortId}/members/${learnerId}`);
  },
};

