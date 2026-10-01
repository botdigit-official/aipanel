import { useState } from "react";
import {
  Server,
  Activity,
  HardDrive,
  Cpu,
  Globe,
  Lock,
  Archive,
  Play,
  Square,
  Plus,
  Terminal,
  ExternalLink,
  Container,
  Layers,
  Database,
  TrendingUp,
  Search,
  Monitor,
} from "lucide-react";
import type { ServerApplication } from "../../lib/types";

interface ServerDashboardProps {
  onOpenAppDeploy?: () => void;
  onOpenTerminal?: () => void;
  onOpenDatabase?: () => void;
  onOpenDomains?: () => void;
  onOpenBackups?: () => void;
  onSwitchToDesktop?: () => void;
}

export default function ServerDashboard({
  onOpenAppDeploy,
  onOpenTerminal,
  onOpenDatabase,
  onOpenDomains,
  onOpenBackups,
  onSwitchToDesktop,
}: ServerDashboardProps) {
  const [searchFilter, setSearchFilter] = useState("");

  // Server Host Telemetry State
  const [telemetry] = useState({
    hostname: "vps-lon-01.aipanel.cloud",
    ip: "146.190.45.182",
    os: "Ubuntu 24.04 LTS (x86_64)",
    uptime: "28 days, 14 hours",
    loadAvg: "0.42, 0.38, 0.31",
    cpuUsage: 24.8,
    cpuCores: 8,
    ramUsedGb: 3.4,
    ramTotalGb: 8.0,
    diskUsedGb: 38.2,
    diskTotalGb: 120.0,
    networkInMb: 142.8,
    networkOutMb: 498.2,
  });

  // Applications deployed on this VPS
  const [apps, setApps] = useState<ServerApplication[]>([
    {
      id: "app-1",
      name: "Marketplace Core",
      status: "running",
      environment: "production",
      domain: "marketplace.example.com",
      port: 3000,
      version: "v1.8.4",
      cpuPercent: 8.2,
      ramMb: 420,
      lastDeployment: "2 hours ago",
      framework: "Next.js 15 • Node.js runtime",
      containers: ["marketplace_web", "marketplace_cron"],
    },
    {
      id: "app-2",
      name: "Billing API Service",
      status: "running",
      environment: "production",
      domain: "api.billing.example.com",
      port: 8080,
      version: "v2.1.0",
      cpuPercent: 12.4,
      ramMb: 610,
      lastDeployment: "Yesterday at 18:30",
      framework: "Rust • Actix-Web 4",
      containers: ["billing_api", "billing_worker"],
    },
    {
      id: "app-3",
      name: "Staging Shop Preview",
      status: "running",
      environment: "staging",
      domain: "staging-shop.example.com",
      port: 3001,
      version: "v1.9.0-rc2",
      cpuPercent: 3.1,
      ramMb: 290,
      lastDeployment: "35 mins ago",
      framework: "Laravel 11 • PHP 8.3",
      containers: ["staging_php_fpm", "staging_nginx"],
    },
    {
      id: "app-4",
      name: "Analytics Worker Queue",
      status: "running",
      environment: "production",
      domain: "internal-only",
      port: 9092,
      version: "v1.0.8",
      cpuPercent: 1.1,
      ramMb: 180,
      lastDeployment: "3 days ago",
      framework: "Python 3.12 • Celery / Redis",
      containers: ["celery_beat", "celery_worker"],
    },
  ]);

  const toggleAppStatus = (appId: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId
          ? { ...app, status: app.status === "running" ? "stopped" : "running" }
          : app
      )
    );
  };

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.framework.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090a0f] text-slate-100 overflow-y-auto selection:bg-indigo-500/30">
      {/* ── Top Header & Server Identifier ── */}
      <header className="border-b border-slate-800/80 bg-[#0d0f18]/90 backdrop-blur-xl px-8 py-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10 shrink-0">
              <Server size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  AIPanel VPS Control Panel
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Agent Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                <span className="font-mono text-slate-200 bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700/60">
                  {telemetry.hostname}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300">{telemetry.ip}</span>
                <span>•</span>
                <span>{telemetry.os}</span>
                <span>•</span>
                <span>Uptime: <strong className="text-slate-200">{telemetry.uptime}</strong></span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {onOpenAppDeploy && (
              <button
                onClick={onOpenAppDeploy}
                className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-950/60 transition-all cursor-pointer hover:shadow-sky-500/20 active:scale-95"
              >
                <Plus size={16} />
                <span>Deploy Application</span>
              </button>
            )}
            {onOpenTerminal && (
              <button
                onClick={onOpenTerminal}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Terminal size={15} />
                <span>Server SSH</span>
              </button>
            )}
            {onSwitchToDesktop && (
              <button
                onClick={onSwitchToDesktop}
                className="px-4 py-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs font-semibold border border-indigo-500/40 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                title="Switch back to local Desktop Development IDE"
              >
                <Monitor size={15} />
                <span>Switch to Desktop IDE</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="max-w-7xl mx-auto w-full p-8 space-y-8">
        {/* Hardware Telemetry 6-Card Grid */}
        <section aria-labelledby="telemetry-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="telemetry-heading" className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Host Resource Telemetry
            </h2>
            <span className="text-xs text-slate-400 font-medium">Realtime refresh via Go Agent</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. CPU Card */}
            <div className="p-5 rounded-2xl bg-[#111420] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Cpu size={16} className="text-sky-400" /> CPU Load
                </span>
                <span className="text-xs font-bold text-sky-400 font-mono">{telemetry.cpuCores} Cores</span>
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">
                  {telemetry.cpuUsage}%
                </span>
                <div className="h-2 bg-slate-800/90 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${telemetry.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">Load: {telemetry.loadAvg}</span>
            </div>

            {/* 2. RAM Card */}
            <div className="p-5 rounded-2xl bg-[#111420] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" /> Memory
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">DDR5</span>
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">
                  {((telemetry.ramUsedGb / telemetry.ramTotalGb) * 100).toFixed(0)}%
                </span>
                <div className="h-2 bg-slate-800/90 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${(telemetry.ramUsedGb / telemetry.ramTotalGb) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                {telemetry.ramUsedGb} GB / {telemetry.ramTotalGb} GB Used
              </span>
            </div>

            {/* 3. Disk Card */}
            <div className="p-5 rounded-2xl bg-[#111420] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <HardDrive size={16} className="text-amber-400" /> NVMe Storage
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">PCIe 4.0</span>
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">
                  {((telemetry.diskUsedGb / telemetry.diskTotalGb) * 100).toFixed(0)}%
                </span>
                <div className="h-2 bg-slate-800/90 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${(telemetry.diskUsedGb / telemetry.diskTotalGb) * 100}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                {telemetry.diskUsedGb} GB / {telemetry.diskTotalGb} GB
              </span>
            </div>

            {/* 4. Network Card */}
            <div className="p-5 rounded-2xl bg-[#111420] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-400" /> Network
                </span>
                <span className="text-xs font-bold text-emerald-400">10 Gbps</span>
              </div>
              <div className="my-2 space-y-1 font-mono">
                <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-xs">Inbound</span>
                  <span>↓ {telemetry.networkInMb} MB/s</span>
                </div>
                <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-xs">Outbound</span>
                  <span>↑ {telemetry.networkOutMb} MB/s</span>
                </div>
              </div>
              <span className="text-xs text-emerald-400">● Latency: 12ms</span>
            </div>

            {/* 5. SSL Health Card */}
            <div
              onClick={onOpenDomains}
              className="p-5 rounded-2xl bg-[#111420] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-emerald-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" /> SSL / TLS
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                  Valid
                </span>
              </div>
              <div className="my-3">
                <span className="text-3xl font-bold font-mono text-white tracking-tight">
                  3 / 3
                </span>
                <span className="text-xs text-slate-400 block mt-1">Automated Let's Encrypt</span>
              </div>
              <span className="text-xs text-indigo-400 group-hover:underline">Manage Certificates →</span>
            </div>

            {/* 6. Backups Card */}
            <div
              onClick={onOpenBackups}
              className="p-5 rounded-2xl bg-[#111420] border border-slate-800/80 shadow-md flex flex-col justify-between hover:border-sky-500/50 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Archive size={16} className="text-sky-400" /> Backups
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold">
                  Active
                </span>
              </div>
              <div className="my-3">
                <span className="text-lg font-bold text-white tracking-tight">
                  Cloudflare R2
                </span>
                <span className="text-xs text-slate-400 block mt-1">Daily • AES-256</span>
              </div>
              <span className="text-xs text-indigo-400 group-hover:underline">Backup History →</span>
            </div>
          </div>
        </section>

        {/* ── Hosted Applications Fleet Table ── */}
        <section className="bg-[#111420] rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Layers size={18} />
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Hosted Applications Fleet
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {apps.length} deployed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Monitored and orchestrated by AIPanel Agent with automated rollback, Caddy TLS routing, and health verification.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter applications or domains..."
                className="w-full pl-10 pr-4 py-2 bg-[#090a0f] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#090a0f]/80 text-slate-400 uppercase text-xs font-semibold tracking-wider border-b border-slate-800/80">
                <tr>
                  <th className="py-4 px-6">Application</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Environment</th>
                  <th className="py-4 px-6">Domain & Port</th>
                  <th className="py-4 px-6">Version</th>
                  <th className="py-4 px-6">Resource Usage</th>
                  <th className="py-4 px-6">Last Deployed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 text-sm">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-850/40 transition-colors">
                    {/* App Name & Framework */}
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            app.status === "running" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                          }`}
                        ></div>
                        <div>
                          <div className="text-sm font-bold text-white">{app.name}</div>
                          <span className="text-xs text-slate-400 font-normal">{app.framework}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                          app.status === "running"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            app.status === "running" ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        ></span>
                        {app.status}
                      </span>
                    </td>

                    {/* Environment */}
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded border ${
                          app.environment === "production"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-sky-500/20 text-sky-300 border-sky-500/40"
                        }`}
                      >
                        {app.environment}
                      </span>
                    </td>

                    {/* Domain & Port */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-slate-400" />
                        <span className="text-slate-200 font-semibold hover:text-sky-400 cursor-pointer">
                          {app.domain}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-normal">Port {app.port}</span>
                    </td>

                    {/* Version */}
                    <td className="py-4 px-6 font-mono">
                      <span className="px-2.5 py-1 bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded text-xs font-semibold">
                        {app.version}
                      </span>
                    </td>

                    {/* CPU & RAM */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <div className="font-bold text-slate-200">{app.cpuPercent}% CPU</div>
                      <span className="text-slate-400 font-normal">{app.ramMb} MB RAM</span>
                    </td>

                    {/* Last Deployed */}
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                      {app.lastDeployment}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleAppStatus(app.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title={app.status === "running" ? "Stop application" : "Start application"}
                        >
                          {app.status === "running" ? (
                            <Square size={16} className="text-amber-400" />
                          ) : (
                            <Play size={16} className="text-emerald-400" />
                          )}
                        </button>
                        <a
                          href={`https://${app.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Open domain in browser"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Infrastructure & Daemon Stacks Row ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Caddy Card */}
          <div className="p-6 rounded-2xl bg-[#111420] border border-slate-800/80 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Caddy Reverse Proxy</h3>
                  <span className="text-xs text-slate-400">v2.8.4 Stable</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Serving HTTP/3 & TLS 1.3 with automatic zero-downtime config reloads and instant certificate rotation.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">4 reverse proxy routes</span>
              <span className="text-emerald-400 font-mono">0 errors</span>
            </div>
          </div>

          {/* Docker Daemon Card */}
          <div className="p-6 rounded-2xl bg-[#111420] border border-slate-800/80 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Container size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Docker Daemon</h3>
                  <span className="text-xs text-slate-400">v27.3.1 Engine</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Healthy
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              8 containers active, 12 volumes mounted. Communicating with AIPanel Agent via local Unix socket.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Bridge networks: 3</span>
              <span className="text-slate-300 font-mono">0 zombies</span>
            </div>
          </div>

          {/* Database Orchestrator Card */}
          <div
            onClick={onOpenDatabase}
            className="p-6 rounded-2xl bg-[#111420] border border-slate-800/80 space-y-4 shadow-md hover:border-emerald-500/50 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">PostgreSQL & Redis</h3>
                  <span className="text-xs text-slate-400">DB Stack</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                Protected
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              PostgreSQL 16 (Primary) + Redis 7.2 (Queues). Production write guards armed.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">14 active connections</span>
              <span className="text-indigo-400 font-medium group-hover:underline">Open Console →</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
