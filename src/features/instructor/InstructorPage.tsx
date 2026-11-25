import { useState, useEffect, type ReactNode } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../contexts/AppContext";
import { cohortService } from "../../services/cohortService";
import { assignmentService } from "../../services/assignmentService";
import { assessmentService } from "../../services/assessmentService";
import { normalizeMultilineText } from "../../components/common/ReadableProse";
import { scenarioAuthoringService } from "../../services/scenarioAuthoringService";
import { catalogService } from "../../services/catalogService";
import {
  initialScenarios,
  initialPersonas,
  initialKnowledgeItems,
  initialScenarioEvents,
  initialReviewItems,
  initialCohorts,
  initialAssignments,
  type ScenarioVersion,
  type StakeholderPersona,
  type AgentKnowledgeItem,
  type ScenarioEventConfig,
  type ReviewItem,
  type CohortItem,
  type AssignmentItem,
  type CriterionReview,
} from "./instructorData";

import { OverviewTab } from "./components/OverviewTab";
import { AuthoringTab } from "./components/AuthoringTab";
import { ReviewModerationTab } from "./components/ReviewModerationTab";
import { CohortAssignmentTab } from "./components/CohortAssignmentTab";
import { CompetencyAnalyticsTab } from "./components/CompetencyAnalyticsTab";

type TabId = "overview" | "authoring" | "review" | "cohorts" | "analytics";
const VALID_TABS: TabId[] = ["overview", "authoring", "review", "cohorts", "analytics"];

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

