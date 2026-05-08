import { useState, useRef, useEffect } from "react";
import {
  FiCheckCircle,
  FiDownload,
  FiExternalLink,
  FiFileText,
  FiList,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import GlassSelect from "@/components/custom-ui/Select";
import {
  usePayouts,
  usePayoutSummary,
  useProcessPayoutMutation,
} from "@/hooks/data/usePayoutHooks";
import { useClinic } from "@/hooks/data/useClinicHooks";
import type { PayoutSummaryDto } from "@/apis/payout.service";
import { PATHS } from "@/config/paths";
import { formatPrice } from "@/common/format";

const breadcrumbItems = [
  { label: "Dashboard", path: PATHS.DASHBOARD.ROOT },
  { label: "Giao dịch", path: PATHS.DASHBOARD.TRANSACTION.ROOT },
  { label: "Thanh toán Phòng khám" },
];

export default function ClinicPayoutPage() {
  const [activeTab, setActiveTab] = useState<"summary" | "detail">("summary");
  const [statusFilter, setStatusFilter] = useState<string>("ReadyToPay");

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Thanh toán cho Phòng khám
          </h1>
        </div>

        {activeTab === "detail" && (
          <div className="w-64">
            <GlassSelect
              options={[
                { label: "Sẵn sàng TT", value: "ReadyToPay" },
                { label: "Tạm giữ", value: "Hold" },
                { label: "Đã thanh toán", value: "Paid" },
                { label: "Đã hủy", value: "Cancelled" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <div className="mb-10 flex gap-4 border-b border-gray-400 pb-px dark:border-white/10">
        {(
          [
            { id: "summary", label: "Tổng hợp Công nợ" },
            { id: "detail", label: "Chi tiết Khoản thu" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium transition-colors ${activeTab === tab.id
              ? "text-primary"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabUnderline"
                className="bg-primary absolute right-1 bottom-0 left-1 h-0.5 rounded-full"
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 1,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full">
        {activeTab === "summary" && <PayoutSummaryView />}
        {activeTab === "detail" && (
          <PayoutDetailView
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        )}
      </div>
    </div>
  );
}

function PayoutSummaryView() {
  const { data, isLoading, isError, error, refetch } = usePayoutSummary();
  const [selectedClinic, setSelectedClinic] = useState<PayoutSummaryDto | null>(
    null,
  );

  const columns = [
    { key: "clinicName", label: "Phòng khám", width: "w-[30%]" },
    { key: "pendingCount", label: "SL Giao dịch chờ", width: "w-[15%]" },
    { key: "pendingAmount", label: "Nợ cần thanh toán", width: "w-[20%]" },
    { key: "paidAmount", label: "Đã thanh toán", width: "w-[20%]" },
    {
      key: "actions",
      label: "Thao tác",
      width: "w-[15%]",
      align: "center" as const,
    },
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
          <tr
            key={row.clinicId}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <span className="font-semibold text-gray-900 dark:text-white">
                {row.clinicName}
              </span>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 font-mono text-sm text-gray-600 dark:text-gray-300">
              {row.pendingPayoutCount}
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-sm font-medium text-orange-500">
              {formatPrice(row.totalPendingAmount)}
            </td>
            <td className="dark:border-border-dark text-success border-r border-gray-400 p-4 text-sm font-medium">
              {formatPrice(row.totalPaidAmount)}
            </td>
            <td className="p-4 text-center">
              <button
                onClick={() => setSelectedClinic(row)}
                disabled={row.totalPendingAmount === 0}
                className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
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

function PayoutDetailView({
  statusFilter,
  onStatusChange,
}: {
  statusFilter: string;
  onStatusChange: (status: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { data, isLoading, isError, error, refetch } = usePayouts({
    status: statusFilter,
    pageNumber: page,
    pageSize,
  });

  const columns = [
    { key: "clinic", label: "Phòng khám / Người nhận", width: "w-[20%]" },
    { key: "appointment", label: "Lịch hẹn", width: "w-[20%]" },
    { key: "amount", label: "Số tiền", width: "w-[15%]" },
    // { key: "bank", label: "Ngân hàng nhận", width: "w-[20%]" },
    {
      key: "status",
      label: "Trạng thái",
      width: "w-[15%]",
      align: "center" as const,
    },
    {
      key: "actions",
      label: "Hồ sơ",
      width: "w-[10%]",
      align: "center" as const,
    },
  ];

  const rows = data?.data?.items ?? [];
  const total = data?.data?.totalCount ?? 0;

  const statusLabel: Record<string, string> = {
    ReadyToPay: "Sẵn sàng TT",
    Hold: "Tạm giữ",
    Paid: "Đã TT",
    Cancelled: "Đã hủy",
  };

  const exportToPDF = () => {
    const now = new Date().toLocaleString("vi-VN");
    const statusText = statusLabel[statusFilter] ?? statusFilter;

    const tableRows = rows
      .map(
        (row) => `
        <tr>
          <td>
            <strong>${row.clinicName ?? "N/A"}</strong><br/>
            <small>BS: ${row.doctorName ?? "N/A"}</small><br/>
            <small>BN: ${row.patientName ?? "N/A"}</small>
          </td>
          <td>
            ${row.appointmentDate ? new Date(row.appointmentDate).toLocaleDateString("vi-VN") : "N/A"}<br/>
            <small>${row.appointmentTime?.slice(0, 5) ?? ""}</small>
          </td>
          <td class="amount">${row.amount?.toLocaleString("vi-VN") ?? 0} đ</td>
          <td class="center">
            <span class="badge badge-${row.status?.toLowerCase()}">${statusLabel[row.status] ?? row.status}</span>
          </td>
          <td class="center">
            ${row.transferImageUrl ? `<a href="${row.transferImageUrl}" target="_blank">📎 UNC</a>` : ""}
            ${row.reportFileUrl ? `<a href="${row.reportFileUrl}" target="_blank">📄 Báo cáo</a>` : ""}
          </td>
        </tr>`,
      )
      .join("");

    const totalAmount = rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Chi tiết Khoản thu - MediMate</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a1a2e; background: #fff; padding: 32px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 3px solid #6c63ff; padding-bottom: 16px; }
    .logo { font-size: 24px; font-weight: 900; color: #6c63ff; letter-spacing: -1px; }
    .logo span { color: #ff6584; }
    .meta { text-align: right; font-size: 11px; color: #666; }
    .meta strong { display: block; font-size: 15px; color: #1a1a2e; margin-bottom: 4px; }
    h2 { font-size: 18px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 20px; }
    .summary-bar { display: flex; gap: 24px; margin-bottom: 24px; padding: 14px 20px; background: #f5f3ff; border-radius: 10px; border-left: 4px solid #6c63ff; }
    .summary-item { display: flex; flex-direction: column; }
    .summary-item label { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .summary-item value { font-size: 15px; font-weight: 700; color: #1a1a2e; }
    .summary-item value.orange { color: #f97316; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #6c63ff; color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; padding: 10px 12px; text-align: left; }
    th.center { text-align: center; }
    td { padding: 10px 12px; border-bottom: 1px solid #e8e8f4; vertical-align: top; font-size: 11.5px; }
    tr:hover td { background: #faf8ff; }
    td.amount { font-weight: 700; color: #f97316; }
    td.center { text-align: center; }
    td small { color: #888; display: block; margin-top: 2px; }
    td a { color: #6c63ff; text-decoration: none; display: block; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .badge-readytopay { background: #fef3c7; color: #92400e; }
    .badge-hold { background: #dbeafe; color: #1e40af; }
    .badge-paid { background: #dcfce7; color: #166534; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e0e0f0; display: flex; justify-content: space-between; font-size: 10px; color: #999; }
    @media print {
      body { padding: 16px; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Medi<span>Mate</span></div>
    <div class="meta">
      <strong>Báo cáo Chi tiết Khoản thu</strong>
      Xuất lúc: ${now}
    </div>
  </div>

  <h2>Chi tiết Khoản thu Phòng khám</h2>
  <p class="subtitle">Trạng thái: <strong>${statusText}</strong> &nbsp;•&nbsp; Trang ${page}/${Math.ceil(total / pageSize) || 1} &nbsp;•&nbsp; ${rows.length} bản ghi</p>

  <div class="summary-bar">
    <div class="summary-item">
      <label>Tổng số giao dịch</label>
      <value>${rows.length}</value>
    </div>
    <div class="summary-item">
      <label>Tổng số tiền</label>
      <value class="orange">${totalAmount.toLocaleString("vi-VN")} đ</value>
    </div>
    <div class="summary-item">
      <label>Trạng thái lọc</label>
      <value>${statusText}</value>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:22%">Phòng khám / Người nhận</th>
        <th style="width:14%">Lịch hẹn</th>
        <th style="width:13%">Số tiền</th>
        <th class="center" style="width:14%">Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || "<tr><td colspan='6' style='text-align:center;color:#aaa;padding:24px'>Không có dữ liệu</td></tr>"}
    </tbody>
  </table>

  <div class="footer">
    <span>MediMate &copy; ${new Date().getFullYear()} &mdash; Tài liệu nội bộ, không phải để phát hành bên ngoài.</span>
    <span>Xuất bởi Hệ thống Quản lý MediMate</span>
  </div>

  <script>
    window.onload = () => { window.print(); };
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      alert("Vui lòng cho phép mở popup để xuất PDF.");
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

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
    <div className="flex flex-col">
      {/* Toolbar: Export PDF */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {total > 0 && (
            <>
              Hiển thị{" "}
              <strong className="text-gray-700 dark:text-gray-200">
                {rows.length}
              </strong>{" "}
              / {total} kết quả
            </>
          )}
        </p>
        <button
          onClick={exportToPDF}
          disabled={isLoading || rows.length === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-700/40 dark:bg-violet-900/20 dark:text-violet-300 dark:hover:bg-violet-900/40"
        >
          <FiDownload className="h-4 w-4" />
          Xuất PDF
        </button>
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
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {row.appointmentDate
                    ? new Date(row.appointmentDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
                <span className="text-xs text-gray-500">
                  {row.appointmentTime?.slice(0, 5) || "N/A"}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 font-bold text-orange-500">
              {row.amount?.toLocaleString()} đ
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {row.payerBankName || "N/A"}
                </span>
                <span className="text-xs text-gray-500">
                  {row.payerBankAccountNumber}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
              {getStatusBadge(row.status)}
            </td>
            <td className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                {row.transferImageUrl && (
                  <a
                    href={row.transferImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-400 px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
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
  const { data: clinicDetail, isLoading: isLoadingClinic } = useClinic(summary.clinicId);

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
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="w-full max-w-md scale-100 rounded-2xl border bg-white p-6 shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Thanh toán & Đối soát
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Chuyển trạng thái tất cả các khoản{" "}
          <strong className="text-warning">ReadyToPay</strong> của{" "}
          <strong>{summary.clinicName}</strong> sang{" "}
          <strong className="text-success">Paid</strong>.
          <br />
          Số tiền cần thanh toán:{" "}
          <strong className="text-lg text-orange-500">
            {summary.totalPendingAmount.toLocaleString()} VND
          </strong>
        </p>

        {/* Thông tin ngân hàng */}
        <div className="mb-6 rounded-xl bg-gray-50 p-4 border border-gray-200 dark:bg-white/5 dark:border-white/10">
          <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Thông tin nhận tiền (Phòng khám)
          </h3>
          {isLoadingClinic ? (
            <p className="text-sm text-gray-500">Đang tải thông tin...</p>
          ) : clinicDetail ? (
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-medium">Ngân hàng:</span> {clinicDetail.bankName || "Chưa cập nhật"}</p>
              <p><span className="font-medium">Số TK:</span> {clinicDetail.bankAccountNumber || "Chưa cập nhật"}</p>
              <p><span className="font-medium">Chủ TK:</span> {clinicDetail.bankAccountHolder || "Chưa cập nhật"}</p>
            </div>
          ) : (
            <p className="text-sm text-red-500">Không tải được thông tin ngân hàng.</p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ghi chú (Tùy chọn)
            </label>
            <textarea
              placeholder="Nhập ghi chú thanh toán..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
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
              className="file:bg-primary/10 file:text-primary hover:file:bg-primary/20 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2.5 file:text-sm file:font-semibold dark:text-gray-400"
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
              className="bg-primary hover:bg-primary/90 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50"
            >
              {processMutation.isPending
                ? "Đang xử lý..."
                : "Xác nhận Thanh toán"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
