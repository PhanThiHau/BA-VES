import { useEffect, useState } from "react";
import { normalizeMultilineText } from "../../../components/common/ReadableProse";
import { scenarioAuthoringService } from "../../../services/scenarioAuthoringService";
import { AuthoringTab } from "../../instructor/components/AuthoringTab";
import {
  initialKnowledgeItems,
  initialPersonas,
  initialScenarioEvents,
  initialScenarios,
  type AgentKnowledgeItem,
  type ScenarioEventConfig,
  type ScenarioVersion,
  type StakeholderPersona,
} from "../../instructor/instructorData";

function authoringStatus(reviewState: string | undefined, hasPublished: boolean): ScenarioVersion["status"] {
  if (reviewState === "PendingReview") return "Chờ duyệt";
  if (reviewState === "Rejected") return "Từ chối";
  if (reviewState === "Published") return "Đã ban hành";
  if (reviewState === "Archived") return "Lưu trữ";
  if (reviewState === "Draft") return "Bản nháp";
  return hasPublished ? "Đã ban hành" : "Bản nháp";
}

function domainFromCode(code: string): ScenarioVersion["domain"] {
  const codeUpper = code.toUpperCase();
  if (codeUpper.startsWith("FIN")) return "Tài chính";
  if (codeUpper.startsWith("RET") || codeUpper.startsWith("OMNI")) return "Bán lẻ";
  return "Chuỗi cung ứng";
}

/**
 * Admin soạn kịch bản toàn hệ thống (reuse AuthoringTab của Instructor).
 * Sau Expert duyệt → publish vào Scenario Library (backend gắn IsFreeAccess).
 */
