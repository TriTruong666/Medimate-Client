import {
  useCreateDoctorAvailabilityException,
  useDeleteDoctorAvailabilityException,
  useDoctorAvailabilityExceptions,
} from "@/hooks/data/useDoctorAvailabilityExceptionHooks";
import { formatDate } from "@/common/format";
import { Spinner } from "@/components/custom-ui/Spinner";
import type { DoctorAvailabilityException } from "@/types/DoctorAvailabilityException";
import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo, useState } from "react";
import { HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { toast } from "@/hooks/useToast";

// --- HELPERS ---

function toApiTime(value: string): string {
  if (!value) return value;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value.includes(":") && value.split(":").length === 2 ? `${value}:00` : value;
}

// --- COMPONENT: DATE INPUT MASK (Sửa lỗi nhập ngày 21 thành 02/01) ---
function DateInputMask({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) {
  const [displayVal, setDisplayVal] = useState("");

  useMemo(() => {
    if (!value) {
      setDisplayVal("");
      return;
    }
    const parts = value.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      setDisplayVal(`${d}/${m}/${y}`);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.length > 8) input = input.substring(0, 8);

    let formatted = input;
    if (input.length > 4) {
      formatted = `${input.substring(0, 2)}/${input.substring(2, 4)}/${input.substring(4, 8)}`;
    } else if (input.length > 2) {
      formatted = `${input.substring(0, 2)}/${input.substring(2, 4)}`;
    }

    setDisplayVal(formatted);

    if (input.length === 8) {
      const d = input.substring(0, 2);
      const m = input.substring(2, 4);
      const y = input.substring(4, 8);
      onChange(`${y}-${m}-${d}`);
    }
  };

  return (
    <input
      type="text"
      value={displayVal}
      onChange={handleChange}
      placeholder="DD/MM/YYYY"
      maxLength={10}
      className={className}
    />
  );
}

// --- COMPONENT: TIME INPUT 24H ---
function TimeInput24h({ value, onChange, disabled, className }: { value: string, onChange: (val: string) => void, disabled?: boolean, className?: string }) {
  const [val, setVal] = useState(value);
  useMemo(() => { setVal(value); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d:]/g, "");
    setVal(input);
  };

  const handleBlur = () => {
    let v = val.trim();
    if (/^\d{4}$/.test(v)) {
      v = `${v.substring(0, 2)}:${v.substring(2, 4)}`;
    }
    if (/^\d{1,2}:\d{1,2}$/.test(v)) {
      let [h, m] = v.split(":");
      let hh = Math.min(23, Math.max(0, parseInt(h) || 0));
      let mm = Math.min(59, Math.max(0, parseInt(m) || 0));
      let formatted = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      setVal(formatted);
      onChange(formatted);
    } else {
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

// --- MAIN MODAL ---
export function DoctorExceptionModal({
  doctorId,
  open,
  onClose,
}: {
  doctorId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading, isError, error, refetch } = useDoctorAvailabilityExceptions(doctorId);
  const createMutation = useCreateDoctorAvailabilityException(doctorId);
  const deleteMutation = useDeleteDoctorAvailabilityException(doctorId);

  const [form, setForm] = useState({
    date: "",
    startTime: "08:00",
    endTime: "12:00",
    reason: "",
  });

  const exceptions = data ?? [];
  const pendingItems = useMemo(() => exceptions.filter((item) => !item.isAvailableOverride), [exceptions]);
  const approvedItems = useMemo(() => exceptions.filter((item) => item.isAvailableOverride), [exceptions]);

  async function handleCreate() {
    if (!form.date || !form.startTime || !form.endTime || !form.reason.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập đủ ngày, giờ và lý do nghỉ.");
      return;
    }

    try {
      const dateParts = form.date.split("-").map(Number);
      const [year, month, day] = dateParts;
      const dateObj = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

      if (Number.isNaN(dateObj.getTime())) {
        toast.error("Ngày không hợp lệ", "Vui lòng kiểm tra lại ngày nhập.");
        return;
      }

      await createMutation.mutateAsync({
        date: dateObj.toISOString(),
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
        reason: form.reason.trim(),
        isAvailableOverride: false,
      });

      setForm({ date: "", startTime: "08:00", endTime: "12:00", reason: "" });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(item: DoctorAvailabilityException) {
    if (item.isAvailableOverride) {
      toast.error("Không thể xóa", "Lịch nghỉ đã được duyệt không thể xóa.");
      return;
    }
    if (!item.exceptionId) return;
    if (!window.confirm("Bạn có chắc muốn xóa lịch nghỉ này?")) return;
    try {
      await deleteMutation.mutateAsync(item.exceptionId);
    } catch { }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 flex h-[90vh] max-h-[820px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-400 p-4 dark:border-white/10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lịch nghỉ bác sĩ</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900"><HiOutlineX className="h-5 w-5" /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 thin-scrollbar">
              <section className="rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Thêm lịch nghỉ</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Ngày nghỉ (DD/MM/YYYY)</label>
                    <DateInputMask
                      value={form.date}
                      onChange={(val: string) => setForm((prev) => ({ ...prev, date: val }))}
                      className="input-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Lý do nghỉ</label>
                    <input
                      type="text"
                      value={form.reason}
                      onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                      className="input-primary w-full"
                      placeholder="Lý do..."
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Giờ bắt đầu</label>
                    <TimeInput24h value={form.startTime} onChange={(val: string) => setForm((prev) => ({ ...prev, startTime: val }))} className="input-primary w-full" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-gray-500">Giờ kết thúc</label>
                    <TimeInput24h value={form.endTime} onChange={(val: string) => setForm((prev) => ({ ...prev, endTime: val }))} className="input-primary w-full" />
                  </div>
                </div>
                <button
                  onClick={() => void handleCreate()}
                  disabled={createMutation.isPending}
                  className="mt-5 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50"
                >
                  {createMutation.isPending ? "Đang tạo..." : "Gửi lịch nghỉ chờ duyệt"}
                </button>
              </section>

              <section className="mt-6 rounded-2xl border border-gray-400 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Danh sách lịch nghỉ</h3>
                  <button onClick={() => void refetch()} className="text-xs">Làm mới</button>
                </div>
                {isLoading ? <Spinner size="lg" /> : (
                  <div className="space-y-6">
                    <ExceptionList title="Chưa duyệt" items={pendingItems} onDelete={handleDelete} showDelete />
                    <ExceptionList title="Đã duyệt" items={approvedItems} onDelete={handleDelete} showDelete={false} />
                  </div>
                )}
              </section>
            </div>
            <div className="flex justify-end p-6 border-t dark:border-white/10">
              <button onClick={onClose}>Đóng</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ExceptionList({ title, items, onDelete, showDelete }: { title: string, items: DoctorAvailabilityException[], onDelete: (i: any) => void, showDelete: boolean }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-bold text-gray-500 uppercase">{title} ({items.length})</h4>
      {items.length === 0 ? <div className="p-6 text-center text-xs text-gray-400">Chưa có dữ liệu</div> : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.exceptionId} className="flex justify-between items-center p-4 bg-white rounded-xl border dark:bg-black/20">
              <div className="text-xs">
                <p className="font-bold">{formatDateTimeDisplay(item.date)}</p>
                <p>{item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}</p>
                <p className="italic">Lý do: {item.reason}</p>
              </div>
              {showDelete && (
                <button onClick={() => onDelete(item)} className="text-red-600"><HiOutlineTrash /></button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}