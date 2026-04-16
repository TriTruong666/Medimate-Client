import { useAtom } from "jotai";
import { HiOutlineX, HiOutlineCheckCircle, HiOutlineInformationCircle } from "react-icons/hi";
import { closeModalAtom, unlockTypeAtom, userIdAtom } from "../../stores/modalStore";
import { useActivateUser } from "@/hooks/data/useAccountHooks";

export function UnlockModal() {
  const [unlockType] = useAtom(unlockTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);
  const [userId] = useAtom(userIdAtom);
  const { mutateAsync, isPending } = useActivateUser();

  const handleUnlock = async () => {
    if (!userId) return;
    await mutateAsync(userId);
  };

  const title =
    unlockType === "account"
      ? "Mở khoá tài khoản"
      : unlockType === "owner_package"
        ? "Mở khoá gói chủ sở hữu"
        : "Mở khoá";

  const description =
    unlockType === "account"
      ? "Mở khoá tài khoản sẽ cho phép người dùng truy cập lại vào hệ thống ngay lập tức."
      : unlockType === "owner_package"
        ? "Mở khoá gói chủ sở hữu sẽ cho phép người dùng liên quan sử dụng lại gói này."
        : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 shadow-sm dark:border-white/10">
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
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-50 p-4 dark:bg-emerald-500/10">
            <HiOutlineCheckCircle className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Hành động này sẽ mở khoá{" "}
              {unlockType === "account" ? "tài khoản" : "gói chủ sở hữu"} ngay
              lập tức.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-gray-400 bg-white/5 p-4 dark:border-white/20 dark:bg-white/5">
            <HiOutlineInformationCircle className="mt-0.5 text-gray-500 dark:text-white" />
            <p className="text-sm text-gray-600 dark:text-white/80">
              Hãy chắc chắn rằng bạn muốn thực hiện thao tác này.
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
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
          onClick={() => {
            handleUnlock();
            closeModal();
          }}
          disabled={isPending}
        >
          {isPending ? "Đang mở khoá..." : "Mở khoá"}
        </button>
      </div>
    </div>
  );
}
