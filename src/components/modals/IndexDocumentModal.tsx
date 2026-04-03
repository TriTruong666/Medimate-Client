import { useAtom } from "jotai";
import { useMemo, useState } from "react";
import { HiOutlineX, HiOutlineSearch, HiOutlineCheck } from "react-icons/hi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { closeModalAtom } from "../../stores/modalStore";

export type LibraryDoc = {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "docx" | "txt" | "json";
};

type AddDocumentModalProps = {
  onConfirm?: (docs: LibraryDoc[]) => void;
};

export function IndexDocumentModal({ onConfirm }: AddDocumentModalProps) {
  const [search, setSearch] = useState("");
  const [, closeModal] = useAtom(closeModalAtom);
  const [selected, setSelected] = useState<LibraryDoc[]>([]);

  const documents: LibraryDoc[] = [
    { id: "1", name: "Legal_2024.pdf", size: "4.2 MB", type: "pdf" },
    { id: "2", name: "Contract_Template.docx", size: "1.1 MB", type: "docx" },
    { id: "3", name: "Meeting_Notes.txt", size: "800 KB", type: "txt" },
    { id: "4", name: "Config.json", size: "120 KB", type: "json" },
  ];

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const toggleDoc = (doc: LibraryDoc) => {
    setSelected((prev) =>
      prev.find((d) => d.id === doc.id)
        ? prev.filter((d) => d.id !== doc.id)
        : [...prev, doc],
    );
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-white">
          Thêm tài liệu vào Collection
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 p-6">
        <div className="relative">
          <HiOutlineSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pr-4 pl-11 text-sm text-gray-200 backdrop-blur-md transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>

        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
          {filteredDocs.map((doc) => {
            const isSelected = selected.some((d) => d.id === doc.id);

            return (
              <button
                key={doc.id}
                onClick={() => toggleDoc(doc)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-white/3 hover:bg-white/5"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                  {doc.type === "pdf" ? (
                    <AiOutlineFilePdf className="text-xl text-red-400" />
                  ) : (
                    <FiFileText className="text-xl text-blue-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-400">{doc.size}</p>
                </div>

                {isSelected && (
                  <HiOutlineCheck className="text-primary text-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 bg-white/5 p-6 shadow-sm">
        <p className="text-xs text-gray-400">
          Đã chọn {selected.length} tài liệu
        </p>

        <div className="flex gap-3">
          <button
            onClick={closeModal}
            className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
          >
            Huỷ
          </button>

          <button
            onClick={() => {
              onConfirm?.(selected);
              closeModal();
            }}
            disabled={selected.length === 0}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-white/10 disabled:text-white/40"
          >
            Thêm tài liệu
          </button>
        </div>
      </div>
    </div>
  );
}
