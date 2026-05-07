import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX } from "react-icons/hi";
import { useQuery } from "@tanstack/react-query";
import { useDoctorMe } from "@/hooks/data/useDoctorHooks";
import {
  useCreatePrescription,
  useUpdatePrescription,
} from "@/hooks/data/usePrescriptionHooks";
import { toast } from "@/hooks/useToast";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { searchDrugs } from "@/apis/drug.service";
import type { DrugDto } from "@/types/Drug";
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

// ─── Drug Search Input ────────────────────────────────────────────────────────
function DrugSearchInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Sync value from parent
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce 350ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue), 350);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Update dropdown position
  useEffect(() => {
    if (!open) return;
    function update() {
      if (inputRef.current) setRect(inputRef.current.getBoundingClientRect());
    }
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  const { data: drugRes, isFetching } = useQuery({
    queryKey: ["drug-search", debouncedQuery],
    queryFn: () => searchDrugs(debouncedQuery, 10),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30_000,
  });

  const results: DrugDto[] = drugRes?.data ?? [];

  // Close on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleSelect(drug: DrugDto) {
    setInputValue(drug.name);
    onChange(drug.name);
    setOpen(false);
  }

  const showDropdown = open && debouncedQuery.trim().length >= 2;

  const dropdown =
    showDropdown && rect
      ? createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: rect.bottom + 4,
              left: rect.left,
              width: rect.width,
              zIndex: 9999,
            }}
            className="max-h-52 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-800"
          >
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 p-3 text-xs text-gray-400">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
                Đang tìm kiếm...
              </div>
            ) : results.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">
                Không tìm thấy thuốc phù hợp
              </div>
            ) : (
              results.map((drug) => (
                <button
                  key={drug.drugId}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(drug)}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-white/10"
                >
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {drug.name}
                  </span>
                  {drug.synonyms && (
                    <span className="w-full truncate text-[11px] text-gray-400">
                      {drug.synonyms}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          if (inputRef.current)
            setRect(inputRef.current.getBoundingClientRect());
        }}
        placeholder="Tìm tên thuốc..."
        className="input-primary w-full"
        disabled={disabled}
        autoComplete="off"
      />
      {dropdown}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
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
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isLocked =
    editingPrescription?.status === "Completed" ||
    editingPrescription?.status === "Cancelled" ||
    editingPrescription?.isLocked;

  const modalTitle = useMemo(() => {
    if (isEdit) return isLocked ? "Chi tiết đơn thuốc (Đã khóa)" : "Cập nhật đơn thuốc";
    return "Tạo đơn thuốc";
  }, [isEdit, isLocked]);

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
        idx === index ? { ...item, [key]: value } : item,
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
    <>
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
              className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-2xl dark:border-white/10 dark:bg-neutral-900/90"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-400 p-5 dark:border-white/10">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {modalTitle}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <HiOutlineX className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
                {isLocked && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-200">
                    <p className="text-sm font-bold">Đơn thuốc đã bị khóa</p>
                    <p className="mt-1 text-xs">
                      Đơn thuốc này đã được gửi cho bệnh nhân hoặc bị hủy. Bạn
                      không thể chỉnh sửa thêm.
                    </p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                      Chẩn đoán
                    </label>
                    <input
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Ví dụ: Viêm họng cấp"
                      className="input-primary w-full"
                      disabled={isLocked}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                      Lời dặn
                    </label>
                    <input
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      placeholder="Ví dụ: Uống nhiều nước ấm"
                      className="input-primary w-full"
                      disabled={isLocked}
                    />
                  </div>
                </div>

                {!isEdit && (
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-500 dark:text-white/70">
                    <input
                      type="checkbox"
                      checked={openDetailAfterCreate}
                      onChange={(e) => setOpenDetailAfterCreate(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Mở chi tiết đơn ngay sau khi tạo
                  </label>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Danh sách thuốc
                    </h4>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={addMedicine}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                      >
                        <HiOutlinePlus className="h-4 w-4" />
                        Thêm thuốc
                      </button>
                    )}
                  </div>

                  {medicines.map((medicine, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-300 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.02]"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          Thuốc {idx + 1}
                        </p>
                        {!isLocked && (
                          <button
                            type="button"
                            onClick={() => removeMedicine(idx)}
                            disabled={medicines.length === 1}
                            className="rounded-md p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-white/10 dark:hover:text-red-400"
                          >
                            <HiOutlineTrash className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {/* Tên thuốc — Drug Search */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                            Tên thuốc
                          </span>
                          <DrugSearchInput
                            value={medicine.medicineName}
                            onChange={(name) =>
                              updateMedicineField(idx, "medicineName", name)
                            }
                            disabled={isLocked}
                          />
                        </div>

                        {/* Liều lượng */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                            Liều lượng
                          </span>
                          <input
                            value={medicine.dosage}
                            onChange={(e) =>
                              updateMedicineField(idx, "dosage", e.target.value)
                            }
                            placeholder="500mg hoặc 1 viên/lần"
                            className="input-primary w-full"
                            disabled={isLocked}
                          />
                        </div>

                        {/* Số lượng */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                            Số lượng
                          </span>
                          <input
                            type="number"
                            min={1}
                            value={medicine.quantity}
                            onChange={(e) =>
                              updateMedicineField(
                                idx,
                                "quantity",
                                Number(e.target.value) || 1,
                              )
                            }
                            placeholder="10"
                            className="input-primary w-full"
                            disabled={isLocked}
                          />
                        </div>

                        {/* Đơn vị */}
                        <div className="flex flex-col space-y-1">
                          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                            Đơn vị
                          </span>
                          <input
                            value={medicine.unit}
                            onChange={(e) =>
                              updateMedicineField(idx, "unit", e.target.value)
                            }
                            placeholder="Viên, Gói, Ống"
                            className="input-primary w-full"
                            disabled={isLocked}
                          />
                        </div>

                        {/* Hướng dẫn sử dụng */}
                        <div className="flex flex-col space-y-1 md:col-span-2">
                          <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                            Hướng dẫn sử dụng
                          </span>
                          <input
                            value={medicine.instructions}
                            onChange={(e) =>
                              updateMedicineField(
                                idx,
                                "instructions",
                                e.target.value,
                              )
                            }
                            placeholder="Ngày 2 lần sau ăn, sáng và tối"
                            className="input-primary w-full"
                            disabled={isLocked}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-400 p-5 dark:border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  {isLocked ? "Đóng" : "Hủy"}
                </button>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateForm()) setShowConfirmSubmit(true);
                    }}
                    disabled={isSubmitting}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
                  >
                    {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo đơn"}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={showConfirmSubmit}
        title={isEdit ? "Cập nhật đơn thuốc" : "Tạo đơn thuốc mới"}
        message={
          isEdit
            ? "Bạn có chắc chắn muốn cập nhật đơn thuốc này?"
            : "Bạn có chắc chắn muốn tạo đơn thuốc mới cho bệnh nhân này?"
        }
        confirmText={isEdit ? "Cập nhật" : "Tạo đơn"}
        confirmButtonType="primary"
        onConfirm={() => {
          setShowConfirmSubmit(false);
          handleSubmit();
        }}
        onCancel={() => setShowConfirmSubmit(false)}
        isLoading={isSubmitting}
      />
    </>
  );
}
