import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Copy,
  Layers3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  scenarioAuthoringService,
  type ScenarioDefinitionDto,
} from "../../../services/scenarioAuthoringService";
import { AuthoringRubricsManager } from "./AuthoringRubricsManager";
import { AuthoringTemplatesManager } from "./AuthoringTemplatesManager";
import {
  createSprintPlan,
  emptySprintPlans,
  formatSprintDuration,
  renumberSprints,
  sprintsAreValid,
  sprintsFromDefinition,
  toUpsertSprintPayload,
  type SprintPlan,
} from "./sprintAssignment";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { AutoResizeTextarea } from "../../../components/ui/AutoResizeTextarea";
import { CollapsibleDetail } from "../../../components/common/CollapsibleDetail";
import {
  normalizeMultilineText,
  ReadableProse,
} from "../../../components/common/ReadableProse";
import { classNames } from "../../../utils/format";
import { useApp } from "../../../contexts/AppContext";
import { isAdminRole } from "../../../utils/roles";
import type {
  ScenarioVersion,
  StakeholderPersona,
  AgentKnowledgeItem,
  ScenarioEventConfig,
} from "../instructorData";

function statusTone(status: string): "green" | "amber" | "red" | "navy" | "gray" {
  if (status === "Đã ban hành") return "green";
  if (status === "Từ chối") return "red";
  if (status === "Chờ duyệt") return "navy";
  if (status === "Lưu trữ") return "gray";
  return "amber";
}

function applicationIdForDomain(domain: ScenarioVersion["domain"]) {
  if (domain === "Tài chính") return 3; // DIGITAL_LOS
  if (domain === "Bán lẻ") return 4; // LMS_PROMO
  return 2; // WMS_COLD
}

function categoryToApi(category: AgentKnowledgeItem["category"]) {
  if (category === "Thực tế quy trình") return 1;
  if (category === "Ràng buộc dữ liệu") return 2;
  if (category === "Kiến trúc hệ thống") return 4;
  return 3; // Policy / business rule
}

function triggerToApi(trigger: ScenarioEventConfig["triggerType"]) {
  if (trigger === "message_count") return 1;
  if (trigger === "time_elapsed") return 2;
  if (trigger === "after_sprint_ends") return 4;
  return 0; // Manual
}

function triggerFromApi(
  triggerType: number | string | undefined,
  conditionJson?: string | null
): ScenarioEventConfig["triggerType"] {
  if (triggerType === 4 || triggerType === "AfterSprintEnds") return "after_sprint_ends";
  if (triggerType === 1 || triggerType === "MessageCount") return "message_count";
  if (triggerType === 2 || triggerType === "TimeElapsed") return "time_elapsed";
  const after = parseAfterSprintNo(conditionJson);
  if (after != null) return "after_sprint_ends";
  return "manual_instructor";
}

/** DB bắt buộc ISJSON(TriggerConditionJson)=1 — bọc mô tả tiếng Việt thành JSON. */
function toTriggerConditionJson(
  triggerType: ScenarioEventConfig["triggerType"],
  afterSprintNo: number | undefined,
  note?: string
): string | undefined {
  if (triggerType === "after_sprint_ends") {
    return JSON.stringify({ afterSprintNo: Math.max(1, afterSprintNo || 1) });
  }
  const text = (note || "").trim();
  if (!text) return undefined;
  try {
    JSON.parse(text);
    return text;
  } catch {
    return JSON.stringify({ note: text });
  }
}

function parseAfterSprintNo(raw?: string | null): number | undefined {
  const text = (raw || "").trim();
  if (!text) return undefined;
  try {
    const parsed = JSON.parse(text) as { afterSprintNo?: number; sprintNo?: number };
    const n = parsed.afterSprintNo ?? parsed.sprintNo;
    if (typeof n === "number" && n > 0) return Math.floor(n);
  } catch {
    /* ignore */
  }
  return undefined;
}

function parseTriggerConditionNote(raw?: string | null): string {
  const text = (raw || "").trim();
  if (!text) return "";
  try {
    const parsed = JSON.parse(text) as { note?: string; afterSprintNo?: number };
    if (typeof parsed.afterSprintNo === "number") {
      return `Sau khi kết thúc Sprint ${parsed.afterSprintNo}`;
    }
    if (parsed && typeof parsed.note === "string") return parsed.note;
  } catch {
    /* plain text legacy */
  }
  return text;
}

function formatEventTimingLabel(ev: ScenarioEventConfig): string {
  if (ev.triggerType === "after_sprint_ends") {
    const n = ev.afterSprintNo || parseAfterSprintNo(ev.triggerCondition) || 1;
    return `Sau khi kết thúc Sprint ${n}`;
  }
  if (ev.triggerType === "message_count") return "Theo số tin nhắn";
  if (ev.triggerType === "time_elapsed") return "Theo thời gian đã trôi";
  return "Instructor/Admin kích hoạt thủ công";
}

function slugCode(prefix: string, value: string, index: number) {
  const raw = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toUpperCase()
    .slice(0, 12);
  return `${prefix}${String(index + 1).padStart(2, "0")}${raw ? `-${raw}` : ""}`;
}

interface BlueprintDraft {
  summary: string;
  businessContext: string;
  businessProblem: string;
  businessObjectives: string;
  baRole: string;
  inScope: string;
  outOfScope: string;
  knownConstraints: string;
  difficulty: number;
  isFreeAccess: boolean;
}

const emptyPersonaForm = () => ({
  name: "",
  role: "",
  department: "",
  businessGoal: "",
  authority: "",
  knowledgeBoundary: "",
  hiddenInformation: "",
  conflictingStance: "",
  communicationStyle: "",
  personality: "",
});

type PersonaFormState = ReturnType<typeof emptyPersonaForm>;

const STANCE_MARKER = "Lập trường xung đột:";

function packBusinessConcerns(hiddenInformation: string, conflictingStance: string) {
  const hidden = hiddenInformation.trim();
  const stance = conflictingStance.trim();
  if (hidden && stance) return `${hidden}\n\n${STANCE_MARKER} ${stance}`;
  if (stance) return `${STANCE_MARKER} ${stance}`;
  return hidden || undefined;
}

function unpackBusinessConcerns(raw?: string | null) {
  const text = (raw || "").trim();
  if (!text) return { hiddenInformation: "", conflictingStance: "" };
  const idx = text.indexOf(STANCE_MARKER);
  if (idx < 0) return { hiddenInformation: text, conflictingStance: "" };
  return {
    hiddenInformation: text.slice(0, idx).trim(),
    conflictingStance: text.slice(idx + STANCE_MARKER.length).trim(),
  };
}

interface AuthoringTabProps {
  scenarios: ScenarioVersion[];
  personas: StakeholderPersona[];
  knowledgeItems: AgentKnowledgeItem[];
  events: ScenarioEventConfig[];
  onAddScenario: (scenario: ScenarioVersion) => void;
  onAddPersona: (persona: StakeholderPersona) => void;
  onUpdatePersona?: (persona: StakeholderPersona) => void;
  onAddKnowledge: (item: AgentKnowledgeItem) => void;
  onUpdateKnowledge?: (item: AgentKnowledgeItem) => void;
  onAddEvent: (event: ScenarioEventConfig) => void;
  onUpdateEvent?: (event: ScenarioEventConfig) => void;
  onUpdateScenario?: (scenarioId: string, patch: Partial<ScenarioVersion>) => void;
  onRemoveScenario?: (scenarioId: string) => void;
  onReplaceScenarioAssets?: (
    scenarioId: string,
    next: {
      personas: StakeholderPersona[];
      knowledgeItems: AgentKnowledgeItem[];
      events: ScenarioEventConfig[];
    }
  ) => void;
  onSubmitForReview: (scenarioId: string) => void;
}

const emptyBlueprint = (): BlueprintDraft => ({
  summary: "",
  businessContext: "",
  businessProblem: "",
  businessObjectives: "",
  baRole: "Bạn là Business Analyst phụ trách khảo sát hiện trạng và đặc tả yêu cầu phần mềm.",
  inScope: "",
  outOfScope: "",
  knownConstraints: "",
  difficulty: 1,
  isFreeAccess: false,
});

const SPRINT_PLACEHOLDERS = [
  "VD: Lập BAP, stakeholder analysis và phạm vi",
  "VD: Phỏng vấn stakeholder, elicitation notes, business rules",
  "VD: Xử lý biến cố, cập nhật requirements package",
  "VD: Impact analysis, hoàn thiện RTM / SRS",
];

function sprintPlaceholder(idx: number): string {
  return SPRINT_PLACEHOLDERS[idx] ?? `VD: Nhiệm vụ Sprint ${idx + 1}`;
}

