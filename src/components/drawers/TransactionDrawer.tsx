import { useAtom, useSetAtom } from "jotai";
import {
  closeDrawerAtom,
  transactionDetailIdAtom,
} from "../../stores/drawerStore";
import { formatPrice } from "../../common/format";
import { Badge } from "../custom-ui/Badge";
import { IoCloseOutline } from "react-icons/io5";
import {
  HiOutlinePrinter,
  HiOutlineDownload,
  HiOutlineMail,
  HiOutlineReceiptRefund,
} from "react-icons/hi";
import { useTransactionDetail } from "@/hooks/data/useTransactionHooks";

export function TransactionDrawer() {
  const [, closeDrawer] = useAtom(closeDrawerAtom);
  const [transactionId] = useAtom(transactionDetailIdAtom);
  const setTransactionDetailId = useSetAtom(transactionDetailIdAtom);
  const { data, isLoading, isError, error } = useTransactionDetail(transactionId);

  const handleCloseDrawer = () => {
    setTransactionDetailId(null);
    closeDrawer();
  };

  const status = normalizePaymentStatus(data?.paymentStatus);
  const transactionType = data?.transactionType.toLowerCase() as "in" | "out";

  if (!transactionId) return null;

  return (
    <div className="flex h-full w-120 max-w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0a0a0a] font-sans text-gray-200 shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-md">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Chi tiết giao dịch
        </h2>
        <button
          onClick={handleCloseDrawer}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <IoCloseOutline size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-7 p-6">
        {isLoading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
            Đang tải chi tiết giao dịch...
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error?.message || "Không thể tải chi tiết giao dịch."}
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
        {/* Amount Section */}
        <div className="flex flex-col gap-1 border-b border-white/5 pb-7">
          <p className="text-[10px] font-bold text-gray-500 uppercase">
            Tổng số tiền giao dịch
          </p>
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-3xl font-semibold tracking-tight ${
                transactionType === "in"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {transactionType === "in" ? "+" : "-"}
              {formatPrice(data.amount || 0)}
            </span>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <QuickAction
            icon={<HiOutlinePrinter size={18} />}
            label="In biên lai"
          />
          <QuickAction icon={<HiOutlineDownload size={18} />} label="Tải PDF" />
          <QuickAction icon={<HiOutlineMail size={18} />} label="Gửi Email" />
          {transactionType === "in" ? (
            <QuickAction
              icon={<HiOutlineReceiptRefund size={18} />}
              label="Hoàn tiền"
            />
          ) : (
            <QuickAction icon={<IoCloseOutline size={18} />} label="Huỷ GD" />
          )}
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          <h3 className="border-b border-white/5 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Thông tin chung
          </h3>

          <div className="flex flex-col gap-3">
            <DetailRow
              label="Mã giao dịch"
              value={
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
                  {data.transactionCode}
                </span>
              }
            />
            <DetailRow label="Lịch hẹn" value={formatDate(data.appointmentDate)} />
            <DetailRow
              label="Phân loại"
              value={
                <Badge
                  type={transactionType === "in" ? "success" : "error"}
                  value={
                    transactionType === "in"
                      ? "Tiền nhận vào"
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
          <h3 className="border-b border-white/5 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Chi tiết thanh toán
          </h3>
          <div className="flex flex-col gap-3">
            <DetailRow label="Phương thức" value={data.paymentMethod.toLowerCase() === "payos" ? "Chuyển khoản" : "N/A"} />
            <DetailRow label="Kênh thanh toán" value={data.paymentMethod || "N/A"} />
            {data.paymentMethod.toLowerCase() === "payos" ? (
              <DetailRow label="Mã đối soát PAYOS" value={data.paymentCode} />
            )            
             : null}
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
        <div className="space-y-4">
          <h3 className="border-b border-white/5 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Thông tin liên quan
          </h3>
          <div className="flex flex-col gap-3">
            <DetailRow
              label={
                transactionType === "in"
                  ? "Khách hàng"
                  : "Nhà cung cấp"
              }
              value={
                transactionType === "in"
                  ? data.senderName || "N/A"
                  : data.receiverName || "N/A"
              }
            />
            <DetailRow
              label={transactionType === "in" ? "Người nhận" : "Người gửi"}
              value={
                transactionType === "in"
                  ? data.receiverName || "N/A"
                  : data.senderName || "N/A"
              }
            />
          </div>
        </div>

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
      <div className="mt-auto border-t border-white/5 bg-[#0a0a0a]/90 p-5 backdrop-blur-md">
        <div className="flex gap-3">
          <button
            onClick={handleCloseDrawer}
            className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/5 active:scale-[0.98]"
          >
            Đóng
          </button>
          {/* <button className="flex-1 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black shadow-lg transition-colors hover:bg-gray-200 active:scale-[0.98]">
            Chỉnh sửa
          </button> */}
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
    <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/2 p-3 text-gray-400 transition-all hover:bg-white/6 hover:text-white active:scale-95">
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
      <span className="text-[13px] font-medium text-gray-500">{label}</span>
      <div className="flex max-w-[65%] items-center gap-2 text-right">
        <span className="text-[13px] font-medium text-gray-300">{value}</span>
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
