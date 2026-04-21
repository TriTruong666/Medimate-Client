import { atom } from "jotai";
import type { SSENotification, SSEProcessUpdate, SSEProcessLog } from "@/types/sse";

export const sseConnectedAtom = atom(false);
export const lastNotificationAtom = atom<SSENotification | null>(null);
export const processUpdateAtom = atom<SSEProcessUpdate | null>(null);
export const processLogAtom = atom<SSEProcessLog | null>(null);
export const lastEventTimestampAtom = atom<string>("");
export const hasDismissedIndexingAtom = atom(false);
