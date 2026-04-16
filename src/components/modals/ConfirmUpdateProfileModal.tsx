import { useAtom } from "jotai";
import { HiOutlineX, HiOutlineExclamationCircle } from "react-icons/hi";
import { closeModalAtom, confirmSubmitDataAtom } from "../../stores/modalStore";
import { useUpdateDoctorMe } from "@/hooks/data/useDoctorHooks";
import { useLogout } from "@/hooks/data/useAuthHooks";

export function ConfirmUpdateProfileModal() {
  const [, closeModal] = useAtom(closeModalAtom);
  const [formData] = useAtom(confirmSubmitDataAtom);
  const { mutateAsync: updateProfile, isPending } = useUpdateDoctorMe();
  const { mutateAsync: logoutAsync, isPending: isLoggingOut } = useLogout();

  const handleConfirm = async () => {
    if (!formData) return;
    try {
      await updateProfile(formData);
      closeModal();
      await logoutAsync();
      window.location.href = "/";
    } catch {
      // toast is already handled by hook
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 shadow-sm dark:border-white/10">
        <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
          Xác nhận cập nhật hồ sơ
        </h2>
        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
          disabled={isPending || isLoggingOut}
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4 p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Nếu bạn tiếp tục cập nhật thông tin (bằng cấp, chứng chỉ hoặc thông tin cá nhân), tài khoản của bạn sẽ <span className="text-gray-900 font-bold dark:text-white dark:font-medium">tạm ngưng hoạt động</span> cho đến khi được Quản lý duyệt lại.
        </p>

        <div className="flex gap-3 rounded-lg border border-orange-500/20 bg-orange-50 p-4 dark:bg-orange-500/5">
          <HiOutlineExclamationCircle className="h-5 w-5 shrink-0 text-orange-500 dark:text-orange-400" />
          <p className="text-sm text-orange-700 dark:text-orange-200/80">
            Bạn có chắc chắn muốn tiến hành cập nhật lúc này không?
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <button
          onClick={closeModal}
          disabled={isPending || isLoggingOut}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Hủy bỏ
        </button>
        <button
          className="btn-primary px-6 font-bold"
          onClick={handleConfirm}
          disabled={isPending || isLoggingOut}
        >
          {isPending || isLoggingOut ? "Đang xử lý..." : "Tôi hiểu, tiếp tục"}
        </button>
      </div>
    </div>
  );
}
