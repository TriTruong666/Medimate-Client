import Breadcrumb from "../components/Breadcrumb";

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
    label: "Thêm gói mới",
  },
];
export default function PackageAddPage() {
  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Tạo gói mới
          </h1>
        </div>
      </div>
    </div>
  );
}
