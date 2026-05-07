import { useEffect } from "react";
import { useRagSse } from "@/hooks/sse/useRagSseHooks";
import { toast } from "@/hooks/useToast";

/**
 * Component xử lý các sự kiện SSE toàn cục (ví dụ: hiển thị Toast thông báo)
 */
let lastProcessedToastTimestamp = "";

export default function GlobalSSEHandler({ clientId }: { clientId?: string }) {
  const { lastNotification } = useRagSse({ clientId, connect: true });

  useEffect(() => {
    if (lastNotification) {
      if (lastNotification.timestamp === lastProcessedToastTimestamp) return;
      lastProcessedToastTimestamp = lastNotification.timestamp;

      console.log(`[SSE ${clientId || "Personal"}] Notification received:`, lastNotification);
      const { title, body, alert_type } = lastNotification.payload;

      // Map alert_type từ server sang toast UI
      const type = (alert_type || "info").toLowerCase();

      if (type === "success") {
        toast.success(title, body, { duration: 8000 });
      } else if (type === "warning" || type === "warn") {
        toast.warn(title, body, { duration: 8000 });
      } else if (type === "error") {
        toast.error(title, body, { duration: 8000 });
      } else {
        toast.info(title, body, { duration: 8000 });
      }
    }
  }, [lastNotification]);

  return null;
}
