import type { BaseResponse } from "@/types/APIResponse";
import type { MemberHealthProfile } from "@/types/Health"; // Đường dẫn tuỳ thuộc vào nơi bạn lưu interface
import { axiosNETClient } from "./client";

export async function getMemberHealthProfile(
    memberId: string
): Promise<BaseResponse<MemberHealthProfile>> {
    const res = await axiosNETClient.get(`/api/v1/health/member/${memberId}`);
    return res.data;
}