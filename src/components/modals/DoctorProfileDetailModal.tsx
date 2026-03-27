import type { DoctorAccount } from "@/apis/management.service";
import { HiOutlineX, HiOutlineDocumentText, HiOutlineUser } from "react-icons/hi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDoctorDocumentsByDoctorId } from "@/hooks/data/useDoctorDocumentHooks";
import { formatRelativeTime } from "@/common/format";
import { doctorDocumentTypeLabelMap } from "@/types/DoctorDocument";
import { Badge } from "@/components/custom-ui/Badge";
import { Spinner } from "@/components/custom-ui/Spinner";

export function DoctorProfileDetailModal({
  account,
  onClose,
}: {
  account: DoctorAccount | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "documents">("profile");

  if (!account) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="z-10 flex h-[90vh] max-h-[800px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between p-4 md:px-6">
              <h2 className="text-lg font-semibold text-white">Hồ sơ Bác sĩ</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-6 px-4 md:px-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <HiOutlineUser className="h-5 w-5" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "documents"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <HiOutlineDocumentText className="h-5 w-5" />
                Chứng chỉ y tế
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {activeTab === "profile" && <ProfileTab account={account} />}
            {activeTab === "documents" && <DocumentsTab doctorId={account.doctorId} />}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-white/10 bg-white/5 p-4 md:p-6">
            <button
              onClick={onClose}
              className="rounded-lg bg-white/5 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ProfileTab({ account }: { account: DoctorAccount }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 text-sm text-gray-300">
      <div className="space-y-4">
        <div className="rounded-lg bg-white/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Thông tin cá nhân
          </p>
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
            <span className="font-medium text-white">
              {account.currentHospitalName || "Chưa cập nhật"}
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-white/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Giới thiệu (Bio)
          </p>
          <p className="whitespace-pre-wrap">{account.bio || "Không có giới thiệu"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-white/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Chứng chỉ hành nghề
          </p>
          <div className="flex justify-between">
            <span className="text-gray-500">Mã CCHN:</span>
            <span className="font-medium text-white">{account.licenseNumber || "Chưa có"}</span>
          </div>
          {account.licenseImage ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {account.licenseImage.split(/[\n,;]+/).map((url, i) => {
                if (!url.trim()) return null;
                const isPdf = url.toLowerCase().includes(".pdf");
                return (
                  <a
                    key={i}
                    href={url.trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="block relative aspect-square overflow-hidden rounded border border-white/10 group bg-black"
                  >
                    {isPdf ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 transition">
                        <span className="text-2xl mb-1">📄</span>
                        <span className="text-xs text-white">Xem PDF</span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={url.trim()}
                          className="object-cover w-full h-full group-hover:scale-110 transition"
                          alt="License"
                        />
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
            <div className="h-32 flex items-center justify-center rounded border border-dashed border-white/10 bg-white/5 text-gray-500">
              Không có hình ảnh
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ doctorId }: { doctorId: string }) {
  const { data, isLoading, isError } = useDoctorDocumentsByDoctorId(doctorId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center pb-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        Không thể tải danh sách chứng chỉ lúc này.
      </div>
    );
  }

  const documents = data || [];

  if (documents.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-400">
        <HiOutlineDocumentText className="mb-2 h-12 w-12 opacity-20" />
        <p>Bác sĩ này chưa tải lên chứng chỉ nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const typeLabel =
          doctorDocumentTypeLabelMap[
            (doc.documentType || doc.documentName || doc.type) as keyof typeof doctorDocumentTypeLabelMap
          ] || "Chứng chỉ khác";
        const isPdf = doc.fileUrl?.toLowerCase().includes(".pdf");
        
        const rawStatus = (doc.status || "").toLowerCase();
        const isApproved = rawStatus === "approved";
        const isRejected = rawStatus === "rejected";

        return (
          <div
            key={doc.documentId}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-4">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black transition hover:border-primary"
              >
                {isPdf ? (
                  <span className="text-2xl">📄</span>
                ) : (
                  <img src={doc.fileUrl} alt="doc" className="h-full w-full object-cover" />
                )}
              </a>
              <div className="flex flex-col">
                <span className="font-medium text-white">{typeLabel}</span>
                <span className="text-xs text-gray-400 mt-1">
                  Đã nộp: {doc.submittedAt ? formatRelativeTime(doc.submittedAt) : "N/A"}
                </span>
                {doc.reviewBy && (
                  <span className="text-xs text-gray-500 mt-0.5">
                    Duyệt bởi: {doc.reviewBy} ({doc.reviewAt ? formatRelativeTime(doc.reviewAt) : ""})
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge
                type={
                  isApproved
                    ? "success"
                    : isRejected
                    ? "error"
                    : "warning"
                }
                value={
                  isApproved
                    ? "Đã duyệt"
                    : isRejected
                    ? "Bị từ chối"
                    : "Chờ duyệt"
                }
              />
              {doc.note && isRejected && (
                <span className="text-[11px] text-red-400 max-w-[200px] truncate" title={doc.note}>
                  Lý do: {doc.note}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
