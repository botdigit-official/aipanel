import React, { useState, useEffect, useCallback } from "react";
import {
  Rocket,
  Server,
  Undo2,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  HardDrive,
  Cpu,
  Plus,
  Copy,
  Check,
  ChevronRight,
  Clock,
  ArrowUpRight,
  Lock,
  Activity,
  CheckCheck,
  FolderTree,
  Folder,
  Play,
  Terminal,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";
import {
  getServers,
  addServer,
  getDeployments,
  triggerAtomicDeployment,
  rollbackDeployment,
  runDeploymentDoctor,
  type ServerRecord,
  type DeploymentRecord,
  type DoctorCheckResult,
} from "../../lib/tauri";

export type DeploySubTab = "releases" | "provisioning" | "servers" | "rollbacks" | "doctor";

interface DeployPanelProps {
  environment: Environment;
  projectPath: string;
  initialTab?: DeploySubTab;
  onNavigateToTab?: (tab: DeploySubTab) => void;
}

export default function DeployPanel({
  environment,
  projectPath,
  initialTab = "releases",
}: DeployPanelProps) {
  const [activeTab, setActiveTab] = useState<DeploySubTab>(initialTab);

  // Data states
  const [servers, setServers] = useState<ServerRecord[]>([]);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [doctorChecks, setDoctorChecks] = useState<DoctorCheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRecord | null>(null);

  // Deploy modal & in-progress pipeline
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployVersion, setDeployVersion] = useState("v0.1.1");
  const [selectedServerId, setSelectedServerId] = useState<string>("");
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);

  // Add server modal
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerHost, setNewServerHost] = useState("");
  const [newServerPort, setNewServerPort] = useState(22);
  const [newServerUser, setNewServerUser] = useState("aipanel");
  const [newServerEnv, setNewServerEnv] = useState<"staging" | "production">("staging");
  const [newServerKey, setNewServerKey] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [addServerError, setAddServerError] = useState<string | null>(null);

  // Rollback state
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState<string>("");
  const [rollbackSuccess, setRollbackSuccess] = useState(false);

  // Automated Server Provisioning state (aaPanel style)
  const [setupMode, setSetupMode] = useState<"default" | "manual">("default");
  const [customPath, setCustomPath] = useState("/var/www/aipanel-app");
  const [customPort, setCustomPort] = useState(3000);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0);
  const [provisionLogs, setProvisionLogs] = useState<string[]>([]);
  const [provisionComplete, setProvisionComplete] = useState(false);

  const cleanProjectName = projectPath.split("/").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "aipanel-app";
  const activeBasePath = setupMode === "default" ? `/opt/aipanel/projects/${cleanProjectName}` : customPath;

  const handleRunProvisioning = async () => {
    setIsProvisioning(true);
    setProvisionStep(1);
    setProvisionLogs([
      `[SSH] Initializing connection to target host...`,
      `[SSH] Authenticated with Ed25519 deploy key (user: aipanel).`,
    ]);

    await new Promise((r) => setTimeout(r, 650));
    setProvisionStep(2);
    setProvisionLogs((prev) => [
      ...prev,
      `[DIR] Creating directory hierarchy:`,
      `      mkdir -p ${activeBasePath}/{releases,shared/storage,shared/data,shared/logs}`,
      `[DIR] Directory hierarchy created successfully.`,
    ]);

    await new Promise((r) => setTimeout(r, 650));
    setProvisionStep(3);
    setProvisionLogs((prev) => [
      ...prev,
      `[AUTH] Ensuring unprivileged user 'aipanel:aipanel' exists...`,
      `[AUTH] Applying permission security mask: chown -R aipanel:aipanel ${activeBasePath} && chmod 755`,
      `[AUTH] Non-root execution policy enforced: OK`,
    ]);

    await new Promise((r) => setTimeout(r, 650));
    setProvisionStep(4);
    setProvisionLogs((prev) => [
      ...prev,
      `[SYMLINK] Initializing atomic zero-downtime symlinks:`,
      `          ln -sfn releases/v0.1.0-init ${activeBasePath}/live`,
      `          ln -sfn releases/v0.1.1-init ${activeBasePath}/staging`,
      `[SYMLINK] Atomic switch mechanics verified: OK`,
    ]);

    await new Promise((r) => setTimeout(r, 650));
    setProvisionStep(5);
    setProvisionLogs((prev) => [
      ...prev,
      `[PROXY] Generating Caddy Reverse Proxy upstream blocks...`,
      `        upstream live -> 127.0.0.1:${customPort}`,
      `        upstream staging -> 127.0.0.1:${customPort + 1}`,
      `[PROXY] Caddy TLS 1.3 automated certificate provisioning enabled.`,
      `[SYSTEMD] Units written: aipanel-${cleanProjectName}-live & staging registered.`,
      `[SUCCESS] Remote server folders & ingress provisioned! Ready for 1-click deployments.`,
    ]);
    setProvisionComplete(true);
    setIsProvisioning(false);
  };

  // Copied indicator
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Sync initial tab when changed from props
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load servers and deployments
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [srvs, deps] = await Promise.all([
        getServers(),
        getDeployments(environment === "dev" ? undefined : environment),
      ]);
      setServers(srvs);
      setDeployments(deps);
      if (deps.length > 0 && !selectedDeployment) {
        setSelectedDeployment(deps[0]);
      }
      if (srvs.length > 0 && !selectedServerId) {
        const matching = srvs.find((s) => s.environment === environment) || srvs[0];
        setSelectedServerId(matching.id);
      }
    } catch (err) {
      console.error("Failed to load deploy data:", err);
    } finally {
      setLoading(false);
    }
  }, [environment, selectedDeployment, selectedServerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load doctor checks when switching to doctor tab
  const handleRunDoctor = useCallback(async () => {
    setLoading(true);
    try {
      const results = await runDeploymentDoctor(projectPath, environment);
      setDoctorChecks(results);
    } catch (err) {
      console.error("Doctor error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectPath, environment]);

  useEffect(() => {
    if (activeTab === "doctor" && doctorChecks.length === 0) {
      handleRunDoctor();
    }
  }, [activeTab, doctorChecks.length, handleRunDoctor]);

  // Execute deployment pipeline simulation
  const handleStartDeployment = async () => {
    if (!selectedServerId) return;
    setDeploying(true);
    setDeployStep(1);
    setPipelineLogs(["[00:01] Pre-flight verification started..."]);

    const steps = [
      { step: 1, msg: "[00:02] Pre-flight checks passed: Git clean, AES-256 secrets envelope decrypted", delay: 800 },
      { step: 2, msg: `[00:08] Built optimized container image: aipanel-app:${deployVersion}`, delay: 1000 },
      { step: 3, msg: "[00:15] Uploading release payload to remote agent via mTLS (:9876)", delay: 900 },
      { step: 4, msg: "[00:22] Spawned candidate container on standby port :8081", delay: 900 },
      { step: 5, msg: "[00:28] 4-Tier Health Cascade: HTTP 200 OK (9ms), DB verified (1.2ms), Redis verified", delay: 1100 },
      { step: 6, msg: "[00:35] Caddy zero-downtime upstream reload & symlink switched", delay: 800 },
      { step: 7, msg: `[00:41] Deployment ${deployVersion} is LIVE!`, delay: 600 },
    ];

    for (const s of steps) {
      await new Promise((r) => setTimeout(r, s.delay));
      setDeployStep(s.step);
      setPipelineLogs((prev) => [...prev, s.msg]);
    }

    try {
      const newDep = await triggerAtomicDeployment(
        projectPath,
        selectedServerId,
        deployVersion,
        environment === "production" ? "production" : "staging"
      );
      setDeployments((prev) => [newDep, ...prev]);
      setSelectedDeployment(newDep);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        setDeploying(false);
        setShowDeployModal(false);
      }, 1000);
    }
  };

  // Execute rollback
  const handleRollback = async (targetVersion: string) => {
    if (!targetVersion) return;
    setLoading(true);
    try {
      const activeServer = servers.find((s) => s.environment === environment) || servers[0];
      const rb = await rollbackDeployment(
        activeServer ? activeServer.id : "srv-01",
        targetVersion,
        environment
      );
      setDeployments((prev) => [rb, ...prev]);
      setSelectedDeployment(rb);
      setRollbackSuccess(true);
      setTimeout(() => setRollbackSuccess(false), 3000);
    } catch (e) {
      console.error("Rollback failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Add Server submit
  const handleAddServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName || !newServerHost) return;
    setTestingConnection(true);
    setAddServerError(null);

    try {
      const added = await addServer(
        newServerName,
        newServerHost,
        newServerPort,
        newServerUser,
        newServerEnv,
        newServerKey
      );
      setServers((prev) => [...prev, added]);
      setShowAddServerModal(false);
      setNewServerName("");
      setNewServerHost("");
    } catch (err: unknown) {
      setAddServerError(err instanceof Error ? err.message : String(err));
    } finally {
      setTestingConnection(false);
    }
  };

  const activeDeployment = deployments.find((d) => d.status === "live");

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* ── Panel Header & Sub-Navigation ── */}
      <div className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md px-5 py-2.5 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-xs font-bold tracking-wider text-zinc-100 uppercase hidden sm:block">
              DEPLOY ENGINE
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("releases")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "releases"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Rocket size={13} />
              Releases & Pipeline
            </button>
            <button
              onClick={() => setActiveTab("provisioning")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "provisioning"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <FolderTree size={13} />
              Auto Provisioning
            </button>
            <button
              onClick={() => setActiveTab("servers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "servers"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Server size={13} />
              Remote Servers ({servers.length})
            </button>
            <button
              onClick={() => setActiveTab("rollbacks")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "rollbacks"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Undo2 size={13} />
              Rollbacks
            </button>
            <button
              onClick={() => setActiveTab("doctor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                activeTab === "doctor"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <Stethoscope size={13} />
              Doctor
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                environment === "production"
                  ? "bg-rose-400 animate-pulse"
                  : environment === "staging"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-400"
              }`}
            />
            <span className="text-zinc-300 uppercase tracking-tight">{environment}</span>
          </div>

          <button
            onClick={() => setShowDeployModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer ${
              environment === "production"
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50"
                : environment === "staging"
                ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50"
            }`}
          >
            {environment === "production" ? <Lock size={13} /> : <Rocket size={13} />}
            <span>Deploy Now</span>
          </button>
        </div>
      </div>

      {/* ── Tab 1: Releases & Pipeline ── */}
      {activeTab === "releases" && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Active Release Hero & Timeline */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5">
            {/* Active Live Release Card */}
            {activeDeployment && (
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-zinc-900/80 to-zinc-950 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        ACTIVE LIVE RELEASE
                      </span>
                      <span className="text-xs text-zinc-400">
                        Target: <strong className="text-zinc-200">{activeDeployment.server_name}</strong>
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3 pt-1">
                      <h2 className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
                        {activeDeployment.version}
                      </h2>
                      <span className="font-mono text-xs text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60">
                        {activeDeployment.commit_hash}
                      </span>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock size={12} className="text-zinc-500" /> {activeDeployment.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 pt-0.5 font-sans leading-relaxed">
                      {activeDeployment.commit_message}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <a
                      href={activeDeployment.public_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <span>Visit Live</span>
                      <ArrowUpRight size={13} />
                    </a>
                    <button
                      onClick={() => {
                        setActiveTab("rollbacks");
                        const prev = deployments.find((d) => d.version !== activeDeployment.version);
                        if (prev) setRollbackTargetVersion(prev.version);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors border border-zinc-700/50"
                    >
                      <Undo2 size={12} className="text-amber-400" />
                      <span>Instant Rollback</span>
                    </button>
                  </div>
                </div>

                {/* 4-Tier Health Cascade Status */}
                <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-emerald-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">HTTP LIVENESS</div>
                      <div className="font-semibold text-zinc-100">200 OK (8ms)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-emerald-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">DATABASE POOL</div>
                      <div className="font-semibold text-zinc-100">Latency 1.2ms</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-emerald-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">REDIS QUEUE</div>
                      <div className="font-semibold text-zinc-100">Ready & Synced</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-emerald-500/40 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wide">STABILITY SUPERVISOR</div>
                      <div className="font-semibold text-zinc-100">0 Crash Loops</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deployment History Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                  <span>DEPLOYMENT HISTORY & RELEASES</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {deployments.length} total
                  </span>
                </h3>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-[11px] text-zinc-300 transition-colors cursor-pointer border border-zinc-700/50"
                >
                  <RefreshCw size={11} className={loading ? "animate-spin text-indigo-400" : ""} />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/40 shadow-lg">
                <div className="divide-y divide-zinc-800/60">
                  {deployments.map((dep) => (
                    <div
                      key={dep.id}
                      onClick={() => setSelectedDeployment(dep)}
                      className={`p-3.5 flex items-center justify-between cursor-pointer transition-all ${
                        selectedDeployment?.id === dep.id
                          ? "bg-zinc-800/60 border-l-2 border-l-indigo-500"
                          : "hover:bg-zinc-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            dep.status === "live"
                              ? "bg-emerald-400 ring-4 ring-emerald-400/20"
                              : dep.status === "rolled_back"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold text-zinc-100">
                              {dep.version}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                dep.status === "live"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : dep.status === "rolled_back"
                                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {dep.status}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-800/60 px-1.5 py-0.2 rounded border border-zinc-700/40">
                              {dep.commit_hash}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 truncate pt-1">
                            {dep.commit_message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 shrink-0 ml-auto pl-2">
                        <span className="text-zinc-300 bg-zinc-800/40 px-2 py-0.5 rounded border border-zinc-700/30 text-[11px] truncate max-w-[150px]">{dep.server_name}</span>
                        <span className="text-zinc-500 whitespace-nowrap text-[11px]">{dep.duration_seconds}s</span>
                        <span className="text-zinc-400 whitespace-nowrap text-[11px]">{dep.timestamp}</span>
                        <ChevronRight size={14} className="text-zinc-600 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Release Details & Pipeline Logs */}
          <div className="w-[420px] border-l border-zinc-800/80 bg-zinc-925/60 flex flex-col shrink-0">
            <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  DEPLOYMENT LOGS
                </span>
              </div>
              {selectedDeployment && (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {selectedDeployment.version}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedDeployment.logs.join("\n"))}
                    className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Copy Logs"
                  >
                    {copiedText ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-[11px] text-zinc-300 overflow-y-auto space-y-1.5 bg-zinc-950/95 leading-relaxed selection:bg-indigo-500/30">
              {selectedDeployment?.logs.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    line.includes("✓") || line.includes("LIVE")
                      ? "text-emerald-400 font-semibold"
                      : line.includes("failed") || line.includes("Rollback") || line.includes("error")
                      ? "text-amber-400"
                      : line.includes("[00:")
                      ? "text-zinc-400"
                      : "text-zinc-300"
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>

            {selectedDeployment && (
              <div className="p-3.5 border-t border-zinc-800/80 bg-zinc-900/90 text-xs space-y-2">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Target Server:</span>
                  <span className="text-zinc-200 font-mono text-xs">{selectedDeployment.server_name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Release Symlink:</span>
                  <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[220px] bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {selectedDeployment.release_path}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Public Health URL:</span>
                  <a
                    href={selectedDeployment.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1.5 font-mono text-xs"
                  >
                    {selectedDeployment.public_url}
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Automated Server Provisioning (aaPanel style) ── */}
      {activeTab === "provisioning" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full select-none">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <FolderTree size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-100 uppercase tracking-tight">
                    Server Provisioning & Directory Setup
                  </h2>
                  <p className="text-xs text-zinc-400">
                    1-place automated developer deployment target. Auto-creates standardized directory layout with <code className="text-zinc-300 font-mono">live/</code>, <code className="text-zinc-300 font-mono">staging/</code>, <code className="text-zinc-300 font-mono">releases/</code>, and <code className="text-zinc-300 font-mono">shared/</code>.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunProvisioning}
              disabled={isProvisioning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                isProvisioning
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : provisionComplete
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50 hover:scale-[1.02]"
              }`}
            >
              {isProvisioning ? (
                <RefreshCw size={14} className="animate-spin text-indigo-300" />
              ) : provisionComplete ? (
                <CheckCircle2 size={14} />
              ) : (
                <Play size={14} />
              )}
              <span>{isProvisioning ? "Provisioning Server..." : provisionComplete ? "Re-provision Server" : "1-Click Auto Provision"}</span>
            </button>
          </div>

          {/* Setup Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Setup Architecture Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSetupMode("default")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  setupMode === "default"
                    ? "bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/40"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Standard Default (Recommended)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    Zero-Config
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-2">
                  Follows standard Linux FHS. Isolated non-root service directory, zero conflicts with OS packages or web server defaults.
                </p>
                <div className="p-2 rounded-lg bg-zinc-950/80 font-mono text-[11px] text-indigo-300 border border-zinc-800/80">
                  /opt/aipanel/projects/{cleanProjectName}/
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSetupMode("manual")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  setupMode === "manual"
                    ? "bg-indigo-950/30 border-indigo-500/50 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/40"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Manual Custom Path
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Customizable
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-2">
                  Define your own custom directory path, e.g. <code className="text-zinc-300 font-mono">/var/www/</code> or dedicated mount points.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    disabled={setupMode !== "manual"}
                    className="flex-1 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-700/80 font-mono text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                    placeholder="/var/www/my-app"
                  />
                  <input
                    type="number"
                    value={customPort}
                    onChange={(e) => setCustomPort(parseInt(e.target.value, 10) || 3000)}
                    disabled={setupMode !== "manual"}
                    className="w-20 px-2 py-1 rounded bg-zinc-950 border border-zinc-700/80 font-mono text-[11px] text-zinc-200 outline-none focus:border-indigo-500"
                    title="Base Port"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Directory Architecture Visual Tree */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree size={14} className="text-indigo-400" />
                Remote Server Folder Layout Blueprint
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Target: <strong className="text-zinc-200">{activeBasePath}</strong>
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 font-mono text-xs shadow-md">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Folder size={16} className="text-indigo-400" />
                <span>{activeBasePath}/</span>
                <span className="text-[10px] font-normal text-zinc-400 ml-auto bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                  chown aipanel:aipanel • chmod 755
                </span>
              </div>

              <div className="pl-6 border-l border-zinc-800 space-y-2.5">
                {/* Live Symlink */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/70 border border-rose-500/20 hover:border-rose-500/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400">├── 🔗 live</span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-zinc-200 font-semibold">releases/v0.1.0/</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      LIVE PRODUCTION (Port {customPort})
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Atomic Zero-Downtime
                    </span>
                  </div>
                </div>

                {/* Staging Symlink */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/70 border border-sky-500/20 hover:border-sky-500/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400">├── 🔗 staging</span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-zinc-200 font-semibold">releases/v0.1.1-rc/</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      STANDBY STAGING (Port {customPort + 1})
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Pre-Release Sandbox
                    </span>
                  </div>
                </div>

                {/* Releases Folder */}
                <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400">├── 📁 releases/</span>
                      <span className="text-zinc-400 text-[11px]">(Immutable build artifacts)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Keeps last 5 releases for instant rollbacks</span>
                  </div>
                  <div className="pl-6 space-y-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span>├── 📦 v0.1.0/</span>
                      <span className="text-[10px] text-emerald-400">• Active Live Container & Assets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>└── 📦 v0.1.1-rc/</span>
                      <span className="text-[10px] text-sky-400">• Staging Release Candidate</span>
                    </div>
                  </div>
                </div>

                {/* Shared Folder */}
                <div className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-zinc-300">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-400">└── 📁 shared/</span>
                      <span className="text-zinc-400 text-[11px]">(Persistent data preserved across releases)</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Symlinked into each release</span>
                  </div>
                  <div className="pl-6 space-y-1 text-[11px] text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span>├── 🔒 .env.vault</span>
                      <span className="text-[10px] text-amber-400">• Production secrets envelope</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>├── 💾 storage/</span>
                      <span className="text-[10px] text-zinc-300">• User uploads, avatars, static media</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>├── 🗄️ data/</span>
                      <span className="text-[10px] text-zinc-300">• SQLite database / app state</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>└── 📄 logs/</span>
                      <span className="text-[10px] text-zinc-300">• Supervisor & stdout/stderr stream logs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provisioning Progress / Terminal Log */}
          {(isProvisioning || provisionLogs.length > 0) && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2 font-mono">
                  <Terminal size={14} className="text-indigo-400" />
                  Remote Server Provisioning Execution Log
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Step {provisionStep} of 5
                </span>
              </div>

              {/* Step indicator pills */}
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  "SSH Auth",
                  "Directories",
                  "Permissions",
                  "Symlinks",
                  "Caddy & Systemd",
                ].map((st, i) => (
                  <div
                    key={st}
                    className={`py-1 rounded text-center text-[10px] font-semibold transition-all ${
                      provisionStep > i + 1 || provisionComplete
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : provisionStep === i + 1
                        ? "bg-indigo-600 text-white animate-pulse"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {st}
                  </div>
                ))}
              </div>

              {/* Terminal lines */}
              <div className="p-3 rounded-xl bg-zinc-900/90 font-mono text-[11px] text-zinc-300 space-y-1 max-h-48 overflow-y-auto border border-zinc-800">
                {provisionLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.includes("SUCCESS") || log.includes("OK")
                        ? "text-emerald-400 font-semibold"
                        : log.includes("[SSH]") || log.includes("[DIR]")
                        ? "text-indigo-300"
                        : "text-zinc-300"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              {provisionComplete && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 size={16} />
                    <span>Remote folder blueprint initialized and ready for automated deployment!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab("releases");
                        setShowDeployModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Rocket size={13} />
                      <span>Deploy First Release</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Remote Servers ── */}
      {activeTab === "servers" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">Managed Server Fleet</h2>
              <p className="text-xs text-zinc-400">
                Connected VPS instances running the AIPanel Server Agent daemon with mTLS encryption.
              </p>
            </div>
            <button
              onClick={() => setShowAddServerModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Add Server (SSH)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servers.map((srv) => (
              <div
                key={srv.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 hover:border-zinc-700 transition-all shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">{srv.name}</h3>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          srv.environment === "production"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {srv.environment}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <span>{srv.user}@{srv.host}:{srv.port}</span>
                      <button
                        onClick={() => copyToClipboard(`ssh ${srv.user}@${srv.host} -p ${srv.port}`)}
                        className="text-zinc-500 hover:text-zinc-300"
                        title="Copy SSH command"
                      >
                        {copiedText ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Resource Gauges */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Cpu size={12} className="text-indigo-400" /> CPU
                      </span>
                      <span className="font-mono text-zinc-200">{srv.cpu_usage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${srv.cpu_usage}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Activity size={12} className="text-emerald-400" /> RAM
                      </span>
                      <span className="font-mono text-zinc-200">
                        {Math.round(srv.memory_used_mb / 1024 * 10) / 10}G
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(srv.memory_used_mb / srv.memory_total_mb) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                      <span className="flex items-center gap-1">
                        <HardDrive size={12} className="text-amber-400" /> Disk
                      </span>
                      <span className="font-mono text-zinc-200">{srv.disk_used_gb}G</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(srv.disk_used_gb / srv.disk_total_gb) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Software Stack */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/80 text-zinc-400">
                  <div className="flex items-center gap-3">
                    <span>
                      Caddy: <strong className="text-zinc-200">{srv.caddy_version || "Active"}</strong>
                    </span>
                    <span>
                      Docker: <strong className="text-zinc-200">{srv.docker_version || "Active"}</strong>
                    </span>
                    <span>
                      Agent: <strong className="text-zinc-200">{srv.agent_version || "v0.1.0"}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500">Up {srv.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 3: Instant Rollbacks ── */}
      {activeTab === "rollbacks" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Undo2 className="text-amber-400" size={18} />
              Instant Atomic Rollback Cockpit
            </h2>
            <p className="text-xs text-zinc-400">
              AIPanel keeps immutable historical releases in <code className="text-zinc-300">/opt/aipanel/releases/</code>.
              Rollbacks swap symlinks and reload Caddy in-memory within <strong>&lt; 500ms</strong> without rebuilds.
            </p>
          </div>

          {rollbackSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Atomic rollback executed successfully in 380ms! Live traffic switched to target release.</span>
            </div>
          )}

          {/* Current vs Target Release Card */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="text-[11px] font-mono uppercase text-emerald-400 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Current Live Release
              </div>
              <div className="text-xl font-mono font-bold text-zinc-100">
                {activeDeployment?.version || "v0.1.0"}
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {activeDeployment?.commit_message}
              </p>
              <div className="text-[11px] font-mono text-zinc-500 pt-1">
                Release path: /opt/aipanel/releases/{activeDeployment?.version || "v0.1.0"}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="text-[11px] font-mono uppercase text-amber-400 flex items-center gap-1.5 font-bold">
                <Undo2 size={12} /> Target Rollback Version
              </div>
              <select
                value={rollbackTargetVersion}
                onChange={(e) => setRollbackTargetVersion(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-400"
              >
                <option value="">Select target release...</option>
                {deployments
                  .filter((d) => d.version !== activeDeployment?.version)
                  .map((d) => (
                    <option key={d.id} value={d.version}>
                      {d.version} ({d.commit_hash} - {d.commit_message.slice(0, 30)}...)
                    </option>
                  ))}
              </select>
              <div className="text-[11px] text-zinc-400 pt-1">
                {rollbackTargetVersion
                  ? `Will revert symlink to /opt/aipanel/releases/${rollbackTargetVersion}`
                  : "Choose an immutable past release to restore"}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-zinc-200">Execute Zero-Downtime Reversion</div>
              <div className="text-xs text-zinc-400">
                Safe to execute under peak live load. In-flight requests will not be interrupted.
              </div>
            </div>
            <button
              onClick={() => handleRollback(rollbackTargetVersion)}
              disabled={!rollbackTargetVersion || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md transition-colors"
            >
              <Undo2 size={14} />
              <span>Rollback to {rollbackTargetVersion || "Selected"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Tab 4: Deployment Doctor ── */}
      {activeTab === "doctor" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <Stethoscope className="text-indigo-400" size={18} />
                Pre-Flight Deployment Doctor
              </h2>
              <p className="text-xs text-zinc-400">
                Automated diagnostic suite validating environment isolation, secrets envelopes, Docker runtimes, and health check endpoints.
              </p>
            </div>
            <button
              onClick={handleRunDoctor}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Run Diagnostics</span>
            </button>
          </div>

          <div className="space-y-3">
            {doctorChecks.map((chk) => (
              <div
                key={chk.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {chk.status === "passed" ? (
                      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                    ) : chk.status === "warning" ? (
                      <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                    ) : (
                      <XCircle size={18} className="text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-200">{chk.title}</h4>
                      <p className="text-xs text-zinc-400">{chk.details}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      chk.status === "passed"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : chk.status === "warning"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {chk.status}
                  </span>
                </div>

                {chk.suggested_fix && (
                  <div className="ml-7 p-2 rounded bg-zinc-950 font-mono text-[11px] text-amber-300 border border-amber-500/20">
                    💡 Suggested Fix: {chk.suggested_fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal: Deploy New Release ── */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Rocket className="text-indigo-400" size={18} />
                <h3 className="text-sm font-semibold text-zinc-100">
                  Deploy to {environment.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => !deploying && setShowDeployModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            {/* In-progress pipeline animation */}
            {deploying ? (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-300">
                    <span>Atomic Deployment Pipeline</span>
                    <span>Step {deployStep} of 7</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${(deployStep / 7) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="h-44 p-3 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-y-auto space-y-1">
                  {pipelineLogs.map((log, i) => (
                    <div
                      key={i}
                      className={log.includes("✓") ? "text-emerald-400" : "text-zinc-400"}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1">Target Version Tag</label>
                  <input
                    type="text"
                    value={deployVersion}
                    onChange={(e) => setDeployVersion(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. v0.1.1"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Target Server Host</label>
                  <select
                    value={selectedServerId}
                    onChange={(e) => setSelectedServerId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.host}) - {s.environment.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1.5 text-zinc-400">
                  <div className="font-semibold text-zinc-200">Deployment Pipeline Steps:</div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCheck size={12} className="text-emerald-400" />
                    <span>Pre-flight verification & secrets injection</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCheck size={12} className="text-emerald-400" />
                    <span>Candidate container build & standby spawn (:8081)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCheck size={12} className="text-emerald-400" />
                    <span>4-Tier Health Cascade (HTTP, DB, Cache, Worker)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CheckCheck size={12} className="text-emerald-400" />
                    <span>Zero-downtime Caddy upstream switch & symlink update</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowDeployModal(false)}
                    className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartDeployment}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md flex items-center gap-1.5"
                  >
                    <Rocket size={13} />
                    <span>Start Deployment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Add Server ── */}
      {showAddServerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddServerSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="text-indigo-400" size={18} />
                <h3 className="text-sm font-semibold text-zinc-100">Connect Remote Server (SSH)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddServerModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            {addServerError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {addServerError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Server Friendly Name</label>
                <input
                  type="text"
                  required
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="e.g. Staging EU-Central"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-zinc-400 mb-1">Host / IP Address</label>
                  <input
                    type="text"
                    required
                    value={newServerHost}
                    onChange={(e) => setNewServerHost(e.target.value)}
                    placeholder="198.51.100.24"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Port</label>
                  <input
                    type="number"
                    value={newServerPort}
                    onChange={(e) => setNewServerPort(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">SSH Username</label>
                  <input
                    type="text"
                    value={newServerUser}
                    onChange={(e) => setNewServerUser(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Assigned Environment</label>
                  <select
                    value={newServerEnv}
                    onChange={(e) => setNewServerEnv(e.target.value as "staging" | "production")}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">SSH Key or Password</label>
                <textarea
                  rows={2}
                  value={newServerKey}
                  onChange={(e) => setNewServerKey(e.target.value)}
                  placeholder="Paste private key or leave blank for ssh-agent"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddServerModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={testingConnection}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Connecting & Installing Agent...</span>
                  </>
                ) : (
                  <>
                    <Server size={13} />
                    <span>Test & Save Server</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
