import type React from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";

import { Badge, IconBadge } from "../components/custom-ui/Badge";
import { HiOutlineCog, HiOutlineServer, HiOutlineTrash } from "react-icons/hi";
import { FiUser } from "react-icons/fi";
import { useState, useEffect } from "react";
import { Button } from "../components/custom-ui/Button";
import Toggle from "@/components/custom-ui/Toggle";
import { useAuth } from "@/hooks/useAuth";
import { useChangeMyPassword, useDoctorMe } from "@/hooks/data/useDoctorHooks";
import {
  useCreateDoctorBankAccount,
  useDeleteDoctorBankAccount,
  useDoctorBankAccounts,
  useUpdateDoctorBankAccount,
} from "@/hooks/data/useDoctorBankAccountHooks";
import { useAtom } from "jotai";
import { openConfirmUpdateProfileModalAtom } from "@/stores/modalStore";
import { toast } from "@/hooks/useToast";
import { useQuery } from "@tanstack/react-query";
import { getRagServerHealth } from "@/apis/system.service";
import { getAIModelList } from "@/apis/rag_ai_model.service";

type SettingCardProps = {
  label: string;
  description: string;
  children?: React.ReactNode;
  info?: React.ReactNode;
  helper: React.ReactNode;
  buttonTitle?: string;
  onSubmit?(): void;
  disable?: boolean;
};

function SettingCard({
  label,
  children,
  description,
  helper,
  buttonTitle = "Lưu thay đổi",
  info,
  onSubmit,
  disable = false,
}: SettingCardProps) {
  return (
    <div className="setting-card">
      {/* Main */}
      <div className="setting-card-main">
        <div className="flex flex-col space-y-3">
          {/* Label */}
          <h2 className="text-[18px] font-medium">{label}</h2>
          {/* Description */}
          <span className="text-[13px]">{description}</span>
        </div>
        {/* Children */}
        <div className="">{children}</div>

        {/* Info */}
        {info && (
          <div className="dark:border-border-dark flex space-x-3 rounded-lg border border-gray-100 px-4 py-3">
            <IoIosInformationCircleOutline />
            {info}
          </div>
        )}
      </div>
      {/*  */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Helper */}
        {helper}

        {!disable && (
          <button onClick={onSubmit} className="btn-primary">
            {buttonTitle}
          </button>
        )}
      </div>
    </div>
  );
}

