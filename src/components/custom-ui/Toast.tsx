/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HiX,
  HiExclamation,
  HiCheckCircle,
  HiInformationCircle,
} from "react-icons/hi";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { ToastType } from "@/types/Toast";

type ToastProp = {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  onClose: (id: string) => void;
  icon?: ReactNode; // ✅ custom icon
};

export default function Toast({
  id,
  title,
  message,
  type,
  actionLabel,
  onAction,
  onClose,
  icon,
}: ToastProp) {
  const styles = {
    error: {
      border: "border-red-500/40",
      bg: "bg-red-500/10",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      button: "bg-red-500/20 hover:bg-red-500/30 border-red-500/30",
      defaultIcon: <HiExclamation />,
    },
    warning: {
      border: "border-yellow-500/40",
      bg: "bg-yellow-500/10",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      button: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30",
      defaultIcon: <HiExclamation />,
    },
    success: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/10",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
      button: "bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/30",
      defaultIcon: <HiCheckCircle />,
    },
    info: {
      border: "border-blue-500/40",
      bg: "bg-blue-500/10",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      button: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30",
      defaultIcon: <HiInformationCircle />,
    },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-start gap-4 rounded-xl border p-4 backdrop-blur-md ${styles.border} ${styles.bg}`}
    >
      {/* Icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
      >
        <span className={`${styles.iconColor} shrink-0 text-lg`}>
          {icon ?? styles.defaultIcon}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p
          title={message}
          className="mt-1 max-h-24 overflow-y-auto text-xs wrap-break-word whitespace-pre-line text-gray-300"
        >
          {message}
        </p>
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
