import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiBell } from "react-icons/hi";
import { formatRelativeTime } from "../../common/format";
import { useClickOutside, useEscapeKey } from "../../hooks/useDropdown";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:bg-white/10"
      >
        <HiBell className="text-lg text-white/80" />
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          3
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-90 overflow-hidden rounded-2xl border border-white/10 bg-black/90 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-white">Thông báo</p>
            </div>

            <div className="border-t border-white/10" />

            <div className="max-h-100 overflow-y-auto">
              <NotificationDropdownItem
                title="Tin nhắn mới"
                description="Medimate replied to your question."
                date="2026-02-02T08:00:00"
                unread
              />

              <NotificationDropdownItem
                title="Cập nhật mới"
                description="Search index completed successfully."
                date="2026-01-31T20:30:00"
              />

              <NotificationDropdownItem
                title="Nhắc nhở"
                description="You have unfinished conversations."
                date="2026-01-30T10:00:00"
              />
              <NotificationDropdownItem
                title="Nhắc nhở"
                description="You have unfinished conversations."
                date="2026-01-30T10:00:00"
              />
            </div>

            <div className="">
              <button className="w-full px-4 py-3 text-center text-xs text-white/50 hover:text-white/80">
                Đánh dấu đã đọc hết
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
};

function NotificationDropdownItem({
  title,
  description,
  date,
  unread,
}: NotificationDropdownItemProps) {
  return (
    <div
      className={`group relative flex gap-3 border-b border-white/10 px-4 py-3 transition hover:bg-white/5`}
    >
      {unread && (
        <span className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full" />
      )}

      <div className="flex flex-1 flex-col">
        <p className="text-[13px] font-medium text-white/90">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-white/50">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-[11px] text-white/30">
        {formatRelativeTime(date)}
      </span>
    </div>
  );
}
