import { useState, useRef } from "react";
import { FiCheckCircle, FiExternalLink } from "react-icons/fi";
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
  { label: "Thanh toán bác sĩ" },
];

export default function DoctorPayoutPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "paid">("pending");

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Thanh toán cho Bác sĩ
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 pb-px dark:border-white/10">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center px-4 py-2 font-medium tracking-wide transition-colors ${
            activeTab === "pending"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          Chờ thanh toán
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`flex items-center px-4 py-2 font-medium tracking-wide transition-colors ${
            activeTab === "paid"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          Đã thanh toán
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

  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);

  const columns = [
    { key: "doctor", label: "Bác sĩ", width: "w-[20%]" },
    { key: "bank", label: "Ngân hàng", width: "w-[25%]" },
    { key: "amount", label: "Số tiền", width: "w-[15%]" },
    { key: "calcAt", label: "Kỳ kết toán", width: "w-[15%]" },
    { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" as const },
    { key: "actions", label: "Thao tác", width: "w-[10%]", align: "center" as const },
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
          onPageSizeChange: (next) => { setPageSize(next); setPage(1); },
        }}
      >
        {rows.map((row) => (
          <tr key={row.payoutId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="font-semibold text-gray-900 dark:text-white">
                {row.doctorName || "N/A"}
              </span>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {row.bankName}
                </span>
                <span className="text-xs text-gray-500">
                  {row.accountNumber} - {row.accountHolder}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-orange-500 font-bold">
              {row.amount?.toLocaleString()} đ
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-sm text-gray-600 dark:text-gray-300">
              {new Date(row.calculatedAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              <Badge type="warning" value="Chờ duyệt" />
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => setSelectedPayout(row)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
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
    { key: "actions", label: "Bằng chứng", width: "w-[15%]", align: "center" as const },
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
        onPageSizeChange: (next) => { setPageSize(next); setPage(1); },
      }}
    >
      {rows.map((row) => (
        <tr key={row.payoutId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
          <td className="dark:border-border-dark border-r border-gray-100 p-4">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.doctorName || "N/A"}
            </span>
          </td>
          <td className="dark:border-border-dark border-r border-gray-100 p-4">
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 dark:text-white">
                {row.bankName}
              </span>
              <span className="text-xs text-gray-500">
                {row.accountNumber}
              </span>
            </div>
          </td>
          <td className="dark:border-border-dark border-r border-gray-100 p-4 text-sm font-mono text-gray-600 dark:text-gray-300">
            {row.bankTransactionCode || "N/A"}
          </td>
          <td className="dark:border-border-dark border-r border-gray-100 p-4 text-success font-bold">
            {row.amount?.toLocaleString()} đ
          </td>
          <td className="dark:border-border-dark border-r border-gray-100 p-4 text-sm text-gray-600 dark:text-gray-300">
            {row.paidAt ? new Date(row.paidAt).toLocaleDateString("vi-VN") : "N/A"}
          </td>
          <td className="p-4 text-center">
            {row.transferImageUrl ? (
              <a
                href={row.transferImageUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
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
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-gray-900 border dark:border-white/10">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Duyệt Thanh Toán
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Xác nhận chuyển <strong className="text-gray-800 dark:text-white">{payout.amount.toLocaleString()} VND</strong> cho bác sĩ <strong>{payout.doctorName}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mã giao dịch ngân hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: FT2604901234..."
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ảnh chụp UNC (không bắt buộc)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 dark:text-gray-400"
            />
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={approveMutation.isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={approveMutation.isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {approveMutation.isPending ? "Đang xử lý..." : "Xác nhận & Duyệt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
