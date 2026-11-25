import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardList, Database, FileQuestion, Lightbulb, Loader2, Plus, Save, Target, Trash2, Users } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { useApp } from "../../contexts/AppContext";
import { planningService, type PlannedQuestionDto } from "../../services/planningService";
import { catalogService, type ScenarioContextDto } from "../../services/catalogService";
import type { RouteKey } from "../../types/models";

export function PlanningPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentSessionId, currentScenarioVersionId } = useApp();

  const [objective, setObjective] = useState("");
  const [approach, setApproach] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [scenarioContext, setScenarioContext] = useState<ScenarioContextDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // New question form state
  const [newTopic, setNewTopic] = useState("Process");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newPriority, setNewPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load Scenario Context for objectives guideline from DB
  useEffect(() => {
    if (!currentScenarioVersionId) return;
    catalogService.getScenarioContext(currentScenarioVersionId).then((ctx) => {
      if (ctx) {
        setScenarioContext(ctx);
        if (!objective && ctx.businessObjectives) {
          setObjective(ctx.businessObjectives);
        }
      }
    }).catch((err) => console.warn("Lỗi tải bối cảnh kịch bản:", err));
  }, [currentScenarioVersionId]);

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
          if (plan.questions) {
            setQuestions(plan.questions);
          }
          setSaveStatus("Đã tải kế hoạch từ Database");
        }
      } catch (err) {
        console.warn("Phiên chưa có kế hoạch lưu trên server:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [currentSessionId]);

  // API 9: Upsert Plan
  const handleSavePlan = async () => {
    if (!currentSessionId) {
      setSaveStatus("Cần kích hoạt một phiên thực hành (Session) để lưu trữ lên máy chủ.");
      return;
    }
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await planningService.upsertPlan(currentSessionId, {
        objective,
        approach,
        questions: questions.map((q, idx) => ({
          topic: q.topic || "Process",
          question: q.question,
          priority: q.priority || "High",
          displayOrder: idx + 1,
          stakeholderPersonaId: q.stakeholderPersonaId || null,
        })),
      });
      setSaveStatus("Lưu kế hoạch lên Backend thành công (PUT /api/sessions/{id}/plan)!");
    } catch (err: any) {
      setSaveStatus(`Lỗi lưu kế hoạch: ${err.message || "Thao tác thất bại"}`);
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
        setNewQuestionText("");
        setShowAddForm(false);
        setSaveStatus("Đã thêm câu hỏi vào kế hoạch (POST /api/sessions/{id}/plan/questions)");
        return;
      } catch (err: any) {
        console.warn("Lỗi lưu câu hỏi:", err);
      }
    }

    // Local state if session offline
    const localQ = {
      id: Date.now(),
      topic: newTopic,
      question: newQuestionText.trim(),
      priority: newPriority,
      status: "Planned",
    };
    setQuestions((prev) => [...prev, localQ]);
    setNewQuestionText("");
    setShowAddForm(false);
  };

  // API 12: Delete question
  const handleDeleteQuestion = async (questionId: number) => {
    if (currentSessionId) {
      try {
        await planningService.deletePlannedQuestion(questionId);
      } catch (err) {
        console.warn("Không thể xóa câu hỏi qua API:", err);
      }
    }
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="Giai đoạn 1 · Lập kế hoạch phân tích nghiệp vụ"
          title="Kế hoạch Phân tích Nghiệp vụ (BA Plan)"
          description="Thiết lập mục tiêu giải pháp, phương pháp tiếp cận và chuẩn bị ngân hàng câu hỏi trước khi phỏng vấn các tác tử Stakeholder."
        />
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate("scenario-detail")} className="gap-2">
            <ArrowLeft size={16} /> Bối cảnh đề bài
          </Button>
          <Button onClick={handleSavePlan} disabled={isSaving} className="gap-2">
            <Save size={16} /> {isSaving ? "Đang lưu..." : "Lưu kế hoạch"}
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="mt-3 rounded-xl border border-navy/20 bg-navy/5 p-3 text-xs font-semibold text-navy">
          ℹ️ {saveStatus}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main Planning Form */}
        <div className="space-y-6">
          {/* Objective Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Target className="text-brass" />
              <h2 className="font-bold text-navy">Mục tiêu giải pháp & Kế hoạch (Solution Objectives)</h2>
            </div>
            <p className="mt-1 text-xs text-slate">
              Ghi nhận mục tiêu cụ thể, chỉ số đo lường thành công và vấn đề cần giải quyết theo yêu cầu đề bài.
            </p>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Nhập mục tiêu phân tích nghiệp vụ của bạn..."
              className="mt-3 w-full rounded-xl border border-slate/20 p-3 text-sm text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
            {scenarioContext?.businessObjectives && (
              <p className="mt-2 text-[11px] text-slate italic">
                💡 Tham khảo từ đề bài: {scenarioContext.businessObjectives}
              </p>
            )}
          </Card>

          {/* Approach Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-navy" />
              <h2 className="font-bold text-navy">Phương pháp tiếp cận phân tích (BA Approach)</h2>
            </div>
            <p className="mt-1 text-xs text-slate">
              Xác định các kỹ thuật BABOK sẽ áp dụng (ví dụ: Phỏng vấn sâu, sơ đồ luồng dữ liệu, phân tích quy tắc nghiệp vụ).
            </p>
            <textarea
              rows={2}
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
              placeholder="Mô tả phương pháp tiếp cận các bên liên quan và phân tích dữ liệu..."
              className="mt-3 w-full rounded-xl border border-slate/20 p-3 text-sm text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy"
            />
          </Card>

          {/* Planned Questions Bank */}
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-slate/10 pb-4">
              <div className="flex items-center gap-3">
                <FileQuestion className="text-brass" />
                <div>
                  <h2 className="font-bold text-navy">Ngân hàng câu hỏi dự kiến ({questions.length})</h2>
                  <p className="text-xs text-slate">Danh sách câu hỏi bạn dự kiến đặt cho các tác tử Stakeholder</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5">
                <Plus size={14} /> Thêm câu hỏi
              </Button>
            </div>

            {/* Add question modal / inline form */}
            {showAddForm && (
              <div className="mt-4 rounded-xl border border-navy/20 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate">Chủ đề (Topic)</label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Quy trình, Điểm nghẽn, Quy tắc..."
                      className="mt-1 w-full rounded-lg border border-slate/20 p-2 text-xs outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate">Mức độ ưu tiên</label>
                    <select
                      value={newPriority}
                      onChange={(e: any) => setNewPriority(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate/20 p-2 text-xs outline-none bg-white"
                    >
                      <option value="Critical">Critical (Tối quan trọng)</option>
                      <option value="High">High (Cao)</option>
                      <option value="Medium">Medium (Trung bình)</option>
                      <option value="Low">Low (Thấp)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-[10px] font-bold uppercase text-slate">Nội dung câu hỏi phỏng vấn</label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Nhập câu hỏi bạn dự định hỏi Stakeholder..."
                    className="mt-1 w-full rounded-lg border border-slate/20 p-2 text-xs outline-none bg-white"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                    Hủy
                  </Button>
                  <Button size="sm" onClick={handleAddQuestion}>
                    Thêm vào danh sách
                  </Button>
                </div>
              </div>
            )}

            {/* Questions List */}
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate">
                <Loader2 className="animate-spin mx-auto mb-2 text-navy" size={20} />
                Đang tải kế hoạch câu hỏi từ máy chủ...
              </div>
            ) : questions.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate/20 p-8 text-center">
                <FileQuestion className="mx-auto text-slate/40 mb-2" size={28} />
                <p className="text-xs font-bold text-navy">Chưa có câu hỏi nào trong kế hoạch</p>
                <p className="text-[11px] text-slate mt-1">
                  Hãy nhấn <strong>"Thêm câu hỏi"</strong> để chuẩn bị các câu hỏi trước khi phỏng vấn các tác tử.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {questions.map((q) => (
                  <div key={q.id} className="group relative rounded-xl bg-offwhite p-3.5 transition hover:bg-slate-100 border border-slate/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate">{q.topic || "Question"}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={q.priority === "Critical" ? "red" : q.priority === "High" ? "amber" : "navy"}>
                          {q.priority}
                        </Badge>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="opacity-0 transition group-hover:opacity-100 hover:text-rose-600 p-1"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-navy font-medium leading-relaxed">{q.question}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Controls */}
        <aside className="space-y-5">
          <Card className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate">Sẵn sàng phỏng vấn</h3>
            <p className="mt-2 text-xs text-slate">
              Sau khi chuẩn bị mục tiêu và câu hỏi, bạn có thể chuyển sang phòng mô phỏng để phỏng vấn các tác tử Stakeholder.
            </p>
            <Button onClick={() => navigate("simulation")} className="mt-5 w-full gap-2">
              Vào phòng mô phỏng <ArrowRight size={16} />
            </Button>
          </Card>

          <Card className="p-5 bg-mist/20 border-slate/15">
            <div className="flex gap-3">
              <Lightbulb className="shrink-0 text-brass" size={20} />
              <p className="text-xs leading-5 text-slate">
                <strong>Gợi ý BABOK®:</strong> Không nên bắt đầu bằng câu hỏi “Hệ thống mới cần tính năng gì?”. Hãy tìm hiểu kỹ thực trạng quy trình, điểm nghẽn và nguyên tắc ra quyết định của các bên liên quan.
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
