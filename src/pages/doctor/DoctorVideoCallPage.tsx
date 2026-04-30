import { useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  useJoinConsultationSession,
  useEndConsultationSession,
} from "@/hooks/data/useSessionHooks";
import { getVideoCallToken } from "@/apis/session.service";
import { useVideoCallContext } from "@/contexts/VideoCallContext";
import { VideoPlayer } from "@/components/agora/VideoPlayer";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMinimize2,
} from "react-icons/fi";
import { toast } from "@/hooks/useToast";
import { Spinner } from "@/components/custom-ui/Spinner";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { useState } from "react";

export default function DoctorVideoCallPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const hasJoinedBeRef = useRef(false);
  const isIntentionalLeaveRef = useRef(false);

  const { mutateAsync: joinSession } = useJoinConsultationSession();
  const { mutateAsync: completeSession } = useEndConsultationSession();

  const appId = import.meta.env.VITE_AGORA_APP_ID;

  // 1. Fetch Token first
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

  const token =
    typeof tokenRes?.data === "string" ? tokenRes.data : tokenRes?.data?.token;

  const {
    isActive,
    startCall,
    leaveChannel,
    setMinimize,
    isConnected,
    error: agoraError,
    localVideoTrack,
    remoteUsers,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
  } = useVideoCallContext();

  // Dùng ref để tránh joinSession thay đổi identity gây re-trigger effect
  const joinSessionRef = useRef(joinSession);
  joinSessionRef.current = joinSession;

  // Khi token sẵn sàng + appId + sessionId, nếu chưa active thì startCall
  useEffect(() => {
    if (!token || !appId || !sessionId || isActive || isIntentionalLeaveRef.current) return;

    let unmounted = false;

    const startConnection = async () => {
      try {
        if (!hasJoinedBeRef.current) {
          hasJoinedBeRef.current = true;
          await joinSessionRef.current(sessionId);
        }
        if (unmounted) return;
        await startCall(sessionId, appId, token);
      } catch (e) {
        console.error("[VideoCall] Lỗi khi join:", e);
      }
    };

    startConnection();

    return () => {
      unmounted = true;
    };
  }, [token, appId, sessionId, isActive, startCall]);

  // Luôn maximize khi trang này mount; tự động minimize khi unmount (chuyển tab)
  useEffect(() => {
    setMinimize(false);
    return () => {
      setMinimize(true);
    };
  }, [setMinimize]);

  const [showConfirmLeave, setShowConfirmLeave] = useState(false);

  const handleLeaveCall = async () => {
    setShowConfirmLeave(true);
  };

  const confirmLeaveCall = async () => {
    try {
      isIntentionalLeaveRef.current = true;
      // Dùng leaveChannel() để rời Agora channel và dọn track
      await leaveChannel();
      toast.success("Đã ngắt kết nối", "Bạn đã ngắt kết nối cuộc gọi video.");
      navigate("/dashboard/doctor-support", { replace: true });
    } catch (err) {
      toast.error("Lỗi", "Không thể thoát bình thường, có thể đã mất kết nối.");
      navigate("/dashboard/doctor-support", { replace: true });
    }
  };

  const handleMinimize = () => {
    setMinimize(true);
    navigate("/dashboard/doctor-support");
  };

  if (!appId) {
    return (
      <div className="flex h-screen items-center justify-center p-8 text-center">
        <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-6 text-rose-500">
          <h2 className="text-xl font-bold">Lỗi cấu hình Cụm Agora (Thiếu cấu hình VITE_AGORA_APP_ID)</h2>
          <p className="mt-2 text-sm text-gray-300">
            Vui lòng thêm VITE_AGORA_APP_ID vào file .env của hệ thống.
          </p>
        </div>
      </div>
    );
  }

  if (fetchingToken) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-400">Đang chuẩn bị vào phòng Video...</p>
      </div>
    );
  }

  if (tokenError || (tokenRes && !tokenRes.success)) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-bold text-rose-500">Kết nối thất bại</h2>
        <p className="text-gray-400">Server từ chối cung cấp Token Agora.</p>
        <button
          onClick={() => navigate("/dashboard/doctor-support")}
          className="mt-4 rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Trở về trang trước
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-100px)] w-full flex-col overflow-hidden rounded-2xl bg-[#0f1014] text-white">
      {/* Top Header Room */}
      <div className="absolute top-0 right-0 left-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <div>
          <h1 className="text-lg font-medium text-white/90">
            Phòng khám trực tuyến
          </h1>
          <p className="text-xs text-emerald-400 font-medium">
            {isConnected ? "Đã kết nối an toàn" : "Đang khởi tạo kết nối..."}
          </p>
        </div>
      </div>

      {agoraError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium shadow-xl">
          Error: {agoraError}
        </div>
      )}

      {/* Main Video Area */}
      <div className="relative flex-1 overflow-hidden bg-[#111]">
        {remoteUsers.length > 0 ? (
          <div className={`flex h-full items-center justify-center ${remoteUsers.length > 1 ? 'flex-wrap gap-4 p-4' : ''
            }`}>
            {remoteUsers.map((user) => (
              <div
                key={user.uid}
                className={`relative overflow-hidden rounded-2xl ${remoteUsers.length === 1
                    ? "h-full w-full max-h-[70vh] mx-auto"
                    : "h-[45%] w-full border border-white/5 shadow-2xl sm:w-[48%]"
                  }`}
              >
                <VideoPlayer
                  videoTrack={user.videoTrack}
                  className="h-full w-full object-contain"
                />
                <div className="absolute bottom-4 left-4 rounded bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  {remoteUsers.length > 1 ? `Đối tác tham gia (${user.uid})` : "Thành viên"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gray-900/50">
            <div className="mb-4 rounded-full bg-white/5 p-6 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <div className="text-white/20">
                <Spinner size="lg" />
              </div>
            </div>
            <p className="text-lg font-medium text-gray-300">
              Chờ thiết lập kết nối hiển thị...
            </p>
          </div>
        )}

        {/* Local Doctor Video Mini Player */}
        <div className="absolute bottom-6 right-6 z-40 aspect-video w-[250px] overflow-hidden rounded-xl bg-gray-900 shadow-2xl ring-2 ring-white/10 transition-transform hover:scale-105 sm:w-[320px]">
          {localVideoTrack && isVideoEnabled ? (
            <VideoPlayer
              videoTrack={localVideoTrack}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-800">
              <FiVideoOff className="text-3xl text-gray-500" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            Bạn (Bác Sĩ)
          </div>
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="z-50 flex items-center justify-center gap-6 bg-gradient-to-t from-black/90 pb-6 pt-10 to-transparent">
        {/* Toggle Audio */}
        <button
          onClick={toggleAudio}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${isAudioEnabled
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
            }`}
        >
          {isAudioEnabled ? (
            <FiMic className="text-xl" />
          ) : (
            <FiMicOff className="text-xl" />
          )}
        </button>

        {/* Minimize Call */}
        <button
          onClick={handleMinimize}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/20 text-blue-500 transition-all duration-300 hover:bg-blue-500/30"
          title="Thu nhỏ cửa sổ"
        >
          <FiMinimize2 className="text-xl" />
        </button>

        {/* Leave Call */}
        <button
          onClick={handleLeaveCall}
          className="group flex h-16 w-16 items-center justify-center rounded-full bg-rose-600 font-bold shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-700 hover:shadow-rose-600/50"
          title="Kết thúc cuộc gọi"
        >
          <FiPhoneOff className="text-2xl text-white transition-transform group-hover:rotate-12" />
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleVideo}
          className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 ${isVideoEnabled
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30"
            }`}
        >
          {isVideoEnabled ? (
            <FiVideo className="text-xl" />
          ) : (
            <FiVideoOff className="text-xl" />
          )}
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
    </div>
  );
}
