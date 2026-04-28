import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HiOutlineEye, HiOutlinePlus, HiOutlineX, HiOutlineInformationCircle } from "react-icons/hi";
import { FiFileText, FiCalendar, FiActivity } from "react-icons/fi";
import { Badge } from "@/components/custom-ui/Badge";
import { Spinner } from "@/components/custom-ui/Spinner";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import { PrescriptionModal } from "@/components/modals/PrescriptionModal";
import { PrescriptionDetailModal } from "@/components/modals/PrescriptionDetailModal";
import { usePrescriptionsBySession } from "@/hooks/data/usePrescriptionHooks";
import type { PrescriptionByDoctorDto } from "@/types/Prescription";
import type { SessionData } from "@/apis/session.service";
import { formatDate } from "@/common/format";

type Props = {
  open: boolean;
  session: SessionData | null;
  onClose: () => void;
  onSessionUpdated?: () => void;
};

function shortId(value: string, length = 8) {
  return value.replace(/-/g, "").toUpperCase().slice(0, length);
}

function getPrescriptionId(item: PrescriptionByDoctorDto) {
  return item.id || item.prescriptionId || item.doctorPrescriptionId || "";
}

export function PrescriptionSessionModal({
  open,
  session,
  onClose,
  onSessionUpdated,
}: Props) {
  const sessionId = session?.consultanSessionId || "";
  const memberId = session?.memberId || "";
  const canCreate = session?.status === "InProgress" || session?.status === "Processing";

  const { data, isLoading, isError, error, refetch } = usePrescriptionsBySession(sessionId);
  const list = useMemo(() => data || [], [data]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionByDoctorDto | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  function closeCreateModal() {
    setIsCreateOpen(false);
    setEditingPrescription(null);
  }

  function openCreate() {
    if (!canCreate) return;
    setEditingPrescription(null);
    setIsCreateOpen(true);
  }

  return (
    <AnimatePresence>
      {open && session && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(event) => event.stopPropagation()}
            className="z-10 flex h-[90vh] max-h-[820px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/90 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/50 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Đơn thuốc phiên tư vấn</h2>
                <p className="mt-0.5 truncate text-xs font-medium text-gray-500 dark:text-gray-400">
                  Bệnh nhân: {session.memberName || "Chưa xác định"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
              <div className="space-y-6">
                {/* Tổng quan session */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 dark:divide-white/5 dark:border-white/5 sm:grid-cols-4">
                    <SummaryItem icon={FiFileText} label="Session ID" value={shortId(sessionId, 10)} />
                    <SummaryItem icon={FiFileText} label="Appointment" value={shortId(session.appointmentId, 10)} />
                    <SummaryItem icon={FiActivity} label="Trạng thái" value={session.status || "--"} />
                    <SummaryItem icon={FiCalendar} label="Bắt đầu" value={session.startedAt ? formatDate(session.startedAt) : "--"} />
                  </div>
                </section>

                {/* Danh sách tiêu đề & Nút tạo */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5">
                      <FiFileText className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Danh sách đơn thuốc</h3>
                      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                        {list.length} đơn thuốc đã được tạo trong phiên này
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openCreate}
                    disabled={!canCreate}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:-translate-y-0.5 hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 dark:bg-white dark:text-gray-900 dark:disabled:bg-white/5 dark:disabled:text-white/20"
                  >
                    <HiOutlinePlus className="h-4 w-4" />
                    Tạo đơn mới
                  </button>
                </div>

                {!canCreate && (
                  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
                    <HiOutlineInformationCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                      Chỉ có thể tạo đơn thuốc khi phiên tư vấn đang ở trạng thái <span className="font-bold underline">InProgress</span> hoặc <span className="font-bold underline">Processing</span>.
                    </p>
                  </div>
                )}

                {/* List đơn thuốc */}
                {isLoading ? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/30 dark:border-white/5 dark:bg-white/5">
                    <Spinner size="lg" />
                  </div>
                ) : isError ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/30 p-8 text-center dark:border-red-900/20 dark:bg-red-900/5">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                      {error?.message || "Không thể tải danh sách đơn thuốc."}
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetch()}
                      className="mt-4 text-xs font-bold text-red-700 underline dark:text-red-300"
                    >
                      Thử lại ngay
                    </button>
                  </div>
                ) : list.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/30 p-8 text-center dark:border-white/10 dark:bg-white/5">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                      <FiFileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Chưa có đơn thuốc nào
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Nhấn vào nút "Tạo đơn mới" để bắt đầu kê đơn cho bệnh nhân.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {list.map((item) => {
                      const prescriptionId = getPrescriptionId(item);

                      return (
                        <div
                          key={prescriptionId || `${item.memberId}-${item.createdDate}`}
                          className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-gray-400 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/30 p-4 dark:border-white/5 dark:bg-black/20">
                            <div className="flex items-center gap-2">
                              <FiFileText className="h-4 w-4 text-primary" />
                              <span className="text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
                                Đơn thuốc #{shortId(prescriptionId, 6)}
                              </span>
                            </div>
                            {item.status === "Completed" || item.isLocked ? (
                              <Badge type="success" value="Đã gửi 🔒" />
                            ) : item.status === "Cancelled" ? (
                              <Badge type="error" value="Đã hủy" />
                            ) : (
                              <Badge type="warning" value="Đang soạn" />
                            )}
                          </div>

                          <div className="flex-1 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {item.diagnosis || "Chưa có chẩn đoán"}
                            </h4>
                            <div className="mt-2 flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <FiCalendar className="h-3 w-3" />
                                {formatDate(item.createdDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiFileText className="h-3 w-3" />
                                {item.medicines.length} loại thuốc
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50/30 p-3 dark:border-white/5 dark:bg-black/20">
                            <Tooltip content="Xem chi tiết đơn">
                              <button
                                onClick={() => {
                                  if (!prescriptionId) return;
                                  setSelectedPrescriptionId(prescriptionId);
                                }}
                                disabled={!prescriptionId}
                                className="flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                              >
                                <HiOutlineEye className="h-4 w-4" />
                                Xem đơn thuốc
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

          <PrescriptionModal
            open={isCreateOpen}
            sessionId={sessionId}
            memberId={editingPrescription?.memberId || memberId}
            editingPrescription={editingPrescription}
            onClose={closeCreateModal}
            onSubmitted={(result) => {
              void refetch();
              onSessionUpdated?.();
              const createdId = result.prescription
                ? getPrescriptionId(result.prescription)
                : "";
              if (result.mode === "create" && result.openDetailAfterCreate && createdId) {
                setSelectedPrescriptionId(createdId);
              }
            }}
          />

          <PrescriptionDetailModal
            open={!!selectedPrescriptionId}
            prescriptionId={selectedPrescriptionId}
            onClose={() => setSelectedPrescriptionId(null)}
            onUpdated={() => void refetch()}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 p-4 text-center sm:text-left">
      <div className="flex items-center gap-2 sm:justify-start justify-center">
        <Icon className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
          {label}
        </span>
      </div>
      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}
