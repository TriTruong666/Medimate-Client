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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
        <div
           className="absolute inset-0"
           onClick={() => !isSubmitting && onClose()}
        />
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.95 }}
           className="z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white transition-all duration-300 shadow-2xl dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 shadow-sm dark:border-white/10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Chi tiết hồ sơ Bác sĩ</h2>
            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white transition" disabled={isSubmitting}>
              <HiOutlineX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid gap-6 md:grid-cols-2 text-sm text-gray-600 dark:text-gray-300">
               {/* Left Col */}
               <div className="space-y-4">
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 space-y-3 dark:border-transparent dark:bg-white/5">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Thông tin cá nhân</p>
                     <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-white/5">
                       <span className="text-gray-500">Họ và tên:</span>
                       <span className="font-bold text-gray-900 dark:text-white">{account.fullName || "Chưa cập nhật"}</span>
                     </div>
                     <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-white/5">
                       <span className="text-gray-500">Chuyên khoa:</span>
                       <span className="font-bold text-gray-900 dark:text-white">{account.specialty || "Chưa cập nhật"}</span>
                     </div>
                     <div className="flex justify-between border-b border-gray-200 pb-2 dark:border-white/5">
                       <span className="text-gray-500">Kinh nghiệm:</span>
                       <span className="font-bold text-gray-900 dark:text-white">{account.yearsOfExperience} năm</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Đơn vị công tác:</span>
                       <span className="font-bold text-gray-900 dark:text-white">{account.currentHospitalName || "Chưa cập nhật"}</span>
                     </div>
                  </div>
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 space-y-3 dark:border-transparent dark:bg-white/5">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Giới thiệu (Bio)</p>
                     <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">{account.bio || "Không có giới thiệu"}</p>
                  </div>
               </div>

               {/* Right Col */}
               <div className="space-y-4">
                  <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 space-y-3 dark:border-transparent dark:bg-white/5">
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">Chứng chỉ hành nghề</p>
                     <div className="flex justify-between">
                       <span className="text-gray-500">Mã CCHN:</span>
                       <span className="font-bold text-gray-900 dark:text-white">{account.licenseNumber || "Chưa có"}</span>
                     </div>
                     {account.licenseImage ? (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {account.licenseImage.split(/[\n,;]+/).map((url, i) => {
                            if (!url.trim()) return null;
                            const isPdf = url.toLowerCase().includes('.pdf');
                            return (
                                <a key={i} href={url.trim()} target="_blank" rel="noreferrer" className="block relative aspect-square overflow-hidden rounded-xl border border-gray-300 group bg-gray-100 dark:border-white/10 dark:bg-black">
                                {isPdf ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white group-hover:bg-gray-50 transition dark:bg-white/5 dark:group-hover:bg-white/10">
                                        <span className="text-2xl mb-1">📄</span>
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">Xem PDF</span>
                                    </div>
                                ) : (
                                    <>
                                        <img src={url.trim()} className="object-cover w-full h-full group-hover:scale-110 transition" alt="License" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition dark:bg-black/50">
                                            <span className="text-xs font-bold text-white mt-1">Xem ảnh đầy đủ</span>
                                        </div>
                                    </>
                                )}
                                </a>
                            );
                          })}
                        </div>
                     ) : (
                        <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-gray-400 bg-white text-gray-500 dark:border-white/10 dark:bg-white/5">Không có hình ảnh</div>
                     )}
                  </div>
               </div>
            </div>

            {/* Note if rejected */}
            {account.status === "Rejected" && account.rejectionReason && (
               <div className="mt-6 rounded-lg border border-red-500/20 bg-red-50 p-4 text-red-600 dark:bg-red-500/10 dark:text-red-200">
                 <p className="font-bold mb-1">Lý do từ chối trước đó:</p>
                 <p className="text-sm">{account.rejectionReason}</p>
               </div>
            )}

            {/* Reject prompt */}
            {showRejectInput && (account.status === "Pending") && (
              <div className="mt-6 rounded-lg border border-red-500/20 bg-red-50 p-4 dark:bg-red-500/5">
                <label className="mb-2 block text-sm font-bold text-red-600 dark:text-red-200">
                  Lý do từ chối duyệt:
                </label>
                <textarea
                  autoFocus
                  className="w-full rounded-xl border border-red-500/30 bg-white p-3 text-sm text-gray-900 placeholder-red-300 transition-all focus:border-red-500 focus:outline-none dark:bg-black/50 dark:text-white dark:placeholder-red-500/50"
                  rows={3}
                  placeholder="Ví dụ: CCHN không khớp tên..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 md:flex-row dark:border-white/10">
            <button
              onClick={() => {
                if (showRejectInput) setShowRejectInput(false);
                else onClose();
              }}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
            >
              Đóng
            </button>
            {(account.status === "Pending") && (
              <>
                {showRejectInput ? (
                  <button
                    onClick={() => onReject(account.doctorId, rejectReason)}
                    disabled={isSubmitting || !rejectReason.trim()}
                    className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-red-600 disabled:opacity-50 transition active:scale-95"
                  >
                    {isSubmitting ? <Spinner size="sm" color="white" /> : "Xác nhận từ chối"}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-lg border border-gray-400 bg-white px-5 py-2.5 text-sm font-bold text-red-500 shadow-sm hover:bg-red-50 hover:border-red-500/30 transition dark:border-white/10 dark:bg-white/5 dark:text-red-400 dark:hover:bg-white/10 dark:hover:text-red-300"
                  >
                    <HiOutlineXCircle className="h-5 w-5" />
                    Từ chối
                  </button>
                )}
                
                {!showRejectInput && (
                  <button
                    onClick={() => onApprove(account.doctorId)}
                    disabled={isSubmitting}
                    className="flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95"
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
