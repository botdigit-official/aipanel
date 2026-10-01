import { useState } from "react";
import {
  FileDiff,
  GitBranch,
  Bot,
  Sparkles,
  Check,
  Eye,
  FileCode,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

interface ChangedFile {
  path: string;
  status: "M" | "A" | "D";
  additions: number;
  deletions: number;
  diffSnippet: string;
}

interface ChangesPanelProps {
  environment: Environment;
  projectName?: string;
  onCommitSuccess?: () => void;
  onNavigateToPreview?: () => void;
  onAskAI?: (prompt: string) => void;
}

export default function ChangesPanel({
  environment: _environment,
  projectName: _projectName = "aipanel",
  onCommitSuccess,
  onNavigateToPreview,
  onAskAI,
}: ChangesPanelProps) {
  const [changedFiles] = useState<ChangedFile[]>([
    {
      path: "src/components/layout/Sidebar.tsx",
      status: "M",
      additions: 48,
      deletions: 12,
      diffSnippet: `@@ -30,6 +30,12 @@
+export type SidebarSection = "overview" | "develop" | "run" | "deliver" | "infrastructure" | "system";
-export type SidebarSection = "project" | "environments" | "deploy" | "infrastructure" | "tools";`,
    },
    {
      path: "src/components/panels/OverviewPanel.tsx",
      status: "A",
      additions: 290,
      deletions: 0,
      diffSnippet: `@@ -0,0 +1,290 @@
+export default function OverviewPanel({ environment, projectName }: OverviewPanelProps) {
+  // Command Center 5-Second Overview
+  return <div className="overview-container">...</div>;
+}`,
    },
    {
      path: "src/components/layout/CommandPalette.tsx",
      status: "A",
      additions: 185,
      deletions: 0,
      diffSnippet: `@@ -0,0 +1,185 @@
+export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
+  // ⌘K Universal Action Runner
+}`,
    },
  ]);

  const [selectedFilePath, setSelectedFilePath] = useState(changedFiles[0]?.path || "");
  const [commitMessage, setCommitMessage] = useState("feat(ui): organize navigation by developer workflow and add command center");
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);

  const selectedFile = changedFiles.find((f) => f.path === selectedFilePath) || changedFiles[0];

  const handleCommit = async () => {
    setCommitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setCommitting(false);
    setCommitted(true);
    setTimeout(() => {
      setCommitted(false);
      onCommitSuccess?.();
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* ── Header ── */}
      <div className="h-12 border-b border-zinc-800/80 bg-zinc-900/80 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileDiff size={14} />
          </div>
          <h1 className="text-xs font-bold tracking-wider uppercase text-zinc-200">
            Working Tree Changes
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {changedFiles.length} files modified
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToPreview && (
            <button
              onClick={onNavigateToPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border border-sky-800/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Eye size={13} />
              <span>Create Preview URL</span>
            </button>
          )}

          {onAskAI && (
            <button
              onClick={() => onAskAI("Explain the architectural impact and test coverage of current working changes.")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Bot size={13} />
              <span>AI Review</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Split View ── */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Files List & AI Summary */}
        <div className="w-80 border-r border-zinc-800/80 flex flex-col bg-zinc-925/50 shrink-0">
          {/* AI Summary Card */}
          <div className="p-4 border-b border-zinc-800/80 space-y-2 bg-gradient-to-br from-indigo-950/30 to-zinc-900/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Sparkles size={13} className="text-indigo-400" />
              <span>AI Change Summary</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              "Re-architected navigation into 5 developer workflow stages, introduced universal ⌘K command palette, and added high-velocity Command Center overview."
            </p>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Changed Files ({changedFiles.length})
            </div>
            {changedFiles.map((file) => {
              const isSelected = selectedFilePath === file.path;
              return (
                <div
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-600/15 border border-indigo-500/40 text-zinc-100 font-medium"
                      : "hover:bg-zinc-800/50 text-zinc-400"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-4 h-4 rounded text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                        file.status === "M"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : file.status === "A"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {file.status}
                    </span>
                    <span className="truncate">{file.path.split("/").pop()}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono shrink-0 ml-2">
                    <span className="text-emerald-400">+{file.additions}</span>
                    <span className="text-rose-400">-{file.deletions}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Commit Box */}
          <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/80 space-y-2">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Stage & Commit
            </div>
            <textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              rows={2}
              className="w-full p-2 rounded-lg bg-zinc-950 border border-zinc-750 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-sans resize-none"
              placeholder="Commit message..."
            />
            <button
              onClick={handleCommit}
              disabled={committing || committed}
              className={`w-full py-2 rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                committed
                  ? "bg-emerald-600 text-white"
                  : committing
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40"
              }`}
            >
              {committed ? (
                <>
                  <Check size={13} />
                  <span>Committed!</span>
                </>
              ) : committing ? (
                <span>Writing Tree...</span>
              ) : (
                <>
                  <GitBranch size={13} />
                  <span>Commit to main</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Diff Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          <div className="h-10 px-4 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-925">
            <div className="flex items-center gap-2 font-mono">
              <FileCode size={13} className="text-indigo-400" />
              <span className="text-zinc-200 font-semibold">{selectedFile.path}</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              +{selectedFile.additions} / -{selectedFile.deletions}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-zinc-300 space-y-1">
            {selectedFile.diffSnippet.split("\n").map((line, i) => (
              <div
                key={i}
                className={`px-2 py-0.5 rounded ${
                  line.startsWith("+")
                    ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                    : line.startsWith("-")
                    ? "bg-rose-500/15 text-rose-300"
                    : line.startsWith("@@")
                    ? "text-indigo-400 bg-indigo-500/10 font-bold"
                    : "text-zinc-400"
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
