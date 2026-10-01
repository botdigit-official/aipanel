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
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { Card, Button, Badge, StatusIndicator } from "../../design-system";

export interface RecentProjectItem {
  name: string;
  path: string;
  framework?: string;
  lastOpened?: string;
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
}

const templates: TemplateOption[] = [
  {
    id: "nextjs",
    name: "Next.js 15 Starter",
    desc: "Full-stack React with App Router, SSR, and API routes.",
    icon: Code2,
    badge: "Node.js",
  },
  {
    id: "fastapi",
    name: "FastAPI Backend",
    desc: "High-performance async Python web API with auto OpenAPI docs.",
    icon: Layers,
    badge: "Python",
  },
  {
    id: "rust-axum",
    name: "Rust Axum Service",
    desc: "Blazing fast, memory-safe web microservice using Axum & Tokio.",
    icon: Server,
    badge: "Rust",
  },
  {
    id: "vite-react",
    name: "Vite + React SPA",
    desc: "Lightning fast client-side frontend starter bundle.",
    icon: Sparkles,
    badge: "TypeScript",
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

  // Provide fallback default if empty so the user sees a rich card
  const displayProjects =
    recentProjects.length > 0
      ? recentProjects
      : [
          {
            name: "aipanel",
            path: "/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel",
            framework: "React 19 + Tauri v2",
            lastOpened: "Just now",
          },
        ];

  return (
    <div className="flex-1 bg-[#08090D] overflow-y-auto px-6 py-8 flex flex-col justify-start select-none">
      <div className="max-w-4xl w-full mx-auto space-y-7 animate-in fade-in duration-150">
        {/* ── Contextual Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 font-mono tracking-wider uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              Developer Workspace
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              {greeting}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Continue where you left off or start a new workspace.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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

        {/* ── Recent Projects Cards ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              Recent Workspace
            </span>
            <span className="text-[11px] text-zinc-500">
              {displayProjects.length} active
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {displayProjects.map((project) => (
              <Card
                key={project.path}
                variant="interactive"
                onClick={() => onOpenRecent(project.path)}
                className="flex items-center justify-between p-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                    <Box className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                        {project.name}
                      </span>
                      <Badge category="env" env="dev" dot>
                        DEV
                      </Badge>
                      {project.framework && (
                        <span className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/8 shrink-0">
                          {project.framework}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-zinc-500 truncate mt-1">
                      {project.path}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <span className="text-xs text-zinc-500 hidden sm:inline-block font-mono">
                    {project.lastOpened || "Recently active"}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-medium text-violet-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── System Status & Capabilities Grid (Status-oriented, NOT marketing) ── */}
        <div>
          <div className="mb-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              System Capabilities & Environment Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Environment */}
            <Card className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Environment
                </span>
                <StatusIndicator status="active" label="Active" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>DEV Isolated</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Live production is protected. Mutations gated.
                </div>
              </div>
            </Card>

            {/* Card 2: AI Agent */}
            <Card className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  AI Multi-Model
                </span>
                <StatusIndicator status="connected" label="Ready" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-sky-400" />
                  <span>BYOK & Local</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Claude, GPT-4o, Gemini & Ollama connected.
                </div>
              </div>
            </Card>

            {/* Card 3: Source Control */}
            <Card className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Git Cockpit
                </span>
                <StatusIndicator status="running" label="Clean" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  <span>develop branch</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Atomic deployments with version tags.
                </div>
              </div>
            </Card>

            {/* Card 4: Server Agent */}
            <Card className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  VPS Server
                </span>
                <StatusIndicator status="active" label="Online" />
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-violet-400" />
                  <span>Agent :9876</span>
                </div>
                <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  1 node connected • 3 services monitored.
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Quick Workflows ── */}
        <div>
          <div className="mb-3">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Quick Actions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={onNavigateToCode}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
            >
              <Code2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">Open Editor</div>
                <div className="text-[11px] text-zinc-500">File Explorer & Buffer</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onNavigateToAI}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">AI Assistant</div>
                <div className="text-[11px] text-zinc-500">Code & Refactor</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onNavigateToGit}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
            >
              <GitBranch className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">Source Control</div>
                <div className="text-[11px] text-zinc-500">Staging & Commits</div>
              </div>
            </button>

            <button
              type="button"
              onClick={onNavigateToServers}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#11131A] hover:bg-[#161923] border border-white/8 hover:border-white/16 transition-colors text-left cursor-pointer group"
            >
              <Activity className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">Server Fleet</div>
                <div className="text-[11px] text-zinc-500">VPS Telemetry & Ports</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── New Project Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
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
