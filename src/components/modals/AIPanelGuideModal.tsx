import { useState } from "react";
import {
  BookOpen,
  Code2,
  Database,
  Rocket,
  Globe,
  GitBranch,
  Bot,
  Zap,
  X,
} from "lucide-react";

interface AIPanelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (panel: string) => void;
}

export default function AIPanelGuideModal({
  isOpen,
  onClose,
  onNavigate: _onNavigate,
}: AIPanelGuideModalProps) {
  const [activeSection, setActiveSection] = useState<
    "overview" | "ai_models" | "deploy" | "database" | "tunnels" | "git"
  >("overview");

  if (!isOpen) return null;

  const sections = [
    { id: "overview", label: "Overview & Workflows", icon: Zap },
    { id: "ai_models", label: "AI Models & Free Tiers", icon: Bot },
    { id: "deploy", label: "1-Click Auto-Deploy", icon: Rocket },
    { id: "database", label: "Database Cockpit", icon: Database },
    { id: "tunnels", label: "Domains & Tunnels", icon: Globe },
    { id: "git", label: "Git Timeline & Diffs", icon: GitBranch },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>AIPanel Master Developer Guide & CheatSheet</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Interactive Manual
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Everything you need to build, code, deploy, test on custom domains, and manage databases.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-56 border-r border-zinc-850 bg-zinc-950/80 p-3 space-y-1 shrink-0">
            {sections.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-indigo-400" : "text-zinc-500"} />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Body */}
          <div className="flex-1 overflow-y-auto p-5 text-xs text-zinc-300 leading-relaxed space-y-4">
            {/* 1. OVERVIEW */}
            {activeSection === "overview" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900 border border-indigo-500/20">
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                    Welcome to AIPanel: The Ultra-Lightweight AI Developer IDE
                  </h3>
                  <p className="text-xs text-zinc-300">
                    AIPanel gives you a complete local-to-production environment with 75% less RAM than traditional IDEs. It combines Monaco Code Editor, Multi-Engine Database, 1-Step Deploy, Cloudflare Tunnels, Visual Git Timeline, and AI Coding Agent into a single unified workspace.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Code2 size={14} className="text-purple-400" />
                      <span>1. Code & Live Reload</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Click <strong>Code</strong> in the sidebar to open the file explorer and Monaco editor. Changes reload instantly via Vite HMR.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Bot size={14} className="text-indigo-400" />
                      <span>2. AI Assistant (Free & BYOK)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Press <strong>AI Agent</strong> on the right to toggle the coding agent. Switch between Kilo Code, Gemini Free, Ollama, Claude, or DeepSeek.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Database size={14} className="text-emerald-400" />
                      <span>3. Zero-Config Database</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Dev environment defaults to SQLite file database with 0MB idle RAM. Switch to PostgreSQL (:5432) or Redis (:6379) in 1 click.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1.5">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Rocket size={14} className="text-sky-400" />
                      <span>4. 1-Step Staging & Prod Deploy</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Click <strong>Deploy</strong> in the TopBar or use the Bottom Panel Deploy runner to publish atomic releases with automated rollback.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. AI MODELS */}
            {activeSection === "ai_models" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 text-sm">
                    How AI Model Switching Works
                  </div>
                  <p className="text-xs text-zinc-400">
                    AIPanel lets you switch models at any time right from the chat input or the model picker. You don't need a paid subscription to code with AI.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-zinc-900/40 border border-emerald-500/20 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-100 text-xs">
                          🌟 Kilo Code / OpenRouter Free Models
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                          FREE
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Zero cost code assistance powered by DeepSeek R1, Llama 3.3 70B, and Qwen 2.5 Coder. No credit card required.
                      </p>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">$0.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/40 border border-blue-500/20 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-100 text-xs">
                          ⚡ Google Gemini 2.0 Flash (Free Tier)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 font-mono">
                          1M CONTEXT
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Official Google AI Studio Free Tier. Offers 15 requests/minute and a massive 1,000,000 token context window. Get a free key at aistudio.google.com.
                      </p>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">$0.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/40 border border-amber-500/20 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-100 text-xs">
                          🏠 Local Ollama (100% Offline & Private)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 font-mono">
                          PRIVATE
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Runs on your Mac / PC local GPU/CPU. Zero internet required and zero code leaves your machine. Run <code className="text-zinc-200">ollama run qwen2.5-coder:7b</code> in your terminal.
                      </p>
                    </div>
                    <span className="text-emerald-400 font-mono text-[11px] font-semibold">$0.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/40 border border-purple-500/20 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-zinc-100 text-xs">
                          🧠 Claude 3.7 Sonnet & DeepSeek V3 (BYOK)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 font-mono">
                          PRO CODING
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Bring your own API key for maximum power. Direct billing to provider API at raw wholesale cost.
                      </p>
                    </div>
                    <span className="text-zinc-400 font-mono text-[11px]">Wholesale</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DEPLOY */}
            {activeSection === "deploy" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 text-sm">
                    How to Deploy Your Project
                  </div>
                  <p className="text-xs text-zinc-400">
                    AIPanel supports both 1-click cloud fleet deploy and 1-click cPanel export.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1">
                    <div className="font-semibold text-indigo-300 text-xs">
                      Option A: 1-Click Staging / Production Deploy
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Click the <strong>[ Deploy ▾ ]</strong> button in the TopBar or open the <strong>Deploy</strong> tab in the Bottom Panel. AIPanel verifies pre-flight health, compiles production bundles, and dispatches zero-downtime releases.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-1">
                    <div className="font-semibold text-indigo-300 text-xs">
                      Option B: cPanel & Shared Hosting Export
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Need to deliver to a client on cPanel? Click <strong>cPanel Export</strong> in the Deploy panel. AIPanel generates a clean production ZIP with Apache <code className="text-zinc-200">.htaccess</code>, MySQL database dump, and AI deployment prompt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. DATABASE */}
            {activeSection === "database" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 text-sm">
                    Database Cockpit: Zero Daemon SQLite Default
                  </div>
                  <p className="text-xs text-zinc-400">
                    Never worry about starting heavy database servers during local development.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="font-semibold text-zinc-200 text-xs mb-1">
                      SQLite 3 (Default in DEV)
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Runs directly against a local file (e.g. <code className="text-zinc-300">local.sqlite</code>). Zero background RAM, zero network ports, instant table browsing and SQL execution.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="font-semibold text-zinc-200 text-xs mb-1">
                      PostgreSQL (:5432) & Redis (:6379)
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Standard shared developer services are pre-wired. When switching environments to Staging or Production, AIPanel automatically attaches schema migrations to the target database.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. TUNNELS */}
            {activeSection === "tunnels" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 text-sm">
                    Custom Domains & Cloudflare Tunnels
                  </div>
                  <p className="text-xs text-zinc-400">
                    Show your work to clients or test on mobile devices without buying VPS hosting.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="font-semibold text-zinc-200 text-xs mb-1">
                      Quick Tunnels (Free & Instant)
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Generates a secure HTTPS link like <code className="text-purple-300">https://myapp.trycloudflare.com</code> in 1 click. Works over 4G/5G mobile with end-to-end encryption.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="font-semibold text-zinc-200 text-xs mb-1">
                      Own Custom Domain (CNAME)
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Point any domain (e.g. <code className="text-emerald-300">dev.yourdomain.com</code>) to your local project using a standard CNAME record. Free SSL certificates are issued automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. GIT */}
            {activeSection === "git" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-zinc-200 text-sm">
                    Visual Git Timeline & Unified Diff Inspector
                  </div>
                  <p className="text-xs text-zinc-400">
                    Inspect where your code is moving, see line-by-line diffs, and track which commit is deployed live.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="font-semibold text-zinc-200 text-xs mb-1">
                      Visual Branching Graph
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Click <strong>Source Control</strong> in the sidebar to see the visual commit history. Commits indicate live status with <code className="text-emerald-300">STAGING LIVE</code> or <code className="text-amber-300">PRODUCTION LIVE</code> badges.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="font-semibold text-zinc-200 text-xs mb-1">
                      AI Code Movement & Impact Analysis
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Select any commit to view colorized additions/deletions and read an AI summary explaining the architectural direction, regression risks, and suggestions.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">
            AIPanel v0.1.0 • Built for ultra-fast, zero-friction development
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all"
          >
            Got it, Let's Code
          </button>
        </div>
      </div>
    </div>
  );
}
