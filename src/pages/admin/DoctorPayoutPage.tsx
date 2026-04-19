import { useState, useRef } from "react";
import { FiCheckCircle, FiExternalLink } from "react-icons/fi";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import {
  usePendingPayouts,
  usePaidPayouts,
  useApprovePayoutMutation,
} from "@/hooks/data/usePayoutHooks";
import type { PendingPayout } from "@/apis/payout.service";

const breadcrumbItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Giao dịch", path: "/dashboard/transactions" },
];

export default function DoctorPayoutPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "paid">("pending");

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Thanh toán cho Bác sĩ
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-300 dark:border-white/10">
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative flex items-center px-2 py-3 text-[13px] font-semibold transition-colors ${activeTab === "pending"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
        >
          <span>Chờ thanh toán</span>
          {activeTab === "pending" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`relative flex items-center px-2 py-3 text-[13px] font-semibold transition-colors ${activeTab === "paid"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
        >
          <span>Đã thanh toán</span>
          {activeTab === "paid" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === "pending" ? <PendingPayoutsView /> : <PaidPayoutsView />}
      </div>
    </div>
  );
}

function PendingPayoutsView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isError, error, refetch } = usePendingPayouts({
    pageNumber: page,
    pageSize,
  });

  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(
    null,
  );

  const columns = [
    { key: "doctor", label: "Bác sĩ", width: "w-[20%]" },
    { key: "bank", label: "Ngân hàng", width: "w-[25%]" },
    { key: "amount", label: "Số tiền", width: "w-[15%]" },
    { key: "calcAt", label: "Kỳ kết toán", width: "w-[15%]" },
    {
      key: "status",
      label: "Trạng thái",
      width: "w-[15%]",
      align: "center" as const,
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "w-[10%]",
      align: "center" as const,
    },
  ];

  const rows = data?.data?.items ?? [];
  const total = data?.data?.totalCount ?? 0;

  return (
    <>
      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyTitle="Trống"
        emptyMessage="Không có lệnh thanh toán nào cần chờ duyệt."
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (next) => {
            setPageSize(next);
            setPage(1);
          },
        }}
      >
        {rows.map((row) => (
          <tr
            key={row.payoutId}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {row.doctorName || "N/A"}
              </span>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {row.bankName}
                </span>
                <span className="text-[11px] text-gray-500">
                  {row.accountNumber} - {row.accountHolder}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-sm font-bold text-orange-500 tabular-nums">
              {row.amount?.toLocaleString()} đ
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-[13px] text-gray-600 dark:text-gray-300">
              {new Date(row.calculatedAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <Badge type="warning" value="Chờ duyệt" />
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <button
                onClick={() => setSelectedPayout(row)}
                className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition"
              >
                <FiCheckCircle /> Duyệt
              </button>
            </td>
          </tr>
        ))}
      </DataTableShell>

      {selectedPayout && (
        <ApprovePayoutModal
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </>
  );
}

function PaidPayoutsView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading, isError, error, refetch } = usePaidPayouts({
    pageNumber: page,
    pageSize,
  });

  const columns = [
    { key: "doctor", label: "Bác sĩ", width: "w-[20%]" },
    { key: "bank", label: "Ngân hàng", width: "w-[20%]" },
    { key: "code", label: "Mã giao dịch", width: "w-[15%]" },
    { key: "amount", label: "Số tiền", width: "w-[15%]" },
    { key: "paidAt", label: "Ngày duyệt", width: "w-[15%]" },
    {
      key: "actions",
      label: "Bằng chứng",
      width: "w-[15%]",
      align: "center" as const,
    },
  ];

  const rows = data?.data?.items ?? [];
  const total = data?.data?.totalCount ?? 0;

  return (
    <DataTableShell
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
      isEmpty={!isLoading && !isError && rows.length === 0}
      emptyTitle="Trống"
      emptyMessage="Chưa có lịch sử thanh toán thành công."
      pagination={{
        page,
        pageSize,
        total,
        onPageChange: setPage,
        onPageSizeChange: (next) => {
          setPageSize(next);
          setPage(1);
        },
      }}
    >
      {rows.map((row) => (
        <tr
          key={row.payoutId}
          className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
        >
          <td className="dark:border-border-dark border-r border-gray-400 p-4">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {row.doctorName || "N/A"}
            </span>
          </td>
          <td className="dark:border-border-dark border-r border-gray-400 p-4">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {row.bankName}
              </span>
              <span className="text-[11px] text-gray-500">
                {row.accountNumber}
              </span>
            </div>
          </td>
          <td className="dark:border-border-dark border-r border-gray-400 p-4 font-mono text-[13px] text-gray-600 dark:text-gray-300">
            {row.bankTransactionCode || "N/A"}
          </td>
          <td className="dark:border-border-dark text-success border-r border-gray-400 p-4 text-sm font-bold tabular-nums">
            {row.amount?.toLocaleString()} đ
          </td>
          <td className="dark:border-border-dark border-r border-gray-400 p-4 text-[13px] text-gray-600 dark:text-gray-300">
            {row.paidAt
              ? new Date(row.paidAt).toLocaleDateString("vi-VN")
              : "N/A"}
          </td>
          <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
            {row.transferImageUrl ? (
              <a
                href={row.transferImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-400 px-3 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Ảnh UNC <FiExternalLink />
              </a>
            ) : (
              <span className="text-xs text-gray-400">Không có ảnh</span>
            )}
          </td>
        </tr>
      ))}
    </DataTableShell>
  );
}

function ApprovePayoutModal({
  payout,
  onClose,
}: {
  payout: PendingPayout;
  onClose: () => void;
}) {
  const approveMutation = useApprovePayoutMutation();
  const [bankCode, setBankCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode.trim()) {
      alert("Vui lòng nhập mã giao dịch ngân hàng.");
      return;
    }
    const file = fileInputRef.current?.files?.[0] || null;

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
          onClose(); // Hide modal after success
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="flex w-full max-w-md scale-100 flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-300 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
            Duyệt Thanh Toán
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6">
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Xác nhận chuyển{" "}
              <strong className="text-gray-900 dark:text-white">
                {payout.amount.toLocaleString()} đ
              </strong>{" "}
              cho bác sĩ <strong>{payout.doctorName}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                  Mã giao dịch ngân hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: FT2604901234..."
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                  Ảnh chụp UNC (không bắt buộc)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="file:bg-primary/10 file:text-primary hover:file:bg-primary/20 block w-full text-xs text-gray-500 transition file:mr-4 file:rounded-xl file:border-0 file:px-4 file:py-2 file:text-xs file:font-semibold dark:text-white/60"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-300 bg-gray-50/20 p-5 dark:border-white/10 dark:bg-white/2">
            <button
              type="button"
              onClick={onClose}
              disabled={approveMutation.isPending}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={approveMutation.isPending}
              className="bg-primary rounded-xl px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
            >
              {approveMutation.isPending ? "Đang xử lý..." : "Xác nhận Duyệt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
