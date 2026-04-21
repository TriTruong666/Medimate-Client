import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside, useEscapeKey } from "../../hooks/useDropdown";
import { AiFillMessage } from "react-icons/ai";
import { useAtom } from "jotai";
import { openPopupAtom } from "../../stores/chatPopupStore";
import { Spinner } from "../custom-ui/Spinner";
import { useCurrentChatSessions } from "@/hooks/data/useChatDoctorHooks";
import { useCountdown } from "@/hooks/useCountdown";
import { formatDateTime } from "@/common/format";
import type { ChatSessionSummaryResponse } from "@/types/ChatDoctor";

export function ChatUserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useCurrentChatSessions();

  const sortedSessions = useMemo(() => {
    return [...(sessions || [])].sort((left, right) => {
      const leftUnread = left.unreadCount ?? 0;
      const rightUnread = right.unreadCount ?? 0;
      if (leftUnread !== rightUnread) return rightUnread - leftUnread;

      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt
        ? new Date(right.updatedAt).getTime()
        : 0;
      return rightTime - leftTime;
    });
  }, [sessions]);

  const unreadCount = useMemo(
    () =>
      sortedSessions.reduce((sum, item) => sum + (item.unreadCount ?? 0), 0),
    [sortedSessions],
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <AiFillMessage className="text-lg text-gray-500 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-90 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl dark:border-white/10 dark:bg-black/90 dark:backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Tin nhắn</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs text-gray-500 transition hover:text-gray-900 dark:text-white/50 dark:hover:text-white/80"
              >
                Làm mới
              </button>
            </div>
            <div className="border-t border-gray-100 dark:border-white/10" />
            <div className="max-h-100 overflow-y-auto thin-scrollbar">
              {isLoading ? (
                <div className="flex min-h-44 items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : isError ? (
                <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                  <p className="text-sm text-red-500">
                    {error?.message || "Không thể tải danh sách phòng chat."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    Thử lại
                  </button>
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                  <p className="text-sm text-gray-900 dark:text-white/70">
                    Chưa có phòng chat nào.
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-white/40">
                    Khi có tin nhắn mới, phòng chat sẽ xuất hiện ở đây.
                  </p>
                </div>
              ) : (
                sortedSessions.map((session) => (
                  <ChatUserItem key={session.sessionId} session={session} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatUserItem({ session }: { session: ChatSessionSummaryResponse }) {
  const [, openPopup] = useAtom(openPopupAtom);
  const derivedExpiredAt = session.startedAt
    ? new Date(new Date(session.startedAt).getTime() + 125 * 60 * 1000).toISOString()
    : session.expiredAt;

  const { isExpired } = useCountdown(derivedExpiredAt);
  const initials = (session.partnerName || session.memberName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const expiredAtText = derivedExpiredAt
    ? formatDateTime(derivedExpiredAt)
    : null;

  return (
    <div
      onClick={() =>
        openPopup(session.sessionId || session.consultanSessionId || "", derivedExpiredAt || "")
      }
      className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-white/10 last:border-0`}
    >
      <div className="relative h-10 w-10 shrink-0">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-gray-100 to-gray-50 text-sm font-semibold text-gray-900 dark:from-white/20 dark:to-white/5 dark:text-white">
          {session.partnerAvatar || session.memberAvatar ? (
            <img
              src={(session.partnerAvatar || session.memberAvatar) as string}
              alt={session.partnerName || session.memberName || ""}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || "?"
          )}
        </div>
        {session.status && (
          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 dark:border-black" />
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden text-left">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-gray-900 group-hover:text-primary transition-colors dark:text-white/90 dark:group-hover:text-white">
            {session.partnerName || session.memberName}
          </p>
          {session.unreadCount ? (
            <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {session.unreadCount > 99 ? "99+" : session.unreadCount}
            </span>
          ) : null}
        </div>

        {/* Lịch hẹn */}
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
          {(session.appointmentDate || session.startedAt) && (
            <span>{formatDateTime(session.startedAt || session.appointmentDate || "")}</span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-white/40">
          {isExpired && expiredAtText
            ? `Hết hạn chat vào lúc ${expiredAtText}`
            : session.lastMessage || session.status || "Chưa có tin nhắn"}
        </p>
      </div>
    </div>
  );
}
