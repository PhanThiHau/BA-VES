import { apiClient } from "./apiClient";
import type { HumanReviewDto } from "./assessmentService";

export type BookingStatus = "Pending" | "Confirmed" | "InProgress" | "Completed" | "Cancelled";

export interface CreateExpertBookingRequest {
  reviewRequestId: number;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  learnerNote?: string;
}

export interface SendConsultationMessageRequest {
  content: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  expertSummaryNote?: string;
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
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  learnerNote?: string;
  expertSummaryNote?: string;
  createdAt: string;
}

export interface BookingChatDossierDto {
  booking: ExpertBookingDto;
  reviewDossier?: HumanReviewDto;
  messages: ConsultationMessageDto[];
}

export const bookingService = {
  // Tạo lịch hẹn mới (Tự động trừ 1 Consultation Credit)
  createBooking: async (request: CreateExpertBookingRequest): Promise<ExpertBookingDto> => {
    return apiClient.post<ExpertBookingDto>("/api/assessment/bookings", request);
  },

  // Danh sách lịch hẹn của học viên hiện tại
  getMyBookings: async (): Promise<ExpertBookingDto[]> => {
    return apiClient.get<ExpertBookingDto[]>("/api/assessment/bookings/me");
  },

  // Danh sách lịch hẹn cho Chuyên gia / Giảng viên
  getExpertBookings: async (): Promise<ExpertBookingDto[]> => {
    return apiClient.get<ExpertBookingDto[]>("/api/assessment/bookings/expert");
  },

  // Mở phòng chat trao đổi 1-on-1 kèm hồ sơ điểm rubric
  getBookingChatDossier: async (id: number): Promise<BookingChatDossierDto> => {
    return apiClient.get<BookingChatDossierDto>(`/api/assessment/bookings/${id}/chat`);
  },

  // Gửi tin nhắn mới trong phòng trao đổi 1-on-1
  sendMessage: async (id: number, content: string): Promise<ConsultationMessageDto> => {
    return apiClient.post<ConsultationMessageDto>(`/api/assessment/bookings/${id}/messages`, { content });
  },

  // Cập nhật trạng thái buổi hẹn (Confirmed, InProgress, Completed kèm ghi chú)
  updateBookingStatus: async (id: number, request: UpdateBookingStatusRequest): Promise<ExpertBookingDto> => {
    return apiClient.put<ExpertBookingDto>(`/api/assessment/bookings/${id}/status`, request);
  },

  // Hủy lịch hẹn và tự động hoàn trả 1 Consultation Credit
  cancelBooking: async (id: number, reason?: string): Promise<ExpertBookingDto> => {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiClient.post<ExpertBookingDto>(`/api/assessment/bookings/${id}/cancel${query}`);
  },
};
