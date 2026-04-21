import { HiOutlineX, HiOutlineInformationCircle } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

type DeleteDoctorContractModalProps = {
  contractId: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isOpen?: boolean;
};

export function DeleteDoctorContractModal({
  contractId,
  isPending,
  onClose,
  onConfirm,
  isOpen = false,
}: DeleteDoctorContractModalProps) {
  const shortId = contractId.slice(0, 8).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
                Xác nhận xoá hợp đồng
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

            {/* Content */}
            <div className="space-y-6 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Hành động này sẽ xoá vĩnh viễn hợp đồng{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  HD-{shortId}
                </span>
                . Vui lòng xác nhận trước khi tiếp tục.
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-50 p-4 dark:bg-red-500/10">
                  <HiOutlineInformationCircle className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-200">
                    Việc xoá hợp đồng sẽ gỡ bỏ các ràng buộc pháp lý và quyền
                    lợi liên quan của bác sĩ trong hệ thống.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-400 bg-white/5 p-4 dark:border-white/20 dark:bg-white/5">
                  <HiOutlineInformationCircle className="mt-0.5 flex-shrink-0 text-gray-500 dark:text-white" />
                  <p className="text-sm text-gray-600 dark:text-white/80">
                    Hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước
                    khi xoá.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                {isPending ? "Đang xử lý..." : "Xác nhận xoá"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
