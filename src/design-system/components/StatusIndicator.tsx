import React from "react";
import type { StatusType } from "./Badge";

export interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  sublabel?: string;
  pulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}

const colorMap: Record<StatusType, { dot: string; text: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-400" },
  connected: { dot: "bg-sky-400", text: "text-sky-400" },
  running: { dot: "bg-cyan-400", text: "text-cyan-400" },
  degraded: { dot: "bg-amber-400", text: "text-amber-400" },
  offline: { dot: "bg-zinc-500", text: "text-zinc-400" },
  protected: { dot: "bg-rose-400", text: "text-rose-400" },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  pulse = false,
  size = "sm",
  className = "",
}) => {
  const { dot, text } = colorMap[status] || colorMap.active;
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex shrink-0">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dot}`} />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${dot}`} />
      </span>
      {label && (
        <span className={`text-xs font-medium leading-none ${text}`}>
          {label}
          {sublabel && <span className="ml-1 text-zinc-500 font-normal">({sublabel})</span>}
        </span>
      )}
    </div>
  );
};
