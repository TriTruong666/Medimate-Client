export interface ChatSessionSummaryResponse {
  sessionId?: string;
  consultanSessionId?: string; // Tên property mới từ JSON
  appointmentId?: string;
  memberId?: string;
  partnerName?: string;
  memberName?: string; // Tên từ JSON
  partnerAvatar?: string | null;
  memberAvatar?: string | null; // Tên từ JSON
  status: string;
  lastMessage?: string | null;
  unreadCount?: number;
  updatedAt?: string;
  expiredAt?: string | null;
  appointmentDate?: string;
  appointmentTime?: string;
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