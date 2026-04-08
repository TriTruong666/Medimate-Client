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
            className="w-full max-w-5xl rounded-2xl border border-white/10 bg-neutral-900/90"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h3 className="text-base font-semibold text-white">{modalTitle}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <HiOutlineX className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/70">
                    Chẩn đoán
                  </label>
                  <input
                    value={diagnosis}
                    onChange={(event) => setDiagnosis(event.target.value)}
                    placeholder="Ví dụ: Viêm họng cấp"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/70">
                    Lời dặn
                  </label>
                  <input
                    value={advice}
                    onChange={(event) => setAdvice(event.target.value)}
                    placeholder="Ví dụ: Uống nhiều nước ấm"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-white/20"
                  />
                </div>
              </div>

              {!isEdit && (
                <label className="flex items-center gap-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={openDetailAfterCreate}
                    onChange={(event) => setOpenDetailAfterCreate(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Mở chi tiết đơn ngay sau khi tạo
                </label>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Danh sách thuốc</h4>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                  >
                    <HiOutlinePlus className="h-4 w-4" />
                    Thêm thuốc
                  </button>
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-blue-100">
                  <p className="font-semibold text-white">Cách nhập từng thuốc</p>
                  <ul className="mt-2 space-y-1 text-blue-50/90">
                    <li>
                      <span className="font-medium text-white">Tên thuốc</span>: nhập tên
                      hoạt chất hoặc tên thương mại, ví dụ “Paracetamol”.
                    </li>
                    <li>
                      <span className="font-medium text-white">Liều lượng</span>: nhập hàm
                      lượng hoặc liều dùng mỗi lần, ví dụ “500mg” hoặc “1 viên/lần”.
                    </li>
                    <li>
                      <span className="font-medium text-white">Số lượng</span>: tổng số
                      viên/gói/chai cần kê.
                    </li>
                    <li>
                      <span className="font-medium text-white">Đơn vị</span>: đơn vị đo
                      của thuốc, ví dụ “Viên”, “Gói”, “Ống”.
                    </li>
                    <li>
                      <span className="font-medium text-white">Hướng dẫn sử dụng</span>:
                      cách dùng cụ thể cho bệnh nhân, ví dụ “Ngày 2 lần sau ăn”.
                    </li>
                  </ul>
                </div>

                {medicines.map((medicine, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/10 bg-white/2 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-medium text-white/70">Thuốc {idx + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeMedicine(idx)}
                        disabled={medicines.length === 1}
                        className="rounded-md p-1 text-gray-400 transition hover:bg-white/10 hover:text-red-400 disabled:opacity-30"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs text-white/70">
                        <span className="block">Tên thuốc</span>
                        <input
                          value={medicine.medicineName}
                          onChange={(event) =>
                            updateMedicineField(idx, "medicineName", event.target.value)
                          }
                          placeholder="Paracetamol"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />
                      </label>

                      <label className="space-y-1 text-xs text-white/70">
                        <span className="block">Liều lượng</span>
                        <input
                          value={medicine.dosage}
                          onChange={(event) =>
                            updateMedicineField(idx, "dosage", event.target.value)
                          }
                          placeholder="500mg hoặc 1 viên/lần"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />
                      </label>

                      <label className="space-y-1 text-xs text-white/70">
                        <span className="block">Số lượng</span>
                        <input
                          type="number"
                          min={1}
                          value={medicine.quantity}
                          onChange={(event) =>
                            updateMedicineField(idx, "quantity", Number(event.target.value) || 1)
                          }
                          placeholder="10"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />
                      </label>

                      <label className="space-y-1 text-xs text-white/70">
                        <span className="block">Đơn vị</span>
                        <input
                          value={medicine.unit}
                          onChange={(event) =>
                            updateMedicineField(idx, "unit", event.target.value)
                          }
                          placeholder="Viên, Gói, Ống"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />
                      </label>

                      <label className="space-y-1 text-xs text-white/70 md:col-span-2">
                        <span className="block">Hướng dẫn sử dụng</span>
                        <input
                          value={medicine.instructions}
                          onChange={(event) =>
                            updateMedicineField(idx, "instructions", event.target.value)
                          }
                          placeholder="Ngày 2 lần sau ăn, sáng và tối"
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:bg-white/10 disabled:text-white/40"
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
