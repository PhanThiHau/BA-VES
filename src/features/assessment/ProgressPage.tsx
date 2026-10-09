import { Award, CalendarDays, CheckCircle2, MessageSquareText, TrendingUp } from "lucide-react";
import { babokScores } from "../../constants/scenario";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";

const observedBehaviors = [
  ["Analytical Thinking", 78, "+9", "Fact vs assumption · conflict analysis"],
  ["Communication", 81, "+12", "Open question · probing · playback"],
  ["Interaction Skills", 76, "+8", "Facilitation · negotiation"],
  ["Business Knowledge", 70, "+10", "Inventory · replenishment · controls"],
  ["Behavioral Characteristics", 74, "+6", "Adaptability · ethics · ownership"],
  ["Tools & Technology", 68, "+14", "Traceability · modeling · data analysis"],
];

const history = [
  ["INV-2026-014", "Supply Chain Inventory Management", "Debrief in progress", "72", "Interview · decision analysis · process modeling"],
  ["INV-2026-009", "Store Cycle-Count Variance", "Completed", "67", "Observation · root cause analysis"],
  ["INV-2026-003", "Promotional Item Replenishment", "Completed", "61", "Data analysis · business rules"],
];

export function ProgressPage() {
  return <>
    <PageHeader eyebrow="Practice evidence profile" title="Practice Competency Profile" description="Track competencies demonstrated across multiple business simulations; this does not replace foundational BA education." />
    <div className="grid gap-4 sm:grid-cols-3">{[[TrendingUp,"+11%","Growth across 3 sessions"],[Award,"72/100","Latest performance level"],[CalendarDays,"6.4 hours","Time spent in scenarios"]].map(([Icon,value,label]) => <Card key={String(label)} className="flex items-center gap-4 p-5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf1f7] text-[#4d7398]"><Icon size={22} /></span><div><strong className="block text-2xl text-[#203d5e]">{String(value)}</strong><span className="text-sm text-[#7b8d9f]">{String(label)}</span></div></Card>)}</div>

    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card className="p-6"><h2 className="text-lg font-bold text-[#203b59]">Six Knowledge Areas Applied</h2><p className="mt-1 text-sm text-[#7b8d9f]">Scores are based on evidence accumulated through practical activities.</p><div className="mt-6 grid gap-4">{babokScores.map((skill) => <div key={skill.short} className="rounded-xl border border-[#e0e7ee] p-4"><div className="mb-3 flex justify-between"><div><strong className="text-sm text-[#35506c]">{skill.name}</strong><span className="mt-1 block text-xs text-[#8897a7]">{skill.short}</span></div><strong className="text-xl text-[#274968]">{skill.score}%</strong></div><ProgressBar value={skill.score} /></div>)}</div></Card>
      <Card className="p-6"><h2 className="text-lg font-bold text-[#203b59]">Six Underlying Competency Groups Observed</h2><p className="mt-1 text-sm text-[#7b8d9f]">Behavior observed across sessions and mapped to BABOK Underlying Competencies.</p><div className="mt-6 grid gap-4">{observedBehaviors.map(([name, score, trend, evidence]) => <div key={String(name)} className="rounded-xl border border-[#e0e7ee] p-4"><div className="flex items-center justify-between gap-3"><div><strong className="text-sm text-[#35506c]">{String(name)}</strong><span className="mt-1 block text-xs text-[#8494a4]">{String(evidence)}</span></div><div className="text-right"><strong className="block text-lg text-[#274968]">{String(score)}%</strong><span className="text-xs font-bold text-[#378064]">{String(trend)} pts</span></div></div><div className="mt-3"><ProgressBar value={Number(score)} color="#587ea2" /></div></div>)}</div></Card>
    </div>

    <Card className="mt-5 overflow-hidden"><div className="flex items-center gap-3 border-b border-[#e2e9ef] p-5"><MessageSquareText className="text-[#5d719c]"/><div><h2 className="font-bold text-[#203b59]">Business Experience History</h2><p className="text-sm text-[#7b8d9f]">Each row represents a case, the techniques used, and the assessment evidence.</p></div></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f5f8fa] text-xs uppercase tracking-wider text-[#7a8da1]"><tr><th className="px-5 py-4">Session</th><th className="px-5 py-4">Scenario</th><th className="px-5 py-4">Demonstrated techniques</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Score</th></tr></thead><tbody className="divide-y divide-[#e6edf2]">{history.map(([id,name,status,score,techniques]) => <tr key={id}><td className="px-5 py-4 font-mono text-xs font-bold text-[#587795]">{id}</td><td className="px-5 py-4 font-semibold text-[#3e5872]">{name}</td><td className="px-5 py-4 text-[#63788d]">{techniques}</td><td className="px-5 py-4"><Badge tone={status === "Completed" ? "green" : "amber"}>{status}</Badge></td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 font-bold text-[#315a7c]"><CheckCircle2 size={15}/>{score}</span></td></tr>)}</tbody></table></div></Card>
  </>;
}
