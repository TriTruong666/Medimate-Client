import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import * as PackageService from "@/apis/package.service";
import type { UpdatePackageRequest } from "@/types/Package";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";

export function usePackages() {
  return useFetch(["packages"], async () => PackageService.getPackages());
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      packageId,
      request,
    }: {
      packageId: string;
      request: UpdatePackageRequest;
    }) => PackageService.updatePackage(packageId, request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Cập nhật gói thành công", "Thông tin gói đã được lưu.");
        queryClient.invalidateQueries({ queryKey: ["packages"] });
        return;
      }

      toast.error(
        "Cập nhật gói thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Cập nhật gói thất bại", getApiErrorMessage(error));
    },
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePackageRequest) =>
      PackageService.createPackage(request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Tạo gói thành công", "Gói mới đã được thêm.");
        queryClient.invalidateQueries({ queryKey: ["packages"] });
        return;
      }

      toast.error(
        "Tạo gói thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Tạo gói thất bại", getApiErrorMessage(error));
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: string) => PackageService.deletePackage(packageId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Xóa gói thành công", "Gói đã được xóa khỏi hệ thống.");
        queryClient.invalidateQueries({ queryKey: ["packages"] });
        return;
      }

      toast.error(
        "Xóa gói thất bại",
        translateErrorMessage(data.error?.code, data.message),
      );
    },
    onError: (error: unknown) => {
      toast.error("Xóa gói thất bại", getApiErrorMessage(error));
    },
  });
}