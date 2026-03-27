import * as DoctorDocumentService from "@/apis/doctor-document.service";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type {
  GetDoctorDocumentsParams,
  ReviewDoctorDocumentRequest,
} from "@/types/DoctorDocument";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";

export function useDoctorDocuments(params: GetDoctorDocumentsParams) {
  return useFetch(["doctor-documents", params], async () =>
    DoctorDocumentService.getDoctorDocuments(params),
  );
}

export function useDoctorDocumentsByDoctorId(doctorId: string) {
  return useQuery({
    queryKey: ["doctor-documents", "doctor", doctorId],
    queryFn: async () => {
      const res = await DoctorDocumentService.getDoctorDocumentsByDoctorId(doctorId);
      return res.data;
    },
    enabled: !!doctorId,
  });
}

type ReviewDoctorDocumentVariables = {
  id: string;
  payload: ReviewDoctorDocumentRequest;
};

export function useReviewDoctorDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: ReviewDoctorDocumentVariables) =>
      DoctorDocumentService.reviewDoctorDocument(id, payload),
    onSuccess: (data, variables) => {
      if (data.success) {
        const title =
          variables.payload.status === "approved" ? "Duyệt thành công" : "Từ chối thành công";
        toast.success(title, data.message || "Đã cập nhật trạng thái hồ sơ.");
        queryClient.invalidateQueries({ queryKey: ["doctor-documents"] });
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
