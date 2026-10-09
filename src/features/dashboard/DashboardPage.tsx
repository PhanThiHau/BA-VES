import { useMemo, useState } from "react";
import { ArrowRight, Boxes, BriefcaseBusiness, Factory, FolderKanban, GraduationCap, Landmark, Play, Search, Sparkles, Users } from "lucide-react";
import { learningApplications, learningDomains } from "../../constants/learningCatalog";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../contexts/AppContext";
import type { LearningDomain, RouteKey } from "../../types/models";

const domainIcons = { boxes: Boxes, sales: BriefcaseBusiness, finance: Landmark, factory: Factory, people: Users, project: FolderKanban };

export function DashboardPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setSelectedDomainId } = useApp();
  const [query, setQuery] = useState("");
  const visibleDomains = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return learningDomains.filter((domain) => !normalized || `${domain.name} ${domain.shortName} ${domain.description}`.toLocaleLowerCase("en").includes(normalized));
  }, [query]);

  const openDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    navigate("applications");
  };

  const openAllApplications = () => {
    setSelectedDomainId("all");
    navigate("applications");
  };

  return <div className="space-y-6">
    <section className="reveal-up flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div><div className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#597b9c]"><GraduationCap size={15} />Minh's practice workspace</div><h1 className="text-2xl font-bold text-[#172f4d] sm:text-[1.75rem]">Explore business domains</h1><p className="mt-1 text-sm text-[#687d93]">Choose a domain or continue your active simulation.</p></div>
      <label className="relative block w-full lg:w-[320px]"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d90a5]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search domains..." className="h-10 w-full rounded-xl border border-[#cbd8e5] bg-white pl-10 pr-4 text-sm text-[#243b57] outline-none transition placeholder:text-[#8b9caf] focus:border-[#6f8eac] focus:ring-4 focus:ring-[#dce8f2]" /></label>
    </section>

    <Card className="reveal-up reveal-delay-1 overflow-hidden border-[#cbd9e7]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="p-4 sm:p-5"><div className="flex flex-wrap items-center gap-2"><Badge>In progress</Badge><span className="text-xs font-bold uppercase tracking-wider text-[#71879b]">Scenario 03 · Inventory Management</span></div><h2 className="mt-2 text-lg font-bold text-[#173451] sm:text-xl">Supply Chain Inventory Management</h2><p className="mt-1 text-sm text-[#667b91]">Investigate stockouts and design a traceable replenishment process for VinaSupply Retail.</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => navigate("simulation")}><Play size={16} fill="currentColor" />Continue</Button><Button variant="secondary" onClick={() => navigate("scenario-detail")}>View assignment</Button></div></div>
        <div className="border-t border-[#dce5ee] bg-[#edf5f9] p-4 lg:border-l lg:border-t-0"><div className="flex items-center justify-between text-sm"><span className="font-semibold text-[#526a83]">Progress</span><strong className="metric-number text-[#24466f]">42%</strong></div><div className="mt-2"><ProgressBar value={42} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><strong className="metric-number block text-base text-[#1e3c60]">3/6</strong><span className="text-[11px] text-[#7b8da0]">Stakeholders</span></div><div><strong className="metric-number block text-base text-[#1e3c60]">08</strong><span className="text-[11px] text-[#7b8da0]">Evidence</span></div><div><strong className="metric-number block text-base text-[#1e3c60]">2/5</strong><span className="text-[11px] text-[#7b8da0]">Deliverables</span></div></div></div>
      </div>
    </Card>

    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#6c86a3]">Experience catalog</p><h2 className="mt-1 text-2xl font-bold text-[#1b3554]">Explore by domain</h2></div><Button variant="ghost" onClick={openAllApplications}>View all applications <ArrowRight size={16} /></Button></div>
      {visibleDomains.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleDomains.map((domain, index) => <DomainCard key={domain.id} domain={domain} index={index} onClick={() => openDomain(domain.id)} />)}</div> : <Card className="grid min-h-56 place-items-center p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#edf3f8] text-[#587b9d]"><Search size={20} /></span><h3 className="mt-4 font-bold text-[#1b3554]">No matching domain found</h3><Button className="mt-4" variant="secondary" onClick={() => setQuery("")}>Clear search</Button></div></Card>}
    </section>

    <Card className="flex flex-col gap-5 border-[#ccdbe9] bg-[#edf4fa] p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#315f88]"><Sparkles size={21} /></span><div><h3 className="font-bold text-[#1c3959]">Choose a scenario that fits your experience</h3><p className="mt-1 text-sm leading-6 text-[#657b91]">Use your practice profile to select the next domain and difficulty level.</p></div></div><Button variant="secondary" onClick={() => navigate("progress")}>View competency profile</Button></Card>
  </div>;
}

function DomainCard({ domain, index, onClick }: { domain: LearningDomain; index: number; onClick: () => void }) {
  const Icon = domainIcons[domain.icon];
  const available = learningApplications.filter((item) => item.domainId === domain.id && item.status !== "coming-soon").length;
  return <button onClick={onClick} className="reveal-up group relative overflow-hidden rounded-[22px] border border-white/90 bg-white/90 p-5 text-left shadow-[0_12px_36px_rgba(27,62,91,.055)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#9fb4c9] hover:shadow-[0_20px_46px_rgba(31,57,84,.1)]" style={{ animationDelay: `${index * 55 + 120}ms` }}><span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition duration-300 group-hover:scale-x-100" style={{ backgroundColor: domain.color }} /><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundColor: domain.color }}><Icon size={20} /></span><span className="rounded-full bg-[#f0f4f8] px-2.5 py-1 text-xs font-semibold text-[#657b91]">{domain.applicationIds.length} applications</span></div><h3 className="mt-4 text-lg font-bold text-[#1c3857]">{domain.name}</h3><p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#8192a4]">{domain.shortName}</p><p className="mt-3 min-h-12 text-sm leading-6 text-[#6d8195]">{domain.description}</p><div className="mt-4 flex items-center justify-between border-t border-[#e5ebf1] pt-4 text-sm"><span className="text-[#71859a]">{available} available pathways</span><span className="flex items-center gap-1 font-semibold text-[#315f88]">View applications <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span></div></button>;
}
