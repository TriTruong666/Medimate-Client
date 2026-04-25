import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ClinicService from "@/apis/clinic.service";
import type {
  CreateClinicBody,
  UpdateClinicBody,
  AddDoctorToClinicBody,
  UpdateClinicDoctorBody,
  CreateClinicContractBody,
} from "@/apis/clinic.service";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";

// ─── Clinic CRUD ─────────────────────────────────────────────────────────────

export function useClinics(isActive?: boolean) {
  return useFetch(["clinics", "list", isActive], () => ClinicService.getClinics(isActive));
}

export function useClinic(clinicId: string) {
  return useFetch(["clinics", "detail", clinicId], () => ClinicService.getClinicById(clinicId), {
    enabled: !!clinicId,
  });
}

export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateClinicBody) => ClinicService.createClinic(body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Tạo thành công", "Phòng khám mới đã được thêm vào hệ thống.");
        queryClient.invalidateQueries({ queryKey: ["clinics"] });
      } else {
        toast.error("Tạo thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, body }: { clinicId: string; body: UpdateClinicBody }) =>
      ClinicService.updateClinic(clinicId, body),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success("Cập nhật thành công", "Thông tin phòng khám đã được thay đổi.");
        queryClient.invalidateQueries({ queryKey: ["clinics"] });
        queryClient.invalidateQueries({ queryKey: ["clinics", "detail", variables.clinicId] });
      } else {
        toast.error("Cập nhật thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useDeleteClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clinicId: string) => ClinicService.deleteClinic(clinicId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã xóa", "Phòng khám đã được gỡ khỏi hệ thống.");
        queryClient.invalidateQueries({ queryKey: ["clinics"] });
      } else {
        toast.error("Xóa thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

// ─── Clinic Doctors ──────────────────────────────────────────────────────────

export function useClinicDoctors(clinicId: string) {
  return useFetch(
    ["clinics", "doctors", clinicId],
    () => ClinicService.getDoctorsByClinic(clinicId),
    { enabled: !!clinicId },
  );
}

export function useAddDoctorToClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, body }: { clinicId: string; body: AddDoctorToClinicBody }) =>
      ClinicService.addDoctorToClinic(clinicId, body),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success("Thêm thành công", "Bác sĩ đã được thêm vào phòng khám.");
        queryClient.invalidateQueries({ queryKey: ["clinics", "doctors", variables.clinicId] });
      } else {
        toast.error("Thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useUpdateClinicDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicDoctorId, body }: { clinicDoctorId: string; body: UpdateClinicDoctorBody }) =>
      ClinicService.updateClinicDoctor(clinicDoctorId, body),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Cập nhật thành công", "Thông tin bác sĩ trong phòng khám đã được thay đổi.");
        queryClient.invalidateQueries({ queryKey: ["clinics", "doctors"] });
      } else {
        toast.error("Cập nhật thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useRemoveDoctorFromClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clinicDoctorId: string) => ClinicService.removeDoctorFromClinic(clinicDoctorId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Đã xóa", "Bác sĩ đã được gỡ khỏi phòng khám.");
        queryClient.invalidateQueries({ queryKey: ["clinics", "doctors"] });
      } else {
        toast.error("Xóa thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

// ─── Clinic Contracts ─────────────────────────────────────────────────────────

export function useClinicContracts(clinicId: string) {
  return useFetch(
    ["clinics", "contracts", clinicId],
    () => ClinicService.getContractsByClinic(clinicId),
    { enabled: !!clinicId },
  );
}

export function useCreateClinicContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, body }: { clinicId: string; body: CreateClinicContractBody }) =>
      ClinicService.createClinicContract(clinicId, body),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success("Tạo thành công", "Hợp đồng phòng khám đã được thêm.");
        queryClient.invalidateQueries({ queryKey: ["clinics", "contracts", variables.clinicId] });
      } else {
        toast.error("Tạo thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, status }: { contractId: string; status: string }) =>
      ClinicService.updateContractStatus(contractId, status),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Cập nhật thành công", "Trạng thái hợp đồng đã được thay đổi.");
        queryClient.invalidateQueries({ queryKey: ["clinics", "contracts"] });
      } else {
        toast.error("Cập nhật thất bại", translateErrorMessage(res.error?.code, res.message));
      }
    },
    onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
  });
}
