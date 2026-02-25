import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function NotFoundPublicPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-screen items-center justify-center font-sans text-white">
      {/* Content Area */}
      <div className="flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full max-w-2xl rounded-lg border border-white/10 bg-neutral-900 p-10"
        >
          <div className="space-y-6">
            {/* Small Code */}
            <span className="font-mono text-xs text-gray-500">ERROR 404</span>

            {/* Title */}
            <h1 className="text-2xl font-semibold tracking-tight">
              Không tìm thấy trang
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-400">
              Trang bạn đang truy cập không tồn tại trong hệ thống. Có thể URL
              đã thay đổi hoặc bạn không có quyền truy cập.
            </p>

            {/* Divider */}
            <div className="flex gap-4 border-t border-white/10 pt-6">
              <button
                onClick={() => navigate(-1)}
                className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
              >
                Quay lại
              </button>

              <button
                onClick={() => navigate("/")}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function NotFoundPrivatePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-black font-sans text-white">
      {/* Content Area */}
      <div className="flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full max-w-2xl rounded-lg border border-white/10 bg-neutral-900 p-10"
        >
          <div className="space-y-6">
            {/* Small Code */}
            <span className="font-mono text-xs text-gray-500">ERROR 404</span>

            {/* Title */}
            <h1 className="text-2xl font-semibold tracking-tight">
              Không tìm thấy trang
            </h1>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-400">
              Trang bạn đang truy cập không tồn tại trong hệ thống. Có thể URL
              đã thay đổi hoặc bạn không có quyền truy cập.
            </p>

            {/* Divider */}
            <div className="flex gap-4 border-t border-white/10 pt-6">
              <button
                onClick={() => navigate(-1)}
                className="rounded-md border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
              >
                Quay lại
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
              >
                Về Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
