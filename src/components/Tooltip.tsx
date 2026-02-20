import { motion, AnimatePresence } from "framer-motion";
import { useState, type ReactNode } from "react";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
};

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  // Motion variants
  const variants = {
    hidden: {
      opacity: 0,
      y: position === "top" ? 4 : position === "bottom" ? -4 : 0,
      scale: 0.95,
    },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      <AnimatePresence>
        {show && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 w-max max-w-xs rounded-md bg-black/90 px-3 py-1 text-xs text-white shadow-lg ${positionClasses[position]}`}
          >
            {content}
            <div
              className={`absolute h-2 w-2 rotate-45 bg-black/90 ${
                position === "top"
                  ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                  : position === "bottom"
                    ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    : position === "left"
                      ? "top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
                      : "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
