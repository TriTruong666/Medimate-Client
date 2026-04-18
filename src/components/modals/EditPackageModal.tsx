import clsx from "clsx";
import { HiOutlineX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import type { UpdatePackageRequest } from "@/types/Package";

export type EditPackageFormErrors = Partial<
  Record<keyof UpdatePackageRequest, string>
>;

type EditPackageModalProps = {
  value: UpdatePackageRequest;
  errors: EditPackageFormErrors;
  isPending: boolean;
  title?: string;
  submitLabel?: string;
  onClose: () => void;
  onChange: <K extends keyof UpdatePackageRequest>(
    field: K,
    nextValue: UpdatePackageRequest[K],
  ) => void;
  onSubmit: () => void;
  open?: boolean; // Added open prop for AnimatePresence
};

export function EditPackageModal({
  value,
  errors,
  isPending,
  title = "Chỉnh sửa gói",
  submitLabel = "Lưu thay đổi",
  onClose,
  onChange,
  onSubmit,
  open = true,
}: EditPackageModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-gray-50/50 p-6 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Tên gói"
                  value={value.packageName}
                  error={errors.packageName}
                  onChange={(next) => onChange("packageName", next)}
                />
                <InputField
                  label="Loại tiền"
                  value={value.currency}
                  error={errors.currency}
                  onChange={(next) => onChange("currency", next)}
                />
                <InputField
                  label="Giá"
                  type="number"
                  value={value.price}
                  error={errors.price}
                  onChange={(next) => onChange("price", Number(next))}
                />
                <InputField
                  label="Thời hạn (ngày)"
                  type="number"
                  value={value.durationDays}
                  error={errors.durationDays}
                  onChange={(next) => onChange("durationDays", Number(next))}
                />
                <InputField
                  label="Giới hạn thành viên"
                  type="number"
                  value={value.memberLimit}
                  error={errors.memberLimit}
                  onChange={(next) => onChange("memberLimit", Number(next))}
                />
                <InputField
                  label="Giới hạn OCR"
                  type="number"
                  value={value.ocrLimit}
                  error={errors.ocrLimit}
                  onChange={(next) => onChange("ocrLimit", Number(next))}
                />
                <InputField
                  label="Giới hạn tư vấn"
                  type="number"
                  value={value.consultantLimit}
                  error={errors.consultantLimit}
                  onChange={(next) => onChange("consultantLimit", Number(next))}
                />
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-[12px] font-medium text-gray-500 dark:text-gray-400">
                    Mô tả
                  </label>
                  <textarea
                    value={value.description}
                    onChange={(event) =>
                      onChange("description", event.target.value)
                    }
                    rows={3}
                    placeholder="Nhập mô tả gói dịch vụ..."
                    className="input-primary min-h-[100px] w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                {isPending ? "Đang lưu..." : submitLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function InputField({
  label,
  value,
  error,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  error?: string;
  onChange: (next: string) => void;
  type?: "text" | "number";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={clsx(
          "input-primary w-full",
          error && "border-red-500! dark:border-red-500/50!"
        )}
      />
      {error && <p className="text-[12px] text-red-500 italic">{error}</p>}
    </div>
  );
}

