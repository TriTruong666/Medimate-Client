import { formatRelativeTime } from "@/common/format";
import { toast } from "@/hooks/useToast";
import { useMemo, useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import type { DoctorDocumentStatus } from "@/types/DoctorDocument";

export type CertificateDetailModalRow = {
  id: string;
  doctorName: string;
  specialty: string;
  certName: string;
  certType: string;
  fileUrls: string[];
  submitDate: string;
  status: DoctorDocumentStatus;
  rejectReason: string | null;
};

type Props = {
  row: CertificateDetailModalRow | null;
  onClose(): void;
  onApprove(row: CertificateDetailModalRow): void;
  onReject(row: CertificateDetailModalRow, reason: string): void;
};

function isPdf(url: string): boolean {
  return /\.pdf([?#].*)?$/i.test(url);
}

function isImage(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|bmp|svg)([?#].*)?$/i.test(url);
}

export function CertificateDetailReviewModal({
  row,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [rejectReason, setRejectReason] = useState("");
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const activeFileUrl = useMemo(() => {
    if (!row) return "";
    return row.fileUrls[activeFileIndex] ?? "";
  }, [row, activeFileIndex]);

  if (!row) return null;

  const canSubmitReject = rejectReason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-5">
          <h3 className="text-base font-semibold text-white">Chi tiết hồ sơ chứng chỉ</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <div className="mb-3 text-sm font-medium text-white">Preview file gốc ({row.fileUrls.length})</div>

              {activeFileUrl ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/60">
                  {isImage(activeFileUrl) ? (
                    <img
                      src={activeFileUrl}
                      alt="Certificate preview"
                      className="h-110 w-full object-contain"
                    />
                  ) : isPdf(activeFileUrl) ? (
                    <iframe
                      src={activeFileUrl}
                      title="Certificate PDF preview"
                      className="h-110 w-full"
                    />
                  ) : (
                    <div className="flex h-55 items-center justify-center text-sm text-gray-400">
                      Không thể preview loại file này. Vui lòng mở file ở tab mới.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-55 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm text-gray-400">
                  Không có file để preview.
                </div>
              )}

              {row.fileUrls.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.fileUrls.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      onClick={() => setActiveFileIndex(index)}
                      className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                        index === activeFileIndex
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/10 bg-black/50 text-gray-300 hover:border-white/30"
                      }`}
                    >
                      File {index + 1} {isPdf(url) ? "(PDF)" : isImage(url) ? "(Image)" : "(Other)"}
                    </button>
                  ))}
                </div>
              ) : null}

              {activeFileUrl ? (
                <a
                  href={activeFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary mt-3 inline-block text-sm underline underline-offset-4 hover:opacity-90"
                >
                  Mở file hiện tại trong tab mới
                </a>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <InfoField label="Bác sĩ" value={row.doctorName} />
              <InfoField label="Chuyên khoa" value={row.specialty} />
              <InfoField label="Loại chứng chỉ" value={row.certName} />
              <InfoField label="Mã loại" value={row.certType} />
              <InfoField label="Nộp lúc" value={formatRelativeTime(row.submitDate)} />
              <InfoField label="Trạng thái" value={row.status} />
            </div>

            {row.rejectReason ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-200">
                <span className="font-medium">Lý do từ chối trước đó:</span> {row.rejectReason}
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Lý do từ chối</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối (bắt buộc nếu Reject)"
                className="h-24 w-full resize-none rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  if (!canSubmitReject) {
                    toast.warn("Thiếu dữ liệu", "Vui lòng nhập lý do từ chối.");
                    return;
                  }
                  onReject(row, rejectReason.trim());
                }}
                className="rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Reject
              </button>

              <button
                onClick={() => onApprove(row)}
                className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
