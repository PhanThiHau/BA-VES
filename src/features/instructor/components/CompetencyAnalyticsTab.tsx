import { useEffect, useState } from "react";
import {
  BarChart3,
  Download,
  GraduationCap,
  Loader2,
  Target,
  Waypoints,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { classNames } from "../../../utils/format";
import {
  cohortService,
  type CohortAnalyticsDto,
  type CohortSummaryDto,
} from "../../../services/cohortService";

export function CompetencyAnalyticsTab() {
  const [cohorts, setCohorts] = useState<CohortSummaryDto[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<CohortAnalyticsDto | null>(null);
  const [loadingCohorts, setLoadingCohorts] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingCohorts(true);
    cohortService
      .getCohorts()
      .then((list) => {
        if (!isMounted) return;
        const items = list || [];
        setCohorts(items);
        if (items.length > 0) {
          setSelectedCohortId(items[0].id);
        }
      })
      .catch((err: any) => {
        if (isMounted) setErrorMsg(err?.message || "Không thể tải danh sách lớp học.");
      })
      .finally(() => {
        if (isMounted) setLoadingCohorts(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCohortId) {
      setAnalytics(null);
      return;
    }
    let isMounted = true;
    setLoadingAnalytics(true);
    setErrorMsg(null);
    cohortService
      .getCohortAnalytics(selectedCohortId)
      .then((data) => {
        if (isMounted) setAnalytics(data);
      })
      .catch((err: any) => {
        if (isMounted) {
          setAnalytics(null);
          setErrorMsg(err?.message || "Không thể tải báo cáo năng lực của lớp học.");
        }
      })
      .finally(() => {
        if (isMounted) setLoadingAnalytics(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCohortId]);

  const handleExport = () => {
    if (!analytics) return;
    const headers = [
      "ID",
      "Ho ten",
      "Email",
      "So phien",
      "Bai nop",
      "Da cham xong",
      "Diem AI TB",
      "Diem Chinh thuc TB",
    ];
    const rows = analytics.learnerSummaries.map((l) =>
      [
        l.learnerId,
        `"${(l.fullName || "").replace(/"/g, '""')}"`,
        `"${(l.email || "").replace(/"/g, '""')}"`,
        l.sessionsStartedCount,
        l.submissionsCount,
        l.finalizedReviewsCount,
        l.averageAiScore != null ? l.averageAiScore.toFixed(1) : "",
        l.averageFinalScore != null ? l.averageFinalScore.toFixed(1) : "",
      ].join(",")
    );
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bao-cao-nang-luc-${analytics.code || analytics.cohortId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Khung Tiêu Đề & Chọn Lớp */}
      <Card className="overflow-hidden border-[#cadce8] bg-[#f8fafc] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eaf1f7] text-[#2f638c]">
                <BarChart3 size={18} />
              </span>
              <h2 className="text-base font-bold text-[#132d49]">
                Bảng Thống Kê Năng Lực & Kỹ Năng Của Lớp
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#667d93]">
              Tổng hợp điểm số thực tế theo từng tiêu chí BABOK® và kết quả của từng học viên từ hệ thống chấm điểm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {cohorts.length > 0 && (
              <select
                value={selectedCohortId ?? ""}
                onChange={(e) => setSelectedCohortId(Number(e.target.value))}
                className="rounded-xl border border-[#d9e4ec] bg-white px-3 py-1.5 text-xs font-semibold text-[#132d49] outline-none"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={!analytics}
              onClick={handleExport}
              className="gap-1.5 text-xs"
            >
              <Download size={14} /> Xuất Báo Cáo CSV
            </Button>
          </div>
        </div>
      </Card>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

      {loadingCohorts || loadingAnalytics ? (
        <Card className="p-12 text-center border-[#d9e4ec]">
          <Loader2 size={24} className="mx-auto mb-2 animate-spin text-[#2f638c]" />
          <p className="text-xs text-[#667d93]">Đang tải dữ liệu phân tích năng lực từ máy chủ...</p>
        </Card>
      ) : cohorts.length === 0 || !analytics ? (
        <Card className="p-12 text-center border-dashed border-[#d9e4ec]">
          <p className="text-xs text-[#667d93]">
            Chưa có lớp học nào được tạo hoặc chưa có dữ liệu thống kê cho lớp này.
          </p>
        </Card>
      ) : (
        <>
          {/* Chỉ số tổng quan lớp */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4 border-[#d9e4ec]">
              <span className="text-[11px] font-bold text-[#667d93]">Sĩ số đang học</span>
              <strong className="mt-1 block font-mono text-2xl font-extrabold text-[#132d49]">
                {analytics.activeMemberCount}
              </strong>
              <span className="text-[11px] text-[#8291a1]">{analytics.totalAssignmentCount} bài tập đã giao</span>
            </Card>
            <Card className="p-4 border-[#d9e4ec]">
              <span className="text-[11px] font-bold text-[#667d93]">Tỷ lệ hoàn thành</span>
              <strong className="mt-1 block font-mono text-2xl font-extrabold text-[#2f638c]">
                {analytics.completionRatePercent.toFixed(0)}%
              </strong>
              <span className="text-[11px] text-[#8291a1]">{analytics.totalSubmissionsCount} lượt nộp bài</span>
            </Card>
            <Card className="p-4 border-[#d9e4ec]">
              <span className="text-[11px] font-bold text-[#667d93]">Điểm AI trung bình</span>
              <strong className="mt-1 block font-mono text-2xl font-extrabold text-[#132d49]">
                {analytics.classAverageAiScore != null ? analytics.classAverageAiScore.toFixed(1) : "—"}
              </strong>
              <span className="text-[11px] text-[#8291a1]">{analytics.totalSessionsStarted} phiên phỏng vấn</span>
            </Card>
            <Card className="p-4 border-[#d9e4ec]">
              <span className="text-[11px] font-bold text-[#667d93]">Điểm Chuyên gia chốt</span>
              <strong className="mt-1 block font-mono text-2xl font-extrabold text-[#2d7b60]">
                {analytics.classAverageExpertScore != null ? analytics.classAverageExpertScore.toFixed(1) : "—"}
              </strong>
              <span className="text-[11px] text-[#8291a1]">{analytics.totalFinalizedReviewsCount} bài đã duyệt</span>
            </Card>
          </div>

          {/* Thẻ Tiêu chí Rubric / Năng lực */}
          {analytics.criterionBenchmarks.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-[#d9e4ec]">
              <p className="text-xs text-[#667d93]">
                Lớp {analytics.code} chưa có bài đánh giá theo tiêu chí Rubric nào để tổng hợp điểm kỹ năng.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.criterionBenchmarks.map((item) => {
                const pct = Math.round(item.averageAchievementPercent);
                return (
                  <Card key={item.criterionCode} className="p-5 border-[#d9e4ec]">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#132d49] line-clamp-1">
                        {item.criterionName}
                      </span>
                      <Badge tone={pct >= 70 ? "green" : "amber"}>{pct}% đạt</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-[#667d93] line-clamp-1">
                      Mã tiêu chí: {item.criterionCode} · {item.evaluatedCount} lượt chấm
                    </p>
                    <div className="mt-4 flex items-baseline justify-between">
                      <strong className="font-mono text-3xl font-extrabold text-[#132d49]">
                        {item.averageScore.toFixed(1)}
                        <span className="text-xs font-normal text-[#667d93]">/{item.maxScore}</span>
                      </strong>
                      <span className="text-[11px] text-[#667d93]">
                        {item.belowThresholdCount} bài dưới ngưỡng
                      </span>
                    </div>
                    <div className="mt-3">
                      <ProgressBar
                        value={pct}
                        color={pct >= 75 ? "#2d7b60" : pct >= 60 ? "#2f638c" : "#9b681d"}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Bảng Năng Lực Chi Tiết Từng Học Viên */}
          <Card className="overflow-hidden border-[#d9e4ec]">
            <div className="flex flex-col gap-3 border-b border-[#e2e9ef] bg-[#f8fafc] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Kết Quả Chi Tiết Từng Học Viên ({analytics.learnerSummaries.length})
                </h3>
                <p className="text-xs text-[#667d93]">
                  Tổng hợp từ các phiên mô phỏng và bài nộp đã được đánh giá của lớp {analytics.code}.
                </p>
              </div>
            </div>

            {analytics.learnerSummaries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#667d93]">
                Lớp này chưa có học viên nào tham gia thực hành.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead className="bg-[#f5f8fa] text-[11px] uppercase tracking-wider text-[#667d93] border-b border-[#e2e9ef]">
                    <tr>
                      <th className="px-5 py-3.5">Học viên</th>
                      <th className="px-4 py-3.5 text-center">Phiên phỏng vấn</th>
                      <th className="px-4 py-3.5 text-center">Bài đã nộp</th>
                      <th className="px-4 py-3.5 text-center">Đã duyệt</th>
                      <th className="px-4 py-3.5 text-center">Điểm AI TB</th>
                      <th className="px-4 py-3.5 text-center">Điểm Chính thức TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e6edf2]">
                    {analytics.learnerSummaries.map((row) => (
                      <tr key={row.learnerId} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-5 py-4">
                          <strong className="text-xs font-bold text-[#132d49]">{row.fullName}</strong>
                          <span className="block text-[10px] text-[#8291a1]">
                            {row.email || `Learner #${row.learnerId}`}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-[#132d49]">
                          {row.sessionsStartedCount}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-[#132d49]">
                          {row.submissionsCount}
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-[#132d49]">
                          {row.finalizedReviewsCount}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={classNames(
                              "inline-flex min-w-12 justify-center rounded-lg px-2 py-1 font-mono text-xs font-bold",
                              row.averageAiScore == null
                                ? "bg-slate/10 text-slate"
                                : row.averageAiScore >= 75
                                ? "bg-[#e8f5ef] text-[#2d7b60]"
                                : row.averageAiScore >= 60
                                ? "bg-[#eaf1f7] text-[#2f638c]"
                                : "bg-[#fff1dd] text-[#9b681d]"
                            )}
                          >
                            {row.averageAiScore != null ? `${row.averageAiScore.toFixed(1)}đ` : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={classNames(
                              "inline-flex min-w-12 justify-center rounded-lg px-2 py-1 font-mono text-xs font-bold",
                              row.averageFinalScore == null
                                ? "bg-slate/10 text-slate"
                                : row.averageFinalScore >= 75
                                ? "bg-[#e8f5ef] text-[#2d7b60]"
                                : row.averageFinalScore >= 60
                                ? "bg-[#eaf1f7] text-[#2f638c]"
                                : "bg-[#fff1dd] text-[#9b681d]"
                            )}
                          >
                            {row.averageFinalScore != null ? `${row.averageFinalScore.toFixed(1)}đ` : "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

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
