import { useState, useEffect } from "react";
import DotGrid from "@/components/DotGrid";
import Typewriter from "@/components/Typewriter";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

export default function TestPage() {
  const [currentStep, setCurrentStep] = useState<"welcome" | "introduce">(
    "welcome",
  );

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
    <div className="relative min-h-screen w-screen bg-black font-sans selection:bg-white/20 selection:text-white">
      {/* Background DotGrid cố định cho toàn bộ trang */}
      <div className="fixed inset-0 z-0 pointer-events-none">
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
        {currentStep === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              filter: "blur(20px)",
              scale: 1.1,
              transition: { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] },
            }}
            className="min-h-screen w-full"
          >
            <WelcomeDoctorSection onStart={() => setCurrentStep("introduce")} />
          </motion.div>
        )}

        {currentStep === "introduce" && (
          <motion.div
            key="introduce"
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="min-h-screen w-full"
          >
            <IntroduceSection />
          </motion.div>
        )}
      </AnimatePresence>
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
              transition={{ duration: 1, ease: "easeOut" }}
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
              transition={{ duration: 0.8, ease: "easeOut" }}
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

// Nội dung chuẩn Blog cho Bác sĩ
const BLOG_CONTENT = [
  {
    title: "1. Hoàn thiện \"Hồ sơ số\" chuyên nghiệp",
    description: "Trước khi bắt đầu nhận ca tư vấn đầu tiên, hãy dành 5 phút để tạo dựng uy tín trong mắt bệnh nhân:",
    features: [
      {
        subtitle: "Xác minh danh tính",
        detail: "Tải lên Chứng chỉ hành nghề (CCHN) và bằng cấp liên quan. Hệ thống sẽ phê duyệt trong vòng 24h."
      },
      {
        subtitle: "Cập nhật chuyên khoa",
        detail: "Chọn đúng thế mạnh của mình (Nội khoa, Nhi khoa, Tim mạch...) để hệ thống điều phối đúng bệnh nhân cần hỗ trợ."
      },
      {
        subtitle: "Lời giới thiệu",
        detail: "Một đoạn giới thiệu ngắn về kinh nghiệm sẽ giúp bệnh nhân yên tâm hơn khi chọn Bác sĩ."
      }
    ]
  },
  {
    title: "2. Làm quen với Dashboard",
    description: "Giao diện Web Dashboard được tối ưu để Bác sĩ xử lý nhiều ca tư vấn cùng lúc mà không bị nhầm lẫn:",
    features: [
      {
        subtitle: "Sidebar (Thanh bên)",
        detail: "Nơi chuyển đổi giữa Danh sách bệnh nhân, Lịch sử tư vấn và Báo cáo thu nhập."
      },
      {
        subtitle: "Trung tâm thông báo",
        detail: "Tiếng chuông báo hiệu khi có bệnh nhân đang chờ hoặc có tin nhắn mới."
      },
      {
        subtitle: "Trạng thái Online/Offline",
        detail: "Hãy bật \"Sẵn sàng\" khi Bác sĩ có thời gian rảnh để bắt đầu nhận yêu cầu."
      }
    ]
  },
  {
    title: "3. Quy trình tư vấn chuẩn 5 bước",
    description: "Đây là \"xương sống\" trong công việc hàng ngày của Bác sĩ trên app:",
    features: [
      {
        subtitle: "Bước 1 - Tiếp nhận",
        detail: "Khi có yêu cầu chat, Bác sĩ sẽ thấy thông tin sơ bộ của bệnh nhân (Tuổi, giới tính, triệu chứng chính). Nhấn \"Chấp nhận\" để bắt đầu."
      },
      {
        subtitle: "Bước 2 - Phân tích dữ liệu",
        detail: "Điểm khác biệt của hệ thống là Bác sĩ có thể xem Nhật ký uống thuốc và Chỉ số sức khỏe (huyết áp, nhịp tim...) của bệnh nhân trong 30 ngày gần nhất."
      },
      {
        subtitle: "Bước 3 - Trao đổi",
        detail: "Sử dụng khung Chat để tư vấn. Bác sĩ có thể yêu cầu bệnh nhân chụp ảnh đơn thuốc cũ hoặc tình trạng bệnh lý hiện tại."
      },
      {
        subtitle: "Bước 4 - Kết luận & Dặn dò",
        detail: "Đưa ra lời khuyên chuyên môn hoặc hướng dẫn hướng điều trị tiếp theo."
      },
      {
        subtitle: "Bước 5 - Đóng ca tư vấn",
        detail: "Nhấn nút \"Hoàn thành tư vấn\" để hệ thống lưu hồ sơ và ghi nhận thù lao."
      }
    ]
  },
  {
    title: "4. Hệ thống chi trả & Thu nhập minh bạch",
    description: "Chúng tôi hiểu rằng thời gian của Bác sĩ là quý giá. Chính sách chi trả được thiết kế dựa trên hiệu suất:",
    features: [
      {
        subtitle: "Thù lao theo ca (Pay-per-case)",
        detail: "Mỗi ca hỗ trợ thành công (được bệnh nhân xác nhận hoặc hệ thống ghi nhận kết thúc) sẽ được cộng trực tiếp vào số dư."
      },
      {
        subtitle: "Thưởng hiệu quả",
        detail: "Các bác sĩ có tỉ lệ phản hồi nhanh và điểm đánh giá (Star Rating) cao sẽ được hệ thống ưu tiên hiển thị ở vị trí đầu."
      },
      {
        subtitle: "Rút tiền linh hoạt",
        detail: "Bác sĩ có thể theo dõi biến động số dư theo thời gian thực và thực hiện rút tiền về tài khoản ngân hàng."
      }
    ]
  }
];

