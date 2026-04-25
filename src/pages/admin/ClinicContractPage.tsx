import { useState, useMemo } from "react";
import { FiPlus, FiEdit3, FiFileText, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell, type DataTableColumn } from "@/components/custom-ui/DataTableShell";
import { useClinics, useClinicContracts } from "@/hooks/data/useClinicHooks";
import type { ClinicContractDto } from "@/apis/clinic.service";
import { ClinicContractModal } from "@/components/modals/ClinicContractModal";
import { formatDate } from "@/common/format";
import { PATHS } from "@/config/paths";

const columns: DataTableColumn[] = [
  { key: "contract", label: "Hợp đồng", width: "w-[25%]" },
  { key: "clinic", label: "Phòng khám", width: "w-[25%]" },
  { key: "duration", label: "Thời hạn", width: "w-[20%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

const breadcrumbItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Hợp đồng Phòng khám" },
];

// Inner component renders contracts for one clinic
function ClinicContractRows({
  clinicId,
  clinicName,
  onEdit,
}: {
  clinicId: string;
  clinicName: string;
  onEdit: (contract: ClinicContractDto, clinicId: string) => void;
}) {
  const { data, isLoading } = useClinicContracts(clinicId);
  const contracts = useMemo(() => data ?? [], [data]);

  if (isLoading) return null;
  return (
    <>
      {contracts.map((row: ClinicContractDto) => (
        <tr key={row.contractId} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
          <td className="dark:border-border-dark border-r border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl"><FiFileText /></div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">HĐ-{row.contractId.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400 italic">{row.note ?? "Không có ghi chú"}</p>
              </div>
            </div>
          </td>
          <td className="dark:border-border-dark border-r border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{clinicName}</span>
          </td>
          <td className="dark:border-border-dark border-r border-gray-200 p-4">
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span>Bắt đầu: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(row.startDate ?? "")}</span></span>
              <span>Kết thúc: <span className="font-semibold text-gray-800 dark:text-gray-200">{formatDate(row.endDate ?? "")}</span></span>
            </div>
          </td>
          <td className="dark:border-border-dark border-r border-gray-200 p-4 text-center">
            <Badge
              type={row.status === "Active" ? "success" : row.status === "Expired" ? "warning" : "error"}
              value={row.status === "Active" ? "Đang HĐ" : row.status === "Expired" ? "Hết hạn" : "Chấm dứt"}
            />
          </td>
          <td className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Tooltip content="Xem file"><IconAction icon={<FiEye />} onClick={() => window.open(row.fileUrl, "_blank")} /></Tooltip>
              <Tooltip content="Cập nhật trạng thái"><IconAction icon={<FiEdit3 />} className="text-amber-500" onClick={() => onEdit(row, clinicId)} /></Tooltip>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ClinicContractPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ClinicContractDto | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  const { data: clinicsRes, isLoading, isError, error, refetch } = useClinics();
  const clinics = useMemo(() => clinicsRes ?? [], [clinicsRes]);

  const handleEdit = (contract: ClinicContractDto, clinicId: string) => {
    setEditingContract(contract);
    setSelectedClinicId(clinicId);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  return (
    <div className="page-layout">
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Hợp đồng Phòng khám
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(PATHS.DASHBOARD.CLINIC)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10">
            Quản lý phòng khám
          </button>
          <button onClick={handleAddNew} className="btn-primary">
            <FiPlus /> Thêm hợp đồng
          </button>
        </div>
      </div>

      <div className="my-8">
        <DataTableShell
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          isEmpty={!isLoading && !isError && clinics.length === 0}
          onRetry={() => void refetch()}
          emptyTitle="Chưa có dữ liệu"
          emptyMessage="Chưa có phòng khám hoặc hợp đồng nào trong hệ thống."
        >
          {clinics.map((clinic: import("@/apis/clinic.service").ClinicDto) => (
            <ClinicContractRows
              key={clinic.clinicId}
              clinicId={clinic.clinicId}
              clinicName={clinic.name}
              onEdit={handleEdit}
            />
          ))}
        </DataTableShell>
      </div>

      <ClinicContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingContract}
        clinicId={selectedClinicId}
      />
    </div>
  );
}
