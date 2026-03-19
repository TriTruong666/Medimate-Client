import type { CreateUserRequest, Doctor, User } from "@/types/User";
import { axiosNETClient } from "./client";
import type { BasePaginatedResponse, BaseResponse } from "@/types/APIResponse";
import { cleanQueryParams, type PaginationParams } from "@/common/query.params";

export async function getUsers(params: PaginationParams): Promise<BasePaginatedResponse<User[]>> {
  const res = await axiosNETClient.get("/api/v1/users", {
    params: cleanQueryParams<PaginationParams>(params),
  });
  return res.data;
}

export async function createDoctor(
  request: CreateUserRequest,
): Promise<BasePaginatedResponse<Doctor[]>> {
  const res = await axiosNETClient.post("/api/v1/admin/doctors", request);
  return res.data;
}

export async function createDoctorManager(
  request: CreateUserRequest,
): Promise<BaseResponse<User[]>> {
  const res = await axiosNETClient.post(
    "/api/v1/admin/doctor-managers",
    request,
  );
  return res.data;
}

export async function deactivateUser(
  userId: string,
): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.put(
    `/api/v1/users/admin/deactivate?userId=${userId}`,
  );
  return res.data;
}

export async function activateUser(
  userId: string,
): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.put(
    `/api/v1/users/admin/activate?userId=${userId}`,
  );
  return res.data;
}
