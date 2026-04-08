import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";
import * as PrescriptionService from "@/apis/prescription.service";
import type {
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
} from "@/types/Prescription";

export function usePrescriptionsBySession(sessionId: string) {
  return useFetch(
    ["prescriptions-session", sessionId],
    () => PrescriptionService.getPrescriptionsBySession(sessionId),
    { enabled: !!sessionId },
  );
}

export function usePrescriptionDetail(prescriptionId: string) {
  return useFetch(
    ["prescription-detail", prescriptionId],
    () => PrescriptionService.getPrescriptionById(prescriptionId),
    { enabled: !!prescriptionId },
  );
}

export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      body,
    }: {
      doctorId: string;
      body: CreatePrescriptionRequest;
    }) => PrescriptionService.createPrescription(doctorId, body),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Tạo đơn thành công", "Đơn thuốc đã được lưu.");
        queryClient.invalidateQueries({
          queryKey: ["prescriptions-session", variables.body.consultanSessionId],
        });
        return;
      }

      toast.error(
        "Tạo đơn thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Tạo đơn thất bại", getApiErrorMessage(error));
    },
  });
}

export function useUpdatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdatePrescriptionRequest;
    }) => PrescriptionService.updatePrescription(id, body),
    onSuccess: (data, variables) => {
      if (data.success) {
        toast.success("Cập nhật thành công", "Đơn thuốc đã được cập nhật.");
        queryClient.invalidateQueries({
          queryKey: ["prescription-detail", variables.id],
        });
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
