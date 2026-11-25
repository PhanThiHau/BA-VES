import {
  AppWindow,
  Award,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarCheck2,
  ClipboardCheck,
  CreditCard,
  FileStack,
  FileText,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  MessageSquareText,
  SearchCheck,
  Settings,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import type { AppRole, RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const roleConfig: Record<
  AppRole,
  {
    badge: string;
    subtitle: string;
    badgeClass: string;
    icon: typeof GraduationCap;
  }
> = {
  learner: {
    badge: "Học viên",
    subtitle: "Không gian Học viên",
    badgeClass: "bg-blue-50 text-blue-800 border border-blue-200",
    icon: GraduationCap,
  },
  instructor: {
    badge: "Giảng viên",
    subtitle: "Không gian Giảng viên",
    badgeClass: "bg-amber-100 text-amber-900 font-bold border border-amber-300",
    icon: ShieldCheck,
  },
  admin: {
    badge: "Quản trị",
    subtitle: "Không gian Quản trị",
    badgeClass: "bg-purple-100 text-purple-800 font-bold border border-purple-300",
    icon: ShieldAlert,
  },
  expert: {
    badge: "Chuyên gia",
    subtitle: "Hội đồng & Cố vấn",
    badgeClass: "bg-[#fbf6ec] text-navy font-bold border border-brass/40",
    icon: Award,
  },
};

const learnerItems: Array<{
  route: RouteKey;
  label: string;
  icon: typeof LayoutDashboard;
  isMatch?: (active: RouteKey) => boolean;
}> = [
  { route: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  {
    route: "applications",
    label: "Ngành",
    icon: Building2,
    isMatch: (active) => active === "applications" || active === "scenarios",
  },
  { route: "cohorts", label: "Lớp học & Giảng viên", icon: Users },
  { route: "progress", label: "Hồ sơ", icon: BarChart3 },
  { route: "booking", label: "Đặt lịch", icon: CalendarCheck2 },
  { route: "payment", label: "Gói mô phỏng", icon: CreditCard },
];

const instructorMenuItems: Array<{
  tab: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeTone?: "green" | "amber";
}> = [
  { tab: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { tab: "authoring", label: "Kịch bản mô phỏng", icon: Layers3 },
  { tab: "review", label: "Chấm bài", icon: ClipboardCheck },
  { tab: "cohorts", label: "Lớp học", icon: Users },
  { tab: "analytics", label: "Bảng điểm", icon: BarChart3 },
];

const adminMenuItems: Array<{
  tab: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeTone?: "green" | "amber";
}> = [
  { tab: "overview", label: "Tổng quan hệ thống", icon: LayoutDashboard },
  { tab: "authoring", label: "Kịch bản hệ thống", icon: Layers3 },
  { tab: "users", label: "Tài khoản & Phân quyền", icon: Users },
  { tab: "domains", label: "Lĩnh vực & Ứng dụng", icon: AppWindow },
  { tab: "babok", label: "Khung chuẩn BABOK", icon: BookOpenCheck },
  { tab: "ai", label: "Cấu hình AI & Token", icon: Settings2 },
  { tab: "audit", label: "Nhật ký kiểm toán", icon: ShieldCheck },
];

const expertMenuItems: Array<{
  tab: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeTone?: "green" | "amber";
}> = [
  { tab: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { tab: "approvals", label: "Duyệt kịch bản", icon: ShieldCheck },
  { tab: "reviews", label: "Chấm hồ sơ", icon: ClipboardCheck },
  { tab: "bookings", label: "Lịch hẹn", icon: CalendarCheck2 },
  { tab: "rubrics", label: "Tiêu chí chấm", icon: BookOpenCheck },
];

export function Sidebar({
  active,
  navigate,
  open,
  onClose,
}: {
  active: RouteKey;
  navigate: (route: RouteKey) => void;
  open: boolean;
  onClose: () => void;
}) {
  const { role, instructorTab, setInstructorTab, adminTab, setAdminTab, expertTab, setExpertTab, currentSessionId, currentScenarioVersionId, openSettings } = useApp();
  const homeRoute: RouteKey =
    role === "learner"
      ? "dashboard"
      : role === "admin"
      ? "admin"
      : role === "expert"
      ? "expert"
      : "instructor";
  const currentRole = roleConfig[role] ?? roleConfig.learner;
  const RoleIcon = currentRole.icon;

  return (
    <>
      <div
        onClick={onClose}
        className={classNames("fixed inset-0 z-30 bg-navy/50 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")}
      />
      <aside
        className={classNames(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate/15 bg-white shadow-[8px_0_36px_rgba(16,42,67,0.04)] backdrop-blur-xl transition-transform lg:translate-x-0 font-sans",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Unified Brand & Workspace Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate/10 px-4">
          <button
            onClick={() => navigate(homeRoute)}
            className="group flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-90"
            aria-label="Về trang tổng quan"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy font-display text-white shadow-md transition-transform duration-200 group-hover:scale-105">
              <RoleIcon size={20} className="text-brass" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-extrabold tracking-tight text-navy">
                  BA-VES
                </span>
                <span
                  className={classNames(
                    "rounded-full px-1.5 py-0.2 text-[8.5px] font-bold uppercase tracking-wider",
                    currentRole.badgeClass
                  )}
                >
                  {currentRole.badge}
                </span>
              </div>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate">
                {currentRole.subtitle}
              </span>
            </div>
          </button>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate hover:bg-offwhite lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate/70">
          Danh mục chức năng
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-1" aria-label="Menu chính">
          {role === "learner" ? (
            <>
              {learnerItems.map(({ route, label, icon: Icon, isMatch }) => {
                const isActive = isMatch ? isMatch(active) : active === route;
                return (
                  <button
                    type="button"
                    key={route}
                    onClick={() => {
                      navigate(route);
                      onClose();
                    }}
                    className={classNames(
                      "group relative flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-xs font-semibold transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-navy text-white shadow-2xs font-bold"
                        : "text-slate hover:bg-offwhite hover:text-navy"
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-brass" />
                    )}
                    <span
                      className={classNames(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-md transition-transform group-hover:scale-105",
                        isActive ? "bg-white/20 text-amber-300" : "bg-slate-100 text-slate-600 group-hover:text-navy"
                      )}
                    >
                      <Icon size={14} />
                    </span>
                    <span className="truncate whitespace-nowrap">{label}</span>
                  </button>
                );
              })}

              {/* Active Scenario Quick Card */}
              <div className="mt-3 pt-3 border-t border-slate/10">
                <div className="px-1 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate/70">
                  Không gian kịch bản
                </div>
                <div className="rounded-xl border border-brass/30 bg-gradient-to-b from-brass/10 to-transparent p-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-navy">
                      <Sparkles size={11} className="text-brass" />{" "}
                      {currentSessionId ? `Phiên #${currentSessionId}` : `Kịch bản #${currentScenarioVersionId ?? 1}`}
                    </span>
                    <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[8.5px] font-bold text-emerald-700 uppercase">
                      {currentSessionId ? "Đang làm" : "Sẵn sàng"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-navy truncate">
                    {currentSessionId ? "Phiên phỏng vấn thực chiến" : "Kho kịch bản doanh nghiệp"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(currentSessionId ? "simulation" : "scenarios");
                      onClose();
                    }}
                    className="mt-2 flex h-7 w-full items-center justify-center gap-1.5 rounded-lg bg-navy text-[11px] font-bold text-white hover:bg-navy-light transition shadow-2xs cursor-pointer"
                  >
                    <span>{currentSessionId ? "Vào phiên kịch bản" : "Chọn kịch bản"}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </>
          ) : role === "admin" ? (
            adminMenuItems.map(({ tab, label, icon: Icon, badge, badgeTone }) => {
              const isActive = active === "admin" && adminTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    navigate("admin");
                    setAdminTab(tab);
                    onClose();
                  }}
                  className={classNames(
                    "group relative flex min-h-10 w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-navy text-white shadow-sm"
                      : "text-slate hover:bg-offwhite hover:text-navy"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isActive && (
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brass" />
                    )}
                    <span
                      className={classNames(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105",
                        isActive ? "bg-white/20 text-amber-300" : "bg-slate-100 text-slate-600 group-hover:text-navy"
                      )}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="truncate whitespace-nowrap">{label}</span>
                  </div>

                  {badge && (
                    <span
                      className={classNames(
                        "rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase",
                        badgeTone === "green"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-brass/20 text-brass"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : role === "expert" ? (
            expertMenuItems.map(({ tab, label, icon: Icon, badge, badgeTone }) => {
              const isActive = active === "expert" && expertTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    navigate("expert");
                    setExpertTab(tab);
                    onClose();
                  }}
                  className={classNames(
                    "group relative flex min-h-10 w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-navy text-white shadow-sm"
                      : "text-slate hover:bg-offwhite hover:text-navy"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isActive && (
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brass" />
                    )}
                    <span
                      className={classNames(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105",
                        isActive ? "bg-white/20 text-amber-300" : "bg-slate-100 text-slate-600 group-hover:text-navy"
                      )}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="truncate whitespace-nowrap">{label}</span>
                  </div>

                  {badge && (
                    <span
                      className={classNames(
                        "rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase",
                        badgeTone === "green"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-brass/20 text-brass"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            instructorMenuItems.map(({ tab, label, icon: Icon, badge, badgeTone }) => {
              const isActive = active === "instructor" && instructorTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    navigate("instructor");
                    setInstructorTab(tab);
                    onClose();
                  }}
                  className={classNames(
                    "group relative flex min-h-10 w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-navy text-white shadow-sm"
                      : "text-slate hover:bg-offwhite hover:text-navy"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isActive && (
                      <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brass" />
                    )}
                    <span
                      className={classNames(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105",
                        isActive ? "bg-white/20 text-amber-300" : "bg-slate-100 text-slate-600 group-hover:text-navy"
                      )}
                    >
                      <Icon size={15} />
                    </span>
                    <span className="truncate whitespace-nowrap">{label}</span>
                  </div>

                  {badge && (
                    <span
                      className={classNames(
                        "rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase",
                        badgeTone === "green"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : "bg-brass/20 text-brass"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Footer Actions: Settings Gear */}
        <div className="border-t border-slate/15 p-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              openSettings("profile");
              onClose();
            }}
            title="Cài đặt tài khoản, API Key & Usage"
            aria-label="Mở cài đặt"
            className="group flex h-9 w-full items-center gap-2.5 rounded-xl border border-slate/20 bg-white px-3 text-left text-xs font-bold text-navy shadow-2xs transition hover:border-navy/30 hover:bg-offwhite cursor-pointer"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 text-navy transition-transform duration-300 group-hover:rotate-45">
              <Settings size={15} />
            </span>
            <span className="truncate">Cài đặt</span>
          </button>
        </div>
      </aside>
    </>
  );
}