export function InstructorPage() {
  const { instructorTab, setInstructorTab, user } = useApp();
  const activeTab = VALID_TABS.includes(instructorTab as TabId)
    ? (instructorTab as TabId)
    : "overview";
  const setActiveTab = (tab: TabId) => setInstructorTab(tab);

  // Quản lý trạng thái dữ liệu tương tác
  const [scenarios, setScenarios] = useState<ScenarioVersion[]>(initialScenarios);
  const [personas, setPersonas] = useState<StakeholderPersona[]>(initialPersonas);
  const [knowledgeItems, setKnowledgeItems] = useState<AgentKnowledgeItem[]>(initialKnowledgeItems);
  const [events, setEvents] = useState<ScenarioEventConfig[]>(initialScenarioEvents);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialReviewItems);
  const [cohorts, setCohorts] = useState<CohortItem[]>(initialCohorts);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments);

  useEffect(() => {
    async function loadInstructorData() {
      try {
        const [cohortsRes, assignmentsRes, mineVersionsRes, libraryRes, queueRes, mineRes] =
          await Promise.allSettled([
            cohortService.getCohorts(),
            assignmentService.getAssignments(),
            scenarioAuthoringService.listMyVersions(),
            catalogService.getScenarios(undefined, true),
            assessmentService.getReviewRequests("queue"),
            assessmentService.getReviewRequests("mine"),
          ]);

        if (cohortsRes.status === "fulfilled" && cohortsRes.value) {
          const mappedCohorts: CohortItem[] = cohortsRes.value.map((c) => ({
            id: `COH-${c.id}`,
            code: c.code,
            name: c.name,
            instructorName: user?.fullName || "Giảng viên phụ trách",
            studentsCount: c.activeMemberCount,
            pendingRequestCount: c.pendingRequestCount || 0,
            activeAssignmentsCount: c.assignmentCount,
            completionRate: 0,
            averageScore: 0,
            domain: "Đa lĩnh vực",
            status: c.status === "Active" || c.status === 1 ? ("active" as const) : ("archived" as const),
          }));
          setCohorts(mappedCohorts);
        }

        if (assignmentsRes.status === "fulfilled" && assignmentsRes.value) {
          const mappedAssignments: AssignmentItem[] = assignmentsRes.value.map((a) => ({
            id: `ASN-${a.id}`,
            title: a.title,
            cohortId: `COH-${a.cohortId ?? 1}`,
            cohortName: a.cohortName || "Chung",
            scenarioVersionId: `SCV-${a.scenarioVersionId}`,
            scenarioTitle: a.cohortName ? `${a.title} · ${a.cohortName}` : a.title,
            deadline: a.dueAt ? new Date(a.dueAt).toLocaleDateString("vi-VN") : "Chưa đặt hạn",
            attemptLimit: a.maxAttempts ?? 3,
            submissionsCount: 0,
            totalStudents: 0,
            status: a.status === "Active" || a.status === 1 ? ("active" as const) : ("closed" as const),
          }));
          setAssignments(mappedAssignments);
        }

        // Của tôi (mọi trạng thái) + Thư viện hệ thống (published IsFreeAccess).
        const mine =
          mineVersionsRes.status === "fulfilled" && mineVersionsRes.value
            ? mineVersionsRes.value
            : [];
        if (mineVersionsRes.status === "rejected") {
          console.warn("Could not load authored scenario versions:", mineVersionsRes.reason);
        }

        const loadedPersonas: StakeholderPersona[] = [];
        const loadedKnowledge: AgentKnowledgeItem[] = [];
        const loadedEvents: ScenarioEventConfig[] = [];

        const defResults = await Promise.allSettled(
          mine.map((item) => scenarioAuthoringService.getDefinition(item.versionId))
        );

        const myScenarios: ScenarioVersion[] = mine.map((item, idx) => {
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
                  : "Theo cấu hình thời điểm",
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
            isSystemLibrary: false,
            isFreeAccess: Boolean(def?.isFreeAccess),
            stakeholdersCount: def?.personas?.length ?? item.personaCount,
            eventsCount: def?.events?.length ?? item.eventCount,
            evidenceCount: def?.knowledgeItems?.length ?? item.knowledgeItemCount,
            rubricCriteriaCount: 5,
            updatedAt: item.submittedForReviewAt
              ? new Date(item.submittedForReviewAt).toLocaleDateString("vi-VN")
              : "Mới cập nhật",
          };
        });

        const mineCodes = new Set(myScenarios.map((s) => s.scenarioId.toUpperCase()));
        const libraryRaw =
          libraryRes.status === "fulfilled" && libraryRes.value ? libraryRes.value : [];
        const libraryScenarios: ScenarioVersion[] = libraryRaw
          .filter(
            (s) =>
              s.isFreeAccess &&
              s.hasPublishedVersion &&
              s.publishedVersionId &&
              !mineCodes.has(s.code.toUpperCase())
          )
          .map((s) => ({
            id: `SCV-${s.publishedVersionId}`,
            versionNumber: "v1.0",
            scenarioId: s.code,
            scenarioTitle: s.title,
            domain: domainFromCode(s.code),
            status: "Đã ban hành" as const,
            baselineProblem: s.description || "",
            groundTruth: "",
            isSystemLibrary: true,
            isFreeAccess: true,
            stakeholdersCount: 0,
            eventsCount: 0,
            evidenceCount: 0,
            rubricCriteriaCount: 5,
            updatedAt: "Thư viện hệ thống",
          }));

        setScenarios([...myScenarios, ...libraryScenarios]);
        setPersonas(loadedPersonas);
        setKnowledgeItems(loadedKnowledge);
        setEvents(loadedEvents);

        {
          const queueList = queueRes.status === "fulfilled" ? queueRes.value || [] : [];
          const mineList = mineRes.status === "fulfilled" ? mineRes.value || [] : [];
          const byId = new Map<number, (typeof queueList)[number]>();
          for (const r of [...queueList, ...mineList]) byId.set(r.id, r);

          const mappedReviews: ReviewItem[] = Array.from(byId.values()).map((r) => {
            const statusRaw = String(r.status || "");
            let status: ReviewItem["status"] = "pending";
            if (statusRaw === "Completed") status = "calibrated";
            else if (statusRaw === "RevisionRequested") status = "revision_requested";
            else if (statusRaw === "Accepted") status = "pending";

            return {
              id: `REV-${r.id}`,
              learner: `Học viên #${r.learnerId}`,
              cohort: `Bài nộp #${r.submissionId}`,
              scenarioId: `SUB-${r.submissionId}`,
              scenarioTitle: `Bài nộp #${r.submissionId}`,
              stage: "Deliverables & Assessment",
              aiScore: 0,
              aiConfidence: 0,
              humanScore: null,
              status,
              issueSummary: r.requestNote || "Yêu cầu giảng viên chấm điểm và hiệu chỉnh",
              submittedAt: r.requestedAt ? new Date(r.requestedAt).toLocaleString("vi-VN") : "Mới nộp",
              due: statusRaw === "Accepted" ? "Đang chấm" : statusRaw === "Completed" ? "Đã chốt" : "Chờ nhận",
              tone: (status === "calibrated" ? ("green" as const) : status === "revision_requested" ? ("red" as const) : ("amber" as const)),
              deliverablesSubmitted: ["Hồ sơ BA"],
              moderatorNotes: "",
              criteria: [],
            };
          });
          if (mappedReviews.length > 0) {
            setReviewItems(mappedReviews);
          }
        }
      } catch (err) {
        console.warn("Could not load instructor data from APIs:", err);
      }
    }
    loadInstructorData();
  }, [user?.fullName]);

  // Xử lý thêm kịch bản mới
  const handleAddScenario = (newSc: ScenarioVersion) => {
    setScenarios((prev) => [newSc, ...prev]);
  };

  const handleUpdateScenario = (scenarioId: string, patch: Partial<ScenarioVersion>) => {
    setScenarios((prev) => prev.map((s) => (s.scenarioId === scenarioId ? { ...s, ...patch } : s)));
  };

  const handleRemoveScenario = (scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.scenarioId !== scenarioId));
    setPersonas((prev) => prev.filter((p) => p.scenarioId !== scenarioId));
    setKnowledgeItems((prev) => prev.filter((k) => k.scenarioId !== scenarioId));
    setEvents((prev) => prev.filter((e) => e.scenarioId !== scenarioId));
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

  // Xử lý thêm nhân vật AI mới
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

  // Xử lý hiệu chỉnh và chốt điểm cho bài nộp
  const handleCalibrateScore = (
    itemId: string,
    humanScore: number,
    notes: string,
    updatedCriteria: CriterionReview[]
  ) => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            humanScore,
            status: "calibrated" as const,
            moderatorNotes: notes,
            criteria: updatedCriteria,
          };
        }
        return item;
      })
    );
  };

  // Xử lý yêu cầu học viên làm lại
  const handleRequestRevision = (itemId: string, reason: string) => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: "revision_requested" as const,
            moderatorNotes: `Yêu cầu làm lại: ${reason}`,
          };
        }
        return item;
      })
    );
  };

  const handleAddAssignment = (newAssignment: AssignmentItem) => {
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const handleAddCohort = (newCohort: CohortItem) => {
    setCohorts((prev) => [...prev, newCohort]);
  };

  const tabHeaders: Record<
    TabId,
    { title: string; description?: string; actions?: ReactNode }
  > = {
    overview: {
      title: "Tổng quan",
      description: "Điều hành lớp, kịch bản mô phỏng và hàng đợi chấm.",
      actions: (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setActiveTab("authoring")}
            className="gap-1.5 border-navy/20 bg-white text-xs font-semibold text-navy"
          >
            <Plus size={15} /> Kịch bản mô phỏng
          </Button>
          <Button onClick={() => setActiveTab("cohorts")} className="gap-1.5 text-xs font-semibold text-white">
            <Users size={15} /> Giao bài
          </Button>
        </div>
      ),
    },
    authoring: {
      title: "Kịch bản mô phỏng",
      description: "Danh sách kịch bản và tạo kịch bản mới.",
      actions: (
        <Button onClick={() => setActiveTab("cohorts")} className="gap-1.5 text-xs font-semibold">
          <Users size={15} /> Giao bài
        </Button>
      ),
    },
    review: {
      title: "Chấm bài",
      description: "Duyệt điểm AI và nhận xét học viên.",
    },
    cohorts: {
      title: "Lớp học",
      description: "Quản lý lớp và giao bài tập.",
    },
    analytics: {
      title: "Bảng điểm",
      description: "Thống kê năng lực theo lớp.",
    },
  };

  const currentHeader = tabHeaders[activeTab];

  return (
    <>
      <PageHeader
        eyebrow="Giảng viên"
        title={currentHeader.title}
        description={currentHeader.description}
        actions={currentHeader.actions}
      />

      {activeTab === "overview" && (
        <OverviewTab
          scenarios={scenarios}
          reviewItems={reviewItems}
          cohorts={cohorts}
          assignments={assignments}
          onSelectTab={(tabId) => setActiveTab(tabId as TabId)}
          onQuickReview={() => {
            setActiveTab("review");
          }}
        />
      )}

      {activeTab === "authoring" && (
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
      )}

      {activeTab === "review" && (
        <ReviewModerationTab
          reviewItems={reviewItems}
          onCalibrateScore={handleCalibrateScore}
          onRequestRevision={handleRequestRevision}
        />
      )}

      {activeTab === "cohorts" && (
        <CohortAssignmentTab
          cohorts={cohorts}
          assignments={assignments}
          scenarios={scenarios}
          onAddAssignment={handleAddAssignment}
          onAddCohort={handleAddCohort}
        />
      )}

      {activeTab === "analytics" && <CompetencyAnalyticsTab />}
    </>
  );
}
