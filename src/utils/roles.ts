import type { AppRole, RouteKey } from "../types/models";

/** Normalize role strings from API (Name vs NormalizedName casing / aliases). */
export function normalizeRole(role: string | null | undefined): string {
  return (role || "").trim().toUpperCase();
}

export function hasAnyRole(
  roles: string[] | null | undefined,
  ...candidates: string[]
): boolean {
  if (!roles?.length) return false;
  const set = new Set(roles.map(normalizeRole));
  return candidates.some((c) => set.has(normalizeRole(c)));
}

export function isAdminRole(roles: string[] | null | undefined): boolean {
  return hasAnyRole(roles, "ADMIN");
}

/** Backend historically used EXPERT, BAExpert, or BAEXPERT — all map here. */
export function isExpertRole(roles: string[] | null | undefined): boolean {
  return hasAnyRole(roles, "BAEXPERT", "EXPERT");
}

export function isInstructorRole(roles: string[] | null | undefined): boolean {
  return hasAnyRole(roles, "INSTRUCTOR");
}

export function isLearnerRole(roles: string[] | null | undefined): boolean {
  return hasAnyRole(roles, "LEARNER");
}

/** Primary app shell role. Priority: Admin > Expert > Instructor > Learner. */
export function resolveAppRole(roles: string[] | null | undefined): AppRole {
  if (isAdminRole(roles)) return "admin";
  if (isExpertRole(roles)) return "expert";
  if (isInstructorRole(roles)) return "instructor";
  return "learner";
}

export function homeRouteForRole(role: AppRole): RouteKey {
  switch (role) {
    case "admin":
      return "admin";
    case "expert":
      return "expert";
    case "instructor":
      return "instructor";
    default:
      return "dashboard";
  }
}

export function homeRouteForRoles(roles: string[] | null | undefined): RouteKey {
  return homeRouteForRole(resolveAppRole(roles));
}
