import { Database, Wifi, HardDrive, GitBranch, type LucideIcon } from "lucide-react";
import type { Environment } from "./TopBar";

// ── Types ────────────────────────────────────────────────────────

interface StatusBarProps {
  environment: Environment;
  services: ServiceStatus[];
  activeFile?: string;
  cursorPosition?: { line: number; col: number };
  fileCount?: number;
  gitBranch?: string;
}

export interface ServiceStatus {
  name: string;
  icon: LucideIcon;
  status: "running" | "stopped" | "error";
  port?: number;
}

// ── Env Colors ───────────────────────────────────────────────────

const envColors: Record<Environment, string> = {
  dev: "bg-status-success",
  staging: "bg-status-warning",
  production: "bg-status-error",
};

const envLabels: Record<Environment, string> = {
  dev: "DEV",
  staging: "STAGING",
  production: "PRODUCTION",
};

// ── Component ────────────────────────────────────────────────────

export default function StatusBar({
  environment,
  services,
  activeFile,
  cursorPosition,
  fileCount,
  gitBranch,
}: StatusBarProps) {
  return (
    <footer
      className={`
        flex items-center h-6.5 px-3 text-[11px] select-none
        border-t border-zinc-800/80 shrink-0
        ${environment === "production"
          ? "bg-rose-950/30 border-t-rose-500/30 text-rose-300"
          : "bg-zinc-950 text-zinc-400"
        }
      `}
    >
      {/* Environment */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-zinc-800/70">
        <span className={`w-1.5 h-1.5 rounded-full ${envColors[environment]} animate-pulse`} />
        <span className="font-semibold text-zinc-300 tracking-tight">{envLabels[environment]}</span>
      </div>

      {/* Git Branch */}
      <div className="flex items-center gap-1.5 px-3 border-r border-zinc-800/70 text-zinc-400 font-mono text-[11px]">
        <GitBranch size={11} className="text-indigo-400" />
        <span className="text-zinc-300">{gitBranch || "main"}</span>
      </div>

      {/* Services */}
      <div className="flex items-center gap-3 px-3 border-r border-zinc-800/70">
        {services.map((service) => {
          const Icon = service.icon;
          const isRunning = service.status === "running";
          return (
            <div
              key={service.name}
              className="flex items-center gap-1.5"
              title={`${service.name}: ${service.status}${service.port ? ` (port ${service.port})` : ""}`}
            >
              <Icon size={11} className={isRunning ? "text-emerald-400" : "text-zinc-500"} />
              <span className={`font-medium text-[11px] ${isRunning ? "text-emerald-400" : "text-zinc-400"}`}>
                {service.name}
              </span>
              {service.port && (
                <span className="text-zinc-500 font-mono text-[10px]">:{service.port}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Telemetry quick metrics */}
      <div className="hidden md:flex items-center gap-2 px-3 border-r border-zinc-800/70 text-[10px] font-mono text-zinc-500">
        <span>RAM 1.2 GB</span>
        <span>•</span>
        <span>CPU 3%</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* File info & Encoding */}
      <div className="flex items-center gap-3 text-zinc-400 text-[11px]">
        {cursorPosition && (
          <span className="font-mono text-zinc-300">
            Ln {cursorPosition.line}, Col {cursorPosition.col}
          </span>
        )}
        <span className="hidden sm:inline font-mono text-[10px] text-zinc-500 uppercase">UTF-8</span>
        {activeFile && (
          <span className="truncate max-w-48 text-zinc-300 font-medium">
            {activeFile.split("/").pop()}
          </span>
        )}
        {fileCount !== undefined && (
          <span className="text-zinc-500">{fileCount} files</span>
        )}
      </div>
    </footer>
  );
}

// Default services for development
export const defaultDevServices: ServiceStatus[] = [
  { name: "PostgreSQL", icon: Database, status: "stopped" },
  { name: "Redis", icon: HardDrive, status: "stopped" },
  { name: "Tunnel", icon: Wifi, status: "stopped" },
];
