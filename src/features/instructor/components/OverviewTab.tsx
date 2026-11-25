import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  Layers3,
  Users,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { cohortService } from "../../../services/cohortService";
import type {
  ReviewItem,
  ScenarioVersion,
  CohortItem,
  AssignmentItem,
} from "../instructorData";

interface OverviewTabProps {
  scenarios: ScenarioVersion[];
  reviewItems: ReviewItem[];
  cohorts?: CohortItem[];
  assignments?: AssignmentItem[];
  onSelectTab: (tabId: string) => void;
  onQuickReview: (item: ReviewItem) => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export function OverviewTab({
  scenarios,
  reviewItems,
  cohorts = [],
  assignments = [],
  onSelectTab,
  onQuickReview,
}: OverviewTabProps) {
  const [cohortAvgScore, setCohortAvgScore] = useState<number | null>(null);
  const [cohortSubmissionRate, setCohortSubmissionRate] = useState<number | null>(null);

  const pendingReviews = reviewItems.filter((i) => i.status === "pending");
  const calibratedCount = reviewItems.filter((i) => i.status === "calibrated").length;
  const totalStudents = cohorts.reduce((acc, c) => acc + (c.studentsCount || 0), 0);
  const activeCohorts = cohorts.filter((c) => c.status === "active");
  const pendingJoins = cohorts.reduce((acc, c) => acc + (c.pendingRequestCount || 0), 0);
  const publishedCount = scenarios.filter((s) => s.status === "Đã ban hành").length;
  const waitingPublish = scenarios.filter((s) => s.status === "Chờ duyệt" || s.status === "Bản nháp").length;
  const activeAssignments = assignments.filter((a) => a.status === "active");

  useEffect(() => {
    const first = activeCohorts[0];
    if (!first) {
      setCohortAvgScore(null);
      setCohortSubmissionRate(null);
      return;
    }
    const cohortId = parseInt(String(first.id).replace(/\D/g, ""), 10);
    if (!cohortId) return;

    let cancelled = false;
    cohortService
      .getCohortAnalytics(cohortId)
      .then((data) => {
        if (cancelled || !data) return;
        const learners = data.learnerSummaries || [];
        const scored = learners
          .map((l) => l.averageFinalScore ?? l.averageAiScore)
          .filter((v): v is number => v != null);
        setCohortAvgScore(
          scored.length > 0 ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null
        );
        const withSub = learners.filter((l) => (l.submissionsCount || 0) > 0).length;
        setCohortSubmissionRate(
          learners.length > 0 ? Math.round((withSub / learners.length) * 100) : null
        );
      })
      .catch(() => {
        if (!cancelled) {
          setCohortAvgScore(null);
          setCohortSubmissionRate(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCohorts[0]?.id]);

  const attentionItems = [
    pendingReviews.length > 0
      ? { label: `${pendingReviews.length} bài chờ chấm`, action: () => onSelectTab("review"), tone: "amber" }
      : null,
    pendingJoins > 0
      ? { label: `${pendingJoins} xin vào lớp`, action: () => onSelectTab("cohorts"), tone: "sky" }
      : null,
    waitingPublish > 0
      ? { label: `${waitingPublish} kịch bản chưa ban hành`, action: () => onSelectTab("authoring"), tone: "brass" }
      : null,
    activeAssignments.length > 0
      ? { label: `${activeAssignments.length} bài đang giao`, action: () => onSelectTab("cohorts"), tone: "sky" }
      : null,
  ].filter(Boolean) as Array<{ label: string; action: () => void; tone: string }>;

  const kpis = [
    {
      label: "Học viên",
      value: totalStudents,
      meta:
        cohortSubmissionRate != null
          ? `${cohortSubmissionRate}% đã nộp · ${activeCohorts.length} lớp`
          : `${activeCohorts.length} lớp mở`,
      icon: Users,
      iconTone: "bg-sky-100 text-sky-800",
      cardTone: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-white",
      accent: "bg-sky-500",
      go: "cohorts" as const,
      delay: "reveal-delay-1",
    },
    {
      label: "Chờ chấm",
      value: pendingReviews.length,
      meta: calibratedCount > 0 ? `${calibratedCount} đã chốt` : "Hàng đợi trống",
      icon: ClipboardCheck,
      iconTone: "bg-amber-100 text-amber-900",
      cardTone: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-white",
      accent: "bg-amber-500",
      go: "review" as const,
      delay: "reveal-delay-2",
    },
    {
      label: "Kịch bản",
      value: scenarios.length,
      meta: `${publishedCount} đã ban hành`,
      icon: Layers3,
      iconTone: "bg-brass/15 text-brass",
      cardTone: "border-brass/25 bg-gradient-to-br from-[#fbf6ec] via-white to-white",
      accent: "bg-brass",
      go: "authoring" as const,
      delay: "reveal-delay-3",
    },
    {
      label: cohortAvgScore != null ? "Điểm TB lớp" : "Bài giao",
      value: cohortAvgScore != null ? cohortAvgScore : activeAssignments.length,
      meta:
        cohortAvgScore != null
          ? `${activeAssignments.length} bài đang giao`
          : `${assignments.length} tổng cộng`,
      icon: ClipboardCheck,
      iconTone: "bg-navy/10 text-navy",
      cardTone: "border-navy/15 bg-gradient-to-br from-mist/70 via-white to-white",
      accent: "bg-navy",
      go: (cohortAvgScore != null ? ("analytics" as const) : ("cohorts" as const)),
      delay: "reveal-delay-4",
    },
  ];

  const priorityTone: Record<string, string> = {
    amber: "border-amber-300/40 bg-amber-400/10 hover:bg-amber-400/15",
    sky: "border-sky-300/40 bg-sky-400/10 hover:bg-sky-400/15",
    brass: "border-brass/40 bg-brass/15 hover:bg-brass/20",
  };

  const cohortsNeedingJoin = activeCohorts.filter((c) => (c.pendingRequestCount || 0) > 0);

  return (
    <div className="space-y-5">
      <section className="reveal-up overflow-hidden rounded-2xl border border-navy/10 bg-navy text-white shadow-[0_12px_40px_rgba(16,42,67,0.18)]">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="relative p-6 sm:p-7">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at 10% 15%, rgba(183,121,31,0.35), transparent 46%), radial-gradient(ellipse at 85% 90%, rgba(56,189,248,0.18), transparent 40%), linear-gradient(135deg, rgba(16,42,67,0.2), transparent 55%)",
              }}
            />
            <div className="animate-glow-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                Bảng điều hành
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                {attentionItems.length > 0
                  ? `${attentionItems.length} việc cần xử lý`
                  : "Hệ thống đang ổn định"}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                {attentionItems.length > 0
                  ? "Ưu tiên chấm bài, duyệt lớp và hoàn thiện kịch bản trước khi giao thêm."
                  : "Không có hàng đợi tồn. Có thể tạo kịch bản mới hoặc giao bài cho lớp."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() => onSelectTab(pendingReviews.length ? "review" : "cohorts")}
                  className="h-9 gap-1.5 bg-brass px-3 text-xs font-bold text-navy shadow-sm transition hover:bg-brass-light hover:shadow-md"
                >
                  {pendingReviews.length > 0 ? (
                    <>
                      <ClipboardCheck size={14} /> Chấm bài ({pendingReviews.length})
                    </>
                  ) : (
                    <>
                      <Users size={14} /> Quản lý lớp
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onSelectTab("cohorts")}
                  className="h-9 gap-1.5 border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/18"
                >
                  <Users size={14} /> Giao bài
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onSelectTab("authoring")}
                  className="h-9 gap-1.5 border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/18"
                >
                  <Layers3 size={14} /> Kịch bản mô phỏng
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-gradient-to-b from-navy-deep/50 to-navy-deep/70 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-light/90">
              Ưu tiên hôm nay
            </p>
            <div className="mt-3 space-y-2">
              {attentionItems.length > 0 ? (
                attentionItems.slice(0, 4).map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    className={`reveal-up flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${priorityTone[item.tone]} ${idx === 0 ? "reveal-delay-1" : idx === 1 ? "reveal-delay-2" : "reveal-delay-3"}`}
                  >
                    <span className="text-xs font-semibold text-white">{item.label}</span>
                    <ArrowRight size={14} className="shrink-0 text-brass-light" />
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-emerald-300/30 bg-emerald-400/5 px-3 py-8 text-center text-xs text-emerald-100/80">
                  Không có việc tồn đọng
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, meta, icon: Icon, iconTone, cardTone, accent, go, delay }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelectTab(go)}
            className={`instructor-kpi-card reveal-up group relative overflow-hidden rounded-2xl border p-4 text-left ${cardTone} ${delay}`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
            <div className="flex items-start justify-between gap-3 pl-1.5">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${iconTone}`}>
                <Icon size={17} />
              </span>
              <ArrowRight
                size={14}
                className="mt-1 text-slate/30 transition duration-200 group-hover:translate-x-0.5 group-hover:text-navy"
              />
            </div>
            <strong className="mt-3 block pl-1.5 font-display font-mono text-3xl font-extrabold tracking-tight text-navy">
              {value}
            </strong>
            <span className="mt-1 block pl-1.5 text-xs font-bold text-navy">{label}</span>
            <span className="mt-0.5 block pl-1.5 text-[11px] text-slate">{meta}</span>
          </button>
        ))}
      </section>

      <section className="reveal-up reveal-delay-2 grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden border-amber-200/70 p-0 shadow-[0_8px_24px_rgba(146,64,14,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
                <ClipboardCheck size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">Hàng đợi chấm</h3>
                <p className="text-[11px] text-amber-900/70">{pendingReviews.length} bài chờ duyệt</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("review")}
              className="h-8 gap-1 border-amber-200 bg-white px-2.5 text-[11px] font-bold text-amber-900 hover:bg-amber-50"
            >
              Mở <ArrowRight size={12} />
            </Button>
          </div>

          <div className="divide-y divide-amber-100/80">
            {pendingReviews.length > 0 ? (
              pendingReviews.slice(0, 5).map((item) => (
                <div key={item.id} className="instructor-queue-row flex items-center gap-3 px-5 py-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-900">
                    {initials(item.learner)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-xs font-bold text-navy">{item.learner}</strong>
                      <Badge tone={item.tone === "red" ? "red" : "amber"}>
                        {item.tone === "red" ? "Ưu tiên" : "Chờ"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate">{item.scenarioTitle}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate/80">
                      AI {item.aiScore}/100 · hạn {item.due}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onQuickReview(item);
                      onSelectTab("review");
                    }}
                    className="h-8 shrink-0 bg-amber-700 px-3 text-[11px] font-bold text-white hover:bg-amber-800"
                  >
                    Chấm
                  </Button>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-xs font-semibold text-navy">Không còn bài chờ</p>
                <p className="mt-1 text-[11px] text-slate">Hàng đợi chấm đang trống.</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden border-sky-200/70 p-0 shadow-[0_8px_24px_rgba(3,105,161,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-sky-800">
                <Users size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">Xin vào lớp</h3>
                <p className="text-[11px] text-sky-900/70">{pendingJoins} yêu cầu chờ duyệt</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("cohorts")}
              className="h-8 gap-1 border-sky-200 bg-white px-2.5 text-[11px] font-bold text-sky-900 hover:bg-sky-50"
            >
              Quản lý <ArrowRight size={12} />
            </Button>
          </div>

          <div className="divide-y divide-sky-100/80">
            {cohortsNeedingJoin.length > 0 ? (
              cohortsNeedingJoin.slice(0, 5).map((coh) => (
                <div key={coh.id} className="instructor-queue-row flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <strong className="block truncate text-xs font-bold text-navy">{coh.name}</strong>
                    <p className="mt-0.5 text-[11px] text-slate">
                      {coh.code} · {coh.studentsCount} HV
                    </p>
                  </div>
                  <Badge tone="amber">{coh.pendingRequestCount} chờ</Badge>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-xs font-semibold text-navy">Không có yêu cầu chờ</p>
                <p className="mt-1 text-[11px] text-slate">Các lớp đang ổn định.</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="reveal-up reveal-delay-3 grid gap-4 lg:grid-cols-2">
        <Card className="border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-white to-white p-5 shadow-[0_8px_24px_rgba(3,105,161,0.05)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-sky-800">
                <Users size={15} />
              </span>
              <h3 className="text-sm font-bold text-navy">Lớp học</h3>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("cohorts")}
              className="h-8 gap-1 border-sky-200 bg-white px-2.5 text-[11px] font-bold text-sky-900 hover:bg-sky-50"
            >
              Quản lý <ArrowRight size={12} />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {activeCohorts.length > 0 ? (
              activeCohorts.slice(0, 4).map((coh) => (
                <div
                  key={coh.id}
                  className="instructor-queue-row flex items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white/80 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-xs font-bold text-navy">{coh.name}</strong>
                    <span className="text-[11px] text-slate">
                      {coh.studentsCount} HV · {coh.activeAssignmentsCount} bài giao
                    </span>
                  </div>
                  {(coh.pendingRequestCount || 0) > 0 ? (
                    <Badge tone="amber">{coh.pendingRequestCount} chờ</Badge>
                  ) : (
                    <Badge tone="green">Ổn định</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate">Chưa có lớp đang mở.</p>
            )}
          </div>
        </Card>

        <Card className="border-brass/25 bg-gradient-to-br from-[#fbf6ec] via-white to-white p-5 shadow-[0_8px_24px_rgba(183,121,31,0.06)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass/15 text-brass">
                <Layers3 size={15} />
              </span>
              <h3 className="text-sm font-bold text-navy">Kịch bản gần đây</h3>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("authoring")}
              className="h-8 gap-1 border-brass/30 bg-white px-2.5 text-[11px] font-bold text-brass hover:bg-[#fbf6ec]"
            >
              Xem tất cả <ArrowRight size={12} />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {scenarios.length > 0 ? (
              scenarios.slice(0, 4).map((sc) => (
                <div
                  key={sc.id}
                  className="instructor-queue-row flex items-center justify-between gap-3 rounded-xl border border-brass/15 bg-white/80 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-xs font-bold text-navy">{sc.scenarioTitle}</strong>
                    <span className="text-[11px] text-slate">
                      {sc.versionNumber} · {sc.domain} · {sc.stakeholdersCount} AI
                    </span>
                  </div>
                  <Badge tone={sc.status === "Đã ban hành" ? "green" : "amber"}>{sc.status}</Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate">Chưa có kịch bản trong kho.</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
