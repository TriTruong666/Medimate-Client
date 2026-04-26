import type { DoctorAccount } from "@/apis/management.service";
import {
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineExternalLink,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineIdentification,
  HiOutlineDownload,
} from "react-icons/hi";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDoctorDocumentsByDoctorId } from "@/hooks/data/useDoctorDocumentHooks";
import { formatRelativeTime } from "@/common/format";
import {
  doctorDocumentTypeLabelMap,
  type DoctorDocumentType,
} from "@/types/DoctorDocument";
import { Badge } from "@/components/custom-ui/Badge";
import { Spinner } from "@/components/custom-ui/Spinner";
import { Input } from "@/components/custom-ui/Input";
import { HiChevronDown } from "react-icons/hi";
import {
  useCreateDoctorAvailabilities,
  useDeleteDoctorAvailability,
  useDoctorAvailabilities,
  useUpdateDoctorAvailability,
} from "@/hooks/data/useDoctorAvailabilityHooks";
import {
  useDoctorAvailabilityExceptions,
  useUpdateDoctorAvailabilityException,
} from "@/hooks/data/useDoctorAvailabilityExceptionHooks";
import { toast } from "@/hooks/useToast";
import type {
  CreateDoctorAvailabilityBody,
  DayOfWeek,
  DoctorAvailability,
  UpdateDoctorAvailabilityBody,
} from "@/types/DoctorAvailability";
import type { DoctorAvailabilityException } from "@/types/DoctorAvailabilityException";
import { Tooltip } from "@/components/custom-ui/Tooltip";

const dayOfWeekOptions = [
  { value: "Monday", label: "Thứ 2" },
  { value: "Tuesday", label: "Thứ 3" },
  { value: "Wednesday", label: "Thứ 4" },
  { value: "Thursday", label: "Thứ 5" },
  { value: "Friday", label: "Thứ 6" },
  { value: "Saturday", label: "Thứ 7" },
  { value: "Sunday", label: "Chủ nhật" },
] as const;

