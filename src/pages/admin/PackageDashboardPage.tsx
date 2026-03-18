import { FiMoreVertical, FiPlus, FiUsers } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { useClickOutside } from "@/hooks/useDropdown";
import { formatPrice } from "@/common/format";
import {
  useCreatePackage,
  useDeletePackage,
  usePackages,
  useUpdatePackage,
} from "@/hooks/data/usePackageHooks";
import { Spinner } from "@/components/custom-ui/Spinner";
import {
  DeletePackageModal,
  EditPackageModal,
  type EditPackageFormErrors,
} from "@/components/modals";
import type { Package, UpdatePackageRequest } from "@/types/Package";

type TableColumn = {
  key: ColumnKey;
  label: string;
};

type ColumnKey = string;

type DropdownItemProps = {
  label: string;
  danger?: boolean;
};

type ComparisonRow = {
  packageName: string;
  price: number;
  currency: string;
  durationDays: number;
  memberLimit: number;
  ocrLimit: number;
  consultantLimit: number;
  description: string;
};

type TableCellValue = string | number | boolean | null | undefined;

function mapPackageToComparisonRow(pkg: Package): ComparisonRow {
  return {
    packageName: pkg.packageName,
    price: pkg.price,
    currency: pkg.currency,
    durationDays: pkg.durationDays,
    memberLimit: pkg.memberLimit,
    ocrLimit: pkg.ocrLimit,
    consultantLimit: pkg.consultantLimit,
    description: pkg.description,
  };
}

function mapPackageToUpdateRequest(pkg: Package): UpdatePackageRequest {
  return {
    packageName: pkg.packageName,
    price: pkg.price,
    currency: pkg.currency,
    durationDays: pkg.durationDays,
    memberLimit: pkg.memberLimit,
    ocrLimit: pkg.ocrLimit,
    consultantLimit: pkg.consultantLimit,
    description: pkg.description,
  };
}

const DEFAULT_PACKAGE_FORM: UpdatePackageRequest = {
  packageName: "",
  price: 0,
  currency: "VND",
  durationDays: 30,
  memberLimit: 1,
  ocrLimit: 0,
  consultantLimit: 0,
  description: "",
};

