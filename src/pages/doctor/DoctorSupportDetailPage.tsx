import { Badge } from "@/components/custom-ui/Badge";
import { formatDate, formatTime } from "@/common/format";
import { getGenderDisplay } from "@/common/mappers";
import { useAppointmentDetail } from "@/hooks/data/useAppointmentHooks";
import { useMemberHealthProfile } from "@/hooks/data/useHealthHooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import { HiOutlineX } from "react-icons/hi";

type DoctorSupportDetailPageProps = {
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
        className="h-16 w-16 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-white text-lg font-semibold text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
      {getInitials(name)}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-gray-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

export function DoctorSupportDetailPage({
  open,
  appointmentId,
  onClose,
}: DoctorSupportDetailPageProps) {
  const { data, isLoading, isError, error, refetch } = useAppointmentDetail(
    appointmentId || "",
    open,
  );

  const { data: healthProfile, isLoading: isLoadingHealth } =
    useMemberHealthProfile(data?.memberId);

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(event) => event.stopPropagation()}
          className="z-10 flex h-[90vh] max-h-215 min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900 dark:backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chi tiết lịch hẹn
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Xem thông tin chi tiết và hồ sơ sức khỏe của bệnh nhân
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
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
              <div className="space-y-5">
                <section className="rounded-2xl border border-gray-300 bg-gray-50/30 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-primary flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
                        <FiCalendar className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Lịch hẹn khám bệnh
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                            Mã lịch #{toShortId(data.appointmentId, 12)}
                          </span>
                          {getStatusBadge(data.status)}
                          <span className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                            Tạo lúc {formatDateTime(data.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-1.5 text-xs text-gray-600 md:text-right dark:text-gray-300">
                      <div className="flex items-center gap-2 md:justify-end">
                        <FiClock className="h-4 w-4 text-gray-400" />
                        <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 font-semibold dark:bg-blue-500/20 dark:text-blue-400">
                          {formatTime(data.appointmentTime)}
                        </span>
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          • {formatDate(data.appointmentDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {data.cancelReason?.trim() ? (
                    <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-50/50 p-4 dark:bg-yellow-500/5">
                      <p className="text-[10px] font-medium tracking-widest text-yellow-700 uppercase dark:text-yellow-300">
                        Lý do hủy / ghi chú
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-yellow-900 dark:text-yellow-50/90">
                        {data.cancelReason}
                      </p>
                    </div>
                  ) : null}
                </section>

                <div className="grid gap-5 xl:grid-cols-2">
                  <section className="rounded-2xl border border-gray-300 bg-gray-50/30 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Avatar name={data.doctorName} src={data.doctorAvatar} />
                      <div>
                        <p className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase">
                          Bác sĩ điều trị
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold text-gray-900 dark:text-white">
                          {data.doctorName}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <InfoRow
                        label="Chuyên khoa"
                        value={data.specialty || "Chưa cập nhật"}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-gray-300 bg-gray-50/30 p-5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <Avatar name={data.memberName} src={data.memberAvatar} />
                      <div>
                        <p className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase">
                          Thông tin bệnh nhân
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold text-gray-900 dark:text-white">
                          {data.memberName}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {getGenderDisplay(data.memberGender)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2.5">
                      <InfoRow
                        label="Mã bệnh nhân"
                        value={`#${toShortId(data.memberId, 12)}`}
                      />
                      <InfoRow
                        label="Ngày sinh"
                        value={formatDateOfBirth(data.memberDateOfBirth)}
                      />
                    </div>
                  </section>
                </div>

                {/* Hồ sơ sức khỏe */}
                <section className="rounded-2xl border border-gray-300 bg-gray-50/30 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Hồ sơ sức khỏe
                    </h3>
                    <div className="bg-primary/20 h-0.5 w-12 rounded-full" />
                  </div>

                  {isLoadingHealth ? (
                    <div className="flex animate-pulse flex-col space-y-3">
                      <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10" />
                      <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
                    </div>
                  ) : healthProfile ? (
                    <div className="space-y-6">
                      {/* Thẻ chỉ số */}
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {[
                          {
                            label: "Nhóm máu",
                            value: healthProfile.bloodType || "N/A",
                            color: "text-red-600",
                          },
                          {
                            label: "Chiều cao",
                            value: healthProfile.height
                              ? `${healthProfile.height} cm`
                              : "N/A",
                            color: "text-blue-600",
                          },
                          {
                            label: "Cân nặng",
                            value: healthProfile.weight
                              ? `${healthProfile.weight} kg`
                              : "N/A",
                            color: "text-green-600",
                          },
                          {
                            label: "BMI",
                            value: healthProfile.bmi
                              ? healthProfile.bmi.toFixed(1)
                              : "N/A",
                            color: "text-orange-600",
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-black/20"
                          >
                            <p className="text-[9px] font-medium tracking-widest text-gray-400 uppercase">
                              {stat.label}
                            </p>
                            <p
                              className={`mt-1 text-base font-semibold ${stat.color} dark:text-white`}
                            >
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {healthProfile.insuranceNumber && (
                        <InfoRow
                          label="Bảo hiểm y tế"
                          value={healthProfile.insuranceNumber}
                        />
                      )}

                      {healthProfile.conditions &&
                        healthProfile.conditions.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] font-medium tracking-wider text-gray-700 uppercase dark:text-gray-300">
                              Bệnh lý nền
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {healthProfile.conditions.map((condition) => (
                                <div
                                  key={condition.conditionId}
                                  className="group hover:border-primary/30 relative rounded-xl border border-gray-200 bg-white p-3.5 transition-all dark:border-white/10 dark:bg-white/5"
                                >
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {condition.conditionName}
                                  </h4>
                                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                                    {condition.description}
                                  </p>
                                  <span
                                    className={`mt-2.5 inline-block rounded-md px-2 py-1 text-[9px] font-medium tracking-wider uppercase ${
                                      condition.status === "Active"
                                        ? "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                                        : "bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400"
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
                    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Bệnh nhân chưa cập nhật hồ sơ sức khỏe.
                      </p>
                    </div>
                  )}
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
          <div className="flex justify-end gap-3 border-t border-gray-400 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
            <button
              onClick={onClose}
              className="rounded-lg px-6 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-white/5">
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
            className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-white/5"
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

      <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100 dark:bg-white/10" />
        <div className="mt-3 h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/10" />
      </div>
    </div>
  );
}
