import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { HiBell } from "react-icons/hi";
import { formatRelativeTime } from "../../common/format";
import { useClickOutside, useEscapeKey } from "../../hooks/useDropdown";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/data/useNotificationHooks";
import { Spinner } from "../custom-ui/Spinner";
import type { AppNotification } from "@/types/Notification";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const sortedNotifications = [...(notifications || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const unreadCount = sortedNotifications.filter((item) => !item.isRead).length;

  const { user } = useAuth();
  const roleTitleMap: Record<string, string> = {
    Admin: "Quản trị viên",
    Doctor: "Bác sĩ",
    DoctorManager: "Kiểm soát viên",
    User: "Khách hàng",
  };

  useEffect(() => {
    const roleTitle = (user?.role && roleTitleMap[user.role]) || "Dashboard";
    const baseTitle = `Medimate - ${roleTitle}`;

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${baseTitle}`;
      return;
    }

    document.title = baseTitle;
  }, [unreadCount, user?.role]);

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));

  function handleMarkRead(item: AppNotification) {
    if (item.isRead || markReadMutation.isPending) return;
    markReadMutation.mutate(item.notificationId);
  }

  function handleMarkAllRead() {
    if (unreadCount === 0 || markAllReadMutation.isPending) return;
    markAllReadMutation.mutate();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md dark:hover:bg-white/10"
      >
        <HiBell className="text-lg text-gray-500 dark:text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-90 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl dark:border-white/10 dark:bg-black/90 dark:backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Thông báo
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs text-gray-500 transition hover:text-gray-900 dark:text-white/50 dark:hover:text-white/80"
              >
                Làm mới
              </button>
            </div>

            <div className="border-t border-gray-100 dark:border-white/10" />

            <div className="thin-scrollbar max-h-100 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <Spinner size="md" />
                </div>
              ) : isError ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-red-500">
                    {error?.message || "Không thể tải thông báo."}
                  </p>
                </div>
              ) : sortedNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm font-medium text-gray-500 dark:text-white/50">
                  Chưa có thông báo nào.
                </div>
              ) : (
                sortedNotifications.map((item) => (
                  <NotificationDropdownItem
                    key={item.notificationId}
                    title={item.title}
                    description={item.message}
                    date={item.createdAt}
                    unread={!item.isRead}
                    onClick={() => handleMarkRead(item)}
                    disabled={markReadMutation.isPending}
                  />
                ))
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0 || markAllReadMutation.isPending}
                className="w-full px-4 py-3 text-center text-xs text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white/50 dark:hover:text-white/80"
              >
                {markAllReadMutation.isPending
                  ? "Đang cập nhật..."
                  : "Đánh dấu đã đọc hết"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type NotificationDropdownItemProps = {
  title: string;
  description: string;
  date: string;
  unread?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function NotificationDropdownItem({
  title,
  description,
  date,
  unread,
  onClick,
  disabled,
}: NotificationDropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex gap-3 border-b border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 dark:border-white/5 dark:hover:bg-white/5`}
    >
      {unread && (
        <span className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full" />
      )}

      <div className="flex flex-1 flex-col">
        <p
          className={`text-[13px] font-medium transition-colors ${unread ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white"}`}
        >
          {title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-white/50">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-[11px] text-gray-400 dark:text-white/30">
        {formatRelativeTime(date)}
      </span>
    </button>
  );
}
