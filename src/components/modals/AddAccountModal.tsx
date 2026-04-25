/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAtom } from "jotai";
import { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { PiHandEyeLight } from "react-icons/pi";
import clsx from "clsx";
import type { CreateUserRequest } from "@/types/User";
import { isRequired, isValidEmail, isValidPhoneVN } from "@/common/validation";
import {
  useCreateDoctor,
  useCreateDoctorManager,
} from "@/hooks/data/useAccountHooks";
import { closeModalAtom } from "../../stores/modalStore";
import { toast } from "../../hooks/useToast";
import { useClinics, useAddDoctorToClinic } from "@/hooks/data/useClinicHooks";
import { Input } from "@/components/custom-ui/Input";

type CreateErrors = {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
};

function validateAddAccountForm(form: CreateUserRequest): CreateErrors {
  const errors: CreateErrors = {};

  if (!isRequired(form.email)) {
    errors.email = "Email là bắt buộc";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Email không hợp lệ";
  }

  if (!isRequired(form.fullName)) {
    errors.fullName = "Họ và tên là bắt buộc";
  }

  if (!isRequired(form.phoneNumber)) {
    errors.phoneNumber = "Số điện thoại là bắt buộc";
  } else if (!isValidPhoneVN(form.phoneNumber)) {
    errors.phoneNumber = "Số điện thoại không hợp lệ";
  }

  return errors;
}

function RoleCard({ icon, title, description, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group cursor-pointer rounded-xl border p-5 transition-all duration-200",
        active
          ? "border-primary bg-primary/10 shadow-primary/20 shadow-lg"
          : "border-gray-400 bg-white hover:border-white/20 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10",
      )}
    >
      <div
        className={clsx(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition",
          active
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:group-hover:bg-white/20",
        )}
      >
        {icon}
      </div>

      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>

      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

function RolePhase({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (role: "doctor" | "supervisor") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RoleCard
        icon={<FaUserDoctor size={28} />}
        title="Bác sĩ"
        description="Tạo tài khoản dành cho bác sĩ điều trị"
        active={selected === "doctor"}
        onClick={() => onSelect("doctor")}
      />

      <RoleCard
        icon={<PiHandEyeLight size={28} />}
        title="Kiểm định viên"
        description="Quản lý & duyệt hồ sơ bác sĩ"
        active={selected === "supervisor"}
        onClick={() => onSelect("supervisor")}
      />
    </div>
  );
}

function InfoPhase({
  value,
  errors,
  onChange,
  role,
  selectedClinic,
  onClinicChange,
}: {
  value: CreateUserRequest;
  errors?: CreateErrors;
  onChange: (field: keyof CreateUserRequest, value: string) => void;
  role: "doctor" | "supervisor" | null;
  selectedClinic: { id: string; name: string } | null;
  onClinicChange: (clinic: { id: string; name: string } | null) => void;
}) {
  const { data: clinics } = useClinics();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Input label="Email" placeholder="example123@gmail.com" type="email" value={value.email} error={errors?.email} onChange={(e) => onChange("email", e)} />
      <Input label="Họ và tên" placeholder="Nhập tên của bạn" value={value.fullName} error={errors?.fullName} onChange={(e) => onChange("fullName", e)} />
      <Input label="Số điện thoại" placeholder="Nhập SĐT của bạn" value={value.phoneNumber} error={errors?.phoneNumber} onChange={(e) => onChange("phoneNumber", e)} />
      <Input label="Mật khẩu" type="password" placeholder="12345678aA@" disabled={true} />

      {role === "doctor" && (
        <div className="col-span-2 flex flex-col gap-1.5">
          <p className="text-[13px] font-medium text-gray-700 dark:text-gray-200">
            Phòng khám <span className="text-xs text-gray-400">(tuỳ chọn)</span>
          </p>
          <select
            value={selectedClinic?.id ?? ""}
            onChange={(e) => {
              const clinic = (clinics ?? []).find((c) => c.clinicId === e.target.value);
              onClinicChange(clinic ? { id: clinic.clinicId, name: clinic.name } : null);
            }}
            className="h-10 w-full rounded-xl border border-gray-400 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition-all focus:border-primary/50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            <option value="">-- Chưa gán phòng khám --</option>
            {(clinics ?? []).map((c) => (
              <option key={c.clinicId} value={c.clinicId}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export function AddAccountModal() {
  const [phase, setPhase] = useState<"role" | "info">("role");
  const [role, setRole] = useState<"doctor" | "supervisor" | null>(null);
  const [, closeModal] = useAtom(closeModalAtom);
  const { mutateAsync: mutateCreateDoctor, isPending: isPendingCreateDoctor } = useCreateDoctor();
  const { mutateAsync: mutateCreateDoctorManager, isPending: isPendingCreateDoctorManager } = useCreateDoctorManager();
  const { mutateAsync: mutateAddDoctorToClinic } = useAddDoctorToClinic();

  const [form, setForm] = useState<CreateUserRequest>({ email: "", fullName: "", phoneNumber: "" });
  const [selectedClinic, setSelectedClinic] = useState<{ id: string; name: string } | null>(null);
  const [errors, setErrors] = useState<CreateErrors>();

  const handleCreate = async (role: "doctor" | "supervisor") => {
    const nextErrors = validateAddAccountForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Dữ liệu chưa hợp lệ", "Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      let response;
      if (role === "doctor") {
        response = await mutateCreateDoctor({
          ...form,
          ...(selectedClinic ? { currentHospitalName: selectedClinic.name } : {}),
        });
        // Nếu chọn phòng khám và tạo thành công, gán doctor vào clinic
        if (response?.success && response.data && selectedClinic) {
          const newDoctor = Array.isArray(response.data) ? response.data[0] : response.data;
          if (newDoctor?.doctorId) {
            await mutateAddDoctorToClinic({
              clinicId: selectedClinic.id,
              body: {
                doctorId: newDoctor.doctorId,
                consultationFee: 0,
              },
            });
          }
        }
      } else {
        response = await mutateCreateDoctorManager(form);
      }

      if (response?.success) {
        closeModal();
      }
    } catch {
      // Toast error is already handled by onError in the mutation hooks
    }
  };

  return (
    <div className="flex w-150 flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Tạo tài khoản mới
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6">
        {phase === "role" && <RolePhase selected={role} onSelect={setRole} />}
        {phase === "info" && (
          <InfoPhase
            value={form}
            errors={errors}
            role={role}
            selectedClinic={selectedClinic}
            onClinicChange={setSelectedClinic}
            onChange={(field, value) => setForm({ ...form, [field]: value })}
          />
        )}
      </div>

      {phase === "role" && (
        <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
          <button
            onClick={closeModal}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Thoát
          </button>

          <button
            disabled={!role}
            onClick={() => setPhase("info")}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              role
                ? "bg-primary text-white hover:opacity-90"
                : "bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-white/40",
            )}
          >
            Tiếp theo
          </button>
        </div>
      )}

      {phase === "info" && (
        <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
          <button
            onClick={() => setPhase("role")}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Quay lại
          </button>

          <button
            onClick={() => handleCreate(role as "doctor" | "supervisor")}
            disabled={
              isPendingCreateDoctor || isPendingCreateDoctorManager || !role
            }
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              role
                ? "bg-primary text-white hover:opacity-90"
                : "bg-gray-200 text-gray-400 dark:bg-white/10 dark:text-white/40",
            )}
          >
            Tạo mới
          </button>
        </div>
      )}
    </div>
  );
}
