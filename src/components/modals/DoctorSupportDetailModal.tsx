import { Badge } from "@/components/custom-ui/Badge";
import { formatDate, formatTime } from "@/common/format";
import { getGenderDisplay } from "@/common/mappers";
import { useAppointmentDetail, useUpdateAppointmentStatus } from "@/hooks/data/useAppointmentHooks";
import { useMemberHealthProfile } from "@/hooks/data/useHealthHooks";
import { usePrescriptionsByMemberId } from "@/hooks/data/usePrescriptionHooks";
import type { MemberPrescriptionDto } from "@/types/Prescription";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiCalendar, FiCheck, FiCreditCard, FiFileText, FiImage, FiX } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

type DoctorSupportDetailModalProps = {
  open: boolean;
  appointmentId: string | null;
  onClose: () => void;
};

function statusLabel(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "pending") return "Chờ duyệt";
  if (normalized === "approved") return "Đã duyệt";
  if (normalized === "inprogress") return "Đang khám";
  if (normalized === "completed") return "Hoàn thành";
  if (normalized === "cancelled") return "Đã hủy";
  if (normalized === "rejected") return "Đã từ chối";
  return status || "Không xác định";
}

function getStatusBadge(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === "approved" || normalized === "completed") {
    return <Badge type="success" value={statusLabel(status)} />;
  }

  if (normalized === "pending" || normalized === "inprogress") {
    return <Badge type="warning" value={statusLabel(status)} />;
  }
  if (normalized === "cancelled" || normalized === "rejected") {
    return <Badge type="error" value={statusLabel(status)} />;
  }

  return <Badge type="info" value={statusLabel(status)} />;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return `${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} ${formatDate(value)}`;
}

