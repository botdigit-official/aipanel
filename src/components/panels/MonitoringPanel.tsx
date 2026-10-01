import { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  CheckCircle2,
  Clock,
  BellRing,
  Shield,
  Zap,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

interface MonitoringPanelProps {
  environment: Environment;
  projectName?: string;
}

export default function MonitoringPanel({ environment, projectName: _projectName }: MonitoringPanelProps) {
  const [refreshInterval, setRefreshInterval] = useState<number>(2000);
  const [isLive, setIsLive] = useState(true);
  const [tick, setTick] = useState(0);

  // Simulated live metrics that fluctuate slightly
  const [cpuUsage, setCpuUsage] = useState(24);
  const [ramUsage, setRamUsage] = useState(3.4);
  const [networkIn, setNetworkIn] = useState(1.8);
  const [networkOut, setNetworkOut] = useState(5.2);
  const [requestsPerSec, setRequestsPerSec] = useState(482);
  const [latencyP95, setLatencyP95] = useState(16);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setCpuUsage((prev) => Math.min(95, Math.max(8, prev + (Math.random() * 6 - 3))));
      setRamUsage((prev) => Math.min(7.8, Math.max(1.5, prev + (Math.random() * 0.2 - 0.1))));
      setNetworkIn((prev) => Math.max(0.5, prev + (Math.random() * 0.4 - 0.2)));
      setNetworkOut((prev) => Math.max(1.0, prev + (Math.random() * 0.8 - 0.4)));
      setRequestsPerSec((prev) => Math.round(Math.max(120, prev + (Math.random() * 30 - 15))));
      setLatencyP95((prev) => Math.round(Math.max(8, prev + (Math.random() * 4 - 2))));
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [isLive, refreshInterval]);

  const sparklineData = Array.from({ length: 24 }).map((_, i) => {
    const base = Math.sin((tick + i) * 0.4) * 15 + 30;
    return Math.max(10, Math.min(80, base + ((i * 7) % 13)));
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100">
              TELEMETRY & SYSTEM MONITORING
            </h1>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                environment === "production"
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : environment === "staging"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {environment}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time telemetry streaming from AIPanel Host & Server Agent daemons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
                isLive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
              <span>{isLive ? "Live Stream" : "Paused"}</span>
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-zinc-300 text-xs font-mono outline-none px-1"
            >
              <option value={1000} className="bg-zinc-900">1s interval</option>
              <option value={2000} className="bg-zinc-900">2s interval</option>
              <option value={5000} className="bg-zinc-900">5s interval</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <Zap size={13} className="text-indigo-400" /> Requests / Sec
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">+4.2%</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100">{requestsPerSec} req/s</div>
          <div className="text-[11px] text-zinc-500">Peak today: 840 req/s</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-emerald-400" /> P95 Latency
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Normal</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100">{latencyP95} ms</div>
          <div className="text-[11px] text-zinc-500">Target SLA: &lt; 50ms</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" /> Success Rate
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">99.98%</span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100">0.02% Err</div>
          <div className="text-[11px] text-zinc-500">14 HTTP 500s in 24h</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <Shield size={13} className="text-indigo-400" /> Health Cascade
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">4/4 Passing</span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">HEALTHY</div>
          <div className="text-[11px] text-zinc-500">HTTP, DB, Redis, Stability</div>
        </div>
      </div>

      {/* ── Gauges & Sparkline Chart ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* CPU Meter */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Cpu size={14} className="text-indigo-400" /> CPU Load
            </span>
            <span className="font-mono text-indigo-400 font-bold">{Math.round(cpuUsage)}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-300"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
          {/* Sparkline */}
          <div className="h-16 flex items-end gap-1 pt-2">
            {sparklineData.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t transition-all"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
            <span>24m ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* RAM Meter */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Activity size={14} className="text-emerald-400" /> Memory Allocation
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {Math.round(ramUsage * 10) / 10} / 8.0 GB
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(ramUsage / 8.0) * 100}%` }}
            />
          </div>
          <div className="space-y-1.5 pt-1 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>App Container</span>
              <span className="text-zinc-200">1.2 GB</span>
            </div>
            <div className="flex justify-between">
              <span>PostgreSQL 16</span>
              <span className="text-zinc-200">1.4 GB</span>
            </div>
            <div className="flex justify-between">
              <span>Redis & Cache</span>
              <span className="text-zinc-200">320 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Caddy Reverse Proxy</span>
              <span className="text-zinc-200">48 MB</span>
            </div>
          </div>
        </div>

        {/* Network & Disk I/O */}
        <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Network size={14} className="text-amber-400" /> Network & Disk I/O
            </span>
            <span className="font-mono text-amber-400 font-bold">Active</span>
          </div>
          <div className="space-y-2.5 pt-1 font-mono text-xs">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Network IN</span>
                <span className="text-zinc-200">{Math.round(networkIn * 10) / 10} MB/s</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Network OUT</span>
                <span className="text-zinc-200">{Math.round(networkOut * 10) / 10} MB/s</span>
              </div>
            </div>

            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <HardDrive size={11} /> Disk Storage
                </span>
                <span className="text-zinc-200">42 / 160 GB (26%)</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "26%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Automated Alert Rules & Incident Feed ── */}
      <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing size={14} className="text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              AUTOMATED ALERT RULES & SAFEGUARDS
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 size={12} /> All Guardrails Active
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="font-semibold text-zinc-200">Auto-Rollback on Error Spike</div>
            <p className="text-[11px] text-zinc-400">
              Triggers instant symlink rollback if HTTP 5xx &gt; 1.5% for 60s post-deploy.
            </p>
            <div className="text-[10px] text-emerald-400 font-mono pt-1">Threshold: Active</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="font-semibold text-zinc-200">Memory Leak Protection</div>
            <p className="text-[11px] text-zinc-400">
              Restarts worker process gracefully if RSS memory exceeds 90% threshold.
            </p>
            <div className="text-[10px] text-emerald-400 font-mono pt-1">Threshold: 7.2 GB</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
            <div className="font-semibold text-zinc-200">Database Connection Pool Saturation</div>
            <p className="text-[11px] text-zinc-400">
              Alerts operators when active pool connections exceed 85% capacity.
            </p>
            <div className="text-[10px] text-emerald-400 font-mono pt-1">Pool: 24/100 active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
