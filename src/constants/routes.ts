import type { RouteKey } from "../types/models";

export const ROUTES: Record<RouteKey, string> = {
  landing: "#/",
  login: "#/login",
  register: "#/register",
  "role-selection": "#/select-role",
  dashboard: "#/dashboard",
  applications: "#/applications",
  scenarios: "#/scenarios",
  "scenario-detail": "#/scenario-detail",
  planning: "#/planning",
  simulation: "#/simulation",
  analysis: "#/analysis",
  artifacts: "#/artifacts",
  assessment: "#/assessment",
  progress: "#/progress",
  instructor: "#/instructor",
};

export function routeFromHash(hash: string): RouteKey {
  const match = (Object.entries(ROUTES) as [RouteKey, string][]).find(([, value]) => value === hash);
  return match?.[0] ?? "landing";
}
