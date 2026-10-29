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
  admin: "#/admin",
};

export function routeFromHash(hash: string): RouteKey {
  if (!hash || hash === "#" || hash === "#/") return "landing";
  const normalized = hash.replace(/^#\/?/, "").split("?")[0].split("/")[0].toLowerCase();
  if (!normalized) return "landing";

  const match = (Object.entries(ROUTES) as [RouteKey, string][]).find(([key, value]) => {
    const valClean = value.replace(/^#\/?/, "").toLowerCase();
    return valClean === normalized || key.toLowerCase() === normalized;
  });
  return match?.[0] ?? "landing";
}
