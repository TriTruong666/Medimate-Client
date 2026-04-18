import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useAgoraVideoCall } from "@/hooks/agora/useAgoraVideoCall";
import type { RemoteUser } from "@/hooks/agora/useAgoraVideoCall";
import type { ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

interface VideoCallContextValue {
  // Trạng thái cuộc gọi
  isActive: boolean; // Có đang trong một cuộc gọi không
  sessionId: string | null; // ID phòng hiện tại
  isMinimized: boolean; // Có đang thu nhỏ không
  
  // Actions
  startCall: (sessionId: string, appId: string, token: string) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMinimize: () => void;
  setMinimize: (val: boolean) => void;

  // Trạng thái từ hook Agora
  isConnected: boolean;
  error: string | null;
  localAudioTrack: IMicrophoneAudioTrack | null;
  localVideoTrack: ICameraVideoTrack | null;
  remoteUsers: RemoteUser[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
}

const VideoCallContext = createContext<VideoCallContextValue | null>(null);

export function VideoCallProvider({ children }: { children: ReactNode }) {
  const agora = useAgoraVideoCall();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const startCall = async (sessionId: string, appId: string, token: string) => {
    setActiveSessionId(sessionId);
    setIsMinimized(false);
    await agora.initAgora({ appId, channelName: sessionId, token });
  };

  const endCall = async () => {
    await agora.leaveCall();
    setActiveSessionId(null);
    setIsMinimized(false);
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);
  const setMinimize = (val: boolean) => setIsMinimized(val);

  return (
    <VideoCallContext.Provider
      value={{
        isActive: !!activeSessionId,
        sessionId: activeSessionId,
        isMinimized,
        startCall,
        endCall,
        toggleMinimize,
        setMinimize,
        ...agora,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
}

export function useVideoCallContext() {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error("useVideoCallContext must be used within a VideoCallProvider");
  }
  return context;
}
