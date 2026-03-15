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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold tracking-tight text-white">
          {title}
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        <p className="text-sm text-gray-300">{description}</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-yellow-400" />
            <p className="text-sm text-yellow-400">
              Hành động này sẽ tạm thời khoá{" "}
              {lockType === "account" ? "tài khoản" : "gói chủ sở hữu"}. Hãy
              chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-white" />
            <p className="text-sm text-white/80">
              Bạn có thể mở khoá lại bất cứ lúc nào từ trang quản lý.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
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
