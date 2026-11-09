import { apiClient } from "./apiClient";

export enum BookingStatus {
  Requested = 0,
  Confirmed = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4,
}

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; tone: "navy" | "green" | "amber" | "gray" | "red" }> = {
  [BookingStatus.Requested]: { label: "Chờ chuyên gia xác nhận", tone: "amber" },
  [BookingStatus.Confirmed]: { label: "Đã xác nhận lịch hẹn", tone: "navy" },
  [BookingStatus.InProgress]: { label: "Đang diễn ra", tone: "green" },
  [BookingStatus.Completed]: { label: "Đã hoàn tất", tone: "green" },
  [BookingStatus.Cancelled]: { label: "Đã hủy", tone: "red" },
};

export interface CreateExpertBookingRequest {
  reviewRequestId: number;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  learnerNote?: string | null;
}

export interface ConsultationMessageDto {
  id: number;
  bookingId: number;
  senderId: number;
  senderRole: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface ExpertBookingDto {
  id: number;
  reviewRequestId: number;
  submissionId: number;
  learnerId: number;
  expertId: number;
  status: BookingStatus;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  learnerNote: string | null;
  expertSummaryNote: string | null;
  createdAt: string;
  learnerName?: string;
  scenarioTitle?: string;
}

export interface BookingChatDossierDto {
  booking: ExpertBookingDto;
  reviewDossier?: any;
  messages: ConsultationMessageDto[];
}

// Fallback initial bookings for seamless demo / offline mode
const mockBookings: ExpertBookingDto[] = [
  {
    id: 1,
    reviewRequestId: 1,
    submissionId: 1,
    learnerId: 101,
    expertId: 1,
    status: BookingStatus.Confirmed,
    scheduledStartTime: new Date(Date.now() + 86400000).toISOString(),
    scheduledEndTime: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    actualStartTime: null,
    actualEndTime: null,
    learnerNote: "Em cần Chuyên gia góp ý phần ma trận truy xuất nguồn gốc RTM và cách xử lý xung đột KPI giữa Trưởng kho và Kế toán trưởng.",
    expertSummaryNote: "Đã xem qua bài nộp, chuẩn bị thảo luận sâu về giải pháp quét mã barcode thay vì nhập liệu thủ công.",
    createdAt: new Date().toISOString(),
    learnerName: "Nguyễn Văn An",
    scenarioTitle: "Chuỗi Bán lẻ SmartRetail - Tối ưu hóa luồng hàng hoàn",
  },
];

const mockChatMessages: Record<number, ConsultationMessageDto[]> = {
  1: [
    {
      id: 1,
      bookingId: 1,
      senderId: 101,
      senderRole: "Learner",
      content: "Chào Chuyên gia! Em đã nộp bài tập tình huống SmartRetail và được AI chấm 78 điểm. Em mong muốn trao đổi thêm về cách bảo vệ giải pháp trước Kế toán trưởng.",
      sentAt: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
    },
    {
      id: 2,
      bookingId: 1,
      senderId: 1,
      senderRole: "Instructor",
      content: "Chào bạn An! Thầy đã xem qua tài liệu BRD và quy trình BPMN của bạn. Lập luận của bạn rất tốt, nhưng ở góc độ Kế toán bạn cần bổ sung biên bản đối soát định kỳ. Chiều mai chúng ta sẽ thảo luận chi tiết 1-on-1 nhé!",
      sentAt: new Date(Date.now() - 1800000).toISOString(),
      isRead: true,
    },
  ],
};

export const bookingService = {
  // 1. POST /api/assessment/bookings: Đặt lịch hẹn trao đổi 1-on-1 với Chuyên gia BA
  async createBooking(request: CreateExpertBookingRequest): Promise<ExpertBookingDto> {
    try {
      return await apiClient.post<ExpertBookingDto>("/api/assessment/bookings", request);
    } catch (e) {
      console.warn("Backend booking unavailable, using mock fallback:", e);
      const newBooking: ExpertBookingDto = {
        id: Date.now(),
        reviewRequestId: request.reviewRequestId,
        submissionId: 1,
        learnerId: 999,
        expertId: 1,
        status: BookingStatus.Requested,
        scheduledStartTime: request.scheduledStartTime || new Date(Date.now() + 86400000).toISOString(),
        scheduledEndTime: request.scheduledEndTime || new Date(Date.now() + 86400000 + 3600000).toISOString(),
        actualStartTime: null,
        actualEndTime: null,
        learnerNote: request.learnerNote || "",
        expertSummaryNote: null,
        createdAt: new Date().toISOString(),
        learnerName: "Học viên",
        scenarioTitle: "Tình huống Phân tích Nghiệp vụ",
      };
      mockBookings.unshift(newBooking);
      return newBooking;
    }
  },

  // 2. GET /api/assessment/bookings/me: Học viên xem danh sách các lịch hẹn của mình
  async getMyBookings(): Promise<ExpertBookingDto[]> {
    try {
      const data = await apiClient.get<ExpertBookingDto[]>("/api/assessment/bookings/me");
      if (Array.isArray(data) && data.length > 0) return data;
      return mockBookings;
    } catch (e) {
      console.warn("Không thể tải lịch hẹn từ /api/assessment/bookings/me, using fallback:", e);
      return mockBookings;
    }
  },

  // 3. GET /api/assessment/bookings/expert: Chuyên gia xem danh sách lịch hẹn học viên đã đặt
  async getExpertBookings(): Promise<ExpertBookingDto[]> {
    try {
      const data = await apiClient.get<ExpertBookingDto[]>("/api/assessment/bookings/expert");
      if (Array.isArray(data) && data.length > 0) return data;
      return mockBookings;
    } catch (e) {
      console.warn("Không thể tải lịch hẹn chuyên gia từ /api/assessment/bookings/expert, using fallback:", e);
      return mockBookings;
    }
  },

  // 4. GET /api/assessment/bookings/{id}/chat: Lấy hồ sơ phòng chat và toàn bộ tin nhắn 1-on-1
  async getBookingChat(bookingId: number): Promise<BookingChatDossierDto> {
    try {
      return await apiClient.get<BookingChatDossierDto>(`/api/assessment/bookings/${bookingId}/chat`);
    } catch (e) {
      console.warn(`Could not load chat for booking ${bookingId}, using fallback:`, e);
      const b = mockBookings.find((x) => x.id === bookingId) || mockBookings[0];
      return {
        booking: b,
        messages: mockChatMessages[bookingId] || [
          {
            id: 1,
            bookingId,
            senderId: 1,
            senderRole: "Instructor",
            content: "Chào bạn, phòng trao đổi 1-on-1 đã sẵn sàng. Bạn có thể gửi câu hỏi hoặc thắc mắc về bài nộp tại đây.",
            sentAt: new Date().toISOString(),
            isRead: true,
          },
        ],
      };
    }
  },

  // 5. POST /api/assessment/bookings/{id}/messages: Gửi tin nhắn mới vào phòng chat 1-on-1
  async sendMessage(bookingId: number, content: string, senderRole = "Learner"): Promise<ConsultationMessageDto> {
    try {
      return await apiClient.post<ConsultationMessageDto>(`/api/assessment/bookings/${bookingId}/messages`, { content });
    } catch (e) {
      console.warn(`Could not send message to booking ${bookingId}, using mock:`, e);
      const newMsg: ConsultationMessageDto = {
        id: Date.now(),
        bookingId,
        senderId: senderRole === "Learner" ? 999 : 1,
        senderRole,
        content,
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      if (!mockChatMessages[bookingId]) mockChatMessages[bookingId] = [];
      mockChatMessages[bookingId].push(newMsg);
      return newMsg;
    }
  },

  // 6. PUT /api/assessment/bookings/{id}/status: Cập nhật trạng thái lịch hẹn (Xác nhận, Hoàn thành)
  async updateBookingStatus(
    bookingId: number,
    status: BookingStatus,
    expertSummaryNote?: string
  ): Promise<ExpertBookingDto> {
    try {
      return await apiClient.put<ExpertBookingDto>(`/api/assessment/bookings/${bookingId}/status`, {
        status,
        expertSummaryNote,
      });
    } catch (e) {
      console.warn(`Could not update booking ${bookingId} status, using fallback:`, e);
      const b = mockBookings.find((x) => x.id === bookingId);
      if (b) {
        b.status = status;
        if (expertSummaryNote) b.expertSummaryNote = expertSummaryNote;
        return b;
      }
      return {
        id: bookingId,
        reviewRequestId: 1,
        submissionId: 1,
        learnerId: 101,
        expertId: 1,
        status,
        scheduledStartTime: null,
        scheduledEndTime: null,
        actualStartTime: null,
        actualEndTime: null,
        learnerNote: null,
        expertSummaryNote: expertSummaryNote || null,
        createdAt: new Date().toISOString(),
      };
    }
  },

  // 7. POST /api/assessment/bookings/{id}/cancel: Hủy lịch hẹn
  async cancelBooking(bookingId: number, reason?: string): Promise<ExpertBookingDto | void> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    try {
      return await apiClient.post<ExpertBookingDto>(`/api/assessment/bookings/${bookingId}/cancel${query}`);
    } catch (e) {
      console.warn(`Could not cancel booking ${bookingId}, using fallback:`, e);
      const b = mockBookings.find((x) => x.id === bookingId);
      if (b) b.status = BookingStatus.Cancelled;
    }
  },
};
