import * as AppointmentService from "@/apis/appointment.service";
import { useFetch } from "../useFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { AppointmentStatus } from "@/types/Appointment";

export function useDoctorAppointments() {
  return useFetch(["doctor-appointments"], async () =>
    AppointmentService.getDoctorAppointments(),
  );
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
