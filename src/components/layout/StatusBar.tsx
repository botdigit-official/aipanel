import {
  GitBranch,
  Cpu,
  Layers,
  Lock,
} from "lucide-react";
import type { Environment } from "./TopBar";
import type { ServiceStatus } from "../../lib/services";

export type { ServiceStatus };

interface StatusBarProps {
  environment: Environment;
  services: ServiceStatus[];
  activeFile?: string;
  cursorPosition?: { line: number; col: number };
  fileCount?: number;
  gitBranch?: string;
  onSelectService?: (name: string) => void;
  onSelectBranch?: () => void;
  onSelectEnvironment?: () => void;
}

const envBadgeConfig: Record<
  Environment,
  { label: string; dot: string; text: string; bg: string }
> = {
  dev: {
    label: "DEV",
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    bg: "hover:bg-emerald-500/10",
  },
  staging: {
    label: "STAGING",
    dot: "bg-amber-400",
    text: "text-amber-400",
    bg: "hover:bg-amber-500/10",
  },
  production: {
    label: "PRODUCTION",
    dot: "bg-rose-500",
    text: "text-rose-400",
    bg: "hover:bg-rose-500/15",
  },
};

export default function StatusBar({
  environment,
  services,
  activeFile,
  cursorPosition,
  gitBranch,
  onSelectService,
  onSelectBranch,
  onSelectEnvironment,
}: StatusBarProps) {
  const envMeta = envBadgeConfig[environment] || envBadgeConfig.dev;

  return (
    <footer className="h-6.5 bg-[#141622] border-t border-[#222736] px-2.5 flex items-center justify-between text-xs select-none z-30 shrink-0 font-sans">
      {/* ── Left Interactive Status Modules ── */}
      <div className="flex items-center divide-x divide-[#222736]">
        {/* Environment Button */}
        <button
          type="button"
          onClick={onSelectEnvironment}
          className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors cursor-pointer ${envMeta.bg}`}
          title={`Active Environment: ${envMeta.label} (Click to manage)`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${envMeta.dot} shrink-0`} />
          <span className={`font-bold text-[11px] ${envMeta.text}`}>
            {envMeta.label}
          </span>
          {environment === "production" && (
            <Lock className="w-3 h-3 text-rose-400 shrink-0 ml-0.5" />
          )}
        </button>

        {/* Git Branch */}
        <button
          type="button"
          onClick={onSelectBranch}
          className="flex items-center gap-1.5 px-2.5 py-1 text-zinc-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          title={`Git Branch: ${gitBranch || "main"} (Click to view source control)`}
        >
          <GitBranch className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="text-[11px] font-medium">{gitBranch || "main"}</span>
        </button>

        {/* Services Status */}
        <div className="hidden sm:flex items-center divide-x divide-white/6">
          {services.map((srv) => {
            const Icon = srv.icon;
            const isOnline = srv.status === "running";

            return (
              <button
                key={srv.name}
                type="button"
                onClick={() => onSelectService?.(srv.name)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer text-[11px]"
                title={`${srv.name}: ${srv.status}${srv.port ? ` on port ${srv.port}` : ""}`}
              >
                <Icon
                  className={`w-3 h-3 shrink-0 ${
                    isOnline ? "text-emerald-400" : "text-zinc-500"
                  }`}
                />
                <span className={isOnline ? "text-zinc-200" : "text-zinc-500"}>
                  {srv.name}
                </span>
                {srv.port && (
                  <span className="text-[10px] text-zinc-500">:{srv.port}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Host Telemetry Metrics */}
        <div className="hidden md:flex items-center gap-3 px-2.5 py-1 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-zinc-400">
            <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>CPU 3%</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <Layers className="w-3 h-3 text-purple-400 shrink-0" />
            <span>RAM 1.2 GB</span>
          </span>
        </div>
      </div>

      {/* ── Right Buffer & Coordinate Info ── */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pr-1">
        {cursorPosition && (
          <span className="text-zinc-300">
            Ln {cursorPosition.line}, Col {cursorPosition.col}
          </span>
        )}
        <span className="text-zinc-500 uppercase hidden lg:inline">UTF-8</span>
        {activeFile && (
          <span className="text-zinc-200 font-medium truncate max-w-44">
            {activeFile.split("/").pop()}
          </span>
        )}
      </div>
    </footer>
  );
}

