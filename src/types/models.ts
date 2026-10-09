export type AppRole = "learner" | "instructor";
export type RouteKey = "landing" | "login" | "register" | "role-selection" | "dashboard" | "applications" | "scenarios" | "scenario-detail" | "planning" | "simulation" | "analysis" | "artifacts" | "assessment" | "progress" | "instructor";

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  status: "available" | "interviewed" | "locked";
  focus: string;
}

export interface ChatMessage {
  id: number;
  sender: "learner" | "agent";
  text: string;
  time: string;
  evidence?: boolean;
  stakeholderId?: string;
  technique?: string;
}

export interface Requirement {
  id: string;
  title: string;
  type: "Business" | "Stakeholder" | "Solution" | "Transition";
  priority: "Must" | "Should" | "Could";
  status: "Draft" | "Validated" | "Changed";
  source: string;
}

export type LearningAppStatus = "available" | "beta" | "coming-soon";

export interface LearningApplication {
  id: string;
  domainId: string;
  name: string;
  description: string;
  scenarioCount: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  progress: number;
  status: LearningAppStatus;
  accent: string;
}

export interface LearningDomain {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: "boxes" | "sales" | "finance" | "factory" | "people" | "project";
  color: string;
  applicationIds: string[];
}

export type ValidationStatus = "confirmed" | "needs-clarification" | "unconfirmed";

export interface EvidenceItem {
  id: string;
  quote: string;
  source: string;
  stakeholderId: string;
  category: "Process" | "Pain point" | "Business rule" | "Data" | "Constraint" | "KPI";
  confidence: "High" | "Medium" | "Low";
  status: ValidationStatus;
  linkedRequirements: string[];
}

export interface FindingItem {
  id: string;
  title: string;
  interpretation: string;
  evidenceIds: string[];
  status: ValidationStatus;
  owner: string;
}

export interface ConflictItem {
  id: string;
  topic: string;
  positions: Array<{ stakeholder: string; position: string }>;
  impact: string;
  resolution: string;
  status: "open" | "resolved";
}

export interface ConfirmationItem {
  id: string;
  findingId: string;
  stakeholder: string;
  response: string;
  status: ValidationStatus;
  confirmedAt?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  response: string;
  owner: string;
}
