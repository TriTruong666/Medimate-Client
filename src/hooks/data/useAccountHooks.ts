import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import * as UserService from "@/apis/user.service";
import { toast } from "../useToast";
import { getApiErrorMessage } from "@/common/api.error";

export function useUserList() {
  return useFetch(["users"], async () => UserService.getUsers());
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserService.createDoctor,

    onSuccess: (data) => {
      if (data.success) {
        toast.success("Tạo tài khoản thành công", "Đã thêm bác sĩ mới.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        return;
      }

      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(data));
    },

    onError: (error: unknown) => {
      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(error));
    },
  });
}

export function useCreateDoctorManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserService.createDoctorManager,

    onSuccess: (data) => {
      if (data.success) {
        toast.success("Tạo tài khoản thành công", "Đã thêm kiểm định viên mới.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        return;
      }

      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(data));
    },

    onError: (error: unknown) => {
      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(error));
    },
  });
}

