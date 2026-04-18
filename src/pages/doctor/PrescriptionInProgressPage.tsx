import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineEye,
} from "react-icons/hi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import IconAction from "@/components/custom-ui/IconAction";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { Spinner } from "@/components/custom-ui/Spinner";
import { DoctorSupportDetailPage } from "./DoctorSupportDetailPage";
import { PrescriptionSessionModal } from "@/components/modals/PrescriptionSessionModal";
import { PATHS } from "@/config/paths";
import { useMyConsultationSessions } from "@/hooks/data/useSessionHooks";
import { formatDate } from "@/common/format";
import type { SessionData } from "@/apis/session.service";

function shortId(value: string, length = 8) {
  return value.replace(/-/g, "").toUpperCase().slice(0, length);
}

function getSessionStatusLabel(status: string) {
  switch (status) {
    case "InProgress":
      return "Đang tư vấn";
    case "Ended":
      return "Hoàn thành";
    case "Processing":
      return "Đang xử lý";
    default:
      return status || "Chưa xác định";
  }
}

export default function PrescriptionInProgressPage() {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(
    null,
  );
  const { data, isLoading, isError, refetch } = useMyConsultationSessions();

  const sessions = useMemo(
    () =>
      [...(data || [])]
        .filter((session) => session.status === "InProgress")
        .sort((a, b) => {
          const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
          const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
          return bTime - aTime;
        }),
    [data],
  );

  function handleOpenSessionModal(session: SessionData) {
    setSelectedSession(session);
  }

  return (
    <div className="page-layout">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4">
          <Breadcrumb
            items={[
              { label: "Dashboard", path: "/dashboard" },
              {
                label: "Phiên tư vấn và Đơn thuốc",
                path: PATHS.DASHBOARD.PRESCRIPTIONS.ROOT,
              },
              { label: "Đang khám" },
            ]}
          />

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Đang khám
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
                Danh sách các phiên tư vấn đang diễn ra.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SessionGridSkeleton />
        ) : isError ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đã có lỗi xảy ra
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              Không thể tải danh sách phiên đang khám.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 rounded-lg bg-red-500 px-6 py-2.5 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-red-600"
            >
              Thử lại
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Danh sách trống
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              Hiện tại chưa có phiên tư vấn nào đang diễn ra.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {sessions.map((session) => {
              const isNow = session.status === "InProgress";

              return (
                <div
                  key={session.consultanSessionId}
                  className="group relative flex flex-col gap-4 rounded-2xl border border-gray-400 bg-white p-5 transition-all hover:border-gray-500 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                          isNow
                            ? "bg-primary text-white"
                            : "bg-linear-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400"
                        }`}
                      >
                        {isNow && (
                          <div className="bg-primary/30 absolute h-10 w-10 animate-ping rounded-full" />
                        )}
                        {(session.memberName || "?").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {session.memberName ||
                            `Bệnh nhân ${shortId(session.memberId)}`}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          PT #{shortId(session.memberId)} • AP #
                          {shortId(session.appointmentId)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      type="warning"
                      value={getSessionStatusLabel(session.status)}
                    />
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-white/5" />

                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 text-[11px] text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar className="h-4 w-4 text-gray-400" />
                        <span>
                          {session.startedAt
                            ? formatDate(session.startedAt)
                            : "--"}{" "}
                          -{" "}
                          {session.endedAt ? formatDate(session.endedAt) : "--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiOutlineClipboardCheck className="h-4 w-4 text-gray-400" />
                        <span className="truncate">
                          Session: {shortId(session.consultanSessionId, 12)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                      <Tooltip content="Chi tiết lịch hẹn">
                        <IconAction
                          icon={<HiOutlineEye />}
                          onClick={() =>
                            setSelectedAppointmentId(session.appointmentId)
                          }
                        />
                      </Tooltip>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenSessionModal(session)}
                      className="bg-primary rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(var(--primary),0.3)] transition hover:brightness-110 active:scale-95"
                    >
                      Mở đơn thuốc
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DoctorSupportDetailPage
          open={!!selectedAppointmentId}
          appointmentId={selectedAppointmentId}
          onClose={() => setSelectedAppointmentId(null)}
        />

        <PrescriptionSessionModal
          open={!!selectedSession}
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onSessionUpdated={() => {
            void refetch();
          }}
        />
      </motion.div>
    </div>
  );
}

function SessionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex h-56 animate-pulse flex-col rounded-2xl border border-gray-400 bg-white/50 p-5 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
          <div className="mt-4 h-px bg-gray-100 dark:bg-white/5" />
          <div className="mt-4 flex-1 space-y-3">
            <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-7 w-24 rounded-lg bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
