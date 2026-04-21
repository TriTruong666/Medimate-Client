import { useState, useMemo } from "react";
import {
  FiEye,
  FiAward,
  FiStar,
  FiMail,
  FiPhone,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiFileText,
} from "react-icons/fi";
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
  useCreateDoctorContract,
  useUpdateDoctorContract,
  useDeleteDoctorContract,
} from "@/hooks/data/useDoctorContractHooks";
import { formatDate } from "@/common/format";
import type {
  DoctorContract,
  UpdateDoctorContractBody,
} from "@/types/DoctorContract";
import { AnimatePresence, motion } from "framer-motion";

const columns: DataTableColumn[] = [
  { key: "doctor", label: "Thông tin Bác sĩ", width: "w-[25%]" },
  { key: "contract", label: "Thời hạn Hợp đồng", width: "w-[25%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "note", label: "Ghi chú", width: "w-[20%]" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

export default function DoctorContractPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<DoctorContract | null>(
    null,
  );

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

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleAddNew = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  return (
    <div className="page-layout">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Quản lý Hợp đồng Bác sĩ
          </h1>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
        >
          <FiPlus strokeWidth={3} /> Thêm Hợp đồng
        </button>
      </div>

      <div className="my-8">
        <DataTableShell
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          isEmpty={!contractsData || contractsData.length === 0}
          onRetry={() => void refetch()}
        >
          {contractsData?.map((row) => (
            <tr
              key={row.contractId}
              className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/5"
            >
              <td className="dark:border-border-dark border-r border-gray-400 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl font-bold">
                    <FiFileText />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      Mã: {row.contractId.slice(0, 8)}...
                    </span>
                    <span className="text-[11px] tracking-wider text-gray-500 uppercase">
                      MediMate Partner
                    </span>
                  </div>
                </div>
              </td>
              <td className="dark:border-border-dark border-r border-gray-400 p-4 text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600 dark:text-gray-300">
                    Bắt đầu: <b>{formatDate(row.startDate || "")}</b>
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Kết thúc: <b>{formatDate(row.endDate || "")}</b>
                  </span>
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
              <td className="dark:border-border-dark border-r p-4 text-sm text-gray-500 italic">
                {row.note || "Không có ghi chú"}
              </td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="Xem File">
                    <IconAction
                      icon={<FiEye />}
                      onClick={() => window.open(row.fileUrl, "_blank")}
                      className="text-blue-500 hover:bg-blue-50"
                    />
                  </Tooltip>
                  <Tooltip content="Chỉnh sửa">
                    <IconAction
                      icon={<FiEdit3 />}
                      onClick={() => handleEdit(row)}
                      className="text-amber-500 hover:bg-amber-50"
                    />
                  </Tooltip>
                  <Tooltip content="Xóa">
                    <IconAction
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(row.contractId)}
                      className="text-red-500 hover:bg-red-50"
                    />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </DataTableShell>
      </div>

      <ContractFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingContract}
      />
    </div>
  );
}

// --- MODAL FORM COMPONENT ---
function ContractFormModal({
  isOpen,
  onClose,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: DoctorContract | null;
}) {
  const createMutation = useCreateDoctorContract();
  const updateMutation = useUpdateDoctorContract();

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    status: "Active",
    note: "",
  });
  const [file, setFile] = useState<File | null>(null);

  // Load data khi edit
  useMemo(() => {
    if (initialData) {
      setForm({
        startDate: initialData.startDate?.split("T")[0] || "",
        endDate: initialData.endDate?.split("T")[0] || "",
        status: initialData.status,
        note: initialData.note || "",
      });
    } else {
      setForm({ startDate: "", endDate: "", status: "Active", note: "" });
      setFile(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      // Update
      await updateMutation.mutateAsync({
        id: initialData.contractId,
        data: { ...form, file } as UpdateDoctorContractBody,
      });
    } else {
      // Create
      if (!file) return alert("Vui lòng chọn file hợp đồng");
      await createMutation.mutateAsync({ ...form, file });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border border-gray-400 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-neutral-900"
      >
        <h2 className="mb-4 text-xl font-bold">
          {initialData ? "Cập nhật Hợp đồng" : "Thêm Hợp đồng mới"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="input-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-primary"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">
              Trạng thái
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-primary"
            >
              <option value="Active">Đang hiệu lực</option>
              <option value="Expired">Hết hạn</option>
              <option value="Terminated">Đã chấm dứt</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">
              File hợp đồng (PDF/Ảnh)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-xl border p-2 text-sm"
              required={!initialData}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500">
              Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input-primary h-20 resize-none"
              placeholder="Nhập ghi chú nếu có..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-primary rounded-xl px-6 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Đang lưu..."
                : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
