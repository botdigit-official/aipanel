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
  Play,
  Terminal,
  RefreshCw,
  Lock,
  GitCommit,
  Rocket,
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
    name: "Rust Axum Service",
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
          {
            name: "botdigit-ai-council",
            path: "/Volumes/Mac2TB/Botdigit/Developer/Projects/botdigit-ai-council",
            framework: "Python + Fastify",
            branch: "feat/council",
            changes: 1,
            lastOpened: "2 hours ago",
          },
        ];

  return (
    <div className="flex-1 bg-[#090a10] overflow-y-auto px-6 lg:px-8 py-6 select-none w-full">
      <div className="w-full space-y-6 animate-in fade-in duration-150">
        {/* ── Top Header Banner (Full Width) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#141829] via-[#101322] to-[#141829] border border-[#242d45] shadow-xl shadow-black/40 ring-1 ring-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 border border-violet-400/40 flex items-center justify-center text-white font-extrabold text-2xl shrink-0 shadow-lg shadow-violet-950/50">
              A
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 font-mono tracking-wider uppercase mb-0.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                Unified AI Developer IDE & VPS Control Plane
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                {greeting}, Developer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={<FolderOpen className="w-4 h-4 text-zinc-400" />}
              onClick={onOpenProject}
            >
              Open Project (⌘O)
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

        {/* ── 3-Column Powerhouse Dashboard Grid (Fills display width) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-start w-full">
          {/* ════════ COLUMN 1: Workspaces & Architecture Templates (4 Columns) ════════ */}
          <div className="xl:col-span-4 space-y-5">
            {/* Recent Workspaces Card Stack */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Recent Workspaces
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {displayProjects.length} active
                </span>
              </div>

              <div className="space-y-2.5">
                {displayProjects.map((project) => (
                  <Card
                    key={project.path}
                    variant="interactive"
                    onClick={() => onOpenRecent(project.path)}
                    className="p-3.5 group border-[#242d44] hover:border-violet-500/50 bg-[#121624] hover:bg-[#161b2e] shadow-md ring-1 ring-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/35 flex items-center justify-center text-violet-300 font-bold shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                          <Box className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                              {project.name}
                            </span>
                            <Badge category="env" env="dev" dot>
                              DEV
                            </Badge>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                            {project.path}
                          </div>
                          <div className="flex items-center gap-2.5 mt-1.5 text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1 text-zinc-300">
                              <GitBranch className="w-3 h-3 text-violet-400" />
                              <span>{project.branch || "main"}</span>
                            </span>
                            <span>•</span>
                            <span className="text-amber-400">
                              {project.changes !== undefined ? `${project.changes} modified` : "Clean"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform shrink-0">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Architecture Starter Templates */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-zinc-500" />
                  Instant Starter Templates
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Scaffold</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {templates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setShowModal(true);
                      }}
                      className="p-3 rounded-xl bg-[#131728] hover:bg-[#181d32] border border-[#242d44] hover:border-violet-500/50 shadow-md ring-1 ring-white/5 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-600/20 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-300 bg-white/10 px-1.5 py-0.2 rounded border border-white/10">
                          {tpl.badge}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                        {tpl.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                        {tpl.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div>
              <div className="mb-2.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Primary Toolsets
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onNavigateToCode}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131728] hover:bg-[#181d32] border border-[#242d44] hover:border-blue-500/50 shadow-md ring-1 ring-white/5 transition-colors text-left cursor-pointer group"
                >
                  <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">Code Editor</div>
                    <div className="text-[10px] text-zinc-400 truncate">Buffer & Tree</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToAI}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131728] hover:bg-[#181d32] border border-[#242d44] hover:border-violet-500/50 shadow-md ring-1 ring-white/5 transition-colors text-left cursor-pointer group"
                >
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">AI Agent</div>
                    <div className="text-[10px] text-zinc-400 truncate">Context Engine</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToGit}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131728] hover:bg-[#181d32] border border-[#242d44] hover:border-emerald-500/50 shadow-md ring-1 ring-white/5 transition-colors text-left cursor-pointer group"
                >
                  <GitBranch className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">Git Cockpit</div>
                    <div className="text-[10px] text-zinc-400 truncate">Commits & Diff</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToServers}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131728] hover:bg-[#181d32] border border-[#242d44] hover:border-sky-500/50 shadow-md ring-1 ring-white/5 transition-colors text-left cursor-pointer group"
                >
                  <Activity className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">Fleet Control</div>
                    <div className="text-[10px] text-zinc-400 truncate">VPS & Telemetry</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ════════ COLUMN 2: Workspace Activity, Local Daemons & CLI Runners (4 Columns) ════════ */}
          <div className="xl:col-span-4 space-y-5">
            {/* Active Backing Services & Daemons Cockpit */}
            <Card className="p-4 space-y-3.5 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-[#21283d] pb-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Local Dev Daemons
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  4 Active
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    <div>
                      <span className="text-zinc-200 font-semibold block">PostgreSQL 16</span>
                      <span className="text-[10px] text-zinc-400">127.0.0.1:5432</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/20">
                    Running (4 conn)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-rose-400" />
                    <div>
                      <span className="text-zinc-200 font-semibold block">Redis 7.2 Cache</span>
                      <span className="text-[10px] text-zinc-400">127.0.0.1:6379</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/20">
                    Running (2.4MB)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3.5 h-3.5 text-teal-400" />
                    <div>
                      <span className="text-zinc-200 font-semibold block">Caddy v2.8 Proxy</span>
                      <span className="text-[10px] text-zinc-400">Ports 80 / 443</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded font-semibold border border-emerald-500/20">
                    TLS 1.3 Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="text-zinc-200 font-semibold block">CF Zero Trust Tunnel</span>
                      <span className="text-[10px] text-zinc-400">*.botdigit.site</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded font-semibold border border-sky-500/20">
                    Edge Synced
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Git Activity Stream */}
            <Card className="p-4 space-y-3 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-[#21283d] pb-2.5">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Workspace Git Stream
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold">develop</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-violet-300 font-semibold truncate">
                      feat(ui): establish design system
                    </span>
                    <span className="text-[10px] text-zinc-400">Just now</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                    Layered surfaces, tokens, command center and balanced cockpit.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-200 font-semibold truncate">
                      feat(installer): 1-click server setup
                    </span>
                    <span className="text-[10px] text-zinc-400">30m ago</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                    Zero-prompt hardware audit, swap provisioning and firewall rules.
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Command CLI Runners */}
            <div className="p-3.5 rounded-xl bg-[#121624] border border-[#242d44] shadow-md ring-1 ring-white/5 space-y-2">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                Quick Terminal Tasks
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={onNavigateToCode}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0d101a] border border-[#1e2538] hover:border-violet-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <Play className="w-3 h-3 text-emerald-400" />
                    aipanel dev
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold">Run</span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateToCode}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#0d101a] border border-[#1e2538] hover:border-violet-500/40 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    aipanel build
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold">Run</span>
                </button>
              </div>
            </div>
          </div>

          {/* ════════ COLUMN 3: Live Hardware Telemetry & Fleet Cloud (4 Columns) ════════ */}
          <div className="xl:col-span-4 space-y-5">
            {/* Live Host Hardware Telemetry Card */}
            <Card className="p-4 space-y-3.5 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-[#21283d] pb-2.5">
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
                    CPU Load (8 Cores)
                  </span>
                  <span className="text-zinc-200 font-semibold">12%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[12%]" />
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
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[15%]" />
                </div>
              </div>

              {/* Disk & Network Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <span className="text-zinc-400 block">NVMe Pool</span>
                  <span className="text-zinc-100 font-semibold mt-0.5 block">54 GB / 120 GB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <span className="text-zinc-400 block">10Gbps Network</span>
                  <span className="text-emerald-400 font-semibold mt-0.5 block">↑ 1.4M · ↓ 4.2M</span>
                </div>
              </div>
            </Card>

            {/* Server Fleet Management Card */}
            <Card className="p-4 space-y-3 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-[#21283d] pb-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    Managed Server Fleet
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold">2 Nodes</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>srv-staging-01</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">US-East • 24ms • 3 services</span>
                  </div>
                  <Badge category="env" env="staging">
                    STAGING
                  </Badge>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0d101a] border border-[#1e2538] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>srv-prod-01</span>
                      <Lock className="w-3 h-3 text-rose-400" />
                    </div>
                    <span className="text-[10px] text-zinc-400">EU-Central • 68ms • 5 services</span>
                  </div>
                  <Badge category="env" env="production">
                    PROD
                  </Badge>
                </div>
              </div>
            </Card>

            {/* AI Multi-Model Gateway Card */}
            <Card className="p-4 space-y-3 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5">
              <div className="flex items-center justify-between border-b border-[#21283d] pb-2.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
                    AI Model Gateway
                  </span>
                </div>
                <span className="text-[10px] font-mono text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded border border-violet-500/30 font-semibold">
                  BYOK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <span className="text-zinc-200 font-semibold block truncate">Claude 3.7</span>
                  <span className="text-[10px] text-emerald-400">● Connected</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <span className="text-zinc-200 font-semibold block truncate">GPT-4o</span>
                  <span className="text-[10px] text-emerald-400">● Connected</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <span className="text-zinc-200 font-semibold block truncate">Gemini 2.5</span>
                  <span className="text-[10px] text-emerald-400">● Connected</span>
                </div>
                <div className="p-2 rounded-lg bg-[#0d101a] border border-[#1e2538]">
                  <span className="text-zinc-200 font-semibold block truncate">Ollama Local</span>
                  <span className="text-[10px] text-sky-400">:11434</span>
                </div>
              </div>
            </Card>

            {/* Pre-Flight Doctor Gate Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-[#121624] to-[#121624] border border-emerald-500/30 flex items-center justify-between text-xs shadow-md ring-1 ring-white/5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-zinc-100">Pre-Flight Doctor Ready</div>
                  <div className="text-[11px] text-zinc-400">6/6 Deployment Gates Verified</div>
                </div>
              </div>
              <Badge category="status" status="active">
                Passed
              </Badge>
            </div>
          </div>
        </div>

        {/* ── BOTTOM COCKPIT ROW: Infrastructure Mesh & Deployment Controls (Full Viewport Fill) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full pt-2">
          {/* Active Ports & Mesh Table (8 Columns) */}
          <Card className="lg:col-span-8 p-5 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#21283d] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Infrastructure Mesh & Port Governance</h3>
                  <p className="text-[11px] text-zinc-400">Standard BotDigit ports (41000-41799) & Core Backing Services</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                All Ports Bound
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0d101a] border border-[#1e2538] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">PostgreSQL</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">:5432</div>
                <div className="text-[10px] text-zinc-500">Shared DB • Read/Write</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d101a] border border-[#1e2538] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Redis Cache</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">:6379</div>
                <div className="text-[10px] text-zinc-500">Shared Key-Value</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d101a] border border-[#1e2538] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Caddy Edge</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-base font-bold text-zinc-100">:80 / :443</div>
                <div className="text-[10px] text-zinc-500">Auto SSL / mTLS Proxy</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d101a] border border-[#1e2538] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">AIPanel Dev</span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="text-base font-bold text-cyan-300">:1420</div>
                <div className="text-[10px] text-zinc-500">Vite + React 19 Client</div>
              </div>
            </div>
          </Card>

          {/* Quick Operations & System Actions (4 Columns) */}
          <Card className="lg:col-span-4 p-5 bg-[#121624] border-[#242d44] shadow-md ring-1 ring-white/5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#21283d] pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Quick DevOps Pipeline</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Active</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3">
                One-click safe triggers for deployment, health check, and code buffer navigation.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onNavigateToCode}
                className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-950/50 transition-all cursor-pointer"
              >
                <Code2 className="w-4 h-4" />
                Open Code Studio
              </button>
              <button
                type="button"
                onClick={onNavigateToServers}
                className="w-full py-2 px-3 rounded-xl bg-[#0d101a] hover:bg-[#151a2b] border border-[#232b40] hover:border-violet-500/40 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Server className="w-4 h-4 text-purple-400" />
                Inspect Fleet Health
              </button>
            </div>
          </Card>
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
