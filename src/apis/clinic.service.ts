import { axiosNETClient } from "./client";
import type { BaseResponse } from "@/types/APIResponse";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CreateClinicBody = {
  name: string;
  address: string;
  email: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  licenseFile: File;
  logoFile?: File;
};

export type UpdateClinicBody = {
  name?: string;
  address?: string;
  email?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  isActive?: boolean;
  licenseFile?: File;
  logoFile?: File;
};

export type ClinicDto = {
  clinicId: string;
  name: string;
  address: string;
  licenseUrl: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  doctorCount: number;
  email: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
};

export type AddDoctorToClinicBody = {
  doctorId: string;
  specialty?: string;
  consultationFee: number;
};

export type UpdateClinicDoctorBody = {
  specialty?: string;
  consultationFee?: number;
  status?: string;
};

export type ClinicDoctorDto = {
  id: string;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar?: string;
  specialty?: string;
  consultationFee: number;
  status: string;
  createdAt: string;
};

export type CreateClinicContractBody = {
  clinicId: string;
  startDate?: string;
  endDate?: string;
  note?: string;
  contractFile?: File;
};

export type ClinicContractDto = {
  contractId: string;
  clinicId: string;
  clinicName: string;
  fileUrl: string;
  startDate?: string;
  endDate?: string;
  status: string;
  note?: string;
  createdAt: string;
};

// ─── Clinic CRUD ─────────────────────────────────────────────────────────────

export async function getClinics(isActive?: boolean): Promise<BaseResponse<ClinicDto[]>> {
  const res = await axiosNETClient.get("/api/v1/clinics", {
    params: isActive !== undefined ? { isActive } : undefined,
  });
  return res.data;
}

export async function getClinicById(clinicId: string): Promise<BaseResponse<ClinicDto>> {
  const res = await axiosNETClient.get(`/api/v1/clinics/${clinicId}`);
  return res.data;
}

export async function createClinic(body: CreateClinicBody): Promise<BaseResponse<ClinicDto>> {
  const form = new FormData();
  form.append("name", body.name);
  form.append("address", body.address);
  form.append("email", body.email);
  form.append("bankName", body.bankName);
  form.append("bankAccountNumber", body.bankAccountNumber);
  form.append("bankAccountHolder", body.bankAccountHolder);
  form.append("licenseFile", body.licenseFile);
  if (body.logoFile) form.append("logoFile", body.logoFile);
  const res = await axiosNETClient.post("/api/v1/clinics", form);
  return res.data;
}

export async function updateClinic(
  clinicId: string,
  body: UpdateClinicBody,
): Promise<BaseResponse<ClinicDto>> {
  const form = new FormData();
  if (body.name) form.append("name", body.name);
  if (body.address) form.append("address", body.address);
  if (body.email) form.append("email", body.email);
  if (body.bankName) form.append("bankName", body.bankName);
  if (body.bankAccountNumber) form.append("bankAccountNumber", body.bankAccountNumber);
  if (body.bankAccountHolder) form.append("bankAccountHolder", body.bankAccountHolder);
  if (body.isActive !== undefined) form.append("isActive", String(body.isActive));
  if (body.licenseFile) form.append("licenseFile", body.licenseFile);
  if (body.logoFile) form.append("logoFile", body.logoFile);
  const res = await axiosNETClient.put(`/api/v1/clinics/${clinicId}`, form);
  return res.data;
}

export async function deleteClinic(clinicId: string): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.delete(`/api/v1/clinics/${clinicId}`);
  return res.data;
}

// ─── Clinic Doctors ──────────────────────────────────────────────────────────

export async function getDoctorsByClinic(clinicId: string): Promise<BaseResponse<ClinicDoctorDto[]>> {
  const res = await axiosNETClient.get(`/api/v1/clinics/${clinicId}/doctors`);
  return res.data;
}

export async function addDoctorToClinic(
  clinicId: string,
  body: AddDoctorToClinicBody,
): Promise<BaseResponse<ClinicDoctorDto>> {
  const res = await axiosNETClient.post(`/api/v1/clinics/${clinicId}/doctors`, body);
  return res.data;
}

export async function updateClinicDoctor(
  clinicDoctorId: string,
  body: UpdateClinicDoctorBody,
): Promise<BaseResponse<ClinicDoctorDto>> {
  const res = await axiosNETClient.put(`/api/v1/clinics/doctors/${clinicDoctorId}`, body);
  return res.data;
}

export async function removeDoctorFromClinic(clinicDoctorId: string): Promise<BaseResponse<boolean>> {
  const res = await axiosNETClient.delete(`/api/v1/clinics/doctors/${clinicDoctorId}`);
  return res.data;
}

// ─── Clinic Contracts ─────────────────────────────────────────────────────────

export async function getContractsByClinic(clinicId: string): Promise<BaseResponse<ClinicContractDto[]>> {
  const res = await axiosNETClient.get(`/api/v1/clinics/${clinicId}/contracts`);
  return res.data;
}

export async function createClinicContract(
  clinicId: string,
  body: CreateClinicContractBody,
): Promise<BaseResponse<ClinicContractDto>> {
  const form = new FormData();
  form.append("clinicId", body.clinicId);
  if (body.startDate) form.append("startDate", body.startDate);
  if (body.endDate) form.append("endDate", body.endDate);
  if (body.note) form.append("note", body.note);
  if (body.contractFile) form.append("contractFile", body.contractFile);
  const res = await axiosNETClient.post(`/api/v1/clinics/${clinicId}/contracts`, form);
  return res.data;
}

export async function updateContractStatus(
  contractId: string,
  status: string,
): Promise<BaseResponse<ClinicContractDto>> {
  const res = await axiosNETClient.put(`/api/v1/clinics/contracts/${contractId}/status`, { status });
  return res.data;
}
