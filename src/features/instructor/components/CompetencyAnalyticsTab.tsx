import { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  GraduationCap,
  Target,
  Waypoints,
  Users,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { classNames } from "../../../utils/format";
import {
  cohortService,
  type CohortSummaryDto,
  type CohortAnalyticsDto,
} from "../../../services/cohortService";

export function CompetencyAnalyticsTab() {
  const [cohorts, setCohorts] = useState<CohortSummaryDto[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>("all");
  const [analytics, setAnalytics] = useState<CohortAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCohorts() {
      try {
        const list = await cohortService.getCohorts();
        setCohorts(list || []);
        if (list && list.length > 0) {
          setSelectedCohortId(String(list[0].id));
        }
      } catch (e) {
        console.warn("Could not load cohorts:", e);
      }
    }
    loadCohorts();
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      if (selectedCohortId === "all" || !selectedCohortId) {
        setAnalytics(null);
        return;
      }
      setLoading(true);
      try {
        const data = await cohortService.getCohortAnalytics(Number(selectedCohortId));
        setAnalytics(data);
      } catch (e) {
        console.warn("Could not load cohort analytics:", e);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [selectedCohortId]);

  const handleExport = () => {
    if (!analytics) {
      alert("Chưa có dữ liệu analytics để xuất. Chọn một lớp có dữ liệu trước.");
      return;
    }

    const cohortMeta = cohorts.find((c) => String(c.id) === selectedCohortId);
    const esc = (v: string | number | null | undefined) => {
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const learnerHeader =
      "LearnerId,FullName,Email,SessionsStarted,Submissions,FinalizedReviews,AvgAiScore,AvgFinalScore";
    const learnerRows = (analytics.learnerSummaries || []).map((row) =>
      [
        row.learnerId,
        esc(row.fullName),
        esc(row.email),
        row.sessionsStartedCount,
        row.submissionsCount,
        row.finalizedReviewsCount,
        row.averageAiScore ?? "",
        row.averageFinalScore ?? "",
      ].join(",")
    );

    const benchHeader = "CriterionCode,CriterionName,MaxScore,AverageScore,AchievementPercent,EvaluatedCount";
    const benchRows = (analytics.criterionBenchmarks || []).map((b) =>
      [
        esc(b.criterionCode),
        esc(b.criterionName),
        b.maxScore,
        b.averageScore,
        b.averageAchievementPercent,
        b.evaluatedCount,
      ].join(",")
    );

    const csv = [
      `Cohort,${esc(cohortMeta?.code || analytics.code || selectedCohortId)}`,
      `Name,${esc(cohortMeta?.name || analytics.name || "")}`,
      "",
      "=== Learners ===",
      learnerHeader,
      ...learnerRows,
      "",
      "=== Criterion benchmarks ===",
      benchHeader,
      ...benchRows,
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cohort-analytics-${selectedCohortId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const benchmarks = analytics?.criterionBenchmarks || [];
  const learners = analytics?.learnerSummaries || [];

  return (
    <div className="space-y-6">
      {/* Khung Tiêu Đề */}
      <Card className="reveal-up overflow-hidden border-navy/15 bg-gradient-to-r from-mist/80 via-white to-white p-6 shadow-[0_8px_24px_rgba(16,42,67,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy/10 text-navy">
                <BarChart3 size={18} />
              </span>
              <h2 className="text-base font-bold text-navy">Thống kê lớp</h2>
            </div>
            <p className="mt-1 text-xs text-slate">Điểm theo tiêu chí đánh giá.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="gap-1.5 border-navy/20 bg-white text-xs font-bold text-navy hover:bg-mist/50"
            >
              <Download size={14} /> Xuất báo cáo
            </Button>
          </div>
        </div>
      </Card>

      {/* Thẻ Kỹ Năng Nền Tảng từ Benchmark API */}
      <div className="reveal-up reveal-delay-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benchmarks.length > 0 ? (
          benchmarks.map((item, idx) => {
            const score = Math.round(item.averageScore);
            const percent = Math.round(item.averageAchievementPercent);
            return (
              <Card
                key={item.criterionCode}
                className={`instructor-kpi-card border-navy/10 bg-gradient-to-br from-mist/50 via-white to-white p-5 ${idx % 3 === 0 ? "reveal-delay-1" : idx % 3 === 1 ? "reveal-delay-2" : "reveal-delay-3"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-1 text-xs font-bold text-navy">{item.criterionName}</span>
                  <Badge tone={percent >= 70 ? "green" : "amber"}>{percent}%</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] text-slate">Mã: {item.criterionCode}</p>
                <div className="mt-4 flex items-baseline justify-between">
                  <strong className="font-mono text-3xl font-extrabold text-navy">
                    {score}
                    <span className="text-xs font-normal text-slate">/{item.maxScore}</span>
                  </strong>
                  <span className="text-[11px] text-slate">{item.evaluatedCount} lượt</span>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    value={percent}
                    color={percent >= 75 ? "#047857" : percent >= 60 ? "#102a43" : "#b7791f"}
                  />
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center text-xs text-slate">
            {loading ? "Đang tải dữ liệu tiêu chí đánh giá..." : "Chưa có tiêu chí đánh giá nào cho lớp được chọn."}
          </div>
        )}
      </div>

      {/* Bảng Năng Lực Chi Tiết Từng Học Viên */}
      <Card className="reveal-up reveal-delay-2 overflow-hidden border-navy/15 shadow-[0_8px_24px_rgba(16,42,67,0.05)]">
        <div className="flex flex-col gap-3 border-b border-navy/10 bg-gradient-to-r from-mist/70 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy">Điểm theo học viên</h3>
            <p className="text-xs text-slate">Đồng bộ từ bài nộp và kết quả chấm.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate">Lọc lớp:</span>
            <select
              value={selectedCohortId}
              onChange={(e) => setSelectedCohortId(e.target.value)}
              className="rounded-xl border border-navy/15 bg-white px-3 py-1.5 text-xs font-bold text-navy outline-none"
            >
              {cohorts.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="bg-[#f5f8fa] text-[11px] uppercase tracking-wider text-[#667d93] border-b border-[#e2e9ef]">
              <tr>
                <th className="px-5 py-3.5">Học viên</th>
                <th className="px-4 py-3.5 text-center">Phiên đã khởi tạo</th>
                <th className="px-4 py-3.5 text-center">Bài đã nộp</th>
                <th className="px-4 py-3.5 text-center">Đã thẩm định</th>
                <th className="px-4 py-3.5 text-center">Điểm AI trung bình</th>
                <th className="px-4 py-3.5 text-center">Điểm Chuyên gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6edf2]">
              {learners.length > 0 ? (
                learners.map((row) => (
                  <tr key={row.learnerId} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-4">
                      <strong className="text-xs font-bold text-[#132d49]">{row.fullName}</strong>
                      <span className="block text-[10px] text-[#8291a1]">{row.email || `ID: #${row.learnerId}`}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-[#132d49]">
                      {row.sessionsStartedCount}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-[#132d49]">
                      {row.submissionsCount}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-[#132d49]">
                      {row.finalizedReviewsCount}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={classNames(
                          "inline-flex min-w-10 justify-center rounded-lg px-2 py-1 font-mono text-xs font-bold",
                          row.averageAiScore != null && row.averageAiScore >= 75
                            ? "bg-[#e8f5ef] text-[#2d7b60]"
                            : row.averageAiScore != null && row.averageAiScore >= 60
                            ? "bg-[#eaf1f7] text-[#2f638c]"
                            : "bg-[#fff1dd] text-[#9b681d]"
                        )}
                      >
                        {row.averageAiScore != null ? `${Math.round(row.averageAiScore)}đ` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={classNames(
                          "inline-flex min-w-10 justify-center rounded-lg px-2 py-1 font-mono text-xs font-bold",
                          row.averageFinalScore != null && row.averageFinalScore >= 75
                            ? "bg-[#e8f5ef] text-[#2d7b60]"
                            : row.averageFinalScore != null
                            ? "bg-[#eaf1f7] text-[#2f638c]"
                            : "bg-slate/10 text-slate"
                        )}
                      >
                        {row.averageFinalScore != null ? `${Math.round(row.averageFinalScore)}đ` : "Chưa chấm"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#667d93]">
                    {loading
                      ? "Đang tải dữ liệu học viên..."
                      : "Chưa có dữ liệu thống kê năng lực cho lớp này. Học viên chưa nộp bài hoặc chưa có bài làm được chấm điểm."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lời Khuyên Sư Phạm */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 border-[#d9e4ec]">
          <div className="flex items-center gap-2 text-[#2f638c]">
            <GraduationCap size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
              Lên kế hoạch bài tập bổ trợ
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667d93]">
            Nếu lớp có điểm phần xử lý thay đổi còn thấp, thầy cô nên giao thêm bài tập có tình huống bất ngờ để các bạn quen dần với việc xử lý sự cố.
          </p>
        </Card>

        <Card className="p-5 border-[#d9e4ec]">
          <div className="flex items-center gap-2 text-[#9b681d]">
            <Target size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
              Nhắc nhở kỹ năng cần rèn
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667d93]">
            Ở buổi học kế tiếp, hãy dặn học viên tập thói quen tóm tắt lại lời của sếp hoặc khách hàng trước khi đưa ra kết luận để tránh hiểu nhầm.
          </p>
        </Card>

        <Card className="p-5 border-[#d9e4ec]">
          <div className="flex items-center gap-2 text-[#2d7b60]">
            <Waypoints size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
              Thử thách đa ngành nghề
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667d93]">
            Sau khi học viên đã làm quen với bài tập Kho vận, thầy cô có thể giao thử đề bài Ngân hàng hoặc Bệnh viện để kiểm tra độ linh hoạt của các bạn.
          </p>
        </Card>
      </div>
    </div>
  );
}
