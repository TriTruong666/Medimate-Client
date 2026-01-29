import { HiOutlinePlus } from "react-icons/hi";
import Breadcrumb from "../components/Breadcrumb";
import { useState } from "react";
import GlassSelect from "../components/Select";

export default function KnowledgeAddCollectionPage() {
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
  return (
    <div className="mx-auto max-w-384 space-y-6">
      <div className="b-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Thêm Collection
          </h1>
        </div>
      </div>
      <div className="my-10 w-full">
        <AddCollectionForm />
      </div>
    </div>
  );
}

type SelectedDoc = {
  id: string;
  name: string;
  size: string; // "4.2 MB"
};

function AddCollectionForm() {
  const [type, setType] = useState("");
  const [documents, setDocuments] = useState<SelectedDoc[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-4 text-sm text-gray-200 placeholder-gray-500 backdrop-blur-md outline-none hover:bg-white/10 focus:border-white/20 focus:bg-white/10 focus:ring-1 focus:ring-white/10 focus:outline-none"
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
            className="focus:border-primary focus:ring-primary w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition outline-none focus:ring-1"
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
                setDocuments((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    name: `Document_${prev.length + 1}.pdf`,
                    size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
                  },
                ]);
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
        <button className="bg-primary rounded-lg px-6 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">
          Tạo collection
        </button>
      </div>
    </div>
  );
}
