import { AlertTriangle, CheckCircle2, Clock3, Eye, FileCheck2, FileText, History, Link2, MessageSquareText, UploadCloud } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const tabs = ["Deliverable Package", "Upload & Versions", "AI / Expert review", "Complete Session"] as const;
type Tab = typeof tabs[number];

type DeliverableStatus = "approved" | "needs-revision" | "ai-reviewed" | "missing";

interface Deliverable {
  id: string;
  title: string;
  purpose: string;
  files: string;
  formats: string;
  version: string;
  status: DeliverableStatus;
  evidence: string;
  reviewer: string;
  required: boolean;
}

const deliverables: Deliverable[] = [
  { id: "DEL-01", title: "Business Analysis Plan", purpose: "BA approach, stakeholder engagement, governance, and information management.", files: "BA_Plan_v1.1.docx", formats: "DOCX · PDF", version: "v1.1", status: "approved", evidence: "N/A", reviewer: "Instructor", required: true },
  { id: "DEL-02", title: "Business Requirements Document", purpose: "VinaSupply’s problem, objectives, scope, stakeholder needs, and business requirements.", files: "BRD_Inventory_v1.2.docx", formats: "DOCX · PDF", version: "v1.2", status: "needs-revision", evidence: "7/9 evidence items", reviewer: "AI + Sponsor", required: true },
  { id: "DEL-03", title: "As-Is / To-Be Process Model", purpose: "Current and future replenishment processes, exceptions, and control points.", files: "Replenishment_Process.drawio · .pdf", formats: "DRAWIO + PDF/PNG", version: "v1.0", status: "ai-reviewed", evidence: "4/4 findings", reviewer: "Warehouse Manager", required: true },
  { id: "DEL-04", title: "Requirements Specification", purpose: "Business, stakeholder, functional, non-functional, and transition requirements.", files: "Requirements_Catalogue.xlsx", formats: "XLSX · DOCX · PDF", version: "v1.1", status: "needs-revision", evidence: "8/9 evidence items", reviewer: "AI + Product Owner", required: true },
  { id: "DEL-05", title: "Requirements Traceability Matrix", purpose: "Links objectives → evidence → requirements → acceptance criteria → KPIs.", files: "RTM_Inventory_v1.0.xlsx", formats: "XLSX · CSV", version: "v1.0", status: "ai-reviewed", evidence: "4/5 requirements", reviewer: "AI Reviewer", required: true },
  { id: "DEL-06", title: "Change & Solution Evaluation", purpose: "Supplier-delay impact, option analysis, and the MVP value-measurement plan.", files: "Not uploaded", formats: "DOCX · PDF", version: "—", status: "missing", evidence: "0/3 decisions", reviewer: "Director + Instructor", required: true },
  { id: "DEL-07", title: "Wireframe / Prototype", purpose: "Illustrates inventory visibility and transfer suggestions for stakeholders.", files: "Figma link", formats: "FIGMA URL · PDF · PNG", version: "v0.3", status: "ai-reviewed", evidence: "Optional", reviewer: "Inventory Planner", required: false },
];

const statusBadge = (status: DeliverableStatus) => {
  if (status === "approved") return <Badge tone="green">Approved</Badge>;
  if (status === "needs-revision") return <Badge tone="amber">Needs revision</Badge>;
  if (status === "ai-reviewed") return <Badge tone="navy">AI reviewed</Badge>;
  return <Badge tone="red">Not submitted</Badge>;
};

export function ArtifactsPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const [tab, setTab] = useState<Tab>("Deliverable Package");
  const [selectedId, setSelectedId] = useState("DEL-02");
  const selected = deliverables.find((item) => item.id === selectedId) ?? deliverables[1];

  return <>
    <PageHeader eyebrow="Step 4 of 5 · Final Deliverables" title="BA Artifacts" description="Upload, version, and review deliverables linked to your analysis evidence." actions={<><Button variant="secondary" onClick={() => navigate("analysis")}><Eye size={16}/>Analysis Hub</Button><Button onClick={() => setTab("Upload & Versions")}><UploadCloud size={16}/>Upload</Button></>} />

    <div className="mb-4 flex gap-1.5 overflow-x-auto rounded-xl border border-[#dfe7ef] bg-white p-1.5">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={classNames("shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition", tab === item ? "bg-[#dfeaf4] text-[#244f78]" : "text-[#708399] hover:bg-[#f2f5f8]")}>{item}</button>)}</div>

    {tab === "Deliverable Package" && <DeliverableList selectedId={selectedId} onSelect={setSelectedId} onUpload={() => setTab("Upload & Versions")} />}
    {tab === "Upload & Versions" && <UploadWorkspace selected={selected} onSelect={setSelectedId} />}
    {tab === "AI / Expert review" && <ReviewWorkspace navigate={navigate} />}
    {tab === "Complete Session" && <CompletionGate navigate={navigate} />}
  </>;
}

