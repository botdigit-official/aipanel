import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  X,
  Circle,
  Save,
  Code,
  Eye,
  FileCode2,
  Copy,
  Check,
  Search,
  ChevronUp,
  ChevronDown,
  WrapText,
  Sparkles,
  FolderOpen,
  FileText,
  ArrowRight,
  BookOpen,
  History,
  RotateCcw,
  GitCompare,
  Zap,
} from "lucide-react";
import { useEditorStore, type EditorTab, type FileHistoryEntry } from "../../stores/editor";

interface EditorPanelProps {
  tabs: EditorTab[];
  activeTab: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
  onContentChange: (path: string, content: string) => void;
  onSave: (path: string) => void;
  onRevert?: (path: string) => void;
  projectPath?: string | null;
  projectName?: string;
  projectFramework?: string | null;
  onOpenFileByPath?: (path: string) => void;
  onOpenWorkspaceSwitcher?: () => void;
}

// ── Syntax Highlighter ───────────────────────────────────────────

function highlightLine(line: string, language: string): ReactNode {
  if (language === "plaintext") {
    return <span>{line || "\u00A0"}</span>;
  }

  const keywords = new Set([
    "import", "export", "from", "default", "as", "const", "let", "var",
    "function", "return", "if", "else", "for", "while", "do", "switch",
    "case", "break", "continue", "class", "interface", "type", "enum",
    "extends", "implements", "new", "this", "super", "try", "catch",
    "finally", "throw", "async", "await", "yield", "typeof", "instanceof",
    // Rust
    "pub", "fn", "struct", "impl", "use", "mod", "trait", "where", "mut",
    "match", "loop", "move", "ref", "crate",
    // Python
    "def", "self", "elif", "pass", "lambda", "with", "is", "in", "not", "and", "or",
  ]);

  const typeKeywords = new Set([
    "string", "number", "boolean", "any", "void", "never", "unknown", "object",
    "Promise", "ReactNode", "FC", "Array", "Record", "Set", "Map",
    "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64", "usize", "isize", "f32", "f64", "bool",
    "Option", "Result", "String", "Vec", "Box", "Rc", "Arc",
  ]);

  const literalKeywords = new Set([
    "true", "false", "null", "undefined", "None", "True", "False", "Some", "Ok", "Err",
  ]);

  const parts: ReactNode[] = [];
  let remaining = line;
  let key = 0;

  // Regex tokens
  const commentRegex = /^(\/\/.*|#.*)/;
  const stringRegex = /^("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/;
  const numberRegex = /^\b(\d+(\.\d+)?|0x[0-9a-fA-F]+)\b/;
  const wordRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*/;
  const punctuationRegex = /^[^\w\s"'/`#]+/;
  const whitespaceRegex = /^\s+/;

  while (remaining.length > 0) {
    // 1. Whitespace
    const wsMatch = remaining.match(whitespaceRegex);
    if (wsMatch) {
      parts.push(<span key={key++}>{wsMatch[0]}</span>);
      remaining = remaining.slice(wsMatch[0].length);
      continue;
    }

    // 2. Comments
    const commentMatch = remaining.match(commentRegex);
    if (commentMatch) {
      parts.push(
        <span key={key++} className="text-zinc-500 italic">
          {commentMatch[0]}
        </span>
      );
      break;
    }

    // 3. Strings
    const stringMatch = remaining.match(stringRegex);
    if (stringMatch) {
      parts.push(
        <span key={key++} className="text-emerald-400">
          {stringMatch[0]}
        </span>
      );
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    // 4. Numbers
    const numberMatch = remaining.match(numberRegex);
    if (numberMatch) {
      parts.push(
        <span key={key++} className="text-amber-400">
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    // 5. Words (keywords, types, literals, identifiers)
    const wordMatch = remaining.match(wordRegex);
    if (wordMatch) {
      const word = wordMatch[0];
      let colorClass = "text-zinc-200";

      if (keywords.has(word)) {
        colorClass = "text-indigo-400 font-medium";
      } else if (typeKeywords.has(word)) {
        colorClass = "text-cyan-400 font-medium";
      } else if (literalKeywords.has(word)) {
        colorClass = "text-orange-400";
      } else if (remaining.slice(word.length).trim().startsWith("(")) {
        colorClass = "text-sky-300"; // function call
      }

      parts.push(
        <span key={key++} className={colorClass}>
          {word}
        </span>
      );
      remaining = remaining.slice(word.length);
      continue;
    }

    // 6. Punctuations & operators
    const punctMatch = remaining.match(punctuationRegex);
    if (punctMatch) {
      parts.push(
        <span key={key++} className="text-zinc-400">
          {punctMatch[0]}
        </span>
      );
      remaining = remaining.slice(punctMatch[0].length);
      continue;
    }

    // 7. Single char fallback
    parts.push(<span key={key++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{parts.length > 0 ? parts : "\u00A0"}</>;
}

// ── Line-by-Line Visual Diff Utility ──────────────────────────────

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  text: string;
  originalLineNum?: number;
  newLineNum?: number;
}

function computeSimpleDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  const diff: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let origLineNum = 1;
  let newLineNum = 1;

  while (i < origLines.length && j < modLines.length) {
    if (origLines[i] === modLines[j]) {
      diff.push({
        type: "unchanged",
        text: origLines[i],
        originalLineNum: origLineNum++,
        newLineNum: newLineNum++,
      });
      i++;
      j++;
    } else {
      const nextMatchInMod = modLines.indexOf(origLines[i], j);
      const nextMatchInOrig = origLines.indexOf(modLines[j], i);

      if (nextMatchInMod !== -1 && (nextMatchInOrig === -1 || nextMatchInMod - j <= nextMatchInOrig - i)) {
        while (j < nextMatchInMod) {
          diff.push({ type: "added", text: modLines[j], newLineNum: newLineNum++ });
          j++;
        }
      } else if (nextMatchInOrig !== -1) {
        while (i < nextMatchInOrig) {
          diff.push({ type: "removed", text: origLines[i], originalLineNum: origLineNum++ });
          i++;
        }
      } else {
        diff.push({ type: "removed", text: origLines[i], originalLineNum: origLineNum++ });
        diff.push({ type: "added", text: modLines[j], newLineNum: newLineNum++ });
        i++;
        j++;
      }
    }
  }

  while (i < origLines.length) {
    diff.push({ type: "removed", text: origLines[i], originalLineNum: origLineNum++ });
    i++;
  }
  while (j < modLines.length) {
    diff.push({ type: "added", text: modLines[j], newLineNum: newLineNum++ });
    j++;
  }

  return diff;
}

// ── Component ────────────────────────────────────────────────────

export default function EditorPanel({
  tabs,
  activeTab,
  onTabClick,
  onTabClose,
  onContentChange,
  onSave,
  onRevert,
  projectPath,
  projectName,
  projectFramework,
  onOpenFileByPath,
  onOpenWorkspaceSwitcher,
}: EditorPanelProps) {
  const currentTab = tabs.find((t) => t.path === activeTab);
  const autoSave = useEditorStore((s) => s.autoSave);
  const setAutoSave = useEditorStore((s) => s.setAutoSave);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const dismissAIEditSummary = useEditorStore((s) => s.dismissAIEditSummary);

  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showDiffView, setShowDiffView] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1, selectionLen: 0 });
  const [wordWrap, setWordWrap] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Search & Replace states (⌘F)
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIdx, setCurrentMatchIdx] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: ⌘S for save, ⌘F for find
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (activeTab) {
          onSave(activeTab);
          setJustSaved(true);
          setTimeout(() => setJustSaved(false), 2000);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
        setTimeout(() => searchInputRef.current?.focus(), 50);
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
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.slice(0, start);
    const lines = text.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
      selectionLen: Math.abs(end - start),
    });
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (currentTab) {
      onContentChange(currentTab.path, e.target.value);
      updateCursorPosition(e.target);
    }
  };

  // Indentation handling (Tab key inserts 2 spaces, Enter maintains indent)
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea || !currentTab) return;

    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const updated = val.substring(0, start) + "  " + val.substring(end);
      onContentChange(currentTab.path, updated);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        updateCursorPosition(textarea);
      }, 0);
      return;
    }

    if (e.key === "Enter") {
      const start = textarea.selectionStart;
      const val = textarea.value;
      const currentLineText = val.slice(0, start).split("\n").pop() || "";
      const matchIndent = currentLineText.match(/^(\s+)/);

      if (matchIndent) {
        e.preventDefault();
        const indent = matchIndent[1];
        const updated = val.substring(0, start) + "\n" + indent + val.substring(start);
        onContentChange(currentTab.path, updated);

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
          updateCursorPosition(textarea);
        }, 0);
      }
    }
  };

  // Find occurrences in current tab
  useEffect(() => {
    if (!searchQuery || !currentTab) {
      setSearchMatches([]);
      setCurrentMatchIdx(0);
      return;
    }

    const content = currentTab.content;
    const matches: number[] = [];
    let pos = 0;
    const lowerQuery = searchQuery.toLowerCase();
    const lowerContent = content.toLowerCase();

    while ((pos = lowerContent.indexOf(lowerQuery, pos)) !== -1) {
      matches.push(pos);
      pos += lowerQuery.length;
    }

    setSearchMatches(matches);
    setCurrentMatchIdx(0);
  }, [searchQuery, currentTab?.content]);

  // Jump to match
  const jumpToMatch = useCallback((idx: number) => {
    if (searchMatches.length === 0 || !textareaRef.current) return;
    const targetPos = searchMatches[idx];
    const textarea = textareaRef.current;
    textarea.focus();
    textarea.selectionStart = targetPos;
    textarea.selectionEnd = targetPos + searchQuery.length;
    updateCursorPosition(textarea);
  }, [searchMatches, searchQuery.length]);

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIdx + 1) % searchMatches.length;
    setCurrentMatchIdx(nextIdx);
    jumpToMatch(nextIdx);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIdx - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIdx(prevIdx);
    jumpToMatch(prevIdx);
  };

  const handleReplaceCurrent = () => {
    if (!currentTab || searchMatches.length === 0) return;
    const start = searchMatches[currentMatchIdx];
    const end = start + searchQuery.length;
    const updated = currentTab.content.substring(0, start) + replaceQuery + currentTab.content.substring(end);
    onContentChange(currentTab.path, updated);
  };

  const handleReplaceAll = () => {
    if (!currentTab || !searchQuery) return;
    const updated = currentTab.content.split(searchQuery).join(replaceQuery);
    onContentChange(currentTab.path, updated);
  };

  const handleCopyCode = () => {
    if (!currentTab) return;
    navigator.clipboard.writeText(currentTab.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 1500);
  };

  const handleCopyPath = () => {
    if (!currentTab) return;
    navigator.clipboard.writeText(currentTab.path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  };

  const handleSaveClick = () => {
    if (!currentTab) return;
    onSave(currentTab.path);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // If no tabs are open, show an elegant Code Studio Launchpad
  if (tabs.length === 0) {
    const quickFiles = [
      { name: "README.md", path: `${projectPath || ""}/README.md`, desc: "Project documentation & guides", icon: BookOpen, color: "text-sky-400" },
      { name: "package.json", path: `${projectPath || ""}/package.json`, desc: "Dependencies, scripts & manifests", icon: FileCode2, color: "text-amber-400" },
      { name: "src/App.tsx", path: `${projectPath || ""}/src/App.tsx`, desc: "Main application component", icon: Code, color: "text-blue-400" },
      { name: "vite.config.ts", path: `${projectPath || ""}/vite.config.ts`, desc: "Vite build & dev server config", icon: Sparkles, color: "text-purple-400" },
      { name: "TASK.md", path: `${projectPath || ""}/TASK.md`, desc: "Active engineering sprint tasks", icon: FileText, color: "text-emerald-400" },
    ];

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950 p-6 select-none border-t border-zinc-800/80 overflow-y-auto custom-scrollbar">
        {/* Project Header */}
        <div className="flex flex-col items-center text-center max-w-lg mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shadow-lg shadow-indigo-500/10 mb-3 animate-in fade-in zoom-in-95 duration-200">
            <Sparkles size={24} className="text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 font-sans tracking-tight">
            {projectName || "AIPanel"} Code Studio
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
            {projectFramework && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
                {projectFramework}
              </span>
            )}
            <span className="text-xs text-zinc-400 font-mono truncate max-w-xs">
              {projectPath}
            </span>
            {onOpenWorkspaceSwitcher && (
              <button
                type="button"
                onClick={onOpenWorkspaceSwitcher}
                className="inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 font-sans transition-colors cursor-pointer"
              >
                <FolderOpen size={11} className="text-indigo-400" />
                Switch Workspace
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Quick Open Core Files */}
        {projectPath && onOpenFileByPath && (
          <div className="w-full max-w-xl mb-6">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-sans mb-2.5 px-1">
              Quick Open Core Files
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {quickFiles.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.name}
                    onClick={() => onOpenFileByPath(f.path)}
                    className="group flex items-center justify-between p-3 rounded-xl bg-[#0e1019] hover:bg-[#141724] border border-[#23293d] hover:border-indigo-500/40 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon size={14} className={f.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-indigo-300 font-mono truncate transition-colors">
                          {f.name}
                        </div>
                        <div className="text-[10.5px] text-zinc-400 font-sans truncate mt-0.5">
                          {f.desc}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Bar */}
        <div className="w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
          <div className="p-2.5 rounded-lg bg-[#0e1019] border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Save File</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700/60">⌘S</kbd>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0e1019] border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Find</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700/60">⌘F</kbd>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0e1019] border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Commands</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700/60">⌘K</kbd>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0e1019] border border-zinc-800/80 flex items-center justify-between">
            <span className="text-zinc-400">Indent</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700/60">Tab (2sp)</kbd>
          </div>
        </div>
      </div>
    );
  }

  const lines = currentTab ? currentTab.content.split("\n") : [];

  const diffLines = (currentTab && (showDiffView || currentTab.isDirty))
    ? computeSimpleDiff(currentTab.originalContent, currentTab.content)
    : [];
  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;

  const getTabIconColor = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (ext === "json") return "text-amber-400";
    if (ext === "ts" || ext === "tsx") return "text-blue-400";
    if (ext === "js" || ext === "jsx") return "text-yellow-400";
    if (ext === "rs") return "text-orange-400";
    if (ext === "css" || ext === "scss") return "text-pink-400";
    if (ext === "md") return "text-sky-300";
    if (ext === "toml" || ext === "yaml") return "text-purple-400";
    if (name.includes("Dockerfile")) return "text-sky-400";
    return "text-indigo-400";
  };

  // Breadcrumbs parsing
  const pathParts = currentTab ? currentTab.path.split("/").filter(Boolean) : [];
  const displayParts = pathParts.slice(-4);

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 min-w-0 h-full overflow-hidden select-none">
      {/* ── Tabs Bar ── */}
      <div className="flex items-center justify-between h-9 bg-zinc-900/90 border-b border-zinc-800/80 shrink-0 px-1">
        <div className="flex items-center h-full overflow-x-auto space-x-1 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = tab.path === activeTab;
            const iconColor = getTabIconColor(tab.name);
            return (
              <div
                key={tab.path}
                onClick={() => onTabClick(tab.path)}
                className={`
                  group flex items-center gap-2 px-3 h-8 text-[12px] font-mono rounded-t-md
                  cursor-pointer shrink-0 transition-all select-none border-t-2
                  ${isActive
                    ? "bg-zinc-950 text-zinc-100 border-t-indigo-500 border-x border-zinc-800/90 font-medium"
                    : "border-t-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }
                `}
              >
                <FileCode2 size={13} className={`${iconColor} shrink-0`} />
                <span className="truncate max-w-44">{tab.name}</span>

                {/* Dirty dot or Close button */}
                {tab.isDirty ? (
                  <Circle size={6} className="fill-amber-400 text-amber-400 shrink-0 group-hover:hidden" />
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.path);
                  }}
                  className={`
                    p-0.5 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-100 shrink-0
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

        {/* Tab Right Controls */}
        {currentTab && (
          <div className="flex items-center gap-1 pr-2 shrink-0">
            {/* Search Toggle */}
            <button
              onClick={() => {
                setShowSearch((prev) => !prev);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 border transition-colors ${
                showSearch
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
              title="Find / Replace (⌘F)"
            >
              <Search size={12} />
            </button>

            {/* Word Wrap Toggle */}
            <button
              onClick={() => setWordWrap((prev) => !prev)}
              className={`p-1.5 rounded-md text-xs flex items-center gap-1 border transition-colors ${
                wordWrap
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
              title={wordWrap ? "Word Wrap: Enabled" : "Word Wrap: Disabled"}
            >
              <WrapText size={12} />
            </button>

            {/* Copy All Code */}
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-md text-xs flex items-center gap-1 border border-zinc-700/50 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              title="Copy entire buffer"
            >
              {copiedFile ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>

            {/* View Mode Toggle */}
            <button
              onClick={() => {
                setShowDiffView(false);
                setViewMode(viewMode === "edit" ? "preview" : "edit");
              }}
              className={`px-2 py-1 rounded-md text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                viewMode === "preview" && !showDiffView
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                  : "bg-zinc-800/50 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              title={viewMode === "edit" ? "Switch to Syntax Highlight Mode" : "Switch to Raw Editor Mode"}
            >
              {viewMode === "edit" ? <Eye size={12} /> : <Code size={12} />}
              <span className="text-[11px] font-mono capitalize">{viewMode}</span>
            </button>

            {/* Diff View Toggle */}
            <button
              onClick={() => setShowDiffView((v) => !v)}
              className={`px-2 py-1 rounded-md text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                showDiffView
                  ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-xs"
                  : "bg-zinc-800/50 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              title="Toggle Visual Line Diff against original file"
            >
              <GitCompare size={12} className={showDiffView ? "text-indigo-400" : "text-zinc-400"} />
              <span className="text-[11px] font-mono">
                Diff {addedCount > 0 || removedCount > 0 ? `(+${addedCount}/-${removedCount})` : ""}
              </span>
            </button>

            {/* History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-2 py-1 rounded-md text-xs flex items-center gap-1.5 border border-zinc-700/50 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
              title="View Changes History & Recovery Snapshots"
            >
              <History size={12} className="text-indigo-400" />
              <span className="text-[11px] font-mono">
                History ({currentTab.history?.length || 0})
              </span>
            </button>

            {/* Auto-Save Toggle */}
            <button
              onClick={() => setAutoSave(!autoSave)}
              className={`px-2 py-1 rounded-md text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${
                autoSave
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
              title={
                autoSave
                  ? "Auto-Save is ON (Changes auto-save to disk like Gemini / Cursor)"
                  : "Auto-Save is OFF (Click to enable auto-save)"
              }
            >
              <Zap size={11} className={autoSave ? "text-emerald-400 fill-emerald-400" : "text-zinc-500"} />
              <span className="text-[10.5px] font-mono">
                {autoSave ? "Auto-Save ON" : "Auto-Save OFF"}
              </span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSaveClick}
              disabled={!currentTab.isDirty && !justSaved}
              className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1.5 border font-medium transition-all cursor-pointer ${
                justSaved
                  ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/50"
                  : currentTab.isDirty
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-sm animate-pulse"
                  : "bg-zinc-800/30 text-zinc-500 border-zinc-800/60 cursor-default"
              }`}
              title="Save to disk (⌘S)"
            >
              {justSaved ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-[11px] text-emerald-300">Saved</span>
                </>
              ) : (
                <>
                  <Save size={12} />
                  <span className="text-[11px]">Save</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Find & Replace Toolbar (⌘F) ── */}
      {showSearch && currentTab && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[12px] font-mono shrink-0">
          {/* Find */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-700/80 rounded px-2 py-0.5">
            <Search size={11} className="text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNextMatch();
                if (e.key === "Escape") setShowSearch(false);
              }}
              placeholder="Find in file..."
              className="bg-transparent text-zinc-200 outline-none w-36 text-[11.5px]"
            />
            <span className="text-[10px] text-zinc-500">
              {searchMatches.length > 0
                ? `${currentMatchIdx + 1}/${searchMatches.length}`
                : searchQuery
                ? "No matches"
                : ""}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrevMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp size={13} />
            </button>
            <button
              onClick={handleNextMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30"
              title="Next match (Enter)"
            >
              <ChevronDown size={13} />
            </button>
          </div>

          {/* Replace */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-700/80 rounded px-2 py-0.5 ml-2">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace with..."
              className="bg-transparent text-zinc-200 outline-none w-36 text-[11.5px]"
            />
          </div>

          <button
            onClick={handleReplaceCurrent}
            disabled={searchMatches.length === 0}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] disabled:opacity-30"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={searchMatches.length === 0}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] disabled:opacity-30"
          >
            All
          </button>

          <button
            onClick={() => setShowSearch(false)}
            className="ml-auto p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Close find (Esc)"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── AI Modification & Review Banner ── */}
      {currentTab && (currentTab.isDirty || currentTab.aiEditSummary) && (
        <div className="bg-indigo-950/40 border-b border-indigo-500/30 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40 text-[10.5px]">
              <Sparkles size={11} className="text-indigo-400" />
              {currentTab.aiEditAuthor || "AI"} Modification
            </span>
            <span className="text-zinc-300 truncate max-w-md font-sans text-[11.5px]">
              {currentTab.aiEditSummary || `Buffer modified (+${addedCount} / -${removedCount} lines)`}
            </span>
            {autoSave && !currentTab.isDirty && (
              <span className="flex items-center gap-1 text-[10.5px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                <Check size={11} /> Auto-Saved to Disk
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
            <button
              onClick={() => setShowDiffView((v) => !v)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                showDiffView
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-xs"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
              }`}
            >
              <GitCompare size={11} />
              {showDiffView ? "Hide Diff" : "Show Visual Diff"}
            </button>
            {onRevert && (
              <button
                onClick={() => onRevert(currentTab.path)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer"
                title="Undo AI edit and restore previous content from disk"
              >
                <RotateCcw size={11} />
                Revert (Undo)
              </button>
            )}
            {currentTab.isDirty ? (
              <button
                onClick={handleSaveClick}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Save size={11} />
                Save (⌘S)
              </button>
            ) : (
              <button
                onClick={() => dismissAIEditSummary(currentTab.path)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium border border-zinc-700 transition-colors cursor-pointer"
                title="Dismiss AI modification notice"
              >
                <Check size={11} className="text-emerald-400" />
                Done
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Breadcrumb Bar ── */}
      {currentTab && (
        <div className="h-7 bg-zinc-925/80 border-b border-zinc-800/70 flex items-center justify-between px-3 text-[11px] font-mono text-zinc-400 shrink-0">
          <div
            onClick={handleCopyPath}
            title={copiedPath ? "Copied path!" : "Click to copy relative path"}
            className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-200 transition-colors truncate max-w-lg"
          >
            <span className="text-zinc-500">📁</span>
            {displayParts.map((part, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <span className="text-zinc-600">/</span>}
                <span className={idx === displayParts.length - 1 ? "text-indigo-300 font-medium" : "text-zinc-400"}>
                  {part}
                </span>
              </span>
            ))}
            {copiedPath && <span className="text-[10px] text-emerald-400 ml-2">Copied!</span>}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700/50 font-semibold uppercase tracking-wider">
              {currentTab.language}
            </span>
            <span className="text-zinc-500">
              {(new Blob([currentTab.content]).size / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      )}

      {/* ── Main Canvas (Visual Diff OR Code Editor) ── */}
      {currentTab && (
        showDiffView ? (
          /* Visual Line-by-Line Diff Canvas */
          <div className="flex-1 overflow-auto bg-zinc-950 font-mono text-[12.5px] leading-6 custom-scrollbar select-text">
            <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <GitCompare size={14} className="text-indigo-400" />
                <span className="font-semibold text-zinc-100">Visual Line-by-Line Diff</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[10.5px] font-bold">
                  +{addedCount} additions
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/50 text-[10.5px] font-bold">
                  -{removedCount} deletions
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onRevert && (
                  <button
                    onClick={() => {
                      onRevert(currentTab.path);
                      setShowDiffView(false);
                    }}
                    className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs transition-colors cursor-pointer"
                  >
                    Revert All
                  </button>
                )}
                <button
                  onClick={handleSaveClick}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Accept & Save
                </button>
                <button
                  onClick={() => setShowDiffView(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Back to Editor
                </button>
              </div>
            </div>

            <div className="py-2">
              {diffLines.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No changes between current buffer and disk version.
                </div>
              ) : (
                diffLines.map((line, idx) => {
                  if (line.type === "added") {
                    return (
                      <div
                        key={idx}
                        className="flex items-stretch bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-200 border-l-2 border-emerald-500"
                      >
                        <span className="w-12 shrink-0 select-none text-right pr-2 text-zinc-700 font-mono text-[11px] py-0.5 bg-emerald-950/20"></span>
                        <span className="w-12 shrink-0 select-none text-right pr-2 text-emerald-400 font-mono text-[11px] py-0.5 bg-emerald-950/20">{line.newLineNum}</span>
                        <span className="w-6 shrink-0 select-none text-center text-emerald-400 font-bold py-0.5">+</span>
                        <span className="flex-1 py-0.5 whitespace-pre pr-4 overflow-x-auto">{line.text || "\u00A0"}</span>
                      </div>
                    );
                  }
                  if (line.type === "removed") {
                    return (
                      <div
                        key={idx}
                        className="flex items-stretch bg-rose-950/30 hover:bg-rose-900/40 text-rose-200 border-l-2 border-rose-500"
                      >
                        <span className="w-12 shrink-0 select-none text-right pr-2 text-rose-400 font-mono text-[11px] py-0.5 bg-rose-950/20">{line.originalLineNum}</span>
                        <span className="w-12 shrink-0 select-none text-right pr-2 text-zinc-700 font-mono text-[11px] py-0.5 bg-rose-950/20"></span>
                        <span className="w-6 shrink-0 select-none text-center text-rose-400 font-bold py-0.5">-</span>
                        <span className="flex-1 py-0.5 whitespace-pre pr-4 overflow-x-auto line-through decoration-rose-500/60 opacity-80">{line.text || "\u00A0"}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-stretch text-zinc-400 hover:bg-zinc-900/50">
                      <span className="w-12 shrink-0 select-none text-right pr-2 text-zinc-600 font-mono text-[11px] py-0.5">{line.originalLineNum}</span>
                      <span className="w-12 shrink-0 select-none text-right pr-2 text-zinc-600 font-mono text-[11px] py-0.5">{line.newLineNum}</span>
                      <span className="w-6 shrink-0 select-none text-center text-zinc-600 py-0.5"> </span>
                      <span className="flex-1 py-0.5 whitespace-pre pr-4 overflow-x-auto text-zinc-300">{line.text || "\u00A0"}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* Regular Code Editor / Syntax Preview Canvas */
          <div className="flex-1 flex overflow-hidden bg-zinc-950 font-mono text-[13px] relative min-h-0">
            {/* Synchronized Line Numbers Gutter */}
            <div
              ref={lineNumbersRef}
              className="w-14 shrink-0 overflow-hidden bg-zinc-925/60 border-r border-zinc-800/80 select-none text-right pr-3 py-2.5 text-zinc-600 text-[12px] leading-6 font-mono"
            >
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const isCurrentLine = cursorPos.line === lineNum;
                return (
                  <div
                    key={i}
                    className={`transition-colors ${
                      isCurrentLine
                        ? "text-indigo-400 font-bold bg-indigo-500/10 -mr-3 pr-3"
                        : "hover:text-zinc-400"
                    }`}
                  >
                    {lineNum}
                  </div>
                );
              })}
              <div className="h-48" />
            </div>

            {/* Code Textarea or Syntax Preview */}
            {viewMode === "edit" ? (
              <textarea
                ref={textareaRef}
                value={currentTab.content}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                onClick={(e) => updateCursorPosition(e.currentTarget)}
                onKeyUp={(e) => updateCursorPosition(e.currentTarget)}
                onSelect={(e) => updateCursorPosition(e.currentTarget)}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                className={`
                  flex-1 py-2.5 pl-4 pr-6 bg-transparent text-zinc-200 resize-none outline-none
                  font-mono text-[13px] leading-6 tab-size-2 overflow-auto caret-indigo-400
                  selection:bg-indigo-500/30
                  ${wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}
                `}
                style={{ tabSize: 2 }}
              />
            ) : (
              <div className="flex-1 overflow-auto py-2.5 pl-4 pr-6 text-zinc-200 leading-6 custom-scrollbar font-mono text-[13px]">
                {lines.map((line, i) => {
                  const lineNum = i + 1;
                  const isCurrentLine = cursorPos.line === lineNum;
                  return (
                    <div
                      key={i}
                      className={`whitespace-pre px-1 rounded-xs ${
                        isCurrentLine ? "bg-indigo-500/10" : ""
                      }`}
                    >
                      {highlightLine(line, currentTab.language)}
                    </div>
                  );
                })}
                <div className="h-48" />
              </div>
            )}
          </div>
        )
      )}

      {/* ── Editor Footer Status Bar ── */}
      {currentTab && (
        <div className="h-6 bg-zinc-900 border-t border-zinc-800/80 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-zinc-300">
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            {cursorPos.selectionLen > 0 && (
              <span className="text-indigo-400">
                ({cursorPos.selectionLen} selected)
              </span>
            )}
            <span className="text-zinc-500 hidden sm:inline">
              {lines.length} lines, {currentTab.content.length.toLocaleString()} characters
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Spaces: 2</span>
            <span className="text-zinc-400">UTF-8</span>
            <span className="text-indigo-400 font-medium capitalize">
              {currentTab.language}
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTab.isDirty ? "bg-amber-400" : saveStatus === "saving" ? "bg-blue-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              <span className="text-zinc-400 text-[10px] font-mono">
                {saveStatus === "saving"
                  ? "Saving..."
                  : currentTab.isDirty
                  ? "Modified"
                  : autoSave
                  ? "Auto-Saved"
                  : "Saved"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Changes History Modal ── */}
      {showHistoryModal && currentTab && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-925">
              <div className="flex items-center gap-2">
                <History size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold text-zinc-100">Changes History & Snapshots</h3>
                <span className="text-xs text-zinc-500 font-mono">({currentTab.name})</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {(!currentTab.history || currentTab.history.length === 0) ? (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  <History size={32} className="mx-auto text-zinc-700 mb-2 opacity-50" />
                  <div>No previous edit snapshots recorded yet for this session.</div>
                  <div className="mt-1 text-zinc-600">Whenever the AI edits this file, a recovery snapshot is automatically created.</div>
                </div>
              ) : (
                currentTab.history.slice().reverse().map((entry: FileHistoryEntry, idx: number) => (
                  <div
                    key={entry.id || idx}
                    className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {entry.author}
                        </span>
                        <span className="text-xs font-medium text-zinc-200">
                          {entry.summary || "Snapshot"}
                        </span>
                        <span className="text-[10.5px] text-zinc-500 ml-auto">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        Snapshot size: {entry.afterContent.length.toLocaleString()} characters ({entry.afterContent.split("\n").length} lines)
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onContentChange(currentTab.path, entry.beforeContent);
                          setShowHistoryModal(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-rose-600 text-zinc-300 hover:text-white text-xs border border-zinc-700/80 transition-all cursor-pointer"
                        title="Revert to state before this modification"
                      >
                        <RotateCcw size={12} />
                        Revert Before
                      </button>
                      <button
                        onClick={() => {
                          onContentChange(currentTab.path, entry.afterContent);
                          setShowHistoryModal(false);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-indigo-600 text-zinc-300 hover:text-white text-xs border border-zinc-700/80 transition-all cursor-pointer"
                        title="Apply this exact edit version"
                      >
                        <Check size={12} />
                        Restore Version
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/50 flex items-center justify-between text-xs text-zinc-400">
              <span className="truncate max-w-sm">File: <span className="font-mono text-zinc-300">{currentTab.path}</span></span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
