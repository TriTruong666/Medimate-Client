export type DoctorContractStatus = "Active" | "Expired" | "Terminated";

export interface DoctorContract {
    contractId: string;
    fileUrl: string;
    startDate: string | null;
    endDate: string | null;
    status: DoctorContractStatus | string;
    note: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateDoctorContractBody {
    file: File;
    startDate?: string;
    endDate?: string;
    note?: string;
}

export interface UpdateDoctorContractBody {
    file?: File | null; // Cho phép null để chỉ cập nhật metadata
    startDate?: string;
    endDate?: string;
    status?: string;
    note?: string;
}