export function ProfileSettingDashboardPage() {
  const { user } = useAuth();
  const { data: doctorProfile } = useDoctorMe(user?.role === "Doctor");
  const [, openConfirm] = useAtom(openConfirmUpdateProfileModalAtom);
  const doctorId = doctorProfile?.doctorId || "";

  const {
    data: bankAccounts = [],
    isLoading: isBankAccountsLoading,
  } = useDoctorBankAccounts(doctorId);
  const createBankAccountMutation = useCreateDoctorBankAccount(doctorId);
  const updateBankAccountMutation = useUpdateDoctorBankAccount(doctorId);
  const deleteBankAccountMutation = useDeleteDoctorBankAccount(doctorId);

  const [form, setForm] = useState({
    fullName: "",
    specialty: "",
    currentHospitalName: "",
    licenseNumber: "",
    yearsOfExperience: 0,
    bio: "",
    avatarImage: null as File | null,
    licenseImage: [] as File[],
  });

  const [original, setOriginal] = useState<typeof form | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    editingId: "",
  });

  useEffect(() => {
    if (doctorProfile && user?.role === "Doctor") {
      const initial = {
        fullName: doctorProfile.fullName || user?.fullName || "",
        specialty: doctorProfile.specialty || "",
        currentHospitalName: doctorProfile.currentHospitalName || "",
        licenseNumber: doctorProfile.licenseNumber || "",
        yearsOfExperience: doctorProfile.yearsOfExperience || 0,
        bio: doctorProfile.bio || "",
        avatarImage: null,
        licenseImage: [],
      };
      setForm(initial);
      setOriginal(initial);
    } else if (user && user?.role !== "Doctor") {
      setForm((prev) => ({ ...prev, fullName: user.fullName || "" }));
    }
  }, [doctorProfile, user]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (user?.role !== "Doctor") {
      toast.warn(
        "Tính năng giới hạn",
        "Tính năng cập nhật hồ sơ chi tiết hiện chỉ khả dụng cho Bác sĩ.",
      );
      return;
    }

    if (!original) return;

    const fd = new FormData();
    let hasChanges = false;

    if (form.fullName !== original.fullName) {
      fd.append("fullName", form.fullName);
      hasChanges = true;
    }
    if (form.specialty !== original.specialty) {
      fd.append("specialty", form.specialty);
      hasChanges = true;
    }
    if (form.currentHospitalName !== original.currentHospitalName) {
      fd.append("currentHospitalName", form.currentHospitalName);
      hasChanges = true;
    }
    if (form.licenseNumber !== original.licenseNumber) {
      fd.append("licenseNumber", form.licenseNumber);
      hasChanges = true;
    }
    if (form.yearsOfExperience !== original.yearsOfExperience) {
      fd.append("yearsOfExperience", String(form.yearsOfExperience));
      hasChanges = true;
    }
    if (form.bio !== original.bio) {
      fd.append("bio", form.bio);
      hasChanges = true;
    }

    if (form.avatarImage) {
      fd.append("avatarImage", form.avatarImage);
      hasChanges = true;
    }
    if (form.licenseImage.length > 0) {
      form.licenseImage.forEach((f) => fd.append("licenseImage", f));
      hasChanges = true;
    }

    if (!hasChanges) {
      toast.warn(
        "Không có thay đổi",
        "Vui lòng tinh chỉnh ít nhất 1 mục trước khi cập nhật.",
      );
      return;
    }

    openConfirm(fd);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm({ ...form, avatarImage: e.target.files[0] });
    }
  };

  const handleLicenseFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({
        ...form,
        licenseImage: [...form.licenseImage, ...Array.from(e.target.files)],
      });
    }
  };

  const removeLicenseFile = (index: number) => {
    const newFiles = [...form.licenseImage];
    newFiles.splice(index, 1);
    setForm({ ...form, licenseImage: newFiles });
  };

  const resetBankForm = () => {
    setBankForm({
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      editingId: "",
    });
  };

  const handleEditBankAccount = (id: string) => {
    const selected = bankAccounts?.find((item) => item.bankAccountId === id);
    if (!selected) return;

    setBankForm({
      bankName: selected.bankName || "",
      accountNumber: selected.accountNumber || "",
      accountHolder: selected.accountHolder || "",
      editingId: selected.bankAccountId,
    });
  };

  const handleSubmitBankAccount = async () => {
    if (user?.role !== "Doctor") {
      toast.warn("Tính năng giới hạn", "Chỉ bác sĩ mới có thể quản lý tài khoản ngân hàng.");
      return;
    }

    if (!doctorId) {
      toast.warn("Thiếu thông tin", "Không tìm thấy thông tin bác sĩ để lưu tài khoản ngân hàng.");
      return;
    }

    const payload = {
      bankName: bankForm.bankName.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      accountHolder: bankForm.accountHolder.trim(),
    };

    if (!payload.bankName || !payload.accountNumber || !payload.accountHolder) {
      toast.warn("Thiếu thông tin", "Vui lòng nhập đầy đủ tên ngân hàng, số tài khoản và chủ tài khoản.");
      return;
    }

    try {
      if (bankForm.editingId) {
        await updateBankAccountMutation.mutateAsync({
          id: bankForm.editingId,
          payload,
        });
      } else {
        await createBankAccountMutation.mutateAsync(payload);
      }
      resetBankForm();
    } catch {
      // Toast is handled in mutation hooks.
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    try {
      await deleteBankAccountMutation.mutateAsync(id);
      if (bankForm.editingId === id) {
        resetBankForm();
      }
    } catch {
      // Toast is handled in mutation hooks.
    }
  };

  // The record fetched may have profileImage, avatarImage or avatarUrl
  const fetchedAvatar =
    (doctorProfile as any)?.avatarImage ||
    (doctorProfile as any)?.profileImage ||
    (doctorProfile as any)?.avatarUrl;
  const avatarPreview = form.avatarImage
    ? URL.createObjectURL(form.avatarImage)
    : fetchedAvatar || user?.avatarUrl;

  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Thông tin cơ bản"
          description="Cập nhật các thông tin cá nhân hiện tại của bạn"
          buttonTitle="Lưu cập nhật"
          onSubmit={handleSubmit}
          helper={
            <span className="helper-setting-card">
              Dành cho: {user?.role === "Doctor" ? "Bác sĩ" : "Người dùng"}
            </span>
          }
        >
          <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <input
                value={user?.email || ""}
                placeholder="Email liên hệ"
                className="input-primary w-[50%] text-white placeholder:text-neutral-400 disabled:opacity-60"
                disabled
                readOnly
              />
              <input
                value={user?.phoneNumber || ""}
                placeholder="Số điện thoại"
                className="input-primary w-[50%] text-white placeholder:text-neutral-400 disabled:opacity-60"
                disabled
                readOnly
              />
            </div>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="Họ và tên"
              className="input-primary w-full text-white placeholder:text-neutral-400 disabled:opacity-60"
            />
            {user?.role === "Doctor" && (
              <>
                <div className="flex items-center space-x-4">
                  <input
                    value={form.specialty}
                    onChange={(e) =>
                      setForm({ ...form, specialty: e.target.value })
                    }
                    placeholder="Chuyên khoa (VD: Nội khoa, Nhi khoa)"
                    className="input-primary w-[50%] text-black placeholder:text-gray-500"
                  />
                  <input
                    value={form.currentHospitalName}
                    onChange={(e) =>
                      setForm({ ...form, currentHospitalName: e.target.value })
                    }
                    placeholder="Nơi công tác"
                    className="input-primary w-[50%] text-black placeholder:text-gray-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    value={form.licenseNumber}
                    onChange={(e) =>
                      setForm({ ...form, licenseNumber: e.target.value })
                    }
                    placeholder="Mã số chứng chỉ hành nghề"
                    className="input-primary w-[65%] text-black placeholder:text-gray-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={form.yearsOfExperience}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        yearsOfExperience: Number(e.target.value),
                      })
                    }
                    placeholder="Năm kinh nghiệm"
                    className="input-primary w-[35%] text-black placeholder:text-gray-500"
                  />
                </div>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Giới thiệu chuyên môn y khoa..."
                  className="input-primary min-h-[100px] w-full py-3 text-black placeholder:text-gray-500"
                />
              </>
            )}
          </form>
        </SettingCard>

        <SettingCard
          label="Ảnh đại diện"
          description="Cập nhật ảnh đại diện để người bệnh an tâm nhận diện"
          buttonTitle="Lưu ảnh đại diện"
          onSubmit={handleSubmit}
          helper={
            <span className="helper-setting-card">
              Ảnh vuông rõ nét, tối đa 5MB.
            </span>
          }
        >
          <div className="flex flex-col items-center py-8">
            <div className="group relative cursor-pointer">
              <div className="relative h-48 w-48 rounded-full bg-linear-to-br from-white/20 to-white/5 p-0.5 transition">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/10 bg-neutral-900">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="avatar"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/30">
                      <FiUser className="mb-2 text-5xl" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
                <label className="cursor-pointer rounded-full bg-white/10 px-5 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/20">
                  Tải ảnh mới
                  <input
                    type="file"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
                {form.avatarImage && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setForm({ ...form, avatarImage: null });
                    }}
                    className="text-sm text-red-400 transition hover:text-red-300"
                  >
                    Bỏ chọn
                  </button>
                )}
              </div>
            </div>
          </div>
        </SettingCard>

        {user?.role === "Doctor" && (
          <SettingCard
            label="Tài khoản ngân hàng"
            description="Thêm tài khoản ngân hàng để nhận thanh toán từ hệ thống."
            helper={
              <span className="helper-setting-card">
                Bạn có thể thêm nhiều tài khoản và chỉnh sửa bất cứ lúc nào.
              </span>
            }
            disable
          >
            <div className="flex w-full flex-col gap-4 py-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankName: e.target.value })
                  }
                  placeholder="Tên ngân hàng"
                  className="input-primary w-full text-white placeholder:text-neutral-400"
                />
                <input
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountNumber: e.target.value })
                  }
                  placeholder="Số tài khoản"
                  className="input-primary w-full text-white placeholder:text-neutral-400"
                />
                <input
                  value={bankForm.accountHolder}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, accountHolder: e.target.value })
                  }
                  placeholder="Chủ tài khoản"
                  className="input-primary w-full text-white placeholder:text-neutral-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleSubmitBankAccount()}
                  disabled={
                    createBankAccountMutation.isPending ||
                    updateBankAccountMutation.isPending
                  }
                  className="btn-primary"
                >
                  {bankForm.editingId ? "Cập nhật tài khoản" : "Thêm tài khoản"}
                </button>
                {bankForm.editingId && (
                  <button
                    type="button"
                    onClick={resetBankForm}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                  >
                    Hủy chỉnh sửa
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                {isBankAccountsLoading ? (
                  <p className="text-sm text-gray-400">Đang tải tài khoản ngân hàng...</p>
                ) : bankAccounts?.length === 0 ? (
                  <p className="text-sm text-gray-400">Chưa có tài khoản ngân hàng nào.</p>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts?.map((account) => (
                      <div
                        key={account.bankAccountId}
                        className="flex flex-col gap-3 rounded-lg border border-white/10 bg-black/30 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-medium text-white">
                            {account.bankName} - {account.accountNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            Chủ tài khoản: {account.accountHolder}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditBankAccount(account.bankAccountId)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-200 transition hover:bg-white/10"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteBankAccount(account.bankAccountId)}
                            disabled={deleteBankAccountMutation.isPending}
                            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SettingCard>
        )}

        {user?.role === "Doctor" && (
          <SettingCard
            label="Chứng chỉ & Bằng cấp (Bổ sung)"
            description="Tải lên hình ảnh CCHN hoặc chứng chỉ liên quan để làm hồ sơ minh bạch hơn."
            buttonTitle="Lưu chứng chỉ"
            onSubmit={handleSubmit}
            helper={
              <span className="helper-setting-card">
                Bạn có thể bổ sung hoặc cập nhật chứng chỉ.
              </span>
            }
          >
            <div className="flex w-full flex-col py-4">
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/5 transition hover:bg-white/10">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-white">
                      Click tải lên
                    </span>{" "}
                    nhiều ảnh
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleLicenseFiles}
                  className="hidden"
                />
              </label>

              {form.licenseImage.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {form.licenseImage.map((file, i) => (
                    <div
                      key={i}
                      className="relative flex items-center justify-between overflow-hidden rounded-lg border border-white/10 bg-white/5 p-2 px-3"
                    >
                      <span className="max-w-[150px] truncate text-xs text-white">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLicenseFile(i)}
                        className="ml-3 text-gray-400 transition hover:text-red-400"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SettingCard>
        )}
      </div>
    </div>
  );
}

export function SecuritySettingDashboardPage() {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const changePasswordMutation = useChangeMyPassword();

  const handlePasswordChange = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (
      !passwords.oldPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      toast.error(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ các trường mật khẩu.",
      );
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Không khớp", "Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(passwords);
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch {}
  };

  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Mật khẩu"
          description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
          buttonTitle={
            changePasswordMutation.isPending ? "Đang xử lý..." : "Đổi mật khẩu"
          }
          onSubmit={handlePasswordChange}
          disable={changePasswordMutation.isPending}
          helper={<div />}
        >
          <form
            className="flex max-w-3xl flex-col gap-4"
            onSubmit={handlePasswordChange}
          >
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              className="input-primary text-black placeholder:text-gray-500"
              value={passwords.oldPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, oldPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="input-primary text-black placeholder:text-gray-500"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="input-primary text-black placeholder:text-gray-500"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
            />
          </form>
        </SettingCard>

      </div>
    </div>
  );
}

export function NotificationSettingDashboardPage() {
  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Thông báo Email"
          description="Quản lý các email được gửi đến bạn"
          helper={
            <span className="helper-setting-card">
              Áp dụng cho email tài khoản
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Hoạt động đăng nhập
                </p>
                <p className="text-xs text-white/40">
                  Nhận email khi có đăng nhập mới
                </p>
              </div>
              <Toggle />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Thay đổi bảo mật
                </p>
                <p className="text-xs text-white/40">
                  Nhận email khi thay đổi mật khẩu hoặc 2FA
                </p>
              </div>
              <Toggle />
            </div>
          </div>
        </SettingCard>
        <SettingCard
          label="Thông báo hệ thống"
          description="Hiển thị thông báo trong ứng dụng"
          helper={
            <span className="helper-setting-card">Thông báo realtime</span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Cập nhật tính năng mới
                </p>
                <p className="text-xs text-white/40">
                  Thông báo khi có tính năng mới
                </p>
              </div>
              <Toggle />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Cảnh báo bảo mật
                </p>
                <p className="text-xs text-white/40">
                  Nhận cảnh báo khi phát hiện hoạt động bất thường
                </p>
              </div>
              <Toggle />
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

export function MessageSettingDashboardPage() {
  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Thông báo tin nhắn"
          description="Quản lý cách bạn nhận thông báo khi có tin nhắn mới"
          disable
          helper={
            <span className="helper-setting-card">Thông báo realtime</span>
          }
        >
          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Thông báo trong ứng dụng
                </p>
                <p className="text-xs text-white/40">
                  Hiển thị popup khi có tin nhắn mới
                </p>
              </div>
              <Toggle />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Thông báo qua email
                </p>
                <p className="text-xs text-white/40">
                  Gửi email nếu bạn không online
                </p>
              </div>
              <Toggle />
            </div>
          </div>
        </SettingCard>
        <SettingCard
          label="Trạng thái hiển thị"
          description="Kiểm soát thông tin hiển thị cho người khác"
          disable
          helper={
            <span className="helper-setting-card">
              Hạn chế tắt hết để mọi người có thể nhắn tin mọi lúc
            </span>
          }
        >
          <div className="flex max-w-3xl flex-col gap-5">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Hiển thị trạng thái online
                </p>
                <p className="text-xs text-white/40">
                  Người khác có thể thấy bạn đang hoạt động
                </p>
              </div>
              <Toggle />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Hiển thị đã xem
                </p>
                <p className="text-xs text-white/40">
                  Người gửi biết khi bạn đã đọc tin nhắn
                </p>
              </div>
              <Toggle />
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

export function SystemSettingDashboardPage() {
  const { data: pyHealth, isLoading, isError } = useQuery({
    queryKey: ["rag-server-health"],
    queryFn: async () => {
      const res = await getRagServerHealth();
      if (!res.success) throw new Error("Fetch failed");
      return res.data;
    },
    refetchInterval: 30000,
    retry: 1,
  });

  const isPyActive = !!pyHealth && !isError;

  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Thông tin hệ thống"
          description="Thông tin cơ bản và metadata của hệ thống"
          helper={
            <span className="helper-setting-card">
              Phiên bản, uptime, và dữ liệu server
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-white">Medimate</p>
                <p className="text-xs text-white/40">Phiên bản 1.0.0 Beta</p>
              </div>
              <Badge value="Mới nhất" type="info" />
            </div>
          </div>
        </SettingCard>
        <SettingCard
          label="Quản lý Servers"
          description="Trạng thái các server đang chạy"
          helper={
            <span className="helper-setting-card">
              Hiển thị trạng thái các server
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-4">
            {/* Python server */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4">
              <div className="flex items-center gap-4">
                <IconBadge icon={<HiOutlineServer />} type={isLoading ? "info" : isPyActive ? "success" : "error"} />
                <div>
                  <p className="text-sm font-medium text-white">AI / Python Server (RAG)</p>
                  <p className="text-xs text-white/40">
                    {isLoading ? "Đang kiểm tra..." : isPyActive ? `Hoạt động bình thường (v${pyHealth?.version})` : "Không phản hồi"}
                  </p>
                </div>
              </div>
              <Badge value={isLoading ? "Đang tải" : isPyActive ? "Ổn định" : "Lỗi kết nối"} type={isLoading ? "info" : isPyActive ? "success" : "error"} />
            </div>
          </div>
        </SettingCard>
        <SettingCard
          label="Công cụ"
          description="Các công cụ hỗ trợ vận hành hệ thống"
          helper={
            <span className="helper-setting-card">
              Những công cụ nhanh để kiểm tra và debug
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-4">
            <div className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4 transition hover:bg-white/6">
              <div className="flex items-center gap-4">
                <IconBadge icon={<HiOutlineCog />} type="info" />
                <p className="text-sm font-medium text-white">Xem logs</p>
              </div>
              <span className="text-xs text-white/40">Mở console log</span>
            </div>

            <div className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4 transition hover:bg-white/6">
              <div className="flex items-center gap-4">
                <IconBadge icon={<HiOutlineCog />} type="info" />
                <p className="text-sm font-medium text-white">Khởi động lại</p>
              </div>
              <span className="text-xs text-white/40">
                Khởi động lại server
              </span>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

type ApiKeyItemProps = {
  service: string;
  value: string;
};

function ApiKeyItem({ service, value }: ApiKeyItemProps) {
  const [editing, setEditing] = useState(false);
  const [keyValue, setKeyValue] = useState(value);
  const [masked, setMasked] = useState(true);

  return (
    <div className="group relative flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-6 py-4 transition hover:bg-white/10">
      {/* Key info */}
      <div className="flex flex-col">
        <p className="text-sm font-medium text-white">{service}</p>
        {!editing ? (
          <p className="mt-2 text-xs tracking-widest text-white/40">
            {masked ? "•••••••••••••••••••••••••••" : keyValue}
          </p>
        ) : (
          <input
            className="input-primary mt-2 w-80 text-white"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
          />
        )}
      </div>

      <div className="absolute top-1/2 right-6 flex -translate-y-1/2 items-center gap-2 opacity-0 transition group-hover:opacity-100">
        {!editing ? (
          <>
            <Button
              color="white"
              onClick={() => {
                navigator.clipboard.writeText(keyValue);
                toast.success(
                  "Đã sao chép",
                  `Khóa của mẫu ${service} đã được lưu vào bộ nhớ tạm.`,
                );
              }}
            >
              Sao chép
            </Button>
            <Button onClick={() => setMasked(!masked)}>
              {masked ? "Hiển thị" : "Ẩn"}
            </Button>
            <Button color="green" onClick={() => setEditing(true)}>
              Thay đổi
            </Button>
          </>
        ) : (
          <>
            <Button color="green" onClick={() => setEditing(false)}>
              Lưu
            </Button>
            <Button
              color="red"
              onClick={() => {
                setKeyValue(value);
                setEditing(false);
              }}
            >
              Hủy
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function APIKeysSettingDashboardPage() {
  const { data: modelsResponse, isLoading, isError } = useQuery({
    queryKey: ["ai-models-list"],
    queryFn: () => getAIModelList({ skip: 0, limit: 100 }),
  });

  const models = modelsResponse?.data || [];

  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="LLM Keys"
          description="Quản lý các khóa API cho các mô hình ngôn ngữ lớn (Gemini, ChatGPT...)"
          helper={
            <span className="helper-setting-card">
              Không chia sẻ khóa với người khác để đảm bảo an toàn cho hệ thống
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-4">
            {isLoading ? (
              <p className="text-sm text-gray-400">Đang tải danh sách model...</p>
            ) : isError ? (
              <p className="text-sm text-red-400">Không thể tải danh sách model.</p>
            ) : models.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có model nào được cấu hình.</p>
            ) : (
              models.map((model) => (
                <ApiKeyItem
                  key={model.id}
                  service={model.name}
                  value={model.config?.api_key || ""}
                />
              ))
            )}
          </div>
        </SettingCard>
      </div>
    </div>
  );
}
