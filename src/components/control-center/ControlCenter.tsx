import { useState } from "react";
import {
  Blocks,
  Bot,
  Shield,
  Bell,
  ScrollText,
  Settings,
  Search,
  Download,
  Trash2,
  Check,
  RefreshCw,
  Lock,
} from "lucide-react";
import type {
  AIPanelPlugin,
  AIProviderConfig,
  AuditEvent,
} from "../../lib/types";

interface ControlCenterProps {
  initialTab?: "plugins" | "ai" | "security" | "notifications" | "activity" | "settings";
  plugins: AIPanelPlugin[];
  onTogglePlugin: (pluginId: string) => void;
  onInstallPlugin: (pluginId: string) => void;
  onUninstallPlugin: (pluginId: string) => void;
}

export default function ControlCenter({
  initialTab = "plugins",
  plugins,
  onTogglePlugin,
  onInstallPlugin,
  onUninstallPlugin,
}: ControlCenterProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [pluginCategoryFilter, setPluginCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPluginForModal, setSelectedPluginForModal] = useState<AIPanelPlugin | null>(null);

  // AI Providers state
  const [aiProviders, setAiProviders] = useState<AIProviderConfig[]>([
    {
      id: "ai-gemini",
      name: "Google Gemini",
      type: "gemini",
      apiKey: "AIzaSy••••••••••••••••••••••••••••••••",
      isConfigured: true,
      models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-3.0-flash-preview"],
      selectedModel: "gemini-2.5-flash",
      tokensUsedThisMonth: 482900,
      estimatedCost: "$0.72",
      monthlyLimitUsd: 25.0,
    },
    {
      id: "ai-anthropic",
      name: "Anthropic Claude",
      type: "anthropic",
      apiKey: "sk-ant-••••••••••••••••••••••••••••••••",
      isConfigured: true,
      models: ["claude-3-7-sonnet-20250219", "claude-3-5-haiku-20241022"],
      selectedModel: "claude-3-7-sonnet-20250219",
      tokensUsedThisMonth: 124300,
      estimatedCost: "$3.45",
      monthlyLimitUsd: 50.0,
    },
    {
      id: "ai-openai",
      name: "OpenAI",
      type: "openai",
      apiKey: "",
      isConfigured: false,
      models: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
      selectedModel: "gpt-4o",
      tokensUsedThisMonth: 0,
      estimatedCost: "$0.00",
      monthlyLimitUsd: 30.0,
    },
    {
      id: "ai-ollama",
      name: "Ollama (Private Local AI)",
      type: "ollama",
      apiKey: "http://localhost:11434 (No key needed)",
      isConfigured: true,
      models: ["deepseek-coder-v2:16b", "llama3.2:latest", "qwen2.5-coder:7b"],
      selectedModel: "deepseek-coder-v2:16b",
      tokensUsedThisMonth: 1845000,
      estimatedCost: "$0.00 (Self-hosted)",
      monthlyLimitUsd: 0,
    },
  ]);

  // Security check state
  const [isRunningSecurityCheck, setIsRunningSecurityCheck] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState("Today at 10:15 AM");
  const [securityScore] = useState(94);

  // Activity logs
  const [auditLogs] = useState<AuditEvent[]>([
    {
      id: "evt-1",
      timestamp: "10:32:14",
      actor: "Tarun Sharma",
      actorType: "user",
      action: "Deployed application version v1.8.4",
      target: "production-vps",
      severity: "info",
      environment: "production",
    },
    {
      id: "evt-2",
      timestamp: "10:28:02",
      actor: "AIPanel AI",
      actorType: "ai",
      action: "Generated isolated preview environment for branch feature/wallet",
      target: "wallet-preview.aipanel.cloud",
      severity: "info",
      environment: "staging",
    },
    {
      id: "evt-3",
      timestamp: "10:20:44",
      actor: "Server Agent",
      actorType: "agent",
      action: "Automatic health check passed for 4 container services",
      target: "docker-daemon",
      severity: "info",
    },
    {
      id: "evt-4",
      timestamp: "09:55:18",
      actor: "System Sentinel",
      actorType: "system",
      action: "SSL certificate for aipanel.dev renewed successfully (Let's Encrypt)",
      target: "Caddy Reverse Proxy",
      severity: "info",
    },
    {
      id: "evt-5",
      timestamp: "08:12:00",
      actor: "Security Sentinel",
      actorType: "system",
      action: "Blocked 3 failed SSH login attempts from IP 194.26.29.112",
      target: "UFW Firewall",
      severity: "warning",
    },
  ]);

  const filteredPlugins = plugins.filter((p) => {
    const matchesCat = pluginCategoryFilter === "all" || p.category === pluginCategoryFilter;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const runSecurityCheck = () => {
    setIsRunningSecurityCheck(true);
    setTimeout(() => {
      setIsRunningSecurityCheck(false);
      setLastCheckTime("Just now");
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090e] text-slate-100 overflow-hidden font-sans">
      {/* Top Header */}
      <header className="p-8 border-b border-slate-800/80 bg-[#0d0f18]/80 backdrop-blur-xl shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950/40">
              <Blocks size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  AIPanel Control Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Modular Core
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Centralized orchestration for feature plugins, BYOK AI providers, server security policies, and audit trails.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-[#0b0d14] border border-slate-800/80 p-1.5 rounded-2xl overflow-x-auto shadow-inner">
            {[
              { id: "plugins", label: "Plugins & Marketplace", icon: Blocks },
              { id: "ai", label: "AI Providers", icon: Bot },
              { id: "security", label: "Security Center", icon: Shield },
              { id: "notifications", label: "Alerts & Expiry", icon: Bell },
              { id: "activity", label: "Activity Audit", icon: ScrollText },
              { id: "settings", label: "System", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/60"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Tab Body */}
      <main className="flex-1 overflow-y-auto p-8 min-h-0">
        {/* TAB 1: PLUGINS & MARKETPLACE */}
        {activeTab === "plugins" && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121520] p-4 rounded-2xl border border-slate-800/80 shadow-md">
              <div className="relative w-full sm:w-96">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search plugins by name or capability..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#0b0d14] border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {[
                  { id: "all", label: "All Plugins" },
                  { id: "hosting", label: "Hosting & CRM" },
                  { id: "infrastructure", label: "Infrastructure" },
                  { id: "ai", label: "AI Providers" },
                  { id: "backup", label: "Backups" },
                  { id: "monitoring", label: "Monitoring" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setPluginCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      pluginCategoryFilter === cat.id
                        ? "bg-slate-800 text-white border border-slate-700 shadow-xs"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plugin Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                    plugin.enabled
                      ? "bg-[#121520] border-slate-700/80 shadow-md shadow-black/20"
                      : "bg-[#121520]/60 border-slate-800/80 opacity-85"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-white">{plugin.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono font-medium">
                            v{plugin.version}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">By {plugin.author}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          plugin.enabled
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : plugin.installed
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {plugin.enabled ? "Active" : plugin.installed ? "Disabled" : "Available"}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                      {plugin.description}
                    </p>

                    {/* Permissions list preview */}
                    <div className="mt-4 pt-4 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Declared Permissions</span>
                        <button
                          onClick={() => setSelectedPluginForModal(plugin)}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {plugin.permissions.map((perm) => (
                          <span
                            key={perm.id}
                            className="text-xs px-2 py-0.5 rounded-md bg-[#0b0d14] text-slate-300 border border-slate-800"
                          >
                            ✓ {perm.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    {plugin.installed ? (
                      <>
                        <button
                          onClick={() => onTogglePlugin(plugin.id)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            plugin.enabled
                              ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/40"
                          }`}
                        >
                          {plugin.enabled ? "Disable Plugin" : "Enable Plugin"}
                        </button>
                        <button
                          onClick={() => onUninstallPlugin(plugin.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                          title="Uninstall Plugin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onInstallPlugin(plugin.id)}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-indigo-950/60 transition-all cursor-pointer"
                      >
                        <Download size={15} />
                        <span>Install Plugin</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: AI PROVIDERS */}
        {activeTab === "ai" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Bot size={18} className="text-indigo-400" />
                  Bring Your Own API Keys (BYOK)
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Keys are stored exclusively in local encrypted keystores (macOS Keychain / libsecret). Never transmitted to telemetry.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-[#0b0d14] px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">AI Spend This Month:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">$4.17</span>
              </div>
            </div>

            <div className="space-y-4">
              {aiProviders.map((prov) => (
                <div key={prov.id} className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Bot size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{prov.name}</h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {prov.isConfigured ? "Connected & Verified" : "Needs API Key Configuration"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-slate-200 font-bold block">
                        {prov.estimatedCost}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {(prov.tokensUsedThisMonth / 1000).toFixed(1)}k tokens
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">API Key / Endpoint</label>
                      <div className="relative">
                        <input
                          type="password"
                          value={prov.apiKey}
                          readOnly
                          placeholder="Paste API key here..."
                          className="w-full px-3.5 py-2 bg-[#0b0d14] border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-emerald-400 font-medium flex items-center gap-1">
                          <Lock size={12} /> Encrypted
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1.5">Default Model</label>
                      <select
                        value={prov.selectedModel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAiProviders((prev) =>
                            prev.map((p) => (p.id === prov.id ? { ...p, selectedModel: val } : p))
                          );
                        }}
                        className="w-full px-3.5 py-2 bg-[#0b0d14] border border-slate-800 rounded-xl text-xs text-slate-200 cursor-pointer"
                      >
                        {prov.models.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY CENTER */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Top Score Banner */}
            <div className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold font-mono shadow-md shadow-emerald-950/40">
                  {securityScore}%
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">System Security Health</h2>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    UFW Firewall active • Caddy TLS 1.3 enforced • Production writes guarded with confirmation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">Last scanned: {lastCheckTime}</span>
                <button
                  onClick={runSecurityCheck}
                  disabled={isRunningSecurityCheck}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer active:scale-95"
                >
                  <RefreshCw size={14} className={isRunningSecurityCheck ? "animate-spin" : ""} />
                  <span>Run Security Check</span>
                </button>
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "SSH Root Login", status: "Disabled", desc: "Key-based auth enforced across all nodes" },
                { label: "UFW Firewall", status: "Active (3 ports)", desc: "Strictly ports 80, 443, 9876 open" },
                { label: "SSL / TLS Certificates", status: "Auto-renewing", desc: "All domains valid for > 45 days" },
                { label: "2FA Authentication", status: "Enabled", desc: "TOTP authenticator active for admin" },
                { label: "Production DB Writes", status: "Protected", desc: "Explicit confirm required for migrations" },
                { label: "Docker Daemon Socket", status: "Sandboxed", desc: "Restricted to internal AIPanel agent group" },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/25">
                    <Check size={15} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-semibold text-white">{item.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                        {item.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block leading-relaxed">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS & EXPIRY */}
        {activeTab === "notifications" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell size={18} className="text-indigo-400" />
                Domain & SSL Expiry Cascades
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated multi-stage alerts triggered prior to domain or SSL certificate expiration:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
                {["90 days", "60 days", "30 days", "14 days", "7 days", "3 days", "1 day", "Expired"].map(
                  (stage, idx) => (
                    <div
                      key={stage}
                      className={`text-center py-2.5 px-2 rounded-xl border text-xs font-mono font-bold ${
                        idx < 3
                          ? "bg-slate-800/60 text-slate-300 border-slate-700"
                          : idx < 6
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {stage}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md space-y-4">
              <h3 className="text-base font-bold text-white">Active Delivery Channels</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "In-App Dashboard Banner", active: true, desc: "Immediate visual alert in TopBar & Dashboard" },
                  { name: "Email Notifications (SMTP)", active: true, desc: "admin@aipanel.dev via transactional SMTP" },
                  { name: "Slack / Discord Webhook", active: false, desc: "Requires monitoring notification webhook" },
                  { name: "Telegram Bot Alert", active: false, desc: "Optional instant notification bot" },
                ].map((chan, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#0b0d14] border border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{chan.name}</span>
                      <span className="text-xs text-slate-500 mt-0.5 block">{chan.desc}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        chan.active
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {chan.active ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVITY AUDIT */}
        {activeTab === "activity" && (
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ScrollText size={18} className="text-indigo-400" />
                  Cryptographic Activity Log
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Append-only immutable record of user, AI agent, server daemon, and system security actions.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{auditLogs.length} events logged</span>
            </div>

            <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-[#121520] divide-y divide-slate-800/60 shadow-md">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-4 min-w-0">
                    <span className="text-xs font-mono text-slate-500 mt-0.5 shrink-0">{log.timestamp}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{log.actor}</span>
                        <span
                          className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-full border ${
                            log.actorType === "user"
                              ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                              : log.actorType === "ai"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              : log.actorType === "agent"
                              ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {log.actorType}
                        </span>
                        {log.environment && (
                          <span
                            className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-full ${
                              log.environment === "production"
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {log.environment}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{log.action}</p>
                      <span className="text-xs text-slate-500 mt-1 block font-mono">Target: {log.target}</span>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full shrink-0 font-medium ${
                      log.severity === "warning"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {log.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-6 bg-[#121520] rounded-2xl border border-slate-800/80 shadow-md space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-indigo-400" />
                AIPanel Unified Architecture
              </h2>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-sm text-slate-200 font-semibold block">AIPanel Enterprise v0.1.0</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Dual Runtime Engine: Desktop (Tauri/Rust) & Server (Go Daemon/Caddy/Docker)</span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Up to Date
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Permissions Detail Modal */}
      {selectedPluginForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="bg-[#121520] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{selectedPluginForModal.name}</span>
                <span className="text-xs font-mono font-medium text-slate-400">
                  v{selectedPluginForModal.version}
                </span>
              </h3>
              <button
                onClick={() => setSelectedPluginForModal(null)}
                className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedPluginForModal.description}</p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Declared Security Permissions
              </h4>
              <div className="space-y-2">
                {selectedPluginForModal.permissions.map((perm) => (
                  <div key={perm.id} className="p-3 bg-[#0b0d14] rounded-xl border border-slate-800">
                    <div className="text-xs font-bold text-indigo-300">✓ {perm.name}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{perm.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPluginForModal(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
