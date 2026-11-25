import { Bell, LogOut, Menu, Sparkles, Minus, Square, X, Monitor } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { SettingsModal } from "../common/SettingsModal";
import type { RouteKey } from "../../types/models";
import { isAdminRole, isExpertRole, isInstructorRole } from "../../utils/roles";

export function Header({ onMenu }: { onMenu: () => void; navigate?: (route: RouteKey) => void }) {
  const { role, user, logout, openSettings, currentSessionId, currentScenarioVersionId } = useApp();
  const isElectron = typeof window !== "undefined" && !!(window as any).electronAPI?.isElectron;

  const handleMinimize = () => (window as any).electronAPI?.minimizeWindow?.();
  const handleMaximize = () => (window as any).electronAPI?.maximizeWindow?.();
  const handleClose = () => (window as any).electronAPI?.closeWindow?.();

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    if (isAdminRole(user?.roles) || role === "admin") return "Admin";
    if (isExpertRole(user?.roles) || role === "expert") return "Chuyên gia BA";
    if (isInstructorRole(user?.roles) || role === "instructor") return "Giảng viên";
    return "Học viên";
  };

  return (
    <>
      <header className="app-header-drag sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate/15 bg-white/95 px-4 shadow-[0_1px_2px_rgba(16,42,67,0.03)] backdrop-blur-md sm:px-6 font-sans">
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
          <button
            onClick={onMenu}
            aria-label="Mở menu điều hướng"
            className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-lg border border-slate/20 bg-white text-navy shadow-sm lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate shrink-0">
                <Sparkles size={11} className="text-brass" />
                {role === "learner"
                  ? "Không gian Thực hành BA"
                  : role === "admin"
                  ? "Cấu hình & Giám sát Hệ thống"
                  : role === "expert"
                  ? "Hội đồng Chuyên gia & Đánh giá BA"
                  : "Hệ thống quản trị Đào tạo BA-VES"}
              </span>
              <span className="hidden sm:inline-block rounded-full border border-amber-300 bg-amber-50 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-amber-900 shrink-0">
                BABOK® v3
              </span>
            </div>
            <p className="font-display text-sm font-extrabold tracking-tight text-navy truncate">
              {role === "learner"
                ? currentSessionId
                  ? `Phiên mô phỏng #${currentSessionId} (Kịch bản #${currentScenarioVersionId ?? 1})`
                  : "Hệ thống Đào tạo Mô phỏng Phân tích Nghiệp vụ BA-VES"
                : role === "admin"
                ? "Trung tâm Quản trị Hệ thống (Admin Portal)"
                : role === "expert"
                ? "Trung tâm Thẩm định & Cố vấn Chuyên gia"
                : "Trung tâm điều hành Giảng viên"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Notifications */}
          <button
            aria-label="Thông báo"
            className="relative grid h-8 w-8 place-items-center rounded-lg border border-slate/15 bg-white text-slate transition hover:border-slate/30 hover:text-navy hover:shadow-sm shrink-0"
          >
            <Bell size={15} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* FE-04: Topbar User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate/15">
            <button
              onClick={() => openSettings("profile")}
              title="Quản lý hồ sơ, mật khẩu & API Key"
              className="flex items-center gap-2.5 rounded-xl p-1 text-left transition hover:bg-slate/10 cursor-pointer"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-9 w-9 rounded-xl object-cover shadow-sm border border-slate/20"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy font-display text-xs font-bold text-white shadow-sm">
                  {user ? getInitials(user.fullName) : (role === "learner" ? "HV" : "GV")}
                </span>
              )}

              <div className="hidden sm:block text-left">
                <strong className="block text-xs font-bold text-navy leading-none">
                  {user?.fullName || "Tài khoản BA-VES"}
                </strong>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block rounded border border-blue-200 bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                    {getRoleBadge()}
                  </span>
                  {user?.email && (
                    <span className="text-[10px] text-slate/75 max-w-[120px] truncate" title={user.email}>
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Đăng xuất"
              className="ml-1 grid h-8 w-8 place-items-center rounded-lg text-slate hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={15} />
            </button>

            {/* Desktop Window Controls (Only in Electron Desktop App) */}
            {isElectron && (
              <div className="flex items-center gap-1 border-l border-slate/20 pl-2.5 ml-2 no-drag">
                <span className="hidden xl:inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate">
                  <Monitor size={10} /> Desktop App
                </span>
                <button
                  onClick={handleMinimize}
                  title="Thu nhỏ cửa sổ"
                  aria-label="Thu nhỏ"
                  className="grid h-7 w-7 place-items-center rounded-md text-slate hover:bg-slate-100 hover:text-navy transition cursor-pointer"
                >
                  <Minus size={13} />
                </button>
                <button
                  onClick={handleMaximize}
                  title="Phóng to / Khôi phục cửa sổ"
                  aria-label="Phóng to"
                  className="grid h-7 w-7 place-items-center rounded-md text-slate hover:bg-slate-100 hover:text-navy transition cursor-pointer"
                >
                  <Square size={11} />
                </button>
                <button
                  onClick={handleClose}
                  title="Đóng ứng dụng"
                  aria-label="Đóng"
                  className="grid h-7 w-7 place-items-center rounded-md text-slate hover:bg-rose-500 hover:text-white transition cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Unified Settings Modal (Profile, Password, API Key, Usage) */}
      <SettingsModal />
    </>
  );
}
