import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  GitBranch,
  GraduationCap,
  Layers3,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
  Waypoints,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { classNames } from "../../utils/format";

const tabs = ["Overview", "Scenario Design", "Live Sessions", "Review Queue", "Learners"] as const;
type InstructorTab = typeof tabs[number];

const reviewItems = [
  { learner: "Nguyen Minh Anh", id: "INV-2026-014", stage: "Final deliverables", score: 72, confidence: 86, issue: "BRD has one high-severity finding", due: "Today · 16:30", tone: "red" as const },
  { learner: "Le Phuong Thao", id: "INV-2026-018", stage: "Analysis & confirmation", score: 78, confidence: 89, issue: "FND-04 awaiting stakeholder confirmation", due: "Today · 17:00", tone: "amber" as const },
  { learner: "Tran Hai Nam", id: "INV-2026-009", stage: "AI assessment complete", score: 65, confidence: 71, issue: "Low-confidence conflict-resolution score", due: "Tomorrow · 09:00", tone: "amber" as const },
  { learner: "Pham Thanh Tung", id: "INV-2026-021", stage: "Final deliverables", score: 69, confidence: 76, issue: "RTM evidence coverage below threshold", due: "Tomorrow · 11:00", tone: "navy" as const },
];

const scenarioLayers = [
  { title: "Business context & ground truth", description: "Company model, problem, baseline, constraints, systems, and facts learners must discover.", status: "Ready", completion: 100, icon: Layers3 },
  { title: "Stakeholder personas & knowledge boundaries", description: "Goals, authority, vocabulary, known facts, hidden information, and conflicting positions.", status: "6 agents", completion: 100, icon: Bot },
  { title: "Elicitation evidence model", description: "Expected facts, business rules, exceptions, data signals, and valid source mappings.", status: "9 evidence", completion: 92, icon: MessageSquareText },
  { title: "Dynamic events & decision branches", description: "Supplier delay, offline scanning, period lock, and promotion-demand changes.", status: "4 events", completion: 80, icon: GitBranch },
  { title: "Expected outcomes & deliverable gates", description: "Minimum analysis coverage, required documents, review sequence, and closure criteria.", status: "6 deliverables", completion: 84, icon: FileCheck2 },
  { title: "BABOK-aligned assessment rubric", description: "Observable behaviors, evidence rules, score anchors, confidence, and expert moderation notes.", status: "10 criteria", completion: 90, icon: ClipboardCheck },
];

const liveSessions = [
  { learner: "Le Phuong Thao", stage: "Stakeholder interview", progress: 48, elapsed: "42:18", signal: "Repeated leading questions", severity: "Coach signal", stakeholder: "Inventory Planner" },
  { learner: "Doan Gia Bao", stage: "Change impact analysis", progress: 71, elapsed: "68:04", signal: "Supplier-delay event active", severity: "Dynamic event", stakeholder: "Supply Chain Director" },
  { learner: "Hoang My Linh", stage: "Analysis & confirmation", progress: 64, elapsed: "59:32", signal: "Two unsupported assumptions", severity: "Evidence gap", stakeholder: "Finance Manager" },
  { learner: "Vu Duc Anh", stage: "Final deliverables", progress: 88, elapsed: "84:10", signal: "No intervention required", severity: "On track", stakeholder: "AI reviewer" },
];

const competencyRows = [
  ["Nguyen Minh Anh", 74, 81, 78, 70, "Review change-impact planning"],
  ["Le Phuong Thao", 82, 79, 76, 73, "Confirm offline NFR evidence"],
  ["Tran Hai Nam", 68, 72, 61, 66, "Schedule conflict-facilitation replay"],
  ["Pham Thanh Tung", 71, 75, 69, 64, "Improve traceability coverage"],
  ["Hoang My Linh", 77, 73, 74, 71, "Validate assumptions before design"],
] as const;

