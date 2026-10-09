import { AppWindow, BarChart3, BookOpenCheck, ClipboardCheck, FileStack, GraduationCap, LayoutDashboard, MessageSquareText, Repeat2, SearchCheck, Settings2, ShieldCheck, X } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const learnerItems: Array<{ route: RouteKey; label: string; icon: typeof LayoutDashboard }> = [
  { route: "dashboard", label: "Overview", icon: LayoutDashboard },
  { route: "applications", label: "Applications", icon: AppWindow },
  { route: "scenarios", label: "Scenarios", icon: BookOpenCheck },
  { route: "simulation", label: "Simulation Session", icon: MessageSquareText },
  { route: "analysis", label: "Analysis & Confirmation", icon: SearchCheck },
  { route: "artifacts", label: "Final Deliverables", icon: FileStack },
  { route: "assessment", label: "Assessment", icon: ClipboardCheck },
  { route: "progress", label: "Competency Profile", icon: BarChart3 },
];

const instructorItems: Array<{ route: RouteKey; label: string; icon: typeof LayoutDashboard }> = [
  { route: "instructor", label: "Instructor Workspace", icon: ShieldCheck },
];

const navTones = [
  { icon: "bg-[#dcecf8] text-[#2f6f9f]", active: "bg-[#dcecf8] text-[#214f73]", bar: "bg-[#2f79ad]" },
  { icon: "bg-[#e5e2f5] text-[#645b9c]", active: "bg-[#e9e6f7] text-[#514a82]", bar: "bg-[#7569ad]" },
  { icon: "bg-[#dff1ea] text-[#2d8068]", active: "bg-[#e1f2ec] text-[#276b5a]", bar: "bg-[#3a9279]" },
  { icon: "bg-[#fff0d9] text-[#a56a22]", active: "bg-[#fff1de] text-[#8a591d]", bar: "bg-[#d18a31]" },
  { icon: "bg-[#f7e2e8] text-[#9d5066]", active: "bg-[#f8e6eb] text-[#834456]", bar: "bg-[#b96078]" },
  { icon: "bg-[#e1edf5] text-[#3f7297]", active: "bg-[#e1edf5] text-[#315f82]", bar: "bg-[#4e84a9]" },
  { icon: "bg-[#ece8dd] text-[#7d6d43]", active: "bg-[#f0ece2] text-[#695c39]", bar: "bg-[#93804d]" },
];

export function Sidebar({ active, navigate, open, onClose }: { active: RouteKey; navigate: (route: RouteKey) => void; open: boolean; onClose: () => void }) {
  const { role } = useApp();
  const items = role === "learner" ? learnerItems : instructorItems;
  const homeRoute: RouteKey = role === "learner" ? "dashboard" : "instructor";

  return <>
    <div onClick={onClose} className={classNames("fixed inset-0 z-30 bg-[#102a42]/45 backdrop-blur-sm lg:hidden", open ? "block" : "hidden")} />
    <aside className={classNames("fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/80 bg-gradient-to-b from-[#f8fbfd] via-[#f1f7fa] to-[#f8fbfd] shadow-[12px_0_45px_rgba(20,54,82,.055)] backdrop-blur-xl transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex h-16 items-center justify-between px-4">
        <button onClick={() => navigate(homeRoute)} className="group flex items-center gap-3 text-left">
          <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[14px] bg-[#193f60] font-black text-white shadow-[0_10px_24px_rgba(25,63,96,.22)]"><span className="absolute inset-x-0 bottom-0 h-1/2 bg-[#2f638c]" /><span className="relative">BV</span></span>
          <span><strong className="block tracking-[-.02em] text-[#18344f]">BA-VES</strong><small className="text-[#8091a2]">Virtual Enterprise</small></span>
        </button>
        <button onClick={onClose} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-xl text-[#60758d] hover:bg-[#eaf1f6] lg:hidden"><X size={20} /></button>
      </div>

      <div className="px-3 pb-3 pt-2">
        <div className="relative overflow-hidden rounded-2xl border border-[#d5e6f2] bg-gradient-to-br from-[#ddecf7] via-[#edf5fa] to-[#f8fbfd] p-3.5 shadow-[0_8px_22px_rgba(47,99,140,.1)]">
          <span className="breathe absolute -right-3 -top-3 h-16 w-16 rounded-full bg-[#8fb8d5]/45" />
          <div className="relative flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2f638c] text-white shadow-[0_6px_16px_rgba(47,99,140,.2)]">{role === "learner" ? <GraduationCap size={19} /> : <ShieldCheck size={19} />}</span><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#64839d]">Workspace</p><strong className="text-sm text-[#1f4b6c]">{role === "learner" ? "Learner" : "Instructor"}</strong></div></div>
        </div>
      </div>

      <div className="px-5 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa8b5]">Navigation</div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5" aria-label="Primary navigation">
        {items.map(({ route, label, icon: Icon }, index) => {
          const isActive = active === route;
          const tone = navTones[index % navTones.length];
          return <button key={route} onClick={() => { navigate(route); onClose(); }} className={classNames("group relative flex min-h-11 w-full items-center gap-2.5 overflow-hidden rounded-xl px-2.5 py-1.5 text-left text-sm font-semibold transition duration-200", isActive ? `${tone.active} shadow-[inset_0_0_0_1px_rgba(82,126,161,.08)]` : "text-[#667c90] hover:bg-white hover:text-[#244e70] hover:shadow-sm")}>
            {isActive && <span className={classNames("absolute inset-y-2 left-0 w-1 rounded-r-full", tone.bar)} />}
            <span className={classNames("grid h-8 w-8 shrink-0 place-items-center rounded-[10px] transition group-hover:scale-105", tone.icon)}><Icon size={16} /></span>{label}
          </button>;
        })}
      </nav>

      <div className="space-y-1 border-t border-[#e2eaf0] p-3">
        <button className="flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-sm font-semibold text-[#718399] transition hover:bg-white hover:text-[#315b7c] hover:shadow-sm"><Settings2 size={18} />Settings</button>
        <button onClick={() => navigate("role-selection")} className="flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3.5 py-3 text-sm font-semibold text-[#315f84] transition hover:bg-[#e6f0f7]"><Repeat2 size={18} />Switch role</button>
      </div>
    </aside>
  </>;
}
