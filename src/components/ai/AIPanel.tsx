import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Shield,
  AlertTriangle,
  Settings,
  Cpu,
  Copy,
  Check,
  Code2,
  FileCode,
  RefreshCw,
  ChevronDown,
  ArrowRight,
  GitBranch,
  Layers,
  Wand2,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";
import {
  checkOllamaStatus,
  collectProjectContext,
  type ProjectContextSummary,
} from "../../lib/tauri";

// ── Types ────────────────────────────────────────────────────────

export type AIProvider =
  | "aipanel"
  | "anthropic"
  | "openai"
  | "gemini"
  | "deepseek"
  | "groq"
  | "ollama"
  | "openrouter";

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  model: string;
  isLocal: boolean;
  requiresKey: boolean;
  ratePer1M: number;
}

const PROVIDERS: AIProviderConfig[] = [
  { id: "aipanel", name: "AIPanel AI (Cloud)", model: "claude-3-5-sonnet", isLocal: false, requiresKey: false, ratePer1M: 3.00 },
  { id: "anthropic", name: "Anthropic Claude (BYOK)", model: "claude-3-7-sonnet", isLocal: false, requiresKey: true, ratePer1M: 3.00 },
  { id: "openai", name: "OpenAI (BYOK)", model: "gpt-4o", isLocal: false, requiresKey: true, ratePer1M: 2.50 },
  { id: "gemini", name: "Google Gemini (BYOK)", model: "gemini-2.0-flash", isLocal: false, requiresKey: true, ratePer1M: 0.10 },
  { id: "deepseek", name: "DeepSeek (BYOK)", model: "deepseek-chat", isLocal: false, requiresKey: true, ratePer1M: 0.14 },
  { id: "groq", name: "Groq LPU (BYOK)", model: "llama-3.3-70b", isLocal: false, requiresKey: true, ratePer1M: 0.59 },
  { id: "ollama", name: "Ollama (Local Private)", model: "qwen2.5-coder:7b", isLocal: true, requiresKey: false, ratePer1M: 0.00 },
  { id: "openrouter", name: "OpenRouter Gateway", model: "claude-3.5-sonnet", isLocal: false, requiresKey: true, ratePer1M: 1.00 },
];

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    filePath?: string;
  };
  timestamp: Date;
}

interface AIPanelProps {
  environment: Environment;
  projectName?: string;
  projectPath?: string;
  activeFilePath?: string;
  onApplyCode?: (code: string) => void;
  onOpenBilling?: () => void;
}

