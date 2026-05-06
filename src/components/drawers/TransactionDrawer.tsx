import { useAtom, useSetAtom } from "jotai";
import {
  closeDrawerAtom,
  transactionDetailIdAtom,
  payoutDetailDataAtom,
} from "../../stores/drawerStore";
import { formatPrice } from "../../common/format";
import { Badge } from "../custom-ui/Badge";
import { IoCloseOutline } from "react-icons/io5";
import { useTransactionDetail } from "@/hooks/data/useTransactionHooks";

export function TransactionDrawer() {
  const [, closeDrawer] = useAtom(closeDrawerAtom);
  const [transactionId] = useAtom(transactionDetailIdAtom);
  const [payoutData] = useAtom(payoutDetailDataAtom);
  const setTransactionDetailId = useSetAtom(transactionDetailIdAtom);
  const setPayoutDetailData = useSetAtom(payoutDetailDataAtom);
  const { data: transactionData, isLoading: isTxLoading, isError: isTxError, error: txError } =
    useTransactionDetail(transactionId);

  const handleCloseDrawer = () => {
    setTransactionDetailId(null);
    setPayoutDetailData(null);
    closeDrawer();
  };

  const isPayout = !!payoutData;
  const isLoading = isPayout ? false : isTxLoading;
  const isError = isPayout ? false : isTxError;
  const error = isPayout ? null : txError;

  const data = isPayout ? {
    amount: payoutData.amount,
    transactionCode: `APPOINTMENT-${payoutData.payoutId.split('-')[0].toUpperCase()}`,
    appointmentDate: payoutData.appointmentDate ? `${payoutData.appointmentDate.split('T')[0]}T${payoutData.appointmentTime}` : payoutData.calculatedAt,
    content: "Thanh toán công nợ từ hệ thống",
    paymentMethod: "Chuyển khoản",
    paymentCode: payoutData.payoutId,
    paymentStatus: payoutData.status,
    transactionType: "doctor_payout",
    clinicName: payoutData.clinicName,
    patientName: payoutData.patientName,
    calculatedAt: payoutData.calculatedAt,
  } : transactionData;

  const status = isPayout
    ? (data?.paymentStatus === "Paid" ? "paid" : data?.paymentStatus === "Cancelled" ? "cancelled" : "pending")
    : normalizePaymentStatus(data?.paymentStatus);

  const transactionType = data?.transactionType?.toLowerCase();

  if (!transactionId && !payoutData) return null;

  return (
    <div className="flex h-full w-120 max-w-full flex-col overflow-y-auto border-l border-gray-400 bg-white font-sans text-gray-600 shadow-2xl dark:border-white/10 dark:bg-[#0a0a0a] dark:text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-white/5 dark:bg-[#0a0a0a]/90">
        <h2 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
          Chi tiết giao dịch
        </h2>
        <button
          onClick={handleCloseDrawer}
          className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <IoCloseOutline size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-7 p-6">
        {isLoading && (
          <div className="rounded-xl border border-gray-400 bg-gray-50 p-4 text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
            Đang tải chi tiết giao dịch...
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-200">
            {error?.message || "Không thể tải chi tiết giao dịch."}
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* Amount Section */}
            <div className="flex flex-col gap-1 border-b border-gray-300 pb-7 dark:border-white/5">
              <p className="text-[10px] font-bold text-gray-500 uppercase dark:text-gray-400">
                Tổng số tiền giao dịch
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-3xl font-semibold tracking-tight ${transactionType?.startsWith("in")
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500 dark:text-red-400"
                    }`}
                >
                  {transactionType?.startsWith("in") ? "+" : "-"}
                  {formatPrice(data.amount || 0)}
                </span>
                <StatusBadge status={status} />
              </div>
            </div>

            {/* Quick Actions */}
            {/* <div className="grid grid-cols-4 gap-2">
              <QuickAction
                icon={<HiOutlinePrinter size={18} />}
                label="In biên lai"
              />
              <QuickAction
                icon={<HiOutlineDownload size={18} />}
                label="Tải PDF"
              />
              <QuickAction
                icon={<HiOutlineMail size={18} />}
                label="Gửi Email"
              />
              {transactionType?.startsWith("in") ? (
                <QuickAction
                  icon={<HiOutlineReceiptRefund size={18} />}
                  label="Hoàn tiền"
                />
              ) : (
                <QuickAction
                  icon={<IoCloseOutline size={18} />}
                  label="Huỷ GD"
                />
              )}
            </div> */}

            {/* Details Section */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-300 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:border-white/5 dark:text-gray-400">
                Thông tin chung
              </h3>

              <div className="flex flex-col gap-3">
                <DetailRow
                  label="Mã giao dịch"
                  value={
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900 dark:bg-white/10 dark:text-white">
                      {data.transactionCode}
                    </span>
                  }
                />
                <DetailRow
                  label="Lịch hẹn"
                  value={formatDate(data.appointmentDate)}
                />
                <DetailRow
                  label="Phân loại"
                  value={
                    <Badge
                      type={transactionType?.startsWith("in") ? "success" : "error"}
                      value={
                        transactionType === "in_session"
                          ? "Thanh toán tư vấn"
                          : transactionType === "in_package"
                            ? "Thanh toán gói"
                            : transactionType === "out_refund_session"
                              ? "Hoàn tiền tư vấn"
                              : transactionType === "out_clinic_payout"
                                ? "Thanh toán phòng khám"
                                : transactionType === "doctor_payout"
                                  ? "Thanh toán từ hệ thống"
                                  : "Tiền chi ra"
                      }
                    />
                  }
                />
                <DetailRow
                  label="Trạng thái thanh toán"
                  value={<StatusBadge status={status} />}
                />
                <DetailRow label="Nội dung" value={data.content || "N/A"} />
              </div>
            </div>

            {/* Demo Payment Details Section */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-300 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:border-white/5 dark:text-gray-400">
                Chi tiết thanh toán
              </h3>
              <div className="flex flex-col gap-3">
                <DetailRow
                  label="Phương thức"
                  value={
                    data.paymentMethod?.toLowerCase() === "payos"
                      ? "Chuyển khoản"
                      : "N/A"
                  }
                />
                <DetailRow
                  label="Kênh thanh toán"
                  value={data.paymentMethod || "N/A"}
                />
                {data.paymentMethod?.toLowerCase() === "payos" ? (
                  <DetailRow
                    label="Mã đối soát PAYOS"
                    value={data.paymentCode}
                  />
                ) : null}
                {/* <DetailRow label="Số tiền" value={formatPrice(data.amount || 0)} />
            <DetailRow
              label="Phí giao dịch"
              value={formatPrice(data.transactionFee || 0)}
            /> */}
                <DetailRow
                  label="Tổng thanh toán"
                  value={formatPrice(data.amount || 0)}
                />
              </div>
            </div>

            {/* Customer Demo */}
            {/* <div className="space-y-4">
              <h3 className="border-b border-gray-300 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:border-white/5 dark:text-gray-400">
                Thông tin liên quan
              </h3>
              <div className="flex flex-col gap-3">
                <DetailRow
                  label={
                    transactionType?.startsWith("in") ? "Khách hàng" : "Nhà cung cấp"
                  }
                  value={
                    transactionType?.startsWith("in")
                      ? data.senderName || "N/A"
                      : data.receiverName || "N/A"
                  }
                />
                <DetailRow
                  label={transactionType?.startsWith("in") ? "Người nhận" : "Người gửi"}
                  value={
                    transactionType?.startsWith("in")
                      ? data.receiverName || "N/A"
                      : data.senderName || "N/A"
                  }
                />
              </div>
            </div> */}

            {/* Additional Notes Demo */}
            {/* <div className="space-y-2">
          <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Ghi chú nội bộ
          </h3>
          <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-xs leading-relaxed text-gray-400 italic">
            {data.content || "Không có ghi chú."}
          </div>
        </div> */}
          </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto border-t border-gray-300 bg-white/90 p-5 backdrop-blur-md dark:border-white/10 dark:bg-[#0a0a0a]/90">
        <div className="flex gap-3">
          <button
            onClick={handleCloseDrawer}
            className="flex-1 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.98] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-400 bg-white p-3 text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-white/5 dark:bg-white/2 dark:text-gray-400 dark:hover:bg-white/6 dark:hover:text-white">
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="flex max-w-[65%] items-center gap-2 text-right">
        <span className="text-[13px] font-medium text-gray-800 dark:text-gray-300">
          {value}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "paid" | "cancelled" }) {
  const map = {
    pending: <Badge type="warning" value="Chưa thanh toán" />,
    paid: <Badge type="success" value="Đã thanh toán" />,
    cancelled: <Badge type="error" value="Bị huỷ" />,
  };
  return map[status];
}

function normalizePaymentStatus(
  status?: string,
): "pending" | "paid" | "cancelled" {
  const normalizedStatus = (status || "").trim().toLowerCase();

  if (
    normalizedStatus === "paid" ||
    normalizedStatus === "success" ||
    normalizedStatus === "completed"
  ) {
    return "paid";
  }

  if (
    normalizedStatus === "cancelled" ||
    normalizedStatus === "canceled" ||
    normalizedStatus === "failed" ||
    normalizedStatus === "rejected"
  ) {
    return "cancelled";
  }

  return "pending";
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN");
}
