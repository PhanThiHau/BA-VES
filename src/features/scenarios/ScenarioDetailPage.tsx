import { ArrowLeft, Building2, CheckCircle2, Clock3, Database, FileText, LockKeyhole, Target, Users, Waypoints } from "lucide-react";
import { stakeholders } from "../../constants/scenario";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { RouteKey } from "../../types/models";

const systems = [
  ["Store POS", "20 stores", "Sends transactions in batches, sometimes with a 30–90 minute delay"],
  ["WMS", "DC + 3 regional warehouses", "Manages picking, transfers, returns, and adjustments"],
  ["ERP Finance", "Finance", "Records inventory value, accounting periods, and approvals"],
  ["Excel Planning", "Inventory Planner", "Forecasts, min-max settings, and promotions are still managed manually"],
];

const handoverFiles = [
  ["Project brief v1.0", "Objectives, VND 4 billion budget, and a six-month pilot"],
  ["Inventory snapshot 31/08", "Inventory by SKU, warehouse, and status"],
  ["SOP Receiving & Returns v2.1", "Receiving, returns, and quarantine processes"],
  ["POS–WMS API specification", "Existing transaction synchronization flow and error codes"],
  ["Q3 service report", "Stockout, fill rate, and inventory accuracy"],
];

export function ScenarioDetailPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  return <>
    <button onClick={() => navigate("scenarios")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#607995]"><ArrowLeft size={16} />Back to library</button>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#e4eef6] via-[#edf5f9] to-white p-7 sm:p-10">
            <div className="flex flex-wrap gap-2"><Badge>Supply Chain</Badge><Badge tone="amber">Intermediate</Badge><Badge tone="green">Practice session</Badge></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[.14em] text-[#67839d]">Enterprise assignment · INV-2026-014</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#173451] sm:text-4xl">Supply Chain Inventory Management</h1>
            <p className="mt-4 max-w-3xl leading-7 text-[#60778f]">You have been assigned as the BA for VinaSupply Retail. The company operates one distribution center, three regional warehouses, and twenty stores. Stockouts are at 12%, while inventory data across POS, WMS, and ERP is often inconsistent.</p>
          </div>
          <div className="p-7 sm:p-9">
            <div className="grid gap-5 md:grid-cols-2">
              <div><div className="flex items-center gap-3"><Building2 className="text-[#4d7599]" size={21}/><h2 className="text-lg font-bold text-[#1b3554]">Operating Context</h2></div><p className="mt-3 text-sm leading-6 text-[#60758b]">Warehouse teams need speed, Finance requires adjustment controls, the Planner wants transfers considered before new purchases, and stores need reliable ATP figures for customer promises.</p></div>
              <div><div className="flex items-center gap-3"><Waypoints className="text-[#6d65a1]" size={21}/><h2 className="text-lg font-bold text-[#1b3554]">BA Authority</h2></div><p className="mt-3 text-sm leading-6 text-[#60758b]">You may access stakeholders and sample data, propose MVP scope, and coordinate validation. The Sponsor approves scope, while the Director sets operational priorities.</p></div>
            </div>
            <h2 className="mt-9 text-xl font-bold text-[#1b3554]">Your Assignment</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">{["Clarify the business problem, scope, and KPIs", "Plan engagement with six stakeholders", "Elicit facts, rules, exceptions, and constraints", "Model the As-Is process and design the To-Be process", "Address conflicts and change events", "Submit a traceable artifact package"].map((task) => <div key={task} className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[#4f7fa8]" size={19} /><span className="text-[#556c84]">{task}</span></div>)}</div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[#e1e8ef] p-5"><Database className="text-[#397b68]" size={21}/><div><h2 className="font-bold text-[#1b3554]">Current System Landscape</h2><p className="text-sm text-[#7b8d9f]">Initial information to help the BA identify data sources and validation points.</p></div></div>
          <div className="grid gap-3 p-5 md:grid-cols-2">{systems.map(([name, owner, issue]) => <div key={name} className="rounded-xl border border-[#dfe7ee] bg-[#fafcfd] p-4"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-[#35516d]">{name}</strong><span className="rounded-full bg-[#e8f0f6] px-2 py-1 text-[11px] font-bold text-[#587895]">{owner}</span></div><p className="mt-2 text-sm leading-6 text-[#65798d]">{issue}</p></div>)}</div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-6"><div className="flex items-center gap-3"><FileText className="text-[#4d7498]"/><h2 className="font-bold text-[#1b3554]">Initial Handover Package</h2></div><div className="mt-5 space-y-3">{handoverFiles.map(([name, detail], index) => <div key={name} className="flex gap-3 rounded-xl border border-[#e0e7ed] p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#edf3f8] text-xs font-black text-[#557795]">{index + 1}</span><div><strong className="block text-sm text-[#3c5670]">{name}</strong><span className="mt-1 block text-xs leading-5 text-[#7c8c9d]">{detail}</span></div></div>)}</div></Card>
          <Card className="p-6"><div className="flex items-center gap-3"><LockKeyhole className="text-[#9a6c25]"/><h2 className="font-bold text-[#1b3554]">Known / Unknown boundary</h2></div><div className="mt-5 rounded-xl bg-[#edf6f1] p-4"><strong className="text-sm text-[#326b55]">Known</strong><p className="mt-2 text-sm leading-6 text-[#587469]">Current KPIs, network scope, system names, and primary stakeholder groups.</p></div><div className="mt-3 rounded-xl bg-[#fff7e9] p-4"><strong className="text-sm text-[#805f24]">BA Must Discover</strong><p className="mt-2 text-sm leading-6 text-[#75684f]">Root causes, implicit rules, exceptions, data quality, decision rights, KPI conflicts, and acceptance criteria.</p></div><p className="mt-4 text-xs leading-5 text-[#8493a2]">Stakeholder agents only know what their roles would know and may have incomplete or conflicting information. The system assesses how you validate information rather than giving you the answer.</p></Card>
        </div>

        <Card className="p-6"><h2 className="text-lg font-bold text-[#1b3554]">Available Stakeholders</h2><p className="mt-1 text-sm text-[#7b8c9d]">Each person has distinct goals, authority, and perspectives within the same company.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{stakeholders.map((person) => <div key={person.id} className="flex items-center gap-3 rounded-xl border border-[#e0e7ee] p-3"><span className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-[#284766]" style={{ backgroundColor: person.color }}>{person.initials}</span><div><strong className="block text-sm text-[#263e5b]">{person.name}</strong><span className="text-xs text-[#8090a2]">{person.role}</span></div></div>)}</div></Card>
      </div>
      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <Card className="p-6"><h2 className="font-bold text-[#1b3554]">Session Information</h2><div className="mt-5 space-y-4 text-sm">{[[Clock3,"Estimated 90 minutes"],[Users,"6 stakeholder agents"],[FileText,"5 required artifacts"],[Target,"6 Knowledge Areas observed"]].map(([Icon,text]) => <div key={String(text)} className="flex items-center gap-3 text-[#657a90]"><Icon size={18} className="text-[#5e83aa]" />{String(text)}</div>)}</div><Button onClick={() => navigate("planning")} className="mt-7 w-full">Accept assignment & plan</Button></Card>
        <Card className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#718aa3]">Expected Business Outcome</p><p className="mt-3 leading-6 text-[#60758c]">An evidence-based MVP proposal that resolves operational-control conflicts and traces business needs through to acceptance criteria.</p></Card>
        <Card className="border-[#d8e6f0] bg-[#f1f7fb] p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#567a98]">How BA‑VES Works</p><p className="mt-3 text-sm leading-6 text-[#5c7288]">BA‑VES does not reteach BABOK. You choose techniques, ask questions, analyze information, and make decisions; the system simulates business responses, captures evidence, and debriefs your practice.</p></Card>
      </aside>
    </div>
  </>;
}
