import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, ClipboardList, Database, FileQuestion, FileSearch, GitMerge, Link2, Loader2, MessageSquareQuote, Pencil, Plus, RefreshCcw, SearchCheck, ShieldAlert, Sparkles, Trash2, Truck, Users, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { stakeholders } from "../../constants/scenario";
import { requirements } from "../../constants/scenario";
import { confirmations, conflicts, decisions, evidenceRegister, findings, openQuestions, risks, traceabilityRows } from "../../constants/trainingScenario";
import { useApp } from "../../contexts/AppContext";
import { getStoredByokConfig } from "../../services/apiClient";
import {
  analysisService,
  AnalysisItemType,
  AnalysisItemStatus,
  PriorityLevel,
  EvidenceRelationshipType,
  type AnalysisItemDto,
  type CreateAnalysisItemPayload,
  type UpdateAnalysisItemPayload,
  type EvidenceLinkDetailDto,
  type AnalysisConfirmationResultDto,
  analysisItemStatusLabels,
  analysisItemTypeLabels,
  evidenceRelationshipLabels,
} from "../../services/analysisService";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const tabs = [
  "Tổng quan phiên",
  "Phát hiện & Bằng chứng",
  "Giả định & Lỗ hổng",
  "Xung đột & Câu hỏi mở",
  "Đặc tả yêu cầu",
  "Thẩm định Stakeholder",
  "Ma trận truy vết (RTM)",
  "Tác động thay đổi",
  "Rủi ro & Quyết định",
] as const;
type Tab = typeof tabs[number];

const statusBadge = (status: string) => {
  if (status === "confirmed" || status === "Complete" || status === "resolved" || status === "Approved") {
    return <Badge tone="green">{status === "confirmed" ? "Đã xác nhận" : status === "resolved" ? "Đã giải quyết" : status === "Approved" ? "Đã phê duyệt" : "Hoàn tất"}</Badge>;
  }
  return <Badge tone="amber">{status === "needs-clarification" ? "Cần làm rõ" : status === "open" ? "Đang mở" : status === "unconfirmed" ? "Chưa kiểm chứng" : status}</Badge>;
};