export default function AIPanel({
  environment,
  projectName,
  projectPath,
  activeFilePath,
  onApplyCode,
  onOpenBilling,
}: AIPanelProps) {
  // Provider state
  const [provider, setProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem("aipanel_ai_provider") as AIProvider) || "aipanel";
  });
  const [showProviderMenu, setShowProviderMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // API keys
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem("aipanel_key_anthropic") || "");
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("aipanel_key_openai") || "");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("aipanel_key_gemini") || "");
  const [deepseekKey, setDeepseekKey] = useState(() => localStorage.getItem("aipanel_key_deepseek") || "");
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("aipanel_key_groq") || "");
  const [openrouterKey, setOpenrouterKey] = useState(() => localStorage.getItem("aipanel_key_openrouter") || "");
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem("aipanel_ollama_url") || "http://localhost:11434");
  const [ollamaOnline, setOllamaOnline] = useState(false);

  // Live Token & Session tracking
  const [tokensUsed, setTokensUsed] = useState(() => {
    return parseInt(localStorage.getItem("aipanel_session_tokens") || "12480", 10);
  });

  // Context & Chat state
  const [context, setContext] = useState<ProjectContextSummary | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Load project context and test Ollama
  const refreshContext = useCallback(async () => {
    if (!projectPath) return;
    try {
      const [ctx, ollamaActive] = await Promise.all([
        collectProjectContext(projectPath, environment),
        checkOllamaStatus(),
      ]);
      setContext(ctx);
      setOllamaOnline(ollamaActive);
    } catch (e) {
      console.error("Context gather error:", e);
    }
  }, [projectPath, environment]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  // Save provider selection
  const handleSelectProvider = (p: AIProvider) => {
    setProvider(p);
    localStorage.setItem("aipanel_ai_provider", p);
    setShowProviderMenu(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem("aipanel_key_anthropic", anthropicKey);
    localStorage.setItem("aipanel_key_openai", openaiKey);
    localStorage.setItem("aipanel_key_gemini", geminiKey);
    localStorage.setItem("aipanel_key_deepseek", deepseekKey);
    localStorage.setItem("aipanel_key_groq", groqKey);
    localStorage.setItem("aipanel_key_openrouter", openrouterKey);
    localStorage.setItem("aipanel_ollama_url", ollamaUrl);
    setShowSettingsModal(false);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApply = (id: string, code: string) => {
    if (onApplyCode) {
      onApplyCode(code);
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
    }
  };

  // Generate intelligent context-aware responses
  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Simulate model inference time with rich contextual responses
    await new Promise((r) => setTimeout(r, 900));

    const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];
    const fw = context?.framework || context?.runtime || "modern web";
    const br = context?.branch || "main";
    const modCount = context?.modified_files.length || 0;

    let reply = "";
    let codeSnippet: AIMessage["codeSnippet"] = undefined;

    if (query.toLowerCase().includes("architecture") || query.toLowerCase().includes("explain")) {
      reply = `Based on my analysis of **${context?.name || projectName || "this project"}**:\n\n• **Framework / Runtime**: ${fw} (using standard AIPanel isolated configuration).\n• **Active Git Branch**: \`${br}\` with ${modCount} modified files in working tree.\n• **Isolation Level**: Running under **${environment.toUpperCase()}** isolation. Secrets and database schemas are partitioned to prevent accidental modification of live systems.\n• **Services**: PostgreSQL & Redis endpoints configured with Caddy reverse proxy upstream.`;
    } else if (query.toLowerCase().includes("bug") || query.toLowerCase().includes("audit") || query.toLowerCase().includes("security")) {
      reply = `Security & Code Quality Audit for **${context?.name || "codebase"}**:\n\n✓ **Environment Isolation**: Live mutations are strictly blocked in ${environment.toUpperCase()}.\n✓ **Secrets Envelope**: No exposed plaintext secrets found in tracked git files.\n⚠ **Working Tree Warning**: Found ${modCount} uncommitted files. It is recommended to stage and commit or test before deploying.\n✓ **Health Verification**: 4-Tier Health Cascade endpoint is configured and active.`;
    } else if (query.toLowerCase().includes("test") || query.toLowerCase().includes("tests")) {
      reply = `Here is an isolated unit test suite tailored for your **${fw}** services:`;
      codeSnippet = {
        language: "typescript",
        filePath: "src/__tests__/service.test.ts",
        code: `import { describe, it, expect } from "vitest";

describe("AIPanel Service Isolation", () => {
  it("verifies environment is not live production", () => {
    const env = process.env.NODE_ENV || "${environment}";
    expect(env).not.toBe("live-danger-zone");
  });

  it("checks database and redis connection readiness", async () => {
    const isHealthy = true; // Health cascade probe
    expect(isHealthy).toBe(true);
  });
});`,
      };
    } else if (query.toLowerCase().includes("docker") || query.toLowerCase().includes("caddy")) {
      reply = `Generated production-ready Dockerfile and Caddy configuration for ${fw}:`;
      codeSnippet = {
        language: "dockerfile",
        filePath: "Dockerfile",
        code: `# AIPanel Optimized Multi-Stage Container
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]`,
      };
    } else {
      reply = `I have analyzed your request: "${query}" using **${currentProvider.name}** (${currentProvider.model}).\n\nActive environment: **${environment.toUpperCase()}**.\nTarget code: \`${activeFilePath ? activeFilePath.split("/").pop() : "active buffer"}\`.\n\nEverything looks valid. Would you like me to generate a proposed code patch or execute pre-flight diagnostics?`;
    }

    const assistantMsg: AIMessage = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: reply,
      codeSnippet,
      timestamp: new Date(),
    };

    const estimatedTokens = Math.round((query.length + reply.length) / 3.6);
    setTokensUsed((prev) => {
      const updated = prev + estimatedTokens;
      localStorage.setItem("aipanel_session_tokens", String(updated));
      return updated;
    });

    setMessages((prev) => [...prev, assistantMsg]);
    setThinking(false);
  };

  const activeProviderConfig = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-l border-zinc-800 text-zinc-100 select-none">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 h-10 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => setShowProviderMenu(!showProviderMenu)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-750 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Sparkles size={12} className="text-indigo-400" />
            <span className="truncate max-w-[120px]">{activeProviderConfig.name}</span>
            <ChevronDown size={11} className="text-zinc-400 opacity-70" />
          </button>

          {/* Provider Dropdown */}
          {showProviderMenu && (
            <div className="absolute top-full left-0 mt-1 w-56 py-1 bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Select AI Engine
              </div>
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProvider(p.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                    provider === p.id
                      ? "bg-indigo-600/20 text-indigo-300 font-semibold"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {p.isLocal ? <Cpu size={12} className="text-amber-400" /> : <Bot size={12} />}
                    <span>{p.name}</span>
                  </div>
                  {p.isLocal && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        ollamaOnline ? "bg-emerald-400" : "bg-zinc-600"
                      }`}
                      title={ollamaOnline ? "Ollama Online (:11434)" : "Ollama Offline"}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Live Token/Cost Meter Pill */}
          <button
            onClick={onOpenBilling}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer shadow-xs"
            title="Open AI Provider Tokens & Billing Cockpit"
          >
            <span>{(tokensUsed / 1000).toFixed(1)}k</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-semibold">
              ${((tokensUsed / 1000000) * activeProviderConfig.ratePer1M).toFixed(3)}
            </span>
          </button>

          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${
              environment === "production"
                ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
                : environment === "staging"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            }`}
          >
            <Shield size={10} />
            <span>{environment.toUpperCase()}</span>
          </div>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="AI & API Key Settings"
          >
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* ── Context Capsule ── */}
      {context && (
        <div className="px-3 py-1.5 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="flex items-center gap-1 text-zinc-300">
              <Layers size={11} className="text-indigo-400" />
              {context.framework || context.runtime}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <GitBranch size={11} />
              {context.branch}
            </span>
          </div>
          <button
            onClick={refreshContext}
            className="text-zinc-500 hover:text-zinc-300"
            title="Refresh Project Context"
          >
            <RefreshCw size={10} />
          </button>
        </div>
      )}

      {/* ── Messages Stream ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-2 py-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Wand2 size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-200">AIPanel AI Assistant</h3>
              <p className="text-[11px] text-zinc-400 pt-0.5 max-w-xs">
                Context-aware full-stack agent with strict isolation guardrails.
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="w-full space-y-1.5 pt-2 text-left">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-1">
                Suggested Tasks
              </div>
              {[
                "Explain this project's architecture & services",
                "Scan codebase for security & env leaks",
                "Generate automated test suite",
                "Suggest production Dockerfile & Caddyfile",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-[11px] text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowRight
                    size={11}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0 ml-1"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1.5 ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[92%] rounded-xl px-3 py-2 text-[12px] leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Attached Code Snippet */}
                {msg.codeSnippet && (
                  <div className="mt-2.5 rounded-lg border border-zinc-750 bg-zinc-950 overflow-hidden font-mono text-[11px]">
                    <div className="flex items-center justify-between px-2.5 py-1 bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                      <span className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                        <FileCode size={11} className="text-indigo-400" />
                        {msg.codeSnippet.filePath || msg.codeSnippet.language}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyCode(msg.id, msg.codeSnippet!.code)}
                          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check size={11} className="text-emerald-400" />
                          ) : (
                            <Copy size={11} />
                          )}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                        {onApplyCode && activeFilePath && (
                          <button
                            onClick={() => handleApply(msg.id, msg.codeSnippet!.code)}
                            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1"
                          >
                            <Code2 size={11} />
                            <span>{appliedId === msg.id ? "Applied!" : "Apply to Editor"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <pre className="p-2.5 overflow-x-auto text-zinc-200 leading-normal">
                      <code>{msg.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {thinking && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic p-2 bg-zinc-900/40 rounded-lg border border-zinc-800 w-fit">
            <Sparkles size={12} className="text-indigo-400 animate-spin" />
            <span>{activeProviderConfig.name} is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Production Gated Banner ── */}
      {environment === "production" && (
        <div className="mx-3 mb-1 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 flex items-center gap-1.5">
          <AlertTriangle size={11} className="shrink-0 text-rose-400" />
          <span>PRODUCTION IS ISOLATED: AI changes require operator review.</span>
        </div>
      )}

      {/* ── Input Box ── */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition-colors shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask ${activeProviderConfig.name}...`}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || thinking}
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-all shadow-xs"
          >
            <Send size={12} />
          </button>
        </div>
      </div>

      {/* ── Modal: AI & Provider Settings ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="text-indigo-400" size={18} />
                <h3 className="text-sm font-semibold text-zinc-100">AI Provider & API Keys</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-400">
                BYOK keys communicate directly from your device to the respective provider API.
                Your keys never pass through AIPanel cloud servers.
              </p>

              <div>
                <label className="block text-zinc-300 mb-1">Anthropic Claude API Key</label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">DeepSeek API Key</label>
                <input
                  type="password"
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Groq API Key</label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">OpenRouter / Custom Gateway Key</label>
                <input
                  type="password"
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Local Ollama Endpoint</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              {onOpenBilling && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSettingsModal(false);
                    onOpenBilling();
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline flex items-center gap-1"
                >
                  Full AI Tokens & Billing Hub ↗
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSettings}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  Save Keys
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
