import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit3, FiTrash2, FiFileText } from "react-icons/fi";
import { TbBuildingHospital } from "react-icons/tb";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell, type DataTableColumn } from "@/components/custom-ui/DataTableShell";
import {
  useClinic,
  useClinicDoctors,
  useRemoveDoctorFromClinic,
  useClinicContracts,
} from "@/hooks/data/useClinicHooks";
import type { ClinicDoctorDto, ClinicContractDto } from "@/apis/clinic.service";
import { ClinicDoctorModal } from "@/components/modals/ClinicDoctorModal";
import { ClinicContractModal } from "@/components/modals/ClinicContractModal";
import { formatDate } from "@/common/format";
import { PATHS } from "@/config/paths";

const doctorColumns: DataTableColumn[] = [
  { key: "doctor", label: "Bác sĩ", width: "w-[35%]" },
  { key: "specialty", label: "Chuyên khoa & Giá", width: "w-[30%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[20%]", align: "center" },
];

const contractColumns: DataTableColumn[] = [
  { key: "contract", label: "Hợp đồng", width: "w-[35%]" },
  { key: "duration", label: "Thời hạn", width: "w-[30%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[20%]", align: "center" },
];

export default function ClinicDetailPage() {
  const { id: clinicId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<ClinicDoctorDto | null>(null);
  const [editingContract, setEditingContract] = useState<ClinicContractDto | null>(null);

  const { data: clinicRes, isLoading: clinicLoading } = useClinic(clinicId);
  const { data: doctorsRes, isLoading: doctorsLoading, isError: doctorsError, error: doctorsErr, refetch: refetchDoctors } = useClinicDoctors(clinicId);
  const { data: contractsRes, isLoading: contractsLoading, isError: contractsError, error: contractsErr, refetch: refetchContracts } = useClinicContracts(clinicId);
  const removeDoctorMutation = useRemoveDoctorFromClinic();

  const clinic = useMemo(() => clinicRes ?? null, [clinicRes]);
  const doctors = useMemo(() => doctorsRes ?? [], [doctorsRes]);
  const contracts = useMemo(() => contractsRes ?? [], [contractsRes]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Phòng khám", path: PATHS.DASHBOARD.CLINIC },
    { label: clinic?.name ?? "Chi tiết" },
  ];

  const handleRemoveDoctor = async (clinicDoctorId: string) => {
    if (!confirm("Bạn có chắc muốn gỡ bác sĩ này?")) return;
    try { await removeDoctorMutation.mutateAsync(clinicDoctorId); } catch {}
  };

  if (clinicLoading) return <div className="page-layout flex items-center justify-center"><p className="text-gray-400">Đang tải...</p></div>;

  return (
    <div className="page-layout space-y-8">
      {/* Header */}
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-2 flex items-center gap-4">
          <button onClick={() => navigate(PATHS.DASHBOARD.CLINIC)} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/10">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            {clinic?.logoUrl
              ? <img src={clinic.logoUrl} className="h-12 w-12 rounded-xl object-cover" />
              : <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl text-2xl"><TbBuildingHospital /></div>
            }
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{clinic?.name}</h1>
              <p className="text-sm text-gray-400">{clinic?.address}</p>
            </div>
          </div>
          {clinic?.isActive ? <Badge type="success" value="Đang hoạt động" /> : <Badge type="error" value="Tạm dừng" />}
        </div>
      </div>

      {/* Info */}
      {clinic && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Email", value: clinic.email },
            { label: "Ngân hàng", value: clinic.bankName },
            { label: "Số tài khoản", value: clinic.bankAccountNumber },
            { label: "Chủ tài khoản", value: clinic.bankAccountHolder },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Doctors */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bác sĩ thuộc phòng khám</h2>
          <button onClick={() => { setEditingDoctor(null); setIsDoctorModalOpen(true); }} className="btn-primary">
            <FiPlus /> Thêm bác sĩ
          </button>
        </div>
        <DataTableShell columns={doctorColumns} isLoading={doctorsLoading} isError={doctorsError} errorMessage={doctorsErr?.message}
          isEmpty={!doctorsLoading && !doctorsError && doctors.length === 0} onRetry={() => void refetchDoctors()}
          emptyTitle="Chưa có bác sĩ" emptyMessage="Phòng khám này chưa có bác sĩ nào.">
          {doctors.map((row: ClinicDoctorDto) => (
            <tr key={row.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
              <td className="dark:border-border-dark border-r border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  {row.doctorAvatar
                    ? <img src={row.doctorAvatar} className="h-9 w-9 rounded-full object-cover" />
                    : <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold">{row.doctorName.charAt(0)}</div>
                  }
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{row.doctorName}</p>
                    <p className="text-xs text-gray-400">{row.doctorId.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
              </td>
              <td className="dark:border-border-dark border-r border-gray-200 p-4">
                <div className="flex flex-col gap-0.5 text-[13px]">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{row.specialty ?? "Chưa cập nhật"}</span>
                  <span className="text-xs text-gray-400">{row.consultationFee.toLocaleString("vi-VN")} VNĐ / lần</span>
                </div>
              </td>
              <td className="dark:border-border-dark border-r border-gray-200 p-4 text-center">
                <Badge type={row.status === "Active" ? "success" : "error"} value={row.status === "Active" ? "Đang HĐ" : "Tạm dừng"} />
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Tooltip content="Chỉnh sửa">
                    <IconAction icon={<FiEdit3 />} className="text-amber-500" onClick={() => { setEditingDoctor(row); setIsDoctorModalOpen(true); }} />
                  </Tooltip>
                  <Tooltip content="Gỡ khỏi phòng khám">
                    <IconAction icon={<FiTrash2 />} danger onClick={() => handleRemoveDoctor(row.id)} />
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </DataTableShell>
      </section>

      {/* Contracts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hợp đồng phòng khám</h2>
          <button onClick={() => { setEditingContract(null); setIsContractModalOpen(true); }} className="btn-primary">
            <FiPlus /> Thêm hợp đồng
          </button>
        </div>
        <DataTableShell columns={contractColumns} isLoading={contractsLoading} isError={contractsError} errorMessage={contractsErr?.message}
          isEmpty={!contractsLoading && !contractsError && contracts.length === 0} onRetry={() => void refetchContracts()}
          emptyTitle="Chưa có hợp đồng" emptyMessage="Phòng khám này chưa có hợp đồng nào.">
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
                  <Tooltip content="Xem file"><IconAction icon={<FiFileText />} onClick={() => window.open(row.fileUrl, "_blank")} /></Tooltip>
                  <Tooltip content="Cập nhật trạng thái"><IconAction icon={<FiEdit3 />} className="text-amber-500" onClick={() => { setEditingContract(row); setIsContractModalOpen(true); }} /></Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </DataTableShell>
      </section>

      <ClinicDoctorModal isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} clinicId={clinicId} initialData={editingDoctor} />
      <ClinicContractModal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} initialData={editingContract} clinicId={clinicId} />
    </div>
  );
}