// Chuyển giờ từ API ("HH:MM:SS" hoặc bất kỳ) sang "HH:MM" cho input[type=time]
function toInputTime(value: string): string {
  if (!value) return "";

  // Đã đúng format HH:MM
  if (/^\d{2}:\d{2}$/.test(value)) return value;

  // HH:MM:SS → lấy 5 ký tự đầu
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);

  // Fallback parse (xử lý AM/PM hoặc format lạ)
  const parsed = new Date(`1970-01-01 ${value}`);
  if (!isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:${String(parsed.getMinutes()).padStart(2, "0")}`;
  }

  return value.slice(0, 5);
}

// Chuyển giờ từ bất kỳ format nào sang "HH:MM:SS" 24h để gửi API
function toApiTime(value: string): string {
  if (!value) return value;

  // Đã đúng format HH:MM:SS
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;

  // HH:MM → HH:MM:00
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;

  // Xử lý AM/PM (ví dụ: "08:00 AM", "02:30 PM") — trường hợp browser trả sai
  const parsed = new Date(`1970-01-01 ${value}`);
  if (!isNaN(parsed.getTime())) {
    const h = String(parsed.getHours()).padStart(2, "0");
    const m = String(parsed.getMinutes()).padStart(2, "0");
    return `${h}:${m}:00`;
  }

  // Fallback: thêm :00 nếu chưa có
  return value.includes(":") && value.split(":").length === 2
    ? `${value}:00`
    : value;
}

function getDayLabel(dayOfWeek: string): string {
  return (
    dayOfWeekOptions.find((item) => item.value === dayOfWeek)?.label ||
    dayOfWeek
  );
}

function validateAvailabilitySlot(slot: {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}): boolean {
  if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
    toast.error(
      "Thiếu thông tin",
      "Vui lòng nhập đầy đủ thứ, giờ bắt đầu và giờ kết thúc.",
    );
    return false;
  }

  if (slot.startTime >= slot.endTime) {
    toast.error(
      "Thời gian không hợp lệ",
      "Giờ bắt đầu phải sớm hơn giờ kết thúc.",
    );
    return false;
  }

  return true;
}

function getAvailabilityId(row: DoctorAvailability): string {
  return row.id || "";
}

const handleDownload = async (fileUrl: string, fileName: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    link.download = fileName || "medimate-document";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
    toast.error("Lỗi", "Không thể tải file này về máy tính.");
  }
};

export function DoctorProfileDetailModal({
  account,
  onClose,
}: {
  account: DoctorAccount | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "documents" | "availabilities" | "exceptions"
  >("profile");

  if (!account) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onClose} />
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="z-10 flex h-[90vh] max-h-[850px] min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-gray-400 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Hồ sơ Bác sĩ
                </h2>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  Xem và quản lý thông tin chi tiết của bác sĩ{" "}
                  {account.fullName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="no-scrollbar flex gap-4 overflow-x-auto px-6">
              {(
                [
                  { id: "profile", label: "Thông tin cá nhân" },
                  { id: "documents", label: "Chứng chỉ y tế" },
                  { id: "availabilities", label: "Lịch làm việc" },
                  { id: "exceptions", label: "Lịch nghỉ" },
                ] as const
              ).map((tab) => {
                const isLocked =
                  account.status !== "Verified" &&
                  account.status !== "Active" &&
                  (tab.id === "availabilities" || tab.id === "exceptions");

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isLocked) {
                        toast.error(
                          "Tài khoản chưa duyệt",
                          "Chỉ có thể xem/chỉnh sửa lịch khi bác sĩ đã được duyệt.",
                        );
                        return;
                      }
                      setActiveTab(tab.id);
                    }}
                    className={`relative flex items-center gap-2 px-2 py-2.5 text-[13px] font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "text-primary"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    } ${isLocked ? "cursor-not-allowed opacity-40 hover:text-gray-400" : ""}`}
                  >
                    {tab.label}
                    {isLocked && (
                      <span className="ml-1 rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-white/10">
                        Khóa
                      </span>
                    )}

                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="modalActiveTabUnderline"
                        className="bg-primary absolute right-1 bottom-0 left-1 h-0.5 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          mass: 1,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div
            data-lenis-prevent
            className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-6"
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && <ProfileTab account={account} />}
              {activeTab === "documents" && (
                <DocumentsTab doctorId={account.doctorId} />
              )}
              {activeTab === "availabilities" && (
                <DoctorAvailabilitiesTab doctorId={account.doctorId} />
              )}
              {activeTab === "exceptions" && (
                <DoctorAvailabilityExceptionsTab doctorId={account.doctorId} />
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-400 bg-gray-50/50 p-6 dark:border-white/10 dark:bg-white/5">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────
// CUSTOM 24H TIME INPUT (Tránh trình duyệt ép AM/PM theo hệ điều hành)
// ─────────────────────────────────────────────────────────────────
function TimeInput24h({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [val, setVal] = useState(value);

  // Sync state if props change (e.g. queue clear)
  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d:]/g, ""); // Chỉ cho nhập số và dấu 2 chấm
    setVal(input);
  };

  const handleBlur = () => {
    let v = val.trim();
    // Tự động thêm dấu : nếu người dùng nhập 4 số liên tiếp (VD: 1530 -> 15:30)
    if (/^\d{4}$/.test(v)) {
      v = `${v.substring(0, 2)}:${v.substring(2, 4)}`;
    }

    // Validate đúng chuẩn HH:mm
    if (/^\d{1,2}:\d{1,2}$/.test(v)) {
      let [h, m] = v.split(":");
      let hh = Math.min(23, Math.max(0, parseInt(h) || 0));
      let mm = Math.min(59, Math.max(0, parseInt(m) || 0));
      let formatted = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      setVal(formatted);
      onChange(formatted);
    } else {
      // Revert if invalid
      setVal(value);
      onChange(value);
    }
  };

  return (
    <input
      type="text"
      disabled={disabled}
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="08:00"
      maxLength={5}
      className={className}
    />
  );
}

function SmallGlassSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options:
    | { label: string; value: string }[]
    | readonly { label: string; value: string }[];
  onChange: (val: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-400 bg-white px-3 py-1.5 text-xs text-gray-900 transition-all hover:bg-gray-50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <span className="truncate">{selected?.label}</span>
        <HiChevronDown
          className={clsx(
            "h-3 w-3 text-gray-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 min-w-[120px] overflow-hidden rounded-lg border border-gray-300 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95">
          <ul className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full items-center px-3 py-2 text-xs transition",
                    opt.value === value
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white",
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ account }: { account: DoctorAccount }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-gray-400 bg-gray-50/30 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-1.5">
              <HiOutlineUser className="h-4 w-4" />
            </div>
            <h3 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Thông tin cơ bản
            </h3>
          </div>

          <div className="grid gap-3 text-[13px]">
            <div className="flex items-center justify-between border-b border-gray-400 py-1.5 dark:border-white/5">
              <span className="font-medium text-gray-500">Họ và tên</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {account.fullName || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-400 py-1.5 dark:border-white/5">
              <span className="font-medium whitespace-nowrap text-gray-500">
                Chuyên khoa
              </span>
              <Badge type="info" value={account.specialty || "N/A"} />
            </div>
            <div className="flex items-center justify-between border-b border-gray-400 py-1.5 dark:border-white/5">
              <span className="font-medium text-gray-500">Kinh nghiệm</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {account.yearsOfExperience} năm
              </span>
            </div>
            <div className="flex items-start justify-between py-1.5">
              <span className="font-medium text-gray-500">Đơn vị công tác</span>
              <span className="max-w-[180px] text-right font-bold text-gray-900 dark:text-white">
                {account.currentHospitalName || "Chưa cập nhật"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-400 bg-gray-50/30 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-1.5">
              <HiOutlineBriefcase className="h-4 w-4" />
            </div>
            <h3 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Giới thiệu
            </h3>
          </div>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-gray-600 dark:text-gray-300">
            {account.bio || "Bác sĩ chưa có thông tin giới thiệu."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4 rounded-2xl border border-gray-400 bg-gray-50/30 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-lg p-1.5">
              <HiOutlineIdentification className="h-4 w-4" />
            </div>
            <h3 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Chứng chỉ hành nghề
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-500">Mã CCHN</span>
            <span className="rounded bg-gray-100 px-2 py-1 font-mono font-bold text-gray-900 dark:bg-white/10 dark:text-white">
              {account.licenseNumber || "N/A"}
            </span>
          </div>

          {account.licenseImage ? (
            <div className="grid grid-cols-1 gap-3">
              {account.licenseImage.split(/[\n,;]+/).map((url, i) => {
                const trimmedUrl = url.trim();
                if (!trimmedUrl) return null;
                const isPdf = trimmedUrl.toLowerCase().includes(".pdf");

                return (
                  <div
                    key={i}
                    className="group hover:border-primary/50 relative flex items-center gap-4 rounded-xl border border-gray-400 bg-white p-3 transition-all hover:shadow-md dark:border-white/10 dark:bg-black/20"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-white/5">
                      {isPdf ? (
                        <span className="text-2xl">📄</span>
                      ) : (
                        <img
                          src={trimmedUrl}
                          className="h-full w-full object-cover"
                          alt="License"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col truncate">
                      <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                        {isPdf ? "Chứng chỉ (PDF)" : "Ảnh chứng chỉ"}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">
                        Nhấn để xem chi tiết
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={trimmedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
                        title="Xem trong tab mới"
                      >
                        <HiOutlineExternalLink className="group-hover:text-primary h-4 w-4 text-gray-400" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            trimmedUrl,
                            `CCHN_${account.fullName}.jpg`,
                          )
                        }
                        className="bg-primary/10 hover:bg-primary/20 text-primary rounded-lg p-2 transition-colors"
                        title="Tải về máy tính"
                      >
                        <HiOutlineDownload className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-24 flex-col items-center justify-center rounded-xl border border-dashed border-gray-400 bg-gray-50 text-gray-400 dark:border-white/10 dark:bg-white/5">
              <HiOutlineDocumentText className="mb-2 h-6 w-6 opacity-20" />
              <span className="text-[11px] font-medium">
                Không có hình ảnh chứng chỉ
              </span>
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
  const [edits, setEdits] = useState<
    Record<string, UpdateDoctorAvailabilityBody>
  >({});

  const availabilities = (data ?? []).filter((item) => item.isActive);

  function handleAddToQueue() {
    if (!validateAvailabilitySlot(newSlot)) return;
    setQueue((prev) => [...prev, { ...newSlot }]);
  }

  function handleRemoveFromQueue(index: number) {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreateQueue() {
    if (!queue.length) {
      toast.error(
        "Trống danh sách",
        "Vui lòng thêm ít nhất một khung giờ vào danh sách tạo.",
      );
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
      // Vì API có thể lưu thành công một phần rồi mới quăng lỗi trùng lặp (Partial saving),
      // ta cần xóa queue và tải lại danh sách để user có thông tin mới nhất và không nhấn tạo lại.
      setQueue([]);
      void refetch();
    }
  }

  function getRowDraft(row: DoctorAvailability): UpdateDoctorAvailabilityBody {
    const rowId = getAvailabilityId(row);
    const cached = edits[rowId];
    if (cached) return cached;

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
    if (!rowId) return;

    setEdits((prev) => ({
      ...prev,
      [rowId]: { ...getRowDraft(row), ...patch },
    }));
  }

  async function handleSaveRow(row: DoctorAvailability) {
    const rowId = getAvailabilityId(row);
    if (!rowId) return;

    const draft = getRowDraft(row);
    if (!validateAvailabilitySlot(draft)) return;

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
    } catch {}
  }

  async function handleDeleteRow(id: string) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung giờ này không?"))
      return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      {/* Create Section */}
      <section className="rounded-2xl border border-gray-400 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">
          Thêm lịch làm việc mới
        </h3>
        <p className="mt-1 text-[11px] text-gray-500">
          Cấu hình khung giờ cố định lặp lại hàng tuần.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              Thứ
            </label>
            <SmallGlassSelect
              value={newSlot.dayOfWeek}
              options={dayOfWeekOptions}
              onChange={(val) =>
                setNewSlot((prev) => ({
                  ...prev,
                  dayOfWeek: val as DayOfWeek,
                }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              Bắt đầu
            </label>
            <TimeInput24h
              value={newSlot.startTime}
              onChange={(val) =>
                setNewSlot((prev) => ({ ...prev, startTime: val }))
              }
              className="input-primary w-full px-3 py-1.5 text-[13px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              Kết thúc
            </label>
            <TimeInput24h
              value={newSlot.endTime}
              onChange={(val) =>
                setNewSlot((prev) => ({ ...prev, endTime: val }))
              }
              className="input-primary w-full px-3 py-1.5 text-[13px]"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleAddToQueue}
            className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Thêm vào danh sách chờ
          </button>
          {queue.length > 0 && (
            <button
              onClick={() => setQueue([])}
              className="text-xs font-bold text-red-500 transition-colors hover:text-red-600"
            >
              Xóa tất cả ({queue.length})
            </button>
          )}
        </div>

        {queue.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-gray-300 bg-white p-3 shadow-inner dark:border-white/5 dark:bg-black/20">
            {queue.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold dark:bg-white/5"
              >
                <span>
                  {getDayLabel(item.dayOfWeek)}: {item.startTime} -{" "}
                  {item.endTime}
                </span>
                <HiOutlineX
                  onClick={() => handleRemoveFromQueue(idx)}
                  className="cursor-pointer transition-colors hover:text-red-500"
                />
              </div>
            ))}
          </div>
        )}

        {queue.length > 0 && (
          <button
            onClick={() => void handleCreateQueue()}
            disabled={createMutation.isPending}
            className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
          >
            {createMutation.isPending
              ? "Đang xử lý..."
              : `Xác nhận tạo ${queue.length} khung giờ`}
          </button>
        )}
      </section>

      {/* List Section */}
      <section className="rounded-2xl border border-gray-400 bg-gray-50/50 p-4 dark:border-white/10 dark:bg-white/5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">
            Lịch làm việc hiện tại
          </h3>
          <button
            onClick={() => void refetch()}
            className="text-primary text-xs font-medium transition-all hover:opacity-80"
          >
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-500/10">
            <p className="text-sm text-red-600">
              {error?.message || "Lỗi tải dữ liệu"}
            </p>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-400 opacity-50">
            <HiOutlineCalendar className="mb-2 h-10 w-10" />
            <p className="text-sm">Chưa có khung giờ làm việc nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((item, idx) => {
              const rowId = getAvailabilityId(item);
              const draft = getRowDraft(item);
              const isEdited = !!edits[rowId];

              return (
                <div
                  key={rowId || idx}
                  className="grid grid-cols-1 items-center gap-3 rounded-xl border border-gray-400 bg-white p-3 shadow-sm transition-all hover:shadow-md sm:grid-cols-[1.5fr_1fr_1fr_auto] dark:border-white/10 dark:bg-black/20"
                >
                  <SmallGlassSelect
                    value={draft.dayOfWeek}
                    options={dayOfWeekOptions}
                    onChange={(val) =>
                      patchRowDraft(item, {
                        dayOfWeek: val as DayOfWeek,
                      })
                    }
                  />
                  <TimeInput24h
                    value={draft.startTime}
                    onChange={(val) => patchRowDraft(item, { startTime: val })}
                    className="input-primary w-full px-3 py-1.5 text-[13px] sm:w-auto"
                  />
                  <TimeInput24h
                    value={draft.endTime}
                    onChange={(val) => patchRowDraft(item, { endTime: val })}
                    className="input-primary w-full px-3 py-1.5 text-[13px] sm:w-auto"
                  />
                  <div className="flex items-center gap-2">
                    {isEdited ? (
                      <button
                        onClick={() => void handleSaveRow(item)}
                        className="rounded-lg bg-emerald-100 p-2 text-emerald-600 transition hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        <HiOutlineCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => void handleDeleteRow(rowId)}
                        className="rounded-lg bg-red-100 p-2 text-red-500 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function DoctorAvailabilityExceptionsTab({ doctorId }: { doctorId: string }) {
  const { data, isLoading, isError, error, refetch } =
    useDoctorAvailabilityExceptions(doctorId);
  const updateMutation = useUpdateDoctorAvailabilityException(doctorId);
  const [view, setView] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  const items = data ?? [];
  const pending = items.filter(
    (item) => item.status?.toLowerCase() === "pending",
  );
  const approved = items.filter(
    (item) => item.status?.toLowerCase() === "approved",
  );
  const rejected = items.filter(
    (item) => item.status?.toLowerCase() === "rejected",
  );
  const visibleItems =
    view === "pending" ? pending : view === "approved" ? approved : rejected;

  async function handleApprove(item: DoctorAvailabilityException) {
    if (!item.exceptionId) return;
    try {
      await updateMutation.mutateAsync({
        id: item.exceptionId,
        data: {
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          reason: item.reason,
          status: "Approved",
          isAvailableOverride: item.isAvailableOverride,
        },
      });
      await refetch();
    } catch {}
  }

  async function handleReject(item: DoctorAvailabilityException) {
    if (!item.exceptionId) return;
    if (!window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu này không?"))
      return;
    try {
      await updateMutation.mutateAsync({
        id: item.exceptionId,
        data: {
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          reason: item.reason,
          status: "Rejected",
          isAvailableOverride: item.isAvailableOverride,
        },
      });
      await refetch();
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/5">
          <button
            onClick={() => setView("pending")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              view === "pending"
                ? "text-primary dark:bg-primary bg-white shadow-sm dark:text-white"
                : "text-gray-400"
            }`}
          >
            Chờ duyệt ({pending.length})
          </button>
          <button
            onClick={() => setView("approved")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              view === "approved"
                ? "text-primary dark:bg-primary bg-white shadow-sm dark:text-white"
                : "text-gray-400"
            }`}
          >
            Đã duyệt ({approved.length})
          </button>
          <button
            onClick={() => setView("rejected")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              view === "rejected"
                ? "text-primary dark:bg-primary bg-white shadow-sm dark:text-white"
                : "text-gray-400"
            }`}
          >
            Từ chối ({rejected.length})
          </button>
        </div>
        <button
          onClick={() => void refetch()}
          className="text-primary text-xs font-medium transition-all hover:opacity-80"
        >
          Làm mới
        </button>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="mx-auto my-12" />
      ) : visibleItems.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          Không có yêu cầu nào
        </div>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((item, i) => (
            <div
              key={item.exceptionId || i}
              className="flex flex-col items-start justify-between rounded-2xl border border-gray-400 bg-white p-4 sm:flex-row sm:items-center dark:border-white/10 dark:bg-black/20"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {formatRelativeTime(item.date)}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                </p>
                <p className="text-[11px] text-gray-600 italic dark:text-gray-400">
                  Lý do: {item.reason || "Không có"}
                </p>
              </div>
              {view === "pending" && (
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
                  <button
                    onClick={() => void handleApprove(item)}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
                  >
                    <HiOutlineCheck className="h-4 w-4" /> Duyệt
                  </button>
                  <button
                    onClick={() => void handleReject(item)}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
                  >
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ doctorId }: { doctorId: string }) {
  const { data, isLoading, isError } = useDoctorDocumentsByDoctorId(doctorId);

  if (isLoading) return <Spinner size="lg" className="mx-auto my-20" />;
  if (isError)
    return (
      <div className="py-10 text-center text-red-500">
        Lỗi tải danh sách chứng chỉ
      </div>
    );

  const documents = data || [];

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <HiOutlineDocumentText className="mb-4 h-16 w-16 opacity-10" />
        <p>Bác sĩ này chưa tải lên chứng chỉ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const typeLabel =
          doctorDocumentTypeLabelMap[doc.documentType as DoctorDocumentType] ||
          "Chứng chỉ y tế";
        const isPdf = doc.fileUrl?.toLowerCase().includes(".pdf");
        const status = (doc.status || "pending").toLowerCase();

        return (
          <div
            key={doc.documentId}
            className="flex items-center gap-4 rounded-2xl border border-gray-400 bg-white p-4 dark:border-white/10 dark:bg-black/20"
          >
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 transition hover:scale-105 dark:bg-white/5"
            >
              {isPdf ? (
                <span className="text-2xl">📄</span>
              ) : (
                <img src={doc.fileUrl} className="h-full w-full object-cover" />
              )}
            </a>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {typeLabel}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Nộp lúc:{" "}
                {doc.submittedAt ? formatRelativeTime(doc.submittedAt) : "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  handleDownload(
                    doc.fileUrl,
                    `${typeLabel}_${doc.documentId}.jpg`,
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
              >
                <HiOutlineDownload className="h-4 w-4" /> Tải về
              </button>
              <Badge
                type={
                  status === "approved"
                    ? "success"
                    : status === "rejected"
                      ? "error"
                      : "warning"
                }
                value={
                  status === "approved"
                    ? "Đã duyệt"
                    : status === "rejected"
                      ? "Bị từ chối"
                      : "Đang chờ"
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
