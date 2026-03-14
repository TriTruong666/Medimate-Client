type BadgeTypeProps = "error" | "success" | "info" | "warning";

type BadgeProps = {
  value: string;
  type: BadgeTypeProps;
};

type BadgeIconProps = {
  icon: React.ReactNode;
  type: BadgeTypeProps;
};

export function Badge({ value, type }: BadgeProps) {
  const styles = {
    error: {
      border: "border-red-500/30",
      messageColor: "text-red-500",
      bg: "bg-red-500/10",
    },
    warning: {
      border: "border-yellow-500/30",
      messageColor: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
    success: {
      border: "border-emerald-500/30",
      messageColor: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    info: {
      border: "border-white/20",
      messageColor: "text-white",
      bg: "bg-gray-500/10",
    },
  }[type];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur ${styles.bg} ${styles.border}`}
    >
      <span className={styles.messageColor}>{value}</span>
    </span>
  );
}

export function IconBadge({ icon, type }: BadgeIconProps) {
  const styles = {
    error: {
      border: "border-red-500/30",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-500",
    },
    warning: {
      border: "border-yellow-500/30",
      iconBg: "bg-yellow-500/10",
      iconColor: "text-yellow-400",
    },
    success: {
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    info: {
      border: "border-white/20",
      iconBg: "bg-white/10",
      iconColor: "text-white",
    },
  }[type];

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur ${styles.border} ${styles.iconBg}`}
    >
      <span className={`${styles.iconColor} text-sm`}>{icon}</span>
    </span>
  );
}
