import { useState } from "react";
import {
  Sparkles,
  FolderOpen,
  Server,
  Terminal,
  Check,
  Copy,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { isTauri, scaffoldWorkspace } from "../../lib/tauri";
import { useWorkspaceStore } from "../../stores/workspace";
import DirectoryPickerModal from "./DirectoryPickerModal";

interface FirstRunWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function FirstRunWizardModal({
  isOpen,
  onClose,
  onComplete,
}: FirstRunWizardModalProps) {
  const {
    defaultWorkspaceDir,
    setDefaultWorkspaceDir,
    defaultDeploymentsDir,
    setDefaultDeploymentsDir,
    completeFirstInstall,
  } = useWorkspaceStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [workspacePath, setWorkspacePath] = useState(defaultWorkspaceDir || "/Volumes/Mac2TB/Botdigit/Developer/Projects");
  const [deploymentsPath, setDeploymentsPath] = useState(defaultDeploymentsDir || "/Volumes/Mac2TB/Botdigit/Developer/Live");
  const [autoScaffold, setAutoScaffold] = useState(true);
  const [isolateStaging, setIsolateStaging] = useState(true);
  const [selectedAI, setSelectedAI] = useState<"ollama" | "gemini" | "kilo">("ollama");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDirectoryPicker, setShowDirectoryPicker] = useState<"workspace" | "deployments" | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  const handleBrowseWorkspace = async () => {
    if (isTauri()) {
      try {
        const selected = await open({
          directory: true,
          multiple: false,
          title: "Select Main Projects Directory",
        });
        if (selected && typeof selected === "string") {
          setWorkspacePath(selected);
          return;
        }
      } catch (err) {
        console.warn("Tauri dialog error:", err);
      }
    }
    // Web / In-App Interactive Directory Selector
    setShowDirectoryPicker("workspace");
  };

  const handleBrowseDeployments = async () => {
    if (isTauri()) {
      try {
        const selected = await open({
          directory: true,
          multiple: false,
          title: "Select Deployments & Live Server Directory",
        });
        if (selected && typeof selected === "string") {
          setDeploymentsPath(selected);
          return;
        }
      } catch (err) {
        console.warn("Tauri dialog error:", err);
      }
    }
    // Web / In-App Interactive Directory Selector
    setShowDirectoryPicker("deployments");
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const cleanWorkspace = workspacePath.trim() || "/Volumes/Mac2TB/Botdigit/Developer/Projects";
      const cleanDeployments = deploymentsPath.trim() || "/Volumes/Mac2TB/Botdigit/Developer/Live";

      setDefaultWorkspaceDir(cleanWorkspace);
      setDefaultDeploymentsDir(cleanDeployments);

      // Auto-scaffold workspace hierarchy if requested
      if (autoScaffold) {
        const baseRoot = cleanWorkspace.includes("/Projects")
          ? cleanWorkspace.substring(0, cleanWorkspace.lastIndexOf("/Projects"))
          : cleanWorkspace;
        await scaffoldWorkspace(baseRoot);
      }

      completeFirstInstall();
      onComplete?.();
      onClose();
    } catch (err) {
      console.error("Failed to complete setup:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in select-none">
      <div className="bg-[#121520] border border-white/12 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-white/8 bg-[#161a29] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <span>AIPanel First-Time Installation & Setup Wizard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                  Step {step} of 4
                </span>
              </h2>
              <p className="text-[11.5px] text-zinc-400 mt-0.5">
                Configure your persistent workspace location, deployment root, and pre-requisite libraries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 bg-zinc-900 w-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5 text-xs text-zinc-300 leading-relaxed custom-scrollbar">
          {/* ── STEP 1: Pre-installation & Tools ── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/25">
                <h3 className="text-xs font-bold text-zinc-100 mb-1 flex items-center gap-2">
                  <Terminal size={14} className="text-violet-400" />
                  Pre-requisite Tools & Recommended Libraries
                </h3>
                <p className="text-[11.5px] text-zinc-300">
                  AIPanel operates as a local-first IDE and VPS deployment platform. For optimal performance, ensure the following core tools are installed on your machine:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0e1019] border border-[#232a3e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">1. Node.js & npm</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">v18+</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Frontend dev server, Vite preview & build bundles.</p>
                  <div className="text-[10.5px] font-mono text-zinc-500">Check: <code className="text-zinc-300">node -v</code></div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e1019] border border-[#232a3e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">2. Git Version Control</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">Essential</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Branch governance, commit tracking & visual diffs.</p>
                  <div className="text-[10.5px] font-mono text-zinc-500">Check: <code className="text-zinc-300">git --version</code></div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e1019] border border-[#232a3e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">3. Docker & Compose</span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/40">Deployments</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Container runtime for Postgres, Redis & Microservices.</p>
                  <div className="text-[10.5px] font-mono text-zinc-500">Check: <code className="text-zinc-300">docker -v</code></div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e1019] border border-[#232a3e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200">4. Ollama (Local AI)</span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">Offline AI</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Private offline code generation with zero API cost.</p>
                  <div className="text-[10.5px] font-mono text-zinc-500">Check: <code className="text-zinc-300">ollama list</code></div>
                </div>
              </div>

              {/* 1-Click Terminal Command */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-medium text-zinc-200">macOS / Homebrew Quick Install Command</span>
                  <button
                    onClick={() => handleCopy("brew install node git docker caddy && ollama run qwen2.5:3b", "brew")}
                    className="flex items-center gap-1 text-[10.5px] text-violet-400 hover:text-violet-300 cursor-pointer"
                  >
                    {copiedCmd === "brew" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copiedCmd === "brew" ? "Copied!" : "Copy Command"}
                  </button>
                </div>
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-[11.5px] font-mono text-zinc-300 overflow-x-auto">
                  brew install node git docker caddy && ollama run qwen2.5:3b
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Main Workspace & Projects Root ── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-zinc-100 block mb-1">
                  Primary Workspace Directory (Where Projects are Saved)
                </label>
                <p className="text-[11.5px] text-zinc-400 mb-2">
                  All new projects and repositories will default to this parent directory. You will never be asked to manually search again.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={workspacePath}
                    onChange={(e) => setWorkspacePath(e.target.value)}
                    className="flex-1 bg-[#11131A] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
                    placeholder="/Volumes/Mac2TB/Botdigit/Developer/Projects"
                  />
                  <button
                    onClick={handleBrowseWorkspace}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FolderOpen size={13} className="text-violet-400" />
                    Browse...
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1.5 uppercase tracking-wider font-mono">
                  Quick Select Workspace Root
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: "BotDigit Projects (Standard)", path: "/Volumes/Mac2TB/Botdigit/Developer/Projects" },
                    { label: "BotDigit Live Services", path: "/Volumes/Mac2TB/Botdigit/Developer/Live" },
                    { label: "User Home Developer", path: "~/Developer/Projects" },
                    { label: "System Workspace", path: "~/Workspace" },
                  ].map((preset) => (
                    <button
                      key={preset.path}
                      onClick={() => setWorkspacePath(preset.path)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        workspacePath === preset.path
                          ? "bg-violet-600/15 border-violet-500/50 text-violet-200"
                          : "bg-[#0e1019] border-[#232a3e] hover:border-zinc-700 text-zinc-300"
                      }`}
                    >
                      <div className="font-semibold truncate">{preset.label}</div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">{preset.path}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Scaffold Hierarchy Checkbox */}
              <div className="p-3.5 rounded-xl bg-[#0e1019] border border-[#232a3e] space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScaffold}
                    onChange={(e) => setAutoScaffold(e.target.checked)}
                    className="mt-0.5 rounded accent-violet-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">
                      Auto-manage Workspace Structure if Folder is Empty
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Automatically creates canonical folders: <code className="text-zinc-300 font-mono">Projects/</code>, <code className="text-zinc-300 font-mono">Live/</code>, <code className="text-zinc-300 font-mono">Staging/</code>, <code className="text-zinc-300 font-mono">Static/</code>, <code className="text-zinc-300 font-mono">Infrastructure/</code>, and <code className="text-zinc-300 font-mono">Backups/</code>.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 3: Deployments & Staging Target ── */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-zinc-100 block mb-1">
                  Default Deployments & Production Storage Root
                </label>
                <p className="text-[11.5px] text-zinc-400 mb-2">
                  When you 1-click deploy to Staging or Production, services will run from this canonical directory.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deploymentsPath}
                    onChange={(e) => setDeploymentsPath(e.target.value)}
                    className="flex-1 bg-[#11131A] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
                    placeholder="/Volumes/Mac2TB/Botdigit/Developer/Live"
                  />
                  <button
                    onClick={handleBrowseDeployments}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FolderOpen size={13} className="text-violet-400" />
                    Browse...
                  </button>
                </div>
              </div>

              {/* Port & Security Isolation */}
              <div className="p-3.5 rounded-xl bg-[#0e1019] border border-[#232a3e] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-zinc-200 text-xs">
                  <Server size={14} className="text-indigo-400" />
                  Port & Environment Governance
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isolateStaging}
                    onChange={(e) => setIsolateStaging(e.target.checked)}
                    className="mt-0.5 rounded accent-violet-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block">
                      Enforce Canonical Port Ranges
                    </span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      Production: <span className="font-mono text-indigo-300">41000 - 41699</span> | Staging: <span className="font-mono text-purple-300">41700 - 41799</span>. Never stop shared Postgres (5432) or Redis (6379).
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* ── STEP 4: AI Engine Selection ── */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="text-xs font-bold text-zinc-100 block mb-1">
                  Default AI Intelligence & Model Tier
                </label>
                <p className="text-[11.5px] text-zinc-400 mb-3">
                  Select your primary code intelligence backend. You can always change this in the Top Bar.
                </p>

                <div className="space-y-2.5">
                  {[
                    {
                      id: "ollama",
                      title: "Ollama Local Offline (qwen2.5:3b) — Recommended",
                      desc: "Zero API cost, 100% private, runs entirely on your local machine with zero data leaving your Mac.",
                      badge: "Free & Offline",
                      color: "text-purple-400",
                    },
                    {
                      id: "gemini",
                      title: "Google Gemini 2.0 Flash",
                      desc: "Fastest cloud model with generous free tier (15 RPM). Ideal for complex architectural ideation.",
                      badge: "Free Cloud Tier",
                      color: "text-sky-400",
                    },
                    {
                      id: "kilo",
                      title: "Kilo Code / OpenRouter Free",
                      desc: "Access DeepSeek R1 and Llama 3.3 70B with free open-router keys.",
                      badge: "Community Free",
                      color: "text-emerald-400",
                    },
                  ].map((ai) => (
                    <button
                      key={ai.id}
                      onClick={() => setSelectedAI(ai.id as any)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedAI === ai.id
                          ? "bg-violet-600/15 border-violet-500/50 shadow-sm"
                          : "bg-[#0e1019] border-[#232a3e] hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-zinc-100 text-xs">{ai.title}</span>
                        <span className="text-[10.5px] font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {ai.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{ai.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-white/8 bg-[#161a29] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 text-xs transition-colors cursor-pointer"
              >
                Skip Setup
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-950/50 transition-all cursor-pointer"
              >
                Next Step
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Check size={14} />
                {isSaving ? "Saving Workspace..." : "Complete & Save Configuration"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* In-App Directory Navigator Modal (zero upload prompts) */}
      {showDirectoryPicker !== null && (
        <DirectoryPickerModal
          isOpen={showDirectoryPicker !== null}
          onClose={() => setShowDirectoryPicker(null)}
          initialPath={showDirectoryPicker === "workspace" ? workspacePath : deploymentsPath}
          onSelect={(selectedPath) => {
            if (showDirectoryPicker === "workspace") {
              setWorkspacePath(selectedPath);
            } else if (showDirectoryPicker === "deployments") {
              setDeploymentsPath(selectedPath);
            }
            setShowDirectoryPicker(null);
          }}
          title={
            showDirectoryPicker === "workspace"
              ? "Select Primary Workspace Directory"
              : "Select Deployments & Live Server Root"
          }
          description={
            showDirectoryPicker === "workspace"
              ? "Choose the default folder where all projects and repositories will be created."
              : "Choose where live production and staging services are deployed."
          }
        />
      )}
    </div>
  );
}
