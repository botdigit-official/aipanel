import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeft,
  Rocket,
  Lock,
  X,
  Search,
  Sparkles,
  ChevronDown,
  ShieldAlert,
  Check,
  AlertTriangle,
  Blocks,
} from "lucide-react";
import type { OperatingMode } from "../../lib/types";
import { Button, IconButton } from "../../design-system";

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
  onDeployClick?: (targetEnv?: Environment) => void;
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

const envDetails: Record<
  Environment,
  { label: string; dot: string; bg: string; border: string; desc: string; text: string }
> = {
  dev: {
    label: "DEV",
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-400",
    desc: "Local machine isolated • Safe to modify",
  },
  staging: {
    label: "STAGING",
    dot: "bg-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    desc: "Pre-release sandbox • Candidate cluster",
  },
  production: {
    label: "PRODUCTION",
    dot: "bg-rose-500",
    bg: "bg-rose-500/15",
    border: "border-rose-500/35",
    text: "text-rose-400",
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
  operatingMode: _operatingMode = "desktop",
  onOpenModeSelector: _onOpenModeSelector,
  onOpenControlCenter,
  onDeployClick,
  onCloseProject,
  onOpenCommandPalette,
  onOpenChanges: _onOpenChanges,
  onOpenDoctor: _onOpenDoctor,
  focusMode: _focusMode,
  onToggleFocusMode: _onToggleFocusMode,
  showAI,
  onToggleAI,
}: TopBarProps) {
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showDeployDropdown, setShowDeployDropdown] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const currentEnv = envDetails[environment];

  const handleDeployClick = (target: Environment = environment) => {
    if (target === "production") {
      setShowProductionModal(true);
      setShowDeployDropdown(false);
      return;
    }
    setShowDeployDropdown(false);
    onDeployClick?.(target);
  };

  const confirmProductionDeploy = () => {
    if (confirmInput.trim().toUpperCase() === "DEPLOY") {
      setShowProductionModal(false);
      setConfirmInput("");
      onDeployClick?.("production");
    }
  };

  return (
    <>
      {/* Production Warning Banner */}
      {environment === "production" && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 px-4 py-1 flex items-center justify-between text-[11px] text-rose-200 select-none z-40">
          <div className="flex items-center gap-2 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>PRODUCTION SAFE MODE ACTIVE • LIVE CLUSTER MUTATIONS GATED</span>
          </div>
          <span className="font-mono text-[10px] text-rose-300 bg-black/40 px-2 py-0.5 rounded border border-rose-500/30">
            LOCKED
          </span>
        </div>
      )}

      {/* Main Top Bar */}
      <header className="h-12 bg-[#0B0C11] border-b border-white/8 px-3 flex items-center justify-between select-none z-30 shrink-0 gap-3">
        {/* ── Left: Brand, Project & Environment ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <IconButton
            variant="ghost"
            size="sm"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            icon={sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            onClick={onToggleSidebar}
          />

          {/* Brand & Project Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#11131A] border border-white/8">
            <div className="w-5 h-5 rounded-md bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400">
              {projectName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-zinc-100 truncate max-w-36">
              {projectName}
            </span>
            {projectPath && onCloseProject && (
              <button
                type="button"
                onClick={onCloseProject}
                className="text-zinc-500 hover:text-rose-400 transition-colors ml-1 p-0.5 cursor-pointer"
                title="Close Project Workspace"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Environment Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEnvDropdown(!showEnvDropdown)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${currentEnv.bg} ${currentEnv.border} ${currentEnv.text}`}
              title="Switch Target Environment"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentEnv.dot}`} />
              <span>{currentEnv.label}</span>
              {environment === "production" && <Lock className="w-3 h-3 text-rose-400 ml-0.5" />}
              <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {showEnvDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-56 p-1 bg-[#161923] border border-white/12 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/6 font-mono">
                  Select Environment
                </div>
                {(["dev", "staging", "production"] as Environment[]).map((envKey) => {
                  const meta = envDetails[envKey];
                  const isActive = environment === envKey;
                  return (
                    <button
                      key={envKey}
                      type="button"
                      onClick={() => {
                        onEnvironmentChange(envKey);
                        setShowEnvDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                        isActive ? `${meta.bg} ${meta.text}` : "hover:bg-white/5 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        <span className="font-semibold">{meta.label}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Unified Search / Command Center (⌘K) ── */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#11131A] hover:bg-[#161923] border border-white/10 hover:border-violet-500/30 text-xs text-zinc-400 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-violet-400 transition-colors shrink-0" />
              <span className="truncate text-zinc-400 group-hover:text-zinc-200">Search commands, files, fleet, actions...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-zinc-300 bg-white/5 border border-white/12 rounded shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ── Right Actions: AI, Control Center, Deploy Dropdown ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Toggle */}
          {onToggleAI && (
            <Button
              variant={showAI ? "primary" : "secondary"}
              size="xs"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={onToggleAI}
            >
              AI Agent
            </Button>
          )}

          {/* Control Center */}
          {onOpenControlCenter && (
            <Button
              variant="secondary"
              size="xs"
              icon={<Blocks className="w-3.5 h-3.5 text-zinc-400" />}
              onClick={onOpenControlCenter}
            >
              Control Center
            </Button>
          )}

          {/* Deploy Action Button with Target Dropdown */}
          <div className="relative">
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant={environment === "production" ? "danger" : "primary"}
                size="xs"
                icon={environment === "production" ? <Lock className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
                onClick={() => handleDeployClick(environment)}
              >
                Deploy
              </Button>
              <button
                type="button"
                onClick={() => setShowDeployDropdown(!showDeployDropdown)}
                className={`px-1.5 py-1 text-xs border-l border-white/20 rounded-r-md cursor-pointer transition-colors ${
                  environment === "production"
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-violet-600 hover:bg-violet-500 text-white"
                }`}
                title="Choose Target Environment to Deploy"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {showDeployDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-48 p-1 bg-[#161923] border border-white/12 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/6 font-mono">
                  Deploy Target
                </div>
                <button
                  type="button"
                  onClick={() => handleDeployClick("dev")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-white/5 rounded-md flex items-center justify-between"
                >
                  <span>Local DEV</span>
                  <span className="text-[10px] font-mono text-zinc-500">Fast reload</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeployClick("staging")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-sky-300 hover:bg-sky-500/10 rounded-md flex items-center justify-between"
                >
                  <span>Staging Fleet</span>
                  <span className="text-[10px] font-mono text-sky-400">Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeployClick("production")}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/15 rounded-md flex items-center justify-between font-semibold"
                >
                  <span>Production Live</span>
                  <Lock className="w-3 h-3 text-rose-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Production Deployment Confirmation Dialog */}
      {showProductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowProductionModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#161923] border border-rose-500/40 rounded-2xl p-6 z-10 shadow-2xl space-y-4 text-zinc-100 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-300">
                  Deploy to LIVE Production?
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  This triggers zero-downtime release to live cluster: <span className="font-mono text-zinc-200">botdigit.com</span>
                </p>
              </div>
            </div>

            <div className="p-3 bg-black/40 border border-white/6 rounded-lg text-xs space-y-1 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">Target:</span>
                <span className="font-mono font-semibold text-rose-400">PRODUCTION</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pre-flight checks:</span>
                <span className="text-emerald-400">All 6 gates passing</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                Type <span className="font-mono text-rose-400 font-bold">DEPLOY</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DEPLOY"
                className="w-full bg-[#11131A] border border-rose-500/40 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-rose-500 font-mono"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowProductionModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={confirmInput.trim().toUpperCase() !== "DEPLOY"}
                onClick={confirmProductionDeploy}
              >
                Confirm Live Deploy
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
