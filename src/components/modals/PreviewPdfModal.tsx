import { useAtom } from "jotai";
import { HiOutlineX } from "react-icons/hi";
import { closeModalAtom, pdfPreviewAtom } from "../../stores/modalStore";

export function PreviewPdfModal() {
  const [fileUrl] = useAtom(pdfPreviewAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  if (!fileUrl) return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-4 shadow-sm dark:border-white/10">
        <h2 className="truncate text-base font-bold tracking-tight text-gray-900 dark:text-white">
          Xem trước
        </h2>
        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="relative h-[70vh] w-full">
        <iframe
          src={fileUrl}
          className="h-full w-full rounded-b-2xl"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}
