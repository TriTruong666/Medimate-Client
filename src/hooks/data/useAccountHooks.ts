import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import * as UserService from "@/apis/user.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { PaginationParams } from "@/common/query.params";

export function useUserList(params: PaginationParams) {
  return useFetch(["users", params], async () => UserService.getUsers(params));
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserService.createDoctor,

    onSuccess: (data) => {
      if (data.success) {
        toast.success("Tạo tài khoản thành công", "Đã thêm bác sĩ mới.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(
          "Tạo tài khoản thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
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
        toast.success(
          "Tạo tài khoản thành công",
          "Đã thêm kiểm định viên mới.",
        );
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(
          "Tạo tài khoản thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
    },

    onError: (error: unknown) => {
      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(error));
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserService.deactivateUser,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Khóa thành công", "Đã khóa tài khoản người dùng.");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        return;
      }

      toast.error(
        "Khóa thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Khóa thất bại", getApiErrorMessage(error));
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserService.activateUser,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          "Kích hoạt thành công",
          "Đã kích hoạt tài khoản người dùng.",
        );
        queryClient.invalidateQueries({ queryKey: ["users"] });
        return;
      }

      toast.error(
        "Kích hoạt thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Kích hoạt thất bại", getApiErrorMessage(error));
    },
  });
}
