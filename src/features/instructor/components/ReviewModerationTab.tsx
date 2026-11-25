import { useState } from "react";
import {
  CheckCircle2,
  RotateCcw,
  Search,
  X,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { classNames } from "../../../utils/format";
import type { ReviewItem, CriterionReview } from "../instructorData";
import { assessmentService } from "../../../services/assessmentService";
import { ReviewCaseDossierModal } from "./ReviewCaseDossierModal";

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

function statusLabel(status: ReviewItem["status"]) {
  if (status === "calibrated") return "Đã chốt";
  if (status === "revision_requested") return "Yêu cầu làm lại";
  return "Chờ chấm";
}

function dossierInitialStatus(item: ReviewItem | undefined) {
  if (!item) return "Pending";
  if (item.status === "calibrated") return "Completed";
  if (item.status === "revision_requested") return "RevisionRequested";
  if (item.due === "Đang chấm") return "Accepted";
  return "Pending";
}

export function ReviewModerationTab({
  reviewItems,
  onCalibrateScore,
  onRequestRevision,
}: ReviewModerationTabProps) {
  const [selectedReviewId, setSelectedReviewId] = useState<string>(reviewItems[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "calibrated" | "revision_requested">(
    "all"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionBusy, setRevisionBusy] = useState(false);
  const [revisionError, setRevisionError] = useState<string | null>(null);

  const selectedItem =
    reviewItems.find((i) => i.id === selectedReviewId) || reviewItems[0];

  const handleSelectItem = (item: ReviewItem) => {
    setSelectedReviewId(item.id);
  };

  const handleConfirmRevision = async () => {
    if (!selectedItem || revisionReason.trim().length < 10) {
      setRevisionError("Lý do làm lại cần ít nhất 10 ký tự.");
      return;
    }

    const numericId = parseInt(selectedItem.id.replace(/\D/g, ""), 10);
    if (!numericId) {
      setRevisionError("Mã yêu cầu chấm không hợp lệ.");
      return;
    }

    setRevisionBusy(true);
    setRevisionError(null);
    try {
      await assessmentService.requestRevision(numericId, revisionReason.trim());
      onRequestRevision(selectedItem.id, revisionReason.trim());
      setShowRevisionModal(false);
      setRevisionReason("");
      setToastMessage(`Đã gửi yêu cầu làm lại cho ${selectedItem.learner}.`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setRevisionError(err instanceof Error ? err.message : "Không gửi được yêu cầu làm lại.");
    } finally {
      setRevisionBusy(false);
    }
  };

  const filteredItems = reviewItems.filter((i) => {
    const matchesQuery =
      i.learner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.cohort.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || i.status === filterStatus;
    return matchesQuery && matchesFilter;
  });

  const canAct =
    selectedItem &&
    selectedItem.status !== "calibrated" &&
    selectedItem.status !== "revision_requested";

  return (
    <div className="space-y-6">
      <ReviewCaseDossierModal
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
        reviewRequestId={selectedItem ? parseInt(selectedItem.id.replace(/\D/g, ""), 10) || null : null}
        initialStatus={dossierInitialStatus(selectedItem)}
        onCompleted={() => {
          if (!selectedItem) return;
          onCalibrateScore(selectedItem.id, selectedItem.humanScore ?? 0, "Đã chốt điểm chuyên gia", []);
          setToastMessage(`Đã chốt điểm cho ${selectedItem.learner}.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
        onRevisionRequested={(reason) => {
          if (!selectedItem) return;
          onRequestRevision(selectedItem.id, reason);
          setToastMessage(`Đã gửi yêu cầu làm lại cho ${selectedItem.learner}.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#2f638c] bg-[#132d49] px-4 py-3 text-xs font-bold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-[#32b583]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Card className="reveal-up overflow-hidden border-amber-200/80 shadow-[0_8px_24px_rgba(146,64,14,0.06)]">
          <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-navy">Hàng đợi ({filteredItems.length})</h2>
                <p className="text-[11px] text-amber-900/70">Chấm qua hồ sơ chứng cứ + rubric thật.</p>
              </div>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 font-mono text-xs font-bold text-amber-900">
                {reviewItems.filter((r) => r.status === "pending").length}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-slate">
                <Search size={15} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học viên, mã yêu cầu..."
                  className="w-full bg-transparent text-xs text-navy outline-none"
                />
              </div>

              <div className="flex gap-1">
                {(
                  [
                    ["all", "Tất cả"],
                    ["pending", "Chờ"],
                    ["calibrated", "Đã chốt"],
                    ["revision_requested", "Làm lại"],
                  ] as const
                ).map(([st, label]) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={classNames(
                      "flex-1 rounded-lg py-1 text-[11px] font-bold transition-all",
                      filterStatus === st
                        ? "bg-amber-800 text-white"
                        : "bg-amber-50 text-amber-900/70 hover:bg-amber-100"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-[700px] divide-y divide-amber-100/80 overflow-y-auto">
            {filteredItems.map((item) => {
              const isSelected = item.id === selectedReviewId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={classNames(
                    "instructor-queue-row w-full p-4 text-left",
                    isSelected ? "border-l-4 border-l-amber-500 bg-amber-50/70" : "hover:bg-amber-50/40"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-xs font-bold text-navy">{item.learner}</strong>
                      <p className="text-[10px] text-slate">{item.cohort}</p>
                    </div>
                    <Badge
                      tone={
                        item.status === "calibrated"
                          ? "green"
                          : item.status === "revision_requested"
                            ? "red"
                            : item.tone
                      }
                    >
                      {statusLabel(item.status)}
                    </Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate">{item.issueSummary}</p>
                  <div className="mt-3 border-t border-amber-100 pt-2 text-[11px] text-slate">
                    {item.submittedAt}
                  </div>
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="p-6 text-center text-xs text-slate">Không có yêu cầu nào khớp bộ lọc.</div>
            )}
          </div>
        </Card>

        {selectedItem ? (
          <Card className="reveal-up reveal-delay-1 overflow-hidden border-amber-200/80 shadow-[0_8px_24px_rgba(146,64,14,0.06)]">
            <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-xs font-bold text-amber-900">
                      {selectedItem.id}
                    </span>
                    <Badge
                      tone={
                        selectedItem.status === "calibrated"
                          ? "green"
                          : selectedItem.status === "revision_requested"
                            ? "red"
                            : selectedItem.tone
                      }
                    >
                      {statusLabel(selectedItem.status)}
                    </Badge>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-navy">{selectedItem.learner}</h2>
                  <p className="mt-1 text-xs text-slate">{selectedItem.cohort}</p>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-slate">{selectedItem.issueSummary}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setShowDossierModal(true)}
                    className="gap-1.5 bg-amber-700 text-xs font-bold text-white hover:bg-amber-800"
                  >
                    <Eye size={14} /> {canAct ? "Mở hồ sơ & chấm" : "Xem hồ sơ"}
                  </Button>
                  {canAct && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setRevisionError(null);
                        setShowRevisionModal(true);
                      }}
                      className="gap-1.5 border-[#f0c4c4] text-xs text-[#a03d3d] hover:bg-[#fff5f5]"
                    >
                      <RotateCcw size={14} /> Yêu cầu làm lại
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-xs leading-5 text-teal-950">
                Chấm điểm chính thức dùng <strong>hồ sơ chứng cứ</strong> (artifact, kế hoạch, AI feedback,
                rubric thật). Không dùng điểm tạm từ tiêu chí giả lập.
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                  <span className="text-[10px] font-bold uppercase text-slate">Trạng thái</span>
                  <strong className="mt-1 block text-sm font-bold text-navy">{statusLabel(selectedItem.status)}</strong>
                </div>
                <div className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                  <span className="text-[10px] font-bold uppercase text-slate">Nộp lúc</span>
                  <strong className="mt-1 block text-sm font-bold text-navy">{selectedItem.submittedAt}</strong>
                </div>
                <div className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                  <span className="text-[10px] font-bold uppercase text-slate">Điểm chốt</span>
                  <strong className="mt-1 block text-sm font-bold text-emerald-700">
                    {selectedItem.humanScore != null ? `${selectedItem.humanScore}/100` : "Chưa chốt"}
                  </strong>
                </div>
              </div>

              {selectedItem.moderatorNotes && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-950">
                  <span className="font-bold">Ghi chú giảng viên: </span>
                  {selectedItem.moderatorNotes}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#d9e4ec] bg-white text-xs text-[#667d93]">
            Chọn một yêu cầu bên trái để bắt đầu.
          </div>
        )}
      </div>

      {showRevisionModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#d9e4ec] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div className="flex items-center gap-2 text-[#a03d3d]">
                <RotateCcw size={18} />
                <h3 className="text-sm font-bold text-[#132d49]">Yêu cầu làm lại</h3>
              </div>
              <button onClick={() => setShowRevisionModal(false)} className="text-[#667d93] hover:text-[#132d49]">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#667d93]">
                Học viên <strong className="text-[#132d49]">{selectedItem.learner}</strong> sẽ nhận lý do và có thể
                nộp lại / tạo yêu cầu chấm mới.
              </p>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#132d49]">Lý do (tối thiểu 10 ký tự)</label>
                <textarea
                  required
                  rows={4}
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  placeholder="Chỉ rõ phần artifact / phân tích học viên cần sửa..."
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              {revisionError && (
                <p className="flex items-center gap-1 text-xs font-semibold text-rose-700">
                  <AlertCircle size={13} /> {revisionError}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-[#e2e9ef] pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setShowRevisionModal(false)}>
                  Hủy
                </Button>
                <Button
                  size="sm"
                  disabled={revisionBusy}
                  onClick={() => void handleConfirmRevision()}
                  className="gap-1.5 bg-[#a03d3d] hover:bg-[#883232]"
                >
                  {revisionBusy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  Gửi yêu cầu
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
