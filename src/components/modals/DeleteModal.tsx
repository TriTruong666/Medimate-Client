import { useAtom } from "jotai";
import { HiOutlineX, HiOutlineInformationCircle } from "react-icons/hi";
import { closeModalAtom, deleteTypeAtom, deleteIdAtom } from "../../stores/modalStore";
import { useDeleteRAGDocument } from "@/hooks/data/useRAGDocumentHooks";

export function DeleteModal() {
  const [deleteType] = useAtom(deleteTypeAtom);
  const [deleteId] = useAtom(deleteIdAtom);
  const [, closeModal] = useAtom(closeModalAtom);
  const deleteMutation = useDeleteRAGDocument();

  const title = deleteType === "document" ? "Xoá tài liệu" : "Xoá";

  const description =
    deleteType === "document"
      ? "Xoá tài liệu sẽ vĩnh viễn loại bỏ tệp này khỏi hệ thống. Hành động này không thể hoàn tác."
      : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 dark:border-white/10">
        <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
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
        <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{description}</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-50 p-4 dark:bg-red-500/10">
            <HiOutlineInformationCircle className="mt-0.5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">
              Hành động này sẽ xoá {deleteType === "document" ? "tài liệu" : ""}{" "}
              vĩnh viễn. Không thể hoàn tác.
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
          className="rounded-lg px-6 py-2 text-sm font-bold text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          disabled={deleteMutation.isPending}
          className="flex min-w-[80px] items-center justify-center rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50 active:scale-95"
          onClick={() => {
            if (deleteType === "document" && deleteId) {
              deleteMutation.mutate(deleteId, {
                onSuccess: () => {
                  closeModal();
                },
              });
            } else {
              closeModal();
            }
          }}
        >
          {deleteMutation.isPending ? "Đang xoá..." : "Xoá"}
        </button>
      </div>
    </div>
  );
}
