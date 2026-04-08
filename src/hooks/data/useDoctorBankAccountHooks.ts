import * as DoctorBankAccountService from "@/apis/doctor-bank-account.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { UpsertDoctorBankAccountRequest } from "@/types/DoctorBankAccount";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";

export function useDoctorBankAccounts(doctorId: string) {
  return useFetch(
    ["doctor-bank-accounts", doctorId],
    () => DoctorBankAccountService.getDoctorBankAccounts(doctorId),
    { enabled: !!doctorId },
  );
}

export function useCreateDoctorBankAccount(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertDoctorBankAccountRequest) =>
      DoctorBankAccountService.createDoctorBankAccount(doctorId, payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã thêm tài khoản ngân hàng.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-bank-accounts", doctorId],
        });
        return;
      }

      toast.error("Thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}

export function useUpdateDoctorBankAccount(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertDoctorBankAccountRequest }) =>
      DoctorBankAccountService.updateDoctorBankAccount(id, payload),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật tài khoản ngân hàng.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-bank-accounts", doctorId],
        });
        return;
      }

      toast.error("Thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}

export function useDeleteDoctorBankAccount(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DoctorBankAccountService.deleteDoctorBankAccount(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa tài khoản ngân hàng.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-bank-accounts", doctorId],
        });
        return;
      }

      toast.error("Thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}
