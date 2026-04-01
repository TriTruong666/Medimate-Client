import { useState, useEffect, useCallback, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

export interface RemoteUser {
  uid: string | number;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
}

interface UseAgoraVideoCallProps {
  appId: string;
  channelName: string;
  token: string;
  uid?: number;
}

export function useAgoraVideoCall({
  appId,
  channelName,
  token,
  uid = 0,
}: UseAgoraVideoCallProps) {
  const [localAudioTrack, setLocalAudioTrack] =
    useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const isJoiningRef = useRef(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<ICameraVideoTrack | null>(null);

  const initAgora = useCallback(async () => {
    if (isJoiningRef.current || clientRef.current) return;

    try {
      isJoiningRef.current = true;
      setError(null);

      // Disable Agora telemetry to prevent statscollector errors
      AgoraRTC.disableLogUpload();

      // Create Agora client
      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = agoraClient;

      // Listen for remote users
      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        
        setRemoteUsers((prev) => {
          const existingUser = prev.find((u) => u.uid === user.uid);
          if (existingUser) {
            return prev.map((u) => {
              if (u.uid === user.uid) {
                return {
                  ...u,
                  videoTrack:
                    mediaType === "video"
                      ? user.videoTrack || u.videoTrack
                      : u.videoTrack,
                  audioTrack:
                    mediaType === "audio"
                      ? user.audioTrack || u.audioTrack
                      : u.audioTrack,
                };
              }
              return u;
            });
          }
          return [
            ...prev,
            {
              uid: user.uid,
              videoTrack: mediaType === "video" ? user.videoTrack : undefined,
              audioTrack: mediaType === "audio" ? user.audioTrack : undefined,
            },
          ];
        });

        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.stop();
        }

        setRemoteUsers((prev) => {
          return prev.map((u) => {
            if (u.uid === user.uid) {
              return {
                ...u,
                videoTrack: mediaType === "video" ? undefined : u.videoTrack,
                audioTrack: mediaType === "audio" ? undefined : u.audioTrack,
              };
            }
            return u;
          });
        });
      });

      agoraClient.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // Join channel
      await agoraClient.join(appId, channelName, token, uid);
      
      // Request local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      localAudioRef.current = audioTrack;
      localVideoRef.current = videoTrack;
      
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      await agoraClient.publish([audioTrack, videoTrack]);
      setIsConnected(true);

    } catch (err: any) {
      console.error("Agora Error:", err);
      setError(err.message || "Failed to connect to Agora.");
    } finally {
      isJoiningRef.current = false;
    }
  }, [appId, channelName, token, uid]);

  const leaveCall = useCallback(async () => {
    isJoiningRef.current = false;
    
    if (localAudioRef.current) {
      localAudioRef.current.stop();
      localAudioRef.current.close();
      localAudioRef.current = null;
    }
    setLocalAudioTrack(null);
    
    if (localVideoRef.current) {
      localVideoRef.current.stop();
      localVideoRef.current.close();
      localVideoRef.current = null;
    }
    setLocalVideoTrack(null);
    
    setRemoteUsers([]);
    
    if (clientRef.current) {
      // Must leave async to avoid PeerConnection state issues
      await clientRef.current.leave();
      clientRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [localAudioTrack, isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localVideoTrack, isVideoEnabled]);

  useEffect(() => {
    // Component unmount cleanup
    return () => {
      leaveCall();
    };
  }, [leaveCall]);

  return {
    initAgora,
    leaveCall,
    isConnected,
    error,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  };
}
