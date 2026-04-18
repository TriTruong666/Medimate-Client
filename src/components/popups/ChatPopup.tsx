import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPaperclip, FiUser } from "react-icons/fi";
import { HiXMark } from "react-icons/hi2";
import { IoSend } from "react-icons/io5";
import { LuCalendar, LuClock } from "react-icons/lu";
import { PATHS } from "@/config/paths";
import { useChatIdentity, useChatSessionDetails, useChatSessionMessages, useMarkChatSessionMessagesRead, useSendChatSessionMessage } from "@/hooks/data/useChatDoctorHooks";
import { useCountdown } from "@/hooks/useCountdown";
import { toast } from "@/hooks/useToast";
import { chatPopupAtom, closePopupAtom, chatSessionExpiryAtom } from "../../stores/chatPopupStore";
import { ChatBubble, TypingBubble } from "../custom-ui/ChatBubble";
import { Spinner } from "../custom-ui/Spinner";
import type { ChatDoctorMessageResponse } from "@/types/ChatDoctor";
import { DoctorSupportDetailPage } from "@/pages/doctor/DoctorSupportDetailPage";

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
  // Backend: chatEndTime = startedAt + 125 phút (60 phút session + 60 phút chat dư)
  // Chỉ block chat khi đồng hồ này hết — KHÔNG dùng session.status
  const derivedExpiredAt = sessionDetails?.startedAt
    ? new Date(new Date(sessionDetails.startedAt).getTime() + 125 * 60 * 1000).toISOString()
    : expiredAt; // fallback khi chưa load xong sessionDetails

  const { isExpired, displayText: countdownText } = useCountdown(derivedExpiredAt);
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

  // Map đúng field names từ API response thực tế
  const displayName = sessionDetails?.memberName || sessionDetails?.partnerName || "Phòng chat";
  const partnerAvatar = sessionDetails?.memberAvatar || sessionDetails?.partnerAvatar || null;
  const appointmentDate = sessionDetails?.appointmentDate;
  const appointmentTime = sessionDetails?.appointmentTime;
  const appointmentId = sessionDetails?.appointmentId;

  // Status badge: chỉ "Hết hạn" khi đồng hồ thực sự hết, không dùng session.status
  const displayStatus = isExpired
    ? "Hết hạn"
    : sessionDetails?.status === "Ended"
      ? "Đang diễn ra"   // session Ended nhưng chat 125p vẫn còn
      : sessionDetails?.status === "InProgress"
        ? "Đang diễn ra"
        : "Đang kết nối";

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
        className="flex h-[460px] w-[360px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0b] backdrop-blur-xl shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="border-b border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            {/* Avatar + click to open session */}
            <button
              type="button"
              onClick={handleOpenConsultationSession}
              title="Mở chi tiết phiên tư vấn"
              className="flex-shrink-0 rounded-full transition hover:ring-2 hover:ring-white/20"
            >
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/20 to-white/5 text-sm font-semibold text-white">
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
                <span className="truncate text-sm font-semibold text-white">{displayName}</span>
                <span className={clsx(
                  "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  isExpired
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                )}>
                  {displayStatus}
                </span>
              </div>
              {/* Appointment info row */}
              {(appointmentDate || appointmentTime) && (
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                  {appointmentDate && (
                    <span className="flex items-center gap-1">
                      <LuCalendar className="h-3 w-3" />
                      {formatAppointmentDate(appointmentDate)}
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

            {/* Countdown */}
            {!isExpired && countdownText && (
              <div className="flex flex-shrink-0 items-center gap-1 rounded-lg bg-orange-500/20 px-2 py-1">
                <span className="text-xs font-semibold text-orange-300">{countdownText}</span>
              </div>
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
              className="flex-shrink-0 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
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
            <ChatThread sessionId={sessionId} messages={messageItems} isExpired={isExpired} />
          )}
        </div>
      </motion.div>

      {/* Patient profile modal */}
      {appointmentId && (
        <DoctorSupportDetailPage
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
}: {
  sessionId: string;
  messages: ChatDoctorMessageResponse[];
  isExpired: boolean;
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

      <div className={clsx(
        "border-t border-white/10 bg-white/2 px-3 py-2 backdrop-blur-md transition-all",
        isExpired && "bg-red-500/10"
      )}>
        {isExpired && (
          <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            Hết hạn chat. Bạn chỉ có thể xem lại tin nhắn.
          </div>
        )}

        {selectedFile && (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            <span className="truncate">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="ml-3 rounded-md px-1 text-white/50 transition hover:bg-white/10 hover:text-white"
              disabled={isExpired}
            >
              <HiXMark size={14} />
            </button>
          </div>
        )}

        <div
          className={clsx(
            "flex items-end gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-all",
            isComposerFocused && !isExpired && "border-white/20 bg-white/10",
            isExpired && "opacity-50 cursor-not-allowed",
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
            className="mb-0.5 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="max-h-24 min-h-8 flex-1 resize-none bg-transparent py-1 text-[13px] leading-5 text-white outline-none placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            type="button"
            onClick={() => void handleSendMessage()}
            disabled={sendMutation.isPending || (!content.trim() && !selectedFile) || isExpired}
            className={clsx(
              "mb-0.5 flex h-9 w-9 items-center justify-center rounded-full transition-all",
              !isExpired && (content.trim() || selectedFile)
                ? "bg-linear-to-br from-purple-500 to-pink-500 text-white hover:opacity-90"
                : "bg-white/5 text-white/30",
              isExpired && "opacity-50 cursor-not-allowed"
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
  const timeLabel = formatMessageTime(message.createdAt);

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

      <span className="text-[10px] text-white/30">{timeLabel}</span>
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
      <h3 className="text-sm font-semibold text-white">Không thể tải cuộc trò chuyện</h3>
      <p className="mt-2 text-xs text-white/50">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
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

