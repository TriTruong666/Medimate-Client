import { HiOutlineDotsVertical } from "react-icons/hi";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/Breadcrumb";
import { cardContainer, cardItem } from "../../motions/cardMotion";
import { RiImageAddLine } from "react-icons/ri";
import { openPdfModalAtom } from "../../stores/modalStore";
import { useAtom } from "jotai";

type AssetType = "image" | "pdf";

type BaseAsset = {
  id: number;
  name: string;
  size: string;
  date: string;
  preview: string; // image thumbnail
  fileUrl: string;
  type: AssetType;
};

const mockPrescription: BaseAsset[] = [
  {
    id: 1,
    name: "medical-report.png",
    size: "2.4 MB",
    date: "12 Feb 2026",
    preview:
      "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600",
    fileUrl:
      "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600",
    type: "image",
  },
];

const mockCertificates: BaseAsset[] = [
  {
    id: 2,
    name: "mac-lenin.pdf",
    size: "1.8 MB",
    date: "05 Feb 2026",
    preview:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600",
    fileUrl:
      "https://kmacle.duytan.edu.vn/uploads/75770b9b-cdbf-4038-90e2-f25e1f4426fe_triethocmaclenin.pdf",
    type: "pdf",
  },
];

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

  const ASSET_UI = {
    image: {
      badge: "IMG",
      overlay: false,
    },
    pdf: {
      badge: "PDF",
      overlay: true,
    },
  };

  const ui = ASSET_UI[asset.type];

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
          {asset.type === "pdf" && (
            <button
              onClick={() => openModal(asset.fileUrl)}
              className="max-w-[80%] cursor-pointer truncate text-sm font-medium text-white"
            >
              {asset.name}
            </button>
          )}
          {asset.type === "image" && (
            <a
              href={asset.fileUrl}
              target="_blank"
              className="max-w-[80%] cursor-pointer truncate text-sm font-medium text-white"
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

function AssetLibrary({
  title,
  breadcrumbItems,
  assets,
}: {
  title: string;
  breadcrumbItems: { label: string; path?: string }[];
  assets: BaseAsset[];
}) {
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

        <div className="flex justify-center">
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10">
            Tải thêm <RiImageAddLine />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AssetsPrescriptionDashboardPage() {
  return (
    <AssetLibrary
      title="Thư viện đơn thuốc"
      breadcrumbItems={breadcrumbPrescriptionItems}
      assets={mockPrescription}
    />
  );
}

export function AssetsCertificateDashboardPage() {
  return (
    <AssetLibrary
      title="Thư viện chứng chỉ bác sĩ"
      breadcrumbItems={breadcrumbCertificateItems}
      assets={mockCertificates}
    />
  );
}
