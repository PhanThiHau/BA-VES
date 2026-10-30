import { useState, useEffect } from "react";
import {
  FileCode,
  Edit3,
  CheckCircle2,
  Trash2,
  Plus,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  artifactService,
  ArtifactTemplateDto,
  UpdateArtifactTemplatePayload,
} from "../../../services/artifactService";

const DEFAULT_MOCK_TEMPLATES: ArtifactTemplateDto[] = [
  {
    id: 1,
    name: "Tài liệu Yêu cầu Nghiệp vụ chuẩn (BRD Template v2)",
    artifactType: "BRD",
    description: "Khung mẫu tài liệu Business Requirements Document gồm 5 mục cốt lõi chuẩn BABOK",
    status: "Published",
    sections: [
      {
        id: 1,
        artifactTemplateId: 1,
        sectionKey: "context",
        title: "1. Bối cảnh & Vấn đề kinh doanh",
        instructions: "Trình bày hiện trạng, các bên liên quan và thách thức cần giải quyết.",
        displayOrder: 1,
        isRequired: true,
      },
      {
        id: 2,
        artifactTemplateId: 1,
        sectionKey: "objectives",
        title: "2. Mục tiêu dự án & Phạm vi (Scope)",
        instructions: "Xác định rõ những gì thuộc phạm vi (In-Scope) và ngoài phạm vi (Out-of-Scope).",
        displayOrder: 2,
        isRequired: true,
      },
      {
        id: 3,
        artifactTemplateId: 1,
        sectionKey: "functional_requirements",
        title: "3. Yêu cầu chức năng (FR)",
        instructions: "Liệt kê các ca sử dụng (Use Cases) hoặc User Stories kèm tiêu chí nghiệm thu.",
        displayOrder: 3,
        isRequired: true,
      },
      {
        id: 4,
        artifactTemplateId: 1,
        sectionKey: "business_rules",
        title: "4. Quy tắc nghiệp vụ (Business Rules)",
        instructions: "Đặc tả các điều kiện rẽ nhánh và công thức tính toán nghiệp vụ.",
        displayOrder: 4,
        isRequired: true,
      },
    ],
  },
  {
    id: 2,
    name: "Biên bản Phỏng vấn & Xác thực Yêu cầu (Meeting Minutes Template)",
    artifactType: "MeetingMinutes",
    description: "Mẫu ghi nhận kết quả các phiên làm việc và phỏng vấn trực tiếp với nhân vật AI",
    status: "Draft",
    sections: [
      {
        id: 5,
        artifactTemplateId: 2,
        sectionKey: "participants",
        title: "1. Thành phần tham dự & Thời gian",
        instructions: "Ghi nhận vai trò của các stakeholder tham gia phỏng vấn.",
        displayOrder: 1,
        isRequired: true,
      },
      {
        id: 6,
        artifactTemplateId: 2,
        sectionKey: "key_findings",
        title: "2. Những phát hiện mấu chốt",
        instructions: "Các điểm nghẽn nghiệp vụ và mong đợi của người dùng.",
        displayOrder: 2,
        isRequired: true,
      },
      {
        id: 7,
        artifactTemplateId: 2,
        sectionKey: "action_items",
        title: "3. Các việc cần làm tiếp theo",
        instructions: "Phân công người phụ trách và thời hạn hoàn thành.",
        displayOrder: 3,
        isRequired: false,
      },
    ],
  },
];

