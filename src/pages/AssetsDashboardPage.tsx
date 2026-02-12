import { HiOutlineDotsVertical } from "react-icons/hi";
import { motion } from "framer-motion";
import Breadcrumb from "../components/Breadcrumb";
import { cardContainer, cardItem } from "../motions/cardMotion";
import { RiImageAddLine } from "react-icons/ri";
type Asset = {
  id: number;
  name: string;
  size: string;
  date: string;
  image: string;
};

const breadcrumbItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Tài nguyên",
    path: "/dashboard/assets",
  },
  {
    label: "Tất cả",
  },
];

const mockAssets = [
  {
    id: 1,
    name: "medical-report.png",
    size: "2.4 MB",
    date: "12 Feb 2026",
    image:
      "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=600",
  },
  {
    id: 2,
    name: "xray-image.jpg",
    size: "5.1 MB",
    date: "10 Feb 2026",
    image:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600",
  },
  {
    id: 3,
    name: "brain-scan.png",
    size: "3.8 MB",
    date: "08 Feb 2026",
    image:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=600",
  },
];
export default function AssetsDashboardPage() {
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Quản lý tài nguyên
          </h1>
        </div>
      </div>
      {/* Content */}
      <div className="my-8 space-y-8">
        <AssetGrid />
        <div className="flex justify-center">
          {" "}
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-gray-300 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/10">
            Tải thêm ảnh <RiImageAddLine />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssetGrid() {
  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {mockAssets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </motion.div>
  );
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <motion.div
      variants={cardItem}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={asset.image}
          alt={asset.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between">
          <a
            href={asset.image}
            target="_blank"
            className="max-w-[80%] truncate text-sm font-medium text-white"
          >
            {asset.name}
          </a>

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
