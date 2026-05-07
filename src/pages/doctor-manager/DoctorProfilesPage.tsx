import { FiEye } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { useClientPagination } from "@/hooks/useClientPagination";
import { useManagementDoctors } from "@/hooks/data/useManagementHooks";
import { useState } from "react";
import type { DoctorAccount } from "@/apis/management.service";
import { DoctorProfileDetailModal } from "@/components/modals/DoctorProfileDetailModal";

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

export default function DoctorProfilesPage() {
  const [selectedRow, setSelectedRow] = useState<DoctorAccount | null>(null);

  // Fetch doctors without status filter to show all
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useManagementDoctors({});

  const safeRows = data || [];

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Quản lý Bác sĩ", path: "/dashboard/doctor-profiles" },
    { label: "Danh sách Bác sĩ" },
  ];

  const {
    page,
    pageSize,
    total,
    pagedData,
    handlePageChange,
    handlePageSizeChange,
  } = useClientPagination(safeRows, { initialPageSize: 5 });

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Hồ sơ Bác sĩ
          </h1>
        </div>
      </div>

      <div className="my-8">
        <DataTableShell
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          onRetry={() => void refetch()}
          isEmpty={!isLoading && !isError && safeRows.length === 0}
          loadingMessage="Đang tải danh sách bác sĩ..."
          emptyTitle="Chưa có dữ liệu"
          emptyMessage="Không tìm thấy bác sĩ nào trong hệ thống."
          tbodyClassName="dark:divide-border-dark divide-y divide-gray-400 bg-white/50 dark:bg-transparent"
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        >
          {pagedData.map((row: DoctorAccount) => (
            <tr
              key={row.doctorId}
              className="transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {/* 1. Thông tin bác sĩ */}
              <td className="border-r border-gray-400 p-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-medium shadow-sm dark:bg-white/10 dark:text-white">
                    {(row.fullName || "B").charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {row.fullName || "Tài khoản Bác sĩ"}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      Kinh nghiệm:{" "}
                      <span className="font-semibold text-primary">
                        {row.yearsOfExperience}
                      </span>{" "}
                      năm
                    </span>
                  </div>
                </div>
              </td>

              {/* 2. Chuyên khoa & Đơn vị */}
              <td className="border-r border-gray-400 p-4 dark:border-white/10">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {row.specialty || "Chưa xác định"}
                  </span>
                  <span
                    className="mt-1.5 max-w-[250px] truncate text-[11px] font-medium text-gray-600 dark:text-gray-400"
                    title={row.currentHospitalName}
                  >
                    {row.currentHospitalName || "Bệnh viện chưa cập nhật"}
                  </span>
                </div>
              </td>

              {/* 3. Trạng thái */}
              <td className="border-r border-gray-400 p-4 text-center dark:border-white/10">
                {row.status === "Pending" ? (
                  <Badge type="warning" value="Chờ duyệt" />
                ) : row.status === "Verified" ? (
                  <Badge type="success" value="Đã duyệt" />
                ) : row.status === "Active" ? (
                  <Badge type="success" value="Đang HĐ" />
                ) : row.status === "Rejected" ? (
                  <Badge type="error" value="Bị từ chối" />
                ) : (
                  <Badge type="info" value={row.status || "Inactive"} />
                )}
              </td>

              {/* 4. Thao tác */}
              <td className="p-4 text-center">
                <Tooltip content="Xem hồ sơ chi tiết">
                  <IconAction
                    icon={<FiEye />}
                    onClick={() => setSelectedRow(row)}
                    className="text-primary hover:bg-primary/10 dark:text-primary-light"
                  />
                </Tooltip>
              </td>
            </tr>
          ))}
        </DataTableShell>

        <DoctorProfileDetailModal
          key={selectedRow?.doctorId ?? "profile-detail-empty"}
          account={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      </div>
    </div>
  );
}
