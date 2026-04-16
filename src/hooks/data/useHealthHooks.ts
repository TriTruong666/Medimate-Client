import { useQuery } from "@tanstack/react-query";
import { toast } from "../useToast";
import { getApiErrorMessage, translateErrorMessage } from "@/common/api.error";
import * as HealthService from "@/apis/health.service"; // Đường dẫn file API ở trên

export function useMemberHealthProfile(memberId: string | undefined) {
    return useQuery({
        queryKey: ["member-health-profile", memberId],
        enabled: !!memberId,
        queryFn: async () => {
            try {
                const res = await HealthService.getMemberHealthProfile(memberId!);

                if (!res.success) {
                    throw new Error(
                        translateErrorMessage(res.error?.code, res.message)
                    );
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