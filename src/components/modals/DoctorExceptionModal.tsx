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
  return value.length === 5 ? `${value}:00` : value;
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
      const convertedDate = convertToVNDateISOString(form.date);
      if (!convertedDate) {
        toast.error("Ngày nghỉ không hợp lệ", "Vui lòng chọn lại ngày nghỉ.");
        return;
      }

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
                  <label className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                    Ngày nghỉ
                    <input
                      type="datetime-local"
                      value={form.date}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, date: event.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    />
                  </label>

                  <label className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                    Lý do nghỉ
                    <input
                      type="text"
                      value={form.reason}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, reason: event.target.value }))
                      }
                      placeholder="Ví dụ: Nghỉ phép cá nhân"
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    />
                  </label>

                  <label className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                    Giờ bắt đầu
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, startTime: event.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    />
                  </label>

                  <label className="text-[11px] font-bold text-gray-500 uppercase dark:text-gray-400">
                    Giờ kết thúc
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, endTime: event.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => void handleCreate()}
                  disabled={createMutation.isPending}
                  className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/10"
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

            <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10 dark:bg-white/5">
              <button
                onClick={onClose}
                className="rounded-lg px-6 py-2.5 text-sm font-bold text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
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
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-red-100 px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-200 dark:hover:bg-red-500/30 active:scale-95"
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
