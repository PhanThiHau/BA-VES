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

export const bookingService = {
  // 1. POST /api/assessment/bookings: Đặt lịch hẹn trao đổi 1-on-1 với Chuyên gia BA
  async createBooking(request: CreateExpertBookingRequest): Promise<ExpertBookingDto> {
    return apiClient.post<ExpertBookingDto>("/api/assessment/bookings", request);
  },

  // 2. GET /api/assessment/bookings/me: Học viên xem danh sách các lịch hẹn của mình
  async getMyBookings(): Promise<ExpertBookingDto[]> {
    const data = await apiClient.get<ExpertBookingDto[]>("/api/assessment/bookings/me");
    return Array.isArray(data) ? data : [];
  },

  // 3. GET /api/assessment/bookings/expert: Chuyên gia xem danh sách lịch hẹn học viên đã đặt
  async getExpertBookings(): Promise<ExpertBookingDto[]> {
    const data = await apiClient.get<ExpertBookingDto[]>("/api/assessment/bookings/expert");
    return Array.isArray(data) ? data : [];
  },

  // 4. GET /api/assessment/bookings/{id}/chat: Lấy hồ sơ phòng chat và toàn bộ tin nhắn 1-on-1
  async getBookingChat(bookingId: number): Promise<BookingChatDossierDto> {
    return apiClient.get<BookingChatDossierDto>(`/api/assessment/bookings/${bookingId}/chat`);
  },

  // 5. POST /api/assessment/bookings/{id}/messages: Gửi tin nhắn mới vào phòng chat 1-on-1
  async sendMessage(bookingId: number, content: string): Promise<ConsultationMessageDto> {
    return apiClient.post<ConsultationMessageDto>(`/api/assessment/bookings/${bookingId}/messages`, { content });
  },

  // 6. PUT /api/assessment/bookings/{id}/status: Cập nhật trạng thái lịch hẹn (Xác nhận, Hoàn thành)
  async updateBookingStatus(
    bookingId: number,
    status: BookingStatus,
    expertSummaryNote?: string
  ): Promise<ExpertBookingDto> {
    return apiClient.put<ExpertBookingDto>(`/api/assessment/bookings/${bookingId}/status`, {
      status,
      expertSummaryNote,
    });
  },

  // 7. POST /api/assessment/bookings/{id}/cancel: Hủy lịch hẹn
  async cancelBooking(bookingId: number, reason?: string): Promise<ExpertBookingDto | void> {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiClient.post<ExpertBookingDto>(`/api/assessment/bookings/${bookingId}/cancel${query}`);
  },
};
