import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bot,
  Send,
  Sparkles,
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
  Rocket,
  Search,
  BookOpen,
  TestTube,
  Package,
  HelpCircle,
  MessageSquare,
  Plus,
  Trash2,
  RotateCcw,
  Folder,
  Database,
  Scale,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";
import {
  checkOllamaStatus,
  collectProjectContext,
  type ProjectContextSummary,
} from "../../lib/tauri";
import { generateAIResponse } from "../../lib/ai";
import { useEditorStore } from "../../stores/editor";
import { useAISessionStore } from "../../stores/aiSession";

// ── Types ────────────────────────────────────────────────────────

export type AIProvider =
  | "aipanel"
  | "anthropic"
  | "openai"
  | "gemini"
  | "deepseek"
  | "groq"
  | "ollama"
  | "openrouter"
  | "kilocode";

export interface AIModelOption {
  id: string;
  name: string;
  badge?: string;
  contextWindow?: string;
  speed?: string;
  ratePer1M?: number;
  description?: string;
}

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  model: string;
  models: AIModelOption[];
  tier: "free" | "local" | "pro";
  badge: string;
  speed: string;
  contextWindow: string;
  isLocal: boolean;
  requiresKey: boolean;
  ratePer1M: number;
  description: string;
}

export const PROVIDERS: AIProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    model: "gemini-2.0-flash",
    tier: "free",
    badge: "FREE TIER",
    speed: "⚡ Ultra",
    contextWindow: "1M tokens",
    isLocal: false,
    requiresKey: true,
    ratePer1M: 0.0,
    description: "Official Google Free Tier — 15 RPM, 1,000,000 token context. Zero cost.",
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Default)", badge: "FREE TIER", contextWindow: "1M tokens", speed: "⚡ Ultra", description: "Flagship fast multimodal reasoning model" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", badge: "LOW LATENCY", contextWindow: "1M tokens", speed: "⚡⚡ Instant", description: "Ultra-fast low latency code completions" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", badge: "2M CONTEXT", contextWindow: "2M tokens", speed: "Normal", description: "Deep architectural reasoning with 2M token window" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", badge: "STABLE", contextWindow: "1M tokens", speed: "Fast", description: "Stable high-throughput production baseline" },
    ],
  },
  {
    id: "kilocode",
    name: "Kilo Code (Free Models)",
    model: "deepseek-r1:free",
    tier: "free",
    badge: "FREE CODING",
    speed: "⚡ Fast",
    contextWindow: "64k tokens",
    isLocal: false,
    requiresKey: false,
    ratePer1M: 0.0,
    description: "Zero-cost code assistant powered by OpenRouter / Kilo Code free tiers. No credit card required.",
    models: [
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)", badge: "FREE / $0.00", contextWindow: "64k tokens", speed: "Fast", description: "World-class chain-of-thought open reasoning" },
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", badge: "FREE / $0.00", contextWindow: "128k tokens", speed: "Fast", description: "Meta's flagship 70B parameter open weights" },
      { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Qwen 2.5 Coder 32B (Free)", badge: "FREE / $0.00", contextWindow: "32k tokens", speed: "Fast", description: "State-of-the-art open code generation specialist" },
      { id: "mistralai/mistral-small-24b-instruct-2501:free", name: "Mistral Small 24B (Free)", badge: "FREE / $0.00", contextWindow: "32k tokens", speed: "Ultra", description: "Fast European reasoning & coding model" },
    ],
  },
  {
    id: "groq",
    name: "Groq LPU",
    model: "llama-3.3-70b-versatile",
    tier: "free",
    badge: "500 T/S",
    speed: "⚡⚡ Instant",
    contextWindow: "128k tokens",
    isLocal: false,
    requiresKey: true,
    ratePer1M: 0.59,
    description: "Blazing fast inference on specialized LPU hardware with free monthly quota.",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", badge: "500 T/S", contextWindow: "128k tokens", speed: "⚡⚡ Instant", description: "500+ tokens/sec inference on Groq LPU chips" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill 70B", badge: "REASONING LPU", contextWindow: "128k tokens", speed: "⚡ Instant", description: "Distilled DeepSeek R1 reasoning on Groq LPUs" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", badge: "750 T/S", contextWindow: "128k tokens", speed: "⚡⚡ Realtime", description: "Sub-100ms ultra-low-latency code assistant" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B 32k", badge: "MOE", contextWindow: "32k tokens", speed: "Fast", description: "8x7B Mixture-of-Experts high throughput" },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local Offline)",
    model: "qwen2.5-coder:7b",
    tier: "local",
    badge: "100% PRIVATE",
    speed: "Local GPU",
    contextWindow: "32k tokens",
    isLocal: true,
    requiresKey: false,
    ratePer1M: 0.0,
    description: "Runs entirely on your machine. Zero internet required and zero code leaves device.",
    models: [
      { id: "qwen2.5-coder:7b", name: "Qwen 2.5 Coder 7B", badge: "RECOMMENDED", contextWindow: "32k tokens", speed: "Local GPU", description: "Best coding accuracy on 8GB RAM laptops" },
      { id: "qwen2.5-coder:14b", name: "Qwen 2.5 Coder 14B", badge: "16GB+ RAM", contextWindow: "32k tokens", speed: "Medium", description: "High-precision model for systems with 16GB+ RAM" },
      { id: "llama3.2:3b", name: "Llama 3.2 3B", badge: "ULTRA LIGHT", contextWindow: "128k tokens", speed: "⚡ Fast", description: "Runs on any laptop with 4GB RAM" },
      { id: "deepseek-coder-v2:16b", name: "DeepSeek Coder V2 16B", badge: "MOE CODE", contextWindow: "64k tokens", speed: "Medium", description: "236B MoE distilled coding specialist" },
      { id: "codellama:7b", name: "CodeLlama 7B", badge: "META", contextWindow: "16k tokens", speed: "Fast", description: "Meta's open-source CodeLlama baseline" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek (BYOK)",
    model: "deepseek-chat",
    tier: "pro",
    badge: "BEST VALUE",
    speed: "Fast",
    contextWindow: "64k tokens",
    isLocal: false,
    requiresKey: true,
    ratePer1M: 0.14,
    description: "State-of-the-art coding benchmark scores at raw wholesale cost ($0.14/1M).",
    models: [
      { id: "deepseek-chat", name: "DeepSeek V3 (Chat)", badge: "$0.14 / 1M", contextWindow: "64k tokens", speed: "Fast", description: "Wholesale API for the world-leading DeepSeek V3 model" },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoner)", badge: "$0.55 / 1M", contextWindow: "64k tokens", speed: "Thinking", description: "Full chain-of-thought mathematical reasoning" },
    ],
  },
  {
    id: "anthropic",
    name: "Claude (Anthropic)",
    model: "claude-3-7-sonnet",
    tier: "pro",
    badge: "CODING SOTA",
    speed: "Normal",
    contextWindow: "200k tokens",
    isLocal: false,
    requiresKey: true,
    ratePer1M: 3.0,
    description: "Gold standard for full-stack architecture, large refactors, and debugging.",
    models: [
      { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet / Thinking", badge: "CODING SOTA", contextWindow: "200k tokens", speed: "Hybrid", description: "Hybrid standard + extended thinking mode for complex architectures" },
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", badge: "PROVEN SOTA", contextWindow: "200k tokens", speed: "Fast", description: "The industry standard for clean typescript and refactors" },
      { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", badge: "LIGHTNING", contextWindow: "200k tokens", speed: "⚡ Instant", description: "Fastest Claude model for sub-agent tasks and linting" },
      { id: "claude-3-opus", name: "Claude 3 Opus", badge: "DEEP ANALYSIS", contextWindow: "200k tokens", speed: "Deep", description: "Deep reasoning across long documents and codebases" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    model: "gpt-4o",
    tier: "pro",
    badge: "PRO",
    speed: "Fast",
    contextWindow: "128k tokens",
    isLocal: false,
    requiresKey: true,
    ratePer1M: 2.5,
    description: "Multi-modal vision and general coding capability.",
    models: [
      { id: "gpt-4o", name: "OpenAI GPT-4o", badge: "FLAGSHIP", contextWindow: "128k tokens", speed: "Fast", description: "Omni multimodal model for general software tasks" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", badge: "$0.15 / 1M", contextWindow: "128k tokens", speed: "⚡ Instant", description: "Affordable fast model for everyday completions" },
      { id: "o3-mini", name: "o3-mini (Reasoning)", badge: "REASONING", contextWindow: "200k tokens", speed: "Thinking", description: "STEM, competitive programming, and algorithm design" },
      { id: "o1", name: "o1 (Deep Reasoning)", badge: "HEAVY THINK", contextWindow: "200k tokens", speed: "Deep", description: "Autonomous planning and difficult edge-case resolution" },
    ],
  },
  {
    id: "aipanel",
    name: "AIPanel Managed Cloud",
    model: "claude-3-5-sonnet",
    tier: "pro",
    badge: "MANAGED",
    speed: "Fast",
    contextWindow: "200k tokens",
    isLocal: false,
    requiresKey: false,
    ratePer1M: 3.0,
    description: "Built-in managed endpoint with zero API key configuration needed.",
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet (Managed)", badge: "MANAGED", contextWindow: "200k tokens", speed: "Fast", description: "Built-in managed endpoint with zero configuration required" },
      { id: "deepseek-r1", name: "DeepSeek R1 (Managed)", badge: "MANAGED R1", contextWindow: "64k tokens", speed: "Fast", description: "Managed high-speed DeepSeek R1 reasoning cluster" },
    ],
  },
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
  actions?: Array<{
    label: string;
    action:
      | "deploy_staging"
      | "deploy_production"
      | "open_guide"
      | "apply_code"
      | "open_tunnels"
      | "open_database"
      | "open_skills";
    icon?: string;
  }>;
  timestamp: Date;
}

function renderInlineText(text: string): React.ReactNode {
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-zinc-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300 font-mono text-[11px] border border-zinc-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

export function FormattedMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines: string[] = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        const codeText = codeBlockLines.join("\n");
        elements.push(
          <div key={`code-${idx}`} className="my-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 font-mono text-[11px] overflow-x-auto text-zinc-200">
            {codeBlockLang && <div className="text-[10px] text-zinc-500 mb-1">{codeBlockLang}</div>}
            <pre className="overflow-x-auto"><code>{codeText}</code></pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = "";
      } else {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3);
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-1" />);
      return;
    }

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${idx}`} className="font-bold text-zinc-100 text-[13px] mt-2 mb-1 flex items-center gap-1.5 text-purple-300">
          {renderInlineText(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4 key={`h4-${idx}`} className="font-semibold text-zinc-200 text-xs mt-2 mb-1">
          {renderInlineText(trimmed.slice(5))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[•\-\*]\s*/, "");
      elements.push(
        <div key={`li-${idx}`} className="flex items-start gap-1.5 my-1 ml-0.5 text-zinc-300 text-[12px] leading-relaxed">
          <span className="text-purple-400 mt-0.5 shrink-0 text-[11px]">•</span>
          <div className="flex-1">{renderInlineText(bulletText)}</div>
        </div>
      );
      return;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2 my-1 ml-0.5 text-zinc-300 text-[12px] leading-relaxed">
          <span className="font-mono text-purple-400 font-semibold text-[11px] shrink-0">{numMatch[1]}.</span>
          <div className="flex-1">{renderInlineText(numMatch[2])}</div>
        </div>
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      elements.push(
        <div key={`quote-${idx}`} className="my-2 p-2.5 rounded-lg bg-purple-950/20 border-l-2 border-purple-500 text-zinc-300 text-[11.5px] italic">
          {renderInlineText(trimmed.slice(2))}
        </div>
      );
      return;
    }

    elements.push(
      <p key={`p-${idx}`} className="my-1 text-zinc-300 text-[12px] leading-relaxed">
        {renderInlineText(line)}
      </p>
    );
  });

  return <div className="space-y-0.5">{elements}</div>;
}

interface AIPanelProps {
  environment: Environment;
  projectName?: string;
  projectPath?: string;
  activeFilePath?: string;
  onApplyCode?: (code: string, suggestedPath?: string) => void;
  onOpenBilling?: () => void;
  onOpenFreeAI?: () => void;
  onOpenGuideModal?: () => void;
  onDeployClick?: (targetEnv?: Environment) => void;
  onOpenTunnels?: () => void;
  onOpenDatabase?: () => void;
  onOpenSkills?: () => void;
}

export default function AIPanel({
  environment,
  projectName: _projectName = "aipanel",
  projectPath,
  activeFilePath,
  onApplyCode,
  onOpenBilling,
  onOpenFreeAI,
  onOpenGuideModal,
  onDeployClick,
  onOpenTunnels,
  onOpenDatabase,
  onOpenSkills,
}: AIPanelProps) {
  // Provider state
  const [provider, setProvider] = useState<AIProvider>(() => {
    return (localStorage.getItem("aipanel_ai_provider") as AIProvider) || "gemini";
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem("aipanel_ai_model") || "gemini-2.0-flash";
  });
  const [customOllamaInput, setCustomOllamaInput] = useState("");
  const [modalFilter, setModalFilter] = useState<"all" | "free" | "local" | "groq" | "pro">("all");
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Auto-Save & Auto-Apply AI settings
  const autoApplyAI = useEditorStore((s) => s.autoApplyAI);
  const setAutoApplyAI = useEditorStore((s) => s.setAutoApplyAI);
  const autoSave = useEditorStore((s) => s.autoSave);

  // API keys
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem("aipanel_key_anthropic") || "");
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem("aipanel_key_openai") || "");
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("aipanel_key_gemini") || "");
  const [deepseekKey, setDeepseekKey] = useState(() => localStorage.getItem("aipanel_key_deepseek") || "");
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("aipanel_key_groq") || "");
  const [openrouterKey, setOpenrouterKey] = useState(() => localStorage.getItem("aipanel_key_openrouter") || "");
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem("aipanel_ollama_url") || "http://localhost:11434");
  const [ollamaOnline, setOllamaOnline] = useState(false);

  // ── Project-Isolated AI Session Store ──────────────────────────
  const {
    sessions,
    activeSessionId,
    initProjectSessions,
    createSession,
    switchSession,
    deleteSession,
    renameSession,
    addMessage,
    updateTokens,
    clearActiveMessages,
    getActiveSession,
  } = useAISessionStore();

  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");

  // Initialize or synchronize project-based sessions
  useEffect(() => {
    initProjectSessions(_projectName, projectPath);
  }, [_projectName, projectPath, initProjectSessions]);

  const activeSession = getActiveSession();
  const messages = activeSession?.messages || [];
  const tokensUsed = activeSession?.tokensUsed ?? 0;

  // Context & Chat state
  const [context, setContext] = useState<ProjectContextSummary | null>(null);
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

  // Save provider and model selection
  const handleSelectProvider = (p: AIProvider, m?: string) => {
    setProvider(p);
    const pConf = PROVIDERS.find((item) => item.id === p) || PROVIDERS[0];
    const targetModel = m || pConf.models[0]?.id || pConf.model;
    setSelectedModel(targetModel);
    localStorage.setItem("aipanel_ai_provider", p);
    localStorage.setItem("aipanel_ai_model", targetModel);
    setShowProviderModal(false);
  };

  const handleSelectModel = (m: string) => {
    setSelectedModel(m);
    localStorage.setItem("aipanel_ai_model", m);
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

  const handleApply = (id: string, code: string, filePath?: string) => {
    if (onApplyCode) {
      onApplyCode(code, filePath);
      setAppliedId(id);
      setTimeout(() => setAppliedId(null), 2500);
    }
  };

  // Generate intelligent context-aware responses with interactive actions
  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || input).trim();
    if (!query) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    addMessage(userMsg);
    setInput("");
    setThinking(true);

    const fw = context?.framework || context?.runtime || "Vite + React 19";
    const br = context?.branch || "main";

    // Read active file content from editor store
    const { tabs, activeTab } = useEditorStore.getState();
    const currentTab = tabs.find((t) => t.path === (activeFilePath || activeTab));
    const activeFileContent = currentTab?.content || "";

    try {
      const response = await generateAIResponse({
        provider,
        model: selectedModel,
        prompt: query,
        projectContext: {
          name: _projectName,
          path: projectPath,
          framework: fw,
          activeFile: activeFilePath || activeTab || "package.json",
          activeFileContent: activeFileContent,
          gitBranch: br,
          modifiedFiles: context?.modified_files,
        },
        keys: {
          gemini: geminiKey,
          openrouter: openrouterKey,
          deepseek: deepseekKey,
          groq: groqKey,
          ollamaUrl: ollamaUrl,
          anthropic: anthropicKey,
          openai: openaiKey,
        },
      });

      const assistantMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response.content,
        codeSnippet: response.codeSnippet,
        actions: response.actions,
        timestamp: new Date(),
      };

      const estimatedTokens = Math.round((query.length + response.content.length) / 3.6);
      updateTokens(estimatedTokens);
      addMessage(assistantMsg);

      // ── Autonomous Auto-Apply (Gemini & Cursor style) ──
      if (response.codeSnippet?.code && autoApplyAI && onApplyCode) {
        onApplyCode(response.codeSnippet.code, response.codeSnippet.filePath);
        setAppliedId(assistantMsg.id);
      }
    } catch (err: any) {
      const fallbackMsg: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `### ⚠️ AI Processing Notice\n\n${err?.message || "Could not complete request with selected provider."}\n\nClick below to verify project status or view the guide.`,
        actions: [
          { label: "🚀 Pre-Flight Build Check", action: "deploy_staging" },
          { label: "📖 Open Guide Modal", action: "open_guide" },
        ],
        timestamp: new Date(),
      };
      addMessage(fallbackMsg);
    } finally {
      setThinking(false);
    }
  };

  const handleActionClick = (action: string, code?: string) => {
    if (action === "deploy_staging") {
      onDeployClick?.("staging");
    } else if (action === "deploy_production") {
      onDeployClick?.("production");
    } else if (action === "open_guide") {
      onOpenGuideModal?.();
    } else if (action === "open_tunnels") {
      onOpenTunnels?.();
    } else if (action === "open_database") {
      onOpenDatabase?.();
    } else if (action === "open_skills") {
      onOpenSkills?.();
    } else if (action === "apply_code" && code && onApplyCode) {
      onApplyCode(code);
    }
  };

  const activeProviderConfig = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  return (
    <div className="h-full flex flex-col bg-zinc-950 border-l border-zinc-800 text-zinc-100 select-none font-sans">
      {/* ── Top Header with Model Switcher Button ── */}
      <div className="p-2.5 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Main Model Switcher Button & Dropdown */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <button
              onClick={() => setShowProviderModal(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-750 hover:border-purple-500/60 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-850 group cursor-pointer shadow-xs max-w-[170px] truncate"
              title="Click to Open Full Model Selection Modal"
            >
              {activeProviderConfig.isLocal ? (
                <div className="relative">
                  <Cpu size={12} />
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
                      ollamaOnline ? "bg-emerald-400" : "bg-zinc-600"
                    }`}
                    title={ollamaOnline ? "Ollama Online (:11434)" : "Ollama Offline"}
                  />
                </div>
              ) : (
                <Bot size={12} />
              )}
              <div className="text-left truncate flex-1">
                <div className="font-semibold text-zinc-100 text-[11px] truncate flex items-center gap-1.5">
                  <span>{activeProviderConfig.name}</span>
                </div>
                <div className="text-[9.5px] font-mono text-purple-300 truncate font-semibold">
                  {selectedModel}
                </div>
              </div>
              <ChevronDown size={12} className="text-zinc-500 group-hover:text-zinc-300 shrink-0" />
            </button>

            {/* Quick Model Selector Dropdown for Current Provider */}
            {activeProviderConfig.models.length > 0 && (
              <select
                value={selectedModel}
                onChange={(e) => handleSelectModel(e.target.value)}
                className="bg-zinc-900 border border-zinc-750 hover:border-purple-500/50 rounded-lg px-2 py-1.5 text-[10.5px] font-mono text-purple-200 outline-none cursor-pointer max-w-[140px] truncate shrink-0"
                title="Switch specific model for active provider"
              >
                {activeProviderConfig.models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-200 font-sans">
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenBilling && (
              <button
                onClick={onOpenBilling}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-[10px] font-mono text-zinc-300 transition-colors cursor-pointer"
                title="AI Session Tokens & Billing Cockpit"
              >
                <span>{(tokensUsed / 1000).toFixed(1)}k</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400 font-semibold">
                  ${((tokensUsed / 1000000) * activeProviderConfig.ratePer1M).toFixed(3)}
                </span>
              </button>
            )}

            {onOpenFreeAI && (
              <button
                onClick={onOpenFreeAI}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-[10.5px] font-semibold text-emerald-400 transition-colors cursor-pointer"
                title="Free AI Models & Kilo Code Setup"
              >
                <Sparkles size={11} />
                <span>Free AI</span>
              </button>
            )}

            {onOpenGuideModal && (
              <button
                onClick={onOpenGuideModal}
                className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors"
                title="AIPanel Developer Guide & Manual"
              >
                <HelpCircle size={14} />
              </button>
            )}

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="API Keys & Local Ollama Config"
            >
              <Settings size={14} />
            </button>
          </div>
        </div>

        {/* ── Quick 1-Click Model Switcher Pill Carousel ── */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-0.5">
          {[
            { id: "gemini", model: "gemini-2.0-flash", label: "⚡ Gemini 2.0 Flash" },
            { id: "kilocode", model: "deepseek/deepseek-r1:free", label: "🧠 DeepSeek R1 (Free)" },
            { id: "kilocode", model: "meta-llama/llama-3.3-70b-instruct:free", label: "🌟 Llama 3.3 70B (Free)" },
            { id: "ollama", model: "qwen2.5-coder:7b", label: "🏠 Qwen 2.5 Coder (Local)" },
            { id: "groq", model: "llama-3.3-70b-versatile", label: "🚀 Groq 70B (500 T/S)" },
            { id: "anthropic", model: "claude-3-7-sonnet", label: "👑 Claude 3.7 Sonnet" },
            { id: "openai", model: "gpt-4o-mini", label: "✨ GPT-4o Mini" },
          ].map((m) => {
            const isSelected = provider === m.id && selectedModel === m.model;
            return (
              <button
                key={`${m.id}-${m.model}`}
                onClick={() => handleSelectProvider(m.id as AIProvider, m.model)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-purple-600/30 text-purple-200 border-purple-500/60 font-semibold shadow-xs"
                    : "bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Project-Based AI Sessions Bar ── */}
      <div className="px-3 py-1.5 bg-zinc-950/90 border-b border-zinc-800/80 flex items-center justify-between gap-2 text-xs shrink-0">
        {/* Project & Active Session Selector */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-purple-300 bg-purple-950/30 border border-purple-800/40 px-1.5 py-0.5 rounded shrink-0">
            <Folder size={10} className="text-purple-400" />
            <span className="truncate max-w-[80px]" title={`Project: ${_projectName}`}>
              {_projectName}
            </span>
          </div>

          {/* Session Dropdown Trigger */}
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setShowSessionMenu(!showSessionMenu)}
              className="w-full flex items-center justify-between gap-1 px-2 py-1 rounded bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-750 hover:border-purple-500/50 text-[11px] text-zinc-200 transition-colors cursor-pointer truncate shadow-xs"
              title="Switch AI Session / Thread"
            >
              <div className="flex items-center gap-1.5 truncate">
                <MessageSquare size={11} className="text-purple-400 shrink-0" />
                <span className="truncate font-medium text-zinc-200">
                  {activeSession?.title || "Session 1"}
                </span>
                <span className="text-[9.5px] font-mono text-zinc-500 shrink-0">
                  ({messages.length})
                </span>
              </div>
              <ChevronDown size={11} className="text-zinc-500 shrink-0" />
            </button>

            {/* Session Menu Popover */}
            {showSessionMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => {
                    setShowSessionMenu(false);
                    setEditingSessionId(null);
                  }}
                />
                <div className="absolute left-0 top-full mt-1.5 w-80 bg-zinc-900 border border-zinc-750 rounded-xl shadow-2xl shadow-black/80 p-2.5 z-50 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Folder size={12} className="text-purple-400" />
                      <span className="font-semibold text-zinc-200">
                        {_projectName} AI Sessions
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        createSession();
                        setShowSessionMenu(false);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-[10.5px] transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus size={11} />
                      New Thread
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
                    {sessions.map((sess) => {
                      const isActive = sess.id === activeSessionId;
                      const isEditing = editingSessionId === sess.id;

                      if (isEditing) {
                        return (
                          <div
                            key={sess.id}
                            className="p-1.5 rounded-lg bg-zinc-800/90 border border-purple-500/50 flex items-center gap-1.5"
                          >
                            <input
                              type="text"
                              value={editTitleInput}
                              onChange={(e) => setEditTitleInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  renameSession(sess.id, editTitleInput);
                                  setEditingSessionId(null);
                                } else if (e.key === "Escape") {
                                  setEditingSessionId(null);
                                }
                              }}
                              autoFocus
                              className="bg-zinc-900 text-zinc-100 text-xs px-2 py-1 rounded border border-zinc-700 flex-1 outline-none"
                            />
                            <button
                              onClick={() => {
                                renameSession(sess.id, editTitleInput);
                                setEditingSessionId(null);
                              }}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[10px] font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSessionId(null)}
                              className="px-1.5 py-1 text-zinc-400 hover:text-zinc-200 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={sess.id}
                          onClick={() => {
                            switchSession(sess.id);
                            setShowSessionMenu(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-[11.5px] group ${
                            isActive
                              ? "bg-purple-600/20 border border-purple-500/40 text-purple-100"
                              : "hover:bg-zinc-800/70 text-zinc-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate flex-1 min-w-0 pr-1.5">
                            <MessageSquare
                              size={12}
                              className={isActive ? "text-purple-400 shrink-0" : "text-zinc-500 shrink-0"}
                            />
                            <div className="truncate">
                              <div className="font-medium truncate">{sess.title}</div>
                              <div className="text-[9.5px] font-mono text-zinc-500 flex items-center gap-1.5">
                                <span>{sess.messages.length} msgs</span>
                                <span>•</span>
                                <span>{(sess.tokensUsed / 1000).toFixed(1)}k tokens</span>
                                <span>•</span>
                                <span>{new Date(sess.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSessionId(sess.id);
                                setEditTitleInput(sess.title);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/60 transition-colors"
                              title="Rename Thread"
                            >
                              <Code2 size={11} />
                            </button>
                            {sessions.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSession(sess.id);
                                }}
                                className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-700/60 transition-colors"
                                title="Delete Thread"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-mono">Auto-saved to {_projectName}</span>
                    <button
                      onClick={() => {
                        clearActiveMessages();
                        setShowSessionMenu(false);
                      }}
                      className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      Clear current chat
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick New Session and Clear Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => createSession()}
            className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 hover:border-purple-500/50 text-zinc-300 hover:text-white text-[10.5px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            title="Create New Project AI Thread"
          >
            <Plus size={11} className="text-purple-400" />
            <span>New Thread</span>
          </button>
          <button
            onClick={clearActiveMessages}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-400 hover:text-amber-400 text-[10px] cursor-pointer transition-colors shadow-xs"
            title="Clear Messages in Current Session"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {/* ── Context & Auto-Apply Bar ── */}
      <div className="px-3 py-1.5 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="flex items-center gap-1 text-zinc-300">
            <Layers size={11} className="text-indigo-400" />
            {context?.framework || context?.runtime || "Vite + React"}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1 text-zinc-400">
            <GitBranch size={11} />
            {context?.branch || "main"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoApplyAI(!autoApplyAI)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer border ${
              autoApplyAI
                ? "bg-purple-950/70 border-purple-600/50 text-purple-300 hover:bg-purple-900/60"
                : "bg-zinc-850 border-zinc-700/60 text-zinc-400 hover:text-zinc-200"
            }`}
            title="When ON: AI code generations are automatically applied and saved to disk without requiring manual confirmation"
          >
            <span>⚡ Auto-Apply:</span>
            <span className={autoApplyAI ? "text-purple-300 font-bold" : "text-zinc-500"}>
              {autoApplyAI ? "ON" : "OFF"}
            </span>
          </button>
          <button
            onClick={refreshContext}
            className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            title="Refresh Project Context"
          >
            <RefreshCw size={10} />
          </button>
        </div>
      </div>

      {/* ── Messages Stream ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-2 py-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">AIPanel AI Assistant</h3>
              <p className="text-[11px] text-zinc-400 pt-0.5 max-w-xs">
                Active: <span className="text-purple-300 font-semibold">{activeProviderConfig.name}</span> ({activeProviderConfig.badge})
              </p>
            </div>

            {/* Quick Action Chips */}
            <div className="w-full space-y-2 pt-2 text-left">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-1">
                Developer Power Actions
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    icon: Sparkles,
                    color: "text-purple-400",
                    title: "🧠 Project Suggestion & Skills Advisor",
                    prompt: "Analyze this project: identify missing layers, recommend the best agent skills, compare budget ($0 free) vs enterprise grade stack, and auto create database schema to deploy.",
                  },
                  {
                    icon: Database,
                    color: "text-cyan-400",
                    title: "🗄️ Auto-Create Database Schema & Deploy",
                    prompt: "Auto-create database schema with tables, foreign keys, indexes, and initial migrations for this project to deploy.",
                  },
                  {
                    icon: Sparkles,
                    color: "text-purple-400",
                    title: "📋 /plan — Strategic 5-Phase Plan",
                    prompt: "/blueprint:plan",
                  },
                  {
                    icon: RefreshCw,
                    color: "text-amber-400",
                    title: "🧹 /simplify — Anti-Overengineering Audit",
                    prompt: "/blueprint:simplify",
                  },
                  {
                    icon: Cpu,
                    color: "text-emerald-400",
                    title: "🔄 /loop — Autonomous Ralph Loop Spec",
                    prompt: "/blueprint:loop",
                  },
                  {
                    icon: Check,
                    color: "text-blue-400",
                    title: "🔍 /review — 5-Agent Review Council",
                    prompt: "/blueprint:review",
                  },
                  {
                    icon: Scale,
                    color: "text-emerald-400",
                    title: "⚖️ Budget vs Enterprise Tech Advisor",
                    prompt: "Compare technology stacks for this project: low-cost / zero-dollar budget stack vs enterprise-grade scalable stack, with cost estimates and trade-offs.",
                  },
                  {
                    icon: Rocket,
                    color: "text-sky-400",
                    title: "🚀 Auto-Build & Deploy Project",
                    prompt: "Run auto-build verification and prepare deployment to staging or production.",
                  },
                  {
                    icon: Search,
                    color: "text-amber-400",
                    title: "🔍 What To Change (Code Advisor)",
                    prompt: "Inspect active file and project architecture, then tell me what to improve and change.",
                  },
                  {
                    icon: BookOpen,
                    color: "text-indigo-400",
                    title: "📖 How To Use AIPanel (Interactive Guide)",
                    prompt: "Explain how to use this panel, how auto-deploy works, and how to connect custom domains.",
                  },
                  {
                    icon: TestTube,
                    color: "text-emerald-400",
                    title: "🧪 Generate Automated Test Suite",
                    prompt: "Generate an automated unit test suite for the active project components.",
                  },
                  {
                    icon: Package,
                    color: "text-purple-400",
                    title: "📦 Prepare cPanel & Hosting ZIP Export",
                    prompt: "Show how to export a clean production ZIP with database SQL dump for cPanel.",
                  },
                ].map((chip) => {
                  const ChipIcon = chip.icon;
                  return (
                    <button
                      key={chip.title}
                      onClick={() => handleSend(chip.prompt)}
                      className="w-full text-left p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/40 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ChipIcon size={14} className={`${chip.color} shrink-0`} />
                        <span className="text-xs font-medium truncate">{chip.title}</span>
                      </div>
                      <ArrowRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 shrink-0 ml-1"
                      />
                    </button>
                  );
                })}
              </div>
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
                className={`max-w-[94%] rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed shadow-xs ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none"
                }`}
              >
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <FormattedMessage content={msg.content} />
                )}

                {/* Attached Interactive Actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                    {msg.actions.map((act) => (
                      <button
                        key={act.label}
                        onClick={() => handleActionClick(act.action, msg.codeSnippet?.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Attached Code Snippet */}
                {msg.codeSnippet && (
                  <div className="mt-2.5 rounded-lg border border-zinc-750 bg-zinc-950 overflow-hidden font-mono text-[11px]">
                    <div className="flex items-center justify-between px-2.5 py-1 bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                      <span className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                        <FileCode size={11} className="text-purple-400" />
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
                        {onApplyCode && (
                          <button
                            onClick={() => handleApply(msg.id, msg.codeSnippet!.code, msg.codeSnippet?.filePath)}
                            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1 cursor-pointer"
                          >
                            <Code2 size={11} />
                            <span>
                              {appliedId === msg.id
                                ? autoSave
                                  ? "✓ Auto-Applied & Saved!"
                                  : "✓ Applied!"
                                : "Apply to Editor"}
                            </span>
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
            <Sparkles size={12} className="text-purple-400 animate-spin" />
            <span>{activeProviderConfig.name} is generating suggestions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Chat Input ── */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-900/40 shrink-0 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono px-1">
          <span className="flex items-center gap-1">
            <span>Model:</span>
            <strong className="text-purple-400">{activeProviderConfig.name}</strong>
          </span>
          <button
            onClick={() => setShowProviderModal(true)}
            className="text-zinc-400 hover:text-purple-300 underline cursor-pointer"
          >
            Switch Model ▾
          </button>
        </div>

        {/* ── Agent Blueprint Slash-Commands Quick Bar ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-mono">
          <button
            onClick={() => handleSend("/blueprint:plan")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-750 text-purple-300 hover:text-purple-100 border border-zinc-700/60 shrink-0 transition-colors cursor-pointer"
            title="5-Phase Discuss-Plan-Execute-Verify-Ship delivery cadence"
          >
            <span>📋</span>
            <span>/plan</span>
          </button>
          <button
            onClick={() => handleSend("/blueprint:simplify")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-750 text-amber-300 hover:text-amber-100 border border-zinc-700/60 shrink-0 transition-colors cursor-pointer"
            title="Anti-Overengineering & 6 Anti-Bloat Laws audit"
          >
            <span>🧹</span>
            <span>/simplify</span>
          </button>
          <button
            onClick={() => handleSend("/blueprint:loop")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-750 text-emerald-300 hover:text-emerald-100 border border-zinc-700/60 shrink-0 transition-colors cursor-pointer"
            title="Autonomous Ralph Loop execution spec"
          >
            <span>🔄</span>
            <span>/loop</span>
          </button>
          <button
            onClick={() => handleSend("/blueprint:review")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-750 text-blue-300 hover:text-blue-100 border border-zinc-700/60 shrink-0 transition-colors cursor-pointer"
            title="5-Agent Review: Quality, Impl, Test, Simplify, Docs"
          >
            <span>🔍</span>
            <span>/review</span>
          </button>
          <button
            onClick={() => handleSend("/blueprint:doctor")}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-750 text-teal-300 hover:text-teal-100 border border-zinc-700/60 shrink-0 transition-colors cursor-pointer"
            title="7-point workspace conformance health check"
          >
            <span>🩺</span>
            <span>/doctor</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-750 rounded-xl px-3 py-1.5 focus-within:border-purple-500 transition-colors shadow-inner">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={`Ask ${activeProviderConfig.name} or /plan, /simplify, /loop, /review, /doctor...`}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || thinking}
            className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:pointer-events-none text-white transition-all shadow-xs cursor-pointer"
          >
            <Send size={12} />
          </button>
        </div>
      </div>

      {/* ── Dedicated AI Model Switcher Modal ── */}
      {showProviderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl p-5 space-y-3.5 animate-fade-in max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-400" />
                  Select AI Code Model & Provider
                </h3>
                <p className="text-xs text-zinc-400">
                  Select your provider and choose the exact model for code generation and architecture analysis.
                </p>
              </div>
              <button
                onClick={() => setShowProviderModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {[
                { id: "all", label: "All Providers (8)" },
                { id: "free", label: "⚡ 100% Free Tiers" },
                { id: "local", label: "🏠 Local Offline (Ollama)" },
                { id: "groq", label: "🚀 Groq 500 T/S" },
                { id: "pro", label: "👑 Pro SOTA (Claude/OpenAI/DeepSeek)" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setModalFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    modalFilter === f.id
                      ? "bg-purple-600 text-white shadow-xs font-semibold"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Provider and Model Cards Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {PROVIDERS.filter((p) => {
                if (modalFilter === "free") return p.tier === "free";
                if (modalFilter === "local") return p.tier === "local";
                if (modalFilter === "groq") return p.id === "groq";
                if (modalFilter === "pro") return p.tier === "pro";
                return true;
              }).map((p) => {
                const isCurrentProvider = provider === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentProvider
                        ? "bg-purple-950/20 border-purple-500 shadow-md shadow-purple-950/30"
                        : "bg-zinc-900/50 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    {/* Provider Top Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-zinc-100">{p.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              p.tier === "free"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : p.tier === "local"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                            }`}
                          >
                            {p.badge}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {p.contextWindow} • {p.speed}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-mono text-xs font-semibold text-emerald-400">
                          {p.ratePer1M === 0 ? "Free / $0.00" : `$${p.ratePer1M.toFixed(2)}/1M`}
                        </span>
                        {isCurrentProvider && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold">
                            Active Provider
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Interactive Model Selection Grid */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/80">
                      <div className="text-[11px] font-medium text-zinc-400 mb-2 flex items-center justify-between">
                        <span className="text-zinc-300 font-semibold flex items-center gap-1">
                          <span>Select Model:</span>
                          <span className="text-zinc-500 text-[10.5px]">({p.models.length} options)</span>
                        </span>
                        {isCurrentProvider && (
                          <span className="text-[10.5px] font-mono text-purple-300">
                            Current Model: <strong className="text-purple-200">{selectedModel}</strong>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {p.models.map((m) => {
                          const isModelActive = isCurrentProvider && selectedModel === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => handleSelectProvider(p.id, m.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                                isModelActive
                                  ? "bg-purple-600/25 border-purple-500 text-white shadow-xs ring-1 ring-purple-500/60"
                                  : "bg-zinc-950/80 border-zinc-800/90 text-zinc-300 hover:border-purple-500/50 hover:bg-zinc-900"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 w-full">
                                <span className="font-semibold text-xs text-zinc-100 truncate group-hover:text-purple-300 transition-colors">
                                  {m.name}
                                </span>
                                {m.badge && (
                                  <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                                    isModelActive
                                      ? "bg-purple-500/30 border-purple-400 text-purple-200"
                                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                                  }`}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1.5 text-[10px] text-zinc-400 font-mono">
                                <span>{m.contextWindow}</span>
                                <span className={isModelActive ? "text-purple-300 font-semibold" : "text-zinc-500"}>
                                  {isModelActive ? "✓ Active" : m.speed}
                                </span>
                              </div>
                              {m.description && (
                                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1 leading-normal">
                                  {m.description}
                                </p>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Model input for Ollama */}
                      {p.id === "ollama" && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type custom local Ollama tag (e.g. mistral, codellama:13b)..."
                            value={customOllamaInput}
                            onChange={(e) => setCustomOllamaInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && customOllamaInput.trim()) {
                                handleSelectProvider("ollama", customOllamaInput.trim());
                                setCustomOllamaInput("");
                              }
                            }}
                            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-lg px-2.5 py-1 text-xs text-zinc-200 outline-none font-mono placeholder:text-zinc-600"
                          />
                          <button
                            onClick={() => {
                              if (customOllamaInput.trim()) {
                                handleSelectProvider("ollama", customOllamaInput.trim());
                                setCustomOllamaInput("");
                              }
                            }}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer shrink-0 transition-colors"
                          >
                            Set Custom Model
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setShowProviderModal(false);
                  setShowSettingsModal(true);
                }}
                className="text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Settings size={12} />
                Configure API Keys & Endpoints
              </button>
              <button
                onClick={() => setShowProviderModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: AI & Provider Settings ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="text-purple-400" size={18} />
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
                <label className="block text-zinc-300 mb-1">Google Gemini API Key (Free Tier)</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (Get free at aistudio.google.com)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">OpenRouter / Kilo Code Key</label>
                <input
                  type="password"
                  value={openrouterKey}
                  onChange={(e) => setOpenrouterKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">DeepSeek API Key</label>
                <input
                  type="password"
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">OpenAI API Key (BYOK)</label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Groq LPU API Key (BYOK)</label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Anthropic Claude API Key</label>
                <input
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Local Ollama Endpoint</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-purple-500"
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
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer underline flex items-center gap-1"
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
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md cursor-pointer"
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
