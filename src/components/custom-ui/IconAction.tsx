type IconActionProps = {
  icon: React.ReactNode;
  danger?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?(): void;
};

export default function IconAction({
  icon,
  danger = false,
  className = "",
  disabled = false,
  onClick,
}: IconActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-1.5 text-gray-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-white/10 ${
        danger
          ? "hover:text-red-500 dark:hover:text-red-400"
          : "hover:text-primary dark:hover:text-white"
      } ${className}`}
    >
      {icon}
    </button>
  );
}
