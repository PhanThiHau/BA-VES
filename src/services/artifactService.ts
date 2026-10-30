import { apiClient } from "./apiClient";

export interface ArtifactTemplateSectionDto {
  id: number;
  artifactTemplateId: number;
  sectionKey: string;
  title: string;
  instructions: string | null;
  displayOrder: number;
  isRequired: boolean;
}

export interface ArtifactTemplateDto {
  id: number;
  name: string;
  artifactType: number | string;
  description: string | null;
  status: "Draft" | "Published" | "Archived" | number;
  sections: ArtifactTemplateSectionDto[];
}

export interface ArtifactDto {
  id: number;
  sessionId: number;
  artifactTemplateId: number;
  templateCode?: string;
  currentVersionNo?: number;
  title: string;
  status: string;
  draftStructuredContentJson: string | null;
  draftPlainTextContent: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ArtifactVersionDto {
  id: number;
  artifactId: number;
  versionNumber: number;
  versionNo?: number;
  structuredContentJson: string;
  plainTextContent: string;
  createdAt: string;
}

export interface SubmissionDto {
  id: number;
  sessionId: number;
  artifactVersionId: number;
  status: "Submitted" | "Reviewed" | "Finalized" | string;
  submittedAt: string;
}

export interface CreateArtifactTemplatePayload {
  name: string;
  artifactType: number | string;
  description?: string;
  sections: {
    sectionKey: string;
    title: string;
    instructions?: string;
    displayOrder: number;
    isRequired: boolean;
  }[];
}

export interface UpdateArtifactTemplatePayload {
  name: string;
  artifactType: number | string;
  description?: string | null;
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

  // PUT /api/artifact-templates/{id}: Cập nhật bản nháp mẫu tài liệu
  async updateTemplate(id: number, payload: UpdateArtifactTemplatePayload): Promise<ArtifactTemplateDto> {
    return apiClient.put<ArtifactTemplateDto>(`/api/artifact-templates/${id}`, payload);
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

  async getVersions(id: number): Promise<ArtifactVersionDto[]> {
    const list = await apiClient.get<ArtifactVersionDto[]>(`/api/artifacts/${id}/versions`);
    return list.map((v) => ({ ...v, versionNo: v.versionNo ?? v.versionNumber }));
  },

  async getArtifactVersions(id: number): Promise<ArtifactVersionDto[]> {
    return this.getVersions(id);
  },

  async freezeVersion(id: number, payload: FreezeVersionPayload): Promise<ArtifactVersionDto> {
    const v = await apiClient.post<ArtifactVersionDto>(`/api/artifacts/${id}/versions`, payload);
    return { ...v, versionNo: v.versionNo ?? v.versionNumber };
  },

  // 4. Nộp bài đánh giá (Submission)
  async submitSessionArtifact(sessionId: number, artifactVersionId: number): Promise<SubmissionDto> {
    return apiClient.post<SubmissionDto>(`/api/sessions/${sessionId}/submissions`, {
      artifactVersionId,
    });
  },

  async submitArtifactVersion(sessionId: number, artifactVersionId: number): Promise<SubmissionDto> {
    return this.submitSessionArtifact(sessionId, artifactVersionId);
  },

  async getSessionSubmissions(sessionId: number): Promise<SubmissionDto[]> {
    return apiClient.get<SubmissionDto[]>(`/api/sessions/${sessionId}/submissions`);
  },

  async getSubmissionById(id: number): Promise<SubmissionDto> {
    return apiClient.get<SubmissionDto>(`/api/submissions/${id}`);
  },
};
