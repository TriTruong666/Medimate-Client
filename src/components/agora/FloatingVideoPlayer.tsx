import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { toast } from "@/hooks/useToast";
import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { FiMaximize2, FiMic, FiMicOff, FiPhoneOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from "./VideoPlayer";

// Kích thước PIP cố định
const PIP_W = 320;
const PIP_H = 220;
// Vị trí mặc định: góc dưới bên phải
const DEFAULT_X = typeof window !== "undefined" ? window.innerWidth - PIP_W - 20 : 0;
const DEFAULT_Y = typeof window !== "undefined" ? window.innerHeight - PIP_H - 96 : 0;

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

  // Motion values cho vị trí tuyệt đối (thay thế fixed + bottom/right)
  const x = useMotionValue(DEFAULT_X);
  const y = useMotionValue(DEFAULT_Y);

  // Reset vị trí về mặc định mỗi khi minimize lại
  useEffect(() => {
    if (isMinimized) {
      x.set(DEFAULT_X);
      y.set(DEFAULT_Y);
    }
  }, [isMinimized, x, y]);

  if (!isActive || !isMinimized) return null;

  const handleMaximize = () => {
    setMinimize(false);
    navigate(`/dashboard/video-call/${sessionId}`);
  };

  const activeRemoteUser = remoteUsers[0];

  // Constraint tính theo kích thước cửa sổ hiện tại (tính lại mỗi lần render)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dragConstraints = {
    left: 0,
    top: 0,
    right: vw - PIP_W,
    bottom: vh - PIP_H,
  };

  return (
    <motion.div
      key={`pip-${sessionId}`}
      drag
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      style={{
        x,
        y,
        position: "fixed",
        top: 0,
        left: 0,
        width: PIP_W,
        height: PIP_H,
        zIndex: 9999,
      }}
      whileTap={{ scale: 0.98 }}
      className="flex cursor-move flex-col overflow-hidden rounded-2xl bg-gray-900 shadow-2xl ring-1 ring-white/20"
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
  );
}
