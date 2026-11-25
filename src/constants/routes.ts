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
  cohorts: "#/cohorts",
  planning: "#/planning",
  simulation: "#/simulation",
  analysis: "#/analysis",
  artifacts: "#/artifacts",
  docs: "#/docs",
  assessment: "#/assessment",
  progress: "#/progress",
  payment: "#/payment",
  cart: "#/cart",
  booking: "#/booking",
  instructor: "#/instructor",
  admin: "#/admin",
  expert: "#/expert",
};

export function routeFromHash(hash: string): RouteKey {
  if (!hash || hash === "#" || hash === "#/") return "landing";
  // Hỗ trợ #/payment?tab=cart → route payment
  const raw = hash.replace(/^#\/?/, "").split("?")[0].trim();
  const normalized = raw.split("/")[0].toLowerCase().trim();
  if (!normalized || normalized === "undefined") return "landing";

  const known = Object.keys(ROUTES) as RouteKey[];
  const byKey = known.find((k) => k.toLowerCase() === normalized);
  if (byKey) return byKey;

  const match = (Object.entries(ROUTES) as [RouteKey, string][]).find(([key, value]) => {
    const valClean = value.replace(/^#\/?/, "").toLowerCase();
    return valClean === normalized || key.toLowerCase() === normalized;
  });
  return match?.[0] ?? "landing";
}

/** Đọc query trên hash, ví dụ #/payment?tab=cart */
export function hashQueryParam(name: string): string | null {
  const hash = window.location.hash || "";
  const qIndex = hash.indexOf("?");
  if (qIndex < 0) return null;
  return new URLSearchParams(hash.slice(qIndex + 1)).get(name);
}