function validateEditPackageForm(
  form: UpdatePackageRequest,
): EditPackageFormErrors {
  const errors: EditPackageFormErrors = {};

  if (!form.packageName.trim()) errors.packageName = "Tên gói là bắt buộc.";
  if (!form.currency.trim()) errors.currency = "Loại tiền là bắt buộc.";
  if (form.price < 0) errors.price = "Giá không được âm.";
  if (form.durationDays <= 0)
    errors.durationDays = "Thời hạn phải lớn hơn 0 ngày.";
  if (form.memberLimit <= 0) errors.memberLimit = "Số thành viên phải lớn hơn 0.";
  if (form.ocrLimit < 0) errors.ocrLimit = "Giới hạn OCR không được âm.";
  if (form.consultantLimit < 0)
    errors.consultantLimit = "Giới hạn tư vấn không được âm.";

  return errors;
}

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Gói",
    path: "/dashboard/packages",
  },
  {
    label: "Quản lý gói",
  },
];
export function PackageDashboardPage() {
  const { data, isLoading, isError, error } = usePackages();
  const { mutateAsync: createPackage, isPending: isCreatingPackage } =
    useCreatePackage();
  const { mutateAsync: deletePackage, isPending: isDeletingPackage } =
    useDeletePackage();
  const { mutateAsync: updatePackage, isPending: isUpdatingPackage } = useUpdatePackage();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [modalForm, setModalForm] = useState<UpdatePackageRequest | null>(null);
  const [editErrors, setEditErrors] = useState<EditPackageFormErrors>({});
  const isSubmitting = isCreatingPackage || isUpdatingPackage;
  const packageList = useMemo(
    () => [...(data ?? [])].sort((a, b) => a.price - b.price),
    [data],
  );
  const packageRows = packageList.map(mapPackageToComparisonRow);
  const columns: TableColumn[] = packageList.map((pkg) => ({
    key: pkg.packageId,
    label: pkg.packageName,
  }));

  const handleOpenCreatePopup = () => {
    setModalMode("create");
    setEditingPackage(null);
    setModalForm(DEFAULT_PACKAGE_FORM);
    setEditErrors({});
  };

  const handleOpenEditPopup = (pkg: Package) => {
    setModalMode("edit");
    setEditingPackage(pkg);
    setModalForm(mapPackageToUpdateRequest(pkg));
    setEditErrors({});
  };

  const handleCloseEditPopup = () => {
    setModalMode(null);
    setEditingPackage(null);
    setModalForm(null);
    setEditErrors({});
  };

  const handleOpenDeletePopup = (pkg: Package) => {
    setDeletingPackage(pkg);
  };

  const handleCloseDeletePopup = () => {
    setDeletingPackage(null);
  };

  const handleEditFieldChange = <K extends keyof UpdatePackageRequest>(
    field: K,
    value: UpdatePackageRequest[K],
  ) => {
    setModalForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmitEditPackage = async () => {
    if (!modalMode || !modalForm) return;

    const nextErrors = validateEditPackageForm(modalForm);
    setEditErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    try {
      if (modalMode === "edit") {
        if (!editingPackage) return;
        await updatePackage({
          packageId: editingPackage.packageId,
          request: modalForm,
        });
      } else {
        await createPackage(modalForm);
      }
      handleCloseEditPopup();
    } catch {
      // onError đã xử lý toast ở hook
    }
  };

  const handleConfirmDeletePackage = async () => {
    if (!deletingPackage) return;

    try {
      const result = await deletePackage(deletingPackage.packageId);
      if (result.success) {
        handleCloseDeletePopup();
      }
    } catch {
      // onError đã xử lý toast ở hook
    }
  };

  if (isLoading) {
    return <div className="page-layout">
      <div className="my-8 space-y-8">
        <Spinner />
      </div>
    </div>;
  }
  if (isError) {
    return <div className="page-layout">
      <div className="my-8 space-y-8">
        <p className="text-red-500">{error?.message}</p>
      </div>
    </div>;
  }
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý gói
          </h1>
        </div>
        <button
          type="button"
          onClick={handleOpenCreatePopup}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90"
        >
          <FiPlus />
          Thêm gói
        </button>
      </div>
      {/* Content */}
      <div className="my-8 space-y-8">
        {packageList.length > 0 ? (
          <PackageGrid
            data={packageList}
            onEdit={handleOpenEditPopup}
            onDelete={handleOpenDeletePopup}
          />
        ) : (
          <p className="text-gray-500">Không tìm thấy dữ liệu</p>
        )}
      </div>
      {packageList.length > 0 && (
        <div className="my-12 space-y-8">
          <PackageComparisonTable columns={columns} rows={packageRows} />
        </div>
      )}

      {modalMode && modalForm && (
        <EditPackageModal
          value={modalForm}
          errors={editErrors}
          isPending={isSubmitting}
          title={modalMode === "create" ? "Thêm gói mới" : "Chỉnh sửa gói"}
          submitLabel={modalMode === "create" ? "Tạo gói" : "Lưu thay đổi"}
          onClose={handleCloseEditPopup}
          onChange={handleEditFieldChange}
          onSubmit={handleSubmitEditPackage}
        />
      )}

      {deletingPackage && (
        <DeletePackageModal
          packageName={deletingPackage.packageName}
          isPending={isDeletingPackage}
          onClose={handleCloseDeletePopup}
          onConfirm={handleConfirmDeletePackage}
        />
      )}
    </div>
  );
}

