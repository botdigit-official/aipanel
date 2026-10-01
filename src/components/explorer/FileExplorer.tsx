import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  RefreshCw,
  Search,
  FilePlus,
  FolderPlus,
  X,
  Copy,
  Check,
  Trash2,
  Minimize2,
  FileCode,
  FileJson,
  FileText,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import { listDirectory, createFsEntry, deleteFsEntry, type FileEntry } from "../../lib/tauri";

// ── File Icon Helper ─────────────────────────────────────────────

interface FileMeta {
  color: string;
  icon: (props: { size?: number; className?: string }) => ReactNode;
}

function getFileMeta(name: string): FileMeta {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const baseName = name.toLowerCase();

  if (baseName === "package.json" || baseName === "tsconfig.json" || baseName.endsWith(".json")) {
    return {
      color: "text-amber-400",
      icon: (props) => <FileJson {...props} />,
    };
  }

  if (baseName === "dockerfile" || baseName.startsWith("docker-compose")) {
    return {
      color: "text-sky-400",
      icon: (props) => <Layers {...props} />,
    };
  }

  if (ext === "ts" || ext === "tsx") {
    return {
      color: "text-blue-400",
      icon: (props) => <FileCode {...props} />,
    };
  }

  if (ext === "js" || ext === "jsx") {
    return {
      color: "text-yellow-400",
      icon: (props) => <FileCode {...props} />,
    };
  }

  if (ext === "rs") {
    return {
      color: "text-orange-400",
      icon: (props) => <FileCode {...props} />,
    };
  }

  if (ext === "css" || ext === "scss") {
    return {
      color: "text-pink-400",
      icon: (props) => <FileCode {...props} />,
    };
  }

  if (ext === "md" || ext === "txt") {
    return {
      color: "text-sky-300",
      icon: (props) => <FileText {...props} />,
    };
  }

  if (ext === "toml" || ext === "yaml" || ext === "yml") {
    return {
      color: "text-purple-400",
      icon: (props) => <FileSpreadsheet {...props} />,
    };
  }

  if (ext === "sql") {
    return {
      color: "text-emerald-400",
      icon: (props) => <FileText {...props} />,
    };
  }

  if (ext === "sh" || ext === "bash" || ext === "zsh") {
    return {
      color: "text-green-400",
      icon: (props) => <FileCode {...props} />,
    };
  }

  return {
    color: "text-zinc-400",
    icon: (props) => <File {...props} />,
  };
}

// ── Tree Node ────────────────────────────────────────────────────

interface TreeNodeProps {
  entry: FileEntry;
  depth: number;
  onFileClick: (entry: FileEntry) => void;
  activeFilePath?: string;
  onDelete?: (path: string) => void;
  filterQuery?: string;
  forceCollapseKey?: number;
}

