import { useState, useRef } from "react";
import { FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import {
  useRefundableAppointments,
  useCompleteRefund,
} from "@/hooks/data/usePayoutHooks";
import { useQuery } from "@tanstack/react-query";
import { getUserBankAccount } from "@/apis/user.service";
import type { RefundableAppointmentDto } from "@/apis/payout.service";
import { PATHS } from "@/config/paths";

const breadcrumbItems = [
  { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
  { label: "Giao dịch", path: PATHS.DASHBOARD.TRANSACTION.ROOT },
  { label: "Hoàn tiền" },
];

const columns = [
  { key: "member", label: "Người dùng", width: "w-[22%]" },
  { key: "appointment", label: "Lịch hẹn", width: "w-[18%]" },
  {
    key: "status",
    label: "Trạng thái đặt",
    width: "w-[15%]",
    align: "center" as const,
  },
  {
    key: "payment",
    label: "Trạng thái TT",
    width: "w-[15%]",
    align: "center" as const,
  },
  { key: "reason", label: "Lý do hủy", width: "w-[20%]" },
  {
    key: "actions",
    label: "Thao tác",
    width: "w-[10%]",
    align: "center" as const,
  },
];

export default function UserRefundPage() {
  const { data, isLoading, isError, error, refetch } =
    useRefundableAppointments();
  const [selected, setSelected] = useState<RefundableAppointmentDto | null>(null);

  const rows = data?.data ?? [];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Hoàn tiền
          </h1>
        </div>
      </div>

      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyTitle="Không có lịch hẹn cần hoàn tiền"
        emptyMessage="Tất cả yêu cầu hoàn tiền đã được xử lý."
      >
        {rows.map((row) => (
          <tr
            key={row.appointmentId}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span className="font-semibold text-gray-900 dark:text-white">
                {row.memberName || "N/A"}
              </span>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {new Date(row.appointmentDate).toLocaleDateString("vi-VN")}
                </span>
                <span className="text-xs text-gray-500">
                  {row.appointmentTime?.slice(0, 5)}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <Badge type="error" value={row.status} />
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <Badge type="warning" value={row.paymentStatus} />
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-xs text-gray-500 italic">
              {row.cancelReason || "—"}
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => setSelected(row)}
                className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              >
                <FiCheckCircle /> Xác nhận hoàn
              </button>
            </td>
          </tr>
        ))}
      </DataTableShell>

      {selected && (
        <CompleteRefundModal
          appointment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function CompleteRefundModal({
  appointment,
  onClose,
}: {
  appointment: RefundableAppointmentDto;
  onClose: () => void;
}) {
  const { mutate, isPending } = useCompleteRefund();
  const imageRef = useRef<HTMLInputElement>(null);

  const { data: bankRes, isLoading: isLoadingBank } = useQuery({
    queryKey: ["user", "bank-account", appointment.userId],
    queryFn: () => getUserBankAccount(appointment.userId),
    enabled: !!appointment.userId,
  });
  const bankAccount = bankRes?.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transferImage = imageRef.current?.files?.[0] ?? null;
    mutate({ appointmentId: appointment.appointmentId, transferImage }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Xác nhận hoàn tiền
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Upload ảnh chụp lệnh chuyển khoản để xác nhận đã hoàn tiền cho người
          dùng.
        </p>

        {/* Thông tin ngân hàng */}
        <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-200 dark:bg-white/5 dark:border-white/10">
          <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Thông tin nhận tiền (Khách hàng)
          </h3>
          {isLoadingBank ? (
            <p className="text-sm text-gray-500">Đang tải thông tin...</p>
          ) : bankAccount ? (
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Ngân hàng:</span> {bankAccount.bankName}</p>
              <p><span className="font-medium">Số TK:</span> {bankAccount.accountNumber}</p>
              <p><span className="font-medium">Chủ TK:</span> {bankAccount.accountHolder}</p>
            </div>
          ) : (
            <p className="text-sm text-red-500">Khách hàng chưa cập nhật thông tin ngân hàng.</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ảnh chụp UNC{" "}
              <span className="text-xs font-normal text-gray-400">
                (Tùy chọn)
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              ref={imageRef}
              className="file:bg-primary/10 file:text-primary hover:file:bg-primary/20 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2.5 file:text-sm file:font-semibold dark:text-gray-400"
            />
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50"
            >
              {isPending ? "Đang xử lý..." : "Xác nhận đã hoàn tiền"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
