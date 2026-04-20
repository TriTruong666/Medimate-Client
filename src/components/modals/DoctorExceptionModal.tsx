import {
  useCreateDoctorAvailabilityException,
  useDeleteDoctorAvailabilityException,
  useDoctorAvailabilityExceptions,
} from "@/hooks/data/useDoctorAvailabilityExceptionHooks";
import { convertToVNDateISOString, formatDate } from "@/common/format";
import { Spinner } from "@/components/custom-ui/Spinner";
import type { DoctorAvailabilityException } from "@/types/DoctorAvailabilityException";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { toast } from "@/hooks/useToast";

function toApiTime(value: string): string {
  if (!value) return value;
  // Đã đúng format HH:MM:SS
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  // HH:MM → HH:MM:00
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  
  const parsed = new Date(`1970-01-01 ${value}`);
  if (!isNaN(parsed.getTime())) {
    const h = String(parsed.getHours()).padStart(2, "0");
    const m = String(parsed.getMinutes()).padStart(2, "0");
    return `${h}:${m}:00`;
  }
  
  return value.includes(":") && value.split(":").length === 2
    ? `${value}:00`
    : value;
}

// CUSTOM 24H TIME INPUT (Tránh trình duyệt ép AM/PM theo hệ điều hành)
function TimeInput24h({ value, onChange, disabled, className }: { value: string, onChange: (val: string) => void, disabled?: boolean, className?: string }) {
  const [val, setVal] = useState(value);

  // Sync state if props change
  useMemo(() => { setVal(value); }, [value]);

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

function formatDateTimeDisplay(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${formatDate(value)} ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function validateForm(form: {
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}): boolean {
  if (!form.date || !form.startTime || !form.endTime || !form.reason.trim()) {
    toast.error("Thiếu thông tin", "Vui lòng nhập đủ ngày, giờ và lý do nghỉ.");
    return false;
  }

  if (form.startTime >= form.endTime) {
    toast.error("Thời gian không hợp lệ", "Giờ bắt đầu phải sớm hơn giờ kết thúc.");
    return false;
  }

  return true;
}

export function DoctorExceptionModal({
  doctorId,
  open,
  onClose,
}: {
  doctorId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error, refetch } =
    useDoctorAvailabilityExceptions(doctorId);
  const createMutation = useCreateDoctorAvailabilityException(doctorId);
  const deleteMutation = useDeleteDoctorAvailabilityException(doctorId);

  const [form, setForm] = useState({
    date: "",
    startTime: "08:00",
    endTime: "12:00",
    reason: "",
  });

  const exceptions = data ?? [];

  const pendingItems = useMemo(
    () => exceptions.filter((item) => !item.isAvailableOverride),
    [exceptions],
  );
  const approvedItems = useMemo(
    () => exceptions.filter((item) => item.isAvailableOverride),
    [exceptions],
  );

  async function handleCreate() {
    if (!validateForm(form)) {
      return;
    }

    try {
      const dateObj = new Date(form.date);
      if (Number.isNaN(dateObj.getTime())) {
        toast.error("Ngày nghỉ không hợp lệ", "Vui lòng chọn lại ngày nghỉ.");
        return;
      }
      // Send as ISO string representing midnight UTC
      const convertedDate = dateObj.toISOString();

      await createMutation.mutateAsync({
        date: convertedDate,
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
        reason: form.reason.trim(),
        isAvailableOverride: false,
      });
      setForm({ date: "", startTime: "08:00", endTime: "12:00", reason: "" });
    } catch {
      // Handled by mutation onError
    }
  }

  async function handleDelete(item: DoctorAvailabilityException) {
    if (item.isAvailableOverride) {
      toast.error("Không thể xóa", "Lịch nghỉ đã được duyệt không thể xóa.");
      return;
    }

    if (!item.exceptionId) {
      toast.error("Thiếu ID", "Không tìm thấy ID lịch nghỉ để xóa.");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xóa lịch nghỉ này?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(item.exceptionId);
    } catch {
      // Handled by mutation onError
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex h-[90vh] min-h-0 max-h-[820px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-4 md:px-6 dark:border-white/10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lịch nghỉ bác sĩ</h2>
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tạo lịch nghỉ khẩn cấp (chờ duyệt), xem và xóa lịch chưa duyệt.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 thin-scrollbar">
              <section className="rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thêm lịch nghỉ</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Ngày nghỉ</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, date: event.target.value }))
                      }
                      className="input-primary w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Lý do nghỉ</label>
                    <input
                      type="text"
                      value={form.reason}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, reason: event.target.value }))
                      }
                      placeholder="Ví dụ: Nghỉ phép cá nhân"
                      className="input-primary w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Giờ bắt đầu</label>
                    <TimeInput24h
                      value={form.startTime}
                      onChange={(val) =>
                        setForm((prev) => ({ ...prev, startTime: val }))
                      }
                      className="input-primary w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Giờ kết thúc</label>
                    <TimeInput24h
                      value={form.endTime}
                      onChange={(val) =>
                        setForm((prev) => ({ ...prev, endTime: val }))
                      }
                      className="input-primary w-full"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={createMutation.isPending}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
                >
                  {createMutation.isPending ? "Đang tạo..." : "Gửi lịch nghỉ chờ duyệt"}
                </button>
              </section>

              <section className="mt-6 rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Danh sách lịch nghỉ</h3>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    Làm mới
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Spinner size="lg" />
                  </div>
                ) : isError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
                    {error?.message || "Không thể tải lịch nghỉ."}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ExceptionList
                      title={`Chưa duyệt (${pendingItems.length})`}
                      items={pendingItems}
                      onDelete={handleDelete}
                      showDelete
                    />
                    <ExceptionList
                      title={`Đã duyệt (${approvedItems.length})`}
                      items={approvedItems}
                      onDelete={handleDelete}
                      showDelete={false}
                    />
                  </div>
                )}
              </section>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ExceptionList({
  title,
  items,
  onDelete,
  showDelete,
}: {
  title: string;
  items: DoctorAvailabilityException[];
  onDelete: (item: DoctorAvailabilityException) => void;
  showDelete: boolean;
}) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
        {title}
      </h4>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-100/50 px-3 py-6 text-center text-xs font-bold text-gray-400 dark:border-white/10 dark:bg-black/20">
          Chưa có dữ liệu
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.exceptionId}
              className="flex flex-col gap-4 rounded-xl border border-gray-300 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-black/20"
            >
              <div className="text-xs">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDateTimeDisplay(item.date)}</p>
                <p className="mt-1 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                </p>
                <p className="mt-2 font-medium text-gray-600 dark:text-gray-400 italic">Lý do: {item.reason || "Không có"}</p>
              </div>

              {showDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="inline-flex items-center gap-2 self-start rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30"
                >
                  <HiOutlineTrash className="h-4 w-4" /> Xóa
                </button>
              ) : (
                <span className="self-start rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  Đã duyệt
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
