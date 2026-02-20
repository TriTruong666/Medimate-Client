import type React from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";

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
            <span className="text-sm text-white/40">
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
          description="Cập nhật ảnh đại diện của bạn để mọi người có thể nhận diện bạn dễ dàng hơn"
          buttonTitle="Cập nhật"
        ></SettingCard>
      </div>
    </div>
  );
}

export function SecuritySettingDashboardPage() {
  return <div className=""></div>;
}
