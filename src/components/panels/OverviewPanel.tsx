import { useState } from "react";
import {
  Play,
  Square,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Rocket,
  GitBranch,
  Layers,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Stethoscope,
  FileCode,
  Check,
  Lock,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

interface OverviewPanelProps {
  environment: Environment;
  projectName?: string;
  projectPath?: string | null;
  onNavigate: (panelId: string) => void;
  onEnvironmentChange: (env: Environment) => void;
}

export default function OverviewPanel({
  environment,
  projectName = "aipanel",
  projectPath: _projectPath,
  onNavigate,
  onEnvironmentChange,
}: OverviewPanelProps) {
  const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  // One-click Development state
  const [devRunning, setDevRunning] = useState(true);
  const [devStarting, setDevStarting] = useState(false);

  const toggleDevelopment = async () => {
    if (devRunning) {
      setDevRunning(false);
    } else {
      setDevStarting(true);
      await new Promise((r) => setTimeout(r, 600));
      setDevStarting(false);
      setDevRunning(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* ── 1. Hero Header & One-Button Development ── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-zinc-900/70 to-zinc-950 border border-indigo-500/20 shadow-xl backdrop-blur-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold tracking-tight text-zinc-100">
                {projectName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                React 19 • Vite • Tauri
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-zinc-800">
                <GitBranch size={12} className="text-indigo-400" />
                main
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Local-first AI IDE + isolated production deployment engine. Write code, manage services, deploy zero-downtime releases.
            </p>
          </div>

          {/* One-Button Start/Stop Development */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleDevelopment}
              disabled={devStarting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                devStarting
                  ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : devRunning
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 hover:scale-[1.02]"
              }`}
            >
              {devStarting ? (
                <RefreshCw size={14} className="animate-spin text-emerald-400" />
              ) : devRunning ? (
                <Square size={13} className="text-amber-400 fill-amber-400" />
              ) : (
                <Play size={13} className="fill-white" />
              )}
              <span>
                {devStarting
                  ? "Starting All Services..."
                  : devRunning
                  ? "Stop Development"
                  : "▶ Start Development"}
              </span>
            </button>

            <button
              onClick={() => onNavigate("releases")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                environment === "production"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40"
              }`}
            >
              {environment === "production" ? <Lock size={13} /> : <Rocket size={13} />}
              <span>Deploy to {environment.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* ── Active Services Grid (One-Click Dev Ingress) ── */}
        <div className="pt-3 border-t border-zinc-800/60">
          <div className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase mb-2 flex items-center justify-between">
            <span>DEVELOPMENT SERVICES RUNTIME</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {devRunning ? "All 6 Services Healthy" : "Services Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Frontend */}
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-200">Local Dev IDE</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>:1420</span>
                <a href="http://localhost:1420" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>

            {/* Staging Fleet */}
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-200">Staging Fleet</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>:41700</span>
                <button onClick={() => onNavigate("releases")} className="text-amber-400 hover:text-amber-300 text-[10px]">
                  Staging
                </button>
              </div>
            </div>

            {/* PostgreSQL */}
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-200">PostgreSQL</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>:5432</span>
                <button onClick={() => onNavigate("database")} className="text-indigo-400 hover:text-indigo-300 text-[10px]">
                  Tables
                </button>
              </div>
            </div>

            {/* Redis */}
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-200">Redis Cache</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>:6379</span>
                <span className="text-emerald-400">Synced</span>
              </div>
            </div>

            {/* Production Fleet */}
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-200">Prod Cluster</span>
                <span className="w-2 h-2 rounded-full bg-purple-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>:41001</span>
                <span className="text-purple-400">Protected</span>
              </div>
            </div>

            {/* Ingress Tunnel */}
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-200">Public Ingress</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Cloudflare</span>
                <button onClick={() => onNavigate("domains")} className="text-indigo-400 hover:text-indigo-300 text-[10px]">
                  Tunnels
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Core 3-Column Lifecycle Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Changes */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-md flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode size={13} className="text-amber-400" />
                Working Changes
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3 Modified
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-100">
              3 modified files • 1 untracked
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-sans">
              <span className="text-indigo-400 font-semibold">AI Summary:</span> Added workflow-centric navigation, enhanced production safe mode, and unified command center.
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
            <button
              onClick={() => onNavigate("changes")}
              className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer text-center"
            >
              Review Diff
            </button>
            <button
              onClick={() => onNavigate("git")}
              className="py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              Commit
            </button>
          </div>
        </div>

        {/* Card 2: Environments */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-md flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-indigo-400" />
                Target Environment
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  environment === "production"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    : environment === "staging"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {environment}
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-100">
              {environment === "dev"
                ? "🟢 Local Development (Safe)"
                : environment === "staging"
                ? "🔵 Staging Pre-Release Cluster"
                : "🔴 Production Live (Locked & Safe)"}
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => onEnvironmentChange("dev")}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                  environment === "dev"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold"
                    : "bg-zinc-950/60 hover:bg-zinc-800/40 text-zinc-400"
                }`}
              >
                <span>DEV (Local Sandbox)</span>
                {environment === "dev" && <Check size={13} />}
              </button>
              <button
                onClick={() => onEnvironmentChange("staging")}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                  environment === "staging"
                    ? "bg-sky-500/15 border border-sky-500/30 text-sky-300 font-semibold"
                    : "bg-zinc-950/60 hover:bg-zinc-800/40 text-zinc-400"
                }`}
              >
                <span>STAGING (Candidate)</span>
                {environment === "staging" && <Check size={13} />}
              </button>
              <button
                onClick={() => onEnvironmentChange("production")}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                  environment === "production"
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold"
                    : "bg-zinc-950/60 hover:bg-zinc-800/40 text-zinc-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Lock size={11} className="text-rose-400" />
                  <span>PRODUCTION (Gated)</span>
                </span>
                {environment === "production" && <Check size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Deployment */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-md flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Rocket size={13} className="text-emerald-400" />
                Live Deployment
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                v0.1.0 Live
              </span>
            </div>
            <div className="text-sm font-semibold text-zinc-100 flex items-center justify-between">
              <span>Healthy • 0 Downtime</span>
              <span className="text-xs font-mono text-zinc-400">c48c13c</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1 text-xs font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Public URL:</span>
                <span className="text-indigo-400">{cleanName}.botdigit.site</span>
              </div>
              <div className="flex justify-between">
                <span>SSL TLS:</span>
                <span className="text-emerald-400">Verified TLS 1.3</span>
              </div>
              <div className="flex justify-between">
                <span>Target Host:</span>
                <span className="text-zinc-300">198.51.100.42</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
            <button
              onClick={() => onNavigate("releases")}
              className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Deploy Pipeline
            </button>
            <button
              onClick={() => onNavigate("rollbacks")}
              className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700/80 text-xs font-semibold transition-colors cursor-pointer"
            >
              Rollback
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Recent Activity & Project Doctor Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Recent Project Activity</span>
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">Realtime feed</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-zinc-200">235 unit tests passed (vitest)</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">12m ago</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-zinc-200">PostgreSQL + Redis containers running</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">28m ago</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span className="text-zinc-200">Cloudflare Zero Trust Tunnel initialized</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">45m ago</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="text-zinc-200">2 database schema migrations pending</span>
              </div>
              <button
                onClick={() => onNavigate("database")}
                className="text-[10px] font-semibold text-amber-400 hover:underline"
              >
                Migrate
              </button>
            </div>
          </div>
        </div>

        {/* Project Doctor Health Preview */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Stethoscope size={14} className="text-emerald-400" />
              <span>Project Doctor & Health Diagnostics</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              9/10 Passing
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300 truncate">Git Working Tree Clean</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300 truncate">Environment Configured</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300 truncate">PostgreSQL Connected</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300 truncate">Redis Pool Active</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="text-zinc-300 truncate">Isolated Storage Writable</span>
            </div>
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-amber-500/20 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <span className="text-amber-300 truncate">Worker restart advised</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onNavigate("doctor")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Open Full Doctor & Diagnostics</span>
              <ArrowRight size={12} />
            </button>
            <button
              onClick={() => onNavigate("doctor")}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            >
              Fix Safe Issues
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
