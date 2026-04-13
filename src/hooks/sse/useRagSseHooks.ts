import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../useAuth";

const RAG_URL =
  import.meta.env.VITE_PY_API_URL || "https://ragcore.medimate.health.vn/";

import { useAtom } from "jotai";
import {
  sseConnectedAtom,
  lastNotificationAtom,
  processUpdateAtom,
  processLogAtom,
} from "@/stores/sseStore";

export type SSEHandlers = {
  [eventType: string]: (data: any) => void;
};

export type useRagSseOptions = {
  clientId?: string;
  handlers?: SSEHandlers;
  connect?: boolean;
};

// Global deduplication to handle multiple connections (e.g., personal + "all")
const processedTimestamps = new Set<string>();
const DEDUPE_BUFFER_SIZE = 100;

function isDuplicate(timestamp?: string, type?: string): boolean {
  if (!timestamp) return false;
  const key = `${timestamp}-${type || "unknown"}`;
  if (processedTimestamps.has(key)) return true;

  processedTimestamps.add(key);
  if (processedTimestamps.size > DEDUPE_BUFFER_SIZE) {
    const firstValue = processedTimestamps.values().next().value;
    if (firstValue !== undefined) {
      processedTimestamps.delete(firstValue);
    }
  }
  return false;
}

export function useRagSse(options: useRagSseOptions = {}) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useAtom(sseConnectedAtom);
  const [lastNotification, setLastNotification] = useAtom(lastNotificationAtom);
  const [processUpdate, setProcessUpdate] = useAtom(processUpdateAtom);
  const [processLog, setProcessLog] = useAtom(processLogAtom);

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
    const eventTypes = [
      "notification",
      "process_update",
      "process_log",
      ...(options.handlers ? Object.keys(options.handlers) : []),
    ];
    const uniqueEventTypes = Array.from(new Set(eventTypes));

    uniqueEventTypes.forEach((type) => {
      es.addEventListener(type, (event) => {
        try {
          const data = JSON.parse(event.data);

          // Deduplicate globally using the timestamp and type
          if (isDuplicate(data.timestamp, data.type || type)) {
            return;
          }

          // Internal handlers
          if (type === "notification") setLastNotification(data);
          if (type === "process_update") setProcessUpdate(data.payload || data);
          if (type === "process_log") setProcessLog(data.payload || data);

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

        // Deduplicate globally using the timestamp and type
        if (isDuplicate(data.timestamp, data.type)) {
          return;
        }

        // Tự động xử lý
        if (data.type === "alert" || data.type === "notification") {
          setLastNotification(data);
        }

        if (data.type === "process_update") {
          setProcessUpdate(data.payload || data);
        }

        if (data.type === "process_log") {
          setProcessLog(data.payload || data);
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
    if (options.connect) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        console.log("Closing SSE connection");
        eventSourceRef.current.close();
      }
    };
  }, [connect, options.connect]);

  return {
    isConnected,
    lastNotification,
    processUpdate,
    processLog,
  };
}
