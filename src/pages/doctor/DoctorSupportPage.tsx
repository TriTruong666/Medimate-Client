import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FiLogOut,
  FiLogIn,
  FiCheck,
  FiX,
  FiClock,
  FiActivity,
} from "react-icons/fi";

type ProgressState = "stop" | "active" | "pending" | "working";

export default function DoctorSupportPage() {
  const [progress, setProgress] = useState<ProgressState>("stop");

  return (
    <div className="flex min-h-[calc(100vh-100px)] w-full items-center justify-center overflow-hidden p-6 text-white">
      <AnimatePresence mode="wait">
        <div className="flex flex-1 items-center justify-center">
          {progress === "stop" && (
            <Begin key="stop" onStart={() => setProgress("active")} />
          )}
          {progress === "active" && (
            <ActiveShift
              key="active"
              onEnd={() => setProgress("stop")}
              onNewRequest={() => setProgress("pending")}
            />
          )}
          {progress === "pending" && (
            <PendingState
              key="pending"
              userName="Trường"
              onAccept={() => setProgress("working")}
              onDecline={() => setProgress("active")}
            />
          )}
          {progress === "working" && (
            <WorkingState key="working" onEnd={() => setProgress("active")} />
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}

function Begin({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-4 flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5">
        <div className="relative flex h-1 w-1">
          <div className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <div className="relative h-1 w-1 rounded-full bg-red-500" />
        </div>
        <span className="text-[9px] font-bold tracking-widest text-red-500 uppercase">
          Đang nghỉ
        </span>
      </div>
      <h1 className="mb-8 text-2xl font-medium tracking-tight">
        Sẵn sàng bắt đầu ca làm việc?
      </h1>

      <button
        onClick={onStart}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-[13px] font-semibold text-gray-300 transition-all hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-500 active:scale-95"
      >
        <FiLogIn size={14} />
        Bắt đầu công việc
      </button>
    </motion.div>
  );
}

function ActiveShift({
  onEnd,
  onNewRequest,
}: {
  onEnd: () => void;
  onNewRequest: () => void;
}) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      <div className="flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5">
          <div className="relative flex h-1 w-1">
            <div className="absolute h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <div className="relative h-1 w-1 rounded-full bg-green-500" />
          </div>
          <span className="text-[9px] font-bold tracking-widest text-green-500 uppercase">
            Đang hoạt động
          </span>
        </div>

        <div className="mb-1 font-mono text-3xl font-light tracking-tight text-white/90 tabular-nums">
          {formatTime(time)}
        </div>

        <h2 className="text-xl font-medium text-white/80">
          Đang tìm bệnh nhân cho bạn
        </h2>
        <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-gray-500">
          Hệ thống sẽ tự động thông báo kết nối khi có yêu cầu mới.
        </p>

        <button
          onClick={onNewRequest}
          className="mt-6 text-[9px] font-bold tracking-widest text-white/5 uppercase transition-colors hover:text-white/10"
        >
          (Simulate)
        </button>
      </div>

      <button
        onClick={onEnd}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-[13px] font-semibold text-gray-300 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 active:scale-95"
      >
        <FiLogOut size={14} />
        Kết thúc ca làm
      </button>
    </motion.div>
  );
}

function PendingState({
  onAccept,
  onDecline,
  userName = "Bệnh nhân",
}: {
  onAccept: () => void;
  onDecline: () => void;
  userName?: string;
}) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft === 0) {
      onDecline();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onDecline]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full flex-col items-center gap-8"
    >
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="relative h-14 w-14 shrink-0">
          <div className="text-md flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-white/20 to-white/5 font-semibold text-white">
            {userName.charAt(0)}
          </div>
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-white/90">
          Có yêu cầu hỗ trợ mới
        </h2>
        <p className="mt-2 text-[13px] text-gray-400">
          Bệnh nhân{" "}
          <span className="font-medium text-white/70">"{userName}"</span> đang
          chờ
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-lg font-light text-white tabular-nums">
          <span className="text-sm">
            Còn lại: <span className="font-bold">{timeLeft}s</span>
          </span>
        </div>
        <div className="h-0.5 w-48 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 60, ease: "linear" }}
            className="bg-primary h-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onDecline}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-[13px] font-semibold text-gray-400 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-500 active:scale-95"
        >
          <FiX size={16} />
          Từ chối
        </button>
        <button
          onClick={onAccept}
          className="flex items-center gap-2 rounded-full bg-white px-8 py-2.5 text-[13px] font-semibold text-black shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all hover:scale-105 hover:bg-neutral-200 active:scale-95"
        >
          <FiCheck size={16} />
          Chấp nhận
        </button>
      </div>

      <p className="text-[9px] font-medium tracking-[0.2em] text-gray-600 uppercase">
        Tự động từ chối sau 60 giây
      </p>
    </motion.div>
  );
}

function WorkingState({ onEnd }: { onEnd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-primary absolute inset-0 rounded-full"
        />
        <div className="bg-primary/10 text-primary relative flex h-12 w-12 items-center justify-center rounded-full">
          <FiActivity size={24} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-medium text-white/90">
          Đang trong cuộc tư vấn
        </h2>
        <p className="mt-2 text-[13px] text-gray-500">
          Bác sĩ đang kết nối trực tiếp với bệnh nhân
        </p>
      </div>

      <button
        onClick={onEnd}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-[13px] font-semibold text-gray-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
      >
        Rời khỏi cuộc hội thoại
      </button>
    </motion.div>
  );
}
