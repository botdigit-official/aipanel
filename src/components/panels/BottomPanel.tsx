import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Terminal,
  ScrollText,
  TestTube,
  Settings,
  Database,
  Rocket,
  Stethoscope,
  ChevronUp,
  ChevronDown,
  Trash2,
  Maximize2,
  Minimize2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

type BottomTab = "terminal" | "logs" | "tests" | "workers" | "database" | "deploy" | "doctor";

interface BottomPanelProps {
  expanded: boolean;
  onToggle: () => void;
}

interface CommandLog {
  id: number;
  type: "command" | "output" | "error" | "success" | "info";
  text: string;
}

const tabs: { id: BottomTab; label: string; icon: typeof Terminal }[] = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "tests", label: "Tests", icon: TestTube },
  { id: "workers", label: "Workers", icon: Settings },
  { id: "database", label: "Database", icon: Database },
  { id: "deploy", label: "Deploy", icon: Rocket },
  { id: "doctor", label: "Doctor", icon: Stethoscope },
];

export default function BottomPanel({ expanded, onToggle }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>("terminal");
  const [inputVal, setInputVal] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [logs, setLogs] = useState<CommandLog[]>([
    { id: 1, type: "info", text: "AIPanel Terminal v0.1.0 (unified dev/deploy OS)" },
    { id: 2, type: "info", text: "Type 'help' or 'aipanel' for available commands. PTY bridge active." },
  ]);

  useEffect(() => {
    if (activeTab === "terminal" && expanded) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, activeTab, expanded]);

  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Add to history
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(null);

    const newLogs: CommandLog[] = [
      ...logs,
      { id: Date.now(), type: "command", text: `❯ ${cmd}` },
    ];

    const parts = cmd.split(" ");
    const root = parts[0].toLowerCase();
    const arg = parts[1]?.toLowerCase();

    if (root === "clear") {
      setLogs([]);
      setInputVal("");
      return;
    }

    if (root === "help" || root === "aipanel" || root === "aipanel") {
      if (!arg) {
        newLogs.push({
          id: Date.now() + 1,
          type: "output",
          text: "Available commands:\n  help              - List all available commands\n  aipanel dev       - Start dev stack with containers and native services\n  aipanel build     - Trigger project build pipeline\n  aipanel doctor    - Run pre-flight health diagnostics\n  aipanel tunnel    - Check or start Cloudflare/ngrok tunnel\n  aipanel deploy    - Deploy current version to staging/production\n  env               - Show current environment status\n  clear             - Clear terminal display",
        });
      }
    }
    if ((root === "aipanel" || root === "aipanel") && arg === "dev") {
      newLogs.push({
        id: Date.now() + 1,
        type: "info",
        text: "→ Spawning dev environment...\n✓ PostgreSQL started (port 5432)\n✓ Redis started (port 6379)\n✓ Vite / Next.js dev server listening on http://localhost:3000\n✓ Cloudflare Tunnel active: https://aipanel-dev.preview.site",
      });
    } else if ((root === "aipanel" || root === "aipanel") && arg === "doctor") {
      newLogs.push({
        id: Date.now() + 1,
        type: "success",
        text: "[Doctor] Checking system integrity...\n[✓] Rust & Cargo: OK (1.80+)\n[✓] Node.js & npm: OK (v20+)\n[✓] Local Docker Daemon: Running\n[✓] Port availability (:3000, :5432, :6379): Available\n[✓] Secrets Vault: Sealed & Protected\nAll 5 pre-flight checks passed.",
      });
    } else if ((root === "aipanel" || root === "aipanel") && arg === "build") {
      newLogs.push({
        id: Date.now() + 1,
        type: "info",
        text: "Building production release...\n→ Installing dependencies\n→ Compiling frontend assets (Vite)\n→ Generating immutable release artifact v0.1.0\n✓ Build completed in 1.4s (dist/ bundle ready)",
      });
    } else if (root === "env") {
      newLogs.push({
        id: Date.now() + 1,
        type: "output",
        text: "ENVIRONMENT: DEV (Local Machine)\nVAULT: Sealed (AES-256-GCM)\nPROTECTION LEVEL: Safe (Accidental LIVE mutations blocked)",
      });
    } else {
      newLogs.push({
        id: Date.now() + 1,
        type: "error",
        text: `zsh: command not found: ${cmd}. Type 'help' for command manual.`,
      });
    }

    setLogs(newLogs);
    setInputVal("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(null);
        setInputVal("");
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      }
    }
  };

  return (
    <div
      className={`
        flex flex-col bg-zinc-950 border-t border-zinc-800/80 select-none
        transition-all duration-200 ease-out
        ${expanded ? (isMaximized ? "h-[60vh]" : "h-56") : "h-9"}
      `}
    >
      {/* Tab bar */}
      <div className="flex items-center h-9 px-2 bg-zinc-900/95 border-b border-zinc-800/80 shrink-0 select-none">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (!expanded) onToggle();
                }}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg
                  transition-all cursor-pointer shrink-0
                  ${isActive && expanded
                    ? "bg-zinc-800 text-zinc-100 shadow-xs border border-zinc-700/50"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                  }
                `}
              >
                <Icon size={12} className={isActive && expanded ? "text-indigo-400" : "text-zinc-500"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Quick action chips & collapse toggle */}
        <div className="flex items-center gap-1.5">
          {activeTab === "terminal" && expanded && (
            <div className="hidden sm:flex items-center gap-1 mr-2 text-[10px] font-mono">
              {["help", "aipanel doctor", "aipanel dev", "clear"].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => executeCommand(cmd)}
                  className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 border border-zinc-700/40 cursor-pointer transition-colors"
                >
                  {cmd}
                </button>
              ))}
            </div>
          )}

          {activeTab === "terminal" && expanded && (
            <button
              onClick={() => setLogs([])}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear Terminal Display"
            >
              <Trash2 size={13} />
            </button>
          )}

          {expanded && (
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isMaximized ? "Restore Height" : "Maximize Panel"}
            >
              {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            title={expanded ? "Collapse panel" : "Expand panel"}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="flex-1 overflow-hidden p-3 font-mono text-xs bg-zinc-950 flex flex-col">
          {activeTab === "terminal" && (
            <div className="flex flex-col h-full" onClick={() => inputRef.current?.focus()}>
              <div className="flex-1 overflow-y-auto space-y-1.5 pb-2 pr-1 select-text">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`whitespace-pre-wrap leading-relaxed font-mono ${
                      log.type === "command"
                        ? "text-zinc-100 font-semibold"
                        : log.type === "error"
                        ? "text-rose-400"
                        : log.type === "success"
                        ? "text-emerald-400 font-semibold"
                        : log.type === "info"
                        ? "text-sky-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Command input prompt */}
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 border border-zinc-800/80 rounded-xl shrink-0 mt-1 shadow-inner">
                <span className="text-emerald-400 font-bold select-none text-sm leading-none">❯</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="type a command (e.g. help, aipanel dev, aipanel doctor, clear)..."
                  className="flex-1 bg-transparent text-zinc-100 outline-none text-xs font-mono placeholder:text-zinc-500"
                  autoFocus
                />
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-zinc-700/50">
                  Enter ↵
                </kbd>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="font-mono text-xs space-y-1">
              <div className="text-zinc-500">[system] AIPanel IDE v0.1.0 started</div>
              <div className="text-emerald-400">[info] Ready for development. Native Tauri IPC initialized.</div>
              <div className="text-zinc-400">[audit] DEV environment active. Production network isolated.</div>
            </div>
          )}

          {activeTab === "tests" && (
            <div className="text-xs text-zinc-500 flex flex-col items-center justify-center h-full gap-2">
              <TestTube size={20} className="text-zinc-600" />
              <span>Automated Test Runner — Configured for Vitest & Cargo test</span>
            </div>
          )}

          {activeTab === "workers" && (
            <div className="text-xs text-zinc-500 flex flex-col items-center justify-center h-full gap-2">
              <Settings size={20} className="text-zinc-600" />
              <span>Background Workers — Ready to supervise Horizon, Celery, BullMQ</span>
            </div>
          )}

          {activeTab === "database" && (
            <div className="text-xs text-zinc-500 flex flex-col items-center justify-center h-full gap-2">
              <Database size={20} className="text-zinc-600" />
              <span>Embedded Query Studio — Inspect local & staging databases</span>
            </div>
          )}

          {activeTab === "deploy" && (
            <div className="text-xs text-zinc-500 flex flex-col items-center justify-center h-full gap-2">
              <Rocket size={20} className="text-zinc-600" />
              <span>Deployment Pipeline — Staging & Production targets ready</span>
            </div>
          )}

          {activeTab === "doctor" && (
            <div className="text-xs text-zinc-500 flex flex-col items-center justify-center h-full gap-2">
              <Stethoscope size={20} className="text-zinc-600" />
              <span>Pre-Flight Doctor — Validates build artifacts, ports, and credentials</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
