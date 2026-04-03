import { useAtom } from "jotai";
import { useState } from "react";
import { HiOutlineX, HiOutlineClipboardCopy, HiOutlineInformationCircle } from "react-icons/hi";
import { IoMdCheckmark } from "react-icons/io";
import { closeModalAtom } from "../../stores/modalStore";
import { formatPrice } from "../../common/format";
import { toast } from "../../hooks/useToast";

export type PaymentQRModalProps = {
  doctorName: string;
  bankName: string;
  bankAccount: string;
  accountName: string;
  amount: number;
  period: string;
  transferContent: string;
  qrImageUrl: string;
};

export function PaymentQRModal({
  doctorName,
  bankName,
  bankAccount,
  accountName,
  amount,
  period,
  transferContent,
  qrImageUrl,
}: PaymentQRModalProps) {
  const [, closeModal] = useAtom(closeModalAtom);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
  };

  const handleCheckPayment = () => {
    toast.success(
      "Giao dịch thành công",
      "Hệ thống đã ghi nhận thanh toán, bạn có thể tắt cửa sổ này.",
      {
        actionLabel: "Close",
        duration: 10000,
      },
    );
  };

  return (
    <div className="flex max-h-[85vh] w-160 flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-white">
            Thanh toán định kỳ
          </h2>
          <p className="text-xs text-white/50">
            Thanh toán phí cho bác sĩ – {period}
          </p>
        </div>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Người nhận</p>
          <p className="mt-1 text-sm font-medium text-white">{doctorName}</p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-300">Tổng thanh toán</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {formatPrice(amount)}
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs text-white/50">Ngân hàng</p>
            <p className="text-sm text-white">{bankName}</p>
          </div>

          <div>
            <p className="text-xs text-white/50">Chủ tài khoản</p>
            <p className="text-sm text-white">{accountName}</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/50">Số tài khoản</p>
              <p className="text-sm text-white">{bankAccount}</p>
            </div>

            <button
              onClick={() => handleCopy(bankAccount, "account")}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
            >
              {copied === "account" ? (
                <IoMdCheckmark className="h-4 w-4 shrink-0" />
              ) : (
                <HiOutlineClipboardCopy className="h-4 w-4 shrink-0" />
              )}
              {copied === "account" ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="max-w-[70%]">
              <p className="text-xs text-white/50">Nội dung chuyển khoản</p>
              <p className="text-sm font-medium break-all text-amber-400">
                {transferContent}
              </p>
            </div>

            <button
              onClick={() => handleCopy(transferContent, "content")}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
            >
              {copied === "content" ? (
                <IoMdCheckmark className="h-4 w-4 shrink-0" />
              ) : (
                <HiOutlineClipboardCopy className="h-4 w-4 shrink-0" />
              )}

              {copied === "content" ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-800 p-6">
          <div className="rounded-lg bg-white p-3">
            <img
              src={qrImageUrl}
              alt="QR Code"
              className="h-44 w-44 object-contain"
            />
          </div>
          <p className="mt-4 text-xs text-white/50">
            Quét mã QR bằng ứng dụng ngân hàng
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
          <p className="text-sm leading-relaxed text-yellow-300">
            Vui lòng kiểm tra kỹ thông tin trước khi thực hiện chuyển khoản. Đảm
            bảo số tài khoản, tên chủ tài khoản, và nội dung chuyển khoản chính
            xác để tránh sai sót. Hệ thống sẽ tự động ghi nhận thanh toán sau
            khi giao dịch được xác nhận.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-5">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Đóng
        </button>

        <button
          onClick={handleCheckPayment}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Kiểm tra giao dịch
        </button>
      </div>
    </div>
  );
}
