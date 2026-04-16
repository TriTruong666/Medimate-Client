import { useAtom } from "jotai";
import { HiOutlineX, HiOutlineInformationCircle } from "react-icons/hi";
import { closeModalAtom, lockTypeAtom, userIdAtom } from "../../stores/modalStore";
import { useDeactivateUser } from "@/hooks/data/useAccountHooks";

export function LockModal() {
  const [lockType] = useAtom(lockTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);
  const [userId] = useAtom(userIdAtom);
  const { mutateAsync, isPending } = useDeactivateUser();

  const handleLock = async () => {
    if (!userId) return;
    await mutateAsync(userId);
  };

  const title =
    lockType === "account"
      ? "Khoá tài khoản"
      : lockType === "owner_package"
        ? "Khoá gói chủ sở hữu"
        : "Khoá";

  const description =
    lockType === "account"
      ? "Khoá tài khoản sẽ ngăn người dùng truy cập vào hệ thống. Người dùng sẽ không thể đăng nhập cho đến khi mở khoá."
      : lockType === "owner_package"
        ? "Khoá gói chủ sở hữu sẽ ngăn mọi thao tác trên gói này. Người dùng liên quan sẽ không thể sử dụng gói cho đến khi mở khoá."
        : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <h2 className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        <p className="text-sm text-gray-500 dark:text-gray-300">{description}</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-50 p-4 dark:bg-yellow-500/10">
            <HiOutlineInformationCircle className="mt-0.5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Hành động này sẽ tạm thời khoá{" "}
              {lockType === "account" ? "tài khoản" : "gói chủ sở hữu"}. Hãy
              chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-gray-400 bg-white/5 p-4 dark:border-white/20 dark:bg-white/5">
            <HiOutlineInformationCircle className="mt-0.5 text-gray-500 dark:text-white" />
            <p className="text-sm text-gray-600 dark:text-white/80">
              Bạn có thể mở khoá lại bất cứ lúc nào từ trang quản lý.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          onClick={() => {
            handleLock();
            closeModal();
          }}
          disabled={isPending}
        >
          {isPending ? "Đang khoá..." : "Khoá"}
        </button>
      </div>
    </div>
  );
}
