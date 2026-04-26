import { useState, useRef } from "react";
import { FiCheckCircle, FiExternalLink, FiFileText, FiList } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import {
  usePayouts,
  usePayoutSummary,
  useProcessPayoutMutation,
} from "@/hooks/data/usePayoutHooks";
import type { PayoutSummaryDto } from "@/apis/payout.service";
import { PATHS } from "@/config/paths";

const breadcrumbItems = [
  { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
  { label: "Giao dịch", path: PATHS.DASHBOARD.TRANSACTION.ROOT },
  { label: "Thanh toán Phòng khám" },
];

export default function ClinicPayoutPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "detail">("summary");

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Thanh toán cho Phòng khám
          </h1>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200 pb-px dark:border-white/10">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex items-center gap-2 px-4 py-2 font-medium tracking-wide transition-colors ${
            activeTab === "summary"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          <FiList /> Tổng hợp Công nợ
        </button>
        <button
          onClick={() => setActiveTab("detail")}
          className={`flex items-center gap-2 px-4 py-2 font-medium tracking-wide transition-colors ${
            activeTab === "detail"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          <FiFileText /> Chi tiết Khoản thu
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === "summary" && <PayoutSummaryView />}
        {activeTab === "detail" && <PayoutDetailView />}
      </div>
    </div>
  );
}

function PayoutSummaryView() {
  const { data, isLoading, isError, error, refetch } = usePayoutSummary();
  const [selectedClinic, setSelectedClinic] = useState<PayoutSummaryDto | null>(null);

  const columns = [
    { key: "clinicName", label: "Phòng khám", width: "w-[30%]" },
    { key: "pendingCount", label: "SL Giao dịch chờ", width: "w-[15%]" },
    { key: "pendingAmount", label: "Nợ cần thanh toán", width: "w-[20%]" },
    { key: "paidAmount", label: "Đã thanh toán", width: "w-[20%]" },
    { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" as const },
  ];

  const rows = data?.data || [];

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
        emptyMessage="Không có dữ liệu công nợ phòng khám."
      >
        {rows.map((row) => (
          <tr key={row.clinicId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <span className="font-semibold text-gray-900 dark:text-white">
                {row.clinicName}
              </span>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 font-mono text-sm text-gray-600 dark:text-gray-300">
              {row.pendingPayoutCount}
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-orange-500 font-bold">
              {row.totalPendingAmount.toLocaleString()} đ
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-success font-bold">
              {row.totalPaidAmount.toLocaleString()} đ
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => setSelectedClinic(row)}
                disabled={row.totalPendingAmount === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiCheckCircle /> Thanh toán
              </button>
            </td>
          </tr>
        ))}
      </DataTableShell>

      {selectedClinic && (
        <ProcessPayoutModal
          summary={selectedClinic}
          onClose={() => setSelectedClinic(null)}
        />
      )}
    </>
  );
}

function PayoutDetailView() {
  const [statusFilter, setStatusFilter] = useState<string>("ReadyToPay");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const { data, isLoading, isError, error, refetch } = usePayouts({
    status: statusFilter,
    pageNumber: page,
    pageSize,
  });

  const columns = [
    { key: "clinic", label: "Phòng khám / Người nhận", width: "w-[20%]" },
    { key: "appointment", label: "Lịch hẹn", width: "w-[20%]" },
    { key: "amount", label: "Số tiền", width: "w-[15%]" },
    { key: "bank", label: "Ngân hàng nhận", width: "w-[20%]" },
    { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" as const },
    { key: "actions", label: "Hồ sơ", width: "w-[10%]", align: "center" as const },
  ];

  const rows = data?.data?.items ?? [];
  const total = data?.data?.totalCount ?? 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hold":
        return <Badge type="info" value="Tạm giữ" />;
      case "ReadyToPay":
        return <Badge type="warning" value="Sẵn sàng TT" />;
      case "Paid":
        return <Badge type="success" value="Đã TT" />;
      case "Cancelled":
        return <Badge type="error" value="Đã hủy" />;
      default:
        return <Badge type="info" value={status} />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Sub-Filters for Status */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Sẵn sàng TT", value: "ReadyToPay" },
          { label: "Tạm giữ", value: "Hold" },
          { label: "Đã thanh toán", value: "Paid" },
          { label: "Đã hủy", value: "Cancelled" },
        ].map((st) => (
          <button
            key={st.value}
            onClick={() => {
              setStatusFilter(st.value);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              statusFilter === st.value
                ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && rows.length === 0}
        emptyTitle="Trống"
        emptyMessage="Không có dữ liệu cho trạng thái này."
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
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {row.clinicName}
                </span>
                <span className="text-xs text-gray-500">
                  BS: {row.doctorName || "N/A"}
                </span>
                <span className="text-xs text-gray-500">
                  BN: {row.patientName || "N/A"}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {row.appointmentDate ? new Date(row.appointmentDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
                <span className="text-xs text-gray-500">
                  {row.appointmentTime?.slice(0, 5) || "N/A"}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-orange-500 font-bold">
              {row.amount?.toLocaleString()} đ
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {row.payerBankName || "N/A"}
                </span>
                <span className="text-xs text-gray-500">
                  {row.payerBankAccountNumber}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              {getStatusBadge(row.status)}
            </td>
            <td className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                {row.transferImageUrl && (
                  <a
                    href={row.transferImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                  >
                    Hình ảnh UNC <FiExternalLink />
                  </a>
                )}
                {row.reportFileUrl && (
                  <a
                    href={row.reportFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    Báo cáo <FiExternalLink />
                  </a>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTableShell>
    </div>
  );
}

function ProcessPayoutModal({
  summary,
  onClose,
}: {
  summary: PayoutSummaryDto;
  onClose: () => void;
}) {
  const processMutation = useProcessPayoutMutation();
  const [note, setNote] = useState("");
  const imageRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transferImage = imageRef.current?.files?.[0] || null;
    const reportFile = reportRef.current?.files?.[0] || null;

    processMutation.mutate(
      {
        clinicId: summary.clinicId,
        payload: {
          note,
          transferImage,
          reportFile,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-100 rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-gray-900 border dark:border-white/10">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Thanh toán & Đối soát
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Chuyển trạng thái tất cả các khoản <strong className="text-warning">ReadyToPay</strong> của <strong>{summary.clinicName}</strong> sang <strong className="text-success">Paid</strong>.
          <br />
          Số tiền cần thanh toán: <strong className="text-orange-500 text-lg">{summary.totalPendingAmount.toLocaleString()} VND</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ghi chú (Tùy chọn)
            </label>
            <textarea
              placeholder="Nhập ghi chú thanh toán..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              rows={2}
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Hình ảnh chụp UNC (Tùy chọn)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={imageRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 dark:text-gray-400"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              File Báo cáo đối soát (Tùy chọn)
            </label>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.doc,.docx"
              ref={reportRef}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500/10 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-500/20 dark:text-gray-400"
            />
          </div>

          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={processMutation.isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={processMutation.isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {processMutation.isPending ? "Đang xử lý..." : "Xác nhận Thanh toán"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
