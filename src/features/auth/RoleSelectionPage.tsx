import { ArrowRight, BarChart3, BookOpenCheck, Bot, CheckCircle2, GraduationCap, Layers3, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

export function RoleSelectionPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setRole, setSelectedDomainId } = useApp();
  const enterLearner = () => { setRole("learner"); setSelectedDomainId("all"); navigate("dashboard"); };
  const enterInstructor = () => { setRole("instructor"); navigate("instructor"); };

  return (
    <main className="relative min-h-[100dvh] bg-[#0A0F19] text-white overflow-hidden font-sans selection:bg-[#00F0FF]/30">
      {/* Atmospheric Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00F0FF]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#6366F1]/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#3B82F6]/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern Overlay for subtle tech/education vibe */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none opacity-50 mask-image:linear-gradient(to_bottom,transparent,black)]" />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1536px] lg:grid-cols-[1fr_1.2fr]">
        
        {/* Left Section - Vibe & Brand */}
        <section className="flex flex-col justify-between p-8 sm:p-12 lg:p-20">
          <div>
            <button onClick={() => navigate("landing")} className="group flex items-center gap-4 text-left transition-all hover:opacity-80" aria-label="Back to landing page">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5 border border-white/10 font-black text-white shadow-lg backdrop-blur-md transition-transform group-hover:scale-105">
                BV
              </span>
              <span>
                <strong className="block text-xl tracking-tight text-white">BA-VES</strong>
                <span className="text-sm font-medium text-[#94A3B8]">Virtual Enterprise Simulation</span>
              </span>
            </button>
            
            <div className="mt-24">
              <p className="flex w-fit items-center gap-2 rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                <Sparkles size={14} className="animate-pulse" />
                Learning Operations Studio
              </p>
              <h1 className="mt-8 max-w-xl text-[clamp(2.5rem,5vw,5rem)] font-extrabold leading-[1.05] tracking-tight">
                One virtual enterprise.<br />
                <span className="bg-gradient-to-r from-[#00F0FF] to-[#6366F1] bg-clip-text text-transparent italic pr-2">Two real perspectives.</span>
              </h1>
              <p className="mt-8 max-w-lg text-lg leading-relaxed text-[#94A3B8]">
                Practice business analysis in a hyper-realistic simulated workplace, or command the complete training operation from one unified platform.
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
            <div className="flex flex-col gap-1">
              <strong className="text-3xl font-light tracking-tight text-white">06</strong>
              <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Domains</span>
            </div>
            <div className="flex flex-col gap-1">
              <strong className="text-3xl font-light tracking-tight text-white">24</strong>
              <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Applications</span>
            </div>
            <div className="flex flex-col gap-1">
              <strong className="text-3xl font-light tracking-tight text-white">32</strong>
              <span className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Learners</span>
            </div>
          </div>
        </section>

        {/* Right Section - Role Selection */}
        <section className="flex flex-col justify-center p-8 sm:p-12 lg:p-20 relative">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">Choose your role</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Where would you like to begin?</h2>
            <p className="mt-4 leading-relaxed text-[#94A3B8]">Each workspace is meticulously crafted with specialized tools and workflows.</p>
          </div>

          <div className="mt-12 flex flex-col gap-6">
            
            {/* Learner Card */}
            <button 
              onClick={enterLearner} 
              className="group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-1 transition-all duration-500 hover:-translate-y-1 hover:border-[#00F0FF]/30 hover:bg-white/[0.05] hover:shadow-[0_24px_80px_-12px_rgba(0,240,255,0.15)] text-left backdrop-blur-2xl focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/50"
            >
              {/* Inner ambient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/0 to-[#00F0FF]/0 opacity-0 transition-opacity duration-500 group-hover:from-[#00F0FF]/5 group-hover:to-transparent group-hover:opacity-100" />
              
              <div className="relative flex flex-col sm:flex-row gap-6 p-6 sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#00F0FF]/20 to-transparent border border-[#00F0FF]/20 text-[#00F0FF] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-transform duration-500 group-hover:scale-110">
                  <GraduationCap size={28} strokeWidth={1.5} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <strong className="text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-[#00F0FF]">Learner Workspace</strong>
                    <span className="rounded-full border border-[#00F0FF]/30 bg-[#00F0FF]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#00F0FF]">Learner</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">Choose a domain, interview AI stakeholders, and complete BABOK-aligned deliverables in a risk-free environment.</p>
                  
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#64748B]">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#94A3B8]"><BookOpenCheck size={14} className="text-[#00F0FF]/70" />Realistic scenarios</span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#94A3B8]"><Bot size={14} className="text-[#00F0FF]/70" />AI stakeholders</span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#94A3B8]"><CheckCircle2 size={14} className="text-[#00F0FF]/70" />Assessment</span>
                  </div>
                </div>
                
                <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-500 group-hover:bg-[#00F0FF] group-hover:text-[#0A0F19] group-hover:border-transparent">
                  <ArrowRight size={20} className="transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
            </button>

            {/* Instructor Card */}
            <button 
              onClick={enterInstructor} 
              className="group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] p-1 transition-all duration-500 hover:-translate-y-1 hover:border-[#6366F1]/30 hover:bg-white/[0.05] hover:shadow-[0_24px_80px_-12px_rgba(99,102,241,0.15)] text-left backdrop-blur-2xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/0 to-[#6366F1]/0 opacity-0 transition-opacity duration-500 group-hover:from-[#6366F1]/5 group-hover:to-transparent group-hover:opacity-100" />
              
              <div className="relative flex flex-col sm:flex-row gap-6 p-6 sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-transparent border border-[#6366F1]/20 text-[#818CF8] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-transform duration-500 group-hover:scale-110">
                  <ShieldCheck size={28} strokeWidth={1.5} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <strong className="text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-[#818CF8]">Instructor Workspace</strong>
                    <span className="rounded-full border border-[#6366F1]/30 bg-[#6366F1]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#818CF8]">Instructor</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">Design scenarios, manage agents, and moderate learner outcomes from a powerful command center.</p>
                  
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#64748B]">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#94A3B8]"><Layers3 size={14} className="text-[#818CF8]/70" />Scenario builder</span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#94A3B8]"><Users size={14} className="text-[#818CF8]/70" />Cohort management</span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-[#94A3B8]"><BarChart3 size={14} className="text-[#818CF8]/70" />Analytics</span>
                  </div>
                </div>
                
                <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition-all duration-500 group-hover:bg-[#6366F1] group-hover:text-white group-hover:border-transparent">
                  <ArrowRight size={20} className="transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
            </button>

          </div>

          <p className="mt-12 text-center text-xs font-medium tracking-wide text-[#475569]">
            Demo data · Supply-chain inventory management domain
          </p>
        </section>
      </div>
    </main>
  );
}
