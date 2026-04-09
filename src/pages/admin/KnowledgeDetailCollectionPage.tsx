import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { IoArrowBack } from "react-icons/io5";
import { HiOutlinePlus, HiOutlinePlay } from "react-icons/hi";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiFileText } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { openModalAtom } from "@/stores/modalStore";
import {
  useRAGCollectionDetail,
  useUpdateRAGCollection,
} from "@/hooks/data/useRAGCollectionHooks";
import {
  openIndexModalAtom,
  openProcessRAGModalAtom,
} from "@/stores/modalStore";
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
  const [isIndexing, setIsIndexing] = useState(false);
  const [currentStep, setCurrentStep] = useState<IndexingStep>("parse");

  return (
    <div className="page-layout">
      {!isIndexing ? (
        <>
          <div className="b-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Breadcrumb items={breadcrumbItems} />
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
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
          <IndexingCollectionUI currentStep={currentStep} />
        </div>
      )}
    </div>
  );
}

function DetailCollectionForm() {
  const { id: collectionId } = useParams();
  const navigate = useNavigate();
  const [, openIndexModal] = useAtom(openIndexModalAtom);
  const [, openProcessModal] = useAtom(openProcessRAGModalAtom);

  const { data: collection, isLoading } = useRAGCollectionDetail(
    collectionId || "",
  );
  const { mutate: updateCollection, isPending } = useUpdateRAGCollection();

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
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-white" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center space-y-10">
      {/* Form fields */}
      <form className="w-full space-y-6">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Tên collection
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Tài liệu pháp lý 2024"
            className="input-primary w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Mô tả
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Mô tả ngắn gọn mục đích collection..."
            className="input-primary w-full resize-none"
          />
        </div>

        {/* Documents */}
        <div className="flex flex-col rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Tài liệu đã gán</p>
              <p className="text-xs text-gray-400">
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
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
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
                  className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition"
                >
                  <HiOutlinePlay className="text-sm" />
                  Xử lý RAG / Nạp kiến thức
                </button>
              )}
            </div>
          </div>

          {collection?.documents && collection.documents.length > 0 && (
            <div className="thin-scrollbar mt-4 max-h-120 space-y-2 overflow-y-auto pr-1">
              {collection.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 transition-all hover:border-white/20"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-gray-400">
                      {doc.type === "pdf" ? (
                        <AiOutlineFilePdf className="text-lg text-red-400" />
                      ) : (
                        <FiFileText className="text-lg text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {doc.doc_name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-all ${
                        doc.status === "indexing"
                          ? "border-green-500/30 bg-green-500/10 text-green-400 animate-pulse"
                          : doc.status === "indexed"
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : doc.status === "failed"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : "border-white/10 bg-white/5 text-gray-400"
                      }`}
                    >
                      {doc.status === "indexing" && (
                        <div className="h-1 w-1 rounded-full bg-green-400" />
                      )}
                      {doc.status || "uploaded"}
                    </div>
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
          className="bg-primary rounded-lg px-6 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
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
  currentStep = "chunk",
}: {
  currentStep: IndexingStep;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (currentIndex >= steps.length) return;

    const stepTarget = steps[currentIndex].percent;

    // random duration 2s → 4s
    const duration = 2000 + Math.random() * 2000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / duration, 1);

      const newProgress =
        (currentIndex === 0 ? 0 : steps[currentIndex - 1].percent) +
        ratio *
          (stepTarget -
            (currentIndex === 0 ? 0 : steps[currentIndex - 1].percent));

      setProgress(Math.floor(newProgress));

      if (ratio === 1) {
        clearInterval(interval);

        setCompletedSteps((prev) => [...prev, currentIndex]);

        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 2000); // delay chút cho đẹp
      }
    }, 16);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center text-white">
      {/* Title */}
      <h2 className="text-2xl font-semibold tracking-tight">
        Đang nạp dữ liệu
      </h2>
      <p className="mt-2 max-w-xl text-center text-sm text-white/60">
        Hệ thống đang xử lý tài liệu và xây dựng dữ liệu tìm kiếm.
      </p>

      {/* Progress */}
      <div className="mt-8 h-1 w-full max-w-xl rounded-full bg-white/10">
        <div
          className="h-1 rounded-full bg-white/80 transition-[width] duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-white/40">{progress}% hoàn thành</div>

      {/* Steps – LEFT ALIGNED */}
      <div className="mt-8 w-full max-w-xl space-y-3 text-sm">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = completedSteps.includes(index);

          return (
            <div key={step.key} className="flex items-center justify-between">
              <div
                className={`flex items-start gap-3 transition-all duration-500 ${
                  isActive
                    ? "text-white"
                    : isDone
                      ? "text-white/70"
                      : "text-white/40"
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
      <div className="mt-10 text-xs text-white/40">
        Bạn có thể đóng cửa sổ này, tiến trình này có thể mất rất nhiều thời
        gian
      </div>
      <div className="mt-5">
        <a
          href="/dashboard/rag"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10"
        >
          Quay lại <IoArrowBack />
        </a>
      </div>
    </div>
  );
}
