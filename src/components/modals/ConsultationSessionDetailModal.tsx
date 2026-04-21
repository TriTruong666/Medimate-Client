import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineX, HiOutlineClock, HiOutlineCalendar, HiOutlineClipboardList } from "react-icons/hi";
import { FiUsers } from "react-icons/fi";
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
  if (!session) return null;

  const sessionStatus = toSessionStatusText(session.status);
  const durationText = toDurationText(session.startedAt, session.endedAt);
  const sessionStatusType = toSessionBadgeType(session.status);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(event) => event.stopPropagation()}
            className="z-10 w-full max-w-3xl flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/90 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chi tiết phiên tư vấn</h2>
                <p className="mt-0.5 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                  {session.memberName || "Bệnh nhân chưa xác định"}
                </p>
              </div>
              <div className="ml-3 flex items-center gap-3">
                <Badge value={sessionStatus} type={sessionStatusType} />
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                {/* Thông tin thời gian và tổng quan */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-white/5 dark:bg-black/20">
                    <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Tổng quan phiên tư vấn
                    </p>
                  </div>
                  <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoItem 
                      icon={HiOutlineCalendar} 
                      label="Bắt đầu" 
                      value={toDisplayDate(session.startedAt)} 
                    />
                    <InfoItem 
                      icon={HiOutlineClock} 
                      label="Kết thúc" 
                      value={toDisplayDate(session.endedAt)} 
                    />
                    <InfoItem 
                      icon={HiOutlineClock} 
                      label="Thời lượng" 
                      value={durationText} 
                      highlight 
                    />
                    <InfoItem 
                      icon={HiOutlineClipboardList} 
                      label="Giám hộ" 
                      value={session.guardianUserId ? "Có liên kết" : "Không có"} 
                    />
                  </div>
                </section>

                {/* Trạng thái người tham gia */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-white/5 dark:bg-black/20">
                    <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      Người tham gia
                    </p>
                    <FiUsers className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="grid gap-2 p-4 sm:grid-cols-3">
                    <ParticipantItem role="Bệnh nhân" joined={session.userJoined} />
                    <ParticipantItem role="Bác sĩ" joined={session.doctorJoined} />
                    <ParticipantItem role="Người giám hộ" joined={session.guardianJoined} />
                  </div>
                </section>

                {/* Ghi chú */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="bg-gray-50/50 px-5 py-3 dark:bg-black/20">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Ghi chú hệ thống</p>
                    </div>
                    <div className="p-5 min-h-[100px]">
                      <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                        {session.note || "Không có ghi chú hệ thống."}
                      </p>
                    </div>
                  </section>
                  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                    <div className="bg-gray-50/50 px-5 py-3 dark:bg-black/20">
                      <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Ghi chú bác sĩ</p>
                    </div>
                    <div className="p-5 min-h-[100px]">
                      <p className="text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                        {session.doctorNote || "Bác sĩ chưa để lại ghi chú."}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-400 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
              <button
                onClick={onClose}
                className="rounded-lg px-6 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoItem({ icon: Icon, label, value, highlight }: { 
  icon: any; 
  label: string; 
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className={`text-sm font-semibold ${highlight ? 'text-primary dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function ParticipantItem({ role, joined }: { role: string; joined?: boolean }) {
  const isJoined = !!joined;
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
      isJoined 
        ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-900/10' 
        : 'border-gray-100 bg-gray-50/30 dark:border-white/5 dark:bg-white/5'
    }`}>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">{role}</p>
        <p className={`mt-0.5 truncate text-sm font-semibold ${isJoined ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {isJoined ? 'Đã tham gia' : 'Vắng mặt'}
        </p>
      </div>
      <div className={`h-2 w-2 rounded-full ${isJoined ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300 dark:bg-gray-700'}`} />
    </div>
  );
}
