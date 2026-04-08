import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HiOutlineEye, HiOutlinePencil, HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { Badge } from "@/components/custom-ui/Badge";
import IconAction from "@/components/custom-ui/IconAction";
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
  const canCreate = session?.status === "InProgress";

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

  function openEdit(item: PrescriptionByDoctorDto) {
    setEditingPrescription(item);
    setIsCreateOpen(true);
  }

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
            className="z-10 flex h-[90vh] max-h-215 min-h-0 w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 md:px-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Đơn thuốc theo session</h2>
                <p className="mt-1 text-xs text-gray-400">
                  {session.memberName || `Bệnh nhân ${shortId(session.memberId)}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <MetaCard label="Session" value={shortId(sessionId, 12)} />
                <MetaCard label="Appointment" value={shortId(session.appointmentId, 12)} />
                <MetaCard label="Trạng thái" value={session.status || "N/A"} />
                <MetaCard label="Bắt đầu" value={session.startedAt ? formatDate(session.startedAt) : "--"} />
              </div>

              <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Danh sách đơn thuốc</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Chỉ session đang <span className="text-white">InProgress</span> mới được tạo đơn mới.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreate}
                  disabled={!canCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:bg-white/10 disabled:text-white/40"
                >
                  <HiOutlinePlus className="h-5 w-5" />
                  Tạo đơn
                </button>
              </div>

              {isLoading ? (
                <div className="flex min-h-100 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Spinner size="lg" />
                </div>
              ) : isError ? (
                <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm text-red-400">
                    {error?.message || "Không thể tải danh sách đơn thuốc."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
                  >
                    Thử lại
                  </button>
                </div>
              ) : list.length === 0 ? (
                <div className="flex min-h-100 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
                  Chưa có đơn thuốc cho session này.
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {list.map((item) => {
                    const prescriptionId = getPrescriptionId(item);

                    return (
                    <div
                      key={prescriptionId || `${item.memberId}-${item.createdDate}`}
                      className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {item.memberName || item.memberId}
                          </p>
                          <p className="mt-1 text-xs text-white/60">{item.diagnosis}</p>
                          <p className="mt-1 text-xs text-white/50">
                            {formatDate(item.createdDate)}
                          </p>
                        </div>
                        <Badge type="info" value={item.status || "Active"} />
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/60">
                          {item.medicines.length} thuốc
                        </p>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Xem chi tiết đơn">
                            <IconAction
                              icon={<HiOutlineEye />}
                              disabled={!prescriptionId}
                              onClick={() => {
                                if (!prescriptionId) return;
                                setSelectedPrescriptionId(prescriptionId);
                              }}
                            />
                          </Tooltip>
                          <Tooltip content="Sửa đơn">
                            <IconAction
                              icon={<HiOutlinePencil />}
                              onClick={() => openEdit(item)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
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

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
