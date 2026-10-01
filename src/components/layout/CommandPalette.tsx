import { useState, useEffect, useRef } from "react";
import {
  Search,
  Rocket,
  Play,
  Database,
  Cpu,
  Terminal,
  Server,
  Layers,
  Bot,
  Stethoscope,
  Code2,
  FileDiff,
  Globe,
  Lock,
  Maximize2,
  X,
  Blocks,
  CreditCard,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Environment } from "./TopBar";

interface CommandItem {
  id: string;
  title: string;
  category: "Actions" | "Navigation" | "Environments";
  icon: LucideIcon;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (panelId: string) => void;
  onEnvironmentChange: (env: Environment) => void;
  onToggleFocusMode: () => void;
  onDeploy: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onEnvironmentChange,
  onToggleFocusMode,
  onDeploy,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Actions
    {
      id: "act-dev",
      title: "Start Development Runtime (:3000, :8080, DB, Tunnel)",
      category: "Actions",
      icon: Play,
      shortcut: "⌘R",
      action: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      id: "act-deploy",
      title: "Deploy Release to Production / Staging",
      category: "Actions",
      icon: Rocket,
      shortcut: "⌘D",
      action: () => {
        onDeploy();
        onClose();
      },
    },
    {
      id: "act-doctor",
      title: "Run Project Doctor Diagnostics",
      category: "Actions",
      icon: Stethoscope,
      action: () => {
        onNavigate("doctor");
        onClose();
      },
    },
    {
      id: "act-focus",
      title: "Toggle Focus Mode (Distraction-Free Code)",
      category: "Actions",
      icon: Maximize2,
      shortcut: "⌘F",
      action: () => {
        onToggleFocusMode();
        onClose();
      },
    },
    {
      id: "act-ai",
      title: "Ask AI Agent (Analyze, Code, Operations)",
      category: "Actions",
      icon: Bot,
      shortcut: "⌘I",
      action: () => {
        onNavigate("ai");
        onClose();
      },
    },

    // Navigation
    {
      id: "nav-overview",
      title: "Go to Command Center (Overview)",
      category: "Navigation",
      icon: Layers,
      action: () => {
        onNavigate("dashboard");
        onClose();
      },
    },
    {
      id: "nav-code",
      title: "Go to Code Editor & Explorer",
      category: "Navigation",
      icon: Code2,
      action: () => {
        onNavigate("explorer");
        onClose();
      },
    },
    {
      id: "nav-changes",
      title: "Review Working Changes & Diffs",
      category: "Navigation",
      icon: FileDiff,
      action: () => {
        onNavigate("changes");
        onClose();
      },
    },
    {
      id: "nav-db",
      title: "Inspect Database Tables & Queries",
      category: "Navigation",
      icon: Database,
      action: () => {
        onNavigate("database");
        onClose();
      },
    },
    {
      id: "nav-workers",
      title: "Monitor Queue Workers & Jobs",
      category: "Navigation",
      icon: Cpu,
      action: () => {
        onNavigate("workers");
        onClose();
      },
    },
    {
      id: "nav-terminal",
      title: "Open Integrated Terminal Console",
      category: "Navigation",
      icon: Terminal,
      action: () => {
        onNavigate("terminal");
        onClose();
      },
    },
    {
      id: "nav-servers",
      title: "Manage Remote Servers Fleet",
      category: "Navigation",
      icon: Server,
      action: () => {
        onNavigate("servers");
        onClose();
      },
    },
    {
      id: "nav-domains",
      title: "Configure Domains, DNS & Caddy TLS 1.3",
      category: "Navigation",
      icon: Globe,
      action: () => {
        onNavigate("domains");
        onClose();
      },
    },
    {
      id: "nav-control-center",
      title: "Open Control Center (Plugins, AI Providers, Security)",
      category: "Navigation",
      icon: Blocks,
      action: () => {
        onNavigate("control-center");
        onClose();
      },
    },
    {
      id: "nav-hosting",
      title: "Manage Hosting Plans & Subscriptions",
      category: "Navigation",
      icon: CreditCard,
      action: () => {
        onNavigate("hosting");
        onClose();
      },
    },
    {
      id: "nav-clients",
      title: "Open Client CRM & Accounts",
      category: "Navigation",
      icon: Users,
      action: () => {
        onNavigate("clients");
        onClose();
      },
    },

    // Environments
    {
      id: "env-dev",
      title: "Switch Environment to DEV (Local machine isolated)",
      category: "Environments",
      icon: Layers,
      action: () => {
        onEnvironmentChange("dev");
        onClose();
      },
    },
    {
      id: "env-staging",
      title: "Switch Environment to STAGING (Pre-release cluster)",
      category: "Environments",
      icon: Layers,
      action: () => {
        onEnvironmentChange("staging");
        onClose();
      },
    },
    {
      id: "env-prod",
      title: "Switch Environment to PRODUCTION 🔒 (Mutations Gated)",
      category: "Environments",
      icon: Lock,
      action: () => {
        onEnvironmentChange("production");
        onClose();
      },
    },
  ];

  // Filter commands
  const filtered = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-750 shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-925">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. deploy, dev, doctor, db)..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Command List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-zinc-800/40 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white font-medium shadow-xs"
                      : "text-zinc-300 hover:bg-zinc-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={14} className={isSelected ? "text-white" : "text-indigo-400"} />
                    <span className="truncate">{cmd.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                        isSelected ? "bg-white/20 text-white" : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          isSelected
                            ? "bg-white/20 border-white/30 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Dismiss</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">AIPanel Universal Engine</span>
        </div>
      </div>
    </div>
  );
}
