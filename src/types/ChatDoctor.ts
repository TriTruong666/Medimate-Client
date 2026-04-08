export interface ChatSessionSummaryResponse {
  sessionId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  status: string;
  lastMessage?: string | null;
  unreadCount?: number;
  updatedAt?: string;
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