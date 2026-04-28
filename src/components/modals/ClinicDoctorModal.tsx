import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { HiOutlineX } from "react-icons/hi";
import {
  useAddDoctorToClinic,
  useUpdateClinicDoctor,
} from "@/hooks/data/useClinicHooks";
import type { ClinicDoctorDto } from "@/apis/clinic.service";
import { Input } from "@/components/custom-ui/Input";
import GlassSelect from "@/components/custom-ui/Select";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  initialData: ClinicDoctorDto | null;
}

export function ClinicDoctorModal({
  isOpen,
  onClose,
  clinicId,
  initialData,
}: Props) {
  const addMutation = useAddDoctorToClinic();
  const updateMutation = useUpdateClinicDoctor();

  const [form, setForm] = useState({
    doctorId: "",
    specialty: "",
    consultationFee: "",
    status: "Active",
  });

  useMemo(() => {
    if (initialData) {
      setForm({
        doctorId: initialData.doctorId,
        specialty: initialData.specialty ?? "",
        consultationFee: String(initialData.consultationFee),
        status: initialData.status,
      });
    } else {
      setForm({
        doctorId: "",
        specialty: "",
        consultationFee: "",
        status: "Active",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateMutation.mutateAsync({
          clinicDoctorId: initialData.id,
          body: {
            specialty: form.specialty || undefined,
            consultationFee: Number(form.consultationFee) || undefined,
            status: form.status,
          },
        });
      } else {
        if (!form.doctorId) {
          alert("Vui lòng nhập ID bác sĩ");
          return;
        }
        await addMutation.mutateAsync({
          clinicId,
          body: {
            doctorId: form.doctorId,
            specialty: form.specialty || undefined,
            consultationFee: Number(form.consultationFee),
          },
        });
      }
      onClose();
    } catch {}
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

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
                  ? "Cập nhật Bác sĩ Phòng khám"
                  : "Thêm Bác sĩ vào Phòng khám"}
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
                id="clinic-doctor-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {!initialData && (
                  <Input
                    label="Doctor ID"
                    placeholder="Nhập ID bác sĩ (UUID)"
                    value={form.doctorId}
                    onChange={(val) => setForm({ ...form, doctorId: val })}
                    required
                  />
                )}
                {initialData && (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-400 p-3 dark:border-white/10">
                    {initialData.doctorAvatar && (
                      <img
                        src={initialData.doctorAvatar}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {initialData.doctorName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {initialData.doctorId.slice(0, 12)}...
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Chuyên khoa"
                    placeholder="VD: Nội khoa"
                    value={form.specialty}
                    onChange={(val) => setForm({ ...form, specialty: val })}
                  />
                  <Input
                    label="Giá khám (VNĐ)"
                    type="number"
                    placeholder="VD: 200000"
                    value={form.consultationFee}
                    onChange={(val) =>
                      setForm({ ...form, consultationFee: val })
                    }
                  />
                </div>

                {initialData && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
                      Trạng thái
                    </p>
                    <GlassSelect
                      value={form.status}
                      onChange={(val) => setForm({ ...form, status: val })}
                      options={[
                        { label: "Đang hoạt động", value: "Active" },
                        { label: "Tạm ngừng", value: "Inactive" },
                      ]}
                    />
                  </div>
                )}
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
                form="clinic-doctor-form"
                type="submit"
                disabled={isPending}
                className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isPending
                  ? "Đang lưu..."
                  : initialData
                    ? "Cập nhật"
                    : "Thêm bác sĩ"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
