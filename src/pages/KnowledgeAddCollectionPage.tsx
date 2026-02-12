import { HiOutlinePlus } from "react-icons/hi";
import Breadcrumb from "../components/Breadcrumb";
import { useEffect, useState } from "react";
import GlassSelect from "../components/Select";
import { openModalAtom } from "../stores/modalStore";
import { useAtom } from "jotai";
import { IoArrowBack } from "react-icons/io5";
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
    label: "Thêm Collection",
  },
];
export default function KnowledgeAddCollectionPage() {
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
                Thêm Collection
              </h1>
            </div>
          </div>

          <div className="my-10 w-full">
            <AddCollectionForm
              onStartIndexing={() => setIsIndexing(true)}
              setCurrentStep={setCurrentStep}
            />
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

type SelectedDoc = {
  id: string;
  name: string;
  size: string; // "4.2 MB"
};

function AddCollectionForm({
  onStartIndexing,
  setCurrentStep,
}: {
  onStartIndexing: () => void;
  setCurrentStep: React.Dispatch<React.SetStateAction<IndexingStep>>;
}) {
  const [, openModal] = useAtom(openModalAtom);

  const [type, setType] = useState("");
  const [documents, setDocuments] = useState<SelectedDoc[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    onStartIndexing();

    const stepOrder: IndexingStep[] = [
      "parse",
      "chunk",
      "embedding",
      "finalizing",
    ];

    let index = 0;

    const interval = setInterval(() => {
      setCurrentStep(stepOrder[index]);

      index++;

      if (index >= stepOrder.length) {
        clearInterval(interval);
      }
    }, 2000); // mỗi 2s chuyển step
  };

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
        {/* Loại collection */}
        <div className="">
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Loại
          </label>
          <GlassSelect
            value={type}
            onChange={setType}
            placeholder="Loại Collection"
            options={[
              { label: "Tài liệu học thuật", value: "main" },
              { label: "Hỗ trợ", value: "help" },
            ]}
          />
        </div>

        {/* Documents */}
        <div className="flex flex-col rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Tài liệu đã chọn</p>
              <p className="text-xs text-gray-400">
                {documents.length > 0
                  ? `Đã chọn ${documents.length} tài liệu`
                  : "Chưa có tài liệu nào"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                openModal("index");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <HiOutlinePlus className="text-sm" />
              Thêm tài liệu
            </button>
          </div>
          {documents.length > 0 && (
            <div className="mt-4 max-h-100 space-y-2 overflow-y-auto pr-1">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2"
                >
                  {/* Left */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-400">{doc.size}</p>
                  </div>

                  {/* Right */}
                  <button
                    type="button"
                    onClick={() =>
                      setDocuments((prev) =>
                        prev.filter((item) => item.id !== doc.id),
                      )
                    }
                    className="ml-3 text-xs text-gray-400 transition hover:text-red-400"
                  >
                    Xoá
                  </button>
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
          className="bg-primary rounded-lg px-6 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tạo & Nạp dữ liệu
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
