import type { CreateUserRequest, Doctor, User } from "@/types/User";
import { axiosNETClient } from "./client";
import type { BaseResponse } from "@/types/APIResponse";

export async function getUsers() : Promise<BaseResponse<User[]>> {
    const res = await axiosNETClient.get('/api/v1/users');
    return res.data;
}

export async function createDoctor(request: CreateUserRequest) : Promise<BaseResponse<Doctor[]>> {
    const res = await axiosNETClient.post('/api/v1/admin/doctors', request);
    return res.data;
}

export async function createDoctorManager(request: CreateUserRequest) : Promise<BaseResponse<User[]>> {
    const res = await axiosNETClient.post('/api/v1/admin/doctor-managers', request);
    return res.data;
}

export async function deactivateUser(userId: string): Promise<BaseResponse<boolean>> {
    const res = await axiosNETClient.put(`/api/v1/users/admin/deactivate?userId=${userId}`);
    return res.data;
}

export async function activateUser(userId: string): Promise<BaseResponse<boolean>> {
    const res = await axiosNETClient.put(`/api/v1/users/admin/activate?userId=${userId}`);
    return res.data;
}