import { useState, useEffect } from "react";
import { AlertCircle, Calendar, CalendarCheck2, CheckCircle2, Clock, MessageSquare, Plus, RefreshCcw, Send, ShieldAlert, Sparkles, User, UserCheck, XCircle } from "lucide-react";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import { useApp } from "../../contexts/AppContext";
import {
  bookingService,
  type ExpertBookingDto,
  type BookingStatus,
} from "../../services/bookingService";
import { commerceService } from "../../services/commerceService";
import { assessmentService, type ReviewRequestDto } from "../../services/assessmentService";
import { BookingChatRoomModal } from "./BookingChatRoomModal";
import { isAdminRole, isExpertRole as userIsExpert, isInstructorRole } from "../../utils/roles";

interface BookingPageProps {
  navigate: (route: RouteKey) => void;
}

export function BookingPage({ navigate }: BookingPageProps) {
  const { user } = useApp();
  const isExpertRole =
    isInstructorRole(user?.roles) || isAdminRole(user?.roles) || userIsExpert(user?.roles);

  const [bookings, setBookings] = useState<ExpertBookingDto[]>([]);
  const [completedReviews, setCompletedReviews] = useState<ReviewRequestDto[]>([]);
  const [consultationCredits, setConsultationCredits] = useState<number>(0);
  const [reviewCredits, setReviewCredits] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "expert">("list");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Booking Form State
  const [reviewRequestId, setReviewRequestId] = useState<number>(0);
  const [scheduledStartTime, setScheduledStartTime] = useState<string>("");
  const [scheduledEndTime, setScheduledEndTime] = useState<string>("");
  const [learnerNote, setLearnerNote] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, conRes, revRes, reviewsRes] = await Promise.allSettled([
        isExpertRole && activeTab === "expert"
          ? bookingService.getExpertBookings()
          : bookingService.getMyBookings(),
        commerceService.getConsultationCredits(),
        commerceService.getReviewCredits(),
        assessmentService.getReviewRequests(),
      ]);

      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value);
      if (conRes.status === "fulfilled") setConsultationCredits(conRes.value.credits);
      if (revRes.status === "fulfilled") setReviewCredits(revRes.value.credits);
      if (reviewsRes.status === "fulfilled") {
        const completed = (reviewsRes.value || []).filter((item) =>
          String(item.status).toLowerCase().includes("completed")
        );
        setCompletedReviews(completed);
        if (!reviewRequestId && completed[0]) {
          setReviewRequestId(completed[0].id);
        }
      }
    } catch (err) {
      console.warn("Could not load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (consultationCredits < 1) {
      alert("Bạn chưa có đủ lượt Consultation Credit. Vui lòng nạp thêm credit để đặt lịch!");
      navigate("payment");
      return;
    }

    if (!reviewRequestId) {
      alert("Chọn một bài đã được chuyên gia chấm trước khi đặt lịch.");
      return;
    }

    setIsCreating(true);
    try {
      await bookingService.createBooking({
        reviewRequestId: Number(reviewRequestId),
        scheduledStartTime: scheduledStartTime ? new Date(scheduledStartTime).toISOString() : undefined,
        scheduledEndTime: scheduledEndTime ? new Date(scheduledEndTime).toISOString() : undefined,
        learnerNote: learnerNote || undefined,
      });

      alert("🎉 Đặt lịch hẹn cố vấn 1-on-1 thành công! Đã tự động trừ 1 Consultation Credit.");
      setLearnerNote("");
      setActiveTab("list");
      await loadData();
    } catch (err: any) {
      alert(`Không thể đặt lịch: ${err.message || err}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    const reason = prompt("Vui lòng nhập lý do hủy lịch hẹn (1 Consultation Credit sẽ được hoàn trả):");
    if (reason === null) return;

    try {
      await bookingService.cancelBooking(id, reason);
      alert("✅ Đã hủy lịch hẹn thành công và hoàn trả 1 Consultation Credit!");
      await loadData();
    } catch (err: any) {
      alert(`Lỗi khi hủy lịch: ${err.message}`);
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
        return <Badge tone="red">Đã hủy (Đã hoàn credit)</Badge>;
      default:
        return <Badge tone="gray">{status}</Badge>;
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Cố vấn & Đánh giá Chuyên gia · BA-VES Mentorship"
        title="Đặt lịch Chuyên gia BA (1-on-1)"
        description="Đặt lịch trao đổi trực tiếp với Senior Business Analyst sau khi bài nộp đã được chấm điểm để giải đáp thắc mắc, phân tích sai sót và hoàn thiện năng lực."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("payment")}
              className="gap-1.5 border-slate/20 text-xs font-semibold text-navy hover:bg-mist/30"
            >
              <Sparkles size={13} className="text-brass" />
              Nạp thêm Credit
            </Button>
            <Button
              onClick={loadData}
              disabled={isLoading}
              variant="secondary"
              className="gap-1.5 border-slate/20 text-xs font-semibold text-navy hover:bg-mist/30"
            >
              <RefreshCcw size={13} className={isLoading ? "animate-spin" : ""} />
              Làm mới
            </Button>
          </div>
        }
      />

      {/* Compact Balance & Status Strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate/15 bg-white px-4 py-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CalendarCheck2 size={15} />
            </span>
            <div>
              <span className="text-[11px] text-slate">Cố vấn 1-on-1:</span>{" "}
              <strong className="font-bold text-navy">{consultationCredits ?? 0} buổi</strong>
            </div>
          </div>

          <span className="hidden h-4 w-px bg-slate/20 sm:inline-block" />

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <UserCheck size={15} />
            </span>
            <div>
              <span className="text-[11px] text-slate">Chấm bài:</span>{" "}
              <strong className="font-bold text-navy">{reviewCredits ?? 0} lượt</strong>
            </div>
          </div>

          <span className="hidden h-4 w-px bg-slate/20 sm:inline-block" />

          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Clock size={15} />
            </span>
            <div>
              <span className="text-[11px] text-slate">Lịch hẹn đã đặt:</span>{" "}
              <strong className="font-bold text-navy">{bookings.length} cuộc hẹn</strong>
            </div>
          </div>
        </div>

        {activeTab !== "create" && (
          <button
            onClick={() => setActiveTab("create")}
            className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-navy-light transition cursor-pointer"
          >
            <Plus size={13} />
            <span>Đặt lịch mới</span>
          </button>
        )}
      </div>

      {/* Tabs (Astryx SegmentedControl) */}
      <div className="mb-5">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => setActiveTab(val as "list" | "create" | "expert")}
          label="Chế độ xem lịch hẹn"
          size="md"
        >
          <SegmentedControlItem
            value="list"
            label={`Danh sách lịch hẹn (${bookings.length})`}
            icon={<Calendar size={14} />}
          />
          <SegmentedControlItem
            value="create"
            label="Đặt lịch hẹn mới"
            icon={<Plus size={14} />}
          />
          {isExpertRole && (
            <SegmentedControlItem
              value="expert"
              label="Lịch phân công Chuyên gia"
              icon={<UserCheck size={14} />}
            />
          )}
        </SegmentedControl>
      </div>

      {/* Tab 1: Bookings List */}
      {(activeTab === "list" || activeTab === "expert") && (
        <Card className="overflow-hidden border-slate/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate/10 p-5 gap-3">
            <div>
              <h3 className="text-base font-bold text-navy">
                {activeTab === "expert" ? "Danh sách lịch hẹn phân công cho Chuyên gia" : "Lịch hẹn trao đổi 1-on-1"}
              </h3>
              <p className="text-xs text-slate">Nhấn "Vào phòng trao đổi" để mở phòng chat và xem hồ sơ chấm điểm chi tiết</p>
            </div>
            <Button
              onClick={() => setActiveTab("create")}
              className="bg-navy hover:bg-navy-light text-white text-xs font-bold gap-1.5 shadow-xs"
            >
              <Plus size={14} /> Đặt lịch mới
            </Button>
          </div>

          <div className="divide-y divide-slate/10">
            {bookings.length > 0 ? (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_200px_180px] md:items-center hover:bg-mist/10 transition-colors"
                >
                  <div className="flex gap-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy font-bold">
                      <MessageSquare size={20} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate">#{b.id}</span>
                        {getStatusBadge(b.status)}
                        <span className="text-[11px] font-mono text-slate">
                          Yêu cầu chấm: #{b.reviewRequestId}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-navy">
                        Buổi cố vấn 1-on-1 định hướng chuyên sâu với Senior BA
                      </h4>
                      <p className="mt-1 text-xs text-slate italic line-clamp-2">
                        "{b.learnerNote || "Học viên chưa để lại ghi chú trước."}"
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate">Khung giờ hẹn:</span>
                    <p className="mt-0.5 font-semibold text-xs text-navy">
                      {b.scheduledStartTime
                        ? new Date(b.scheduledStartTime).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Linh hoạt"}
                    </p>
                    <span className="text-[11px] text-slate/70">
                      Tạo lúc: {new Date(b.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2">
                    <button
                      onClick={() => setSelectedBookingId(b.id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy-light transition shadow-xs"
                    >
                      <MessageSquare size={13} />
                      Vào phòng trao đổi
                    </button>

                    {b.status === "Pending" && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="w-full text-center text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        Hủy lịch & Hoàn credit
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate text-xs space-y-3">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist/50 text-slate">
                  <Calendar size={24} />
                </span>
                <p className="font-semibold text-navy">Bạn chưa có lịch hẹn 1-on-1 nào.</p>
                <p className="text-slate max-w-md mx-auto">
                  Sau khi bài nộp của bạn đã được Chuyên gia chấm điểm, bạn có thể đặt lịch hẹn để trao đổi trực tiếp và nhận lời khuyên nâng cao.
                </p>
                <Button
                  onClick={() => setActiveTab("create")}
                  className="bg-navy hover:bg-navy-light text-white text-xs font-bold gap-1.5 mt-2 shadow-xs"
                >
                  <Plus size={14} /> Đặt lịch ngay
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 2: Create Booking Form */}
      {activeTab === "create" && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 border-slate/15">
            <div className="flex items-center gap-3 border-b border-slate/10 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <CalendarCheck2 size={20} />
              </span>
              <div>
                <h3 className="text-base font-bold text-navy">Đặt lịch trao đổi 1-on-1 với Chuyên gia</h3>
                <p className="text-xs text-slate">Tự động trừ 1 lượt Consultation Credit trong tài khoản của bạn</p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy mb-1.5">
                  Bài đã được chuyên gia chấm (gắn đúng expert đã chấm):
                </label>
                {completedReviews.length > 0 ? (
                  <select
                    required
                    value={reviewRequestId || completedReviews[0]?.id || ""}
                    onChange={(e) => setReviewRequestId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy"
                  >
                    {completedReviews.map((item) => (
                      <option key={item.id} value={item.id}>
                        REQ-{item.id} · Bài nộp #{item.submissionId} · Expert #
                        {item.assignedReviewerId ?? "—"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    Chưa có yêu cầu chấm nào hoàn tất. Hãy gửi chuyên gia chấm trên trang Đánh giá trước khi đặt tư vấn.
                  </div>
                )}
                <span className="text-[11px] text-slate mt-1 block">
                  Phòng chat 1-on-1 sẽ mở với đúng chuyên gia đã chấm bài này.
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-navy mb-1.5">
                    Thời gian bắt đầu mong muốn:
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledStartTime}
                    onChange={(e) => setScheduledStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy font-sans"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy mb-1.5">
                    Thời gian kết thúc mong muốn:
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledEndTime}
                    onChange={(e) => setScheduledEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy mb-1.5">
                  Nội dung bạn muốn trao đổi chi tiết với Chuyên gia:
                </label>
                <textarea
                  rows={4}
                  value={learnerNote}
                  onChange={(e) => setLearnerNote(e.target.value)}
                  placeholder="Ví dụ: Em muốn làm rõ cách xử lý ngoại lệ khi khóa sổ kế toán trong tài liệu BRD và cách định lượng tiêu chí nghiệm thu theo chuẩn BABOK..."
                  className="w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy leading-relaxed"
                />
              </div>

              <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 text-amber-900 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Lưu ý về Credit:</strong> Buổi đặt lịch sẽ sử dụng <strong>1 Consultation Credit</strong> (Hiện có: <strong>{consultationCredits}</strong> lượt).
                  Nếu bạn cần hủy lịch trước buổi hẹn, credit sẽ được hoàn trả lại tài khoản tự động.
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate/10">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="border-slate/20 text-xs font-semibold"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 shadow-xs"
                >
                  {isCreating ? <RefreshCcw size={14} className="animate-spin" /> : <CalendarCheck2 size={15} />}
                  {isCreating ? "Đang đặt lịch..." : "Xác nhận đặt lịch (Trừ 1 Credit)"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 1-on-1 Chat Room Modal */}
      {selectedBookingId && (
        <BookingChatRoomModal
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onStatusChange={loadData}
        />
      )}
    </>
  );
}
