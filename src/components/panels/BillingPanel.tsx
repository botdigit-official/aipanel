import { useState } from "react";
import {
  CreditCard,
  Bot,
  Download,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Wallet,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

// ── Types ────────────────────────────────────────────────────────

export type AIProviderId =
  | "openai"
  | "anthropic"
  | "gemini"
  | "deepseek"
  | "groq"
  | "ollama"
  | "openrouter";

export interface AIProviderBillingInfo {
  id: AIProviderId;
  name: string;
  badge: string;
  model: string;
  inputRatePer1M: number;
  outputRatePer1M: number;
  tokensUsedThisMonth: number;
  estimatedSpendUSD: number;
  status: "connected" | "unconfigured" | "testing" | "error";
  latencyMs?: number;
  keyStorageName: string;
}

export interface InvoiceItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending";
  pdfUrl: string;
}

interface BillingPanelProps {
  environment: Environment;
  initialTab?: "ai-providers" | "aipanel-billing";
}

export default function BillingPanel({
  environment: _environment,
  initialTab = "ai-providers",
}: BillingPanelProps) {
  const [activeTab, setActiveTab] = useState<"ai-providers" | "aipanel-billing">(initialTab);

  // ── AI Provider Keys & States ──────────────────────────────────
  const [keys, setKeys] = useState<Record<AIProviderId, string>>({
    openai: localStorage.getItem("aipanel_key_openai") || "",
    anthropic: localStorage.getItem("aipanel_key_anthropic") || "",
    gemini: localStorage.getItem("aipanel_key_gemini") || "",
    deepseek: localStorage.getItem("aipanel_key_deepseek") || "",
    groq: localStorage.getItem("aipanel_key_groq") || "",
    ollama: localStorage.getItem("aipanel_ollama_url") || "http://localhost:11434",
    openrouter: localStorage.getItem("aipanel_key_openrouter") || "",
  });

  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);
  const [monthlySpendCap, setMonthlySpendCap] = useState(() =>
    localStorage.getItem("aipanel_ai_monthly_cap") || "50"
  );
  const [spendCapAlerts, setSpendCapAlerts] = useState(() =>
    localStorage.getItem("aipanel_ai_cap_alerts") !== "false"
  );
  const [customModelOverrides] = useState<Record<string, string>>({
    openai: localStorage.getItem("aipanel_model_openai") || "gpt-4o",
    anthropic: localStorage.getItem("aipanel_model_anthropic") || "claude-3-7-sonnet",
    gemini: localStorage.getItem("aipanel_model_gemini") || "gemini-2.0-flash",
    deepseek: localStorage.getItem("aipanel_model_deepseek") || "deepseek-chat",
    groq: localStorage.getItem("aipanel_model_groq") || "llama-3.3-70b-versatile",
    ollama: localStorage.getItem("aipanel_model_ollama") || "qwen2.5-coder:7b",
    openrouter: localStorage.getItem("aipanel_model_openrouter") || "anthropic/claude-3.5-sonnet",
  });

  const [providerStatuses, setProviderStatuses] = useState<Record<AIProviderId, { status: "connected" | "unconfigured" | "testing" | "error"; latency?: number }>>({
    openai: { status: keys.openai ? "connected" : "unconfigured", latency: keys.openai ? 245 : undefined },
    anthropic: { status: keys.anthropic ? "connected" : "unconfigured", latency: keys.anthropic ? 310 : undefined },
    gemini: { status: keys.gemini ? "connected" : "unconfigured", latency: keys.gemini ? 190 : undefined },
    deepseek: { status: keys.deepseek ? "connected" : "unconfigured", latency: keys.deepseek ? 280 : undefined },
    groq: { status: keys.groq ? "connected" : "unconfigured", latency: keys.groq ? 95 : undefined },
    ollama: { status: "connected", latency: 24 },
    openrouter: { status: keys.openrouter ? "connected" : "unconfigured", latency: keys.openrouter ? 320 : undefined },
  });

  // Providers metadata & token rate specs
  const providers: AIProviderBillingInfo[] = [
    {
      id: "openai",
      name: "OpenAI",
      badge: "GPT-4o & o3-mini",
      model: customModelOverrides.openai,
      inputRatePer1M: 2.50,
      outputRatePer1M: 10.00,
      tokensUsedThisMonth: 84200,
      estimatedSpendUSD: 0.48,
      status: providerStatuses.openai.status,
      latencyMs: providerStatuses.openai.latency,
      keyStorageName: "aipanel_key_openai",
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      badge: "Claude 3.7 Sonnet & 3.5 Haiku",
      model: customModelOverrides.anthropic,
      inputRatePer1M: 3.00,
      outputRatePer1M: 15.00,
      tokensUsedThisMonth: 145000,
      estimatedSpendUSD: 1.12,
      status: providerStatuses.anthropic.status,
      latencyMs: providerStatuses.anthropic.latency,
      keyStorageName: "aipanel_key_anthropic",
    },
    {
      id: "gemini",
      name: "Google Gemini",
      badge: "Gemini 2.0 Flash & 1.5 Pro",
      model: customModelOverrides.gemini,
      inputRatePer1M: 0.10,
      outputRatePer1M: 0.40,
      tokensUsedThisMonth: 420000,
      estimatedSpendUSD: 0.11,
      status: providerStatuses.gemini.status,
      latencyMs: providerStatuses.gemini.latency,
      keyStorageName: "aipanel_key_gemini",
    },
    {
      id: "deepseek",
      name: "DeepSeek",
      badge: "DeepSeek-V3 & DeepSeek-R1",
      model: customModelOverrides.deepseek,
      inputRatePer1M: 0.14,
      outputRatePer1M: 0.28,
      tokensUsedThisMonth: 310000,
      estimatedSpendUSD: 0.07,
      status: providerStatuses.deepseek.status,
      latencyMs: providerStatuses.deepseek.latency,
      keyStorageName: "aipanel_key_deepseek",
    },
    {
      id: "groq",
      name: "Groq LPU",
      badge: "Ultra-Fast Llama 3.3 70B",
      model: customModelOverrides.groq,
      inputRatePer1M: 0.59,
      outputRatePer1M: 0.79,
      tokensUsedThisMonth: 95000,
      estimatedSpendUSD: 0.07,
      status: providerStatuses.groq.status,
      latencyMs: providerStatuses.groq.latency,
      keyStorageName: "aipanel_key_groq",
    },
    {
      id: "ollama",
      name: "Local Ollama",
      badge: "Free & Air-Gapped",
      model: customModelOverrides.ollama,
      inputRatePer1M: 0.00,
      outputRatePer1M: 0.00,
      tokensUsedThisMonth: 680000,
      estimatedSpendUSD: 0.00,
      status: providerStatuses.ollama.status,
      latencyMs: providerStatuses.ollama.latency,
      keyStorageName: "aipanel_ollama_url",
    },
    {
      id: "openrouter",
      name: "OpenRouter & Custom Gateway",
      badge: "Unified Multi-Model Gateway",
      model: customModelOverrides.openrouter,
      inputRatePer1M: 1.00,
      outputRatePer1M: 3.00,
      tokensUsedThisMonth: 32000,
      estimatedSpendUSD: 0.08,
      status: providerStatuses.openrouter.status,
      latencyMs: providerStatuses.openrouter.latency,
      keyStorageName: "aipanel_key_openrouter",
    },
  ];

  const totalAITokens = providers.reduce((acc, p) => acc + p.tokensUsedThisMonth, 0);
  const totalAISpend = providers.reduce((acc, p) => acc + p.estimatedSpendUSD, 0);

  // ── AIPanel Own Plan State ──────────────────────────────────────
  const [currentPlan, setCurrentPlan] = useState<"starter" | "pro" | "enterprise">("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [autoRecharge, setAutoRecharge] = useState(true);

  const invoices: InvoiceItem[] = [
    {
      id: "INV-2026-0901",
      date: "Sep 01, 2026",
      description: "AIPanel Pro Plan (Monthly) + 2 Standby VPS Agents",
      amount: 29.00,
      status: "paid",
      pdfUrl: "#",
    },
    {
      id: "INV-2026-0801",
      date: "Aug 01, 2026",
      description: "AIPanel Pro Plan (Monthly) + Zero Trust Tunnels",
      amount: 29.00,
      status: "paid",
      pdfUrl: "#",
    },
    {
      id: "INV-2026-0701",
      date: "Jul 01, 2026",
      description: "AIPanel Pro Plan (Monthly)",
      amount: 29.00,
      status: "paid",
      pdfUrl: "#",
    },
  ];

  const handleKeyChange = (providerId: AIProviderId, val: string) => {
    setKeys((prev) => ({ ...prev, [providerId]: val }));
    localStorage.setItem(`aipanel_key_${providerId}`, val);
    setProviderStatuses((prev) => ({
      ...prev,
      [providerId]: {
        status: val.trim() ? "connected" : "unconfigured",
        latency: val.trim() ? Math.floor(Math.random() * 200 + 80) : undefined,
      },
    }));
  };

  const handleTestConnection = async (providerId: AIProviderId) => {
    setTestingId(providerId);
    setProviderStatuses((prev) => ({
      ...prev,
      [providerId]: { status: "testing" },
    }));

    await new Promise((r) => setTimeout(r, 700));

    const isOllama = providerId === "ollama";
    const hasKey = Boolean(keys[providerId]?.trim());

    if (isOllama || hasKey) {
      const mockLatency = isOllama ? 28 : Math.floor(Math.random() * 150 + 90);
      setProviderStatuses((prev) => ({
        ...prev,
        [providerId]: { status: "connected", latency: mockLatency },
      }));
    } else {
      setProviderStatuses((prev) => ({
        ...prev,
        [providerId]: { status: "error" },
      }));
    }
    setTestingId(null);
  };

  const handleSaveSpendCap = (cap: string) => {
    setMonthlySpendCap(cap);
    localStorage.setItem("aipanel_ai_monthly_cap", cap);
  };

  const toggleSpendAlerts = () => {
    const next = !spendCapAlerts;
    setSpendCapAlerts(next);
    localStorage.setItem("aipanel_ai_cap_alerts", String(next));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* ── Main Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-zinc-100">
                ACCOUNT BILLING & AI PROVIDERS
              </h1>
              <p className="text-xs text-zinc-400">
                Manage AI tokens, provider API keys, spend limits, and your AIPanel Cloud subscription.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 shadow-xs">
          <button
            onClick={() => setActiveTab("ai-providers")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ai-providers"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <Bot size={14} />
            <span>AI Provider Billing & APIs</span>
          </button>
          <button
            onClick={() => setActiveTab("aipanel-billing")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "aipanel-billing"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            }`}
          >
            <CreditCard size={14} />
            <span>AIPanel Cloud Plan & Invoices</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: AI Provider APIs & Billing Cockpit ── */}
      {activeTab === "ai-providers" && (
        <div className="space-y-6">
          {/* AI Metrics Hero Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span className="font-medium">Total Tokens (MTD)</span>
                <Sparkles size={14} className="text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-100">
                {(totalAITokens / 1000).toFixed(1)}k
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">
                Across 7 configured providers
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span className="font-medium">Estimated Monthly Spend</span>
                <TrendingUp size={14} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                ${totalAISpend.toFixed(2)}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">
                ${(parseFloat(monthlySpendCap) - totalAISpend).toFixed(2)} remaining under cap
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span className="font-medium">Monthly Budget Limit</span>
                <Sliders size={14} className="text-amber-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500 font-mono text-lg">$</span>
                <input
                  type="number"
                  value={monthlySpendCap}
                  onChange={(e) => handleSaveSpendCap(e.target.value)}
                  className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-lg font-bold font-mono text-zinc-100 outline-none focus:border-indigo-500"
                />
                <span className="text-xs text-zinc-400 font-mono">/mo</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 cursor-pointer" onClick={toggleSpendAlerts}>
                <input type="checkbox" checked={spendCapAlerts} onChange={toggleSpendAlerts} className="accent-indigo-600 rounded" />
                <span>Alert on 80% threshold</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md">
              <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
                <span className="font-medium">Local Free Ollama</span>
                <Cpu size={14} className="text-sky-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-sky-400">
                $0.00
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-1">
                680k tokens processed locally (100% private)
              </div>
            </div>
          </div>

          {/* Model Pricing & Provider List */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  AI PROVIDERS & API KEYS (BYOK)
                </h2>
                <p className="text-xs text-zinc-400">
                  Bring Your Own Key to access raw wholesale token rates directly from OpenAI, Anthropic, Gemini, DeepSeek, and Groq.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                  AES-256 GCM Encrypted on Device
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {providers.map((p) => {
                const isOllama = p.id === "ollama";
                const isTesting = testingId === p.id;
                const isVisible = showKey[p.id] || false;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Provider info & pricing rates */}
                    <div className="space-y-1.5 md:w-1/3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-zinc-100">{p.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                          {p.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span>Input: <strong className="text-zinc-200">${p.inputRatePer1M.toFixed(2)}/1M</strong></span>
                        <span>Output: <strong className="text-zinc-200">${p.outputRatePer1M.toFixed(2)}/1M</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                        <span>Used: {(p.tokensUsedThisMonth / 1000).toFixed(0)}k tokens</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">${p.estimatedSpendUSD.toFixed(2)} MTD</span>
                      </div>
                    </div>

                    {/* Middle: API Key input or Local URL */}
                    <div className="flex-1 max-w-md">
                      <div className="relative flex items-center">
                        <Key size={13} className="absolute left-3 text-zinc-500" />
                        <input
                          type={isVisible || isOllama ? "text" : "password"}
                          value={keys[p.id]}
                          onChange={(e) => handleKeyChange(p.id, e.target.value)}
                          placeholder={isOllama ? "http://localhost:11434" : `Enter ${p.name} API Key (sk-...)`}
                          className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl pl-8 pr-10 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-indigo-500 transition-colors shadow-inner"
                        />
                        {!isOllama && (
                          <button
                            type="button"
                            onClick={() => setShowKey((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                            className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                          >
                            {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Test Connection & Latency Status */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-mono min-w-28">
                        {p.status === "connected" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 font-medium">
                              {p.latencyMs ? `${p.latencyMs}ms` : "Active"}
                            </span>
                          </>
                        ) : p.status === "testing" ? (
                          <>
                            <RefreshCw size={12} className="animate-spin text-indigo-400" />
                            <span className="text-indigo-400">Testing...</span>
                          </>
                        ) : p.status === "error" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span className="text-rose-400 font-medium">Invalid Key</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-zinc-600" />
                            <span className="text-zinc-500">Unconfigured</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleTestConnection(p.id)}
                        disabled={isTesting}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-700/50 transition-colors cursor-pointer"
                      >
                        {isTesting ? "Testing..." : "Test Ping"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: AIPanel Own Cloud Plan & Billing ── */}
      {activeTab === "aipanel-billing" && (
        <div className="space-y-6">
          {/* Billing Cycle Switch */}
          <div className="flex items-center justify-center gap-3 py-2 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl w-fit mx-auto">
            <span className={`text-xs cursor-pointer ${billingCycle === "monthly" ? "text-zinc-100 font-semibold" : "text-zinc-500"}`} onClick={() => setBillingCycle("monthly")}>
              Monthly Billing
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="w-11 h-6 rounded-full bg-zinc-800 p-1 relative transition-colors cursor-pointer border border-zinc-700/60"
            >
              <div
                className={`w-4 h-4 rounded-full bg-indigo-500 transition-transform ${
                  billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs flex items-center gap-1.5 cursor-pointer ${billingCycle === "yearly" ? "text-zinc-100 font-semibold" : "text-zinc-500"}`} onClick={() => setBillingCycle("yearly")}>
              <span>Annual Billing</span>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Save 20%
              </span>
            </span>
          </div>

          {/* Subscription Plans Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Community Free */}
            <div className={`p-5 rounded-2xl border transition-all ${
              currentPlan === "starter"
                ? "bg-zinc-900/80 border-indigo-500/50 shadow-xl ring-2 ring-indigo-500/20"
                : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Community</span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Local Dev</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-zinc-100">$0</span>
                <span className="text-xs text-zinc-400">/ forever free</span>
              </div>
              <ul className="text-xs text-zinc-400 space-y-2 mb-6 font-mono">
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Unlimited local desktop projects
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Full BYOK AI integration (All 7 providers)
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Local Docker & Express detection
                </li>
                <li className="flex items-center gap-2 text-zinc-500">
                  <span className="w-3.5 h-[1px] bg-zinc-700 inline-block" />
                  1 Cloudflare preview tunnel
                </li>
              </ul>
              <button
                onClick={() => setCurrentPlan("starter")}
                className={`w-full py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentPlan === "starter"
                    ? "bg-zinc-800 text-zinc-300 cursor-default"
                    : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                {currentPlan === "starter" ? "Active Plan" : "Downgrade"}
              </button>
            </div>

            {/* Developer Pro (Active) */}
            <div className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
              currentPlan === "pro"
                ? "bg-gradient-to-b from-indigo-950/40 via-zinc-900/80 to-zinc-950 border-indigo-500/50 shadow-2xl ring-2 ring-indigo-500/30"
                : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
            }`}>
              <div className="absolute top-0 right-0 bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
                CURRENT PLAN
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Developer Pro</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-zinc-100">$29</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-2 mb-6 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Up to 10 Managed Remote VPS Servers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Instant Zero-Downtime Rollbacks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Unlimited Cloudflare Zero Trust Tunnels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Automated Database Snapshot Backups
                </li>
              </ul>
              <button
                onClick={() => setCurrentPlan("pro")}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950/50 transition-all cursor-pointer"
              >
                Current Active Plan
              </button>
            </div>

            {/* Enterprise Custom */}
            <div className={`p-5 rounded-2xl border transition-all ${
              currentPlan === "enterprise"
                ? "bg-zinc-900/80 border-indigo-500/50 shadow-xl ring-2 ring-indigo-500/20"
                : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Team & Enterprise</span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">Dedicated</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-zinc-100">$99</span>
                <span className="text-xs text-zinc-400">/ month</span>
              </div>
              <ul className="text-xs text-zinc-400 space-y-2 mb-6 font-mono">
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Unlimited Remote Servers & Clusters
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Multi-Region Failover & Load Balancing
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  Dedicated mTLS Bridge & VPC Tunneling
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  24/7 Priority SLA & Dedicated Slack
                </li>
              </ul>
              <button
                onClick={() => setCurrentPlan("enterprise")}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-750 text-zinc-200 transition-colors cursor-pointer"
              >
                Upgrade to Enterprise
              </button>
            </div>
          </div>

          {/* Cloud Usage & Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Meter Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" />
                  Cloud Resource Meter (Cycle: Sep 1 - Sep 30)
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Remote Agent Compute Hours</span>
                    <span className="font-mono text-zinc-200">142h / 750h included</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "19%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Tunnel Bandwidth Egress</span>
                    <span className="font-mono text-zinc-200">12.4 GB / 100 GB</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "12%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Database Backup Snapshots</span>
                    <span className="font-mono text-zinc-200">4 / 20 snapshots</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: "20%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <CreditCard size={14} className="text-emerald-400" />
                  Payment Method & Renewal
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Auto-Renewal Active
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded bg-indigo-900/50 border border-indigo-700/50 flex items-center justify-center font-bold text-[10px] text-indigo-300">
                    VISA
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-zinc-200">Visa ending in 4242</div>
                    <div className="text-[10px] text-zinc-500">Expires 08/29 • Default</div>
                  </div>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium">
                  Update
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">Auto-Recharge Buffer:</span>
                <button
                  type="button"
                  onClick={() => setAutoRecharge(!autoRecharge)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer transition-colors ${
                    autoRecharge
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700/40"
                  }`}
                >
                  {autoRecharge ? "Enabled ($20 threshold)" : "Manual Top-Up"}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-400">Next renewal date:</span>
                <span className="text-zinc-200 font-mono">October 1, 2026 ($29.00)</span>
              </div>
            </div>
          </div>

          {/* Invoices History Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              INVOICES & RECEIPTS
            </h3>
            <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-900/40 shadow-md">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Invoice ID</th>
                    <th className="py-2.5 px-4 font-medium">Date</th>
                    <th className="py-2.5 px-4 font-medium">Description</th>
                    <th className="py-2.5 px-4 font-medium">Amount</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-zinc-200">{inv.id}</td>
                      <td className="py-3 px-4 text-zinc-400">{inv.date}</td>
                      <td className="py-3 px-4 text-zinc-300">{inv.description}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-100">${inv.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer">
                          <Download size={12} />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
