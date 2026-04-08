import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { useAuth } from "./useAuth";
import { toast } from "./useToast";

// --- Hàm tạo âm thanh thông báo cực mượt (Soft Ding) ---
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Tạo âm thanh chuông nhẹ
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

const base_net_url = import.meta.env.DEV
  ? import.meta.env.VITE_NET_API_URL_TEST
  : import.meta.env.VITE_NET_API_URL;

export function useSignalR() {
  const queryClient = useQueryClient();
  const [{ token }] = useCookies(["token"]);
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      // Must be authenticated to connect
      if (!isAuthenticated || !token || !base_net_url) return;

      if (
        connectionRef.current &&
        connectionRef.current.state !== signalR.HubConnectionState.Disconnected
      ) {
        if (connectionRef.current.state === signalR.HubConnectionState.Connected && isMounted) {
          setIsConnected(true);
        }
        return;
      }

      const url = `${base_net_url}/hub/medimate`;

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connectionRef.current = newConnection;

      // -- Bắt thông báo đẩy Notification chung --
      newConnection.on("ReceiveNotification", (notif: any) => {
        console.log("🔔 [SignalR] ReceiveNotification:", notif);
        playNotificationSound();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        if (notif && notif.title) {
          toast.success(notif.title, notif.message || "Bạn có thông báo mới");
        }
      });

      newConnection.on("ReceiveNotificationUpdate", () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      });

      // -- Cập nhật trạng thái Cuộc Gọi / Lịch hẹn --
      newConnection.on("AppointmentStatusUpdated", (data: any) => {
        console.log("📅 [SignalR] AppointmentStatusUpdated:", data);
        // Refresh doctor specific caches
        queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
        queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
        queryClient.invalidateQueries({ queryKey: ["session-details"] });
      });

      // -- Tin nhắn --
      newConnection.on("ReceiveMessage", (data: any) => {
        console.log("💬 [SignalR] ReceiveMessage:", data);
        playNotificationSound();
        queryClient.invalidateQueries({ queryKey: ["chat-messages", data?.sessionId] });
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["chat-session-details", data?.sessionId] });
        queryClient.invalidateQueries({ queryKey: ["session-details"] });
        
        if (data && data.senderName) {
            toast.success(`Tin nhắn từ ${data.senderName}`, data.content || "[Hình ảnh đính kèm]");
        }
      });

      newConnection.on("ReceiveMessageUpdate", () => {
        queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
        queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        queryClient.invalidateQueries({ queryKey: ["chat-session-details"] });
        queryClient.invalidateQueries({ queryKey: ["session-details"] });
      });

      // -- Khi người giám hộ Join phòng Call --
      newConnection.on("GuardianJoined", (data: any) => {
        console.log("👤 [SignalR] GuardianJoined:", data);
        toast.success(
          `${data.guardianName || "Người giám hộ"} đã tham gia`,
          `Người giám hộ của ${data.memberName} vừa vào phòng khám.`
        );
      });

      try {
        if (newConnection.state === signalR.HubConnectionState.Disconnected) {
          await newConnection.start();
          if (isMounted) setIsConnected(true);
          console.log("🟢 [SignalR] Connected successfully.");
        }

        newConnection.onreconnecting(() => console.log("🟡 [SignalR] Reconnecting..."));
        newConnection.onreconnected(() => {
          console.log("🟢 [SignalR] Reconnected.");
          if (isMounted) setIsConnected(true);
        });
        newConnection.onclose(() => {
          console.log("🔴 [SignalR] Connection closed.");
          if (isMounted) setIsConnected(false);
          connectionRef.current = null;
        });
      } catch (err) {
        console.log("🔴 [SignalR] Connection Error: ", err);
        connectionRef.current = null;
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      const conn = connectionRef.current;
      if (conn && conn.state !== signalR.HubConnectionState.Disconnected) {
        conn.stop().then(() => {
          if (isMounted) setIsConnected(false);
          connectionRef.current = null;
        }).catch(err => console.log("🔴 [SignalR] Stop Error:", err));
      } else {
        connectionRef.current = null;
      }
    };
  }, [token, isAuthenticated, queryClient]);

  return { isConnected };
}

export function SignalRInjector() {
  useSignalR();
  return null;
}