function DeliverableList({ selectedId, onSelect, onUpload }: { selectedId: string; onSelect: (id: string) => void; onUpload: () => void }) {
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e2e9ef] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#203b59]">Deliverable package · Inventory Management</h2><p className="mt-1 text-sm text-[#7a8c9e]">6 required documents · 1 optional document</p></div><Badge tone="amber">4 of 6 meet the gate</Badge></div><div className="divide-y divide-[#e6edf2]">{deliverables.map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={classNames("grid w-full gap-4 p-5 text-left transition hover:bg-[#f8fafc] md:grid-cols-[1fr_150px_130px] md:items-center", selectedId === item.id ? "bg-[#f1f6fa]" : "bg-white")}><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f0f6] text-[#4e7395]"><FileText size={19}/></span><div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-[#6d8499]">{item.id}</span>{item.required ? <span className="text-[10px] font-bold uppercase text-[#a16624]">Required</span> : <span className="text-[10px] font-bold uppercase text-[#7f8e9d]">Optional</span>}</div><h3 className="mt-1 font-bold text-[#324d68]">{item.title}</h3><p className="mt-1 text-sm leading-5 text-[#748698]">{item.purpose}</p></div></div><div><p className="text-xs text-[#8a98a6]">Current file</p><p className="mt-1 break-words text-sm font-semibold text-[#4d6881]">{item.files}</p></div><div className="md:text-right">{statusBadge(item.status)}<p className="mt-2 text-xs text-[#8090a0]">{item.evidence}</p></div></button>)}</div></Card>
    <aside className="space-y-5"><Card className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#71879d]">Deliverable progress</p><div className="mt-4 flex items-end justify-between"><strong className="text-4xl text-[#244766]">67%</strong><span className="text-sm text-[#7d8e9f]">4 of 6 passed</span></div><div className="mt-4"><ProgressBar value={67}/></div><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-[#728599]">Approved</span><strong className="text-[#2f7358]">1</strong></div><div className="flex justify-between"><span className="text-[#728599]">In review / revision</span><strong className="text-[#9a671e]">4</strong></div><div className="flex justify-between"><span className="text-[#728599]">Not submitted</span><strong className="text-[#a34d61]">1</strong></div></div><Button onClick={onUpload} className="mt-6 w-full"><UploadCloud size={16}/>Upload new version</Button></Card><Card className="p-5"><h2 className="font-bold text-[#203b59]">File Submission Rules</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#64798e]"><li>• Large documents are created with external tools.</li><li>• Do not overwrite previous versions.</li><li>• A draw.io file must include a PDF or PNG export.</li><li>• Required deliverables must be linked to evidence.</li><li>• AI does not author the work; it only checks and challenges it.</li></ul></Card></aside>
  </div>;
}

