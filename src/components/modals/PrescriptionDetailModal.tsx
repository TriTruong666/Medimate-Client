import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { HiOutlinePencil, HiOutlineX, HiOutlineDownload } from "react-icons/hi";
import { toBlob } from "html-to-image";
import { Badge } from "@/components/custom-ui/Badge";
import { PrescriptionModal } from "@/components/modals/PrescriptionModal";
import { usePrescriptionDetail, useUpdatePrescription } from "@/hooks/data/usePrescriptionHooks";
import { toast } from "@/hooks/useToast";
import { formatDate } from "@/common/format";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

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
  const printRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const updateMutation = useUpdatePrescription();
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  const isLocked = data?.status === "Completed" || data?.status === "Cancelled" || data?.isLocked;

  async function handleCompleteAndSend() {
    if (!prescriptionId || !data) return;
    try {
      const result = await updateMutation.mutateAsync({
        id: prescriptionId,
        body: { status: "Completed" },
      });
      if (result.success) {
        toast.success("Đã gửi đơn thuốc", "Đơn thuốc đã được khóa và gửi vào khung chat cho bệnh nhân.");
        setShowConfirmSend(false);
        refetch();
        onUpdated?.();
      }
    } catch (error) {
      toast.error("Lỗi", "Không thể hoàn tất đơn thuốc lúc này.");
    }
  }

  async function handleDownloadImage() {
    if (!printRef.current) return;
    try {
      setIsCapturing(true);
      const blob = await toBlob(printRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: {
          opacity: "1",      // Override any inline opacity overrides for printing
        }
      });

      if (!blob) {
        throw new Error("Không thể tạo ảnh từ giao diện này.");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DonThuoc_${data?.memberId || "Patient"}_${formatDate(new Date().toISOString()).split(" ")[0].replace(/\//g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error capturing prescription:", err);
    } finally {
      setIsCapturing(false);
    }
  }

  return (
    <>
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
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      disabled={isCapturing}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                    >
                      <HiOutlineDownload className="h-4 w-4" />
                      {isCapturing ? "Đang xử lý..." : "Tải ảnh"}
                    </button>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => setIsEditOpen(true)}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                      >
                        <HiOutlinePencil className="h-4 w-4" />
                        Sửa
                      </button>
                    )}
                  </>
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
                    className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Thử lại
                  </button>
                </div>
              ) : data ? (
                <>
                  <div className="grid gap-4 lg:grid-cols-3 bg-white dark:bg-neutral-900 p-2 rounded-xl">
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

                        {!isLocked && (
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={() => setShowConfirmSend(true)}
                              disabled={updateMutation.isPending}
                              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                            >
                              {updateMutation.isPending ? "Đang xử lý..." : "Hoàn tất & Gửi cho bệnh nhân"}
                            </button>
                            <p className="mt-2 text-center text-[10px] font-medium text-gray-500 dark:text-gray-400">
                              Lưu ý: Sau khi hoàn tất, đơn thuốc sẽ bị khóa và không thể chỉnh sửa.
                            </p>
                          </div>
                        )}
                      </section>
                    </div>
                  </div>

                  {/* VÙNG IN ẨN DÀNH CHO HTML2CANVAS */}
                  <div className="absolute top-0 left-0 pointer-events-none -z-50 opacity-0">
                    <div
                      ref={printRef}
                      className="w-[794px] bg-white text-black"
                      style={{
                        width: 794,
                        padding: "40px 50px",
                        fontFamily: "'Times New Roman', Times, serif"
                      }}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-full border-[3px] border-black flex items-center justify-center font-bold text-[10px] text-center p-1">
                            MEDIMATE<br />CLINIC
                          </div>
                          <div className="text-center font-bold text-[15px] uppercase">
                            <p>HỆ THỐNG MEDIMATE</p>
                            <p>PHÒNG KHÁM ĐA KHOA</p>
                          </div>
                        </div>
                        <div className="text-right text-[15px]">
                          <p>Mã y tế: {data.memberId?.slice(0, 8).toUpperCase()}</p>
                          <p>Số hồ sơ: {data.consultanSessionId?.split("-")[0].toUpperCase()}</p>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-center mb-8">
                        <h1 className="text-[32px] font-bold uppercase tracking-wide">Đơn Thuốc</h1>
                        <p className="text-[16px] font-bold mt-1">(BẢN LƯU / ĐIỆN TỬ)</p>
                      </div>

                      {/* Patient Info */}
                      <div className="text-[16px] leading-[1.8] mb-6">
                        <div className="flex justify-between">
                          <p className="flex-[3]">
                            Họ tên: <span className="font-bold uppercase text-[18px]">{data.memberName || `Bệnh nhân ${data.memberId?.slice(0, 6)}`}</span>
                          </p>
                          <p className="flex-1">Tuổi: <span className="font-bold">--</span></p>
                          <p className="flex-1">Giới tính: <span className="font-bold">--</span></p>
                        </div>
                        <p>Địa chỉ: <span className="font-bold">Thông tin được bảo mật trên Medimate</span></p>
                        <p>Chẩn đoán: <span className="font-bold">{data.diagnosis}</span></p>
                        <p>Bệnh kèm theo: <span className="font-bold">Không</span></p>
                      </div>

                      {/* Table */}
                      <table className="w-full border-collapse border border-black mb-6 text-[15px]">
                        <thead>
                          <tr className="font-bold">
                            <th className="border border-black p-2 w-[10%] text-center">STT</th>
                            <th className="border border-black p-2 w-[60%] text-left">Tên thuốc / Hàm lượng</th>
                            <th className="border border-black p-2 w-[15%] text-center">ĐVT</th>
                            <th className="border border-black p-2 w-[15%] text-center">Số lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.medicines.map((med, index) => (
                            <tr key={index}>
                              <td className="border border-black p-2 text-center align-top font-bold text-[16px]">{index + 1}</td>
                              <td className="border border-black p-2 align-top">
                                <p className="font-bold text-[16px]">
                                  {med.medicineName} {med.dosage ? `(${med.dosage})` : ""}
                                </p>
                                <p className="italic mt-1 text-[15px]">Uống, {med.instructions} -</p>
                              </td>
                              <td className="border border-black p-2 text-center align-top text-[16px]">{med.unit}</td>
                              <td className="border border-black p-2 text-center align-top font-bold text-[16px]">{med.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <p className="text-[16px] font-bold mb-6">Cộng khoản: {data.medicines.length}</p>

                      {/* Footer */}
                      <div className="flex justify-between items-start mt-8">
                        <div className="w-[60%] pr-4">
                          <p className="italic text-[15px]">Bệnh nhân đi khám lần sau xin mang theo đơn này!</p>
                          <p className="text-[18px] mt-2 text-red-600 font-bold italic border-b border-red-200 pb-1 inline-block">
                            Lời dặn của bác sĩ: {data.advice || "Hết thuốc tái khám"}
                          </p>
                        </div>
                        <div className="w-[40%] text-center">
                          <p className="text-[16px] font-bold mb-2 italic">
                            Ngày {new Date().getDate().toString().padStart(2, '0')} tháng {(new Date().getMonth() + 1).toString().padStart(2, '0')} năm {new Date().getFullYear()}
                          </p>
                          <p className="text-[16px] font-bold">Bác sĩ điều trị</p>
                          <div className="h-28 flex items-center justify-center">
                            {/* Dấu phẩy ký mẫu hoặc khoảng trống */}
                          </div>
                          <p className="text-[18px] font-bold text-blue-800 italic">
                            Bs. {data.doctorName || "Medimate"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
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

    <ConfirmModal
      open={showConfirmSend}
      title="Gửi đơn thuốc"
      message={
        <div className="space-y-2">
          <p>Bạn có chắc chắn muốn gửi đơn thuốc này cho bệnh nhân?</p>
          <ul className="list-disc pl-5 text-amber-600 dark:text-amber-400">
            <li>Đơn thuốc sẽ tự động gửi vào khung chat của bệnh nhân.</li>
            <li>Sau khi gửi, đơn thuốc sẽ bị <span className="font-bold underline">khóa và không thể sửa</span>.</li>
          </ul>
        </div>
      }
      confirmText="Gửi đơn thuốc"
      confirmButtonType="success"
      onConfirm={handleCompleteAndSend}
      onCancel={() => setShowConfirmSend(false)}
      isLoading={updateMutation.isPending}
    />
    </>
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
