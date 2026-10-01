import { useState } from "react";
import {
  Link,
  ExternalLink,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

interface TunnelsPanelProps {
  environment: Environment;
  projectName?: string;
}

interface TunnelItem {
  id: string;
  name: string;
  publicUrl: string;
  targetService: string;
  status: "active" | "inactive";
  edgeLocation: string;
  tlsVersion: string;
  accessPolicy: "public" | "team_sso";
}

export default function TunnelsPanel({ environment: _environment, projectName }: TunnelsPanelProps) {
  const pName = (projectName || "aipanel").toLowerCase();

  const [tunnels, setTunnels] = useState<TunnelItem[]>([
    {
      id: "tun-dev",
      name: "Dev Web Ingress",
      publicUrl: `https://${pName}-dev.botdigit.site`,
      targetService: "http://localhost:3000",
      status: "active",
      edgeLocation: "IAD (Washington, DC)",
      tlsVersion: "TLS 1.3 / HTTP/3",
      accessPolicy: "public",
    },
    {
      id: "tun-staging",
      name: "Staging Candidate",
      publicUrl: `https://${pName}-staging.botdigit.site`,
      targetService: "http://localhost:8080",
      status: "active",
      edgeLocation: "FRA (Frankfurt)",
      tlsVersion: "TLS 1.3 / HTTP/3",
      accessPolicy: "team_sso",
    },
    {
      id: "tun-pg",
      name: "Remote Postgres Tunnel",
      publicUrl: `tcp://${pName}-db.botdigit.site:5432`,
      targetService: "tcp://localhost:5432",
      status: "active",
      edgeLocation: "IAD (Washington, DC)",
      tlsVersion: "mTLS Encrypted",
      accessPolicy: "team_sso",
    },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6 max-w-5xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100">
              CLOUDFLARE ZERO TRUST TUNNELS
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase">
              Cloudflare Edge
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Secure, end-to-end encrypted reverse tunnels exposing local services to public domains without opening firewall ports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Create New Ingress Tunnel</span>
          </button>
        </div>
      </div>

      {/* ── Active Tunnels Grid ── */}
      <div className="grid grid-cols-1 gap-4">
        {tunnels.map((tun) => (
          <div
            key={tun.id}
            className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-4 hover:border-zinc-700 transition-all shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">{tun.name}</h3>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      tun.accessPolicy === "public"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                    }`}
                  >
                    {tun.accessPolicy === "public" ? "PUBLIC INTERNET" : "TEAM SSO PROTECTED"}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                  <span className="text-zinc-200 select-all font-semibold bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                    {tun.publicUrl}
                  </span>
                  <button
                    onClick={() => handleCopy(tun.id, tun.publicUrl)}
                    className="p-1 rounded text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-750 transition-colors"
                    title="Copy URL"
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
                    className="p-1 rounded text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-750 transition-colors"
                    title="Open in Browser"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
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
            <div className="grid grid-cols-4 gap-3 pt-2 text-xs font-mono border-t border-zinc-800/80">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">TARGET LOCAL UPSTREAM</div>
                <div className="text-zinc-200 font-semibold truncate">{tun.targetService}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">CLOUDFLARE EDGE POP</div>
                <div className="text-zinc-200 font-semibold truncate">{tun.edgeLocation}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">EDGE PROTOCOL & SSL</div>
                <div className="text-emerald-400 font-semibold truncate">{tun.tlsVersion}</div>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60">
                <div className="text-[10px] text-zinc-500">FIREWALL / INGRESS</div>
                <div className="text-zinc-200 font-semibold truncate">0 Inbound Ports Open</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
