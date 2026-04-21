import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineInformationCircle,
} from "react-icons/hi";
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
  const [selectedSessionDetail, setSelectedSessionDetail] =
    useState<SessionData | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const hasAutoScrolledRef = useRef(false);
  const { data, isLoading, isError, refetch } = useMyConsultationSessions();
  const highlightedSessionId = searchParams.get("sessionId") || "";

  // Tick mỗi 60 giây để re-evaluate trạng thái chat window
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
              Danh sách phiên tư vấn
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-75 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-red-400">
              Không thể tải danh sách phiên tư vấn.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
            >
              Thử lại
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex min-h-75 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            Chưa có phiên tư vấn nào.
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sessions.map((session) => {
              const isHighlighted = highlightedSessionId === session.consultanSessionId;
              const isNow = session.status === "InProgress";

              // Chat window = startedAt + 125 phút (backend: session 60p + chat dư 60p + 5p buffer)
              const chatEndAt = session.startedAt
                ? new Date(new Date(session.startedAt).getTime() + 125 * 60 * 1000)
                : null;
              const isChatExpired = chatEndAt ? now > chatEndAt : false;

              return (
                <div
                  key={session.consultanSessionId}
                  ref={(node) => {
                    cardRefs.current[session.consultanSessionId] = node;
                  }}
                  className={`group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all hover:shadow-lg ${isHighlighted
                    ? "border-primary/50 bg-primary/5 ring-primary/20 ring-1 dark:border-red-400/70 dark:bg-red-500/10 dark:ring-red-400/50"
                    : "border-gray-400 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${isNow
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
                      type={
                        isNow
                          ? "warning"
                          : session.status === "Ended"
                            ? "success"
                            : "info"
                      }
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

                  <div className="grid gap-2 text-xs text-white/60 md:grid-cols-2">
                    <p>Session: {shortId(session.consultanSessionId, 12)}</p>
                    <p>Lịch hẹn: {session.appointmentTime || "--"}</p>
                    <p>
                      Bắt đầu:{" "}
                      {session.startedAt ? formatDate(session.startedAt) : "--"}
                    </p>
                    <p>
                      Kết thúc:{" "}
                      {chatEndAt ? formatDate(chatEndAt.toISOString()) : "--"}
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

                    {isChatExpired ? (
                      // Phiên chat đã hết hạn — không cho tạo đơn thuốc
                      <button
                        type="button"
                        onClick={() => handleOpenSessionModal(session)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                      >
                        Xem
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSessionModal(session)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                      >
                        Tạo đơn thuốc
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
          <div className="mb-2 flex items-center gap-2 text-white">
            <HiOutlineClipboardCheck className="h-5 w-5 text-red-400" />
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

function SessionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
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
