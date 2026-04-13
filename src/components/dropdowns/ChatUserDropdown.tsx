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
  const { data: sessions, isLoading, isError, error, refetch } =
    useCurrentChatSessions();

  const sortedSessions = useMemo(() => {
    return [...(sessions || [])].sort((left, right) => {
      const leftUnread = left.unreadCount ?? 0;
      const rightUnread = right.unreadCount ?? 0;
      if (leftUnread !== rightUnread) return rightUnread - leftUnread;

      const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
      const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
      return rightTime - leftTime;
    });
  }, [sessions]);

  const unreadCount = useMemo(
    () => sortedSessions.reduce((sum, item) => sum + (item.unreadCount ?? 0), 0),
    [sortedSessions],
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10"
      >
        <AiFillMessage className="text-lg text-gray-300" />
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
            className="absolute right-0 z-50 mt-3 w-95 overflow-hidden rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">Tin nhắn</p>
                <p className="text-xs text-white/40">Trò chuyện cùng bệnh nhân tại đây</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
                {sortedSessions.length}
              </span>
            </div>
            <div className="border-t border-white/10" />
            <div className="max-h-105 overflow-y-auto">
              {isLoading ? (
                <div className="flex min-h-44 items-center justify-center">
                  <Spinner size="lg" />
                </div>
              ) : isError ? (
                <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                  <p className="text-sm text-rose-300">
                    {error?.message || "Không thể tải danh sách phòng chat."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                  >
                    Thử lại
                  </button>
                </div>
              ) : sortedSessions.length === 0 ? (
                <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
                  <p className="text-sm text-white/70">Chưa có phòng chat nào.</p>
                  <p className="mt-1 text-xs text-white/40">
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

function ChatUserItem({
  session,
}: {
  session: ChatSessionSummaryResponse;
}) {
  const [, openPopup] = useAtom(openPopupAtom);
  const { isExpired } = useCountdown(session.expiredAt);
  const initials = session.partnerName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const expiredAtText = session.expiredAt ? formatDateTime(session.expiredAt) : null;

  return (
      <div
        onClick={() => openPopup(session.sessionId, session.expiredAt)}
      className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-white/5`}
    >
      <div className="relative h-10 w-10 shrink-0">
        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/20 to-white/5 text-sm font-semibold text-white">
          {session.partnerAvatar ? (
            <img
              src={session.partnerAvatar}
              alt={session.partnerName}
              className="h-full w-full object-cover"
            />
          ) : (
            initials || "?"
          )}
        </div>
        {session.status && (
          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-black bg-emerald-500" />
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/90">{session.partnerName}</p>
          {session.unreadCount ? (
            <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300">
              {session.unreadCount > 99 ? "99+" : session.unreadCount}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/40 group-hover:text-white/60">
          {isExpired && expiredAtText
            ? `Hết hạn chat vào lúc ${expiredAtText}`
            : session.lastMessage || session.status || "Chưa có tin nhắn"}
        </p>
      </div>
    </div>
  );
}
