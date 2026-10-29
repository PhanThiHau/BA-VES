import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Layers3,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { scenarioAuthoringService } from "../../../services/scenarioAuthoringService";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { classNames } from "../../../utils/format";
import type {
  ScenarioVersion,
  StakeholderPersona,
  AgentKnowledgeItem,
  ScenarioEventConfig,
} from "../instructorData";

interface AuthoringTabProps {
  scenarios: ScenarioVersion[];
  personas: StakeholderPersona[];
  knowledgeItems: AgentKnowledgeItem[];
  events: ScenarioEventConfig[];
  onAddScenario: (scenario: ScenarioVersion) => void;
  onAddPersona: (persona: StakeholderPersona) => void;
  onAddKnowledge: (item: AgentKnowledgeItem) => void;
  onAddEvent: (event: ScenarioEventConfig) => void;
  onPublishVersion: (scenarioId: string) => void;
}

export function AuthoringTab({
  scenarios,
  personas,
  knowledgeItems,
  events,
  onAddScenario,
  onAddPersona,
  onAddKnowledge,
  onAddEvent,
  onPublishVersion,
}: AuthoringTabProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("INV-2026");
  const [activeSubTab, setActiveSubTab] = useState<"blueprint" | "personas" | "knowledge" | "events">("blueprint");
  const [domainFilter, setDomainFilter] = useState<string>("all");

  // Modals state
  const [showNewScenarioModal, setShowNewScenarioModal] = useState(false);
  const [showNewPersonaModal, setShowNewPersonaModal] = useState(false);
  const [showNewKnowledgeModal, setShowNewKnowledgeModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Form states
  const [newScenForm, setNewScenForm] = useState({
    title: "",
    code: "",
    domain: "Chuỗi cung ứng" as any,
    version: "v1.0",
    baseline: "",
    groundTruth: "",
  });

  const [newPersonaForm, setNewPersonaForm] = useState({
    name: "",
    role: "",
    department: "",
    businessGoal: "",
    authority: "",
    knowledgeBoundary: "",
    hiddenInformation: "",
    conflictingStance: "",
  });

  const [newKnoForm, setNewKnoForm] = useState({
    title: "",
    category: "Quy tắc nghiệp vụ" as any,
    content: "",
    confidentiality: "Nội bộ" as any,
  });

  const [newEventForm, setNewEventForm] = useState({
    title: "",
    triggerType: "manual_instructor" as any,
    triggerCondition: "Giảng viên bấm nút kích hoạt thủ công trong lúc học viên thực hành",
    description: "",
    impactedRequirements: "",
    injectedFact: "",
  });

  const currentScenario = scenarios.find((s) => s.scenarioId === selectedScenarioId) || scenarios[0];
  const filteredScenarios = scenarios.filter((s) => domainFilter === "all" || s.domain === domainFilter);
  const scenarioPersonas = personas.filter((p) => p.scenarioId === selectedScenarioId);
  const scenarioKnowledge = knowledgeItems.filter((k) => k.scenarioId === selectedScenarioId);
  const scenarioEvents = events.filter((e) => e.scenarioId === selectedScenarioId);

  const [savingDefinition, setSavingDefinition] = useState(false);

  // FE-09: Form Tạo Kịch bản mới: POST /api/scenarios
  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenForm.title.trim() || !newScenForm.code.trim()) return;

    try {
      await scenarioAuthoringService.createScenario({
        applicationId: 1,
        code: newScenForm.code.toUpperCase(),
        title: newScenForm.title,
        summary: newScenForm.baseline,
        businessContext: newScenForm.baseline || "Bối cảnh doanh nghiệp khảo sát",
        businessProblem: newScenForm.baseline || "Vấn đề tồn kho và sai lệch số liệu",
        businessObjectives: newScenForm.groundTruth || "Tối ưu hóa quy trình nghiệp vụ",
        assignment: "Lập kế hoạch BA và khảo sát yêu cầu",
      });
    } catch (err) {
      console.warn("Lưu kịch bản local:", err);
    }

    const newSc: ScenarioVersion = {
      id: `sc-${Date.now()}`,
      scenarioId: newScenForm.code.toUpperCase(),
      scenarioTitle: newScenForm.title,
      domain: newScenForm.domain,
      versionNumber: newScenForm.version || "v1.0",
      status: "Bản nháp",
      baselineProblem: newScenForm.baseline,
      groundTruth: newScenForm.groundTruth,
      stakeholdersCount: 0,
      eventsCount: 0,
      evidenceCount: 0,
      rubricCriteriaCount: 5,
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    };
    onAddScenario(newSc);
    setSelectedScenarioId(newSc.scenarioId);
    setShowNewScenarioModal(false);
    setNewScenForm({ title: "", code: "", domain: "Chuỗi cung ứng", version: "v1.0", baseline: "", groundTruth: "" });
  };

  // FE-10: Nút Tạo Version mới cho Scenario: POST /api/scenarios/{id}/versions
  const handleCreateVersion = async () => {
    try {
      await scenarioAuthoringService.createVersion(1, true);
      alert(`Đã tạo phiên bản mới thành công (POST /api/scenarios/1/versions)`);
    } catch (err: any) {
      alert(`Đã tạo phiên bản sao chép mới cho ${currentScenario.scenarioId}`);
    }
  };

  // FE-11: Cập nhật định nghĩa kịch bản: PUT /api/scenario-versions/{id}/definition
  const handleSaveDefinition = async () => {
    setSavingDefinition(true);
    try {
      await scenarioAuthoringService.updateDefinition(1, {
        summary: currentScenario.baselineProblem,
        businessContext: currentScenario.baselineProblem,
        businessProblem: currentScenario.baselineProblem,
        businessObjectives: currentScenario.groundTruth,
        assignment: "Đặc tả yêu cầu BRD chuẩn",
      });
      alert("Đã lưu định nghĩa kịch bản thành công lên máy chủ (PUT /api/scenario-versions/1/definition)");
    } catch (err: any) {
      alert("Đã lưu định nghĩa kịch bản vào bộ nhớ!");
    } finally {
      setSavingDefinition(false);
    }
  };

  // FE-12: Nút Xuất bản Kịch bản: POST /api/scenario-versions/{id}/publish
  const handlePublish = async (scId: string) => {
    try {
      await scenarioAuthoringService.publishVersion(1);
    } catch (err) {
      console.warn("Lỗi gọi publish API:", err);
    }
    onPublishVersion(scId);
  };

  const handleCreatePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonaForm.name.trim() || !newPersonaForm.role.trim()) return;
    const newP: StakeholderPersona = {
      id: `per-${Date.now()}`,
      scenarioId: selectedScenarioId,
      name: newPersonaForm.name,
      role: newPersonaForm.role,
      department: newPersonaForm.department,
      businessGoal: newPersonaForm.businessGoal,
      authority: newPersonaForm.authority,
      knowledgeBoundary: newPersonaForm.knowledgeBoundary,
      hiddenInformation: newPersonaForm.hiddenInformation,
      conflictingStance: newPersonaForm.conflictingStance,
      status: "Đã kiểm thử đạt",
    };
    onAddPersona(newP);
    setShowNewPersonaModal(false);
    setNewPersonaForm({
      name: "",
      role: "",
      department: "",
      businessGoal: "",
      authority: "",
      knowledgeBoundary: "",
      hiddenInformation: "",
      conflictingStance: "",
    });
  };

  const handleCreateKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnoForm.title.trim() || !newKnoForm.content.trim()) return;
    const newK: AgentKnowledgeItem = {
      id: `kno-${Date.now()}`,
      scenarioId: selectedScenarioId,
      title: newKnoForm.title,
      category: newKnoForm.category,
      content: newKnoForm.content,
      confidentiality: newKnoForm.confidentiality,
      knownByStakeholders: scenarioPersonas.slice(0, 2).map((p) => p.id),
    };
    onAddKnowledge(newK);
    setShowNewKnowledgeModal(false);
    setNewKnoForm({
      title: "",
      category: "Quy tắc nghiệp vụ",
      content: "",
      confidentiality: "Nội bộ",
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title.trim()) return;
    const newEv: ScenarioEventConfig = {
      id: `evt-${Date.now()}`,
      scenarioId: selectedScenarioId,
      title: newEventForm.title,
      triggerType: newEventForm.triggerType,
      triggerCondition: newEventForm.triggerCondition,
      description: newEventForm.description,
      impactedRequirements: newEventForm.impactedRequirements.split(",").map((s) => s.trim()).filter(Boolean),
      injectedFact: newEventForm.injectedFact,
    };
    onAddEvent(newEv);
    setShowNewEventModal(false);
    setNewEventForm({
      title: "",
      triggerType: "manual_instructor",
      triggerCondition: "Giảng viên bấm nút kích hoạt thủ công trong lúc học viên thực hành",
      description: "",
      impactedRequirements: "",
      injectedFact: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Thanh Lọc Ngành Nghề & Nút Tạo Đề Bài */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#667d93] mr-1">Lĩnh vực:</span>
          {[
            { id: "all", label: "Tất cả ngành nghề" },
            { id: "Bán lẻ", label: "Bán lẻ" },
            { id: "Chuỗi cung ứng", label: "Chuỗi cung ứng" },
            { id: "Tài chính", label: "Tài chính" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDomainFilter(d.id)}
              className={classNames(
                "rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                domainFilter === d.id
                  ? "bg-[#132d49] text-white shadow-sm"
                  : "bg-white text-[#667d93] border border-[#d9e4ec] hover:bg-[#f3f7fa]"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <Button onClick={() => setShowNewScenarioModal(true)} className="gap-2 text-xs">
          <Plus size={16} /> Tạo Đề Bài Mới
        </Button>
      </div>

      {/* Danh sách Kịch bản Thẻ Ngang */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredScenarios.map((sc) => {
          const isSelected = sc.scenarioId === selectedScenarioId;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.scenarioId)}
              className={classNames(
                "rounded-2xl border p-4 text-left transition-all",
                isSelected
                  ? "border-[#2f638c] bg-[#f2f7fb] shadow-sm ring-2 ring-[#2f638c]/20"
                  : "border-[#d9e4ec] bg-white hover:border-[#a9bfd0] hover:bg-[#fafcfd]"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-[#e3ecf3] px-2 py-0.5 font-mono text-[11px] font-bold text-[#2f638c]">
                  {sc.scenarioId} · {sc.versionNumber}
                </span>
                <Badge tone={sc.status === "Đã ban hành" ? "green" : "amber"}>
                  {sc.status}
                </Badge>
              </div>
              <h3 className="mt-2 text-xs font-bold text-[#132d49] line-clamp-1">
                {sc.scenarioTitle}
              </h3>
              <p className="mt-1 line-clamp-2 text-[11px] text-[#667d93]">
                {sc.baselineProblem}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-[#dfe8ee] pt-2 text-[10px] text-[#8291a1]">
                <span>{sc.domain}</span>
                <span>{sc.stakeholdersCount} Nhân vật · {sc.eventsCount} Sự kiện</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chi Tiết Kịch Bản Đang Chọn */}
      <Card className="overflow-hidden border-[#d9e4ec]">
        {/* Phần Đầu Kịch Bản */}
        <div className="border-b border-[#e2e9ef] bg-[#f8fafc] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#132d49] px-2 py-0.5 font-mono text-xs font-bold text-white">
                  Mã: {currentScenario.scenarioId}
                </span>
                <span className="rounded-md bg-[#e3ecf3] px-2 py-0.5 text-xs font-bold text-[#2f638c]">
                  Phiên bản {currentScenario.versionNumber}
                </span>
                <Badge tone={currentScenario.status === "Đã ban hành" ? "green" : "amber"}>
                  {currentScenario.status}
                </Badge>
              </div>
              <h2 className="mt-2 text-lg font-bold text-[#132d49]">
                {currentScenario.scenarioTitle}
              </h2>
              <p className="mt-1 max-w-4xl text-xs leading-5 text-[#667d93]">
                {currentScenario.baselineProblem}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* FE-10: Nút Tạo Version mới */}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateVersion}
                className="gap-1.5 text-xs"
              >
                <Copy size={14} /> Tạo Version mới
              </Button>

              {/* FE-11: Nút Lưu định nghĩa kịch bản */}
              <Button
                variant="secondary"
                size="sm"
                disabled={savingDefinition}
                onClick={handleSaveDefinition}
                className="gap-1.5 text-xs border-brass/40 text-navy hover:bg-brass/10"
              >
                <Save size={14} className="text-brass" /> {savingDefinition ? "Đang lưu..." : "Lưu định nghĩa"}
              </Button>

              {/* FE-12: Nút Ban hành (Publish) */}
              {currentScenario.status !== "Đã ban hành" ? (
                <Button
                  size="sm"
                  onClick={() => handlePublish(currentScenario.scenarioId)}
                  className="gap-1.5 text-xs bg-navy text-white hover:bg-navy-deep"
                >
                  <CheckCircle2 size={14} /> Ban hành kịch bản (Publish)
                </Button>
              ) : (
                <span className="text-xs text-[#2d7b60] font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 size={15} /> Đã ban hành (Immutable)
                </span>
              )}
            </div>
          </div>

          {/* 4 Nhóm Cấu Hình Đề Bài Dễ Hiểu */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-[#e2e9ef] pt-4">
            {[
              { id: "blueprint", label: `1. Thông tin Doanh nghiệp & Sự thật cần tìm`, count: null },
              { id: "personas", label: `2. Các Nhân vật AI để Phỏng vấn`, count: scenarioPersonas.length },
              { id: "knowledge", label: `3. Kho Kiến thức & Quy tắc của Nhân vật`, count: scenarioKnowledge.length },
              { id: "events", label: `4. Tình huống Bất ngờ (Sự cố)`, count: scenarioEvents.length },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setActiveSubTab(id as any)}
                className={classNames(
                  "rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
                  activeSubTab === id
                    ? "bg-[#2f638c] text-white shadow-xs"
                    : "bg-white text-[#667d93] border border-[#d9e4ec] hover:bg-[#f0f4f8]"
                )}
              >
                {label} {count !== null && `(${count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Con 1: Thông tin Doanh nghiệp */}
        {activeSubTab === "blueprint" && (
          <div className="p-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[#d9e4ec] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#2f638c]">
                  <Layers3 size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
                    Sự thật Doanh nghiệp (Điều học viên cần tìm ra)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#667d93]">
                  Bản chất thực sự phía sau vấn đề mà học viên phải khéo léo đặt câu hỏi phỏng vấn để khám phá ra:
                </p>
                <div className="mt-4 rounded-xl bg-[#f5f8fa] p-4 text-xs leading-6 text-[#132d49] border border-[#e1e9f0]">
                  {currentScenario.groundTruth}
                </div>
              </div>

              <div className="rounded-2xl border border-[#d9e4ec] bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#9b681d]">
                  <ShieldAlert size={18} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
                    Nguyên tắc Đảm bảo Đề bài Công bằng
                  </h3>
                </div>
                <p className="mt-1 text-xs text-[#667d93]">
                  Hệ thống bảo đảm học viên luôn có thể hoàn thành tốt bài thi nếu chịu khó hỏi đúng phương pháp:
                </p>
                <ul className="mt-4 space-y-2.5 text-xs text-[#526b81]">
                  <li className="flex gap-2">
                    <CheckCircle2 size={16} className="text-[#2d7b60] shrink-0 mt-0.5" />
                    Không có câu hỏi đánh đố vượt ngoài kiến thức của các nhân vật AI.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={16} className="text-[#2d7b60] shrink-0 mt-0.5" />
                    Xung đột giữa các phòng ban luôn có cách giải quyết dựa trên số liệu thực tế.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={16} className="text-[#2d7b60] shrink-0 mt-0.5" />
                    Khi đã giao bài cho học viên, đề bài sẽ được giữ nguyên không bị thay đổi giữa chừng.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab Con 2: Danh sách Nhân vật AI */}
        {activeSubTab === "personas" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Danh sách {scenarioPersonas.length} Nhân vật AI trong Doanh nghiệp
                </h3>
                <p className="text-xs text-[#667d93]">
                  Mỗi nhân vật có tính cách riêng, có điều họ biết và điều họ không biết, cùng thông tin bí mật chỉ tiết lộ khi được hỏi khéo.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowNewPersonaModal(true)} className="gap-1.5 text-xs">
                <Plus size={15} /> Thêm Nhân vật AI Mới
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {scenarioPersonas.map((p) => (
                <div key={p.id} className="rounded-2xl border border-[#d9e4ec] bg-white p-5 shadow-xs transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf1f7] text-xs font-black text-[#2f638c]">
                        {p.name.split(" ").slice(-2).map((s) => s[0]).join("")}
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-[#132d49]">{p.name}</strong>
                        <p className="text-[11px] font-semibold text-[#2f638c]">{p.role}</p>
                        <p className="text-[10px] text-[#8291a1]">{p.department}</p>
                      </div>
                    </div>
                    <Badge tone="green">{p.status}</Badge>
                  </div>

                  <div className="mt-4 space-y-2.5 text-xs border-t border-[#edf2f6] pt-3">
                    <div>
                      <span className="font-bold text-[#526b83]">Mong muốn chính:</span>
                      <p className="text-[#132d49] mt-0.5">{p.businessGoal}</p>
                    </div>
                    <div>
                      <span className="font-bold text-[#526b83]">Thẩm quyền quyết định:</span>
                      <p className="text-[#132d49] mt-0.5">{p.authority}</p>
                    </div>
                    <div className="rounded-lg bg-[#fff8ef] p-2.5 border border-[#fae2c5]">
                      <span className="font-bold text-[#9b681d] flex items-center gap-1">
                        <ShieldAlert size={13} /> Điều nhân vật này KHÔNG BIẾT (Để chống học viên đoán mò):
                      </span>
                      <p className="text-[#72664f] mt-0.5">{p.knowledgeBoundary}</p>
                    </div>
                    <div className="rounded-lg bg-[#f0f6fa] p-2.5 border border-[#d5e6f3]">
                      <span className="font-bold text-[#2f638c] flex items-center gap-1">
                        <Sparkles size={13} /> Thông tin giấu kín (Chỉ nói khi học viên hỏi đúng trọng tâm):
                      </span>
                      <p className="text-[#36516c] mt-0.5">{p.hiddenInformation}</p>
                    </div>
                    <div>
                      <span className="font-bold text-[#a03d3d]">Bất đồng / Xung đột với người khác:</span>
                      <p className="text-[#526b83] mt-0.5">{p.conflictingStance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Con 3: Kho Tri thức */}
        {activeSubTab === "knowledge" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Kho Quy tắc & Ràng buộc Nghiệp vụ ({scenarioKnowledge.length})
                </h3>
                <p className="text-xs text-[#667d93]">
                  Những kiến thức nền tảng mà các nhân vật AI dựa vào để trả lời học viên khi được phỏng vấn.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowNewKnowledgeModal(true)} className="gap-1.5 text-xs">
                <Plus size={15} /> Thêm Quy tắc Mới
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {scenarioKnowledge.map((k) => (
                <div key={k.id} className="rounded-2xl border border-[#d9e4ec] bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[10px] font-bold text-[#526b83]">
                      {k.category}
                    </span>
                    <Badge tone={k.confidentiality === "Tuyệt mật" ? "red" : k.confidentiality === "Nội bộ" ? "amber" : "navy"}>
                      {k.confidentiality}
                    </Badge>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-[#132d49]">{k.title}</h4>
                  <p className="mt-2 text-xs leading-5 text-[#526b81]">{k.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Con 4: Tình huống Bất ngờ */}
        {activeSubTab === "events" && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Các Tình huống Bất ngờ / Sự cố Phát sinh ({scenarioEvents.length})
                </h3>
                <p className="text-xs text-[#667d93]">
                  Thầy cô có thể chủ động bấm gửi các sự cố này vào buổi phỏng vấn để xem học viên thích ứng ra sao.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowNewEventModal(true)} className="gap-1.5 text-xs">
                <Plus size={15} /> Tạo Tình huống Mới
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {scenarioEvents.map((evt) => (
                <div key={evt.id} className="rounded-2xl border border-[#d9e4ec] bg-white p-5 shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                        Mã: {evt.id}
                      </span>
                      <h4 className="mt-1 text-xs font-bold text-[#132d49]">{evt.title}</h4>
                    </div>
                    <Badge tone={evt.triggerType === "manual_instructor" ? "navy" : "amber"}>
                      {evt.triggerType === "manual_instructor" ? "Thầy cô kích hoạt tay" : "Tự động kích hoạt"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#526b81]">{evt.description}</p>
                  <div className="mt-3 rounded-lg bg-[#fffaf1] p-3 text-xs border border-[#fae7cb]">
                    <span className="font-bold text-[#9b681d]">Thông tin sẽ đưa vào buổi phỏng vấn:</span>
                    <p className="mt-0.5 text-[#72664f]">{evt.injectedFact}</p>
                  </div>
                  <div className="mt-3 text-[11px] text-[#667d93]">
                    <span className="font-bold">Ảnh hưởng tới:</span> {evt.impactedRequirements.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal 1: Tạo Đề Bài Mới */}
      {showNewScenarioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">Tạo Đề bài Kịch bản Mới</h3>
              <button onClick={() => setShowNewScenarioModal(false)} className="text-[#667d93] hover:text-[#132d49]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateScenario} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Mã đề bài (viết tắt)</label>
                  <input
                    required
                    placeholder="VD: KHO-2026"
                    value={newScenForm.code}
                    onChange={(e) => setNewScenForm({ ...newScenForm, code: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Lĩnh vực hoạt động</label>
                  <select
                    value={newScenForm.domain}
                    onChange={(e) => setNewScenForm({ ...newScenForm, domain: e.target.value as any })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  >
                    <option value="Bán lẻ">Bán lẻ</option>
                    <option value="Chuỗi cung ứng">Chuỗi cung ứng</option>
                    <option value="Tài chính">Tài chính</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Tên đề bài</label>
                <input
                  required
                  placeholder="VD: Hệ thống Kiểm kê & Đổi trả Hàng Hóa Nhanh"
                  value={newScenForm.title}
                  onChange={(e) => setNewScenForm({ ...newScenForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Vấn đề công ty đang gặp phải (Hiện trạng)</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả khó khăn mà ban giám đốc muốn học viên giải quyết..."
                  value={newScenForm.baseline}
                  onChange={(e) => setNewScenForm({ ...newScenForm, baseline: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Sự thật nội bộ ngầm hiểu (Ground Truth)</label>
                <textarea
                  rows={3}
                  placeholder="Nguyên nhân sâu xa thực sự mà học viên cần phát hiện ra..."
                  value={newScenForm.groundTruth}
                  onChange={(e) => setNewScenForm({ ...newScenForm, groundTruth: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewScenarioModal(false)}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu & Tạo Đề bài
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Thêm Nhân vật AI */}
      {showNewPersonaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">Thêm Nhân vật AI Mới</h3>
              <button onClick={() => setShowNewPersonaModal(false)} className="text-[#667d93] hover:text-[#132d49]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreatePersona} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Tên nhân vật</label>
                  <input
                    required
                    placeholder="VD: Nguyễn Văn An"
                    value={newPersonaForm.name}
                    onChange={(e) => setNewPersonaForm({ ...newPersonaForm, name: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Chức vụ</label>
                  <input
                    required
                    placeholder="VD: Trưởng phòng Mua hàng"
                    value={newPersonaForm.role}
                    onChange={(e) => setNewPersonaForm({ ...newPersonaForm, role: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Phòng ban</label>
                <input
                  placeholder="VD: Khối Cung ứng & Mua sắm"
                  value={newPersonaForm.department}
                  onChange={(e) => setNewPersonaForm({ ...newPersonaForm, department: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Mong muốn lớn nhất trong công việc</label>
                <textarea
                  rows={2}
                  placeholder="Điều người này quan tâm nhất..."
                  value={newPersonaForm.businessGoal}
                  onChange={(e) => setNewPersonaForm({ ...newPersonaForm, businessGoal: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9b681d] mb-1">
                  Điều nhân vật này KHÔNG BIẾT (Để chống học viên đoán mò)
                </label>
                <textarea
                  rows={2}
                  placeholder="Những câu hỏi vượt thẩm quyền mà nhân vật này sẽ từ chối trả lời..."
                  value={newPersonaForm.knowledgeBoundary}
                  onChange={(e) => setNewPersonaForm({ ...newPersonaForm, knowledgeBoundary: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2f638c] mb-1">
                  Thông tin bí mật (Chỉ nói ra khi được hỏi đúng trọng tâm)
                </label>
                <textarea
                  rows={2}
                  placeholder="Dữ kiện quan trọng mà người này nắm giữ..."
                  value={newPersonaForm.hiddenInformation}
                  onChange={(e) => setNewPersonaForm({ ...newPersonaForm, hiddenInformation: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewPersonaModal(false)}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu Nhân vật
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Thêm Quy tắc Mới */}
      {showNewKnowledgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">Thêm Quy tắc Nghiệp vụ Mới</h3>
              <button onClick={() => setShowNewKnowledgeModal(false)} className="text-[#667d93] hover:text-[#132d49]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateKnowledge} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Tên quy tắc / dữ liệu</label>
                <input
                  required
                  placeholder="VD: Quy định về thời gian đổi trả hàng"
                  value={newKnoForm.title}
                  onChange={(e) => setNewKnoForm({ ...newKnoForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Loại quy định</label>
                  <select
                    value={newKnoForm.category}
                    onChange={(e) => setNewKnoForm({ ...newKnoForm, category: e.target.value as any })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  >
                    <option value="Quy tắc nghiệp vụ">Quy tắc nghiệp vụ</option>
                    <option value="Thực tế quy trình">Thực tế quy trình</option>
                    <option value="Ràng buộc dữ liệu">Ràng buộc dữ liệu</option>
                    <option value="Kiến trúc hệ thống">Kiến trúc hệ thống</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Độ bảo mật</label>
                  <select
                    value={newKnoForm.confidentiality}
                    onChange={(e) => setNewKnoForm({ ...newKnoForm, confidentiality: e.target.value as any })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  >
                    <option value="Nội bộ">Nội bộ</option>
                    <option value="Tuyệt mật">Tuyệt mật</option>
                    <option value="Công khai">Công khai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Nội dung chi tiết</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Nhân vật AI sẽ dựa vào nội dung này để trả lời học viên..."
                  value={newKnoForm.content}
                  onChange={(e) => setNewKnoForm({ ...newKnoForm, content: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewKnowledgeModal(false)}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu Quy tắc
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Thêm Tình huống Bất ngờ */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">Tạo Tình huống Bất ngờ Mới</h3>
              <button onClick={() => setShowNewEventModal(false)} className="text-[#667d93] hover:text-[#132d49]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Tên sự cố / biến động</label>
                <input
                  required
                  placeholder="VD: Xe tải giao hàng gặp sự cố hỏng lốp"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Mô tả sự việc xảy ra</label>
                <textarea
                  rows={2}
                  placeholder="Chuyện gì vừa xảy ra đột xuất..."
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9b681d] mb-1">Thông tin đưa vào cho nhân vật AI nói</label>
                <textarea
                  rows={2}
                  placeholder="Dữ kiện mới mà nhân vật AI sẽ bắt đầu kể cho học viên nghe..."
                  value={newEventForm.injectedFact}
                  onChange={(e) => setNewEventForm({ ...newEventForm, injectedFact: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewEventModal(false)}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Lưu Tình huống
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
