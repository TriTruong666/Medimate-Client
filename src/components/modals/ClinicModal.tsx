import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { HiOutlineX } from "react-icons/hi";
import { useCreateClinic, useUpdateClinic } from "@/hooks/data/useClinicHooks";
import type { ClinicDto } from "@/apis/clinic.service";
import { Input } from "@/components/custom-ui/Input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData: ClinicDto | null;
}

const FILE_INPUT_CLASS =
  "w-full rounded-xl border border-gray-400 bg-white px-4 py-2 text-xs font-medium text-gray-600 outline-none transition-all file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-xs file:font-semibold hover:border-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:file:bg-white/10 dark:file:text-white";

export function ClinicModal({ isOpen, onClose, initialData }: Props) {
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useMemo(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        address: initialData.address,
        email: initialData.email,
        bankName: initialData.bankName,
        bankAccountNumber: initialData.bankAccountNumber,
        bankAccountHolder: initialData.bankAccountHolder,
      });
    } else {
      setForm({
        name: "",
        address: "",
        email: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountHolder: "",
      });
      setLicenseFile(null);
      setLogoFile(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateMutation.mutateAsync({
          clinicId: initialData.clinicId,
          body: {
            ...form,
            licenseFile: licenseFile ?? undefined,
            logoFile: logoFile ?? undefined,
          },
        });
      } else {
        if (!licenseFile) {
          alert("Vui lòng chọn file giấy phép");
          return;
        }
        await createMutation.mutateAsync({
          ...form,
          licenseFile,
          logoFile: logoFile ?? undefined,
        });
      }
      onClose();
    } catch {}
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const field = (
    key: keyof typeof form,
    label: string,
    placeholder: string,
    type = "text",
  ) => (
    <Input
      label={label}
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={(val) => setForm({ ...form, [key]: val })}
      required={!initialData}
    />
  );

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
            className="z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/90 dark:backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {initialData ? "Cập nhật Phòng khám" : "Thêm Phòng khám mới"}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[75vh] overflow-y-auto p-6">
              <form
                id="clinic-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {field(
                    "name",
                    "Tên phòng khám",
                    "VD: Phòng khám Đa khoa ABC",
                  )}
                  {field("email", "Email", "email@phongkham.vn", "email")}
                </div>
                {field(
                  "address",
                  "Địa chỉ",
                  "Số nhà, đường, quận/huyện, tỉnh/thành",
                )}

                {/* Giấy phép & Logo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                      Giấy phép hành nghề{" "}
                      <span className="text-red-500">*</span>
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setLicenseFile(e.target.files?.[0] ?? null)
                      }
                      className={FILE_INPUT_CLASS}
                      required={!initialData}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                      Logo phòng khám
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                      className={FILE_INPUT_CLASS}
                    />
                  </div>
                </div>

                {/* Banking */}
                <div className="rounded-xl border border-gray-400 p-4 dark:border-white/10">
                  <p className="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                    Thông tin ngân hàng
                  </p>
                  <div className="space-y-3">
                    {field("bankName", "Tên ngân hàng", "VD: Vietcombank")}
                    <div className="grid grid-cols-2 gap-4">
                      {field(
                        "bankAccountNumber",
                        "Số tài khoản",
                        "VD: 0123456789",
                      )}
                      {field(
                        "bankAccountHolder",
                        "Chủ tài khoản",
                        "VD: NGUYEN VAN A",
                      )}
                    </div>
                  </div>
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
                form="clinic-form"
                type="submit"
                disabled={isPending}
                className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending
                  ? "Đang lưu..."
                  : initialData
                    ? "Cập nhật"
                    : "Tạo phòng khám"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
