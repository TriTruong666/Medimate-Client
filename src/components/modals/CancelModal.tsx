import { useAtom } from "jotai";
import { HiOutlineX, HiOutlineInformationCircle } from "react-icons/hi";
import { closeModalAtom, cancelTypeAtom } from "../../stores/modalStore";

export function CancelModal() {
  const [cancelType] = useAtom(cancelTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  const title = cancelType === "owner_package" ? "Huỷ gói chủ sở hữu" : "Huỷ";

  const description =
    cancelType === "owner_package"
      ? "Huỷ gói chủ sở hữu sẽ ngưng mọi hoạt động và quyền sử dụng của người dùng liên quan. Hành động này không thể hoàn tác."
      : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
          Xác nhận Huỷ
        </h2>
        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Hành động này sẽ huỷ bỏ tất cả thay đổi chưa lưu và đóng cửa sổ này.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50 p-4 dark:bg-amber-500/10">
            <HiOutlineInformationCircle className="mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Mọi dữ liệu bạn đã nhập nhưng chưa lưu sẽ bị mất vĩnh viễn.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Đóng
        </button>
        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          onClick={() => {
            console.log("Huỷ:", cancelType);
            closeModal();
          }}
        >
          Xác nhận Huỷ
        </button>
      </div>
    </div>
  );
}
