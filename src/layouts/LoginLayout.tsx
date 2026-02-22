import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ColorBends, { Aurora, FloatingLines } from "../components/LoginTheme";

type ThemeType = "aurora" | "lines" | "bends" | "grid";

export default function LoginLayout() {
  const [theme, setTheme] = useState<ThemeType>("aurora");

  const themes: { id: ThemeType; name: string }[] = [
    { id: "aurora", name: "Aurora" },
    { id: "lines", name: "Lines" },
    { id: "bends", name: "Bends" },
    { id: "grid", name: "Grid" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {theme === "aurora" && (
              <Aurora
                colorStops={["#7cff67", "#B19EEF", "#5227FF"]}
                blend={0.5}
                amplitude={1.0}
                speed={1}
              />
            )}
            {theme === "lines" && (
              <FloatingLines
                enabledWaves={["middle", "top", "bottom"]}
                lineCount={4}
                lineDistance={10}
                bendRadius={10}
                bendStrength={-0.5}
                interactive={true}
                parallax={true}
              />
            )}
            {theme === "bends" && (
              <ColorBends
                colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
                rotation={0}
                speed={0.2}
                scale={1}
                frequency={1}
                warpStrength={1}
                mouseInfluence={1}
                parallax={0.5}
                noise={0.1}
                transparent
                autoRotate={0}
              />
            )}
            {theme === "grid" && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                  backgroundSize: "60px 60px",
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed top-8 right-8 z-50">
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative cursor-pointer px-4 py-2 text-[11px] font-semibold tracking-wider transition-all duration-300 ${
                theme === t.id ? "text-black" : "text-white/50 hover:text-white"
              }`}
            >
              <span className="relative z-10 font-sans uppercase transition-colors duration-500">
                {t.name}
              </span>
              {theme === t.id && (
                <motion.div
                  layoutId="activeTheme"
                  className="absolute inset-0 rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
