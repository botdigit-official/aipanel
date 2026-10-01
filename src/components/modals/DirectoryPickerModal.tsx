import { useState, useEffect } from "react";
import {
  Folder,
  FolderPlus,
  FolderOpen,
  ChevronRight,
  ArrowUp,
  X,
  Check,
  Search,
  HardDrive,
  Home,
  Layers,
  Sparkles,
  Server,
  Loader2,
} from "lucide-react";
import { listDirectory, createFsEntry, type FileEntry } from "../../lib/tauri";

interface DirectoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPath?: string;
  onSelect: (selectedPath: string) => void;
  title?: string;
  description?: string;
}

const PRESETS = [
  {
    name: "Projects Workspace",
    path: "/Volumes/Mac2TB/Botdigit/Developer/Projects",
    desc: "Primary active development repositories",
    icon: Layers,
    color: "text-violet-400",
  },
  {
    name: "Live Production",
    path: "/Volumes/Mac2TB/Botdigit/Developer/Live",
    desc: "Production deployments & active sites",
    icon: Server,
    color: "text-emerald-400",
  },
  {
    name: "Staging Sandbox",
    path: "/Volumes/Mac2TB/Botdigit/Developer/Staging",
    desc: "Ephemeral & pre-release test builds",
    icon: Sparkles,
    color: "text-amber-400",
  },
  {
    name: "Developer Root",
    path: "/Volumes/Mac2TB/Botdigit/Developer",
    desc: "All developer codebases & services",
    icon: HardDrive,
    color: "text-sky-400",
  },
  {
    name: "User Home Directory",
    path: "/Users/botdigit",
    desc: "System user home folder",
    icon: Home,
    color: "text-zinc-400",
  },
];

