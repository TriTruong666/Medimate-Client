import { useAtom } from "jotai";
import { HiOutlineX, HiOutlineCloudUpload, HiOutlineTrash } from "react-icons/hi";
import { AiOutlineFilePdf, AiOutlineFileZip } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { closeModalAtom } from "../../stores/modalStore";

type UploadItemProps = {
  icon: React.ReactNode;
  name: string;
  percent: number;
  color: "green" | "purple";
};

function UploadItem({ icon, name, percent, color }: UploadItemProps) {
  const colorMap = {
    green: "bg-emerald-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-3 transition hover:bg-white/6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gray-300">
        {icon}
      </div>

      <div className="flex-1">
        <div className="mb-1 flex justify-between text-sm">
          <span className="truncate font-medium text-white">{name}</span>
          <span className="text-primary text-xs font-medium">{percent}%</span>
        </div>

        <div className="h-1.5 rounded-full bg-white/10">
          <div
            className={`h-1.5 rounded-full ${colorMap[color]} transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <button className="rounded-lg p-1 text-gray-400 transition hover:text-white">
        <HiOutlineX />
      </button>
    </div>
  );
}

export function UploadDocumentModal() {
  const [, closeModal] = useAtom(closeModalAtom);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6 shadow-sm">
        <h2 className="text-base font-semibold tracking-tight text-white">
          Tải lên tài liệu
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        <div className="group flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/2 transition hover:bg-white/5">
          <div className="flex flex-col items-center">
            <div className="bg-primary/15 text-primary mb-3 rounded-full p-3 transition-transform group-hover:scale-110">
              <HiOutlineCloudUpload className="text-3xl" />
            </div>

            <p className="text-sm text-gray-300">
              <span className="text-primary font-medium">Nhấn để tải lên</span>{" "}
              hoặc kéo thả
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PDF, DOCX, DOC, TXT, JSON
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Uploading (3)
          </h3>

          <UploadItem
            icon={<AiOutlineFilePdf />}
            name="Product_Specs_v1.pdf"
            percent={85}
            color="green"
          />

          <UploadItem
            icon={<AiOutlineFileZip />}
            name="Brand_Assets.zip"
            percent={40}
            color="purple"
          />

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <FiFileText className="text-xl" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Meeting_Notes.docx
              </p>
              <p className="text-xs text-gray-400">1.2 MB</p>
            </div>

            <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-gray-300">
              Queued
            </span>

            <button className="rounded-lg p-1 text-gray-400 transition hover:text-red-400">
              <HiOutlineTrash />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Thoát
        </button>

        <button className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
          Tải lên
        </button>
      </div>
    </div>
  );
}
