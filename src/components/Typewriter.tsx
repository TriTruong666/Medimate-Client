import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  textClassName?: string;
  cursorClassName?: string;
  showCursor?: boolean;
  onComplete?: () => void;
  preserveLayout?: boolean;
  cursorChar?: string;
}

const Typewriter = ({
  text,
  speed = 40,
  delay = 0,
  className,
  textClassName,
  cursorClassName,
  showCursor = true,
  onComplete,
  preserveLayout = true,
  cursorChar = "|",
}: TypewriterProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const segments = useMemo(() => text.split(/(\s+)/), [text]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let charIndex = 0;

    const type = () => {
      if (charIndex < text.length) {
        charIndex++;
        setCurrentIndex(charIndex);
        timeoutId = setTimeout(type, speed);
      } else {
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    };

    const delayTimeoutId = setTimeout(type, delay);

    return () => {
      clearTimeout(delayTimeoutId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, speed, delay, onComplete]);

  let absoluteCharIndex = 0;

  return (
    <div className={cn("inline leading-relaxed", className)} aria-label={text}>
      {segments.map((segment, segmentIdx) => {
        const charArray = Array.from(segment);
        const segmentStartIdx = absoluteCharIndex;
        absoluteCharIndex += charArray.length;

        const isWhitespace = /^\s+$/.test(segment);

        return (
          <span
            key={segmentIdx}
            className={cn(
              !isWhitespace && "inline-block whitespace-nowrap",
              !preserveLayout && currentIndex <= segmentStartIdx && "hidden",
            )}
          >
            {charArray.map((char, charIdx) => {
              const globalIdx = segmentStartIdx + charIdx;
              const isVisible = currentIndex > globalIdx;

              // Logic xác định vị trí cursor
              const isFirstCharOverall = globalIdx === 0;
              const isLastTypedChar =
                currentIndex > 0 && currentIndex === globalIdx + 1;
              const isAtBeginning = currentIndex === 0 && isFirstCharOverall;
              const shouldShowCursorHere =
                showCursor && !isComplete && (isLastTypedChar || isAtBeginning);

              return (
                <span
                  key={charIdx}
                  className={cn(
                    "relative transition-opacity duration-0", // Dùng relative để làm gốc cho cursor absolute
                    textClassName,
                    preserveLayout
                      ? isVisible
                        ? "opacity-100"
                        : "opacity-0"
                      : isVisible
                        ? "inline"
                        : "hidden",
                  )}
                >
                  {char}

                  {shouldShowCursorHere && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={cn(
                        "text-primary pointer-events-none absolute top-0 inline-block font-bold",
                        // Nếu đang ở vị trí bắt đầu thì nằm ở bên trái ký tự đầu tiên
                        // Nếu đã gõ thì nằm ở bên phải ký tự vừa gõ
                        isAtBeginning ? "left-0" : "left-full ml-0.5",
                        cursorClassName,
                      )}
                    >
                      {cursorChar === "|" ? (
                        <span className="inline-block h-[1.1em] w-0.5 bg-current align-middle" />
                      ) : (
                        cursorChar
                      )}
                    </motion.span>
                  )}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};

export default Typewriter;
