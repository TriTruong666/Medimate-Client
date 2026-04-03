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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6 shadow-sm">
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
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-red-400" />
            <p className="text-sm text-red-400">
              Hành động này sẽ huỷ{" "}
              {cancelType === "owner_package" ? "gói chủ sở hữu" : ""} ngay lập
              tức. Không thể hoàn tác.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-white" />
            <p className="text-sm text-white/80">
              Hãy chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
          onClick={() => {
            console.log("Huỷ:", cancelType);
            closeModal();
          }}
        >
          Huỷ gói
        </button>
      </div>
    </div>
  );
}
