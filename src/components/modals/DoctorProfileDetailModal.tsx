import type { DoctorAccount } from "@/apis/management.service";
import {
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineTrash,
} from "react-icons/hi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDoctorDocumentsByDoctorId } from "@/hooks/data/useDoctorDocumentHooks";
import { formatRelativeTime } from "@/common/format";
import { doctorDocumentTypeLabelMap } from "@/types/DoctorDocument";
import { Badge } from "@/components/custom-ui/Badge";
import { Spinner } from "@/components/custom-ui/Spinner";
import {
  useCreateDoctorAvailabilities,
  useDeleteDoctorAvailability,
  useDoctorAvailabilities,
  useUpdateDoctorAvailability,
} from "@/hooks/data/useDoctorAvailabilityHooks";
import { toast } from "@/hooks/useToast";
import type {
  CreateDoctorAvailabilityBody,
  DoctorAvailability,
  UpdateDoctorAvailabilityBody,
} from "@/types/DoctorAvailability";

const dayOfWeekOptions = [
  { value: "Monday", label: "Thứ 2" },
  { value: "Tuesday", label: "Thứ 3" },
  { value: "Wednesday", label: "Thứ 4" },
  { value: "Thursday", label: "Thứ 5" },
  { value: "Friday", label: "Thứ 6" },
  { value: "Saturday", label: "Thứ 7" },
  { value: "Sunday", label: "Chủ nhật" },
] as const;

function toInputTime(value: string): string {
  if (!value) return "";
  return value.slice(0, 5);
}

function toApiTime(value: string): string {
  if (!value) return value;
  return value.length === 5 ? `${value}:00` : value;
}

function getDayLabel(dayOfWeek: string): string {
  return (
    dayOfWeekOptions.find((item) => item.value === dayOfWeek)?.label || dayOfWeek
  );
}

function validateAvailabilitySlot(slot: {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}): boolean {
  if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
    toast.error("Thiếu thông tin", "Vui lòng nhập đủ thứ, giờ bắt đầu và giờ kết thúc.");
    return false;
  }

  if (slot.startTime >= slot.endTime) {
    toast.error("Thời gian không hợp lệ", "Giờ bắt đầu phải sớm hơn giờ kết thúc.");
    return false;
  }

  return true;
}

function getAvailabilityId(row: DoctorAvailability): string {
  return row.id || "";
}