function PackageComparisonTable({
  columns,
  rows,
}: {
  columns: TableColumn[];
  rows: ComparisonRow[];
}) {
  const featureRows = [
    {
      label: "Giá gói",
      render: (row: ComparisonRow) =>
        row.price === 0 ? "Miễn phí" : `${formatPrice(row.price)} ${row.currency}`,
    },
    {
      label: "Thời hạn sử dụng",
      render: (row: ComparisonRow) => `${row.durationDays} ngày`,
    },
    {
      label: "Số lượng thành viên tối đa",
      render: (row: ComparisonRow) => row.memberLimit,
    },
    {
      label: "OCR đơn thuốc",
      render: (row: ComparisonRow) =>
        row.ocrLimit > 0 ? `${row.ocrLimit} lượt` : "Không hỗ trợ",
    },
    {
      label: "Tư vấn chuyên gia",
      render: (row: ComparisonRow) =>
        row.consultantLimit > 0 ? `${row.consultantLimit} lượt` : "Không hỗ trợ",
    },
    {
      label: "Mô tả",
      render: (row: ComparisonRow) => row.description || "-",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5">
      <table className="min-w-full text-sm">
        {/* Header */}
        <thead className="bg-gray-50 dark:bg-white/10">
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300">
              So sánh gói
            </th>

            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-center font-semibold text-gray-700 dark:text-white`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
          {featureRows.map((feature, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 dark:hover:bg-white/5"
            >
              {/* Feature label */}
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {feature.label}
              </td>

              {/* Plans */}
              {columns.map((_, colIndex) => {
                const comparedPackageData = rows[colIndex];
                return (
                  <td key={colIndex} className={`px-6 py-4 text-center`}>
                    <TableCell
                      value={
                        comparedPackageData
                          ? feature.render(comparedPackageData)
                          : "-"
                      }
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableCell({ value }: { value: TableCellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <HiCheck className="mx-auto text-lg text-emerald-500" />
    ) : (
      <HiXMark className="mx-auto text-lg text-gray-300 dark:text-red-600" />
    );
  }

  if (value === "Không giới hạn") {
    return <span className="text-primary dark:text-primary">{value}</span>;
  }

  if (value === "Không hỗ trợ") {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400">
        <HiXMark className="text-lg" />
      </span>
    );
  }

  if (value === "Miễn phí") {
    return (
      <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        {value}
      </span>
    );
  }

  return <span className="text-gray-700 dark:text-gray-200">{value}</span>;
}

function PackageGrid({
  data,
  onEdit,
  onDelete,
}: {
  data: Package[];
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((pkg) => (
        <PackageCard
          key={pkg.packageId}
          pkg={pkg}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function PackageCard({
  pkg,
  onEdit,
  onDelete,
}: {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasActiveSubscribers = pkg.activeSubscriberCount > 0;

  useClickOutside(ref, () => setOpen(false));
  return (
    <motion.div
      ref={ref}
      className="group hover:border-primary dark:hover:bg-primary/10 relative flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 dark:border-white/10 dark:bg-white/5"
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {pkg.packageName}
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Cập nhật gần đây
            </p>
          </div>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <FiMoreVertical />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#050505] backdrop-blur-xl"
              >
                <DropdownItem
                  label="Sửa gói"
                  onClick={() => {
                    setOpen(false);
                    onEdit(pkg);
                  }}
                />

                <div className="h-px bg-white/10" />
                <DropdownItem
                  label="Xoá gói"
                  danger
                  disabled={hasActiveSubscribers}
                  onClick={() => {
                    if (hasActiveSubscribers) return;
                    setOpen(false);
                    onDelete(pkg);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-gray-100 dark:bg-white/10" />

      {/* Content */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {pkg.price === 0 ? (
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-base font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Miễn phí
              </span>
            ) : (
              formatPrice(pkg.price)
            )}
            {pkg.price !== 0 && (
              <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                / tháng
              </span>
            )}
          </p>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <FiUsers />
            <span>{pkg.activeSubscriberCount} người dùng đang hoạt động</span>
          </div>
        </div>

        <StatusBadge status="active" />
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: "active" | "inactive" }) {
  const active = status === "active";

  return (
    <span
      className={`rounded-lg px-2 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
      }`}
    >
      {active ? "Đang hoạt động" : "Tạm ngưng"}
    </span>
  );
}

function DropdownItem({
  label,
  danger = false,
  disabled = false,
  onClick,
}: DropdownItemProps & { disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-500/10"
          : "text-gray-300 hover:bg-white/5 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label}
    </button>
  );
}
