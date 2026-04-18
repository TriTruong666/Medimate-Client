import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlinePlus, HiOutlinePlay } from "react-icons/hi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import {
  useRAGCollectionDetail,
  useUpdateRAGCollection,
  useRemoveDocumentsFromCollection,
} from "@/hooks/data/useRAGCollectionHooks";
import {
  openIndexModalAtom,
  openProcessRAGModalAtom,
} from "@/stores/modalStore";
import { useRagSse } from "@/hooks/sse/useRagSseHooks";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/custom-ui/Spinner";

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Kho dữ liệu",
    path: "/dashboard/rag",
  },
  {
    label: "Chi tiết Collection",
  },
];

export default function KnowledgeDetailCollectionPage() {
  const { id: collectionId } = useParams();
  const [isIndexing, setIsIndexing] = useState(false);
  const [currentStep, setCurrentStep] = useState<IndexingStep>("parse");

  const queryClient = useQueryClient();
  const { processUpdate, processLog } = useRagSse();
  const [progress, setProgress] = useState(0);
  const [logMessage, setLogMessage] = useState("");

  // Tự động refresh dữ liệu khi có cập nhật từ SSE
  useEffect(() => {
    if (processUpdate && processUpdate.collection_id === collectionId) {
      queryClient.invalidateQueries({
        queryKey: ["rag", "collections", collectionId],
      });

      if (processUpdate.status === "indexing") {
        setIsIndexing(true);
      } else if (
        processUpdate.status === "indexed" ||
        processUpdate.status === "failed"
      ) {
        // Delay 3s để user thấy 100% trước khi chuyển phase
        setTimeout(() => {
          setIsIndexing(false);
          setProgress(0);
          setLogMessage("");
        }, 3000);
      }
    }
  }, [processUpdate, collectionId, queryClient]);

  useEffect(() => {
    if (processLog) {
      // Handle error status: Tự động thoát sau 3s để user kịp đọc lỗi
      if (processLog.status === "error") {
        setLogMessage(processLog.message);
        setTimeout(() => {
          setIsIndexing(false);
          setProgress(0);
          setLogMessage("");
        }, 3000);
        return;
      }

      // Khi có log nạp tài liệu, tự động chuyển sang giao diện Indexing nếu chưa bật
      if (!isIndexing) {
        setIsIndexing(true);
      }

      if (processLog.progress !== null && processLog.progress !== undefined) {
        setProgress(processLog.progress);
      }
      setLogMessage(processLog.message);
    }
  }, [processLog, isIndexing]);

  return (
    <div className="page-layout">
      {!isIndexing ? (
        <>
          <div className="b-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Breadcrumb items={breadcrumbItems} />
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
                Chi tiết Collection
              </h1>
            </div>
          </div>

          <div className="my-10 w-full">
            <DetailCollectionForm />
          </div>
        </>
      ) : (
        <div className="min-h-screen place-content-center">
          <IndexingCollectionUI
            progress={progress}
            logMessage={logMessage}
            onBack={() => setIsIndexing(false)}
          />
        </div>
      )}
    </div>
  );
}

