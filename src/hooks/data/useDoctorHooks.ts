import * as DoctorService from "@/apis/doctor.service";
import * as UserService from "@/apis/user.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";
import { useFetch } from "../useFetch";

import { useAuth } from "../useAuth";

export function useDoctorMe(enabled: boolean) {
  const { user } = useAuth();
  const isDoctor = user?.role === "Doctor";

  return useFetch(["doctor", "me"], async () => DoctorService.getDoctorMe(), {
    enabled: enabled && isDoctor,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useSubmitDoctorMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DoctorService.submitDoctorMe,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Cập nhật thành công", "Đã gửi hồ sơ bác sĩ.");
        queryClient.invalidateQueries({ queryKey: ["doctor", "me"] });
        return;
      }
      toast.error("Cập nhật thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => toast.error("Cập nhật thất bại", getApiErrorMessage(error)),
  });
}

export function useUpdateDoctorMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DoctorService.updateDoctorMe,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Cập nhật thành công", "Thông tin đã được gửi. Đang chờ duyệt.");
        queryClient.invalidateQueries({ queryKey: ["doctor", "me"] });
        return;
      }
      toast.error("Cập nhật thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => toast.error("Cập nhật thất bại", getApiErrorMessage(error)),
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: UserService.changeMyPassword,
    onSuccess: (data) => {
      if (data?.success || (data as any)?.Success) {
        toast.success("Đổi mật khẩu thành công", "Vui lòng dùng mật khẩu mới từ lần đăng nhập sau.");
        return;
      }
      toast.error("Thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => toast.error("Thất bại", getApiErrorMessage(error)),
  });
}

export function useActivateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DoctorService.activateDoctor,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Kích hoạt thành công", "Tài khoản của bạn đã được kích hoạt.");
        queryClient.invalidateQueries({ queryKey: ["doctor", "me"] });
        return;
      }
      toast.error("Kích hoạt thất bại", translateErrorMessage(data.error?.code, data.message));
    },
    onError: (error) => toast.error("Kích hoạt thất bại", getApiErrorMessage(error)),
  });
}
