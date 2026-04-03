import { HiOutlineX } from "react-icons/hi";
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
}: EditPackageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-gray-400">Mô tả</label>
              <textarea
                value={value.description}
                onChange={(event) => onChange("description", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-white/10 disabled:text-white/40"
          >
            {isPending ? "Đang lưu..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
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
    <div>
      <label className="mb-1 block text-xs text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white outline-none transition ${
          error
            ? "border-red-500/50 focus:border-red-400"
            : "border-white/10 focus:border-white/20"
        }`}
      />
      {error && <p className="mt-1 text-[11px] italic text-red-500">{error}</p>}
    </div>
  );
}
