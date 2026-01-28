// ToastContainer.tsx
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { toastStore, type ToastItem } from "../stores/toastStore";
import Toast from "./Toast";

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return (
    <div className="fixed top-6 right-6 z-60 w-full max-w-md space-y-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={toastStore.remove} />
        ))}
      </AnimatePresence>
    </div>
  );
}
