import { useEffect, useRef } from "react";
import type { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | null;
  className?: string;
}

export function VideoPlayer({ videoTrack, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!videoTrack || !container) return;

    // Attach track to DOM container
    try {
      videoTrack.play(container, { fit: "contain" });
    } catch (err) {
      console.warn("[VideoPlayer] play() error:", err);
    }

    return () => {
      // Chỉ detach player khỏi DOM — KHÔNG gọi track.stop() hay track.close()
      // Lifecycle thật sự của track được quản lý bởi useAgoraVideoCall hook
      try {
        videoTrack.stop();
      } catch { /* ignore */ }
    };
  }, [videoTrack]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden bg-[#111] ${
        className || ""
      }`}
    />
  );
}
