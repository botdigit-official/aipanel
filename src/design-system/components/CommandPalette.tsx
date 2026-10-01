import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Code,
  Terminal,
  Server,
  Database,
  Rocket,
  Settings,
  Sparkles,
  Layers,
  FolderOpen,
  ArrowRight,
  Shield,
  Activity,
  Globe,
} from "lucide-react";

export interface CommandItem {
  id: string;
  category: "Recent" | "Actions" | "Navigation" | "AI";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (panel: string) => void;
  onTriggerAI: () => void;
  onOpenProject: () => void;
  onDeploy: (env: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerAI,
  onOpenProject,
  onDeploy,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = useMemo(
    () => [
      // AI
      {
        id: "ai-ask",
        category: "AI",
        title: "Ask AI Agent...",
        subtitle: "Context-aware code and architecture assistance",
        icon: <Sparkles className="w-4 h-4 text-violet-400" />,
        shortcut: "⌘I",
        onSelect: () => {
          onTriggerAI();
          onClose();
        },
      },
      // Actions
      {
        id: "action-new-deploy",
        category: "Actions",
        title: "Trigger Deployment (Staging)",
        subtitle: "Build container & deploy to staging fleet",
        icon: <Rocket className="w-4 h-4 text-emerald-400" />,
        shortcut: "⌘D",
        onSelect: () => {
          onDeploy("staging");
          onClose();
        },
      },
      {
        id: "action-terminal",
        category: "Actions",
        title: "Open Interactive Terminal",
        subtitle: "Spawn zsh session or container shell",
        icon: <Terminal className="w-4 h-4 text-cyan-400" />,
        shortcut: "⌘`",
        onSelect: () => {
          onNavigate("terminal");
          onClose();
        },
      },
      {
        id: "action-open-project",
        category: "Actions",
        title: "Open Project Folder...",
        subtitle: "Browse local filesystem workspace",
        icon: <FolderOpen className="w-4 h-4 text-amber-400" />,
        shortcut: "⌘O",
        onSelect: () => {
          onOpenProject();
          onClose();
        },
      },
      // Navigation
      {
        id: "nav-code",
        category: "Navigation",
        title: "Code Editor",
        subtitle: "File tree & live Monaco buffer",
        icon: <Code className="w-4 h-4 text-blue-400" />,
        onSelect: () => {
          onNavigate("explorer");
          onClose();
        },
      },
      {
        id: "nav-servers",
        category: "Navigation",
        title: "Server Fleet Dashboard",
        subtitle: "Real-time host telemetry & VPS fleet",
        icon: <Server className="w-4 h-4 text-purple-400" />,
        onSelect: () => {
          onNavigate("servers");
          onClose();
        },
      },
      {
        id: "nav-database",
        category: "Navigation",
        title: "Database Cockpit",
        subtitle: "PostgreSQL & Redis query browser",
        icon: <Database className="w-4 h-4 text-emerald-400" />,
        onSelect: () => {
          onNavigate("database");
          onClose();
        },
      },
      {
        id: "nav-releases",
        category: "Navigation",
        title: "Releases & Deployments",
        subtitle: "Zero-downtime releases and instant rollbacks",
        icon: <Layers className="w-4 h-4 text-amber-400" />,
        onSelect: () => {
          onNavigate("releases");
          onClose();
        },
      },
      {
        id: "nav-monitoring",
        category: "Navigation",
        title: "Monitoring & Telemetry",
        subtitle: "CPU, Memory, Network I/O and health checks",
        icon: <Activity className="w-4 h-4 text-sky-400" />,
        onSelect: () => {
          onNavigate("monitoring");
          onClose();
        },
      },
      {
        id: "nav-domains",
        category: "Navigation",
        title: "Domains & SSL",
        subtitle: "Caddy reverse proxy and certificate statuses",
        icon: <Globe className="w-4 h-4 text-teal-400" />,
        onSelect: () => {
          onNavigate("domains");
          onClose();
        },
      },
      {
        id: "nav-settings",
        category: "Navigation",
        title: "Preferences & Safe Mode",
        subtitle: "Production safe mode and BYOK credentials",
        icon: <Settings className="w-4 h-4 text-zinc-400" />,
        shortcut: "⌘,",
        onSelect: () => {
          onNavigate("settings");
          onClose();
        },
      },
      {
        id: "nav-control-center",
        category: "Navigation",
        title: "Control Center & Plugins",
        subtitle: "Modular marketplace and security masks",
        icon: <Shield className="w-4 h-4 text-violet-400" />,
        onSelect: () => {
          onNavigate("control-center");
          onClose();
        },
      },
    ],
    [onNavigate, onTriggerAI, onOpenProject, onDeploy, onClose]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles open
      }
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 < 0 ? Math.max(0, filteredCommands.length - 1) : prev - 1
        );
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].onSelect();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-[#161923] border border-white/12 rounded-xl shadow-2xl shadow-black/90 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, or search files..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-transparent">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-violet-600/15 border border-violet-500/25" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-violet-600/25 border-violet-500/40 text-violet-300"
                          : "bg-white/5 border-white/10 text-zinc-400"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-zinc-200 truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono font-normal">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? "text-violet-400" : "text-transparent"
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 bg-[#0C0D12] border-t border-white/8 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-violet-400/80">AIPanel Cockpit</span>
        </div>
      </div>
    </div>
  );
};
