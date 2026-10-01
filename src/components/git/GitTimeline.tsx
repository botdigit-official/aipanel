import { useState, useMemo } from "react";
import {
  Search,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import {
  type CommitDetail,
  type DeploymentVersion,
} from "../../lib/tauri";

interface GitTimelineProps {
  commits: CommitDetail[];
  versions: DeploymentVersion[];
  selectedCommit: CommitDetail | null;
  onSelectCommit: (commit: CommitDetail) => void;
  isLoading?: boolean;
}

export default function GitTimeline({
  commits,
  versions,
  selectedCommit,
  onSelectCommit,
  isLoading,
}: GitTimelineProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEnv, setFilterEnv] = useState<"all" | "staging" | "production">("all");

  // Map commit hash to version tag if it's deployed
  const versionMap = useMemo(() => {
    const map = new Map<string, DeploymentVersion>();
    versions.forEach((v) => {
      // Check both exact hash and prefix (short hash)
      if (v.commit_hash) {
        map.set(v.commit_hash.toLowerCase(), v);
      }
    });
    return map;
  }, [versions]);

  const filteredCommits = useMemo(() => {
    return commits.filter((c) => {
      const matchesSearch =
        c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.short_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.author_name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterEnv === "all") return true;
      const v = versionMap.get(c.short_hash.toLowerCase()) || versionMap.get(c.hash.toLowerCase());
      return v?.target_env.toLowerCase() === filterEnv;
    });
  }, [commits, searchQuery, filterEnv, versionMap]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 font-sans">
      {/* Search & Filter Toolbar */}
      <div className="p-3 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/40 shrink-0">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search commits by message, hash, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-purple-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
          <button
            onClick={() => setFilterEnv("all")}
            className={`px-2 py-1 rounded-md transition-colors ${
              filterEnv === "all" ? "bg-zinc-800 text-zinc-100 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterEnv("staging")}
            className={`px-2 py-1 rounded-md transition-colors ${
              filterEnv === "staging" ? "bg-amber-500/20 text-amber-300 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Staging
          </button>
          <button
            onClick={() => setFilterEnv("production")}
            className={`px-2 py-1 rounded-md transition-colors ${
              filterEnv === "production" ? "bg-emerald-500/20 text-emerald-300 font-medium" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Production
          </button>
        </div>
      </div>

      {/* Commit List / Visual Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="h-48 flex items-center justify-center text-xs text-zinc-500">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading version history graph...
          </div>
        ) : filteredCommits.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-600">
            No commits matching your filter criteria.
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Continuous vertical timeline connector line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500/40 to-zinc-800" />

            {filteredCommits.map((commit, idx) => {
              const isSelected = selectedCommit?.hash === commit.hash;
              const isHead = idx === 0;
              const deployedVersion =
                versionMap.get(commit.short_hash.toLowerCase()) ||
                versionMap.get(commit.hash.toLowerCase());

              return (
                <div key={commit.hash} className="relative group mb-3 last:mb-0">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[22px] top-3 w-3.5 h-3.5 rounded-full border-2 transition-all z-10 flex items-center justify-center ${
                      isSelected
                        ? "bg-purple-500 border-purple-300 scale-125 shadow-lg shadow-purple-500/50"
                        : deployedVersion
                        ? deployedVersion.target_env === "production"
                          ? "bg-emerald-500 border-emerald-300"
                          : "bg-amber-500 border-amber-300"
                        : isHead
                        ? "bg-purple-600 border-purple-400"
                        : "bg-zinc-900 border-zinc-650 group-hover:border-purple-400"
                    }`}
                  >
                    {deployedVersion && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </div>

                  {/* Commit Card */}
                  <div
                    onClick={() => onSelectCommit(commit)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-950/20 border-purple-500/60 shadow-lg shadow-purple-950/30"
                        : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                            {commit.short_hash}
                          </span>

                          {isHead && (
                            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 border border-purple-500/30">
                              HEAD
                            </span>
                          )}

                          {deployedVersion && (
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 font-semibold ${
                                deployedVersion.target_env === "production"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              <ShieldCheck size={11} />
                              {deployedVersion.version} • {deployedVersion.target_env.toUpperCase()}
                            </span>
                          )}

                          {commit.refs && !deployedVersion && (
                            <span className="text-[10px] text-zinc-500 font-mono truncate max-w-xs">
                              {commit.refs}
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-medium text-zinc-100 group-hover:text-purple-200 transition-colors line-clamp-2">
                          {commit.message}
                        </div>
                      </div>

                      <ChevronRight
                        size={15}
                        className={`text-zinc-600 shrink-0 transition-transform ${
                          isSelected ? "translate-x-1 text-purple-400" : "group-hover:text-zinc-400"
                        }`}
                      />
                    </div>

                    {/* Metadata & Diff Stats */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1.5 border-t border-zinc-850/60">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {commit.author_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {commit.relative_date || commit.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {commit.files_changed > 0 && (
                          <span className="text-zinc-400">{commit.files_changed} files</span>
                        )}
                        {commit.insertions > 0 && (
                          <span className="text-emerald-400">+{commit.insertions}</span>
                        )}
                        {commit.deletions > 0 && (
                          <span className="text-rose-400">-{commit.deletions}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
