import { useState, useCallback, useRef, useEffect } from "react";
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

export interface InitAgoraParams {
  appId: string;
  channelName: string;
  token: string;
  uid?: number;
}

export function useAgoraVideoCall() {
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack]  = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers]          = useState<RemoteUser[]>([]);
  const [isConnected, setIsConnected]          = useState(false);
  const [error, setError]                      = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled]    = useState(true);
  const [isVideoEnabled, setIsVideoEnabled]    = useState(true);

  const isJoiningRef = useRef(false);
  const isLeavingRef = useRef(false);
  const clientRef    = useRef<IAgoraRTCClient | null>(null);
  const localAudioRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef  = useRef<ICameraVideoTrack | null>(null);

  // ── initAgora: nhận params trực tiếp — không phụ thuộc hook props ──────────
  const initAgora = useCallback(async ({ appId, channelName, token, uid = 0 }: InitAgoraParams) => {
    if (isJoiningRef.current || clientRef.current || isLeavingRef.current) return;

    try {
      isJoiningRef.current = true;
      setError(null);
      AgoraRTC.disableLogUpload();

      const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = agoraClient;

      agoraClient.on("user-published", async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);
        setRemoteUsers((prev) => {
          const existing = prev.find((u) => u.uid === user.uid);
          if (existing) {
            return prev.map((u) =>
              u.uid === user.uid
                ? {
                    ...u,
                    videoTrack: mediaType === "video" ? user.videoTrack ?? u.videoTrack : u.videoTrack,
                    audioTrack: mediaType === "audio" ? user.audioTrack ?? u.audioTrack : u.audioTrack,
                  }
                : u,
            );
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
        if (mediaType === "audio" && user.audioTrack) user.audioTrack.play();
      });

      agoraClient.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio" && user.audioTrack) user.audioTrack.stop();
        setRemoteUsers((prev) =>
          prev.map((u) =>
            u.uid === user.uid
              ? {
                  ...u,
                  videoTrack: mediaType === "video" ? undefined : u.videoTrack,
                  audioTrack: mediaType === "audio" ? undefined : u.audioTrack,
                }
              : u,
          ),
        );
      });

      agoraClient.on("user-left", (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await agoraClient.join(appId, channelName, token, uid);

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      localAudioRef.current = audioTrack;
      localVideoRef.current  = videoTrack;
      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);

      await agoraClient.publish([audioTrack, videoTrack]);
      setIsConnected(true);
    } catch (err: any) {
      console.error("[Agora] initAgora error:", err);
      setError(err?.message || "Failed to connect to Agora.");
      clientRef.current = null;
    } finally {
      isJoiningRef.current = false;
    }
  }, []);

  // ── leaveCall: idempotent ──────────────────────────────────────────────────
  const leaveCall = useCallback(async () => {
    if (isLeavingRef.current) return;
    if (!clientRef.current && !localAudioRef.current && !localVideoRef.current) return;

    isLeavingRef.current = true;
    isJoiningRef.current = false;

    try {
      if (localAudioRef.current) {
        try { localAudioRef.current.stop(); localAudioRef.current.close(); } catch { /* ignore */ }
        localAudioRef.current = null;
      }
      setLocalAudioTrack(null);

      if (localVideoRef.current) {
        try { localVideoRef.current.stop(); localVideoRef.current.close(); } catch { /* ignore */ }
        localVideoRef.current = null;
      }
      setLocalVideoTrack(null);
      setRemoteUsers([]);

      if (clientRef.current) {
        try { await clientRef.current.leave(); } catch { /* ignore */ }
        clientRef.current = null;
      }

      setIsConnected(false);
    } finally {
      isLeavingRef.current = false;
    }
  }, []);

  // ── Toggles ────────────────────────────────────────────────────────────────
  const toggleAudio = useCallback(async () => {
    const track = localAudioRef.current;
    if (!track) return;
    const next = !isAudioEnabled;
    try { await track.setEnabled(next); setIsAudioEnabled(next); } catch { /* ignore */ }
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    const track = localVideoRef.current;
    if (!track) return;
    const next = !isVideoEnabled;
    try { await track.setEnabled(next); setIsVideoEnabled(next); } catch { /* ignore */ }
  }, [isVideoEnabled]);

  // ── Resume tracks khi quay lại tab ────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !clientRef.current) return;
      if (localAudioRef.current && isAudioEnabled) localAudioRef.current.setEnabled(true).catch(() => {});
      if (localVideoRef.current  && isVideoEnabled) localVideoRef.current.setEnabled(true).catch(() => {});
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAudioEnabled, isVideoEnabled]);

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
