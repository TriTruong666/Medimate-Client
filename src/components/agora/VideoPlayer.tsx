import { useEffect, useRef } from "react";
import type { ICameraVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | null;
  className?: string;
}

export function VideoPlayer({ videoTrack, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && containerRef.current) {
      videoTrack.play(containerRef.current);
    }
    return () => {
      // Unbind when unmounting
      if (videoTrack) {
        videoTrack.stop();
      }
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
