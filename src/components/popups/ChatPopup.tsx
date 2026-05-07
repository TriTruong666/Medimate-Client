import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPaperclip, FiUser } from "react-icons/fi";
import { HiXMark } from "react-icons/hi2";
import { IoSend } from "react-icons/io5";
import { LuCalendar, LuClock, LuTimer } from "react-icons/lu";
import { PATHS } from "@/config/paths";
import { useChatIdentity, useChatSessionDetails, useChatSessionMessages, useMarkChatSessionMessagesRead, useSendChatSessionMessage } from "@/hooks/data/useChatDoctorHooks";
import { useCountdown } from "@/hooks/useCountdown";
import { toast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import type { BaseResponse } from "@/types/APIResponse";
import { chatPopupAtom, closePopupAtom, chatSessionExpiryAtom } from "../../stores/chatPopupStore";
import { ChatBubble, TypingBubble } from "../custom-ui/ChatBubble";
import { Spinner } from "../custom-ui/Spinner";
import type { ChatDoctorMessageResponse, ChatSessionSummaryResponse } from "@/types/ChatDoctor";
import { DoctorSupportDetailModal } from "@/components/modals";

type ChatPopupProps = {
  sessionId: string;
};

function formatAppointmentDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ChatPopup({ sessionId }: ChatPopupProps) {
  const [, closePopup] = useAtom(closePopupAtom);
  const navigate = useNavigate();
  const { doctorId } = useChatIdentity();
  const [chatExpiryMap] = useAtom(chatSessionExpiryAtom);
  const expiredAt = chatExpiryMap[sessionId];
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const {
    data: sessionDetails,
    isLoading: isDetailsLoading,
    isError: isDetailsError,
    error: detailsError,
    refetch: refetchDetails,
  } = useChatSessionDetails(sessionId);
  const {
    data: messages,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
    refetch: refetchMessages,
  } = useChatSessionMessages(sessionId);
  const queryClient = useQueryClient();

  // Force refetch mảng dữ liệu ngay khi Popup được bật để đảm bảo lấy data mới nhất
  useEffect(() => {
    void refetchDetails();
    void refetchMessages();
  }, [sessionId, refetchDetails, refetchMessages]);

  // Tìm lại trong cache danh sách list session (vì API Detail có thể bị thiếu trả về Date/Time)
  const cachedSessionsQueries = queryClient.getQueriesData<BaseResponse<ChatSessionSummaryResponse[]>>({ queryKey: ["chat-sessions"] });
  let cachedSession: ChatSessionSummaryResponse | undefined;
  for (const [, data] of cachedSessionsQueries) {
    const found = data?.data?.find(s => s.consultanSessionId === sessionId);
    if (found) {
      cachedSession = found;
      break;
    }
  }

  const startedTime = sessionDetails?.startedAt || cachedSession?.startedAt;
  const status = sessionDetails?.status || cachedSession?.status;

  // Lấy chatExpiredAt từ message cuối cùng/đầu tiên do Backend trả về
  const firstMessageWithExpiry = messages?.find(m => m.chatExpiredAt);
  
  let derivedExpiredAt = expiredAt; // fallback
  if (firstMessageWithExpiry?.chatExpiredAt) {
    derivedExpiredAt = firstMessageWithExpiry.chatExpiredAt;
  } else if (startedTime) {
    // Nếu hệ thống cũ chưa update field chatExpiredAt, fallback về tính 125 phút
    derivedExpiredAt = new Date(new Date(startedTime).getTime() + 125 * 60 * 1000).toISOString();
  }

  // Truyền ngày rất xa để hook đếm ngược không trả về expired true nếu truyền null/undefined
  const { isExpired: isCountdownExpired, displayText: rawCountdownText } = useCountdown(derivedExpiredAt || "9999-12-31T23:59:59Z");
  const countdownText = derivedExpiredAt ? rawCountdownText : null;

  const isDataReady = !!(sessionDetails || cachedSession || expiredAt);

  let isExpired = false;
  if (isDataReady) {
    if (derivedExpiredAt) {
      isExpired = isCountdownExpired;
    } else {
      // Nếu không có mốc thời gian rõ ràng, chỉ hết hạn nếu status là Ended
      isExpired = status === "Ended" || status === "Completed";
    }
  }
  const expiryTimeLabel = derivedExpiredAt
    ? new Date(derivedExpiredAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

  const markReadMutation = useMarkChatSessionMessagesRead(sessionId);
  const hasMarkedReadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || !doctorId) return;
    if (isMessagesLoading || isMessagesError) return;
    if (hasMarkedReadRef.current === sessionId) return;

    hasMarkedReadRef.current = sessionId;
    void markReadMutation.mutateAsync().catch(() => {
      hasMarkedReadRef.current = null;
    });
  }, [doctorId, isMessagesError, isMessagesLoading, markReadMutation, sessionId]);

  // Map đúng field names từ API response thực tế hoặc lấy từ cache dự phòng
  const displayName = sessionDetails?.memberName || sessionDetails?.partnerName || cachedSession?.memberName || cachedSession?.partnerName || "Phòng chat";
  const partnerAvatar = sessionDetails?.memberAvatar || sessionDetails?.partnerAvatar || cachedSession?.memberAvatar || cachedSession?.partnerAvatar || null;
  const appointmentId = sessionDetails?.appointmentId || cachedSession?.appointmentId;

  // Derive date and time from startedAt if backend doesn't explicitly return them
  const fallbackDate = sessionDetails?.startedAt || cachedSession?.startedAt;
  const computedDateStr = sessionDetails?.appointmentDate || cachedSession?.appointmentDate || fallbackDate;
  const appointmentTime = sessionDetails?.appointmentTime || cachedSession?.appointmentTime || (
    fallbackDate ? new Date(fallbackDate).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false }) : null
  );

  // Status badge: chỉ "Hết hạn" khi đồng hồ thực sự hết, không dùng session.status

  const messageItems = useMemo(() => messages || [], [messages]);

  function handleOpenConsultationSession() {
    const params = new URLSearchParams({ sessionId });
    navigate(`${PATHS.DASHBOARD.PRESCRIPTIONS.ROOT}?${params.toString()}`);
    closePopup(sessionId);
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex h-[460px] w-[360px] flex-col overflow-hidden rounded-xl border border-gray-400 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b0b0b] dark:backdrop-blur-xl"
      >
        {/* ── Header ── */}
        <div className="border-b border-gray-300 px-3 py-2.5 dark:border-white/10">
          <div className="flex items-center gap-2">
            {/* Avatar + click to open session */}
            <button
              type="button"
              onClick={handleOpenConsultationSession}
              title="Mở chi tiết phiên tư vấn"
              className="flex-shrink-0 rounded-full transition hover:ring-2 hover:ring-gray-300 dark:hover:ring-white/20"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-gray-200 to-gray-50 text-sm font-semibold text-gray-900 dark:from-white/20 dark:to-white/5 dark:text-white">
                {partnerAvatar ? (
                  <img
                    src={partnerAvatar}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
            </button>

            {/* Name + date/time + status */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </span>
                <span className={clsx(
                  "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  isExpired
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                )}>
                </span>
              </div>
              {/* Appointment info row */}
              {(computedDateStr || appointmentTime) && (
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                  {computedDateStr && (
                    <span className="flex items-center gap-1">
                      <LuCalendar className="h-3 w-3" />
                      {formatAppointmentDate(computedDateStr)}
                    </span>
                  )}
                  {appointmentTime && (
                    <span className="flex items-center gap-1">
                      <LuClock className="h-3 w-3" />
                      {appointmentTime}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Countdown / Expiry badge */}
            {isExpired ? (
              expiryTimeLabel && (
                <div className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-red-500/20 px-2 py-1">
                  <LuTimer className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] font-semibold text-red-400">Hết hạn</span>
                </div>
              )
            ) : (
              countdownText && (
                <div className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-orange-500/20 px-2 py-1">
                  <LuTimer className="h-3 w-3 text-orange-300" />
                  <span className="text-xs font-semibold text-orange-300">{countdownText}</span>
                </div>
              )
            )}

            {/* View patient profile button */}
            {appointmentId && (
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                title="Xem hồ sơ bệnh nhân"
                className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-blue-400"
              >
                <FiUser size={15} />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={() => closePopup(sessionId)}
              className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <HiXMark size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden">
          {isDetailsLoading || isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : isDetailsError || isMessagesError ? (
            <ChatErrorState
              message={detailsError?.message || messagesError?.message || "Không thể tải phòng chat."}
              onRetry={() => {
                void refetchDetails();
                void refetchMessages();
              }}
            />
          ) : (
            <ChatThread sessionId={sessionId} messages={messageItems} isExpired={isExpired} expiryTimeLabel={expiryTimeLabel} />
          )}
        </div>
      </motion.div>

      {/* Patient profile modal */}
      {appointmentId && (
        <DoctorSupportDetailModal
          open={isProfileOpen}
          appointmentId={appointmentId}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}

function ChatThread({
  sessionId,
  messages,
  isExpired,
  expiryTimeLabel,
}: {
  sessionId: string;
  messages: ChatDoctorMessageResponse[];
  isExpired: boolean;
  expiryTimeLabel: string | null;
}) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const sendMutation = useSendChatSessionMessage(sessionId);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sessionId]);

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  async function handleSendMessage() {
    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedFile) {
      toast.error("Tin nhắn không được để trống", "Vui lòng nhập nội dung hoặc đính kèm tệp.");
      return;
    }

    await sendMutation.mutateAsync({
      content: trimmedContent,
      attachmentFile: selectedFile,
    });

    setContent("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-3">
          {messages.map((message) => (
            <ChatMessageItem key={message.messageId} message={message} />
          ))}

          {sendMutation.isPending && <TypingBubble />}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      <div
        className={clsx(
          "border-t border-gray-300 bg-gray-50/50 px-3 py-2 backdrop-blur-md transition-all dark:border-white/10 dark:bg-white/2",
          isExpired && "bg-red-500/10",
        )}
      >
        {isExpired && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            <LuTimer className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />
            <span>
              Phòng chat đã đóng lúc{" "}
              <span className="font-semibold">{expiryTimeLabel ?? "--:--"}</span>.
              {" "}Bạn chỉ có thể xem lại tin nhắn.
            </span>
          </div>
        )}

        {selectedFile && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
            <span className="truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="ml-3 rounded-md px-1 text-gray-400 transition hover:bg-gray-200 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              disabled={isExpired}
            >
              <HiXMark size={14} />
            </button>
          </div>
        )}

        <div
          className={clsx(
            "flex items-end gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 transition-all dark:border-white/10 dark:bg-white/5",
            isComposerFocused &&
            !isExpired &&
            "border-gray-500 bg-gray-50 dark:border-white/20 dark:bg-white/10",
            isExpired && "bg-gray-100 opacity-80 cursor-not-allowed dark:bg-white/5 dark:opacity-50",
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSelectedFile(file);
            }}
            disabled={isExpired}
          />

          <button
            type="button"
            onClick={handlePickFile}
            className="mb-0.5 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title={isExpired ? "Phiên đã hết hạn" : "Đính kèm file"}
            disabled={isExpired}
          >
            <FiPaperclip size={15} />
          </button>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onFocus={() => setIsComposerFocused(true)}
            onBlur={() => setIsComposerFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !isExpired) {
                event.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder={isExpired ? "Hết hạn chat" : "Aa"}
            rows={1}
            disabled={isExpired}
            className="max-h-24 min-h-8 flex-1 resize-none bg-transparent py-1 text-[13px] leading-5 text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-white/40 disabled:opacity-70 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={
              sendMutation.isPending || (!content.trim() && !selectedFile) || isExpired
            }
            className={clsx(
              "mb-0.5 flex h-9 w-9 items-center justify-center rounded-full transition-all",
              !isExpired && (content.trim() || selectedFile)
                ? "bg-linear-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md shadow-pink-500/20"
                : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-white/30",
              isExpired && "opacity-50 cursor-not-allowed",
            )}
          >
            <IoSend size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatMessageItem({ message }: { message: ChatDoctorMessageResponse }) {
  const isMine = message.senderType === 2;
  const body = message.content?.trim() || (message.attachmentUrl ? "Tệp đính kèm" : "");
  // Backend update: sử dụng sendAt thay cho createdAt
  const timeLabel = formatMessageTime(message.sendAt || message.createdAt);

  return (
    <div className={clsx("flex w-full flex-col gap-1", isMine ? "items-end" : "items-start")}>
      <ChatBubble sender={isMine ? "me" : "other"} message={body || "..."} />

      {message.attachmentUrl && (
        <a
          href={message.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className={clsx(
            "max-w-[75%] rounded-lg border px-3 py-2 text-[11px] transition hover:opacity-90",
            isMine
              ? "border-pink-400/20 bg-pink-500/10 text-pink-100"
              : "border-white/10 bg-white/5 text-white/70",
          )}
        >
          {message.attachmentFileName || "Mở tệp đính kèm"}
        </a>
      )}

      <span className="text-[10px] text-gray-400 dark:text-white/30">
        {timeLabel}
      </span>
    </div>
  );
}

function ChatErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        Không thể tải cuộc trò chuyện
      </h3>
      <p className="mt-2 text-xs text-gray-500 dark:text-white/50">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-900 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        Thử lại
      </button>
    </div>
  );
}

function formatMessageTime(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ChatContainer() {
  const [popupKeys] = useAtom(chatPopupAtom);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="flex items-end gap-4">
        <AnimatePresence>
          {popupKeys.map((id) => (
            <ChatPopup key={id} sessionId={id} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

