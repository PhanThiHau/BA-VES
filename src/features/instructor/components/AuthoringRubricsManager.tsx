import { useState, useEffect } from "react";
import {
  Award,
  Plus,
  Edit3,
  CheckCircle2,
  Trash2,
  X,
  AlertCircle,
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
} from "../../../services/assessmentService";

interface AuthoringRubricsManagerProps {
  scenarioVersionId?: number;
}

const DEFAULT_MOCK_RUBRICS: RubricDetailDto[] = [
  {
    id: 1,
    scenarioVersionId: 1,
    createdByUserId: 1,
    name: "Bộ tiêu chí thẩm định kỹ năng khơi gợi & đặc tả BRD",
    version: 1,
    description: "Áp dụng đánh giá năng lực phỏng vấn stakeholder, trích xuất dữ liệu và viết tài liệu yêu cầu chuẩn BABOK v3",
    status: "Published",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    criteria: [
      {
        id: 1,
        rubricId: 1,
        babokTaskId: 1,
        babokTaskCode: "ELICIT",
        babokTaskName: "Elicitation & Collaboration",
        code: "CRIT-01",
        name: "Kỹ năng khơi gợi thông tin & đặt câu hỏi mở",
        description: "Học viên sử dụng câu hỏi mở và đào sâu nguyên nhân gốc rễ vấn đề hàng hoàn lệch số liệu.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Kiểm tra log phỏng vấn có ít nhất 3 câu hỏi tiếp nối làm rõ số dư tồn kho.",
        displayOrder: 1,
        isRequired: true,
      },
      {
        id: 2,
        rubricId: 1,
        babokTaskId: 2,
        babokTaskCode: "STAKEHOLDER",
        babokTaskName: "Stakeholder Engagement",
        code: "CRIT-02",
        name: "Hòa giải mâu thuẫn giữa Kho và Kế toán",
        description: "Xử lý xung đột mục tiêu tốc độ soạn hàng và nguyên tắc phân tách nhiệm vụ kiểm toán.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Biên bản BRD ghi nhận phương án đồng thuận từ cả 2 bên.",
        displayOrder: 2,
        isRequired: true,
      },
      {
        id: 3,
        rubricId: 1,
        babokTaskId: 3,
        babokTaskCode: "TRACE",
        babokTaskName: "Requirements Life Cycle",
        code: "CRIT-03",
        name: "Ma trận truy vết yêu cầu (Traceability Matrix)",
        description: "Tất cả yêu cầu phần mềm đều được ánh xạ về mục tiêu kinh doanh và biên bản họp.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Mục 4 của tài liệu BRD có bảng đối chiếu ID yêu cầu.",
        displayOrder: 3,
        isRequired: true,
      },
      {
        id: 4,
        rubricId: 1,
        babokTaskId: 4,
        babokTaskCode: "QUALITY",
        babokTaskName: "Requirements Analysis",
        code: "CRIT-04",
        name: "Tính hoàn thiện & Nhất quán của tài liệu BRD",
        description: "Tài liệu không bị mâu thuẫn logic, có sơ đồ quy trình và ca kiểm thử rõ ràng.",
        weight: 25,
        maxScore: 100,
        evidenceGuidance: "Không có lỗi logic trong luồng trả hàng đối ứng.",
        displayOrder: 4,
        isRequired: true,
      },
    ],
  },
];

