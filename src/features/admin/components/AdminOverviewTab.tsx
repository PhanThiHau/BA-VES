import {
  ArrowRight,
  Award,
  Building2,
  Cpu,
  Layers3,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import type { UserProfile } from "../../../services/authService";
import type { IndustryItem, ApplicationItem, ScenarioItem } from "../../../services/catalogService";
import type { BabokTaskDto } from "../../../services/assessmentService";
import type { CohortSummaryDto } from "../../../services/cohortService";
import type { AuditLogItem } from "../adminData";
import {
  isAdminRole,
  isExpertRole,
  isInstructorRole,
  isLearnerRole,
} from "../../../utils/roles";

interface AdminOverviewTabProps {
  users: UserProfile[];
  industries: IndustryItem[];
  applications: ApplicationItem[];
  scenarios: ScenarioItem[];
  babokTasks: BabokTaskDto[];
  cohorts: CohortSummaryDto[];
  auditLogs: AuditLogItem[];
  healthStatus: { healthy: boolean; latencyMs: number | null };
  aiConfigured: boolean;
  aiProvider?: string | null;
  aiModel?: string | null;
  onSelectTab: (tabId: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export function AdminOverviewTab({
  users,
  industries,
  applications,
  scenarios,
  babokTasks,
  cohorts,
  auditLogs,
  healthStatus,
  aiConfigured,
  aiProvider,
  aiModel,
  onSelectTab,
  onRefresh,
  refreshing = false,
}: AdminOverviewTabProps) {
  const learnerCount = users.filter((u) => isLearnerRole(u.roles)).length;
  const instructorCount = users.filter((u) => isInstructorRole(u.roles)).length;
  const expertCount = users.filter((u) => isExpertRole(u.roles)).length;
  const adminCount = users.filter((u) => isAdminRole(u.roles)).length;
  const suspendedCount = users.filter((u) => u.status?.toLowerCase() === "suspended").length;
  const publishedScenarios = scenarios.filter((s) => s.hasPublishedVersion).length;
  const draftScenarios = scenarios.length - publishedScenarios;
  const activeCohorts = cohorts.filter(
    (c) => c.status === "Active" || c.status === 1 || String(c.status).toLowerCase() === "active"
  ).length;
  const pendingJoins = cohorts.reduce((acc, c) => acc + (c.pendingRequestCount || 0), 0);

  const babokAreas = new Set(babokTasks.map((t) => t.knowledgeAreaCode).filter(Boolean)).size;

  const attentionItems = [
    !healthStatus.healthy
      ? { label: "API /health không phản hồi", action: () => onRefresh(), tone: "rose" as const }
      : null,
    suspendedCount > 0
      ? {
          label: `${suspendedCount} tài khoản đang bị khóa`,
          action: () => onSelectTab("users"),
          tone: "amber" as const,
        }
      : null,
    draftScenarios > 0
      ? {
          label: `${draftScenarios} kịch bản chưa xuất bản`,
          action: () => onSelectTab("domains"),
          tone: "brass" as const,
        }
      : null,
    !aiConfigured
      ? {
          label: "Chưa cấu hình kết nối AI (BYOK)",
          action: () => onSelectTab("ai"),
          tone: "sky" as const,
        }
      : null,
    pendingJoins > 0
      ? {
          label: `${pendingJoins} yêu cầu vào lớp chờ duyệt`,
          action: () => onSelectTab("users"),
          tone: "sky" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    action: () => void;
    tone: "rose" | "amber" | "brass" | "sky";
  }>;

  const priorityTone: Record<string, string> = {
    rose: "border-rose-300/40 bg-rose-400/10 hover:bg-rose-400/15",
    amber: "border-amber-300/40 bg-amber-400/10 hover:bg-amber-400/15",
    brass: "border-brass/40 bg-brass/15 hover:bg-brass/20",
    sky: "border-sky-300/40 bg-sky-400/10 hover:bg-sky-400/15",
  };

  const kpis = [
    {
      label: "Người dùng",
      value: users.length,
      meta: `${learnerCount} HV · ${instructorCount} GV · ${expertCount} CG`,
      icon: Users,
      iconTone: "bg-sky-100 text-sky-800",
      cardTone: "border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-white to-white",
      accent: "bg-sky-500",
      go: "users",
      delay: "reveal-delay-1",
    },
    {
      label: "Catalog",
      value: scenarios.length,
      meta: `${industries.length} ngành · ${applications.length} ứng dụng`,
      icon: Building2,
      iconTone: "bg-brass/15 text-brass",
      cardTone: "border-brass/25 bg-gradient-to-br from-[#fbf6ec] via-white to-white",
      accent: "bg-brass",
      go: "domains",
      delay: "reveal-delay-2",
    },
    {
      label: "BABOK",
      value: babokTasks.length,
      meta: `${babokAreas} vùng tri thức`,
      icon: Award,
      iconTone: "bg-amber-100 text-amber-900",
      cardTone: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-white",
      accent: "bg-amber-500",
      go: "babok",
      delay: "reveal-delay-3",
    },
    {
      label: "Lớp học",
      value: cohorts.length,
      meta: `${activeCohorts} đang mở`,
      icon: Layers3,
      iconTone: "bg-navy/10 text-navy",
      cardTone: "border-navy/15 bg-gradient-to-br from-mist/70 via-white to-white",
      accent: "bg-navy",
      go: "users",
      delay: "reveal-delay-4",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Command hero */}
      <section className="reveal-up overflow-hidden rounded-2xl border border-navy/10 bg-navy text-white shadow-[0_12px_40px_rgba(16,42,67,0.18)]">
        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.9fr]">
          <div className="relative p-6 sm:p-7">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse at 12% 18%, rgba(183,121,31,0.32), transparent 48%), radial-gradient(ellipse at 88% 85%, rgba(45,123,96,0.22), transparent 42%), linear-gradient(135deg, rgba(16,42,67,0.25), transparent 55%)",
              }}
            />
            <div className="animate-glow-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                Điều hành nền tảng
              </div>

              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight sm:text-[1.75rem]">
                {attentionItems.length > 0
                  ? `${attentionItems.length} điểm cần chú ý`
                  : "Hệ thống đang ổn định"}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                {attentionItems.length > 0
                  ? "Ưu tiên sức khỏe dịch vụ, tài khoản và catalog trước khi mở thêm vận hành."
                  : "API trực tuyến, catalog và phân quyền đang trong trạng thái sẵn sàng."}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                    healthStatus.healthy
                      ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                      : "border-rose-300/40 bg-rose-400/15 text-rose-100"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      healthStatus.healthy ? "instructor-live-dot bg-emerald-300" : "bg-rose-300"
                    }`}
                  />
                  {healthStatus.healthy ? "API trực tuyến" : "API mất kết nối"}
                  {healthStatus.latencyMs != null ? ` · ${healthStatus.latencyMs}ms` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80">
                  {adminCount} admin · {publishedScenarios}/{scenarios.length} kịch bản xuất bản
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  onClick={() => onSelectTab(attentionItems[0] ? "users" : "domains")}
                  className="h-9 gap-1.5 bg-brass px-3 text-xs font-bold text-navy shadow-sm transition hover:bg-brass-light hover:shadow-md"
                >
                  <Users size={14} />
                  {suspendedCount > 0 ? `Xử lý tài khoản (${suspendedCount})` : "Quản lý tài khoản"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onSelectTab("authoring")}
                  className="h-9 gap-1.5 border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/18"
                >
                  <Building2 size={14} /> Soạn kịch bản
                </Button>
                <Button
                  variant="secondary"
                  onClick={onRefresh}
                  className="h-9 gap-1.5 border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/18"
                >
                  <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Làm mới
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
                    className={`reveal-up flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${priorityTone[item.tone]} ${
                      idx === 0 ? "reveal-delay-1" : idx === 1 ? "reveal-delay-2" : "reveal-delay-3"
                    }`}
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

      {/* KPI strip */}
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

      {/* Ops panels */}
      <section className="reveal-up reveal-delay-2 grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden border-navy/15 p-0 shadow-[0_8px_24px_rgba(16,42,67,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-gradient-to-r from-mist/80 to-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy/10 text-navy">
                <Server size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">Sức khỏe nền tảng</h3>
                <p className="text-[11px] text-slate">API, catalog và khung đánh giá</p>
              </div>
            </div>
            <Badge tone={healthStatus.healthy ? "green" : "red"}>
              {healthStatus.healthy ? "Ổn định" : "Cảnh báo"}
            </Badge>
          </div>

          <div className="space-y-2.5 p-5">
            <div className="flex items-center justify-between rounded-xl border border-navy/10 bg-white px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    healthStatus.healthy ? "instructor-live-dot bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="text-xs font-semibold text-navy">BAVES Core API</span>
              </div>
              <span className="font-mono text-[11px] text-slate">
                {healthStatus.latencyMs != null ? `${healthStatus.latencyMs}ms` : "—"}
              </span>
            </div>

            {[
              { label: "Người dùng", value: `${users.length} tài khoản`, go: "users" },
              {
                label: "Ngành / Ứng dụng",
                value: `${industries.length} / ${applications.length}`,
                go: "domains",
              },
              { label: "Kịch bản", value: `${publishedScenarios} xuất bản`, go: "domains" },
              { label: "BABOK tasks", value: `${babokTasks.length} tác vụ`, go: "babok" },
            ].map((row) => (
              <button
                key={row.label}
                type="button"
                onClick={() => onSelectTab(row.go)}
                className="instructor-queue-row flex w-full items-center justify-between rounded-xl border border-navy/8 bg-white/80 px-3.5 py-3 text-left"
              >
                <span className="text-xs font-semibold text-navy">{row.label}</span>
                <span className="font-mono text-[11px] font-bold text-slate">{row.value}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden border-brass/25 p-0 shadow-[0_8px_24px_rgba(183,121,31,0.06)]">
          <div className="flex items-center justify-between gap-3 border-b border-brass/20 bg-gradient-to-r from-[#fbf6ec] to-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass/15 text-brass">
                <Building2 size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">Catalog kịch bản</h3>
                <p className="text-[11px] text-brass/80">{scenarios.length} kịch bản trong hệ thống</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("domains")}
              className="h-8 gap-1 border-brass/30 bg-white px-2.5 text-[11px] font-bold text-brass hover:bg-[#fbf6ec]"
            >
              Mở <ArrowRight size={12} />
            </Button>
          </div>

          <div className="divide-y divide-brass/10">
            {scenarios.length > 0 ? (
              scenarios.slice(0, 5).map((sc) => (
                <div key={sc.id} className="instructor-queue-row flex items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-brass/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brass">
                        {sc.code}
                      </span>
                      <Badge tone={sc.hasPublishedVersion ? "green" : "amber"}>
                        {sc.hasPublishedVersion ? "Xuất bản" : "Nháp"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs font-bold text-navy">{sc.title}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate">
                      {sc.application?.name || "Chưa gắn ứng dụng"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-xs font-semibold text-navy">Chưa có kịch bản</p>
                <p className="mt-1 text-[11px] text-slate">Catalog đang trống.</p>
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="reveal-up reveal-delay-3 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden border-sky-200/70 p-0 shadow-[0_8px_24px_rgba(3,105,161,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-100 text-sky-800">
                <Cpu size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">Kết nối AI</h3>
                <p className="text-[11px] text-sky-900/70">BYOK cho đánh giá & mô phỏng</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("ai")}
              className="h-8 gap-1 border-sky-200 bg-white px-2.5 text-[11px] font-bold text-sky-900 hover:bg-sky-50"
            >
              Cấu hình <ArrowRight size={12} />
            </Button>
          </div>
          <div className="space-y-3 p-5">
            <div className="rounded-xl border border-sky-100 bg-white/80 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-navy">Trạng thái</span>
                <Badge tone={aiConfigured ? "green" : "amber"}>
                  {aiConfigured ? "Đã cấu hình" : "Chưa cấu hình"}
                </Badge>
              </div>
              <p className="mt-2 text-[11px] text-slate">
                Provider: <strong className="text-navy">{aiProvider || "—"}</strong>
                {" · "}
                Model: <strong className="text-navy">{aiModel || "—"}</strong>
              </p>
            </div>
            <p className="text-[11px] leading-5 text-slate">
              Admin cấu hình khóa API dùng chung hoặc hướng dẫn giảng viên dùng BYOK riêng theo phiên.
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden border-navy/15 p-0 shadow-[0_8px_24px_rgba(16,42,67,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-navy/10 bg-gradient-to-r from-mist/70 to-white px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy/10 text-navy">
                <ShieldCheck size={15} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">Nhật ký phiên</h3>
                <p className="text-[11px] text-slate">{auditLogs.length} thao tác trong phiên này</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => onSelectTab("audit")}
              className="h-8 gap-1 border-navy/20 bg-white px-2.5 text-[11px] font-bold text-navy hover:bg-mist/50"
            >
              Xem tất cả <ArrowRight size={12} />
            </Button>
          </div>

          <div className="divide-y divide-navy/8">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="instructor-queue-row px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-xs font-bold text-navy">{log.action}</strong>
                    <span className="font-mono text-[10px] text-slate">{log.timestamp}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate">
                    <span className="font-semibold text-navy">{log.actor}</span> → {log.target}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-xs font-semibold text-navy">Chưa có thao tác</p>
                <p className="mt-1 text-[11px] text-slate">
                  Thay đổi quyền / khóa tài khoản sẽ hiện tại đây.
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
