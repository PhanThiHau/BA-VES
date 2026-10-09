import { ArrowLeft, CheckCircle2, FileCheck2, MessageSquareText, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { RouteKey } from "../../types/models";

export function AuthLayout({ children, navigate, mode }: { children: ReactNode; navigate: (route: RouteKey) => void; mode: "login" | "register" }) {
  return <main className="min-h-[100dvh] bg-[#edf3f7] p-3 text-[#18314d] sm:p-5 lg:p-7">
    <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1480px] overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_28px_90px_rgba(20,52,80,.13)] lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-[#123650] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-28 -top-20 h-80 w-80 rounded-full border-[52px] border-[#2d6389]/45" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#32739b]/25 blur-3xl" />
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

        <div className="relative">
          <button onClick={() => navigate("landing")} className="flex items-center gap-3 text-left" aria-label="Back to BA-VES home"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white font-black text-[#1d4b6d] shadow-lg">BV</span><span><strong className="block tracking-[-.02em]">BA-VES</strong><span className="text-xs text-[#b9cee0]">Virtual Enterprise Simulation</span></span></button>
          <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[.15em] text-[#b9d3e3]"><Sparkles size={14}/>{mode === "login" ? "Continue your practice" : "Begin your BA journey"}</div>
          <h1 className="mt-6 max-w-xl text-[clamp(2.7rem,4.6vw,4.8rem)] font-bold leading-[.96] tracking-[-.055em]">Practice in a business<br/><span className="text-[#91c5e2]">that reacts to you.</span></h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#c2d5e1]">Work with role-aware stakeholders, build traceable analysis, submit professional deliverables, and understand how your decisions affect the enterprise.</p>
        </div>

        <div className="relative mt-12 rounded-[24px] border border-white/12 bg-white/[.07] p-5 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9fc0d5]">Inside every assignment</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{[[MessageSquareText,"Stakeholder interviews","Discover incomplete and conflicting information"],[SearchCheck,"Evidence-based analysis","Separate facts, assumptions, and findings"],[FileCheck2,"Professional outputs","Upload BRD, RTM, process models, and more"],[ShieldCheck,"Fair assessment","AI evidence with expert moderation"]].map(([Icon,title,copy]) => <div key={String(title)} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-[#b9d9ea]"><Icon size={17}/></span><div><strong className="block text-sm">{String(title)}</strong><span className="mt-1 block text-xs leading-5 text-[#a9c0d0]">{String(copy)}</span></div></div>)}</div>
          <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-[#b9ccda]"><CheckCircle2 size={15} className="text-[#74c3a1]"/>Practice-first · Evidence-based · BABOK-aligned</div>
        </div>
      </section>

      <section className="relative flex min-h-[720px] flex-col bg-[#fbfcfd] p-5 sm:p-9 lg:p-12 xl:p-16">
        <button onClick={() => navigate("landing")} className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#607991] transition hover:text-[#274f70]"><ArrowLeft size={16}/>Back to home</button>
        <div className="mx-auto flex w-full max-w-[520px] flex-1 flex-col justify-center">{children}</div>
      </section>
    </div>
  </main>;
}
