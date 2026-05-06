import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

import {
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
  FiMinimize2,
  FiMaximize2,
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
  const {
    isActive,
    sessionId,
    isMinimized,
    isExpanded,
    setMinimize,
    toggleExpanded,
    leaveChannel,
    isConnected,
    error: agoraError,
    localVideoTrack,
    localAudioTrack,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = useVideoCallContext();

  const videoAreaRef = useRef<HTMLDivElement>(null);
  const isIntentionalLeaveRef = useRef(false);

  const { mutateAsync: requestEndSession, isPending: isRequestingEnd } = useRequestEndConsultationSession();

  const appId = import.meta.env.VITE_AGORA_APP_ID;

  // States cho việc ghi hình thủ công tại trình duyệt
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploadingRecording, setIsUploadingRecording] = useState(false);
  // Thời điểm session sẽ kết thúc (để tính timer 5 phút)
  const [sessionEndTime, setSessionEndTime] = useState<Date | null>(null);
  const [timeoutWarningShown, setTimeoutWarningShown] = useState(false);

  // Fetch Token if sessionId exists
  const {
    data: tokenRes,
    isLoading: fetchingToken,
    isError: tokenError,
  } = useQuery({
    queryKey: ["video-call-token", sessionId],
    queryFn: () => getVideoCallToken(sessionId!),
    enabled: !!sessionId,
    retry: 1,
  });

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

  // Dừng ghi hình + chờ upload xong
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
      // 1. Xin quyền thu màn hình (bắt buộc share tab audio để có tiếng bệnh nhân)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
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

      // Kiểm tra xem user có share audio từ displayStream không
      const systemAudioTrack = displayStream.getAudioTracks()[0];
      if (!systemAudioTrack) {
        displayStream.getTracks().forEach(t => t.stop());
        toast.error("Lỗi ghi âm", "Vui lòng chọn 'Share Tab Audio' khi bắt đầu ghi hình để thu được tiếng bệnh nhân.");
        return;
      }

      // 2. Lấy Mic track của bác sĩ từ Agora localAudioTrack
      const micTrack = localAudioTrack?.getMediaStreamTrack();
      
      // 3. Audio Mixing bằng Web Audio API
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();
      
      // Mix system audio
      const systemSource = audioContext.createMediaStreamSource(new MediaStream([systemAudioTrack]));
      systemSource.connect(dest);
      
      // Mix mic audio
      if (micTrack) {
        const micSource = audioContext.createMediaStreamSource(new MediaStream([micTrack]));
        micSource.connect(dest);
      } else {
        toast.warn("Cảnh báo", "Không tìm thấy Micro của bạn, video sẽ chỉ có tiếng bệnh nhân.");
      }

      // 4. Gộp Video Track (màn hình) và Mixed Audio Track
      const mixedStream = new MediaStream([
        displayStream.getVideoTracks()[0],
        dest.stream.getAudioTracks()[0]
      ]);

      const recorder = new MediaRecorder(mixedStream, { mimeType: "video/webm; codecs=vp9" });
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        audioContext.close();
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

      displayStream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      toast.success("Bắt đầu ghi hình", "Hệ thống đang ghi hình và thu âm cả 2 chiều.");
    } catch (e) {
      toast.error("Ghi hình thất bại", "Bạn cần cấp quyền chia sẻ tab trình duyệt và âm thanh.");
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  // ── Auto-End Call when Session Ended via SignalR ──
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

  // ── Timer: Tự động dừng ghi hình 5 phút trước khi hết giờ ──
  useEffect(() => {
    if (!sessionEndTime || !isRecording) return;

    const interval = setInterval(() => {
      const now = new Date();
      const msLeft = sessionEndTime.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (msLeft <= fiveMinutes && msLeft > 0 && !timeoutWarningShown) {
        setTimeoutWarningShown(true);
        clearInterval(interval);
        toast.warn(
          "Sắp hết giờ",
          "Còn dưới 5 phút! Hệ thống tự động dừng và lưu video phiên khám."
        );
        void stopAndUploadRecording();
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [sessionEndTime, isRecording, timeoutWarningShown, stopAndUploadRecording]);

  // Nếu không có session active, không hiển thị gì cả
  if (!isActive) return null;

  if (fetchingToken) {
    return (
      <div className="fixed bottom-4 right-4 z-[999] flex h-40 w-64 items-center justify-center rounded-xl bg-gray-900 shadow-2xl text-white">
        <div className="flex flex-col items-center">
          <Spinner size="md" />
          <p className="mt-2 text-sm text-gray-400">Đang vào phòng...</p>
        </div>
      </div>
    );
  }

  // Chế độ thu nhỏ (Minimized)
  if (isMinimized) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-[999] overflow-hidden rounded-xl bg-gray-900 shadow-2xl ring-2 ring-white/10 w-[280px]"
      >
        <div className="relative aspect-video bg-black cursor-pointer" onClick={() => setMinimize(false)}>
          {remoteUsers.length > 0 ? (
            <VideoPlayer
              videoTrack={remoteUsers[0].videoTrack}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              Đang chờ bệnh nhân...
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setMinimize(false); }}
              className="flex h-6 w-6 items-center justify-center rounded bg-black/50 text-white hover:bg-white/20"
            >
              <FiMaximize2 className="text-xs" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleLeaveCall(); }}
              className="flex h-6 w-6 items-center justify-center rounded bg-rose-600 text-white hover:bg-rose-700"
            >
              <FiPhoneOff className="text-xs" />
            </button>
          </div>
        </div>
        <div className="bg-gray-800 p-2 flex justify-between items-center text-xs text-white">
          <span>Phiên khám đang diễn ra</span>
          {isRecording && <span className="text-rose-400 animate-pulse font-medium">● REC</span>}
        </div>
      </motion.div>
    );
  }

  // Chế độ mở rộng / toàn màn hình
  return (
    <AnimatePresence>
      <motion.div
        ref={videoAreaRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`fixed z-[998] flex flex-col overflow-hidden bg-[#0f1014] text-white transition-all duration-300 shadow-2xl ${
          isExpanded 
            ? "inset-0 rounded-none" 
            : "bottom-6 right-6 w-[800px] h-[500px] rounded-2xl ring-1 ring-white/10"
        }`}
      >
        {/* Top Header */}
        <div className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
          <div>
            <h1 className="text-lg font-medium text-white/90">
              Phòng khám trực tuyến
            </h1>
            <p className="text-xs text-emerald-400 font-medium">
              {isConnected ? "Đã kết nối" : "Đang khởi tạo..."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isRecording && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/20 px-3 py-1 border border-rose-500/50 text-rose-400 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <span className="text-xs font-medium">Đang Ghi Hình</span>
              </div>
            )}
            {isUploadingRecording && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1 border border-amber-500/50 text-amber-400">
                <Spinner size="sm" />
                <span className="text-xs font-medium">Đang Lưu Video...</span>
              </div>
            )}
            
            <button
              onClick={toggleExpanded}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              title={isExpanded ? "Thu nhỏ cửa sổ" : "Phóng to toàn màn hình"}
            >
              {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
            <button
              onClick={() => setMinimize(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              title="Thu nhỏ thành bong bóng"
            >
              <span className="mb-2">_</span>
            </button>
          </div>
        </div>

        {agoraError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium shadow-xl">
            Lỗi: {agoraError}
          </div>
        )}

        {/* Main Video Area */}
        <div className="relative flex-1 overflow-hidden bg-[#111]">
          {remoteUsers.length > 0 ? (
            <div className={`flex h-full items-center justify-center ${remoteUsers.length > 1 ? 'flex-wrap gap-4 p-4' : ''}`}>
              {remoteUsers.map((user) => (
                <div
                  key={user.uid}
                  className={`relative overflow-hidden rounded-2xl ${remoteUsers.length === 1
                      ? "h-full w-full mx-auto"
                      : "h-[45%] w-full border border-white/5 shadow-2xl sm:w-[48%]"
                    }`}
                >
                  <VideoPlayer
                    videoTrack={user.videoTrack}
                    className="h-full w-full object-contain"
                  />
                  <div className="absolute bottom-4 left-4 rounded bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                    Bệnh nhân
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gray-900/50">
              <div className="mb-4 rounded-full bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                <Spinner size="lg" />
              </div>
              <p className="text-lg font-medium text-gray-300">
                Chờ bệnh nhân kết nối...
              </p>
            </div>
          )}

          {/* Local Doctor Video Mini Player */}
          <div className="absolute bottom-20 right-6 z-40 aspect-video w-[200px] overflow-hidden rounded-xl bg-gray-900 shadow-2xl ring-2 ring-white/10 transition-transform hover:scale-105 sm:w-[240px]">
            {localVideoTrack && isVideoEnabled ? (
              <VideoPlayer
                videoTrack={localVideoTrack}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-800">
                <FiVideoOff className="text-2xl text-gray-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
              Bạn (Bác Sĩ)
            </div>
          </div>
        </div>

        {/* Bottom Controls Area */}
        <div className="z-50 flex items-center justify-center gap-4 bg-gradient-to-t from-black/90 p-4 to-transparent">
          <button
            onClick={toggleAudio}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isAudioEnabled
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
              }`}
          >
            {isAudioEnabled ? <FiMic className="text-lg" /> : <FiMicOff className="text-lg" />}
          </button>

          <button
            onClick={handleRequestEnd}
            disabled={isRequestingEnd}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 transition-all duration-300 hover:bg-emerald-500/30"
            title="Yêu cầu kết thúc phiên"
          >
            <FiCheckSquare className="text-lg" />
          </button>

          <button
            onClick={isRecording ? stopScreenRecording : startScreenRecording}
            disabled={isUploadingRecording}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50"
                : isUploadingRecording
                  ? "bg-gray-500/20 text-gray-400 opacity-50 cursor-not-allowed"
                  : "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
            }`}
            title={isRecording ? "Dừng ghi hình" : "Ghi hình phiên khám (Web Audio Mix)"}
          >
            {isUploadingRecording ? <Spinner size="sm" /> : isRecording ? <FiStopCircle className="text-lg" /> : <FiMonitor className="text-lg" />}
          </button>

          <button
            onClick={handleLeaveCall}
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-700 hover:shadow-rose-600/50 mx-2"
            title="Kết thúc cuộc gọi"
          >
            <FiPhoneOff className="text-xl text-white transition-transform group-hover:rotate-12" />
          </button>

          <button
            onClick={toggleVideo}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${isVideoEnabled
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
              }`}
          >
            {isVideoEnabled ? <FiVideo className="text-lg" /> : <FiVideoOff className="text-lg" />}
          </button>
        </div>

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
