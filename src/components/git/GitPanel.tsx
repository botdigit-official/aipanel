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
  Eye,
} from "lucide-react";
import {
  getGitStatus,
  gitStageFile,
  gitUnstageFile,
  gitCommit,
  getDeploymentVersions,
  createDeploymentVersion,
  getGitLog,
  getCommitDetail,
  type GitStatusResult,
  type DeploymentVersion,
  type CommitDetail,
} from "../../lib/tauri";
import GitTimeline from "./GitTimeline";
import GitDiffViewer from "./GitDiffViewer";

interface GitPanelProps {
  projectPath: string;
  onRefreshBranch?: (branch: string) => void;
}

export default function GitPanel({ projectPath, onRefreshBranch }: GitPanelProps) {
  const [gitStatus, setGitStatus] = useState<GitStatusResult | null>(null);
  const [versions, setVersions] = useState<DeploymentVersion[]>([]);
  const [commits, setCommits] = useState<CommitDetail[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<CommitDetail | null>(null);
  const [commitMessage, setCommitMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"changes" | "history" | "versions">("changes");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  const fetchHistory = useCallback(async () => {
    if (!projectPath) return;
    setIsLoadingHistory(true);
    try {
      const log = await getGitLog(projectPath, 35);
      setCommits(log);
      if (log.length > 0 && !selectedCommit) {
        setSelectedCommit(log[0]);
      }
    } catch (err) {
      console.error("Failed to fetch git history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectPath, selectedCommit]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

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
      await fetchHistory();
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

  const handleSelectVersionCommit = (commitHash: string) => {
    setActiveTab("history");
    const found = commits.find(
      (c) =>
        c.hash.toLowerCase() === commitHash.toLowerCase() ||
        c.short_hash.toLowerCase() === commitHash.toLowerCase()
    );
    if (found) {
      setSelectedCommit(found);
    } else {
      getCommitDetail(projectPath, commitHash)
        .then((detail) => setSelectedCommit(detail))
        .catch(console.error);
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
              <span className="text-xs font-semibold text-zinc-200">
                {gitStatus?.branch || "main"}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Local Git
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gitStatus && (
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mr-2">
              {gitStatus.ahead > 0 && (
                <span className="text-emerald-400">↑{gitStatus.ahead}</span>
              )}
              {gitStatus.behind > 0 && (
                <span className="text-amber-400">↓{gitStatus.behind}</span>
              )}
            </div>
          )}

          <button
            onClick={() => {
              fetchStatus();
              if (activeTab === "history") fetchHistory();
            }}
            disabled={isLoading || isLoadingHistory}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
            title="Refresh Status"
          >
            <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="h-10 border-b border-zinc-800 px-4 flex items-center gap-4 bg-zinc-900/20 text-xs shrink-0">
        <button
          onClick={() => setActiveTab("changes")}
          className={`flex items-center gap-1.5 px-3 h-full border-b-2 font-medium transition-colors ${
            activeTab === "changes"
              ? "border-purple-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <GitCommit size={13} />
          <span>Working Changes ({gitStatus?.files.length || 0})</span>
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
          <span>Timeline & Diffs ({commits.length || gitStatus?.recent_commits.length || 0})</span>
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
      <div className="flex-1 overflow-hidden flex flex-col">
        {errorMsg && (
          <div className="m-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Tab 1: Working Changes */}
        {activeTab === "changes" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl">
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

        {/* Tab 2: Visual Timeline & Diffs */}
        {activeTab === "history" && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Column: Interactive Visual Timeline */}
            <div className="w-96 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
              <GitTimeline
                commits={commits}
                versions={versions}
                selectedCommit={selectedCommit}
                onSelectCommit={(commit) => setSelectedCommit(commit)}
                isLoading={isLoadingHistory}
              />
            </div>

            {/* Right Column: Diff & AI Code Movement Inspector */}
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
              {selectedCommit ? (
                <GitDiffViewer
                  projectPath={projectPath}
                  commit={selectedCommit}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-zinc-600 text-xs">
                  <div className="max-w-sm space-y-2">
                    <Clock size={28} className="mx-auto text-zinc-700" />
                    <p className="font-medium text-zinc-400">Select a commit from the timeline</p>
                    <p className="text-zinc-600 text-[11px]">
                      View changed files, unified additions/deletions, and AI analysis of architectural code movement.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Deployment Versions */}
        {activeTab === "versions" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl">
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
                <div
                  key={ver.version}
                  className="p-3.5 flex items-center justify-between hover:bg-zinc-850/40 transition-colors"
                >
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

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSelectVersionCommit(ver.commit_hash)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                    >
                      <Eye size={12} />
                      <span>Inspect Diff</span>
                    </button>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      <span>Zero-Downtime</span>
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
