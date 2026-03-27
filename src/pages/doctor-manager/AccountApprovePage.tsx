import { FiEye } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { PATHS } from "@/config/paths";
import { useLocation } from "react-router-dom";
import {
  useManagementDoctors,
  useReviewDoctorAccount,
} from "@/hooks/data/useManagementHooks";
import { useState } from "react";
import type { DoctorAccount, DoctorAccountStatus } from "@/apis/management.service";
import { AccountDetailReviewModal } from "@/components/modals/AccountDetailReviewModal";

type TableColumn = {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

const columns: TableColumn[] = [
  { key: "doctor", label: "Bác sĩ", width: "w-[30%]" },
  { key: "specialty", label: "Chuyên khoa & Đơn vị", width: "w-[30%]" },
  { key: "status", label: "Trạng thái", width: "w-[20%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[20%]", align: "center" },
];

export default function AccountApprovePage() {
  const { pathname } = useLocation();

  const activeStatus: DoctorAccountStatus =
    pathname === PATHS.DASHBOARD.APPROVE_ACCOUNT_REJECTED
      ? "Rejected"
      : pathname === PATHS.DASHBOARD.APPROVE_ACCOUNT_VERIFIED
        ? "Verified"
        : "Pending";

  const pageTitle =
    pathname === PATHS.DASHBOARD.APPROVE_ACCOUNT_REJECTED
      ? "Danh sách Tài khoản Bị từ chối"
      : pathname === PATHS.DASHBOARD.APPROVE_ACCOUNT_VERIFIED
        ? "Danh sách Tài khoản Đã duyệt"
        : "Danh sách Tài khoản Chờ duyệt";

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Quản lý Bác sĩ", path: "/dashboard/approve-account" },
    { label: "Duyệt Tài khoản" },
  ];

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="my-8">
        <AccountTable key={activeStatus} activeStatus={activeStatus} />
      </div>
    </div>
  );
}

function AccountTable({ activeStatus }: { activeStatus: DoctorAccountStatus }) {
  const [selectedRow, setSelectedRow] = useState<DoctorAccount | null>(null);
  const reviewAccountMutation = useReviewDoctorAccount();

  const { data = [], isLoading, isError, error, refetch } = useManagementDoctors({
    status: activeStatus,
  });

  const safeRows = data || [];

  const handleApprove = async (id: string) => {
    try {
      await reviewAccountMutation.mutateAsync({ id, status: "verified" });
      setSelectedRow(null);
    } catch {}
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await reviewAccountMutation.mutateAsync({ id, status: "rejected", reason });
      setSelectedRow(null);
    } catch {}
  };

  return (
    <>
      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => void refetch()}
        isEmpty={!isLoading && !isError && safeRows.length === 0}
        loadingMessage="Đang tải danh sách tài khoản..."
        emptyTitle="Chưa có dữ liệu"
        emptyMessage="Không tìm thấy tài khoản nào trong trạng thái này."
        tbodyClassName="dark:divide-border-dark divide-y divide-gray-100 bg-white/50 dark:bg-transparent"
        pagination={{
            page: 1,
            pageSize: Math.max(safeRows.length, 5),
            total: safeRows.length,
            onPageChange: () => {},
            onPageSizeChange: () => {},
        }}
      >
        {safeRows.map((row: DoctorAccount) => (
          <tr
            key={row.doctorId}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {row.fullName || "Tài khoản Bác sĩ"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Kinh nghiệm: <span className="font-medium">{row.yearsOfExperience}</span> năm
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {row.specialty || "Chưa xác định"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] mt-1" title={row.currentHospitalName}>
                  {row.currentHospitalName || "Không rõ đơn vị"}
                </span>
              </div>
            </td>
            <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
              {row.status === "Pending" ? (
                <Badge type="warning" value="Chờ duyệt" />
              ) : row.status === "Verified" ? (
                <Badge type="success" value="Đã duyệt" />
              ) : (
                <Badge type="error" value="Bị từ chối" />
              )}
            </td>
            <td className="p-4 text-center">
              <Tooltip content="Xem chi tiết tài khoản">
                <IconAction
                  icon={<FiEye />}
                  onClick={() => setSelectedRow(row)}
                  className="text-primary hover:text-primary dark:text-primary dark:hover:text-primary-light"
                />
              </Tooltip>
            </td>
          </tr>
        ))}
      </DataTableShell>

      <AccountDetailReviewModal
        key={selectedRow?.doctorId ?? "empty"}
        account={selectedRow}
        onClose={() => setSelectedRow(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        isSubmitting={reviewAccountMutation.isPending}
      />
    </>
  );
}
