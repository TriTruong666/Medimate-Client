import { FiPlus, FiUsers, FiEdit2, FiTrash2 } from "react-icons/fi";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HiCheck } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
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
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";

type TableColumn = {
  key: ColumnKey;
  label: string;
};

type ColumnKey = string;

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
  if (form.memberLimit <= 0)
    errors.memberLimit = "Số thành viên phải lớn hơn 0.";
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
  const { mutateAsync: updatePackage, isPending: isUpdatingPackage } =
    useUpdatePackage();
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
    return (
      <div className="page-layout">
        <div className="my-8 space-y-8">
          <Spinner />
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="page-layout">
        <div className="my-8 space-y-8">
          <p className="text-red-500">{error?.message}</p>
        </div>
      </div>
    );
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreatePopup}
            className="btn-primary"
          >
            <FiPlus />
            Thêm gói
          </button>
        </div>
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
        row.price === 0 ? "Miễn phí" : formatPrice(row.price),
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
        row.consultantLimit > 0
          ? `${row.consultantLimit} lượt`
          : "Không hỗ trợ",
    },
    {
      label: "Mô tả",
      render: (row: ComparisonRow) => row.description || "-",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <table className="min-w-full text-sm tabular-nums">
        {/* Header */}
        <thead className="bg-gray-50/50 dark:bg-white/5">
          <tr>
            <th className="dark:border-border-dark border-r border-gray-100 px-6 py-4 text-left text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
              Tính năng / Gói
            </th>

            {columns.map((col) => (
              <th
                key={col.key}
                className="dark:border-border-dark border-r border-gray-100 px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white"
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
              className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
            >
              {/* Feature label */}
              <td className="dark:border-border-dark border-r border-gray-100 px-6 py-4 text-gray-700 dark:text-gray-300">
                {feature.label}
              </td>

              {/* Plans */}
              {columns.map((_, colIndex) => {
                const comparedPackageData = rows[colIndex];
                return (
                  <td
                    key={colIndex}
                    className="dark:border-border-dark border-r border-gray-100 px-6 py-4 text-center last:border-r-0"
                  >
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
      <HiXMark className="mx-auto text-lg text-gray-300 dark:text-red-500/50" />
    );
  }

  if (value === "Không giới hạn") {
    return (
      <span className="text-primary/80 dark:text-primary/90 font-semibold">
        {value}
      </span>
    );
  }

  if (value === "Không hỗ trợ") {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-gray-400 dark:text-white/20">
        <HiXMark className="text-lg" />
      </span>
    );
  }

  if (value === "Miễn phí") {
    return <Badge value="Miễn phí" type="success" />;
  }

  return <span className="text-gray-900 dark:text-gray-200">{value}</span>;
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
  const hasActiveSubscribers = pkg.activeSubscriberCount > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card-primary group relative overflow-hidden"
    >
      {/* Glow Effect on Hover */}
      <div className="from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Top Section */}
      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            {pkg.packageName}
          </h4>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-gray-900 tabular-nums dark:text-white">
              {pkg.price === 0 ? "Miễn phí" : formatPrice(pkg.price)}
            </p>
            {pkg.price !== 0 && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                / {pkg.durationDays} ngày
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content="Chỉnh sửa">
            <IconAction
              onClick={() => onEdit(pkg)}
              icon={<FiEdit2 className="h-4 w-4" />}
            />
          </Tooltip>
          <Tooltip
            content={
              hasActiveSubscribers
                ? "Không thể xoá gói đang có người dùng"
                : "Xoá gói"
            }
          >
            <div className={hasActiveSubscribers ? "cursor-not-allowed" : ""}>
              <IconAction
                onClick={() => !hasActiveSubscribers && onDelete(pkg)}
                danger
                disabled={hasActiveSubscribers}
                icon={<FiTrash2 className="h-4 w-4" />}
              />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 min-h-[32px] text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {pkg.description || "Không có mô tả cho gói dịch vụ này."}
      </p>

      {/* Divider */}
      <div className="my-4 h-px bg-gray-100 dark:bg-white/5" />

      {/* Stats Section */}
      <div className="relative mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40">
          <FiUsers className="h-3.5 w-3.5" />
          <span className="tabular-nums">
            {pkg.activeSubscriberCount} đang dùng
          </span>
        </div>

        <PackageStatusBadge isActive={true} />
      </div>
    </motion.div>
  );
}

function PackageStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      value={isActive ? "Đang hoạt động" : "Tạm ngưng"}
      type={isActive ? "success" : "info"}
    />
  );
}
