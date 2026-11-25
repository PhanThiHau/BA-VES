/** Đặc quyền & định vị giá Learner packs 1–4 (+ add-on Expert). Đồng bộ code với seed-learner-plans-v2.sql */

export type LearnerPlanTier = 1 | 2 | 3 | 4 | "addon";

export interface LearnerPlanPrivilege {
  label: string;
  included: boolean;
  note?: string;
}

export interface LearnerPlanMeta {
  code: string;
  tier: LearnerPlanTier;
  badge?: string;
  tagline: string;
  /** Giá niêm yết tham chiếu (VND) — API là nguồn sự thật khi đã seed */
  listPriceVnd: number;
  durationLabel: string;
  scopeLabel: string;
  privileges: LearnerPlanPrivilege[];
  bestFor: string;
}

export const LEARNER_PLAN_META: Record<string, LearnerPlanMeta> = {
  "PLAN-SCENARIO-BEGINNER": {
    code: "PLAN-SCENARIO-BEGINNER",
    tier: 1,
    badge: "Gói 1 · Beginner",
    tagline: "Mua 1 kịch bản Beginner",
    listPriceVnd: 59_000,
    durationLabel: "60 ngày",
    scopeLabel: "1 Scenario Beginner",
    bestFor: "Luyện cơ bản với chi phí thấp",
    privileges: [
      { label: "Mở khóa 1 kịch bản Beginner", included: true },
      { label: "AI chấm (10 phiên)", included: true },
      { label: "Expert chấm hồ sơ", included: false, note: "Mua add-on" },
    ],
  },
  "PLAN-SCENARIO-INTERMEDIATE": {
    code: "PLAN-SCENARIO-INTERMEDIATE",
    tier: 1,
    badge: "Gói 1 · Intermediate",
    tagline: "Mua 1 kịch bản Intermediate",
    listPriceVnd: 99_000,
    durationLabel: "60 ngày",
    scopeLabel: "1 Scenario Intermediate",
    bestFor: "Case trung bình, đủ sâu để portfolio",
    privileges: [
      { label: "Mở khóa 1 kịch bản Intermediate", included: true },
      { label: "AI chấm (10 phiên)", included: true },
      { label: "Expert chấm hồ sơ", included: false, note: "Mua add-on" },
    ],
  },
  "PLAN-SCENARIO-ADVANCED": {
    code: "PLAN-SCENARIO-ADVANCED",
    tier: 1,
    badge: "Gói 1 · Advanced",
    tagline: "Mua 1 kịch bản Advanced",
    listPriceVnd: 149_000,
    durationLabel: "60 ngày",
    scopeLabel: "1 Scenario Advanced",
    bestFor: "Case nâng cao, biến cố phức tạp",
    privileges: [
      { label: "Mở khóa 1 kịch bản Advanced", included: true },
      { label: "AI chấm (10 phiên)", included: true },
      { label: "Expert chấm hồ sơ", included: false, note: "Mua add-on" },
    ],
  },
  "PLAN-APPLICATION": {
    code: "PLAN-APPLICATION",
    tier: 2,
    badge: "Gói 2",
    tagline: "Cả Application — tiết kiệm hơn mua lẻ",
    listPriceVnd: 449_000,
    durationLabel: "90 ngày",
    scopeLabel: "1 Application (mọi scenario bên trong)",
    bestFor: "Học sâu một sản phẩm/ứng dụng (4–5 scenario)",
    privileges: [
      { label: "Mọi scenario trong Application đã chọn", included: true },
      { label: "AI chấm toàn bộ scenario đã mở", included: true, note: "40 phiên" },
      { label: "Tặng 2 lượt Expert chấm", included: true, note: "Chọn scenario đáng chấm nhất" },
      { label: "Cố vấn 1-on-1", included: false },
    ],
  },
  "PLAN-INDUSTRY": {
    code: "PLAN-INDUSTRY",
    tier: 3,
    badge: "Gói 3 · Khuyên dùng",
    tagline: "Cả ngành — nhiều Application hơn, nhiều lượt Expert hơn",
    listPriceVnd: 799_000,
    durationLabel: "120 ngày",
    scopeLabel: "1 Industry (mọi Application/scenario)",
    bestFor: "Orient theo domain (Retail, FinTech, SCM…)",
    privileges: [
      { label: "Mọi Application & scenario trong Industry", included: true },
      { label: "AI chấm — không giới hạn phiên trong hạn gói", included: true },
      { label: "Tặng 4 lượt Expert chấm", included: true },
      { label: "Cố vấn 1-on-1", included: false },
    ],
  },
  "PLAN-ALL-ACCESS": {
    code: "PLAN-ALL-ACCESS",
    tier: 4,
    badge: "Gói 4 · All-access",
    tagline: "Toàn bộ catalog published của hệ thống",
    listPriceVnd: 1_490_000,
    durationLabel: "180 ngày",
    scopeLabel: "All scenarios",
    bestFor: "Learner nghiêm túc / portfolio đa ngành",
    privileges: [
      { label: "Mọi kịch bản published trên BA-VES", included: true },
      { label: "AI chấm — không giới hạn phiên trong hạn gói", included: true },
      { label: "Tặng 8 lượt Expert chấm", included: true },
      { label: "1 buổi cố vấn 1-on-1", included: true },
    ],
  },
  "PLAN-EXPERT-1": {
    code: "PLAN-EXPERT-1",
    tier: "addon",
    badge: "Add-on",
    tagline: "Bổ sung Expert khi Gói 1 (hoặc hết credit)",
    listPriceVnd: 89_000,
    durationLabel: "Không hết hạn credit",
    scopeLabel: "Không mở scenario mới",
    bestFor: "Cần đúng 1 lần chuyên gia chấm",
    privileges: [
      { label: "1 lượt Expert chấm hồ sơ BABOK", included: true },
      { label: "Mở thêm kịch bản", included: false },
    ],
  },
  "PLAN-EXPERT-3": {
    code: "PLAN-EXPERT-3",
    tier: "addon",
    badge: "Add-on · Tiết kiệm",
    tagline: "3 lượt Expert — rẻ hơn ~15% so với mua lẻ",
    listPriceVnd: 229_000,
    durationLabel: "Không hết hạn credit",
    scopeLabel: "Không mở scenario mới",
    bestFor: "Cần nhiều lần phản biện Expert",
    privileges: [
      { label: "3 lượt Expert chấm hồ sơ BABOK", included: true },
      { label: "Mở thêm kịch bản", included: false },
    ],
  },
};

export function getLearnerPlanMeta(code: string): LearnerPlanMeta | undefined {
  return LEARNER_PLAN_META[code];
}

export function formatVnd(amount: number): string {
  if (amount === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}
