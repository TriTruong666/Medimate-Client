export default function LoginPage() {
  return (
    <div className="relative w-full max-w-120 p-6 font-sans sm:p-8">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="pb-2 text-center text-3xl leading-tight font-bold tracking-tight text-white">
          Hello, Trí Trương
        </h1>
        <p className="text-center text-base leading-normal font-normal text-gray-400">
          Vui lòng đăng nhập để truy cập vào dashboard của bạn.
        </p>
      </div>
      <div className="relative rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_0_60px_-15px_rgba(168,85,247,0.45)] backdrop-blur-xl">
        <form action="" className="space-y-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm leading-none font-medium text-white">
              Email
            </label>
            <input
              className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
              placeholder="name@company.com"
              type="email"
            />
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
            />
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050505] py-3.5 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all hover:bg-[#141418]"
            type="submit"
          >
            <span>Đăng nhập</span>
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Copyright © 2025 Medimate. All rights reserved.
      </p>
    </div>
  );
}
