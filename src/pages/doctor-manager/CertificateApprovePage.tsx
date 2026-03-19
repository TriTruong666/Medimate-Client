import { FiEye } from "react-icons/fi";
import Breadcrumb from "@/components/custom-ui/Breadcrumb";
import { Badge } from "@/components/custom-ui/Badge";
import { Tooltip } from "@/components/custom-ui/Tooltip";
import IconAction from "@/components/custom-ui/IconAction";
import { DataTableShell } from "@/components/custom-ui/DataTableShell";
import { formatRelativeTime } from "@/common/format";
import { useClientPagination } from "@/hooks/useClientPagination";

// MOCK DATA structure based on AccountDashboardPage and data_handling_ui plan
const mockCertificates = [
  {
    id: "CERT-001",
    doctorName: "BS. Nguyễn Trí Trường",
    specialty: "Tim Mạch",
    certName: "Chứng chỉ hành nghề khám bệnh, chữa bệnh",
    issuePlace: "Sở Y tế TP.HCM",
    issueDate: "10/05/2018",
    submitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "pending",
  },
  {
    id: "CERT-002",
    doctorName: "BS. Nguyễn Trí Trường",
    specialty: "Tim Mạch",
    certName: "Bằng Chuyên khoa cấp I - Nội Tim Mạch",
    issuePlace: "Đại học Y Dược TP.HCM",
    issueDate: "20/08/2022",
    submitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "approved",
  },
  {
    id: "CERT-003",
    doctorName: "BS. Lê Phương Thảo",
    specialty: "Da Liễu",
    certName: "Chứng chỉ Đào tạo liên tục Laser Thẩm mỹ",
    issuePlace: "Bác sĩ Da liễu Trung Ương",
    issueDate: "15/12/2024",
    submitDate: new Date().toISOString(),
    status: "pending",
  },
];

type ColumnKey = "doctor" | "certificate" | "status" | "actions";

type TableColumn = {
  key: ColumnKey;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
};

const columns: TableColumn[] = [
  { key: "doctor", label: "Thông tin Bác sĩ", width: "w-[25%]" },
  { key: "certificate", label: "Thông tin Chứng chỉ", width: "w-[45%]" },
  { key: "status", label: "Trạng thái", width: "w-[15%]", align: "center" },
  { key: "actions", label: "Thao tác", width: "w-[15%]", align: "center" },
];

export default function CertificateApprovePage() {
  const breadcrumbItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Quản lý Y tế", path: "/dashboard/approve-certificate" },
    { label: "Duyệt Chứng chỉ" },
  ];

  return (
    <div className="page-layout">
      {/* Header */}
      <div className="mb-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Phê duyệt Chứng chỉ Bác sĩ
          </h1>
        </div>
      </div>

      {/* Content - Data Table */}
      <div className="my-8">
        <CertificateTable />
      </div>
    </div>
  );
}

function CertificateTable() {
  // Simulate useQuery logic for data_handling_ui
  const isLoading = false;
  const isError = false;
  const data = mockCertificates;
  const {
    page,
    pageSize,
    total,
    pagedData,
    handlePageChange,
    handlePageSizeChange,
  } = useClientPagination(data, { initialPageSize: 5 });

  return (
    <>
      <DataTableShell
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        isEmpty={data.length === 0}
        loadingMessage="Đang tải danh sách chứng chỉ..."
        emptyTitle="Chưa có dữ liệu"
        emptyMessage="Không tìm thấy chứng chỉ nào cần phê duyệt vào lúc này."
        tbodyClassName="dark:divide-border-dark divide-y divide-gray-100 bg-white/50 dark:bg-transparent"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      >
        {pagedData.map((row) => (
          <tr
            key={row.id}
            className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5"
          >
                {/* 1. Thông tin bác sĩ */}
                <td className="dark:border-border-dark border-r border-gray-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="from-primary/20 to-primary/5 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold shadow-inner">
                      {row.doctorName.charAt(4)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {row.doctorName}
                      </span>
                      <span className="text-primary truncate text-[12px] font-medium">
                        {row.specialty}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Thông tin chứng chỉ */}
                <td className="dark:border-border-dark border-r border-gray-100 p-4">
                  <div className="flex flex-col">
                    <span
                      className="mb-1 line-clamp-1 text-sm font-semibold text-gray-800 dark:text-gray-200"
                      title={row.certName}
                    >
                      {row.certName}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Nơi cấp:
                        </span>{" "}
                        {row.issuePlace}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                      <span>
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          Cấp ngày:
                        </span>{" "}
                        {row.issueDate}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] text-gray-400 italic dark:text-gray-500">
                      Đã nộp: {formatRelativeTime(row.submitDate)}
                    </div>
                  </div>
                </td>

                {/* 3. Trạng thái */}
                <td className="dark:border-border-dark border-r border-gray-100 p-4 text-center">
                  {row.status === "pending" ? (
                    <Badge type="warning" value="Chờ duyệt" />
                  ) : row.status === "approved" ? (
                    <Badge type="success" value="Đã duyệt" />
                  ) : (
                    <Badge type="error" value="Bị từ chối" />
                  )}
                </td>

                {/* 4. Thao tác */}
                <td className="p-4 text-center">
                  <Tooltip content="Xem file gốc chứng chỉ">
                    <IconAction
                      icon={<FiEye />}
                      className="text-primary hover:text-primary dark:text-primary dark:hover:text-primary-light"
                    />
                  </Tooltip>
                </td>
          </tr>
        ))}
      </DataTableShell>
    </>
  );
}
