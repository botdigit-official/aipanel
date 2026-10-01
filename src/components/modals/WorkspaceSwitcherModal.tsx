import { useState, useEffect, useMemo } from "react";
import {
  FolderOpen,
  Search,
  X,
  ArrowRight,
  FolderGit2,
  Globe,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";
import { getQuickFolders, type QuickFolder } from "../../lib/tauri";

interface WorkspaceSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string | null;
  onSelectWorkspace: (path: string) => void;
  recentProjects?: { name: string; path: string; framework?: string }[];
}

export default function WorkspaceSwitcherModal({
  isOpen,
  onClose,
  currentPath,
  onSelectWorkspace,
  recentProjects = [],
}: WorkspaceSwitcherModalProps) {
  const [folders, setFolders] = useState<QuickFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [customPath, setCustomPath] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getQuickFolders()
        .then((items) => {
          setFolders(items);
        })
        .finally(() => setLoading(false));
      setSearch("");
      setCustomPath(currentPath || "/Volumes/Mac2TB/Botdigit/Developer");
    }
  }, [isOpen, currentPath]);

  // Combine quick folders and recent projects
  const allWorkspaces = useMemo(() => {
    const list: { name: string; path: string; category: string; isRecent?: boolean }[] = [];

    // Recent items
    recentProjects.forEach((r) => {
      list.push({
        name: r.name,
        path: r.path,
        category: "Recent",
        isRecent: true,
      });
    });

    // Scanned quick folders
    folders.forEach((f) => {
      if (!list.some((existing) => existing.path === f.path)) {
        list.push({
          name: f.name,
          path: f.path,
          category: f.category,
        });
      }
    });

    return list;
  }, [folders, recentProjects]);

  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    if (recentProjects.length > 0) set.add("Recent");
    folders.forEach((f) => set.add(f.category));
    return Array.from(set);
  }, [folders, recentProjects]);

  const filtered = useMemo(() => {
    return allWorkspaces.filter((w) => {
      const matchCat =
        selectedCategory === "All" ||
        (selectedCategory === "Recent" ? w.isRecent : w.category === selectedCategory);
      const matchQuery =
        search.trim() === "" ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.path.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [allWorkspaces, selectedCategory, search]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onSelectWorkspace(path);
    onClose();
  };

  const handleCustomPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPath.trim()) {
      handleSelect(customPath.trim());
    }
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === "Live") return <Globe size={13} className="text-emerald-400" />;
    if (cat === "Projects") return <FolderGit2 size={13} className="text-indigo-400" />;
    if (cat === "Recent") return <Sparkles size={13} className="text-amber-400" />;
    return <Layers size={13} className="text-purple-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0f111a] border border-[#23293d] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f2438] flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderOpen size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 font-sans">
                Switch Workspace & Folder
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                Open any project or live application in Code Studio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-[#1f2438] bg-[#11131e] space-y-3">
          {/* Search Input */}
          <div className="relative flex items-center bg-[#0a0c13] border border-[#23293d] rounded-xl px-3 py-2">
            <Search size={14} className="text-zinc-500 shrink-0 mr-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces by name or path (e.g. yaarpahari, aipanel, tenderwatch)..."
              autoFocus
              className="w-full bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-zinc-500 hover:text-zinc-300 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "bg-[#181c2b] text-zinc-400 hover:text-zinc-200 hover:bg-[#1f2438]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Workspaces List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar max-h-[380px]">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500 font-sans">
              Scanning workspace directories...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 font-sans">
              No matching folders found. You can enter a custom path below.
            </div>
          ) : (
            filtered.map((item) => {
              const isCurrent = currentPath === item.path;
              return (
                <div
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  className={`
                    group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                    ${isCurrent
                      ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-100"
                      : "bg-[#141724] border-[#22273a] hover:bg-[#191d2d] hover:border-indigo-500/40 text-zinc-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0e1019] border border-[#202538] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate font-sans text-zinc-100 group-hover:text-indigo-300 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-mono">
                          {item.category}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-sans">
                            <Check size={9} />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] font-mono text-zinc-400 truncate mt-0.5">
                        {item.path}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Custom Folder Path Direct Entry Footer */}
        <form
          onSubmit={handleCustomPathSubmit}
          className="p-4 bg-[#141724] border-t border-[#1f2438] flex items-center gap-2"
        >
          <div className="flex-1 flex items-center bg-[#0a0c13] border border-[#23293d] rounded-xl px-3 py-1.5">
            <span className="text-[11px] text-zinc-500 font-mono mr-2 shrink-0">Path:</span>
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="/Volumes/Mac2TB/Botdigit/Developer/..."
              className="w-full bg-transparent text-xs text-zinc-200 outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-sm shadow-indigo-950"
          >
            Open Folder
          </button>
        </form>
      </div>
    </div>
  );
}
