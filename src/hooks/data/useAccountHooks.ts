import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import * as UserService from "@/apis/user.service";
import { toast } from "../useToast";
import { AxiosError } from "axios";
import type { BaseResponse } from "@/types/APIResponse";

/** Map API error messages (EN) → Vietnamese toast messages */
const errorMessageMap: Record<string, string> = {
  "Unauthorized - Token is missing or invalid.":
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "Email already exists.": "Email này đã được sử dụng.",
  "Phone number already exists.": "Số điện thoại này đã được sử dụng.",
  "User not found.": "Không tìm thấy người dùng.",
  "Access denied.": "Bạn không có quyền thực hiện thao tác này.",
};

function translateErrorMessage(message: string): string {
  return errorMessageMap[message] || message;
}

/** Extract error message from AxiosError response body or fallback */
function getApiErrorMessage(error: Error): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BaseResponse<unknown> | undefined;
    if (data?.message) {
      return translateErrorMessage(data.message);
    }
  }
  return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
}

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
      } else {
        toast.error(
          "Tạo tài khoản thất bại",
          translateErrorMessage(data.message)
        );
      }
    },

    onError: (error: Error) => {
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
          "Đã thêm kiểm định viên mới."
        );
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(
          "Tạo tài khoản thất bại",
          translateErrorMessage(data.message)
        );
      }
    },

    onError: (error: Error) => {
      toast.error("Tạo tài khoản thất bại", getApiErrorMessage(error));
    },
  });
}

