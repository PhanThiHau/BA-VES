import {
  ArrowRight,
  Award,
  CalendarCheck2,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface ExpertOverviewTabProps {
  pendingReviews: number;
  completedReviews: number;
  activeBookings: number;
  pendingScenarioApprovals: number;
  rubricCount: number;
  babokTaskCount: number;
  onSelectTab: (tabId: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function ExpertOverviewTab({
  pendingReviews,
  completedReviews,
  activeBookings,
  pendingScenarioApprovals,
  rubricCount,
  babokTaskCount,
  onSelectTab,
  onRefresh,
  refreshing = false,
}: ExpertOverviewTabProps) {
  const attentionItems = [
    pendingScenarioApprovals > 0
      ? {
          label: `${pendingScenarioApprovals} kịch bản chờ duyệt`,
          go: "approvals",
          tone: "brass" as const,
        }
      : null,
    pendingReviews > 0
      ? {
          label: `${pendingReviews} hồ sơ chờ chấm`,
          go: "reviews",
          tone: "amber" as const,
        }
      : null,
    activeBookings > 0
      ? {
          label: `${activeBookings} lịch hẹn đang mở`,
          go: "bookings",
          tone: "sky" as const,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; go: string; tone: "brass" | "amber" | "sky" }>;

  const priorityTone: Record<string, string> = {
    brass: "border-brass/40 bg-brass/15 hover:bg-brass/20",
    amber: "border-amber-300/40 bg-amber-400/10 hover:bg-amber-400/15",
    sky: "border-sky-300/40 bg-sky-400/10 hover:bg-sky-400/15",
  };

  const kpis = [
    {
      label: "Duyệt kịch bản",
      value: pendingScenarioApprovals,
      meta: "Đang chờ duyệt",
      icon: ShieldCheck,
      iconTone: "bg-brass/15 text-brass",
      cardTone: "border-brass/25 bg-gradient-to-br from-[#fbf6ec] via-white to-white",
      accent: "bg-brass",
      go: "approvals",
    },
    {
      label: "Chấm hồ sơ",
      value: pendingReviews,
      meta: `${completedReviews} đã xong`,
      icon: FileCheck2,
      iconTone: "bg-amber-100 text-amber-900",
      cardTone: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-white",
      accent: "bg-amber-500",
      go: "reviews",
    },
    {
      label: "Lịch hẹn",
      value: activeBookings,
      meta: "Đang mở / đang họp",
      icon: CalendarCheck2,
      iconTone: "bg-sky-100 text-sky-800",
      cardTone: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-white",
      accent: "bg-sky-500",
      go: "bookings",
    },
    {
      label: "Tiêu chí chấm",
      value: rubricCount,
      meta: `${babokTaskCount} task BABOK`,
      icon: Award,
      iconTone: "bg-navy/10 text-navy",
      cardTone: "border-navy/15 bg-gradient-to-br from-mist/70 via-white to-white",
      accent: "bg-navy",
      go: "rubrics",
    },
  ];

  return (
    <div className="space-y-5">
      <section className="reveal-up overflow-hidden rounded-2xl border border-navy/10 bg-navy text-white shadow-[0_12px_40px_rgba(16,42,67,0.18)]">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="relative p-6 sm:p-7">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at 12% 18%, rgba(183,121,31,0.32), transparent 48%), radial-gradient(ellipse at 88% 85%, rgba(45,123,96,0.18), transparent 42%), linear-gradient(135deg, rgba(16,42,67,0.25), transparent 55%)",
              }}
            />
            <div className="animate-glow-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                Chuyên gia
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                {attentionItems.length > 0
                  ? `${attentionItems.length} việc cần làm`
                  : "Không còn việc tồn"}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Duyệt kịch bản, chấm hồ sơ và gặp học viên — chọn mục bên trái để bắt đầu.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() => onSelectTab(attentionItems[0]?.go || "approvals")}
                  className="h-9 gap-1.5 bg-brass px-3 text-xs font-bold text-navy shadow-sm hover:bg-brass-light"
                >
                  <ShieldCheck size={14} />
                  {pendingScenarioApprovals > 0
                    ? `Duyệt (${pendingScenarioApprovals})`
                    : pendingReviews > 0
                      ? `Chấm hồ sơ (${pendingReviews})`
                      : "Đi duyệt"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onRefresh}
                  className="h-9 gap-1.5 border-white/20 bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/18"
                >
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Làm mới
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-gradient-to-b from-navy-deep/50 to-navy-deep/70 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-light/90">
              Việc ưu tiên
            </p>
            <div className="mt-3 space-y-2">
              {attentionItems.length > 0 ? (
                attentionItems.map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onSelectTab(item.go)}
                    className={`reveal-up flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${priorityTone[item.tone]} ${
                      idx === 0 ? "reveal-delay-1" : "reveal-delay-2"
                    }`}
                  >
                    <span className="text-xs font-semibold text-white">{item.label}</span>
                    <ArrowRight size={14} className="shrink-0 text-brass-light" />
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-emerald-300/30 bg-emerald-400/5 px-3 py-8 text-center text-xs text-emerald-100/80">
                  Không còn việc tồn
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, meta, icon: Icon, iconTone, cardTone, accent, go }, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => onSelectTab(go)}
            className={`instructor-kpi-card reveal-up group relative overflow-hidden rounded-2xl border p-4 text-left ${cardTone} reveal-delay-${Math.min(idx + 1, 4)}`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
            <div className="flex items-start justify-between gap-3 pl-1.5">
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${iconTone}`}>
                <Icon size={17} />
              </span>
              <ArrowRight
                size={14}
                className="mt-1 text-slate/30 transition group-hover:translate-x-0.5 group-hover:text-navy"
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
        <Card className="overflow-hidden border-navy/15 p-0 shadow-[0_8px_24px_rgba(16,42,67,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-gradient-to-r from-mist/80 to-white px-5 py-3.5">
            <div>
              <h3 className="text-sm font-bold text-navy">Chức năng</h3>
              <p className="text-[11px] text-slate">Giống menu bên trái</p>
            </div>
            <Badge tone="navy">Expert</Badge>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2">
            {[
              { go: "approvals", label: "Duyệt kịch bản", desc: "Duyệt hoặc từ chối đề bài", icon: ShieldCheck },
              { go: "reviews", label: "Chấm hồ sơ", desc: "Chấm điểm bài nộp", icon: FileCheck2 },
              { go: "bookings", label: "Lịch hẹn", desc: "Nhắn tin với học viên", icon: CalendarCheck2 },
              { go: "rubrics", label: "Tiêu chí chấm", desc: "Rubric & task BABOK", icon: Award },
            ].map(({ go, label, desc, icon: Icon }) => (
              <button
                key={go}
                type="button"
                onClick={() => onSelectTab(go)}
                className="instructor-queue-row flex items-start gap-3 rounded-xl border border-navy/8 bg-white px-3.5 py-3 text-left hover:border-brass/35"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy/8 text-navy">
                  <Icon size={15} />
                </span>
                <span>
                  <span className="block text-xs font-bold text-navy">{label}</span>
                  <span className="mt-0.5 block text-[11px] text-slate">{desc}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden border-brass/25 p-0 shadow-[0_8px_24px_rgba(16,42,67,0.05)]">
          <div className="border-b border-brass/20 bg-gradient-to-r from-[#fbf6ec] to-white px-5 py-3.5">
            <h3 className="text-sm font-bold text-navy">Gợi ý</h3>
            <p className="text-[11px] text-slate">Thứ tự làm việc gợi ý</p>
          </div>
          <ol className="space-y-2.5 p-5 text-xs leading-5 text-slate">
            <li>
              <strong className="text-navy">1.</strong> Duyệt kịch bản đang chờ.
            </li>
            <li>
              <strong className="text-navy">2.</strong> Chấm hồ sơ học viên nộp.
            </li>
            <li>
              <strong className="text-navy">3.</strong> Vào lịch hẹn khi học viên đã đặt.
            </li>
            <li>
              <strong className="text-navy">4.</strong> Xem tiêu chí chấm khi cần đối chiếu điểm.
            </li>
          </ol>
        </Card>
      </section>
    </div>
  );
}
