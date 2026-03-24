import type { PaginationParams } from "@/common/query.params";

export type DoctorDocumentStatus = "pending" | "approved" | "rejected";

export type DoctorDocument = {
  documentId: string;
  doctorId: string;
  fileUrl: string;
  type: string;
  status: string;
  reviewBy: string | null;
  reviewAt: string | null;
  note: string | null;
  createdAt: string;
};

export type GetDoctorDocumentsParams = PaginationParams & {
  status?: DoctorDocumentStatus;
};
