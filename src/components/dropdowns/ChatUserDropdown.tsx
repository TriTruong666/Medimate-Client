import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useClickOutside, useEscapeKey } from "../../hooks/useDropdown";
import { AiFillMessage } from "react-icons/ai";
import { useAtom } from "jotai";
import { openPopupAtom } from "../../stores/chatPopupStore";
import type { ChatUserItemProps } from "../../types/Popup";

export function ChatUserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  useEscapeKey(() => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10"
      >
        <AiFillMessage className="text-lg text-gray-300" />
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          3
        </span>
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
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-white">Tin nhắn</p>
            </div>
            <div className="border-t border-white/10" />
            <div className="max-h-105 overflow-y-auto">
              <ChatUserItem
                id="chat1"
                name="Medimate"
                message="You can ask me anything about your health"
                online
              />
              <ChatUserItem
                id="chat2"
                name="Support Team"
                message="Your request has been reviewed."
                online
              />
              <ChatUserItem
                id="chat3"
                name="AI Assistant"
                message="Search index completed successfully."
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatUserItem({ name, message, online, id }: ChatUserItemProps) {
  const [, openPopup] = useAtom(openPopupAtom);
  return (
    <div
      onClick={() => openPopup(id)}
      className={`group relative flex cursor-pointer gap-3 px-4 py-3 transition hover:bg-white/5`}
    >
      <div className="relative h-10 w-10 shrink-0">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-white/20 to-white/5 text-sm font-semibold text-white">
          {name.charAt(0)}
        </div>
        {online && (
          <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border border-black bg-emerald-500" />
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/90">{name}</p>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-white/40 group-hover:text-white/60">
          {message}
        </p>
      </div>
    </div>
  );
}
