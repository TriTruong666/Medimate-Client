import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";

type Option = {
  label: string;
  value: string;
};

type GlassSelectProps = {
  value?: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function GlassSelect({
  value,
  options,
  placeholder = "Chọn một giá trị",
  onChange,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-[13px] text-gray-200 backdrop-blur-md transition hover:bg-white/6 focus:outline-none"
      >
        <span className={selected ? "text-white" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>

        <HiChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          data-lenis-prevent
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-900/90 shadow-[0_20px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl"
        >
          <ul className="max-h-60 overflow-y-auto overscroll-contain">
            {options.map((opt) => {
              const active = opt.value === value;

              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2.5 text-sm transition ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    } `}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
