import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import TextHighlighter from "@/components/animations-ui/TextHighlighter";
import VariableFontHoverByLetter from "@/components/animations-ui/VariableFontHoverByLetter";
import SplitText from "@/components/animations-ui/SplitText";
import Typewriter from "@/components/animations-ui/Typewriter";
import DotGrid from "@/components/animations-ui/DotGrid";
import { Spinner } from "@/components/custom-ui/Spinner";
import { toast } from "@/hooks/useToast";
import { getApiErrorMessage } from "@/common/api.error";
import {
  useChangeMyPassword,
  useDoctorMe,
  useSubmitDoctorMe,
  useActivateDoctor,
} from "@/hooks/data/useDoctorHooks";
import { useLogout } from "@/hooks/data/useAuthHooks";

const DEFAULT_OLD_PASSWORD =
  import.meta.env.VITE_DOCTOR_INITIAL_PASSWORD ?? "12345678aA@";

export default function DoctorWelcomePage() {
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "introduce" | "setup" | "complete" | "activate"
  >("welcome");

  const { data: doctorProfile } = useDoctorMe(true);

  const profileStep =
    doctorProfile?.status === "Verified"
      ? "activate"
      : doctorProfile?.status === "Pending"
        ? "complete"
        : null;

  const effectiveStep =
    currentStep === "welcome" && profileStep ? profileStep : currentStep;

  useEffect(() => {
    if (currentStep === "introduce") {
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black font-sans selection:bg-white/20 selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <DotGrid
          dotSize={5}
          gap={15}
          baseColor="#18181b"
          activeColor="#EC4899"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <AnimatePresence mode="wait">
        {effectiveStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(5px)",
              scale: 1.1,
              transition: { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] },
            }}
            className="min-h-screen w-full"
          >
            <WelcomeDoctorSection onStart={() => setCurrentStep("introduce")} />
          </motion.div>
        )}

        {effectiveStep === "introduce" && (
          <motion.div
            key="introduce"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-h-screen w-full"
          >
            <IntroduceSection onStart={() => setCurrentStep("setup")} />
          </motion.div>
        )}
        {effectiveStep === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-h-screen w-full"
          >
            <SetupLayout
              onStart={() => setCurrentStep("complete")}
              onBack={() => setCurrentStep("introduce")}
            />
          </motion.div>
        )}
        {effectiveStep === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-h-screen w-full"
          >
            <CompleteSection />
          </motion.div>
        )}
        {effectiveStep === "activate" && (
          <motion.div
            key="activate"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="min-h-screen w-full"
          >
            <ActivateSection doctorProfile={doctorProfile ?? null} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActivateSection({
  doctorProfile,
}: {
  doctorProfile: { doctorId?: string } | null;
}) {
  const [otp, setOtp] = useState("");
  const { mutateAsync: activateDoctor, isPending } = useActivateDoctor();

  const handleActivate = async () => {
    if (!otp || otp.length !== 6 || !doctorProfile?.doctorId) return;
    try {
      await activateDoctor({
        doctorId: doctorProfile.doctorId,
        verifyCode: Number(otp),
      });
      window.location.href = "/dashboard/doctor-support";
    } catch (error: unknown) {
      toast.error("Kích hoạt thất bại", getApiErrorMessage(error));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4 font-sans text-white antialiased">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex w-full max-w-md flex-col items-center space-y-8 rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Hồ sơ đã được duyệt!</h2>
          <p className="text-sm leading-relaxed text-neutral-400">
            Tài khoản của bạn đã được quản trị viên phê duyệt. Chúng tôi vừa gửi
            một mã <strong className="text-white">OTP 6 số</strong> đến email
            của bạn.
            <br />
            Hãy nhập mã đó vào đây để kích hoạt tài khoản.
          </p>
        </div>

        <div className="flex w-full flex-col items-center space-y-6">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
            className="focus:border-primary focus:ring-primary h-16 w-full rounded-xl border border-white/20 bg-black text-center font-mono text-3xl tracking-[1em] text-white placeholder-white/20 transition-all focus:ring-1 focus:outline-none"
            placeholder="000000"
          />

          <button
            onClick={handleActivate}
            disabled={isPending || otp.length !== 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold tracking-wide text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
          >
            {isPending ? (
              <Spinner size="sm" color="primary" />
            ) : (
              "Xác nhận Kích hoạt"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function CompleteSection() {
  const { mutateAsync: logoutAsync, isPending } = useLogout();

  const handleLogout = async () => {
    try {
      await logoutAsync();
      window.location.href = "/";
    } catch (error: unknown) {
      toast.error("Đăng xuất thất bại", getApiErrorMessage(error));
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden font-sans antialiased">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 flex flex-col items-center space-y-8"
      >
        {/* Creative Animation: Drawing circle and checkmark */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            className="-rotate-90"
          >
            <motion.circle
              cx="50"
              cy="50"
              r="46"
              stroke="#FFF"
              strokeWidth="1.5"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M5 13L9 17L19 7"
                stroke="#FFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut", delay: 1 }}
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <SplitText
            text="Cảm ơn bác sĩ đã tin tưởng Medimate!"
            className="text-center font-sans text-3xl font-light text-white uppercase md:text-4xl"
            delay={40}
            duration={1.2}
            ease="power4.out"
            splitType="words, chars"
            from={{ opacity: 0, y: 15 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            textAlign="center"
          />

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="flex flex-col items-center space-y-4"
          >
            <p className="max-w-200 text-center text-sm leading-relaxed font-light text-neutral-400 md:max-w-2xl md:text-base">
              Hồ sơ của bạn đang chờ để bộ phận kiểm định duyệt và sẽ sớm được
              kích hoạt. Chúng tôi sẽ thông báo kết quả qua email của bạn.
            </p>
          </motion.div>
        </div>
        <div onClick={handleLogout} className="cursor-pointer">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.6, duration: 0.6 }}
          >
            <button
              disabled={isPending}
              className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-transform duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {/* Shiny Shimmer Effect */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent" />

              {/* Glow behind */}
              <div className="absolute inset-0 -z-10 bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

              <span className="relative z-10 flex items-center gap-2">
                Quay lại trang chủ
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </span>

              {/* Internal Glow for Shimmer */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                  }
                `,
                }}
              />
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function WelcomeDoctorSection({ onStart }: { onStart: () => void }) {
  const [showButton, setShowButton] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full items-center">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-12 px-4 text-center">
        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div className="flex items-center space-x-3 opacity-80 transition-opacity hover:opacity-100">
                <img
                  src="/medimate-logo.svg"
                  alt="Medimate"
                  className="h-8 w-8"
                />
                <span className="text-sm font-medium tracking-[0.3em] text-white uppercase">
                  Medimate
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex w-full max-w-5xl flex-col items-center">
          <Typewriter
            text="Thắp sáng niềm tin từ những điều giản đơn nhất."
            speed={50}
            delay={600}
            className="text-center leading-[1.1] font-medium text-neutral-200 md:text-7xl"
            onComplete={() => setShowButton(true)}
            cursorChar="_"
            cursorClassName="text-primary opacity-70"
            showCursor
          />
        </div>

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <button
                onClick={onStart}
                className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                {/* Shiny Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent" />

                {/* Glow behind */}
                <div className="absolute inset-0 -z-10 bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

                <span className="relative z-10 flex items-center gap-2">
                  Bắt đầu khám phá
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </span>

                {/* Internal Glow for Shimmer */}
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                  }
                `,
                  }}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const BLOG_CONTENT = [
  {
    title: '1. Hoàn thiện "Hồ sơ số" chuyên nghiệp',
    description:
      "Trước khi bắt đầu nhận ca tư vấn đầu tiên, hãy dành 5 phút để tạo dựng uy tín trong mắt bệnh nhân:",
    features: [
      {
        subtitle: "Xác minh danh tính",
        detail:
          "Tải lên Chứng chỉ hành nghề (CCHN) và bằng cấp liên quan. Hệ thống sẽ phê duyệt trong vòng 24h.",
      },
      {
        subtitle: "Cập nhật chuyên khoa",
        detail:
          "Chọn đúng thế mạnh của mình (Nội khoa, Nhi khoa, Tim mạch...) để hệ thống điều phối đúng bệnh nhân cần hỗ trợ.",
      },
      {
        subtitle: "Lời giới thiệu",
        detail:
          "Một đoạn giới thiệu ngắn về kinh nghiệm sẽ giúp bệnh nhân yên tâm hơn khi chọn Bác sĩ.",
      },
    ],
  },
  {
    title: "2. Làm quen với Dashboard",
    description:
      "Giao diện Web Dashboard được tối ưu để Bác sĩ xử lý nhiều ca tư vấn cùng lúc mà không bị nhầm lẫn:",
    features: [
      {
        subtitle: "Sidebar (Thanh bên)",
        detail:
          "Nơi chuyển đổi giữa Danh sách bệnh nhân, Lịch sử tư vấn và Báo cáo thu nhập.",
      },
      {
        subtitle: "Trung tâm thông báo",
        detail:
          "Tiếng chuông báo hiệu khi có bệnh nhân đang chờ hoặc có tin nhắn mới.",
      },
      {
        subtitle: "Trạng thái Online/Offline",
        detail:
          'Hãy bật "Sẵn sàng" khi Bác sĩ có thời gian rảnh để bắt đầu nhận yêu cầu.',
      },
    ],
  },
  {
    title: "3. Quy trình tư vấn chuẩn 5 bước",
    description:
      'Đây là "xương sống" trong công việc hàng ngày của Bác sĩ trên app:',
    features: [
      {
        subtitle: "Bước 1 - Tiếp nhận",
        detail:
          'Khi có yêu cầu chat, Bác sĩ sẽ thấy thông tin sơ bộ của bệnh nhân (Tuổi, giới tính, triệu chứng chính). Nhấn "Chấp nhận" để bắt đầu.',
      },
      {
        subtitle: "Bước 2 - Phân tích dữ liệu",
        detail:
          "Điểm khác biệt của hệ thống là Bác sĩ có thể xem Nhật ký uống thuốc và Chỉ số sức khỏe (huyết áp, nhịp tim...) của bệnh nhân trong 30 ngày gần nhất.",
      },
      {
        subtitle: "Bước 3 - Trao đổi",
        detail:
          "Sử dụng khung Chat để tư vấn. Bác sĩ có thể yêu cầu bệnh nhân chụp ảnh đơn thuốc cũ hoặc tình trạng bệnh lý hiện tại.",
      },
      {
        subtitle: "Bước 4 - Kết luận & Dặn dò",
        detail:
          "Đưa ra lời khuyên chuyên môn hoặc hướng dẫn hướng điều trị tiếp theo.",
      },
      {
        subtitle: "Bước 5 - Đóng ca tư vấn",
        detail:
          'Nhấn nút "Hoàn thành tư vấn" để hệ thống lưu hồ sơ và ghi nhận thù lao.',
      },
    ],
  },
  {
    title: "4. Hệ thống chi trả & Thu nhập minh bạch",
    description:
      "Chúng tôi hiểu rằng thời gian của Bác sĩ là quý giá. Chính sách chi trả được thiết kế dựa trên hiệu suất:",
    features: [
      {
        subtitle: "Thù lao theo ca (Pay-per-case)",
        detail:
          "Mỗi ca hỗ trợ thành công (được bệnh nhân xác nhận hoặc hệ thống ghi nhận kết thúc) sẽ được cộng trực tiếp vào số dư.",
      },
      {
        subtitle: "Thưởng hiệu quả",
        detail:
          "Các bác sĩ có tỉ lệ phản hồi nhanh và điểm đánh giá (Star Rating) cao sẽ được hệ thống ưu tiên hiển thị ở vị trí đầu.",
      },
      {
        subtitle: "Rút tiền linh hoạt",
        detail:
          "Bác sĩ có thể theo dõi biến động số dư theo thời gian thực và thực hiện rút tiền về tài khoản ngân hàng.",
      },
    ],
  },
];

function IntroduceSection({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-text-gray-dim relative min-h-screen w-full bg-black font-sans antialiased">
      <main className="mx-auto max-w-5xl px-6 py-20 md:py-26">
        {/* Header của Blog */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 flex items-center justify-center space-x-2 md:mb-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-30"
            viewBox="0 0 320 320"
            width="200"
            height="200"
            fill="none"
          >
            <path
              className="medimate-path"
              pathLength={1}
              stroke="#E1A3F1"
              strokeWidth={4}
              d="M125.92 122.72a.959.959 0 0 0 .735-.337c.294-.325.308-.888.385-16.36.061-12.122.127-16.13.275-16.461.108-.241.242-.925.298-1.52.231-2.43 1.845-7.44 3.312-10.282.757-1.468 2.038-3.71 2.193-3.84.053-.044.309-.44.569-.88.26-.44.565-.908.677-1.04.112-.132.404-.502.648-.822.882-1.154 2.943-3.307 3.979-4.154.581-.475 1.28-1.07 1.552-1.32.274-.252 1.073-.828 1.777-1.28.704-.453 1.43-.952 1.615-1.108.519-.441 3.634-1.977 5.585-2.753 2.316-.923 3.506-1.303 4.48-1.433.44-.059 1.16-.229 1.6-.379.688-.233 1.53-.271 6-.271 5.841 0 6.13.04 10.16 1.39 1.844.618 2.262.779 3.68 1.423.352.16.84.365 1.083.456.763.285 4.465 2.588 5.637 3.507 1.54 1.206 5.331 5.04 6.127 6.195 2.54 3.686 2.937 4.328 3.807 6.149 1.249 2.618 1.485 3.196 2.113 5.2 1.509 4.81 1.627 6.669 1.63 25.506.004 17.998-.03 17.64 1.822 19.561.607.629 1.095.958 1.862 1.253l1.039.4 16.88.091c16.156.087 16.971.105 18.996.428 1.165.186 2.187.381 2.272.433.084.053.572.172 1.083.266 1.366.25 3.979 1.043 5.569 1.69 1.226.499 4.164 1.947 4.721 2.327.309.211.958.595 1.44.854.483.259.951.548 1.039.643.088.095.483.419.877.72.395.302.832.656.973.788.141.132.709.636 1.264 1.12a30.674 30.674 0 0 1 1.688 1.6c1.88 1.985 2.218 2.369 2.61 2.96.234.352.48.68.547.73.067.05.592.805 1.165 1.68.863 1.315 2.301 4.049 3.362 6.39.368.813 1.372 4.267 1.534 5.28.085.528.271 1.536.414 2.24.322 1.59.374 7.779.073 8.824-.105.366-.261 1.23-.347 1.92-.086.691-.257 1.508-.38 1.816a36.085 36.085 0 0 0-.65 1.92c-.489 1.562-.678 2.038-1.681 4.24-.401.88-.844 1.728-.986 1.885-.14.157-.443.667-.672 1.134-.228.467-.527.941-.663 1.055-.137.112-.248.286-.249.386-.001.23-1.648 2.428-2.833 3.78-2.01 2.292-4.786 4.722-7.086 6.198-.572.368-1.22.8-1.44.963-.22.162-.868.499-1.44.748s-1.148.544-1.28.655c-.132.112-.492.278-.8.367-.866.253-2.244.794-2.452.963-.238.193-1.765.616-3.271.906-.639.124-1.239.272-1.332.329-.589.365-3.845.445-23.305.573l-21 .138-.16-11.52c31.1-.008 38.742-.071 39.44-.171.616-.088 1.643-.226 2.282-.307 2.302-.291 6.153-1.701 8.113-2.97.893-.578 2.803-1.989 3.519-2.599 1.523-1.296 3.946-4.414 4.653-5.985.131-.291.304-.636.385-.768.508-.827 1.355-3.061 1.79-4.72.404-1.546.43-8.109.041-10.16-.534-2.808-2.163-6.554-3.759-8.64-.792-1.036-3.246-3.428-4.531-4.42-2.597-2.002-5.521-3.561-7.155-3.814a11.52 11.52 0 0 1-1.418-.335c-2.506-.79-1.836-.769-26.72-.863l-23.28-.088-.88-.39c-.484-.214-1.05-.519-1.259-.678-.653-.496-1.433-1.623-1.643-2.372-.155-.556-.224-5.994-.301-23.84-.086-19.955-.135-23.394-.359-25.12-.246-1.906-.663-3.678-1.109-4.72-1.508-3.516-3.595-6.588-5.615-8.262-.547-.453-1.03-.87-1.074-.926-.437-.56-3.04-2.142-5.36-3.26-3.606-1.736-7.262-2.182-12.767-1.557-.861.098-1.761.255-2 .349-.238.093-.881.267-1.429.384-.864.185-3.003 1.055-3.724 1.515-.132.083-.456.263-.72.399-.963.495-1.288.72-2.7 1.868-2.396 1.95-4.209 3.899-4.92 5.29-.168.33-.368.6-.445.6-.189 0-2.255 4.131-2.255 4.51 0 .168-.097.5-.217.738-.119.237-.388 1.152-.6 2.032l-.383 1.6v16.675c0 15.68.017 16.688.28 16.919l.28.246c0 3.105.072 5.805.16 8.004l.16 3.996c-.473.494-.5.753-.411 1.751.059.665.218 1.713.353 2.329.136.616.342 1.66.459 2.32.314 1.775.643 3.069.917 3.604.134.262.297.8.362 1.196.065.396.296 1.188.514 1.76l.792 2.08c.218.572.457 1.235.531 1.473.075.238.246.634.378.88.133.245.643 1.275 1.132 2.287.49 1.012 1.052 2.092 1.248 2.4.197.308.72 1.144 1.162 1.859 1.51 2.439 1.764 2.809 3.123 4.524 3.098 3.91 5.97 6.999 8.345 8.977.581.484 1.613 1.348 2.293 1.92 2.799 2.355 5.681 4.193 9.682 6.172 2.296 1.136 3.798 1.79 5.28 2.297.572.197 1.184.436 1.36.533.176.096.68.268 1.12.382.44.114 1.331.388 1.981.612.649.222 1.316.404 1.48.404h.299c.248 2.666.32 5.33.32 7.64v4.2c-1.426-.474-2.524-.736-3.36-.888-1.293-.235-2.507-.619-4.287-1.359a2.222 2.222 0 0 0-.705-.153c-.186 0-.704-.172-1.153-.381a27.249 27.249 0 0 0-1.967-.795c-.634-.226-1.282-.483-1.44-.57a24.427 24.427 0 0 0-1.328-.595c-.572-.24-1.13-.504-1.239-.586-.109-.083-.623-.351-1.141-.596-1.749-.827-7.648-4.409-8.42-5.114-.088-.08-.518-.383-.955-.674-.987-.658-2.614-1.877-2.991-2.244-.156-.151-.556-.45-.889-.665-.332-.216-1.325-1.084-2.205-1.93-.88-.846-2.342-2.239-3.249-3.095-.908-.855-2.163-2.167-2.79-2.915a64.988 64.988 0 0 0-1.516-1.76c-1.097-1.164-4.691-6.321-5.634-8.08a31.872 31.872 0 0 0-.973-1.68c-.401-.63-2.194-4.164-3.046-6-1.195-2.576-2.785-7.174-3.652-10.56-.787-3.075-.97-3.917-1.127-5.17-.092-.731-.204-1.391-.251-1.467-.046-.075-.192-1.261-.324-2.637-.264-2.748-.491-3.523-1.11-3.766l-.408-.16-.16-10.24Z"
            />

            <path
              className="medimate-path"
              pathLength={1}
              stroke="#FDFDFD"
              strokeWidth={4}
              d="M195.2 198.56c-.458.826-.484 2.582-.458 14.72.02 9.382-.026 14.149-.145 14.8-.095.528-.221 1.781-.28 2.784-.059 1.004-.202 2.191-.318 2.64a17.025 17.025 0 0 0-.321 1.616c-.172 1.244-1.771 5.936-2.318 6.8-.14.22-.426.796-.639 1.28-.212.484-.507 1.024-.656 1.2a6.41 6.41 0 0 0-.575.88c-.622 1.146-1.579 2.519-2.677 3.84-1.467 1.765-4.286 4.57-5.298 5.27-2.071 1.435-3.563 2.363-5.675 3.532-1.281.709-3.344 1.624-4.32 1.915-.66.196-1.632.489-2.16.651-.528.16-1.379.367-1.889.459-.511.091-.985.2-1.052.241-.39.241-3.766.624-5.619.637-3.389.024-7.848-.58-10.16-1.374-1.108-.382-2.902-1.067-3.268-1.249l-1.932-.957c-1.709-.847-3.014-1.593-3.789-2.166a77.173 77.173 0 0 1-1.652-1.246c-3.308-2.637-5.504-4.898-7.145-7.356-.397-.595-.806-1.171-.908-1.28-.514-.544-2.628-4.521-3.295-6.197-.795-1.998-1.313-3.709-1.915-6.32-.612-2.657-.734-6.247-.745-21.92-.006-8.096-.066-15.272-.133-15.946-.161-1.611-.762-2.885-1.795-3.802-.89-.791-2.184-1.424-3.16-1.545-.365-.046-8.403-.102-17.863-.125-15.2-.037-17.321-.072-18.24-.3a27.827 27.827 0 0 0-2.08-.417 19.984 19.984 0 0 1-1.92-.404c-2.701-.752-3.19-.904-3.92-1.22-.44-.191-1.052-.454-1.36-.584-2.67-1.131-6.127-3.162-8.08-4.746-2.02-1.639-6.154-5.962-6.532-6.831-.058-.132-.541-.924-1.074-1.76-.534-.836-1.226-2.06-1.539-2.72-1.541-3.25-2.1-4.868-2.842-8.24a42.202 42.202 0 0 0-.48-1.92c-.359-1.277-.506-5.774-.275-8.4.183-2.09 1.057-5.813 1.84-7.84.681-1.764 1.462-3.569 1.833-4.24l.885-1.6c1.992-3.603 5.307-7.384 8.727-9.955 2.623-1.971 7.712-4.685 8.786-4.685.151 0 .736-.225 1.298-.499 1.616-.788 6.387-1.897 8.893-2.066 1.144-.078 10.046-.144 19.783-.148l17.702-.007.618.492c.339.27.671.486.737.48l.12-.012.16 10.24c-30.514 0-37.215.058-37.779.166-.473.091-1.562.233-2.419.315-1.496.145-4.028.695-4.362.947-.088.067-.688.288-1.334.491-.646.203-1.425.541-1.732.749a15.17 15.17 0 0 1-1.335.773c-.427.216-.819.462-.87.546-.053.085-.488.378-.968.652-1.353.774-4.286 3.764-5.838 5.95-.8 1.129-2.334 4.314-2.49 5.172-.063.352-.184.773-.27.937-.257.499-.747 3.519-.851 5.26-.105 1.74.377 6.505.722 7.152.095.176.243.69.328 1.141.156.822 1.927 4.677 2.237 4.868.091.057.305.376.475.71.403.791 1.145 1.648 3.134 3.626 1.993 1.982 3.116 2.793 5.592 4.043 2.443 1.234 3.807 1.679 6.41 2.091 2.042.323 2.612.331 25.171.331h23.081l1.187.494c1.329.554 2.394 1.562 2.794 2.647.193.522.241 4.353.313 24.459l.084 23.84.365 1.44c.201.792.466 1.692.589 2 .122.308.258.819.3 1.135.154 1.136 2.083 4.632 3.737 6.772 1.52 1.966 4.4 4.519 6.396 5.671 1.625.937 3.743 1.942 4.093 1.942.162 0 .491.1.728.223.776.398 4.663.897 7.002.897 2.214 0 4.705-.369 5.872-.869.284-.122 1.166-.423 1.958-.668 3.117-.965 7.916-4.397 9.581-6.851.203-.298.587-.818.854-1.157.604-.766 2.24-3.677 2.727-4.855.54-1.303 1.158-3.509 1.158-4.13 0-.299.115-.986.254-1.525.223-.861.258-2.915.28-16.759.027-16.818.042-16.49-.72-16.703l-.294-.083v-4.2c0-2.31-.072-4.974-.32-7.64.586-.229.797-.452.848-.645.103-.396-.247-2.721-.513-3.406-.096-.247-.175-.726-.175-1.063 0-.337-.138-1.07-.307-1.629a16.304 16.304 0 0 1-.418-1.737c-.062-.396-.181-.851-.266-1.012-.084-.161-.248-.629-.363-1.04-.115-.411-.298-1-.407-1.308-1.077-3.061-1.365-3.837-1.87-5.04-.535-1.274-1.003-2.236-2.023-4.16-.467-.88-1.019-1.924-1.228-2.32-.46-.873-1.841-2.969-2.319-3.52-.191-.22-.579-.785-.861-1.255-.282-.47-.66-1.011-.838-1.2-.18-.189-.73-.885-1.224-1.545-1.946-2.598-5.204-5.736-9.161-8.822-3.542-2.761-4.426-3.374-6.442-4.472-2.452-1.334-6.553-3.283-7.233-3.436a3.202 3.202 0 0 1-.831-.327c-.414-.258-4.26-1.545-5.415-1.812-.444-.103-.93-.147-1.08-.099l-.274.088-.16-3.996c-.088-2.199-.16-4.899-.16-8.004 1.608.333 2.591.575 3.987.981.565.165 1.164.299 1.331.299.167 0 .457.083.645.183.189.101.669.277 1.069.392 1.399.4 3.416 1.124 4.88 1.749.268.115.884.366 1.368.558 1.246.495 4.883 2.289 6.701 3.306l2.176 1.217c.351.195.783.471.96.612.178.142 1.007.718 1.842 1.28 1.287.866 2.997 2.135 5.005 3.714.244.192.704.591 1.022.887.317.296 1.234 1.121 2.035 1.833 3.499 3.108 6.967 6.973 9.228 10.288l1.227 1.786c.547.798 1.134 1.689 1.303 1.983 1.945 3.365 2.598 4.541 2.964 5.341.238.518.525 1.052.64 1.187.114.134.399.772.633 1.417.235.645.532 1.278.661 1.407s.312.537.407.907c.095.37.413 1.249.708 1.953a25.6 25.6 0 0 1 .811 2.24c.151.528.406 1.356.566 1.84.541 1.64 1.588 5.841 2.074 8.32.252 1.288.8 5.82.798 6.607-.001.608.082.849.399 1.16l.4.393.16 11.52Z"
            />
          </svg>
          <span className="medimate-brand-name text-5xl!">
            <span className="brand-text-white">MEDI</span>
            <span className="brand-text-purple">MATE</span>
          </span>
        </motion.header>
        {/* Giới thiệu */}
        <div className="space-y-16 md:space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          ></motion.div>
          <div className="prose prose-invert max-w-none space-y-12">
            <p className="text-lg leading-9 text-neutral-300 md:text-lg">
              Trong kỷ nguyên số, việc chăm sóc sức khỏe không còn gói gọn trong
              bốn bức tường của phòng khám. Bệnh nhân cần sự đồng hành liên tục,
              và bác sĩ cần những dữ liệu thực tế để đưa ra quyết định chính xác
              nhất.
            </p>
            <p className="text-lg leading-9 text-neutral-300 md:text-lg">
              Đó chính là lý do Medimate ra đời – không chỉ là một ứng dụng nhắc
              lịch uống thuốc, mà là một{" "}
              <TextHighlighter
                highlightColor="rgba(236, 72, 153, 0.3)"
                className="font-medium text-white"
              >
                hệ sinh thái kết nối y tế thông minh
              </TextHighlighter>
              , nơi khoảng cách giữa chuyên gia và người bệnh được xóa nhòa bởi
              dữ liệu và sự tận tâm.
            </p>
            <p className="text-lg leading-9 text-neutral-300 md:text-lg">
              Khác với các nền tảng chat thông thường, Dashboard dành cho bác sĩ
              của Medimate cho phép bạn{" "}
              <TextHighlighter
                highlightColor="rgba(236, 72, 153, 0.3)"
                className="font-medium text-white"
              >
                truy xuất toàn bộ lịch sử tuân thủ điều trị
              </TextHighlighter>{" "}
              của bệnh nhân. Bạn sẽ biết chính xác{" "}
              <TextHighlighter
                highlightColor="rgba(236, 72, 153, 0.3)"
                className="font-medium text-white"
              >
                các chỉ số huyết áp, tim mạch biến động ra sao trong suốt 30
                ngày qua
              </TextHighlighter>{" "}
              trước khi họ đặt câu hỏi đầu tiên. Đây chính là{" "}
              <TextHighlighter
                highlightColor="rgba(236, 72, 153, 0.3)"
                className="font-semibold text-white italic"
              >
                cơ sở dữ liệu vàng
              </TextHighlighter>{" "}
              giúp bác sĩ chẩn đoán từ xa một cách tự tin và chính xác.
            </p>
            <p className="my-16 rounded-r-xl border-l-2 border-white/10 bg-white/5 px-10 py-10 text-lg leading-9 font-light text-neutral-300 md:text-lg">
              Chúng tôi xây dựng Medimate dựa trên triết lý "Tôn trọng giá trị
              chất xám". Hệ thống chi trả thù lao minh bạch theo từng{" "}
              <TextHighlighter
                highlightColor="rgba(236, 72, 153, 0.3)"
                className="font-bold text-white"
              >
                ca hỗ trợ (Pay-per-case)
              </TextHighlighter>{" "}
              được tích hợp ngay trong Dashboard. Bác sĩ có thể hoàn toàn chủ
              động về thời gian: làm việc mọi lúc, mọi nơi, chuyển đổi trạng
              thái chỉ với một cú click.
            </p>
            <p className="text-lg leading-9 text-neutral-300 md:text-lg">
              Gia nhập Medimate, bác sĩ không chỉ tăng thêm nguồn thu nhập thụ
              động mà còn đang cùng chúng tôi thay đổi thói quen chăm sóc sức
              khỏe chủ động của hàng triệu người Việt. Hãy để kiến thức của bạn
              được lan tỏa rộng hơn và được đền đáp một cách xứng đáng nhất.
            </p>
          </div>
        </div>
        {/* Hướng dẫn */}
        <div className="mt-20 space-y-16 md:space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-white md:text-[28px]">
              Lộ trình A-Z dành cho Bác sĩ mới bắt đầu
            </h2>
          </motion.div>

          {BLOG_CONTENT.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="group"
            >
              <h3 className="mb-4 text-lg font-semibold text-white md:text-[22px]">
                {section.title}
              </h3>

              <p className="text-md mb-8 leading-[1.7] font-light text-neutral-300 md:text-[18px]">
                {section.description}
              </p>

              <div className="space-y-6">
                {section.features.map((feat, i) => (
                  <div
                    key={i}
                    className="border-l border-neutral-800 pl-4 transition-colors hover:border-neutral-600 md:pl-6"
                  >
                    <p className="text-md leading-[1.7] font-light text-neutral-400 md:text-[17px]">
                      <strong className="mr-2 font-semibold text-neutral-200">
                        {feat.subtitle}:
                      </strong>
                      {feat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
          {/* Creative CTA */}
          <section className="relative mt-40 overflow-hidden border-t border-neutral-900 py-32">
            {/* Background glow */}

            <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8">
              <SplitText
                text="Bạn đã sẵn sàng để tham gia cùng Medimate chưa?"
                className="max-w-[80%] font-sans text-[48px] text-white uppercase"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="words, chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                textAlign="center"
              />

              <button
                onClick={onStart}
                className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                {/* Shiny Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent" />

                {/* Glow behind */}
                <div className="absolute inset-0 -z-10 bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

                <span className="relative z-10 flex items-center gap-2">
                  Thiết lập tài khoản
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </span>

                {/* Internal Glow for Shimmer */}
                <style
                  dangerouslySetInnerHTML={{
                    __html: `
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                  }
                `,
                  }}
                />
              </button>
            </div>
          </section>
        </div>

        {/* Footer Support */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-24 flex justify-between border-t border-neutral-900 pt-12 md:mt-24"
        >
          <ul className="mt-6 flex h-full w-fit cursor-pointer flex-col space-y-1 md:mt-2">
            <VariableFontHoverByLetter
              label="Facebook (Medimate Vietnam)"
              staggerFrom={"center"}
              className="w-fit text-lg text-blue-500"
              fromFontVariationSettings="'wght' 300, 'slnt' 0"
              toFontVariationSettings="'wght' 900, 'slnt' -20"
            />
            <VariableFontHoverByLetter
              label="Instagram (_wearemedimatez)"
              staggerFrom={"center"}
              className="w-fit text-lg text-pink-500"
              fromFontVariationSettings="'wght' 300, 'slnt' 0"
              toFontVariationSettings="'wght' 900, 'slnt' -20"
            />
            <VariableFontHoverByLetter
              label="Youtube (Medimate Vietnam)"
              staggerFrom={"center"}
              className="w-fit text-lg text-red-500"
              fromFontVariationSettings="'wght' 300, 'slnt' 0"
              toFontVariationSettings="'wght' 900, 'slnt' -20"
            />
          </ul>
          <div className="flex items-end justify-end">
            <h2 className="text-right text-6xl font-bold tracking-tighter text-neutral-800">
              Care.
              <br />
              Reimagined.
            </h2>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}

type SetupProgress = "name" | "bio" | "avatar" | "password" | "certificate";

type DoctorOnboardingDraft = {
  fullName: string | null;
  specialty: string | null;
  currentHospitalName: string | null;
  licenseNumber: string | null;
  yearsOfExperience: string | null;
  bio: string | null;
  avatarImage: File | null;
  licenseImage: File[];
  newPassword: string;
  confirmPassword: string;
};

type SetupFieldErrorKey =
  | "fullName"
  | "specialty"
  | "currentHospitalName"
  | "licenseNumber"
  | "yearsOfExperience"
  | "bio"
  | "newPassword"
  | "confirmPassword"
  | "licenseImage";

type SetupFieldErrors = Partial<Record<SetupFieldErrorKey, string>>;

function pickFirstString(
  source: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return null;
}

function SetupLayout({
  onStart,
  onBack,
}: {
  onStart?(): void;
  onBack?(): void;
}) {
  const [setupProgress, setSetupProgress] = useState<SetupProgress>("name");
  const fieldRefs = useRef<
    Partial<Record<SetupFieldErrorKey, HTMLElement | null>>
  >({});
  const [draft, setDraft] = useState<DoctorOnboardingDraft>({
    fullName: null,
    specialty: null,
    currentHospitalName: null,
    licenseNumber: null,
    yearsOfExperience: null,
    bio: null,
    avatarImage: null,
    licenseImage: [],
    newPassword: "",
    confirmPassword: "",
  });
  const { data: doctorProfile, isLoading: isDoctorLoading } = useDoctorMe(true);
  const submitDoctorMeMutation = useSubmitDoctorMe();
  const changePasswordMutation = useChangeMyPassword();

  const registerFieldRef =
    <T extends HTMLElement>(field: SetupFieldErrorKey) =>
    (element: T | null) => {
      fieldRefs.current[field] = element;
    };

  const doctorRecord = (doctorProfile ?? {}) as Record<string, unknown>;
  const defaultName = doctorProfile?.fullName ?? "";
  const defaultSpecialty = doctorProfile?.specialty ?? "";
  const defaultCurrentHospitalName = doctorProfile?.currentHospitalName ?? "";
  const defaultLicenseNumber = doctorProfile?.licenseNumber ?? "";
  const defaultAvatar =
    pickFirstString(doctorRecord, [
      "avatarUrl",
      "avatarImage",
      "profileImage",
    ]) ?? "";
  const defaultBio =
    pickFirstString(doctorRecord, ["bio", "description", "introduction"]) ?? "";

  const displayName = draft.fullName ?? defaultName;
  const displaySpecialty = draft.specialty ?? defaultSpecialty;
  const displayCurrentHospitalName =
    draft.currentHospitalName ?? defaultCurrentHospitalName;
  const displayLicenseNumber = draft.licenseNumber ?? defaultLicenseNumber;
  const displayYearsOfExperience = draft.yearsOfExperience ?? "";
  const displayAvatar = defaultAvatar;
  const displayBio = draft.bio ?? defaultBio;

  const parsedYearsOfExperience = Number.parseInt(
    displayYearsOfExperience.trim(),
    10,
  );

  const nameFieldErrors: SetupFieldErrors = {
    fullName: displayName.trim()
      ? undefined
      : "Vui lòng nhập họ và tên bác sĩ.",
    specialty: displaySpecialty.trim()
      ? undefined
      : "Vui lòng nhập chuyên khoa.",
    currentHospitalName: displayCurrentHospitalName.trim()
      ? undefined
      : "Vui lòng nhập bệnh viện hiện tại.",
    licenseNumber: displayLicenseNumber.trim()
      ? undefined
      : "Vui lòng nhập số giấy phép hành nghề.",
    yearsOfExperience:
      displayYearsOfExperience.trim().length === 0
        ? "Vui lòng nhập số năm kinh nghiệm."
        : Number.isNaN(parsedYearsOfExperience)
          ? "Số năm kinh nghiệm không hợp lệ."
          : parsedYearsOfExperience < 0 || parsedYearsOfExperience > 80
            ? "Số năm kinh nghiệm phải nằm trong khoảng từ 0 đến 80."
            : undefined,
    bio: displayBio.trim()
      ? undefined
      : "Vui lòng nhập giới thiệu về bản thân.",
  };

  const passwordFieldErrors: SetupFieldErrors = {
    newPassword: draft.newPassword.trim()
      ? draft.newPassword.trim().length < 8
        ? "Mật khẩu cần ít nhất 8 ký tự."
        : undefined
      : "Vui lòng nhập mật khẩu mới.",
    confirmPassword:
      draft.confirmPassword.trim().length === 0
        ? "Vui lòng nhập lại mật khẩu."
        : draft.newPassword !== draft.confirmPassword
          ? "Mật khẩu nhập lại chưa khớp."
          : undefined,
  };

  const focusFirstInvalidField = (fields: SetupFieldErrors) => {
    const firstInvalidKey = Object.entries(fields).find(([, value]) =>
      Boolean(value),
    )?.[0] as SetupFieldErrorKey | undefined;

    if (!firstInvalidKey) {
      return;
    }

    const target = fieldRefs.current[firstInvalidKey];
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (
      typeof (target as HTMLInputElement | HTMLTextAreaElement | null)
        ?.focus === "function"
    ) {
      (target as HTMLInputElement | HTMLTextAreaElement).focus();
    }
  };

  const hasNameErrors = Object.values(nameFieldErrors).some(Boolean);
  const hasPasswordErrors = Object.values(passwordFieldErrors).some(Boolean);
  const canSubmitOnboarding =
    !hasNameErrors && !hasPasswordErrors && draft.licenseImage.length > 0;

  const handleLicenseImageChange = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;

    const selectedFiles = Array.from(selected);
    setDraft((prev) => ({
      ...prev,
      licenseImage: [...prev.licenseImage, ...selectedFiles].slice(0, 3),
    }));
  };

  const handleRemoveLicenseImage = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      licenseImage: prev.licenseImage.filter((_, i) => i !== index),
    }));
  };

  const handleAvatarImageChange = (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;

    const [selectedFile] = Array.from(selected);
    setDraft((prev) => ({
      ...prev,
      avatarImage: selectedFile,
    }));
  };

  const handleRemoveAvatarImage = () => {
    setDraft((prev) => ({
      ...prev,
      avatarImage: null,
    }));
  };

  const handleAvatarChange = () => {
    setSetupProgress("password");
  };

  const handleAvatarRemove = () => {
    handleRemoveAvatarImage();
  };

  const validateNameStep = () => {
    if (Object.values(nameFieldErrors).some(Boolean)) {
      setSetupProgress("name");
      focusFirstInvalidField(nameFieldErrors);
      return false;
    }

    return true;
  };

  const validatePasswordStep = () => {
    if (Object.values(passwordFieldErrors).some(Boolean)) {
      setSetupProgress("password");
      focusFirstInvalidField(passwordFieldErrors);
      return false;
    }

    return true;
  };

  const handleNameNext = () => {
    if (!validateNameStep()) {
      return;
    }

    setSetupProgress("bio");
  };

  const handlePasswordNext = () => {
    if (!validatePasswordStep()) {
      return;
    }

    setSetupProgress("certificate");
  };

  const handleCompleteOnboarding = async () => {
    if (!validateNameStep() || !validatePasswordStep()) {
      return;
    }

    const trimmedPassword = draft.newPassword.trim();

    if (draft.licenseImage.length === 0) {
      setSetupProgress("certificate");
      const target = fieldRefs.current.licenseImage;
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      const response = await submitDoctorMeMutation.mutateAsync({
        fullName: displayName.trim(),
        specialty: displaySpecialty.trim(),
        currentHospitalName: displayCurrentHospitalName.trim(),
        avatarImage: draft.avatarImage || undefined,
        licenseNumber: displayLicenseNumber.trim(),
        licenseImage: draft.licenseImage,
        yearsOfExperience: parsedYearsOfExperience,
        bio: displayBio.trim(),
      });

      if (!response.success) {
        setSetupProgress("certificate");
        return;
      }

      const changePasswordResponse = await changePasswordMutation.mutateAsync({
        oldPassword: DEFAULT_OLD_PASSWORD,
        newPassword: trimmedPassword,
        confirmPassword: draft.confirmPassword.trim(),
      });

      if (!changePasswordResponse.success) {
        setSetupProgress("password");
        return;
      }

      onStart?.();
    } catch (error: unknown) {
      toast.error("Gửi hồ sơ thất bại", getApiErrorMessage(error));
    }
  };

  if (isDoctorLoading) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center font-sans antialiased">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="white" />
          <p className="text-sm text-neutral-400">
            Đang tải thông tin bác sĩ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans antialiased">
      <AnimatePresence mode="wait" initial={false}>
        {setupProgress === "name" && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full w-full items-center justify-center"
          >
            <SetupItem
              onClick={handleNameNext}
              onSecondaryClick={onBack}
              title="Chúng tôi có thể gọi bác sĩ là?"
              hint={["* Bắt buộc"]}
              buttonName="Tiếp tục"
              secondaryButtonName="Quay lại"
              disabled={hasNameErrors}
            >
              <NameUpdate
                fullName={displayName}
                specialty={displaySpecialty}
                currentHospitalName={displayCurrentHospitalName}
                licenseNumber={displayLicenseNumber}
                yearsOfExperience={displayYearsOfExperience}
                onFullNameChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    fullName: value,
                  }))
                }
                onSpecialtyChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    specialty: value,
                  }))
                }
                onCurrentHospitalNameChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    currentHospitalName: value,
                  }))
                }
                onLicenseNumberChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    licenseNumber: value,
                  }))
                }
                onYearsOfExperienceChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    yearsOfExperience: value,
                  }))
                }
                errors={nameFieldErrors}
                fullNameRef={registerFieldRef("fullName")}
                specialtyRef={registerFieldRef("specialty")}
                currentHospitalNameRef={registerFieldRef("currentHospitalName")}
                licenseNumberRef={registerFieldRef("licenseNumber")}
                yearsOfExperienceRef={registerFieldRef("yearsOfExperience")}
              />
            </SetupItem>
          </motion.div>
        )}
        {setupProgress === "bio" && (
          <motion.div
            key="bio"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full w-full items-center justify-center"
          >
            <SetupItem
              onClick={() => setSetupProgress("avatar")}
              onSecondaryClick={() => setSetupProgress("name")}
              title="Bác sĩ có thể giới thiệu về bản thân không?"
              hint={["* Xuống dòng mỗi lần giới thiệu", "* Bắt buộc"]}
              buttonName="Tiếp tục"
              secondaryButtonName="Quay lại"
              disabled={!!nameFieldErrors.bio}
            >
              <AddBio
                value={displayBio}
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    bio: value,
                  }))
                }
                errors={nameFieldErrors}
                bioRef={registerFieldRef("bio")}
              />
            </SetupItem>
          </motion.div>
        )}
        {setupProgress === "avatar" && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full w-full items-center justify-center"
          >
            <SetupItem
              onClick={handleAvatarChange}
              onSecondaryClick={() => setSetupProgress("bio")}
              title="Ảnh đại diện cũng rất quan trọng đấy nhé!"
              buttonName="Tiếp tục"
              secondaryButtonName="Quay lại"
            >
              <AvatarUpload
                preview={displayAvatar}
                onChange={handleAvatarChange}
                onRemove={handleAvatarRemove}
                onAvatarImageChange={handleAvatarImageChange}
                avatarImage={draft.avatarImage}
              />
            </SetupItem>
          </motion.div>
        )}
        {setupProgress === "password" && (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full w-full items-center justify-center"
          >
            <SetupItem
              onClick={handlePasswordNext}
              onSecondaryClick={() => setSetupProgress("avatar")}
              title="Bây giờ đặt lại mật khẩu nhé!"
              buttonName="Đặt lại mật khẩu"
              secondaryButtonName="Quay lại"
              hint={["* Mật khẩu mới và xác nhận lại là bắt buộc"]}
              disabled={hasPasswordErrors}
            >
              <ChangePassword
                password={draft.newPassword}
                confirmPassword={draft.confirmPassword}
                onPasswordChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    newPassword: value,
                  }))
                }
                onConfirmPasswordChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    confirmPassword: value,
                  }))
                }
                errors={passwordFieldErrors}
                passwordRef={registerFieldRef("newPassword")}
                confirmPasswordRef={registerFieldRef("confirmPassword")}
              />
            </SetupItem>
          </motion.div>
        )}
        {setupProgress === "certificate" && (
          <motion.div
            key="certificate"
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-full w-full items-center justify-center"
          >
            <SetupItem
              onClick={handleCompleteOnboarding}
              onSecondaryClick={() => setSetupProgress("password")}
              title="Bước cuối cùng, hãy upload chứng chỉ của bạn!!!"
              buttonName={
                submitDoctorMeMutation.isPending ||
                changePasswordMutation.isPending
                  ? "Đang gửi..."
                  : "Gửi hồ sơ xét duyệt"
              }
              secondaryButtonName="Quay lại"
              hint={[
                "* Đây là bước quan trọng nhất (Bắt Buộc)",
                "* Tối đa 3 ảnh giấy phép (hình hoặc PDF)",
              ]}
              disabled={
                submitDoctorMeMutation.isPending ||
                changePasswordMutation.isPending ||
                !canSubmitOnboarding
              }
              isLoading={
                submitDoctorMeMutation.isPending ||
                changePasswordMutation.isPending
              }
            >
              <UploadCertificate
                files={draft.licenseImage}
                onFileChange={handleLicenseImageChange}
                onRemoveFile={handleRemoveLicenseImage}
                error={
                  draft.licenseImage.length === 0
                    ? "Vui lòng tải lên ít nhất 1 ảnh giấy phép."
                    : undefined
                }
                containerRef={registerFieldRef("licenseImage")}
              />
            </SetupItem>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type SetupItemProps = {
  title: string;
  hint?: string[];
  buttonName?: string;
  children?: React.ReactNode;
  onClick?(): void;
  onSecondaryClick?(): void;
  secondaryButtonName?: string;
  disabled?: boolean;
  isLoading?: boolean;
};

function SetupItem({
  title,
  hint = [],
  buttonName = "Tiếp tục",
  children,
  onClick,
  onSecondaryClick,
  secondaryButtonName,
  disabled = false,
  isLoading = false,
}: SetupItemProps) {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-8">
      {/* Title */}
      <h2 className="text-3xl text-white">{title}</h2>
      {/* Children */}
      <div className="flex flex-col gap-2">
        {children}

        <div className="mt-2 flex flex-col space-y-4 px-2.5">
          {hint.map((text, index) => (
            <span key={index} className="text-[13px] text-neutral-400">
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {secondaryButtonName && onSecondaryClick && (
          <button
            onClick={onSecondaryClick}
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {secondaryButtonName}
          </button>
        )}

        <button
          onClick={handleClick}
          disabled={disabled}
          className="group relative overflow-hidden rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-transform duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {/* Shiny Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-linear-to-r from-transparent via-white/80 to-transparent" />

          {/* Glow behind */}
          <div className="absolute inset-0 -z-10 bg-white/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />

          <span className="relative z-10 flex items-center gap-2">
            {isLoading && <Spinner size="sm" color="primary" />}
            {buttonName}
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </span>

          {/* Internal Glow for Shimmer */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                  }
                `,
            }}
          />
        </button>
      </div>
    </div>
  );
}

function NameUpdate({
  fullName,
  specialty,
  currentHospitalName,
  licenseNumber,
  yearsOfExperience,
  onFullNameChange,
  onSpecialtyChange,
  onCurrentHospitalNameChange,
  onLicenseNumberChange,
  onYearsOfExperienceChange,
  errors,
  fullNameRef,
  specialtyRef,
  currentHospitalNameRef,
  licenseNumberRef,
  yearsOfExperienceRef,
}: {
  fullName: string;
  specialty: string;
  currentHospitalName: string;
  licenseNumber: string;
  yearsOfExperience: string;
  onFullNameChange(value: string): void;
  onSpecialtyChange(value: string): void;
  onCurrentHospitalNameChange(value: string): void;
  onLicenseNumberChange(value: string): void;
  onYearsOfExperienceChange(value: string): void;
  errors?: SetupFieldErrors;
  fullNameRef?: React.Ref<HTMLInputElement>;
  specialtyRef?: React.Ref<HTMLInputElement>;
  currentHospitalNameRef?: React.Ref<HTMLInputElement>;
  licenseNumberRef?: React.Ref<HTMLInputElement>;
  yearsOfExperienceRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className="grid w-130 grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <input
          ref={fullNameRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Họ và tên bác sĩ"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          type="text"
        />
        {errors?.fullName && (
          <p className="px-1 text-xs text-red-400">* {errors.fullName}</p>
        )}
      </div>

      <div className="space-y-1">
        <input
          ref={specialtyRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Chuyên khoa"
          value={specialty}
          onChange={(e) => onSpecialtyChange(e.target.value)}
          type="text"
        />
        {errors?.specialty && (
          <p className="px-1 text-xs text-red-400">* {errors.specialty}</p>
        )}
      </div>

      <div className="space-y-1">
        <input
          ref={currentHospitalNameRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Bệnh viện hiện tại"
          value={currentHospitalName}
          onChange={(e) => onCurrentHospitalNameChange(e.target.value)}
          type="text"
        />
        {errors?.currentHospitalName && (
          <p className="px-1 text-xs text-red-400">
            * {errors.currentHospitalName}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <input
          ref={licenseNumberRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Số giấy phép hành nghề"
          value={licenseNumber}
          onChange={(e) => onLicenseNumberChange(e.target.value)}
          type="text"
        />
        {errors?.licenseNumber && (
          <p className="px-1 text-xs text-red-400">* {errors.licenseNumber}</p>
        )}
      </div>

      <div className="space-y-1 md:col-span-2">
        <input
          ref={yearsOfExperienceRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Số năm kinh nghiệm (0-80)"
          value={yearsOfExperience}
          onChange={(e) => onYearsOfExperienceChange(e.target.value)}
          type="text"
        />
        {errors?.yearsOfExperience && (
          <p className="px-1 text-xs text-red-400">
            * {errors.yearsOfExperience}
          </p>
        )}
      </div>
    </div>
  );
}

function AddBio({
  value,
  onChange,
  errors,
  bioRef,
}: {
  value: string;
  onChange(value: string): void;
  errors?: SetupFieldErrors;
  bioRef?: (element: HTMLTextAreaElement | null) => void;
}) {
  const bioError = errors?.bio;

  return (
    <div className="flex w-150 flex-col gap-3">
      <textarea
        ref={bioRef}
        rows={4}
        placeholder="Một vài thông tin về bản thân..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-40 max-h-40 w-full resize-none rounded-xl border bg-black px-4 py-4 pr-4 text-sm text-white transition duration-300 outline-none placeholder:text-gray-400 focus:bg-white/10 focus:ring-1 focus:outline-none ${
          bioError
            ? "border-red-400/50 focus:border-red-400 focus:ring-red-400"
            : "border-white/10 focus:border-white/20 focus:ring-white/10"
        }`}
      ></textarea>
      {bioError && <p className="text-xs text-red-400">* {bioError}</p>}
    </div>
  );
}

function AvatarUpload({
  preview,
  onChange,
  onRemove,
  onAvatarImageChange,
  avatarImage,
}: {
  preview: string;
  onChange(): void;
  onRemove(): void;
  onAvatarImageChange(selected: FileList | null): void;
  avatarImage: File | null;
}) {
  return (
    <div className="flex w-150 flex-col gap-3">
      <label className="group relative flex h-28 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 bg-black transition-all duration-300 hover:border-white/40 hover:bg-white/4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onAvatarImageChange(e.target.files)}
        />

        <div className="text-center text-sm text-neutral-400 transition-all duration-300 group-hover:text-white">
          Tải lên AvatarImage
        </div>
      </label>

      {(avatarImage || preview) && (
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm text-white">
              {avatarImage ? avatarImage.name : "Ảnh đại diện hiện tại"}
            </span>
            {avatarImage ? (
              <span className="text-xs text-neutral-500">
                {(avatarImage.size / 1024 / 1024).toFixed(2)} MB
              </span>
            ) : (
              <span className="text-xs text-neutral-500">
                Đã có ảnh từ hồ sơ
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {avatarImage && (
              <button
                onClick={onRemove}
                type="button"
                className="text-xs text-neutral-400 transition hover:text-red-500"
              >
                Xoa
              </button>
            )}
            <button
              onClick={onChange}
              type="button"
              className="text-xs text-neutral-300 transition hover:text-white"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChangePassword({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  errors,
  passwordRef,
  confirmPasswordRef,
}: {
  password: string;
  confirmPassword: string;
  onPasswordChange(value: string): void;
  onConfirmPasswordChange(value: string): void;
  errors?: SetupFieldErrors;
  passwordRef?: React.Ref<HTMLInputElement>;
  confirmPasswordRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div className="flex w-100 flex-col space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm leading-none font-medium text-white">
            Mật khẩu
          </label>
        </div>
        <input
          ref={passwordRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          type="password"
        />
        {errors?.newPassword && (
          <p className="px-1 text-xs text-red-400">* {errors.newPassword}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm leading-none font-medium text-white">
            Nhập lại mật khẩu
          </label>
        </div>
        <input
          ref={confirmPasswordRef}
          className="flex h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-sm text-white backdrop-blur-md transition-all duration-200 placeholder:text-white/40 focus:border-white/50 focus:bg-white/10 focus:outline-none"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          type="password"
        />
        {errors?.confirmPassword && (
          <p className="px-1 text-xs text-red-400">
            * {errors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );
}

function UploadCertificate({
  files,
  onFileChange,
  onRemoveFile,
  error,
  containerRef,
}: {
  files: File[];
  onFileChange(selected: FileList | null): void;
  onRemoveFile(index: number): void;
  error?: string;
  containerRef?: React.Ref<HTMLDivElement>;
}) {
  const getFileIcon = (selected: File) => {
    if (selected.type.includes("pdf")) return "PDF";
    return "IMG";
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="flex w-full max-w-2xl flex-col space-y-6"
    >
      {/* Upload Box */}
      <label className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black transition-all duration-300 hover:border-white/40 hover:bg-white/4">
        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files)}
        />

        <div className="relative flex flex-col items-center space-y-4 text-neutral-400 transition-all duration-300 group-hover:text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 16V4M12 4L8 8M12 4L16 8" />
              <path d="M4 20H20" />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium tracking-wide">
              Tải lên ảnh giấy phép hành nghề
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Hỗ trợ PDF/JPG/PNG — tối đa 10MB mỗi ảnh, tối đa 3 ảnh
            </p>
          </div>
        </div>
      </label>

      {error && <p className="text-xs text-red-400">* {error}</p>}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3 transition hover:border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black text-xs font-medium text-neutral-300">
                  {getFileIcon(file)}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-white">{file.name}</span>
                  <span className="text-xs text-neutral-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <button
                onClick={() => onRemoveFile(index)}
                type="button"
                className="text-xs text-neutral-400 transition hover:text-red-500"
              >
                Xoá
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Security Note */}
      <div className="rounded-xl border border-white/5 bg-black px-4 py-3 text-xs text-neutral-500">
        Tài liệu của bạn sẽ được mã hoá và chỉ dùng cho mục đích xác minh chuyên
        môn. Chúng tôi cam kết bảo mật tuyệt đối.
      </div>
    </div>
  );
}
