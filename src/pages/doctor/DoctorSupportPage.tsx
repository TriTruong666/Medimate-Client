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
import {
  useDoctorAppointments,
  useUpdateAppointmentStatus,
} from "@/hooks/data/useAppointmentHooks";
import {
  useAppointmentSession,
} from "@/hooks/data/useSessionHooks";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";
import { toast } from "@/hooks/useToast";
import { formatDate, formatTime } from "@/common/format";
import { useNavigate } from "react-router-dom";
import type {
  AppointmentStatus,
  AppointmentType,
  DoctorAppointment,
} from "@/types/Appointment";

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  type: AppointmentType;
  dateKey: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  symptoms: string;
}

function toMaskedLabel(prefix: string, value: string): string {
  if (!value) return prefix;
  const shortValue = value.slice(0, 8).toUpperCase();
  return `${prefix} ${shortValue}`;
}

function mapAppointment(raw: DoctorAppointment): Appointment {
  return {
    id: raw.appointmentId,
    patientName: toMaskedLabel("Bệnh nhân", raw.memberId),
    type: "online",
    dateKey: raw.appointmentDate,
    date: formatDate(raw.appointmentDate),
    time: formatTime(raw.appointmentDate),
    status: raw.status,
    symptoms:
      raw.cancelReason?.trim() || "Chưa có ghi chú cho lịch hẹn này.",
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
      <div className="flex min-h-70 w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-gray-400">
          Đang tải lịch hẹn...
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="flex min-h-70 w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
        <h3 className="text-lg font-semibold text-white">Đã xảy ra lỗi</h3>
        <p className="mt-2 max-w-100 text-center text-sm text-gray-400">
          {message || "Không thể tải dữ liệu lịch hẹn. Vui lòng thử lại."}
        </p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-70 w-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
      <h3 className="text-lg font-semibold text-white">Chưa có lịch hẹn</h3>
      <p className="mt-2 text-center text-sm text-gray-400">
        Không tìm thấy lịch hẹn nào cho bác sĩ hiện tại.
      </p>
    </div>
  );
}

type FilterTab = "all" | "pending" | "approved" | "inprogress" | "history";

