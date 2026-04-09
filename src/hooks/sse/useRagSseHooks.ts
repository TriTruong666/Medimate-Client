import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../useAuth";

const RAG_URL = import.meta.env.VITE_PY_API_URL || "https://ragcore.medimate.health.vn/";

export type SSENotification = {
  type: string;
  timestamp: string;
  payload: {
    title: string;
    body: string;
    alert_type: "info" | "success" | "warning" | "error";
    collection_id?: string;
    document_ids?: string[];
  };
};

export type SSEProcessUpdate = {
  collection_id: string;
  status: "indexing" | "indexed" | "failed";
  progress: number;
  message: string;
};

export type SSEHandlers = {
  [eventType: string]: (data: any) => void;
};

export type useRagSseOptions = {
  clientId?: string;
  handlers?: SSEHandlers;
};

export function useRagSse(options: useRagSseOptions = {}) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<SSENotification | null>(null);
  const [processUpdate, setProcessUpdate] = useState<SSEProcessUpdate | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef<SSEHandlers | undefined>(options.handlers);

  // Update handlers ref when they change to avoid re-connecting
  useEffect(() => {
    handlersRef.current = options.handlers;
  }, [options.handlers]);

  const connect = useCallback(() => {
    const finalClientId = options.clientId || user?.userId;
    if (!finalClientId) return;

    if (eventSourceRef.current) {
      if (eventSourceRef.current.readyState !== EventSource.CLOSED) {
        eventSourceRef.current.close();
      }
    }

    const baseUrl = RAG_URL.endsWith("/") ? RAG_URL : `${RAG_URL}/`;
    const url = `${baseUrl}api/v1/sse/stream/${finalClientId}`;
    
    console.log(`Connecting to SSE stream for client: ${finalClientId}`);
    const es = new EventSource(url, { withCredentials: true });

    es.onopen = () => {
      console.log(`✅ SSE connected (Client: ${finalClientId})`);
      setIsConnected(true);
    };

    es.onerror = (err) => {
      console.error("❌ SSE error", err);
      setIsConnected(false);
      es.close();
      
      if (finalClientId) {
        setTimeout(() => connect(), 5000);
      }
    };

    // Generic event dispatcher for scalability
    const eventTypes = ["notification", "process_update", ...(options.handlers ? Object.keys(options.handlers) : [])];
    const uniqueEventTypes = Array.from(new Set(eventTypes));

    uniqueEventTypes.forEach(type => {
      es.addEventListener(type, (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Internal handlers
          if (type === "notification") setLastNotification(data);
          if (type === "process_update") setProcessUpdate(data);

          // External/Custom handlers
          if (handlersRef.current && handlersRef.current[type]) {
            handlersRef.current[type](data);
          }
        } catch (e) {
          console.error(`Failed to parse SSE ${type}`, e);
        }
      });
    });

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 SSE message received:", data);

        // Tự động xử lý nếu là một alert/notification
        if (data.type === "alert" || data.type === "notification") {
          setLastNotification(data);
        }

        if (handlersRef.current && handlersRef.current["message"]) {
          handlersRef.current["message"](data);
        }
      } catch (e) {
        console.log("📩 SSE message received (raw):", event.data);
        if (handlersRef.current && handlersRef.current["message"]) {
          handlersRef.current["message"](event.data);
        }
      }
    };

    eventSourceRef.current = es;
  }, [user?.userId, options.clientId]); // Chỉ re-connect khi userId hoặc clientId yêu cầu đổi


  useEffect(() => {
    connect();
    
    return () => {
      if (eventSourceRef.current) {
        console.log("Closing SSE connection");
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected,
    lastNotification,
    processUpdate,
  };
}
