import { apiClient } from "./apiClient";

export type ArtifactType =
  | "BRD"
  | "Generic"
  | "BAP"
  | "StakeholderRegister"
  | "BusinessRulesCatalog"
  | "SRS"
  | "UserStories"
  | "UseCaseSpecification"
  | "ImpactAnalysis"
  | "RTM"
  | number;

export interface ArtifactTemplateSectionDto {
  id: number;
  sectionKey: string;
  title: string;
  instructions: string | null;
  displayOrder: number;
  isRequired: boolean;
}

export interface ArtifactTemplateDto {
  id: number;
  code: string;
  name: string;
  artifactType: ArtifactType;
  description: string | null;
  status: "Draft" | "Published" | "Archived" | number;
  createdAt: string;
  sections: ArtifactTemplateSectionDto[];
}

export interface ArtifactDto {
  id: number;
  sessionId: number;
  artifactTemplateId: number;
  templateCode: string;
  templateName: string;
  artifactType: ArtifactType;
  title: string;
  draftStructuredContentJson: string | null;
  draftPlainTextContent: string | null;
  status: "Draft" | "Frozen" | "Submitted" | number;
  currentVersionNo: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ArtifactVersionDto {
  id: number;
  artifactId: number;
  versionNo: number;
  structuredContentJson: string;
  plainTextContent: string;
  createdByUserId: number;
  processingStatus: "Pending" | "Ready" | "Failed" | number;
  createdAt: string;
}

export interface SubmissionDto {
  id: number;
  sessionId: number;
  artifactVersionId: number;
  attemptNo: number;
  status: "Submitted" | "Grading" | "Graded" | "RevisionRequested" | number;
  submittedAt: string;
  finalizedAt: string | null;
  artifactVersion?: ArtifactVersionDto | null;
}

export interface CreateArtifactTemplatePayload {
  code: string;
  name: string;
  artifactType: number | string;
  description?: string;
  publishImmediately?: boolean;
  sections: {
    sectionKey: string;
    title: string;
    instructions?: string;
    displayOrder: number;
    isRequired: boolean;
  }[];
}

export interface UpdateArtifactDraftPayload {
  draftStructuredContentJson?: string;
  draftPlainTextContent?: string;
}

export interface FreezeVersionPayload {
  structuredContentJson: string;
  plainTextContent: string;
}

export const artifactService = {
  // 1. Quản lý Artifact Templates
  async getTemplates(): Promise<ArtifactTemplateDto[]> {
    return apiClient.get<ArtifactTemplateDto[]>("/api/artifact-templates");
  },

  async getTemplateById(id: number): Promise<ArtifactTemplateDto> {
    return apiClient.get<ArtifactTemplateDto>(`/api/artifact-templates/${id}`);
  },

  async createTemplate(payload: CreateArtifactTemplatePayload): Promise<ArtifactTemplateDto> {
    return apiClient.post<ArtifactTemplateDto>("/api/artifact-templates", payload);
  },

  async publishTemplate(id: number): Promise<ArtifactTemplateDto> {
    return apiClient.post<ArtifactTemplateDto>(`/api/artifact-templates/${id}/publish`);
  },

  // 2. Artifacts trong phiên làm việc (Session Artifacts)
  async getSessionArtifacts(sessionId: number): Promise<ArtifactDto[]> {
    return apiClient.get<ArtifactDto[]>(`/api/sessions/${sessionId}/artifacts`);
  },

  async createSessionArtifact(
    sessionId: number,
    payload: { artifactTemplateId: number; title: string }
  ): Promise<ArtifactDto> {
    return apiClient.post<ArtifactDto>(`/api/sessions/${sessionId}/artifacts`, payload);
  },

  // 3. Quản lý Draft & Đóng băng phiên bản
  async getArtifactById(id: number): Promise<ArtifactDto> {
    return apiClient.get<ArtifactDto>(`/api/artifacts/${id}`);
  },

  async updateDraft(id: number, payload: UpdateArtifactDraftPayload): Promise<ArtifactDto> {
    return apiClient.put<ArtifactDto>(`/api/artifacts/${id}/draft`, payload);
  },

  async getArtifactVersions(id: number): Promise<ArtifactVersionDto[]> {
    return apiClient.get<ArtifactVersionDto[]>(`/api/artifacts/${id}/versions`);
  },

  async freezeVersion(id: number, payload: FreezeVersionPayload): Promise<ArtifactVersionDto> {
    return apiClient.post<ArtifactVersionDto>(`/api/artifacts/${id}/versions`, payload);
  },

  // 4. Nộp bài (Submissions)
  async submitArtifactVersion(sessionId: number, artifactVersionId: number): Promise<SubmissionDto> {
    return apiClient.post<SubmissionDto>(`/api/sessions/${sessionId}/submissions`, {
      artifactVersionId,
    });
  },

  async getSessionSubmissions(sessionId: number): Promise<SubmissionDto[]> {
    return apiClient.get<SubmissionDto[]>(`/api/sessions/${sessionId}/submissions`);
  },

  async getSubmissionById(id: number): Promise<SubmissionDto> {
    return apiClient.get<SubmissionDto>(`/api/submissions/${id}`);
  },
};

