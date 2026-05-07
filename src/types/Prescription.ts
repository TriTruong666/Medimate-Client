export type PrescriptionStatus = "Active" | "Completed" | "Cancelled";

export interface PrescriptionMedicineItem {
  medicineName: string;
  dosage: string;
  quantity: number;
  unit: string;
  instructions: string;
}

export interface PrescriptionByDoctorDto {
  id: string;
  prescriptionId?: string;
  doctorPrescriptionId?: string;
  doctorId: string;
  doctorName?: string;
  memberId: string;
  memberName?: string;
  memberDateOfBirth?: string;
  memberGender?: string;
  consultanSessionId: string;
  diagnosis: string;
  advice?: string;
  medicines: PrescriptionMedicineItem[];
  status: PrescriptionStatus;
  /** Đơn đã gửi/khóa khi status === "Completed" */
  isLocked?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface CreatePrescriptionRequest {
  consultanSessionId: string;
  memberId: string;
  diagnosis: string;
  advice?: string;
  medicines: PrescriptionMedicineItem[];
}

export interface UpdatePrescriptionRequest {
  diagnosis?: string;
  advice?: string;
  medicines?: PrescriptionMedicineItem[];
  status?: PrescriptionStatus;
}

export interface MemberPrescriptionImage {
  imageUrl: string;
  thumbnailUrl: string | null;
  ocrRawData: string | null;
}

export interface MemberPrescriptionMedicine {
  prescriptionMedicineId: string;
  medicineName: string;
  dosage: string;
  unit: string;
  quantity: number;
  instructions: string;
}

export interface MemberPrescriptionDto {
  prescriptionId: string;
  prescriptionCode: string;
  memberId: string;
  doctorName: string | null;
  hospitalName: string | null;
  prescriptionDate: string;
  status: string;
  notes: string | null;
  diagnosis: string | null;
  images: MemberPrescriptionImage[];
  medicines: MemberPrescriptionMedicine[];
}
