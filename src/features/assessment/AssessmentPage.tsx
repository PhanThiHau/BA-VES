import { ArrowLeft, ArrowRight, ArrowUpRight, Award, BarChart3, CheckCircle2, Download, Eye, Lightbulb, MessageCircleMore, MessageSquare, Quote, RefreshCcw, Sparkles, Target, Loader2, ClipboardCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { RouteKey } from "../../types/models";
import { useApp } from "../../contexts/AppContext";
import {
  assessmentService,
  type AIPracticeFeedbackDto,
  type FinalSubmissionReportDto,
} from "../../services/assessmentService";
import { resolveBabokAreaMeta, sortBabokAreas } from "./babokCatalog";

interface KnowledgeAreaScore {
  code: string;
  name: string;
  score: number | null;
  evidenceCount: number;
  shortDesc: string;
}

export function AssessmentPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentSessionId, currentSubmissionId } = useApp();
  const submissionId = currentSubmissionId;
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<FinalSubmissionReportDto | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIPracticeFeedbackDto | null>(null);
  const [babokAreas, setBabokAreas] = useState<KnowledgeAreaScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRequestingReview, setIsRequestingReview] = useState(false);

  const exportPdf = () => {
    const node = reportRef.current;
    if (!node) return;
    const popup = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
    if (!popup) {
      window.print();
      return;
    }
    popup.document.write(`<!doctype html><html><head><title>Báo cáo năng lực BA-VES #${submissionId ?? ""}</title>
      <style>
        body{font-family:Segoe UI,Arial,sans-serif;color:#102a43;padding:24px;line-height:1.45}
        h1{font-size:20px;margin:0 0 8px} h2{font-size:14px;margin:18px 0 8px}
        .muted{color:#667d93;font-size:12px} .box{border:1px solid #d9e4ec;border-radius:8px;padding:12px;margin:8px 0}
        ul{margin:6px 0 0 18px} strong.score{font-size:28px}
      </style></head><body>${node.innerHTML}</body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const loadAssessment = async () => {
    if (!submissionId) {
      setReport(null);
      setAiFeedback(null);
      setBabokAreas([]);
      return;
    }
    setLoading(true);
    try {
      const [repRes, fbRes, tasksRes] = await Promise.allSettled([
        assessmentService.getFinalReport(submissionId),
        assessmentService.getAiFeedback(submissionId),
        assessmentService.getBabokTasks(),
      ]);

      if (repRes.status === "fulfilled" && repRes.value) {
        setReport(repRes.value);
        if (repRes.value.aiFeedback) setAiFeedback(repRes.value.aiFeedback);
      }
      if (fbRes.status === "fulfilled" && fbRes.value) {
        setAiFeedback(fbRes.value);
      }

      // Group BABOK Tasks → 6 Knowledge Areas; điểm theo KnowledgeAreaCode của tiêu chí (không fallback overall score)
      if (tasksRes.status === "fulfilled" && tasksRes.value.length > 0) {
        const areaMap = new Map<string, { code: string; name: string }>();
        tasksRes.value.forEach((t) => {
          if (!areaMap.has(t.knowledgeAreaCode)) {
            areaMap.set(t.knowledgeAreaCode, {
              code: t.knowledgeAreaCode,
              name: t.knowledgeAreaName || t.knowledgeAreaCode,
            });
          }
        });

        const reportValue = repRes.status === "fulfilled" ? repRes.value : null;
        const currentFeedback =
          fbRes.status === "fulfilled" ? fbRes.value : reportValue?.aiFeedback ?? null;
        const expertScores = reportValue?.expertReview?.criterionScores ?? [];
        const aiScores = currentFeedback?.criterionScores ?? [];

        const computedAreas: KnowledgeAreaScore[] = Array.from(areaMap.values()).map((area) => {
          const meta = resolveBabokAreaMeta(area.code, area.name);
          const expertMatches = expertScores.filter(
            (c) => (c.knowledgeAreaCode || "").toUpperCase() === area.code.toUpperCase()
          );
          const aiMatches = aiScores.filter(
            (c) => (c.knowledgeAreaCode || "").toUpperCase() === area.code.toUpperCase()
          );
          const matches = expertMatches.length > 0 ? expertMatches : aiMatches;

          if (matches.length === 0) {
            return {
              code: area.code,
              name: meta.nameVi,
              score: null,
              evidenceCount: 0,
              shortDesc: meta.shortDesc,
            };
          }

          const totalScore = matches.reduce((acc, m) => acc + Number(m.score), 0);
          const maxScore = matches.reduce((acc, m) => acc + Number(m.maxScore), 0);
          return {
            code: area.code,
            name: meta.nameVi,
            score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : null,
            evidenceCount: matches.length,
            shortDesc: meta.shortDesc,
          };
        });
        setBabokAreas(sortBabokAreas(computedAreas));
      }
    } catch (err) {
      console.warn("Could not load assessment data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [currentSessionId, currentSubmissionId]);

  const handleReEvaluate = async () => {
    if (!submissionId) {
      alert("Chưa có bài nộp để chấm. Hãy nộp bài nghiệm thu từ Hồ sơ bàn giao trước.");
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await assessmentService.evaluateSubmission(submissionId);
      setAiFeedback(res);
      alert(`✨ AI đã chấm điểm thành công! Điểm đề xuất: ${res.suggestedScore ?? 75}/100.`);
      await loadAssessment();
    } catch (err: any) {
      alert(`Đã kích hoạt AI đánh giá: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRequestHumanReview = async () => {
    if (!submissionId) {
      alert("Chưa có bài nộp để gửi chuyên gia.");
      return;
    }
    setIsRequestingReview(true);
    try {
      await assessmentService.requestReview(
        submissionId,
        "Học viên gửi yêu cầu chuyên gia chấm điểm từ đánh giá AI và artifact đã nộp."
      );
      alert("✅ Đã gửi chuyên gia. 1 Review Credit đã được trừ. Sau khi chấm xong bạn có thể đặt tư vấn 1-on-1.");
    } catch (err: any) {
      alert(`Thông báo: ${err.message}`);
    } finally {
      setIsRequestingReview(false);
    }
  };

  const currentScore =
    report?.finalScore != null
      ? Math.round(Number(report.finalScore))
      : aiFeedback?.suggestedScore != null
        ? Math.round(Number(aiFeedback.suggestedScore))
        : null;

  return (
    <>
      <PageHeader
        eyebrow="Bước 5/5 · Đánh giá & Chấm điểm năng lực (Assessment & Debrief)"
        title="Báo cáo Đánh giá Năng lực Thực chiến"
        description="Đo lường năng lực hành vi thực tế qua biên bản phỏng vấn, quyết định xử lý tình huống và chất lượng hồ sơ bàn giao theo chuẩn BABOK® v3."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate("artifacts")}
              className="gap-1.5 border-slate/20 text-xs font-semibold text-navy hover:bg-mist/30"
            >
              <ArrowLeft size={14} /> Xem lại Hồ sơ BA
            </Button>
            <Button
              onClick={handleReEvaluate}
              disabled={isEvaluating}
              className="gap-2 bg-navy text-xs font-semibold hover:bg-navy-light text-white shadow-sm"
            >
              {isEvaluating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCcw size={15} />}
              {isEvaluating ? "Đang chấm điểm AI..." : "Chạy AI Chấm điểm"}
            </Button>
            <Button
              onClick={handleRequestHumanReview}
              disabled={isRequestingReview}
              variant="secondary"
              className="gap-1.5 border-slate/20 text-xs font-semibold text-navy hover:bg-mist/30"
            >
              {isRequestingReview ? <Loader2 size={15} className="animate-spin" /> : <ClipboardCheck size={15} />}
              Gửi Chuyên gia
            </Button>
            <Button
              onClick={() => navigate("booking")}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              <MessageSquare size={14} /> Đặt lịch Cố vấn 1-on-1
            </Button>
            <Button
              variant="secondary"
              onClick={exportPdf}
              disabled={!report && !aiFeedback}
              className="gap-2 border-slate/20 text-xs font-semibold text-navy"
            >
              <Download size={15} /> Xuất báo cáo PDF
            </Button>
            <Button
              onClick={() => navigate("progress")}
              className="gap-2 bg-brass text-navy-deep text-xs font-bold hover:bg-brass-light shadow-sm"
            >
              <BarChart3 size={15} /> Hồ sơ năng lực BABOK <ArrowRight size={14} />
            </Button>
          </div>
        }
      />

      <div ref={reportRef}>
      <h1 className="sr-only">Báo cáo đánh giá năng lực BA-VES</h1>
      <p className="sr-only muted">
        Bài nộp #{submissionId ?? "—"} · Phiên #{report?.sessionId ?? currentSessionId ?? "—"}
      </p>

      {/* BABOK Assessment Lifecycle Banner */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 shrink-0 text-blue-600" size={18} />
          <div>
            <h3 className="text-xs font-bold text-blue-900 uppercase">
              Chu trình đánh giá & Chấm điểm năng lực BABOK v3
            </h3>
            <p className="mt-1 text-xs leading-5 text-blue-800">
              • <strong>Trong tiến trình mô phỏng:</strong> AI chỉ phản biện và chấm điểm tài liệu sau khi bạn kết thúc từng <strong>Sprint</strong> tại mục <em>AI Phản biện</em> của Hồ sơ bàn giao.
              <br />
              • <strong>Sau khi hoàn tất toàn bộ phiên:</strong> Khi bạn nhấn <strong>"Nộp bài nghiệm thu (Final Submit)"</strong> tại Hồ sơ bàn giao, hệ thống sẽ tổng hợp toàn bộ quyết định, bằng chứng và tài liệu thành <strong>Báo cáo Đánh giá Năng lực Toàn diện</strong> cho cả 6 lĩnh vực tri thức BABOK v3 dưới đây.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Overall Score Badge */}
        <Card className="p-7 text-center border-slate/15">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy/10 text-navy">
            <Award size={28} />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate">Điểm năng lực tổng thể</p>
          <strong className="mt-1 block text-6xl font-bold tracking-tight text-navy">
            {currentScore != null ? currentScore : "—"}
          </strong>
          <div className="mt-2">
            {currentScore != null ? (
              <Badge tone={currentScore >= 70 ? "green" : currentScore >= 50 ? "amber" : "red"}>
                {currentScore >= 70 ? "Đạt yêu cầu năng lực" : "Cần hoàn thiện thêm"}
              </Badge>
            ) : (
              <Badge tone="gray">Chưa chấm điểm</Badge>
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate">
            {aiFeedback?.overallFeedback ||
              (currentScore != null
                ? "Kết quả đánh giá tổng hợp từ các tiêu chí thẩm định của mô phỏng."
                : "Chưa có báo cáo chấm điểm cho bài nộp này. Hãy nhấn nút 'Chạy AI Chấm điểm' để tạo bản đánh giá.")}
          </p>

          <div className="mt-6 border-t border-slate/10 pt-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate">Điểm đề xuất từ AI:</span>
              <strong className="text-navy font-mono font-bold">
                {aiFeedback?.suggestedScore != null ? `${Math.round(Number(aiFeedback.suggestedScore))}/100` : "—"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Điểm chuyên gia:</span>
              <strong className="text-navy font-mono font-bold">
                {report?.expertReview?.finalScore != null
                  ? `${Math.round(Number(report.expertReview.finalScore))}/100`
                  : "Chưa chấm"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Điểm hiển thị:</span>
              <strong className="text-navy font-mono font-bold">
                {report?.finalScore != null ? `${Math.round(Number(report.finalScore))}/100` : "—"}
              </strong>
            </div>
          </div>
        </Card>

        {/* Knowledge Areas */}
        <Card className="p-6 border-slate/15">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-navy">Vùng tri thức BABOK® v3</h2>
            {aiFeedback?.confidence != null && (
              <span className="rounded-full bg-mist/40 px-2.5 py-1 text-[11px] font-bold text-navy">
                Độ tin cậy: {Math.round(Number(aiFeedback.confidence) * 100)}%
              </span>
            )}
          </div>

          {babokAreas.length > 0 ? (
            <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {babokAreas.map((skill) => (
                <div key={skill.code}>
                  <div className="mb-2 flex justify-between gap-2 text-xs font-semibold">
                    <span className="text-navy">
                      {skill.code} — {skill.name}
                    </span>
                    <strong className="shrink-0 font-mono text-navy">
                      {skill.score != null ? `${skill.score}%` : "—"}
                    </strong>
                  </div>
                  <ProgressBar
                    value={skill.score ?? 0}
                    color={
                      skill.score == null
                        ? "#cbd5e1"
                        : skill.score >= 70
                          ? "#102a43"
                          : skill.score >= 60
                            ? "#4f779d"
                            : "#c58b52"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate">
              Đang tải danh mục vùng tri thức BABOK từ cơ sở dữ liệu...
            </div>
          )}
        </Card>
      </div>

      {/* Observed Criteria / Underlying Competencies */}
      <Card className="mt-6 p-6 border-slate/15">
        <div className="flex items-center gap-3">
          <Eye className="text-navy" size={20} />
          <div>
            <h2 className="text-base font-bold text-navy">Tiêu chí Chấm điểm & Năng lực Cốt lõi (Rubric Criteria)</h2>
            <p className="text-xs text-slate">Năng lực thể hiện qua hành vi đối thoại, tư duy và lập luận phản biện của học viên.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {aiFeedback?.criterionScores && aiFeedback.criterionScores.length > 0 ? (
            aiFeedback.criterionScores.map((crit) => {
              const percent = crit.maxScore > 0 ? Math.round((crit.score / crit.maxScore) * 100) : 0;
              return (
                <div key={crit.rubricCriterionId} className="rounded-xl border border-slate/15 bg-white p-4 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <strong className="text-xs font-bold text-navy leading-5">
                      {crit.criterionName} ({crit.criterionCode})
                    </strong>
                    <span className="font-mono text-base font-black text-navy">
                      {crit.score}/{crit.maxScore}
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={percent} />
                  </div>
                  <p className="mt-3 text-[11px] leading-4 text-slate">
                    {crit.comment || crit.evidenceSnippet || "Tiêu chí đánh giá hành vi nghiệp vụ"}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate">
              Chưa có chi tiết điểm rubric cho bài nộp này. Hãy kích hoạt &quot;Chạy AI Chấm điểm&quot; để nhận điểm theo tiêu chí.
            </div>
          )}
        </div>
      </Card>

      {/* Strengths & Improvement Opportunities */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-slate/15">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-700" size={20} />
            <h2 className="text-base font-bold text-navy">Điểm mạnh dựa trên bằng chứng</h2>
          </div>
          <div className="mt-4 space-y-3.5">
            {aiFeedback?.strengths && aiFeedback.strengths.length > 0 ? (
              aiFeedback.strengths.map((str, idx) => (
                <div key={idx} className="rounded-xl border border-emerald-400/20 bg-emerald-50/40 p-4">
                  <strong className="text-xs font-bold text-emerald-900">Điểm mạnh từ AI Assessor #{idx + 1}</strong>
                  <p className="mt-1 text-xs leading-5 text-emerald-950">{str}</p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate">
                Chưa có dữ liệu điểm mạnh từ AI Assessor.
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border-slate/15">
          <div className="flex items-center gap-3">
            <Target className="text-brass" size={20} />
            <h2 className="text-base font-bold text-navy">Cơ hội cải thiện chuyên môn</h2>
          </div>
          <div className="mt-4 space-y-3.5">
            {aiFeedback?.weaknesses && aiFeedback.weaknesses.length > 0 ? (
              aiFeedback.weaknesses.map((weak, idx) => (
                <div key={idx} className="rounded-xl border border-amber-400/20 bg-amber-50/40 p-4">
                  <strong className="text-xs font-bold text-amber-900">Lỗ hổng phân tích từ AI #{idx + 1}</strong>
                  <p className="mt-1 text-xs leading-5 text-amber-950">{weak}</p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate">
                Chưa có dữ liệu cơ hội cải thiện từ AI Assessor.
              </div>
            )}
          </div>
        </Card>
      </div>

      {(report?.sprintReviews?.length ?? 0) > 0 && (
        <Card className="mt-6 border-slate/15 p-6">
          <h2 className="text-base font-bold text-navy">Điểm sprint AI trong phiên</h2>
          <p className="mt-0.5 text-xs text-slate">Các sprint đã chốt từ luồng mô phỏng, dùng làm bằng chứng cho báo cáo tổng hợp.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {report!.sprintReviews!.map((sprint) => (
              <div key={sprint.sprintNo} className="rounded-xl border border-slate/15 p-3.5">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold text-navy">Sprint {sprint.sprintNo}</strong>
                  <Badge tone={sprint.status === "Finalized" ? "green" : "amber"}>
                    {sprint.score != null ? `${sprint.score}` : sprint.status}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-slate">{sprint.decision || "—"}</p>
                <p className="mt-2 text-xs leading-5 text-navy">{sprint.digest || "Chưa có digest."}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Debrief Discussion */}
      <Card className="mt-6 overflow-hidden border-slate/15">
        <div className="border-b border-slate/10 bg-mist/20 p-5">
          <div className="flex items-center gap-3">
            <MessageCircleMore className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Họp tổng kết: Diễn biến thực tế tại doanh nghiệp (Debrief)</h2>
              <p className="text-xs text-slate">Đối chiếu quyết định của bạn với các tín hiệu và phản hồi từ giảng viên/chuyên gia.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Nhận xét từ Chuyên gia / Giảng viên</p>
            <p className="mt-3 rounded-xl bg-mist/30 p-4 text-xs italic leading-5 text-navy">
              {report?.expertReview?.overallFeedback || "Chưa có nhận xét bằng văn bản từ giảng viên hướng dẫn."}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Ghi chú tự suy ngẫm (Self-reflection)</p>
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy"
              placeholder="Ghi lại những bài học kinh nghiệm, phương pháp bạn muốn cải thiện trong phiên tiếp theo..."
            />
            <button
              onClick={() => alert("Đã lưu ghi chú tự suy ngẫm thành công!")}
              className="mt-2 text-xs font-bold text-navy hover:underline"
            >
              Lưu ghi chú suy ngẫm
            </button>
          </div>
        </div>
      </Card>

      {/* Next Experience */}
      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between border-slate/15">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy/10 text-navy">
            <Lightbulb size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brass" />
              <h2 className="text-sm font-bold text-navy">Bước phát triển tiếp theo</h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate">
              Thực hành lại kịch bản này để thử nghiệm phương án khác, hoặc mở kịch bản tiếp theo để tiếp tục phát triển năng lực BA.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            onClick={() => navigate("simulation")}
            className="gap-2 border-slate/20 text-xs font-semibold text-navy hover:bg-offwhite"
          >
            <RefreshCcw size={15} /> Thực hành lại phiên này
          </Button>
          <Button
            onClick={() => navigate("scenarios")}
            className="gap-2 bg-brass text-navy-deep text-xs font-bold hover:bg-brass-light shadow-sm"
          >
            Kịch bản tiếp theo <ArrowRight size={14} />
          </Button>
        </div>
      </Card>
      </div>
    </>
  );
}
