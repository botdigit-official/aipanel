import { useState } from "react";
import {
  Rocket,
  Server,
  Globe,
  ExternalLink,
  Plus,
  Copy,
  Check,
  Activity,
  X,
} from "lucide-react";
import type { Environment } from "./TopBar";

interface DevOpsControlPanelProps {
  environment: Environment;
  projectName?: string;
  projectPath?: string | null;
  onOpenDeploy: () => void;
  onOpenServers: () => void;
  onOpenDomains: () => void;
  onOpenTunnels: () => void;
  onOpenMonitoring: () => void;
  onClose?: () => void;
}

export default function DevOpsControlPanel({
  environment,
  projectName = "aipanel",
  projectPath: _projectPath,
  onOpenDeploy,
  onOpenServers,
  onOpenDomains,
  onOpenTunnels,
  onOpenMonitoring,
  onClose,
}: DevOpsControlPanelProps) {
  const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Active tunnel mode
  const [selectedTunnelMode, setSelectedTunnelMode] = useState<"cloudflare" | "ngrok" | "website">("cloudflare");

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="w-80 h-full flex flex-col bg-zinc-950 border-l border-zinc-800/80 text-zinc-100 select-none overflow-hidden shrink-0">
      {/* ── Top Header ── */}
      <div className="h-11 px-3.5 border-b border-zinc-800/80 bg-zinc-925 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Rocket size={12} className="text-indigo-400" />
          </div>
          <span className="text-xs font-bold tracking-wider text-zinc-200 uppercase">
            Control Center
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            LIVE
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Close Panel"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 no-scrollbar">
        {/* ── 1. Deploy Card ── */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Rocket size={13} className="text-indigo-400" />
              <span className="text-xs font-bold tracking-tight text-zinc-100">Deploy</span>
            </div>
            <button
              onClick={onOpenDeploy}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white shadow-md transition-all cursor-pointer ${
                environment === "production"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-950/40"
                  : environment === "staging"
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950/40"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/40"
              }`}
            >
              <Rocket size={11} />
              <span>Deploy to {environment === "production" ? "Production" : environment === "staging" ? "Staging" : "Server"}</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {/* Development */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-200">Development</div>
                  <div className="text-[10px] font-mono text-zinc-400 truncate">http://localhost:3000</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Running
                </span>
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Open localhost:3000"
                >
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Staging */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-200">Staging</div>
                  <div className="text-[10px] font-mono text-zinc-400 truncate">https://staging.{cleanName}.botdigit.site</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Running
                </span>
                <a
                  href={`https://staging.${cleanName}.botdigit.site`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Open Staging"
                >
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Production */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-zinc-200">Production</div>
                  <div className="text-[10px] font-mono text-zinc-400 truncate">https://{cleanName}.botdigit.site</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Healthy
                </span>
                <a
                  href={`https://${cleanName}.botdigit.site`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Open Production"
                >
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Servers Card ── */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Server size={13} className="text-indigo-400" />
              <span className="text-xs font-bold tracking-tight text-zinc-100">Servers</span>
            </div>
            <button
              onClick={onOpenServers}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors cursor-pointer"
            >
              <Plus size={11} />
              <span>Add Server</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {/* VPS-1 Production */}
            <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Server size={9} />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-200">VPS-1 (Production)</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                <span>198.51.100.42</span>
                <span>•</span>
                <span>4 CPU</span>
                <span>•</span>
                <span>8 GB RAM</span>
              </div>
            </div>

            {/* VPS-2 Staging */}
            <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 hover:border-zinc-700 transition-all space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Server size={9} />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-200">VPS-2 (Staging)</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-2">
                <span>198.51.100.43</span>
                <span>•</span>
                <span>2 CPU</span>
                <span>•</span>
                <span>4 GB RAM</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Tunnels & Domains Card ── */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Globe size={13} className="text-indigo-400" />
              <span className="text-xs font-bold tracking-tight text-zinc-100">Tunnels & Domains</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenTunnels}
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Tunnels
              </button>
              <span className="text-zinc-700">•</span>
              <button
                onClick={onOpenDomains}
                className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Domains
              </button>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
            <button
              onClick={() => setSelectedTunnelMode("cloudflare")}
              className={`py-1 rounded font-medium transition-all ${
                selectedTunnelMode === "cloudflare"
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Cloudflare
            </button>
            <button
              onClick={() => setSelectedTunnelMode("ngrok")}
              className={`py-1 rounded font-medium transition-all ${
                selectedTunnelMode === "ngrok"
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              ngrok
            </button>
            <button
              onClick={() => setSelectedTunnelMode("website")}
              className={`py-1 rounded font-medium transition-all ${
                selectedTunnelMode === "website"
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Website URL
            </button>
          </div>

          {/* Selected Option Detail */}
          <div className="space-y-2 pt-0.5">
            {selectedTunnelMode === "cloudflare" && (
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold text-zinc-200">Cloudflare Tunnel</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Connected</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-zinc-900/80 p-1.5 rounded border border-zinc-800">
                  <span className="truncate">{cleanName}-tunnel.botdigit.site</span>
                  <button
                    onClick={() => copyText("cf", `https://${cleanName}-tunnel.botdigit.site`)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 ml-1"
                    title="Copy URL"
                  >
                    {copiedKey === "cf" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            )}

            {selectedTunnelMode === "ngrok" && (
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold text-zinc-200">ngrok Tunnel</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Connected</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-zinc-900/80 p-1.5 rounded border border-zinc-800">
                  <span className="truncate">{cleanName}.ngrok-free.app</span>
                  <button
                    onClick={() => copyText("ngrok", `https://${cleanName}.ngrok-free.app`)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 ml-1"
                    title="Copy URL"
                  >
                    {copiedKey === "ngrok" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            )}

            {selectedTunnelMode === "website" && (
              <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold text-zinc-200">Direct Domain / Caddy</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">SSL TLS 1.3</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-zinc-900/80 p-1.5 rounded border border-zinc-800">
                  <span className="truncate">https://{cleanName}.botdigit.site</span>
                  <button
                    onClick={() => copyText("web", `https://${cleanName}.botdigit.site`)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 ml-1"
                    title="Copy URL"
                  >
                    {copiedKey === "web" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 4. Mini Monitoring Card (with SVG sparklines) ── */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-indigo-400" />
              <span className="text-xs font-bold tracking-tight text-zinc-100">Monitoring</span>
            </div>
            <button
              onClick={onOpenMonitoring}
              className="text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* CPU */}
            <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-medium">CPU</div>
              <div className="text-sm font-bold text-zinc-100 my-0.5">18%</div>
              <svg className="w-full h-5 text-indigo-400" viewBox="0 0 50 20" fill="none">
                <path
                  d="M0 16 Q 10 14, 20 8 T 35 12 T 50 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* RAM */}
            <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-medium">RAM</div>
              <div className="text-sm font-bold text-zinc-100 my-0.5">42%</div>
              <svg className="w-full h-5 text-cyan-400" viewBox="0 0 50 20" fill="none">
                <path
                  d="M0 14 Q 12 18, 24 10 T 38 12 T 50 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Disk */}
            <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70 flex flex-col justify-between">
              <div className="text-[10px] text-zinc-400 font-medium">Disk</div>
              <div className="text-sm font-bold text-zinc-100 my-0.5">61%</div>
              <svg className="w-full h-5 text-amber-400" viewBox="0 0 50 20" fill="none">
                <path
                  d="M0 12 Q 15 10, 25 14 T 40 8 T 50 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
