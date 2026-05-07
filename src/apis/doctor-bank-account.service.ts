import type { BaseResponse } from "@/types/APIResponse";
import type {
  DoctorBankAccount,
  UpsertDoctorBankAccountRequest,
} from "@/types/DoctorBankAccount";
import { axiosNETClient } from "./client";

export async function getDoctorBankAccounts(
  doctorId: string,
): Promise<BaseResponse<DoctorBankAccount[]>> {
  const res = await axiosNETClient.get(
    `/api/v1/doctor-bank-accounts/doctors/${doctorId}`,
  );
  return res.data;
}

export async function createDoctorBankAccount(
  doctorId: string,
  payload: UpsertDoctorBankAccountRequest,
): Promise<BaseResponse<DoctorBankAccount>> {
  const res = await axiosNETClient.post(
    `/api/v1/doctor-bank-accounts/doctors/${doctorId}`,
    payload,
  );
  return res.data;
}

export async function updateDoctorBankAccount(
  id: string,
  payload: UpsertDoctorBankAccountRequest,
): Promise<BaseResponse<DoctorBankAccount>> {
  const res = await axiosNETClient.put(`/api/v1/doctor-bank-accounts/${id}`, payload);
  return res.data;
}

export async function deleteDoctorBankAccount(
  id: string,
): Promise<BaseResponse<null>> {
  const res = await axiosNETClient.delete(`/api/v1/doctor-bank-accounts/${id}`);
  return res.data;
}