export function AdminAuthoringTab() {
  const [scenarios, setScenarios] = useState<ScenarioVersion[]>(initialScenarios);
  const [personas, setPersonas] = useState<StakeholderPersona[]>(initialPersonas);
  const [knowledgeItems, setKnowledgeItems] = useState<AgentKnowledgeItem[]>(initialKnowledgeItems);
  const [events, setEvents] = useState<ScenarioEventConfig[]>(initialScenarioEvents);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMine() {
      setLoadError(null);
      try {
        const mine = await scenarioAuthoringService.listMyVersions();
        if (cancelled) return;

        const loadedPersonas: StakeholderPersona[] = [];
        const loadedKnowledge: AgentKnowledgeItem[] = [];
        const loadedEvents: ScenarioEventConfig[] = [];

        const defResults = await Promise.allSettled(
          mine.map((item) => scenarioAuthoringService.getDefinition(item.versionId))
        );

        const mappedScenarios: ScenarioVersion[] = mine.map((item, idx) => {
          const defRes = defResults[idx];
          const def = defRes?.status === "fulfilled" ? defRes.value : null;
          const status = authoringStatus(item.status, item.status === "Published");

          if (def?.personas) {
            for (const [index, ag] of def.personas.entries()) {
              const concernsRaw = ag.businessConcerns || "";
              const stanceMarker = "Lập trường xung đột:";
              const stanceIdx = concernsRaw.indexOf(stanceMarker);
              const hiddenInformation =
                stanceIdx >= 0 ? concernsRaw.slice(0, stanceIdx).trim() : concernsRaw;
              const conflictingStance =
                stanceIdx >= 0
                  ? concernsRaw.slice(stanceIdx + stanceMarker.length).trim()
                  : "";
              loadedPersonas.push({
                id: `AG-${ag.id}`,
                code: `P${String(index + 1).padStart(2, "0")}`,
                scenarioId: item.code,
                name: ag.name,
                role: ag.stakeholderRole,
                department: ag.department || "",
                businessGoal: ag.goals || "",
                authority: ag.responsibilities || "",
                knowledgeBoundary: ag.painPoints || "",
                hiddenInformation,
                conflictingStance,
                communicationStyle: ag.communicationStyle || "",
                personality: ag.personality || "",
                status: "Đã kiểm thử đạt",
              });
            }
          }

          if (def?.knowledgeItems) {
            for (const ks of def.knowledgeItems) {
              loadedKnowledge.push({
                id: `KS-${ks.id}`,
                scenarioId: item.code,
                title: ks.title,
                category: "Quy tắc nghiệp vụ",
                content: normalizeMultilineText(ks.content),
                confidentiality: ks.accessList?.some((a) => a.isHidden) ? "Nội bộ" : "Công khai",
                knownByStakeholders: ks.accessList?.map((a) => a.personaName) || [],
              });
            }
          }

          if (def?.events) {
            for (const ev of def.events) {
              const afterMatch = (ev.triggerConditionJson || "").match(
                /"afterSprintNo"\s*:\s*(\d+)/
              );
              const afterSprintNo = afterMatch ? Number(afterMatch[1]) : undefined;
              const isAfterSprint =
                ev.triggerType === 4 ||
                String(ev.triggerType) === "AfterSprintEnds" ||
                afterSprintNo != null;
              loadedEvents.push({
                id: `EV-${ev.id}`,
                scenarioId: item.code,
                title: ev.title,
                triggerType: isAfterSprint
                  ? "after_sprint_ends"
                  : ev.triggerType === 1
                    ? "message_count"
                    : ev.triggerType === 2
                      ? "time_elapsed"
                      : "manual_instructor",
                afterSprintNo,
                triggerCondition: isAfterSprint
                  ? `Sau khi kết thúc Sprint ${afterSprintNo || 1}`
                  : "Instructor/Admin kích hoạt thủ công",
                description: normalizeMultilineText(ev.description),
                impactedRequirements: [],
                injectedFact: normalizeMultilineText(ev.eventContent),
              });
            }
          }

          return {
            id: `SCV-${item.versionId}`,
            versionNumber: `v${item.versionNo}.0`,
            scenarioId: item.code,
            scenarioTitle: item.title,
            domain: domainFromCode(item.code),
            status,
            reviewComment: item.reviewComment || def?.reviewComment || undefined,
            baselineProblem: def?.businessContext || item.businessContext || "",
            groundTruth: def?.businessProblem || item.businessProblem || "",
            stakeholdersCount: def?.personas?.length ?? item.personaCount,
            eventsCount: def?.events?.length ?? item.eventCount,
            evidenceCount: def?.knowledgeItems?.length ?? item.knowledgeItemCount,
            rubricCriteriaCount: 5,
            updatedAt: item.submittedForReviewAt
              ? new Date(item.submittedForReviewAt).toLocaleDateString("vi-VN")
              : "Mới cập nhật",
          };
        });

        setScenarios(mappedScenarios);
        setPersonas(loadedPersonas);
        setKnowledgeItems(loadedKnowledge);
        setEvents(loadedEvents);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Không tải được kịch bản Admin.";
        setLoadError(message);
      }
    }

    void loadMine();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddScenario = (newSc: ScenarioVersion) => {
    setScenarios((prev) => [newSc, ...prev]);
  };

  const handleUpdateScenario = (scenarioId: string, patch: Partial<ScenarioVersion>) => {
    setScenarios((prev) => prev.map((s) => (s.scenarioId === scenarioId ? { ...s, ...patch } : s)));
  };

  const handleReplaceScenarioAssets = (
    scenarioId: string,
    next: {
      personas: StakeholderPersona[];
      knowledgeItems: AgentKnowledgeItem[];
      events: ScenarioEventConfig[];
    }
  ) => {
    setPersonas((prev) => [...prev.filter((p) => p.scenarioId !== scenarioId), ...next.personas]);
    setKnowledgeItems((prev) => [
      ...prev.filter((k) => k.scenarioId !== scenarioId),
      ...next.knowledgeItems,
    ]);
    setEvents((prev) => [...prev.filter((e) => e.scenarioId !== scenarioId), ...next.events]);
    setScenarios((prev) =>
      prev.map((s) =>
        s.scenarioId === scenarioId
          ? {
              ...s,
              stakeholdersCount: next.personas.length,
              evidenceCount: next.knowledgeItems.length,
              eventsCount: next.events.length,
            }
          : s
      )
    );
  };

  const handleSubmitForReview = (scenarioId: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.scenarioId === scenarioId ? { ...s, status: "Chờ duyệt" } : s))
    );
  };

  const handleRemoveScenario = (scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.scenarioId !== scenarioId));
    setPersonas((prev) => prev.filter((p) => p.scenarioId !== scenarioId));
    setKnowledgeItems((prev) => prev.filter((k) => k.scenarioId !== scenarioId));
    setEvents((prev) => prev.filter((e) => e.scenarioId !== scenarioId));
  };

  const handleAddPersona = (newP: StakeholderPersona) => {
    setPersonas((prev) => [...prev, newP]);
    setScenarios((prev) =>
      prev.map((s) =>
        s.scenarioId === newP.scenarioId
          ? { ...s, stakeholdersCount: s.stakeholdersCount + 1 }
          : s
      )
    );
  };

  const handleUpdatePersona = (updated: StakeholderPersona) => {
    setPersonas((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleAddKnowledge = (newK: AgentKnowledgeItem) => {
    setKnowledgeItems((prev) => [...prev, newK]);
  };

  const handleUpdateKnowledge = (updated: AgentKnowledgeItem) => {
    setKnowledgeItems((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
  };

  const handleAddEvent = (newEv: ScenarioEventConfig) => {
    setEvents((prev) => [...prev, newEv]);
    setScenarios((prev) =>
      prev.map((s) =>
        s.scenarioId === newEv.scenarioId ? { ...s, eventsCount: s.eventsCount + 1 } : s
      )
    );
  };

  const handleUpdateEvent = (updated: ScenarioEventConfig) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          {loadError}
        </div>
      )}
      <AuthoringTab
        scenarios={scenarios}
        personas={personas}
        knowledgeItems={knowledgeItems}
        events={events}
        onAddScenario={handleAddScenario}
        onAddPersona={handleAddPersona}
        onUpdatePersona={handleUpdatePersona}
        onAddKnowledge={handleAddKnowledge}
        onUpdateKnowledge={handleUpdateKnowledge}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        onUpdateScenario={handleUpdateScenario}
        onRemoveScenario={handleRemoveScenario}
        onReplaceScenarioAssets={handleReplaceScenarioAssets}
        onSubmitForReview={handleSubmitForReview}
      />
    </div>
  );
}
