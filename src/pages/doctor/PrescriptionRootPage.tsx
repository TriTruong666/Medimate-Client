import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineEye,
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlinePlus,
} from "react-icons/hi";
import { useSearchParams } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { DoctorSupportDetailModal } from "@/components/modals/DoctorSupportDetailModal";
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
              Phiên tư vấn & Đơn thuốc
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Quản lý các phiên hội thoại và kê đơn thuốc cho bệnh nhân.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-white/50">
              Đang tải danh sách phiên tư vấn...
            </p>
          </div>
        ) : isError ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đã xảy ra lỗi
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              Không thể tải danh sách phiên tư vấn.
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
              Chưa có phiên tư vấn nào được ghi nhận.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sessions.map((session) => {
              const isHighlighted =
                highlightedSessionId === session.consultanSessionId;
              const isNow = session.status === "InProgress";

              // Chat window = startedAt + 125 phút (backend: session 60p + chat dư 60p + 5p buffer)
              const chatEndAt = session.startedAt
                ? new Date(
                    new Date(session.startedAt).getTime() + 125 * 60 * 1000,
                  )
                : null;
              const isChatExpired = chatEndAt ? now > chatEndAt : false;

              return (
                <div
                  key={session.consultanSessionId}
                  ref={(node) => {
                    cardRefs.current[session.consultanSessionId] = node;
                  }}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all hover:shadow-xl ${
                    isHighlighted
                      ? "border-primary/50 bg-primary/5 ring-primary/20 dark:border-primary-400/70 dark:bg-primary-500/10 dark:ring-primary-400/50 ring-1"
                      : "border-gray-400 bg-white hover:border-gray-400 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 p-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isNow
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                        }`}
                      >
                        {isNow && (
                          <div className="bg-primary/30 absolute h-10 w-10 animate-ping rounded-full" />
                        )}
                        {(session.memberName || "?").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-gray-900 dark:text-white">
                          {session.memberName ||
                            `Bệnh nhân ${shortId(session.memberId)}`}
                        </h4>
                        <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                          Patient #{shortId(session.memberId, 6)}
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

                  <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-white/5">
                    <div className="bg-white p-4 dark:bg-transparent">
                      <div className="flex items-center gap-2">
                        <HiOutlineCalendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                          Ngày bắt đầu
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-gray-900 dark:text-white">
                        {session.startedAt
                          ? formatDate(session.startedAt)
                          : "--"}
                      </p>
                    </div>
                    <div className="bg-white p-4 dark:bg-transparent">
                      <div className="flex items-center gap-2">
                        <HiOutlineClock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                          Thời gian kết thúc
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-gray-900 dark:text-white">
                        {chatEndAt ? formatDate(chatEndAt.toISOString()) : "--"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-400 bg-gray-50/50 p-3 px-5 dark:border-white/5 dark:bg-black/20">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedSessionDetail(session)}
                        className="rounded-lg p-2 text-gray-400 shadow-xs transition hover:bg-white hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                        title="Chi tiết session"
                      >
                        <HiOutlineInformationCircle className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() =>
                          setSelectedAppointmentId(session.appointmentId)
                        }
                        className="rounded-lg p-2 text-gray-400 shadow-xs transition hover:bg-white hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                        title="Chi tiết lịch hẹn"
                      >
                        <HiOutlineEye className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenSessionModal(session)}
                      className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${
                        isChatExpired
                          ? "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400"
                          : "bg-gray-900 text-white shadow dark:bg-white dark:text-black"
                      }`}
                    >
                      {!isChatExpired && (
                        <HiOutlinePlus className="h-3.5 w-3.5" />
                      )}
                      {isChatExpired ? "Xem phiên tư vấn" : "Kê đơn thuốc"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-4 rounded-2xl border border-gray-400 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <HiOutlineClipboardCheck className="h-5 w-5" />
          </div>
          <div className="text-xs">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Ghi chú quan trọng
            </p>
            <p className="mt-0.5 text-gray-500">
              Chỉ các phiên tư vấn đang diễn ra hoặc chưa hết hạn mới có thể kê
              đơn thuốc mới.
            </p>
          </div>
        </div>

        <DoctorSupportDetailModal
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
