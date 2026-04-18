import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";
import {
  useCreatePrescription,
  useUpdatePrescription,
} from "@/hooks/data/usePrescriptionHooks";
import { toast } from "@/hooks/useToast";
import type {
  CreatePrescriptionRequest,
  PrescriptionByDoctorDto,
  PrescriptionMedicineItem,
  UpdatePrescriptionRequest,
} from "@/types/Prescription";

type SubmitResult = {
  mode: "create" | "update";
  prescription?: PrescriptionByDoctorDto;
  openDetailAfterCreate?: boolean;
};

type Props = {
  open: boolean;
  sessionId: string;
  memberId: string;
  editingPrescription?: PrescriptionByDoctorDto | null;
  onClose: () => void;
  onSubmitted?: (result: SubmitResult) => void;
};

const defaultMedicine: PrescriptionMedicineItem = {
  medicineName: "",
  dosage: "",
  quantity: 1,
  unit: "Viên",
  instructions: "",
};

export function PrescriptionModal({
  open,
  sessionId,
  memberId,
  editingPrescription,
  onClose,
  onSubmitted,
}: Props) {
  const isEdit = !!editingPrescription;
  const { data: doctorProfile } = useDoctorMe(true);

  const [diagnosis, setDiagnosis] = useState(editingPrescription?.diagnosis || "");
  const [advice, setAdvice] = useState(editingPrescription?.advice || "");
  const [openDetailAfterCreate, setOpenDetailAfterCreate] = useState(true);
  const [medicines, setMedicines] = useState<PrescriptionMedicineItem[]>(
    editingPrescription?.medicines?.length
      ? editingPrescription.medicines
      : [defaultMedicine],
  );

  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const modalTitle = useMemo(() => {
    if (isEdit) return "Cập nhật đơn thuốc";
    return "Tạo đơn thuốc";
  }, [isEdit]);

  function addMedicine() {
    setMedicines((prev) => [...prev, { ...defaultMedicine }]);
  }

  function removeMedicine(index: number) {
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updateMedicineField(
    index: number,
    key: keyof PrescriptionMedicineItem,
    value: string | number,
  ) {
    setMedicines((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  }

  function validateForm() {
    if (!diagnosis.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập chẩn đoán.");
      return false;
    }

    if (!sessionId) {
      toast.error("Thiếu thông tin", "Không tìm thấy phiên khám.");
      return false;
    }

    if (!memberId) {
      toast.error("Thiếu thông tin", "Không tìm thấy bệnh nhân.");
      return false;
    }

    if (!medicines.length) {
      toast.error("Thiếu thông tin", "Vui lòng thêm ít nhất 1 thuốc.");
      return false;
    }

    const invalidMedicine = medicines.find(
      (item) =>
        !item.medicineName.trim() ||
        !item.dosage.trim() ||
        !item.instructions.trim() ||
        !item.unit.trim() ||
        item.quantity <= 0,
    );

    if (invalidMedicine) {
      toast.error("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin thuốc.");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    if (isEdit && editingPrescription) {
      const body: UpdatePrescriptionRequest = {
        diagnosis: diagnosis.trim(),
        advice: advice.trim() || undefined,
        medicines,
      };

      const result = await updateMutation.mutateAsync({
        id: editingPrescription.id,
        body,
      });

      if (result.success && result.data) {
        onSubmitted?.({ mode: "update", prescription: result.data });
        onClose();
      }
      return;
    }

    const doctorId = doctorProfile?.doctorId;
    if (!doctorId) {
      toast.error("Không thể tạo đơn", "Không tìm thấy thông tin bác sĩ.");
      return;
    }

    const body: CreatePrescriptionRequest = {
      consultanSessionId: sessionId,
      memberId,
      diagnosis: diagnosis.trim(),
      advice: advice.trim() || undefined,
      medicines,
    };

    const result = await createMutation.mutateAsync({ doctorId, body });

    if (result.success && result.data) {
      onSubmitted?.({
        mode: "create",
        prescription: result.data,
        openDetailAfterCreate,
      });
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl rounded-2xl border border-gray-400 bg-white shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/90"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-400 p-5 dark:border-white/10">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{modalTitle}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5 thin-scrollbar">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                    Chẩn đoán
                  </label>
                  <input
                    value={diagnosis}
                    onChange={(event) => setDiagnosis(event.target.value)}
                    placeholder="Ví dụ: Viêm họng cấp"
                    className="input-primary w-full"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                    Lời dặn
                  </label>
                  <input
                    value={advice}
                    onChange={(event) => setAdvice(event.target.value)}
                    placeholder="Ví dụ: Uống nhiều nước ấm"
                    className="input-primary w-full"
                  />
                </div>
              </div>

              {!isEdit && (
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openDetailAfterCreate}
                    onChange={(event) => setOpenDetailAfterCreate(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Mở chi tiết đơn ngay sau khi tạo
                </label>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Danh sách thuốc</h4>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <HiOutlinePlus className="h-4 w-4" />
                    Thêm thuốc
                  </button>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-50 p-4 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-100">
                  <p className="font-bold text-blue-900 dark:text-white">Cách nhập từng thuốc</p>
                  <ul className="mt-2 space-y-1 text-blue-800/90 dark:text-blue-50/90">
                    <li>
                      <span className="font-bold">Tên thuốc</span>: nhập tên
                      hoạt chất hoặc tên thương mại, ví dụ “Paracetamol”.
                    </li>
                    <li>
                      <span className="font-bold">Liều lượng</span>: nhập hàm
                      lượng hoặc liều dùng mỗi lần, ví dụ “500mg” hoặc “1 viên/lần”.
                    </li>
                    <li>
                      <span className="font-bold">Số lượng</span>: tổng số
                      viên/gói/chai cần kê.
                    </li>
                    <li>
                      <span className="font-bold">Đơn vị</span>: đơn vị đo
                      của thuốc, ví dụ “Viên”, “Gói”, “Ống”.
                    </li>
                    <li>
                      <span className="font-bold">Hướng dẫn sử dụng</span>:
                      cách dùng cụ thể cho bệnh nhân, ví dụ “Ngày 2 lần sau ăn”.
                    </li>
                  </ul>
                </div>

                {medicines.map((medicine, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/2"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thuốc {idx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        disabled={medicines.length === 1}
                        className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-red-400"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 flex flex-col">
                        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Tên thuốc</span>
                        <input
                          value={medicine.medicineName}
                          onChange={(event) =>
                            updateMedicineField(idx, "medicineName", event.target.value)
                          }
                          placeholder="Paracetamol"
                          className="input-primary w-full"
                        />
                      </div>

                      <div className="space-y-1 flex flex-col">
                        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Liều lượng</span>
                        <input
                          value={medicine.dosage}
                          onChange={(event) =>
                            updateMedicineField(idx, "dosage", event.target.value)
                          }
                          placeholder="500mg hoặc 1 viên/lần"
                          className="input-primary w-full"
                        />
                      </div>

                      <div className="space-y-1 flex flex-col">
                        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Số lượng</span>
                        <input
                          type="number"
                          min={1}
                          value={medicine.quantity}
                          onChange={(event) =>
                            updateMedicineField(idx, "quantity", Number(event.target.value) || 1)
                          }
                          placeholder="10"
                          className="input-primary w-full"
                        />
                      </div>

                      <div className="space-y-1 flex flex-col">
                        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Đơn vị</span>
                        <input
                          value={medicine.unit}
                          onChange={(event) =>
                            updateMedicineField(idx, "unit", event.target.value)
                          }
                          placeholder="Viên, Gói, Ống"
                          className="input-primary w-full"
                        />
                      </div>

                      <div className="space-y-1 flex flex-col md:col-span-2">
                        <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">Hướng dẫn sử dụng</span>
                        <input
                          value={medicine.instructions}
                          onChange={(event) =>
                            updateMedicineField(idx, "instructions", event.target.value)
                          }
                          placeholder="Ngày 2 lần sau ăn, sáng và tối"
                          className="input-primary w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-400 p-5 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
              >
                {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo đơn"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