function formatDateOfBirth(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function toShortId(value?: string | null, length = 8) {
  if (!value) return "N/A";
  return value.replace(/-/g, "").toUpperCase().slice(0, length);
}

function getInitials(name?: string | null) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function Avatar({ name, src }: { name?: string | null; src?: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className="h-10 w-10 rounded-full border border-gray-400 object-cover shadow-sm dark:border-white/10"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-400 bg-gray-50 text-sm font-semibold text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
      {getInitials(name)}
    </div>
  );
}

export function DoctorSupportDetailModal({
  open,
  appointmentId,
  onClose,
}: DoctorSupportDetailModalProps) {
  const { data, isLoading, isError, error, refetch } = useAppointmentDetail(
    appointmentId || "",
    open,
  );

  const { data: healthProfile, isLoading: isLoadingHealth } =
    useMemberHealthProfile(data?.memberId);

  const { data: prescriptions, isLoading: isLoadingPrescriptions } =
    usePrescriptionsByMemberId(data?.memberId);

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAppointmentStatus();

  const isPaid = data?.paymentStatus === "Paid";
  const canApprove = data?.status === "Pending" && isPaid;

  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<MemberPrescriptionDto | null>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(event) => event.stopPropagation()}
          className="z-10 flex h-[90vh] max-h-[600px] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900 dark:backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Chi tiết lịch hẹn
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <DetailSkeleton />
            ) : isError ? (
              <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-50/30 p-8 text-center dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Không thể tải chi tiết
                </h3>
                <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
                  {error?.message ||
                    "Đã xảy ra lỗi khi tải thông tin lịch hẹn. Vui lòng thử lại sau."}
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="bg-primary mt-6 rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-95"
                >
                  Thử lại
                </button>
              </div>
            ) : data ? (
              <div className="space-y-4">
                {/* Lịch hẹn */}
                <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/80 px-5 py-3.5 dark:border-white/5 dark:bg-black/20">
                    <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Lịch hẹn khám bệnh
                    </p>
                    {getStatusBadge(data.status)}
                  </div>
                  <div className="p-4 font-sans">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 flex h-10 w-10 items-center justify-center rounded-xl">
                        <FiCalendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-end gap-2">
                          <h3 className="text-base leading-none font-semibold tracking-tight text-gray-900 dark:text-white">
                            {formatTime(data.appointmentTime)}
                          </h3>
                          <span className="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            {formatDate(data.appointmentDate)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                          APT #{toShortId(data.appointmentId, 10)} • TẠO{" "}
                          {formatDateTime(data.createdAt).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Payment info row */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5">
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Thanh toán</span>
                        <span className={`mt-0.5 text-sm font-semibold ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          }`}>
                          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5">
                        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Phí khám</span>
                        <span className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
                          {data.amount != null
                            ? `${data.amount.toLocaleString("vi-VN")} ₫`
                            : "Chưa rõ"}
                        </span>
                      </div>
                    </div>

                    {data.clinicName && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 dark:border-white/5 dark:bg-white/5">
                        <FiCreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Phòng khám: <span className="font-semibold text-gray-900 dark:text-white">{data.clinicName}</span>
                        </span>
                      </div>
                    )}

                    {data.cancelReason?.trim() ? (
                      <div className="mt-5 rounded-2xl border border-yellow-200/60 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                        <p className="text-[10px] font-bold tracking-widest text-yellow-800 uppercase dark:text-yellow-400">
                          Nội dung ghi chú / Lý do hủy
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed font-medium text-yellow-900 dark:text-yellow-200/90">
                          {data.cancelReason}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <div className="grid gap-4 xl:grid-cols-2">
                  <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
                    <div className="border-b border-gray-400 bg-gray-50/80 px-5 py-3.5 dark:border-white/5 dark:bg-black/20">
                      <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Bác sĩ điều trị
                      </p>
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <Avatar name={data.doctorName} src={data.doctorAvatar} />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {data.doctorName}
                        </h3>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          {data.specialty || "Chuyên khoa: Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/80 px-5 py-3.5 dark:border-white/5 dark:bg-black/20">
                      <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                        Thông tin bệnh nhân
                      </p>
                      <span className="rounded-md border border-gray-400 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                        #{toShortId(data.memberId, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <Avatar name={data.memberName} src={data.memberAvatar} />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {data.memberName}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                          <span className="rounded-md border border-gray-400 bg-gray-50 px-2 py-0.5 dark:border-white/10 dark:bg-white/5">
                            {getGenderDisplay(data.memberGender)}
                          </span>
                          <span className="rounded-md border border-gray-400 bg-gray-50 px-2 py-0.5 dark:border-white/10 dark:bg-white/5">
                            {formatDateOfBirth(data.memberDateOfBirth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/80 px-5 py-3.5 dark:border-white/5 dark:bg-black/20">
                    <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Hồ sơ sức khỏe
                    </p>
                    {healthProfile && healthProfile.insuranceNumber && (
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        BHYT:{" "}
                        <span className="text-gray-900 dark:text-gray-200">
                          {healthProfile.insuranceNumber}
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {isLoadingHealth ? (
                      <div className="flex animate-pulse flex-col space-y-3">
                        <div className="h-4 w-1/3 rounded-lg bg-gray-200 dark:bg-white/10" />
                        <div className="h-16 w-full rounded-2xl bg-gray-200 dark:bg-white/10" />
                      </div>
                    ) : healthProfile ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            {
                              label: "Nhóm máu",
                              value: healthProfile.bloodType || "N/A",
                              color: "text-rose-500 dark:text-rose-400",
                            },
                            {
                              label: "Chiều cao",
                              value: healthProfile.height
                                ? `${healthProfile.height} cm`
                                : "----",
                              color: "text-blue-500 dark:text-blue-400",
                            },
                            {
                              label: "Cân nặng",
                              value: healthProfile.weight
                                ? `${healthProfile.weight} kg`
                                : "----",
                              color: "text-emerald-500 dark:text-emerald-400",
                            },
                            {
                              label: "BMI",
                              value: healthProfile.bmi
                                ? healthProfile.bmi.toFixed(1)
                                : "----",
                              color: "text-amber-500 dark:text-amber-400",
                            },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="flex flex-col items-center justify-center rounded-xl border border-gray-400 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5"
                            >
                              <p className="text-[9px] font-medium tracking-widest text-gray-400 uppercase">
                                {stat.label}
                              </p>
                              <p
                                className={`mt-1 text-sm font-semibold ${stat.color}`}
                              >
                                {stat.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        {healthProfile.conditions &&
                          healthProfile.conditions.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Bệnh lý nền
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {healthProfile.conditions.map((condition) => (
                                  <div
                                    key={condition.conditionId}
                                    className="rounded-2xl border border-gray-400 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                                  >
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {condition.conditionName}
                                    </h4>
                                    <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                      {condition.description}
                                    </p>
                                    <span
                                      className={`mt-3 inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${condition.status === "Active"
                                        ? "bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                        }`}
                                    >
                                      {condition.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-8 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                          Bệnh nhân chưa cập nhật hồ sơ sức khỏe
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Đơn thuốc đang sử dụng */}
                <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-xs dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/80 px-5 py-3.5 dark:border-white/5 dark:bg-black/20">
                    <p className="text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Đơn thuốc đang sử dụng
                    </p>
                    {prescriptions && prescriptions.length > 0 && (
                      <span className="rounded-md border border-gray-400 bg-white px-2 py-0.5 text-[10px] font-bold tracking-wider text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                        {prescriptions.length} đơn thuốc
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    {isLoadingPrescriptions ? (
                      <div className="flex animate-pulse flex-col space-y-3">
                        <div className="h-4 w-1/3 rounded-lg bg-gray-200 dark:bg-white/10" />
                        <div className="h-24 w-full rounded-2xl bg-gray-200 dark:bg-white/10" />
                      </div>
                    ) : prescriptions && prescriptions.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {prescriptions.map((prescription) => (
                          <button
                            key={prescription.prescriptionId}
                            type="button"
                            onClick={() => setSelectedPrescription(prescription)}
                            className="group w-full text-left rounded-2xl border border-gray-400 bg-white p-4 transition hover:border-indigo-400 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-indigo-500/60"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                {prescription.prescriptionCode || "Chưa có mã"}
                              </h4>
                              <span
                                className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${prescription.status === "Active"
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
                                  }`}
                              >
                                {prescription.status}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              Bác sĩ: {prescription.doctorName}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                              Ngày kê: {formatDate(prescription.prescriptionDate)}
                            </p>

                            {prescription.medicines && prescription.medicines.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/10">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Thuốc (Top 3)</p>
                                <ul className="space-y-1">
                                  {prescription.medicines.slice(0, 3).map((med, idx) => (
                                    <li key={med.prescriptionMedicineId || idx} className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                      • <span className="font-semibold">{med.medicineName}</span> {med.dosage} x {med.quantity} {med.unit}
                                    </li>
                                  ))}
                                  {prescription.medicines.length > 3 && (
                                    <li className="text-xs text-gray-400 italic">
                                      + {prescription.medicines.length - 3} loại khác...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            <p className="mt-3 text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition">
                              Nhấn để xem chi tiết →
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-8 dark:border-white/10 dark:bg-white/5">
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                          Bệnh nhân chưa có đơn thuốc nào
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-50/30 p-8 text-center dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Chưa có dữ liệu
                </h3>
                <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-gray-400">
                  Không tìm thấy thông tin chi tiết cho lịch hẹn này.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-400 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
            {canApprove && (
              <>
                <button
                  onClick={() => setConfirmAction("reject")}
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                >
                  <FiX className="h-3.5 w-3.5" />
                  Từ chối
                </button>
                <button
                  onClick={() => setConfirmAction("approve")}
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  <FiCheck className="h-3.5 w-3.5" />
                  {isUpdating ? "Đang duyệt..." : "Duyệt lịch hẹn"}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="rounded-lg px-6 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        open={confirmAction !== null}
        title={confirmAction === "approve" ? "Duyệt lịch hẹn" : "Từ chối lịch hẹn"}
        message={
          confirmAction === "approve"
            ? "Bạn có chắc chắn muốn duyệt lịch hẹn này? Thông báo sẽ được gửi đến bệnh nhân."
            : "Bạn có chắc chắn muốn từ chối lịch hẹn này? Số tiền đã thanh toán sẽ được hoàn lại cho bệnh nhân."
        }
        confirmText={confirmAction === "approve" ? "Duyệt" : "Từ chối"}
        confirmButtonType={confirmAction === "approve" ? "success" : "danger"}
        onConfirm={() => {
          if (confirmAction === "approve") {
            updateStatus({ id: appointmentId!, status: "Approved" }, { onSuccess: () => { setConfirmAction(null); onClose(); } });
          } else {
            updateStatus({ id: appointmentId!, status: "Rejected" }, { onSuccess: () => { setConfirmAction(null); onClose(); } });
          }
        }}
        onCancel={() => setConfirmAction(null)}
        isLoading={isUpdating}
      />
    </AnimatePresence>

    {/* Prescription Detail Popup — render via Portal ra document.body để tránh bị clip */}
    {selectedPrescription && createPortal(
      <AnimatePresence>
        <PrescriptionDetailPopup
          key={selectedPrescription.prescriptionId}
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      </AnimatePresence>,
      document.body
    )}
  </>
  );
}


function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-400 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/10" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
            <div className="h-8 w-72 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
            <div className="h-5 w-52 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
          </div>
        </div>
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-gray-400 bg-white p-5 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                <div className="h-6 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10" />
              <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-400 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
        <div className="mt-3 h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        PRESCRIPTION DETAIL POPUP                            */
/* -------------------------------------------------------------------------- */
function PrescriptionDetailPopup({
  prescription,
  onClose,
}: {
  prescription: MemberPrescriptionDto;
  onClose: () => void;
}) {
  const statusColor =
    prescription.status === "Active"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
      : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[80vh] flex flex-col rounded-2xl border border-gray-400 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-5 py-4 dark:border-white/10 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <FiFileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {prescription.prescriptionCode || "Chưa có mã đơn"}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Ngày kê: {formatDate(prescription.prescriptionDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${statusColor}`}>
              {prescription.status}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-5 space-y-5">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Bác sĩ kê</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {prescription.doctorName || "Không rõ"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cơ sở khám</p>
              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                {prescription.hospitalName || "Không rõ"}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">Chẩn đoán</p>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200/90 leading-relaxed">
                {prescription.diagnosis}
              </p>
            </div>
          )}

          {/* Notes */}
          {prescription.notes && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Ghi chú của bác sĩ</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                {prescription.notes}
              </p>
            </div>
          )}

          {/* Medicine List */}
          {prescription.medicines && prescription.medicines.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Danh sách thuốc — {prescription.medicines.length} loại
              </p>
              <div className="space-y-2">
                {prescription.medicines.map((med, idx) => (
                  <div
                    key={med.prescriptionMedicineId || idx}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{med.medicineName}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          Liều: {med.dosage}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                          Số lượng: {med.quantity} {med.unit}
                        </span>
                      </div>
                      {med.instructions && (
                        <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                          Hướng dẫn: {med.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {prescription.images && prescription.images.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                Ảnh đơn thuốc — {prescription.images.length} ảnh
              </p>
              <div className="grid grid-cols-2 gap-2">
                {prescription.images.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"
                  >
                    <img
                      src={img.thumbnailUrl || img.imageUrl}
                      alt={`Ảnh đơn thuốc ${idx + 1}`}
                      className="h-32 w-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                      <FiImage className="h-6 w-6 text-white opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-5 py-3 dark:border-white/10 dark:bg-white/5">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