export default function DirectoryPickerModal({
  isOpen,
  onClose,
  initialPath = "/Volumes/Mac2TB/Botdigit/Developer/Projects",
  onSelect,
  title = "Select Workspace Directory",
  description = "Navigate or select the folder location on your machine.",
}: DirectoryPickerModalProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [typedPath, setTypedPath] = useState(initialPath);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Create new folder inline state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Sync initialPath when opened
  useEffect(() => {
    if (isOpen) {
      const p = initialPath.trim() || "/Volumes/Mac2TB/Botdigit/Developer/Projects";
      setCurrentPath(p);
      setTypedPath(p);
      setFilterQuery("");
      setIsCreatingFolder(false);
      setNewFolderName("");
    }
  }, [isOpen, initialPath]);

  // Load directories whenever currentPath changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadFolders() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await listDirectory(currentPath);
        if (isMounted) {
          // Filter to directories only
          const dirs = list.filter((item) => item.is_dir);
          setEntries(dirs);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to read directory");
          setEntries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFolders();
    setTypedPath(currentPath);

    return () => {
      isMounted = false;
    };
  }, [currentPath, isOpen]);

  if (!isOpen) return null;

  const handleNavigateUp = () => {
    if (currentPath === "/" || !currentPath.includes("/")) return;
    const parent = currentPath.substring(0, currentPath.lastIndexOf("/")) || "/";
    setCurrentPath(parent);
  };

  const handleNavigateInto = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const handleJumpToTypedPath = () => {
    if (typedPath.trim()) {
      setCurrentPath(typedPath.trim());
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setCreateLoading(true);
    try {
      const fullNewPath = `${currentPath.replace(/\/$/, "")}/${newFolderName.trim()}`;
      await createFsEntry(fullNewPath, true);
      setIsCreatingFolder(false);
      setNewFolderName("");
      // Navigate into the newly created folder
      setCurrentPath(fullNewPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setCreateLoading(false);
    }
  };

  // Breadcrumbs calculation
  const pathParts = currentPath.split("/").filter(Boolean);

  const filteredFolders = entries.filter((e) =>
    e.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none animate-in fade-in duration-100">
      <div className="bg-[#121520] border border-white/12 rounded-2xl max-w-3xl w-full flex flex-col shadow-2xl overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-white/8 bg-[#161a29] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FolderOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">{title}</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="p-3 bg-[#0d0f17] border-b border-white/8 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 shrink-0 font-semibold pl-1">
            Presets:
          </span>
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = currentPath === p.path;
            return (
              <button
                key={p.path}
                type="button"
                onClick={() => setCurrentPath(p.path)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-violet-600/20 border border-violet-500/40 text-violet-200 font-semibold"
                    : "bg-[#141724] border border-white/8 text-zinc-300 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon size={12} className={p.color} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Path Bar & Breadcrumbs */}
        <div className="p-3 bg-[#141724] border-b border-white/8 space-y-2">
          {/* Breadcrumb line */}
          <div className="flex items-center gap-1 text-xs text-zinc-400 overflow-x-auto custom-scrollbar py-0.5">
            <button
              onClick={() => setCurrentPath("/")}
              className="hover:text-violet-400 px-1 py-0.5 rounded transition-colors cursor-pointer font-mono font-bold"
            >
              /
            </button>
            {pathParts.map((part, index) => {
              const fullStepPath = "/" + pathParts.slice(0, index + 1).join("/");
              const isLast = index === pathParts.length - 1;
              return (
                <div key={fullStepPath} className="flex items-center gap-1 shrink-0">
                  <ChevronRight size={11} className="text-zinc-600" />
                  <button
                    onClick={() => setCurrentPath(fullStepPath)}
                    className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer font-mono ${
                      isLast
                        ? "text-violet-300 font-bold bg-violet-500/10 border border-violet-500/25"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    {part}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Path manual input & Up button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNavigateUp}
              disabled={currentPath === "/" || !currentPath.includes("/")}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Go Up One Directory Level (..)"
            >
              <ArrowUp size={13} className="text-violet-400" />
              <span>Up</span>
            </button>

            <input
              type="text"
              value={typedPath}
              onChange={(e) => setTypedPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJumpToTypedPath();
              }}
              placeholder="/Volumes/Mac2TB/Botdigit/Developer/Projects"
              className="flex-1 bg-[#0d0f17] border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-violet-500"
            />

            <button
              type="button"
              onClick={handleJumpToTypedPath}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer shrink-0"
            >
              Go
            </button>

            <button
              type="button"
              onClick={() => setIsCreatingFolder(!isCreatingFolder)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Create New Folder"
            >
              <FolderPlus size={13} className="text-emerald-400" />
              <span>New Folder</span>
            </button>
          </div>

          {/* Create new folder inline input */}
          {isCreatingFolder && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 animate-in fade-in duration-100">
              <FolderPlus size={14} className="text-emerald-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setIsCreatingFolder(false);
                }}
                placeholder="Folder name (e.g. carBooking or microservices)..."
                className="flex-1 bg-[#0d0f17] border border-emerald-500/40 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={createLoading || !newFolderName.trim()}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {createLoading ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingFolder(false)}
                className="px-2 py-1 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="px-4 py-2 bg-[#121520] border-b border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search size={13} className="text-zinc-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter subfolders..."
              className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none w-full"
            />
          </div>
          <span className="text-[10.5px] font-mono text-zinc-500">
            {filteredFolders.length} subfolders
          </span>
        </div>

        {/* Directory Listing Body */}
        <div className="flex-1 overflow-y-auto p-3 min-h-[240px] max-h-[340px] custom-scrollbar bg-[#0e1019] space-y-1">
          {isLoading ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <Loader2 size={18} className="animate-spin text-violet-400" />
              <span className="text-xs">Reading directories in {currentPath}...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
              <div className="font-semibold">Unable to read directory</div>
              <div className="text-[11px] font-mono">{error}</div>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center gap-2 text-zinc-500 text-center px-4">
              <Folder size={28} className="text-zinc-600" />
              <div className="text-xs font-semibold text-zinc-300">No subfolders found</div>
              <p className="text-[11px] text-zinc-500 max-w-sm">
                This directory is clean and ready. You can select this folder directly as your workspace root or create a subfolder above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.path}
                  type="button"
                  onClick={() => handleNavigateInto(folder.path)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#141724] border border-white/6 hover:border-violet-500/40 hover:bg-[#181c2c] transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder
                      size={15}
                      className="text-violet-400 group-hover:text-violet-300 shrink-0 transition-colors"
                    />
                    <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                      {folder.name}
                    </span>
                  </div>
                  {folder.children_count !== undefined && (
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0 ml-2">
                      {folder.children_count} items
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Selection & Actions */}
        <div className="p-4 border-t border-white/8 bg-[#161a29] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10.5px] font-mono uppercase tracking-wider text-zinc-500 block font-semibold">
              Currently Selected Target:
            </span>
            <span className="text-xs font-mono text-violet-300 truncate block mt-0.5 font-medium">
              {currentPath}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSelect(currentPath);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-violet-950/50 transition-all cursor-pointer"
            >
              <Check size={14} />
              <span>Select This Folder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
