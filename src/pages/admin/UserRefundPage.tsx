import { useState, useRef } from "react";
import { FiCheckCircle } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import {
  useRefundableAppointments,
  useRefundableSubscriptions,
  useCompleteRefund,
  useCompleteSubscriptionRefund,
} from "@/hooks/data/usePayoutHooks";
import { useQuery } from "@tanstack/react-query";
import { getUserBankAccount } from "@/apis/user.service";
import type { RefundableAppointmentDto } from "@/apis/payout.service";
import type { RefundableSubscriptionDto } from "@/apis/family-subscription.service";
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
  const [activeTab, setActiveTab] = useState<"appointment" | "subscription">("appointment");

  const { data: apptData, isLoading: isLoadingAppt, isError: isErrorAppt, error: errorAppt, refetch: refetchAppt } =
    useRefundableAppointments();
  
  const { data: subData, isLoading: isLoadingSub, isError: isErrorSub, error: errorSub, refetch: refetchSub } =
    useRefundableSubscriptions();

  const [selectedAppt, setSelectedAppt] = useState<RefundableAppointmentDto | null>(null);
  const [selectedSub, setSelectedSub] = useState<RefundableSubscriptionDto | null>(null);

  const apptRows = apptData?.data ?? [];
  const subRows = subData?.data ?? [];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Yêu cầu Hoàn tiền
          </h1>
        </div>
      </div>

      <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab("appointment")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "appointment"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Lịch hẹn khám ({apptRows.length})
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "subscription"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Gói thành viên ({subRows.length})
        </button>
      </div>

      {activeTab === "appointment" ? (
        <DataTableShell
          columns={columns}
          isLoading={isLoadingAppt}
          isError={isErrorAppt}
          errorMessage={errorAppt?.message}
          onRetry={() => void refetchAppt()}
          isEmpty={!isLoadingAppt && !isErrorAppt && apptRows.length === 0}
          emptyTitle="Không có lịch hẹn cần hoàn tiền"
          emptyMessage="Tất cả yêu cầu hoàn tiền đã được xử lý."
        >
          {apptRows.map((row) => (
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
                  onClick={() => setSelectedAppt(row)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                >
                  <FiCheckCircle /> Xác nhận hoàn
                </button>
              </td>
            </tr>
          ))}
        </DataTableShell>
      ) : (
        <DataTableShell
          columns={[
            { key: "member", label: "Gia đình / Người dùng", width: "w-[22%]" },
            { key: "package", label: "Gói thành viên", width: "w-[18%]" },
            { key: "amount", label: "Số tiền", width: "w-[15%]" },
            { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
            { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
          ]}
          isLoading={isLoadingSub}
          isError={isErrorSub}
          errorMessage={errorSub?.message}
          onRetry={() => void refetchSub()}
          isEmpty={!isLoadingSub && !isErrorSub && subRows.length === 0}
          emptyTitle="Không có gói thành viên cần hoàn tiền"
          emptyMessage="Tất cả yêu cầu hoàn tiền đã được xử lý."
        >
          {subRows.map((row) => (
            <tr
              key={row.subscriptionId}
              className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
            >
              <td className="dark:border-border-dark border-r border-gray-400 p-4">
                <span className="font-semibold text-gray-900 dark:text-white block">
                  {row.familyName}
                </span>
                <span className="text-xs text-gray-500">{row.userName}</span>
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {row.packageName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Từ: {new Date(row.startDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4 font-semibold text-orange-600 dark:text-orange-400">
                {row.amount.toLocaleString("vi-VN")} ₫
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
                <Badge type="warning" value={row.status} />
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => setSelectedSub(row)}
                  className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                >
                  <FiCheckCircle /> Xác nhận hoàn
                </button>
              </td>
            </tr>
          ))}
        </DataTableShell>
      )}

      {selectedAppt && (
        <CompleteRefundModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}

      {selectedSub && (
        <CompleteSubRefundModal
          subscription={selectedSub}
          onClose={() => setSelectedSub(null)}
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

function CompleteSubRefundModal({
  subscription,
  onClose,
}: {
  subscription: RefundableSubscriptionDto;
  onClose: () => void;
}) {
  const { mutate, isPending } = useCompleteSubscriptionRefund();
  const imageRef = useRef<HTMLInputElement>(null);

  const { data: bankRes, isLoading: isLoadingBank } = useQuery({
    queryKey: ["user", "bank-account", subscription.userId],
    queryFn: () => getUserBankAccount(subscription.userId),
    enabled: !!subscription.userId,
  });
  const bankAccount = bankRes?.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transferImage = imageRef.current?.files?.[0] ?? null;
    mutate({ subscriptionId: subscription.subscriptionId, transferImage }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Xác nhận hoàn tiền Gói
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Upload ảnh chụp lệnh chuyển khoản để xác nhận đã hoàn tiền gói <strong>{subscription.packageName}</strong> cho người dùng.
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
