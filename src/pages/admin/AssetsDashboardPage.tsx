import { HiOutlineDotsVertical } from "react-icons/hi";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/custom-ui/Breadcrumb";
import { cardContainer, cardItem } from "../../motions/cardMotion";
import { RiImageAddLine, RiRefreshLine } from "react-icons/ri";
import { openPdfModalAtom } from "../../stores/modalStore";
import { useAtom } from "jotai";
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

function AssetCard({ asset }: { asset: BaseAsset }) {
  const [, openModal] = useAtom(openPdfModalAtom);
  const ui = ASSET_UI[asset.type];
  const isPdfAsset = asset.type === "pdf";
  const titleClassName =
    "max-w-[80%] cursor-pointer truncate text-sm font-medium text-white";

  return (
    <motion.div
      variants={cardItem}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10"
    >
      {/* Preview */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={asset.preview}
          alt={asset.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {ui.overlay && (
          <>
            <div className="absolute inset-0 bg-black/40 opacity-0 transition group-hover:opacity-100" />

            {ui.badge && (
              <div className="absolute top-3 left-3 rounded-md bg-red-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow">
                {ui.badge}
              </div>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          {isPdfAsset ? (
            <button
              onClick={() => openModal(asset.fileUrl)}
              className={titleClassName}
            >
              {asset.name}
            </button>
          ) : (
            <a
              href={asset.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={titleClassName}
            >
              {asset.name}
            </a>
          )}

          <button className="opacity-0 transition group-hover:opacity-100">
            <HiOutlineDotsVertical className="text-lg text-white/60 hover:text-white" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{asset.size}</span>
          <span>{asset.date}</span>
        </div>
      </div>
    </motion.div>
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
            title && <h3 className="mt-4 text-lg text-white">{title}</h3>
          )}
          <p className="mt-4 max-w-75 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {message}
          </p>
          {onAction && actionLabel && (
            <button
              className="mt-6 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
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
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
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
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10 disabled:opacity-50"
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
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 transition-all hover:-translate-y-0.5 hover:bg-white/10"
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
      (data?.items ?? []).map((item) => {
        const id = item.certificateId || (item as any).id || (item as any).documentId || Math.random().toString();
        return {
          id,
          name: `Certificate-${id.slice(0, 6)}.pdf`,
          size: "N/A",
          date: new Date(item.uploadedAt).toLocaleDateString("vi-VN"),
          preview: item.thumbnailUrl || item.imageUrl,
          fileUrl: item.imageUrl,
          type: "pdf" as const,
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
