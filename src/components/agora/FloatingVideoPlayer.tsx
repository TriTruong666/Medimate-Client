import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { toast } from "@/hooks/useToast";
import { motion } from "framer-motion";
import { useRef } from "react";
import { FiMaximize2, FiMic, FiMicOff, FiPhoneOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from "./VideoPlayer";

export function FloatingVideoPlayer() {
  const {
    isActive,
    isMinimized,
    sessionId,
    localVideoTrack,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    endCall,
    setMinimize,
  } = useVideoCallContext();

  const navigate = useNavigate();
  // Ref bao phủ toàn viewport — dùng làm vùng constraint cho kéo thả
  const constraintRef = useRef<HTMLDivElement>(null);

  if (!isActive || !isMinimized) return null;

  const handleMaximize = () => {
    setMinimize(false);
    navigate(`/dashboard/video-call/${sessionId}`);
  };

  const activeRemoteUser = remoteUsers[0];

  return (
    <>
      {/* Lớp phủ toàn màn hình làm vùng drag constraint, pointer-events-none để không chặn click */}
      <div ref={constraintRef} className="pointer-events-none fixed inset-0 z-40" />

      {/*
        key={sessionId} giúp force re-mount mỗi khi minimize/maximize,
        đặt lại vị trí drag về góc mặc định, tránh bị "kẹt" ở vị trí cũ.
        dragMomentum={false} + dragElastic={0} → kéo thả chắc tay, không bị trượt.
      */}
      <motion.div
        key={`pip-${sessionId}`}
        drag
        dragConstraints={constraintRef}
        dragElastic={0}
        dragMomentum={false}
        whileTap={{ scale: 0.98 }}
        className="fixed bottom-24 right-5 z-50 flex h-[220px] w-[320px] cursor-move flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl ring-1 ring-white/20"
      >
        {/* Khung hình Video */}
        <div className="relative flex-1 bg-black">
          {activeRemoteUser ? (
            <VideoPlayer videoTrack={activeRemoteUser.videoTrack} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400">
              Chờ người tham gia...
            </div>
          )}

          {/* Khung hình của mình (Mini local) */}
          {localVideoTrack && (
            <div className="absolute top-2 right-2 h-20 w-16 overflow-hidden rounded-lg shadow-lg ring-1 ring-white/20 bg-gray-800">
              {isVideoEnabled ? (
                <VideoPlayer videoTrack={localVideoTrack} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FiVideoOff className="text-xl text-gray-500" />
                </div>
              )}
            </div>
          )}

          {/* Nút phóng to / Quay lại phòng */}
          <button
            onClick={handleMaximize}
            className="absolute top-2 left-2 rounded-lg bg-black/60 p-1.5 text-white backdrop-blur-md transition hover:bg-black/80"
            title="Quay lại phòng"
          >
            <FiMaximize2 size={14} />
          </button>
        </div>

        {/* Control Bar */}
        <div className="flex h-12 flex-shrink-0 items-center justify-center gap-4 bg-gray-800">
          <button
            onClick={toggleAudio}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isAudioEnabled ? "bg-white/10 text-white" : "bg-rose-500/20 text-rose-500"
            } transition hover:bg-white/20`}
          >
            {isAudioEnabled ? <FiMic size={14} /> : <FiMicOff size={14} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              isVideoEnabled ? "bg-white/10 text-white" : "bg-rose-500/20 text-rose-500"
            } transition hover:bg-white/20`}
          >
            {isVideoEnabled ? <FiVideo size={14} /> : <FiVideoOff size={14} />}
          </button>

          <button
            onClick={async () => {
              await endCall();
              toast.success("Đã kết thúc", "Đã ngắt kết nối cuộc gọi video.");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700"
            title="Kết thúc gọi"
          >
            <FiPhoneOff size={14} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