export function InstructorPage() {
  const [tab, setTab] = useState<InstructorTab>("Overview");

  return <>
    <PageHeader
      eyebrow="Instructor workspace · Inventory Management"
      title="Run practice. Observe performance. Moderate outcomes."
      description="Design the enterprise environment, monitor learner behavior, and ensure every assessment is supported by evidence. BA‑VES does not require the instructor to teach BABOK theory inside the simulation."
      actions={<><Button variant="secondary"><Settings2 size={16}/>Program settings</Button><Button onClick={() => setTab("Scenario Design")}><Plus size={16}/>New practice scenario</Button></>}
    />

    <Card className="mb-5 overflow-hidden border-[#cadce8]">
      <div className="grid lg:grid-cols-[1.25fr_.75fr]">
        <div className="bg-gradient-to-br from-[#173f5f] to-[#285f86] p-6 text-white sm:p-7">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12 text-[#c3e0ef]"><ShieldCheck size={24}/></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#a9c8da]">Instructor responsibility</p><h2 className="mt-2 text-xl font-bold">Create a fair, realistic practice environment</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#c8d9e4]">The instructor defines what is true in the enterprise, what each stakeholder knows, which learner behaviors count as evidence, and when expert judgment must override or calibrate the AI score.</p></div></div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[#dfe8ee]">
          <div className="bg-[#f7fafc] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#71879a]">Instructor does</p><ul className="mt-3 space-y-2 text-sm text-[#526b81]"><li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#328064]"/>Configure and validate scenarios</li><li className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#328064]"/>Moderate evidence-based scores</li></ul></div>
          <div className="bg-[#fffaf1] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#8b6a35]">Instructor avoids</p><ul className="mt-3 space-y-2 text-sm text-[#72664f]"><li className="flex gap-2"><span className="text-[#af7928]">×</span>Giving answers during a session</li><li className="flex gap-2"><span className="text-[#af7928]">×</span>Editing learner deliverables</li></ul></div>
        </div>
      </div>
    </Card>

    <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-[#dfe7ef] bg-white p-2" role="tablist" aria-label="Instructor workspace sections">
      {tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={classNames("shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition", tab === item ? "bg-[#dfeaf4] text-[#244f78]" : "text-[#708399] hover:bg-[#f2f5f8]")}>{item}</button>)}
    </div>

    {tab === "Overview" && <OverviewTab setTab={setTab}/>}
    {tab === "Scenario Design" && <ScenarioDesignTab/>}
    {tab === "Live Sessions" && <LiveSessionsTab setTab={setTab}/>}
    {tab === "Review Queue" && <ReviewQueueTab/>}
    {tab === "Learners" && <LearnersTab/>}
  </>;
}

function OverviewTab({ setTab }: { setTab: (tab: InstructorTab) => void }) {
  const metrics = [
    { icon: Users, value: "32", label: "Learners in active cohorts", note: "4 need instructor attention", tone: "bg-[#e6f0f7] text-[#38698e]" },
    { icon: Activity, value: "04", label: "Live simulation sessions", note: "2 coach signals raised", tone: "bg-[#e8f5ef] text-[#33765d]" },
    { icon: FileCheck2, value: "18", label: "Submissions awaiting review", note: "3 due today", tone: "bg-[#fff1dd] text-[#98651b]" },
    { icon: BarChart3, value: "71.4", label: "Cohort performance average", note: "+4.8 points from last case", tone: "bg-[#eeebf7] text-[#625996]" },
  ];
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({icon:Icon,value,label,note,tone}) => <Card key={label} className="p-5"><div className="flex items-start justify-between"><span className={classNames("grid h-11 w-11 place-items-center rounded-xl",tone)}><Icon size={20}/></span><MoreHorizontal size={18} className="text-[#93a1ae]"/></div><strong className="metric-number mt-5 block text-3xl text-[#1f3d5e]">{value}</strong><span className="mt-1 block text-sm font-semibold text-[#526b83]">{label}</span><span className="mt-2 block text-xs text-[#8291a1]">{note}</span></Card>)}</div>

    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e3e9ef] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#203b59]">Instructor attention queue</h2><p className="mt-1 text-sm text-[#7d8d9e]">Cases that require human judgment, not routine AI feedback.</p></div><button onClick={() => setTab("Review Queue")} className="flex items-center gap-1 text-sm font-bold text-[#4e7396]">Open review queue <ArrowRight size={15}/></button></div><div className="divide-y divide-[#e6edf2]">{reviewItems.slice(0,3).map((item) => <button key={item.learner} onClick={() => setTab("Review Queue")} className="grid w-full gap-3 p-5 text-left transition hover:bg-[#f8fafc] md:grid-cols-[1fr_130px_120px] md:items-center"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e7eff5] text-xs font-black text-[#456c8d]">{item.learner.split(" ").slice(-2).map(part => part[0]).join("")}</span><div><strong className="text-sm text-[#3b5670]">{item.learner}</strong><p className="mt-1 text-xs text-[#8291a0]">{item.id} · {item.stage}</p><p className="mt-2 text-sm text-[#667b8f]">{item.issue}</p></div></div><div><span className="text-xs text-[#8594a3]">AI result</span><p className="mt-1 font-bold text-[#315a7d]">{item.score}/100 <span className="text-xs font-medium text-[#8392a1]">· {item.confidence}% confidence</span></p></div><div className="md:text-right"><Badge tone={item.tone}>{item.due}</Badge></div></button>)}</div></Card>

      <div className="space-y-5"><Card className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#71879a]">Active scenario readiness</p><h2 className="mt-1 font-bold text-[#203b59]">Inventory Management · v1.3</h2></div><Badge tone="green">Ready</Badge></div><div className="mt-5"><div className="mb-2 flex justify-between text-sm"><span className="text-[#687d91]">Configuration coverage</span><strong className="text-[#315d80]">91%</strong></div><ProgressBar value={91}/></div><div className="mt-5 space-y-3">{[["Ground truth verified",true],["6 agent boundaries tested",true],["Dynamic events rehearsed",true],["Rubric calibration sampled",false]].map(([label,done]) => <div key={String(label)} className="flex items-center gap-3"><span className={classNames("grid h-6 w-6 place-items-center rounded-full",done ? "bg-[#e1f2e9] text-[#2f785b]" : "bg-[#fff1dc] text-[#9c6a20]")}>{done ? <Check size={14}/> : <Clock3 size={13}/>}</span><span className="text-sm text-[#5f758a]">{String(label)}</span></div>)}</div><Button variant="secondary" onClick={() => setTab("Scenario Design")} className="mt-6 w-full"><Settings2 size={16}/>Review scenario configuration</Button></Card>
      <Card className="border-[#d5e3ec] bg-[#f3f8fb] p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-[#4f7898]" size={19}/><div><h3 className="font-bold text-[#345470]">Moderation principle</h3><p className="mt-2 text-sm leading-6 text-[#64798d]">Review the learner’s transcript, evidence, decisions, and submitted files together. Never approve a score from the final document alone.</p></div></div></Card></div>
    </div>
  </div>;
}

