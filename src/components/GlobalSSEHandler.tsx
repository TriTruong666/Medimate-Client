import { useEffect } from "react";
import { useRagSse } from "@/hooks/sse/useRagSseHooks";
import { toast } from "@/hooks/useToast";

/**
 * Component xử lý các sự kiện SSE toàn cục (ví dụ: hiển thị Toast thông báo)
 */
export default function GlobalSSEHandler({ clientId }: { clientId?: string }) {
  const { lastNotification } = useRagSse({ clientId });

  useEffect(() => {
    if (lastNotification) {
      console.log(`[SSE ${clientId || "Personal"}] Notification received:`, lastNotification);
      const { title, body, alert_type } = lastNotification.payload;

      // Map alert_type từ server sang toast UI
      const type = (alert_type || "info").toLowerCase();

      if (type === "success") {
        toast.success(title, body);
      } else if (type === "warning" || type === "warn") {
        toast.warn(title, body);
      } else if (type === "error") {
        toast.error(title, body);
      } else {
        toast.info(title, body);
      }
    }
  }, [lastNotification]);

  return null;
}
