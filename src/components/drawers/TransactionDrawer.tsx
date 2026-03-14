import { useAtom } from "jotai";
import {
  closeDrawerAtom,
  transactionDetailDataAtom,
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

export function TransactionDrawer() {
  const [, closeDrawer] = useAtom(closeDrawerAtom);
  const [data] = useAtom(transactionDetailDataAtom);

  if (!data) return null;

  return (
    <div className="flex h-full w-120 max-w-full flex-col overflow-y-auto border-l border-white/10 bg-[#0a0a0a] font-sans text-gray-200 shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/90 px-6 py-4 backdrop-blur-md">
        <h2 className="text-sm font-semibold tracking-tight text-white">
          Chi tiết giao dịch
        </h2>
        <button
          onClick={() => closeDrawer()}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <IoCloseOutline size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-7 p-6">
        {/* Amount Section */}
        <div className="flex flex-col gap-1 border-b border-white/5 pb-7">
          <p className="text-[10px] font-bold text-gray-500 uppercase">
            Tổng số tiền giao dịch
          </p>
          <div className="flex items-center justify-between">
            <span
              className={`font-mono text-3xl font-semibold tracking-tight ${
                data.transaction_type === "revenue"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {data.transaction_type === "revenue" ? "+" : "-"}
              {formatPrice(data.totalPrice)}
            </span>
            <StatusBadge status={data.status} />
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
          {data.transaction_type === "revenue" ? (
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
                  {data.id}
                </span>
              }
            />
            <DetailRow label="Ngày tạo" value={data.createdAt} />
            <DetailRow
              label="Cập nhật lần cuối"
              value={`${data.createdAt} 14:30`}
            />
            <DetailRow
              label="Phân loại"
              value={
                <Badge
                  type={
                    data.transaction_type === "revenue" ? "success" : "error"
                  }
                  value={
                    data.transaction_type === "revenue"
                      ? "Tiền nhận vào"
                      : "Tiền chi ra"
                  }
                />
              }
            />
            <DetailRow
              label="Trạng thái thanh toán"
              value={<StatusBadge status={data.status} />}
            />
            <DetailRow label="Người tạo" value="Trương Hoàng Trí" />
          </div>
        </div>

        {/* Demo Payment Details Section */}
        <div className="space-y-4">
          <h3 className="border-b border-white/5 pb-2 text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Chi tiết thanh toán
          </h3>
          <div className="flex flex-col gap-3">
            <DetailRow label="Phương thức" value="Chuyển khoản (Demo)" />
            <DetailRow label="Ngân hàng" value="Vietcombank" />
            <DetailRow label="Số tài khoản" value="***3456789" />
            <DetailRow label="Chủ tài khoản" value="CONG TY TNHH MEDIMATE" />
            <DetailRow label="Nội dung" value={`Thanh toán ${data.id}`} />
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
                data.transaction_type === "revenue"
                  ? "Khách hàng"
                  : "Nhà cung cấp"
              }
              value={
                data.transaction_type === "revenue"
                  ? "Trần Thị Bệnh Nhân"
                  : "Công ty TNHH Dược Phẩm XYZ"
              }
            />
            <DetailRow label="Số điện thoại" value="0987 *** 321" />
            <DetailRow label="Email" value="contact@***.com" />
          </div>
        </div>

        {/* Additional Notes Demo */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Ghi chú nội bộ
          </h3>
          <div className="rounded-xl border border-white/5 bg-white/2 p-3 text-xs leading-relaxed text-gray-400 italic">
            Giao dịch phân hệ Demo. Không có giá trị pháp lý thực tế. Mọi thắc
            mắc vui lòng liên hệ bộ phận kế toán.
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto border-t border-white/5 bg-[#0a0a0a]/90 p-5 backdrop-blur-md">
        <div className="flex gap-3">
          <button
            onClick={() => closeDrawer()}
            className="flex-1 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/5 active:scale-[0.98]"
          >
            Đóng
          </button>
          <button className="flex-1 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black shadow-lg transition-colors hover:bg-gray-200 active:scale-[0.98]">
            Chỉnh sửa
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
    <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/2 p-3 text-gray-400 transition-all hover:bg-white/[0.06] hover:text-white active:scale-95">
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
