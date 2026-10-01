import React from "react";

export type BadgeCategory = "status" | "env" | "type" | "neutral";
export type StatusType = "active" | "connected" | "running" | "degraded" | "offline" | "protected";
export type EnvType = "dev" | "staging" | "production";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  category?: BadgeCategory;
  status?: StatusType;
  env?: EnvType;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

const statusStyles: Record<StatusType, { bg: string; dot: string }> = {
  active: {
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  connected: {
    bg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dot: "bg-sky-400",
  },
  running: {
    bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    dot: "bg-cyan-400",
  },
  degraded: {
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  offline: {
    bg: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dot: "bg-zinc-400",
  },
  protected: {
    bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
};

const envStyles: Record<EnvType, { bg: string; dot: string }> = {
  dev: {
    bg: "bg-violet-500/10 text-violet-300 border-violet-500/25",
    dot: "bg-violet-400",
  },
  staging: {
    bg: "bg-amber-500/10 text-amber-300 border-amber-500/25",
    dot: "bg-amber-400",
  },
  production: {
    bg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    dot: "bg-rose-500",
  },
};

export const Badge: React.FC<BadgeProps> = ({
  category = "neutral",
  status = "active",
  env = "dev",
  dot = false,
  pulse = false,
  children,
  className = "",
  ...props
}) => {
  let styleClasses = "bg-white/5 text-zinc-300 border-white/10";
  let dotColor = "bg-zinc-400";

  if (category === "status" && statusStyles[status]) {
    styleClasses = statusStyles[status].bg;
    dotColor = statusStyles[status].dot;
  } else if (category === "env" && envStyles[env]) {
    styleClasses = envStyles[env].bg;
    dotColor = envStyles[env].dot;
  } else if (category === "type") {
    styleClasses = "bg-white/5 text-zinc-300 border-white/10 font-semibold tracking-wider";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border leading-none shrink-0 ${styleClasses} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
        </span>
      )}
      {children}
    </span>
  );
};
