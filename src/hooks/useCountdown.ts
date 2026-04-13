import { useEffect, useState } from "react";

interface CountdownState {
  isExpired: boolean;
  timeRemaining: number; // Giây còn lại
  displayText: string;
  percentage: number; // % thời gian còn lại, từ 0-100
}

function getCountdownState(expiredAt?: string | null): CountdownState {
  if (!expiredAt) {
    return {
      isExpired: true,
      timeRemaining: 0,
      displayText: "",
      percentage: 0,
    };
  }

  const now = Date.now();
  const expireTime = new Date(expiredAt).getTime();

  if (Number.isNaN(expireTime)) {
    return {
      isExpired: true,
      timeRemaining: 0,
      displayText: "",
      percentage: 0,
    };
  }

  const diff = expireTime - now;
  if (diff <= 0) {
    return {
      isExpired: true,
      timeRemaining: 0,
      displayText: "Hết hạn",
      percentage: 0,
    };
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let displayText = "";
  if (days > 0) {
    displayText = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    displayText = `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    displayText = `${minutes}m ${seconds % 60}s`;
  } else {
    displayText = `${seconds}s`;
  }

  return {
    isExpired: false,
    timeRemaining: seconds,
    percentage: Math.max(0, Math.min(100, (diff / (365 * 24 * 60 * 60 * 1000)) * 100)),
    displayText,
  };
}

/**
 * Hook để tính đếm ngược realtime đến thời gian hết hạn
 * @param expiredAt - ISO string hoặc null/undefined
 * @returns Countdown state với isExpired, timeRemaining, displayText, percentage
 */
export function useCountdown(expiredAt?: string | null): CountdownState {
  const [state, setState] = useState<CountdownState>(() => getCountdownState(expiredAt));

  useEffect(() => {
    setState(getCountdownState(expiredAt));

    if (!expiredAt) return;

    // Tick mỗi giây để countdown realtime, nhưng trạng thái đầu đã có ngay.
    const interval = setInterval(() => {
      setState(getCountdownState(expiredAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt]);

  return state;
}
