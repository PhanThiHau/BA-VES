import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Plus,
  Edit3,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
  Layers,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  assessmentService,
  RubricDetailDto,
  CreateRubricPayload,
  UpdateRubricPayload,
  RubricCriterionInputPayload,
  BabokTaskDto,
} from "../../../services/assessmentService";

interface AuthoringRubricsManagerProps {
  scenarioVersionId?: number;
}

/** API/DB lưu weight thang 0..1; form UI dùng phần trăm 0..100. */
function weightToPercent(weight: number): number {
  const w = Number(weight) || 0;
  if (w <= 1.5) return Math.round(w * 1000) / 10;
  return Math.round(w * 10) / 10;
}

function formatWeightLabel(weight: number): string {
  const pct = weightToPercent(weight);
  return Number.isInteger(pct) ? `${pct}%` : `${pct}%`;
}

export function AuthoringRubricsManager({ scenarioVersionId }: AuthoringRubricsManagerProps) {
  const [rubrics, setRubrics] = useState<RubricDetailDto[]>([]);
  const [babokTasks, setBabokTasks] = useState<BabokTaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingRubricId, setEditingRubricId] = useState<number | null>(null);
  const [rubricName, setRubricName] = useState("");
  const [rubricDesc, setRubricDesc] = useState("");
  const [criteriaList, setCriteriaList] = useState<RubricCriterionInputPayload[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const defaultBabokTaskId = babokTasks[0]?.id ?? 1;

  const fetchRubrics = async (versionId: number) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await assessmentService.getRubrics(versionId);
      setRubrics(data || []);
    } catch (err) {
      setRubrics([]);
      setLoadError(err instanceof Error ? err.message : "Không tải được rubrics từ API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    assessmentService
      .getBabokTasks()
      .then((tasks) => setBabokTasks(tasks || []))
      .catch(() => setBabokTasks([]));
  }, []);

  useEffect(() => {
    if (!scenarioVersionId) {
      setRubrics([]);
      setLoadError(null);
      return;
    }
    void fetchRubrics(scenarioVersionId);
  }, [scenarioVersionId]);

  useEffect(() => {
    if (!modalMode) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    if (!scenarioVersionId) {
      alert("Chưa có versionId của kịch bản. Hãy tạo/lưu kịch bản trước.");
      return;
    }
    setModalMode("create");
    setEditingRubricId(null);
    setRubricName("");
    setRubricDesc("");
    setCriteriaList([
      {
        babokTaskId: defaultBabokTaskId,
        code: "COMPLETENESS",
        name: "Tính đầy đủ và bao quát phạm vi",
        description: "Đánh giá mức độ bao phủ phạm vi nghiệp vụ của tài liệu nộp.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Đối chiếu In-Scope / Out-of-Scope với nội dung BRD/SRS.",
        displayOrder: 1,
        isRequired: true,
      },
      {
        babokTaskId: defaultBabokTaskId,
        code: "FEASIBILITY",
        name: "Tính khả thi và đúng quy tắc nghiệp vụ",
        description: "Đánh giá tính khả thi kỹ thuật và tuân thủ business rules.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Đối chiếu với knowledge/business rules của kịch bản.",
        displayOrder: 2,
        isRequired: true,
      },
      {
        babokTaskId: defaultBabokTaskId,
        code: "TRACEABILITY",
        name: "Tính truy vết và bằng chứng",
        description: "Yêu cầu có nguồn từ phỏng vấn stakeholder / evidence.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Kiểm tra liên kết requirement ↔ stakeholder interview.",
        displayOrder: 3,
        isRequired: true,
      },
      {
        babokTaskId: defaultBabokTaskId,
        code: "CLARITY",
        name: "Tính rõ ràng và nhất quán",
        description: "Ngôn từ rõ, acceptance criteria định lượng, ít mâu thuẫn.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Rà soát thuật ngữ mơ hồ và xung đột giữa các mục.",
        displayOrder: 4,
        isRequired: true,
      },
    ]);
  };

  const handleOpenEditModal = (rubric: RubricDetailDto) => {
    setModalMode("edit");
    setEditingRubricId(rubric.id);
    setRubricName(rubric.name);
    setRubricDesc(rubric.description || "");
    setCriteriaList(
      rubric.criteria.map((c) => ({
        babokTaskId: c.babokTaskId || defaultBabokTaskId,
        code: c.code,
        name: c.name,
        description: c.description,
        weight: weightToPercent(c.weight),
        maxScore: c.maxScore,
        evidenceGuidance: c.evidenceGuidance || "",
        displayOrder: c.displayOrder,
        isRequired: c.isRequired,
      }))
    );
  };

  const handleAddCriterion = () => {
    const nextIdx = criteriaList.length + 1;
    setCriteriaList([
      ...criteriaList,
      {
        babokTaskId: defaultBabokTaskId,
        code: `CRIT-${String(nextIdx).padStart(2, "0")}`,
        name: `Tiêu chí đánh giá #${nextIdx}`,
        description: "Mô tả tiêu chuẩn năng lực cần đạt",
        weight: 0,
        maxScore: 100,
        evidenceGuidance: "Chỉ dẫn trích xuất bằng chứng",
        displayOrder: nextIdx,
        isRequired: true,
      },
    ]);
  };

  const handleRemoveCriterion = (idx: number) => {
    setCriteriaList(criteriaList.filter((_, i) => i !== idx));
  };

  const handleCriterionChange = (
    idx: number,
    field: keyof RubricCriterionInputPayload,
    value: string | number | boolean
  ) => {
    setCriteriaList(criteriaList.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const totalWeight = criteriaList.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  const weightOk = Math.abs(totalWeight - 100) <= 0.1;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioVersionId) {
      alert("Thiếu scenarioVersionId.");
      return;
    }
    if (!rubricName.trim()) {
      alert("Vui lòng nhập tên bộ tiêu chí Rubric.");
      return;
    }
    if (criteriaList.length === 0) {
      alert("Vui lòng tạo ít nhất 1 tiêu chí.");
      return;
    }
    if (!weightOk) {
      alert(`Tổng trọng số phải bằng 100%. Hiện tại: ${totalWeight}%.`);
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === "create") {
        const payload: CreateRubricPayload = {
          scenarioVersionId,
          name: rubricName,
          description: rubricDesc,
          publishImmediately: false,
          criteria: criteriaList,
        };
        await assessmentService.createRubric(payload);
        showToast(`Đã tạo bộ Rubric "${rubricName}".`);
      } else if (modalMode === "edit" && editingRubricId) {
        const payload: UpdateRubricPayload = {
          name: rubricName,
          description: rubricDesc,
          criteria: criteriaList,
        };
        await assessmentService.updateRubric(editingRubricId, payload);
        showToast(`Đã cập nhật Rubric "${rubricName}".`);
      }
      setModalMode(null);
      await fetchRubrics(scenarioVersionId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không lưu được Rubric lên máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishRubric = async (rubricId: number) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn phát hành bộ Rubric này? Sau khi phát hành sẽ không thể chỉnh sửa tiêu chí."
      )
    ) {
      return;
    }
    try {
      await assessmentService.publishRubric(rubricId);
      showToast(`Đã phát hành Rubric #${rubricId}.`);
      if (scenarioVersionId) await fetchRubrics(scenarioVersionId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không phát hành được Rubric.");
    }
  };

  if (!scenarioVersionId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
        Chưa có versionId — tạo / chọn kịch bản đã lưu rồi mới cấu hình Rubric cho đúng bản đó.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-[#2f638c] bg-[#132d49] px-4 py-3 text-xs font-bold text-white shadow-xl">
          <CheckCircle2 size={16} className="text-[#32b583]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#132d49]">
            <Award className="text-[#2f638c]" size={18} />
            Bộ tiêu chí chấm điểm Rubric
          </h3>
          <p className="text-xs text-[#667d93]">
            Gắn với scenario version #{scenarioVersionId}. Trọng số API lưu thang 0..1; giao diện hiển thị %
            (tổng 100%).
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2 text-xs">
          <Plus size={16} /> Tạo bộ Rubric mới
        </Button>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-xs text-[#667d93]">
          <Loader2 size={24} className="animate-spin text-[#2f638c]" />
          <span>Đang tải rubrics của version này...</span>
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
          {loadError}
        </div>
      ) : rubrics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d9e4ec] bg-[#f8fafc] px-4 py-8 text-center text-xs text-[#667d93]">
          Version này chưa có Rubric. Bấm “Tạo bộ Rubric mới” để gắn tiêu chí chấm điểm.
        </div>
      ) : (
        <div className="space-y-6">
          {rubrics.map((rubric) => {
            const isDraft = rubric.status === "Draft" || rubric.status === 0;
            const sumPct = rubric.criteria.reduce((acc, c) => acc + weightToPercent(c.weight), 0);
            return (
              <Card key={rubric.id} className="overflow-hidden border-[#d9e4ec]">
                <div className="border-b border-[#e2e9ef] bg-[#f8fafc] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-[#eaf1f7] px-2 py-0.5 font-mono text-xs font-bold text-[#2f638c]">
                          Rubric #{rubric.id}
                        </span>
                        <Badge tone={isDraft ? "amber" : "green"}>
                          {isDraft ? "Bản nháp" : "Đã ban hành"}
                        </Badge>
                        <span className="text-xs text-[#667d93]">v{rubric.version}.0</span>
                        <span
                          className={
                            Math.abs(sumPct - 100) <= 0.1
                              ? "text-xs font-semibold text-[#2d7b60]"
                              : "text-xs font-semibold text-[#a03d3d]"
                          }
                        >
                          Tổng trọng số {Math.round(sumPct * 10) / 10}%
                        </span>
                      </div>
                      <h4 className="mt-1 text-base font-bold text-[#132d49]">{rubric.name}</h4>
                      {rubric.description && (
                        <p className="mt-0.5 text-xs text-[#667d93]">{rubric.description}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {isDraft ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditModal(rubric)}
                            className="gap-1.5 text-xs"
                          >
                            <Edit3 size={14} /> Sửa tiêu chí
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => void handlePublishRubric(rubric.id)}
                            className="gap-1.5 bg-[#2d7b60] text-xs hover:bg-[#23634e]"
                          >
                            <CheckCircle2 size={14} /> Ban hành
                          </Button>
                        </>
                      ) : (
                        <span className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#2d7b60]">
                          <CheckCircle2 size={15} /> Đã khóa chuẩn ban hành
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#132d49]">
                    {rubric.criteria.length} tiêu chí đánh giá
                  </h5>
                  <div className="space-y-3">
                    {rubric.criteria.map((crit, idx) => (
                      <div
                        key={crit.id || idx}
                        className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#eaf1f7] px-2 py-0.5 font-mono text-[11px] font-bold text-[#2f638c]">
                              {crit.code}
                            </span>
                            <span className="text-xs font-bold text-[#132d49]">{crit.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="font-semibold text-[#667d93]">
                              Trọng số:{" "}
                              <strong className="text-[#132d49]">{formatWeightLabel(crit.weight)}</strong>
                            </span>
                            <span className="font-semibold text-[#667d93]">
                              Thang điểm: <strong className="text-[#132d49]">{crit.maxScore}đ</strong>
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-[#526b81]">{crit.description}</p>
                        {crit.evidenceGuidance && (
                          <div className="mt-2 rounded-lg border border-[#e2e9ef] bg-[#f8fafc] px-3 py-1.5 text-[11px] text-[#2d7b60]">
                            <strong>Chỉ dẫn bằng chứng:</strong> {crit.evidenceGuidance}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalMode &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#d9e4ec] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
                <div className="flex items-center gap-2">
                  <Layers className="text-[#2f638c]" size={20} />
                  <h3 className="text-sm font-bold text-[#132d49]">
                    {modalMode === "create"
                      ? "Tạo bộ tiêu chí Rubric mới"
                      : `Chỉnh sửa Rubric #${editingRubricId}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex-1 space-y-5 overflow-y-auto p-6 text-xs">
                  <div>
                    <label className="mb-1 block font-bold text-[#132d49]">Tên bộ Rubric *</label>
                    <input
                      required
                      type="text"
                      value={rubricName}
                      onChange={(e) => setRubricName(e.target.value)}
                      placeholder="VD: Bảng tiêu chí đánh giá BRD/SRS AquaCold v1"
                      className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-bold text-[#132d49]">Mô tả</label>
                    <textarea
                      rows={2}
                      value={rubricDesc}
                      onChange={(e) => setRubricDesc(e.target.value)}
                      className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                    />
                  </div>

                  <div className="border-t border-[#e2e9ef] pt-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-[#132d49]">Tiêu chí ({criteriaList.length})</h4>
                        <p className="text-[11px] text-[#667d93]">
                          Tổng trọng số:{" "}
                          <strong className={weightOk ? "text-[#2d7b60]" : "text-[#a03d3d]"}>
                            {Math.round(totalWeight * 10) / 10}%
                            {!weightOk && " (cần = 100%)"}
                          </strong>
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddCriterion}
                        className="gap-1 text-xs"
                      >
                        <Plus size={14} /> Thêm tiêu chí
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {criteriaList.map((crit, idx) => (
                        <div key={idx} className="space-y-3 rounded-xl border border-[#d9e4ec] bg-[#f8fafc] p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2f638c]">#{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(idx)}
                              className="flex items-center gap-1 text-[11px] text-[#a03d3d] hover:underline"
                            >
                              <Trash2 size={13} /> Xóa
                            </button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-[#667d93]">Code</label>
                              <input
                                required
                                value={crit.code}
                                onChange={(e) => handleCriterionChange(idx, "code", e.target.value)}
                                className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 font-mono text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="mb-1 block text-[11px] font-bold text-[#667d93]">Tên *</label>
                              <input
                                required
                                value={crit.name}
                                onChange={(e) => handleCriterionChange(idx, "name", e.target.value)}
                                className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-[#667d93]">Mô tả</label>
                            <textarea
                              rows={2}
                              value={crit.description}
                              onChange={(e) => handleCriterionChange(idx, "description", e.target.value)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                            />
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-[#667d93]">
                                Trọng số (%)
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                value={crit.weight}
                                onChange={(e) =>
                                  handleCriterionChange(idx, "weight", Number(e.target.value))
                                }
                                className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-[#667d93]">
                                Max score
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={crit.maxScore}
                                onChange={(e) =>
                                  handleCriterionChange(idx, "maxScore", Number(e.target.value))
                                }
                                className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-[11px] font-bold text-[#667d93]">
                                BABOK task
                              </label>
                              <select
                                value={crit.babokTaskId}
                                onChange={(e) =>
                                  handleCriterionChange(idx, "babokTaskId", Number(e.target.value))
                                }
                                className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                              >
                                {babokTasks.length === 0 ? (
                                  <option value={crit.babokTaskId}>Task #{crit.babokTaskId}</option>
                                ) : (
                                  babokTasks.map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.code || t.id} — {t.name}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-bold text-[#667d93]">
                              Chỉ dẫn bằng chứng
                            </label>
                            <textarea
                              rows={2}
                              value={crit.evidenceGuidance || ""}
                              onChange={(e) =>
                                handleCriterionChange(idx, "evidenceGuidance", e.target.value)
                              }
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setModalMode(null)}>
                    Hủy
                  </Button>
                  <Button type="submit" size="sm" disabled={submitting || !weightOk} className="gap-2">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {modalMode === "create" ? "Tạo Rubric" : "Lưu cập nhật"}
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
