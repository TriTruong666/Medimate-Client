import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { LuGrid3X3, LuCalendarDays, LuPlus } from "react-icons/lu";
import { FiClock, FiVideo, FiMapPin, FiCheck, FiX } from "react-icons/fi";
import { cardContainer, cardItem } from "@/motions/cardMotion";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { Spinner } from "@/components/custom-ui/Spinner";
import { DoctorExceptionModal } from "@/components/modals/DoctorExceptionModal";
import { DoctorSupportDetailModal } from "@/components/modals/DoctorSupportDetailModal";
import {
  useDoctorAppointments,
  useUpdateAppointmentStatus,
} from "@/hooks/data/useAppointmentHooks";
import { useAppointmentSession } from "@/hooks/data/useSessionHooks";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";
import { useDoctorAvailabilities } from "@/hooks/data/useDoctorAvailabilityHooks";
import { useDoctorAvailabilityExceptions } from "@/hooks/data/useDoctorAvailabilityExceptionHooks";
import { toast } from "@/hooks/useToast";
import { formatDate } from "@/common/format";
import { useNavigate } from "react-router-dom";
import type {
  AppointmentStatus,
  AppointmentType,
  DoctorAppointment,
} from "@/types/Appointment";
import type { DayOfWeek, DoctorAvailability } from "@/types/DoctorAvailability";
import type { DoctorAvailabilityException } from "@/types/DoctorAvailabilityException";

interface Appointment {
  id: string;
  memberId: string;
  patientName: string;
  patientShortId: string;
  appointmentShortId: string;
  patientAvatar?: string;
  type: AppointmentType;
  dateKey: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  paymentStatus: string;  // "Pending" | "Paid"
  amount?: number;
  clinicName?: string;
  symptoms: string;
}

const DAY_OF_WEEK_TO_INDEX: Record<DayOfWeek, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 0,
};

function toDayOfWeekIndex(value: string): number | null {
  if (value in DAY_OF_WEEK_TO_INDEX) {
    return DAY_OF_WEEK_TO_INDEX[value as DayOfWeek];
  }
  return null;
}

function normalizeDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeLabel(value?: string | null): string {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

const APPOINTMENT_PRIORITY: Record<AppointmentStatus, number> = {
  InProgress: 0,
  Pending: 1,
  Approved: 2,
  Completed: 3,
  Cancelled: 4,
  Rejected: 5,
};

function getTimeInMinutes(value: string): number {
  const match = value.match(/(\d{2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour * 60 + minute;
}

function sortAppointmentsForCalendar(items: Appointment[]): Appointment[] {
  return [...items].sort((a, b) => {
    const priorityDiff =
      (APPOINTMENT_PRIORITY[a.status] ?? 999) -
      (APPOINTMENT_PRIORITY[b.status] ?? 999);
    if (priorityDiff !== 0) return priorityDiff;

    return getTimeInMinutes(a.time) - getTimeInMinutes(b.time);
  });
}

function getPatientLabel(raw: DoctorAppointment): string {
  const memberName = raw.memberName?.trim();
  if (memberName) return memberName;
  return "Bệnh nhân";
}

function toShortId(value: string, length = 6): string {
  if (!value) return "N/A";
  return value.replace(/-/g, "").toUpperCase().slice(0, length);
}

function formatAppointmentTime(value?: string | null): string {
  if (!value) return "--:--";

  const trimmed = value.trim();
  const timeMatch = trimmed.match(/^(\d{2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1]}:${timeMatch[2]}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return trimmed;
}

function mapAppointment(raw: DoctorAppointment): Appointment {
  return {
    id: raw.appointmentId,
    memberId: raw.memberId,
    patientName: getPatientLabel(raw),
    patientShortId: toShortId(raw.memberId),
    appointmentShortId: toShortId(raw.appointmentId),
    type: "online",
    dateKey: raw.appointmentDate,
    date: formatDate(raw.appointmentDate),
    time: formatAppointmentTime(raw.appointmentTime),
    status: raw.status,
    paymentStatus: raw.paymentStatus ?? "Pending",
    amount: raw.amount,
    clinicName: raw.clinicName,
    symptoms: raw.cancelReason?.trim() || "Chưa có ghi chú cho lịch hẹn này.",
  };
}

function AppointmentState({
  type,
  message,
  onRetry,
}: {
  type: "loading" | "error" | "empty";
  message?: string;
  onRetry?: () => void;
}) {
  if (type === "loading") {
    return (
      <div className="flex min-h-70 w-full flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-50/50 p-8 dark:border-white/10 dark:bg-white/5">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Đang tải lịch hẹn...
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex min-h-70 w-full flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-50/50 p-8 dark:border-white/10 dark:bg-white/5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Đã xảy ra lỗi
        </h3>
        <p className="mt-2 max-w-100 text-center text-sm text-gray-500 dark:text-gray-400">
          {message || "Không thể tải dữ liệu lịch hẹn. Vui lòng thử lại."}
        </p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-70 w-full flex-col items-center justify-center rounded-2xl border border-gray-300 bg-gray-50/50 p-8 dark:border-white/10 dark:bg-white/5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Chưa có lịch hẹn
      </h3>
      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        Không tìm thấy lịch hẹn nào cho bác sĩ hiện tại.
      </p>
    </div>
  );
}

type FilterTab = "all" | "pending" | "approved" | "inprogress" | "history";

export default function DoctorSupportPage({
  filter = "all",
  title = "Lịch khám bệnh nhân",
}: {
  filter?: FilterTab;
  title?: string;
}) {
  const [viewLayout, setViewLayout] = useState<"card" | "calendar">("card");
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  const {
    data: appointmentResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctorAppointments();
  const { data: doctorProfile } = useDoctorMe(true);
  const doctorId = doctorProfile?.doctorId || "";
  const {
    data: availabilityResponse,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    error: availabilityError,
    refetch: refetchAvailabilities,
  } = useDoctorAvailabilities(doctorId);
  const {
    data: exceptionResponse,
    isLoading: isExceptionLoading,
    isError: isExceptionError,
    error: exceptionError,
    refetch: refetchExceptions,
  } = useDoctorAvailabilityExceptions(doctorId);

  const appointments = (appointmentResponse ?? []).map(mapAppointment);
  const availabilities = (availabilityResponse ?? []).filter(
    (item) => item.isActive,
  );
  const approvedExceptions = (exceptionResponse ?? []).filter(
    (item) => item.isAvailableOverride,
  );

  const filteredAppointments = appointments.filter((apt) => {
    switch (filter) {
      case "all":
        return true;
      case "pending":
        return apt.status === "Pending";
      case "approved":
        return apt.status === "Approved";
      case "inprogress":
        return apt.status === "InProgress";
      case "history":
        return ["Completed", "Cancelled", "Rejected"].includes(apt.status);
      default:
        return true;
    }
  });

  const hasAppointments = filteredAppointments.length > 0;
  const calendarLoading =
    isLoading ||
    (!doctorId ? false : isAvailabilityLoading || isExceptionLoading);
  const calendarError = isError || isAvailabilityError || isExceptionError;
  const calendarErrorMessage =
    error?.message ||
    availabilityError?.message ||
    exceptionError?.message ||
    "Không thể tải dữ liệu lịch làm việc.";

  function handleOpenExceptionModal() {
    if (!doctorId) {
      toast.error(
        "Không thể mở lịch nghỉ",
        "Không tìm thấy thông tin bác sĩ hiện tại.",
      );
      return;
    }

    setIsExceptionModalOpen(true);
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Công việc", path: "/dashboard/doctor-support" },
    { label: title },
  ];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Layout Toggle - Apply dashboard_table_card skill */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/5">
            <button
              onClick={() => setViewLayout("card")}
              className={`${
                viewLayout === "card"
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(var(--primary),0.3)]"
                  : "text-gray-500 hover:bg-white/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              } flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
            >
              <LuGrid3X3 className="text-sm" />
              Thẻ
            </button>
            <button
              onClick={() => setViewLayout("calendar")}
              className={`${
                viewLayout === "calendar"
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(var(--primary),0.3)]"
                  : "text-gray-500 hover:bg-white/10 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
              } flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
            >
              <LuCalendarDays className="text-sm" />
              Lịch
            </button>
          </div>
          <button
            onClick={handleOpenExceptionModal}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-medium text-gray-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Thêm lịch nghỉ <LuPlus />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        <AnimatePresence mode="wait">
          {viewLayout === "card" && (
            <motion.div
              key="card-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                <AppointmentGridSkeleton />
              ) : isError ? (
                <AppointmentState
                  type="error"
                  message={error?.message}
                  onRetry={() => void refetch()}
                />
              ) : hasAppointments ? (
                <AppointmentCardGrid
                  data={filteredAppointments}
                  onOpenDetail={setSelectedAppointmentId}
                />
              ) : (
                <AppointmentState type="empty" />
              )}
            </motion.div>
          )}

          {viewLayout === "calendar" && (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {calendarLoading ? (
                <CalendarSkeleton />
              ) : calendarError ? (
                <AppointmentState
                  type="error"
                  message={calendarErrorMessage}
                  onRetry={() => {
                    void refetch();
                    void refetchAvailabilities();
                    void refetchExceptions();
                  }}
                />
              ) : hasAppointments ||
                availabilities.length > 0 ||
                approvedExceptions.length > 0 ? (
                <MonthlyCalendarView
                  data={filteredAppointments}
                  availabilities={availabilities}
                  approvedExceptions={approvedExceptions}
                  onOpenDetail={setSelectedAppointmentId}
                />
              ) : (
                <AppointmentState
                  type="empty"
                  message="Chưa có lịch làm việc hoặc lịch hẹn nào cho bác sĩ hiện tại."
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DoctorExceptionModal
        open={isExceptionModalOpen}
        doctorId={doctorId}
        onClose={() => setIsExceptionModalOpen(false)}
      />

      <DoctorSupportDetailModal
        open={!!selectedAppointmentId}
        appointmentId={selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CARD VIEW COMPONENT                             */
/* -------------------------------------------------------------------------- */
function AppointmentCardGrid({
  data,
  onOpenDetail,
}: {
  data: Appointment[];
  onOpenDetail: (appointmentId: string) => void;
}) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
    >
      {data.map((apt) => (
        <AppointmentCard key={apt.id} data={apt} onOpenDetail={onOpenDetail} />
      ))}
    </motion.div>
  );
}

function AppointmentCard({
  data,
  onOpenDetail,
}: {
  data: Appointment;
  onOpenDetail: (appointmentId: string) => void;
}) {
  const isNow = data.status === "InProgress";
  const isCallReady =
    data.status === "InProgress" || data.status === "Approved";
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();
  const navigate = useNavigate();

  const { data: sessionData, isLoading: sessionLoading } =
    useAppointmentSession(data.id, isCallReady);
  const sessionId = sessionData?.consultanSessionId;
  const canJoin = isCallReady && !!sessionId;

  function handleApprove() {
    updateStatus({ id: data.id, status: "Approved" });
  }

  function handleReject() {
    updateStatus({ id: data.id, status: "Rejected" });
  }

  function handleJoinCall() {
    if (sessionId) navigate(`/dashboard/video-call/${sessionId}`);
  }

  function handleOpenDetail() {
    onOpenDetail(data.id);
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleOpenDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpenDetail();
        }
      }}
      variants={cardItem}
      whileHover={{ y: -4 }}
      className={`group relative flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-5 shadow-sm backdrop-blur transition-all duration-300 hover:z-50 dark:bg-white/5 ${
        isNow
          ? "border-primary/50 dark:border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
          : "border-gray-300 hover:border-gray-400 hover:bg-white dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
              isNow
                ? "bg-primary text-white"
                : "bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400"
            }`}
          >
            {isNow && (
              <div className="bg-primary/30 absolute h-10 w-10 animate-ping rounded-full" />
            )}
            {data.patientName.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {data.patientName}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              APT #{data.appointmentShortId} • BN #{data.patientShortId}
            </p>
          </div>
        </div>
        <AppointmentTypeBadge type={data.type} />
      </div>

      <div className="my-4 h-px bg-gray-100 dark:bg-white/5" />

      {/* Body */}
      <div className="flex-1 space-y-3">
        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            isNow ? "text-primary" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          <FiClock
            className={isNow ? "text-primary animate-pulse" : "text-gray-400"}
          />
          <span>
            {data.time} • {data.date}
          </span>
        </div>
        <div className="line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Triệu chứng:{" "}
          </span>
          {data.symptoms}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        <StatusBadge status={data.status} paymentStatus={data.paymentStatus} />
        <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          {/* Chỉ hiện Approve/Reject khi Pending và đã thanh toán */}
          {data.status === "Pending" && data.paymentStatus === "Paid" && (
            <>
              <Tooltip content="Duyệt lịch hẹn">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleApprove();
                  }}
                  disabled={isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                >
                  <FiCheck />
                </button>
              </Tooltip>
              <Tooltip content="Từ chối">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReject();
                  }}
                  disabled={isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                >
                  <FiX />
                </button>
              </Tooltip>
            </>
          )}
          {isCallReady && (
            <Tooltip
              content={
                sessionLoading
                  ? "Đang tải Session..."
                  : canJoin
                    ? "Tham gia cuộc gọi"
                    : "Chưa có Session"
              }
            >
              <button
                disabled={!canJoin}
                onClick={(event) => {
                  event.stopPropagation();
                  handleJoinCall();
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  canJoin
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-gray-50 text-gray-400 opacity-50 dark:bg-white/5"
                } disabled:opacity-50`}
              >
                {sessionLoading ? <Spinner size="sm" /> : <FiVideo />}
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            CALENDAR VIEW COMPONENT                           */
/* -------------------------------------------------------------------------- */
function CalendarSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-400 dark:border-border-dark">
      <div className="dark:border-border-dark dark:bg-border-dark/30 grid grid-cols-7 border-b border-gray-300 bg-gray-100/80">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`h-10 border-gray-300 dark:border-border-dark ${i < 6 ? "border-r" : ""}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-7">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className={`h-30 border-b border-gray-300 p-2 dark:border-border-dark ${i % 7 < 6 ? "border-r" : ""}`}
          >
            <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="mt-2 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-white/5" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex h-48 animate-pulse flex-col rounded-2xl border border-gray-300 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
          <div className="mt-4 h-px bg-gray-100 dark:bg-white/5" />
          <div className="mt-4 flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthlyCalendarView({
  data,
  availabilities,
  approvedExceptions,
  onOpenDetail,
}: {
  data: Appointment[];
  availabilities: DoctorAvailability[];
  approvedExceptions: DoctorAvailabilityException[];
  onOpenDetail: (appointmentId: string) => void;
}) {
  const [expandedDay, setExpandedDay] = useState<{
    dateLabel: string;
    appointments: Appointment[];
  } | null>(null);
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const dayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const exceptionByDate = new Map<string, DoctorAvailabilityException[]>();
  approvedExceptions.forEach((item) => {
    const key = normalizeDateKey(item.date);
    if (!key) return;
    const prev = exceptionByDate.get(key) ?? [];
    prev.push(item);
    exceptionByDate.set(key, prev);
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayDate = new Date(currentYear, currentMonth, day);
    const dayDateKey = normalizeDateKey(dayDate.toISOString());
    const dayOfWeek = dayDate.getDay();

    const dayAvailabilities = availabilities.filter((slot) => {
      const dayIndex = toDayOfWeekIndex(slot.dayOfWeek);
      return dayIndex !== null && dayIndex === dayOfWeek;
    });

    const dayExceptions = exceptionByDate.get(dayDateKey) ?? [];
    const dayAppointments = sortAppointmentsForCalendar(
      data.filter((apt) => {
        const aptDate = new Date(apt.dateKey);
        return (
          !Number.isNaN(aptDate.getTime()) &&
          aptDate.getFullYear() === currentYear &&
          aptDate.getMonth() === currentMonth &&
          aptDate.getDate() === day
        );
      }),
    );

    return {
      day,
      date: dayDate.toISOString(),
      dateLabel: dayDate.toLocaleDateString("vi-VN"),
      availabilities: dayAvailabilities,
      exceptions: dayExceptions,
      appointments: dayAppointments,
      isToday: day === today.getDate(),
    };
  });

  const emptyPreDays = Array.from({ length: dayOffset });

  return (
    <div className="dark:border-border-dark overflow-hidden rounded-xl border border-gray-400">
      {/* Calendar Header */}
      <div className="dark:border-border-dark dark:bg-border-dark/30 grid grid-cols-7 border-b border-gray-300 bg-gray-100/80">
        {daysOfWeek.map((day, i) => (
          <div
            key={i}
            className={`p-3 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400 ${
              i < 6 ? "dark:border-border-dark border-r border-gray-300" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {emptyPreDays.map((_, i) => (
          <div
            key={`empty-${i}`}
            className={`dark:border-border-dark min-h-30 border-b border-gray-300 bg-gray-50/30 dark:bg-transparent ${
              i % 7 < 6 ? "border-r" : ""
            }`}
          />
        ))}
        {days.map(
          (
            {
              day,
              dateLabel,
              availabilities: dayAvailabilities,
              exceptions,
              appointments,
              isToday,
            },
            i,
          ) => {
            const gridIndex = emptyPreDays.length + i;
            const hasApprovedDayOff = exceptions.length > 0;
            const visibleAppointments = appointments.slice(0, 2);
            const hiddenAppointmentsCount = Math.max(
              appointments.length - visibleAppointments.length,
              0,
            );
            return (
              <div
                key={i}
                className={`group dark:border-border-dark relative flex min-h-30 flex-col gap-1 border-b border-gray-300 p-2 transition hover:bg-gray-100/50 dark:hover:bg-white/5 ${
                  hasApprovedDayOff
                    ? "bg-rose-50/60 dark:bg-rose-500/8"
                    : "bg-transparent"
                } ${gridIndex % 7 < 6 ? "dark:border-border-dark border-r border-gray-300" : ""}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    isToday
                      ? "bg-primary text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {day}
                </span>
                <div className="mt-1 flex-1 space-y-1">
                  {dayAvailabilities.slice(0, 2).map((slot) => (
                    <div
                      key={`${slot.id}-${slot.startTime}-${slot.endTime}`}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-1 text-[10px] leading-tight text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      title={`Lịch làm: ${formatTimeLabel(slot.startTime)} - ${formatTimeLabel(slot.endTime)}`}
                    >
                      Làm {formatTimeLabel(slot.startTime)}-
                      {formatTimeLabel(slot.endTime)}
                    </div>
                  ))}
                  {dayAvailabilities.length > 2 && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-300/90">
                      +{dayAvailabilities.length - 2} khung giờ
                    </div>
                  )}

                  {exceptions.slice(0, 2).map((item) => (
                    <div
                      key={
                        item.exceptionId ||
                        `${item.date}-${item.startTime}-${item.endTime}`
                      }
                      className="rounded-md border border-rose-200 bg-rose-50 px-1.5 py-1 text-[10px] leading-tight text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
                      title={`Nghỉ đã duyệt: ${formatTimeLabel(item.startTime)} - ${formatTimeLabel(item.endTime)}${item.reason ? ` | ${item.reason}` : ""}`}
                    >
                      Nghỉ {formatTimeLabel(item.startTime)}-
                      {formatTimeLabel(item.endTime)}
                    </div>
                  ))}
                  {exceptions.length > 2 && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-300/90">
                      +{exceptions.length - 2} lịch nghỉ
                    </div>
                  )}

                  {visibleAppointments.map((apt) => (
                    <CalendarAppointmentItem
                      key={apt.id}
                      apt={apt}
                      onOpenDetail={onOpenDetail}
                    />
                  ))}

                  {hiddenAppointmentsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedDay({
                          dateLabel,
                          appointments,
                        });
                      }}
                      className="w-full rounded-md border border-gray-300 bg-gray-100/80 px-1.5 py-1 text-left text-[10px] font-semibold text-gray-600 transition hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
                    >
                      +{hiddenAppointmentsCount} lịch hẹn
                    </button>
                  )}
                </div>
              </div>
            );
          },
        )}
      </div>

      <div className="dark:border-border-dark flex flex-wrap items-center gap-4 border-t border-gray-300 bg-gray-100/40 px-3 py-2 text-[11px] text-gray-600 dark:bg-white/2 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Lịch làm việc
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          Lịch nghỉ đã duyệt
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
          Lịch hẹn bệnh nhân
        </div>
      </div>

      <AnimatePresence>
        {expandedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setExpandedDay(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-gray-300 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#17181d]"
            >
              <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-white/10">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Lịch hẹn trong ngày
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {expandedDay.dateLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedDay(null)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  Đóng
                </button>
              </div>

              <div className="max-h-90 space-y-2 overflow-y-auto pr-1">
                {expandedDay.appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                        {apt.time} • {apt.patientName}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        APT #{apt.appointmentShortId}
                      </p>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <StatusBadge status={apt.status} />
                      <button
                        type="button"
                        onClick={() => {
                          onOpenDetail(apt.id);
                          setExpandedDay(null);
                        }}
                        className="rounded-md border border-gray-300 px-2 py-1 text-[11px] text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarAppointmentItem({
  apt,
  onOpenDetail,
}: {
  apt: Appointment;
  onOpenDetail: (appointmentId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isNow = apt.status === "InProgress";
  const isCallReady = apt.status === "InProgress" || apt.status === "Approved";
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();
  const navigate = useNavigate();

  const { data: sessionData, isLoading: sessionLoading } =
    useAppointmentSession(apt.id, isCallReady);
  const sessionId = sessionData?.consultanSessionId;
  const canJoin = isCallReady && !!sessionId;

  function handleApprove(e: React.MouseEvent) {
    e.stopPropagation();
    updateStatus({ id: apt.id, status: "Approved" });
    setIsOpen(false);
  }

  function handleReject(e: React.MouseEvent) {
    e.stopPropagation();
    updateStatus({ id: apt.id, status: "Rejected" });
    setIsOpen(false);
  }

  function handleJoinCall(e: React.MouseEvent) {
    e.stopPropagation();
    if (sessionId) navigate(`/dashboard/video-call/${sessionId}`);
    setIsOpen(false);
  }

  function handleOpenDetail(e: React.MouseEvent) {
    e.stopPropagation();
    onOpenDetail(apt.id);
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex cursor-pointer items-center justify-between rounded-md p-1.5 text-[10px] leading-tight transition-all ${
          isOpen ? "ring-1 ring-white/20" : ""
        } ${
          isNow
            ? "bg-primary/10 border-primary/40 text-primary dark:bg-primary/20 dark:text-primary-light border shadow-sm"
            : apt.type === "online"
              ? "border border-transparent bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
              : "border border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
        }`}
        title={apt.patientName}
      >
        <div className="relative z-10 w-full min-w-0 pr-1">
          <div className="flex items-center gap-1 truncate font-semibold">
            {apt.time.split(" ")[0]}
            {isNow && <span className="font-light">(tham gia ngay)</span>}
          </div>
          <div className="truncate opacity-80">{apt.patientName}</div>
        </div>
      </div>

      {/* Mini Dropdown */}
      {(isCallReady || apt.status === "Pending") && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="dark:border-border-dark absolute top-full left-0 z-999 mt-1 w-36 rounded-lg border border-gray-100 bg-white p-1 text-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] dark:bg-[#1a1c23]"
            >
              <button
                onClick={handleOpenDetail}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-white transition hover:bg-white/5"
              >
                <FiClock /> Chi tiết lịch hẹn
              </button>
              {isCallReady && (
                <button
                  onClick={handleJoinCall}
                  disabled={!canJoin}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition ${
                    canJoin
                      ? "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      : "cursor-not-allowed text-gray-400 opacity-50"
                  } disabled:opacity-50`}
                >
                  <FiVideo />{" "}
                  {sessionLoading ? "Đang tải Session..." : "Tham gia ngay"}
                </button>
              )}
              {/* Chỉ hiện Approve/Reject khi Pending + đã thanh toán */}
              {apt.status === "Pending" && apt.paymentStatus === "Paid" && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-emerald-600 transition hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                  >
                    <FiCheck /> Duyệt lịch hẹn
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isPending}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <FiX /> Từ chối
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HELPERS / BADGES                               */
/* -------------------------------------------------------------------------- */
function StatusBadge({ status, paymentStatus }: { status: AppointmentStatus; paymentStatus?: string }) {
  // Pending chia làm 2 sub-state dựa theo paymentStatus
  if (status === "Pending") {
    if (paymentStatus === "Paid") {
      return <Badge type="warning" value="Chờ duyệt" />;
    }
    return <Badge type="info" value="Chờ thanh toán" />;
  }

  const map: Partial<Record<AppointmentStatus, React.ReactNode>> = {
    InProgress: <Badge type="warning" value="Đang khám" />,
    Completed: <Badge type="success" value="Hoàn thành" />,
    Cancelled: <Badge type="error" value="Đã hủy" />,
    Approved: <Badge type="success" value="Đã duyệt" />,
    Rejected: <Badge type="error" value="Đã từ chối" />,
  };
  return map[status] ?? null;
}

function AppointmentTypeBadge({ type }: { type: AppointmentType }) {
  if (type === "online") {
    return (
      <div className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
        <FiVideo /> Online
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
      <FiMapPin /> Tại viện
    </div>
  );
}
