import { axiosNETClient } from "./client";
import type { BaseResponse } from "@/types/APIResponse";
import type {
    DoctorContract,
    CreateDoctorContractBody,
    UpdateDoctorContractBody
} from "@/types/DoctorContract";

export async function getDoctorContracts(): Promise<BaseResponse<DoctorContract[]>> {
    const res = await axiosNETClient.get("/api/v1/doctor-contracts");
    return res.data;
}

export async function getDoctorContractById(id: string): Promise<BaseResponse<DoctorContract>> {
    const res = await axiosNETClient.get(`/api/v1/doctor-contracts/${id}`);
    return res.data;
}

export async function createDoctorContract(data: CreateDoctorContractBody): Promise<BaseResponse<DoctorContract>> {
    const formData = new FormData();
    formData.append("File", data.file);
    if (data.startDate) formData.append("StartDate", data.startDate);
    if (data.endDate) formData.append("EndDate", data.endDate);
    if (data.note) formData.append("Note", data.note);

    const res = await axiosNETClient.post("/api/v1/doctor-contracts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function updateDoctorContract(id: string, data: UpdateDoctorContractBody): Promise<BaseResponse<DoctorContract>> {
    const formData = new FormData();

    // Nếu có file mới thì gửi, không thì để trống để giữ file cũ trên server
    if (data.file) {
        formData.append("File", data.file);
    }

    if (data.startDate) formData.append("StartDate", data.startDate);
    if (data.endDate) formData.append("EndDate", data.endDate);
    if (data.status) formData.append("Status", data.status);
    if (data.note !== undefined) formData.append("Note", data.note || "");

    const res = await axiosNETClient.put(`/api/v1/doctor-contracts/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
}

export async function deleteDoctorContract(id: string): Promise<BaseResponse<boolean>> {
    const res = await axiosNETClient.delete(`/api/v1/doctor-contracts/${id}`);
    return res.data;
}