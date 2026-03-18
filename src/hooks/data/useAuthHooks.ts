import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as AuthService from "@/apis/auth.service";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { BaseResponse } from "@/types/APIResponse";
import type { LoginRequest } from "@/types/Auth";
import { AxiosError } from "axios";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<
    BaseResponse<null>,
    AxiosError<BaseResponse<null>>,
    LoginRequest
  >({
    mutationFn: AuthService.login,

    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đăng nhập thành công", "Chào mừng bạn quay trở lại.");
      } else {
        toast.error(
          "Đăng nhập thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },

    onError: (error: unknown) => {
      toast.error("Đăng nhập thất bại", getApiErrorMessage(error));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.logout,

    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đăng xuất thành công", "Hẹn gặp lại bạn sau!");
        // Clear all auth data from cache
        queryClient.setQueryData(["auth", "me"], null);
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    },
  });
}
