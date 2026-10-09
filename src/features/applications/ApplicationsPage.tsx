import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, BriefcaseBusiness, Building2, Check, Clock3, Factory, FolderKanban, Landmark, Search, SlidersHorizontal, Users } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { learningApplications, learningDomains } from "../../constants/learningCatalog";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

const domainIcons = { boxes: Boxes, sales: BriefcaseBusiness, finance: Landmark, factory: Factory, people: Users, project: FolderKanban };
const statusLabel = {
  available: { text: "Available", tone: "green" as const },
  beta: { text: "Beta", tone: "amber" as const },
  "coming-soon": { text: "Coming soon", tone: "gray" as const },
};
const pageSize = 9;

export function ApplicationsPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { selectedDomainId, setSelectedDomainId } = useApp();
  const [query, setQuery] = useState("");
  const [interestedApps, setInterestedApps] = useState<string[]>(["inventory"]);
  const [page, setPage] = useState(1);
  const selectedDomain = learningDomains.find((domain) => domain.id === selectedDomainId);

  const visibleApps = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return learningApplications.filter((application) => {
      const domain = learningDomains.find((item) => item.id === application.domainId);
      const matchesDomain = selectedDomainId === "all" || application.domainId === selectedDomainId;
      const matchesQuery = !normalized || `${application.name} ${application.description} ${domain?.name ?? ""}`.toLocaleLowerCase("en").includes(normalized);
      return matchesDomain && matchesQuery;
    });
  }, [query, selectedDomainId]);
  const pageCount = Math.max(1, Math.ceil(visibleApps.length / pageSize));
  const pagedApps = visibleApps.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, selectedDomainId]);

  const toggleInterest = (id: string) => setInterestedApps((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div><button onClick={() => navigate("dashboard")} className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#607b97] transition hover:text-[#24466f]"><ArrowLeft size={15} />Back to domains</button><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#6c86a3]"><SlidersHorizontal size={14} />Application catalog</div><h1 className="mt-1 text-2xl font-bold text-[#172f4d] sm:text-[1.75rem]">{selectedDomain ? selectedDomain.name : "All business applications"}</h1></div>
      <label className="relative block w-full lg:w-[340px]"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d90a5]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications..." className="h-10 w-full rounded-xl border border-[#cbd8e5] bg-white pl-10 pr-4 text-sm text-[#243b57] outline-none transition placeholder:text-[#8b9caf] focus:border-[#6f8eac] focus:ring-4 focus:ring-[#dce8f2]" /></label>
    </div>

    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button onClick={() => setSelectedDomainId("all")} className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition ${selectedDomainId === "all" ? "border-[#24466f] bg-[#24466f] text-white" : "border-[#d2dde8] bg-white text-[#647a90] hover:border-[#9fb3c7]"}`}>All</button>
      {learningDomains.map((domain) => <button key={domain.id} onClick={() => setSelectedDomainId(domain.id)} className={`shrink-0 rounded-lg border px-3 py-2 text-sm font-semibold transition ${selectedDomainId === domain.id ? "border-[#24466f] bg-[#24466f] text-white" : "border-[#d2dde8] bg-white text-[#647a90] hover:border-[#9fb3c7]"}`}>{domain.name}</button>)}
      <span className="ml-auto shrink-0 pl-3 text-xs text-[#71859a]"><strong className="text-[#264563]">{visibleApps.length}</strong> results</span>
    </div>

    {visibleApps.length > 0 ? <><div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{pagedApps.map((application) => {
      const domain = learningDomains.find((item) => item.id === application.domainId)!;
      const Icon = domainIcons[domain.icon];
      const selected = interestedApps.includes(application.id);
      const state = statusLabel[application.status];
      return <Card key={application.id} className="reveal-up group flex min-h-[260px] flex-col overflow-hidden p-4 transition duration-300 hover:-translate-y-1 hover:border-[#9fb4c9] hover:shadow-[0_20px_46px_rgba(31,57,84,.1)] sm:p-5">
        <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-xl text-white shadow-sm" style={{ backgroundColor: application.accent }}><Icon size={20} /></span><Badge tone={state.tone}>{state.text}</Badge></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#8294a7]">{domain.name}</p><h2 className="mt-1 text-lg font-bold text-[#1d3858]">{application.name}</h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-[#6a7f94]">{application.description}</p>
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#e3eaf0] pt-4 text-xs font-medium text-[#71859a]"><span className="flex items-center gap-1.5"><Building2 size={14} />{application.scenarioCount} scenarios</span><span className="flex items-center gap-1.5"><Clock3 size={14} />{application.duration}</span><span>{application.level}</span></div>
        <div className="mt-4">{application.id === "inventory" ? <Button className="w-full" onClick={() => navigate("scenarios")}>Enter learning path <ArrowRight size={16} /></Button> : <Button className="w-full" variant={selected ? "secondary" : "primary"} onClick={() => toggleInterest(application.id)}>{selected ? <><Check size={16} />Saved</> : application.status === "coming-soon" ? "Notify me" : "Explore"}</Button>}</div>
      </Card>;
    })}</div>{pageCount > 1 && <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Application pages"><Button variant="secondary" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ArrowLeft size={15}/>Previous</Button><span className="px-3 text-sm font-semibold text-[#637a90]">Page {page} of {pageCount}</span><Button variant="secondary" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next<ArrowRight size={15}/></Button></nav>}</> : <Card className="grid min-h-56 place-items-center p-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#edf3f8] text-[#587b9d]"><Search size={20} /></span><h2 className="mt-4 font-bold text-[#1b3554]">No matching applications found</h2><p className="mt-2 text-sm text-[#71859a]">Try another keyword or browse the full catalog.</p><Button className="mt-4" variant="secondary" onClick={() => { setQuery(""); setSelectedDomainId("all"); }}>Clear filters</Button></div></Card>}
  </div>;
}
