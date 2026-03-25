import * as DoctorService from "@/apis/doctor.service";
import * as UserService from "@/apis/user.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";
import { useFetch } from "../useFetch";

export function useDoctorMe(enabled: boolean) {
  return useFetch(["doctor", "me"], async () => DoctorService.getDoctorMe(), {
    enabled,
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

      toast.error(
        "Cập nhật thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Cập nhật thất bại", getApiErrorMessage(error));
    },
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: UserService.changeMyPassword,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đổi mật khẩu thành công", "Vui lòng dùng mật khẩu mới từ lần đăng nhập sau.");
        return;
      }

      toast.error(
        "Đổi mật khẩu thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Đổi mật khẩu thất bại", getApiErrorMessage(error));
    },
  });
}
