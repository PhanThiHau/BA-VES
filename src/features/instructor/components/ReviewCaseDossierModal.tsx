import { useState, useEffect } from "react";
import {
  FileText,
  BookOpen,
  ListChecks,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { classNames } from "../../../utils/format";
import {
  assessmentService,
  ReviewCaseDossierDto,
} from "../../../services/assessmentService";
import type { ReviewItem } from "../instructorData";

interface ReviewCaseDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewItem: ReviewItem | null;
}

export function ReviewCaseDossierModal({
  isOpen,
  onClose,
  reviewItem,
}: ReviewCaseDossierModalProps) {
  const [dossier, setDossier] = useState<ReviewCaseDossierDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"artifact" | "plan" | "analysis" | "rubric">("artifact");
  const [errorNote, setErrorNote] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !reviewItem) return;

    let isMounted = true;
    setLoading(true);
    setErrorNote(null);

    const numericId = parseInt(reviewItem.id.replace(/\D/g, ""), 10) || 1;

    assessmentService
      .getReviewCaseDossier(numericId)
      .then((data) => {
        if (isMounted) {
          setDossier(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch case dossier from API, using fallback data:", err);
        if (isMounted) {
          setErrorNote("Hệ thống hiển thị bản lưu hồ sơ kiểm thử cục bộ cho bài này.");
          setDossier({
            reviewRequestId: numericId,
            submissionId: 100 + numericId,
            sessionId: 200 + numericId,
            learnerId: 300 + numericId,
            status: reviewItem.status,
            requestNote:
              "Học viên đề nghị phúc khảo kết quả AI đánh giá phần đặc tả BRD và biên bản phỏng vấn.",
            requestedAt: new Date().toISOString(),
            artifact: {
              id: 1,
              artifactId: 1,
              versionNumber: 2,
              structuredContentJson: JSON.stringify(
                {
                  title: `Tài liệu BRD - ${reviewItem.scenarioTitle}`,
                  summary: reviewItem.issueSummary,
                  scope: "Quản lý luồng xử lý hàng hoàn và kiểm soát số liệu tồn kho thực tế.",
                  deliverables: reviewItem.deliverablesSubmitted,
                },
                null,
                2
              ),
              plainTextContent: `# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)\n\n## 1. Giới thiệu tổng quan\nBài tập: ${reviewItem.scenarioTitle}\nHọc viên: ${reviewItem.learner} (${reviewItem.cohort})\n\n## 2. Vấn đề cốt lõi đã nhận diện\n${reviewItem.issueSummary}\n\n## 3. Các thành phẩm bàn giao\n${reviewItem.deliverablesSubmitted.map((d) => `- ${d}`).join("\n")}`,
              createdAt: new Date().toISOString(),
            },
            plan: {
              id: 1,
              sessionId: 200 + numericId,
              scopeSummary: "Kế hoạch phỏng vấn các stakeholder chính: Trưởng kho, Kế toán trưởng, Quản trị hệ thống",
              plannedQuestions: [
                "Quy trình xử lý hiện tại khi có khách trả hàng tại quầy hoặc gửi bưu điện?",
                "Thời điểm ghi nhận giảm tồn trên phần mềm so với thời điểm hàng về tới kho?",
                "Các điểm thắt cổ chai gây chậm trễ cập nhật số dư kho?",
              ],
            },
            analysisItems: [
              {
                id: 1,
                sessionId: 200 + numericId,
                category: "Yêu cầu chức năng",
                code: "FR-01",
                title: "Tự động ghi nhận phiếu nhập hàng hoàn khi quét mã barcode",
                description:
                  "Thủ kho quét mã đơn hàng trả lại sẽ tự động sinh phiếu kiểm tra và đẩy vào trạng thái chờ phân loại.",
                status: "Đã xác minh",
              },
              {
                id: 2,
                sessionId: 200 + numericId,
                category: "Quy tắc nghiệp vụ",
                code: "BR-02",
                title: "Quy tắc cách ly sản phẩm lỗi hỏng",
                description:
                  "Sản phẩm hỏng bao bì phải được chuyển vào kho cách ly trong vòng 2 giờ kể từ khi quét mã nhận hàng.",
                status: "Đã xác minh",
              },
            ],
            rubricCriteria: (reviewItem.criteria || []).map((c, idx) => ({
              id: idx + 1,
              rubricId: 1,
              babokTaskId: idx + 1,
              babokTaskCode: c.babokArea,
              babokTaskName: c.babokArea,
              code: `CRIT-0${idx + 1}`,
              name: c.name,
              description: `Tiêu chí thẩm định năng lực: ${c.name}`,
              weight: c.weight,
              maxScore: 100,
              evidenceGuidance: c.aiEvidenceQuote,
              displayOrder: idx + 1,
              isRequired: true,
            })),
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, reviewItem]);

  if (!isOpen || !reviewItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl border border-[#d9e4ec] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf1f7] text-[#2f638c]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132d49] flex items-center gap-2">
                Hồ sơ Kiểm thử Nghiệp vụ (Review Case Dossier)
                <Badge tone="navy">Mã: {reviewItem.id}</Badge>
              </h3>
              <p className="text-xs text-[#667d93]">
                Học viên: <strong className="text-[#132d49]">{reviewItem.learner}</strong> · {reviewItem.cohort}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Loader2 size={28} className="animate-spin text-[#2f638c]" />
            <span className="text-xs font-semibold text-[#667d93]">
              Đang tải dữ liệu hồ sơ từ API (GET /api/review-requests/{reviewItem.id}/case)...
            </span>
          </div>
        ) : dossier ? (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Note / Request banner */}
            {dossier.requestNote && (
              <div className="border-b border-[#e2e9ef] bg-[#fffbf0] px-6 py-2.5 text-xs text-[#9b681d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Ghi chú học viên:</span>
                  <span>{dossier.requestNote}</span>
                </div>
                {errorNote && (
                  <span className="text-[11px] text-[#b3771e] flex items-center gap-1">
                    <AlertCircle size={13} /> {errorNote}
                  </span>
                )}
              </div>
            )}

            {/* Subtabs */}
            <div className="flex border-b border-[#e2e9ef] px-6 bg-[#fafcff]">
              {[
                { id: "artifact", label: "Tài liệu nộp (Artifact)", icon: FileText },
                { id: "plan", label: "Kế hoạch phỏng vấn (Plan)", icon: BookOpen },
                { id: "analysis", label: "Phân tích yêu cầu (Analysis)", icon: ListChecks },
                { id: "rubric", label: "Tiêu chí Rubric", icon: CheckCircle2 },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={classNames(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all",
                      activeTab === t.id
                        ? "border-[#2f638c] text-[#2f638c]"
                        : "border-transparent text-[#667d93] hover:text-[#132d49]"
                    )}
                  >
                    <Icon size={14} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 text-xs">
              {activeTab === "artifact" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-[#f0f4f8] p-3 text-[11px] text-[#526b83]">
                    <span>
                      Phiên bản tài liệu: <strong>v{dossier.artifact?.versionNumber ?? 1}.0</strong>
                    </span>
                    <span>
                      Thời gian lưu: {new Date(dossier.artifact?.createdAt || "").toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                    <h4 className="font-bold text-[#132d49] mb-2 uppercase text-[11px] tracking-wider">
                      Nội dung văn bản (Plain Text Content)
                    </h4>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-[#334e68] leading-relaxed">
                      {dossier.artifact?.plainTextContent || "Không có nội dung văn bản thuần."}
                    </pre>
                  </div>
                  {dossier.artifact?.structuredContentJson && (
                    <div className="rounded-xl border border-[#d9e4ec] bg-[#f8fafc] p-4">
                      <h4 className="font-bold text-[#132d49] mb-2 uppercase text-[11px] tracking-wider">
                        Dữ liệu cấu trúc (Structured JSON)
                      </h4>
                      <pre className="overflow-x-auto font-mono text-[11px] text-[#243b53] p-2 bg-[#edf2f7] rounded-lg">
                        {dossier.artifact.structuredContentJson}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "plan" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                    <h4 className="font-bold text-[#132d49] mb-1 text-xs">Tóm tắt phạm vi & Mục tiêu phỏng vấn</h4>
                    <p className="text-[#526b81]">
                      {dossier.plan?.scopeSummary || "Chưa có tóm tắt phạm vi kế hoạch."}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#132d49] mb-2 text-xs">Danh sách câu hỏi dự kiến:</h4>
                    <div className="space-y-2">
                      {(dossier.plan?.plannedQuestions || []).map((q: any, idx: number) => (
                        <div key={idx} className="flex gap-2 rounded-xl bg-[#f8fafc] border border-[#e2e9ef] p-3">
                          <span className="font-bold text-[#2f638c]">{idx + 1}.</span>
                          <span className="text-[#132d49]">
                            {typeof q === "string" ? q : q.questionText || JSON.stringify(q)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analysis" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#132d49] text-xs">
                    Các hạng mục phân tích đã phát hiện ({dossier.analysisItems?.length || 0}):
                  </h4>
                  {dossier.analysisItems?.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#2f638c]">{item.code}</span>
                        <Badge tone={item.status === "Đã xác minh" ? "green" : "amber"}>{item.status}</Badge>
                      </div>
                      <h5 className="mt-1 font-bold text-[#132d49]">{item.title}</h5>
                      <p className="mt-1 text-[#667d93]">{item.description}</p>
                      <span className="mt-2 inline-block rounded bg-[#f0f4f8] px-2 py-0.5 text-[10px] text-[#526b83]">
                        Phân loại: {item.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "rubric" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#132d49] text-xs">
                    Bộ tiêu chí Rubric áp dụng ({dossier.rubricCriteria?.length || 0}):
                  </h4>
                  {dossier.rubricCriteria?.map((crit) => (
                    <div key={crit.id} className="rounded-xl border border-[#d9e4ec] bg-white p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#2f638c]">
                          {crit.code} - {crit.name}
                        </span>
                        <span className="text-xs font-bold text-[#132d49]">
                          Trọng số: {crit.weight}% · Tối đa: {crit.maxScore}đ
                        </span>
                      </div>
                      <p className="mt-1 text-[#526b81]">{crit.description}</p>
                      {crit.evidenceGuidance && (
                        <p className="mt-2 text-[11px] text-[#2d7b60] bg-[#f0f9f4] p-2 rounded-lg border border-[#c3e6d2]">
                          <strong>Chỉ dẫn bằng chứng:</strong> {crit.evidenceGuidance}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3 flex justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Đóng hồ sơ
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

