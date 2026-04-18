import { HiOutlineX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

type DeletePackageModalProps = {
  packageName: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open?: boolean; // Added open prop for AnimatePresence
};

export function DeletePackageModal({
  packageName,
  isPending,
  onClose,
  onConfirm,
  open = true,
}: DeletePackageModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/50 p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                Xác nhận xóa gói
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                disabled={isPending}
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Bạn có chắc chắn muốn xóa gói dịch vụ{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {packageName}
                </span>
                ? Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                {isPending ? "Đang xóa..." : "Xóa gói"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