function ScenarioDesignTab() {
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
    <div className="space-y-5"><Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e2e9ef] p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#71879c]">Scenario blueprint · INV-2026</p><h2 className="mt-1 text-lg font-bold text-[#203b59]">Supply Chain Inventory Management</h2><p className="mt-1 text-sm text-[#7b8d9f]">Build the enterprise reality before learners enter the session.</p></div><div className="flex gap-2"><Button variant="secondary"><Eye size={16}/>Preview as learner</Button><Button><Play size={16}/>Run test session</Button></div></div><div className="grid gap-4 p-5 lg:grid-cols-2">{scenarioLayers.map(({title,description,status,completion,icon:Icon}) => <button key={title} className="rounded-2xl border border-[#dfe7ed] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#a9bfd0] hover:shadow-sm"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f1f7] text-[#3e6d91]"><Icon size={19}/></span><Badge tone={completion === 100 ? "green" : "amber"}>{status}</Badge></div><h3 className="mt-4 font-bold text-[#36516c]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#718396]">{description}</p><div className="mt-4"><ProgressBar value={completion}/></div></button>)}</div></Card>

      <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-[#e2e9ef] p-5"><div><h2 className="font-bold text-[#203b59]">Stakeholder agent roster</h2><p className="mt-1 text-sm text-[#7b8d9e]">Test that each agent answers only within its role and knowledge boundary.</p></div><Button variant="secondary"><Plus size={16}/>Add persona</Button></div><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-[#f5f8fa] text-xs uppercase tracking-wider text-[#7b8da0]"><tr><th className="px-5 py-4">Agent</th><th className="px-5 py-4">Business goal</th><th className="px-5 py-4">Decision authority</th><th className="px-5 py-4">Knowledge boundary</th><th className="px-5 py-4">Test status</th></tr></thead><tbody className="divide-y divide-[#e6edf2]">{[["Supply Chain Director","Service level & network cost","Pilot scope and override policy","Does not know scanner details","Passed"],["Warehouse Manager","Throughput & stock accuracy","Warehouse operating procedure","Does not own financial approval","Passed"],["Inventory Planner","Availability & replenishment","Transfer and PO recommendation","Cannot approve adjustments","Passed"],["Finance Manager","Valuation, audit & controls","Approval thresholds","Does not manage picking work","Needs retest"],["Warehouse Operator","Fast, usable execution","No policy authority","Knows actual workarounds","Passed"],["Project Sponsor","Value, budget & timeline","Budget and project scope","Limited operational detail","Passed"]].map(([role,goal,authority,boundary,status]) => <tr key={role}><td className="px-5 py-4 font-bold text-[#3a5570]">{role}</td><td className="px-5 py-4 text-[#61768a]">{goal}</td><td className="px-5 py-4 text-[#61768a]">{authority}</td><td className="px-5 py-4 text-[#61768a]">{boundary}</td><td className="px-5 py-4"><Badge tone={status === "Passed" ? "green" : "amber"}>{status}</Badge></td></tr>)}</tbody></table></div></Card></div>

    <aside className="space-y-5"><Card className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-[#70869b]">Publish readiness · 5/6</p><div className="mt-5 space-y-4">{[["Business problem has measurable baseline",true],["Ground truth is internally consistent",true],["Agent knowledge boundaries tested",true],["Events map to decisions and risks",true],["Expected evidence is traceable",true],["Rubric inter-rater calibration complete",false]].map(([label,done]) => <div key={String(label)} className="flex gap-3">{done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#337a5c]"/> : <CircleHelp size={18} className="mt-0.5 shrink-0 text-[#a06d21]"/>}<span className="text-sm leading-5 text-[#60758a]">{String(label)}</span></div>)}</div><Button disabled className="mt-6 w-full">Publish scenario version</Button><p className="mt-3 text-center text-xs text-[#8795a3]">Complete rubric calibration to publish v1.4.</p></Card><Card className="border-[#eadfc8] bg-[#fffaf2] p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-[#9b6921]" size={18}/><div><h3 className="font-bold text-[#674f26]">Fairness check</h3><p className="mt-2 text-sm leading-6 text-[#756951]">A learner must be able to discover every assessed fact through at least one accessible stakeholder or source document.</p></div></div></Card></aside>
  </div>;
}

function LiveSessionsTab({ setTab }: { setTab: (tab: InstructorTab) => void }) {
  return <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e2e9ef] p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#3a966e]"/><h2 className="font-bold text-[#203b59]">4 sessions live now</h2></div><p className="mt-1 text-sm text-[#7b8d9f]">Monitor signals without revealing the answer or changing the enterprise ground truth.</p></div><div className="flex gap-2"><Button variant="secondary"><Filter size={16}/>Signals</Button><Button variant="secondary"><Activity size={16}/>Session wall</Button></div></div><div className="divide-y divide-[#e6edf2]">{liveSessions.map((session,index) => <div key={session.learner} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="flex min-w-[240px] items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e6eff5] text-xs font-black text-[#456b8a]">{session.learner.split(" ").slice(-2).map(part=>part[0]).join("")}</span><div><strong className="text-sm text-[#3a5570]">{session.learner}</strong><p className="mt-1 text-xs text-[#8292a1]">{session.stage}</p></div></div><div className="flex-1"><div className="mb-2 flex justify-between text-xs"><span className="text-[#71869a]">Progress · {session.progress}%</span><span className="flex items-center gap-1 text-[#8292a1]"><Clock3 size={13}/>{session.elapsed}</span></div><ProgressBar value={session.progress} color={index === 3 ? "#4d8a70" : "#5b80a1"}/></div><div className="min-w-[220px]"><Badge tone={session.severity === "On track" ? "green" : session.severity === "Dynamic event" ? "navy" : "amber"}>{session.severity}</Badge><p className="mt-2 text-sm font-semibold text-[#546c83]">{session.signal}</p><p className="mt-1 text-xs text-[#8795a3]">With: {session.stakeholder}</p></div><button className="grid h-10 w-10 place-items-center rounded-xl border border-[#d6e1e9] text-[#5d7790] hover:bg-[#f3f7fa]" aria-label={`Observe ${session.learner}'s session`}><Eye size={17}/></button></div></div>)}</div></Card>
    <aside className="space-y-5"><Card className="p-5"><h2 className="font-bold text-[#203b59]">Intervention policy</h2><div className="mt-5 space-y-4">{[["Observe","Read transcript and signals without entering the session."],["Coach","Offer a technique-level prompt, never the business answer."],["Pause","Use only for safety, technical failure, or invalid scenario behavior."],["Flag for review","Preserve evidence for post-session moderation."]].map(([title,copy],index)=><div key={title} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#e8f0f6] text-xs font-black text-[#456c8e]">{index+1}</span><div><strong className="text-sm text-[#3d5872]">{title}</strong><p className="mt-1 text-xs leading-5 text-[#788a9b]">{copy}</p></div></div>)}</div></Card><Card className="border-[#d7e5ee] bg-[#f2f8fb] p-5"><h3 className="font-bold text-[#355773]">After the session</h3><p className="mt-2 text-sm leading-6 text-[#65798c]">Signals do not automatically reduce a score. Review them in context with the learner’s recovery, evidence quality, and final reasoning.</p><Button variant="secondary" onClick={()=>setTab("Review Queue")} className="mt-4 w-full">Open moderation queue <ArrowRight size={15}/></Button></Card></aside>
  </div>;
}

function ReviewQueueTab() {
  const [selected, setSelected] = useState(0);
  const item = reviewItems[selected];
  return <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
    <Card className="h-fit overflow-hidden"><div className="border-b border-[#e2e9ef] p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-[#203b59]">Moderation queue</h2><p className="mt-1 text-sm text-[#7b8d9f]">Prioritized by severity, low confidence, and deadline.</p></div><span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#e8f0f6] px-2 text-xs font-black text-[#3f6788]">18</span></div><label className="mt-4 flex items-center gap-2 rounded-xl bg-[#f3f7f9] px-3 py-2 text-[#8292a2]"><Search size={16}/><input className="w-full bg-transparent text-sm text-[#405a72] outline-none" placeholder="Search learner or session..."/></label></div><div className="p-2">{reviewItems.map((entry,index)=><button key={entry.learner} onClick={()=>setSelected(index)} className={classNames("w-full rounded-xl p-3 text-left transition",selected===index ? "bg-[#eaf2f7]" : "hover:bg-[#f5f8fa]")}><div className="flex items-start justify-between gap-3"><div><strong className="text-sm text-[#3c5670]">{entry.learner}</strong><p className="mt-1 text-xs text-[#8191a0]">{entry.id} · Score {entry.score}</p></div><Badge tone={entry.tone}>{entry.due.split(" · ")[0]}</Badge></div><p className="mt-2 text-xs leading-5 text-[#677b8f]">{entry.issue}</p></button>)}</div></Card>

    <div className="space-y-5"><Card className="overflow-hidden"><div className="flex flex-col gap-4 border-b border-[#e2e9ef] bg-[#f7fafc] p-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold text-[#70869b]">{item.id} · {item.stage}</p><h2 className="mt-1 text-xl font-bold text-[#203b59]">{item.learner}</h2><p className="mt-2 text-sm text-[#6f8295]">AI score {item.score}/100 · Confidence {item.confidence}% · Due {item.due}</p></div><div className="flex gap-2"><Button variant="secondary"><Eye size={16}/>Open evidence</Button><Button><UserCheck size={16}/>Start moderation</Button></div></div><div className="p-6"><div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-[#edf4f8] p-4"><span className="text-xs text-[#788b9d]">Process evidence</span><strong className="mt-1 block text-xl text-[#315778]">87%</strong><p className="mt-1 text-xs text-[#8493a2]">Transcript and decisions</p></div><div className="rounded-xl bg-[#eef6f2] p-4"><span className="text-xs text-[#6e887d]">Deliverable gate</span><strong className="mt-1 block text-xl text-[#376d58]">5/6</strong><p className="mt-1 text-xs text-[#84938e]">Required files submitted</p></div><div className="rounded-xl bg-[#fff6e7] p-4"><span className="text-xs text-[#927b51]">Review flags</span><strong className="mt-1 block text-xl text-[#8a6221]">03</strong><p className="mt-1 text-xs text-[#95866d]">One high severity</p></div></div>
        <h3 className="mt-7 font-bold text-[#2c4863]">Evidence-based moderation checklist</h3><div className="mt-4 space-y-3">{[["Elicitation behavior","Did questioning uncover facts, rules, exceptions, and conflicts without leading the agent?","Pass"],["Analysis quality","Are findings separated from assumptions and linked to reliable evidence?","Pass"],["Requirement quality","Are requirements clear, feasible, testable, valuable, and traceable?","Review"],["Change response","Did the learner update risks, decisions, requirements, and deliverables after the event?","Review"],["Artifact consistency","Do BRD, process model, requirement catalogue, and RTM tell the same story?","Review"]].map(([title,copy,status])=><div key={title} className="flex gap-3 rounded-xl border border-[#dfe7ed] p-4"><span className={classNames("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",status==="Pass"?"bg-[#e1f2e9] text-[#32775b]":"bg-[#fff1dc] text-[#9c6a20]")}>{status==="Pass"?<Check size={14}/>:<CircleHelp size={14}/>}</span><div className="flex-1"><div className="flex items-center justify-between gap-3"><strong className="text-sm text-[#405b75]">{title}</strong><span className="text-xs font-bold text-[#71869a]">{status}</span></div><p className="mt-1 text-xs leading-5 text-[#77899b]">{copy}</p></div></div>)}</div></div></Card>
      <Card className="p-6"><h2 className="font-bold text-[#203b59]">Instructor decision</h2><p className="mt-2 text-sm leading-6 text-[#6b7f92]">Record why you agree with or change the AI result. Every score override must cite observable evidence.</p><textarea className="mt-4 min-h-28 w-full rounded-xl border border-[#d9e3eb] bg-[#fafcfd] p-3 text-sm leading-6 text-[#405a73] outline-none focus:border-[#7b9ab5]" placeholder="Moderation note and evidence references..."/><div className="mt-4 flex flex-wrap justify-end gap-2"><Button variant="secondary">Request learner revision</Button><Button variant="secondary">Adjust score</Button><Button>Confirm assessment</Button></div></Card></div>
  </div>;
}

function LearnersTab() {
  return <div className="space-y-5">
    <Card className="overflow-hidden"><div className="flex flex-col gap-3 border-b border-[#e2e9ef] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#203b59]">Cohort competency evidence</h2><p className="mt-1 text-sm text-[#7b8d9f]">Use patterns across multiple scenarios—not one score—to plan the next practice experience.</p></div><div className="flex gap-2"><Button variant="secondary"><Filter size={16}/>Cohort FA26</Button><Button variant="secondary"><FileText size={16}/>Export report</Button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#f5f8fa] text-xs uppercase tracking-wider text-[#7a8da1]"><tr><th className="px-5 py-4">Learner</th><th className="px-5 py-4">Elicitation</th><th className="px-5 py-4">Communication</th><th className="px-5 py-4">Analysis</th><th className="px-5 py-4">Traceability</th><th className="px-5 py-4">Instructor action</th></tr></thead><tbody className="divide-y divide-[#e6edf2]">{competencyRows.map(([name,elicitation,communication,analysis,traceability,action])=><tr key={name}><td className="px-5 py-4 font-bold text-[#3b5670]">{name}</td>{[elicitation,communication,analysis,traceability].map((score,index)=><td key={index} className="px-5 py-4"><span className={classNames("inline-flex min-w-12 justify-center rounded-lg px-2 py-1.5 font-bold",score>=75?"bg-[#e6f3ed] text-[#34745b]":score>=68?"bg-[#e9f1f7] text-[#416b8e]":"bg-[#fff1dc] text-[#95651f]")}>{score}</span></td>)}<td className="px-5 py-4"><button className="flex items-center gap-1 text-sm font-semibold text-[#4d7293]">{action}<ChevronRight size={14}/></button></td></tr>)}</tbody></table></div></Card>
    <div className="grid gap-5 lg:grid-cols-3"><Card className="p-5"><GraduationCap className="text-[#4e7698]"/><h3 className="mt-4 font-bold text-[#28445f]">Assign the next experience</h3><p className="mt-2 text-sm leading-6 text-[#6d8194]">Select a scenario or event that exposes a verified competency gap without prescribing the solution.</p></Card><Card className="p-5"><Target className="text-[#8e681f]"/><h3 className="mt-4 font-bold text-[#28445f]">Set an observation focus</h3><p className="mt-2 text-sm leading-6 text-[#6d8194]">Choose two or three observable behaviors for the next session so assessment remains focused and fair.</p></Card><Card className="p-5"><Waypoints className="text-[#65619a]"/><h3 className="mt-4 font-bold text-[#28445f]">Compare evidence over time</h3><p className="mt-2 text-sm leading-6 text-[#6d8194]">Use multiple cases to determine whether improvement transfers across stakeholders, domains, and pressure events.</p></Card></div>
  </div>;
}
