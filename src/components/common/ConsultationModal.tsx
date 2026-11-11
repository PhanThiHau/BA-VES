import { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { classNames } from "../../utils/format";
import {
  bookingService,
  BookingStatus,
  BOOKING_STATUS_CONFIG,
  type ExpertBookingDto,
  type ConsultationMessageDto,
} from "../../services/bookingService";
import { commerceService, type CreditBalanceSummaryDto } from "../../services/commerceService";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewRequestId?: number;
  submissionId?: number;
  initialBookingId?: number | null;
  isExpertMode?: boolean;
}

export function ConsultationModal({
  isOpen,
  onClose,
  reviewRequestId = 1,
  submissionId = 1,
  initialBookingId = null,
  isExpertMode = false,
}: ConsultationModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "book" | "chat">(
    initialBookingId ? "chat" : "list"
  );
  const [bookings, setBookings] = useState<ExpertBookingDto[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ExpertBookingDto | null>(null);
  const [credits, setCredits] = useState<CreditBalanceSummaryDto | null>(null);
  const [messages, setMessages] = useState<ConsultationMessageDto[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form fields for new booking
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState("14:00");
  const [learnerNote, setLearnerNote] = useState(
    "Em mong muốn trao đổi chuyên sâu với Chuyên gia về cách tối ưu hoá ma trận RTM và phương án bảo vệ giải pháp trước Kế toán trưởng."
  );
  const [expertNoteInput, setExpertNoteInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load user credits & bookings on open
  useEffect(() => {
    if (!isOpen) return;

    loadCredits();
    loadBookings();
  }, [isOpen, isExpertMode]);

  // When initialBookingId changes
  useEffect(() => {
    if (initialBookingId && bookings.length > 0) {
      const found = bookings.find((b) => b.id === initialBookingId);
      if (found) {
        setSelectedBooking(found);
        setActiveTab("chat");
      }
    }
  }, [initialBookingId, bookings]);

  // Polling messages when in chat tab
  useEffect(() => {
    if (!isOpen || activeTab !== "chat" || !selectedBooking) return;

    loadChatMessages(selectedBooking.id);
    const interval = setInterval(() => {
      loadChatMessages(selectedBooking.id, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, selectedBooking?.id]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const loadCredits = async () => {
    try {
      const res = await commerceService.getMyCreditsSummary();
      setCredits(res);
    } catch {
      setCredits(null);
    }
  };

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = isExpertMode
        ? await bookingService.getExpertBookings()
        : await bookingService.getMyBookings();
      setBookings(data);
      if (data.length > 0 && !selectedBooking) {
        setSelectedBooking(data[0]);
      }
    } catch (e) {
      console.warn("Could not load bookings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatMessages = async (bookingId: number, isPolling = false) => {
    try {
      const res = await bookingService.getBookingChat(bookingId);
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (e) {
      if (!isPolling) console.warn("Could not load chat messages:", e);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) {
      alert("Vui lòng chọn ngày và giờ hẹn.");
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const startDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const created = await bookingService.createBooking({
        reviewRequestId,
        scheduledStartTime: startDateTime.toISOString(),
        scheduledEndTime: endDateTime.toISOString(),
        learnerNote,
      });

      showToast("🎉 Đặt lịch trao đổi 1-on-1 với Chuyên gia thành công!");
      await loadCredits();
      await loadBookings();
      setSelectedBooking(created);
      setActiveTab("chat");
    } catch (err: any) {
      showToast(`Không thể tạo lịch hẹn: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedBooking) return;

    const textToSend = inputText.trim();
    setInputText("");
    setIsSending(true);

    try {
      const sentMsg = await bookingService.sendMessage(
        selectedBooking.id,
        textToSend
      );
      setMessages((prev) => [...prev, sentMsg]);
    } catch (err: any) {
      showToast(`Không thể gửi tin nhắn: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    try {
      const updated = await bookingService.updateBookingStatus(
        selectedBooking.id,
        newStatus,
        expertNoteInput.trim() || undefined
      );
      setSelectedBooking(updated);
      showToast(`Đã cập nhật trạng thái lịch hẹn: ${BOOKING_STATUS_CONFIG[newStatus].label}`);
      loadBookings();
    } catch (err: any) {
      showToast(`Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm("Bạn có chắc chắn muốn hủy lịch trao đổi 1-on-1 này? Lượt tư vấn (Credit) sẽ được hoàn trả.")) return;

    try {
      await bookingService.cancelBooking(selectedBooking.id, "Học viên chủ động đổi kế hoạch");
      showToast("Đã hủy lịch hẹn và hoàn lại 1 lượt tư vấn vào tài khoản!");
      loadCredits();
      loadBookings();
      setActiveTab("list");
    } catch (err: any) {
      showToast(`Lỗi khi hủy: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative flex flex-col h-[90vh] max-h-[850px] w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/15 bg-navy px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-brass">
              <PhoneCall size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  {isExpertMode ? "Hội đồng Chuyên gia · Phòng Trao đổi 1-on-1" : "Tư vấn & Phản biện 1-on-1 với Chuyên gia BA"}
                </h3>
                <span className="rounded-full bg-brass/20 px-2.5 py-0.5 text-[11px] font-semibold text-brass">
                  {isExpertMode ? "Chế độ Giảng viên/Chuyên gia" : "1-on-1 Mentorship"}
                </span>
              </div>
              <p className="text-xs text-white/70">
                Thảo luận trực tiếp về bài làm, làm rõ điểm trừ và hoàn thiện giải pháp chuẩn BABOK.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isExpertMode && credits && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-white border border-white/15">
                <Sparkles size={14} className="text-brass" />
                <span>
                  Lượt tư vấn: <strong className="font-bold text-brass">{credits.consultationCredits} lượt</strong>
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="bg-navy-light text-brass px-6 py-2 text-xs font-semibold flex items-center gap-2 border-b border-brass/20 animate-in slide-in-from-top-2">
            <CheckCircle2 size={15} />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate/15 bg-mist/20 px-6 gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={classNames(
              "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2",
              activeTab === "list"
                ? "border-navy text-navy"
                : "border-transparent text-slate hover:text-navy"
            )}
          >
            <Calendar size={15} />
            Danh sách lịch hẹn ({bookings.length})
          </button>

          {!isExpertMode && (
            <button
              onClick={() => setActiveTab("book")}
              className={classNames(
                "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2",
                activeTab === "book"
                  ? "border-navy text-navy"
                  : "border-transparent text-slate hover:text-navy"
              )}
            >
              <Clock size={15} />
              Đặt lịch mới
            </button>
          )}

          {selectedBooking && (
            <button
              onClick={() => setActiveTab("chat")}
              className={classNames(
                "px-4 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2",
                activeTab === "chat"
                  ? "border-navy text-navy"
                  : "border-transparent text-slate hover:text-navy"
              )}
            >
              <MessageSquare size={15} />
              Phòng trao đổi #{selectedBooking.id}
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          {/* TAB 1: Danh sách lịch hẹn */}
          {activeTab === "list" && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-navy text-sm">
                    {isExpertMode ? "Danh sách học viên đã đặt lịch trao đổi" : "Các phiên tư vấn 1-on-1 của bạn"}
                  </h4>
                  <p className="text-xs text-slate">
                    {isExpertMode
                      ? "Xem hồ sơ học viên, xác nhận lịch hẹn và chuẩn bị phản biện."
                      : "Theo dõi trạng thái duyệt lịch và truy cập phòng chat trao đổi."}
                  </p>
                </div>
                {!isExpertMode && (
                  <Button
                    onClick={() => setActiveTab("book")}
                    className="gap-1.5 text-xs bg-navy text-white hover:bg-navy-light"
                  >
                    <Clock size={14} /> Đặt thêm lịch hẹn
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="py-12 text-center text-slate">
                  <Loader2 size={28} className="animate-spin mx-auto text-navy mb-2" />
                  <p className="text-xs">Đang đồng bộ dữ liệu lịch hẹn từ hệ thống...</p>
                </div>
              ) : bookings.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate/30">
                  <Calendar size={36} className="mx-auto text-slate/40 mb-3" />
                  <p className="font-semibold text-navy text-sm">Chưa có lịch trao đổi 1-on-1 nào</p>
                  <p className="text-xs text-slate mt-1 max-w-md mx-auto">
                    {isExpertMode
                      ? "Hiện tại chưa có học viên nào gửi yêu cầu trao đổi 1-on-1."
                      : "Bạn có thể sử dụng quyền lợi Consultation Credit trong gói tài khoản để đặt lịch phản biện chuyên sâu với Chuyên gia."}
                  </p>
                  {!isExpertMode && (
                    <Button
                      onClick={() => setActiveTab("book")}
                      className="mt-4 gap-1.5 text-xs bg-brass text-navy-deep font-bold hover:bg-brass-light"
                    >
                      <Clock size={14} /> Đặt lịch hẹn ngay
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid gap-3">
                  {bookings.map((b) => {
                    const st = BOOKING_STATUS_CONFIG[b.status] || { label: "Không xác định", tone: "neutral" };
                    const isSelected = selectedBooking?.id === b.id;
                    const dateFormatted = b.scheduledStartTime
                      ? new Date(b.scheduledStartTime).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Chưa ấn định giờ";

                    return (
                      <div
                        key={b.id}
                        className={classNames(
                          "p-4 rounded-xl transition-all hover:border-navy/40 cursor-pointer border",
                          isSelected ? "border-navy ring-1 ring-navy bg-navy/5" : "border-slate/15 bg-white"
                        )}
                        onClick={() => {
                          setSelectedBooking(b);
                          setActiveTab("chat");
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-navy">#{b.id}</span>
                              <Badge tone={st.tone}>{st.label}</Badge>
                              <span className="text-xs text-slate flex items-center gap-1">
                                <Clock size={12} /> {dateFormatted}
                              </span>
                            </div>
                            <h5 className="font-bold text-sm text-navy">
                              {b.scenarioTitle || `Tình huống thẩm định #${b.reviewRequestId}`}
                            </h5>
                            {b.learnerNote && (
                              <p className="text-xs text-slate line-clamp-1 italic">
                                "{b.learnerNote}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button
                              variant="secondary"
                              className="text-xs gap-1 text-navy border-navy/20 hover:bg-navy/5"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(b);
                                setActiveTab("chat");
                              }}
                            >
                              <MessageSquare size={13} /> Vào phòng trao đổi <ChevronRight size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Đặt lịch hẹn mới (Learner) */}
          {activeTab === "book" && (
            <div className="max-w-xl mx-auto">
              <Card className="p-6 border-slate/15 bg-white shadow-sm">
                <div className="mb-5 pb-4 border-b border-slate/15">
                  <h4 className="font-bold text-navy text-base">Đặt lịch Trao đổi 1-on-1 với Chuyên gia</h4>
                  <p className="text-xs text-slate mt-0.5">
                    Chuyên gia BA sẽ trực tiếp xem lại bài nộp, đối chiếu rubric và giải đáp câu hỏi của bạn qua khung trao đổi tương tác.
                  </p>
                </div>

                <form onSubmit={handleCreateBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Ngày trao đổi mong muốn
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        required
                        className="w-full rounded-lg border border-slate/30 px-3 py-2 text-xs focus:border-navy focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1.5">
                        Khung giờ bắt đầu
                      </label>
                      <select
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full rounded-lg border border-slate/30 px-3 py-2 text-xs focus:border-navy focus:outline-none"
                      >
                        <option value="09:00">09:00 sáng</option>
                        <option value="10:30">10:30 sáng</option>
                        <option value="14:00">14:00 chiều</option>
                        <option value="15:30">15:30 chiều</option>
                        <option value="19:30">19:30 tối</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1.5">
                      Vấn đề & Câu hỏi muốn trao đổi cùng Chuyên gia
                    </label>
                    <textarea
                      rows={4}
                      value={learnerNote}
                      onChange={(e) => setLearnerNote(e.target.value)}
                      placeholder="Mô tả cụ thể thắc mắc về tiêu chí đánh giá, sơ đồ quy trình BPMN, ma trận RTM..."
                      className="w-full rounded-lg border border-slate/30 p-3 text-xs focus:border-navy focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="rounded-xl bg-navy/5 p-4 border border-navy/10 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-navy">
                      <ShieldCheck size={16} className="text-navy" />
                      Quy định sử dụng Consultation Credit:
                    </div>
                    <ul className="text-slate space-y-1 list-disc pl-5">
                      <li>Hệ thống sẽ trừ <strong>1 lượt tư vấn</strong> từ tài khoản của bạn khi tạo lịch hẹn.</li>
                      <li>Bạn có thể hủy lịch hẹn bất cứ lúc nào trước buổi hẹn để nhận lại lượt tư vấn đầy đủ.</li>
                      <li>Sau khi tạo, Chuyên gia sẽ xem hồ sơ và gửi tin nhắn hướng dẫn trong phòng chat.</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setActiveTab("list")}
                      className="text-xs"
                    >
                      Quay lại
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="gap-2 bg-navy text-xs font-bold text-white hover:bg-navy-light shadow-sm"
                    >
                      {isSubmittingBooking ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {isSubmittingBooking ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}

          {/* TAB 3: Phòng Trao đổi 1-on-1 (Chat Room) */}
          {activeTab === "chat" && selectedBooking && (
            <div className="flex flex-col h-full bg-white rounded-xl border border-slate/15 overflow-hidden shadow-xs">
              
              {/* Chat Sub-header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate/15 bg-slate-50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("list")}
                    className="p-1 text-slate hover:text-navy"
                    title="Quay lại danh sách"
                  >
                    <ArrowLeft size={16} />
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">
                        Phòng Phản biện #{selectedBooking.id}
                      </span>
                      <Badge tone={BOOKING_STATUS_CONFIG[selectedBooking.status]?.tone || "gray"}>
                        {BOOKING_STATUS_CONFIG[selectedBooking.status]?.label}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate flex items-center gap-1.5 mt-0.5">
                      <Calendar size={12} />
                      {selectedBooking.scheduledStartTime
                        ? new Date(selectedBooking.scheduledStartTime).toLocaleString("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Lịch hẹn linh hoạt"}
                    </p>
                  </div>
                </div>

                {/* Status action controls */}
                <div className="flex items-center gap-2">
                  {isExpertMode ? (
                    <>
                      {selectedBooking.status === BookingStatus.Requested && (
                        <Button
                          onClick={() => handleUpdateStatus(BookingStatus.Confirmed)}
                          className="text-xs bg-emerald-600 text-white hover:bg-emerald-700 py-1.5 px-3 font-semibold"
                        >
                          Xác nhận lịch
                        </Button>
                      )}
                      {selectedBooking.status === BookingStatus.Confirmed && (
                        <Button
                          onClick={() => handleUpdateStatus(BookingStatus.Completed)}
                          className="text-xs bg-navy text-white hover:bg-navy-light py-1.5 px-3 font-semibold"
                        >
                          Hoàn tất phiên tư vấn
                        </Button>
                      )}
                    </>
                  ) : (
                    selectedBooking.status !== BookingStatus.Completed &&
                    selectedBooking.status !== BookingStatus.Cancelled && (
                      <Button
                        variant="secondary"
                        onClick={handleCancelBooking}
                        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 py-1.5 px-3"
                      >
                        Hủy lịch hẹn (Hoàn credit)
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Expert Pinned Summary Note if completed */}
              {selectedBooking.expertSummaryNote && (
                <div className="bg-amber-50/70 border-b border-amber-200 px-5 py-3 text-xs text-amber-900 flex items-start gap-2.5">
                  <UserCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-950">Ghi chú tổng kết từ Chuyên gia:</strong>
                    <p className="mt-0.5 leading-relaxed">{selectedBooking.expertSummaryNote}</p>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-slate text-xs">
                    <MessageSquare size={32} className="mx-auto text-slate/30 mb-2" />
                    Chưa có tin nhắn nào trong phòng trao đổi này. Hãy bắt đầu câu hỏi đầu tiên!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isLearner = m.senderRole === "Learner";
                    const isCurrentUser = isExpertMode ? !isLearner : isLearner;

                    return (
                      <div
                        key={m.id}
                        className={classNames(
                          "flex flex-col max-w-[80%] space-y-1",
                          isCurrentUser ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-slate px-1">
                          <span className="font-bold text-navy">
                            {isLearner ? "Học viên" : "Chuyên gia BA / Giảng viên"}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(m.sentAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={classNames(
                            "rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs whitespace-pre-line",
                            isCurrentUser
                              ? "bg-navy text-white rounded-tr-xs"
                              : "bg-white border border-slate/15 text-navy rounded-tl-xs"
                          )}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="border-t border-slate/15 p-3 bg-white flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isExpertMode
                      ? "Nhập nhận xét hoặc định hướng phản biện cho học viên..."
                      : "Nhập câu hỏi hoặc phản hồi với Chuyên gia..."
                  }
                  className="flex-1 rounded-xl border border-slate/20 px-4 py-2.5 text-xs focus:border-navy focus:outline-none"
                />
                <Button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="bg-navy text-white hover:bg-navy-light text-xs font-bold px-4 py-2.5 gap-1.5 shrink-0 rounded-xl"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Gửi
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
