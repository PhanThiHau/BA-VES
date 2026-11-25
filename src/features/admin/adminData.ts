export interface SystemStat {
  id: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  subtext: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "BAEXPERT" | "LEARNER";
  status: "ACTIVE" | "SUSPENDED" | "INVITED";
  cohort?: string;
  lastActive: string;
  sessionsCount: number;
}

export interface MasterDomain {
  id: string;
  code: string;
  name: string;
  description: string;
  applicationsCount: number;
  scenariosCount: number;
  status: "ACTIVE" | "DRAFT";
}

export interface BabokAreaConfig {
  code: string;
  name: string;
  tasksCount: number;
  weight: number;
  rubricCriteriaCount: number;
}

export interface AiModelConfig {
  id: string;
  name: string;
  provider: string;
  modelCode: string;
  status: "ACTIVE" | "DEPRECATED" | "TESTING";
  tokenCostPer1k: string;
  avgLatencyMs: number;
  isDefault: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
}

export const initialAdminStats: SystemStat[] = [];
export const initialUserAccounts: UserAccount[] = [];
export const initialMasterDomains: MasterDomain[] = [];
export const initialBabokAreas: BabokAreaConfig[] = [];
export const initialAiModels: AiModelConfig[] = [];
export const initialAuditLogs: AuditLogItem[] = [];
