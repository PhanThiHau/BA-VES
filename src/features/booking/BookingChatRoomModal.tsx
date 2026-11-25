import { useState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Send, User, UserCheck, X, FileText, Award, RefreshCcw, Check, Play, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { classNames } from "../../utils/format";
import { useApp } from "../../contexts/AppContext";
import {
  bookingService,
  type BookingChatDossierDto,
  type ConsultationMessageDto,
  type ExpertBookingDto,
  type BookingStatus,
} from "../../services/bookingService";
import { isAdminRole, isExpertRole, isInstructorRole } from "../../utils/roles";

interface BookingChatRoomModalProps {
  bookingId: number;
  onClose: () => void;
  onStatusChange?: () => void;
}

export function BookingChatRoomModal({ bookingId, onClose, onStatusChange }: BookingChatRoomModalProps) {
  const { user } = useApp();
  const isExpert =
    isInstructorRole(user?.roles) || isAdminRole(user?.roles) || isExpertRole(user?.roles);

  const [dossier, setDossier] = useState<BookingChatDossierDto | null>(null);
  const [messages, setMessages] = useState<ConsultationMessageDto[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expertSummaryNote, setExpertSummaryNote] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadChatDossier = async () => {
    try {
      const data = await bookingService.getBookingChatDossier(bookingId);
      setDossier(data);
      setMessages(data.messages || []);
      if (data.booking.expertSummaryNote) {
        setExpertSummaryNote(data.booking.expertSummaryNote);
      }
    } catch (err: any) {
      console.warn("Could not load chat dossier:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChatDossier();
    // Auto polling messages every 4 seconds
    const interval = setInterval(loadChatDossier, 4000);
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const newMsg = await bookingService.sendMessage(bookingId, text);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      alert(`Lỗi gửi tin nhắn: ${err.message || err}`);
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    setIsUpdatingStatus(true);
    try {
      await bookingService.updateBookingStatus(bookingId, {
        status: newStatus,
        expertSummaryNote: expertSummaryNote || undefined,
      });
      alert(`Đã cập nhật trạng thái buổi trao đổi: ${newStatus}`);
      await loadChatDossier();
      if (onStatusChange) onStatusChange();
    } catch (err: any) {
      alert(`Lỗi cập nhật: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "Pending":
        return <Badge tone="amber">Chờ xác nhận</Badge>;
      case "Confirmed":
        return <Badge tone="navy">Đã xác nhận</Badge>;
      case "InProgress":
        return <Badge tone="green">Đang diễn ra</Badge>;
      case "Completed":
        return <Badge tone="green">Đã hoàn thành</Badge>;
      case "Cancelled":
        return <Badge tone="red">Đã hủy</Badge>;
      default:
        return <Badge tone="gray">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/60 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate/20 bg-white shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/15 bg-gradient-to-r from-navy to-navy-light px-6 py-3.5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-emerald-400">
              <MessageSquare size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Phòng trao đổi 1-on-1 với Chuyên gia BA</h2>
                <span className="font-mono text-xs text-white/70">#Lịch hẹn {bookingId}</span>
              </div>
              <p className="text-xs text-white/70">
                Không gian cố vấn cá nhân hóa định hướng theo khung năng lực BABOK® v3
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadChatDossier}
              title="Làm mới tin nhắn"
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <RefreshCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="grid flex-1 overflow-hidden lg:grid-cols-[380px_1fr]">
          {/* Left Column: Booking & Assessment Dossier */}
          <div className="overflow-y-auto border-r border-slate/15 bg-mist/20 p-5 space-y-4">
            {/* Booking Summary Card */}
            <Card className="p-4 border-slate/15 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate">Trạng thái buổi hẹn</span>
                {dossier && getStatusBadge(dossier.booking.status)}
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate">Thời gian đã đặt:</span>
                  <p className="font-semibold text-navy">
                    {dossier?.booking.scheduledStartTime
                      ? new Date(dossier.booking.scheduledStartTime).toLocaleString("vi-VN")
                      : "Lịch hẹn linh hoạt"}
                  </p>
                </div>
                <div>
                  <span className="text-slate">Ghi chú của học viên:</span>
                  <p className="italic text-slate mt-0.5 rounded-lg bg-mist/40 p-2 text-[11px] leading-relaxed">
                    {dossier?.booking.learnerNote || "Học viên không để lại ghi chú trước."}
                  </p>
                </div>
              </div>

              {/* Expert Status Controls */}
              {isExpert && (
                <div className="mt-4 border-t border-slate/10 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy">
                    Thao tác Chuyên gia:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dossier?.booking.status === "Pending" && (
                      <button
                        onClick={() => handleUpdateStatus("Confirmed")}
                        disabled={isUpdatingStatus}
                        className="flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1 text-[11px] font-bold text-white hover:bg-navy-light"
                      >
                        <Check size={12} /> Xác nhận hẹn
                      </button>
                    )}
                    {dossier?.booking.status === "Confirmed" && (
                      <button
                        onClick={() => handleUpdateStatus("InProgress")}
                        disabled={isUpdatingStatus}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        <Play size={12} /> Bắt đầu buổi trao đổi
                      </button>
                    )}
                    {dossier?.booking.status === "InProgress" && (
                      <div className="w-full space-y-2 mt-2">
                        <textarea
                          value={expertSummaryNote}
                          onChange={(e) => setExpertSummaryNote(e.target.value)}
                          placeholder="Ghi chú tổng kết & lời khuyên cho học viên..."
                          className="w-full rounded-lg border border-slate/20 p-2 text-[11px] outline-none"
                          rows={2}
                        />
                        <button
                          onClick={() => handleUpdateStatus("Completed")}
                          disabled={isUpdatingStatus}
                          className="w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          Hoàn tất buổi cố vấn
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Expert Summary Note if Completed */}
            {dossier?.booking.expertSummaryNote && (
              <Card className="p-4 border-emerald-300 bg-emerald-50/60">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 size={16} />
                  <strong className="text-xs font-bold uppercase">Tổng kết của Chuyên gia BA:</strong>
                </div>
                <p className="mt-2 text-xs text-emerald-950 leading-relaxed italic">
                  "{dossier.booking.expertSummaryNote}"
                </p>
              </Card>
            )}

            {/* Rubric Evaluation Dossier */}
            <Card className="p-4 border-slate/15 bg-white">
              <div className="flex items-center gap-2 border-b border-slate/10 pb-2">
                <Award size={16} className="text-brass" />
                <h3 className="text-xs font-bold text-navy">Hồ sơ thẩm định bài nộp liên kết</h3>
              </div>

              {dossier?.reviewDossier ? (
                <div className="mt-3 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate">Chuyên gia chấm điểm:</span>
                    <strong className="text-navy">
                      {(dossier.reviewDossier as any).reviewerName || `Chuyên gia Senior BA #${dossier.reviewDossier.reviewerId}`}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate">Điểm số Rubric:</span>
                    <strong className="text-base font-extrabold text-navy font-mono">
                      {dossier.reviewDossier.finalScore != null ? `${dossier.reviewDossier.finalScore}/100` : "Đang chấm"}
                    </strong>
                  </div>

                  {dossier.reviewDossier.overallFeedback && (
                    <div>
                      <span className="text-[11px] font-semibold text-slate">Nhận xét tổng thể:</span>
                      <p className="mt-1 rounded-lg bg-mist/30 p-2 text-[11px] text-navy/90 leading-relaxed">
                        {dossier.reviewDossier.overallFeedback}
                      </p>
                    </div>
                  )}

                  {dossier.reviewDossier.criterionScores && dossier.reviewDossier.criterionScores.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[11px] font-bold text-slate uppercase">Chi tiết theo tiêu chí:</span>
                      <div className="mt-1 space-y-1.5 divide-y divide-slate/10">
                        {dossier.reviewDossier.criterionScores.map((c: any) => (
                          <div key={c.id || c.criterionCode} className="pt-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="text-navy text-[11px]">{c.criterionName || c.criterionCode}</span>
                              <span className="font-mono text-emerald-700">{c.score}/{c.maxScore}</span>
                            </div>
                            {c.feedback && (
                              <p className="text-[10px] text-slate mt-0.5 line-clamp-2">{c.feedback}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate italic">
                  Bài nộp liên kết đang được Chuyên gia hoàn thiện chấm điểm theo khung BABOK.
                </p>
              )}
            </Card>
          </div>

          {/* Right Column: Chat Room Messages */}
          <div className="flex flex-col bg-white">
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length > 0 ? (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;
                  const isSenderExpert = m.senderRole?.toLowerCase().includes("expert") || m.senderRole?.toLowerCase().includes("instructor");

                  return (
                    <div
                      key={m.id}
                      className={classNames(
                        "flex gap-3 max-w-[85%]",
                        isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <span
                        className={classNames(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold shadow-xs",
                          isSenderExpert
                            ? "bg-navy text-brass"
                            : "bg-blue-600 text-white"
                        )}
                      >
                        {isSenderExpert ? "BA" : "HV"}
                      </span>

                      <div>
                        <div
                          className={classNames(
                            "flex items-center gap-2 mb-1",
                            isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className="text-[10px] font-bold text-slate">
                            {isSenderExpert ? "Chuyên gia BA" : "Học viên"}
                          </span>
                          <span className="text-[10px] text-slate/60">
                            {new Date(m.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        <div
                          className={classNames(
                            "rounded-2xl p-3 text-xs leading-relaxed shadow-xs",
                            isMe
                              ? "bg-navy text-white rounded-tr-xs"
                              : "bg-mist/30 text-navy border border-slate/15 rounded-tl-xs"
                          )}
                        >
                          {m.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist/40 text-slate">
                    <MessageSquare size={24} />
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-navy">Phòng trao đổi đã sẵn sàng</h4>
                  <p className="mt-1 max-w-sm text-xs leading-5">
                    Hãy gửi câu hỏi hoặc thắc mắc về các phát hiện nghiệp vụ, quy tắc BRD hoặc tiêu chí nghiệm thu để Chuyên gia hỗ trợ bạn!
                  </p>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="border-t border-slate/15 bg-mist/10 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập nội dung trao đổi, câu hỏi thắc mắc cho Chuyên gia..."
                  className="flex-1 rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-xs text-navy outline-none focus:border-navy shadow-xs"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="bg-navy hover:bg-navy-light text-white text-xs font-bold px-4 gap-1.5 shadow-sm"
                >
                  <Send size={14} /> Gửi tin
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
