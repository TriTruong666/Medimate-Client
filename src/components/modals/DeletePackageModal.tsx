import { HiOutlineX } from "react-icons/hi";

type DeletePackageModalProps = {
  packageName: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeletePackageModal({
  packageName,
  isPending,
  onClose,
  onConfirm,
}: DeletePackageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-white">Xóa gói</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            disabled={isPending}
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-300">
            Bạn có chắc chắn muốn xóa gói{" "}
            <span className="font-semibold text-white">{packageName}</span> không?
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-white/10 disabled:text-white/40"
          >
            {isPending ? "Đang xóa..." : "Xóa gói"}
          </button>
        </div>
      </div>
    </div>
  );
}
