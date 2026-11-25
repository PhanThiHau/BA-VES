/** Giá mua lẻ 1 kịch bản theo độ khó (VND). Đồng bộ với PLAN-SCENARIO-* trên commerce.Plans */

export type ScenarioDifficultyKey = "Beginner" | "Intermediate" | "Advanced";

export const SCENARIO_SINGLE_PRICES: Record<ScenarioDifficultyKey, number> = {
  Beginner: 59_000,
  Intermediate: 99_000,
  Advanced: 149_000,
};

export const SCENARIO_SINGLE_PLAN_CODES: Record<ScenarioDifficultyKey, string> = {
  Beginner: "PLAN-SCENARIO-BEGINNER",
  Intermediate: "PLAN-SCENARIO-INTERMEDIATE",
  Advanced: "PLAN-SCENARIO-ADVANCED",
};

export function normalizeDifficulty(raw?: string | number | null): ScenarioDifficultyKey {
  // Number 0 is falsy — never coerce via `raw || ""`.
  if (raw === 0 || raw === "0") return "Beginner";
  if (raw === 1 || raw === "1") return "Intermediate";
  if (raw === 2 || raw === "2") return "Advanced";
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (s === "beginner" || s === "co ban" || s === "basic") return "Beginner";
  if (s === "advanced" || s === "nang cao") return "Advanced";
  if (s === "intermediate" || s === "trung cap") return "Intermediate";
  // Unknown / missing → Intermediate (giá an toàn cho mua lẻ)
  return "Intermediate";
}

export const SCENARIO_DIFFICULTY_LABELS_VI: Record<ScenarioDifficultyKey, "Cơ bản" | "Trung cấp" | "Nâng cao"> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
};

/** Nhãn hiển thị thống nhất list + detail (tiếng Việt). */
export function difficultyLabelVi(raw?: string | number | null): "Cơ bản" | "Trung cấp" | "Nâng cao" {
  return SCENARIO_DIFFICULTY_LABELS_VI[normalizeDifficulty(raw)];
}

export function planCodeForDifficulty(raw?: string | number | null): string {
  return SCENARIO_SINGLE_PLAN_CODES[normalizeDifficulty(raw)];
}

export function priceForDifficulty(raw?: string | number | null): number {
  return SCENARIO_SINGLE_PRICES[normalizeDifficulty(raw)];
}
