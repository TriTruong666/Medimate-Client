import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineX } from "react-icons/hi";
import type { SessionData } from "@/apis/session.service";
import { formatDateTime } from "@/common/format";
import { Badge } from "@/components/custom-ui/Badge";

type Props = {
  open: boolean;
  session: SessionData | null;
  onClose: () => void;
};

function toDisplayDate(value?: string | null) {
  return value ? formatDateTime(value) : "--";
}

function toJoinedText(value?: boolean) {
  return value ? "Đã tham gia" : "Chưa tham gia";
}

function toSessionStatusText(status?: string | null) {
  switch (status) {
    case "InProgress":
      return "Đang diễn ra";
    case "Ended":
      return "Đã kết thúc";
    case "Cancelled":
      return "Đã hủy";
    default:
      return status || "--";
  }
}

function toSessionBadgeType(status?: string | null): "error" | "success" | "info" | "warning" {
  switch (status) {
    case "InProgress":
      return "warning";
    case "Ended":
      return "success";
    case "Cancelled":
      return "error";
    default:
      return "info";
  }
}

function toDurationText(startedAt?: string | null, endedAt?: string | null) {
  if (!startedAt || !endedAt) return "--";

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "--";

  const totalMinutes = Math.floor((end - start) / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes} phút`;
  if (minutes <= 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}

export function ConsultationSessionDetailModal({ open, session, onClose }: Props) {
  const sessionStatus = toSessionStatusText(session?.status);
  const durationText = toDurationText(session?.startedAt, session?.endedAt);
  const sessionStatusType = toSessionBadgeType(session?.status);

  return (
    <AnimatePresence>
      {open && session && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(event) => event.stopPropagation()}
            className="z-10 w-full max-w-4xl rounded-2xl border border-gray-400 bg-white transition-all duration-300 shadow-2xl dark:border-white/10 dark:bg-neutral-900/95"
          >
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-4 md:px-6 dark:border-white/10">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết session tư vấn</h2>
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{session.memberName || "Bệnh nhân"}</p>
              </div>
              <div className="ml-3 flex items-center gap-2">
                <Badge value={sessionStatus} type={sessionStatusType} />
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-4 md:p-6">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <MetaCard label="Tên bệnh nhân" value={session.memberName || "--"} />
                <MetaCard label="Thời lượng tư vấn" value={durationText} />
                <MetaCard label="Thời điểm bắt đầu" value={toDisplayDate(session.startedAt)} />
                <MetaCard label="Thời điểm kết thúc" value={toDisplayDate(session.endedAt)} />
                <MetaCard
                  label="Thông tin người giám hộ"
                  value={session.guardianUserId ? "Có liên kết người giám hộ" : "Không có người giám hộ"}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <JoinStatusCard role="Bệnh nhân" joined={session.userJoined} />
                <JoinStatusCard role="Bác sĩ" joined={session.doctorJoined} />
                <JoinStatusCard role="Người giám hộ" joined={session.guardianJoined} />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">Ghi chú hệ thống</p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-white/85">{session.note || "--"}</p>
                </div>
                <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">Ghi chú bác sĩ</p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-white/85">{session.doctorNote || "--"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MetaCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-gray-900 tabular-nums dark:text-white/90">
        {value}
      </p>
    </div>
  );
}

function JoinStatusCard({
  role,
  joined,
}: {
  role: string;
  joined?: boolean;
}) {
  const active = !!joined;

  return (
    <div className="rounded-2xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
      <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">Trạng thái tham gia</p>
      <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white/90">{role}</p>
      <p className={`mt-1 text-xs font-bold ${active ? "text-emerald-600 dark:text-emerald-300" : "text-gray-400 dark:text-white/55"}`}>
        {toJoinedText(active)}
      </p>
    </div>
  );
}
