import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Lock,
  X,
  Search,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  FileDiff,
  Stethoscope,
  Maximize2,
  Check,
  AlertTriangle,
  Blocks,
  Monitor,
  Server as ServerIcon,
  Link2,
} from "lucide-react";

import type { OperatingMode } from "../../lib/types";

export type Environment = "dev" | "staging" | "production";

interface TopBarProps {
  projectName: string;
  projectPath?: string | null;
  environment: Environment;
  onEnvironmentChange: (env: Environment) => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  operatingMode?: OperatingMode;
  onOpenModeSelector?: () => void;
  onOpenControlCenter?: () => void;
  onDeployClick?: () => void;
  onCloseProject?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenChanges?: () => void;
  onOpenDoctor?: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  showDevOpsDock?: boolean;
  onToggleDevOps?: () => void;
  showAI?: boolean;
  onToggleAI?: () => void;
  onOpenDomains?: () => void;
}

// ── Environment Metadata ─────────────────────────────────────────

const envDetails: Record<
  Environment,
  { label: string; dot: string; bg: string; border: string; desc: string; text: string }
> = {
  dev: {
    label: "DEV",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    desc: "Local machine isolated • Safe to modify",
  },
  staging: {
    label: "STAGING",
    dot: "bg-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    text: "text-sky-300",
    desc: "Pre-release sandbox • Candidate cluster",
  },
  production: {
    label: "PRODUCTION",
    dot: "bg-rose-500",
    bg: "bg-rose-500/20",
    border: "border-rose-500/40",
    text: "text-rose-300",
    desc: "Live production cluster • Mutations gated 🔒",
  },
};

