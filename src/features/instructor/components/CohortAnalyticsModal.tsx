import { useState, useEffect } from "react";
import {
  BarChart3,
  X,
  Loader2,
  Award,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import {
  cohortService,
  CohortAnalyticsDto,
} from "../../../services/cohortService";

interface CohortAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort: { id: string | number; code: string; name: string } | null;
}

export function CohortAnalyticsModal({
  isOpen,
  onClose,
  cohort,
}: CohortAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<CohortAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "benchmarks" | "learners">("overview");

  const cohortNumericId = cohort
    ? typeof cohort.id === "number"
      ? cohort.id
      : parseInt(cohort.id.replace(/\D/g, ""), 10) || 1
    : 1;

  useEffect(() => {
    if (!isOpen || !cohort) return;

    setLoading(true);
    cohortService
      .getCohortAnalytics(cohortNumericId)
      .then((data) => setAnalytics(data))
      .catch((err) => {
        console.warn("Could not fetch cohort analytics from API, using fallback data:", err);
        // Fallback mock analytics data
        setAnalytics({
          cohortId: cohortNumericId,
          code: cohort.code,
          name: cohort.name,
          activeMemberCount: 30,
          totalAssignmentCount: 4,
          totalSessionsStarted: 84,
          totalSubmissionsCount: 62,
          totalFinalizedReviewsCount: 58,
          classAverageAiScore: 78.5,
          classAverageExpertScore: 81.2,
          completionRatePercent: 85,
          criterionBenchmarks: [
            {
              criterionCode: "ELICIT",
              criterionName: "Kỹ năng khơi gợi thông tin (BABOK Elicitation)",
              maxScore: 100,
              evaluatedCount: 58,
              averageScore: 82.4,
              averageAchievementPercent: 82.4,
              belowThresholdCount: 3,
            },
            {
              criterionCode: "STAKEHOLDER",
              criterionName: "Hòa giải xung đột các bên liên quan",
              maxScore: 100,
              evaluatedCount: 58,
              averageScore: 76.0,
              averageAchievementPercent: 76.0,
              belowThresholdCount: 7,
            },
            {
              criterionCode: "TRACEABILITY",
              criterionName: "Ma trận truy vết yêu cầu (Traceability)",
              maxScore: 100,
              evaluatedCount: 58,
              averageScore: 84.5,
              averageAchievementPercent: 84.5,
              belowThresholdCount: 2,
            },
            {
              criterionCode: "BRD_QUALITY",
              criterionName: "Chất lượng hoàn thiện tài liệu BRD",
              maxScore: 100,
              evaluatedCount: 58,
              averageScore: 80.1,
              averageAchievementPercent: 80.1,
              belowThresholdCount: 4,
            },
          ],
          learnerSummaries: [
            {
              learnerId: 101,
              fullName: "Đặng Hoàng Nam",
              email: "nam.dang@example.com",
              sessionsStartedCount: 3,
              submissionsCount: 2,
              finalizedReviewsCount: 2,
              averageAiScore: 85,
              averageFinalScore: 88,
            },
            {
              learnerId: 102,
              fullName: "Lê Thị Mai Anh",
              email: "maianh.le@example.com",
              sessionsStartedCount: 4,
              submissionsCount: 2,
              finalizedReviewsCount: 2,
              averageAiScore: 92,
              averageFinalScore: 94,
            },
            {
              learnerId: 103,
              fullName: "Trần Quốc Bảo",
              email: "bao.tran@example.com",
              sessionsStartedCount: 2,
              submissionsCount: 1,
              finalizedReviewsCount: 1,
              averageAiScore: 70,
              averageFinalScore: 72,
            },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, [isOpen, cohort]);

  if (!isOpen || !cohort) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-[#d9e4ec] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf1f7] text-[#2f638c]">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132d49] flex items-center gap-2">
                Báo Cáo Phân Tích Năng Lực Toàn Diện (Cohort Analytics)
                <Badge tone="navy">{cohort.code}</Badge>
              </h3>
              <p className="text-xs text-[#667d93]">{cohort.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-xs text-[#667d93]">
            <Loader2 size={28} className="animate-spin text-[#2f638c]" />
            <span>Đang tổng hợp báo cáo phân tích từ API (GET /api/cohorts/{cohort.id}/analytics)...</span>
          </div>
        ) : analytics ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Nav tabs */}
            <div className="flex border-b border-[#e2e9ef] px-6 bg-[#fafcff]">
              {[
                { id: "overview", label: "Tổng quan lớp học", icon: BarChart3 },
                { id: "benchmarks", label: "Chuẩn năng lực BABOK", icon: Award },
                { id: "learners", label: "Kết quả từng học viên", icon: BookOpen },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                      activeTab === t.id
                        ? "border-[#2f638c] text-[#2f638c]"
                        : "border-transparent text-[#667d93] hover:text-[#132d49]"
                    }`}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* KPI cards */}
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#667d93]">Sĩ số học viên</span>
                      <strong className="mt-1 block text-2xl font-bold text-[#132d49]">
                        {analytics.activeMemberCount} bạn
                      </strong>
                      <span className="text-[11px] text-[#2d7b60]">Đang theo học</span>
                    </div>

                    <div className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#667d93]">Tỷ lệ hoàn thành</span>
                      <strong className="mt-1 block text-2xl font-bold text-[#2f638c]">
                        {analytics.completionRatePercent}%
                      </strong>
                      <div className="mt-1">
                        <ProgressBar value={analytics.completionRatePercent} color="#2f638c" />
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#667d93]">Điểm TB AI chấm</span>
                      <strong className="mt-1 block text-2xl font-bold text-[#132d49]">
                        {analytics.classAverageAiScore ?? "—"}/100
                      </strong>
                      <span className="text-[11px] text-[#667d93]">Tự động đánh giá</span>
                    </div>

                    <div className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-[#667d93]">Điểm TB Thầy cô chốt</span>
                      <strong className="mt-1 block text-2xl font-bold text-[#2d7b60]">
                        {analytics.classAverageExpertScore ?? "—"}/100
                      </strong>
                      <span className="text-[11px] text-[#2d7b60]">Thẩm định chính thức</span>
                    </div>
                  </div>

                  {/* Summary counts */}
                  <div className="rounded-2xl border border-[#d9e4ec] bg-[#f8fafc] p-5">
                    <h4 className="font-bold text-[#132d49] text-xs uppercase tracking-wider mb-3">
                      Hoạt Động Thực Hành Trong Lớp
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3 border border-[#e2e9ef]">
                        <span className="text-[#667d93]">Số phiên thực hành đã mở:</span>
                        <strong className="block text-sm font-bold text-[#132d49] mt-0.5">
                          {analytics.totalSessionsStarted} phiên
                        </strong>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-[#e2e9ef]">
                        <span className="text-[#667d93]">Số bài tập đã nộp:</span>
                        <strong className="block text-sm font-bold text-[#132d49] mt-0.5">
                          {analytics.totalSubmissionsCount} bài
                        </strong>
                      </div>
                      <div className="rounded-xl bg-white p-3 border border-[#e2e9ef]">
                        <span className="text-[#667d93]">Số bài đã duyệt hoàn tất:</span>
                        <strong className="block text-sm font-bold text-[#2d7b60] mt-0.5">
                          {analytics.totalFinalizedReviewsCount} bài
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "benchmarks" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#132d49] text-xs">
                      Mức Độ Đạt Chuẩn Năng Lực Theo Tiêu Chí BABOK
                    </h4>
                    <p className="text-[#667d93] text-[11px]">
                      Phân tích phổ điểm trung bình của toàn thể sinh viên trong lớp theo từng nhóm kỹ năng.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {analytics.criterionBenchmarks.map((bench, idx) => (
                      <div
                        key={bench.criterionCode || idx}
                        className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="rounded bg-[#eaf1f7] px-2 py-0.5 font-mono text-[10px] font-bold text-[#2f638c]">
                              {bench.criterionCode}
                            </span>
                            <h5 className="mt-1 font-bold text-[#132d49]">{bench.criterionName}</h5>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-sm font-bold text-[#132d49]">
                              {bench.averageScore} / {bench.maxScore}đ
                            </span>
                            <span className="text-[11px] text-[#2d7b60] block">
                              ({bench.averageAchievementPercent}%)
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <ProgressBar value={bench.averageAchievementPercent} color="#2d7b60" />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-[#667d93]">
                          <span>Đã chấm: {bench.evaluatedCount} lượt</span>
                          {bench.belowThresholdCount > 0 && (
                            <span className="text-[#a03d3d] font-semibold flex items-center gap-1">
                              <AlertTriangle size={12} /> {bench.belowThresholdCount} bạn dưới ngưỡng chuẩn
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "learners" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#132d49] text-xs">
                      Bảng Điểm & Tiến Độ Chi Tiết Của Từng Học Viên
                    </h4>
                    <p className="text-[#667d93] text-[11px]">
                      Theo dõi số phiên luyện tập, số bài nộp và điểm trung bình tích lũy.
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#d9e4ec]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#e2e9ef] bg-[#f8fafc] text-[11px] font-bold text-[#667d93]">
                          <th className="py-2.5 px-4">Học viên</th>
                          <th className="py-2.5 px-4">Email</th>
                          <th className="py-2.5 px-4 text-center">Số phiên mở</th>
                          <th className="py-2.5 px-4 text-center">Đã nộp</th>
                          <th className="py-2.5 px-4 text-center">Đã duyệt</th>
                          <th className="py-2.5 px-4 text-center">TB AI</th>
                          <th className="py-2.5 px-4 text-right">TB Chốt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf2f6]">
                        {analytics.learnerSummaries.map((lr) => (
                          <tr key={lr.learnerId} className="hover:bg-[#fbfcfd]">
                            <td className="py-2.5 px-4 font-bold text-[#132d49]">{lr.fullName}</td>
                            <td className="py-2.5 px-4 text-[#526b81]">{lr.email || "—"}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{lr.sessionsStartedCount}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{lr.submissionsCount}</td>
                            <td className="py-2.5 px-4 text-center font-mono text-[#2d7b60]">
                              {lr.finalizedReviewsCount}
                            </td>
                            <td className="py-2.5 px-4 text-center font-mono">
                              {lr.averageAiScore !== null ? `${lr.averageAiScore}đ` : "—"}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-[#2f638c]">
                              {lr.averageFinalScore !== null ? `${lr.averageFinalScore}đ` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3 flex justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

