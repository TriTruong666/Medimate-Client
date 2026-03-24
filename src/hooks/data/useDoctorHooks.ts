import * as DoctorService from "@/apis/doctor.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";
import { useFetch } from "../useFetch";

export function useDoctorMe(enabled: boolean) {
  return useFetch(["doctor", "me"], async () => DoctorService.getDoctorMe(), {
    enabled,
  });
}

export function useUpdateDoctorMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DoctorService.updateDoctorMe,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Cập nhật thành công", "Đã lưu thông tin bác sĩ.");
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