export function AuthoringTab({
  scenarios,
  personas,
  knowledgeItems,
  events,
  onAddScenario,
  onAddPersona,
  onUpdatePersona,
  onAddKnowledge,
  onUpdateKnowledge,
  onAddEvent,
  onUpdateEvent,
  onUpdateScenario,
  onRemoveScenario,
  onReplaceScenarioAssets,
  onSubmitForReview,
}: AuthoringTabProps) {
  const { user } = useApp();
  const isAdminAuthor = isAdminRole(user?.roles);
  /** Hai phần trong cùng trang: danh sách | tạo mới */
  const [workspaceSection, setWorkspaceSection] = useState<"list" | "create">("list");
  const isCreatePage = workspaceSection === "create";

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.scenarioId || "");
  const [activeSubTab, setActiveSubTab] = useState<
    "blueprint" | "personas" | "knowledge" | "rules" | "events" | "rubrics" | "templates"
  >("blueprint");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [blueprint, setBlueprint] = useState<BlueprintDraft>(emptyBlueprint());
  const [sprints, setSprints] = useState<SprintPlan[]>(emptySprintPlans());
  const [businessRules, setBusinessRules] = useState<
    Array<{ code: string; title: string; description: string; isHidden: boolean; importance: number }>
  >([]);
  const [showNewRuleModal, setShowNewRuleModal] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({
    code: "",
    title: "",
    description: "",
    isHidden: true,
    importance: 2,
  });
  const [loadingDefinition, setLoadingDefinition] = useState(false);
  const [savingDefinition, setSavingDefinition] = useState(false);

  const syncSprints = (next: SprintPlan[]) => {
    setSprints(next);
  };

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [creatingScenario, setCreatingScenario] = useState(false);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);
  const [showNewKnowledgeModal, setShowNewKnowledgeModal] = useState(false);
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<string | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

  const [newScenForm, setNewScenForm] = useState({
    title: "",
    code: "",
    domain: "Chuỗi cung ứng" as ScenarioVersion["domain"],
  });

  const [personaForm, setPersonaForm] = useState<PersonaFormState>(emptyPersonaForm);

  const [newKnoForm, setNewKnoForm] = useState({
    code: "",
    title: "",
    category: "Quy tắc nghiệp vụ" as AgentKnowledgeItem["category"],
    content: "",
    confidentiality: "Nội bộ" as AgentKnowledgeItem["confidentiality"],
    personaCodes: [] as string[],
  });

  const [newEventForm, setNewEventForm] = useState({
    title: "",
    triggerType: "after_sprint_ends" as ScenarioEventConfig["triggerType"],
    afterSprintNo: 1,
    triggerCondition: "Sau khi kết thúc Sprint 1",
    description: "",
    impactedRequirements: "",
    injectedFact: "",
  });

  const draftScenario: ScenarioVersion = useMemo(
    () => ({
      id: "SCV-NEW",
      scenarioId: newScenForm.code.trim().toUpperCase() || "NEW-DRAFT",
      scenarioTitle: newScenForm.title.trim() || "Kịch bản mới (chưa lưu)",
      domain: newScenForm.domain,
      versionNumber: "v1.0",
      status: "Bản nháp",
      baselineProblem: "",
      groundTruth: "",
      summary: blueprint.summary,
      businessContext: blueprint.businessContext,
      businessProblem: blueprint.businessProblem,
      businessObjectives: blueprint.businessObjectives,
      baRole: blueprint.baRole,
      assignment: "",
      inScope: blueprint.inScope,
      outOfScope: blueprint.outOfScope,
      knownConstraints: blueprint.knownConstraints,
      difficulty: blueprint.difficulty,
      stakeholdersCount: 0,
      eventsCount: 0,
      evidenceCount: 0,
      rubricCriteriaCount: 5,
      updatedAt: new Date().toLocaleDateString("vi-VN"),
    }),
    [newScenForm, blueprint]
  );

  const currentScenario = useMemo(() => {
    if (isCreatingNew) return draftScenario;
    return scenarios.find((s) => s.scenarioId === selectedScenarioId) || scenarios[0];
  }, [isCreatingNew, draftScenario, scenarios, selectedScenarioId]);

  const filteredScenarios = scenarios.filter((s) => domainFilter === "all" || s.domain === domainFilter);
  const myScenarios = filteredScenarios.filter((s) => !s.isSystemLibrary);
  const libraryScenarios = filteredScenarios.filter((s) => s.isSystemLibrary);
  const scenarioPersonas = isCreatingNew
    ? []
    : personas.filter((p) => p.scenarioId === (currentScenario?.scenarioId || selectedScenarioId));
  const scenarioKnowledge = isCreatingNew
    ? []
    : knowledgeItems.filter((k) => k.scenarioId === (currentScenario?.scenarioId || selectedScenarioId));
  const scenarioEvents = isCreatingNew
    ? []
    : events.filter((e) => e.scenarioId === (currentScenario?.scenarioId || selectedScenarioId));

  const activeDbId = isCreatingNew
    ? 0
    : parseInt(String(currentScenario?.id || "").replace(/\D+/g, ""), 10) || 0;
  const readOnly =
    !isCreatingNew &&
    (Boolean(currentScenario?.isSystemLibrary) ||
      currentScenario?.status === "Đã ban hành" ||
      currentScenario?.status === "Chờ duyệt");

  const beginCreateScenario = () => {
    setWorkspaceSection("create");
    setIsCreatingNew(true);
    setSelectedScenarioId("__new__");
    setActiveSubTab("blueprint");
    setNewScenForm({ title: "", code: "", domain: "Chuỗi cung ứng" });
    setBlueprint(emptyBlueprint());
    setSprints(emptySprintPlans());
    setBusinessRules([]);
  };

  const cancelCreateScenario = () => {
    setWorkspaceSection("list");
    setIsCreatingNew(false);
    setCreatingScenario(false);
    setNewScenForm({ title: "", code: "", domain: "Chuỗi cung ứng" });
    setSelectedScenarioId(scenarios[0]?.scenarioId || "");
  };

  const selectExistingScenario = (scenarioId: string) => {
    setWorkspaceSection("list");
    setIsCreatingNew(false);
    setCreatingScenario(false);
    setNewScenForm({ title: "", code: "", domain: "Chuỗi cung ứng" });
    setSelectedScenarioId(scenarioId);
  };

  const openListSection = () => {
    setWorkspaceSection("list");
    setIsCreatingNew(false);
    setCreatingScenario(false);
    setNewScenForm({ title: "", code: "", domain: "Chuỗi cung ứng" });
    if (scenarios[0]?.scenarioId && selectedScenarioId === "__new__") {
      setSelectedScenarioId(scenarios[0].scenarioId);
    }
  };

  useEffect(() => {
    if (isCreatingNew) return;
    if (scenarios.length && !scenarios.some((s) => s.scenarioId === selectedScenarioId)) {
      setSelectedScenarioId(scenarios[0].scenarioId);
    }
  }, [scenarios, selectedScenarioId, isCreatingNew]);

  useEffect(() => {
    if (isCreatingNew || !currentScenario || !activeDbId) return;

    let cancelled = false;
    const hydrateFromList = () => {
      setBlueprint({
        summary: currentScenario.summary || currentScenario.scenarioTitle || "",
        businessContext: currentScenario.businessContext || currentScenario.baselineProblem || "",
        businessProblem: currentScenario.businessProblem || currentScenario.groundTruth || "",
        businessObjectives: currentScenario.businessObjectives || "",
        baRole:
          currentScenario.baRole ||
          "Bạn là Business Analyst phụ trách khảo sát hiện trạng và đặc tả yêu cầu phần mềm.",
        inScope: currentScenario.inScope || "",
        outOfScope: currentScenario.outOfScope || "",
        knownConstraints: currentScenario.knownConstraints || "",
        difficulty: currentScenario.difficulty ?? 1,
        isFreeAccess: Boolean((currentScenario as { isFreeAccess?: boolean }).isFreeAccess),
      });
      setSprints(emptySprintPlans());
    };

    hydrateFromList();
    setLoadingDefinition(true);
    scenarioAuthoringService
      .getDefinition(activeDbId)
      .then((def) => {
        if (cancelled) return;
        applyDefinitionToUi(def);
      })
      .catch(() => {
        /* keep list hydrate */
      })
      .finally(() => {
        if (!cancelled) setLoadingDefinition(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isCreatingNew, currentScenario?.id, currentScenario?.scenarioId]);

  const applyDefinitionToUi = (def: ScenarioDefinitionDto) => {
    const resolvedSprints = sprintsFromDefinition(def.sprints).map((s) => ({
      ...s,
      focus: normalizeMultilineText(s.focus),
    }));
    setBlueprint({
      summary: normalizeMultilineText(def.summary || def.scenarioTitle || ""),
      businessContext: normalizeMultilineText(def.businessContext || ""),
      businessProblem: normalizeMultilineText(def.businessProblem || ""),
      businessObjectives: normalizeMultilineText(def.businessObjectives || ""),
      baRole: normalizeMultilineText(def.baRole || ""),
      inScope: normalizeMultilineText(def.inScope || ""),
      outOfScope: normalizeMultilineText(def.outOfScope || ""),
      knownConstraints: normalizeMultilineText(def.knownConstraints || ""),
      difficulty: typeof def.difficulty === "number" ? def.difficulty : 1,
      isFreeAccess: Boolean(def.isFreeAccess),
    });
    setSprints(resolvedSprints);
    setBusinessRules(
      (def.businessRules || []).map((r) => ({
        code: r.code,
        title: r.title,
        description: normalizeMultilineText(r.description),
        isHidden: Boolean(r.isHidden),
        importance: r.importance ?? 2,
      }))
    );

    const nextPersonas: StakeholderPersona[] = (def.personas || []).map((p, index) => {
      const concerns = unpackBusinessConcerns(p.businessConcerns);
      return {
        id: `PER-${p.id}`,
        code: `P${String(index + 1).padStart(2, "0")}`,
        scenarioId: def.scenarioCode,
        name: p.name,
        role: p.stakeholderRole,
        department: p.department || "",
        businessGoal: p.goals || "",
        authority: p.responsibilities || "",
        knowledgeBoundary: p.painPoints || "",
        hiddenInformation: concerns.hiddenInformation,
        conflictingStance: concerns.conflictingStance,
        communicationStyle: p.communicationStyle || "",
        personality: p.personality || "",
        status: "Đã kiểm thử đạt" as const,
      };
    });

    const personaCodeByName = new Map(nextPersonas.map((p) => [p.name, p.code || ""]));
    const nextKnowledge: AgentKnowledgeItem[] = (def.knowledgeItems || []).map((k) => ({
      id: `KNO-${k.id}`,
      code: k.code,
      scenarioId: def.scenarioCode,
      title: k.title,
      category:
        k.category === 1
          ? "Thực tế quy trình"
          : k.category === 2
            ? "Ràng buộc dữ liệu"
            : k.category === 4
              ? "Kiến trúc hệ thống"
              : "Quy tắc nghiệp vụ",
      content: normalizeMultilineText(k.content),
      confidentiality: k.accessList?.some((a) => a.isHidden) ? "Tuyệt mật" : "Nội bộ",
      knownByStakeholders: (k.accessList || [])
        .map((a) => personaCodeByName.get(a.personaName) || a.personaName)
        .filter(Boolean),
    }));

    const nextEvents: ScenarioEventConfig[] = (def.events || []).map((ev) => {
      const triggerType = triggerFromApi(ev.triggerType, ev.triggerConditionJson);
      const afterSprintNo = parseAfterSprintNo(ev.triggerConditionJson);
      const draft: ScenarioEventConfig = {
        id: `EV-${ev.id}`,
        scenarioId: def.scenarioCode,
        title: ev.title,
        triggerType,
        afterSprintNo,
        triggerCondition: "",
        description: normalizeMultilineText(ev.description),
        impactedRequirements: [],
        injectedFact: normalizeMultilineText(ev.eventContent),
      };
      draft.triggerCondition = formatEventTimingLabel(draft);
      return draft;
    });

    onReplaceScenarioAssets?.(def.scenarioCode, {
      personas: nextPersonas,
      knowledgeItems: nextKnowledge,
      events: nextEvents,
    });
    onUpdateScenario?.(def.scenarioCode, {
      id: `SCV-${def.id}`,
      versionNumber: `v${def.versionNo}.0`,
      scenarioTitle: def.scenarioTitle,
      summary: def.summary || undefined,
      businessContext: def.businessContext,
      businessProblem: def.businessProblem,
      businessObjectives: def.businessObjectives,
      baRole: def.baRole,
      assignment: "",
      inScope: def.inScope || undefined,
      outOfScope: def.outOfScope || undefined,
      knownConstraints: def.knownConstraints || undefined,
      difficulty: typeof def.difficulty === "number" ? def.difficulty : 1,
      baselineProblem: def.businessContext,
      groundTruth: def.businessProblem,
      stakeholdersCount: nextPersonas.length,
      eventsCount: nextEvents.length,
      evidenceCount: nextKnowledge.length,
      reviewComment: def.reviewComment || undefined,
    });
  };

  const buildSavePayload = () => {
    const personaPayload = scenarioPersonas.map((p, index) => ({
      code: p.code || slugCode("P", p.name, index),
      name: p.name,
      stakeholderRole: p.role,
      department: p.department || undefined,
      responsibilities: p.authority || undefined,
      goals: p.businessGoal || undefined,
      painPoints: p.knowledgeBoundary || undefined,
      businessConcerns: packBusinessConcerns(p.hiddenInformation, p.conflictingStance),
      communicationStyle: p.communicationStyle || undefined,
      personality: p.personality || undefined,
      displayOrder: index + 1,
      isActive: true,
    }));

    const codeByLocalId = new Map(
      scenarioPersonas.map((p, index) => [p.id, p.code || slugCode("P", p.name, index)])
    );
    const codeByName = new Map(personaPayload.map((p) => [p.name, p.code]));

    const knowledgePayload = scenarioKnowledge.map((k, index) => {
      const accessCodes = (k.knownByStakeholders || [])
        .map((ref) => codeByLocalId.get(ref) || codeByName.get(ref) || ref)
        .filter(Boolean);
      const uniqueCodes = Array.from(new Set(accessCodes));
      return {
        code: k.code || slugCode("K", k.title, index),
        title: k.title,
        content: k.content,
        category: categoryToApi(k.category),
        importance: k.confidentiality === "Tuyệt mật" ? 3 : 2,
        accessList: uniqueCodes.map((personaCode) => ({
          personaCode,
          accessType: 0,
          isHidden: k.confidentiality === "Tuyệt mật",
        })),
      };
    });

    const eventPayload = scenarioEvents.map((ev, index) => ({
      title: ev.title,
      description: ev.description || ev.title,
      triggerType: triggerToApi(ev.triggerType),
      triggerConditionJson: toTriggerConditionJson(
        ev.triggerType,
        ev.afterSprintNo,
        ev.triggerCondition
      ),
      eventContent: ev.injectedFact || ev.description || ev.title,
      displayOrder: index + 1,
      isActive: true,
    }));

    return {
      summary: blueprint.summary.trim() || currentScenario?.scenarioTitle,
      businessContext: blueprint.businessContext.trim(),
      businessProblem: blueprint.businessProblem.trim(),
      businessObjectives: blueprint.businessObjectives.trim(),
      baRole: blueprint.baRole.trim() || "Business Analyst",
      assignment: "",
      inScope: blueprint.inScope.trim() || undefined,
      outOfScope: blueprint.outOfScope.trim() || undefined,
      knownConstraints: blueprint.knownConstraints.trim() || undefined,
      difficulty: blueprint.difficulty,
      // Theo role: Admin → library toàn hệ thống; Instructor → chỉ list của họ.
      isFreeAccess: isAdminAuthor,
      personas: personaPayload,
      knowledgeItems: knowledgePayload,
      businessRules: businessRules.map((r) => ({
        code: r.code,
        title: r.title,
        description: r.description,
        isHidden: r.isHidden,
        importance: r.importance,
      })),
      events: eventPayload,
      sprints: toUpsertSprintPayload(sprints),
    };
  };

  const handleCreateScenario = async () => {
    if (!newScenForm.title.trim() || !newScenForm.code.trim()) {
      alert("Cần điền Mã kịch bản và Tên kịch bản.");
      setActiveSubTab("blueprint");
      return;
    }
    if (!blueprint.businessContext.trim() || !blueprint.businessProblem.trim() || !blueprint.businessObjectives.trim()) {
      alert("Cần điền đủ Bối cảnh, Vấn đề và Mục tiêu trước khi tạo.");
      setActiveSubTab("blueprint");
      return;
    }
    if (!sprintsAreValid(sprints)) {
      alert("Cần ít nhất 1 sprint; mỗi sprint phải có nhiệm vụ và thời hạn (ngày/tuần) trước khi tạo.");
      setActiveSubTab("blueprint");
      return;
    }

    setCreatingScenario(true);
    try {
      const created = await scenarioAuthoringService.createScenario({
        applicationId: applicationIdForDomain(newScenForm.domain),
        code: newScenForm.code.toUpperCase(),
        title: newScenForm.title.trim(),
        description: blueprint.businessProblem.trim() || newScenForm.title.trim(),
        summary: blueprint.summary.trim() || newScenForm.title.trim(),
        businessContext: blueprint.businessContext.trim(),
        businessProblem: blueprint.businessProblem.trim(),
        businessObjectives: blueprint.businessObjectives.trim(),
        baRole:
          blueprint.baRole.trim() ||
          "Bạn là Business Analyst phụ trách khảo sát hiện trạng và đặc tả yêu cầu phần mềm.",
        assignment: "",
      });

      const versionId = created.initialVersionId || created.currentDraftVersionId || created.id;
      const scenarioCode = created.code || newScenForm.code.toUpperCase();

      try {
        await scenarioAuthoringService.updateDefinition(versionId, {
          summary: blueprint.summary.trim() || newScenForm.title.trim(),
          businessContext: blueprint.businessContext.trim(),
          businessProblem: blueprint.businessProblem.trim(),
          businessObjectives: blueprint.businessObjectives.trim(),
          baRole:
            blueprint.baRole.trim() ||
            "Bạn là Business Analyst phụ trách khảo sát hiện trạng và đặc tả yêu cầu phần mềm.",
          assignment: "",
          inScope: blueprint.inScope.trim() || undefined,
          outOfScope: blueprint.outOfScope.trim() || undefined,
          knownConstraints: blueprint.knownConstraints.trim() || undefined,
          difficulty: blueprint.difficulty,
          isFreeAccess: isAdminAuthor,
          personas: [],
          knowledgeItems: [],
          businessRules: businessRules,
          events: [],
          sprints: toUpsertSprintPayload(sprints),
        });
      } catch {
        /* create already stored core fields; optional full definition can be saved later */
      }

      const newSc: ScenarioVersion = {
        id: `SCV-${versionId}`,
        scenarioId: scenarioCode,
        scenarioTitle: created.title || newScenForm.title.trim(),
        domain: newScenForm.domain,
        versionNumber: "v1.0",
        status: "Bản nháp",
        baselineProblem: blueprint.businessContext,
        groundTruth: blueprint.businessProblem,
        summary: blueprint.summary || newScenForm.title.trim(),
        businessContext: blueprint.businessContext,
        businessProblem: blueprint.businessProblem,
        businessObjectives: blueprint.businessObjectives,
        baRole: blueprint.baRole,
        assignment: "",
        inScope: blueprint.inScope,
        outOfScope: blueprint.outOfScope,
        knownConstraints: blueprint.knownConstraints,
        difficulty: blueprint.difficulty,
        stakeholdersCount: 0,
        eventsCount: 0,
        evidenceCount: 0,
        rubricCriteriaCount: 5,
        updatedAt: new Date().toLocaleDateString("vi-VN"),
      };
      onAddScenario(newSc);
      setIsCreatingNew(false);
      setSelectedScenarioId(newSc.scenarioId);
      setNewScenForm({ title: "", code: "", domain: "Chuỗi cung ứng" });
      setActiveSubTab("blueprint");
      alert("Đã tạo kịch bản nháp. Tiếp tục thêm Personas / Knowledge / Events rồi lưu định nghĩa.");
      setWorkspaceSection("list");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không tạo được kịch bản trên máy chủ.");
    } finally {
      setCreatingScenario(false);
    }
  };

  const handleSaveDefinition = async () => {
    if (!activeDbId) {
      alert("Chưa xác định được versionId của kịch bản.");
      return;
    }
    if (readOnly) {
      alert("Kịch bản đang chờ duyệt hoặc đã ban hành nên không thể sửa.");
      return;
    }
    if (!blueprint.businessContext.trim() || !blueprint.businessProblem.trim() || !blueprint.businessObjectives.trim()) {
      alert("Cần điền đủ Bối cảnh, Vấn đề và Mục tiêu trước khi lưu.");
      return;
    }
    if (!sprintsAreValid(sprints)) {
      alert("Cần ít nhất 1 sprint; mỗi sprint phải có nhiệm vụ và thời hạn (ngày/tuần) trước khi lưu.");
      return;
    }

    setSavingDefinition(true);
    try {
      const saved = await scenarioAuthoringService.updateDefinition(activeDbId, buildSavePayload());
      applyDefinitionToUi(saved);
      alert("Đã lưu định nghĩa kịch bản (blueprint + personas + knowledge + events) lên máy chủ.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không lưu được định nghĩa kịch bản.");
    } finally {
      setSavingDefinition(false);
    }
  };

  const handleSubmitForReview = async (scId: string) => {
    if (!activeDbId) return;
    try {
      // Persist latest draft before submit so Expert sees full definition.
      if (!readOnly) {
        await scenarioAuthoringService.updateDefinition(activeDbId, buildSavePayload());
      }
      await scenarioAuthoringService.submitForReview(activeDbId);
      onSubmitForReview(scId);
      onUpdateScenario?.(scId, { status: "Chờ duyệt" });
      alert("Đã gửi kịch bản cho Expert duyệt.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không gửi được yêu cầu duyệt.");
    }
  };

  const handleCreateVersion = async () => {
    if (!currentScenario || !activeDbId) {
      alert("Chưa xác định được kịch bản hiện tại.");
      return;
    }
    try {
      const def = await scenarioAuthoringService.getDefinition(activeDbId);
      const created = await scenarioAuthoringService.createVersion(
        def.scenarioId,
        true,
        def.summary || undefined
      );
      onUpdateScenario?.(currentScenario.scenarioId, {
        id: `SCV-${created.id}`,
        versionNumber: `v${created.versionNo}.0`,
        status: "Bản nháp",
        reviewComment: undefined,
        summary: created.summary || def.summary || currentScenario.summary,
      });
      setSelectedScenarioId(currentScenario.scenarioId);
      const fresh = await scenarioAuthoringService.getDefinition(created.id);
      applyDefinitionToUi(fresh);
      setActiveSubTab("blueprint");
      alert(
        `Đã tạo version mới v${created.versionNo}. Bạn có thể sửa blueprint, knowledge, rules, events rồi bấm Lưu định nghĩa. Nếu không muốn giữ bản này, dùng «Xóa bản nháp».`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không tạo được version mới.");
    }
  };

  const handleDiscardDraft = async () => {
    if (!currentScenario || !activeDbId) {
      alert("Chưa xác định được bản nháp hiện tại.");
      return;
    }
    if (currentScenario.status !== "Bản nháp" && currentScenario.status !== "Từ chối") {
      alert("Chỉ xóa được bản nháp hoặc bản bị từ chối.");
      return;
    }
    const ok = window.confirm(
      `Xóa bản ${currentScenario.versionNumber}? Thao tác này không hoàn tác. Nếu còn version đã ban hành, hệ thống sẽ quay về bản đó.`
    );
    if (!ok) return;

    try {
      const result = await scenarioAuthoringService.discardDraft(activeDbId);
      const scId = currentScenario.scenarioId;

      if (result.scenarioDeleted || !result.fallbackVersionId) {
        onRemoveScenario?.(scId);
        setSelectedScenarioId("");
        setBlueprint(emptyBlueprint());
        setSprints(emptySprintPlans());
        setBusinessRules([]);
        setWorkspaceSection("list");
        alert("Đã xóa bản nháp (và kịch bản vì không còn version nào).");
        return;
      }

      const fallback = await scenarioAuthoringService.getDefinition(result.fallbackVersionId);
      onUpdateScenario?.(scId, {
        id: `SCV-${fallback.id}`,
        versionNumber: `v${fallback.versionNo}.0`,
        status: fallback.isPublished ? "Đã ban hành" : "Bản nháp",
        reviewComment: fallback.reviewComment || undefined,
        summary: fallback.summary || result.fallbackSummary || "",
      });
      applyDefinitionToUi(fallback);
      setActiveSubTab("blueprint");
      alert(
        `Đã xóa bản nháp. Đang mở lại version v${result.fallbackVersionNo ?? fallback.versionNo}.`
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không xóa được bản nháp.";
      alert(
        msg.includes("Đã xảy ra lỗi máy chủ") || /not found|404/i.test(msg)
          ? "Không xóa được bản nháp. Hãy restart API (endpoint xóa bản nháp mới) rồi thử lại.\n\n" + msg
          : msg
      );
    }
  };

  const openCreatePersona = () => {
    setEditingPersonaId(null);
    setPersonaForm(emptyPersonaForm());
    setShowPersonaModal(true);
  };

  const openEditPersona = (p: StakeholderPersona) => {
    setEditingPersonaId(p.id);
    setPersonaForm({
      name: p.name,
      role: p.role,
      department: p.department,
      businessGoal: p.businessGoal,
      authority: p.authority,
      knowledgeBoundary: p.knowledgeBoundary,
      hiddenInformation: p.hiddenInformation,
      conflictingStance: p.conflictingStance,
      communicationStyle: p.communicationStyle || "",
      personality: p.personality || "",
    });
    setShowPersonaModal(true);
  };

  const closePersonaModal = () => {
    setShowPersonaModal(false);
    setEditingPersonaId(null);
    setPersonaForm(emptyPersonaForm());
  };

  const handleSavePersona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScenario || !personaForm.name.trim() || !personaForm.role.trim()) return;

    if (editingPersonaId) {
      const existing = scenarioPersonas.find((p) => p.id === editingPersonaId);
      if (!existing) return;
      onUpdatePersona?.({
        ...existing,
        name: personaForm.name.trim(),
        role: personaForm.role.trim(),
        department: personaForm.department.trim(),
        businessGoal: personaForm.businessGoal.trim(),
        authority: personaForm.authority.trim(),
        knowledgeBoundary: personaForm.knowledgeBoundary.trim(),
        hiddenInformation: personaForm.hiddenInformation.trim(),
        conflictingStance: personaForm.conflictingStance.trim(),
        communicationStyle: personaForm.communicationStyle.trim(),
        personality: personaForm.personality.trim(),
      });
    } else {
      const code = slugCode("P", personaForm.name, scenarioPersonas.length);
      onAddPersona({
        id: `per-${Date.now()}`,
        code,
        scenarioId: currentScenario.scenarioId,
        name: personaForm.name.trim(),
        role: personaForm.role.trim(),
        department: personaForm.department.trim(),
        businessGoal: personaForm.businessGoal.trim(),
        authority: personaForm.authority.trim(),
        knowledgeBoundary: personaForm.knowledgeBoundary.trim(),
        hiddenInformation: personaForm.hiddenInformation.trim(),
        conflictingStance: personaForm.conflictingStance.trim(),
        communicationStyle: personaForm.communicationStyle.trim(),
        personality: personaForm.personality.trim(),
        status: "Đã kiểm thử đạt",
      });
    }
    closePersonaModal();
  };

  const openCreateKnowledge = () => {
    setEditingKnowledgeId(null);
    setNewKnoForm({
      code: "",
      title: "",
      category: "Quy tắc nghiệp vụ",
      content: "",
      confidentiality: "Nội bộ",
      personaCodes: [],
    });
    setShowNewKnowledgeModal(true);
  };

  const openEditKnowledge = (k: AgentKnowledgeItem) => {
    setEditingKnowledgeId(k.id);
    setNewKnoForm({
      code: k.code || "",
      title: k.title,
      category: k.category,
      content: k.content,
      confidentiality: k.confidentiality,
      personaCodes: [...k.knownByStakeholders],
    });
    setShowNewKnowledgeModal(true);
  };

  const handleCreateKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScenario || !newKnoForm.title.trim() || !newKnoForm.content.trim()) return;
    if (newKnoForm.personaCodes.length === 0) {
      alert("Chọn ít nhất một persona được biết knowledge này (bắt buộc để gửi Expert duyệt).");
      return;
    }
    if (editingKnowledgeId) {
      const existing = scenarioKnowledge.find((k) => k.id === editingKnowledgeId);
      if (!existing) return;
      onUpdateKnowledge?.({
        ...existing,
        code: newKnoForm.code.trim() || existing.code,
        title: newKnoForm.title.trim(),
        category: newKnoForm.category,
        content: normalizeMultilineText(newKnoForm.content.trim()),
        confidentiality: newKnoForm.confidentiality,
        knownByStakeholders: newKnoForm.personaCodes,
      });
    } else {
      const newK: AgentKnowledgeItem = {
        id: `kno-${Date.now()}`,
        code: newKnoForm.code.trim() || slugCode("K", newKnoForm.title, scenarioKnowledge.length),
        scenarioId: currentScenario.scenarioId,
        title: newKnoForm.title.trim(),
        category: newKnoForm.category,
        content: normalizeMultilineText(newKnoForm.content.trim()),
        confidentiality: newKnoForm.confidentiality,
        knownByStakeholders: newKnoForm.personaCodes,
      };
      onAddKnowledge(newK);
    }
    setShowNewKnowledgeModal(false);
    setEditingKnowledgeId(null);
    setNewKnoForm({
      code: "",
      title: "",
      category: "Quy tắc nghiệp vụ",
      content: "",
      confidentiality: "Nội bộ",
      personaCodes: [],
    });
  };

  const openCreateRule = () => {
    setEditingRuleIndex(null);
    setNewRuleForm({ code: "", title: "", description: "", isHidden: true, importance: 2 });
    setShowNewRuleModal(true);
  };

  const openEditRule = (idx: number) => {
    const rule = businessRules[idx];
    if (!rule) return;
    setEditingRuleIndex(idx);
    setNewRuleForm({
      code: rule.code,
      title: rule.title,
      description: rule.description,
      isHidden: rule.isHidden,
      importance: rule.importance,
    });
    setShowNewRuleModal(true);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleForm.title.trim() || !newRuleForm.description.trim()) return;
    const code =
      newRuleForm.code.trim().toUpperCase() ||
      slugCode("BR", newRuleForm.title, businessRules.length);
    const next = {
      code,
      title: newRuleForm.title.trim(),
      description: normalizeMultilineText(newRuleForm.description.trim()),
      isHidden: newRuleForm.isHidden,
      importance: newRuleForm.importance,
    };
    if (editingRuleIndex != null) {
      setBusinessRules((prev) => prev.map((r, i) => (i === editingRuleIndex ? next : r)));
    } else {
      setBusinessRules((prev) => [...prev, next]);
    }
    setNewRuleForm({ code: "", title: "", description: "", isHidden: true, importance: 2 });
    setEditingRuleIndex(null);
    setShowNewRuleModal(false);
  };

  const openCreateEvent = () => {
    setEditingEventId(null);
    setNewEventForm({
      title: "",
      triggerType: "after_sprint_ends",
      afterSprintNo: 1,
      triggerCondition: "Sau khi kết thúc Sprint 1",
      description: "",
      impactedRequirements: "",
      injectedFact: "",
    });
    setShowNewEventModal(true);
  };

  const openEditEvent = (ev: ScenarioEventConfig) => {
    setEditingEventId(ev.id);
    setNewEventForm({
      title: ev.title,
      triggerType: "after_sprint_ends",
      afterSprintNo: ev.afterSprintNo || parseAfterSprintNo(ev.triggerCondition) || 1,
      triggerCondition: ev.triggerCondition,
      description: ev.description,
      impactedRequirements: ev.impactedRequirements.join(", "),
      injectedFact: ev.injectedFact,
    });
    setShowNewEventModal(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentScenario || !newEventForm.title.trim()) return;
    const afterSprintNo = Math.max(1, newEventForm.afterSprintNo || 1);
    const payload: ScenarioEventConfig = {
      id: editingEventId || `evt-${Date.now()}`,
      scenarioId: currentScenario.scenarioId,
      title: newEventForm.title.trim(),
      triggerType: "after_sprint_ends",
      afterSprintNo,
      triggerCondition: `Sau khi kết thúc Sprint ${afterSprintNo}`,
      description: normalizeMultilineText(newEventForm.description.trim()),
      impactedRequirements: newEventForm.impactedRequirements
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      injectedFact: normalizeMultilineText(newEventForm.injectedFact.trim()),
    };
    if (editingEventId) onUpdateEvent?.(payload);
    else onAddEvent(payload);
    setShowNewEventModal(false);
    setEditingEventId(null);
    setNewEventForm({
      title: "",
      triggerType: "after_sprint_ends",
      afterSprintNo: 1,
      triggerCondition: "Sau khi kết thúc Sprint 1",
      description: "",
      impactedRequirements: "",
      injectedFact: "",
    });
  };

  const fieldClass =
    "w-full whitespace-pre-wrap rounded-xl border border-[#d9e4ec] p-2.5 text-xs leading-5 text-[#132d49] outline-none focus:border-[#2f638c] disabled:bg-[#f5f8fa]";

  return (
    <div className="space-y-6">
      <div className="reveal-up flex flex-wrap gap-2 rounded-2xl border border-brass/25 bg-gradient-to-r from-[#fbf6ec] via-white to-white p-2 shadow-[0_8px_24px_rgba(183,121,31,0.06)]">
        <button
          type="button"
          onClick={openListSection}
          className={classNames(
            "rounded-xl px-4 py-2.5 text-xs font-bold transition",
            workspaceSection === "list"
              ? "bg-brass text-navy shadow-sm"
              : "text-slate hover:bg-[#fbf6ec]"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <Layers3 size={14} /> Danh sách kịch bản
          </span>
        </button>
        <button
          type="button"
          onClick={beginCreateScenario}
          className={classNames(
            "rounded-xl px-4 py-2.5 text-xs font-bold transition",
            workspaceSection === "create"
              ? "bg-brass text-navy shadow-sm"
              : "text-slate hover:bg-[#fbf6ec]"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus size={14} /> Tạo kịch bản mới
          </span>
        </button>
      </div>

      {!isCreatePage && (
        <div className="reveal-up flex flex-wrap gap-2">
          {(["all", "Bán lẻ", "Chuỗi cung ứng", "Tài chính"] as const).map((domain) => (
            <button
              key={domain}
              onClick={() => setDomainFilter(domain)}
              className={classNames(
                "rounded-xl border px-3 py-1.5 text-xs font-bold",
                domainFilter === domain
                  ? "border-brass bg-brass text-navy"
                  : "border-brass/20 bg-white text-slate hover:bg-[#fbf6ec]"
              )}
            >
              {domain === "all" ? "Tất cả ngành" : domain}
            </button>
          ))}
        </div>
      )}

      {isCreatePage && (
        <div className="reveal-up rounded-2xl border border-dashed border-brass/40 bg-[#fbf6ec] p-4">
          <p className="text-sm font-bold text-navy">
            {newScenForm.title.trim() || "Kịch bản mới (chưa lưu)"}
          </p>
          <p className="mt-1 text-[11px] text-slate">
            Điền blueprint bên dưới rồi bấm Tạo kịch bản. Sau khi lưu sẽ chuyển về danh sách.
          </p>
        </div>
      )}

      {!isCreatePage && (
        <div className="reveal-up reveal-delay-1 space-y-5">
          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-navy">
              Kịch bản của tôi ({myScenarios.length})
            </h3>
            {myScenarios.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate/25 bg-white px-3 py-4 text-xs text-slate">
                Chưa có kịch bản tự soạn. Bấm “Tạo kịch bản mới” để bắt đầu.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {myScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => selectExistingScenario(sc.scenarioId)}
                    className={classNames(
                      "instructor-kpi-card rounded-2xl border p-4 text-left",
                      currentScenario?.scenarioId === sc.scenarioId
                        ? "border-brass/50 bg-[#fbf6ec] shadow-sm ring-2 ring-brass/20"
                        : "border-brass/15 bg-white hover:border-brass/40 hover:bg-[#fbf6ec]/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-brass">
                        {sc.scenarioId}
                      </span>
                      <Badge tone={statusTone(sc.status)}>{sc.status}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-navy">
                      {sc.scenarioTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-slate">
                      {sc.domain} · {sc.versionNumber} · {sc.stakeholdersCount} persona
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-navy">
              Thư viện hệ thống ({libraryScenarios.length})
            </h3>
            {libraryScenarios.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate/25 bg-white px-3 py-4 text-xs text-slate">
                Chưa có kịch bản thư viện (IsFreeAccess) để tham khảo / giao bài.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {libraryScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => selectExistingScenario(sc.scenarioId)}
                    className={classNames(
                      "instructor-kpi-card rounded-2xl border p-4 text-left",
                      currentScenario?.scenarioId === sc.scenarioId
                        ? "border-teal-400/60 bg-teal-50/50 shadow-sm ring-2 ring-teal-200/50"
                        : "border-teal-200/60 bg-white hover:border-teal-300 hover:bg-teal-50/40"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-teal-700">
                        {sc.scenarioId}
                      </span>
                      <Badge tone="green">Thư viện</Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-navy">
                      {sc.scenarioTitle}
                    </p>
                    <p className="mt-1 text-[11px] text-slate">
                      {sc.domain} · Chỉ xem / giao bài
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {currentScenario && (
        <Card className="reveal-up reveal-delay-2 overflow-hidden border-brass/25 shadow-[0_8px_24px_rgba(183,121,31,0.06)]">
          <div className="border-b border-brass/15 bg-gradient-to-r from-[#fbf6ec] to-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-navy">{currentScenario.scenarioTitle}</h2>
                  <Badge tone={statusTone(currentScenario.status)}>{currentScenario.status}</Badge>
                  {loadingDefinition && (
                    <span className="text-[11px] font-semibold text-slate">Đang tải định nghĩa...</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate">
                  {isCreatingNew
                    ? "Form trống — điền blueprint rồi bấm Tạo kịch bản"
                    : `Version id ${activeDbId || "—"} · ${currentScenario.domain} · ${currentScenario.versionNumber}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isCreatingNew ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={cancelCreateScenario} className="gap-1.5 text-xs">
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      disabled={creatingScenario}
                      onClick={() => void handleCreateScenario()}
                      className="gap-1.5 text-xs bg-navy text-white"
                    >
                      <Save size={14} />
                      {creatingScenario ? "Đang tạo..." : "Tạo kịch bản"}
                    </Button>
                  </>
                ) : (
                  <>
                    {(currentScenario.status === "Bản nháp" ||
                      currentScenario.status === "Từ chối") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void handleDiscardDraft()}
                        className="gap-1.5 text-xs text-[#a03d3d] border-red-200"
                      >
                        <Trash2 size={14} /> Xóa bản nháp
                      </Button>
                    )}
                    {currentScenario.status === "Đã ban hành" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => void handleCreateVersion()}
                        className="gap-1.5 text-xs"
                      >
                        <Copy size={14} /> Tạo Version mới
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={savingDefinition || readOnly}
                      onClick={() => void handleSaveDefinition()}
                      className="gap-1.5 text-xs border-brass/40"
                    >
                      <Save size={14} className="text-brass" />
                      {savingDefinition ? "Đang lưu..." : "Lưu định nghĩa"}
                    </Button>
                    {currentScenario.status === "Đã ban hành" ? (
                      <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                        Đã ban hành
                      </span>
                    ) : currentScenario.status === "Chờ duyệt" ? (
                      <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-navy">
                        Đang chờ Expert duyệt
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => void handleSubmitForReview(currentScenario.scenarioId)}
                        className="gap-1.5 text-xs bg-navy text-white"
                      >
                        <CheckCircle2 size={14} /> Gửi Expert duyệt
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {currentScenario.reviewComment && currentScenario.status !== "Đã ban hành" && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
                <p className="font-bold">Expert đã từ chối</p>
                <p className="mt-1 leading-5">{currentScenario.reviewComment}</p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { id: "blueprint", label: "1. Blueprint doanh nghiệp" },
                { id: "personas", label: `2. Personas (${scenarioPersonas.length})` },
                { id: "knowledge", label: `3. Knowledge (${scenarioKnowledge.length})` },
                { id: "rules", label: `4. Business rules (${businessRules.length})` },
                { id: "events", label: `5. Events (${scenarioEvents.length})` },
                { id: "rubrics", label: "6. Rubrics" },
                { id: "templates", label: "7. Templates" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
                  className={classNames(
                    "rounded-xl px-3.5 py-2 text-xs font-bold",
                    activeSubTab === tab.id
                      ? "bg-[#2f638c] text-white"
                      : "border border-[#d9e4ec] bg-white text-slate"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeSubTab === "blueprint" && (
            <div className="space-y-4 p-6">
              <p className="text-xs text-slate">
                Nhập lộ trình theo từng sprint. Mẫu deliverable gắn ở tab Templates (tuỳ chọn, không bắt buộc đủ bộ).
              </p>
              {isCreatingNew && (
                <div className="grid gap-4 rounded-2xl border border-dashed border-[#2f638c]/40 bg-[#f4f8fb] p-4 lg:grid-cols-3">
                  <label className="block text-xs font-bold text-navy">
                    Mã kịch bản
                    <input
                      required
                      className={`${fieldClass} mt-1 font-normal`}
                      value={newScenForm.code}
                      onChange={(e) => setNewScenForm({ ...newScenForm, code: e.target.value })}
                      placeholder="VD: RET-PROMO-003"
                    />
                  </label>
                  <label className="block text-xs font-bold text-navy">
                    Ngành
                    <select
                      className={`${fieldClass} mt-1 font-normal`}
                      value={newScenForm.domain}
                      onChange={(e) =>
                        setNewScenForm({ ...newScenForm, domain: e.target.value as ScenarioVersion["domain"] })
                      }
                    >
                      <option value="Bán lẻ">Bán lẻ (LMS_PROMO)</option>
                      <option value="Chuỗi cung ứng">Chuỗi cung ứng (WMS_COLD)</option>
                      <option value="Tài chính">Tài chính (DIGITAL_LOS)</option>
                    </select>
                  </label>
                  <label className="block text-xs font-bold text-navy lg:col-span-1">
                    Tên kịch bản
                    <input
                      required
                      className={`${fieldClass} mt-1 font-normal`}
                      value={newScenForm.title}
                      onChange={(e) => setNewScenForm({ ...newScenForm, title: e.target.value })}
                      placeholder="Tên kịch bản mô phỏng"
                    />
                  </label>
                </div>
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block text-xs font-bold text-navy">
                  Tóm tắt
                  <input
                    disabled={readOnly}
                    className={`${fieldClass} mt-1 font-normal`}
                    value={blueprint.summary}
                    onChange={(e) => setBlueprint({ ...blueprint, summary: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-bold text-navy">
                  Độ khó
                  <select
                    disabled={readOnly}
                    className={`${fieldClass} mt-1 font-normal`}
                    value={blueprint.difficulty}
                    onChange={(e) => {
                      setBlueprint({
                        ...blueprint,
                        difficulty: Number(e.target.value),
                        isFreeAccess: isAdminAuthor,
                      });
                    }}
                  >
                    <option value={0}>Beginner</option>
                    <option value={1}>Intermediate</option>
                    <option value={2}>Advanced</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-bold text-navy">
                Bối cảnh doanh nghiệp (Business Context)
                <AutoResizeTextarea
                  disabled={readOnly}
                  rows={4}
                  className={`${fieldClass} mt-1 font-normal`}
                  value={blueprint.businessContext}
                  onChange={(e) => setBlueprint({ ...blueprint, businessContext: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Vấn đề nghiệp vụ (Business Problem)
                <AutoResizeTextarea
                  disabled={readOnly}
                  rows={6}
                  className={`${fieldClass} mt-1 font-normal`}
                  value={blueprint.businessProblem}
                  onChange={(e) => setBlueprint({ ...blueprint, businessProblem: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Mục tiêu kinh doanh (Business Objectives)
                <AutoResizeTextarea
                  disabled={readOnly}
                  rows={5}
                  className={`${fieldClass} mt-1 font-normal`}
                  value={blueprint.businessObjectives}
                  onChange={(e) => setBlueprint({ ...blueprint, businessObjectives: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Vai trò BA (BA Role)
                <AutoResizeTextarea
                  disabled={readOnly}
                  rows={2}
                  className={`${fieldClass} mt-1 font-normal`}
                  value={blueprint.baRole}
                  onChange={(e) => setBlueprint({ ...blueprint, baRole: e.target.value })}
                />
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-navy">Lộ trình sprint</h3>
                    <p className="text-[11px] text-slate">
                      Thời hạn = số ngày/tuần: Sprint 1 từ lúc bắt đầu mô phỏng; sprint sau từ khi sprint
                      trước kết thúc.
                    </p>
                  </div>
                  {!readOnly && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1.5 text-xs"
                      onClick={() =>
                        syncSprints([
                          ...sprints,
                          createSprintPlan(sprints.length + 1),
                        ])
                      }
                    >
                      <Plus size={14} /> Thêm sprint
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {sprints.map((sprint, idx) => (
                    <div
                      key={`sprint-${idx}-${sprint.sprintNo}`}
                      className="rounded-2xl border border-[#d9e4ec] bg-[#f8fafc] p-3 text-xs font-bold text-navy"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          Sprint {sprint.sprintNo}
                          {sprint.templateCodes.length > 0 && (
                            <span className="ml-2 font-mono text-[10px] font-semibold text-[#2f638c]">
                              · {sprint.templateCodes.length} mẫu
                            </span>
                          )}
                        </div>
                        {!readOnly && sprints.length > 1 && (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#a03d3d] hover:underline"
                            onClick={() =>
                              syncSprints(
                                renumberSprints(sprints.filter((_, i) => i !== idx))
                              )
                            }
                          >
                            <Trash2 size={12} /> Xóa
                          </button>
                        )}
                      </div>
                      {readOnly ? (
                        <p className="mt-2 text-[12px] font-semibold text-navy">
                          Thời hạn:{" "}
                          <span className="font-bold">
                            {formatSprintDuration(sprint.durationValue, sprint.durationUnit)}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-medium text-slate">
                            {sprint.sprintNo === 1
                              ? "Tính từ lúc learner bắt đầu mô phỏng."
                              : "Tính sau khi sprint trước kết thúc."}
                          </span>
                        </p>
                      ) : (
                        <>
                          <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                            <label className="block text-[11px] font-semibold text-slate">
                              Thời hạn
                              <input
                                type="number"
                                min={1}
                                max={365}
                                className={`${fieldClass} mt-1 font-normal`}
                                value={sprint.durationValue}
                                onChange={(e) =>
                                  syncSprints(
                                    sprints.map((s, i) =>
                                      i === idx
                                        ? {
                                            ...s,
                                            durationValue: Math.max(
                                              1,
                                              Number(e.target.value) || 1
                                            ),
                                          }
                                        : s
                                    )
                                  )
                                }
                              />
                            </label>
                            <label className="block text-[11px] font-semibold text-slate">
                              Đơn vị
                              <select
                                className={`${fieldClass} mt-1 font-normal`}
                                value={sprint.durationUnit}
                                onChange={(e) =>
                                  syncSprints(
                                    sprints.map((s, i) =>
                                      i === idx
                                        ? {
                                            ...s,
                                            durationUnit:
                                              e.target.value === "days" ? "days" : "weeks",
                                          }
                                        : s
                                    )
                                  )
                                }
                              >
                                <option value="days">Ngày</option>
                                <option value="weeks">Tuần</option>
                              </select>
                            </label>
                          </div>
                          <p className="mt-1 text-[10px] font-medium text-slate">
                            {sprint.sprintNo === 1
                              ? "Tính từ lúc learner bắt đầu mô phỏng."
                              : "Tính sau khi sprint trước kết thúc."}
                          </p>
                        </>
                      )}
                      <label className="mt-2 block text-[11px] font-semibold text-slate">
                        Nhiệm vụ sprint
                        <AutoResizeTextarea
                          disabled={readOnly}
                          rows={3}
                          className={`${fieldClass} mt-1 font-normal`}
                          value={sprint.focus}
                          placeholder={sprintPlaceholder(idx)}
                          onChange={(e) =>
                            syncSprints(
                              sprints.map((s, i) =>
                                i === idx ? { ...s, focus: e.target.value } : s
                              )
                            )
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="block text-xs font-bold text-navy">
                  In scope
                  <AutoResizeTextarea
                    disabled={readOnly}
                    rows={3}
                    className={`${fieldClass} mt-1 font-normal`}
                    value={blueprint.inScope}
                    onChange={(e) => setBlueprint({ ...blueprint, inScope: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-bold text-navy">
                  Out of scope
                  <AutoResizeTextarea
                    disabled={readOnly}
                    rows={3}
                    className={`${fieldClass} mt-1 font-normal`}
                    value={blueprint.outOfScope}
                    onChange={(e) => setBlueprint({ ...blueprint, outOfScope: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-bold text-navy">
                  Constraints
                  <AutoResizeTextarea
                    disabled={readOnly}
                    rows={3}
                    className={`${fieldClass} mt-1 font-normal`}
                    value={blueprint.knownConstraints}
                    onChange={(e) => setBlueprint({ ...blueprint, knownConstraints: e.target.value })}
                  />
                </label>
              </div>
            </div>
          )}

          {activeSubTab === "personas" && (
            <div className="space-y-4 p-6">
              {isCreatingNew && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Tạo kịch bản trước (tab Blueprint → Tạo kịch bản), rồi mới thêm persona.
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-navy">Personas stakeholder</h3>
                  <p className="text-xs text-slate">Mỗi persona active cần ≥ 1 knowledge khi gửi Expert duyệt.</p>
                </div>
                <Button
                  size="sm"
                  disabled={readOnly || isCreatingNew}
                  onClick={openCreatePersona}
                  className="gap-1.5 text-xs"
                >
                  <Plus size={14} /> Thêm persona
                </Button>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {scenarioPersonas.map((p) => (
                  <CollapsibleDetail
                    key={p.id}
                    title={p.name}
                    meta={
                      <>
                        <span className="font-semibold text-[#2f638c]">
                          {p.role} · {p.department || "—"}
                        </span>
                        <span className="ml-2 font-mono text-[10px]">{p.code || p.id}</span>
                      </>
                    }
                    actions={
                      !readOnly ? (
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-navy underline-offset-2 hover:underline"
                          onClick={() => openEditPersona(p)}
                        >
                          Sửa
                        </button>
                      ) : undefined
                    }
                    detail={
                      <dl className="space-y-2 text-[11px] leading-5 text-slate">
                        <div>
                          <dt className="font-bold text-navy/70">Mục tiêu</dt>
                          <dd>
                            <ReadableProse text={p.businessGoal || "—"} lineClassName="text-slate" />
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-navy/70">Trách nhiệm / quyền hạn</dt>
                          <dd>
                            <ReadableProse text={p.authority || "—"} lineClassName="text-slate" />
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-navy/70">Pain points / ranh giới</dt>
                          <dd>
                            <ReadableProse text={p.knowledgeBoundary || "—"} lineClassName="text-slate" />
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-navy/70">Thông tin ẩn / business concerns</dt>
                          <dd>
                            <ReadableProse text={p.hiddenInformation || "—"} lineClassName="text-slate" />
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-navy/70">Lập trường xung đột</dt>
                          <dd>
                            <ReadableProse text={p.conflictingStance || "—"} lineClassName="text-slate" />
                          </dd>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <dt className="font-bold text-navy/70">Communication</dt>
                            <dd>{p.communicationStyle || "—"}</dd>
                          </div>
                          <div>
                            <dt className="font-bold text-navy/70">Personality</dt>
                            <dd>{p.personality || "—"}</dd>
                          </div>
                        </div>
                      </dl>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "knowledge" && (
            <div className="space-y-4 p-6">
              {isCreatingNew && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Tạo kịch bản trước rồi mới thêm knowledge.
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-navy">Knowledge items</h3>
                  <p className="text-xs text-slate">Gắn access tới persona bằng mã code.</p>
                </div>
                <Button
                  size="sm"
                  disabled={readOnly || isCreatingNew}
                  onClick={openCreateKnowledge}
                  className="gap-1.5 text-xs"
                >
                  <Plus size={14} /> Thêm knowledge
                </Button>
              </div>
              <div className="space-y-3">
                {scenarioKnowledge.map((k) => (
                  <CollapsibleDetail
                    key={k.id}
                    title={k.title}
                    meta={
                      <>
                        <span className="font-mono text-[10px] font-bold text-[#2f638c]">{k.code}</span>
                        <span className="mx-1.5 text-slate/40">·</span>
                        {k.category} · {k.confidentiality} · personas:{" "}
                        {k.knownByStakeholders.join(", ") || "—"}
                      </>
                    }
                    actions={
                      !readOnly ? (
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-navy underline-offset-2 hover:underline"
                          onClick={() => openEditKnowledge(k)}
                        >
                          Sửa
                        </button>
                      ) : undefined
                    }
                    detailText={k.content}
                  />
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "rules" && (
            <div className="space-y-4 p-6">
              {isCreatingNew && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Có thể soạn rule trước; rule sẽ lưu cùng lần tạo / lần Lưu sau.
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-navy">Business rules ẩn</h3>
                  <p className="text-xs text-slate">
                    Rule quan trọng học viên phải suy ra qua phỏng vấn — lưu qua PUT definition.
                  </p>
                </div>
                <Button
                  size="sm"
                  disabled={readOnly}
                  onClick={openCreateRule}
                  className="gap-1.5 text-xs"
                >
                  <Plus size={14} /> Thêm rule
                </Button>
              </div>
              <div className="space-y-3">
                {businessRules.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[#d9e4ec] bg-[#f8fafc] px-3 py-4 text-xs text-slate">
                    Chưa có business rule. Thêm ít nhất 1–2 rule ẩn để tăng độ khó kịch bản.
                  </p>
                ) : (
                  businessRules.map((rule, idx) => (
                    <CollapsibleDetail
                      key={`${rule.code}-${idx}`}
                      title={rule.title}
                      meta={
                        <span className="inline-flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-[#2f638c]">{rule.code}</span>
                          <Badge tone={rule.isHidden ? "amber" : "navy"}>
                            {rule.isHidden ? "Ẩn" : "Công khai"}
                          </Badge>
                          <span className="text-[10px] text-slate">Importance {rule.importance}</span>
                        </span>
                      }
                      actions={
                        !readOnly ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-navy underline-offset-2 hover:underline"
                              onClick={() => openEditRule(idx)}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-[#a03d3d] hover:underline"
                              onClick={() => setBusinessRules((prev) => prev.filter((_, i) => i !== idx))}
                            >
                              Xóa
                            </button>
                          </div>
                        ) : undefined
                      }
                      detailText={rule.description}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeSubTab === "events" && (
            <div className="space-y-4 p-6">
              {isCreatingNew && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Tạo kịch bản trước rồi mới thêm event.
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-navy">Biến cố mô phỏng</h3>
                <Button
                  size="sm"
                  disabled={readOnly || isCreatingNew}
                  onClick={openCreateEvent}
                  className="gap-1.5 text-xs"
                >
                  <Plus size={14} /> Thêm event
                </Button>
              </div>
              <div className="space-y-3">
                {scenarioEvents.map((ev) => (
                  <CollapsibleDetail
                    key={ev.id}
                    title={ev.title}
                    meta={
                      <>
                        Thời điểm:{" "}
                        <span className="text-navy/80">{formatEventTimingLabel(ev)}</span>
                      </>
                    }
                    actions={
                      !readOnly ? (
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-navy underline-offset-2 hover:underline"
                          onClick={() => openEditEvent(ev)}
                        >
                          Sửa
                        </button>
                      ) : undefined
                    }
                    detail={
                      <div className="space-y-3">
                        {ev.description ? (
                          <div>
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate">
                              Mô tả
                            </p>
                            <ReadableProse text={ev.description} lineClassName="text-slate" />
                          </div>
                        ) : null}
                        {ev.injectedFact ? (
                          <div className="rounded-xl border border-navy/10 bg-offwhite/70 px-3 py-2.5">
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate">
                              Nội dung / Fact
                            </p>
                            <ReadableProse text={ev.injectedFact} lineClassName="text-navy" />
                          </div>
                        ) : null}
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {activeSubTab === "rubrics" && (
            <div className="p-6">
              <AuthoringRubricsManager scenarioVersionId={activeDbId || undefined} />
            </div>
          )}
          {activeSubTab === "templates" && (
            <div className="p-6">
              <AuthoringTemplatesManager
                sprints={sprints}
                onChangeSprints={syncSprints}
                readOnly={readOnly}
              />
            </div>
          )}
        </Card>
      )}

      {showPersonaModal &&
        createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#d9e4ec] bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy">
                {editingPersonaId ? "Sửa persona" : "Thêm persona"}
              </h3>
              <button type="button" onClick={closePersonaModal}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSavePersona} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-navy">
                  Tên
                  <input
                    required
                    placeholder="VD: Nguyễn Thị Mai"
                    className={`${fieldClass} mt-1 font-normal`}
                    value={personaForm.name}
                    onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-bold text-navy">
                  Chức vụ / role
                  <input
                    required
                    placeholder="VD: Store Manager"
                    className={`${fieldClass} mt-1 font-normal`}
                    value={personaForm.role}
                    onChange={(e) => setPersonaForm({ ...personaForm, role: e.target.value })}
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-navy">
                Phòng ban
                <input
                  placeholder="VD: Vận hành"
                  className={`${fieldClass} mt-1 font-normal`}
                  value={personaForm.department}
                  onChange={(e) => setPersonaForm({ ...personaForm, department: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Mục tiêu (Goals)
                <AutoResizeTextarea
                  rows={2}
                  placeholder="VD: Hết tuần không thiếu hàng, không lãng phí"
                  className={`${fieldClass} mt-1 font-normal`}
                  value={personaForm.businessGoal}
                  onChange={(e) => setPersonaForm({ ...personaForm, businessGoal: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Trách nhiệm / quyền hạn (Responsibilities)
                <AutoResizeTextarea
                  rows={2}
                  placeholder="Phạm vi quyết định, quyền duyệt, báo cáo cho ai…"
                  className={`${fieldClass} mt-1 font-normal`}
                  value={personaForm.authority}
                  onChange={(e) => setPersonaForm({ ...personaForm, authority: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Pain points / ranh giới kiến thức
                <AutoResizeTextarea
                  rows={2}
                  placeholder="Khó khăn, giới hạn hiểu biết, điều không muốn bàn…"
                  className={`${fieldClass} mt-1 font-normal`}
                  value={personaForm.knowledgeBoundary}
                  onChange={(e) => setPersonaForm({ ...personaForm, knowledgeBoundary: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Thông tin ẩn / business concerns
                <AutoResizeTextarea
                  rows={2}
                  placeholder="Chỉ tiết lộ khi learner hỏi đúng trọng tâm…"
                  className={`${fieldClass} mt-1 font-normal`}
                  value={personaForm.hiddenInformation}
                  onChange={(e) => setPersonaForm({ ...personaForm, hiddenInformation: e.target.value })}
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Lập trường xung đột / bias
                <AutoResizeTextarea
                  rows={2}
                  placeholder="Ưu tiên KPI bộ phận, xung đột với stakeholder khác…"
                  className={`${fieldClass} mt-1 font-normal`}
                  value={personaForm.conflictingStance}
                  onChange={(e) => setPersonaForm({ ...personaForm, conflictingStance: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-navy">
                  Communication style
                  <input
                    placeholder="VD: Thẳng, ngắn, thích số liệu"
                    className={`${fieldClass} mt-1 font-normal`}
                    value={personaForm.communicationStyle}
                    onChange={(e) => setPersonaForm({ ...personaForm, communicationStyle: e.target.value })}
                  />
                </label>
                <label className="block text-xs font-bold text-navy">
                  Personality
                  <input
                    placeholder="VD: Thực dụng, dễ mất kiên nhẫn"
                    className={`${fieldClass} mt-1 font-normal`}
                    value={personaForm.personality}
                    onChange={(e) => setPersonaForm({ ...personaForm, personality: e.target.value })}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={closePersonaModal}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  {editingPersonaId ? "Cập nhật persona" : "Thêm persona"}
                </Button>
              </div>
              <p className="text-[11px] text-slate">Xong nhớ bấm “Lưu định nghĩa” để ghi lên API.</p>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showNewKnowledgeModal &&
        createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#d9e4ec] bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy">{editingKnowledgeId ? "Sửa knowledge" : "Thêm knowledge"}</h3>
              <button onClick={() => setShowNewKnowledgeModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateKnowledge} className="space-y-3">
              <input
                placeholder="Code (VD: K-OPS-01)"
                className={fieldClass}
                value={newKnoForm.code}
                onChange={(e) => setNewKnoForm({ ...newKnoForm, code: e.target.value })}
              />
              <input
                required
                placeholder="Title"
                className={fieldClass}
                value={newKnoForm.title}
                onChange={(e) => setNewKnoForm({ ...newKnoForm, title: e.target.value })}
              />
              <AutoResizeTextarea
                required
                rows={3}
                placeholder="Content"
                className={fieldClass}
                value={newKnoForm.content}
                onChange={(e) => setNewKnoForm({ ...newKnoForm, content: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={fieldClass}
                  value={newKnoForm.category}
                  onChange={(e) =>
                    setNewKnoForm({
                      ...newKnoForm,
                      category: e.target.value as AgentKnowledgeItem["category"],
                    })
                  }
                >
                  <option value="Quy tắc nghiệp vụ">Quy tắc nghiệp vụ</option>
                  <option value="Thực tế quy trình">Thực tế quy trình</option>
                  <option value="Ràng buộc dữ liệu">Ràng buộc dữ liệu</option>
                  <option value="Kiến trúc hệ thống">Kiến trúc hệ thống</option>
                </select>
                <select
                  className={fieldClass}
                  value={newKnoForm.confidentiality}
                  onChange={(e) =>
                    setNewKnoForm({
                      ...newKnoForm,
                      confidentiality: e.target.value as AgentKnowledgeItem["confidentiality"],
                    })
                  }
                >
                  <option value="Nội bộ">Nội bộ</option>
                  <option value="Tuyệt mật">Tuyệt mật</option>
                  <option value="Công khai">Công khai</option>
                </select>
              </div>
              <div className="rounded-xl border border-[#d9e4ec] p-3">
                <p className="mb-2 text-xs font-bold text-navy">Persona được biết knowledge này</p>
                <div className="space-y-1.5">
                  {scenarioPersonas.map((p) => {
                    const code = p.code || p.id;
                    const checked = newKnoForm.personaCodes.includes(code);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-navy">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setNewKnoForm({
                              ...newKnoForm,
                              personaCodes: e.target.checked
                                ? [...newKnoForm.personaCodes, code]
                                : newKnoForm.personaCodes.filter((c) => c !== code),
                            });
                          }}
                        />
                        {p.name} ({code})
                      </label>
                    );
                  })}
                  {scenarioPersonas.length === 0 && (
                    <p className="text-[11px] text-slate">Hãy thêm persona trước.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewKnowledgeModal(false)}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  {editingKnowledgeId ? "Cập nhật knowledge" : "Thêm knowledge"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showNewRuleModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-[#d9e4ec] bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy">{editingRuleIndex != null ? "Sửa business rule" : "Thêm business rule"}</h3>
                <button onClick={() => setShowNewRuleModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateRule} className="space-y-3">
                <input
                  placeholder="Mã (VD: BR-RETURN-01)"
                  className={fieldClass}
                  value={newRuleForm.code}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, code: e.target.value })}
                />
                <input
                  required
                  placeholder="Tiêu đề rule"
                  className={fieldClass}
                  value={newRuleForm.title}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, title: e.target.value })}
                />
                <AutoResizeTextarea
                  required
                  rows={3}
                  placeholder="Mô tả rule (học viên phải phát hiện qua phỏng vấn)"
                  className={fieldClass}
                  value={newRuleForm.description}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-navy">
                    <input
                      type="checkbox"
                      checked={newRuleForm.isHidden}
                      onChange={(e) => setNewRuleForm({ ...newRuleForm, isHidden: e.target.checked })}
                    />
                    Ẩn với học viên
                  </label>
                  <label className="block text-xs font-bold text-navy">
                    Importance
                    <select
                      className={`${fieldClass} mt-1 font-normal`}
                      value={newRuleForm.importance}
                      onChange={(e) =>
                        setNewRuleForm({ ...newRuleForm, importance: Number(e.target.value) })
                      }
                    >
                      <option value={1}>1 · Thấp</option>
                      <option value={2}>2 · Trung bình</option>
                      <option value={3}>3 · Cao</option>
                    </select>
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewRuleModal(false)}>
                    Hủy
                  </Button>
                  <Button size="sm" type="submit">
                    {editingRuleIndex != null ? "Cập nhật rule" : "Thêm rule"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {showNewEventModal &&
        createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#d9e4ec] bg-white p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy">{editingEventId ? "Sửa event" : "Thêm event"}</h3>
              <button onClick={() => setShowNewEventModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <input
                required
                placeholder="Title"
                className={fieldClass}
                value={newEventForm.title}
                onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
              />
              <label className="block text-[11px] font-semibold text-slate">
                Thời điểm xuất hiện — sau khi kết thúc Sprint
                <select
                  className={`${fieldClass} mt-1`}
                  value={newEventForm.afterSprintNo}
                  onChange={(e) =>
                    setNewEventForm({
                      ...newEventForm,
                      triggerType: "after_sprint_ends",
                      afterSprintNo: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                >
                  {(sprints.length > 0 ? sprints : [{ sprintNo: 1 }]).map((s) => (
                    <option key={s.sprintNo} value={s.sprintNo}>
                      Sprint {s.sprintNo}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[10px] font-medium text-slate">
                  Event tự xuất hiện khi learner hoàn tất (finalize) sprint này — không kích hoạt thủ
                  công.
                </span>
              </label>
              <AutoResizeTextarea
                rows={2}
                placeholder="Description"
                className={fieldClass}
                value={newEventForm.description}
                onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
              />
              <AutoResizeTextarea
                rows={2}
                placeholder="Event content / injected fact"
                className={fieldClass}
                value={newEventForm.injectedFact}
                onChange={(e) => setNewEventForm({ ...newEventForm, injectedFact: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowNewEventModal(false)}>
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  {editingEventId ? "Cập nhật event" : "Thêm event"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {!currentScenario && (
        <Card className="border-[#d9e4ec] p-8 text-center">
          <Layers3 className="mx-auto text-slate" />
          <p className="mt-2 text-sm font-bold text-navy">Chưa có kịch bản nào</p>
          <p className="mt-1 text-xs text-slate">Chọn tab “Tạo kịch bản mới” ở trên để bắt đầu soạn.</p>
        </Card>
      )}
    </div>
  );
}
