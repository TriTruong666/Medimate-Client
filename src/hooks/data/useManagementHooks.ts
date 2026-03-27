import * as ManagementService from "@/apis/management.service";
import type { GetManagementDoctorsRequest } from "@/apis/management.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";

export function useManagementDoctors(req: GetManagementDoctorsRequest) {
  return useQuery({
    queryKey: ["management", "doctors", req.status, req.specialty],
    queryFn: async () => {
      const data = await ManagementService.getDoctors(req);
      return data.data; // Note: returns the inner array
    },
  });
}

export function useReviewDoctorAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: "verified" | "rejected", reason?: string }) => {
      if (status === "verified") {
        return ManagementService.verifyDoctor(id);
      }
      return ManagementService.rejectDoctor(id, reason || "");
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success(
          variables.status === "verified" ? "Duyệt thành công" : "Từ chối thành công",
          variables.status === "verified" ? "Tài khoản bác sĩ đã được phê duyệt." : "Đã từ chối tài khoản này."
        );
        queryClient.invalidateQueries({ queryKey: ["management", "doctors"] });
      } else {
        toast.error("Thao tác thất bại", translateErrorMessage(data.error?.code, data.message));
      }
    },
    onError: (error) => {
      toast.error("Lỗi hệ thống", getApiErrorMessage(error));
    }
  });
}
