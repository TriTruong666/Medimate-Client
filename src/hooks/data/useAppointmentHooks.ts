import * as AppointmentService from "@/apis/appointment.service";
import { useFetch } from "../useFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { AppointmentStatus } from "@/types/Appointment";

import { useAuth } from "../useAuth";

export function useDoctorAppointments() {
  const { user } = useAuth();
  return useFetch(
    ["doctor-appointments"],
    async () => AppointmentService.getDoctorAppointments(),
    { enabled: user?.role === "Doctor" },
  );
}

export function useAppointmentDetail(appointmentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["appointment-detail", appointmentId],
    enabled: enabled && !!appointmentId,
    queryFn: async () => {
      try {
        const res = await AppointmentService.getAppointmentDetail(appointmentId);

        if (!res.success) {
          throw new Error(
            translateErrorMessage(res.error?.code, res.message),
          );
        }

        if (!res.data) {
          throw new Error("Không tìm thấy thông tin lịch hẹn.");
        }

        return res.data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(getApiErrorMessage(error));
      }
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      AppointmentService.updateAppointmentStatus(id, status),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Cập nhật trạng thái cuộc hẹn thành công.");
        queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
        return;
      }
      toast.error(
        "Thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Thất bại", getApiErrorMessage(error));
    },
  });
}
