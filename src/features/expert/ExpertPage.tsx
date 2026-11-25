import { useState, useEffect, type ReactNode } from "react";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { assessmentService, type ReviewRequestDto } from "../../services/assessmentService";
import { bookingService, type ExpertBookingDto } from "../../services/bookingService";
import { scenarioAuthoringService } from "../../services/scenarioAuthoringService";
import { ReviewCaseDossierModal } from "../instructor/components/ReviewCaseDossierModal";
import { ScenarioApprovalTab } from "./ScenarioApprovalTab";
import { ExpertStandardsTab } from "./ExpertStandardsTab";
import { ExpertOverviewTab } from "./ExpertOverviewTab";
import { BookingChatRoomModal } from "../booking/BookingChatRoomModal";
import { classNames } from "../../utils/format";

type ExpertTabId = "overview" | "approvals" | "reviews" | "bookings" | "rubrics";
const VALID_TABS: ExpertTabId[] = ["overview", "approvals", "reviews", "bookings", "rubrics"];

type BookingFilter = "ALL" | "PENDING" | "CONFIRMED" | "INPROGRESS" | "COMPLETED" | "CANCELLED";

export function ExpertPage() {
  const { expertTab, setExpertTab } = useApp();
  const activeTab = VALID_TABS.includes(expertTab as ExpertTabId)
    ? (expertTab as ExpertTabId)
    : "overview";

  const [reviewRequests, setReviewRequests] = useState<ReviewRequestDto[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string | null>(null);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewFilter, setReviewFilter] = useState<"ALL" | "PENDING" | "REVIEWED">("ALL");

  const [bookings, setBookings] = useState<ExpertBookingDto[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("ALL");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  const [pendingScenarioApprovals, setPendingScenarioApprovals] = useState(0);
  const [rubricCount, setRubricCount] = useState(0);
  const [babokTaskCount, setBabokTaskCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await assessmentService.getReviewRequests();
      setReviewRequests(res || []);
    } catch (err) {
      console.warn("Could not load expert review requests:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingService.getExpertBookings();
      setBookings(res || []);
    } catch (err) {
      console.warn("Could not load expert bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadScenarioQueue = async () => {
    try {
      const queue = await scenarioAuthoringService.listReviewQueue();
      setPendingScenarioApprovals((queue || []).length);
    } catch {
      setPendingScenarioApprovals(0);
    }
  };

  const loadStandardsCounts = async () => {
    try {
      const [rubrics, tasks] = await Promise.all([
        assessmentService.getRubrics(),
        assessmentService.getBabokTasks(),
      ]);
      const published = (rubrics || []).filter(
        (r) => r.status === "Published" || r.status === 1 || String(r.status).toLowerCase() === "published"
      );
      setRubricCount(published.length);
      setBabokTaskCount((tasks || []).length);
    } catch {
      /* ignore */
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadReviews(), loadBookings(), loadScenarioQueue(), loadStandardsCounts()]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void refreshAll();
  }, []);

  const filteredReviews = reviewRequests.filter((req) => {
    const searchLow = reviewSearch.toLowerCase();
    const matchesSearch =
      `REQ-${req.id}`.toLowerCase().includes(searchLow) ||
      `Học viên #${req.learnerId}`.toLowerCase().includes(searchLow) ||
      (req.requestNote || "").toLowerCase().includes(searchLow);
    if (!matchesSearch) return false;
    if (reviewFilter === "ALL") return true;
    if (reviewFilter === "PENDING") return req.status.toLowerCase().includes("pending");
    if (reviewFilter === "REVIEWED")
      return req.status.toLowerCase().includes("completed") || req.status.toLowerCase().includes("accepted");
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "ALL") return true;
    return b.status.toUpperCase() === bookingFilter;
  });

  const handleCancelBooking = async (id: number) => {
    const reason = window.prompt("Lý do hủy (không bắt buộc):");
    if (reason === null) return;
    setCancellingId(id);
    setBookingNotice(null);
    try {
      await bookingService.cancelBooking(id, reason.trim() || undefined);
      setBookingNotice(`Đã hủy lịch #${id}. Credit đã hoàn cho học viên.`);
      await loadBookings();
    } catch (err) {
      setBookingNotice(err instanceof Error ? err.message : "Không hủy được lịch.");
    } finally {
      setCancellingId(null);
    }
  };

  const pendingReviewsCount = reviewRequests.filter((r) =>
    r.status.toLowerCase().includes("pending")
  ).length;
  const completedReviewsCount = reviewRequests.filter(
    (r) => r.status.toLowerCase().includes("completed") || r.status.toLowerCase().includes("accepted")
  ).length;
  const activeBookingsCount = bookings.filter(
    (b) => b.status === "Confirmed" || b.status === "Pending" || b.status === "InProgress"
  ).length;

  const tabHeaders: Record<ExpertTabId, { title: string; description?: string; actions?: ReactNode }> = {
    overview: {
      title: "Tổng quan",
      description: "Xem việc cần làm: duyệt kịch bản, chấm hồ sơ và lịch hẹn.",
      actions: (
        <Button
          variant="secondary"
          onClick={() => void refreshAll()}
          className="gap-1.5 border-navy/20 bg-white text-xs font-semibold text-navy"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Làm mới
        </Button>
      ),
    },
    approvals: {
      title: "Duyệt kịch bản",
      description: "Xử lý hàng đợi chờ duyệt và xem lại các kịch bản bạn đã duyệt/từ chối.",
    },
    reviews: {
      title: "Chấm hồ sơ",
      description: "Chấm điểm và góp ý bài nộp của học viên.",
      actions: (
        <Button
          variant="secondary"
          onClick={() => void loadReviews()}
          className="gap-1.5 border-navy/20 bg-white text-xs font-semibold text-navy"
        >
          <RefreshCw size={14} className={loadingReviews ? "animate-spin" : ""} />
          Làm mới
        </Button>
      ),
    },
    bookings: {
      title: "Lịch hẹn",
      description: "Trao đổi với học viên hoặc hủy lịch khi cần.",
      actions: (
        <Button
          variant="secondary"
          onClick={() => void loadBookings()}
          className="gap-1.5 border-navy/20 bg-white text-xs font-semibold text-navy"
        >
          <RefreshCw size={14} className={loadingBookings ? "animate-spin" : ""} />
          Làm mới
        </Button>
      ),
    },
    rubrics: {
      title: "Tiêu chí chấm",
      description: "Rubric do hệ thống tạo và danh mục task BABOK để đối chiếu khi chấm.",
    },
  };

  const header = tabHeaders[activeTab];

  return (
    <div className="mx-auto max-w-[1540px] space-y-5 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Chuyên gia"
        title={header.title}
        description={header.description}
        actions={header.actions}
      />

      {activeTab === "overview" && (
        <ExpertOverviewTab
          pendingReviews={pendingReviewsCount}
          completedReviews={completedReviewsCount}
          activeBookings={activeBookingsCount}
          pendingScenarioApprovals={pendingScenarioApprovals}
          rubricCount={rubricCount}
          babokTaskCount={babokTaskCount}
          onSelectTab={setExpertTab}
          onRefresh={() => void refreshAll()}
          refreshing={refreshing}
        />
      )}

      {activeTab === "approvals" && <ScenarioApprovalTab />}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/60" />
              <input
                type="text"
                placeholder="Tìm mã hoặc học viên..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-offwhite/50 py-2 pl-9 pr-3 text-xs font-medium text-navy focus:border-brass focus:bg-white focus:outline-none focus:ring-2 focus:ring-brass/20"
              />
            </div>
            <div className="flex rounded-xl border border-navy/15 bg-offwhite p-1">
              {(["ALL", "PENDING", "REVIEWED"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setReviewFilter(filter)}
                  className={classNames(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                    reviewFilter === filter ? "bg-white text-navy shadow-xs" : "text-slate hover:text-navy"
                  )}
                >
                  {filter === "ALL" ? "Tất cả" : filter === "PENDING" ? "Chờ duyệt" : "Đã duyệt"}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
            {loadingReviews ? (
              <div className="p-12 text-center">
                <RefreshCw size={24} className="mx-auto animate-spin text-navy" />
                <p className="mt-2 text-xs font-semibold text-slate">Đang tải hồ sơ...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist text-navy">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-navy">Không có hồ sơ</h3>
                <p className="mt-1 text-xs text-slate">
                  {reviewSearch ? "Thử từ khóa khác." : "Chưa có bài nộp cần chấm."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-navy/8">
                {filteredReviews.map((req) => {
                  const isPending = req.status.toLowerCase().includes("pending");
                  return (
                    <div
                      key={req.id}
                      className="group flex flex-col gap-4 p-5 transition hover:bg-mist/40 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brass/25 bg-[#fbf6ec] font-display text-sm font-extrabold text-brass">
                          HV
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-sm font-extrabold text-navy">
                              Học viên #{req.learnerId}
                            </span>
                            <span className="rounded border border-navy/10 bg-offwhite px-2 py-0.5 font-mono text-[10px] font-bold text-slate">
                              REQ-{req.id}
                            </span>
                            <span
                              className={classNames(
                                "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                                isPending
                                  ? "border-amber-500/20 bg-amber-500/15 text-amber-800"
                                  : "border-emerald-500/20 bg-emerald-500/15 text-emerald-800"
                              )}
                            >
                              {isPending ? "Chờ chấm" : "Đã xong"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate">
                            Ghi chú:{" "}
                            <span className="text-navy">{req.requestNote || "Bài nộp học viên"}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate/75">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />{" "}
                              {req.requestedAt ? new Date(req.requestedAt).toLocaleString("vi-VN") : "—"}
                            </span>
                            <span className="font-mono font-bold text-navy">Submission #{req.submissionId}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReviewId(req.id);
                          setSelectedReviewStatus(req.status);
                        }}
                        className="flex shrink-0 items-center gap-2 self-end rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-navy-deep lg:self-center"
                      >
                        <FileText size={14} className="text-brass-light" />
                        {isPending ? "Chấm bài" : "Xem"}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck2 size={16} className="text-brass" />
              <span className="text-xs font-bold text-navy">Lọc trạng thái</span>
            </div>
            <div className="flex flex-wrap rounded-xl border border-navy/15 bg-offwhite p-1">
              {(
                [
                  ["ALL", "Tất cả"],
                  ["PENDING", "Chờ"],
                  ["CONFIRMED", "Đã nhận"],
                  ["INPROGRESS", "Đang họp"],
                  ["COMPLETED", "Xong"],
                  ["CANCELLED", "Hủy"],
                ] as const
              ).map(([filter, label]) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setBookingFilter(filter)}
                  className={classNames(
                    "rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                    bookingFilter === filter ? "bg-white text-navy shadow-xs" : "text-slate hover:text-navy"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {bookingNotice && (
            <div className="rounded-xl border border-brass/30 bg-[#fbf6ec] px-4 py-2.5 text-xs text-navy">
              {bookingNotice}
            </div>
          )}

          {loadingBookings ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center">
              <RefreshCw size={24} className="mx-auto animate-spin text-navy" />
              <p className="mt-2 text-xs font-semibold text-slate">Đang tải lịch hẹn...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist text-navy">
                <CalendarCheck2 size={24} />
              </div>
              <h3 className="mt-3 text-sm font-bold text-navy">Không có lịch hẹn</h3>
              <p className="mt-1 text-xs text-slate">Chưa có lịch hẹn trong bộ lọc này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((b) => {
                const isConfirmed = b.status === "Confirmed";
                const isPending = b.status === "Pending";
                const isInProgress = b.status === "InProgress";
                const isCancelled = b.status === "Cancelled";
                const canCancel = isPending || isConfirmed;

                return (
                  <div
                    key={b.id}
                    className="flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-5 shadow-sm transition hover:border-brass/30 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded border border-navy/10 bg-offwhite px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-slate">
                          BOOKING #{b.id}
                        </span>
                        <span
                          className={classNames(
                            "rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            isConfirmed || isInProgress
                              ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-800"
                              : isPending
                                ? "border-amber-500/20 bg-amber-500/15 text-amber-800"
                                : isCancelled
                                  ? "border-rose-500/20 bg-rose-500/15 text-rose-800"
                                  : "border-sky-500/20 bg-sky-500/15 text-sky-800"
                          )}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fbf6ec] font-display font-bold text-brass">
                          HV
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy">Học viên #{b.learnerId}</p>
                          <p className="text-[11px] font-medium text-slate">
                            REQ-{b.reviewRequestId} · Submission #{b.submissionId}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 rounded-xl bg-mist/50 p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-slate">
                          <Clock size={13} className="text-brass" />
                          <span>
                            {b.scheduledStartTime
                              ? new Date(b.scheduledStartTime).toLocaleString("vi-VN")
                              : "Chưa xếp giờ"}
                          </span>
                        </div>
                        {b.learnerNote && (
                          <div className="border-t border-navy/8 pt-2 text-[11px] text-slate">
                            <span className="font-bold text-navy">Ghi chú HV:</span> "{b.learnerNote}"
                          </div>
                        )}
                        {b.expertSummaryNote && (
                          <div className="border-t border-navy/8 pt-2 text-[11px] text-emerald-800">
                            <span className="font-bold">Kết luận:</span> "{b.expertSummaryNote}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-navy/8 pt-3">
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setSelectedBookingId(b.id)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy py-2 text-xs font-bold text-white transition hover:bg-navy-deep"
                        >
                          <MessageSquare size={13} className="text-brass-light" />
                          Nhắn tin
                        </button>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          disabled={cancellingId === b.id}
                          onClick={() => void handleCancelBooking(b.id)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-800 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                          <XCircle size={13} />
                          {cancellingId === b.id ? "Đang hủy..." : "Hủy lịch"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "rubrics" && <ExpertStandardsTab />}

      {selectedReviewId != null && (
        <ReviewCaseDossierModal
          isOpen={selectedReviewId != null}
          reviewRequestId={selectedReviewId}
          initialStatus={selectedReviewStatus}
          onClose={() => {
            setSelectedReviewId(null);
            setSelectedReviewStatus(null);
            void loadReviews();
          }}
          onCompleted={() => {
            void loadReviews();
          }}
        />
      )}

      {selectedBookingId && (
        <BookingChatRoomModal
          bookingId={selectedBookingId}
          onClose={() => {
            setSelectedBookingId(null);
            void loadBookings();
          }}
          onStatusChange={() => void loadBookings()}
        />
      )}
    </div>
  );
}
