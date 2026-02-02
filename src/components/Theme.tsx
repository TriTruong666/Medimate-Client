/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
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
      className="relative h-9 w-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition"
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

  const toggleTheme = () => {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:bg-white/10"
    >
      {/* Glow */}
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