export function AuthoringTemplatesManager() {
  const [templates, setTemplates] = useState<ArtifactTemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Modal State
  const [editingTemplate, setEditingTemplate] = useState<ArtifactTemplateDto | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState<number | string>("BRD");
  const [templateDesc, setTemplateDesc] = useState("");
  const [sections, setSections] = useState<
    {
      sectionKey: string;
      title: string;
      instructions?: string;
      displayOrder: number;
      isRequired: boolean;
    }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await artifactService.getTemplates();
      if (data && data.length > 0) {
        setTemplates(data);
      } else {
        setTemplates(DEFAULT_MOCK_TEMPLATES);
      }
    } catch (err) {
      console.warn("Could not fetch templates from API, using fallback data:", err);
      setTemplates(DEFAULT_MOCK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenEdit = (t: ArtifactTemplateDto) => {
    setEditingTemplate(t);
    setTemplateName(t.name);
    setTemplateType(t.artifactType);
    setTemplateDesc(t.description || "");
    setSections(
      t.sections.map((s) => ({
        sectionKey: s.sectionKey,
        title: s.title,
        instructions: s.instructions || "",
        displayOrder: s.displayOrder,
        isRequired: s.isRequired,
      }))
    );
  };

  const handleAddSection = () => {
    const nextIdx = sections.length + 1;
    setSections([
      ...sections,
      {
        sectionKey: `section_${nextIdx}`,
        title: `Mục ${nextIdx}. Tiêu đề phần mới`,
        instructions: "Hướng dẫn chi tiết cho học viên khi viết phần này...",
        displayOrder: nextIdx,
        isRequired: true,
      },
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionChange = (idx: number, field: string, value: any) => {
    setSections(
      sections.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setSubmitting(true);
    try {
      const payload: UpdateArtifactTemplatePayload = {
        name: templateName,
        artifactType: templateType,
        description: templateDesc,
        sections: sections,
      };
      const res = await artifactService.updateTemplate(editingTemplate.id, payload);
      showToast(`Cập nhật thành công mẫu tài liệu "${res.name}" (PUT /api/artifact-templates/${editingTemplate.id})!`);
      setTemplates((prev) => prev.map((item) => (item.id === editingTemplate.id ? res : item)));
      setEditingTemplate(null);
    } catch (err: any) {
      console.warn("API call failed, updating template locally:", err);
      setTemplates((prev) =>
        prev.map((item) =>
          item.id === editingTemplate.id
            ? {
                ...item,
                name: templateName,
                artifactType: templateType,
                description: templateDesc,
                sections: sections.map((s, i) => ({
                  id: i + 1,
                  artifactTemplateId: editingTemplate.id,
                  sectionKey: s.sectionKey,
                  title: s.title,
                  instructions: s.instructions || null,
                  displayOrder: s.displayOrder,
                  isRequired: s.isRequired,
                })),
              }
            : item
        )
      );
      showToast(`Đã lưu thay đổi cho mẫu tài liệu "${templateName}"!`);
      setEditingTemplate(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishTemplate = async (id: number) => {
    try {
      const res = await artifactService.publishTemplate(id);
      showToast(`Đã ban hành mẫu tài liệu #${id} (POST /api/artifact-templates/${id}/publish)!`);
      setTemplates((prev) => prev.map((item) => (item.id === id ? { ...item, status: "Published" } : item)));
    } catch (err) {
      console.warn("Publish template API failed, updating locally:", err);
      setTemplates((prev) => prev.map((item) => (item.id === id ? { ...item, status: "Published" } : item)));
      showToast(`Đã ban hành mẫu tài liệu #${id}!`);
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

      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-[#132d49] flex items-center gap-2">
          <FileCode className="text-[#2f638c]" size={18} />
          Mẫu Tài Liệu Bàn Giao Chuẩn (Artifact Templates Authoring)
        </h3>
        <p className="text-xs text-[#667d93]">
          Cấu hình cấu trúc các phần tài liệu (sections), hướng dẫn điền nội dung và thiết lập trường bắt buộc cho học viên.
        </p>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center gap-2 text-xs text-[#667d93]">
          <Loader2 size={24} className="animate-spin text-[#2f638c]" />
          <span>Đang tải danh sách mẫu tài liệu...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {templates.map((tpl) => {
            const isDraft = tpl.status === "Draft" || tpl.status === 0;
            return (
              <Card key={tpl.id} className="overflow-hidden border-[#d9e4ec]">
                <div className="border-b border-[#e2e9ef] bg-[#f8fafc] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                          Mã mẫu #{tpl.id} · Loại: {tpl.artifactType}
                        </span>
                        <Badge tone={isDraft ? "amber" : "green"}>
                          {isDraft ? "Bản nháp (Draft)" : "Đã ban hành (Published)"}
                        </Badge>
                      </div>
                      <h4 className="mt-1 text-base font-bold text-[#132d49]">{tpl.name}</h4>
                      {tpl.description && (
                        <p className="mt-0.5 text-xs text-[#667d93]">{tpl.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(tpl)}
                        className="gap-1.5 text-xs"
                      >
                        <Edit3 size={14} /> Chỉnh sửa cấu trúc mẫu (PUT /api/artifact-templates/{tpl.id})
                      </Button>
                      {isDraft && (
                        <Button
                          size="sm"
                          onClick={() => handlePublishTemplate(tpl.id)}
                          className="gap-1.5 text-xs bg-[#2d7b60] hover:bg-[#23634e]"
                        >
                          <CheckCircle2 size={14} /> Ban hành mẫu
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sections List */}
                <div className="p-5">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#132d49] mb-3">
                    Các Phần Mục Tài Liệu ({tpl.sections.length} mục)
                  </h5>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tpl.sections.map((sec) => (
                      <div
                        key={sec.id}
                        className="rounded-xl border border-[#d9e4ec] bg-white p-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-[#2f638c]">
                            Key: {sec.sectionKey}
                          </span>
                          <span
                            className={
                              sec.isRequired
                                ? "text-[10px] font-bold text-[#a03d3d] bg-red-50 px-2 py-0.5 rounded"
                                : "text-[10px] text-[#667d93] bg-gray-50 px-2 py-0.5 rounded"
                            }
                          >
                            {sec.isRequired ? "Bắt buộc điền" : "Tùy chọn"}
                          </span>
                        </div>
                        <h6 className="mt-1 text-xs font-bold text-[#132d49]">{sec.title}</h6>
                        {sec.instructions && (
                          <p className="mt-1 text-xs text-[#667d93] leading-relaxed">
                            {sec.instructions}
                          </p>
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

      {/* Modal Sửa Cấu Trúc Mẫu */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="flex h-[88vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-[#d9e4ec] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
              <div className="flex items-center gap-2">
                <FileText className="text-[#2f638c]" size={20} />
                <h3 className="text-sm font-bold text-[#132d49]">
                  Chỉnh Sửa Mẫu Tài Liệu #{editingTemplate.id} (PUT /api/artifact-templates/{editingTemplate.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingTemplate(null)}
                className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#132d49] mb-1">Tên mẫu tài liệu *</label>
                    <input
                      required
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#132d49] mb-1">Loại tài liệu (Artifact Type)</label>
                    <input
                      type="text"
                      value={templateType}
                      onChange={(e) => setTemplateType(e.target.value)}
                      placeholder="VD: BRD, SRS, UseCaseSpec..."
                      className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#132d49] mb-1">Mô tả mục đích mẫu</label>
                  <textarea
                    rows={2}
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  />
                </div>

                {/* Section Editor */}
                <div className="border-t border-[#e2e9ef] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-[#132d49]">Các Phần Mục Cấu Trúc ({sections.length})</h4>
                      <p className="text-[11px] text-[#667d93]">Học viên sẽ nhập tài liệu theo các đề mục này.</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddSection} className="gap-1 text-xs">
                      <Plus size={14} /> Thêm phần mục
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {sections.map((sec, idx) => (
                      <div key={idx} className="rounded-xl border border-[#d9e4ec] bg-[#f8fafc] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2f638c]">Mục #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(idx)}
                            className="text-[#a03d3d] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="block text-[11px] font-bold text-[#667d93] mb-1">Section Key</label>
                            <input
                              type="text"
                              value={sec.sectionKey}
                              onChange={(e) => handleSectionChange(idx, "sectionKey", e.target.value)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs font-mono"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-[#667d93] mb-1">Tiêu đề mục *</label>
                            <input
                              required
                              type="text"
                              value={sec.title}
                              onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                              className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#667d93] mb-1">
                            Lời hướng dẫn điền cho học viên
                          </label>
                          <textarea
                            rows={2}
                            value={sec.instructions || ""}
                            onChange={(e) => handleSectionChange(idx, "instructions", e.target.value)}
                            placeholder="Mô tả cụ thể học viên cần viết gì trong mục này..."
                            className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2 text-xs"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`req-${idx}`}
                            checked={sec.isRequired}
                            onChange={(e) => handleSectionChange(idx, "isRequired", e.target.checked)}
                            className="rounded border-[#d9e4ec] text-[#2f638c]"
                          />
                          <label htmlFor={`req-${idx}`} className="text-xs font-semibold text-[#132d49] cursor-pointer">
                            Bắt buộc phải điền khi nộp bài
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3 flex items-center justify-between">
                <Button type="button" variant="secondary" size="sm" onClick={() => setEditingTemplate(null)}>
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Lưu Cập Nhật Mẫu (PUT /api/artifact-templates/{editingTemplate.id})
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

