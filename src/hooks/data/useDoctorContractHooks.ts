import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ContractService from "@/apis/doctor-contract.service";
import { useFetch } from "../useFetch";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import type { CreateDoctorContractBody, UpdateDoctorContractBody } from "@/types/DoctorContract";

export function useDoctorContracts() {
    return useFetch(["doctor-contracts", "list"], () => ContractService.getDoctorContracts());
}

export function useDoctorContract(id: string) {
    return useFetch(["doctor-contracts", "detail", id], () => ContractService.getDoctorContractById(id), {
        enabled: !!id,
    });
}

export function useCreateDoctorContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ContractService.createDoctorContract,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Thành công", "Đã thêm hợp đồng mới.");
                queryClient.invalidateQueries({ queryKey: ["doctor-contracts"] });
            } else {
                toast.error("Thất bại", translateErrorMessage(res.error?.code, res.message));
            }
        },
        onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
    });
}

export function useUpdateDoctorContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDoctorContractBody }) =>
            ContractService.updateDoctorContract(id, data),
        onSuccess: (res, variables) => {
            if (res.success) {
                toast.success("Cập nhật thành công", "Thông tin hợp đồng đã được thay đổi.");
                queryClient.invalidateQueries({ queryKey: ["doctor-contracts"] });
                queryClient.invalidateQueries({ queryKey: ["doctor-contracts", "detail", variables.id] });
            } else {
                toast.error("Cập nhật thất bại", translateErrorMessage(res.error?.code, res.message));
            }
        },
        onError: (error) => toast.error("Lỗi", getApiErrorMessage(error)),
    });
}

export function useDeleteDoctorContract() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ContractService.deleteDoctorContract,
        onSuccess: (res) => {
            if (res.success) {
                toast.success("Đã xóa", "Hợp đồng đã được gỡ khỏi hệ thống.");
                queryClient.invalidateQueries({ queryKey: ["doctor-contracts"] });
            } else {
                toast.error("Xóa thất bại", translateErrorMessage(res.error?.code, res.message));
            }
        },
        onError: (error) => toast.error("Lỗi kết nối", getApiErrorMessage(error)),
    });
}