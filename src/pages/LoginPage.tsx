/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useLogin } from "@/hooks/data/useAuthHooks";
import { isRequired, isValidEmail } from "@/common/validation";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/common/api.error";
import { getFCMToken } from "@/lib/fcm";

type LoginErrors = {
  identifier?: string;
  password?: string;
};

function validateLoginForm(identifier: string, password: string): LoginErrors {
  const errors: LoginErrors = {};

  if (!isRequired(identifier)) {
    errors.identifier = "Email là bắt buộc";
  } else if (!isValidEmail(identifier)) {
    errors.identifier = "Email không hợp lệ";
  }

  if (!isRequired(password)) {
    errors.password = "Mật khẩu là bắt buộc";
  }

  return errors;
}

export default function LoginPage() {
  const [lastLogin, setLastLogin] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const { mutateAsync: login, isPending, error: loginError } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validateLoginForm(identifier, password);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Dữ liệu chưa hợp lệ", "Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      const fcmToken = await getFCMToken();
      await login({ identifier, password, fcmToken });
    } catch {
      /* empty */
    }
  };

  useEffect(() => {
    setLastLogin((localStorage.getItem("last_login") as string) || "");
  }, []);

  return (
    <div className="relative w-full max-w-120 p-6 font-sans sm:p-8">
      <div className="mb-8 flex flex-col items-center">
        {lastLogin ? (
          <h1 className="pb-2 text-center text-3xl leading-tight font-bold tracking-tight text-white">
            Hello, {lastLogin}
          </h1>
        ) : (
          <h1 className="pb-2 text-center text-3xl leading-tight font-bold tracking-tight text-white">
            Chào mừng bạn tới Medimate
          </h1>
        )}

        <p className="text-center text-base leading-normal font-normal text-gray-400">
          Vui lòng đăng nhập để truy cập vào dashboard của bạn.
        </p>
      </div>
      <div className="relative rounded-2xl border border-white/10 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm leading-none font-medium text-white">
              Email
            </label>
            <input
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
              placeholder="name@company.com"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            {errors.identifier && (
              <p className="text-[12px] text-red-500 italic">
                {errors.identifier}
              </p>
            )}
          </div>
          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm leading-none font-medium text-white">
                Mật khẩu
              </label>
            </div>
            <input
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <p className="text-[12px] text-red-500 italic">
                {getApiErrorMessage(loginError)}
              </p>
            )}
            {errors.password && (
              <p className="text-[12px] text-red-500 italic">
                {errors.password}
              </p>
            )}
          </div>
          {/* Forget */}
          <div className="flex items-center justify-between py-1">
            <label className="group flex cursor-pointer items-center gap-2">
              <input
                className="text-primary focus:ring-primary h-4 w-4 rounded border-[#473b54] bg-[#211c27] focus:ring-offset-0"
                type="checkbox"
              />
              <span className="text-sm text-gray-400 transition-colors group-hover:text-gray-200">
                Lưu đăng nhập
              </span>
            </label>
            <a
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              href="/forget-password"
            >
              Quên mật khẩu?
            </a>
          </div>
          {/* Signin button */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050505] py-3.5 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all hover:bg-[#141418] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{isPending ? "Đang đăng nhập..." : "Đăng nhập"}</span>
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Copyright © 2025 Medimate. All rights reserved.
      </p>
    </div>
  );
}