function UploadWorkspace({ selected, onSelect }: { selected: Deliverable; onSelect: (id: string) => void }) {
  return <div className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
    <Card className="h-fit overflow-hidden"><div className="border-b border-[#e2e9ef] p-5"><h2 className="font-bold text-[#203b59]">Select deliverable</h2></div><div className="p-2">{deliverables.filter((item) => item.required).map((item) => <button key={item.id} onClick={() => onSelect(item.id)} className={classNames("flex w-full items-center justify-between rounded-xl px-3 py-3 text-left", selected.id === item.id ? "bg-[#e8f1f7]" : "hover:bg-[#f5f8fa]")}><div><span className="text-xs font-bold text-[#71869b]">{item.id}</span><p className="mt-1 text-sm font-semibold text-[#405a74]">{item.title}</p></div>{statusBadge(item.status)}</button>)}</div></Card>
    <div className="space-y-5"><Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#70869c]">{selected.id} · {selected.required ? "Required" : "Optional"}</p><h2 className="mt-1 text-xl font-bold text-[#203b59]">{selected.title}</h2><p className="mt-2 text-sm leading-6 text-[#6a7e92]">{selected.purpose}</p></div>{statusBadge(selected.status)}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#f4f7fa] p-3"><span className="text-xs text-[#8191a1]">Formats</span><strong className="mt-1 block text-sm text-[#405c76]">{selected.formats}</strong></div><div className="rounded-xl bg-[#f4f7fa] p-3"><span className="text-xs text-[#8191a1]">Reviewer</span><strong className="mt-1 block text-sm text-[#405c76]">{selected.reviewer}</strong></div><div className="rounded-xl bg-[#f4f7fa] p-3"><span className="text-xs text-[#8191a1]">Version</span><strong className="mt-1 block text-sm text-[#405c76]">{selected.version}</strong></div></div><div className="mt-6 grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-[#bdcfdd] bg-[#f8fbfd] p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e5eff6] text-[#4c7599]"><UploadCloud size={23}/></span><h3 className="mt-4 font-bold text-[#294762]">Drag and drop a file or choose one from your device</h3><p className="mt-2 text-sm text-[#7a8d9f]">Supports {selected.formats} · maximum 50 MB per file</p><Button className="mt-4">Choose file</Button></div></div><label className="mt-5 block"><span className="text-sm font-bold text-[#405a73]">Describe the changes in this version</span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#dbe4ec] bg-white p-3 text-sm text-[#4c647c] outline-none" placeholder="Example: Added the period-lock exception and updated acceptance criteria for FR-08..."/></label><div className="mt-4 flex flex-wrap gap-3"><Button><UploadCloud size={16}/>Upload & create new version</Button><Button variant="secondary"><Link2 size={16}/>Link evidence</Button></div></Card>
      <Card className="overflow-hidden"><div className="flex items-center gap-3 border-b border-[#e2e9ef] p-5"><History className="text-[#5d7297]"/><h2 className="font-bold text-[#203b59]">Version History</h2></div><div className="divide-y divide-[#e6edf2]">{[["v1.2","18/09 · 16:42","Added business rules and KPIs","Needs revision"],["v1.1","17/09 · 10:15","Revised scope based on Sponsor feedback","AI reviewed"],["v1.0","16/09 · 17:05","Initial submission","Superseded"]].map(([version,time,change,status]) => <div key={version} className="grid gap-3 p-5 sm:grid-cols-[80px_1fr_140px] sm:items-center"><strong className="text-[#345775]">{version}</strong><div><p className="text-sm font-semibold text-[#4a627a]">{change}</p><span className="text-xs text-[#8795a3]">{time} · Minh Nguyen</span></div><span className="text-sm text-[#6e8194]">{status}</span></div>)}</div></Card>
    </div>
  </div>;
}

