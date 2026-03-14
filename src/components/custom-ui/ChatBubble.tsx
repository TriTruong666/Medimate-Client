import { motion } from "framer-motion";
import clsx from "clsx";
type ChatBubbleProps = {
  message: string;
  sender: "me" | "other";
};

export function ChatBubble({ message, sender }: ChatBubbleProps) {
  const isMe = sender === "me";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={clsx("flex w-full", isMe ? "justify-end" : "justify-start")}
    >
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-4 py-2 text-[13px] leading-relaxed",
          isMe
            ? "rounded-br-md bg-linear-to-br from-purple-500 to-pink-500 text-white"
            : "rounded-bl-md bg-white/10 text-white/80 backdrop-blur-md",
        )}
      >
        {message}
      </div>
    </motion.div>
  );
}
export function TypingBubble() {
  return (
    <div className="flex">
      <div className="flex gap-1 rounded-2xl bg-white/10 px-3 py-2">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
