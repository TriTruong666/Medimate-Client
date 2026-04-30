import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { HiOutlineX } from "react-icons/hi";
import {
  useCreateClinicContract,
  useUpdateContractStatus,
} from "@/hooks/data/useClinicHooks";
import type { ClinicContractDto } from "@/apis/clinic.service";
import { Input } from "@/components/custom-ui/Input";
import GlassSelect from "@/components/custom-ui/Select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: ClinicContractDto | null;
  clinicId?: string;
}

const FILE_INPUT_CLASS =
  "w-full rounded-xl border border-gray-400 bg-white px-4 py-2 text-xs font-medium text-gray-600 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold hover:border-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:file:bg-white/10 dark:file:text-white";

export function ClinicContractModal({
  isOpen,
  onClose,
  initialData,
  clinicId,
}: Props) {
  const createMutation = useCreateClinicContract();
  const updateStatusMutation = useUpdateContractStatus();

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    status: "Active",
    note: "",
  });
  const [contractFile, setContractFile] = useState<File | null>(null);

  useMemo(() => {
    if (initialData) {
      setForm({
        startDate: initialData.startDate?.split("T")[0] ?? "",
        endDate: initialData.endDate?.split("T")[0] ?? "",
        status: initialData.status,
        note: initialData.note ?? "",
      });
    } else {
      setForm({ startDate: "", endDate: "", status: "Active", note: "" });
      setContractFile(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateStatusMutation.mutateAsync({
          contractId: initialData.contractId,
          status: form.status,
        });
      } else {
        const targetClinicId = clinicId ?? "";
        if (!targetClinicId) {
          alert("Chưa chọn phòng khám");
          return;
        }
        await createMutation.mutateAsync({
          clinicId: targetClinicId,
          body: {
            clinicId: targetClinicId,
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            note: form.note || undefined,
            contractFile: contractFile ?? undefined,
          },
        });
      }
      onClose();
    } catch {}
  };

  const isPending = createMutation.isPending || updateStatusMutation.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/90 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {initialData
                  ? "Cập nhật trạng thái Hợp đồng"
                  : "Thêm Hợp đồng Phòng khám"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <form
                id="clinic-contract-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!initialData && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Ngày bắt đầu"
                      type="date"
                      value={form.startDate}
                      onChange={(val) => setForm({ ...form, startDate: val })}
                    />
                    <Input
                      label="Ngày kết thúc"
                      type="date"
                      value={form.endDate}
                      onChange={(val) => setForm({ ...form, endDate: val })}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                    Trạng thái hợp đồng
                  </p>
                  <GlassSelect
                    value={form.status}
                    onChange={(val) => setForm({ ...form, status: val })}
                    options={[
                      { label: "Đang hiệu lực", value: "Active" },
                      { label: "Hết hạn", value: "Expired" },
                      { label: "Đã chấm dứt", value: "Terminated" },
                    ]}
                  />
                </div>

                {!initialData && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                      File hợp đồng (PDF/Ảnh)
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setContractFile(e.target.files?.[0] ?? null)
                      }
                      className={FILE_INPUT_CLASS}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                    Ghi chú
                  </p>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="focus:border-primary/30 h-24 w-full resize-none rounded-xl border border-gray-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-all outline-none placeholder:text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Nhập ghi chú quan trọng..."
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                form="clinic-contract-form"
                type="submit"
                disabled={isPending}
                className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending
                  ? "Đang lưu..."
                  : initialData
                    ? "Cập nhật trạng thái"
                    : "Tạo hợp đồng"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
