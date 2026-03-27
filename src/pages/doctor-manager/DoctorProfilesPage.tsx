import { FiEye } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
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
  const { data = [], isLoading, isError, error, refetch } = useManagementDoctors({});

  const safeRows = data || [];

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Quản lý Bác sĩ", path: "/dashboard/doctor-profiles" },
    { label: "Danh sách Bác sĩ" },
  ];

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Hồ sơ Bác sĩ
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Xem chi tiết thông tin và chứng chỉ của tất cả bác sĩ trên hệ thống
          </p>
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
                  <Badge type="success" value="Đã xét duyệt" />
                ) : row.status === "Active" ? (
                  <Badge type="success" value="Đang HĐ" />
                ) : row.status === "Rejected" ? (
                  <Badge type="error" value="Bị từ chối" />
                ) : (
                  <Badge type="info" value={row.status || "Inactive"} />
                )}
              </td>
              <td className="p-4 text-center">
                <Tooltip content="Xem hồ sơ">
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

        <DoctorProfileDetailModal
          key={selectedRow?.doctorId ?? "profile-detail-empty"}
          account={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      </div>
    </div>
  );
}
