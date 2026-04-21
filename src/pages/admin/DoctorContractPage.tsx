import { useState, useMemo } from "react";
import { FiEye, FiPlus, FiEdit3, FiTrash2, FiFileText } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import {
  DataTableShell,
  type DataTableColumn,
} from "@/components/custom-ui/DataTableShell";
import {
  useDoctorContracts,
  useDeleteDoctorContract,
} from "@/hooks/data/useDoctorContractHooks";
import { formatDate } from "@/common/format";
import type { DoctorContract } from "@/types/DoctorContract";
import {
  DeleteDoctorContractModal,
  DoctorContractModal,
} from "@/components/modals";

const columns: DataTableColumn[] = [
  { key: "contract", label: "Thông tin Hợp đồng", width: "w-[30%]" },
  { key: "duration", label: "Thời hạn", width: "w-[25%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "note", label: "Ghi chú", width: "w-[15%]" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

export default function DoctorContractPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<DoctorContract | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: contractsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctorContracts();
  const deleteMutation = useDeleteDoctorContract();

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Hợp đồng Bác sĩ" },
  ];

  const handleEdit = (contract: DoctorContract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    } catch {}
  };

  const handleAddNew = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            Quản lý Hợp đồng
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAddNew} className="btn-primary">
            <FiPlus />
            Thêm hợp đồng
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="my-8">
        <DataTableShell
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          isEmpty={!contractsData || contractsData.length === 0}
          onRetry={() => void refetch()}
          emptyMessage="Không tìm thấy dữ liệu hợp đồng nào."
        >
          {contractsData?.map((row) => (
            <tr
              key={row.contractId}
              className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
            >
              <td className="dark:border-border-dark border-r border-gray-400 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                    <FiFileText />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      HD-{row.contractId.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      Partner Agreement
                    </span>
                  </div>
                </div>
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4">
                <div className="flex flex-col gap-1 text-[13px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Ngày bắt đầu:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(row.startDate || "")}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">
                      Ngày kết thúc:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(row.endDate || "")}
                    </span>
                  </div>
                </div>
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4 text-center">
                <Badge
                  type={
                    row.status === "Active"
                      ? "success"
                      : row.status === "Expired"
                        ? "warning"
                        : "error"
                  }
                  value={
                    row.status === "Active"
                      ? "Đang hiệu lực"
                      : row.status === "Expired"
                        ? "Hết hạn"
                        : "Đã chấm dứt"
                  }
                />
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4 text-xs text-gray-500 italic dark:text-gray-400">
                {row.note || "Không có ghi chú"}
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Tooltip content="Xem File">
                    <IconAction
                      icon={<FiEye />}
                      onClick={() => window.open(row.fileUrl, "_blank")}
                    />
                  </Tooltip>
                  <Tooltip content="Chỉnh sửa">
                    <IconAction
                      icon={<FiEdit3 />}
                      className="text-amber-500"
                      onClick={() => handleEdit(row)}
                    />
                  </Tooltip>
                  <Tooltip content="Xóa">
                    <IconAction
                      icon={<FiTrash2 />}
                      danger
                      onClick={() => handleDeleteTrigger(row.contractId)}
                    />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </DataTableShell>
      </div>

      <DoctorContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingContract}
      />

      <DeleteDoctorContractModal
        contractId={deletingId || ""}
        isOpen={!!deletingId}
        isPending={deleteMutation.isPending}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