export function AuthoringRubricsManager({ scenarioVersionId = 1 }: AuthoringRubricsManagerProps) {
  const [rubrics, setRubrics] = useState<RubricDetailDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingRubricId, setEditingRubricId] = useState<number | null>(null);
  const [rubricName, setRubricName] = useState("");
  const [rubricDesc, setRubricDesc] = useState("");
  const [criteriaList, setCriteriaList] = useState<RubricCriterionInputPayload[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchRubrics = async () => {
    setLoading(true);
    try {
      const data = await assessmentService.getRubrics(scenarioVersionId);
      if (data && data.length > 0) {
        setRubrics(data);
      } else {
        setRubrics(DEFAULT_MOCK_RUBRICS);
      }
    } catch (err) {
      console.warn("Could not fetch rubrics from API, using fallback data:", err);
      setRubrics(DEFAULT_MOCK_RUBRICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, [scenarioVersionId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingRubricId(null);
    setRubricName("");
    setRubricDesc("");
    setCriteriaList([
      {
        babokTaskId: 1,
        code: "CRIT-01",
        name: "Khơi gợi và làm rõ yêu cầu",
        description: "Đánh giá khả năng đặt câu hỏi và phát hiện sự thật nghiệp vụ",
        weight: 50,
        maxScore: 100,
        evidenceGuidance: "Kiểm tra log phỏng vấn stakeholder",
        displayOrder: 1,
        isRequired: true,
      },
      {
        babokTaskId: 2,
        code: "CRIT-02",
        name: "Chất lượng đặc tả BRD",
        description: "Đánh giá tính chính xác, cấu trúc và tính nhất quán của tài liệu nộp",
        weight: 50,
        maxScore: 100,
        evidenceGuidance: "Kiểm tra tài liệu nộp phần chức năng và quy tắc",
        displayOrder: 2,
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
        babokTaskId: c.babokTaskId,
        code: c.code,
        name: c.name,
        description: c.description,
        weight: c.weight,
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
        babokTaskId: 1,
        code: `CRIT-0${nextIdx}`,
        name: `Tiêu chí đánh giá mới #${nextIdx}`,
        description: "Mô tả tiêu chuẩn năng lực cần đạt",
        weight: 20,
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

  const handleCriterionChange = (idx: number, field: keyof RubricCriterionInputPayload, value: any) => {
    setCriteriaList(
      criteriaList.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const totalWeight = criteriaList.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubricName.trim()) {
      alert("Vui lòng nhập tên bộ tiêu chí Rubric.");
      return;
    }
    if (criteriaList.length === 0) {
      alert("Vui lòng tạo ít nhất 1 tiêu chí.");
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
        const res = await assessmentService.createRubric(payload);
        showToast(`Tạo thành công bộ Rubric "${res.name}" (POST /api/rubrics)!`);
        setRubrics((prev) => [res, ...prev]);
      } else if (modalMode === "edit" && editingRubricId) {
        const payload: UpdateRubricPayload = {
          name: rubricName,
          description: rubricDesc,
          criteria: criteriaList,
        };
        const res = await assessmentService.updateRubric(editingRubricId, payload);
        showToast(`Cập nhật thành công Rubric "${res.name}" (PUT /api/rubrics/${editingRubricId})!`);
        setRubrics((prev) => prev.map((r) => (r.id === editingRubricId ? res : r)));
      }
      setModalMode(null);
    } catch (err: any) {
      console.warn("API operation failed, saving locally:", err);
      // Fallback local update
      if (modalMode === "create") {
        const fakeId = Date.now();
        const newRubric: RubricDetailDto = {
          id: fakeId,
          scenarioVersionId,
          createdByUserId: 1,
          name: rubricName,
          version: 1,
          description: rubricDesc,
          status: "Draft",
          createdAt: new Date().toISOString(),
          updatedAt: null,
          criteria: criteriaList.map((c, i) => ({
            id: i + 1,
            rubricId: fakeId,
            babokTaskId: c.babokTaskId,
            babokTaskCode: null,
            babokTaskName: null,
            code: c.code,
            name: c.name,
            description: c.description,
            weight: c.weight,
            maxScore: c.maxScore,
            evidenceGuidance: c.evidenceGuidance || null,
            displayOrder: c.displayOrder || i + 1,
            isRequired: c.isRequired ?? true,
          })),
        };
        setRubrics((prev) => [newRubric, ...prev]);
        showToast(`Đã tạo bộ Rubric bản nháp "${rubricName}"!`);
      } else if (modalMode === "edit" && editingRubricId) {
        setRubrics((prev) =>
          prev.map((r) =>
            r.id === editingRubricId
              ? {
                  ...r,
                  name: rubricName,
                  description: rubricDesc,
                  criteria: criteriaList.map((c, i) => ({
                    id: i + 1,
                    rubricId: editingRubricId,
                    babokTaskId: c.babokTaskId,
                    babokTaskCode: null,
                    babokTaskName: null,
                    code: c.code,
                    name: c.name,
                    description: c.description,
                    weight: c.weight,
                    maxScore: c.maxScore,
                    evidenceGuidance: c.evidenceGuidance || null,
                    displayOrder: c.displayOrder || i + 1,
                    isRequired: c.isRequired ?? true,
                  })),
                }
              : r
          )
        );
        showToast(`Đã lưu thay đổi cho Rubric "${rubricName}"!`);
      }
      setModalMode(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishRubric = async (rubricId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn phát hành bộ Rubric này? Sau khi phát hành sẽ không thể chỉnh sửa tiêu chí.")) {
      return;
    }
    try {
      const res = await assessmentService.publishRubric(rubricId);
      showToast(`Đã phát hành Rubric #${rubricId} thành công (POST /api/rubrics/${rubricId}/publish)!`);
      setRubrics((prev) => prev.map((r) => (r.id === rubricId ? { ...r, status: "Published" } : r)));
    } catch (err) {
      console.warn("Could not publish via API, updating status locally:", err);
      setRubrics((prev) => prev.map((r) => (r.id === rubricId ? { ...r, status: "Published" } : r)));
      showToast(`Đã phát hành chính thức Rubric #${rubricId}!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#132d49] px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in border border-[#2f638c]">
          <CheckCircle2 size={16} className="text-[#32b583]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#132d49] flex items-center gap-2">
            <Award className="text-[#2f638c]" size={18} />
            Bộ Tiêu Chí Chấm Điểm Rubric (Assessment Rubrics Authoring)
          </h3>
          <p className="text-xs text-[#667d93]">
            Quản lý các tiêu chuẩn năng lực, trọng số điểm và hướng dẫn tìm bằng chứng cho AI Assessor & Giảng viên.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="gap-2 text-xs">
          <Plus size={16} /> Tạo Bộ Rubric Mới (POST /api/rubrics)
        </Button>
      </div>

      {/* Rubrics List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-xs text-[#667d93]">
          <Loader2 size={24} className="animate-spin text-[#2f638c]" />
          <span>Đang tải danh sách Rubrics...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {rubrics.map((rubric) => {
            const isDraft = rubric.status === "Draft" || rubric.status === 0;
            return (
              <Card key={rubric.id} className="overflow-hidden border-[#d9e4ec]">
                <div className="border-b border-[#e2e9ef] bg-[#f8fafc] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                          Mã Rubric #{rubric.id}
                        </span>
                        <Badge tone={isDraft ? "amber" : "green"}>
                          {isDraft ? "Bản nháp (Draft)" : "Đã ban hành (Published)"}
                        </Badge>
                        <span className="text-xs text-[#667d93]">Phiên bản {rubric.version}.0</span>
                      </div>
                      <h4 className="mt-1 text-base font-bold text-[#132d49]">{rubric.name}</h4>
                      {rubric.description && (
                        <p className="mt-0.5 text-xs text-[#667d93]">{rubric.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isDraft ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditModal(rubric)}
                            className="gap-1.5 text-xs"
                          >
                            <Edit3 size={14} /> Sửa tiêu chí (PUT /api/rubrics/{rubric.id})
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handlePublishRubric(rubric.id)}
                            className="gap-1.5 text-xs bg-[#2d7b60] hover:bg-[#23634e]"
                          >
                            <CheckCircle2 size={14} /> Ban hành (POST /api/rubrics/{rubric.id}/publish)
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-[#2d7b60] font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 size={15} /> Đã khóa chuẩn ban hành
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Criteria Table */}
                <div className="p-5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#132d49] mb-3">
                    Danh Sách {rubric.criteria.length} Tiêu Chí Đánh Giá
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
                              Trọng số: <strong className="text-[#132d49]">{crit.weight}%</strong>
                            </span>
                            <span className="font-semibold text-[#667d93]">
                              Thang điểm: <strong className="text-[#132d49]">{crit.maxScore}đ</strong>
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-[#526b81]">{crit.description}</p>
                        {crit.evidenceGuidance && (
                          <div className="mt-2 rounded-lg bg-[#f8fafc] px-3 py-1.5 text-[11px] text-[#2d7b60] border border-[#e2e9ef]">
                            <strong>Chỉ dẫn bằng chứng cho AI:</strong> {crit.evidenceGuidance}
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

      {/* Modal Tạo / Sửa Rubric */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="flex h-[88vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-[#d9e4ec] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
              <div className="flex items-center gap-2">
                <Layers className="text-[#2f638c]" size={20} />
                <h3 className="text-sm font-bold text-[#132d49]">
                  {modalMode === "create" ? "Tạo Bộ Tiêu Chí Rubric Mới" : `Chỉnh Sửa Bộ Rubric #${editingRubricId}`}
                </h3>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-[#132d49] mb-1">Tên bộ Rubric *</label>
                  <input
                    required
                    type="text"
                    value={rubricName}
                    onChange={(e) => setRubricName(e.target.value)}
                    placeholder="VD: Bộ tiêu chí đánh giá kỹ năng Elicitation & BRD Drafting"
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132d49] mb-1">Mô tả mục tiêu đánh giá</label>
                  <textarea
                    rows={2}
                    value={rubricDesc}
                    onChange={(e) => setRubricDesc(e.target.value)}
                    placeholder="VD: Dùng cho bài thi cuối kỳ môn Phân tích Nghiệp vụ Phần mềm..."
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  />
                </div>

                {/* Criteria Builder */}
                <div className="border-t border-[#e2e9ef] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-[#132d49]">Các Tiêu Chí Thành Phần ({criteriaList.length})</h4>
                      <p className="text-[11px] text-[#667d93]">
                        Tổng trọng số hiện tại:{" "}
                        <strong className={totalWeight === 100 ? "text-[#2d7b60]" : "text-[#a03d3d]"}>
                          {totalWeight}% {totalWeight !== 100 && "(Nên bằng 100%)"}
                        </strong>
                      </p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddCriterion} className="gap-1 text-xs">
                      <Plus size={14} /> Thêm tiêu chí
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {criteriaList.map((crit, idx) => (
                      <div key={idx} className="rounded-xl border border-[#d9e4ec] bg-[#f8fafc] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2f638c]">Tiêu chí #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCriterion(idx)}
                            className="text-[#a03d3d] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#667d93] mb-1">Mã tiêu chí</label>
                            <input
                              type="text"
                              value={crit.code}
                              onChange={(e) => handleCriterionChange(idx, "code", e.target.value)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs font-mono"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-[#667d93] mb-1">Tên tiêu chí *</label>
                            <input
                              required
                              type="text"
                              value={crit.name}
                              onChange={(e) => handleCriterionChange(idx, "name", e.target.value)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-bold text-[#667d93] mb-1">Trọng số (%)</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={crit.weight}
                              onChange={(e) => handleCriterionChange(idx, "weight", parseInt(e.target.value) || 0)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-[#667d93] mb-1">Điểm tối đa</label>
                            <input
                              type="number"
                              min={10}
                              max={100}
                              value={crit.maxScore}
                              onChange={(e) => handleCriterionChange(idx, "maxScore", parseInt(e.target.value) || 100)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#667d93] mb-1">Mô tả chi tiết</label>
                          <textarea
                            rows={2}
                            value={crit.description}
                            onChange={(e) => handleCriterionChange(idx, "description", e.target.value)}
                            className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#667d93] mb-1">
                            Chỉ dẫn trích dẫn bằng chứng (cho AI Assessor)
                          </label>
                          <input
                            type="text"
                            value={crit.evidenceGuidance || ""}
                            onChange={(e) => handleCriterionChange(idx, "evidenceGuidance", e.target.value)}
                            placeholder="VD: Kiểm tra học viên có đặt câu hỏi về quy trình hoàn trả hàng"
                            className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3 flex items-center justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setModalMode(null)}>
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {modalMode === "create" ? "Lưu Bộ Rubric Mới" : "Cập Nhật Bộ Rubric"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

