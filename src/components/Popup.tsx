import { AnimatePresence, motion } from "framer-motion";
import { useAtom } from "jotai";
import { chatPopupAtom, closePopupAtom } from "../stores/chatPopupStore";
import { HiXMark } from "react-icons/hi2";
import { ChatBubble, TypingBubble } from "./ChatBubble";
import { useState } from "react";
import clsx from "clsx";
import { IoSend } from "react-icons/io5";

type ChatPopupProps = {
  chatId: string;
};

export function ChatPopup({ chatId }: ChatPopupProps) {
  const [, closePopup] = useAtom(closePopupAtom);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex h-105 w-85 flex-col rounded-xl border border-white/10 bg-[#0b0b0b] shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-linear-to-br from-purple-500 to-pink-500" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              User {chatId}
            </span>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>

        <button
          onClick={() => closePopup(chatId)}
          className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <HiXMark size={18} />
        </button>
      </div>

      {/* Body (fake messages) */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        <ChatBubble sender="other" message="Hello tụi mày" />
        <ChatBubble sender="other" message="Tao test cái UI mới nè" />

        <ChatBubble sender="me" message="Nhìn 6 quá má" />

        <ChatBubble sender="me" message="..." />
        <TypingBubble />
      </div>

      <div className="border-t border-white/10">
        <ChatInput />
      </div>
    </motion.div>
  );
}

function ChatInput() {
  const [value, setValue] = useState("");

  return (
    <div className="relative flex items-center gap-2 px-3 py-2">
      <div
        className={clsx(
          "flex flex-1 items-center rounded-xl border border-white/10 bg-white/5 px-3 transition-all",
          "focus-within:border-white/20 focus-within:bg-white/10",
        )}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Aa"
          className="h-8 w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/40"
        />
      </div>

      <button
        disabled={!value.trim()}
        className={clsx(
          "flex h-9 w-9 items-center justify-center rounded-full transition-all",
          value.trim()
            ? "bg-linear-to-br from-purple-500 to-pink-500 text-white hover:opacity-90"
            : "bg-white/5 text-white/30",
        )}
      >
        <IoSend size={14} />
      </button>
    </div>
  );
}

export function ChatContainer() {
  const [popupKeys] = useAtom(chatPopupAtom);

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="flex items-end gap-4">
        <AnimatePresence>
          {popupKeys.map((id) => (
            <ChatPopup key={id} chatId={id} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
