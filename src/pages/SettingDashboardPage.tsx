import type React from "react";
import { BsShieldLock } from "react-icons/bs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxDesktop } from "react-icons/rx";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { Badge, IconBadge } from "../components/custom-ui/Badge";
import { HiOutlineCog, HiOutlineServer, HiOutlineTrash } from "react-icons/hi";
import { useState, useEffect } from "react";
import { Button } from "../components/custom-ui/Button";
import Toggle from "@/components/custom-ui/Toggle";
import { useAuth } from "@/hooks/useAuth";
import { useChangeMyPassword, useDoctorMe } from "@/hooks/data/useDoctorHooks";
import { useAtom } from "jotai";
import { openConfirmUpdateProfileModalAtom } from "@/stores/modalStore";
import { toast } from "@/hooks/useToast";

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

  // The record fetched may have profileImage, avatarImage or avatarUrl
  const fetchedAvatar =
    (doctorProfile as any)?.avatarImage ||
    (doctorProfile as any)?.profileImage ||
    (doctorProfile as any)?.avatarUrl;
  const avatarPreview = form.avatarImage
    ? URL.createObjectURL(form.avatarImage)
    : fetchedAvatar || user?.avatarUrl || "https://i.pravatar.cc/300";

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
                <div className="h-full w-full overflow-hidden rounded-full border border-white/10 bg-neutral-900">
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
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
        <SettingCard
          label="Xác thực 2 bước (2FA)"
          description="Thêm một lớp bảo mật bổ sung khi đăng nhập"
          helper={
            <span className="helper-setting-card">
              Khuyến nghị bật để bảo vệ tài khoản tốt hơn
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5 transition hover:bg-white/6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <BsShieldLock />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-white">
                    Xác thực bằng ứng dụng
                  </p>

                  {/* Status badge */}
                  <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400">
                    Chưa bật
                  </span>
                </div>

                <p className="mt-1 text-xs text-white/40">
                  Hỗ trợ Google Authenticator hoặc ứng dụng tương tự
                </p>
              </div>
            </div>

            {/* Toggle button style */}
            <Button color="green" onClick={() => alert("Đã bật 2FA")}>
              Bật 2FA
            </Button>
          </div>
        </SettingCard>
        <SettingCard
          label="Phiên đăng nhập"
          description="Quản lý các thiết bị đang truy cập tài khoản"
          helper={
            <span className="helper-setting-card">
              Nếu phát hiện thiết bị lạ, hãy đăng xuất ngay
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-4">
            {/* Current session */}
            <div className="group flex items-center justify-between rounded-2xl border border-green-500/20 bg-green-500/5 px-6 py-5 transition hover:bg-green-500/10">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <RxDesktop />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-white">
                      Windows • Chrome
                    </p>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                      Thiết bị hiện tại
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-white/40">
                    Hồ Chí Minh, Việt Nam • Hoạt động 5 phút trước
                  </p>
                </div>
              </div>
            </div>

            {/* Other session */}
            <div className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-5 transition hover:bg-white/6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <HiOutlineDevicePhoneMobile />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    iPhone 15 • Safari
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Hà Nội, Việt Nam • 2 ngày trước
                  </p>
                </div>
              </div>

              <Button color="red" onClick={() => alert("Đăng xuất")}>
                Đăng xuất
              </Button>
            </div>
          </div>
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

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-white">Uptime</p>
                <p className="text-xs text-white/40">72 giờ liên tục</p>
              </div>
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
            {/* .NET server */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4">
              <div className="flex items-center gap-4">
                <IconBadge icon={<HiOutlineServer />} type="success" />
                <div>
                  <p className="text-sm font-medium text-white">Server 1</p>
                  <p className="text-xs text-white/40">Hoạt động bình thường</p>
                </div>
              </div>
              <Badge value="Ổn định" type="success" />
            </div>

            {/* Python server */}
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/3 px-6 py-4">
              <div className="flex items-center gap-4">
                <IconBadge icon={<HiOutlineServer />} type="error" />
                <div>
                  <p className="text-sm font-medium text-white">Server 2</p>
                  <p className="text-xs text-white/40">Đang tạm dừng</p>
                </div>
              </div>
              <Badge value="Lỗi cục bộ" type="error" />
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
        <p className="text-sm font-medium text-white">{service} API Key</p>
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
              onClick={() => navigator.clipboard.writeText(keyValue)}
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
  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="API Keys"
          description="Quản lý các khóa API của bạn cho Cloudinary, ChatGPT, Resend..."
          helper={
            <span className="helper-setting-card">
              Không chia sẻ khóa với người khác để bảo mật
            </span>
          }
          disable
        >
          <div className="flex max-w-3xl flex-col gap-4">
            {[
              { service: "Cloudinary", value: "cloudinary-secret-key" },
              { service: "ChatGPT", value: "chatgpt-secret-key" },
              { service: "Resend", value: "resend-secret-key" },
            ].map((item) => (
              <ApiKeyItem
                key={item.service}
                service={item.service}
                value={item.value}
              />
            ))}
          </div>
        </SettingCard>
      </div>
    </div>
  );
}
