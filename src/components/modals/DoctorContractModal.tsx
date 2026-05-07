import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { HiOutlineX } from "react-icons/hi";
import {
  useCreateDoctorContract,
  useUpdateDoctorContract,
} from "@/hooks/data/useDoctorContractHooks";
import type {
  DoctorContract,
  UpdateDoctorContractBody,
} from "@/types/DoctorContract";
import { Input } from "@/components/custom-ui/Input";
import GlassSelect from "@/components/custom-ui/Select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: DoctorContract | null;
}

export function DoctorContractModal({ isOpen, onClose, initialData }: Props) {
  const createMutation = useCreateDoctorContract();
  const updateMutation = useUpdateDoctorContract();

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    status: "Active",
    note: "",
  });
  const [file, setFile] = useState<File | null>(null);

  // Load data khi edit
  useMemo(() => {
    if (initialData) {
      setForm({
        startDate: initialData.startDate?.split("T")[0] || "",
        endDate: initialData.endDate?.split("T")[0] || "",
        status: initialData.status,
        note: initialData.note || "",
      });
    } else {
      setForm({ startDate: "", endDate: "", status: "Active", note: "" });
      setFile(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        // Update
        await updateMutation.mutateAsync({
          id: initialData.contractId,
          data: { ...form, file } as UpdateDoctorContractBody,
        });
      } else {
        // Create
        if (!file) {
          alert("Vui lòng chọn file hợp đồng");
          return;
        }
        await createMutation.mutateAsync({ ...form, file });
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

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
            className="z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {initialData ? "Cập nhật Hợp đồng" : "Thêm Hợp đồng mới"}
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
              <form id="contract-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ngày bắt đầu"
                    type="date"
                    value={form.startDate}
                    onChange={(val) => setForm({ ...form, startDate: val })}
                    required
                  />
                  <Input
                    label="Ngày kết thúc"
                    type="date"
                    value={form.endDate}
                    onChange={(val) => setForm({ ...form, endDate: val })}
                    required
                  />
                </div>

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

                <div className="flex flex-col gap-1.5">
                   <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                    File hợp đồng (PDF/Ảnh)
                  </p>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-gray-400 bg-white px-4 py-2 text-xs font-medium text-gray-600 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold hover:border-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:file:bg-white/10 dark:file:text-white"
                    required={!initialData}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                    Ghi chú
                  </p>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="h-24 w-full resize-none rounded-xl border border-gray-400 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-primary/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
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
                form="contract-form"
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Đang lưu..." : initialData ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
