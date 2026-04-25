import { useState, useMemo } from "react";
import { FiPlus, FiEdit3, FiTrash2, FiEye } from "react-icons/fi";
import { TbBuildingHospital } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell, type DataTableColumn } from "@/components/custom-ui/DataTableShell";
import { useClinics, useDeleteClinic } from "@/hooks/data/useClinicHooks";
import type { ClinicDto } from "@/apis/clinic.service";
import { ClinicModal } from "@/components/modals/ClinicModal";
import { PATHS } from "@/config/paths";

const columns: DataTableColumn[] = [
  { key: "clinic", label: "Phòng khám", width: "w-[30%]" },
  { key: "contact", label: "Liên hệ & Ngân hàng", width: "w-[30%]" },
  { key: "stats", label: "Thống kê", width: "w-[15%]", align: "center" },
  { key: "status", label: "Trạng thái", width: "w-[10%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

const breadcrumbItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Phòng khám" },
];

export default function ClinicPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<ClinicDto | null>(null);

  const { data, isLoading, isError, error, refetch } = useClinics();
  const deleteMutation = useDeleteClinic();

  const rows = useMemo(() => data ?? [], [data]);

  const handleEdit = (clinic: ClinicDto) => {
    setEditingClinic(clinic);
    setIsModalOpen(true);
  };

  const handleDelete = async (clinicId: string) => {
    if (!confirm("Bạn có chắc muốn xóa phòng khám này?")) return;
    try { await deleteMutation.mutateAsync(clinicId); } catch {}
  };

  const handleAddNew = () => {
    setEditingClinic(null);
    setIsModalOpen(true);
  };

  const handleViewDetail = (clinicId: string) => {
    navigate(PATHS.DASHBOARD.CLINIC_DETAIL.replace(":id", clinicId));
  };

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quản lý Phòng khám
          </h1>
        </div>
        <button onClick={handleAddNew} className="btn-primary">
          <FiPlus />
          Thêm phòng khám
        </button>
      </div>

      {/* Table */}
      <div className="my-8">
        <DataTableShell
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          isEmpty={!isLoading && !isError && rows.length === 0}
          onRetry={() => void refetch()}
          emptyTitle="Chưa có phòng khám"
          emptyMessage="Chưa có phòng khám nào trong hệ thống. Hãy tạo phòng khám đầu tiên."
        >
          {rows.map((row: ClinicDto) => (
            <tr key={row.clinicId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
              {/* Phòng khám */}
              <td className="dark:border-border-dark border-r border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  {row.logoUrl ? (
                    <img src={row.logoUrl} className="h-10 w-10 rounded-xl object-cover" alt={row.name} />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl text-lg">
                      <TbBuildingHospital />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{row.name}</span>
                    <span className="line-clamp-1 text-xs text-gray-400">{row.address}</span>
                  </div>
                </div>
              </td>

              {/* Liên hệ & Ngân hàng */}
              <td className="dark:border-border-dark border-r border-gray-200 p-4">
                <div className="flex flex-col gap-1 text-[13px]">
                  <span className="text-gray-700 dark:text-gray-200">{row.email}</span>
                  <span className="text-xs text-gray-400">
                    {row.bankName} · {row.bankAccountNumber}
                  </span>
                  <span className="text-xs text-gray-400">{row.bankAccountHolder}</span>
                </div>
              </td>

              {/* Thống kê */}
              <td className="dark:border-border-dark border-r border-gray-200 p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{row.doctorCount}</span>
                  <span className="text-xs text-gray-400">Bác sĩ</span>
                </div>
              </td>

              {/* Trạng thái */}
              <td className="dark:border-border-dark border-r border-gray-200 p-4 text-center">
                {row.isActive ? (
                  <Badge type="success" value="Đang HĐ" />
                ) : (
                  <Badge type="error" value="Tạm dừng" />
                )}
              </td>

              {/* Hành động */}
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Tooltip content="Xem chi tiết">
                    <IconAction icon={<FiEye />} onClick={() => handleViewDetail(row.clinicId)} />
                  </Tooltip>
                  <Tooltip content="Chỉnh sửa">
                    <IconAction icon={<FiEdit3 />} className="text-amber-500" onClick={() => handleEdit(row)} />
                  </Tooltip>
                  <Tooltip content="Xóa">
                    <IconAction icon={<FiTrash2 />} danger onClick={() => handleDelete(row.clinicId)} />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </DataTableShell>
      </div>

      <ClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingClinic}
      />
    </div>
  );
}
