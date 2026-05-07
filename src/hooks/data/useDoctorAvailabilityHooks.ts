import * as DoctorAvailabilityService from "@/apis/doctor-availability.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateDoctorAvailabilityBody,
  UpdateDoctorAvailabilityBody,
} from "@/types/DoctorAvailability";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";

export function useDoctorAvailabilities(doctorId: string) {
  return useFetch(
    ["doctor-availabilities", doctorId],
    () => DoctorAvailabilityService.getDoctorAvailabilities(doctorId),
    { enabled: !!doctorId },
  );
}

export function useCreateDoctorAvailabilities(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDoctorAvailabilityBody[]) =>
      DoctorAvailabilityService.createDoctorAvailabilities(doctorId, request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo lịch làm việc cho bác sĩ.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availabilities", doctorId],
        });
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
    },
    onError: (error) => {
      toast.error("Lỗi", getApiErrorMessage(error));
    },
  });
}

export function useUpdateDoctorAvailability(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorAvailabilityBody }) =>
      DoctorAvailabilityService.updateDoctorAvailability(id, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật lịch làm việc.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availabilities", doctorId],
        });
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
    },
    onError: (error) => {
      toast.error("Lỗi", getApiErrorMessage(error));
    },
  });
}

export function useDeleteDoctorAvailability(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DoctorAvailabilityService.deleteDoctorAvailability(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", data.message || "Đã xóa lịch làm việc.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availabilities", doctorId],
        });
      } else {
        toast.error(
          "Thất bại",
          translateErrorMessage(data.error?.code, data.message),
        );
      }
    },
    onError: (error) => {
      toast.error("Lỗi", getApiErrorMessage(error));
    },
  });
}
