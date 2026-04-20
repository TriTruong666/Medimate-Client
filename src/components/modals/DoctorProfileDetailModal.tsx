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
} from "react-icons/hi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDoctorDocumentsByDoctorId } from "@/hooks/data/useDoctorDocumentHooks";
import { formatRelativeTime } from "@/common/format";
import { doctorDocumentTypeLabelMap, type DoctorDocumentType } from "@/types/DoctorDocument";
import { Badge } from "@/components/custom-ui/Badge";
import { Spinner } from "@/components/custom-ui/Spinner";
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
    dayOfWeekOptions.find((item) => item.value === dayOfWeek)?.label || dayOfWeek
  );
}

function validateAvailabilitySlot(slot: {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}): boolean {
  if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
    toast.error("Thiếu thông tin", "Vui lòng nhập đầy đủ thứ, giờ bắt đầu và giờ kết thúc.");
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
          className="z-10 flex h-[90vh] min-h-0 max-h-[850px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex flex-col border-b border-gray-400 bg-gray-50/50 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Hồ sơ Bác sĩ
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Xem và quản lý thông tin chi tiết của bác sĩ {account.fullName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-6 w-6" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-8 px-6 overflow-x-auto no-scrollbar">
              {([
                { id: "profile", label: "Thông tin cá nhân", icon: HiOutlineUser },
                { id: "documents", label: "Chứng chỉ y tế", icon: HiOutlineDocumentText },
                { id: "availabilities", label: "Lịch làm việc", icon: HiOutlineCalendar },
                { id: "exceptions", label: "Lịch nghỉ", icon: HiOutlineCalendar },
              ] as const).map((tab) => {
                const isLocked =
                  account.status !== "Verified" &&
                  account.status !== "Active" &&
                  (tab.id === "availabilities" || tab.id === "exceptions");

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isLocked) {
                        toast.error("Tài khoản chưa duyệt", "Chỉ có thể xem/chỉnh sửa lịch khi bác sĩ đã được duyệt.");
                        return;
                      }
                      setActiveTab(tab.id);
                    }}
                    className={`flex items-center gap-2 border-b-2 py-4 text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    } ${isLocked ? "opacity-40 cursor-not-allowed hover:text-gray-400" : ""}`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                    {isLocked && <span className="text-[10px] bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md ml-1 font-medium">Khóa</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 custom-scrollbar"
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "profile" && <ProfileTab account={account} />}
              {activeTab === "documents" && <DocumentsTab doctorId={account.doctorId} />}
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
function TimeInput24h({ value, onChange, disabled, className }: { value: string, onChange: (val: string) => void, disabled?: boolean, className?: string }) {
  const [val, setVal] = useState(value);

  // Sync state if props change (e.g. queue clear)
  useEffect(() => { setVal(value); }, [value]);

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

function ProfileTab({ account }: { account: DoctorAccount }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-300 bg-gray-50/30 p-6 space-y-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <HiOutlineUser className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Thông tin cơ bản
            </h3>
          </div>
          
          <div className="grid gap-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/5">
              <span className="text-gray-500 font-medium">Họ và tên</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {account.fullName || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/5">
              <span className="text-gray-500 font-medium whitespace-nowrap">Chuyên khoa</span>
              <Badge type="info" value={account.specialty || "N/A"} />
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-white/5">
              <span className="text-gray-500 font-medium">Kinh nghiệm</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {account.yearsOfExperience} năm
              </span>
            </div>
            <div className="flex justify-between items-start py-2">
              <span className="text-gray-500 font-medium">Đơn vị công tác</span>
              <span className="font-bold text-gray-900 dark:text-white text-right max-w-[200px]">
                {account.currentHospitalName || "Chưa cập nhật"}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-300 bg-gray-50/30 p-6 space-y-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <HiOutlineBriefcase className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Giới thiệu
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {account.bio || "Bác sĩ chưa có thông tin giới thiệu."}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-300 bg-gray-50/30 p-6 space-y-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <HiOutlineIdentification className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Chứng chỉ hành nghề
            </h3>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Mã CCHN</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-1 rounded">
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
                  <a
                    key={i}
                    href={trimmedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex items-center gap-4 p-3 rounded-xl border border-gray-300 bg-white transition-all hover:border-primary/50 hover:shadow-md dark:border-white/10 dark:bg-black/20"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden">
                      {isPdf ? (
                        <span className="text-2xl">📄</span>
                      ) : (
                        <img src={trimmedUrl} className="h-full w-full object-cover" alt="License" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col truncate">
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {isPdf ? "Chứng chỉ (PDF)" : "Ảnh chứng chỉ"}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">Nhấn để xem chi tiết</span>
                    </div>
                    <HiOutlineExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400 dark:border-white/10 dark:bg-white/5">
              <HiOutlineDocumentText className="h-8 w-8 mb-2 opacity-20" />
              <span className="text-xs font-medium">Không có hình ảnh chứng chỉ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DoctorAvailabilitiesTab({ doctorId }: { doctorId: string }) {
  const { data, isLoading, isError, error, refetch } = useDoctorAvailabilities(doctorId);
  const createMutation = useCreateDoctorAvailabilities(doctorId);
  const updateMutation = useUpdateDoctorAvailability(doctorId);
  const deleteMutation = useDeleteDoctorAvailability(doctorId);

  const [newSlot, setNewSlot] = useState<CreateDoctorAvailabilityBody>({
    dayOfWeek: "Monday",
    startTime: "08:00",
    endTime: "12:00",
  });
  const [queue, setQueue] = useState<CreateDoctorAvailabilityBody[]>([]);
  const [edits, setEdits] = useState<Record<string, UpdateDoctorAvailabilityBody>>({});

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
      toast.error("Trống danh sách", "Vui lòng thêm ít nhất một khung giờ vào danh sách tạo.");
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

  function patchRowDraft(row: DoctorAvailability, patch: Partial<UpdateDoctorAvailabilityBody>) {
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa khung giờ này không?")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {}
  }

  return (
    <div className="space-y-8">
      {/* Create Section */}
      <section className="rounded-2xl border border-gray-400 bg-gray-50/50 p-6 dark:border-white/10 dark:bg-white/5">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Thêm lịch làm việc mới</h3>
        <p className="text-xs text-gray-500 mt-1">Cấu hình khung giờ cố định lặp lại hàng tuần.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Thứ</label>
            <select
              value={newSlot.dayOfWeek}
              onChange={(e) => setNewSlot((prev) => ({ ...prev, dayOfWeek: e.target.value as DayOfWeek }))}
              className="input-primary w-full"
            >
              {dayOfWeekOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Bắt đầu</label>
            <TimeInput24h
              value={newSlot.startTime}
              onChange={(val) => setNewSlot((prev) => ({ ...prev, startTime: val }))}
              className="input-primary w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Kết thúc</label>
            <TimeInput24h
              value={newSlot.endTime}
              onChange={(val) => setNewSlot((prev) => ({ ...prev, endTime: val }))}
              className="input-primary w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleAddToQueue}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Thêm vào danh sách chờ
          </button>
          {queue.length > 0 && (
            <button
              onClick={() => setQueue([])}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Xóa tất cả ({queue.length})
            </button>
          )}
        </div>

        {queue.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 p-3 rounded-xl bg-white border border-gray-300 shadow-inner dark:bg-black/20 dark:border-white/5">
            {queue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold dark:bg-white/5">
                <span>{getDayLabel(item.dayOfWeek)}: {item.startTime} - {item.endTime}</span>
                <HiOutlineX onClick={() => handleRemoveFromQueue(idx)} className="cursor-pointer hover:text-red-500 transition-colors" />
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
            {createMutation.isPending ? "Đang xử lý..." : `Xác nhận tạo ${queue.length} khung giờ`}
          </button>
        )}
      </section>

      {/* List Section */}
      <section className="rounded-2xl border border-gray-400 bg-gray-50/50 p-6 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Lịch làm việc hiện tại</h3>
          <button
            onClick={() => void refetch()}
            className="text-xs font-medium text-primary hover:opacity-80 transition-all"
          >
            Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-500/10">
            <p className="text-sm text-red-600">{error?.message || "Lỗi tải dữ liệu"}</p>
          </div>
        ) : availabilities.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center text-gray-400 opacity-50">
            <HiOutlineCalendar className="h-10 w-10 mb-2" />
            <p className="text-sm">Chưa có khung giờ làm việc nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availabilities.map((item, idx) => {
              const rowId = getAvailabilityId(item);
              const draft = getRowDraft(item);
              const isEdited = !!edits[rowId];

              return (
                <div key={rowId || idx} className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] items-center gap-4 rounded-xl border border-gray-300 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-black/20">
                  <select
                    value={draft.dayOfWeek}
                    onChange={(e) => patchRowDraft(item, { dayOfWeek: e.target.value as DayOfWeek })}
                    className="input-primary py-1 px-3 text-xs w-full sm:w-auto"
                  >
                    {dayOfWeekOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <TimeInput24h
                    value={draft.startTime}
                    onChange={(val) => patchRowDraft(item, { startTime: val })}
                    className="input-primary py-1 px-3 text-xs w-full sm:w-auto"
                  />
                  <TimeInput24h
                    value={draft.endTime}
                    onChange={(val) => patchRowDraft(item, { endTime: val })}
                    className="input-primary py-1 px-3 text-xs w-full sm:w-auto"
                  />
                  <div className="flex items-center gap-2">
                    {isEdited ? (
                      <button
                        onClick={() => void handleSaveRow(item)}
                        className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition dark:bg-emerald-500/20 dark:text-emerald-400"
                      >
                        <HiOutlineCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => void handleDeleteRow(rowId)}
                        className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition dark:bg-red-500/20 dark:text-red-400"
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
  const { data, isLoading, isError, error, refetch } = useDoctorAvailabilityExceptions(doctorId);
  const updateMutation = useUpdateDoctorAvailabilityException(doctorId);
  const [view, setView] = useState<"pending" | "approved" | "rejected">("pending");

  const items = data ?? [];
  const pending = items.filter((item) => item.status === "Pending");
  const approved = items.filter((item) => item.status === "Approved");
  const rejected = items.filter((item) => item.status === "Rejected");
  const visibleItems = view === "pending" ? pending : view === "approved" ? approved : rejected;

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
    if (!window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu này không?")) return;
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
        <div className="flex p-1 rounded-xl bg-gray-100 dark:bg-white/5">
          <button
            onClick={() => setView("pending")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              view === "pending" ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-white" : "text-gray-400"
            }`}
          >
            Chờ duyệt ({pending.length})
          </button>
          <button
            onClick={() => setView("approved")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              view === "approved" ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-white" : "text-gray-400"
            }`}
          >
            Đã duyệt ({approved.length})
          </button>
          <button
            onClick={() => setView("rejected")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              view === "rejected" ? "bg-white text-primary shadow-sm dark:bg-primary dark:text-white" : "text-gray-400"
            }`}
          >
            Từ chối ({rejected.length})
          </button>
        </div>
        <button onClick={() => void refetch()} className="text-xs font-medium text-primary hover:opacity-80 transition-all">Làm mới</button>
      </div>

      {isLoading ? (
        <Spinner size="lg" className="mx-auto my-12" />
      ) : visibleItems.length === 0 ? (
        <div className="py-20 text-center text-gray-400">Không có yêu cầu nào</div>
      ) : (
        <div className="space-y-4">
          {visibleItems.map((item, i) => (
            <div key={item.exceptionId || i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-gray-300 bg-white dark:border-white/10 dark:bg-black/20">
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatRelativeTime(item.date)}</p>
                <p className="text-xs text-gray-500 font-medium">
                  {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                </p>
                <p className="text-xs italic text-gray-600 dark:text-gray-400">Lý do: {item.reason || "Không có"}</p>
              </div>
              {view === "pending" && (
                <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
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
  if (isError) return <div className="text-center text-red-500 py-10">Lỗi tải danh sách chứng chỉ</div>;

  const documents = data || [];

  if (documents.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-gray-400">
        <HiOutlineDocumentText className="h-16 w-16 mb-4 opacity-10" />
        <p>Bác sĩ này chưa tải lên chứng chỉ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => {
        const typeLabel = doctorDocumentTypeLabelMap[doc.documentType as DoctorDocumentType] || "Chứng chỉ y tế";
        const isPdf = doc.fileUrl?.toLowerCase().includes(".pdf");
        const status = (doc.status || "pending").toLowerCase();

        return (
          <div key={doc.documentId} className="flex items-center gap-5 p-5 rounded-2xl border border-gray-300 bg-white dark:border-white/10 dark:bg-black/20">
            <a
              href={doc.fileUrl} target="_blank" rel="noreferrer"
              className="h-16 w-16 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 overflow-hidden hover:scale-105 transition dark:bg-white/5"
            >
              {isPdf ? <span className="text-2xl">📄</span> : <img src={doc.fileUrl} className="h-full w-full object-cover" />}
            </a>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate dark:text-white">{typeLabel}</p>
              <p className="text-xs text-gray-500 mt-1">Nộp lúc: {doc.submittedAt ? formatRelativeTime(doc.submittedAt) : "N/A"}</p>
            </div>
            <Badge
              type={status === "approved" ? "success" : status === "rejected" ? "error" : "warning"}
              value={status === "approved" ? "Đã duyệt" : status === "rejected" ? "Bị từ chối" : "Đang chờ"}
            />
          </div>
        );
      })}
    </div>
  );
}
