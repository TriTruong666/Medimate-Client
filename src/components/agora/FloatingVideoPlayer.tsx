import { motion } from "framer-motion";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { VideoPlayer } from "./VideoPlayer";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMaximize2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEndConsultationSession } from "@/hooks/data/useSessionHooks";
import { toast } from "@/hooks/useToast";

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
  const { mutateAsync: completeSession } = useEndConsultationSession();

  if (!isActive || !isMinimized) return null;

  const handleMaximize = () => {
    setMinimize(false);
    navigate(`/dashboard/video-call/${sessionId}`);
  };

  const activeRemoteUser = remoteUsers[0]; // Chỉ hiển thị remote user đầu tiên trên PIP

  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 1000, top: -100, bottom: 800 }}
      dragElastic={0.1}
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
             if (sessionId) {
               try { await completeSession(sessionId); } catch (e) { console.warn("API End call failed:", e); }
             }
             await endCall();
             toast.success("Đã kết thúc", "Phiên tư vấn video đã hoàn thành.");
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
