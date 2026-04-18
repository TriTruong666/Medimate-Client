export interface ChatSessionSummaryResponse {
  consultanSessionId: string;
  appointmentId: string;
  doctorId?: string;
  memberId?: string;

  // Tên người dùng (member)
  memberName?: string | null;
  memberAvatar?: string | null;

  // Thông tin lịch hẹn
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  appointmentStatus?: string | null;

  // Thông tin bác sĩ
  doctorName?: string | null;
  doctorAvatar?: string | null;

  // Thời gian phiên
  startedAt?: string | null;
  endedAt?: string | null;
  status: string; // "InProgress" | "Ended" | "Pending" ...

  // Trạng thái tham gia
  userJoined?: boolean;
  doctorJoined?: boolean;

  // Ghi chú
  note?: string | null;
  doctorNote?: string | null;

  // Alias fields (backward compat với code cũ dùng partnerName/partnerAvatar)
  /** @deprecated dùng memberName */
  partnerName?: string | null;
  /** @deprecated dùng memberAvatar */
  partnerAvatar?: string | null;

  // Fields cũ (giữ cho compat)
  sessionId?: string;
  lastMessage?: string | null;
  unreadCount?: number;
  updatedAt?: string;
  expiredAt?: string | null;
}

export interface ChatDoctorMessageResponse {
  messageId: string;
  sessionId: string;
  senderType: 1 | 2 | number;
  content: string | null;
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  senderName?: string | null;
  senderAvatar?: string | null;
  isRead?: boolean;
  createdAt: string;
}

export interface SendChatDoctorMessageBody {
  content?: string;
  attachmentFile?: File | null;
}