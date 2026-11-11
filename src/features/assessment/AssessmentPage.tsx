import { ArrowLeft, ArrowRight, Award, BarChart3, CheckCircle2, Download, Lightbulb, MessageCircleMore, RefreshCcw, Sparkles, Target, Loader2, ClipboardCheck, PhoneCall, MessagesSquare } from "lucide-react";
import { useState, useEffect } from "react";
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
import { ConsultationModal } from "../../components/common/ConsultationModal";

export function AssessmentPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentSessionId, currentSubmissionId } = useApp();
  const submissionId = currentSubmissionId;

  const [report, setReport] = useState<FinalSubmissionReportDto | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIPracticeFeedbackDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  const loadAssessment = async () => {
    if (!submissionId) {
      setReport(null);
      setAiFeedback(null);
      return;
    }
    setLoading(true);
    try {
      const rep = await assessmentService.getFinalReport(submissionId);
      setReport(rep);
      if (rep?.aiFeedback) setAiFeedback(rep.aiFeedback);
    } catch {
      try {
        const fb = await assessmentService.getAiFeedback(submissionId);
        setAiFeedback(fb);
      } catch {
        // Chưa có kết quả đánh giá
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [currentSessionId, currentSubmissionId]);

  const handleReEvaluate = async () => {
    if (!submissionId) {
      alert("Vui lòng nộp bài ở Bước 4 (Hồ sơ BA) trước khi yêu cầu AI chấm điểm.");
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await assessmentService.evaluateSubmission(submissionId);
      setAiFeedback(res);
      alert(`✨ AI đã chấm điểm thành công! Điểm đề xuất: ${res.suggestedScore ?? "--"}/100.`);
    } catch (err: any) {
      alert(`Lỗi khi AI đánh giá: ${err.message}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleRequestHumanReview = async () => {
    if (!submissionId) {
      alert("Vui lòng nộp bài trước khi gửi yêu cầu Chuyên gia thẩm định.");
      return;
    }
    setIsRequestingReview(true);
    try {
      await assessmentService.requestReview(submissionId, "Học viên gửi yêu cầu chuyên gia chấm điểm và phản biện.");
      alert("✅ Đã gửi bài cho Giảng viên / Chuyên gia phản biện thành công!");
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

  const criteriaList =
    report?.expertReview?.criterionScores && report.expertReview.criterionScores.length > 0
      ? report.expertReview.criterionScores
      : aiFeedback?.criterionScores || [];

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
              onClick={() => setShowConsultationModal(true)}
              className="gap-1.5 bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 shadow-sm"
              title="Đặt lịch hoặc mở phòng trao đổi 1-on-1 trực tiếp với Chuyên gia"
            >
              <PhoneCall size={14} /> Trao đổi 1-on-1
            </Button>
            <Button variant="secondary" onClick={handleExportPdf} title="In hoặc lưu hồ sơ đánh giá năng lực dưới dạng file PDF" className="gap-2 border-slate/20 text-xs font-semibold text-navy hover:bg-mist/30">
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

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Overall Score Badge */}
        <Card className="p-7 text-center border-slate/15">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy/10 text-navy">
            <Award size={28} />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate">Điểm năng lực tổng thể</p>
          <strong className="mt-1 block text-6xl font-bold tracking-tight text-navy">
            {loading ? "..." : currentScore !== null ? currentScore : "--"}
          </strong>
          <div className="mt-2">
            {currentScore !== null ? (
              <Badge tone={currentScore >= 70 ? "green" : "amber"}>
                {currentScore >= 70 ? "Đạt yêu cầu doanh nghiệp" : "Cần cải thiện thêm"}
              </Badge>
            ) : (
              <Badge tone="gray">Chưa chấm điểm</Badge>
            )}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate">
            {report?.expertReview?.overallFeedback ||
              aiFeedback?.overallFeedback ||
              (submissionId
                ? "Bấm 'Chạy AI Chấm điểm' để AI Assessor phân tích và chấm điểm bài nộp của bạn."
                : "Chưa có bài nộp nào được chọn. Hãy hoàn tất soạn thảo và nộp bài ở Bước 4.")}
          </p>

          <div className="mt-6 border-t border-slate/10 pt-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate">Điểm bằng chứng AI (Rubric):</span>
              <strong className="text-navy font-mono font-bold">
                {aiFeedback?.suggestedScore != null ? `${Math.round(Number(aiFeedback.suggestedScore))}/100` : "--"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Giảng viên điều chỉnh:</span>
              <strong className="text-navy font-mono font-bold">
                {report?.finalScore != null ? `${Math.round(Number(report.finalScore))}/100` : "Chưa thẩm định"}
              </strong>
            </div>
          </div>
        </Card>

        {/* Rubric Criteria Breakdown */}
        <Card className="p-6 border-slate/15">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy">Điểm chi tiết theo Tiêu chí Rubric BABOK® v3</h2>
              <p className="mt-0.5 text-xs text-slate">Kết quả đánh giá từng tiêu chí dựa trên bằng chứng phỏng vấn và tài liệu bàn giao.</p>
            </div>
            {aiFeedback?.confidence != null && (
              <span className="rounded-full bg-mist/40 px-2.5 py-1 text-[11px] font-bold text-navy">
                Độ tin cậy: {Number(aiFeedback.confidence).toFixed(2)}
              </span>
            )}
          </div>

          {criteriaList.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate/20 p-8 text-center text-xs text-slate">
              Chưa có dữ liệu điểm chi tiết theo tiêu chí. Vui lòng nộp bài và bấm <strong>&quot;Chạy AI Chấm điểm&quot;</strong>.
            </div>
          ) : (
            <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
              {criteriaList.map((crit) => {
                const max = crit.maxScore || 100;
                const pct = Math.round((Number(crit.score) / max) * 100);
                return (
                  <div key={crit.rubricCriterionId}>
                    <div className="mb-2 flex justify-between text-xs font-semibold">
                      <span className="text-navy">{crit.criterionName || crit.criterionCode}</span>
                      <strong className="font-mono text-navy">{Math.round(Number(crit.score))}/{max}</strong>
                    </div>
                    <ProgressBar
                      value={pct}
                      color={pct >= 70 ? "#102a43" : pct >= 60 ? "#4f779d" : "#c58b52"}
                    />
                    {crit.comment && (
                      <p className="mt-1.5 text-[11px] text-slate leading-4">{crit.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

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
              <div className="rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
                Chưa có nhận xét điểm mạnh từ hệ thống chấm điểm.
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
              <div className="rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
                Chưa có ghi nhận lỗ hổng chuyên môn từ hệ thống chấm điểm.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Debrief Discussion */}
      <Card className="mt-6 overflow-hidden border-slate/15">
        <div className="border-b border-slate/10 bg-mist/20 p-5">
          <div className="flex items-center gap-3">
            <MessageCircleMore className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Họp tổng kết: Diễn biến thực tế tại doanh nghiệp (Debrief)</h2>
              <p className="text-xs text-slate">Đối chiếu quyết định của bạn với các tín hiệu bị bỏ lỡ và phản hồi từ ban lãnh đạo.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Tín hiệu quan trọng bị bỏ sót</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate">
              <li>• Kế toán đã nhắc nhở về kỳ kế toán tháng có thể bị khóa sổ.</li>
              <li>• Máy quét cũ hoàn toàn không hiển thị danh sách đơn chờ đồng bộ.</li>
              <li>• Chiến dịch khuyến mãi toàn chuỗi MILK-01 bắt đầu sau đúng 7 ngày.</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Phản hồi của Giám đốc điều hành</p>
            <p className="mt-3 rounded-xl bg-mist/30 p-4 text-xs italic leading-5 text-navy">
              “Giải pháp ưu tiên chuyển kho nội bộ là đúng hướng, nhưng tôi cần bạn chỉ rõ ai có thẩm quyền ghi đè quyết định và sự ảnh hưởng đến chỉ tiêu chi phí lưu kho.” — Giám đốc Chuỗi cung ứng
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Ghi chú tự suy ngẫm (Self-reflection)</p>
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy"
              defaultValue="Nếu thực hiện lại phiên này, tôi sẽ xác nhận ngay lịch trình khuyến mãi và quy tắc khóa sổ kế toán trước khi chốt phương án..."
            />
            <button className="mt-2 text-xs font-bold text-navy hover:underline">Lưu ghi chú suy ngẫm</button>
          </div>
        </div>
      </Card>

      {/* 1-on-1 Consultation CTA Banner */}
      <Card className="mt-6 p-6 border-slate/15 bg-gradient-to-r from-navy/5 via-navy/10 to-brass/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy text-brass shadow-sm">
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-navy text-sm">Cần Chuyên gia BA phản biện & phân tích điểm yếu 1-on-1?</h3>
              <Badge tone="green">Được hỗ trợ trong gói</Badge>
            </div>
            <p className="text-xs text-slate mt-1 leading-relaxed">
              Bạn có thể sử dụng quyền lợi Consultation Credit để đặt lịch thảo luận trực tiếp với Giảng viên / Chuyên gia phản biện bài nộp, làm rõ các lỗi logic và chuẩn hóa tài liệu nghiệp vụ.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowConsultationModal(true)}
          className="gap-2 bg-navy text-white text-xs font-bold hover:bg-navy-light shrink-0 px-4 py-2.5 shadow-sm"
        >
          <MessagesSquare size={15} /> Mở phòng trao đổi 1-on-1
        </Button>
      </Card>

      {/* Next Experience */}
      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between border-slate/15">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
            <Lightbulb size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brass" />
              <h2 className="text-sm font-bold text-navy">Bước phát triển tiếp theo</h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate">
              Thực hành lại sự kiện nhà cung ứng trễ hàng để thử nghiệm phương án khác, hoặc mở kịch bản &quot;Kiểm soát số lô & Thu hồi sản phẩm lỗi&quot; để rèn luyện kỹ năng truy vết sâu hơn.
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

      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        submissionId={submissionId ?? 1}
        reviewRequestId={report?.expertReview?.id || 1}
      />
    </>
  );
}