function IntroduceSection() {
  return (
    <div className="relative min-h-screen w-full bg-black text-[#a1a1aa] font-sans antialiased">
      <main className="mx-auto max-w-[720px] px-6 py-20 md:py-32">
        {/* Header của Blog */}
        <motion.header
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-16 md:mb-20"
        >
          <div className="mb-8 flex items-center gap-3">
            <span className="text-xs font-semibold text-white tracking-widest uppercase">
              Hướng dẫn
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-700"></span>
            <span className="text-sm font-medium text-neutral-500">
              5 phút đọc
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-white leading-[1.1] mb-8">
            Chào mừng Bác sĩ đến với Hệ thống
          </h1>

          <p className="text-xl md:text-[22px] font-light text-neutral-300 leading-[1.6]">
            Đồng hành cùng bệnh nhân – Tối ưu hóa chuyên môn – Minh bạch thu nhập. Chào mừng Bác sĩ đã gia nhập mạng lưới chuyên gia của hệ thống. Chúng tôi không chỉ cung cấp một công cụ quản lý, mà còn mang đến một trải nghiệm tư vấn hiện đại, nơi Bác sĩ có thể hỗ trợ bệnh nhân dựa trên dữ liệu thực tế và nhận lại thù lao xứng đáng.
          </p>

          <div className="h-px w-full bg-neutral-900 mt-16" />
        </motion.header>

        {/* Nội dung chính */}
        <div className="space-y-16 md:space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-2xl md:text-[28px] font-bold text-white mb-8 tracking-tight">
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
              <h3 className="text-xl md:text-[24px] font-semibold text-white mb-4">
                {section.title}
              </h3>

              <p className="text-lg md:text-[19px] leading-[1.7] mb-8 font-light text-neutral-300">
                {section.description}
              </p>

              <div className="space-y-6">
                {section.features.map((feat, i) => (
                  <div key={i} className="md:pl-6 pl-4 border-l border-neutral-800 transition-colors hover:border-neutral-600">
                    <p className="text-lg md:text-[19px] leading-[1.7] font-light text-neutral-400">
                      <strong className="font-semibold text-neutral-200 mr-2">{feat.subtitle}:</strong>
                      {feat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Tips Section - Thẻ callout tối giản kiểu Antigravity */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="rounded-2xl bg-[#111] p-8 md:p-10 border border-[#222] mt-12"
          >
            <h3 className="text-xl md:text-[22px] font-bold text-white mb-6 flex items-center gap-3">
              <span>💡</span> Bí quyết để trở thành "Bác sĩ 5 sao"
            </h3>
            <div className="space-y-6">
              {[
                { title: "Phản hồi nhanh", desc: "Tốc độ phản hồi trong 2 phút đầu tiên quyết định 80% sự hài lòng của bệnh nhân." },
                { title: "Ghi chú chi tiết", desc: "Sau mỗi ca, hãy viết một bản tóm tắt ngắn. Bệnh nhân sẽ nhận được thông báo này và cảm thấy được quan tâm kỹ lưỡng." },
                { title: "Tận dụng dữ liệu", desc: "Đừng quên nhắc nhở bệnh nhân nếu thấy họ thường xuyên quên uống thuốc dựa trên dữ liệu app báo về." }
              ].map((tip, i) => (
                <p key={i} className="text-lg md:text-[19px] leading-[1.7] font-light text-neutral-400">
                  <strong className="font-semibold text-neutral-200 mr-2">{tip.title}.</strong>
                  {tip.desc}
                </p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer Support */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-24 md:mt-32 pt-12 border-t border-neutral-900"
        >
          <h4 className="text-lg md:text-[20px] font-semibold text-white mb-2">Bạn gặp khó khăn kỹ thuật?</h4>
          <p className="text-lg md:text-[19px] font-light leading-[1.7] mb-8 text-neutral-400">
            Đội ngũ hỗ trợ đối tác của chúng tôi luôn sẵn sàng tại mục "Hỗ trợ kỹ thuật" hoặc liên hệ đường dây nóng dưới đây.
          </p>
          <button className="flex items-center gap-3 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-colors text-sm md:text-base">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            1900-xxxx
          </button>
        </motion.footer>
      </main>
    </div>
  );
}
