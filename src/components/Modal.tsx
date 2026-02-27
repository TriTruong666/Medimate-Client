/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HiOutlineX,
  HiOutlineCloudUpload,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineClipboardCopy,
} from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { FiFileText } from "react-icons/fi";
import { AiOutlineFilePdf, AiOutlineFileZip } from "react-icons/ai";
import { useAtom } from "jotai";
import {
  cancelTypeAtom,
  closeModalAtom,
  deleteTypeAtom,
  lockTypeAtom,
  pdfPreviewAtom,
  unlockTypeAtom,
} from "../stores/modalStore";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { PiHandEyeLight } from "react-icons/pi";
import { formatPrice } from "../common/format";
import { toast } from "../hooks/useToast";
import { IoMdCheckmark } from "react-icons/io";
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

export function PreviewPdfModal() {
  const [fileUrl] = useAtom(pdfPreviewAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  if (!fileUrl) return null;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-4 backdrop-blur-md">
        <h2 className="truncate text-base font-semibold tracking-tight text-white">
          Xem trước
        </h2>
        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="relative h-[70vh] w-full">
        <iframe
          src={fileUrl}
          className="h-full w-full rounded-b-2xl"
          title="PDF Preview"
        />
      </div>
    </div>
  );
}

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

export function LockModal() {
  const [lockType] = useAtom(lockTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  // Header & description dựa vào type
  const title =
    lockType === "account"
      ? "Khoá tài khoản"
      : lockType === "owner_package"
        ? "Khoá gói chủ sở hữu"
        : "Khoá";

  const description =
    lockType === "account"
      ? "Khoá tài khoản sẽ ngăn người dùng truy cập vào hệ thống. Người dùng sẽ không thể đăng nhập cho đến khi mở khoá."
      : lockType === "owner_package"
        ? "Khoá gói chủ sở hữu sẽ ngăn mọi thao tác trên gói này. Người dùng liên quan sẽ không thể sử dụng gói cho đến khi mở khoá."
        : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold tracking-tight text-white">
          {title}
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
        <p className="text-sm text-gray-300">{description}</p>

        {/* Warning / Details */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-yellow-400" />
            <p className="text-sm text-yellow-400">
              Hành động này sẽ tạm thời khoá{" "}
              {lockType === "account" ? "tài khoản" : "gói chủ sở hữu"}. Hãy
              chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-white" />
            <p className="text-sm text-white/80">
              Bạn có thể mở khoá lại bất cứ lúc nào từ trang quản lý.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
          onClick={() => {
            console.log("Khoá:", lockType);
            closeModal();
          }}
        >
          Khoá
        </button>
      </div>
    </div>
  );
}

export function UnlockModal() {
  const [unlockType] = useAtom(unlockTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  // Header & description
  const title =
    unlockType === "account"
      ? "Mở khoá tài khoản"
      : unlockType === "owner_package"
        ? "Mở khoá gói chủ sở hữu"
        : "Mở khoá";

  const description =
    unlockType === "account"
      ? "Mở khoá tài khoản sẽ cho phép người dùng truy cập lại vào hệ thống ngay lập tức."
      : unlockType === "owner_package"
        ? "Mở khoá gói chủ sở hữu sẽ cho phép người dùng liên quan sử dụng lại gói này."
        : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold tracking-tight text-white">
          {title}
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
        <p className="text-sm text-gray-300">{description}</p>

        {/* Info / Success */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <HiOutlineCheckCircle className="mt-0.5 text-emerald-400" />
            <p className="text-sm text-emerald-400">
              Hành động này sẽ mở khoá{" "}
              {unlockType === "account" ? "tài khoản" : "gói chủ sở hữu"} ngay
              lập tức.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-white" />
            <p className="text-sm text-white/80">
              Hãy chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
          onClick={() => {
            console.log("Mở khoá:", unlockType);
            closeModal();
          }}
        >
          Mở khoá
        </button>
      </div>
    </div>
  );
}

export function CancelModal() {
  const [cancelType] = useAtom(cancelTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  // Header & description
  const title = cancelType === "owner_package" ? "Huỷ gói chủ sở hữu" : "Huỷ";

  const description =
    cancelType === "owner_package"
      ? "Huỷ gói chủ sở hữu sẽ ngưng mọi hoạt động và quyền sử dụng của người dùng liên quan. Hành động này không thể hoàn tác."
      : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold tracking-tight text-white">
          {title}
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
        <p className="text-sm text-gray-300">{description}</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-red-400" />
            <p className="text-sm text-red-400">
              Hành động này sẽ huỷ{" "}
              {cancelType === "owner_package" ? "gói chủ sở hữu" : ""} ngay lập
              tức. Không thể hoàn tác.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-white" />
            <p className="text-sm text-white/80">
              Hãy chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
          onClick={() => {
            console.log("Huỷ:", cancelType);
            closeModal();
          }}
        >
          Huỷ gói
        </button>
      </div>
    </div>
  );
}

export function DeleteModal() {
  const [deleteType] = useAtom(deleteTypeAtom);
  const [, closeModal] = useAtom(closeModalAtom);

  // Header & description
  const title = deleteType === "document" ? "Xoá tài liệu" : "Xoá";

  const description =
    deleteType === "document"
      ? "Xoá tài liệu sẽ vĩnh viễn loại bỏ tệp này khỏi hệ thống. Hành động này không thể hoàn tác."
      : "";

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <h2 className="text-base font-semibold tracking-tight text-white">
          {title}
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
        <p className="text-sm text-gray-300">{description}</p>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-red-400" />
            <p className="text-sm text-red-400">
              Hành động này sẽ xoá {deleteType === "document" ? "tài liệu" : ""}{" "}
              vĩnh viễn. Không thể hoàn tác.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/5 p-4">
            <HiOutlineInformationCircle className="mt-0.5 text-white" />
            <p className="text-sm text-white/80">
              Hãy chắc chắn rằng bạn muốn thực hiện thao tác này.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/2 p-6 backdrop-blur-md">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Huỷ
        </button>

        <button
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400"
          onClick={() => {
            console.log("Xoá:", deleteType);
            closeModal();
          }}
        >
          Xoá
        </button>
      </div>
    </div>
  );
}

export type PaymentQRModalProps = {
  doctorName: string;
  bankName: string;
  bankAccount: string;
  accountName: string;
  amount: number;
  period: string;
  transferContent: string;
  qrImageUrl: string;
};

export function PaymentQRModal({
  doctorName,
  bankName,
  bankAccount,
  accountName,
  amount,
  period,
  transferContent,
  qrImageUrl,
}: PaymentQRModalProps) {
  const [, closeModal] = useAtom(closeModalAtom);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
  };

  const handleCheckPayment = () => {
    toast.success(
      "Giao dịch thành công",
      "Hệ thống đã ghi nhận thanh toán, bạn có thể tắt cửa sổ này.",
      {
        actionLabel: "Close",
        duration: 10000,
      },
    );
  };

  return (
    <div className="flex max-h-[85vh] w-160 flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/95 backdrop-blur-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-white">
            Thanh toán định kỳ
          </h2>
          <p className="text-xs text-white/50">
            Thanh toán phí cho bác sĩ – {period}
          </p>
        </div>

        <button
          onClick={closeModal}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
        >
          <HiOutlineX className="h-5 w-5" />
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {/* Doctor */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Người nhận</p>
          <p className="mt-1 text-sm font-medium text-white">{doctorName}</p>
        </div>

        {/* Amount */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs text-emerald-300">Tổng thanh toán</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {formatPrice(amount)}
          </p>
        </div>

        {/* Bank Info */}
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-xs text-white/50">Ngân hàng</p>
            <p className="text-sm text-white">{bankName}</p>
          </div>

          <div>
            <p className="text-xs text-white/50">Chủ tài khoản</p>
            <p className="text-sm text-white">{accountName}</p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-white/50">Số tài khoản</p>
              <p className="text-sm text-white">{bankAccount}</p>
            </div>

            <button
              onClick={() => handleCopy(bankAccount, "account")}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
            >
              {copied === "account" ? (
                <IoMdCheckmark className="h-4 w-4 shrink-0" />
              ) : (
                <HiOutlineClipboardCopy className="h-4 w-4 shrink-0" />
              )}
              {copied === "account" ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="max-w-[70%]">
              <p className="text-xs text-white/50">Nội dung chuyển khoản</p>
              <p className="text-sm font-medium break-all text-amber-400">
                {transferContent}
              </p>
            </div>

            <button
              onClick={() => handleCopy(transferContent, "content")}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
            >
              {copied === "content" ? (
                <IoMdCheckmark className="h-4 w-4 shrink-0" />
              ) : (
                <HiOutlineClipboardCopy className="h-4 w-4 shrink-0" />
              )}

              {copied === "content" ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>
        </div>

        {/* QR (dark style, không trắng gắt nữa) */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-neutral-800 p-6">
          <div className="rounded-lg bg-white p-3">
            <img
              src={qrImageUrl}
              alt="QR Code"
              className="h-44 w-44 object-contain"
            />
          </div>
          <p className="mt-4 text-xs text-white/50">
            Quét mã QR bằng ứng dụng ngân hàng
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <HiOutlineInformationCircle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
          <p className="text-sm leading-relaxed text-yellow-300">
            Vui lòng kiểm tra kỹ thông tin trước khi thực hiện chuyển khoản. Đảm
            bảo số tài khoản, tên chủ tài khoản, và nội dung chuyển khoản chính
            xác để tránh sai sót. Hệ thống sẽ tự động ghi nhận thanh toán sau
            khi giao dịch được xác nhận.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 border-t border-white/10 bg-white/5 px-6 py-5">
        <button
          onClick={closeModal}
          className="rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
        >
          Đóng
        </button>

        <button
          onClick={handleCheckPayment}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-400"
        >
          Kiểm tra giao dịch
        </button>
      </div>
    </div>
  );
}
