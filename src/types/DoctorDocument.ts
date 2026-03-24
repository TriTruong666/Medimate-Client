import type { PaginationParams } from "@/common/query.params";

export type DoctorDocumentStatus = "Pending" | "Approved" | "Rejected";
export type DoctorDocumentType =
  | "PRACTICE_LICENSE"
  | "SPECIALIST_CERTIFICATE"
  | "CME"
  | "OTHER";

export const doctorDocumentTypeLabelMap: Record<DoctorDocumentType, string> = {
  PRACTICE_LICENSE: "Chứng chỉ hành nghề",
  SPECIALIST_CERTIFICATE: "Chứng chỉ chuyên khoa",
  CME: "Đào tạo y khoa liên tục (CME)",
  OTHER: "Tài liệu khác",
};

export type DoctorDocument = {
  documentId: string;
  doctorId: string;
  fileUrl: string;
  type: DoctorDocumentType | string;
  status: string;
  reviewBy: string | null;
  reviewAt: string | null;
  note: string | null;
  createdAt: string;
};

export type GetDoctorDocumentsParams = PaginationParams & {
  status?: DoctorDocumentStatus;
};
