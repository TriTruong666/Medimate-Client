/* eslint-disable @typescript-eslint/no-unused-vars */
import { HiX, HiExclamation } from "react-icons/hi";
import type { ToastType } from "../types/Toast";
import { motion } from "framer-motion";

type ToastProp = {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  onClose: (id: string) => void;
};

export default function Toast({
  id,
  title,
  message,
  type,
  actionLabel,
  onAction,
  onClose,
}: ToastProp) {
  const styles = {
    error: {
      border: "border-red-500/30",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
      button: "bg-red-500/20 hover:bg-red-500/30 border-red-500/30",
    },
    warning: {
      border: "border-yellow-500/30",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
      button: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30",
    },
    success: {
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      button: "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30",
    },
    info: {
      border: "border-white/20",
      iconBg: "bg-white/10",
      iconColor: "text-white",
      button: "bg-white/10 hover:bg-white/20 border-white/20",
    },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-center gap-4 rounded-xl border bg-[#1a1a1c]/95 p-4 backdrop-blur-md ${styles.border} shadow-xl`}
    >
      {/* Icon */}
      <div
        className={`h-10 w-10 shrink-0 rounded-full ${styles.iconBg} flex items-center justify-center`}
      >
        <HiExclamation className={`${styles.iconColor} text-xl`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="truncate text-xs text-gray-400">{message}</p>
      </div>

      {/* Action */}
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold text-white transition-all ${styles.button}`}
        >
          {actionLabel}
        </button>
      )}

      {/* Close */}
      <button
        onClick={() => onClose(id)}
        className="shrink-0 text-gray-400 transition-colors hover:text-white"
      >
        <HiX className="text-lg" />
      </button>
    </motion.div>
  );
}
