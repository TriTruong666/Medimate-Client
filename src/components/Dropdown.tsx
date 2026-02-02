import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiBell,
  HiChevronDown,
  HiUserCircle,
  HiUserGroup,
} from "react-icons/hi";
import { formatRelativeTime } from "../utils/format";
import { useClickOutside, useEscapeKey } from "../hooks/useDropdown";
import { AiFillMessage } from "react-icons/ai";

export function ChatUserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      {/* Trigger */}

      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10"
      >
        <AiFillMessage className="text-lg text-gray-300" />

        {/* Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          3
        </span>
      </button>
      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-95 overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-white">Tin nhắn</p>
            </div>

            <div className="border-t border-white/10" />

            {/* User list */}
            <div className="max-h-105 overflow-y-auto">
              <ChatUserItem
                name="Medimate"
                message="You can ask me anything about your health"
                online
              />

              <ChatUserItem
                name="Support Team"
                message="Your request has been reviewed."
                online
              />

              <ChatUserItem
                name="AI Assistant"
                message="Search index completed successfully."
              />
            </div>

            {/* Footer */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ChatUserItemProps = {
  name: string;
  message: string;
  online?: boolean;
  active?: boolean;
};

function ChatUserItem({ name, message, online, active }: ChatUserItemProps) {
  return (
    <div
      className={`group relative flex gap-3 px-4 py-3 transition hover:bg-white/5 ${active ? "bg-white/10" : ""} `}
    >
      {/* Avatar */}
      <div className="relative h-10 w-10 shrink-0">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white/20 to-white/5 text-sm font-semibold text-white">
          {name.charAt(0)}
        </div>

        {/* Online dot */}
        {online && (
          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-black bg-emerald-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/90">{name}</p>
          {active && <span className="text-[10px] text-blue-400"></span>}
        </div>

        <p className="mt-0.5 line-clamp-1 text-xs text-white/40 group-hover:text-white/60">
          {message}
        </p>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:bg-white/10"
      >
        <HiBell className="text-lg text-white/80" />

        {/* Badge */}
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          3
        </span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-90 overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-sm font-medium text-white">Thông báo</p>
            </div>

            <div className="border-t border-white/10" />

            {/* List */}
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

            {/* Footer */}
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
      {/* Unread dot */}
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

export function AvatarDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md transition-all hover:bg-white/10"
      >
        <HiUserCircle className="text-2xl text-gray-300" />
        <span className="hidden text-sm text-gray-200 md:block">
          Trí Trương
        </span>
        <HiChevronDown
          className={`text-sm transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#050505] shadow-xl backdrop-blur-xl"
          >
            <AvatarDropdownItem label="Tài khoản" />
            <AvatarDropdownItem label="Cài đặt" />
            <div className="h-px bg-white/10" />
            <AvatarDropdownItem label="Đăng xuất" danger />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type AvatarDropdownItemProps = {
  label: string;
  danger?: boolean;
};

function AvatarDropdownItem({
  label,
  danger = false,
}: AvatarDropdownItemProps) {
  return (
    <button
      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-gray-300 hover:bg-white/5 hover:text-white"
      } `}
    >
      {label}
    </button>
  );
}
