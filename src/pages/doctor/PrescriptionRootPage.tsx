import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineEye, HiOutlineCalendar, HiOutlineClipboardCheck, HiOutlineInformationCircle } from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import IconAction from "@/components/custom-ui/IconAction";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { DoctorSupportDetailPage } from "./DoctorSupportDetailPage";
import { Spinner } from "@/components/custom-ui/Spinner";
import { useMyConsultationSessions } from "@/hooks/data/useSessionHooks";
import { formatDate } from "@/common/format";
import type { SessionData } from "@/apis/session.service";
import { ConsultationSessionDetailModal } from "@/components/modals/ConsultationSessionDetailModal";
import { PrescriptionSessionModal } from "@/components/modals/PrescriptionSessionModal";
import { PATHS } from "@/config/paths";

export default function PrescriptionRootPage() {
  const [searchParams] = useSearchParams();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(
    null,
  );
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<SessionData | null>(
    null,
  );
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasAutoScrolledRef = useRef(false);
  const { data, isLoading, isError, refetch } = useMyConsultationSessions();
  const highlightedSessionId = searchParams.get("sessionId") || "";

  const sessions = useMemo(
    () =>
      [...(data || [])].sort((a, b) => {
        const aTime = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const bTime = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return bTime - aTime;
      }),
    [data],
  );

  useEffect(() => {
    hasAutoScrolledRef.current = false;
  }, [highlightedSessionId]);

  useEffect(() => {
    if (!highlightedSessionId) return;
    if (hasAutoScrolledRef.current) return;
    if (sessions.length === 0) return;

    const target = cardRefs.current[highlightedSessionId];
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    hasAutoScrolledRef.current = true;
  }, [highlightedSessionId, sessions]);

  function handleOpenSessionModal(session: SessionData) {
    setSelectedSession(session);
  }

  function shortId(value: string, length = 8) {
    return value.replace(/-/g, "").toUpperCase().slice(0, length);
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
            ]}
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Danh sách phiên tư vấn
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              Chọn phiên để xem hoặc kê đơn.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-75 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm text-red-500 dark:text-red-400">
              Không thể tải danh sách phiên tư vấn.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              Thử lại
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex min-h-75 items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
            Chưa có phiên tư vấn nào.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sessions.map((session) => {
              const isHighlighted =
                highlightedSessionId === session.consultanSessionId;

              return (
                <div
                  key={session.consultanSessionId}
                  ref={(node) => {
                    cardRefs.current[session.consultanSessionId] = node;
                  }}
                  className={`flex flex-col gap-4 rounded-2xl border p-5 transition-all hover:shadow-md ${
                    isHighlighted
                      ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 dark:border-red-400/70 dark:bg-red-500/10 dark:ring-red-400/50"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar className="h-5 w-5 text-primary" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {session.memberName ||
                            `Bệnh nhân ${shortId(session.memberId)}`}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          type="info"
                          value={`Session ${shortId(session.consultanSessionId)}`}
                        />
                        <Badge
                          type={
                            session.status === "InProgress" ? "warning" : "success"
                          }
                          value={session.status || "Active"}
                        />
                      </div>
                    </div>

                    <div className="text-right text-xs text-gray-500 dark:text-white/50">
                      <p>PT: {shortId(session.memberId)}</p>
                      <p>AP: {shortId(session.appointmentId)}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 text-xs text-gray-600 dark:text-white/60 md:grid-cols-2">
                    <p>Session: {shortId(session.consultanSessionId, 12)}</p>
                    <p>Appointment: {shortId(session.appointmentId, 12)}</p>
                    <p>
                      Bắt đầu:{" "}
                      {session.startedAt ? formatDate(session.startedAt) : "--"}
                    </p>
                    <p>
                      Kết thúc:{" "}
                      {session.endedAt ? formatDate(session.endedAt) : "--"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Tooltip content="Xem chi tiết session tư vấn">
                      <IconAction
                        icon={<HiOutlineInformationCircle />}
                        onClick={() => setSelectedSessionDetail(session)}
                      />
                    </Tooltip>
                    <Tooltip content="Xem chi tiết appointment">
                      <IconAction
                        icon={<HiOutlineEye />}
                        onClick={() =>
                          setSelectedAppointmentId(session.appointmentId)
                        }
                      />
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => handleOpenSessionModal(session)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 active:scale-95"
                    >
                      Mở đơn thuốc
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
          <div className="mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
            <HiOutlineClipboardCheck className="h-5 w-5 text-primary" />
            Ghi chú
          </div>
          <p>Chỉ phiên đang diễn ra mới được tạo đơn.</p>
        </div>

        <DoctorSupportDetailPage
          open={!!selectedAppointmentId}
          appointmentId={selectedAppointmentId}
          onClose={() => setSelectedAppointmentId(null)}
        />

        <ConsultationSessionDetailModal
          open={!!selectedSessionDetail}
          session={selectedSessionDetail}
          onClose={() => setSelectedSessionDetail(null)}
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
