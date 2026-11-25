import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Search,
  KeyRound,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Calendar,
  Mail,
  RefreshCw,
  AlertCircle,
  Play,
} from "lucide-react";
import {
  cohortService,
  type AvailableCohortDto,
  type LearnerCohortDto,
} from "../../services/cohortService";
import {
  assignmentService,
  type LearnerAssignmentDto,
} from "../../services/assignmentService";
import { simulationService } from "../../services/simulationService";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

interface LearnerCohortsPageProps {
  navigate: (route: RouteKey) => void;
}

export function LearnerCohortsPage({ navigate }: LearnerCohortsPageProps) {
  const { setCurrentSessionId, setCurrentScenarioVersionId } = useApp();
  const [activeTab, setActiveTab] = useState<"browse" | "my-cohorts">("browse");
  const [availableCohorts, setAvailableCohorts] = useState<AvailableCohortDto[]>([]);
  const [myCohorts, setMyCohorts] = useState<LearnerCohortDto[]>([]);
  const [myAssignments, setMyAssignments] = useState<LearnerAssignmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classCodeInput, setClassCodeInput] = useState("");
  const [joiningCohortId, setJoiningCohortId] = useState<number | null>(null);
  const [joiningByCode, setJoiningByCode] = useState(false);
  const [startingAssignmentId, setStartingAssignmentId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async (search?: string) => {
    setLoading(true);
    try {
      const [availRes, myCohortsRes, myAssignRes] = await Promise.allSettled([
        cohortService.getAvailableCohorts(search),
        cohortService.getMyCohorts(),
        assignmentService.getMyAssignments(),
      ]);

      if (availRes.status === "fulfilled") {
        setAvailableCohorts(availRes.value || []);
      }
      if (myCohortsRes.status === "fulfilled") {
        setMyCohorts(myCohortsRes.value || []);
      }
      if (myAssignRes.status === "fulfilled") {
        setMyAssignments(myAssignRes.value || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleJoinById = async (cohort: AvailableCohortDto) => {
    setJoiningCohortId(cohort.id);
    setFeedback(null);
    try {
      await cohortService.requestJoinCohort(cohort.id);
      setFeedback({
        type: "success",
        text: `Đã gửi yêu cầu tham gia lớp "${cohort.name}" (${cohort.code}) tới giảng viên ${cohort.instructorName}. Vui lòng chờ giảng viên phê duyệt.`,
      });
      await loadData(searchQuery);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Không thể gửi yêu cầu tham gia lớp học.",
      });
    } finally {
      setJoiningCohortId(null);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCodeInput.trim()) return;
    setJoiningByCode(true);
    setFeedback(null);
    try {
      const joined = await cohortService.requestJoinCohortByCode(classCodeInput.trim());
      setFeedback({
        type: "success",
        text: `Đã gửi yêu cầu tham gia lớp "${joined.name}" (${joined.code}) thành công! Vui lòng chờ giảng viên phê duyệt.`,
      });
      setClassCodeInput("");
      await loadData(searchQuery);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Không tìm thấy lớp học với mã này hoặc bạn đã gửi yêu cầu trước đó.",
      });
    } finally {
      setJoiningByCode(false);
    }
  };

  const handleStartAssignment = async (assignment: LearnerAssignmentDto) => {
    setStartingAssignmentId(assignment.id);
    try {
      setCurrentScenarioVersionId(assignment.scenarioVersionId);
      if (assignment.latestSessionId) {
        setCurrentSessionId(assignment.latestSessionId);
      } else {
        const created = await simulationService.startSession(assignment.scenarioVersionId);
        setCurrentSessionId(created.id);
      }
      navigate("simulation");
    } catch {
      navigate("scenarios");
    } finally {
      setStartingAssignmentId(null);
    }
  };

  const isStatusPending = (status: any) =>
    status === "Pending" || status === 3 || String(status).toLowerCase() === "pending";

  const isStatusActive = (status: any) =>
    status === "Active" || status === 0 || String(status).toLowerCase() === "active";

  const activeJoinedCount = myCohorts.filter((c) => isStatusActive(c.memberStatus)).length;
  const pendingJoinedCount = myCohorts.filter((c) => isStatusPending(c.memberStatus)).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F2B46] via-[#153A5E] to-[#1E4D7B] p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-200">
              <GraduationCap className="h-4 w-4" />
              Kết nối Giảng viên & Lớp học
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Lớp học & Giảng viên Hướng dẫn
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              Tìm kiếm lớp học của giảng viên hoặc nhập mã lớp (Cohort Code) để gửi yêu cầu tham gia, nhận bài tập tình huống BA thực chiến và được giảng viên chấm điểm chuyên sâu.
            </p>
          </div>

          {/* Quick Join By Class Code Box */}
          <form
            onSubmit={handleJoinByCode}
            className="w-full lg:w-96 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-200">
              <KeyRound className="h-4 w-4" />
              Tham gia nhanh bằng Mã lớp học
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={classCodeInput}
                onChange={(e) => setClassCodeInput(e.target.value)}
                placeholder="VD: BA-2026-K1..."
                className="flex-1 rounded-xl bg-white/95 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="submit"
                disabled={joiningByCode || !classCodeInput.trim()}
                className="rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer shrink-0"
              >
                {joiningByCode ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </div>

        {/* Summary Pills */}
        <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2">
            <Users className="h-4 w-4 text-emerald-300" />
            <span>Đã tham gia chính thức:</span>
            <strong className="text-white font-bold">{activeJoinedCount} lớp</strong>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2">
            <Clock className="h-4 w-4 text-amber-300" />
            <span>Đang chờ Giảng viên duyệt:</span>
            <strong className="text-white font-bold">{pendingJoinedCount} yêu cầu</strong>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2">
            <BookOpen className="h-4 w-4 text-sky-300" />
            <span>Bài tập được giao:</span>
            <strong className="text-white font-bold">{myAssignments.length} bài tập</strong>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("browse")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              activeTab === "browse"
                ? "bg-[#0F2B46] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Danh sách Lớp học & Giảng viên ({availableCohorts.length})
          </button>
          <button
            onClick={() => setActiveTab("my-cohorts")}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition cursor-pointer ${
              activeTab === "my-cohorts"
                ? "bg-[#0F2B46] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Lớp học của tôi & Bài tập ({myCohorts.length})
          </button>
        </div>

        <button
          onClick={() => loadData(searchQuery)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {/* TAB 1: Browse Instructors & Available Cohorts */}
      {activeTab === "browse" && (
        <div className="space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên giảng viên, mã lớp học hoặc tên lớp..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:border-[#0F2B46] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#0F2B46] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#163a5f] transition cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Đang tải danh sách lớp học từ cơ sở dữ liệu...
            </div>
          ) : availableCohorts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-2">
              <GraduationCap className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-base font-bold text-slate-800">
                Hiện chưa có lớp học nào đang mở trong hệ thống
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Khi Giảng viên khởi tạo lớp học ở trạng thái Đang mở (Active), danh sách lớp và thông tin giảng viên sẽ hiển thị tại đây để bạn gửi yêu cầu tham gia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {availableCohorts.map((cohort) => {
                const isJoined = isStatusActive(cohort.myMemberStatus);
                const isPending = isStatusPending(cohort.myMemberStatus);

                return (
                  <div
                    key={cohort.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="space-y-4">
                      {/* Top row: Code + Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-[#0F2B46]">
                          {cohort.code}
                        </span>
                        {isJoined ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đã vào lớp
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                            <Clock className="h-3.5 w-3.5" />
                            Chờ giảng viên duyệt
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            Đang mở đăng ký
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                          {cohort.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                          {cohort.description || "Lớp đào tạo thực hành Phân tích Nghiệp vụ (Business Analysis) theo kịch bản doanh nghiệp."}
                        </p>
                      </div>

                      {/* Instructor Info Card */}
                      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-1">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Giảng viên phụ trách
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          <GraduationCap className="h-4 w-4 text-[#0F2B46] shrink-0" />
                          <span>{cohort.instructorName}</span>
                        </div>
                        {cohort.instructorEmail && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{cohort.instructorEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cohort.activeMemberCount} học viên</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cohort.assignmentCount} bài tập</span>
                        </div>
                        {(cohort.startDate || cohort.endDate) && (
                          <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {cohort.startDate || "..."} → {cohort.endDate || "..."}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {isJoined ? (
                        <button
                          onClick={() => setActiveTab("my-cohorts")}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                        >
                          <span>Xem bài tập trong lớp</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : isPending ? (
                        <button
                          disabled
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-100 px-4 py-2.5 text-xs font-bold text-amber-800 cursor-not-allowed"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>Đã gửi yêu cầu · Chờ duyệt</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinById(cohort)}
                          disabled={joiningCohortId === cohort.id}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2B46] hover:bg-[#173e63] disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
                        >
                          <span>
                            {joiningCohortId === cohort.id
                              ? "Đang gửi yêu cầu..."
                              : "Gửi yêu cầu tham gia lớp"}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Joined/Pending Cohorts & Assigned Exercises */}
      {activeTab === "my-cohorts" && (
        <div className="space-y-8">
          {/* Section A: My Cohorts */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Danh sách Lớp học đã đăng ký ({myCohorts.length})
            </h2>
            {myCohorts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-700">
                  Bạn chưa tham gia hoặc gửi yêu cầu vào lớp học nào.
                </p>
                <button
                  onClick={() => setActiveTab("browse")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B46] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <span>Tìm lớp của Giảng viên ngay</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCohorts.map((mc) => {
                  const pending = isStatusPending(mc.memberStatus);
                  return (
                    <div
                      key={mc.cohortId}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-[#0F2B46]">
                            {mc.code}
                          </span>
                          {pending ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                              <Clock className="h-3.5 w-3.5" />
                              Đang chờ Giảng viên phê duyệt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Học viên chính thức
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900">{mc.name}</h3>
                        {mc.description && (
                          <p className="text-xs text-slate-500">{mc.description}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <GraduationCap className="h-4 w-4 text-[#0F2B46]" />
                          <span>GV: {mc.instructorName || `#${mc.instructorId}`}</span>
                        </div>
                        <div className="text-slate-500">
                          {mc.activeAssignmentCount} bài tập đang mở
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section B: Assignments Assigned by Instructor */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              Bài tập Tình huống Giảng viên giao ({myAssignments.length})
            </h2>
            {myAssignments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Hiện chưa có bài tập nào được giao trong các lớp học đã được duyệt của bạn.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAssignments.map((assign) => (
                  <div
                    key={assign.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800">
                          Lớp: {assign.cohortName || assign.cohortCode || "Cá nhân"}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Lượt làm bài: {assign.attemptsUsed}
                          {assign.maxAttempts ? `/${assign.maxAttempts}` : ""}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{assign.title}</h3>
                      {assign.instructions && (
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {assign.instructions}
                        </p>
                      )}
                      {assign.dueAt && (
                        <p className="text-xs text-slate-500">
                          Hạn nộp: {new Date(assign.dueAt).toLocaleString("vi-VN")}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => handleStartAssignment(assign)}
                        disabled={startingAssignmentId === assign.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#0F2B46] hover:bg-[#173e63] px-4 py-2 text-xs font-bold text-white transition cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>
                          {startingAssignmentId === assign.id
                            ? "Đang khởi tạo..."
                            : "Làm bài thực hành"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