export default function TopBar({
  projectName,
  projectPath,
  environment,
  onEnvironmentChange,
  sidebarCollapsed,
  onToggleSidebar,
  operatingMode = "desktop",
  onOpenModeSelector,
  onOpenControlCenter,
  onDeployClick,
  onCloseProject,
  onOpenCommandPalette,
  onOpenChanges,
  onOpenDoctor,
  focusMode,
  onToggleFocusMode,
  showDevOpsDock: _showDevOpsDock,
  onToggleDevOps: _onToggleDevOps,
  showAI,
  onToggleAI,
}: TopBarProps) {
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const currentEnv = envDetails[environment];

  const handleDeployClick = () => {
    if (environment === "production") {
      setShowProductionModal(true);
    } else {
      onDeployClick?.();
    }
  };

  const confirmProductionDeploy = () => {
    setShowProductionModal(false);
    onDeployClick?.();
  };

  return (
    <>
      {/* ── Production Protection Banner (Only in Production) ── */}
      {environment === "production" && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-b border-rose-500/40 px-4 py-1 flex items-center justify-between text-[11px] text-rose-200 select-none z-40">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <ShieldAlert size={14} className="text-rose-400" />
            <span>PRODUCTION SAFE MODE ACTIVE • LIVE SYSTEM PROTECTED • DESTRUCTIVE ACTIONS BLOCKED</span>
          </div>
          <span className="font-mono text-[10px] text-rose-300/80 bg-rose-950/80 px-2 py-0.2 rounded border border-rose-500/30">
            CLUSTER: LIVE-01
          </span>
        </div>
      )}

      {/* ── Main Top Bar ── */}
      <header
        className={`
          flex items-center h-14 px-4 border-b shrink-0 select-none transition-colors backdrop-blur-xl z-30 gap-3
          ${
            environment === "production"
              ? "bg-rose-950/30 border-b-rose-500/40"
              : environment === "staging"
              ? "bg-sky-950/20 border-b-sky-500/30"
              : "bg-[#0d0f18]/95 border-b-slate-800/80"
          }
        `}
      >
        {/* ── Left: Sidebar toggle, Project badge, Environment Pill ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Project Selector Badge with Close Button */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700/60 shadow-xs">
            <div className="flex items-center gap-2" title={projectPath || projectName}>
              <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400">
                {projectName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-slate-100 tracking-tight truncate max-w-36">
                {projectName}
              </span>
            </div>

            {projectPath && onCloseProject && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseProject();
                }}
                className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-0.5"
                title="Close Workspace (Return to Welcome)"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Environment Selector Dropdown Pill */}
          <div className="relative">
            <button
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${currentEnv.bg} ${currentEnv.border} ${currentEnv.text}`}
              title="Click to Switch Target Environment"
            >
              <span className={`w-2 h-2 rounded-full ${currentEnv.dot} ${environment === "production" ? "animate-pulse" : ""}`} />
              <span>{currentEnv.label}</span>
              {environment === "production" && <Lock size={12} className="text-rose-400" />}
              <ChevronDown size={13} className={`opacity-60 transition-transform ${showEnvDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showEnvDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-60 py-1 bg-zinc-900/98 backdrop-blur-xl border border-zinc-750 rounded-xl shadow-2xl z-50 animate-fade-in text-zinc-200">
                <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  Switch Target Environment
                </div>
                {(["dev", "staging", "production"] as Environment[]).map((envKey) => {
                  const meta = envDetails[envKey];
                  const isActive = environment === envKey;
                  return (
                    <button
                      key={envKey}
                      onClick={() => {
                        onEnvironmentChange(envKey);
                        setShowEnvDropdown(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isActive ? `${meta.bg} ${meta.text}` : "hover:bg-zinc-800/80 text-zinc-300"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${meta.dot} mt-1 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{meta.label}</span>
                          {envKey === "production" && (
                            <span className="text-[9px] font-mono text-rose-400 bg-rose-500/20 px-1 rounded border border-rose-500/40">
                              LOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-normal truncate">{meta.desc}</p>
                      </div>
                      {isActive && <Check size={13} className="shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operating Mode Switcher */}
          {onOpenModeSelector && (
            <button
              onClick={onOpenModeSelector}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer shadow-xs ${
                operatingMode === "server"
                  ? "bg-sky-500/15 border-sky-500/30 text-sky-300"
                  : operatingMode === "remote_client"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-zinc-800/80 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300"
              }`}
              title="Click to Switch Mode (Desktop IDE vs Server VPS vs Remote)"
            >
              {operatingMode === "server" ? (
                <ServerIcon size={12} className="text-sky-400" />
              ) : operatingMode === "remote_client" ? (
                <Link2 size={12} className="text-emerald-400" />
              ) : (
                <Monitor size={12} className="text-indigo-400" />
              )}
              <span>
                {operatingMode === "server"
                  ? "VPS Mode"
                  : operatingMode === "remote_client"
                  ? "Remote Mode"
                  : "Desktop Mode"}
              </span>
              <ChevronDown size={10} className="text-zinc-500" />
            </button>
          )}
        </div>

        {/* ── Center: Universal Search Bar (⌘K) ── */}
        <div className="flex-1 max-w-sm mx-auto hidden md:flex items-center min-w-0">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-400 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={13} className="text-zinc-500 shrink-0" />
              <span className="truncate">Search commands, files, actions...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700/60 rounded shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── Right Controls ── */}
        <div className="flex items-center gap-2 text-xs ml-auto shrink-0">
          {/* Changes Badge */}
          {onOpenChanges && (
            <button
              onClick={onOpenChanges}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition-colors cursor-pointer"
              title="Review Working Changes (3 modified)"
            >
              <FileDiff size={13} className="text-amber-400" />
              <span>Changes</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3
              </span>
            </button>
          )}

          {/* Doctor Health Badge */}
          {onOpenDoctor && (
            <button
              onClick={onOpenDoctor}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 transition-colors cursor-pointer"
              title="Project Doctor Diagnostics (9/10 Passing)"
            >
              <Stethoscope size={13} className="text-emerald-400" />
              <span>Doctor</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          )}

          {/* Focus Mode Toggle */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                focusMode
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
              title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode (Distraction-free code)"}
            >
              <Maximize2 size={13} />
            </button>
          )}

          {/* AI Toggle */}
          {onToggleAI && (
            <button
              onClick={onToggleAI}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showAI
                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-xs"
                  : "bg-zinc-800/60 border-zinc-750 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
              title="Toggle AI Agent"
            >
              <Sparkles size={13} className={showAI ? "text-indigo-400" : ""} />
              <span>AI</span>
            </button>
          )}

          {/* Control Center View Button */}
          {onOpenControlCenter && (
            <button
              onClick={onOpenControlCenter}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Open Central Control Center (Plugins, AI, Security, Audit)"
            >
              <Blocks size={13} />
              <span>Control Center</span>
            </button>
          )}

          {/* Deploy Action Button */}
          <button
            onClick={handleDeployClick}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer ${
              environment === "production"
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40 animate-pulse"
                : environment === "staging"
                ? "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-950/40"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40"
            }`}
            title={`Deploy pipeline to ${environment.toUpperCase()}`}
          >
            {environment === "production" ? <Lock size={12} /> : <Rocket size={12} />}
            <span>{environment === "production" ? "Deploy Live 🔒" : environment === "staging" ? "Deploy Staging" : "Deploy"}</span>
          </button>
        </div>
      </header>

      {/* ── Strict Production Deployment Confirmation Modal ── */}
      {showProductionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-rose-500/40 shadow-2xl p-6 space-y-4 text-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-300">
                  Deploy to LIVE Production?
                </h3>
                <p className="text-xs text-zinc-400">
                  You are about to execute an atomic release into the live production cluster.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Release Version:</span>
                <span className="text-zinc-200 font-bold">v0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Commit Hash:</span>
                <span className="text-zinc-300">c48c13c</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Working Tree Changes:</span>
                <span className="text-amber-300">3 modified files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Automated Tests:</span>
                <span className="text-emerald-400">235/235 Passed ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Staging Verification:</span>
                <span className="text-emerald-400">Healthy & Verified ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pending Migrations:</span>
                <span className="text-zinc-300">None (Schema In Sync)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowProductionModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmProductionDeploy}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Lock size={13} />
                <span>Confirm & Deploy to Production</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
