import { Bell, Menu, Sparkles } from "lucide-react";
import { useApp } from "../../contexts/AppContext";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { role } = useApp();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate/15 bg-white/95 px-4 shadow-[0_1px_3px_rgba(16,42,67,0.04)] backdrop-blur-md sm:px-6 font-sans">
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
              {role === "learner" ? "Doanh nghiệp: VinaSupply Retail" : "Hệ thống quản trị BA-VES"}
            </span>
            <span className="hidden sm:inline-block rounded-full bg-brass/15 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-brass">
              BABOK® v3
            </span>
          </div>
          <p className="font-display text-sm font-extrabold tracking-tight text-navy">
            {role === "learner" ? "Kịch bản Quản lý kho & Đứt hàng (INV-2026-014)" : "Trung tâm điều hành Giảng viên"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label="Thông báo"
          className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate/15 bg-white text-slate transition hover:border-slate/30 hover:text-navy hover:shadow-sm"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate/15">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy font-display text-xs font-bold text-white shadow-sm">
            {role === "learner" ? "HV" : "GV"}
          </span>
          <div className="hidden sm:block text-left">
            <strong className="block text-xs font-bold text-navy leading-none">
              {role === "learner" ? "Học viên Minh" : "Giảng viên Phương"}
            </strong>
            <span className="text-[10px] text-slate">
              {role === "learner" ? "Lớp BA-K19" : "Quản trị viên"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
