/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineCheck,
} from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { FiFileText } from "react-icons/fi";
import { AiOutlineFilePdf, AiOutlineFileZip } from "react-icons/ai";
import { useAtom } from "jotai";
import { closeModalAtom } from "../stores/modalStore";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { PiHandEyeLight } from "react-icons/pi";
type LibraryDoc = {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "docx" | "txt" | "json";
};
type UploadItemProps = {
  icon: React.ReactNode;
  name: string;
  percent: number;
  color: "green" | "purple";
};

type AddDocumentModalProps = {
  onConfirm?: (docs: LibraryDoc[]) => void;
};
export function UploadDocumentModal() {
  const [, closeModal] = useAtom(closeModalAtom);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
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

      {/* Content */}
      <div className="space-y-6 p-6">
        {/* Dropzone */}
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

        {/* Uploading list */}
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

          {/* Queued */}
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

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Thoát
        </button>

        <button className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition">
          Tải lên
        </button>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6">
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

      {/* Content */}
      <div className="space-y-5 p-6">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tài liệu..."
            className="h-9 w-full rounded-xl border border-white/10 bg-white/5 pr-4 pl-11 text-sm text-gray-200 backdrop-blur-md transition-all placeholder:text-gray-500 hover:bg-white/10 focus:border-white/20 focus:bg-white/10 focus:ring-2 focus:ring-white/10 focus:outline-none"
          />
        </div>

        {/* List */}
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
                {/* Icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                  {doc.type === "pdf" ? (
                    <AiOutlineFilePdf className="text-xl text-red-400" />
                  ) : (
                    <FiFileText className="text-xl text-blue-400" />
                  )}
                </div>

                {/* Info */}
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

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/10 bg-white/2 p-6">
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
            className="bg-primary rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-40"
          >
            Thêm tài liệu
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddAccountModal() {
  const [phase, setPhase] = useState<"role" | "info">("role");
  const [role, setRole] = useState<"doctor" | "supervisor" | null>(null);
  const [, closeModal] = useAtom(closeModalAtom);

  return (
    <div className="flex w-150 flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-semibold text-white">
          Tạo tài khoản mới
        </h2>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {phase === "role" && <RolePhase selected={role} onSelect={setRole} />}
        {phase === "info" && <InfoPhase />}
      </div>

      {/* Footer */}
      {phase === "role" && (
        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
          <button
            onClick={closeModal}
            className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
          >
            Thoát
          </button>

          <button
            disabled={!role}
            onClick={() => setPhase("info")}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              role
                ? "bg-primary text-white hover:opacity-90"
                : "bg-white/10 text-white/40",
            )}
          >
            Tiếp theo
          </button>
        </div>
      )}

      {phase === "info" && (
        <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
          <button
            onClick={() => setPhase("role")}
            className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
          >
            Quay lại
          </button>

          <button
            onClick={closeModal}
            className={clsx(
              "rounded-lg px-4 py-2 text-sm font-medium transition",
              role
                ? "bg-primary text-white hover:opacity-90"
                : "bg-white/10 text-white/40",
            )}
          >
            Tạo mới
          </button>
        </div>
      )}
    </div>
  );
}

function RolePhase({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (role: "doctor" | "supervisor") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RoleCard
        icon={<FaUserDoctor size={28} />}
        title="Bác sĩ"
        description="Tạo tài khoản dành cho bác sĩ điều trị"
        active={selected === "doctor"}
        onClick={() => onSelect("doctor")}
      />

      <RoleCard
        icon={<PiHandEyeLight size={28} />}
        title="Kiểm định viên"
        description="Quản lý & duyệt hồ sơ bác sĩ"
        active={selected === "supervisor"}
        onClick={() => onSelect("supervisor")}
      />
    </div>
  );
}

function RoleCard({ icon, title, description, active, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group cursor-pointer rounded-xl border p-5 transition-all duration-200",
        active
          ? "border-primary bg-primary/10 shadow-primary/20 shadow-lg"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10",
      )}
    >
      <div
        className={clsx(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition",
          active
            ? "bg-primary text-white"
            : "bg-white/10 text-gray-300 group-hover:bg-white/20",
        )}
      >
        {icon}
      </div>

      <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>

      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}

function InfoPhase() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Input label="Email" placeholder="example123@gmail.com" type="email" />
      <Input label="Họ và tên" placeholder="Nhập tên của bạn" />

      <Input label="Số điện thoại" placeholder="Nhập SĐT của bạn" />
      <Input label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" />

      <Input
        label="Nhập lại mật khẩu"
        type="password"
        className="col-span-2"
        placeholder="Nhập lại mật khẩu"
      />
    </div>
  );
}

function Input({
  label,
  type = "text",
  className,
  placeholder = "Input here",
}: {
  label: string;
  type?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="input-primary text-[13px]!"
      />
    </div>
  );
}
