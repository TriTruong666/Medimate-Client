import { useAtom } from "jotai";
import {
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineTrash,
} from "react-icons/hi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { closeModalAtom } from "../../stores/modalStore";
import { useState, useRef } from "react";
import { useBulkUploadRAGDocuments } from "@/hooks/data/useRAGDocumentHooks";

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith(".pdf")) return <AiOutlineFilePdf className="text-xl" />;
  return <FiFileText className="text-xl" />;
}

function UploadItem({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/3 p-3 transition hover:bg-white/6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
        {getFileIcon(file.name)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">{file.name}</p>
        <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
      </div>

      <button
        onClick={onRemove}
        className="rounded-lg p-1 text-gray-400 transition hover:text-red-400"
      >
        <HiOutlineTrash />
      </button>
    </div>
  );
}

export function UploadDocumentModal() {
  const [, closeModal] = useAtom(closeModalAtom);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useBulkUploadRAGDocuments();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file); // Phải là 'files' vì backend nhận list[UploadFile] = File(...)
    });

    uploadMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success) {
          closeModal();
        }
      },
    });
  };

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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept=".pdf,.docx,.doc,.txt,.json,.md"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="group flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/2 transition hover:bg-white/5"
        >
          <div className="flex flex-col items-center">
            <div className="bg-primary/15 text-primary mb-3 rounded-full p-3 transition-transform group-hover:scale-110">
              <HiOutlineCloudUpload className="text-3xl" />
            </div>

            <p className="text-sm text-gray-300">
              <span className="text-primary font-medium">Nhấn để tải lên</span>{" "}
              hoặc kéo thả
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PDF, DOCX, DOC, TXT, JSON, MD
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Tài liệu đã chọn ({selectedFiles.length})
            </h3>

            <div className="max-h-60 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
              {selectedFiles.map((file, index) => (
                <UploadItem
                  key={index}
                  file={file}
                  onRemove={() => removeFile(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Thoát
        </button>

        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploadMutation.isPending}
          className="bg-primary flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {uploadMutation.isPending ? "Đang tải lên..." : "Tải lên"}
        </button>
      </div>
    </div>
  );
}
