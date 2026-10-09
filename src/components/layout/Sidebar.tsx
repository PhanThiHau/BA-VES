import { AppWindow, BarChart3, BookOpenCheck, ClipboardCheck, FileStack, GraduationCap, LayoutDashboard, MessageSquareText, Repeat2, SearchCheck, Settings2, ShieldCheck, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const learnerItems: Array<{ route: RouteKey; label: string; icon: typeof LayoutDashboard }> = [
  { route: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { route: "applications", label: "Ứng dụng nghiệp vụ", icon: AppWindow },
  { route: "scenarios", label: "Kịch bản mô phỏng", icon: BookOpenCheck },
  { route: "simulation", label: "Phiên phỏng vấn AI", icon: MessageSquareText },
  { route: "analysis", label: "Phân tích bằng chứng", icon: SearchCheck },
  { route: "artifacts", label: "Hồ sơ bàn giao BA", icon: FileStack },
  { route: "assessment", label: "Đánh giá & Chấm điểm", icon: ClipboardCheck },
  { route: "progress", label: "Hồ sơ năng lực BABOK", icon: BarChart3 },
];

const instructorItems: Array<{ route: RouteKey; label: string; icon: typeof LayoutDashboard }> = [
  { route: "instructor", label: "Không gian Giảng viên", icon: ShieldCheck },
];

export function Sidebar({ active, navigate, open, onClose }: { active: RouteKey; navigate: (route: RouteKey) => void; open: boolean; onClose: () => void }) {
  const { role } = useApp();
  const items = role === "learner" ? learnerItems : instructorItems;
  const homeRoute: RouteKey = role === "learner" ? "dashboard" : "instructor";

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
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate/10 px-4">
          <button
            onClick={() => navigate(homeRoute)}
            className="group flex items-center gap-3 text-left transition-opacity hover:opacity-90"
            aria-label="Về trang tổng quan"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy font-display text-lg font-extrabold text-white shadow-md transition-transform group-hover:scale-105">
              B
            </span>
            <span>
              <span className="flex items-center gap-1.5">
                <span className="block font-display text-base font-extrabold tracking-tight text-navy">
                  BA-VES
                </span>
                <span className="rounded-full bg-brass/20 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-brass">
                  FA26SE185
                </span>
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate">
                Mô phỏng Doanh nghiệp Ảo
              </span>
            </span>
          </button>
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="grid h-9 w-9 place-items-center rounded-xl text-slate hover:bg-offwhite lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Workspace Role Chip */}
        <div className="p-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate/15 bg-gradient-to-br from-offwhite to-white p-3 shadow-sm">
            <div className="relative flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-white shadow-sm">
                {role === "learner" ? <GraduationCap size={18} /> : <ShieldCheck size={18} />}
              </span>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Không gian làm việc</p>
                <strong className="block truncate text-xs font-bold text-navy">
                  {role === "learner" ? "Học viên (Learner)" : "Giảng viên (Instructor)"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate/70">
          Danh mục chức năng
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-1" aria-label="Menu chính">
          {items.map(({ route, label, icon: Icon }) => {
            const isActive = active === route;
            return (
              <button
                key={route}
                onClick={() => {
                  navigate(route);
                  onClose();
                }}
                className={classNames(
                  "group relative flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-200",
                  isActive
                    ? "bg-navy text-white shadow-sm"
                    : "text-slate hover:bg-offwhite hover:text-navy"
                )}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-brass" />
                )}
                <span
                  className={classNames(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105",
                    isActive ? "bg-white/15 text-brass" : "bg-offwhite text-slate group-hover:text-navy"
                  )}
                >
                  <Icon size={15} />
                </span>
                <span className="truncate whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="space-y-1 border-t border-slate/10 p-3">
          <button
            onClick={() => navigate("role-selection")}
            className="flex min-h-9 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate transition hover:bg-offwhite hover:text-navy"
          >
            <Repeat2 size={16} className="text-brass" />
            Đổi vai trò
          </button>
          <button
            onClick={() => navigate("landing")}
            className="flex min-h-9 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate transition hover:bg-offwhite hover:text-navy"
          >
            <Settings2 size={16} />
            Về trang chủ
          </button>
        </div>
      </aside>
    </>
  );
}
