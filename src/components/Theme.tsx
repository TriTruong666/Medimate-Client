/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { HiSun, HiMoon } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

export function DarkModePillSwitch() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark((v) => !v);
  };

  return (
    <button
      onClick={toggle}
      className="relative h-9 w-16 rounded-full border border-gray-300 bg-white transition-all dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md"
    >
      {/* Thumb */}
      <span
        className={`absolute top-0.5 left-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow transition-all duration-300 ${
          dark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {dark ? (
          <HiMoon className="text-sm text-indigo-600" />
        ) : (
          <HiSun className="text-sm text-amber-500" />
        )}
      </span>
    </button>
  );
}

export function DarkModeIconSwitch() {
  const [dark, setDark] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDark(false);
    }
  }, []);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const nextDark = !isDark;

    // Lấy tọa độ tâm của nút bấm để làm gốc vòng tròn
    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? Math.round(rect.left + rect.width / 2) : e.clientX;
    const y = rect ? Math.round(rect.top + rect.height / 2) : e.clientY;

    // Tính bán kính đủ để phủ hết màn hình từ điểm click
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const applyTheme = () => {
      if (nextDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      setDark(nextDark);
    };

    // Fallback cho browser không hỗ trợ View Transitions API
    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    const transition = document.startViewTransition(applyTheme);

    transition.ready.then(() => {
      // Luôn animate layer MỚI mở rộng từ điểm click ra toàn màn hình
      // z-index trong CSS đảm bảo new layer luôn nằm trên old layer
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 bg-white transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md dark:hover:bg-white/10"
    >
      {/* Glow dark mode */}
      <AnimatePresence>
        {dark && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl bg-indigo-500/30 blur-md"
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <AnimatePresence mode="wait">
        {dark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <HiMoon className="text-lg text-indigo-400" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <HiSun className="text-lg text-amber-400" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
