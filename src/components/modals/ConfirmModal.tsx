import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonType?: "danger" | "success" | "primary" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmButtonType = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const getButtonClass = () => {
    switch (confirmButtonType) {
      case "danger":
        return "bg-rose-500 hover:bg-rose-600 text-white border border-transparent";
      case "success":
        return "bg-emerald-500 hover:bg-emerald-600 text-white border border-transparent";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white border border-transparent";
      case "primary":
      default:
        return "bg-primary hover:opacity-90 text-white border border-transparent";
    }
  };

  const getIconClass = () => {
    switch (confirmButtonType) {
      case "danger":
        return "text-rose-500 bg-rose-100 dark:bg-rose-500/20";
      case "success":
        return "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20";
      case "warning":
        return "text-amber-500 bg-amber-100 dark:bg-amber-500/20";
      case "primary":
      default:
        return "text-primary bg-primary/10 dark:bg-primary/20";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={!isLoading ? onCancel : undefined} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-full ${getIconClass()}`}>
                  <HiOutlineExclamationCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {message}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 bg-gray-50 p-4 px-6 dark:bg-white/5 justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2 ${getButtonClass()}`}
              >
                {isLoading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                )}
                {isLoading ? "Đang xử lý..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
