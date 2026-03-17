import { HiXMark } from "react-icons/hi2";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#050505] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Xóa gói</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            disabled={isPending}
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        <p className="text-sm text-gray-300">
          Bạn có chắc chắn muốn xóa gói{" "}
          <span className="font-semibold text-white">{packageName}</span> không?
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {isPending ? "Đang xóa..." : "Xóa gói"}
          </button>
        </div>
      </div>
    </div>
  );
}