function ReviewWorkspace({ navigate }: { navigate: (route: RouteKey) => void }) {
  return <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
    <div className="space-y-5"><Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold text-[#70869c]">DEL-02 · BRD Inventory v1.2</p><h2 className="mt-1 text-xl font-bold text-[#203b59]">AI Pre-review Results</h2></div><Badge tone="amber">3 findings require action</Badge></div><div className="mt-5 space-y-3">{[["High","REQ-08 is not measurable","The phrase “select the most suitable warehouse” does not define criteria based on ETA, cost, or stock remaining after safety stock.","Section 5.3"],["Medium","Missing exception","The BRD does not describe inventory adjustments when the accounting period is locked.","Section 6.2"],["Medium","Evidence coverage","The promotion-uplift business rule is not linked to EV-07 from the Inventory Planner.","Section 4.4"]].map(([severity,title,copy,location]) => <div key={title} className="rounded-xl border border-[#e6ddc9] bg-[#fffaf2] p-4"><div className="flex items-start justify-between gap-3"><div><Badge tone={severity === "High" ? "red" : "amber"}>{severity}</Badge><strong className="ml-2 text-sm text-[#5f512f]">{title}</strong></div><span className="text-xs text-[#8d7b5d]">{location}</span></div><p className="mt-3 text-sm leading-6 text-[#71664f]">{copy}</p></div>)}</div></Card><Card className="p-6"><div className="flex items-center gap-3"><MessageSquareText className="text-[#5d659d]"/><h2 className="font-bold text-[#203b59]">Expert / Stakeholder Feedback</h2></div><div className="mt-5 space-y-4"><div className="rounded-xl bg-[#f2f5fb] p-4"><strong className="text-sm text-[#4f5687]">Supply Chain Director</strong><p className="mt-2 text-sm italic leading-6 text-[#626c85]">“The transfer-first section is sound, but I need override authority and holding-cost impacts in the same decision table.”</p></div><div className="rounded-xl bg-[#eef6f2] p-4"><strong className="text-sm text-[#3e705d]">Instructor · Tran Minh Anh</strong><p className="mt-2 text-sm leading-6 text-[#5e746b]">Update the change event in the BRD, RTM, and Solution Evaluation rather than revising only one document.</p></div></div></Card></div>
    <aside className="space-y-5"><Card className="p-5"><h2 className="font-bold text-[#203b59]">Review pipeline</h2><div className="mt-5 space-y-4">{[["Upload & virus scan",true],["AI structure check",true],["Evidence coverage",true],["Stakeholder review",false],["Instructor approval",false]].map(([label,done],index) => <div key={String(label)} className="flex gap-3"><span className={classNames("grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",done ? "bg-[#dcefe6] text-[#2b7456]" : "bg-[#eef1f4] text-[#7f8d9b]")}>{done ? <CheckCircle2 size={14}/> : index + 1}</span><span className="text-sm font-semibold text-[#536b82]">{String(label)}</span></div>)}</div></Card><Card className="p-5"><h2 className="font-bold text-[#203b59]">Assessment Principles</h2><p className="mt-3 text-sm leading-6 text-[#687c90]">AI and experts compare deliverables with evidence in the Analysis Hub. AI does not add requirements for the learner or approve documents on its own.</p><Button variant="secondary" onClick={() => navigate("analysis")} className="mt-5 w-full"><Link2 size={16}/>Cross-check evidence</Button></Card></aside>
  </div>;
}

function CompletionGate({ navigate }: { navigate: (route: RouteKey) => void }) {
  const processChecks = [["All key stakeholders covered",true,"6 of 6 engaged"],["Evidence has sources and confidence levels",true,"9 evidence items"],["Findings validated",false,"3 of 4 confirmed"],["Conflicts have accountable owners",true,"1 resolved · 1 monitored"],["Change impact analyzed",true,"Event MILK-01"]];
  const fileChecks = [["All required documents submitted",false,"5 of 6 uploaded"],["No high-severity issues remain",false,"BRD has one high-severity issue"],["Evidence coverage meets threshold",true,"87%"],["Stakeholder sign-off",false,"2 documents pending"],["Instructor approval",false,"1/6 approved"]];
  return <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
    <div className="grid gap-5 lg:grid-cols-2"><GateCard title="Gate A · BA Process" description="Assessed from Analysis & Confirmation" items={processChecks}/><GateCard title="Gate B · Final Deliverables" description="Assessed from BA Artifact files" items={fileChecks}/></div>
    <aside className="space-y-5"><Card className="p-6"><FileCheck2 className="text-[#537b9e]"/><p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#73889d]">Session completion</p><h2 className="mt-2 text-2xl font-bold text-[#203b59]">Session cannot be completed yet</h2><p className="mt-3 text-sm leading-6 text-[#6c8094]">The learner must pass both Gate A for the work process and Gate B for final deliverables.</p><div className="mt-5 space-y-3"><div><div className="mb-2 flex justify-between text-sm"><span>Gate A</span><strong>80%</strong></div><ProgressBar value={80}/></div><div><div className="mb-2 flex justify-between text-sm"><span>Gate B</span><strong>42%</strong></div><ProgressBar value={42} color="#9b762f"/></div></div><Button disabled className="mt-6 w-full">Complete session & view assessment</Button></Card><Card className="border-[#eadfc8] bg-[#fffaf2] p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-[#9d6a22]" size={19}/><div><h3 className="font-bold text-[#684f25]">Next Actions</h3><ul className="mt-2 space-y-2 text-sm leading-5 text-[#776a51]"><li>• Follow up with the operator to validate FND-04.</li><li>• Upload the Change & Solution Evaluation.</li><li>• Resolve the high-severity issue in the BRD.</li><li>• Send documents to stakeholders and the instructor for approval.</li></ul></div></div></Card><button onClick={() => navigate("analysis")} className="w-full text-sm font-bold text-[#52789a]">Back to Analysis & Confirmation</button></aside>
  </div>;
}

function GateCard({ title, description, items }: { title: string; description: string; items: Array<(string | boolean)[]> }) {
  return <Card className="p-6"><h2 className="text-lg font-bold text-[#203b59]">{title}</h2><p className="mt-1 text-sm text-[#7b8c9d]">{description}</p><div className="mt-5 space-y-3">{items.map(([label,done,note]) => <div key={String(label)} className="rounded-xl border border-[#e0e7ee] p-4"><div className="flex items-start gap-3">{done ? <CheckCircle2 className="mt-0.5 shrink-0 text-[#2f7b5a]" size={19}/> : <Clock3 className="mt-0.5 shrink-0 text-[#a06c20]" size={19}/>}<div><strong className="text-sm text-[#3d5771]">{String(label)}</strong><p className="mt-1 text-xs text-[#8190a0]">{String(note)}</p></div></div></div>)}</div></Card>;
}
