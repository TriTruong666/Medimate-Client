import {
  HiOutlineDotsVertical,
  HiOutlineDocumentText,
  HiOutlinePhotograph,
} from "react-icons/hi";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/custom-ui/Breadcrumb";
import { cardContainer, cardItem } from "../../motions/cardMotion";
import { RiImageAddLine, RiRefreshLine } from "react-icons/ri";
import * as AssetHooks from "@/hooks/data/useAssetHooks";
import { Spinner } from "@/components/custom-ui/Spinner";
import { useEffect, useMemo, useState } from "react";
import { MAX_CACHED_ASSETS, PAGINATION } from "@/config/pagination";

type AssetType = "image" | "pdf";
type BreadcrumbItem = { label: string; path?: string };

type BaseAsset = {
  id: string;
  name: string;
  size: string;
  date: string;
  preview: string;
  fileUrl: string;
  type: AssetType;
  status?: string;
  ownerName?: string;
};

const DEFAULT_ERROR_MESSAGE =
  "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";

const ASSET_UI: Record<AssetType, { badge: string; overlay: boolean }> = {
  image: {
    badge: "IMG",
    overlay: false,
  },
  pdf: {
    badge: "PDF",
    overlay: true,
  },
};

const breadcrumbPrescriptionItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Thư viện",
    path: "/dashboard/assets",
  },
  {
    label: "Đơn thuốc",
  },
];

const breadcrumbCertificateItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Thư viện",
    path: "/dashboard/assets",
  },
  {
    label: "Chứng chỉ hành nghề",
  },
];

function AssetGrid({ assets }: { assets: BaseAsset[] }) {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </motion.div>
  );
}

function AssetPreview({
  src,
  type,
  name,
}: {
  src?: string;
  type: AssetType;
  name: string;
}) {
  const [error, setError] = useState(false);
  const isPdf = type === "pdf";

  if (!src || error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10">
        {isPdf ? (
          <HiOutlineDocumentText className="text-4xl text-red-400/80 dark:text-red-500/50" />
        ) : (
          <HiOutlinePhotograph className="text-primary/40 dark:text-primary/20 text-4xl" />
        )}
        <span className="mt-2 px-4 text-center text-[10px] font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
          No Preview Available
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
    />
  );
}

