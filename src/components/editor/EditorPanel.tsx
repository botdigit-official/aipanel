import { useEffect, useRef, useState, type ReactNode, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { X, Circle, Save, Code, Eye, FileCode2 } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────

export interface EditorTab {
  path: string;
  name: string;
  language: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
}

interface EditorPanelProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
  onContentChange: (path: string, content: string) => void;
  onSave: (path: string) => void;
}

// ── Syntax Highlight (Simple Preview) ────────────────────────────

function highlightLine(line: string, language: string): ReactNode {
  if (language === "plaintext") {
    return <span>{line || "\u00A0"}</span>;
  }

  const keywords = [
    "import", "export", "from", "const", "let", "var", "function", "return",
    "if", "else", "for", "while", "class", "interface", "type", "enum",
    "pub", "fn", "struct", "impl", "use", "mod", "async", "await",
    "def", "self", "None", "True", "False",
    "public", "private", "protected", "static", "final",
  ];

  const parts: ReactNode[] = [];
  let remaining = line;
  let key = 0;

  const stringRegex = /(["'`])(?:(?!\1|\\).|\\.)*\1/;
  const commentRegex = /\/\/.*/;
  const numberRegex = /\b\d+(\.\d+)?\b/;

  while (remaining.length > 0) {
    const commentMatch = remaining.match(commentRegex);
    if (commentMatch && remaining.indexOf(commentMatch[0]) === 0) {
      parts.push(
        <span key={key++} className="text-zinc-500 italic">
          {commentMatch[0]}
        </span>
      );
      break;
    }

    const stringMatch = remaining.match(stringRegex);
    if (stringMatch && remaining.indexOf(stringMatch[0]) === 0) {
      parts.push(
        <span key={key++} className="text-emerald-400">
          {stringMatch[0]}
        </span>
      );
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    const numberMatch = remaining.match(numberRegex);
    if (numberMatch && remaining.indexOf(numberMatch[0]) === 0) {
      parts.push(
        <span key={key++} className="text-amber-400">
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    let foundKeyword = false;
    for (const kw of keywords) {
      const kwRegex = new RegExp(`^\\b${kw}\\b`);
      if (kwRegex.test(remaining)) {
        parts.push(
          <span key={key++} className="text-indigo-400 font-medium">
            {kw}
          </span>
        );
        remaining = remaining.slice(kw.length);
        foundKeyword = true;
        break;
      }
    }
    if (foundKeyword) continue;

    parts.push(<span key={key++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{parts.length > 0 ? parts : "\u00A0"}</>;
}

// ── Component ────────────────────────────────────────────────────

export default function EditorPanel({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  onContentChange,
  onSave,
}: EditorPanelProps) {
  const currentTab = tabs.find((t) => t.path === activeTab);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (activeTab) onSave(activeTab);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, onSave]);

  // Synchronize scroll between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const text = textarea.value.slice(0, textarea.selectionStart);
    const lines = text.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (currentTab) {
      onContentChange(currentTab.path, e.target.value);
      updateCursorPosition(e.target);
    }
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea || !currentTab) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onContentChange(currentTab.path, newValue);

      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition(textarea);
      }, 0);
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-base gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <span className="text-2xl font-bold text-indigo-400">A</span>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">AIPanel IDE</h2>
          <p className="text-xs text-zinc-400 max-w-72 leading-relaxed">
            Select a file from the explorer to begin editing, or generate services using the AI agent.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 text-[11px] text-zinc-400 mt-4">
          <div className="flex items-center gap-2.5">
            <kbd className="px-2 py-0.5 bg-zinc-800/90 rounded text-[10px] font-mono border border-zinc-700/60 text-zinc-300 shadow-xs">⌘P</kbd>
            <span>Quick Open File</span>
          </div>
          <div className="flex items-center gap-2.5">
            <kbd className="px-2 py-0.5 bg-zinc-800/90 rounded text-[10px] font-mono border border-zinc-700/60 text-zinc-300 shadow-xs">⌘S</kbd>
            <span>Save Active Buffer</span>
          </div>
        </div>
      </div>
    );
  }

  const lines = currentTab ? currentTab.content.split("\n") : [];

  const getFileBadgeColor = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (ext === "json") return "text-yellow-400";
    if (ext === "ts" || ext === "tsx") return "text-cyan-400";
    if (ext === "js" || ext === "jsx") return "text-amber-400";
    if (ext === "rs") return "text-orange-400";
    if (ext === "css" || ext === "scss") return "text-pink-400";
    if (name.includes("Dockerfile")) return "text-sky-400";
    if (name.includes(".db") || ext === "sql") return "text-emerald-400";
    return "text-indigo-400";
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 min-w-0">
      {/* Tab Bar */}
      <div className="flex items-center justify-between h-9 bg-zinc-900/90 border-b border-zinc-800/80 shrink-0 px-1 select-none">
        <div className="flex items-center h-full overflow-x-auto space-x-0.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.path === activeTab;
            const iconColor = getFileBadgeColor(tab.name);
            return (
              <div
                key={tab.path}
                className={`
                  group flex items-center gap-2 px-3 h-8 text-[12px] font-medium rounded-t-lg
                  cursor-pointer shrink-0 transition-all select-none border-t-2
                  ${isActive
                    ? "bg-zinc-950 text-zinc-100 border-t-indigo-500 border-x border-zinc-800/90 shadow-xs"
                    : "border-t-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }
                `}
                onClick={() => onTabClick(tab.path)}
              >
                <FileCode2 size={13} className={`${iconColor} shrink-0`} />
                <span className="truncate max-w-40">{tab.name}</span>
                {tab.isDirty && (
                  <Circle size={6} className="fill-amber-400 text-amber-400 shrink-0 group-hover:hidden" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.path);
                  }}
                  className={`
                    p-0.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-100 ml-1 shrink-0
                    ${tab.isDirty ? "hidden group-hover:block" : ""}
                  `}
                  title="Close tab"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tab Actions */}
        {currentTab && (
          <div className="flex items-center gap-1.5 pr-2 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === "edit" ? "preview" : "edit")}
              className={`px-2 py-1 rounded-md text-xs flex items-center gap-1.5 border transition-all ${
                viewMode === "preview"
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-xs"
                  : "bg-zinc-800/60 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              title={viewMode === "edit" ? "Switch to Syntax Highlighting View" : "Switch to Raw Editor"}
            >
              {viewMode === "edit" ? <Eye size={12} /> : <Code size={12} />}
              <span className="text-[11px] font-mono capitalize">{viewMode}</span>
            </button>
            <button
              onClick={() => onSave(currentTab.path)}
              disabled={!currentTab.isDirty}
              className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 border font-medium transition-all ${
                currentTab.isDirty
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-sm"
                  : "bg-zinc-800/40 text-zinc-500 border-zinc-800/60 cursor-default"
              }`}
              title="Save (⌘S)"
            >
              <Save size={12} />
              <span className="text-[11px]">Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb Info Bar */}
      {currentTab && (
        <div className="h-7 bg-zinc-925 border-b border-zinc-800/70 flex items-center justify-between px-3 text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="truncate max-w-md text-zinc-400 flex items-center gap-1.5">
            <span className="text-zinc-500">📁</span>
            <span className="text-zinc-300 font-medium">
              {currentTab.path.split("/").slice(-3).join(" / ")}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-indigo-300 border border-zinc-700/60 font-semibold tracking-wide">
              {currentTab.language}
            </span>
            <span className="text-zinc-400">{lines.length} lines</span>
            <span className="text-zinc-300">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          </div>
        </div>
      )}

      {/* Editor Main Canvas */}
      {currentTab && (
        <div className="flex-1 flex overflow-hidden bg-zinc-950 font-mono text-[13px] relative">
          {/* Dedicated Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            className="w-14 shrink-0 overflow-hidden bg-zinc-925/80 border-r border-zinc-800/80 select-none text-right pr-3.5 py-2.5 text-zinc-500 text-[12px] leading-6 font-mono"
          >
            {lines.map((_, i) => (
              <div key={i} className="hover:text-zinc-300 transition-colors">
                {i + 1}
              </div>
            ))}
            <div className="h-40" />
          </div>

          {/* Code Area */}
          {viewMode === "edit" ? (
            <textarea
              ref={textareaRef}
              value={currentTab.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              onClick={(e) => updateCursorPosition(e.currentTarget)}
              onKeyUp={(e) => updateCursorPosition(e.currentTarget)}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="flex-1 py-2.5 pl-4 pr-6 bg-transparent text-zinc-200 resize-none outline-none font-mono text-[13px] leading-6 whitespace-pre tab-size-2 overflow-auto caret-indigo-400 selection:bg-indigo-500/25"
              style={{ tabSize: 2 }}
            />
          ) : (
            <div className="flex-1 overflow-auto py-2.5 pl-4 pr-6 text-zinc-200 leading-6">
              {lines.map((line, i) => (
                <div key={i} className="whitespace-pre">
                  {highlightLine(line, currentTab.language)}
                </div>
              ))}
              <div className="h-40" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
