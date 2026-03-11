import type { CreateDoctorRequest, Doctor, User } from "@/types/User";
import { axiosNETClient } from "./client";
import type { BaseResponse } from "@/types/APIResponse";

export async function getUsers() : Promise<BaseResponse<User[]>> {
    const res = await axiosNETClient.get('/api/v1/users');
    return res.data;
}

export async function createDoctor(request: CreateDoctorRequest) : Promise<BaseResponse<Doctor[]>> {
    const res = await axiosNETClient.post('/api/v1/admin/doctors', request);
    return res.data;
}