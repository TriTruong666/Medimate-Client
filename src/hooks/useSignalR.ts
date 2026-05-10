import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "./useToast";

export let globalSignalRConnection: signalR.HubConnection | null = null;

// --- Hàm tạo âm thanh thông báo cực mượt (Soft Ding) ---
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (err) {
    console.error("Audio blocked by browser policy:", err);
  }
};

// URL hub — dùng chung cho cả dev & prod (withCredentials thay thế cho accessTokenFactory)
const base_net_url = import.meta.env.DEV
  ? import.meta.env.VITE_NET_API_URL_TEST
  : import.meta.env.VITE_NET_API_URL;

export function useSignalR() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    let isMounted = true;

    // ── LOGOUT: Ngắt kết nối ngay khi mất authentication ──────────────────────
    if (!isAuthenticated) {
      const conn = connectionRef.current;
      if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
        conn.stop().catch(() => { });
      }
      connectionRef.current = null;
      if (isMounted) setIsConnected(false);
      return () => { isMounted = false; };
    }

    // ── LOGIN: Tạo kết nối mới nếu chưa có ────────────────────────────────────
    const startConnection = async () => {
      if (!base_net_url) {
        console.error("❌ [SignalR] VITE_NET_API_URL is not defined!");
        return;
      }

      // Đã connected / đang connecting → bỏ qua
      if (
        connectionRef.current &&
        connectionRef.current.state !== signalR.HubConnectionState.Disconnected
      ) {
        if (connectionRef.current.state === signalR.HubConnectionState.Connected && isMounted) {
          setIsConnected(true);
        }
        return;
      }

      const hubUrl = `${base_net_url}/hub/medimate`;
      console.log("⏳ [SignalR] Connecting to:", hubUrl);

      // Đọc JWT token từ cookie "token" mà web tự set sau khi login
      // SignalR client sẽ gửi nó lên server dạng ?access_token=...
      // Backend đọc qua: context.Request.Query["access_token"]
      const getTokenFromCookie = (): string => {
        const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        return match ? match[1] : "";
      };

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => getTokenFromCookie(),
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connectionRef.current = newConnection;
      globalSignalRConnection = newConnection;

      // ── Event Handlers ────────────────────────────────────────────────────────

      newConnection.on("ReceiveNotification", (notif: any) => {
        console.log("🔔 [SignalR] ReceiveNotification:", notif);
        playNotificationSound();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        if (notif?.title) {
          toast.success(notif.title, notif.message || "Bạn có thông báo mới");
        }
      });

      newConnection.on("ReceiveNotificationUpdate", () => {
        console.log("🔔 [SignalR] ReceiveNotificationUpdate");
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      newConnection.on("AppointmentStatusUpdated", (data: any) => {
        console.log("📅 [SignalR] AppointmentStatusUpdated:", data);
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
        queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
        queryClient.invalidateQueries({ queryKey: ["appointment-detail"] });
        queryClient.invalidateQueries({ queryKey: ["available-slots"] });
        queryClient.invalidateQueries({ queryKey: ["session-details"] });
        if (data?.status) {
          toast.success("Lịch khám cập nhật", `Trạng thái: ${data.status}`);
        }
      });

      newConnection.on("ReceiveMessage", (data: any) => {
        console.log("💬 [SignalR] ReceiveMessage:", data);
        playNotificationSound();
        queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["chat-session-details"] });
        queryClient.invalidateQueries({ queryKey: ["session-details"] });
      });

      newConnection.on("ReceiveMessageUpdate", () => {
        console.log("💬 [SignalR] ReceiveMessageUpdate (Đã đọc)");
        queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["chat-session-details"] });
        queryClient.invalidateQueries({ queryKey: ["session-details"] });
      });

      newConnection.on("GuardianJoined", (data: any) => {
        console.log("👤 [SignalR] GuardianJoined:", data);
        toast.success(
          `${data.guardianName || "Người giám hộ"} đã tham gia`,
          `Người giám hộ của ${data.memberName} vừa vào phòng khám.`
        );
        queryClient.invalidateQueries({ queryKey: ["session", data.sessionId] });
      });

      newConnection.on("ReceiveMedicationLogUpdate", () => {
        console.log("💊 [SignalR] ReceiveMedicationLogUpdate");
        queryClient.invalidateQueries({ queryKey: ["member-med-logs"] });
        queryClient.invalidateQueries({ queryKey: ["family-med-logs"] });
        queryClient.invalidateQueries({ queryKey: ["schedule-stats"] });
        queryClient.invalidateQueries({ queryKey: ["member-reminders"] });
        queryClient.invalidateQueries({ queryKey: ["family-reminders"] });
      });

      // Lifecycle handlers
      newConnection.onreconnecting((err) => {
        console.log("🟡 [SignalR] Reconnecting...", err);
        if (isMounted) setIsConnected(false);
      });
      newConnection.onreconnected(() => {
        console.log("🟢 [SignalR] Reconnected.");
        if (isMounted) setIsConnected(true);
      });
      newConnection.onclose((err) => {
        console.log("🔴 [SignalR] Connection closed.", err);
        if (isMounted) setIsConnected(false);
        connectionRef.current = null;
      });

      // Thử kết nối với timeout 5 giây
      try {
        const startPromise = newConnection.start();
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("SignalR_Connection_Timeout")), 5000)
        );

        await Promise.race([startPromise, timeoutPromise]);

        if (isMounted) setIsConnected(true);
        console.log("🟢 [SignalR] Connected successfully.");
      } catch (err: any) {
        if (err?.message === "SignalR_Connection_Timeout") {
          console.log("🟡 [SignalR] Kết nối quá 5s, bỏ qua để tránh treo.");
        } else {
          console.log("🔴 [SignalR] Connection Error:", err?.message || err);
        }
        connectionRef.current = null;
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      const conn = connectionRef.current;
      if (!isAuthenticated && conn && conn.state !== signalR.HubConnectionState.Disconnected) {
        conn.stop().catch(() => { });
        connectionRef.current = null;
        globalSignalRConnection = null;
      }
    };
  }, [isAuthenticated, queryClient]);

  return { isConnected };
}

export function SignalRInjector() {
  useSignalR();
  return null;
}
