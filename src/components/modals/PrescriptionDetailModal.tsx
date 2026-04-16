import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HiOutlinePencil, HiOutlineX } from "react-icons/hi";
import { Badge } from "@/components/custom-ui/Badge";
import { PrescriptionModal } from "@/components/modals/PrescriptionModal";
import { usePrescriptionDetail } from "@/hooks/data/usePrescriptionHooks";
import { formatDate } from "@/common/format";

type Props = {
  open: boolean;
  prescriptionId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export function PrescriptionDetailModal({
  open,
  prescriptionId,
  onClose,
  onUpdated,
}: Props) {
  const { data, isLoading, isError, error, refetch } = usePrescriptionDetail(
    prescriptionId || "",
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(event) => event.stopPropagation()}
            className="z-10 flex h-[90vh] max-h-215 min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white transition-all duration-300 shadow-2xl dark:border-white/10 dark:bg-neutral-900/90"
          >
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-4 md:px-6 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết đơn thuốc</h2>
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Xem đầy đủ thông tin đơn thuốc đã kê
                </p>
              </div>
              <div className="flex items-center gap-2">
                {data && (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <HiOutlinePencil className="h-4 w-4" />
                      Sửa
                    </span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
              {isLoading ? (
                <DetailSkeleton />
              ) : isError ? (
                <div className="flex min-h-90 flex-col items-center justify-center rounded-2xl border border-gray-400 bg-gray-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Không thể tải chi tiết
                  </h3>
                  <p className="mt-2 max-w-md text-sm font-medium text-gray-500 dark:text-gray-400">
                    {error?.message || "Đã xảy ra lỗi khi tải đơn thuốc."}
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="bg-primary active:scale-95 mt-6 rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
                  >
                    Thử lại
                  </button>
                </div>
              ) : data ? (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-4 lg:col-span-2">
                    <section className="rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Thông tin cơ bản</h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <InfoCard label="Bệnh nhân" value={data.memberName || data.memberId} />
                        <InfoCard label="Bác sĩ" value={data.doctorName || data.doctorId} />
                        <InfoCard label="Session" value={data.consultanSessionId} />
                        <InfoCard label="Ngày tạo" value={formatDate(data.createdDate)} />
                      </div>
                    </section>

                    <section className="rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Chẩn đoán và lời dặn</h3>
                      <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">{data.diagnosis}</p>
                      <p className="mt-2 text-sm font-medium text-gray-600 dark:text-white/70">
                        {data.advice || "Không có lời dặn."}
                      </p>
                    </section>

                    <section className="rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Danh sách thuốc</h3>
                      <div className="mt-4 space-y-3">
                        {data.medicines.map((medicine, index) => (
                          <div key={index} className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {index + 1}. {medicine.medicineName}
                            </p>
                            <p className="mt-1 text-xs font-bold text-gray-500 dark:text-white/70">
                              {medicine.dosage} - {medicine.quantity} {medicine.unit}
                            </p>
                            <p className="mt-1 text-xs font-medium text-gray-600 dark:text-white/70">{medicine.instructions}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-4">
                    <section className="rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Tóm tắt</h4>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-500 dark:text-white/50">Trạng thái</span>
                          <Badge type="info" value={data.status || "Active"} />
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-3">
                          <span className="text-xs font-bold text-gray-500 dark:text-white/50">Số thuốc</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{data.medicines.length}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-3">
                          <span className="text-xs font-bold text-gray-500 dark:text-white/50">Cập nhật</span>
                          <span className="text-xs font-bold text-gray-700 dark:text-white">{formatDate(data.updatedDate)}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          <PrescriptionModal
            open={isEditOpen}
            sessionId={data?.consultanSessionId || ""}
            memberId={data?.memberId || ""}
            editingPrescription={data || null}
            onClose={() => setIsEditOpen(false)}
            onSubmitted={() => {
              void refetch();
              onUpdated?.();
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
        <div className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
        <div className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" />
    </div>
  );
}
