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
import { Input } from "@/components/custom-ui/Input";

// --- HELPERS ---

function toApiTime(value: string): string {
  if (!value) return value;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}$/.test(value)) return `${value}:00`;
  return value.includes(":") && value.split(":").length === 2
    ? `${value}:00`
    : value;
}

// --- COMPONENT: DATE INPUT MASK ---
function DateInputMask({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) {
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
  useMemo(() => {
    setVal(value);
  }, [value]);

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
    if (!form.date || !form.startTime || !form.endTime || !form.reason.trim()) {
      toast.error(
        "Thiếu thông tin",
        "Vui lòng nhập đủ ngày, giờ và lý do nghỉ.",
      );
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
    } catch {}
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="z-10 flex h-[90vh] max-h-[820px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Quản lý lịch nghỉ bác sĩ
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
              <div className="space-y-8">
                {/* Section Thêm lịch nghỉ */}
                <section>
                  <h3 className="mb-4 text-[13px] font-semibold text-gray-900 dark:text-white">
                    Thêm lịch nghỉ mới
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                        Ngày nghỉ (DD/MM/YYYY)
                      </p>
                      <DateInputMask
                        value={form.date}
                        onChange={(val: string) =>
                          setForm((prev) => ({ ...prev, date: val }))
                        }
                        className="focus:border-primary/30 w-full rounded-xl border border-gray-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <Input
                      label="Lý do nghỉ"
                      placeholder="Nhập lý do..."
                      value={form.reason}
                      onChange={(val) =>
                        setForm((prev) => ({ ...prev, reason: val }))
                      }
                    />
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                        Giờ bắt đầu
                      </p>
                      <TimeInput24h
                        value={form.startTime}
                        onChange={(val: string) =>
                          setForm((prev) => ({ ...prev, startTime: val }))
                        }
                        className="focus:border-primary/30 w-full rounded-xl border border-gray-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                        Giờ kết thúc
                      </p>
                      <TimeInput24h
                        value={form.endTime}
                        onChange={(val: string) =>
                          setForm((prev) => ({ ...prev, endTime: val }))
                        }
                        className="focus:border-primary/30 w-full rounded-xl border border-gray-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => void handleCreate()}
                      disabled={createMutation.isPending}
                      className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {createMutation.isPending
                        ? "Đang xử lý..."
                        : "Gửi lịch nghỉ chờ duyệt"}
                    </button>
                  </div>
                </section>

                <div className="h-px bg-gray-400/50 dark:bg-white/10" />

                {/* Section Danh sách lịch nghỉ */}
                <section>
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white">
                      Danh sách lịch nghỉ
                    </h3>
                    <button
                      onClick={() => void refetch()}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Làm mới
                    </button>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      <ExceptionList
                        title="Chờ duyệt"
                        items={pendingItems}
                        onDelete={handleDelete}
                        showDelete
                      />
                      <ExceptionList
                        title="Đã duyệt"
                        items={approvedItems}
                        onDelete={handleDelete}
                        showDelete={false}
                      />
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* Footer */}
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
  onDelete: (i: any) => void;
  showDelete: boolean;
}) {
  return (
    <div className="flex flex-col">
      <h4 className="mb-3 text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
        {title}{" "}
        <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-gray-700 dark:bg-white/10 dark:text-gray-300">
          {items.length}
        </span>
      </h4>
      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-400 bg-white/50 p-6 text-center dark:border-white/10 dark:bg-white/5">
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            Chưa có dữ liệu
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.exceptionId}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-400 bg-white text-sm shadow-sm transition-all hover:border-gray-900/10 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
            >
              <div className="flex items-start justify-between border-b border-gray-400 bg-gray-50/50 p-3 dark:border-white/5 dark:bg-black/20">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${item.isAvailableOverride ? "bg-green-500" : "bg-primary"}`}
                  />
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDateTimeDisplay(item.date).split(" ")[0]}
                  </p>
                </div>
                {showDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5 p-3 text-[12px]">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Thời gian:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    Lý do:
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {item.reason || "Không có lý do"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
