import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../contexts/AppContext";
import {
  initialScenarios,
  initialPersonas,
  initialKnowledgeItems,
  initialScenarioEvents,
  initialLiveSessions,
  initialReviewItems,
  initialCohorts,
  initialAssignments,
  type ScenarioVersion,
  type StakeholderPersona,
  type AgentKnowledgeItem,
  type ScenarioEventConfig,
  type LiveSessionItem,
  type ReviewItem,
  type CohortItem,
  type AssignmentItem,
  type CriterionReview,
} from "./instructorData";

import { OverviewTab } from "./components/OverviewTab";
import { AuthoringTab } from "./components/AuthoringTab";
import { LiveSessionsTab } from "./components/LiveSessionsTab";
import { ReviewModerationTab } from "./components/ReviewModerationTab";
import { CohortAssignmentTab } from "./components/CohortAssignmentTab";
import { CompetencyAnalyticsTab } from "./components/CompetencyAnalyticsTab";

type TabId = "overview" | "authoring" | "live" | "review" | "cohorts" | "analytics";

export function InstructorPage() {
  const { instructorTab, setInstructorTab } = useApp();
  const activeTab = (instructorTab as TabId) || "overview";
  const setActiveTab = (tab: TabId) => setInstructorTab(tab);

  // Quản lý trạng thái dữ liệu tương tác
  const [scenarios, setScenarios] = useState<ScenarioVersion[]>(initialScenarios);
  const [personas, setPersonas] = useState<StakeholderPersona[]>(initialPersonas);
  const [knowledgeItems, setKnowledgeItems] = useState<AgentKnowledgeItem[]>(initialKnowledgeItems);
  const [events, setEvents] = useState<ScenarioEventConfig[]>(initialScenarioEvents);
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>(initialLiveSessions);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(initialReviewItems);
  const [cohorts, setCohorts] = useState<CohortItem[]>(initialCohorts);
  const [assignments, setAssignments] = useState<AssignmentItem[]>(initialAssignments);

  // Xử lý thêm kịch bản mới
  const handleAddScenario = (newSc: ScenarioVersion) => {
    setScenarios((prev) => [newSc, ...prev]);
  };

  const handlePublishVersion = (scenarioId: string) => {
    setScenarios((prev) =>
      prev.map((s) => (s.scenarioId === scenarioId ? { ...s, status: "Đã ban hành" } : s))
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

  const handleAddKnowledge = (newK: AgentKnowledgeItem) => {
    setKnowledgeItems((prev) => [...prev, newK]);
  };

  const handleAddEvent = (newEv: ScenarioEventConfig) => {
    setEvents((prev) => [...prev, newEv]);
    setScenarios((prev) =>
      prev.map((s) =>
        s.scenarioId === newEv.scenarioId ? { ...s, eventsCount: s.eventsCount + 1 } : s
      )
    );
  };

  // Xử lý kích hoạt sự cố vào phiên của học viên
  const handleTriggerEventToSession = (sessionId: string, event: ScenarioEventConfig) => {
    setLiveSessions((prev) =>
      prev.map((ses) => {
        if (ses.id === sessionId) {
          const updatedTranscript = [
            ...ses.transcript,
            {
              sender: "agent" as const,
              stakeholderName: "Hệ thống Mô phỏng (Thông báo sự cố)",
              text: `[SỰ CỐ BẤT NGỜ PHÁT SINH]: ${event.title} - ${event.injectedFact}`,
              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
            },
          ];
          return {
            ...ses,
            severity: "Có sự kiện thay đổi" as const,
            signal: `Tình huống "${event.title}" vừa được gửi vào phiên`,
            transcript: updatedTranscript,
          };
        }
        return ses;
      })
    );
  };

  // Xử lý gửi lời nhắc nhở phương pháp cho học viên
  const handleSendCoachHint = (sessionId: string, hint: string) => {
    setLiveSessions((prev) =>
      prev.map((ses) => {
        if (ses.id === sessionId) {
          return {
            ...ses,
            transcript: [
              ...ses.transcript,
              {
                sender: "agent" as const,
                stakeholderName: "Thầy/Cô hướng dẫn (Lời nhắc)",
                text: `[LỜI NHẮC PHƯƠNG PHÁP]: ${hint}`,
                time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              },
            ],
          };
        }
        return ses;
      })
    );
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

  const tabHeaders: Record<TabId, { eyebrow: string; title: string; description: string; actions?: React.ReactNode }> = {
    overview: {
      eyebrow: "Không gian làm việc của Giảng viên · BA-VES Operations Studio",
      title: "Tổng quan Quản trị & Điều hành Đào tạo",
      description: "Nắm bắt toàn cảnh các lớp học, theo dõi học viên đang thực hành trực tiếp và thẩm định bài nộp theo chuẩn năng lực thực chiến.",
      actions: (
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setActiveTab("authoring")} className="gap-1.5 text-xs font-semibold text-[#132d49]">
            <Plus size={15} /> Tạo đề bài mới
          </Button>
          <Button onClick={() => setActiveTab("cohorts")} className="gap-1.5 text-xs font-semibold">
            <Users size={15} /> Giao bài cho lớp
          </Button>
        </div>
      ),
    },
    authoring: {
      eyebrow: "Thiết kế Đề bài & Kịch bản Doanh nghiệp · FE-02",
      title: "Kho Đề bài Tình huống & Nhân vật AI",
      description: "Xây dựng bối cảnh doanh nghiệp thực tế, cấu hình giới hạn tri thức của từng nhân vật AI và thiết lập các tình huống biến động bất ngờ.",
      actions: (
        <Button onClick={() => setActiveTab("cohorts")} className="gap-1.5 text-xs font-semibold">
          <Users size={15} /> Giao đề bài cho lớp
        </Button>
      ),
    },
    live: {
      eyebrow: "Phòng Giám sát Trực tiếp & Điều phối Sự kiện · FE-03",
      title: "Quan sát Phiên Phỏng vấn Trực tiếp (Live Command Center)",
      description: "Theo dõi trực tiếp luồng đối thoại giữa học viên và nhân vật AI. Thầy cô có thể chủ động gửi sự cố bất ngờ để thử thách phản xạ.",
    },
    review: {
      eyebrow: "Hội đồng Thẩm định & Hiệu chỉnh Điểm AI · FE-05 & FE-06",
      title: "Hàng đợi Chấm Bài & Hiệu chỉnh Điểm",
      description: "Đối chiếu kết quả chấm nháp của AI với bằng chứng thực tế, hiệu chuẩn điểm số theo 5 tiêu chuẩn năng lực và gửi nhận xét cho học viên.",
    },
    cohorts: {
      eyebrow: "Quản lý Lớp học & Phân công Bài tập · FE-07",
      title: "Quản lý Lớp học & Giao Đề bài Thực hành",
      description: "Quản lý danh sách lớp học, phân công kịch bản theo phiên bản bảo lưu, thiết lập hạn nộp và giới hạn số lần làm thử.",
    },
    analytics: {
      eyebrow: "Báo cáo Phân tích Năng lực Tổng hợp · FE-08",
      title: "Bảng Điểm Năng lực & Đánh giá Kỹ năng Cả lớp",
      description: "Thống kê mức độ thuần thục qua 6 nhóm kỹ năng phân tích nghiệp vụ cốt lõi và định hướng kế hoạch can thiệp sư phạm.",
    },
  };

  const currentHeader = tabHeaders[activeTab];

  return (
    <>
      <PageHeader
        eyebrow={currentHeader.eyebrow}
        title={currentHeader.title}
        description={currentHeader.description}
        actions={currentHeader.actions}
      />

      {/* Hiển thị Nội Dung Tab Tương Ứng */}
      {activeTab === "overview" && (
        <OverviewTab
          scenarios={scenarios}
          liveSessions={liveSessions}
          reviewItems={reviewItems}
          onSelectTab={(tabId) => setActiveTab(tabId as TabId)}
          onQuickReview={() => {
            setActiveTab("review");
          }}
          onQuickObserve={() => {
            setActiveTab("live");
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
          onAddKnowledge={handleAddKnowledge}
          onAddEvent={handleAddEvent}
          onPublishVersion={handlePublishVersion}
        />
      )}

      {activeTab === "live" && (
        <LiveSessionsTab
          sessions={liveSessions}
          availableEvents={events}
          onTriggerEventToSession={handleTriggerEventToSession}
          onSendCoachHint={handleSendCoachHint}
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