export function AnalysisHubPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentSessionId, activeAgents, messages } = useApp();
  const [tab, setTab] = useState<Tab>("Tổng quan phiên");
  const [apiAnalysisItems, setApiAnalysisItems] = useState<AnalysisItemDto[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State cho API #2: POST /api/sessions/{sessionId}/analysis-items
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccessMsg, setCreateSuccessMsg] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateAnalysisItemPayload>({
    itemType: AnalysisItemType.Finding,
    title: "",
    description: "",
    priority: PriorityLevel.Medium,
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSessionId) {
      setCreateError("Vui lòng bắt đầu một phiên mô phỏng (Simulation Session) để lưu trữ mục phân tích vào máy chủ.");
      return;
    }
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setCreateError("Vui lòng điền đầy đủ Tiêu đề và Mô tả chi tiết.");
      return;
    }
    setIsSubmitting(true);
    setCreateError(null);
    try {
      const created = await analysisService.createAnalysisItem(currentSessionId, {
        itemType: Number(createForm.itemType),
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        priority: createForm.priority !== undefined ? Number(createForm.priority) : undefined,
      });
      // Đưa item vừa tạo vào đầu danh sách
      setApiAnalysisItems((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setCreateSuccessMsg(`Đã tạo thành công mục ${created.code || `#${created.id}`} vào phiên #${currentSessionId}!`);
      setTimeout(() => setCreateSuccessMsg(null), 4000);
      // Reset form
      setCreateForm({
        itemType: AnalysisItemType.Finding,
        title: "",
        description: "",
        priority: PriorityLevel.Medium,
      });
    } catch (err: any) {
      console.error("Lỗi tạo Analysis Item:", err);
      setCreateError(err.message || "Không thể tạo mục phân tích. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // State cho API #3 (PATCH) & API #4 (DELETE)
  const [editingItem, setEditingItem] = useState<AnalysisItemDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateAnalysisItemPayload>({
    title: "",
    description: "",
    priority: PriorityLevel.Medium,
    status: AnalysisItemStatus.Draft,
  });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);

  const handleStartEdit = (item: AnalysisItemDto) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      description: item.description,
      priority: item.priority ?? PriorityLevel.Medium,
      status: item.status,
    });
    setUpdateError(null);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSessionId || !editingItem) return;
    if (!editForm.title?.trim() || !editForm.description?.trim()) {
      setUpdateError("Vui lòng điền đầy đủ Tiêu đề và Mô tả.");
      return;
    }
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const updated = await analysisService.updateAnalysisItem(currentSessionId, editingItem.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority !== undefined ? Number(editForm.priority) : undefined,
        status: editForm.status !== undefined ? Number(editForm.status) : undefined,
      });
      setApiAnalysisItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      setEditingItem(null);
      setCreateSuccessMsg(`Đã cập nhật thành công mục ${updated.code || `#${updated.id}`}!`);
      setTimeout(() => setCreateSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Lỗi cập nhật Analysis Item:", err);
      setUpdateError(err.message || "Không thể cập nhật mục phân tích.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteItem = async (item: AnalysisItemDto) => {
    if (!currentSessionId) return;
    if (!window.confirm(`Bạn có chắc chắn muốn lưu trữ/xoá mục ${item.code || `#${item.id}`} không?`)) return;
    setDeletingItemId(item.id);
    try {
      await analysisService.deleteAnalysisItem(currentSessionId, item.id);
      setApiAnalysisItems((prev) => prev.filter((it) => it.id !== item.id));
      setCreateSuccessMsg(`Đã lưu trữ mục ${item.code || `#${item.id}`}.`);
      setTimeout(() => setCreateSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Lỗi xoá Analysis Item:", err);
      alert(err.message || "Không thể xoá mục phân tích.");
    } finally {
      setDeletingItemId(null);
    }
  };

  // State & Handlers cho API #5 (GET evidence), #6 (POST evidence), #7 (DELETE evidence)
  const [evidenceModalItem, setEvidenceModalItem] = useState<AnalysisItemDto | null>(null);
  const [evidenceLinks, setEvidenceLinks] = useState<EvidenceLinkDetailDto[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [newEvidenceMessageId, setNewEvidenceMessageId] = useState<number | string>("");
  const [newEvidenceRelation, setNewEvidenceRelation] = useState<EvidenceRelationshipType>(
    EvidenceRelationshipType.Supports
  );
  const [isAddingEvidence, setIsAddingEvidence] = useState<boolean>(false);
  const [deletingEvidenceId, setDeletingEvidenceId] = useState<number | null>(null);

  const handleOpenEvidence = async (item: AnalysisItemDto) => {
    setEvidenceModalItem(item);
    setEvidenceError(null);
    setNewEvidenceMessageId("");
    setLoadingEvidence(true);
    try {
      const data = await analysisService.getEvidenceLinks(item.id);
      setEvidenceLinks(data || []);
    } catch (err: any) {
      console.error("Lỗi tải bằng chứng:", err);
      setEvidenceError(err.message || "Không thể tải bằng chứng từ máy chủ");
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalItem || !newEvidenceMessageId) return;
    setIsAddingEvidence(true);
    setEvidenceError(null);
    try {
      await analysisService.addEvidenceLink(evidenceModalItem.id, {
        messageId: Number(newEvidenceMessageId),
        relationshipType: Number(newEvidenceRelation),
      });
      // Tải lại danh sách bằng chứng
      const data = await analysisService.getEvidenceLinks(evidenceModalItem.id);
      setEvidenceLinks(data || []);
      setNewEvidenceMessageId("");
    } catch (err: any) {
      console.error("Lỗi gắn bằng chứng:", err);
      setEvidenceError(err.message || "Không thể gắn bằng chứng. Kiểm tra lại ID tin nhắn.");
    } finally {
      setIsAddingEvidence(false);
    }
  };

  const handleRemoveEvidence = async (linkId: number) => {
    if (!evidenceModalItem) return;
    setDeletingEvidenceId(linkId);
    try {
      await analysisService.removeEvidenceLink(evidenceModalItem.id, linkId);
      setEvidenceLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err: any) {
      console.error("Lỗi gỡ bằng chứng:", err);
      alert(err.message || "Không thể gỡ bằng chứng.");
    } finally {
      setDeletingEvidenceId(null);
    }
  };

  // State & Handlers cho API #8: POST /api/analysis-items/{itemId}/confirmation (Thẩm định AI Stakeholder)
  const [confirmModalItem, setConfirmModalItem] = useState<AnalysisItemDto | null>(null);
  const [confirmAgentId, setConfirmAgentId] = useState<number | string>("");
  const [confirmNote, setConfirmNote] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [confirmResult, setConfirmResult] = useState<AnalysisConfirmationResultDto | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleOpenConfirm = (item: AnalysisItemDto) => {
    setConfirmModalItem(item);
    setConfirmResult(null);
    setConfirmError(null);
    setConfirmNote("");
    if (activeAgents.length > 0) {
      setConfirmAgentId(activeAgents[0].id);
    } else {
      setConfirmAgentId("");
    }
  };

  const handleRunConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmModalItem) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      const byok = getStoredByokConfig();
      const res = await analysisService.confirmAnalysisItem(
        confirmModalItem.id,
        {
          agentId: confirmAgentId ? Number(confirmAgentId) : undefined,
          evidenceNote: confirmNote.trim() || undefined,
        },
        byok ? { provider: byok.provider, model: byok.model, apiKey: byok.apiKey } : undefined
      );
      setConfirmResult(res);
      // Nếu AI xác nhận là Confirmed, tự động cập nhật trạng thái trong state
      if (res.outcome === "Confirmed") {
        setApiAnalysisItems((prev) =>
          prev.map((it) =>
            it.id === confirmModalItem.id ? { ...it, status: AnalysisItemStatus.Confirmed } : it
          )
        );
      }
    } catch (err: any) {
      console.error("Lỗi thẩm định AI:", err);
      setConfirmError(err.message || "Không thể thẩm định với AI Stakeholder.");
    } finally {
      setIsConfirming(false);
    }
  };

  const loadItems = useCallback(async () => {
    if (!currentSessionId) return;
    setLoadingItems(true);
    setFetchError(null);
    try {
      const data = await analysisService.getAnalysisItems(currentSessionId);
      setApiAnalysisItems(data || []);
    } catch (err: any) {
      console.warn("Lỗi tải analysis items từ API:", err);
      setFetchError(err.message || "Không thể tải danh sách từ máy chủ");
    } finally {
      setLoadingItems(false);
    }
  }, [currentSessionId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <>
      <PageHeader
        eyebrow="Bước 3/5 · Phân tích & Thẩm định"
        title="Trung tâm Phân tích & Bằng chứng"
        description="Đối soát bằng chứng phỏng vấn, giải quyết xung đột, phân loại giả định và kiểm soát tính truy vết theo chuẩn BABOK® v3."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("simulation")} className="border-slate/20 text-xs">
              Biên bản phỏng vấn
            </Button>
            <Button onClick={() => navigate("artifacts")} className="bg-navy text-xs font-semibold hover:bg-navy-light">
              Tài liệu bàn giao (BRD, RTM) <ArrowRight size={16} />
            </Button>
          </>
        }
      />

      {/* Metrics Ribbon */}
      <Card className="mb-5 flex divide-x divide-slate/15 overflow-x-auto border-slate/15">
        {[
          ["6/6", "Stakeholder đã phỏng vấn", "bg-navy/10 text-navy"],
          ["9/12", "Bằng chứng đã đối soát", "bg-emerald-500/10 text-emerald-800"],
          ["4", "Phát hiện nghiệp vụ", "bg-purple-500/10 text-purple-800"],
          ["4", "Giả định cần kiểm chứng", "bg-amber-500/10 text-amber-800"],
          ["5", "Yêu cầu đã đặc tả", "bg-sky-500/10 text-sky-800"],
          ["1", "Điểm nghẽn cần giải quyết", "bg-rose-500/10 text-rose-800"],
        ].map(([value, label, tone]) => (
          <div key={label} className="flex min-w-[170px] flex-1 items-center gap-3 px-4 py-3">
            <span className={classNames("grid h-9 min-w-9 place-items-center rounded-xl px-2 text-sm font-black", tone)}>
              {value}
            </span>
            <span className="text-xs font-medium text-slate">{label}</span>
          </div>
        ))}
      </Card>

      {/* Tabs navigation */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate/15 bg-white p-1.5 shadow-xs">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={classNames(
              "shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
              tab === item
                ? "bg-navy text-white shadow-xs"
                : "text-slate hover:bg-mist/30 hover:text-navy"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Tab: Session Summary */}
      {tab === "Tổng quan phiên" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-slate/15">
            <div className="border-b border-slate/10 p-5">
              <h2 className="text-base font-bold text-navy">Sổ ghi chép các phiên khơi gợi yêu cầu (Elicitation Register)</h2>
              <p className="mt-1 text-xs text-slate">Mỗi cuộc phỏng vấn có kỹ thuật áp dụng, phạm vi thông tin thu thập và kết quả cụ thể.</p>
            </div>
            <div className="divide-y divide-slate/10">
              {stakeholders.map((person, index) => (
                <div key={person.id} className="grid gap-4 p-5 md:grid-cols-[220px_1fr_auto] md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-xs font-bold text-navy shadow-xs" style={{ backgroundColor: person.color }}>
                      {person.initials}
                    </span>
                    <div>
                      <strong className="block text-sm font-bold text-navy">{person.name}</strong>
                      <span className="text-xs text-slate">{person.role}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy/90">
                      {[
                        "Quy trình kho, hàng trả về & đối soát số lượng tồn thực tế",
                        "Phạm vi thời gian, ngân sách dự án & mục tiêu MVP cơ bản",
                        "Chỉ số KPI đáp ứng đơn hàng & quy định kiểm tra tồn kho",
                        "Dự báo nhu cầu 8 tuần & định mức tồn kho tối thiểu (Min-Max)",
                        "Thao tác quét mã vạch và xử lý ghi sổ tạm thời",
                        "Quy định phân quyền ký duyệt và kiểm soát sai lệch số liệu",
                      ][index]}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {([
                        ["Quy trình", "Điểm đau", "Dữ liệu"],
                        ["Ràng buộc", "Phạm vi", "Quản trị"],
                        ["KPI", "Phạm vi", "Quyết định"],
                        ["Quy tắc", "Dữ liệu", "Ngoại lệ"],
                        ["Quan sát", "Điểm đau", "Phi chức năng"],
                        ["Quy tắc", "Kiểm soát", "Kiểm toán"],
                      ][index]).map((item) => (
                        <span key={item} className="rounded-md bg-mist/50 px-2 py-0.5 text-[10px] font-semibold text-navy/70">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge tone="green">Đã phỏng vấn</Badge>
                    <p className="mt-1.5 text-[11px] text-slate">Phỏng vấn + Đối soát</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <aside className="space-y-5">
            <Card className="p-5 border-slate/15">
              <div className="flex items-center gap-2.5">
                <SearchCheck className="text-navy" size={20} />
                <h2 className="text-sm font-bold text-navy">Tiêu chuẩn hoàn tất (Definition of Done)</h2>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["Nguồn gốc và thời điểm cho từng bằng chứng", true],
                  ["Phân biệt rõ sự thật (fact) và nhận định chủ quan", true],
                  ["Xung đột có người chịu trách nhiệm giải quyết", true],
                  ["Stakeholder xác nhận tính chính xác của phát hiện", false],
                  ["Yêu cầu có tiêu chí chấp nhận đo lường được", true],
                ].map(([label, done]) => (
                  <div key={String(label)} className="flex items-start gap-2.5 text-xs">
                    <span className={classNames("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full", done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {done ? <CheckCircle2 size={12} /> : <CircleHelp size={12} />}
                    </span>
                    <span className="leading-5 text-slate font-medium">{String(label)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-amber-400/30 bg-amber-500/5 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
                <div>
                  <h3 className="text-xs font-bold text-amber-900 uppercase">Điểm nghẽn cần giải quyết (FND-04)</h3>
                  <p className="mt-1.5 text-xs leading-5 text-amber-900/80">
                    Phát hiện FND-04 chưa được nhân viên kho xác thực vì máy quét cũ không hiển thị hàng đợi giao dịch đang chờ đồng bộ dữ liệu.
                  </p>
                  <button onClick={() => setTab("Xung đột & Câu hỏi mở")} className="mt-3 text-xs font-bold text-amber-800 hover:underline">
                    Xem câu hỏi tồn đọng →
                  </button>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}

      {/* Tab: Findings & Evidence */}
      {tab === "Phát hiện & Bằng chứng" && (
        <div className="space-y-6">
          {/* API Sync Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate/15 bg-white p-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-navy/10 text-navy">
                <Database size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-navy flex items-center gap-2">
                  <span>API: GET /api/sessions/{currentSessionId ?? "{sessionId}"}/analysis-items</span>
                  <Badge tone={currentSessionId ? "green" : "amber"}>
                    {currentSessionId ? `Phiên #${currentSessionId}` : "Chưa chọn phiên"}
                  </Badge>
                </p>
                <p className="text-[11px] text-slate">
                  {loadingItems
                    ? "Đang đồng bộ dữ liệu từ máy chủ..."
                    : apiAnalysisItems.length > 0
                    ? `Đã tải ${apiAnalysisItems.length} mục phân tích trực tiếp từ Backend`
                    : "Chưa có mục phân tích trong DB phiên này (Đang hiển thị bản mẫu kịch bản)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={loadItems}
                disabled={loadingItems || !currentSessionId}
                className="text-xs gap-1.5 border-slate/20"
              >
                <RefreshCcw size={12} className={loadingItems ? "animate-spin" : ""} />
                Làm mới
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setCreateError(null);
                  setShowCreateModal(true);
                }}
                className="bg-navy text-white text-xs gap-1.5 hover:bg-navy-light shadow-xs"
              >
                <Plus size={14} />
                Thêm mục phân tích
              </Button>
            </div>
          </div>

          {/* Toast thông báo tạo thành công */}
          {createSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{createSuccessMsg}</span>
            </div>
          )}

          {/* Hiển thị dữ liệu thật từ Backend nếu có */}
          {apiAnalysisItems.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy mb-3">
                Mục phân tích từ Database ({apiAnalysisItems.length} mục)
              </h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {apiAnalysisItems.map((item) => {
                  const statusInfo = analysisItemStatusLabels[item.status as number] || {
                    text: String(item.status),
                    tone: "amber" as const,
                  };
                  const typeLabel = analysisItemTypeLabels[item.itemType as number] || String(item.itemType);
                  return (
                    <Card key={item.id} className="p-5 border-slate/15 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/10 font-mono text-xs font-bold text-navy">
                            {item.code || `#${item.id}`}
                          </span>
                          <div>
                            <p className="text-[11px] font-bold text-slate">
                              {typeLabel} · ID #{item.id}
                            </p>
                            <h4 className="mt-0.5 text-sm font-bold text-navy">{item.title}</h4>
                          </div>
                        </div>
                        <Badge tone={statusInfo.tone}>{statusInfo.text}</Badge>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-slate">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate/10 pt-3 text-[11px] text-slate">
                        <div className="flex items-center gap-3">
                          <span>Khởi tạo: {new Date(item.createdAt).toLocaleDateString("vi-VN")}</span>
                          {item.priority !== undefined && item.priority !== null && (
                            <span className="font-semibold text-navy">Ưu tiên: {item.priority}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEvidence(item)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate hover:bg-sky-50 hover:text-sky-700 transition-colors"
                            title="Quản lý bằng chứng hội thoại"
                          >
                            <Link2 size={12} />
                            <span>Bằng chứng</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenConfirm(item)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate hover:bg-purple-50 hover:text-purple-700 transition-colors"
                            title="Thẩm định với AI Stakeholder"
                          >
                            <Sparkles size={12} />
                            <span>Thẩm định AI</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate hover:bg-mist/60 hover:text-navy transition-colors"
                            title="Chỉnh sửa nội dung & trạng thái"
                          >
                            <Pencil size={12} />
                            <span>Sửa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            disabled={deletingItemId === item.id}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-slate hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Lưu trữ / Xoá mục phân tích"
                          >
                            {deletingItemId === item.id ? (
                              <Loader2 size={12} className="animate-spin text-rose-500" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dữ liệu mẫu tham chiếu */}
          <div>
            {apiAnalysisItems.length > 0 && (
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate/80 mb-3 mt-6">
                Phát hiện mẫu tham chiếu chuẩn kịch bản
              </h3>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              {findings.map((finding) => (
                <Card key={finding.id} className="p-5 border-slate/15">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/10 font-mono text-xs font-bold text-navy">
                        {finding.id.replace("FND-", "")}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate">{finding.id} · Phụ trách: {finding.owner}</p>
                        <h3 className="mt-1 text-sm font-bold text-navy">{finding.title}</h3>
                      </div>
                    </div>
                    {statusBadge(finding.status)}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate">{finding.interpretation}</p>
                  <div className="mt-4 flex items-center gap-2 border-t border-slate/10 pt-3 text-xs font-semibold text-navy">
                    <Link2 size={13} className="text-brass" /> Bằng chứng liên kết: {finding.evidenceIds.join(" · ")}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-slate/15">
            <div className="flex items-center gap-3 border-b border-slate/10 p-5">
              <MessageSquareQuote className="text-navy" size={20} />
              <div>
                <h2 className="text-base font-bold text-navy">Kho lưu trữ bằng chứng phỏng vấn (Evidence Register)</h2>
                <p className="text-xs text-slate">Dữ liệu gốc giữ nguyên ngữ cảnh, người cung cấp, mức độ tin cậy và liên kết tới yêu cầu.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-xs">
                <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
                  <tr>
                    <th className="px-5 py-3.5">Mã ID</th>
                    <th className="px-5 py-3.5">Trích dẫn bằng chứng</th>
                    <th className="px-5 py-3.5">Nguồn cung cấp</th>
                    <th className="px-5 py-3.5">Phân loại</th>
                    <th className="px-5 py-3.5">Độ tin cậy</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5">Yêu cầu liên kết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate/10">
                  {evidenceRegister.map((item) => (
                    <tr key={item.id} className="hover:bg-mist/10">
                      <td className="px-5 py-4 font-mono font-bold text-navy">{item.id}</td>
                      <td className="max-w-md px-5 py-4 font-medium leading-5 text-navy/90">“{item.quote}”</td>
                      <td className="px-5 py-4 text-slate">{item.source}</td>
                      <td className="px-5 py-4"><Badge tone="navy">{item.category}</Badge></td>
                      <td className="px-5 py-4 text-slate">{item.confidence}</td>
                      <td className="px-5 py-4">{statusBadge(item.status)}</td>
                      <td className="px-5 py-4 font-mono font-semibold text-navy">{item.linkedRequirements.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Conflicts & Questions */}
      {tab === "Xung đột & Câu hỏi mở" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {conflicts.map((conflict) => (
              <Card key={conflict.id} className="p-6 border-slate/15">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate">{conflict.id}</p>
                    <h2 className="mt-1 text-base font-bold text-navy">{conflict.topic}</h2>
                  </div>
                  {statusBadge(conflict.status)}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {conflict.positions.map((item) => (
                    <div key={item.stakeholder} className="rounded-xl border border-slate/10 bg-mist/20 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-navy">{item.stakeholder}</p>
                      <p className="mt-1.5 text-xs leading-5 text-slate">{item.position}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3.5 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3.5">
                  <strong className="text-xs font-bold text-amber-800">Tác động nếu không xử lý</strong>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">{conflict.impact}</p>
                </div>
                <div className="mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <strong className="text-xs font-bold text-emerald-800">Giải pháp / Hướng quyết định</strong>
                  <p className="mt-1 text-xs leading-5 text-emerald-900/80">{conflict.resolution}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="h-fit p-5 border-slate/15">
            <div className="flex items-center gap-2.5">
              <CircleHelp className="text-brass" size={20} />
              <h2 className="text-sm font-bold text-navy">Sổ theo dõi câu hỏi mở</h2>
            </div>
            <div className="mt-4 space-y-3">
              {openQuestions.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <Badge tone="amber">{item.id}</Badge>
                    <span className="text-[11px] text-slate">Hạn: {item.due}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-5 text-navy">{item.question}</p>
                  <p className="mt-2 text-[11px] text-slate">Phụ trách: {item.owner} · {item.relatedTo}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Confirmation */}
      {tab === "Thẩm định Stakeholder" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {confirmations.map((item) => {
            const finding = findings.find((entry) => entry.id === item.findingId);
            return (
              <Card key={item.id} className="p-6 border-slate/15">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate">{item.id} · {item.findingId}</p>
                    <h2 className="mt-1 text-sm font-bold text-navy">{finding?.title}</h2>
                  </div>
                  {statusBadge(item.status)}
                </div>
                <div className="mt-4 flex gap-3 rounded-xl bg-mist/30 p-4">
                  <Users className="mt-0.5 shrink-0 text-navy" size={18} />
                  <div>
                    <strong className="text-xs font-bold text-navy">{item.stakeholder}</strong>
                    <p className="mt-1.5 text-xs leading-5 text-slate italic">“{item.response}”</p>
                    {item.confirmedAt && (
                      <p className="mt-2 text-[11px] text-slate/80">Phản hồi lúc: {item.confirmedAt}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab: Traceability Matrix */}
      {tab === "Ma trận truy vết (RTM)" && (
        <Card className="overflow-hidden border-slate/15">
          <div className="flex items-center gap-3 border-b border-slate/10 p-5">
            <GitMerge className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Chuỗi truy vết: Mục tiêu → Phát hiện → Bằng chứng → Yêu cầu → Tiêu chí nghiệm thu</h2>
              <p className="text-xs text-slate">Đảm bảo từng yêu cầu phần mềm đều bắt nguồn từ nhu cầu kinh doanh và có thể kiểm thử được.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-xs">
              <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
                <tr>
                  {["Mục tiêu kinh doanh", "Phát hiện", "Bằng chứng", "Yêu cầu hệ thống", "Tiêu chí nghiệm thu", "Độ phủ"].map((h) => (
                    <th key={h} className="px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {traceabilityRows.map((row, index) => (
                  <tr key={index} className="align-top hover:bg-mist/10">
                    <td className="px-5 py-4 font-semibold text-navy">{row.objective}</td>
                    <td className="px-5 py-4 font-mono font-bold text-navy">{row.finding}</td>
                    <td className="px-5 py-4 text-slate">{row.evidence}</td>
                    <td className="px-5 py-4 font-mono font-bold text-navy">{row.requirement}</td>
                    <td className="max-w-sm px-5 py-4 leading-5 text-slate">{row.acceptance}</td>
                    <td className="px-5 py-4">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Risks & Decisions */}
      {tab === "Rủi ro & Quyết định" && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card className="overflow-hidden border-slate/15">
            <div className="flex items-center gap-3 border-b border-slate/10 p-5">
              <ShieldAlert className="text-amber-600" size={20} />
              <h2 className="text-base font-bold text-navy">Nhật ký rủi ro (Risk Register)</h2>
            </div>
            <div className="divide-y divide-slate/10">
              {risks.map((risk) => (
                <div key={risk.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate">{risk.id}</span>
                      <h3 className="mt-0.5 text-sm font-bold text-navy">{risk.title}</h3>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge tone={risk.probability === "High" ? "red" : "amber"}>Xác suất: {risk.probability}</Badge>
                      <Badge tone={risk.impact === "High" ? "red" : "amber"}>Tác động: {risk.impact}</Badge>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs leading-5 text-slate">
                    <strong className="text-navy">Biện pháp ứng phó:</strong> {risk.response}
                  </p>
                  <p className="mt-1 text-[11px] text-slate">Phụ trách: {risk.owner}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="h-fit p-5 border-slate/15">
            <div className="flex items-center gap-3">
              <FileSearch className="text-navy" size={20} />
              <h2 className="text-base font-bold text-navy">Sổ ghi chép quyết định (Decision Log)</h2>
            </div>
            <div className="mt-4 space-y-3.5">
              {decisions.map((decision) => (
                <div key={decision.id} className="rounded-xl border border-slate/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate">{decision.id}</span>
                    {statusBadge(decision.status)}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-navy">{decision.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate">{decision.rationale}</p>
                  <p className="mt-2 text-[11px] text-slate/80">{decision.decidedBy} · {decision.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Change Impact */}
      {tab === "Tác động thay đổi" && <ChangeImpactSection />}

      {/* Tab: Assumptions & Gaps */}
      {tab === "Giả định & Lỗ hổng" && <AssumptionsAndGapsSection />}

      {/* Tab: Requirements */}
      {tab === "Đặc tả yêu cầu" && <RequirementAnalysisSection />}

      {/* Modal API #2: POST /api/sessions/{sessionId}/analysis-items */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">Thêm mục phân tích mới</h3>
                <p className="text-[11px] text-slate mt-0.5">
                  POST /api/sessions/{currentSessionId ?? "{sessionId}"}/analysis-items
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#667d93] hover:text-[#132d49] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            {!currentSessionId && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Hiện tại bạn chưa chọn phiên mô phỏng nào. Vui lòng mở trang <strong>Mô phỏng</strong> để bắt đầu phiên trước khi tạo.
                </span>
              </div>
            )}

            <form onSubmit={handleCreateItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Loại mục phân tích</label>
                  <select
                    value={createForm.itemType}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, itemType: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  >
                    <option value={AnalysisItemType.Finding}>Phát hiện (Finding)</option>
                    <option value={AnalysisItemType.Requirement}>Yêu cầu (Requirement)</option>
                    <option value={AnalysisItemType.BusinessRule}>Quy tắc (Business Rule)</option>
                    <option value={AnalysisItemType.Constraint}>Ràng buộc (Constraint)</option>
                    <option value={AnalysisItemType.Risk}>Rủi ro (Risk)</option>
                    <option value={AnalysisItemType.OpenQuestion}>Câu hỏi mở (Open Question)</option>
                    <option value={AnalysisItemType.Conflict}>Xung đột (Conflict)</option>
                    <option value={AnalysisItemType.Assumption}>Giả định (Assumption)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Mức ưu tiên</label>
                  <select
                    value={createForm.priority ?? PriorityLevel.Medium}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, priority: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  >
                    <option value={PriorityLevel.Low}>Thấp (Low)</option>
                    <option value={PriorityLevel.Medium}>Trung bình (Medium)</option>
                    <option value={PriorityLevel.High}>Cao (High)</option>
                    <option value={PriorityLevel.Critical}>Khẩn cấp (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  maxLength={200}
                  placeholder="VD: Không hiển thị hàng đợi đồng bộ trên máy quét..."
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Mô tả chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mô tả bối cảnh ghi nhận qua phỏng vấn hoặc tài liệu, tác động nghiệp vụ..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#e2e9ef] pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !createForm.title.trim() || !createForm.description.trim()}
                  className="bg-navy text-white text-xs gap-1.5 hover:bg-navy-light"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu vào máy chủ</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal API #3: PATCH /api/sessions/{sessionId}/analysis-items/{itemId} */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Chỉnh sửa mục phân tích: {editingItem.code || `#${editingItem.id}`}
                </h3>
                <p className="text-[11px] text-slate mt-0.5">
                  PATCH /api/sessions/{currentSessionId}/analysis-items/{editingItem.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-[#667d93] hover:text-[#132d49] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {updateError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Trạng thái (Status)</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  >
                    <option value={AnalysisItemStatus.Draft}>Bản nháp (Draft)</option>
                    <option value={AnalysisItemStatus.Confirmed}>Đã xác nhận (Confirmed)</option>
                    <option value={AnalysisItemStatus.Resolved}>Đã giải quyết (Resolved)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Mức ưu tiên</label>
                  <select
                    value={editForm.priority ?? PriorityLevel.Medium}
                    onChange={(e) =>
                      setEditForm({ ...editForm, priority: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  >
                    <option value={PriorityLevel.Low}>Thấp (Low)</option>
                    <option value={PriorityLevel.Medium}>Trung bình (Medium)</option>
                    <option value={PriorityLevel.High}>Cao (High)</option>
                    <option value={PriorityLevel.Critical}>Khẩn cấp (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  maxLength={200}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Mô tả chi tiết <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#e2e9ef] pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={isUpdating}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating || !editForm.title?.trim() || !editForm.description?.trim()}
                  className="bg-navy text-white text-xs gap-1.5 hover:bg-navy-light"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Cập nhật</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal API #5, #6, #7: Quản lý Bằng chứng (Evidence Links) */}
      {evidenceModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Quản lý Bằng chứng: {evidenceModalItem.code || `#${evidenceModalItem.id}`}
                </h3>
                <p className="text-[11px] text-slate mt-0.5">
                  /api/analysis-items/{evidenceModalItem.id}/evidence
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEvidenceModalItem(null)}
                className="text-[#667d93] hover:text-[#132d49] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {evidenceError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{evidenceError}</span>
              </div>
            )}

            {/* Form gắn bằng chứng mới (POST) */}
            <form onSubmit={handleAddEvidence} className="mt-4 rounded-xl border border-slate/15 bg-mist/20 p-3.5">
              <h4 className="text-xs font-bold text-navy flex items-center gap-1.5 mb-2.5">
                <Plus size={14} /> Gắn tin nhắn phỏng vấn làm bằng chứng
              </h4>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">
                    Tin nhắn trong hội thoại
                  </label>
                  {messages && messages.length > 0 ? (
                    <select
                      value={newEvidenceMessageId}
                      onChange={(e) => setNewEvidenceMessageId(e.target.value)}
                      className="w-full rounded-xl border border-[#d9e4ec] bg-white p-2 text-xs text-[#132d49] outline-none"
                    >
                      <option value="">-- Chọn tin nhắn --</option>
                      {messages.map((m) => (
                        <option key={m.id} value={m.id}>
                          #{m.id} [{m.sender === "learner" ? "Học viên" : "Stakeholder"}]: {m.text.slice(0, 45)}...
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      type="number"
                      placeholder="Nhập ID tin nhắn..."
                      value={newEvidenceMessageId}
                      onChange={(e) => setNewEvidenceMessageId(e.target.value)}
                      className="w-full rounded-xl border border-[#d9e4ec] bg-white p-2 text-xs text-[#132d49] outline-none"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-navy mb-1">
                    Quan hệ bằng chứng
                  </label>
                  <select
                    value={newEvidenceRelation}
                    onChange={(e) => setNewEvidenceRelation(Number(e.target.value))}
                    className="w-full rounded-xl border border-[#d9e4ec] bg-white p-2 text-xs text-[#132d49] outline-none"
                  >
                    <option value={EvidenceRelationshipType.Supports}>Hỗ trợ (Supports)</option>
                    <option value={EvidenceRelationshipType.Contradicts}>Mâu thuẫn (Contradicts)</option>
                    <option value={EvidenceRelationshipType.Clarifies}>Làm rõ (Clarifies)</option>
                    <option value={EvidenceRelationshipType.Confirms}>Xác nhận (Confirms)</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isAddingEvidence || !newEvidenceMessageId}
                  className="bg-navy text-white text-xs gap-1 hover:bg-navy-light"
                >
                  {isAddingEvidence && <Loader2 size={12} className="animate-spin" />}
                  <span>Gắn bằng chứng</span>
                </Button>
              </div>
            </form>

            {/* Danh sách bằng chứng hiện tại (GET) */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-navy mb-2">
                Bằng chứng đã liên kết ({evidenceLinks.length})
              </h4>
              {loadingEvidence ? (
                <div className="flex items-center justify-center py-6 text-xs text-slate">
                  <Loader2 size={16} className="animate-spin mr-2" /> Đang tải danh sách bằng chứng...
                </div>
              ) : evidenceLinks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate/20 p-5 text-center text-xs text-slate">
                  Chưa có liên kết bằng chứng nào. Hãy gắn tin nhắn từ cuộc phỏng vấn ở trên để củng cố luận cứ!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {evidenceLinks.map((link) => {
                    const rel = evidenceRelationshipLabels[link.relationshipType as number] || {
                      text: "Bằng chứng",
                      tone: "navy" as const,
                    };
                    return (
                      <div
                        key={link.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate/15 p-3 text-xs bg-white"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge tone={rel.tone}>{rel.text}</Badge>
                            <span className="font-mono text-[10px] text-slate">
                              Tin nhắn #{link.messageId}
                            </span>
                            {link.senderType && (
                              <span className="text-[10px] text-slate">({link.senderType})</span>
                            )}
                          </div>
                          <p className="mt-1.5 text-xs text-navy italic">
                            “{link.messageContent || "(Nội dung tin nhắn trong transcript phỏng vấn)"}”
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(link.id)}
                          disabled={deletingEvidenceId === link.id}
                          className="shrink-0 p-1 text-slate hover:text-rose-600 transition-colors"
                          title="Gỡ bằng chứng này"
                        >
                          {deletingEvidenceId === link.id ? (
                            <Loader2 size={13} className="animate-spin text-rose-500" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal API #8: Thẩm định Mục phân tích với AI Stakeholder */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Thẩm định với AI Stakeholder: {confirmModalItem.code || `#${confirmModalItem.id}`}
                </h3>
                <p className="text-[11px] text-slate mt-0.5">
                  POST /api/analysis-items/{confirmModalItem.id}/confirmation
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModalItem(null)}
                className="text-[#667d93] hover:text-[#132d49] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {confirmError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{confirmError}</span>
              </div>
            )}

            <div className="mt-3 rounded-xl bg-mist/20 p-3 text-xs">
              <strong className="block text-navy font-bold">{confirmModalItem.title}</strong>
              <p className="mt-1 text-slate">{confirmModalItem.description}</p>
            </div>

            {!confirmResult ? (
              <form onSubmit={handleRunConfirm} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">
                    Chọn Stakeholder AI thẩm định
                  </label>
                  {activeAgents && activeAgents.length > 0 ? (
                    <select
                      value={confirmAgentId}
                      onChange={(e) => setConfirmAgentId(e.target.value)}
                      className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none"
                    >
                      {activeAgents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.stakeholderRole})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={confirmAgentId}
                      onChange={(e) => setConfirmAgentId(e.target.value)}
                      className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none"
                    >
                      <option value="1">Nguyễn Văn An (Trưởng kho vận)</option>
                      <option value="2">Trần Thị Bình (Chuyên viên Kế hoạch)</option>
                      <option value="3">Lê Hoàng Nam (Kế toán trưởng)</option>
                      <option value="4">Phạm Minh Đức (Giám đốc Chuỗi cung ứng)</option>
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">
                    Ghi chú / Tóm tắt gửi Stakeholder (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: Nhờ anh/chị xác nhận lại số liệu tồn kho an toàn và tần suất kiểm kê..."
                    value={confirmNote}
                    onChange={(e) => setConfirmNote(e.target.value)}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmModalItem(null)}
                    disabled={isConfirming}
                    className="text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isConfirming}
                    className="bg-navy text-white text-xs gap-1.5 hover:bg-navy-light"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>AI đang thẩm định...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        <span>Gửi thẩm định AI</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-4 space-y-3">
                <div
                  className={classNames(
                    "rounded-xl border p-4 text-xs",
                    confirmResult.outcome === "Confirmed"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : confirmResult.outcome === "Disputed"
                      ? "border-rose-200 bg-rose-50 text-rose-900"
                      : "border-amber-200 bg-amber-50 text-amber-900"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      Kết quả từ {confirmResult.personaName} ({confirmResult.stakeholderRole})
                    </span>
                    <Badge
                      tone={
                        confirmResult.outcome === "Confirmed"
                          ? "green"
                          : confirmResult.outcome === "Disputed"
                          ? "red"
                          : "amber"
                      }
                    >
                      {confirmResult.outcome === "Confirmed"
                        ? "Đã xác nhận (Confirmed)"
                        : confirmResult.outcome === "Disputed"
                        ? "Bác bỏ (Disputed)"
                        : "Chưa đủ thông tin"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 font-medium">{confirmResult.reasoning}</p>
                  {confirmResult.suggestedClarification && (
                    <div className="mt-2.5 rounded-lg bg-white/70 p-2.5 text-[11px] text-slate">
                      <strong>Gợi ý làm rõ thêm:</strong> {confirmResult.suggestedClarification}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    onClick={() => setConfirmModalItem(null)}
                    className="bg-navy text-white text-xs"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function AssumptionsAndGapsSection() {
  const assumptions = [
    {
      id: "ASM-01",
      statement: "Độ trễ truyền tin của POS là nguyên nhân chính gây đứt gãy tồn kho.",
      basis: "Báo cáo vận hành Quý 3",
      impact: "Giải pháp có thể sai hướng nếu nguyên nhân thực sự nằm ở khâu phân bổ hoặc khu cách ly.",
      owner: "Giám đốc Chuỗi cung ứng",
      status: "needs-clarification",
      linked: "FND-01 · RSK-01",
    },
    {
      id: "ASM-02",
      statement: "Tất cả các kho đều dùng chung mã SKU và đơn vị tính (UOM).",
      basis: "Hồ sơ dự án (Project Brief)",
      impact: "Nếu sai, quy tắc ưu tiên chuyển kho sẽ gây sai lệch tồn kho vật lý.",
      owner: "Trưởng nhóm Dữ liệu chủ",
      status: "confirmed",
      linked: "FR-08 · DATA-02",
    },
    {
      id: "ASM-03",
      statement: "Điều chuyển tồn kho nội bộ luôn có chi phí rẻ hơn tạo đơn mua hàng mới.",
      basis: "Ý kiến ban đầu của Chuyên viên Kế hoạch",
      impact: "Chi phí có thể đội lên nếu cung đường chuyển kho quá xa hoặc nhà cung cấp có chiết khấu cao.",
      owner: "Kế toán trưởng",
      status: "needs-clarification",
      linked: "CF-02 · DEC-01",
    },
    {
      id: "ASM-04",
      statement: "Máy quét mã vạch hiện tại hỗ trợ lưu hàng đợi offline và sinh mã giao dịch duy nhất.",
      basis: "Tài liệu kỹ thuật thiết bị chưa được kiểm chứng",
      impact: "Thiết kế nghiệp vụ offline có thể không khả thi trên thiết bị hiện có.",
      owner: "Bộ phận IT Kho vận",
      status: "unconfirmed",
      linked: "FND-04 · NFR-03",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="overflow-hidden border-slate/15">
        <div className="flex items-center gap-3 border-b border-slate/10 p-5">
          <FileQuestion className="text-navy" size={20} />
          <div>
            <h2 className="text-base font-bold text-navy">Sổ ghi nhận giả định (Assumption Register)</h2>
            <p className="text-xs text-slate">Những điều học viên đang ngầm định là đúng nhưng cần kiểm chứng trước khi đưa vào thiết kế hệ thống.</p>
          </div>
        </div>
        <div className="divide-y divide-slate/10">
          {assumptions.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-slate">{item.id}</p>
                  <h3 className="mt-0.5 text-sm font-bold text-navy">{item.statement}</h3>
                </div>
                {statusBadge(item.status)}
              </div>
              <div className="mt-3.5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-mist/30 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Cơ sở giả định</p>
                  <p className="mt-1 text-xs leading-5 text-navy">{item.basis}</p>
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Rủi ro nếu sai</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">{item.impact}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate">Xác minh với: <strong className="text-navy">{item.owner}</strong></span>
                <span className="font-mono text-[11px] font-bold text-navy">Liên kết: {item.linked}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <aside className="space-y-5">
        <Card className="p-5 border-slate/15">
          <div className="flex items-center gap-2.5">
            <CircleHelp className="text-brass" size={20} />
            <h2 className="text-sm font-bold text-navy">Lỗ hổng thông tin & Câu hỏi mở</h2>
          </div>
          <div className="mt-4 space-y-3">
            {openQuestions.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate/10 p-3.5">
                <div className="flex items-center justify-between">
                  <Badge tone="amber">{item.id}</Badge>
                  <span className="text-[11px] text-slate">Hạn: {item.due}</span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-navy">{item.question}</p>
                <p className="mt-2 text-[11px] text-slate">Phụ trách: {item.owner} · {item.relatedTo}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-navy/15 bg-navy/5 p-5">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">AI & Chuyên gia đánh giá điều gì?</h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate">
            <li>• Học viên có phân biệt rõ sự thật (fact) và giả định (assumption)?</li>
            <li>• Mỗi giả định có cơ sở và đánh giá tác động rủi ro?</li>
            <li>• Trách nhiệm xác thực có được giao đúng Stakeholder?</li>
            <li>• Các điểm nghẽn cản trở yêu cầu có được theo dõi sát sao?</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function RequirementAnalysisSection() {
  const details: Record<string, { rationale: string; acceptance: string; trace: string; gap?: string }> = {
    "BR-01": {
      rationale: "Bảo vệ mục tiêu giảm đứt hàng (stockout) và tỷ lệ đáp ứng (fill rate) trong phạm vi thử nghiệm.",
      acceptance: "Tỷ lệ đứt hàng < 5% và tỷ lệ đáp ứng >= 96% sau 8 tuần thử nghiệm.",
      trace: "OBJ-01 · EV-03 · FND-02",
    },
    "SR-04": {
      rationale: "Chuyên viên Kế hoạch phải đối soát kho dư thừa trong toàn mạng lưới trước khi mua mới.",
      acceptance: "Mọi gợi ý nhập hàng phải tự động kiểm tra lượng hàng khả chuyển trước khi cho phép tạo PO.",
      trace: "EV-03 · EV-04 · FND-02",
    },
    "FR-08": {
      rationale: "Cắt giảm mua mới khi các kho vùng khác đang có tồn kho dư thừa.",
      acceptance: "Kiểm tra tồn dư thừa trước khi tạo PO mua hàng; hiển thị số lượng, ETA, chi phí vận chuyển và lý do nếu người dùng ghi đè.",
      trace: "OBJ-01 · EV-03 · EV-04 · FND-02",
    },
    "NFR-03": {
      rationale: "Kho phải tiếp tục ghi nhận xuất nhập tồn ngay cả khi kết nối mạng chập chờn.",
      acceptance: "Mỗi giao dịch có ID duy nhất; đồng bộ lại không sinh bản ghi trùng; màn hình hiển thị hàng đợi đang chờ.",
      trace: "EV-08 · FND-04",
      gap: "Khả năng lưu trữ của thiết bị và ngưỡng thời gian thử lại chưa được kiểm định.",
    },
    "TR-02": {
      rationale: "Đảm bảo số liệu tồn ban đầu chính xác tuyệt đối trước khi golive hệ thống thử nghiệm.",
      acceptance: "100% SKU thử nghiệm được đối soát và Kế toán ký biên bản nghiệm thu trước khi chuyển giao.",
      trace: "RSK-04 · Xác nhận từ Kế toán trưởng",
    },
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-slate/15">
        <div className="flex flex-col gap-3 border-b border-slate/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Sổ đặc tả yêu cầu nghiệp vụ sơ bộ</h2>
              <p className="text-xs text-slate">Các yêu cầu do học viên phân tích từ dữ liệu thu thập; làm cơ sở cho BRD và RTM.</p>
            </div>
          </div>
          <Button variant="secondary" className="border-slate/20 text-xs">+ Thêm yêu cầu</Button>
        </div>
        <div className="divide-y divide-slate/10">
          {requirements.map((item) => {
            const detail = details[item.id];
            return (
              <div key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="grid h-10 min-w-10 place-items-center rounded-xl bg-navy/10 px-2 font-mono text-xs font-black text-navy">
                      {item.id}
                    </span>
                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="gray">{item.type}</Badge>
                        <Badge tone={item.priority === "Must" ? "red" : "amber"}>{item.priority}</Badge>
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold text-navy">{item.title}</h3>
                    </div>
                  </div>
                  {statusBadge(item.status)}
                </div>
                <div className="mt-3.5 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl bg-mist/30 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Lý do nghiệp vụ (Rationale)</p>
                    <p className="mt-1 text-xs leading-5 text-slate">{detail?.rationale}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Tiêu chí chấp nhận (Acceptance Criteria)</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-900/80">{detail?.acceptance}</p>
                  </div>
                  <div className="rounded-xl bg-mist/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy">Nguồn & Truy vết (Trace)</p>
                    <p className="mt-1 font-mono text-xs font-semibold text-navy">{detail?.trace}</p>
                  </div>
                </div>
                {detail?.gap && (
                  <div className="mt-3 flex gap-2 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-900">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={15} />
                    {detail.gap}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Độ phủ nguồn gốc</p>
          <strong className="mt-2 block text-3xl font-bold text-navy">4/5</strong>
          <p className="mt-1.5 text-xs text-slate">Yêu cầu có đủ chứng cứ và phát hiện liên kết.</p>
        </Card>
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Tiêu chí đo lường được</p>
          <strong className="mt-2 block text-3xl font-bold text-navy">80%</strong>
          <p className="mt-1.5 text-xs text-slate">Yêu cầu NFR-03 vẫn thiếu ngưỡng thời gian cụ thể.</p>
        </Card>
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Tiêu chuẩn chấm điểm AI</p>
          <p className="mt-2 text-xs leading-5 text-slate">Đánh giá tính rõ ràng, khả thi, kiểm thử được, tạo ra giá trị và truy vết về mục tiêu.</p>
        </Card>
      </div>
    </div>
  );
}

function ChangeImpactSection() {
  const impacts = [
    ["Mục tiêu kinh doanh", "Mục tiêu đứt hàng < 5% và đáp ứng >= 96% đứng trước nguy cơ đổ vỡ."],
    ["Quy trình nghiệp vụ", "Quy trình chuyển kho nội bộ phải kích hoạt sớm hơn và ưu tiên theo vùng."],
    ["Yêu cầu hệ thống", "FR-08 phải tích hợp lịch trình khuyến mãi và thời gian giao hàng thực tế."],
    ["Dữ liệu & API", "Cần dữ liệu tồn khả dụng (ATP), dự báo nhu cầu đột biến và ETA của nhà máy."],
    ["Stakeholder tham vấn", "Kế hoạch, Kho, Kế toán, Bán hàng và Giám đốc điều hành phải cùng thẩm định."],
    ["Rủi ro vận hành", "Đứt hàng, chi phí điều xe khẩn cấp và phân bổ không đồng đều giữa các cửa hàng."],
  ];

  const options = [
    [
      "Điều chuyển 1.800 hộp từ tổng kho trung tâm",
      "Đến trong 2 ngày, tận dụng nguồn tồn dư thừa",
      "Chi phí vận chuyển +9%; kho nguồn mất lượng dự phòng an toàn",
      "Ưu tiên số 1",
    ],
    [
      "Tạo đơn mua hàng khẩn cấp từ nhà cung ứng phụ",
      "Bảo toàn tồn kho cho các vùng miền khác",
      "Phí vận chuyển hỏa tốc rất cao; vẫn trễ 4 ngày",
      "Dự phòng",
    ],
    [
      "Giới hạn số lượng bán khuyến mãi tại cửa hàng",
      "Bảo vệ các cửa hàng trọng điểm",
      "Ảnh hưởng trải nghiệm khách hàng và doanh số cam kết",
      "Chỉ áp dụng khi thiếu",
    ],
  ];

  const consultations = [
    ["Chuyên viên Kế hoạch", "Xác thực lượng hàng dư thừa và dự báo nhu cầu tăng thêm"],
    ["Trưởng kho vận", "Năng lực bốc xếp, giờ chốt xe (cut-off) và ETA chuyển kho"],
    ["Kế toán trưởng", "Hạn mức chi phí phát sinh và thẩm quyền duyệt"],
    ["Trưởng phòng Bán lẻ", "Thứ tự ưu tiên phân bổ hàng cho các cửa hàng"],
  ];

  const updates: Array<[string, string, boolean]> = [
    ["Nhật ký rủi ro", "Bổ sung rủi ro trễ hẹn nhà cung cấp và thiếu hụt hàng khuyến mãi", true],
    ["Sổ quyết định", "Ghi nhận phương án điều chuyển nội bộ 1.800 hộp", true],
    ["Backlog / FR-08", "Bổ sung quy tắc ưu tiên lịch khuyến mãi và ETA", false],
    ["Tiêu chí nghiệm thu", "Bổ sung đo lường thời gian phản hồi và tỷ lệ đáp ứng", false],
  ];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-amber-400/30">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-amber-700 shadow-xs">
                <Truck size={23} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Sự kiện động · 16/09 · 15:10</p>
                <h2 className="mt-1 text-lg font-bold text-navy">Nhà cung cấp sữa MILK-01 trễ hẹn giao 5 ngày</h2>
                <p className="mt-2 max-w-3xl text-xs leading-5 text-slate">
                  Số lượng hàng khả dụng chỉ đủ đáp ứng 3 ngày bán, trong khi đợt khuyến mãi toàn hệ thống sẽ bắt đầu sau 7 ngày nữa. Sponsor yêu cầu BA phân tích lại phương án MVP trước cuộc họp Ban Giám đốc chiều nay.
                </p>
              </div>
            </div>
            <Badge tone="amber">Đang xử lý</Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-6 border-slate/15">
            <div className="flex items-center gap-2.5">
              <RefreshCcw className="text-navy" size={20} />
              <h2 className="text-base font-bold text-navy">Bản đồ tác động thay đổi (Impact Map)</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {impacts.map(([label, copy]) => (
                <div key={label} className="rounded-xl border border-slate/10 bg-mist/20 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-navy">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate">{copy}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-slate/15">
            <div className="border-b border-slate/10 p-5">
              <h2 className="text-base font-bold text-navy">Phân tích phương án & Đánh đổi (Trade-off Analysis)</h2>
              <p className="text-xs text-slate">BA so sánh các khía cạnh lợi ích - chi phí trước khi đưa ra khuyến nghị chính thức.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
                  <tr>
                    <th className="px-5 py-3.5">Phương án đề xuất</th>
                    <th className="px-5 py-3.5">Lợi ích mang lại</th>
                    <th className="px-5 py-3.5">Đánh đổi / Chi phí</th>
                    <th className="px-5 py-3.5">Khuyến nghị BA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate/10">
                  {options.map(([option, benefit, cost, recommendation]) => (
                    <tr key={option} className="hover:bg-mist/10">
                      <td className="px-5 py-4 font-bold text-navy">{option}</td>
                      <td className="px-5 py-4 text-emerald-800">{benefit}</td>
                      <td className="px-5 py-4 text-amber-900">{cost}</td>
                      <td className="px-5 py-4">
                        <Badge tone={recommendation === "Ưu tiên số 1" ? "green" : "navy"}>{recommendation}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5 border-slate/15">
            <h2 className="text-sm font-bold text-navy">Stakeholder cần tham vấn</h2>
            <div className="mt-4 space-y-3">
              {consultations.map(([role, ask], index) => (
                <div key={role} className="rounded-xl border border-slate/10 p-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-navy">{role}</strong>
                    <Badge tone={index < 2 ? "green" : "amber"}>{index < 2 ? "Đã tham vấn" : "Cần hỏi thêm"}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate">{ask}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border-slate/15">
            <h2 className="text-sm font-bold text-navy">Tài liệu cần cập nhật</h2>
            <div className="mt-4 space-y-3">
              {updates.map(([name, copy, done]) => (
                <div key={name} className="flex gap-2.5">
                  <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] ${done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {done ? <CheckCircle2 size={12} /> : <CircleHelp size={12} />}
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-navy">{name}</strong>
                    <p className="mt-0.5 text-xs leading-5 text-slate">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
