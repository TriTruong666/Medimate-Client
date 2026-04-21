import { useState } from "react";
import { FiCheckCircle, FiExternalLink } from "react-icons/fi";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { usePendingPayouts, usePaidPayouts } from "@/hooks/data/usePayoutHooks";
import type { PendingPayout } from "@/apis/payout.service";
import { ApprovePayoutModal } from "@/components/modals/ApprovePayoutModal";
import { PATHS } from "@/config/paths";
import { formatPrice } from "@/common/format";

const breadcrumbItems = [
  { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
  { label: "Giao dịch", path: PATHS.DASHBOARD.TRANSACTION.ROOT },
  { label: "Thanh toán Bác sĩ" },
];

export default function DoctorPayoutPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "paid">("pending");

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Thanh toán cho Bác sĩ
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-400 dark:border-white/10">
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative flex items-center px-2 py-3 text-[13px] font-semibold transition-colors ${
            activeTab === "pending"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <span>Chờ thanh toán</span>
          {activeTab === "pending" && (
            <motion.div
              layoutId="payoutTab"
              className="bg-primary absolute right-0 bottom-0 left-0 h-0.5"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`relative flex items-center px-2 py-3 text-[13px] font-semibold transition-colors ${
            activeTab === "paid"
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          <span>Đã thanh toán</span>
          {activeTab === "paid" && (
            <motion.div
              layoutId="payoutTab"
              className="bg-primary absolute right-0 bottom-0 left-0 h-0.5"
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
  const { data, isLoading, isError, error, refetch } = usePendingPayouts({
    pageNumber: page,
    pageSize: 10,
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
        isEmpty={rows.length === 0}
        pagination={{
          page,
          pageSize: 10,
          total,
          onPageChange: setPage,
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
            <td className="dark:border-border-dark border-r border-gray-400 p-4 font-mono text-sm">
              {formatPrice(row.amount)}
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-[13px] text-gray-600 dark:text-gray-300">
              {new Date(row.calculatedAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              <Badge type="warning" value="Chờ duyệt" />
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => setSelectedPayout(row)}
                className="bg-primary/10 text-primary hover:bg-primary/20 mx-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition"
              >
                <FiCheckCircle /> Duyệt
              </button>
            </td>
          </tr>
        ))}
      </DataTableShell>

      <ApprovePayoutModal
        isOpen={!!selectedPayout}
        onClose={() => setSelectedPayout(null)}
        payout={selectedPayout}
      />
    </>
  );
}

function PaidPayoutsView() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePaidPayouts({
    pageNumber: page,
    pageSize: 10,
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
      isEmpty={rows.length === 0}
      pagination={{
        page,
        pageSize: 10,
        total,
        onPageChange: setPage,
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
          <td className="p-4 text-center">
            {row.transferImageUrl ? (
              <a
                href={row.transferImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-400 px-3 py-1.5 text-[11px] font-bold text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
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
