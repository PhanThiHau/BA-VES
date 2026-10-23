import { useEffect, useState } from "react";
import { ArrowRight, Check, ClipboardList, Database, FileQuestion, Lightbulb, Plus, Save, Target, Trash2, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { scenarioObjectives } from "../../constants/trainingScenario";
import { useApp } from "../../contexts/AppContext";
import { planningService, type PlannedQuestionDto } from "../../services/planningService";
import type { RouteKey } from "../../types/models";

const defaultQuestions = [
  { id: 1, topic: "Process", question: "Please describe each step from demand identification to goods issue.", priority: "High", status: "Planned" },
  { id: 2, topic: "Pain point", question: "At which step do discrepancies usually occur, and what are the consequences?", priority: "Critical", status: "Planned" },
  { id: 3, topic: "Rule", question: "Which data or thresholds trigger a transfer instead of a purchase order?", priority: "Medium", status: "Planned" },
  { id: 4, topic: "Exception", question: "How is the process handled when the network is unavailable or the accounting period is locked?", priority: "High", status: "Planned" },
  { id: 5, topic: "Confirmation", question: "My understanding is… Is that correct?", priority: "Low", status: "Planned" },
];

export function PlanningPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentSessionId } = useApp();

  const [objective, setObjective] = useState(
    "Identify the causes of stockouts and design a replenishment process that prioritizes internal transfers before creating new purchase orders without increasing inventory-control risk."
  );
  const [approach, setApproach] = useState("Direct interview with key stakeholders, document analysis and process flow mapping.");
  const [questions, setQuestions] = useState<any[]>(defaultQuestions);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // New question form state
  const [newTopic, setNewTopic] = useState("Process");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newPriority, setNewPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [showAddForm, setShowAddForm] = useState(false);

  // API 8: Load plan when session exists
  useEffect(() => {
    if (!currentSessionId) return;
    const fetchPlan = async () => {
      setIsLoading(true);
      try {
        const plan = await planningService.getPlan(currentSessionId);
        if (plan) {
          if (plan.objective) setObjective(plan.objective);
          if (plan.approach) setApproach(plan.approach);
          if (plan.questions && plan.questions.length > 0) {
            setQuestions(plan.questions);
          }
          setSaveStatus("Đã đồng bộ kế hoạch từ máy chủ");
        }
      } catch (err) {
        console.warn("Backend Plan not yet created for session, using local draft:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [currentSessionId]);

  // API 9: Upsert Plan
  const handleSavePlan = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      if (currentSessionId) {
        await planningService.upsertPlan(currentSessionId, {
          objective,
          approach,
          questions: questions.map((q, idx) => ({
            topic: q.topic,
            question: q.question,
            priority: q.priority,
            displayOrder: idx + 1,
            stakeholderPersonaId: q.stakeholderPersonaId || null,
          })),
        });
        setSaveStatus("Lưu kế hoạch lên Backend thành công (PUT /api/sessions/{id}/plan)!");
      } else {
        setSaveStatus("Đã lưu kế hoạch vào bộ nhớ cục bộ.");
      }
    } catch (err: any) {
      setSaveStatus(`Lưu kế hoạch: ${err.message || "Thao tác thành công trên bộ nhớ"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // API 10: Add single question
  const handleAddQuestion = async () => {
    if (!newQuestionText.trim()) return;

    if (currentSessionId) {
      try {
        const added = await planningService.addPlannedQuestion(currentSessionId, {
          topic: newTopic,
          question: newQuestionText.trim(),
          priority: newPriority,
        });
        setQuestions((prev) => [...prev, added]);
        setSaveStatus("Đã thêm câu hỏi vào Backend (POST /api/sessions/{id}/plan/questions)!");
        setNewQuestionText("");
        setShowAddForm(false);
        return;
      } catch (err) {
        console.warn("Failed to add question via direct API, saving locally:", err);
      }
    }

    // Local fallback
    const localNew = {
      id: Date.now(),
      topic: newTopic,
      question: newQuestionText.trim(),
      priority: newPriority,
      status: "Planned",
    };
    setQuestions((prev) => [...prev, localNew]);
    setNewQuestionText("");
    setShowAddForm(false);
  };

  // API 12: Delete single question
  const handleDeleteQuestion = async (qId: number) => {
    if (currentSessionId) {
      try {
        await planningService.deletePlannedQuestion(qId);
        setSaveStatus("Đã xóa câu hỏi trên Backend (DELETE /api/planned-questions/{id})!");
      } catch (err) {
        console.warn("Delete API returned error, removing from local state:", err);
      }
    }
    setQuestions((prev) => prev.filter((item) => item.id !== qId));
  };

  const sessions = [
    ["Warehouse Manager", "Interview + playback", "As-Is receiving, picking, returns, inventory status, and exceptions", "Process map · pain points · evidence"],
    ["Inventory Planner", "Decision analysis", "Forecast, min-max, transfer vs. PO, and promotions", "Decision table · business rules"],
    ["Finance Manager", "Rules workshop", "Approval thresholds, audit trail, and period lock", "Rule catalog · control requirements"],
    ["Supply Chain Director", "KPI elicitation", "Targets, pilot scope, and override authority", "Objectives · scope · acceptance"],
    ["Warehouse Operator", "Observation", "Offline scanning, devices, and workarounds", "Task steps · usability/NFR"],
    ["Project Sponsor", "Interview", "Budget, timeline, out-of-scope items, and governance", "Constraints · decision rights"],
  ];

  return (
    <>
      <PageHeader
        eyebrow="Step 1 of 5 · BA Planning & Monitoring"
        title="Kế hoạch Phân tích Nghiệp vụ (BA Plan)"
        description="Xác định mục tiêu đo lường, kế hoạch phỏng vấn các bên liên quan và ngân hàng câu hỏi định hướng trước khi bắt đầu mô phỏng."
      />

      {saveStatus && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{saveStatus}</span>
          <button onClick={() => setSaveStatus(null)} className="text-xs font-semibold hover:underline">
            Đóng
          </button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="space-y-4">
          {/* Business Objectives */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f1f8] text-[#456d94]">
                  <Target size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-[#1d3858]">Business objectives & success measures</h2>
                  <p className="text-xs text-slate">Mục tiêu kinh doanh và tiêu chí đo lường thành công</p>
                </div>
              </div>
              <Button onClick={handleSavePlan} disabled={isSaving} size="sm" className="gap-1.5">
                <Save size={15} />
                {isSaving ? "Đang lưu..." : "Lưu Kế hoạch (API 9)"}
              </Button>
            </div>

            <textarea
              className="mt-5 min-h-20 w-full rounded-xl border border-[#d9e3ec] bg-[#fafcfd] p-4 text-sm leading-6 text-[#304966] outline-none transition focus:border-navy"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {scenarioObjectives.map((item) => (
                <div key={item.label} className="rounded-xl border border-[#dfe7ee] p-3">
                  <p className="text-xs font-bold text-[#71869b]">{item.label}</p>
                  <p className="mt-2 text-sm text-[#8291a0]">
                    <span className="line-through">{item.baseline}</span> <ArrowRight className="inline" size={13} />{" "}
                    <strong className="text-[#2c664f]">{item.target}</strong>
                  </p>
                  <p className="mt-2 text-[11px] text-[#8a98a6]">Owner: {item.owner}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Stakeholder Elicitation Plan */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-[#e3e9ef] p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf4f8] text-[#4b759a]">
                <Users size={20} />
              </span>
              <div>
                <h2 className="font-bold text-[#203b59]">Stakeholder elicitation plan</h2>
                <p className="text-sm text-[#7d8d9e]">Mỗi phiên phỏng vấn phải có mục tiêu và kết quả đầu ra rõ ràng.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-[#f5f8fa] text-xs uppercase text-[#7b8da0]">
                  <tr>
                    <th className="px-5 py-3">Stakeholder</th>
                    <th className="px-5 py-3">Technique</th>
                    <th className="px-5 py-3">Information to collect</th>
                    <th className="px-5 py-3">Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5ecf1]">
                  {sessions.map((row) => (
                    <tr key={row[0]}>
                      <td className="px-5 py-4 font-bold text-[#39536d]">{row[0]}</td>
                      <td className="px-5 py-4 text-[#4c7397]">{row[1]}</td>
                      <td className="px-5 py-4 text-[#5e7388]">{row[2]}</td>
                      <td className="px-5 py-4 text-[#5e7388]">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Question Bank (Connected to API 8, 9, 10, 11, 12) */}
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center justify-between border-b border-[#e5ecf1] pb-3">
                <div className="flex items-center gap-3">
                  <FileQuestion className="text-[#6970a6]" />
                  <div>
                    <h2 className="font-bold text-[#203b59]">Question bank ({questions.length})</h2>
                    <p className="text-xs text-[#71879d]">API 8, 10, 11, 12</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowAddForm(!showAddForm)} className="gap-1 text-xs">
                  <Plus size={14} /> Thêm câu hỏi
                </Button>
              </div>

              {showAddForm && (
                <div className="mt-4 rounded-xl border border-navy/20 bg-slate-50 p-3 text-xs">
                  <p className="font-bold text-navy">Thêm câu hỏi mới vào Kế hoạch</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase text-slate">Chủ đề (Topic)</label>
                      <select
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="mt-1 w-full rounded border p-1"
                      >
                        <option value="Process">Process</option>
                        <option value="Pain point">Pain point</option>
                        <option value="Rule">Rule</option>
                        <option value="Exception">Exception</option>
                        <option value="Confirmation">Confirmation</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate">Độ ưu tiên</label>
                      <select
                        value={newPriority}
                        onChange={(e: any) => setNewPriority(e.target.value)}
                        className="mt-1 w-full rounded border p-1"
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] uppercase text-slate">Nội dung câu hỏi</label>
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Nhập câu hỏi dự kiến..."
                      className="mt-1 w-full rounded border p-1.5 text-xs"
                    />
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleAddQuestion}>
                      Lưu câu hỏi (API 10)
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="group relative rounded-xl bg-[#f5f8fa] p-3 transition hover:bg-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#71879d]">{q.topic || "Question"}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={q.priority === "Critical" ? "red" : q.priority === "High" ? "amber" : "navy"}>
                          {q.priority}
                        </Badge>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="opacity-0 transition group-hover:opacity-100 hover:text-rose-600"
                          title="Xóa câu hỏi (API 12)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-[#506980]">{q.question}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Database className="text-[#427e6a]" />
                <h2 className="font-bold text-[#203b59]">Documents and data to request</h2>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  "POS transactions and latency logs for 3 months",
                  "Inventory snapshots and cycle-count variances",
                  "8-week forecast, min-max settings, and promotion calendar",
                  "Transfer orders, purchase orders, and supplier lead times",
                  "Inventory adjustments and audit trail",
                  "Return/quarantine SOP and approval matrix",
                ].map((item, index) => (
                  <label key={item} className="flex items-start gap-3 rounded-xl border border-[#e0e8ee] p-3">
                    <input type="checkbox" defaultChecked={index < 4} className="mt-1 accent-[#376489]" />
                    <span className="text-sm text-[#576f86]">{item}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Controls */}
        <aside className="space-y-5">
          <Card className="p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6e86a0]">Readiness gate · 5/6</p>
            <div className="mt-5 space-y-4">
              {[
                "Objectives include baselines and targets",
                "Stakeholder map includes all decision-makers",
                "Techniques align with each objective",
                "Question bank includes probing and confirmation",
                "Data requests have been sent",
                "Initial assumptions have sponsor approval",
              ].map((item, index) => (
                <div key={item} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full ${
                      index < 5 ? "bg-[#dcedf8] text-[#315f88]" : "bg-[#fff0d9] text-[#a06b1b]"
                    }`}
                  >
                    {index < 5 && <Check size={13} />}
                  </span>
                  <span className="text-sm text-[#5f748b]">{item}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate("simulation")} className="mt-7 w-full gap-2">
              Vào phòng mô phỏng <ArrowRight size={16} />
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex gap-3">
              <Lightbulb className="shrink-0 text-[#8a6a21]" size={19} />
              <p className="text-sm leading-6 text-[#6c7d8f]">
                Do not begin by asking, “What do you want the system to have?” First understand the work, decisions, data, rules,
                exceptions, and success criteria.
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex gap-3">
              <ClipboardList className="shrink-0 text-[#4f779a]" size={19} />
              <div>
                <p className="font-bold text-[#36516c]">Assumptions to validate</p>
                <ul className="mt-2 space-y-2 text-sm leading-5 text-[#6c7d8f]">
                  <li>• POS latency is the primary cause</li>
                  <li>• All warehouses use the same SKU codes</li>
                  <li>• A transfer is always cheaper than a purchase order</li>
                </ul>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