export function DoctorProfileDetailModal({
  account,
  onClose,
}: {
  account: DoctorAccount | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "documents" | "availabilities"
  >("profile");

  if (!account) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="z-10 flex h-[90vh] min-h-0 max-h-[800px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl"
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
              <button
                onClick={() => setActiveTab("availabilities")}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === "availabilities"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <HiOutlineCalendar className="h-5 w-5" />
                Lịch làm việc
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 md:p-6"
          >
            {activeTab === "profile" && <ProfileTab account={account} />}
            {activeTab === "documents" && <DocumentsTab doctorId={account.doctorId} />}
            {activeTab === "availabilities" && (
              <DoctorAvailabilitiesTab doctorId={account.doctorId} />
            )}
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

function DoctorAvailabilitiesTab({ doctorId }: { doctorId: string }) {
  const { data, isLoading, isError, error, refetch } =
    useDoctorAvailabilities(doctorId);
  const createMutation = useCreateDoctorAvailabilities(doctorId);
  const updateMutation = useUpdateDoctorAvailability(doctorId);
  const deleteMutation = useDeleteDoctorAvailability(doctorId);

  const [newSlot, setNewSlot] = useState<CreateDoctorAvailabilityBody>({
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "12:00",
  });
  const [queue, setQueue] = useState<CreateDoctorAvailabilityBody[]>([]);
  const [edits, setEdits] = useState<Record<string, UpdateDoctorAvailabilityBody>>(
    {},
  );

  const availabilities = data ?? [];

  function handleAddToQueue() {
    if (!validateAvailabilitySlot(newSlot)) {
      return;
    }

    setQueue((prev) => [...prev, { ...newSlot }]);
  }

  function handleRemoveFromQueue(index: number) {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateQueue() {
    if (!queue.length) {
      toast.error("Chưa có lịch", "Vui lòng thêm ít nhất một khung giờ để tạo.");
      return;
    }

    const payload = queue.map((item) => ({
      dayOfWeek: item.dayOfWeek,
      startTime: toApiTime(item.startTime),
      endTime: toApiTime(item.endTime),
    }));

    try {
      await createMutation.mutateAsync(payload);
      setQueue([]);
    } catch {
      // Toast is handled in mutation onError.
    }
  }

  function getRowDraft(row: DoctorAvailability): UpdateDoctorAvailabilityBody {
    const rowId = getAvailabilityId(row);
    const cached = edits[rowId];
    if (cached) {
      return cached;
    }

    return {
      dayOfWeek: row.dayOfWeek,
      startTime: toInputTime(row.startTime),
      endTime: toInputTime(row.endTime),
      isActive: row.isActive,
    };
  }

  function patchRowDraft(
    row: DoctorAvailability,
    patch: Partial<UpdateDoctorAvailabilityBody>,
  ) {
    const rowId = getAvailabilityId(row);

    if (!rowId) {
      toast.error("Thiếu ID lịch", "Không tìm thấy ID lịch làm việc để cập nhật.");
      return;
    }

    setEdits((prev) => ({
      ...prev,
      [rowId]: {
        ...getRowDraft(row),
        ...patch,
      },
    }));
  }

  async function handleSaveRow(row: DoctorAvailability) {
    const rowId = getAvailabilityId(row);
    if (!rowId) {
      toast.error("Thiếu ID lịch", "Không tìm thấy ID lịch làm việc để lưu.");
      return;
    }

    const draft = getRowDraft(row);
    if (!validateAvailabilitySlot(draft)) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: rowId,
        data: {
          dayOfWeek: draft.dayOfWeek,
          startTime: toApiTime(draft.startTime),
          endTime: toApiTime(draft.endTime),
          isActive: draft.isActive,
        },
      });

      setEdits((prev) => {
        const next = { ...prev };
        delete next[rowId];
        return next;
      });
    } catch {
      // Toast is handled in mutation onError.
    }
  }

  async function handleDeleteRow(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa lịch làm việc này?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Toast is handled in mutation onError.
    }
  }

  return (
    <div className="min-h-full space-y-6">
      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-semibold text-white">Thêm lịch làm việc</h3>
        <p className="mt-1 text-xs text-gray-400">
          Tạo nhiều khung giờ trước, sau đó gửi một lần qua API POST.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-xs text-gray-400">
            Thứ
            <select
              value={newSlot.dayOfWeek}
              onChange={(event) =>
                setNewSlot((prev) => ({
                  ...prev,
                  dayOfWeek: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-hidden focus:border-primary"
            >
              {dayOfWeekOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-400">
            Bắt đầu
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(event) =>
                setNewSlot((prev) => ({ ...prev, startTime: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-hidden focus:border-primary"
            />
          </label>

          <label className="text-xs text-gray-400">
            Kết thúc
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(event) =>
                setNewSlot((prev) => ({ ...prev, endTime: event.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-hidden focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleAddToQueue}
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white transition hover:brightness-110"
          >
            Thêm vào danh sách tạo
          </button>
          <button
            onClick={() => setQueue([])}
            type="button"
            className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/10"
          >
            Xóa danh sách
          </button>
        </div>

        {queue.length > 0 && (
          <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
            {queue.map((item, index) => (
              <div
                key={`${item.dayOfWeek}-${item.startTime}-${item.endTime}-${index}`}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-200"
              >
                <span>
                  {getDayLabel(item.dayOfWeek)}: {item.startTime} - {item.endTime}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFromQueue(index)}
                  className="rounded-md p-1 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => void handleCreateQueue()}
          type="button"
          disabled={createMutation.isPending}
          className="mt-4 rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createMutation.isPending ? "Đang tạo..." : "Tạo lịch làm việc"}
        </button>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Lịch làm việc hiện tại</h3>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-gray-300 transition hover:bg-white/10"
          >
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error?.message || "Không thể tải lịch làm việc."}
          </div>
        ) : availabilities.length === 0 ? (
          <div className="flex h-30 items-center justify-center text-sm text-gray-400">
            Bác sĩ chưa có lịch làm việc nào.
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((item, index) => {
              const rowId = getAvailabilityId(item);
              const draft = getRowDraft(item);

              return (
                <div
                  key={rowId || `${item.dayOfWeek}-${item.startTime}-${item.endTime}-${index}`}
                  className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-3 md:grid-cols-[1.2fr_1fr_1fr_auto_auto_auto] md:items-center"
                >
                  <select
                    value={draft.dayOfWeek}
                    onChange={(event) =>
                      patchRowDraft(item, { dayOfWeek: event.target.value })
                    }
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-hidden focus:border-primary"
                  >
                    {dayOfWeekOptions.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="time"
                    value={draft.startTime}
                    onChange={(event) =>
                      patchRowDraft(item, { startTime: event.target.value })
                    }
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-hidden focus:border-primary"
                  />

                  <input
                    type="time"
                    value={draft.endTime}
                    onChange={(event) =>
                      patchRowDraft(item, { endTime: event.target.value })
                    }
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-hidden focus:border-primary"
                  />

                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(event) =>
                        patchRowDraft(item, { isActive: event.target.checked })
                      }
                    />
                    Hoạt động
                  </label>

                  <button
                    type="button"
                    onClick={() => void handleSaveRow(item)}
                    disabled={updateMutation.isPending}
                    className="rounded-lg bg-primary/20 px-3 py-2 text-xs text-primary-light transition hover:bg-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Lưu
                  </button>

                  <button
                    type="button"
                    onClick={() => rowId && void handleDeleteRow(rowId)}
                    disabled={deleteMutation.isPending || !rowId}
                    className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-200 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
