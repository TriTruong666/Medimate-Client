import { FiEye } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { formatRelativeTime } from "@/common/format";
import { PATHS } from "@/config/paths";
import { useLocation } from "react-router-dom";
import { useDoctorDocuments } from "@/hooks/data/useDoctorDocumentHooks";
import { useMemo, useState } from "react";
import { doctorDocumentTypeLabelMap } from "@/types/DoctorDocument";
import type {
  DoctorDocument,
  DoctorDocumentStatus,
  DoctorDocumentType,
} from "@/types/DoctorDocument";

type CertificateRow = {
  id: string;
  doctorName: string;
  specialty: string;
  certName: string;
  issuePlace: string;
  issueDate: string;
  submitDate: string;
  status: DoctorDocumentStatus;
};

function normalizeStatus(status: string): DoctorDocumentStatus {
  const normalized = status.trim().toLowerCase().replace(/[\s-]/g, "_");

  if (["approved", "accept", "accepted", "verified"].includes(normalized)) {
    return "Approved";
  }

  if (["rejected", "reject", "denied"].includes(normalized)) {
    return "Rejected";
  }

  return "Pending";
}

function normalizeDocumentType(type: string): DoctorDocumentType {
  const normalized = type.trim().toUpperCase();

  if (
    normalized === "PRACTICE_LICENSE" ||
    normalized === "SPECIALIST_CERTIFICATE" ||
    normalized === "CME"
  ) {
    return normalized;
  }

  return "OTHER";
}

function toCertificateRow(item: DoctorDocument): CertificateRow {
  const documentType = normalizeDocumentType(item.type);

  return {
    id: item.documentId,
    doctorName: `BS. ${item.doctorId.slice(0, 8).toUpperCase()}`,
    specialty: "Chưa cập nhật",
    certName: doctorDocumentTypeLabelMap[documentType],
    issuePlace: item.reviewBy || "Chưa có người duyệt",
    issueDate: item.reviewAt ? formatRelativeTime(item.reviewAt) : "Chưa duyệt",
    submitDate: item.createdAt,
    status: normalizeStatus(item.status),
  };
}

type ColumnKey = "doctor" | "certificate" | "status" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

const columns: TableColumn[] = [
  { key: "doctor", label: "Thông tin Bác sĩ", width: "w-[25%]" },
  { key: "certificate", label: "Thông tin Chứng chỉ", width: "w-[45%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

export default function CertificateApprovePage() {
  const { pathname } = useLocation();

  const activeStatus: DoctorDocumentStatus =
    pathname === PATHS.DASHBOARD.APPROVE_CERTIFICATE_REJECTED
      ? "Rejected"
      : pathname === PATHS.DASHBOARD.APPROVE_CERTIFICATE_APPROVED
        ? "Approved"
        : "Pending";

  const pageTitle =
    pathname === PATHS.DASHBOARD.APPROVE_CERTIFICATE_REJECTED
      ? "Hồ sơ Chứng chỉ Bị từ chối"
      : pathname === PATHS.DASHBOARD.APPROVE_CERTIFICATE_APPROVED
        ? "Hồ sơ Chứng chỉ Đã duyệt"
        : "Hồ sơ Chứng chỉ Chưa duyệt";

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Quản lý Y tế", path: "/dashboard/approve-certificate" },
    { label: "Duyệt Chứng chỉ" },
  ];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Content - Data Table */}
      <div className="my-8">
        <CertificateTable key={activeStatus} activeStatus={activeStatus} />
      </div>
    </div>
  );
}

function CertificateTable({
  activeStatus,
}: {
  activeStatus: DoctorDocumentStatus;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctorDocuments({
    pageNumber: page,
    pageSize,
    status: activeStatus,
  });

  const rows = useMemo(() => {
    return (data?.items ?? []).map(toCertificateRow);
  }, [data?.items]);

  const total = data?.totalCount ?? 0;

  return (
    <>
      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && rows.length === 0}
        loadingMessage="Đang tải danh sách chứng chỉ..."
        emptyTitle="Chưa có dữ liệu"
        emptyMessage="Không tìm thấy chứng chỉ nào trong trạng thái này."
        tbodyClassName="dark:divide-border-dark divide-y divide-gray-100 bg-white/50 dark:bg-transparent"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          },
        }}
      >
        {rows.map((row) => (
          <tr
            key={row.id}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
                {/* 1. Thông tin bác sĩ */}
                <td className="dark:border-border-dark border-r border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="from-primary/20 to-primary/5 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold shadow-inner">
                      {row.doctorName.charAt(4)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {row.doctorName}
                      </span>
                      <span className="text-primary truncate text-[12px] font-medium">
                        {row.specialty}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Thông tin chứng chỉ */}
                <td className="dark:border-border-dark border-r border-gray-100 p-4">
                  <div className="flex flex-col">
                    <span
                      className="mb-1 line-clamp-1 text-sm font-semibold text-gray-800 dark:text-gray-200"
                      title={row.certName}
                    >
                      {row.certName}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Nơi cấp:
                        </span>{" "}
                        {row.issuePlace}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Cấp ngày:
                        </span>{" "}
                        {row.issueDate}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-400 italic dark:text-gray-500">
                      Đã nộp: {formatRelativeTime(row.submitDate)}
                    </div>
                  </div>
                </td>

                {/* 3. Trạng thái */}
                <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
                  {row.status === "Pending" ? (
                    <Badge type="warning" value="Chờ duyệt" />
                  ) : row.status === "Approved" ? (
                    <Badge type="success" value="Đã duyệt" />
                  ) : (
                    <Badge type="error" value="Bị từ chối" />
                  )}
                </td>

                {/* 4. Thao tác */}
                <td className="p-4 text-center">
                  <Tooltip content="Xem file gốc chứng chỉ">
                    <IconAction
                      icon={<FiEye />}
                      className="text-primary hover:text-primary dark:text-primary dark:hover:text-primary-light"
                    />
                  </Tooltip>
                </td>
          </tr>
        ))}
      </DataTableShell>
    </>
  );
}
