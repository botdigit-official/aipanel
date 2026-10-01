import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  GitCommit,
  RotateCw,
  Plus,
  Minus,
  Check,
  Tag,
  Clock,
  ShieldCheck,
  FileCode,
} from "lucide-react";
import {
  getGitStatus,
  gitStageFile,
  gitUnstageFile,
  gitCommit,
  getDeploymentVersions,
  createDeploymentVersion,
  type GitStatusResult,
  type DeploymentVersion,
} from "../../lib/tauri";

interface GitPanelProps {
  projectPath: string;
  onRefreshBranch?: (branch: string) => void;
}

export default function GitPanel({ projectPath, onRefreshBranch }: GitPanelProps) {
  const [gitStatus, setGitStatus] = useState<GitStatusResult | null>(null);
  const [versions, setVersions] = useState<DeploymentVersion[]>([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"changes" | "history" | "versions">("changes");
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New version modal state
  const [newVersionTag, setNewVersionTag] = useState("v0.1.1");
  const [targetEnv, setTargetEnv] = useState("staging");
  const [showTagModal, setShowTagModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!projectPath) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const status = await getGitStatus(projectPath);
      setGitStatus(status);
      if (onRefreshBranch) onRefreshBranch(status.branch);

      const vers = await getDeploymentVersions(projectPath);
      setVersions(vers);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  }, [projectPath, onRefreshBranch]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleStage = async (filePath: string) => {
    try {
      await gitStageFile(projectPath, filePath);
      await fetchStatus();
    } catch (err) {
      console.error("Failed to stage file:", err);
    }
  };

  const handleUnstage = async (filePath: string) => {
    try {
      await gitUnstageFile(projectPath, filePath);
      await fetchStatus();
    } catch (err) {
      console.error("Failed to unstage file:", err);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    try {
      await gitCommit(projectPath, commitMessage.trim());
      setCommitMessage("");
      await fetchStatus();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionTag.trim()) return;
    try {
      await createDeploymentVersion(projectPath, newVersionTag.trim(), targetEnv);
      setShowTagModal(false);
      await fetchStatus();
    } catch (err) {
      console.error("Failed to create version:", err);
    }
  };

  const stagedFiles = gitStatus?.files.filter((f) => f.is_staged) || [];
  const unstagedFiles = gitStatus?.files.filter((f) => !f.is_staged) || [];

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Header bar */}
      <div className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0 bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <GitBranch size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-100">Source Control</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-purple-300 border border-zinc-700">
                {gitStatus?.branch || "main"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Refresh Git Status"
        >
          <RotateCw size={13} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 px-4 border-b border-zinc-850 bg-zinc-900/30 text-xs shrink-0 h-9">
        <button
          onClick={() => setActiveTab("changes")}
          className={`flex items-center gap-1.5 px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === "changes"
              ? "border-purple-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <GitCommit size={13} />
          <span>Changes ({gitStatus?.files.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === "history"
              ? "border-purple-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Clock size={13} />
          <span>Commits ({gitStatus?.recent_commits.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`flex items-center gap-1.5 px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === "versions"
              ? "border-purple-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Tag size={13} />
          <span>Deployment Versions ({versions.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {activeTab === "changes" && (
          <div className="space-y-4 max-w-2xl">
            {/* Commit Message Box */}
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit message (e.g. feat: add payment webhook)..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-purple-500 font-mono resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {stagedFiles.length} file(s) staged for commit
                </span>
                <button
                  onClick={handleCommit}
                  disabled={!commitMessage.trim() || isCommitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-40"
                >
                  <Check size={12} />
                  <span>{isCommitting ? "Committing..." : `Commit to ${gitStatus?.branch || "main"}`}</span>
                </button>
              </div>
            </div>

            {/* Staged Files Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Staged Changes ({stagedFiles.length})</span>
              </div>
              {stagedFiles.length === 0 ? (
                <div className="p-4 rounded-xl border border-zinc-850 text-center text-xs text-zinc-600">
                  No staged files. Click [+] on files below to stage.
                </div>
              ) : (
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 divide-y divide-zinc-850">
                  {stagedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="px-3.5 py-2 flex items-center justify-between hover:bg-zinc-850/50 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode size={13} className="text-purple-400 shrink-0" />
                        <span className="text-zinc-200 truncate">{file.path}</span>
                        <span className="text-[10px] px-1 rounded bg-emerald-500/10 text-emerald-400">
                          {file.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnstage(file.path)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                        title="Unstage file"
                      >
                        <Minus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Working Changes Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Working Changes ({unstagedFiles.length})</span>
              </div>
              {unstagedFiles.length === 0 ? (
                <div className="p-4 rounded-xl border border-zinc-850 text-center text-xs text-zinc-600">
                  Working tree clean. No uncommitted modifications.
                </div>
              ) : (
                <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 divide-y divide-zinc-850">
                  {unstagedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="px-3.5 py-2 flex items-center justify-between hover:bg-zinc-850/50 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode size={13} className="text-zinc-500 shrink-0" />
                        <span className="text-zinc-300 truncate">{file.path}</span>
                        <span className="text-[10px] px-1 rounded bg-amber-500/10 text-amber-400">
                          {file.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStage(file.path)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                        title="Stage file"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-2 max-w-2xl">
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 divide-y divide-zinc-850">
              {gitStatus?.recent_commits.map((c) => (
                <div key={c.hash} className="p-3 hover:bg-zinc-850/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-zinc-100">{c.message}</span>
                    <span className="font-mono text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                      {c.hash}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                    <span>{c.author}</span>
                    <span>•</span>
                    <span>{c.relative_time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "versions" && (
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">
                  Immutable Deployment Versions
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Every version packages an immutable release tag connected to git commits.
                </p>
              </div>
              <button
                onClick={() => setShowTagModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all"
              >
                <Plus size={13} />
                <span>Create Version Tag</span>
              </button>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 divide-y divide-zinc-850">
              {versions.map((ver) => (
                <div key={ver.version} className="p-3.5 flex items-center justify-between hover:bg-zinc-850/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Tag size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-100">{ver.version}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {ver.target_env.toUpperCase()} LIVE
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono mt-0.5">
                        <span>Commit: {ver.commit_hash}</span>
                        <span>Created: {ver.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      <span>Zero-Downtime Ready</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Version Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-fade-in">
            <h3 className="font-semibold text-zinc-100 text-sm mb-3">Tag Deployment Version</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Version String</label>
                <input
                  type="text"
                  value={newVersionTag}
                  onChange={(e) => setNewVersionTag(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Target Environment</label>
                <select
                  value={targetEnv}
                  onChange={(e) => setTargetEnv(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 outline-none focus:border-indigo-500"
                >
                  <option value="staging">STAGING</option>
                  <option value="production">PRODUCTION</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-3 py-1 rounded text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVersion}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm"
              >
                Create Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
