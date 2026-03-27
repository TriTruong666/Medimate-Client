import type { DoctorAccount } from "@/apis/management.service";
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/custom-ui/Spinner";

export type AccountDetailReviewModalProps = {
  account: DoctorAccount | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isSubmitting: boolean;
};

export function AccountDetailReviewModal({
  account,
  onClose,
  onApprove,
  onReject,
  isSubmitting,
}: AccountDetailReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!account) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div
           className="absolute inset-0"
           onClick={() => !isSubmitting && onClose()}
        />
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white">Chi tiết hồ sơ Bác sĩ</h2>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white" disabled={isSubmitting}>
              <HiOutlineX className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-2 text-sm text-gray-300">
               {/* Left Col */}
               <div className="space-y-4">
                  <div className="rounded-lg bg-white/5 p-4 space-y-3">
                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Thông tin cá nhân</p>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Họ và tên:</span>
                       <span className="font-medium text-white">{account.fullName || "Chưa cập nhật"}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Chuyên khoa:</span>
                       <span className="font-medium text-white">{account.specialty || "Chưa cập nhật"}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Kinh nghiệm:</span>
                       <span className="font-medium text-white">{account.yearsOfExperience} năm</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Đơn vị công tác:</span>
                       <span className="font-medium text-white">{account.currentHospitalName || "Chưa cập nhật"}</span>
                     </div>
                  </div>
                  <div className="rounded-lg bg-white/5 p-4 space-y-3">
                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Giới thiệu (Bio)</p>
                     <p className="whitespace-pre-wrap">{account.bio || "Không có giới thiệu"}</p>
                  </div>
               </div>

               {/* Right Col */}
               <div className="space-y-4">
                  <div className="rounded-lg bg-white/5 p-4 space-y-3">
                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chứng chỉ hành nghề</p>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Mã CCHN:</span>
                       <span className="font-medium text-white">{account.licenseNumber || "Chưa có"}</span>
                     </div>
                     {account.licenseImage ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {account.licenseImage.split(/[\n,;]+/).map((url, i) => {
                            if (!url.trim()) return null;
                            const isPdf = url.toLowerCase().includes('.pdf');
                            return (
                                <a key={i} href={url.trim()} target="_blank" rel="noreferrer" className="block relative aspect-square overflow-hidden rounded border border-white/10 group bg-black">
                                {isPdf ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 transition">
                                        <span className="text-2xl mb-1">📄</span>
                                        <span className="text-xs text-white">Xem PDF</span>
                                    </div>
                                ) : (
                                    <>
                                        <img src={url.trim()} className="object-cover w-full h-full group-hover:scale-110 transition" alt="License" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition">
                                            <span className="text-xs text-white mt-1">Xem ảnh đầy đủ</span>
                                        </div>
                                    </>
                                )}
                                </a>
                            );
                          })}
                        </div>
                     ) : (
                        <div className="h-32 flex items-center justify-center rounded border border-dashed border-white/10 bg-white/5 text-gray-500">Không có hình ảnh</div>
                     )}
                  </div>
               </div>
            </div>

            {/* Note if rejected */}
            {account.status === "Rejected" && account.rejectionReason && (
               <div className="mt-6 rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-red-200">
                 <p className="font-semibold mb-1">Lý do từ chối trước đó:</p>
                 <p className="text-sm">{account.rejectionReason}</p>
               </div>
            )}

            {/* Reject prompt */}
            {showRejectInput && (account.status === "Pending") && (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <label className="mb-2 block text-sm font-medium text-red-200">
                  Lý do từ chối duyệt:
                </label>
                <textarea
                  autoFocus
                  className="w-full rounded-lg border border-red-500/30 bg-black/50 p-3 text-sm text-white placeholder-red-500/50 backdrop-blur-sm focus:border-red-500 focus:outline-none"
                  rows={3}
                  placeholder="Ví dụ: CCHN không khớp tên..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-white/10 bg-white/5 p-4 md:flex-row md:p-6">
            <button
              onClick={() => {
                if (showRejectInput) setShowRejectInput(false);
                else onClose();
              }}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition"
            >
              Đóng
            </button>
            {(account.status === "Pending") && (
              <>
                {showRejectInput ? (
                  <button
                    onClick={() => onReject(account.doctorId, rejectReason)}
                    disabled={isSubmitting || !rejectReason.trim()}
                    className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? <Spinner size="sm" color="white" /> : "Xác nhận từ chối"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-white/10 hover:text-red-300 transition"
                  >
                    <HiOutlineXCircle className="h-5 w-5" />
                    Từ chối
                  </button>
                )}
                
                {!showRejectInput && (
                  <button
                    onClick={() => onApprove(account.doctorId)}
                    disabled={isSubmitting}
                    className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50 transition"
                  >
                    {isSubmitting ? <Spinner size="sm" color="white" /> : <><HiOutlineCheckCircle className="h-5 w-5" /> Duyệt thông tin</>}
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
