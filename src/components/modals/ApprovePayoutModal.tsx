import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useApprovePayoutMutation } from "@/hooks/data/usePayoutHooks";
import type { PendingPayout } from "@/apis/payout.service";
import { Input } from "@/components/custom-ui/Input";
import { toast } from "@/hooks/useToast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payout: PendingPayout | null;
}

export function ApprovePayoutModal({ isOpen, onClose, payout }: Props) {
  const approveMutation = useApprovePayoutMutation();
  const [bankCode, setBankCode] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (!payout) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập mã giao dịch ngân hàng.");
      return;
    }

    approveMutation.mutate(
      {
        payoutId: payout.payoutId,
        payload: {
          bankTransactionCode: bankCode,
          transferImage: file,
        },
      },
      {
        onSuccess: () => {
          onClose();
          setBankCode("");
          setFile(null);
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Duyệt chi thanh toán
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <form id="approve-payout-form" onSubmit={handleSubmit} className="p-6">
              <div className="mb-6 space-y-2">
                <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">Thông tin bác sĩ</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                    <span className="font-bold">{payout.doctorName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{payout.doctorName}</p>
                    <p className="text-xs text-gray-500">{payout.bankName} - {payout.accountNumber}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-orange-50 p-4 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Số tiền quyết toán</p>
                  <p className="mt-1 text-2xl font-bold text-orange-700 dark:text-orange-400 tabular-nums">
                    {payout.amount.toLocaleString()} đ
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Mã giao dịch (Bank Transaction Code)"
                  placeholder="VD: FT2604901234..."
                  value={bankCode}
                  onChange={setBankCode}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                    Ảnh minh chứng (UNC/Biên lai)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-gray-400 bg-white px-4 py-2 text-xs font-medium text-gray-600 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold hover:border-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:file:bg-white/10 dark:file:text-white"
                  />
                </div>
              </div>
            </form>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                form="approve-payout-form"
                type="submit"
                disabled={approveMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {approveMutation.isPending ? "Đang xử lý..." : "Xác nhận duyệt"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
