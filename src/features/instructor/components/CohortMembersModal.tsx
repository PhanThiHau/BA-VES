import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Trash2,
  X,
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Check,
  Clock,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  cohortService,
  type CohortMemberDto,
} from "../../../services/cohortService";

interface CohortMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohort: { id: string | number; code: string; name: string } | null;
  onMembersUpdated?: () => void;
}

export function CohortMembersModal({
  isOpen,
  onClose,
  cohort,
  onMembersUpdated,
}: CohortMembersModalProps) {
  const [members, setMembers] = useState<CohortMemberDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [singleEmail, setSingleEmail] = useState("");
  const [batchEmails, setBatchEmails] = useState("");
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [processingLearnerId, setProcessingLearnerId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const cohortNumericId = cohort
    ? typeof cohort.id === "number"
      ? cohort.id
      : parseInt(cohort.id.replace(/\D/g, ""), 10) || 1
    : 1;

  const fetchMembers = async () => {
    if (!cohort) return;
    setLoading(true);
    try {
      const data = await cohortService.getCohortMembers(cohortNumericId);
      setMembers(data || []);
    } catch (err) {
      console.warn("Could not fetch cohort members from API:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && cohort) {
      fetchMembers();
      setStatusMessage(null);
      setSingleEmail("");
      setBatchEmails("");
    }
  }, [isOpen, cohort]);

  if (!isOpen || !cohort) return null;

  const isMemberPending = (status: any) =>
    status === "Pending" || status === 3 || String(status).toLowerCase() === "pending";

  const isMemberActive = (status: any) =>
    status === "Active" || status === 0 || String(status).toLowerCase() === "active";

  const handleAddSingleMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await cohortService.addCohortMember(cohortNumericId, { email: singleEmail.trim() });
      await fetchMembers();
      setSingleEmail("");
      setStatusMessage({ type: "success", text: `Đã thêm thành công học viên ${res.fullName || singleEmail}!` });
      onMembersUpdated?.();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || `Không thể thêm học viên với email "${singleEmail}". Vui lòng kiểm tra tài khoản đã tồn tại trong DB chưa.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchAddMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailsList = batchEmails
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.includes("@"));

    if (emailsList.length === 0) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập ít nhất một địa chỉ email hợp lệ." });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await cohortService.batchAddCohortMembers(cohortNumericId, { emails: emailsList });
      setStatusMessage({
        type: "success",
        text: `Đã xử lý danh sách: Thêm mới ${res.addedCount} học viên, kích hoạt lại ${res.reactivatedCount}.`,
      });
      await fetchMembers();
      setBatchEmails("");
      setIsBatchMode(false);
      onMembersUpdated?.();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Không thể thêm hàng loạt học viên vào lớp.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveMember = async (learnerId: number, memberName: string) => {
    setProcessingLearnerId(learnerId);
    setStatusMessage(null);
    try {
      await cohortService.approveCohortMember(cohortNumericId, learnerId);
      setStatusMessage({
        type: "success",
        text: `Đã phê duyệt học viên ${memberName} vào lớp ${cohort.code}!`,
      });
      await fetchMembers();
      onMembersUpdated?.();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || `Không thể phê duyệt học viên ${memberName}.`,
      });
    } finally {
      setProcessingLearnerId(null);
    }
  };

  const handleRemoveMember = async (learnerId: number, memberName: string, isPendingRequest = false) => {
    const confirmText = isPendingRequest
      ? `Từ chối yêu cầu xin vào lớp ${cohort.code} của học viên ${memberName}?`
      : `Bạn có chắc chắn muốn xóa học viên ${memberName} khỏi lớp ${cohort.code}?`;
    if (!window.confirm(confirmText)) {
      return;
    }
    setProcessingLearnerId(learnerId);
    try {
      await cohortService.removeCohortMember(cohortNumericId, learnerId);
      await fetchMembers();
      setStatusMessage({
        type: "success",
        text: isPendingRequest
          ? `Đã từ chối yêu cầu tham gia lớp của ${memberName}.`
          : `Đã xóa học viên ${memberName} khỏi lớp.`,
      });
      onMembersUpdated?.();
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Không thể cập nhật trạng thái thành viên.",
      });
    } finally {
      setProcessingLearnerId(null);
    }
  };

  const pendingMembers = members.filter((m) => isMemberPending(m.status));
  const activeMembers = members.filter((m) => isMemberActive(m.status));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
      <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-[#d9e4ec] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e9ef] bg-[#f8fafc] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf1f7] text-[#2f638c]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#132d49] flex items-center gap-2">
                Danh Sách Học Viên Lớp {cohort.code}
                <Badge tone="navy">{activeMembers.length} chính thức</Badge>
                {pendingMembers.length > 0 && (
                  <Badge tone="amber">{pendingMembers.length} chờ duyệt</Badge>
                )}
              </h3>
              <p className="text-xs text-[#667d93]">{cohort.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#667d93] hover:bg-[#eaf1f7] hover:text-[#132d49]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-[#f0f9f4] text-[#2d7b60] border-b border-[#c3e6d2]"
                : "bg-[#fff5f5] text-[#a03d3d] border-b border-[#f0c4c4]"
            }`}
          >
            {statusMessage.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-hidden p-6 space-y-4">
          {/* Add member controls */}
          <div className="rounded-xl border border-[#d9e4ec] bg-[#f8fafc] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-xs text-[#132d49] flex items-center gap-1.5">
                <UserPlus size={15} className="text-[#2f638c]" />
                {isBatchMode ? "Thêm Nhiều Học Viên Bằng Danh Sách Email" : "Thêm Nhanh 1 Học Viên"}
              </span>
              <button
                type="button"
                onClick={() => setIsBatchMode(!isBatchMode)}
                className="text-[11px] font-bold text-[#2f638c] hover:underline flex items-center gap-1"
              >
                {isBatchMode ? "Chuyển sang thêm đơn lẻ" : "Chuyển sang thêm hàng loạt (Batch)"}
              </button>
            </div>

            {!isBatchMode ? (
              <form onSubmit={handleAddSingleMember} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={15} className="absolute left-3 top-2.5 text-[#8291a1]" />
                  <input
                    type="email"
                    required
                    placeholder="Nhập email học viên trong hệ thống..."
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#d9e4ec] bg-white pl-9 pr-3 py-2 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                  />
                </div>
                <Button type="submit" size="sm" disabled={submitting} className="gap-1.5 text-xs shrink-0">
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                  Thêm vào lớp
                </Button>
              </form>
            ) : (
              <form onSubmit={handleBatchAddMembers} className="space-y-2">
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập danh sách email (mỗi email 1 dòng hoặc cách nhau bằng dấu phẩy)..."
                  value={batchEmails}
                  onChange={(e) => setBatchEmails(e.target.value)}
                  className="w-full rounded-xl border border-[#d9e4ec] bg-white p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={submitting} className="gap-1.5 text-xs">
                    {submitting ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
                    Xác nhận thêm hàng loạt
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Members Table */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-[#d9e4ec]">
            {loading ? (
              <div className="flex h-48 items-center justify-center gap-2 text-xs text-[#667d93]">
                <Loader2 size={24} className="animate-spin text-[#2f638c]" />
                <span>Đang tải danh sách thành viên từ cơ sở dữ liệu...</span>
              </div>
            ) : members.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-xs text-[#667d93]">
                Lớp học hiện chưa có học viên hoặc yêu cầu tham gia nào.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e2e9ef] bg-[#f8fafc] text-[11px] font-bold text-[#667d93]">
                    <th className="py-2.5 px-4">STT</th>
                    <th className="py-2.5 px-4">Họ và tên</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Trạng thái</th>
                    <th className="py-2.5 px-4">Ngày gửi / tham gia</th>
                    <th className="py-2.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f6]">
                  {members.map((m, idx) => {
                    const pending = isMemberPending(m.status);
                    const active = isMemberActive(m.status);
                    return (
                      <tr
                        key={m.id || idx}
                        className={pending ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-[#fbfcfd]"}
                      >
                        <td className="py-2.5 px-4 font-mono text-[#8291a1]">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-[#132d49]">{m.fullName}</td>
                        <td className="py-2.5 px-4 text-[#526b81]">{m.email || "—"}</td>
                        <td className="py-2.5 px-4">
                          {pending ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                              <Clock size={12} /> Chờ duyệt vào lớp
                            </span>
                          ) : active ? (
                            <Badge tone="green">Đang học</Badge>
                          ) : (
                            <Badge tone="gray">Đã rời lớp</Badge>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-[#8291a1]">
                          {new Date(m.joinedAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {pending ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={processingLearnerId === m.learnerId}
                                onClick={() => handleApproveMember(m.learnerId, m.fullName)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer"
                                title="Duyệt học viên vào lớp"
                              >
                                <Check size={12} />
                                Duyệt
                              </button>
                              <button
                                type="button"
                                disabled={processingLearnerId === m.learnerId}
                                onClick={() => handleRemoveMember(m.learnerId, m.fullName, true)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 transition cursor-pointer"
                                title="Từ chối yêu cầu"
                              >
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={processingLearnerId === m.learnerId}
                              onClick={() => handleRemoveMember(m.learnerId, m.fullName, false)}
                              className="rounded p-1 text-[#a03d3d] hover:bg-[#fff0f0] transition-colors cursor-pointer"
                              title="Xóa học viên khỏi lớp"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e2e9ef] bg-[#f8fafc] px-6 py-3 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
