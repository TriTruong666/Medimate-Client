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
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  fileUrl: string;
  documentName?: string | null;
  documentType?: DoctorDocumentType | string | null;
  type: DoctorDocumentType | string;
  status: string;
  rejectReason?: string | null;
  submittedAt?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
  issuedBy?: string | null;
  issuedAt?: string | null;
  reviewBy: string | null;
  reviewAt: string | null;
  note: string | null;
  createdAt: string;
};

export type GetDoctorDocumentsParams = PaginationParams & {
  status?: DoctorDocumentStatus;
};
