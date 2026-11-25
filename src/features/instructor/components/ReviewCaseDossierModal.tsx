import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  FileText,
  ListChecks,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { classNames } from "../../../utils/format";
import {
  assessmentService,
  type ReviewCaseDossierDto,
} from "../../../services/assessmentService";

type DossierTab = "artifact" | "plan" | "analysis" | "ai" | "sprints" | "grade";

interface ReviewCaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewRequestId: number | null;
  initialStatus?: string | null;
  onCompleted?: () => void;
  onRevisionRequested?: (reason: string) => void;
}

export function ReviewCaseDossierModal({
  isOpen,
  onClose,
  reviewRequestId,
  initialStatus,
  onCompleted,
  onRevisionRequested,
}: ReviewCaseDossierModalProps) {
  const [dossier, setDossier] = useState<ReviewCaseDossierDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<DossierTab>("ai");
  const [errorNote, setErrorNote] = useState<string | null>(null);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [scores, setScores] = useState<Record<number, { score: string; comment: string }>>({});
  const [showRevision, setShowRevision] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");

  const canGrade = useMemo(() => {
    const status = (dossier?.status || initialStatus || "").toLowerCase();
    return (
      (status.includes("accepted") || status.includes("pending")) &&
      !status.includes("revision") &&
      !status.includes("completed") &&
      !status.includes("cancelled")
    );
  }, [dossier?.status, initialStatus]);

  const loadDossier = async (id: number) => {
    setLoading(true);
    setErrorNote(null);
    try {
      const status = (initialStatus || "").toLowerCase();
      if (status.includes("pending")) {
        await assessmentService.acceptReviewRequest(id);
      }
      const data = await assessmentService.getReviewCaseDossier(id);
      setDossier(data);

      const nextScores: Record<number, { score: string; comment: string }> = {};
      for (const criterion of data.rubricCriteria || []) {
        const aiScore = data.aiFeedback?.criterionScores?.find(
          (item) => item.rubricCriterionId === criterion.id || item.criterionCode === criterion.code
        );
        nextScores[criterion.id] = {
          score: aiScore?.score != null ? String(aiScore.score) : "",
          comment: aiScore?.comment || "",
        };
      }
      setScores(nextScores);

      const sprintHint =
        data.sprintReviews?.filter((sprint) => sprint.status === "Finalized").length > 0
          ? `Đã xem ${data.sprintReviews.filter((sprint) => sprint.status === "Finalized").length} sprint AI đã chốt. `
          : "";
      const aiHint =
        data.aiFeedback?.suggestedScore != null
          ? `AI đề xuất ${data.aiFeedback.suggestedScore}/100. `
          : "";
      setOverallFeedback(
        `${aiHint}${sprintHint}Chuyên gia xác nhận điểm cuối sau khi đối chiếu artifact và bằng chứng AI.`
      );
      setActiveTab(data.aiFeedback || (data.sprintReviews?.length ?? 0) > 0 ? "ai" : "artifact");
    } catch (err) {
      setErrorNote(err instanceof Error ? err.message : "Không tải được hồ sơ thẩm định.");
      setDossier(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !reviewRequestId) return;
    void loadDossier(reviewRequestId);
  }, [isOpen, reviewRequestId, initialStatus]);

  const handleComplete = async () => {
    if (!reviewRequestId || !dossier) return;
    const criterionScores = (dossier.rubricCriteria || []).map((criterion) => {
      const entry = scores[criterion.id];
      return {
        rubricCriterionId: criterion.id,
        score: Number(entry?.score || 0),
        comment: entry?.comment || undefined,
      };
    });

    if (criterionScores.length === 0) {
      setErrorNote("Hồ sơ chưa có tiêu chí rubric để chấm.");
      setActiveTab("grade");
      return;
    }
    if (criterionScores.some((item) => Number.isNaN(item.score))) {
      setErrorNote("Điểm tiêu chí phải là số hợp lệ.");
      return;
    }
    if (overallFeedback.trim().length < 10) {
      setErrorNote("Nhận xét tổng thể cần ít nhất 10 ký tự.");
      setActiveTab("grade");
      return;
    }

    setBusy(true);
    setErrorNote(null);
    try {
      await assessmentService.completeReview(reviewRequestId, {
        overallFeedback: overallFeedback.trim(),
        criterionScores,
      });
      onCompleted?.();
      onClose();
    } catch (err) {
      setErrorNote(err instanceof Error ? err.message : "Không chốt được điểm chuyên gia.");
    } finally {
      setBusy(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!reviewRequestId) return;
    if (revisionReason.trim().length < 10) {
      setErrorNote("Lý do làm lại cần ít nhất 10 ký tự.");
      return;
    }
    setBusy(true);
    setErrorNote(null);
    try {
      await assessmentService.requestRevision(reviewRequestId, revisionReason.trim());
      onRevisionRequested?.(revisionReason.trim());
      setShowRevision(false);
      setRevisionReason("");
      onClose();
    } catch (err) {
      setErrorNote(err instanceof Error ? err.message : "Không gửi được yêu cầu làm lại.");
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen || !reviewRequestId) return null;

  const tabs: Array<{ id: DossierTab; label: string; icon: typeof FileText }> = [
    { id: "ai", label: "Đánh giá AI", icon: Sparkles },
    { id: "sprints", label: "Sprint AI", icon: CheckCircle2 },
    { id: "artifact", label: "Artifact", icon: FileText },
    { id: "plan", label: "Kế hoạch", icon: BookOpen },
    { id: "analysis", label: "Phân tích", icon: ListChecks },
    { id: "grade", label: "Chấm điểm cuối", icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#d9e4ec] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-[#132d49]">
              Hồ sơ chấm chuyên gia
              <Badge tone="navy">REQ-{reviewRequestId}</Badge>
            </h3>
            <p className="text-xs text-[#667d93]">
              Học viên #{dossier?.learnerId ?? "—"} · Bài nộp #{dossier?.submissionId ?? "—"} · Phiên #
              {dossier?.sessionId ?? "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Loader2 size={28} className="animate-spin text-[#2f638c]" />
            <span className="text-xs font-semibold text-[#667d93]">
              Đang tiếp nhận hồ sơ và tải bằng chứng AI...
            </span>
          </div>
        ) : dossier ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {dossier.requestNote && (
              <div className="border-b border-[#e2e9ef] bg-[#fffbf0] px-6 py-2.5 text-xs text-[#9b681d]">
                <span className="font-bold">Ghi chú học viên: </span>
                {dossier.requestNote}
              </div>
            )}

            <div className="flex flex-wrap border-b border-[#e2e9ef] bg-[#fafcff] px-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={classNames(
                      "flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition-all",
                      activeTab === tab.id
                        ? "border-[#2f638c] text-[#2f638c]"
                        : "border-transparent text-[#667d93] hover:text-[#132d49]"
                    )}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-xs">
              {activeTab === "ai" && (
                <div className="space-y-3">
                  {dossier.aiFeedback ? (
                    <>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                        <p className="font-bold">
                          Điểm AI đề xuất: {dossier.aiFeedback.suggestedScore ?? "—"} / 100
                          {dossier.aiFeedback.confidence != null
                            ? ` · Độ tin cậy ${dossier.aiFeedback.confidence}`
                            : ""}
                        </p>
                        <p className="mt-2 leading-5">{dossier.aiFeedback.overallFeedback}</p>
                      </div>
                      {(dossier.aiFeedback.criterionScores || []).map((item) => (
                        <div key={`${item.rubricCriterionId}-${item.criterionCode}`} className="rounded-xl border border-[#d9e4ec] p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#132d49]">
                              {item.criterionCode} · {item.criterionName}
                            </span>
                            <span className="font-mono font-bold text-[#2f638c]">
                              {item.score}/{item.maxScore}
                            </span>
                          </div>
                          <p className="mt-1 text-[#667d93]">{item.comment}</p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-[#667d93]">Chưa có đánh giá AI Practice cho bài nộp này.</p>
                  )}
                </div>
              )}

              {activeTab === "sprints" && (
                <div className="space-y-3">
                  {(dossier.sprintReviews || []).length === 0 ? (
                    <p className="text-[#667d93]">Phiên này chưa có SessionSprintReviews.</p>
                  ) : (
                    dossier.sprintReviews.map((sprint) => (
                      <div key={sprint.sprintNo} className="rounded-xl border border-[#d9e4ec] p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#132d49]">Sprint {sprint.sprintNo}</span>
                          <Badge tone={sprint.status === "Finalized" ? "green" : "amber"}>
                            {sprint.status}
                            {sprint.score != null ? ` · ${sprint.score}` : ""}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[#667d93]">{sprint.decision || "Chưa có quyết định"}</p>
                        <p className="mt-2 leading-5 text-[#334e68]">{sprint.digest || "Chưa có digest."}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "artifact" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#f0f4f8] p-3 text-[11px] text-[#526b83]">
                    {dossier.artifact.title} · {dossier.artifact.artifactType} · v{dossier.artifact.versionNo}
                  </div>
                  <pre className="whitespace-pre-wrap rounded-xl border border-[#d9e4ec] p-4 font-sans leading-relaxed text-[#334e68]">
                    {dossier.artifact.plainTextContent || "Không có nội dung văn bản."}
                  </pre>
                </div>
              )}

              {activeTab === "plan" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#d9e4ec] p-4">
                    <h4 className="mb-1 font-bold text-[#132d49]">Mục tiêu</h4>
                    <p className="text-[#526b81]">{dossier.plan?.objective || "Chưa có mục tiêu kế hoạch."}</p>
                  </div>
                  <div className="rounded-xl border border-[#d9e4ec] p-4">
                    <h4 className="mb-1 font-bold text-[#132d49]">Cách tiếp cận</h4>
                    <p className="text-[#526b81]">{dossier.plan?.approach || "Chưa có approach."}</p>
                  </div>
                </div>
              )}

              {activeTab === "analysis" && (
                <div className="space-y-3">
                  {(dossier.analysisItems || []).map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#d9e4ec] p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#2f638c]">{item.code}</span>
                        <Badge tone="navy">{item.status}</Badge>
                      </div>
                      <h5 className="mt-1 font-bold text-[#132d49]">{item.title}</h5>
                      <p className="mt-1 text-[#667d93]">{item.description}</p>
                      <span className="mt-2 inline-block rounded bg-[#f0f4f8] px-2 py-0.5 text-[10px] text-[#526b83]">
                        {item.itemType}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "grade" && (
                <div className="space-y-4">
                  <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-teal-950">
                    Điểm cuối do chuyên gia chốt từ đánh giá AI, sprint digests và artifact đã xem. Hệ thống không ghi đè bằng điểm AI.
                  </p>
                  {(dossier.rubricCriteria || []).map((criterion) => (
                    <div key={criterion.id} className="rounded-xl border border-[#d9e4ec] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-[#132d49]">
                          {criterion.code} · {criterion.name}
                        </span>
                        <span className="text-[11px] text-[#667d93]">
                          Trọng số {criterion.weight} · Tối đa {criterion.maxScore}
                        </span>
                      </div>
                      <p className="mt-1 text-[#667d93]">{criterion.description}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr]">
                        <input
                          type="number"
                          min={0}
                          max={Number(criterion.maxScore)}
                          step="0.1"
                          value={scores[criterion.id]?.score ?? ""}
                          onChange={(event) =>
                            setScores((prev) => ({
                              ...prev,
                              [criterion.id]: {
                                score: event.target.value,
                                comment: prev[criterion.id]?.comment || "",
                              },
                            }))
                          }
                          className="rounded-xl border border-slate/20 px-3 py-2 font-mono text-navy"
                          disabled={!canGrade}
                        />
                        <input
                          value={scores[criterion.id]?.comment ?? ""}
                          onChange={(event) =>
                            setScores((prev) => ({
                              ...prev,
                              [criterion.id]: {
                                score: prev[criterion.id]?.score || "",
                                comment: event.target.value,
                              },
                            }))
                          }
                          placeholder="Nhận xét tiêu chí"
                          className="rounded-xl border border-slate/20 px-3 py-2 text-navy"
                          disabled={!canGrade}
                        />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="mb-1.5 block font-bold text-[#132d49]">Nhận xét tổng thể</label>
                    <textarea
                      rows={4}
                      value={overallFeedback}
                      onChange={(event) => setOverallFeedback(event.target.value)}
                      className="w-full rounded-xl border border-slate/20 px-3 py-2 leading-relaxed text-navy"
                      disabled={!canGrade}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3">
              {showRevision && canGrade ? (
                <div className="mb-3 space-y-2">
                  <label className="block text-xs font-bold text-[#132d49]">Lý do yêu cầu làm lại</label>
                  <textarea
                    rows={3}
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    className="w-full rounded-xl border border-slate/20 px-3 py-2 text-xs text-navy"
                    placeholder="Chỉ rõ phần học viên cần sửa trước khi nộp lại..."
                  />
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-[#667d93]">
                  {errorNote ? (
                    <span className="flex items-center gap-1 font-semibold text-rose-700">
                      <AlertCircle size={13} /> {errorNote}
                    </span>
                  ) : (
                    "Chấm theo rubric thật trong hồ sơ; hoặc gửi yêu cầu làm lại."
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={onClose}>
                    Đóng
                  </Button>
                  {canGrade && !showRevision && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={busy}
                      onClick={() => setShowRevision(true)}
                      className="border-[#f0c4c4] text-[#a03d3d]"
                    >
                      <RotateCcw size={14} />
                      <span className="ml-1.5">Yêu cầu làm lại</span>
                    </Button>
                  )}
                  {canGrade && showRevision && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void handleRequestRevision()}
                      className="bg-[#a03d3d] hover:bg-[#883232]"
                    >
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                      <span className="ml-1.5">Gửi yêu cầu làm lại</span>
                    </Button>
                  )}
                  {canGrade && !showRevision && (
                    <Button size="sm" disabled={busy} onClick={() => void handleComplete()}>
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      <span className="ml-1.5">Chốt điểm chuyên gia</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
            <AlertCircle size={24} className="text-rose-600" />
            <p className="text-sm font-bold text-navy">{errorNote || "Không có hồ sơ."}</p>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
