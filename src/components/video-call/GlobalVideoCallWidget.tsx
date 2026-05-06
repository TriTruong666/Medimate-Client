import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useJoinConsultationSession,
  useEndConsultationSession,
  useRequestEndConsultationSession,
} from "@/hooks/data/useSessionHooks";
import { getVideoCallToken, uploadRecording } from "@/apis/session.service";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { globalSignalRConnection } from "@/hooks/useSignalR";
import { VideoPlayer } from "@/components/agora/VideoPlayer";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMaximize2,
  FiMinimize2,
  FiMonitor,
  FiStopCircle,
  FiCheckSquare,
  FiClock,
} from "react-icons/fi";
import { toast } from "@/hooks/useToast";
import { Spinner } from "@/components/custom-ui/Spinner";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalVideoCallWidget() {
  const videoAreaRef = useRef<HTMLDivElement>(null);
  const isIntentionalLeaveRef = useRef(false);

  const { mutateAsync: requestEndSession, isPending: isRequestingEnd } = useRequestEndConsultationSession();
  const appId = import.meta.env.VITE_AGORA_APP_ID;

  // States ghi hình
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  
  // Timer session
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [timeoutWarningShown, setTimeoutWarningShown] = useState(false);

  const {
    isActive,
    sessionId,
    isMinimized,
    leaveChannel,
    toggleMinimize,
    isConnected,
    error: agoraError,
    localAudioTrack,
    localVideoTrack,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = useVideoCallContext();

  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [showConfirmRequestEnd, setShowConfirmRequestEnd] = useState(false);

  const handleRequestEnd = () => {
    if (sessionId) {
      setShowConfirmRequestEnd(true);
    }
  };

  const confirmRequestEnd = async () => {
    try {
      await requestEndSession(sessionId!);
      toast.success("Đã gửi yêu cầu", "Yêu cầu kết thúc phiên khám đã được gửi tới bệnh nhân.");
    } catch (e: any) {
      toast.error("Lỗi", e.message || "Không thể gửi yêu cầu kết thúc");
    }
  };

  const handleLeaveCall = async () => {
    setShowConfirmLeave(true);
  };

  const confirmLeaveCall = async () => {
    try {
      isIntentionalLeaveRef.current = true;
      await leaveChannel();
      toast.success("Đã ngắt kết nối", "Bạn đã ngắt kết nối cuộc gọi video.");
    } catch (err) {
      toast.error("Lỗi", "Không thể thoát bình thường, có thể đã mất kết nối.");
    }
  };

  const stopAndUploadRecording = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve();
        return;
      }
      const originalOnStop = recorder.onstop;
      recorder.onstop = async (ev) => {
        if (originalOnStop) (originalOnStop as any)(ev);
        resolve();
      };
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    });
  }, []);

  const startScreenRecording = async () => {
    try {
      if (videoAreaRef.current && document.fullscreenElement !== videoAreaRef.current) {
        await videoAreaRef.current.requestFullscreen();
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: "browser",
          // @ts-ignore
          preferCurrentTab: true 
        } as any,
        audio: {
          // @ts-ignore
          echoCancellation: true,
          noiseSuppression: true
        } as any,
      });

      let finalStream = stream;

      // AUDIO MIXING: Trộn mic bác sĩ vào system audio (tiếng bệnh nhân)
      if (localAudioTrack) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const dest = audioCtx.createMediaStreamDestination();
        
        // Bệnh nhân (System Audio từ getDisplayMedia)
        if (stream.getAudioTracks().length > 0) {
          const systemSource = audioCtx.createMediaStreamSource(new MediaStream([stream.getAudioTracks()[0]]));
          systemSource.connect(dest);
        }

        // Bác sĩ (Microphone Track)
        const micStreamTrack = localAudioTrack.getMediaStreamTrack();
        if (micStreamTrack) {
          const micSource = audioCtx.createMediaStreamSource(new MediaStream([micStreamTrack]));
          micSource.connect(dest);
        }

        const mixedAudioTrack = dest.stream.getAudioTracks()[0];
        finalStream = new MediaStream([stream.getVideoTracks()[0], mixedAudioTrack]);
      }

      const handleFullscreenChange = () => {
        if (!document.fullscreenElement && mediaRecorderRef.current?.state !== "inactive") {
          // Trình duyệt thoát Fullscreen
        }
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);

      const recorder = new MediaRecorder(finalStream, { mimeType: "video/webm; codecs=vp9" });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setIsUploadingRecording(true);
        toast.info("Đang xử lý...", "Đang tải video phiên khám lên hệ thống...");
        try {
          await uploadRecording(sessionId!, blob);
          toast.success("Thành công", "Đã lưu video phiên khám vào hệ thống!");
        } catch (err) {
          toast.error("Lỗi Upload", "Không thể tải video lên Cloudinary.");
        } finally {
          setIsUploadingRecording(false);
        }
      };

      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast.success("Bắt đầu ghi hình", "Nhớ tick 'Share tab audio' để thu được tiếng bệnh nhân nhé!");
    } catch (e) {
      toast.error("Ghi hình thất bại", "Bạn cần cấp quyền chia sẻ tab trình duyệt để ghi hình.");
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  // SignalR Auto-end
  useEffect(() => {
    const connection = globalSignalRConnection;
    if (!connection || !sessionId) return;

    const handleNotification = async (notif: any) => {
      if (notif?.referenceId?.toLowerCase() !== sessionId.toLowerCase()) return;
      if (notif?.type === "SESSION_STARTED" && notif?.endTime) {
        setSessionEndTime(new Date(notif.endTime));
      }
      if (notif?.type === "SESSION_ENDED" || notif?.type === "SESSION_TIMEOUT") {
        toast.info("Phiên tư vấn kết thúc", "Hệ thống hoặc đối tác đã kết thúc phiên khám.");
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          toast.info("Đang lưu video...", "Đang xử lý và tải lên video phiên khám...");
          await stopAndUploadRecording();
        }
        isIntentionalLeaveRef.current = true;
        leaveChannel().catch(console.error);
      }
    };

    connection.on("ReceiveNotification", handleNotification);
    return () => {
      connection.off("ReceiveNotification", handleNotification);
    };
  }, [sessionId, leaveChannel, stopAndUploadRecording]);

  // Timer: 5 mins warning
  useEffect(() => {
    if (!sessionEndTime || !isRecording) return;
    const interval = setInterval(() => {
      const now = new Date();
      const msLeft = sessionEndTime.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (msLeft <= fiveMinutes && msLeft > 0 && !timeoutWarningShown) {
        setTimeoutWarningShown(true);
        clearInterval(interval);
        toast.warn("Sắp hết giờ", "Còn dưới 5 phút! Hệ thống tự động dừng và lưu video phiên khám.");
        void stopAndUploadRecording();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [sessionEndTime, isRecording, timeoutWarningShown, stopAndUploadRecording]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={videoAreaRef}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={
          isMinimized
            ? { opacity: 1, y: 0, scale: 1, bottom: 24, right: 24, width: 320, height: 240, position: "fixed" }
            : { opacity: 1, y: 0, scale: 1, inset: 0, width: "100vw", height: "100vh", position: "fixed" }
        }
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
        className={`z-[9999] overflow-hidden rounded-2xl bg-[#0f1014] text-white shadow-2xl ring-1 ring-white/10 ${
          isMinimized ? "cursor-move" : ""
        }`}
        style={isMinimized ? { zIndex: 9999 } : { zIndex: 9999 }}
      >
        {/* Header */}
        <div className={`absolute top-0 right-0 left-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent ${isMinimized ? 'p-2' : 'p-4'}`}>
          {!isMinimized && (
            <div>
              <h1 className="text-lg font-medium text-white/90">Phòng khám trực tuyến</h1>
              <p className="text-xs text-emerald-400 font-medium">
                {isConnected ? "Đã kết nối an toàn" : "Đang khởi tạo kết nối..."}
              </p>
            </div>
          )}
          
          <div className="flex gap-2 ml-auto">
            {isRecording && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/20 px-2 py-1 border border-rose-500/50 text-rose-400 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                {!isMinimized && <span className="text-xs font-medium">Đang Ghi</span>}
              </div>
            )}
            <button
              onClick={toggleMinimize}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMinimized ? <FiMaximize2 size={16} /> : <FiMinimize2 size={18} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {agoraError && !isMinimized && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium shadow-xl">
            Error: {agoraError}
          </div>
        )}

        {/* Main Video */}
        <div className="relative flex-1 h-full w-full bg-[#111]">
          {remoteUsers.length > 0 ? (
            <div className={`flex h-full w-full items-center justify-center ${remoteUsers.length > 1 && !isMinimized ? 'flex-wrap gap-4 p-4' : ''}`}>
              {remoteUsers.map((user) => (
                <div
                  key={user.uid}
                  className={`relative overflow-hidden w-full h-full ${
                    remoteUsers.length === 1 || isMinimized
                      ? "rounded-none"
                      : "rounded-2xl border border-white/5 shadow-2xl sm:w-[48%] h-[45%]"
                  }`}
                >
                  <VideoPlayer videoTrack={user.videoTrack} className="h-full w-full object-contain" />
                  {!isMinimized && (
                    <div className="absolute bottom-20 left-4 rounded bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      {remoteUsers.length > 1 ? `Đối tác (${user.uid})` : "Thành viên"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gray-900/50">
              <Spinner size={isMinimized ? "sm" : "lg"} />
              {!isMinimized && <p className="mt-4 text-gray-400">Chờ thiết lập kết nối...</p>}
            </div>
          )}

          {/* Local Video Mini */}
          <div className={`absolute z-40 overflow-hidden bg-gray-900 shadow-2xl ring-1 ring-white/20 transition-transform ${
            isMinimized 
              ? "bottom-2 right-2 w-20 aspect-video rounded-lg" 
              : "bottom-24 right-6 w-[250px] sm:w-[320px] aspect-video rounded-xl hover:scale-105"
          }`}>
            {localVideoTrack && isVideoEnabled ? (
              <VideoPlayer videoTrack={localVideoTrack} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-800">
                <FiVideoOff className={isMinimized ? "text-lg text-gray-500" : "text-3xl text-gray-500"} />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        {!isMinimized && (
          <div className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-6 bg-gradient-to-t from-black/90 pb-6 pt-10 to-transparent">
            <button
              onClick={toggleAudio}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isAudioEnabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"}`}
            >
              {isAudioEnabled ? <FiMic size={18} /> : <FiMicOff size={18} />}
            </button>
            <button
              onClick={toggleVideo}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isVideoEnabled ? "bg-white/10 text-white hover:bg-white/20" : "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"}`}
            >
              {isVideoEnabled ? <FiVideo size={18} /> : <FiVideoOff size={18} />}
            </button>
            <button
              onClick={handleRequestEnd}
              disabled={isRequestingEnd}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
              title="Yêu cầu kết thúc phiên"
            >
              <FiCheckSquare size={18} />
            </button>
            <button
              onClick={isRecording ? stopScreenRecording : startScreenRecording}
              disabled={isUploadingRecording}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                isRecording ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50" : isUploadingRecording ? "bg-gray-500/20 text-gray-400 opacity-50" : "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30"
              }`}
              title={isRecording ? "Dừng ghi hình" : isUploadingRecording ? "Đang upload video..." : "Ghi hình phiên khám"}
            >
              {isUploadingRecording ? <Spinner size="sm" /> : isRecording ? <FiStopCircle size={18} /> : <FiMonitor size={18} />}
            </button>
            <button
              onClick={handleLeaveCall}
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 font-bold shadow-lg shadow-rose-600/30 hover:bg-rose-700 hover:shadow-rose-600/50"
              title="Kết thúc cuộc gọi"
            >
              <FiPhoneOff className="text-xl text-white transition-transform group-hover:rotate-12" />
            </button>
          </div>
        )}

        <ConfirmModal
          open={showConfirmLeave}
          title="Rời khỏi phòng khám trực tuyến"
          message="Bạn có chắc chắn muốn rời khỏi cuộc gọi video này không? Bệnh nhân vẫn có thể đợi trong phòng."
          confirmText="Rời cuộc gọi"
          confirmButtonType="danger"
          onConfirm={() => {
            setShowConfirmLeave(false);
            void confirmLeaveCall();
          }}
          onCancel={() => setShowConfirmLeave(false)}
        />
        <ConfirmModal
          open={showConfirmRequestEnd}
          title="Yêu cầu kết thúc phiên khám"
          message="Bạn có chắc chắn muốn kết thúc phiên khám này? Hệ thống sẽ gửi yêu cầu xác nhận đến bệnh nhân."
          confirmText="Gửi yêu cầu"
          confirmButtonType="success"
          onConfirm={() => {
            setShowConfirmRequestEnd(false);
            void confirmRequestEnd();
          }}
          onCancel={() => setShowConfirmRequestEnd(false)}
          isLoading={isRequestingEnd}
        />
      </motion.div>
    </AnimatePresence>
  );
}