function TreeNode({
  entry,
  depth,
  onFileClick,
  activeFilePath,
  onDelete,
  filterQuery = "",
  forceCollapseKey,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Collapse all when forceCollapseKey changes
  useEffect(() => {
    if (forceCollapseKey && forceCollapseKey > 0) {
      setExpanded(false);
    }
  }, [forceCollapseKey]);

  const loadChildren = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listDirectory(entry.path);
      setChildren(items);
    } catch (err) {
      console.error("Failed to list directory:", err);
    }
    setLoading(false);
  }, [entry.path]);

  const toggleExpand = useCallback(async () => {
    if (!entry.is_dir) return;
    if (!expanded) {
      await loadChildren();
    }
    setExpanded((prev) => !prev);
  }, [entry.is_dir, expanded, loadChildren]);

  // If filter matches something, auto-expand if directory contains matches
  useEffect(() => {
    if (filterQuery.trim()) {
      if (entry.is_dir && !expanded) {
        loadChildren().then(() => setExpanded(true));
      }
    }
  }, [filterQuery, entry.is_dir, expanded, loadChildren]);

  const handleClick = () => {
    if (entry.is_dir) {
      toggleExpand();
    } else {
      onFileClick(entry);
    }
  };

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(entry.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${entry.name}?`)) {
      const ok = await deleteFsEntry(entry.path);
      if (ok && onDelete) {
        onDelete(entry.path);
      }
    }
  };

  const isActive = activeFilePath === entry.path;
  const meta = getFileMeta(entry.name);
  const IconComponent = meta.icon;

  // Filter visibility
  const matchesSelf = filterQuery
    ? entry.name.toLowerCase().includes(filterQuery.toLowerCase())
    : true;

  if (filterQuery && !matchesSelf && !entry.is_dir) {
    return null;
  }

  return (
    <div className="select-none text-[12.5px] leading-snug">
      <div
        onClick={handleClick}
        className={`
          group relative flex items-center gap-1.5 py-1 pr-2 rounded-sm cursor-pointer
          transition-colors duration-100
          ${isActive
            ? "bg-indigo-500/15 text-indigo-200 border-l-2 border-indigo-500 font-medium"
            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 border-l-2 border-transparent"
          }
        `}
        style={{ paddingLeft: `${Math.max(6, depth * 14 + 6)}px` }}
      >
        {/* Chevron for directories */}
        {entry.is_dir ? (
          <span className="w-4 h-4 shrink-0 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
            {loading ? (
              <RefreshCw size={11} className="animate-spin text-indigo-400" />
            ) : expanded ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </span>
        ) : (
          <span className="w-4 h-4 shrink-0" />
        )}

        {/* Folder / File Icon */}
        {entry.is_dir ? (
          expanded ? (
            <FolderOpen size={14} className="text-indigo-400 shrink-0" />
          ) : (
            <Folder size={14} className="text-zinc-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
          )
        ) : (
          <span className={`${meta.color} shrink-0`}>
            <IconComponent size={14} />
          </span>
        )}

        {/* File/Folder Name */}
        <span className="truncate flex-1 font-mono tracking-tight text-[12px]">
          {entry.name}
        </span>

        {/* Right side badges & actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopyPath}
            title={copied ? "Copied path!" : "Copy path"}
            className="p-1 rounded hover:bg-zinc-700/60 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1 rounded hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>

        {/* Directory children count if collapsed */}
        {entry.is_dir && entry.children_count !== undefined && !expanded && (
          <span className="text-[10px] text-zinc-600 font-mono group-hover:hidden">
            {entry.children_count}
          </span>
        )}
      </div>

      {/* Children with Tree Indentation Guide Lines */}
      {expanded && children.length > 0 && (
        <div className="relative pl-2.5 ml-3 border-l border-zinc-800/70">
          {children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              activeFilePath={activeFilePath}
              onDelete={loadChildren}
              filterQuery={filterQuery}
              forceCollapseKey={forceCollapseKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── File Explorer ────────────────────────────────────────────────

interface FileExplorerProps {
  projectPath: string | null;
  onFileClick: (entry: FileEntry) => void;
  activeFilePath?: string;
  onOpenWorkspaceSwitcher?: () => void;
}

export default function FileExplorer({
  projectPath,
  onFileClick,
  activeFilePath,
  onOpenWorkspaceSwitcher,
}: FileExplorerProps) {
  const [rootEntries, setRootEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [forceCollapseKey, setForceCollapseKey] = useState(0);

  // Inline creation states
  const [creatingType, setCreatingType] = useState<"file" | "folder" | null>(null);
  const [newEntryName, setNewEntryName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRoot = useCallback(async () => {
    if (!projectPath) return;
    setLoading(true);
    try {
      const entries = await listDirectory(projectPath);
      setRootEntries(entries);
    } catch (err) {
      console.error("Failed to load project root:", err);
    }
    setLoading(false);
  }, [projectPath]);

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  // Focus input when creation mode begins
  useEffect(() => {
    if (creatingType) {
      setNewEntryName("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [creatingType]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectPath || !newEntryName.trim() || !creatingType) return;

    const trimmed = newEntryName.trim();
    const fullPath = `${projectPath}/${trimmed}`;
    const isDir = creatingType === "folder";

    const ok = await createFsEntry(fullPath, isDir, isDir ? "" : `// ${trimmed}\n\n`);
    if (ok) {
      setCreatingType(null);
      setNewEntryName("");
      await loadRoot();
      if (!isDir) {
        onFileClick({
          name: trimmed,
          path: fullPath,
          is_dir: false,
          size: 0,
        });
      }
    }
  };

  const handleCollapseAll = () => {
    setForceCollapseKey((prev) => prev + 1);
  };

  const projectName = projectPath?.split("/").pop() || "Project";

  if (!projectPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-xs gap-3 px-4 text-center select-none">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
          <FolderOpen size={20} />
        </div>
        <div>
          <p className="font-medium text-zinc-300">No project open</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">Open a workspace to browse files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950/80 select-none border-r border-zinc-800/80">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 h-9 border-b border-zinc-800/80 shrink-0 bg-zinc-900/40">
        <div
          onClick={onOpenWorkspaceSwitcher}
          className={`flex items-center gap-1.5 min-w-0 flex-1 mr-2 rounded px-1.5 py-1 -ml-1 ${
            onOpenWorkspaceSwitcher
              ? "cursor-pointer hover:bg-zinc-800/60 text-zinc-300 hover:text-indigo-300 transition-colors"
              : "text-zinc-300"
          }`}
          title={onOpenWorkspaceSwitcher ? "Switch Workspace / Open Folder" : undefined}
        >
          <FolderOpen size={13} className="text-indigo-400 shrink-0" />
          <span className="text-[11.5px] font-semibold tracking-wider uppercase font-mono truncate">
            {projectName}
          </span>
          {onOpenWorkspaceSwitcher && (
            <ChevronDown size={11} className="text-zinc-500 shrink-0" />
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 text-zinc-400 shrink-0">
          <button
            onClick={() => setShowSearch((prev) => !prev)}
            className={`p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors ${
              showSearch ? "bg-zinc-800 text-indigo-400" : ""
            }`}
            title="Search files in project"
          >
            <Search size={13} />
          </button>
          <button
            onClick={() => setCreatingType("file")}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="New File"
          >
            <FilePlus size={13} />
          </button>
          <button
            onClick={() => setCreatingType("folder")}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="New Folder"
          >
            <FolderPlus size={13} />
          </button>
          <button
            onClick={handleCollapseAll}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Collapse All Folders"
          >
            <Minimize2 size={13} />
          </button>
          <button
            onClick={loadRoot}
            className="p-1 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Refresh Explorer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-indigo-400" : ""} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {showSearch && (
        <div className="p-2 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center gap-1.5 animate-in fade-in duration-150">
          <Search size={12} className="text-zinc-500 shrink-0 ml-1" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter files..."
            autoFocus
            className="w-full bg-transparent text-[11.5px] font-mono text-zinc-200 placeholder-zinc-500 outline-none"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* New File / Folder Input Row */}
      {creatingType && (
        <form
          onSubmit={handleCreateSubmit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border-b border-indigo-500/30"
        >
          {creatingType === "file" ? (
            <FileCode size={14} className="text-indigo-400 shrink-0" />
          ) : (
            <Folder size={14} className="text-indigo-400 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setCreatingType(null);
            }}
            placeholder={creatingType === "file" ? "filename.tsx" : "folder-name"}
            className="flex-1 bg-zinc-900 border border-indigo-500/50 rounded px-1.5 py-0.5 text-[12px] font-mono text-zinc-200 outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setCreatingType(null)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200"
          >
            <X size={12} />
          </button>
        </form>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-1 custom-scrollbar">
        {loading && rootEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-500 text-xs font-mono">
            <RefreshCw size={14} className="animate-spin text-indigo-400" />
            <span>Scanning workspace...</span>
          </div>
        ) : (
          rootEntries.map((entry) => (
            <TreeNode
              key={entry.path}
              entry={entry}
              depth={0}
              onFileClick={onFileClick}
              activeFilePath={activeFilePath}
              onDelete={loadRoot}
              filterQuery={filterQuery}
              forceCollapseKey={forceCollapseKey}
            />
          ))
        )}
      </div>

      {/* Explorer Footer Stats */}
      <div className="h-6 border-t border-zinc-800/80 px-3 flex items-center justify-between text-[10.5px] font-mono text-zinc-500 bg-zinc-900/30 shrink-0">
        <span>{rootEntries.length} root items</span>
        <span className="text-[10px] text-zinc-600">Local Disk</span>
      </div>
    </div>
  );
}
