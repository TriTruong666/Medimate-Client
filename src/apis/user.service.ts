import type { User } from "@/types/User";
import { axiosNETClient } from "./client";
import type { BaseResponse } from "@/types/APIResponse";

export async function getUsers() : Promise<BaseResponse<User[]>> {
    const res = await axiosNETClient.get('/api/v1/users');
    return res.data;
}