function AssetCard({ asset }: { asset: BaseAsset }) {
  const ui = ASSET_UI[asset.type];

  return (
    <motion.div
      variants={cardItem}
      onClick={() => window.open(asset.fileUrl, "_blank")}
      className="group hover:border-primary/50 relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-400 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md dark:hover:border-white/20 dark:hover:bg-white/10"
    >
      {/* Preview Section */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-gray-200 dark:border-white/5">
        <AssetPreview src={asset.preview} type={asset.type} name={asset.name} />

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {ui.badge && (
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md dark:bg-white/10">
                {ui.badge}
              </span>
            )}
          </div>

          {asset.status && <AssetStatusBadge status={asset.status} />}
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>

      {/* Info Container */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="line-clamp-2 min-w-0 text-[13.5px] leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
              {asset.name}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <HiOutlineDotsVertical className="text-base" />
            </button>
          </div>
          {asset.ownerName && (
            <div className="flex items-center gap-1.5">
              <div className="bg-primary/60 h-1 w-1 rounded-full" />
              <span className="text-primary/80 dark:text-primary/90 truncate text-[11px] font-bold">
                {asset.ownerName}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-white/5">
          <span className="text-[11px] font-semibold tracking-tight text-gray-500 uppercase dark:text-gray-400">
            {asset.size !== "N/A" ? asset.size : asset.date}
          </span>
          <span className="group-hover:text-primary rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-bold text-gray-400 transition-colors dark:bg-white/5 dark:text-gray-500">
            Xem
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AssetStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isApproved = normalized === "approved";
  const isPending = normalized === "pending";
  const isRejected = normalized === "rejected";

  const label = isApproved
    ? "Đã duyệt"
    : isPending
      ? "Chờ duyệt"
      : isRejected
        ? "Từ chối"
        : status;

  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
        isApproved
          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          : isPending
            ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            : isRejected
              ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"
      }`}
    >
      {label}
    </span>
  );
}

function AssetLibraryState({
  title,
  message,
  actionLabel,
  actionIcon,
  onAction,
  loading = false,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="page-layout">
      <div className="my-8 space-y-8">
        <div className="flex min-h-100 w-full flex-col items-center justify-center py-10">
          {loading ? (
            <Spinner size="lg" />
          ) : (
            title && (
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )
          )}
          <p className="mt-4 max-w-75 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {message}
          </p>
          {onAction && actionLabel && (
            <button
              className="mt-6 rounded-xl border border-gray-400 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              onClick={onAction}
              type="button"
            >
              <span className="flex items-center gap-2">
                {actionLabel}
                {actionIcon}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetLibrary({
  title,
  breadcrumbItems,
  assets,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  hasMoreAssets,
  isLoadingMore,
  onLoadMore,
  showBackToTop,
  onBackToTop,
}: {
  title: string;
  breadcrumbItems: BreadcrumbItem[];
  assets: BaseAsset[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  hasMoreAssets?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  showBackToTop?: boolean;
  onBackToTop?: () => void;
}) {
  if (isLoading) {
    return <AssetLibraryState loading message="Đang tải dữ liệu..." />;
  }

  if (isError) {
    return (
      <AssetLibraryState
        title="Đã xảy ra lỗi"
        message={errorMessage || DEFAULT_ERROR_MESSAGE}
        actionLabel="Thử lại"
        actionIcon={<RiRefreshLine />}
        onAction={() => onRetry?.()}
      />
    );
  }

  if (assets.length === 0) {
    return (
      <AssetLibraryState
        title="Không tìm thấy dữ liệu"
        message="Không tìm thấy dữ liệu nào trong hệ thống."
      />
    );
  }

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="my-8 space-y-8">
        <AssetGrid assets={assets} />

        {(hasMoreAssets || showBackToTop) && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              {hasMoreAssets && (
                <button
                  className="flex items-center gap-2 rounded-xl border border-gray-400 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  onClick={onLoadMore}
                  type="button"
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Đang tải..." : "Tải thêm"}
                  <RiImageAddLine />
                </button>
              )}

              {showBackToTop && (
                <button
                  className="rounded-xl border border-gray-400 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-50 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  onClick={onBackToTop}
                  type="button"
                >
                  Về đầu trang
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function appendUniqueAssets(prev: BaseAsset[], next: BaseAsset[]): BaseAsset[] {
  if (next.length === 0) return prev;
  const merged = new Map(prev.map((asset) => [asset.id, asset]));
  next.forEach((asset) => {
    merged.set(asset.id, asset);
  });
  const result = Array.from(merged.values());
  return result.length > MAX_CACHED_ASSETS
    ? result.slice(result.length - MAX_CACHED_ASSETS)
    : result;
}

function scrollToDashboardTop() {
  const scrollContainer = document.getElementById("dashboard-scroll-container");
  if (scrollContainer) {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function AssetsPrescriptionDashboardPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [allImages, setAllImages] = useState<BaseAsset[]>([]);

  const { data, isLoading, isError, isFetching, error, refetch } =
    AssetHooks.usePrescriptionImagesList({
      pageNumber,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      isDescending: true,
    });

  const currentPageItems: BaseAsset[] = useMemo(
    () =>
      (data?.items ?? []).map((item) => {
        const id = item.imageId || (item as any).id || Math.random().toString();
        return {
          id,
          name: `Prescription-${id.slice(0, 6)}.png`,
          size: "N/A",
          date: new Date(item.uploadedAt).toLocaleDateString("vi-VN"),
          preview: item.thumbnailUrl || item.imageUrl,
          fileUrl: item.imageUrl,
          type: "image" as const,
        };
      }),
    [data],
  );
  const totalPages = data?.totalPages;
  const hasMoreByTotalPages =
    typeof totalPages === "number" && totalPages > 0
      ? pageNumber < totalPages
      : undefined;
  const hasMoreAssets =
    hasMoreByTotalPages ??
    (currentPageItems.length === PAGINATION.DEFAULT_PAGE_SIZE &&
      currentPageItems.length > 0);

  useEffect(() => {
    if (pageNumber === 1) {
      setAllImages(currentPageItems);
      return;
    }

    setAllImages((prev) => appendUniqueAssets(prev, currentPageItems));
  }, [currentPageItems, pageNumber]);

  const handleLoadMore = () => {
    if (!hasMoreAssets || isFetching) return;
    setPageNumber((prev) => prev + 1);
  };

  const handleBackToTop = () => {
    scrollToDashboardTop();
  };
  const showInitialLoading = isLoading && pageNumber === 1;
  const showInitialError = isError && pageNumber === 1;

  return (
    <AssetLibrary
      title="Thư viện đơn thuốc"
      breadcrumbItems={breadcrumbPrescriptionItems}
      assets={allImages}
      isLoading={showInitialLoading}
      isError={showInitialError}
      errorMessage={error?.message || DEFAULT_ERROR_MESSAGE}
      onRetry={refetch}
      hasMoreAssets={hasMoreAssets}
      isLoadingMore={isFetching && pageNumber > 1}
      onLoadMore={handleLoadMore}
      showBackToTop={allImages.length > PAGINATION.DEFAULT_PAGE_SIZE}
      onBackToTop={handleBackToTop}
    />
  );
}

export function AssetsCertificateDashboardPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [allCertificates, setAllCertificates] = useState<BaseAsset[]>([]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    AssetHooks.useDoctorCertificatesList({
      pageNumber,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      isDescending: true,
    });

  const currentPageItems: BaseAsset[] = useMemo(
    () =>
      (data?.items ?? []).map((item: any) => {
        const id =
          item.documentId ||
          item.certificateId ||
          item.id ||
          Math.random().toString();
        const date = item.createdAt || item.uploadedAt;
        return {
          id,
          name: item.documentName || `Certificate-${id.slice(0, 6)}.pdf`,
          size: "N/A",
          date: date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
          preview: item.thumbnailUrl || item.imageUrl || item.fileUrl,
          fileUrl: item.fileUrl || item.imageUrl,
          type: "pdf" as const,
          status: item.status,
          ownerName: item.doctorName || item.reviewBy || "Không có",
        };
      }),
    [data],
  );
  const totalPages = data?.totalPages;
  const hasMoreByTotalPages =
    typeof totalPages === "number" && totalPages > 0
      ? pageNumber < totalPages
      : undefined;
  const hasMoreAssets =
    hasMoreByTotalPages ??
    (currentPageItems.length === PAGINATION.DEFAULT_PAGE_SIZE &&
      currentPageItems.length > 0);

  useEffect(() => {
    if (pageNumber === 1) {
      setAllCertificates(currentPageItems);
      return;
    }

    setAllCertificates((prev) => appendUniqueAssets(prev, currentPageItems));
  }, [currentPageItems, pageNumber]);

  const handleLoadMore = () => {
    if (!hasMoreAssets || isFetching) return;
    setPageNumber((prev) => prev + 1);
  };

  const handleBackToTop = () => {
    scrollToDashboardTop();
  };
  const showInitialLoading = isLoading && pageNumber === 1;
  const showInitialError = isError && pageNumber === 1;

  return (
    <AssetLibrary
      title="Thư viện chứng chỉ bác sĩ"
      breadcrumbItems={breadcrumbCertificateItems}
      assets={allCertificates}
      isLoading={showInitialLoading}
      isError={showInitialError}
      errorMessage={error?.message || DEFAULT_ERROR_MESSAGE}
      onRetry={refetch}
      hasMoreAssets={hasMoreAssets}
      isLoadingMore={isFetching && pageNumber > 1}
      onLoadMore={handleLoadMore}
      showBackToTop={allCertificates.length > PAGINATION.DEFAULT_PAGE_SIZE}
      onBackToTop={handleBackToTop}
    />
  );
}
