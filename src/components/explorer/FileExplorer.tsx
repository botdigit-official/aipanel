import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { listDirectory, type FileEntry } from "../../lib/tauri";

// ── File Icon Helper ─────────────────────────────────────────────

function getFileIcon(name: string): { color: string } {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const iconColors: Record<string, string> = {
    ts: "text-blue-400",
    tsx: "text-blue-400",
    js: "text-yellow-400",
    jsx: "text-yellow-400",
    rs: "text-orange-400",
    py: "text-green-400",
    php: "text-purple-400",
    css: "text-pink-400",
    scss: "text-pink-400",
    html: "text-orange-300",
    json: "text-yellow-300",
    toml: "text-gray-400",
    yaml: "text-red-300",
    yml: "text-red-300",
    md: "text-blue-300",
    sql: "text-emerald-400",
    go: "text-cyan-400",
    rb: "text-red-400",
    java: "text-red-500",
    vue: "text-green-500",
    svelte: "text-orange-500",
    lock: "text-text-muted",
    env: "text-yellow-500",
    gitignore: "text-text-muted",
  };
  return { color: iconColors[ext] || "text-text-muted" };
}

// ── Tree Node ────────────────────────────────────────────────────

interface TreeNodeProps {
  entry: FileEntry;
  depth: number;
  onFileClick: (entry: FileEntry) => void;
  activeFilePath?: string;
}

function TreeNode({ entry, depth, onFileClick, activeFilePath }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = useCallback(async () => {
    if (!entry.is_dir) return;

    if (!expanded) {
      setLoading(true);
      try {
        const items = await listDirectory(entry.path);
        setChildren(items);
      } catch (err) {
        console.error("Failed to list directory:", err);
      }
      setLoading(false);
    }
    setExpanded(!expanded);
  }, [entry, expanded]);

  const handleClick = () => {
    if (entry.is_dir) {
      toggleExpand();
    } else {
      onFileClick(entry);
    }
  };

  const isActive = activeFilePath === entry.path;
  const { color: iconColor } = getFileIcon(entry.name);

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${depth * 10}ms` }}>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-1 py-[3px] pr-2 text-[12.5px]
          transition-colors duration-75 rounded-sm
          ${isActive
            ? "bg-accent-muted text-accent-hover"
            : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
          }
        `}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {/* Chevron for directories */}
        {entry.is_dir ? (
          <span className="w-3.5 shrink-0 flex items-center justify-center">
            {loading ? (
              <RefreshCw size={10} className="animate-spin text-text-muted" />
            ) : expanded ? (
              <ChevronDown size={12} className="text-text-muted" />
            ) : (
              <ChevronRight size={12} className="text-text-muted" />
            )}
          </span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Icon */}
        {entry.is_dir ? (
          expanded ? (
            <FolderOpen size={14} className="text-accent shrink-0" />
          ) : (
            <Folder size={14} className="text-accent/70 shrink-0" />
          )
        ) : (
          <File size={13} className={`${iconColor} shrink-0`} />
        )}

        {/* Name */}
        <span className="truncate font-medium">{entry.name}</span>

        {/* Dir count */}
        {entry.is_dir && entry.children_count !== undefined && !expanded && (
          <span className="ml-auto text-[10px] text-text-muted font-mono">
            {entry.children_count}
          </span>
        )}
      </button>

      {/* Children */}
      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              activeFilePath={activeFilePath}
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
}

export default function FileExplorer({
  projectPath,
  onFileClick,
  activeFilePath,
}: FileExplorerProps) {
  const [rootEntries, setRootEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);

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

  if (!projectPath) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted text-xs gap-2 px-4 text-center">
        <FolderOpen size={28} className="text-text-muted/30" />
        <p>No project open</p>
        <p className="text-[10px] text-text-muted/60">
          Open a folder to start working
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-8 border-b border-border-default shrink-0">
        <span className="text-[10px] font-semibold text-text-muted tracking-widest uppercase">
          Explorer
        </span>
        <button
          onClick={loadRoot}
          className="p-0.5 rounded hover:bg-bg-hover text-text-muted hover:text-text-primary transition-colors"
          title="Refresh"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {loading && rootEntries.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-text-muted text-xs">
            Loading...
          </div>
        ) : (
          rootEntries.map((entry) => (
            <TreeNode
              key={entry.path}
              entry={entry}
              depth={0}
              onFileClick={onFileClick}
              activeFilePath={activeFilePath}
            />
          ))
        )}
      </div>
    </div>
  );
}
