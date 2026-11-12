import { useState, useEffect } from "react";
import { Bell, Crown, KeyRound, LogOut, Menu, Sparkles, User, Settings, CheckCircle2 } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { ByokModal } from "../common/ByokModal";
import { ProfileModal } from "../common/ProfileModal";
import { SubscriptionModal } from "../common/SubscriptionModal";
import { commerceService, type CreditBalanceSummaryDto } from "../../services/commerceService";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { role, user, logout, byokModalOpen, setByokModalOpen, currentSessionId, currentScenarioVersionId } = useApp();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [credits, setCredits] = useState<CreditBalanceSummaryDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    commerceService
      .getMyCreditsSummary()
      .then((res) => {
        if (isMounted && res) setCredits(res);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [subModalOpen]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleBadge = () => {
    if (user?.roles?.includes("ADMIN")) return "Admin";
    if (user?.roles?.includes("INSTRUCTOR")) return "Giảng viên";
    if (user?.roles?.includes("BAEXPERT")) return "Chuyên gia BA";
    return "Học viên";
  };

  return (
    <>
      <header className="app-header-drag sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate/15 bg-white/95 px-4 shadow-[0_1px_3px_rgba(16,42,67,0.04)] backdrop-blur-md sm:px-6 font-sans">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            aria-label="Mở menu điều hướng"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate/20 bg-white text-navy shadow-sm lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate">
                <Sparkles size={11} className="text-brass" />
                {role === "learner"
                  ? "Không gian Thực hành BA-VES"
                  : role === "admin"
                  ? "Cấu hình & Giám sát Hệ thống"
                  : "Hệ thống quản trị Đào tạo BA-VES"}
              </span>
              <span className="hidden sm:inline-block rounded-full bg-brass/15 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-brass">
                BABOK® v3
              </span>
            </div>
            <p className="font-display text-sm font-extrabold tracking-tight text-navy">
              {role === "learner"
                ? currentSessionId
                  ? `Phiên mô phỏng #${currentSessionId}`
                  : currentScenarioVersionId
                  ? `Kịch bản thực hành #${currentScenarioVersionId}`
                  : "Mô phỏng Phân tích Nghiệp vụ Thực chiến"
                : role === "admin"
                ? "Trung tâm Quản trị Hệ thống (Admin Portal)"
                : "Trung tâm điều hành Giảng viên"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Credit balance quick glance */}
          {credits && (
            <button
              onClick={() => setSubModalOpen(true)}
              title="Số dư lượt sử dụng: Bấm để xem chi tiết hoặc nạp thêm"
              className="hidden lg:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-emerald-100 transition-all shadow-2xs"
            >
              <span className="flex items-center gap-1">
                <Sparkles size={13} className="text-emerald-700" />
                <strong className="font-bold text-emerald-800">{credits.reviewCredits}</strong> lượt chấm
              </span>
              <span className="text-emerald-300">·</span>
              <span>
                <strong className="font-bold text-emerald-800">{credits.consultationCredits}</strong> tư vấn 1-on-1
              </span>
            </button>
          )}

          <button
            onClick={() => setSubModalOpen(true)}
            title="Gói hội viên & Cổng thanh toán (VNPay / PayOS)"
            className="flex items-center gap-1.5 rounded-xl border border-brass/40 bg-brass/10 px-2.5 py-1.5 text-xs font-bold text-navy hover:bg-brass/25 transition-all shadow-xs"
          >
            <Crown size={14} className="text-brass" />
            <span className="hidden md:inline">Gói dịch vụ</span>
          </button>

          {/* FE-05: Nút Cài đặt API Key AI (BYOK) */}
          <button
            onClick={() => setByokModalOpen(true)}
            title="Cài đặt API Key AI (Bring Your Own Key)"
            className="flex items-center gap-1.5 rounded-xl border border-slate/20 bg-white px-2.5 py-1.5 text-xs font-bold text-navy hover:border-brass hover:text-brass transition-all shadow-sm"
          >
            <KeyRound size={14} className="text-brass" />
            <span className="hidden md:inline">Cấu hình AI (BYOK)</span>
          </button>

          {/* Notifications */}
          <button
            aria-label="Thông báo"
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate/15 bg-white text-slate transition hover:border-slate/30 hover:text-navy hover:shadow-sm"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* FE-04: Topbar User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate/15">
            <button
              onClick={() => setProfileModalOpen(true)}
              title="Quản lý hồ sơ & Đổi mật khẩu"
              className="flex items-center gap-2.5 rounded-xl p-1 text-left transition hover:bg-slate/10"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-9 w-9 rounded-xl object-cover shadow-sm border border-slate/20"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy font-display text-xs font-bold text-white shadow-sm">
                  {user ? getInitials(user.fullName) : role === "admin" ? "AD" : role === "learner" ? "HV" : "GV"}
                </span>
              )}

              <div className="hidden sm:block text-left">
                <strong className="block text-xs font-bold text-navy leading-none">
                  {user?.fullName || (role === "admin" ? "Quản trị viên" : role === "learner" ? "Học viên" : "Giảng viên")}
                </strong>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block rounded bg-offwhite px-1.5 py-0.2 text-[10px] font-semibold text-brass">
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
              className="ml-1 grid h-8 w-8 place-items-center rounded-lg text-slate hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* BYOK Modal */}
      <ByokModal isOpen={byokModalOpen} onClose={() => setByokModalOpen(false)} />

      {/* Profile & Password Modal */}
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    <SubscriptionModal isOpen={subModalOpen} onClose={() => setSubModalOpen(false)} />
    </>
  );
}
