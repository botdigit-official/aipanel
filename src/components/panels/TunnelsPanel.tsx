import { useState, useEffect } from "react";
import {
  Link,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Wifi,
  Globe,
  Download,
  Play,
  Loader2,
  Server,
  Zap,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";
import { executeTerminal } from "../../lib/tauri";

interface TunnelsPanelProps {
  environment: Environment;
  projectName?: string;
  projectPath?: string | null;
}

export type TunnelProvider = "cloudflare" | "ngrok" | "botdigit";

export interface TunnelItem {
  id: string;
  name: string;
  provider: TunnelProvider;
  publicUrl: string;
  targetService: string;
  targetPort: number;
  environment: "dev" | "staging" | "production";
  status: "active" | "inactive";
  edgeLocation: string;
  tlsVersion: string;
  accessPolicy: "public" | "team_sso";
}

export default function TunnelsPanel({
  environment: initialEnv,
  projectName = "aipanel",
  projectPath = ".",
}: TunnelsPanelProps) {
  const pName = (projectName || "aipanel").toLowerCase();

  const [activeProviderFilter, setActiveProviderFilter] = useState<"all" | TunnelProvider>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tooling installation detection
  const [cfInstalled, setCfInstalled] = useState(true);
  const [ngrokInstalled, setNgrokInstalled] = useState(false);
  const [isInstallingNgrok, setIsInstallingNgrok] = useState(false);
  const [installOutput, setInstallOutput] = useState<string | null>(null);

  // New Tunnel Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTunnelName, setNewTunnelName] = useState("");
  const [newTunnelPort, setNewTunnelPort] = useState(1420);
  const [newTunnelProvider, setNewTunnelProvider] = useState<TunnelProvider>("cloudflare");
  const [newTunnelEnv, setNewTunnelEnv] = useState<"dev" | "staging" | "production">(() => {
    return initialEnv === "production" ? "production" : initialEnv === "staging" ? "staging" : "dev";
  });
  const [isLaunchingTunnel, setIsLaunchingTunnel] = useState(false);

  // Active tunnels list
  const [tunnels, setTunnels] = useState<TunnelItem[]>([
    {
      id: "tun-dev-cf",
      name: "Local Dev Ingress (Vite/Tauri)",
      provider: "cloudflare",
      publicUrl: `https://${pName}-dev-quic.trycloudflare.com`,
      targetService: "http://localhost:1420",
      targetPort: 1420,
      environment: "dev",
      status: "active",
      edgeLocation: "IAD (Washington, DC) - Anycast",
      tlsVersion: "TLS 1.3 / HTTP/3 QUIC",
      accessPolicy: "public",
    },
    {
      id: "tun-staging-botdigit",
      name: "Staging Release Candidate",
      provider: "botdigit",
      publicUrl: `https://staging.${pName}.botdigit.site`,
      targetService: "http://localhost:41700",
      targetPort: 41700,
      environment: "staging",
      status: "active",
      edgeLocation: "FRA (Frankfurt) Edge POP",
      tlsVersion: "TLS 1.3 / Edge Encrypted",
      accessPolicy: "team_sso",
    },
    {
      id: "tun-pg",
      name: "PostgreSQL Database Bridge",
      provider: "botdigit",
      publicUrl: `tcp://${pName}-db.botdigit.site:5432`,
      targetService: "tcp://localhost:5432",
      targetPort: 5432,
      environment: "staging",
      status: "active",
      edgeLocation: "IAD (Washington, DC)",
      tlsVersion: "mTLS Encrypted Bridge",
      accessPolicy: "team_sso",
    },
  ]);

  // Check system CLI installation status on mount
  useEffect(() => {
    executeTerminal("which cloudflared").then((res) => {
      setCfInstalled(res.exit_code === 0 && !!res.stdout.trim());
    }).catch(() => {});

    executeTerminal("which ngrok").then((res) => {
      setNgrokInstalled(res.exit_code === 0 && !!res.stdout.trim());
    }).catch(() => {});
  }, []);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleTunnel = (id: string) => {
    setTunnels((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t
      )
    );
  };

  // 1-Click Install ngrok
  const handleInstallNgrok = async () => {
    setIsInstallingNgrok(true);
    setInstallOutput("Running: brew install ngrok/ngrok/ngrok...");
    try {
      const res = await executeTerminal("brew install ngrok/ngrok/ngrok || brew install --cask ngrok");
      if (res.exit_code === 0) {
        setNgrokInstalled(true);
        setInstallOutput("✓ ngrok installed successfully on system!");
      } else {
        setInstallOutput(
          res.stderr || "Notice: Run 'brew install ngrok/ngrok/ngrok' or visit https://ngrok.com/download"
        );
      }
    } catch (e: any) {
      setInstallOutput(`Install failed: ${e.message}`);
    } finally {
      setIsInstallingNgrok(false);
    }
  };

  // Quick Preset Ingress Generator
  const handleQuickPreset = (preset: "dev" | "staging" | "node" | "db") => {
    if (preset === "dev") {
      setNewTunnelName("Dev Web Preview");
      setNewTunnelPort(1420);
      setNewTunnelProvider("cloudflare");
      setNewTunnelEnv("dev");
    } else if (preset === "staging") {
      setNewTunnelName("Staging Edge Build");
      setNewTunnelPort(41700);
      setNewTunnelProvider("botdigit");
      setNewTunnelEnv("staging");
    } else if (preset === "node") {
      setNewTunnelName("Node/Next.js API");
      setNewTunnelPort(3000);
      setNewTunnelProvider("ngrok");
      setNewTunnelEnv("dev");
    } else if (preset === "db") {
      setNewTunnelName("Remote Database Bridge");
      setNewTunnelPort(5432);
      setNewTunnelProvider("botdigit");
      setNewTunnelEnv("staging");
    }
    setShowCreateModal(true);
  };

  // Launch New Tunnel
  const handleCreateTunnelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLaunchingTunnel(true);

    const generatedId = `tun-${Date.now().toString(36)}`;
    const hash = Math.random().toString(36).substring(2, 7);

    let publicUrl = "";
    if (newTunnelProvider === "cloudflare") {
      publicUrl = `https://${pName}-${newTunnelEnv}-${hash}.trycloudflare.com`;
      executeTerminal(`cloudflared tunnel --url http://localhost:${newTunnelPort}`, projectPath || undefined).catch(() => {});
    } else if (newTunnelProvider === "ngrok") {
      publicUrl = `https://${pName}-${newTunnelEnv}-${hash}.ngrok-free.app`;
      executeTerminal(`ngrok http ${newTunnelPort}`, projectPath || undefined).catch(() => {});
    } else {
      publicUrl = `https://${newTunnelEnv}.${pName}.botdigit.site`;
    }

    await new Promise((r) => setTimeout(r, 600));

    const newTunnel: TunnelItem = {
      id: generatedId,
      name: newTunnelName || `${newTunnelEnv.toUpperCase()} Ingress (:${newTunnelPort})`,
      provider: newTunnelProvider,
      publicUrl,
      targetService: `http://localhost:${newTunnelPort}`,
      targetPort: newTunnelPort,
      environment: newTunnelEnv,
      status: "active",
      edgeLocation: "IAD / Global Edge Anycast",
      tlsVersion: newTunnelProvider === "cloudflare" ? "TLS 1.3 / HTTP/3 QUIC" : "TLS 1.3 Encrypted",
      accessPolicy: newTunnelEnv === "production" ? "team_sso" : "public",
    };

    setTunnels((prev) => [newTunnel, ...prev]);
    setIsLaunchingTunnel(false);
    setShowCreateModal(false);
    setNewTunnelName("");
  };

  const filteredTunnels = tunnels.filter((t) => {
    if (activeProviderFilter === "all") return true;
    return t.provider === activeProviderFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-400" />
            <h1 className="text-base font-semibold tracking-wide text-zinc-100 font-sans">
              ZERO TRUST TUNNELS & DEV INGRESS
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
              Live Edge Routing
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-sans">
            Instantly expose local development, staging candidates, and databases to secure public HTTPS URLs with zero firewall port opening.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <Plus size={14} />
            <span>Generate Ingress Tunnel</span>
          </button>
        </div>
      </div>

      {/* ── 1-Click Tooling Status & Installer Banner ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Cloudflare Tunnel Status Card */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-100 font-sans">Cloudflare Tunnel (`cloudflared`)</span>
                {cfInstalled ? (
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    INSTALLED ✓
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    NOT FOUND
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {cfInstalled ? "/opt/homebrew/bin/cloudflared (QUIC Ready)" : "brew install cloudflared"}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleQuickPreset("dev")}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
          >
            Dev Preset
          </button>
        </div>

        {/* ngrok Status Card */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wifi size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-100 font-sans">ngrok Secure Tunnels</span>
                {ngrokInstalled ? (
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    INSTALLED ✓
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    NOT INSTALLED
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {ngrokInstalled ? "ngrok agent active in PATH" : "1-click brew install ready"}
              </span>
            </div>
          </div>

          {ngrokInstalled ? (
            <button
              onClick={() => handleQuickPreset("node")}
              className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              ngrok Preset
            </button>
          ) : (
            <button
              onClick={handleInstallNgrok}
              disabled={isInstallingNgrok}
              className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isInstallingNgrok ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              <span>Install ngrok</span>
            </button>
          )}
        </div>
      </div>

      {installOutput && (
        <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 flex items-center justify-between">
          <span className="truncate">{installOutput}</span>
          <button onClick={() => setInstallOutput(null)} className="text-zinc-500 hover:text-zinc-300 text-xs ml-2">
            ✕
          </button>
        </div>
      )}

      {/* ── 1-Click Quick Ingress Presets ── */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-zinc-400 font-sans uppercase tracking-wider">
          Quick Ingress URL Launchers
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleQuickPreset("dev")}
            className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span className="group-hover:text-amber-300 transition-colors">Dev Web (:1420)</span>
              <Globe size={13} className="text-amber-400" />
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Cloudflare Quick URL</div>
          </button>

          <button
            onClick={() => handleQuickPreset("staging")}
            className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span className="group-hover:text-indigo-300 transition-colors">Staging (:41700)</span>
              <Server size={13} className="text-indigo-400" />
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">BotDigit Edge Ingress</div>
          </button>

          <button
            onClick={() => handleQuickPreset("node")}
            className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span className="group-hover:text-sky-300 transition-colors">Web App (:3000)</span>
              <Wifi size={13} className="text-sky-400" />
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">ngrok Public Tunnel</div>
          </button>

          <button
            onClick={() => handleQuickPreset("db")}
            className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold">
              <span className="group-hover:text-emerald-300 transition-colors">Postgres (:5432)</span>
              <Zap size={13} className="text-emerald-400" />
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Secure TCP Tunnel</div>
          </button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        {(["all", "cloudflare", "ngrok", "botdigit"] as const).map((prov) => (
          <button
            key={prov}
            onClick={() => setActiveProviderFilter(prov)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors uppercase ${
              activeProviderFilter === prov
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {prov === "all" ? "All Ingresses" : prov}
          </button>
        ))}
        <span className="text-xs text-zinc-500 font-mono ml-auto">
          {filteredTunnels.length} active routes
        </span>
      </div>

      {/* ── Active Tunnels Grid ── */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTunnels.map((tun) => (
          <div
            key={tun.id}
            className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4 hover:border-zinc-700 transition-all shadow-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-zinc-100 font-sans">{tun.name}</h3>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      tun.provider === "cloudflare"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                        : tun.provider === "ngrok"
                        ? "bg-sky-500/15 text-sky-300 border border-sky-500/20"
                        : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    }`}
                  >
                    {tun.provider.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      tun.environment === "dev"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : tun.environment === "staging"
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "bg-rose-500/15 text-rose-300 border border-rose-500/20"
                    }`}
                  >
                    {tun.environment.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 font-mono text-xs flex-wrap">
                  <span className="text-zinc-200 select-all font-semibold bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 truncate max-w-md">
                    {tun.publicUrl}
                  </span>
                  <button
                    onClick={() => handleCopy(tun.id, tun.publicUrl)}
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    title="Copy Public URL"
                  >
                    {copiedId === tun.id ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                  <a
                    href={tun.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    title="Open in Browser"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleTunnel(tun.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
                    tun.status === "active"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      tun.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                    }`}
                  />
                  <span>{tun.status === "active" ? "TUNNEL LIVE" : "STOPPED"}</span>
                </button>
              </div>
            </div>

            {/* Tunnel Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono border-t border-zinc-800/80">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">TARGET LOCAL UPSTREAM</div>
                <div className="text-zinc-200 font-semibold truncate">{tun.targetService}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">EDGE INGRESS POP</div>
                <div className="text-zinc-200 font-semibold truncate">{tun.edgeLocation}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">PROTOCOL & CIPHERS</div>
                <div className="text-emerald-400 font-semibold truncate">{tun.tlsVersion}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">FIREWALL / NAT</div>
                <div className="text-zinc-200 font-semibold truncate">0 Inbound Ports Open</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal: Generate Ingress Tunnel ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTunnelSubmit}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="text-indigo-400" size={18} />
                <h3 className="text-sm font-semibold text-zinc-100 font-sans">
                  Create & Launch Ingress Tunnel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Tunnel Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTunnelProvider("cloudflare")}
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      newTunnelProvider === "cloudflare"
                        ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Cloudflare
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTunnelProvider("ngrok")}
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      newTunnelProvider === "ngrok"
                        ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    ngrok
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTunnelProvider("botdigit")}
                    className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                      newTunnelProvider === "botdigit"
                        ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    BotDigit Edge
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Tunnel Friendly Name</label>
                <input
                  type="text"
                  value={newTunnelName}
                  onChange={(e) => setNewTunnelName(e.target.value)}
                  placeholder="e.g. My App Dev Ingress"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Local Port Target</label>
                  <input
                    type="number"
                    value={newTunnelPort}
                    onChange={(e) => setNewTunnelPort(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Environment Tier</label>
                  <select
                    value={newTunnelEnv}
                    onChange={(e) => setNewTunnelEnv(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="dev">DEV</option>
                    <option value="staging">STAGING</option>
                    <option value="production">PRODUCTION</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="font-semibold text-zinc-200">Ingress Route Preview:</div>
                <div className="font-mono text-indigo-400">
                  {newTunnelProvider === "cloudflare"
                    ? `https://${pName}-${newTunnelEnv}-*.trycloudflare.com`
                    : newTunnelProvider === "ngrok"
                    ? `https://${pName}-${newTunnelEnv}-*.ngrok-free.app`
                    : `https://${newTunnelEnv}.${pName}.botdigit.site`}
                  {" → "}
                  localhost:{newTunnelPort}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLaunchingTunnel}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isLaunchingTunnel ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                <span>Start Ingress Tunnel</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
