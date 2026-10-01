import { useState } from "react";
import {
  FolderOpen,
  Plus,
  Clock,
  ArrowRight,
  Sparkles,
  GitBranch,
  Server,
  Shield,
  Layers,
  X,
  Check,
  Code2,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";

// ── Types ────────────────────────────────────────────────────────

interface WelcomePageProps {
  onOpenProject: () => void;
  recentProjects: { name: string; path: string; framework?: string; lastOpened?: string }[];
  onOpenRecent: (path: string) => void;
  onCreateProject?: (targetDir: string, name: string, template: string) => Promise<void>;
}

interface TemplateOption {
  id: string;
  name: string;
  desc: string;
  icon: typeof Code2;
  badge: string;
  color: string;
}

const templates: TemplateOption[] = [
  {
    id: "nextjs",
    name: "Next.js 15 Starter",
    desc: "Full-stack React with App Router, SSR, and API routes.",
    icon: Code2,
    badge: "Node.js",
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400",
  },
  {
    id: "fastapi",
    name: "FastAPI Backend",
    desc: "High-performance async Python web API with auto OpenAPI docs.",
    icon: Layers,
    badge: "Python",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400",
  },
  {
    id: "rust-axum",
    name: "Rust Axum Service",
    desc: "Blazing fast, memory-safe web microservice using Axum & Tokio.",
    icon: Server,
    badge: "Rust",
    color: "from-amber-500/20 to-orange-500/20 text-amber-400",
  },
  {
    id: "vite-react",
    name: "Vite + React SPA",
    desc: "Lightning fast client-side frontend starter bundle.",
    icon: Sparkles,
    badge: "TypeScript",
    color: "from-purple-500/20 to-pink-500/20 text-purple-400",
  },
];

// ── Component ────────────────────────────────────────────────────

export default function WelcomePage({
  onOpenProject,
  recentProjects,
  onOpenRecent,
  onCreateProject,
}: WelcomePageProps) {
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState("my-app");
  const [selectedTemplate, setSelectedTemplate] = useState("nextjs");
  const [targetDir, setTargetDir] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    if (!targetDir) {
      setCreateError("Please select a target folder directory.");
      return;
    }
    if (!projectName.trim()) {
      setCreateError("Please enter a valid project name.");
      return;
    }
    setCreateError(null);
    setIsCreating(true);

    try {
      if (onCreateProject) {
        await onCreateProject(targetDir, projectName.trim(), selectedTemplate);
        setShowModal(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-bg-base overflow-auto relative">
      <div className="max-w-2xl w-full px-8 py-12 animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">
            Welcome to AIPanel
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Unified AI Developer IDE & VPS Server Management Platform.
            Write code, orchestrate daemons, deploy apps — all from one interface.
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <button
            onClick={onOpenProject}
            className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-850 transition-all group shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <FolderOpen size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">
                Open Project
              </div>
              <div className="text-[11px] text-zinc-400">
                Open an existing codebase
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-850 transition-all group shadow-sm text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Plus size={18} className="text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-100">
                New Project
              </div>
              <div className="text-[11px] text-zinc-400">
                Create from starter template
              </div>
            </div>
          </button>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase">
                Recent Projects
              </span>
            </div>
            <div className="space-y-1">
              {recentProjects.map((project) => (
                <button
                  key={project.path}
                  onClick={() => onOpenRecent(project.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-900 transition-colors group border border-transparent hover:border-zinc-800"
                >
                  <FolderOpen size={14} className="text-indigo-400/80 group-hover:text-indigo-400 shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">
                      {project.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate font-mono">
                      {project.path}
                    </div>
                  </div>
                  {project.framework && (
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
                      {project.framework}
                    </span>
                  )}
                  <ArrowRight
                    size={12}
                    className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              icon: Shield,
              label: "Environment Isolation",
              desc: "DEV can't modify LIVE",
              color: "text-emerald-400",
            },
            {
              icon: Sparkles,
              label: "AI Agent",
              desc: "Multi-provider & Ollama",
              color: "text-indigo-400",
            },
            {
              icon: GitBranch,
              label: "Git Versioning",
              desc: "Deploy-aware history",
              color: "text-purple-400",
            },
            {
              icon: Server,
              label: "Server Agent",
              desc: "Zero-downtime deploy",
              color: "text-sky-400",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="flex flex-col items-center gap-2 p-3 rounded-lg bg-zinc-900/60 border border-zinc-850 text-center"
              >
                <Icon size={16} className={feature.color} />
                <div>
                  <div className="text-[11px] font-medium text-zinc-300">
                    {feature.label}
                  </div>
                  <div className="text-[10px] text-zinc-500">{feature.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Plus size={16} />
                </div>
                <h3 className="font-semibold text-zinc-100 text-base">Create New Project</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. store-api"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Location (Parent Directory)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetDir}
                    onChange={(e) => setTargetDir(e.target.value)}
                    placeholder="Select where to create project..."
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-mono outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handlePickDirectory}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-xs font-medium text-zinc-200 border border-zinc-700"
                  >
                    Browse...
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Select Template
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-500/10 border-indigo-500 shadow-sm"
                            : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-zinc-100">{tpl.name}</span>
                          {isSelected && <Check size={14} className="text-indigo-400" />}
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                          {tpl.desc}
                        </p>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-300 border border-zinc-750">
                          {tpl.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSubmit}
                disabled={isCreating}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
              >
                {isCreating ? "Scaffolding..." : "Create & Open Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
