import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileCode,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Trash2,
  FileText,
  Edit3,
  Upload,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  artifactService,
  type ArtifactTemplateDto,
  type CreateArtifactTemplatePayload,
  type UpdateArtifactTemplatePayload,
} from "../../../services/artifactService";
import type { SprintPlan } from "./sprintAssignment";

interface AuthoringTemplatesManagerProps {
  sprints: SprintPlan[];
  onChangeSprints: (next: SprintPlan[]) => void;
  readOnly?: boolean;
}

const looksVietnamese = (text: string) =>
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);

export function AuthoringTemplatesManager({
  sprints,
  onChangeSprints,
  readOnly = false,
}: AuthoringTemplatesManagerProps) {
  const [catalog, setCatalog] = useState<ArtifactTemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pickerSprint, setPickerSprint] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ArtifactTemplateDto | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("0");
  const [newDesc, setNewDesc] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newSections, setNewSections] = useState([
    {
      sectionKey: "section_1",
      title: "1. Section title",
      instructions: "Describe what learners must write...",
      displayOrder: 1,
      isRequired: true,
    },
  ]);

  const isPublished = (t: ArtifactTemplateDto) =>
    t.status === "Published" || t.status === 1 || String(t.status).toLowerCase() === "published";

  const published = useMemo(() => catalog.filter(isPublished), [catalog]);
  const drafts = useMemo(() => catalog.filter((t) => !isPublished(t)), [catalog]);

  const catalogByCode = useMemo(() => {
    const map = new Map<string, ArtifactTemplateDto>();
    for (const t of catalog) {
      if (t.code) map.set(t.code.toUpperCase(), t);
      map.set(String(t.id), t);
    }
    return map;
  }, [catalog]);

  const fetchCatalog = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await artifactService.getTemplates();
      setCatalog(data || []);
    } catch (err) {
      setCatalog([]);
      setLoadError(err instanceof Error ? err.message : "Không tải được catalog mẫu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCatalog();
  }, []);

  useEffect(() => {
    if (!showCreateModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showCreateModal]);

  const resolveTemplate = (codeOrId: string) =>
    catalogByCode.get(codeOrId.toUpperCase()) || catalogByCode.get(codeOrId);

  const addTemplateToSprint = (sprintNo: number, template: ArtifactTemplateDto) => {
    const code = (template.code || String(template.id)).toUpperCase();
    onChangeSprints(
      sprints.map((s) =>
        s.sprintNo === sprintNo && !s.templateCodes.includes(code)
          ? { ...s, templateCodes: [...s.templateCodes, code] }
          : s
      )
    );
    setPickerSprint(null);
  };

  const removeTemplateFromSprint = (sprintNo: number, code: string) => {
    onChangeSprints(
      sprints.map((s) =>
        s.sprintNo === sprintNo
          ? { ...s, templateCodes: s.templateCodes.filter((c) => c !== code) }
          : s
      )
    );
  };

  const openEditTemplate = (tpl: ArtifactTemplateDto) => {
    setEditingTemplate(tpl);
    setNewName(tpl.name || "");
    setNewDesc(tpl.description || "");
    setNewType(String(typeof tpl.artifactType === "number" ? tpl.artifactType : 0));
    setNewSections(
      (tpl.sections || []).map((s, idx) => ({
        sectionKey: s.sectionKey || `section_${idx + 1}`,
        title: s.title || `${idx + 1}. Section`,
        instructions: s.instructions || "",
        displayOrder: s.displayOrder ?? idx + 1,
        isRequired: s.isRequired !== false,
      }))
    );
    if (!(tpl.sections || []).length) {
      setNewSections([
        {
          sectionKey: "section_1",
          title: "1. Section title",
          instructions: "Describe what learners must write...",
          displayOrder: 1,
          isRequired: true,
        },
      ]);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const parts = [newName, newDesc, ...newSections.flatMap((s) => [s.title, s.instructions])];
    if (parts.some((p) => looksVietnamese(p))) {
      alert("Template content must be English only.");
      return;
    }
    if (!newName.trim()) {
      alert("Name is required.");
      return;
    }

    setSavingEdit(true);
    try {
      const payload: UpdateArtifactTemplatePayload = {
        name: newName.trim(),
        artifactType: Number(newType),
        description: newDesc.trim() || null,
        sections: newSections.map((s, idx) => ({
          ...s,
          sectionKey: s.sectionKey || `section_${idx + 1}`,
          displayOrder: idx + 1,
        })),
      };
      await artifactService.updateTemplate(editingTemplate.id, payload);
      await fetchCatalog();
      setEditingTemplate(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không cập nhật được template.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePublishTemplate = async (id: number) => {
    setPublishingId(id);
    try {
      await artifactService.publishTemplate(id);
      await fetchCatalog();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không publish được template.");
    } finally {
      setPublishingId(null);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = [newName, newDesc, newCode, ...newSections.flatMap((s) => [s.title, s.instructions])];
    if (parts.some((p) => looksVietnamese(p))) {
      alert("Template content must be English only (name, description, sections, instructions).");
      return;
    }
    if (!newName.trim() || !newCode.trim()) {
      alert("Code and name are required.");
      return;
    }

    setCreating(true);
    try {
      const payload: CreateArtifactTemplatePayload = {
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        artifactType: Number(newType),
        description: newDesc.trim() || undefined,
        publishImmediately: true,
        sections: newSections.map((s, idx) => ({
          ...s,
          sectionKey: s.sectionKey || `section_${idx + 1}`,
          displayOrder: idx + 1,
        })),
      };

      const created = await artifactService.createTemplate(payload);
      await fetchCatalog();
      setShowCreateModal(false);
      setNewName("");
      setNewDesc("");
      setNewCode("");
      setNewType("0");
      if (pickerSprint != null) {
        addTemplateToSprint(pickerSprint, created);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không tạo được template.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#132d49]">
          <FileCode className="text-[#2f638c]" size={18} />
          Mẫu deliverable theo sprint (tuỳ chọn)
        </h3>
        <p className="mt-1 text-xs text-[#667d93]">
          Không bắt buộc gán hết catalog. Instructor/Admin thêm từng mẫu vào sprint cần nộp. Nội dung mẫu (title →
          instructions) phải English 100%. Gợi ý BABOK: BAP, Stakeholder Analysis, Elicitation Results, Requirements
          Package (BRD/SRS), Process Model, RTM — chọn theo đề, không ép đủ bộ.
        </p>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center gap-2 text-xs text-[#667d93]">
          <Loader2 size={20} className="animate-spin text-[#2f638c]" />
          Đang tải catalog mẫu...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">{loadError}</div>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const available = published.filter((t) => {
              const code = (t.code || String(t.id)).toUpperCase();
              return !sprint.templateCodes.includes(code);
            });
            return (
              <div key={sprint.sprintNo} className="rounded-2xl border border-[#d9e4ec] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[#132d49]">Sprint {sprint.sprintNo}</h4>
                    <p className="text-[11px] font-semibold text-[#2f638c]">
                      Thời hạn: {sprint.durationValue}{" "}
                      {sprint.durationUnit === "days" ? "ngày" : "tuần"}
                      {sprint.sprintNo === 1 ? " (từ lúc bắt đầu mô phỏng)" : " (sau sprint trước)"}
                    </p>
                    <p className="text-[11px] text-[#667d93] line-clamp-2">
                      {sprint.focus.trim() || "Chưa nhập nhiệm vụ sprint (tab Blueprint)."}
                    </p>
                  </div>
                  {!readOnly && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={available.length === 0}
                        onClick={() => setPickerSprint(sprint.sprintNo)}
                        className="gap-1.5 text-xs"
                      >
                        <Plus size={14} /> Thêm mẫu từ catalog
                      </Button>
                    </div>
                  )}
                </div>

                {sprint.templateCodes.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-dashed border-[#d9e4ec] bg-[#f8fafc] px-3 py-3 text-xs text-[#667d93]">
                    Chưa gắn mẫu — sprint này có thể chỉ phỏng vấn / phân tích, không bắt buộc nộp artifact.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {sprint.templateCodes.map((code) => {
                      const tpl = resolveTemplate(code);
                      return (
                        <div
                          key={code}
                          className="flex items-start justify-between gap-3 rounded-xl border border-[#e2e9ef] bg-[#f8fafc] px-3 py-2.5"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-[#2f638c]">{code}</span>
                              {tpl && (
                                <Badge tone="green">{String(tpl.artifactType)}</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs font-semibold text-[#132d49]">
                              {tpl?.name || code}
                            </p>
                            {tpl?.description && (
                              <p className="mt-0.5 text-[11px] text-[#667d93] line-clamp-2">{tpl.description}</p>
                            )}
                          </div>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => removeTemplateFromSprint(sprint.sprintNo, code)}
                              className="shrink-0 text-[11px] font-semibold text-[#a03d3d] hover:underline"
                            >
                              Gỡ
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {pickerSprint === sprint.sprintNo && !readOnly && (
                  <div className="mt-3 rounded-xl border border-[#2f638c]/30 bg-[#eaf1f7] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#132d49]">Chọn mẫu published</p>
                      <button type="button" onClick={() => setPickerSprint(null)} className="text-[#667d93]">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-48 space-y-1.5 overflow-y-auto">
                      {available.map((t) => {
                        const code = (t.code || String(t.id)).toUpperCase();
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => addTemplateToSprint(sprint.sprintNo, t)}
                            className="flex w-full items-start gap-2 rounded-lg border border-transparent bg-white px-2.5 py-2 text-left hover:border-[#2f638c]/40"
                          >
                            <FileText size={14} className="mt-0.5 shrink-0 text-[#2f638c]" />
                            <span>
                              <span className="font-mono text-[10px] font-bold text-[#2f638c]">{code}</span>
                              <span className="mt-0.5 block text-xs font-semibold text-[#132d49]">{t.name}</span>
                            </span>
                          </button>
                        );
                      })}
                      {available.length === 0 && (
                        <p className="text-[11px] text-[#667d93]">Không còn mẫu published nào để thêm.</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 gap-1.5 text-xs"
                      onClick={() => {
                        setShowCreateModal(true);
                      }}
                    >
                      <Plus size={14} /> Tạo mẫu English mới rồi gắn vào Sprint {sprint.sprintNo}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!readOnly && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-dashed border-[#d9e4ec] bg-[#f8fafc] p-4">
            <p className="text-xs text-[#667d93]">
              Catalog hiện có <strong className="text-[#132d49]">{published.length}</strong> mẫu đã ban hành
              {drafts.length > 0 ? (
                <>
                  {" "}
                  và <strong className="text-[#132d49]">{drafts.length}</strong> bản nháp
                </>
              ) : null}
              . Có thể tạo thêm mẫu riêng (English) khi cần.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2 gap-1.5 text-xs"
              onClick={() => {
                setPickerSprint(null);
                setEditingTemplate(null);
                setShowCreateModal(true);
              }}
            >
              <Plus size={14} /> Tạo mẫu mới vào catalog
            </Button>
          </div>

          {drafts.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
              <h4 className="text-xs font-bold text-navy">Bản nháp chưa publish</h4>
              <div className="mt-2 space-y-2">
                {drafts.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-100 bg-white px-3 py-2"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#2f638c]">
                        {(tpl.code || String(tpl.id)).toUpperCase()}
                      </span>
                      <p className="text-xs font-semibold text-[#132d49]">{tpl.name}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1 text-[11px]"
                        onClick={() => openEditTemplate(tpl)}
                      >
                        <Edit3 size={12} /> Sửa
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 text-[11px]"
                        disabled={publishingId === tpl.id}
                        onClick={() => void handlePublishTemplate(tpl.id)}
                      >
                        {publishingId === tpl.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Upload size={12} />
                        )}
                        Publish
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(showCreateModal || editingTemplate) &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#d9e4ec] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-5 py-3">
                <h3 className="text-sm font-bold text-[#132d49]">
                  {editingTemplate ? `Edit template #${editingTemplate.id}` : "Create English artifact template"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <form
                onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <div className="flex-1 space-y-3 overflow-y-auto p-5 text-xs">
                  <p className="rounded-lg border border-[#2f638c]/30 bg-[#eaf1f7] px-3 py-2 text-[11px]">
                    All content fields must be English only.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block font-bold text-[#132d49]">
                      Code *
                      <input
                        required={!editingTemplate}
                        disabled={Boolean(editingTemplate)}
                        className="mt-1 w-full rounded-xl border border-[#d9e4ec] p-2.5 font-mono font-normal disabled:bg-[#f0f4f8]"
                        value={editingTemplate ? editingTemplate.code || String(editingTemplate.id) : newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="e.g. BAP-CUSTOM-01"
                      />
                    </label>
                    <label className="block font-bold text-[#132d49]">
                      Artifact type
                      <select
                        className="mt-1 w-full rounded-xl border border-[#d9e4ec] p-2.5 font-normal"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                      >
                        <option value="2">BAP</option>
                        <option value="3">StakeholderRegister</option>
                        <option value="0">BRD</option>
                        <option value="5">SRS</option>
                        <option value="6">UserStories</option>
                        <option value="9">RTM</option>
                        <option value="8">ImpactAnalysis</option>
                        <option value="4">BusinessRulesCatalog</option>
                        <option value="7">UseCaseSpecification</option>
                        <option value="1">Generic</option>
                      </select>
                    </label>
                  </div>
                  <label className="block font-bold text-[#132d49]">
                    Name *
                    <input
                      required
                      className="mt-1 w-full rounded-xl border border-[#d9e4ec] p-2.5 font-normal"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Business Analysis Plan"
                    />
                  </label>
                  <label className="block font-bold text-[#132d49]">
                    Description
                    <textarea
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-[#d9e4ec] p-2.5 font-normal"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                    />
                  </label>
                  <div className="space-y-2 border-t border-[#e2e9ef] pt-3">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#132d49]">Sections</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="text-xs"
                        onClick={() =>
                          setNewSections((prev) => [
                            ...prev,
                            {
                              sectionKey: `section_${prev.length + 1}`,
                              title: `${prev.length + 1}. New section`,
                              instructions: "Describe what learners must write...",
                              displayOrder: prev.length + 1,
                              isRequired: true,
                            },
                          ])
                        }
                      >
                        <Plus size={14} /> Add section
                      </Button>
                    </div>
                    {newSections.map((sec, idx) => (
                      <div key={idx} className="space-y-2 rounded-xl border border-[#d9e4ec] bg-[#f8fafc] p-3">
                        <div className="flex justify-between">
                          <span className="font-bold text-[#2f638c]">#{idx + 1}</span>
                          <button
                            type="button"
                            className="text-[#a03d3d]"
                            onClick={() => setNewSections((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <input
                          required
                          className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2"
                          value={sec.title}
                          onChange={(e) =>
                            setNewSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, title: e.target.value } : s))
                            )
                          }
                          placeholder="Section title (English)"
                        />
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-[#d9e4ec] bg-white p-2"
                          value={sec.instructions}
                          onChange={(e) =>
                            setNewSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, instructions: e.target.value } : s))
                            )
                          }
                          placeholder="Instructions (English)"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between border-t border-[#e2e9ef] bg-[#f8fafc] px-5 py-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingTemplate(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={creating || savingEdit} className="gap-2">
                    {creating || savingEdit ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                    {editingTemplate ? "Save draft" : "Create & publish"}
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
