export interface ScenarioVersion {
  id: string;
  versionNumber: string;
  scenarioId: string;
  scenarioTitle: string;
  domain: "Bán lẻ" | "Chuỗi cung ứng" | "Tài chính";
  status: "Đã ban hành" | "Bản nháp" | "Lưu trữ" | "Chờ duyệt" | "Từ chối";
  reviewComment?: string;
  baselineProblem: string;
  groundTruth: string;
  summary?: string;
  businessContext?: string;
  businessProblem?: string;
  businessObjectives?: string;
  baRole?: string;
  assignment?: string;
  inScope?: string;
  outOfScope?: string;
  knownConstraints?: string;
  difficulty?: number;
  /** true = Scenario Library toàn hệ thống (Admin); false/undefined = của instructor. */
  isSystemLibrary?: boolean;
  isFreeAccess?: boolean;
  stakeholdersCount: number;
  eventsCount: number;
  evidenceCount: number;
  rubricCriteriaCount: number;
  updatedAt: string;
}

export interface StakeholderPersona {
  id: string;
  code?: string;
  scenarioId: string;
  name: string;
  role: string;
  department: string;
  businessGoal: string;
  authority: string;
  knowledgeBoundary: string;
  hiddenInformation: string;
  conflictingStance: string;
  communicationStyle?: string;
  personality?: string;
  status: "Đã kiểm thử đạt" | "Cần kiểm tra lại";
}

export interface AgentKnowledgeItem {
  id: string;
  code?: string;
  scenarioId: string;
  title: string;
  category: "Quy tắc nghiệp vụ" | "Thực tế quy trình" | "Ràng buộc dữ liệu" | "Kiến trúc hệ thống";
  content: string;
  confidentiality: "Công khai" | "Nội bộ" | "Tuyệt mật";
  knownByStakeholders: string[];
}

export type ScenarioEventTriggerType =
  | "manual_instructor"
  | "after_sprint_ends"
  | "message_count"
  | "time_elapsed";

export interface ScenarioEventConfig {
  id: string;
  scenarioId: string;
  title: string;
  triggerType: ScenarioEventTriggerType;
  /** Mô tả / JSON điều kiện (VD afterSprintNo). */
  triggerCondition: string;
  /** Sprint N phải kết thúc trước khi event xuất hiện (khi triggerType = after_sprint_ends). */
  afterSprintNo?: number;
  description: string;
  impactedRequirements: string[];
  injectedFact: string;
}

export interface CriterionReview {
  id: string;
  babokArea: string;
  name: string;
  weight: number;
  aiScore: number;
  humanScore: number;
  aiEvidenceQuote: string;
  status: "Đạt" | "Cần xem xét";
}

export interface ReviewItem {
  id: string;
  learner: string;
  cohort: string;
  scenarioId: string;
  scenarioTitle: string;
  stage: string;
  aiScore: number;
  aiConfidence: number;
  humanScore: number | null;
  status: "pending" | "calibrated" | "revision_requested";
  issueSummary: string;
  submittedAt: string;
  due: string;
  tone: "red" | "amber" | "navy" | "green";
  deliverablesSubmitted: string[];
  moderatorNotes: string;
  criteria: CriterionReview[];
}

export interface CohortItem {
  id: string;
  code: string;
  name: string;
  instructorName: string;
  studentsCount: number;
  pendingRequestCount?: number;
  activeAssignmentsCount: number;
  completionRate: number;
  averageScore: number;
  domain: string;
  status: "active" | "archived";
}

export interface AssignmentItem {
  id: string;
  title: string;
  cohortId: string;
  cohortName: string;
  scenarioVersionId: string;
  scenarioTitle: string;
  deadline: string;
  attemptLimit: number;
  submissionsCount: number;
  totalStudents: number;
  status: "active" | "upcoming" | "closed";
}

export const initialScenarios: ScenarioVersion[] = [];
export const initialPersonas: StakeholderPersona[] = [];
export const initialKnowledgeItems: AgentKnowledgeItem[] = [];
export const initialScenarioEvents: ScenarioEventConfig[] = [];
export const initialReviewItems: ReviewItem[] = [];
export const initialCohorts: CohortItem[] = [];
export const initialAssignments: AssignmentItem[] = [];
export const cohortCompetencyAverages: Array<{
  area: string;
  score: number;
  benchmark: number;
  status: string;
}> = [];
