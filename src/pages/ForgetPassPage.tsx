export default function ForgetPassPage() {
  return (
    <div className="relative w-full max-w-120 p-6 font-sans sm:p-8">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="pb-2 text-center text-3xl leading-tight font-bold tracking-tight text-white">
          Quên mật khẩu hả?
        </h1>
        <p className="text-center text-base leading-normal font-normal text-gray-400">
          Đùa, nhập ngay email để khôi phục lại tài khoản
        </p>
      </div>
      <div className="relative rounded-2xl border border-white/10 p-8">
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
          {/* <div className="flex items-center justify-between py-1">
            <div className=""></div>
            <a
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              href="/forget-password"
            >
              Nhớ lại rồi!
            </a>
          </div> */}
          {/* Signin button */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#050505] py-3.5 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all hover:bg-[#141418]"
            type="submit"
          >
            <span>Xác thực</span>
          </button>
        </form>
      </div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Copyright © 2025 Medimate. All rights reserved.
      </p>
    </div>
  );
}
