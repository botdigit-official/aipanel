import { useState } from "react";
import {
  Play,
  Square,
  RotateCw,
  Database,
  Container,
  Activity,
  Layers,
  Shield,
  CheckCircle2,
  Plus,
  Minus,
  Globe,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

// ── Types ────────────────────────────────────────────────────────

export interface ManagedService {
  id: string;
  name: string;
  category: "database" | "cache" | "app" | "worker";
  status: "running" | "stopped" | "starting";
  port?: number;
  memoryUsage?: string;
  cpuUsage?: string;
  containerId?: string;
  uptime?: string;
}

export interface ManagedWorker {
  id: string;
  name: string;
  command: string;
  status: "running" | "stopped";
  replicas: number;
  processedJobs: number;
  failedJobs: number;
}

interface ServicesPanelProps {
  environment: Environment;
  projectName?: string;
}

// ── Component ────────────────────────────────────────────────────

export default function ServicesPanel({ environment, projectName = "Project" }: ServicesPanelProps) {
  const [services, setServices] = useState<ManagedService[]>([
    {
      id: "postgres",
      name: "PostgreSQL 16",
      category: "database",
      status: "running",
      port: 5432,
      memoryUsage: "48 MB",
      cpuUsage: "0.4%",
      containerId: "aipanel_postgres_1",
      uptime: "42m",
    },
    {
      id: "redis",
      name: "Redis 7.2",
      category: "cache",
      status: "running",
      port: 6379,
      memoryUsage: "16 MB",
      cpuUsage: "0.1%",
      containerId: "aipanel_redis_1",
      uptime: "42m",
    },
    {
      id: "app",
      name: "Vite / Next.js Dev Server",
      category: "app",
      status: "running",
      port: 3000,
      memoryUsage: "85 MB",
      cpuUsage: "1.2%",
      uptime: "35m",
    },
  ]);

  const [workers, setWorkers] = useState<ManagedWorker[]>([
    {
      id: "queue-worker",
      name: "Default Queue Worker",
      command: "php artisan queue:work --timeout=60",
      status: "running",
      replicas: 2,
      processedJobs: 148,
      failedJobs: 0,
    },
    {
      id: "scheduler",
      name: "Cron Scheduler",
      command: "php artisan schedule:work",
      status: "running",
      replicas: 1,
      processedJobs: 24,
      failedJobs: 0,
    },
  ]);

  const [activeTab, setActiveTab] = useState<"services" | "workers" | "vault">("services");

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === "running") {
          return { ...s, status: "stopped", memoryUsage: "0 MB", cpuUsage: "0%" };
        } else {
          return { ...s, status: "running", memoryUsage: "32 MB", cpuUsage: "0.2%" };
        }
      })
    );
  };

  const restartService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "starting" } : s))
    );
    setTimeout(() => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "running" } : s))
      );
    }, 800);
  };

  const toggleWorker = (id: string) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "running" ? "stopped" : "running" }
          : w
      )
    );
  };

  const scaleWorker = (id: string, delta: number) => {
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, replicas: Math.max(1, Math.min(8, w.replicas + delta)) }
          : w
      )
    );
  };

  const startAll = () => {
    setServices((prev) =>
      prev.map((s) => ({ ...s, status: "running", memoryUsage: "40 MB", cpuUsage: "0.3%" }))
    );
    setWorkers((prev) => prev.map((w) => ({ ...w, status: "running" })));
  };

  const stopAll = () => {
    setServices((prev) =>
      prev.map((s) => ({ ...s, status: "stopped", memoryUsage: "0 MB", cpuUsage: "0%" }))
    );
    setWorkers((prev) => prev.map((w) => ({ ...w, status: "stopped" })));
  };

  const allRunning = services.every((s) => s.status === "running");

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Header bar */}
      <div className="h-13 border-b border-[#222736] px-5 flex items-center justify-between shrink-0 bg-[#0f111a]">
        <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Container size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-3">
              <span>Environment Engine</span>
              <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 tracking-wider">
                {environment} Stack
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Docker compose services, background workers, and secrets isolation
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {allRunning ? (
            <button
              onClick={stopAll}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-xs font-medium text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
            >
              <Square size={12} className="fill-rose-400 text-rose-400" />
              <span>Stop All Services</span>
            </button>
          ) : (
            <button
              onClick={startAll}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white shadow-sm transition-all cursor-pointer"
            >
              <Play size={12} className="fill-white" />
              <span>Start All Services</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-nav Tabs */}
      <div className="flex items-center gap-3 px-5 border-b border-[#202535] bg-[#0c0e15] text-xs shrink-0 h-10">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-3 h-full border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "services"
              ? "border-indigo-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Database size={13} />
          <span>Services ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("workers")}
          className={`flex items-center gap-2 px-3 h-full border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "workers"
              ? "border-indigo-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Layers size={13} />
          <span>Workers ({workers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("vault")}
          className={`flex items-center gap-2 px-3 h-full border-b-2 font-medium transition-colors cursor-pointer ${
            activeTab === "vault"
              ? "border-indigo-500 text-zinc-100"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Shield size={13} />
          <span>Secrets Vault (AES-256)</span>
        </button>
      </div>

      {/* Main tab view */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "services" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Docker Host Summary Card */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-300">Docker Daemon</span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Engine: 27.2 • Network: aipanel_dev_net
                </div>
              </div>

              {/* Tunnel Card */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-300">Public Preview URL</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Cloudflare
                  </span>
                </div>
                <div className="text-[11px] text-indigo-400 font-mono truncate">
                  https://{projectName.toLowerCase()}-dev.botdigit.site
                </div>
              </div>

              {/* Total Memory Utilization */}
              <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-zinc-300">Local Stack Memory</span>
                  <span className="text-xs font-mono text-zinc-400">149 MB</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[24%]" />
                </div>
              </div>
            </div>

            {/* Service Cards List */}
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Service & Port</span>
                <span>Actions & Telemetry</span>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {services.map((service) => {
                  const isRunning = service.status === "running";
                  return (
                    <div
                      key={service.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-zinc-850/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isRunning
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                          }`}
                        >
                          {service.category === "database" ? (
                            <Database size={17} />
                          ) : service.category === "cache" ? (
                            <Activity size={17} />
                          ) : (
                            <Globe size={17} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-zinc-100 font-sans">
                              {service.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                                isRunning
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
                              }`}
                            >
                              {service.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-1">
                            {service.port && (
                              <span>
                                Port: <span className="text-zinc-200">{service.port}</span>
                              </span>
                            )}
                            {service.containerId && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <span>Container: {service.containerId}</span>
                              </>
                            )}
                            {service.uptime && isRunning && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <span>Uptime: {service.uptime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-3">
                        {isRunning && (
                          <div className="text-right hidden sm:block text-[11px] font-mono text-zinc-400 mr-2">
                            <div>CPU: {service.cpuUsage}</div>
                            <div>RAM: {service.memoryUsage}</div>
                          </div>
                        )}
                        <button
                          onClick={() => restartService(service.id)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                          title="Restart Service"
                        >
                          <RotateCw size={13} />
                        </button>
                        <button
                          onClick={() => toggleService(service.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isRunning
                              ? "bg-zinc-800/80 hover:bg-zinc-750 text-rose-300 border-zinc-700"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                          }`}
                        >
                          {isRunning ? <Square size={11} className="fill-rose-400 text-rose-400" /> : <Play size={11} className="fill-white" />}
                          <span>{isRunning ? "Stop" : "Start"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-200 mb-0.5">
                  Background Queue Workers & Schedulers
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Supervised process supervisor managing asynchronous queue listeners.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Horizon / Celery / BullMQ
              </span>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 divide-y divide-zinc-800/60">
              {workers.map((worker) => {
                const isRunning = worker.status === "running";
                return (
                  <div
                    key={worker.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-850/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-zinc-100 font-sans">{worker.name}</span>
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                            isRunning
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {worker.status}
                        </span>
                      </div>
                      <code className="text-[11px] text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 block w-fit">
                        {worker.command}
                      </code>
                      <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono mt-2">
                        <span>Jobs Processed: {worker.processedJobs}</span>
                        <span>Failed: {worker.failedJobs}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Replica scale buttons */}
                      <div className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 text-xs font-mono">
                        <span className="text-zinc-500 text-[10px]">Replicas:</span>
                        <button
                          onClick={() => scaleWorker(worker.id, -1)}
                          disabled={worker.replicas <= 1}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-5 text-center font-bold text-zinc-200">{worker.replicas}</span>
                        <button
                          onClick={() => scaleWorker(worker.id, 1)}
                          disabled={worker.replicas >= 8}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleWorker(worker.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isRunning
                            ? "bg-zinc-800/80 hover:bg-zinc-750 text-rose-300 border-zinc-700"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500"
                        }`}
                      >
                        {isRunning ? <Square size={11} className="fill-rose-400 text-rose-400" /> : <Play size={11} className="fill-white" />}
                        <span>{isRunning ? "Stop" : "Start"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "vault" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                  DEV Environment Secrets Vault
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                  All environment variables are encrypted at rest with <strong>AES-256-GCM</strong>.
                  Production secrets are never accessible from local development code.
                </p>
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>Hardware-Bound Master Key: Active</span>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40">
              <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Configured Environment Variables</span>
                <span className="text-[11px] text-zinc-500 font-mono">4 items</span>
              </div>
              <div className="divide-y divide-zinc-800/60 font-mono text-xs">
                {[
                  { key: "DATABASE_URL", val: "postgresql://postgres:secret@127.0.0.1:5432/app" },
                  { key: "REDIS_HOST", val: "127.0.0.1" },
                  { key: "REDIS_PORT", val: "6379" },
                  { key: "APP_ENV", val: "local" },
                ].map((item) => (
                  <div key={item.key} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-indigo-400 font-semibold">{item.key}</span>
                    <span className="text-zinc-500 select-all bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
