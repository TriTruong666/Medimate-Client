import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { useCreateRAGCollection } from "@/hooks/data/useRAGCollectionHooks";
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
  return (
    <div className="page-layout">
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


function AddCollectionForm() {
  const navigate = useNavigate();
  const { mutate: createCollection, isPending } = useCreateRAGCollection();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCollection(
      {
        name,
        description,
        is_active: true,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            // Sau khi tạo thành công, có thể gán tài liệu hoặc xử lý tiếp
            // Ở đây tạm thời chuyển hướng về trang danh sách
            navigate("/dashboard/rag");
          }
        },
      },
    );
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
      </form>

      {/* Actions */}
      <div className="flex w-full justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="bg-primary rounded-lg px-6 py-2 text-sm font-medium text-white shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? "Đang tạo..." : "Tạo Collection"}
        </button>
      </div>
    </div>
  );
}

