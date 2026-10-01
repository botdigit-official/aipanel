import { useState } from "react";
import {
  FolderOpen,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  GitBranch,
  Server,
  Layers,
  X,
  Code2,
  Shield,
  Bot,
  Activity,
  Box,
  Database,
  HardDrive,
  Wifi,
  CheckCircle2,
  Cpu,
  Zap,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Card, Button, Badge, StatusIndicator } from "../../design-system";

export interface RecentProjectItem {
  name: string;
  path: string;
  framework?: string;
  lastOpened?: string;
  branch?: string;
  changes?: number;
}

interface WelcomePageProps {
  onOpenProject: () => void;
  recentProjects: RecentProjectItem[];
  onOpenRecent: (path: string) => void;
  onCreateProject?: (targetDir: string, name: string, template: string) => Promise<void>;
  onNavigateToCode?: () => void;
  onNavigateToAI?: () => void;
  onNavigateToGit?: () => void;
  onNavigateToServers?: () => void;
}

interface TemplateOption {
  id: string;
  name: string;
  desc: string;
  icon: typeof Code2;
  badge: string;
  runtime: string;
}

const templates: TemplateOption[] = [
  {
    id: "nextjs",
    name: "Next.js 15 Fullstack",
    desc: "App Router, Server Actions, Tailwind CSS v4 & TypeScript.",
    icon: Code2,
    badge: "Node.js",
    runtime: "npm run dev (:3000)",
  },
  {
    id: "fastapi",
    name: "FastAPI Async API",
    desc: "Async Python 3.12 with Pydantic v2 & OpenAPI docs.",
    icon: Layers,
    badge: "Python",
    runtime: "uvicorn main:app (:8000)",
  },
  {
    id: "rust-axum",
    name: "Rust Axum Microservice",
    desc: "Blazing fast Tokio runtime with Tower middleware & mTLS.",
    icon: Server,
    badge: "Rust",
    runtime: "cargo run (:8080)",
  },
  {
    id: "vite-react",
    name: "Vite + React SPA",
    desc: "Ultra-fast client SPA with Tailwind CSS & Lucide icons.",
    icon: Sparkles,
    badge: "TypeScript",
    runtime: "vite dev (:1420)",
  },
];

