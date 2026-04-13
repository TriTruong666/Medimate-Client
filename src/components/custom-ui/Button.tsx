import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  color?: "red" | "yellow" | "green" | "white";
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  // special for hover-opacity effect
  hoverParent?: boolean;
};

export function Button({
  children,
  color = "white",
  size = "sm",
  className = "",
  onClick,
  disabled = false,
  hoverParent = false,
}: ButtonProps) {
  const colors = {
    red: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
    green: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20",
    white: "bg-white/10 text-white hover:bg-white/20",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2 text-sm",
  };

  const opacityClass = hoverParent ? "opacity-0 group-hover:opacity-100" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl ${colors[color]} ${sizes[size]} ${opacityClass} transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}
