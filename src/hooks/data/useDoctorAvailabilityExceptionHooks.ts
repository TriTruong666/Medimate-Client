import * as DoctorAvailabilityExceptionService from "@/apis/doctor-availability-exception.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  CreateDoctorAvailabilityExceptionBody,
  GetDoctorAvailabilityExceptionsQuery,
  UpdateDoctorAvailabilityExceptionBody,
} from "@/types/DoctorAvailabilityException";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";

export function useDoctorAvailabilityExceptions(doctorId: string) {
  return useFetch(
    ["doctor-availability-exceptions", doctorId],
    () => DoctorAvailabilityExceptionService.getDoctorAvailabilityExceptions(doctorId),
    { enabled: !!doctorId },
  );
}

export function useDoctorAvailabilityExceptionsPaged(
  params: GetDoctorAvailabilityExceptionsQuery,
) {
  return useFetch(
    ["doctor-availability-exceptions", "paged", params],
    () => DoctorAvailabilityExceptionService.getDoctorAvailabilityExceptionsPaged(params),
  );
}

export function useCreateDoctorAvailabilityException(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateDoctorAvailabilityExceptionBody) =>
      DoctorAvailabilityExceptionService.createDoctorAvailabilityException(
        doctorId,
        request,
      ),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã tạo lịch nghỉ, đang chờ duyệt.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availability-exceptions", doctorId],
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

export function useUpdateDoctorAvailabilityException(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDoctorAvailabilityExceptionBody;
    }) =>
      DoctorAvailabilityExceptionService.updateDoctorAvailabilityException(id, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã cập nhật lịch nghỉ.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availability-exceptions", doctorId],
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

export function useDeleteDoctorAvailabilityException(doctorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      DoctorAvailabilityExceptionService.deleteDoctorAvailabilityException(id),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã xóa lịch nghỉ.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availability-exceptions", doctorId],
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

export function useApproveDoctorAvailabilityException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDoctorAvailabilityExceptionBody;
    }) => DoctorAvailabilityExceptionService.updateDoctorAvailabilityException(id, data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Thành công", "Đã duyệt lịch nghỉ cho bác sĩ.");
        void queryClient.invalidateQueries({
          queryKey: ["doctor-availability-exceptions"],
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
