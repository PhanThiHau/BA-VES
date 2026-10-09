import { ArrowRight, Boxes, Clock3, Search, SlidersHorizontal, Users } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import type { RouteKey } from "../../types/models";

const cards = [
  { title: "Supply Chain Inventory Management", description: "Analyze stockouts, replenishment, barcode scanning, and inventory adjustments across a multi-warehouse retail network.", level: "Intermediate", duration: "90 minutes", people: "6 stakeholders", active: true },
  { title: "Lot Control and Product Recall", description: "Design end-to-end traceability from supplier to customer when a product lot fails quality checks.", level: "Advanced", duration: "75 minutes", people: "5 stakeholders", active: false },
  { title: "Reducing Store Inventory Variance", description: "Analyze inventory discrepancies and the cycle-count process across twenty stores.", level: "Beginner", duration: "60 minutes", people: "4 stakeholders", active: false },
];

export function ScenarioLibraryPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  return <>
    <PageHeader eyebrow="Scenario library" title="Inventory Management Scenarios" description="Choose a business context in which to apply your existing BA knowledge in the supply-chain domain." />
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dce5ed] bg-white p-3 sm:flex-row"><label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-[#f4f7fa] px-4 text-[#7a8ba0]"><Search size={18} /><input className="w-full bg-transparent text-sm text-[#263e5b] outline-none" placeholder="Search by technique or business context..." /></label><Button variant="secondary"><SlidersHorizontal size={17} />Filters</Button></div>
    <div className="grid gap-5 xl:grid-cols-3">{cards.map((scenario, index) => <Card key={scenario.title} className="flex min-h-[330px] flex-col overflow-hidden"><div className={`h-2 ${index === 0 ? "bg-[#547ca3]" : index === 1 ? "bg-[#7c96b0]" : "bg-[#a5b8ca]"}`} /><div className="flex flex-1 flex-col p-6"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf3f8] text-[#456b91]"><Boxes size={21} /></span><Badge tone={scenario.active ? "green" : index === 1 ? "amber" : "navy"}>{scenario.active ? "In progress" : scenario.level}</Badge></div><h2 className="mt-6 text-xl font-bold text-[#1b3554]">{scenario.title}</h2><p className="mt-3 flex-1 leading-6 text-[#6c7f93]">{scenario.description}</p><div className="mt-6 flex flex-wrap gap-4 border-t border-[#e5ebf1] pt-4 text-sm text-[#7a8c9f]"><span className="flex items-center gap-2"><Clock3 size={15} />{scenario.duration}</span><span className="flex items-center gap-2"><Users size={15} />{scenario.people}</span></div><Button onClick={() => navigate("scenario-detail")} className="mt-5 w-full">Open scenario <ArrowRight size={16} /></Button></div></Card>)}</div>
  </>;
}
