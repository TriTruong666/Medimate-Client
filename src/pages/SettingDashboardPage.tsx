import type React from "react";
import { BsShieldLock } from "react-icons/bs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { RxDesktop } from "react-icons/rx";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { Badge, IconBadge } from "../components/custom-ui/Badge";
import { HiOutlineCog, HiOutlineServer } from "react-icons/hi";
import { useState } from "react";
import { Button } from "../components/custom-ui/Button";
import Toggle from "@/components/custom-ui/Toggle";

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
  return (
    <div className="w-full space-y-6 px-12 py-4">
      {/* Content */}

      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Thông tin cơ bản"
          description="Bạn có thể cập nhật Tên & Số điện thoại của bạn"
          buttonTitle="Cập nhật"
          helper={
            <span className="helper-setting-card">
              Chỉ được thay đổi 1 lần / tuần
            </span>
          }
        >
          <form className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <input
                value="tritruonghoang3@gmail.com"
                placeholder="abcd1234@gmail.com"
                className="input-primary disabled: w-[50%]"
                disabled
              />
              <input
                value="0776003669"
                placeholder="Nhập số điện thoại"
                className="input-primary w-[50%]"
              />
            </div>
            <input
              value="Trí Trương"
              placeholder="Tên của bạn"
              className="input-primary w-full"
            />
          </form>
        </SettingCard>
        <SettingCard
          label="Ảnh đại diện"
          description="Cập nhật ảnh đại diện để người khác nhận diện bạn tốt hơn"
          buttonTitle="Lưu thay đổi"
          helper={
            <span className="helper-setting-card">
              Ảnh vuông, tối đa 5MB (PNG, JPG)
            </span>
          }
        >
          <div className="flex flex-col items-center py-8">
            <div className="group relative cursor-pointer">
              {/* Avatar */}
              <div className="relative h-48 w-48 rounded-full bg-linear-to-br from-white/20 to-white/5 p-0.5 transition">
                <div className="h-full w-full overflow-hidden rounded-full bg-neutral-900">
                  <img
                    src="https://i.pravatar.cc/300"
                    alt="avatar"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition duration-300 group-hover:opacity-100">
                <label className="cursor-pointer rounded-full bg-white/10 px-5 py-2 text-sm text-white backdrop-blur-md transition hover:bg-white/20">
                  Đổi ảnh
                  <input type="file" className="hidden" />
                </label>

                <button className="text-sm text-red-400 transition hover:text-red-300">
                  Xóa ảnh
                </button>
              </div>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

export function SecuritySettingDashboardPage() {
  return (
    <div className="w-full space-y-6 px-12 py-4">
      <div className="flex flex-col space-y-6">
        <SettingCard
          label="Mật khẩu"
          description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn"
          buttonTitle="Đổi mật khẩu"
          helper={
            <span className="helper-setting-card">
              Bạn có thể đổi mật khẩu 1 tháng / lần
            </span>
          }
        >
          <form className="flex max-w-3xl flex-col gap-4">
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              className="input-primary"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="input-primary"
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              className="input-primary"
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
