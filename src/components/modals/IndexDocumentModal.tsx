import { useAtom } from "jotai";
import { useState, useMemo } from "react";
import { HiOutlineX, HiOutlineSearch, HiOutlineCheck } from "react-icons/hi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { closeModalAtom, collectionIdAtom } from "../../stores/modalStore";
import { useRAGUncollectedDocumentsInfinite } from "@/hooks/data/useRAGDocumentHooks";
import { useAssignDocumentsToCollection } from "@/hooks/data/useRAGCollectionHooks";

type AddDocumentModalProps = {
  onConfirm?: () => void;
};

export function IndexDocumentModal({ onConfirm }: AddDocumentModalProps) {
  const [search, setSearch] = useState("");
  const [, closeModal] = useAtom(closeModalAtom);
  const [collectionId] = useAtom(collectionIdAtom);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // API Hooks
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useRAGUncollectedDocumentsInfinite({
    limit: 20,
    q: search,
  });

  const { mutate: assignDocs, isPending: isAssigning } = useAssignDocumentsToCollection();

  // Documents processing
  const allLoadedDocs = useMemo(() => {
    return data?.pages.flatMap((page) => page.data.items) || [];
  }, [data]);

  const toggleDoc = (docId: string) => {
    setSelectedIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId],
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = allLoadedDocs.map((doc) => doc.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    } else {
      const currentPageIds = allLoadedDocs.map((doc) => doc.id);
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  const isAllSelected = allLoadedDocs.length > 0 && 
    allLoadedDocs.every((doc) => selectedIds.includes(doc.id));

  const handleConfirm = () => {
    if (!collectionId || selectedIds.length === 0) return;

    assignDocs(
      {
        collectionId,
        data: { document_ids: selectedIds },
      },
      {
        onSuccess: () => {
          onConfirm?.();
          closeModal();
        },
      },
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white max-w-lg w-full shadow-2xl transition-all duration-300 dark:border-white/10 dark:bg-neutral-900/80 dark:backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-gray-400 bg-white/5 p-6 shadow-sm dark:border-white/10">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Thêm tài liệu vào Collection
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-5 p-6 pb-2">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="input-primary h-10 w-full pl-11"
          />
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between px-1">
           <button 
             onClick={() => handleSelectAll(!isAllSelected)}
             className="text-xs font-bold text-primary hover:underline transition-all"
           >
             {isAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả đang tải"}
           </button>
           {hasNextPage && (
             <button
               onClick={() => fetchNextPage()}
               disabled={isFetchingNextPage}
               className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-all disabled:opacity-50 dark:text-gray-400 dark:hover:text-white"
             >
               {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
             </button>
           )}
        </div>

        <div className="max-h-80 min-h-40 space-y-2 overflow-y-auto pr-1 thin-scrollbar">
          {isLoading ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-xs text-gray-500 font-medium">Đang tải tài liệu...</p>
            </div>
          ) : allLoadedDocs.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-gray-400 font-medium">
               <FiFileText className="text-3xl mb-2" />
               <p className="text-sm">Không tìm thấy tài liệu</p>
            </div>
          ) : (
            allLoadedDocs.map((doc) => {
              const isSelected = selectedIds.includes(doc.id);
  
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDoc(doc.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-gray-300 bg-gray-50 hover:bg-white dark:border-white/10 dark:bg-white/3 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm border border-gray-200 text-gray-900 dark:bg-white/10 dark:text-white dark:border-transparent">
                    {doc.type === "pdf" ? (
                      <AiOutlineFilePdf className="text-xl text-red-500" />
                    ) : (
                      <FiFileText className="text-xl text-blue-500" />
                    )}
                  </div>
  
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                      {doc.doc_name}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{formatFileSize(doc.file_size)}</p>
                  </div>
  
                  {isSelected && (
                    <HiOutlineCheck className="text-primary text-xl font-bold" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-400 bg-white/5 p-6 shadow-sm dark:border-white/10">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          Đã chọn {selectedIds.length} tài liệu
        </p>

        <div className="flex gap-3">
          <button
            onClick={closeModal}
            className="rounded-lg px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
          >
            Huỷ
          </button>

          <button
            onClick={handleConfirm}
            disabled={selectedIds.length === 0 || isAssigning}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-white/10 dark:disabled:text-white/40"
          >
            {isAssigning ? "Đang gán..." : "Thêm tài liệu"}
          </button>
        </div>
      </div>
    </div>
  );
}