export default function DoctorSupportPage({ filter = "all", title = "Lịch khám bệnh nhân" }: { filter?: FilterTab; title?: string }) {
  const [viewLayout, setViewLayout] = useState<"card" | "calendar">("card");
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  
  const {
    data: appointmentResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctorAppointments();
  const { data: doctorProfile } = useDoctorMe(true);

  const appointments = (appointmentResponse ?? []).map(mapAppointment);
  
  const filteredAppointments = appointments.filter((apt) => {
    switch (filter) {
      case "all": return true;
      case "pending": return apt.status === "Pending";
      case "approved": return apt.status === "Approved";
      case "inprogress": return apt.status === "InProgress";
      case "history": return ["Completed", "Cancelled", "Rejected"].includes(apt.status);
      default: return true;
    }
  });

  const hasAppointments = filteredAppointments.length > 0;
  const doctorId = doctorProfile?.doctorId || "";

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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Layout Toggle - Apply dashboard_table_card skill */}
          <div className="flex gap-1 rounded-lg bg-white/5 p-1">
            <button
              onClick={() => setViewLayout("card")}
              className={`${
                viewLayout === "card"
                  ? "bg-primary text-white shadow-[0_4px_12px_rgba(var(--primary),0.3)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
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
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              } flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition`}
            >
              <LuCalendarDays className="text-sm" />
              Lịch
            </button>
          </div>
          <button
            onClick={handleOpenExceptionModal}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10"
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
                <AppointmentState type="loading" />
              ) : isError ? (
                <AppointmentState
                  type="error"
                  message={error?.message}
                  onRetry={() => void refetch()}
                />
              ) : hasAppointments ? (
                <AppointmentCardGrid data={filteredAppointments} />
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
              {isLoading ? (
                <AppointmentState type="loading" />
              ) : isError ? (
                <AppointmentState
                  type="error"
                  message={error?.message}
                  onRetry={() => void refetch()}
                />
              ) : hasAppointments ? (
                <MonthlyCalendarView data={filteredAppointments} />
              ) : (
                <AppointmentState type="empty" />
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CARD VIEW COMPONENT                             */
/* -------------------------------------------------------------------------- */
function AppointmentCardGrid({ data }: { data: Appointment[] }) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {data.map((apt) => (
        <AppointmentCard key={apt.id} data={apt} />
      ))}
    </motion.div>
  );
}

function AppointmentCard({ data }: { data: Appointment }) {
  const isNow = data.status === "InProgress";
  const isCallReady = data.status === "InProgress" || data.status === "Approved";
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();
  const navigate = useNavigate();

  const { data: sessionData, isLoading: sessionLoading } = useAppointmentSession(data.id, isCallReady);
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

  return (
    <motion.div
      variants={cardItem}
      whileHover={{ y: -4 }}
      className={`group relative flex h-full flex-col rounded-2xl border bg-white/80 p-5 backdrop-blur transition-all duration-300 hover:z-50 dark:bg-white/5 ${
        isNow
          ? "border-primary/50 dark:border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.15)]"
          : "border-gray-100 hover:border-white/20 hover:bg-white/10 dark:border-white/10"
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data.id}
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
        <StatusBadge status={data.status} />
        <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
          {data.status === "Pending" && (
            <>
              <Tooltip content="Duyệt lịch hẹn">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                >
                  <FiCheck />
                </button>
              </Tooltip>
              <Tooltip content="Từ chối">
                <button
                  onClick={handleReject}
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
                onClick={handleJoinCall}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  canJoin
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-gray-100 text-gray-400 opacity-50 dark:bg-white/5"
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
function MonthlyCalendarView({ data }: { data: Appointment[] }) {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const dayOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayDate = new Date(currentYear, currentMonth, day);
    const dayAppointments = data.filter((apt) => {
      const aptDate = new Date(apt.dateKey);
      return (
        !Number.isNaN(aptDate.getTime()) &&
        aptDate.getFullYear() === currentYear &&
        aptDate.getMonth() === currentMonth &&
        aptDate.getDate() === day
      );
    });

    return {
      day,
      date: dayDate.toISOString(),
      appointments: dayAppointments,
      isToday: day === today.getDate(),
    };
  });

  const emptyPreDays = Array.from({ length: dayOffset });

  return (
    <div className="dark:border-border-dark overflow-hidden rounded-xl border border-gray-100">
      {/* Calendar Header */}
      <div className="dark:border-border-dark dark:bg-border-dark/30 grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {daysOfWeek.map((day, i) => (
          <div
            key={i}
            className={`p-3 text-center text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400 ${
              i < 6 ? "dark:border-border-dark border-r border-gray-100" : ""
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
            className={`dark:border-border-dark min-h-30 border-b border-gray-100 bg-transparent ${
              i % 7 < 6 ? "border-r" : ""
            }`}
          />
        ))}
        {days.map(({ day, appointments, isToday }, i) => {
          const gridIndex = emptyPreDays.length + i;
          return (
            <div
              key={i}
              className={`group dark:border-border-dark relative flex min-h-30 flex-col gap-1 border-b border-gray-100 bg-transparent p-2 transition hover:bg-gray-50/50 dark:hover:bg-white/5 ${
                gridIndex % 7 < 6
                  ? "dark:border-border-dark border-r border-gray-100"
                  : ""
              }`}
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
                {appointments.map((apt) => (
                  <CalendarAppointmentItem key={apt.id} apt={apt} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarAppointmentItem({ apt }: { apt: Appointment }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isNow = apt.status === "InProgress";
  const isCallReady = apt.status === "InProgress" || apt.status === "Approved";
  const { mutate: updateStatus, isPending } = useUpdateAppointmentStatus();
  const navigate = useNavigate();

  const { data: sessionData, isLoading: sessionLoading } = useAppointmentSession(apt.id, isCallReady);
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
              {apt.status === "Pending" && (
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
function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, React.ReactNode> = {
    Pending: <Badge type="info" value="Chưa duyệt" />,
    InProgress: <Badge type="warning" value="Đang khám" />,
    Completed: <Badge type="success" value="Hoàn thành" />,
    Cancelled: <Badge type="error" value="Đã hủy" />,
    Approved: <Badge type="success" value="Đã duyệt" />,
    Rejected: <Badge type="error" value="Đã từ chối" />,
  };
  return map[status];
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
