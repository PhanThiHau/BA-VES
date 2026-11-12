import { useState, useEffect } from "react";
import {
  CheckCircle2,
  FileText,
  RotateCcw,
  Save,
  Search,
  Quote,
  X,
  Eye,
  MessageSquare,
  PhoneCall,
  Loader2,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { classNames } from "../../../utils/format";
import type { ReviewItem, CriterionReview } from "../instructorData";
import { assessmentService } from "../../../services/assessmentService";
import { ReviewCaseDossierModal } from "./ReviewCaseDossierModal";
import { ConsultationModal } from "../../../components/common/ConsultationModal";

interface ReviewModerationTabProps {
  reviewItems: ReviewItem[];
  onCalibrateScore: (
    itemId: string,
    humanScore: number,
    notes: string,
    updatedCriteria: CriterionReview[]
  ) => void;
  onRequestRevision: (itemId: string, reason: string) => void;
}

export function ReviewModerationTab({
  onCalibrateScore,
  onRequestRevision,
}: ReviewModerationTabProps) {
  const [localItems, setLocalItems] = useState<ReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "calibrated">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedItem =
    localItems.find((i) => i.id === selectedReviewId) || localItems[0];

  const [moderatorNote, setModeratorNote] = useState("");
  const [criteriaScores, setCriteriaScores] = useState<CriterionReview[]>([]);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoadingReviews(true);
    assessmentService
      .getReviewRequests()
      .then((reqs) => {
        if (!isMounted) return;
        const mapped: ReviewItem[] = (reqs || []).map((r) => {
          const isCompleted = String(r.status).toLowerCase() === "completed";
          return {
            id: `REV-${r.id}`,
            learner: `Học viên #${r.learnerId}`,
            cohort: `Submission #${r.submissionId}`,
            scenarioId: `SUB-${r.submissionId}`,
            scenarioTitle: `Yêu cầu thẩm định bài nộp #${r.submissionId}`,
            stage: isCompleted ? "Đã duyệt & chốt điểm" : "Chờ giảng viên thẩm định",
            submittedAt: r.requestedAt ? new Date(r.requestedAt).toLocaleString("vi-VN") : "Vừa xong",
            due: "Theo lịch thẩm định",
            aiScore: null,
            aiConfidence: null,
            humanScore: null,
            status: isCompleted ? "calibrated" : "pending",
            tone: isCompleted ? "green" : "amber",
            issueSummary: r.requestNote || "Học viên gửi yêu cầu chuyên gia thẩm định và hiệu chỉnh điểm AI.",
            deliverablesSubmitted: [`Submission #${r.submissionId}`],
            moderatorNotes: "",
            criteria: [],
          };
        });
        setLocalItems(mapped);
        if (mapped.length > 0) {
          handleSelectItem(mapped[0]);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch review requests from backend:", err);
        if (isMounted) setLocalItems([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectItem = async (item: ReviewItem) => {
    setSelectedReviewId(item.id);
    setModeratorNote(item.moderatorNotes || "");
    setCriteriaScores(item.criteria || []);

    try {
      const numericId = parseInt(item.id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId)) {
        const dossier = await assessmentService.getReviewCaseDossier(numericId);
        if (dossier) {
          const aiEval = dossier.aiFeedback;
          const criteria: CriterionReview[] = (aiEval?.criterionScores || []).map((cs) => {
            const numScore = Math.round(Number(cs.score || 0));
            return {
              id: `crit-${cs.rubricCriterionId}`,
              babokArea: cs.criterionCode || "BABOK® v3",
              name: cs.criterionName || cs.criterionCode,
              weight: Math.round(100 / Math.max(1, (aiEval?.criterionScores || []).length)),
              aiScore: numScore,
              humanScore: numScore,
              aiEvidenceQuote: cs.evidenceSnippet || cs.comment || "Không có trích dẫn tự động.",
              status: numScore >= 70 ? "Đạt" : "Cần xem xét",
            };
          });
          setCriteriaScores(criteria);
          if (dossier.requestNote && !moderatorNote) {
            setModeratorNote(aiEval?.overallFeedback || "");
          }
          setLocalItems((prev) =>
            prev.map((x) =>
              x.id === item.id
                ? {
                    ...x,
                    aiScore: aiEval?.suggestedScore ? Math.round(Number(aiEval.suggestedScore)) : x.aiScore,
                    aiConfidence: aiEval?.confidence ? Math.round(Number(aiEval.confidence) * 100) : x.aiConfidence,
                    criteria,
                  }
                : x
            )
          );
        }
      }
    } catch (e) {
      console.warn("Could not load case dossier details:", e);
    }
  };

  const calculatedHumanScore =
    criteriaScores.length > 0
      ? Math.round(
          criteriaScores.reduce((acc, c) => acc + (c.humanScore * c.weight) / 100, 0)
        )
      : selectedItem?.aiScore || 0;

  const handleCriterionScoreChange = (id: string, newScore: number) => {
    setCriteriaScores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, humanScore: Math.min(100, Math.max(0, newScore)) } : c))
    );
  };

  const handleSaveCalibration = async () => {
    if (!selectedItem) return;
    try {
      const numericId = parseInt(selectedItem.id.replace(/\D/g, ""), 10) || 1;
      const reviewRes = await assessmentService.completeReview(numericId, {
        overallFeedback: moderatorNote || "Chuyên gia đã chốt điểm và hoàn tất thẩm định",
        criterionScores: criteriaScores.map((c) => ({
          rubricCriterionId: parseInt(c.id.replace(/\D/g, ""), 10) || 1,
          score: c.humanScore,
          comment: c.aiEvidenceQuote,
        })),
      });
      onCalibrateScore(selectedItem.id, reviewRes?.finalScore ?? calculatedHumanScore, moderatorNote, criteriaScores);
      setLocalItems((prev) =>
        prev.map((x) =>
          x.id === selectedItem.id
            ? { ...x, status: "calibrated", humanScore: reviewRes?.finalScore ?? calculatedHumanScore }
            : x
        )
      );
      setToastMessage(`Đã chốt điểm ${reviewRes?.finalScore ?? calculatedHumanScore}/100 cho ${selectedItem.learner}!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      alert("Không thể lưu kết quả thẩm định lên máy chủ: " + (e?.message || "Lỗi kết nối."));
    }
  };

  const handleConfirmRevision = () => {
    if (!selectedItem || !revisionReason.trim()) return;
    onRequestRevision(selectedItem.id, revisionReason);
    setShowRevisionModal(false);
    setRevisionReason("");
    setToastMessage(`Đã gửi yêu cầu sửa lại hồ sơ cho học viên ${selectedItem.learner}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredItems = localItems.filter((i) => {
    const matchesQuery =
      i.learner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.cohort.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || i.status === filterStatus;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Cửa sổ Hồ sơ kiểm thử nghiệp vụ (Case Dossier) */}
      <ReviewCaseDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        reviewItem={selectedItem}
      />

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#132d49] px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in border border-[#2f638c]">
          <CheckCircle2 size={16} className="text-[#32b583]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bố Cục Hai Cột: Cột Trái Danh Sách Bài - Cột Phải Bảng Chấm */}
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        {/* Cột Trái: Danh Sách Bài Nộp */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-[#d9e4ec]">
            <div className="border-b border-[#e2e9ef] p-4 bg-[#f8fafc]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#132d49]">
                    Hàng Đợi Chấm Bài ({filteredItems.length})
                  </h2>
                  <p className="text-[11px] text-[#667d93]">
                    Bài nộp có cờ vàng/đỏ là bài AI chấm độ tin cậy chưa cao.
                  </p>
                </div>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eaf1f7] font-mono text-xs font-bold text-[#2f638c]">
                  {localItems.filter((r) => r.status === "pending").length}
                </span>
              </div>

              {/* Tìm Kiếm & Bộ Lọc Nhanh */}
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-[#d9e4ec] bg-white px-3 py-1.5 text-[#667d93]">
                  <Search size={15} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên học viên, lớp..."
                    className="w-full bg-transparent text-xs text-[#132d49] outline-none"
                  />
                </div>

                <div className="flex gap-1">
                  {(["all", "pending", "calibrated"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      className={classNames(
                        "flex-1 rounded-lg py-1 text-[11px] font-bold transition-all",
                        filterStatus === st
                          ? "bg-[#132d49] text-white"
                          : "bg-[#f0f4f8] text-[#667d93] hover:bg-[#e4ebf2]"
                      )}
                    >
                      {st === "all" ? "Tất cả" : st === "pending" ? "Chờ duyệt" : "Đã duyệt"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Danh Sách Thẻ Bài */}
            <div className="divide-y divide-[#e6edf2] max-h-[700px] overflow-y-auto">
              {isLoadingReviews ? (
                <div className="p-8 text-center text-xs text-[#667d93]">
                  <Loader2 size={20} className="mx-auto mb-2 animate-spin text-[#2f638c]" />
                  Đang tải hàng đợi bài nộp từ Backend API...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#667d93]">
                  Chưa có yêu cầu chấm bài nào trong hàng đợi.
                </div>
              ) : (
                filteredItems.map((item) => {
                const isSelected = item.id === selectedReviewId;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={classNames(
                      "w-full p-4 text-left transition-all",
                      isSelected ? "bg-[#eaf2f8] border-l-4 border-l-[#2f638c]" : "hover:bg-[#f8fafc]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-xs font-bold text-[#132d49]">
                          {item.learner}
                        </strong>
                        <p className="text-[10px] text-[#667d93]">
                          {item.cohort}
                        </p>
                      </div>
                      <Badge tone={item.status === "calibrated" ? "green" : item.tone}>
                        {item.status === "calibrated" ? "Đã duyệt xong" : item.due}
                      </Badge>
                    </div>

                    <p className="mt-2 text-xs line-clamp-2 text-[#526b81]">{item.issueSummary}</p>

                    <div className="mt-3 flex items-center justify-between border-t border-[#dfe8ee] pt-2 text-[11px]">
                      <span className="font-mono text-[#667d93]">
                        AI chấm: <strong className="text-[#132d49]">{item.aiScore != null ? `${item.aiScore}/100` : "—"}</strong>
                      </span>
                      {item.humanScore != null ? (
                        <span className="font-mono font-bold text-[#2d7b60]">
                          Thầy cô chốt: {item.humanScore}đ
                        </span>
                      ) : item.status === "calibrated" ? (
                        <span className="font-mono font-bold text-[#2d7b60]">Đã chốt điểm</span>
                      ) : (
                        <span className="text-[#9b681d] font-semibold text-[10px]">Chưa duyệt điểm</span>
                      )}
                    </div>
                  </button>
                );
              }))}
            </div>
          </Card>
        </div>

        {/* Cột Phải: Bảng Chấm Chi Tiết & Hiệu Chỉnh Điểm */}
        {selectedItem ? (
          <div className="space-y-6">
            <Card className="overflow-hidden border-[#d9e4ec]">
              <div className="border-b border-[#e2e9ef] bg-[#f8fafc] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                        Mã bài: {selectedItem.id}
                      </span>
                      <span className="text-xs text-[#667d93]">{selectedItem.cohort}</span>
                      <Badge tone={selectedItem.status === "calibrated" ? "green" : selectedItem.tone}>
                        {selectedItem.status === "calibrated" ? "Đã duyệt & chốt điểm" : "Đang chờ duyệt"}
                      </Badge>
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-[#132d49]">{selectedItem.learner}</h2>
                    <p className="mt-1 text-xs text-[#667d93]">
                      Đề bài: {selectedItem.scenarioTitle}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowDossierModal(true)}
                      className="gap-1.5 text-xs text-[#2f638c] border-[#2f638c]/30 hover:bg-[#eaf1f7]"
                    >
                      <Eye size={14} /> Hồ sơ chứng cứ (Case Dossier)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowConsultationModal(true)}
                      className="gap-1.5 text-xs text-navy border-navy/30 hover:bg-navy/5 font-semibold"
                    >
                      <MessageSquare size={14} /> Trao đổi 1-on-1
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRevisionModal(true)}
                      className="gap-1.5 text-xs text-[#a03d3d] border-[#f0c4c4] hover:bg-[#fff5f5]"
                    >
                      <RotateCcw size={14} /> Yêu cầu làm lại
                    </Button>
                    <Button size="sm" onClick={handleSaveCalibration} className="gap-1.5 text-xs">
                      <CheckCircle2 size={14} /> Chốt & Ban Hành Điểm Này
                    </Button>
                  </div>
                </div>

                {/* 3 Thẻ So Sánh Điểm Số Song Song */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-[#667d93] uppercase">
                      1. Điểm AI Chấm Tự Động
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <strong className="font-mono text-3xl font-extrabold text-[#132d49]">
                        {selectedItem.aiScore != null ? selectedItem.aiScore : "—"}
                      </strong>
                      <span className="text-xs text-[#667d93]">/100</span>
                      {selectedItem.aiConfidence != null && (
                        <span className="text-xs font-semibold text-[#8b6a35]">
                          ({selectedItem.aiConfidence}% tin cậy)
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#8291a1]">AI đối chiếu từ bài nộp và câu hỏi</p>
                  </div>

                  <div className="rounded-xl border border-[#2f638c]/30 bg-[#f4f9fd] p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-[#2f638c] uppercase">
                      2. Điểm Thầy Cô Hiệu Chỉnh
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <strong className="font-mono text-3xl font-extrabold text-[#2f638c]">
                        {calculatedHumanScore}
                      </strong>
                      <span className="text-xs text-[#2f638c]">/100</span>
                      {selectedItem.aiScore != null && calculatedHumanScore !== selectedItem.aiScore && (
                        <span
                          className={classNames(
                            "text-xs font-bold",
                            calculatedHumanScore > selectedItem.aiScore
                              ? "text-[#2d7b60]"
                              : "text-[#a03d3d]"
                          )}
                        >
                          {calculatedHumanScore > selectedItem.aiScore
                            ? `+${calculatedHumanScore - selectedItem.aiScore}`
                            : `${calculatedHumanScore - selectedItem.aiScore}`}
                          đ
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#526b81]">
                      Điểm chính thức học viên sẽ nhận
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs">
                    <span className="text-[11px] font-bold text-[#667d93] uppercase">
                      3. Các Tài Liệu Học Viên Đã Nộp
                    </span>
                    <strong className="font-mono text-3xl font-extrabold text-[#132d49] block mt-1">
                      {selectedItem.deliverablesSubmitted.length} file
                    </strong>
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#2f638c]">
                      {selectedItem.deliverablesSubmitted.map((file) => (
                        <span key={file} className="bg-[#eaf1f7] px-1.5 py-0.5 rounded font-medium">
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng Chi Tiết 5 Tiêu Chí Đánh Giá Thuần Việt */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#132d49]">
                    Chi tiết 5 Tiêu chuẩn Đánh giá Kỹ năng
                  </h3>
                  <p className="text-xs text-[#667d93]">
                    Thầy cô có thể gõ số điểm muốn thay đổi vào ô bên phải. Hệ thống sẽ tự động tính lại tổng điểm trung bình.
                  </p>
                </div>

                <div className="space-y-4">
                  {criteriaScores.map((crit) => (
                    <div
                      key={crit.id}
                      className="rounded-2xl border border-[#d9e4ec] bg-white p-5 shadow-xs"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#f0f4f8] px-2 py-0.5 text-[10px] font-bold text-[#526b83]">
                              {crit.babokArea}
                            </span>
                            <span className="text-[11px] font-bold text-[#667d93]">
                              Trọng số: {crit.weight}%
                            </span>
                          </div>
                          <h4 className="mt-1 text-xs font-bold text-[#132d49]">{crit.name}</h4>
                        </div>

                        {/* Đối Chiếu 2 Cột Điểm */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-[#667d93]">AI chấm</span>
                            <div className="font-mono text-xs font-bold text-[#132d49]">
                              {crit.aiScore}/100
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#2f638c]">Thầy cô sửa:</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={crit.humanScore}
                              onChange={(e) =>
                                handleCriterionScoreChange(crit.id, parseInt(e.target.value) || 0)
                              }
                              className="w-16 rounded-xl border border-[#2f638c] px-2 py-1 text-center font-mono text-xs font-bold text-[#2f638c] outline-none"
                            />
                            <span className="text-xs font-bold text-[#2f638c]">đ</span>
                          </div>
                        </div>
                      </div>

                      {/* Trích Dẫn Chứng Cứ AI Đã Tìm Thấy */}
                      <div className="mt-3 rounded-xl bg-[#f8fafc] p-3 text-xs border border-[#edf2f6]">
                        <span className="font-bold text-[#667d93] flex items-center gap-1 text-[11px]">
                          <Quote size={12} className="text-[#2f638c]" /> Bằng chứng thực tế trong bài làm:
                        </span>
                        <p className="mt-1 text-[#526b81] italic">&quot;{crit.aiEvidenceQuote}&quot;</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Khung Nhập Lời Nhận Xét Của Thầy Cô */}
                <div className="rounded-2xl border border-[#d9e4ec] bg-[#fbfcfd] p-5">
                  <div className="flex items-center gap-2 text-[#2f638c]">
                    <FileText size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
                      Lời Nhận Xét & Dặn Dò Của Thầy Cô Dành Cho Học Viên
                    </h4>
                  </div>
                  <p className="mt-1 text-xs text-[#667d93]">
                    Học viên sẽ đọc được lời dặn này khi mở xem bảng điểm của mình.
                  </p>
                  <textarea
                    rows={4}
                    value={moderatorNote}
                    onChange={(e) => setModeratorNote(e.target.value)}
                    placeholder="Ghi nhận điểm tốt của bạn trong buổi phỏng vấn, nhắc nhở những chỗ còn thiếu trong tài liệu nộp..."
                    className="mt-3 w-full rounded-xl border border-[#d9e4ec] bg-white p-3 text-xs text-[#132d49] leading-5 outline-none focus:border-[#2f638c]"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={handleSaveCalibration} className="gap-1.5 text-xs">
                      <Save size={14} /> Lưu Lời Nhận Xét & Chốt Điểm
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#d9e4ec] bg-white text-xs text-[#667d93]">
            Bấm chọn một bạn học viên từ danh sách bên trái để bắt đầu chấm bài.
          </div>
        )}
      </div>

      {/* Cửa Sổ Bắt Học Viên Làm Lại (Request Revision) */}
      {showRevisionModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div className="flex items-center gap-2 text-[#a03d3d]">
                <RotateCcw size={18} />
                <h3 className="text-sm font-bold text-[#132d49]">Yêu Cầu Học Viên Bổ Sung / Sửa Lại</h3>
              </div>
              <button
                onClick={() => setShowRevisionModal(false)}
                className="text-[#667d93] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#667d93]">
                Học viên <strong className="text-[#132d49]">{selectedItem.learner}</strong> sẽ nhận
                được thông báo và có thể nộp lại bài tập mới trước khi thầy cô chấm điểm chính thức.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Lý do yêu cầu làm lại (chỉ rõ chỗ cần sửa):
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="VD: Em quên chưa bổ sung sơ đồ quy trình xử lý hàng trả; tài liệu BRD chưa cập nhật phương án khi nhà cung ứng trễ hàng..."
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                >
                  Hủy
                </Button>
                <Button size="sm" onClick={handleConfirmRevision} className="gap-1.5 bg-[#a03d3d] hover:bg-[#883232]">
                  Gửi Yêu Cầu Sửa Bài
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        reviewRequestId={parseInt(selectedItem?.id.replace(/\D/g, ""), 10) || 1}
        isExpertMode={true}
      />
    </div>
  );
}
