import { useEffect, useRef } from "react";

export function useAutoResizeTextarea(value: string, maxHeight = 160) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.style.height = "auto";

    const newHeight = Math.min(ref.current.scrollHeight, maxHeight);
    ref.current.style.height = `${newHeight}px`;
  }, [value, maxHeight]);

  return ref;
}
