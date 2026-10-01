import { useState } from "react";
import {
  Globe,
  Plus,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Zap,
  Trash2,
  Rocket,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

// ── Types ────────────────────────────────────────────────────────

export interface DomainRecord {
  id: string;
  domain: string;
  targetEnv: Environment;
  targetPath: string;
  upstreamPort: number;
  sslStatus: "active" | "issuing" | "failed";
  dnsStatus: "propagated" | "pending" | "cloudflare_proxied";
  cnameRecord: string;
  ipRecord: string;
  createdAt: string;
  isCustom: boolean;
}

interface DomainsPanelProps {
  environment: Environment;
  projectName?: string;
  onNavigateToDeploy?: () => void;
}

export default function DomainsPanel({
  environment: _environment,
  projectName = "cafetea steam",
  onNavigateToDeploy,
}: DomainsPanelProps) {
  const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  const [domains, setDomains] = useState<DomainRecord[]>([
    {
      id: "dom-1",
      domain: `${cleanName}.botdigit.site`,
      targetEnv: "production",
      targetPath: `/opt/aipanel/projects/${cleanName}/live`,
      upstreamPort: 3000,
      sslStatus: "active",
      dnsStatus: "cloudflare_proxied",
      cnameRecord: "proxy.botdigit.site",
      ipRecord: "198.51.100.42",
      createdAt: "2 days ago",
      isCustom: false,
    },
    {
      id: "dom-2",
      domain: `staging.${cleanName}.botdigit.site`,
      targetEnv: "staging",
      targetPath: `/opt/aipanel/projects/${cleanName}/staging`,
      upstreamPort: 8081,
      sslStatus: "active",
      dnsStatus: "cloudflare_proxied",
      cnameRecord: "proxy.botdigit.site",
      ipRecord: "198.51.100.42",
      createdAt: "2 days ago",
      isCustom: false,
    },
    {
      id: "dom-3",
      domain: `${cleanName}-dev.botdigit.site`,
      targetEnv: "dev",
      targetPath: "localhost:3000 (Cloudflare Tunnel)",
      upstreamPort: 3000,
      sslStatus: "active",
      dnsStatus: "propagated",
      cnameRecord: "tunnel.cfargotunnel.com",
      ipRecord: "Local Tunnel Bridge",
      createdAt: "Just now",
      isCustom: false,
    },
  ]);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newTargetEnv, setNewTargetEnv] = useState<Environment>("production");
  const [newPort, setNewPort] = useState(3000);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    setIsVerifying(true);

    await new Promise((r) => setTimeout(r, 600));

    const record: DomainRecord = {
      id: `dom-${Date.now()}`,
      domain: newDomain.trim().toLowerCase(),
      targetEnv: newTargetEnv,
      targetPath: `/opt/aipanel/projects/${cleanName}/${newTargetEnv === "production" ? "live" : "staging"}`,
      upstreamPort: newPort,
      sslStatus: "active",
      dnsStatus: "propagated",
      cnameRecord: `${cleanName}.botdigit.site`,
      ipRecord: "198.51.100.42",
      createdAt: "Just now",
      isCustom: true,
    };

    setDomains((prev) => [record, ...prev]);
    setIsVerifying(false);
    setShowAddModal(false);
    setNewDomain("");
  };

  const handleDeleteDomain = (id: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Globe className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-100 uppercase">
                DOMAINS, HOSTNAMES & SSL ROUTING
              </h1>
              <p className="text-xs text-zinc-400">
                Connected public URLs for Dev (Cloudflare Tunnel), Staging (<code className="text-zinc-300 font-mono">staging/</code>), and Production (<code className="text-zinc-300 font-mono">live/</code>).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToDeploy && (
            <button
              onClick={onNavigateToDeploy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-750 transition-colors cursor-pointer"
            >
              <Rocket size={13} className="text-indigo-400" />
              <span>Deploy Engine</span>
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Connect Custom Domain</span>
          </button>
        </div>
      </div>

      {/* ── Automated Environment Domain Showcase ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Production Live Domain */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/20 via-zinc-900/60 to-zinc-950 border border-rose-500/30 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              PRODUCTION LIVE
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck size={12} />
              SSL TLS 1.3
            </span>
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-mono mb-1">Public Endpoint:</div>
            <a
              href={`https://${cleanName}.botdigit.site`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold font-mono text-zinc-100 hover:text-indigo-400 flex items-center gap-1.5 group transition-colors"
            >
              <span>https://{cleanName}.botdigit.site</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
            Points to: <span className="text-zinc-300 font-mono">/opt/aipanel/projects/{cleanName}/live</span>
          </div>
        </div>

        {/* Staging Domain */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 via-zinc-900/60 to-zinc-950 border border-amber-500/30 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              STAGING PREVIEW
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck size={12} />
              SSL TLS 1.3
            </span>
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-mono mb-1">Public Endpoint:</div>
            <a
              href={`https://staging.${cleanName}.botdigit.site`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold font-mono text-zinc-100 hover:text-amber-400 flex items-center gap-1.5 group transition-colors"
            >
              <span>https://staging.{cleanName}.botdigit.site</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
            Points to: <span className="text-zinc-300 font-mono">/opt/aipanel/projects/{cleanName}/staging</span>
          </div>
        </div>

        {/* Dev Local Tunnel */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-zinc-900/60 to-zinc-950 border border-emerald-500/30 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              DEV TUNNEL
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <Zap size={12} />
              Zero Trust Active
            </span>
          </div>
          <div>
            <div className="text-xs text-zinc-400 font-mono mb-1">Local Bridge Endpoint:</div>
            <a
              href={`https://${cleanName}-dev.botdigit.site`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold font-mono text-zinc-100 hover:text-emerald-400 flex items-center gap-1.5 group transition-colors"
            >
              <span>https://{cleanName}-dev.botdigit.site</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
            Points to: <span className="text-zinc-300 font-mono">Local Machine (Port :3000)</span>
          </div>
        </div>
      </div>

      {/* ── Domains Table ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <span>ALL ROUTED HOSTNAMES & DOMAINS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {domains.length} active
            </span>
          </h2>
          <span className="text-xs text-zinc-500 font-mono">Automatic Let's Encrypt + Caddy Proxy</span>
        </div>

        <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/40 shadow-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="py-3 px-4 font-medium">Domain Name</th>
                <th className="py-3 px-4 font-medium">Environment</th>
                <th className="py-3 px-4 font-medium">Target Path / Upstream</th>
                <th className="py-3 px-4 font-medium">SSL Status</th>
                <th className="py-3 px-4 font-medium">DNS Routing</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-indigo-400 shrink-0" />
                      <span className="font-bold text-zinc-100">{dom.domain}</span>
                      {dom.isCustom && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-[9px] text-indigo-300 border border-indigo-500/20">
                          Custom
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        dom.targetEnv === "production"
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          : dom.targetEnv === "staging"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {dom.targetEnv}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px] truncate max-w-xs">
                    {dom.targetPath} (:{dom.upstreamPort})
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Lock size={12} />
                      <span className="text-[11px]">TLS 1.3 Active</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {dom.dnsStatus === "cloudflare_proxied" ? "Cloudflare Edge" : "Direct DNS"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://${dom.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Open in Browser"
                      >
                        <ExternalLink size={13} />
                      </a>
                      {dom.isCustom && (
                        <button
                          onClick={() => handleDeleteDomain(dom.id)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Remove Custom Domain"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add Custom Domain ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="text-indigo-400" size={18} />
                <h3 className="text-sm font-semibold text-zinc-100">Connect Custom Domain</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Domain or Subdomain</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. app.mycompany.com or mycompany.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Target Environment</label>
                  <select
                    value={newTargetEnv}
                    onChange={(e) => setNewTargetEnv(e.target.value as Environment)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="production">Production (live/)</option>
                    <option value="staging">Staging (staging/)</option>
                    <option value="dev">Dev Tunnel (Local)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Upstream Port</label>
                  <input
                    type="number"
                    value={newPort}
                    onChange={(e) => setNewPort(parseInt(e.target.value, 10))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* DNS Instructions Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Required DNS Configuration:
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono p-2 rounded bg-zinc-900 border border-zinc-800/80">
                  <span className="text-zinc-400">Type: <strong className="text-zinc-200">CNAME</strong></span>
                  <span className="text-zinc-400">Name: <strong className="text-zinc-200">@ or sub</strong></span>
                  <span className="text-zinc-400">Target: <strong className="text-indigo-400">proxy.botdigit.site</strong></span>
                  <button
                    onClick={() => copyToClipboard("proxy.botdigit.site")}
                    className="text-zinc-400 hover:text-zinc-200 p-1"
                  >
                    {copiedText ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Let's Encrypt certificates are automatically generated via Caddy TLS within 60 seconds of DNS validation.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                disabled={isVerifying || !newDomain.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Verifying DNS...</span>
                  </>
                ) : (
                  <span>Verify & Connect Domain</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