function DetailCollectionForm() {
  const { id: collectionId } = useParams();
  const [, openIndexModal] = useAtom(openIndexModalAtom);
  const [, openProcessModal] = useAtom(openProcessRAGModalAtom);

  const { data: collection, isLoading } = useRAGCollectionDetail(
    collectionId || "",
  );
  const { mutate: updateCollection, isPending } = useUpdateRAGCollection();
  const { mutate: removeDocs, isPending: isRemoving } =
    useRemoveDocumentsFromCollection();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description);
    }
  }, [collection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !collectionId) return;

    updateCollection({
      collectionId,
      data: {
        name,
        description,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center space-y-10">
      {/* Form fields */}
      <form className="w-full space-y-6">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
            Tên collection
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Tài liệu pháp lý 2024"
            className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Mô tả ngắn gọn mục đích collection..."
            className="focus:border-primary/50 focus:ring-primary/10 w-full resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>

        {/* Documents */}
        <div className="flex flex-col rounded-2xl border border-dashed border-gray-400 bg-gray-50/30 px-6 py-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Tài liệu đã gán
              </p>
              <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-white/50">
                {collection?.documents?.length
                  ? `Tổng cộng ${collection.documents.length} tài liệu`
                  : "Chưa có tài liệu nào"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (collectionId) openIndexModal(collectionId);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-400 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <HiOutlinePlus className="text-sm" />
                Thêm tài liệu
              </button>

              {collection?.documents && collection.documents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (collectionId) openProcessModal(collectionId);
                  }}
                  className="bg-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                  <HiOutlinePlay className="text-sm" />
                  Nạp kiến thức mới
                </button>
              )}
            </div>
          </div>

          {collection?.documents && collection.documents.length > 0 && (
            <div className="thin-scrollbar mt-4 space-y-2 overflow-y-auto pr-1">
              {collection.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`group relative flex items-center justify-between rounded-xl border p-3 transition-all ${
                    doc.status === "indexing"
                      ? "animate-pulse-slow border-emerald-500/30 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/5"
                      : doc.status === "indexed"
                        ? "border-primary/30 bg-primary/5 dark:border-primary/20 dark:bg-primary/5"
                        : doc.status === "failed"
                          ? "border-red-500/30 bg-red-50 dark:border-red-500/30 dark:bg-red-500/5"
                          : "hover:border-primary/50 border-gray-300 bg-white dark:border-white/10 dark:bg-black/40 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        doc.status === "indexing"
                          ? "bg-emerald-100 dark:bg-emerald-500/20"
                          : doc.status === "indexed"
                            ? "bg-primary/10 dark:bg-primary/20"
                            : doc.status === "failed"
                              ? "bg-red-100 dark:bg-red-500/20"
                              : "bg-gray-100 dark:bg-white/5"
                      }`}
                    >
                      {doc.type === "pdf" ? (
                        <AiOutlineFilePdf
                          className={`text-xl ${doc.status === "failed" ? "text-red-400" : "text-red-400/80"}`}
                        />
                      ) : (
                        <FiFileText
                          className={`text-xl ${doc.status === "failed" ? "text-blue-400" : "text-blue-400/80"}`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-sm font-bold ${
                          doc.status === "failed"
                            ? "text-red-600 dark:text-red-200"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {doc.doc_name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center pl-4">
                    {/* Hover remove button */}
                    <button
                      type="button"
                      disabled={isRemoving}
                      onClick={() => {
                        if (collectionId)
                          removeDocs({
                            collectionId,
                            data: { document_ids: [doc.id] },
                          });
                      }}
                      className="mr-2 flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-200 disabled:opacity-30 dark:bg-red-500/10 dark:text-red-500 dark:hover:bg-red-500/20"
                      title="Gỡ khỏi collection"
                    >
                      <IoClose className="text-lg" />
                    </button>

                    {doc.status === "indexed" ? (
                      <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    ) : doc.status === "indexing" ? (
                      <div className="flex h-5 w-5 items-center justify-center">
                        <div className="h-2 w-2 animate-ping rounded-full bg-green-400" />
                      </div>
                    ) : doc.status === "failed" ? (
                      <div className="text-red-400">
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Actions */}
      <div className="flex w-full justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="bg-primary rounded-xl px-8 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}

type IndexingStep = "parse" | "chunk" | "embedding" | "finalizing";

const steps: {
  key: IndexingStep;
  label: string;
  description: string;
  percent: number;
}[] = [
  {
    key: "parse",
    label: "Reading documents",
    description: "Đọc và chuẩn hoá nội dung",
    percent: 25,
  },
  {
    key: "chunk",
    label: "Chunking data",
    description: "Phân đoạn dữ liệu",
    percent: 50,
  },
  {
    key: "embedding",
    label: "Creating embeddings",
    description: "Tạo vector embedding",
    percent: 80,
  },
  {
    key: "finalizing",
    label: "Finalizing",
    description: "Hoàn tất và lưu trữ",
    percent: 100,
  },
];

function IndexingCollectionUI({
  progress,
  logMessage,
  onBack,
}: {
  progress: number;
  logMessage: string;
  onBack: () => void;
}) {
  const currentIndex = steps.findIndex((s) => progress <= s.percent);
  const completedSteps = steps
    .map((s, i) => (progress > s.percent ? i : -1))
    .filter((i) => i !== -1);

  return (
    <div className="flex min-h-[60vh] flex-col items-center">
      {/* Title */}
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Đang nạp dữ liệu
      </h2>
      <p className="mt-2 max-w-xl text-center text-sm font-medium text-gray-500 dark:text-white/60">
        {logMessage ||
          "Hệ thống đang xử lý tài liệu và xây dựng dữ liệu tìm kiếm."}
      </p>

      {/* Progress */}
      <div className="mt-10 h-1.5 w-full max-w-xl rounded-full bg-gray-200 dark:bg-white/10">
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-700 ease-out dark:bg-white/80"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase dark:text-white/40">
        {progress}% hoàn thành
      </div>

      {/* Steps – LEFT ALIGNED */}
      <div className="mt-8 w-full max-w-xl space-y-3 text-sm">
        {steps.map((step, index) => {
          const isActive =
            index === (currentIndex === -1 ? steps.length - 1 : currentIndex);
          const isDone = completedSteps.includes(index) || progress === 100;

          return (
            <div key={step.key} className="flex items-center justify-between">
              <div
                className={`flex items-start gap-3 transition-all duration-500 ${
                  isActive
                    ? "text-gray-900 dark:text-white"
                    : isDone
                      ? "text-gray-600 dark:text-white/70"
                      : "text-gray-400 dark:text-white/40"
                }`}
              >
                <span
                  className={`mt-1 shrink-0 text-xs transition-all duration-300 ${
                    isDone ? "scale-125 text-green-400" : ""
                  }`}
                >
                  {isDone ? "✓" : isActive ? "●" : "○"}
                </span>

                <div>
                  <div className="font-medium">{step.label}</div>
                  <div className="text-xs opacity-70">{step.description}</div>
                </div>
              </div>

              <span className="text-xs text-white/40">
                {isDone ? "Hoàn tất" : isActive ? "Đang xử lý..." : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 text-[11px] font-medium text-gray-400 dark:text-white/40">
        Bạn có thể đóng cửa sổ này, tiến trình này sẽ chạy ngầm
      </div>
      <div className="mt-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-gray-400 bg-white px-6 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
        >
          Quay lại <IoArrowBack />
        </button>
      </div>
    </div>
  );
}