export default function WelcomePage({
  onOpenProject,
  recentProjects,
  onOpenRecent,
  onCreateProject,
  onNavigateToCode,
  onNavigateToAI,
  onNavigateToGit,
  onNavigateToServers,
}: WelcomePageProps) {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("my-app");
  const [selectedTemplate, setSelectedTemplate] = useState("nextjs");
  const [targetDir, setTargetDir] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const handlePickDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Parent Directory for New Project",
      });
      if (selected && typeof selected === "string") {
        setTargetDir(selected);
      }
    } catch (err) {
      console.error("Directory pick cancelled or failed:", err);
    }
  };

  const handleCreateSubmit = async () => {
    if (!onCreateProject) return;
    if (!projectName.trim()) {
      setCreateError("Please enter a valid project name");
      return;
    }
    if (!targetDir.trim()) {
      setCreateError("Please select a target directory");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      await onCreateProject(targetDir, projectName.trim(), selectedTemplate);
      setShowModal(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to generate project";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const displayProjects: RecentProjectItem[] =
    recentProjects.length > 0
      ? recentProjects
      : [
          {
            name: "aipanel",
            path: "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel",
            framework: "React 19 + Tauri v2",
            branch: "develop",
            changes: 3,
            lastOpened: "Active workspace",
          },
          {
            name: "yaarpahari.com",
            path: "/Volumes/Mac2TB/Botdigit/Developer/Live/yaarpahari.com",
            framework: "Node.js + Telegram Bot",
            branch: "main",
            changes: 0,
            lastOpened: "15 mins ago",
          },
        ];

  return (
    <div className="flex-1 bg-[#08090D] overflow-y-auto px-6 py-6 flex flex-col justify-start select-none">
      <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
        {/* ── Contextual Hero Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#11131A] border border-white/8 shadow-md">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 font-mono tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Unified AI Developer IDE & VPS Platform
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              {greeting}, Developer
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Continue where you left off or scaffold a new microservice.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={<FolderOpen className="w-4 h-4 text-zinc-400" />}
              onClick={onOpenProject}
            >
              Open Project
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4 text-white" />}
              onClick={() => setShowModal(true)}
            >
              New Project
            </Button>
          </div>
        </div>

        {/* ── 2-Column Balanced Dashboard Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ════════ LEFT COLUMN: Workspaces, Templates & Quick Starters (7 Cols) ════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Recent Workspaces Card Stack */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Recent Workspaces
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {displayProjects.length} registered
                </span>
              </div>

              <div className="space-y-3">
                {displayProjects.map((project) => (
                  <Card
                    key={project.path}
                    variant="interactive"
                    onClick={() => onOpenRecent(project.path)}
                    className="p-4 group border-white/8 hover:border-violet-500/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                          <Box className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                              {project.name}
                            </span>
                            <Badge category="env" env="dev" dot>
                              DEV
                            </Badge>
                            {project.framework && (
                              <span className="text-[11px] font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/8">
                                {project.framework}
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-zinc-500 truncate mt-1">
                            {project.path}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1 text-zinc-300">
                              <GitBranch className="w-3 h-3 text-violet-400" />
                              <span>{project.branch || "main"}</span>
                            </span>
                            <span>•</span>
                            <span className="text-amber-400">
                              {project.changes !== undefined ? `${project.changes} modified files` : "Clean tree"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-zinc-500 hidden sm:inline-block font-mono">
                          {project.lastOpened}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform ml-2">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Architecture Templates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-500" />
                  Instant Starter Scaffolding
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">1-click create</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setShowModal(true);
                      }}
                      className="p-3.5 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-violet-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-600/20 group-hover:border-violet-500/30 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-medium text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/8">
                          {tpl.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                        {tpl.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {tpl.desc}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500 mt-2">
                        {tpl.runtime}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div>
              <div className="mb-3">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Primary Toolsets
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={onNavigateToCode}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
                >
                  <Code2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">Code Editor</div>
                    <div className="text-[10px] text-zinc-500 truncate">Buffer & Tree</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToAI}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">AI Agent</div>
                    <div className="text-[10px] text-zinc-500 truncate">Context Aware</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToGit}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
                >
                  <GitBranch className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">Source Control</div>
                    <div className="text-[10px] text-zinc-500 truncate">Staging & Tags</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToServers}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
                >
                  <Activity className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">Server Fleet</div>
                    <div className="text-[10px] text-zinc-500 truncate">VPS & Telemetry</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ════════ RIGHT COLUMN: Live System Telemetry, AI Models & Daemons (5 Cols) ════════ */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Host Hardware Telemetry Card */}
            <Card className="p-4 space-y-3.5 border-white/10">
              <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Host Hardware Telemetry
                  </span>
                </div>
                <StatusIndicator status="active" label="Live" pulse />
              </div>

              {/* CPU Metric */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    CPU Cores (8 Threads)
                  </span>
                  <span className="text-zinc-200 font-semibold">12% Load</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[12%]" />
                </div>
              </div>

              {/* RAM Metric */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Memory DDR5
                  </span>
                  <span className="text-zinc-200 font-semibold">1.2 GB / 8.0 GB (15%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full w-[15%]" />
                </div>
              </div>

              {/* Disk & Network Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-[#0C0D12] border border-white/6">
                  <span className="text-zinc-500 block">NVMe Storage</span>
                  <span className="text-zinc-200 font-semibold mt-0.5 block">54 GB / 120 GB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0C0D12] border border-white/6">
                  <span className="text-zinc-500 block">Network I/O</span>
                  <span className="text-emerald-400 font-semibold mt-0.5 block">↑ 1.4M · ↓ 4.2M</span>
                </div>
              </div>
            </Card>

            {/* AI Multi-Model Connectivity Card */}
            <Card className="p-4 space-y-3 border-white/10">
              <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    AI Model Gateway
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  BYOK Encrypted
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0C0D12] border border-white/6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-200">Claude 3.7 Sonnet</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">Anthropic API</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0C0D12] border border-white/6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-zinc-200">GPT-4o & o3-mini</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">OpenAI API</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0C0D12] border border-white/6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-zinc-200">Local Ollama</span>
                  </div>
                  <span className="text-zinc-500 text-[10px]">:11434</span>
                </div>
              </div>
            </Card>

            {/* Backing Services & Daemons Cockpit */}
            <Card className="p-4 space-y-3 border-white/10">
              <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Services & Daemons
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">4 Active</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#0C0D12] border border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-zinc-300">PostgreSQL</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">:5432</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0C0D12] border border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-zinc-300">Redis</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">:6379</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0C0D12] border border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-zinc-300">Caddy TLS</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">:443</span>
                </div>

                <div className="p-2 rounded-lg bg-[#0C0D12] border border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-zinc-300">CF Tunnel</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">Active</span>
                </div>
              </div>
            </Card>

            {/* Pre-Flight Doctor Gate Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/20 via-[#11131A] to-[#11131A] border border-emerald-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-zinc-200">Pre-Flight Doctor Ready</div>
                  <div className="text-[11px] text-zinc-400">6/6 Deployment Gates Verified</div>
                </div>
              </div>
              <Badge category="status" status="active">
                Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── New Project Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-xl bg-[#161923] border border-white/12 rounded-2xl shadow-2xl p-6 z-10 space-y-5 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100">Create New Project</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Scaffold from an optimized starter template
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            {/* Template Selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2 font-mono">
                Select Architecture Template
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {templates.map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-violet-600/15 border-violet-500/40 shadow-sm"
                          : "bg-[#11131A] border-white/8 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? "text-violet-400" : "text-zinc-400"
                          }`}
                        />
                        <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-1.5 py-0.2 rounded border border-white/8">
                          {tpl.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-100">{tpl.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {tpl.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Details Form */}
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Project Directory Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[#11131A] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-violet-500"
                  placeholder="e.g. backend-api"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">
                  Parent Workspace Directory
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={targetDir}
                    onChange={(e) => setTargetDir(e.target.value)}
                    placeholder="Select folder location..."
                    className="flex-1 bg-[#11131A] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                  <Button variant="secondary" size="sm" onClick={handlePickDirectory}>
                    Browse...
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/8">
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isCreating}
                onClick={handleCreateSubmit}
              >
                Create Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
