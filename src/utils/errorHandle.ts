import { AxiosError } from "axios";
import type { BaseResponse } from "@/types/APIResponse";

export const errorMessageMap: Record<string, string> = {
    "Unauthorized - Token is missing or invalid.":
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    "Email already exists.": "Email này đã được sử dụng.",
    "Phone number already exists.": "Số điện thoại này đã được sử dụng.",
    "User not found.": "Không tìm thấy người dùng.",
    "Access denied.": "Bạn không có quyền thực hiện thao tác này.",
};

export function translateErrorMessage(message: string): string {
    return errorMessageMap[message] || message;
}

export function getApiErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as BaseResponse<unknown> | undefined;
        if (data?.message) {
            return translateErrorMessage(data.message);
        }
    }
    return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
}
