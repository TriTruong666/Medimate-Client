import type { PaginationParams } from "@/common/query.params";

export type PrescriptionImage = {
  imageId: string;
  prescriptionId: string;
  imageUrl: string;
  thumbnailUrl: string;
  ocrRawData: string;
  isProcessed: boolean;
  uploadedAt: string;
};

export type DoctorCertificate = {
  certificateId: string;
  memberId: string;
  imageUrl: string;
  thumbnailUrl: string;
  isProcessed: boolean;
  uploadedAt: string;
};

export interface GetPrescriptionImagesParams extends PaginationParams {
  prescriptionId?: string;
  memberId?: string;
  isProcessed?: boolean;
  isDescending?: boolean; //theo uploadedAt
}

export interface GetDoctorCertificatesParams extends PaginationParams {
  doctorId?: string;
  status?: "pending" | "approved" | "rejected";
  type?: "certificate" | "license";
  sortBy?: "type" | "status";
  isDescending?: boolean; //mặc định theo createedAt
}