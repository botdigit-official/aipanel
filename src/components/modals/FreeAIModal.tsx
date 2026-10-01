import { useState } from "react";
import {
  Sparkles,
  X,
  ExternalLink,
  Check,
  Cpu,
  Zap,
  Globe,
  Key,
  ShieldCheck,
  Terminal,
  Code2,
} from "lucide-react";

interface FreeAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoogleKey?: (key: string) => void;
  onSelectProvider?: (providerId: string) => void;
}

export default function FreeAIModal({
  isOpen,
  onClose,
  onSaveGoogleKey,
  onSelectProvider,
}: FreeAIModalProps) {
  const [activeTab, setActiveTab] = useState<"google" | "kilocode" | "ollama">("google");
  const [googleKey, setGoogleKey] = useState(
    () => localStorage.getItem("aipanel_key_gemini") || ""
  );
  const [kiloKey, setKiloKey] = useState(
    () => localStorage.getItem("aipanel_key_openrouter") || ""
  );
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("aipanel_key_gemini", googleKey.trim());
    onSaveGoogleKey?.(googleKey.trim());
    setSavedSuccess("google");
    setTimeout(() => {
      setSavedSuccess(null);
      onSelectProvider?.("gemini");
      onClose();
    }, 1200);
  };

  const handleSaveKilo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("aipanel_key_openrouter", kiloKey.trim());
    setSavedSuccess("kilocode");
    setTimeout(() => {
      setSavedSuccess(null);
      onSelectProvider?.("openrouter");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0f111a] border border-[#23293d] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f2438] flex items-center justify-between bg-[#141724]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 font-sans">
                Free AI Models & Kilo Code Setup
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                Get zero-cost AI coding capabilities: Google Gemini Free Tier, Kilo Code, and Local Ollama
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-[#1f2438] bg-[#11131e] px-4 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("google")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer font-sans ${
              activeTab === "google"
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe size={13} />
            <span>Google Gemini Free API</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              100% Free
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kilocode")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer font-sans ${
              activeTab === "kilocode"
                ? "border-indigo-400 text-indigo-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 size={13} />
            <span>Kilo Code & OpenRouter</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-mono">
              Free Tier
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ollama")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer font-sans ${
              activeTab === "ollama"
                ? "border-purple-400 text-purple-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu size={13} />
            <span>Local Ollama</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 font-mono">
              Offline
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* ── TAB 1: Google Gemini Free API ── */}
          {activeTab === "google" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-zinc-300 font-sans">
                  <span className="font-semibold text-emerald-400">Google AI Studio Free Tier Quotas:</span>
                  <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-[#0b0d14] border border-emerald-500/20 text-center">
                      <div className="text-emerald-400 font-bold">15 RPM</div>
                      <div className="text-zinc-500 text-[10px]">Requests/min</div>
                    </div>
                    <div className="p-2 rounded bg-[#0b0d14] border border-emerald-500/20 text-center">
                      <div className="text-emerald-400 font-bold">1M TPM</div>
                      <div className="text-zinc-500 text-[10px]">Tokens/min</div>
                    </div>
                    <div className="p-2 rounded bg-[#0b0d14] border border-emerald-500/20 text-center">
                      <div className="text-emerald-400 font-bold">1,500 RPD</div>
                      <div className="text-zinc-500 text-[10px]">Requests/day</div>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400">
                    No credit card required. Anyone with a personal Google account can generate an API key in 5 seconds.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-xs font-sans text-zinc-300">
                <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>How to activate your Free Google Gemini API:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 text-[11.5px] leading-relaxed">
                  <li>
                    Visit{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 underline hover:text-emerald-300 inline-flex items-center gap-0.5"
                    >
                      aistudio.google.com/app/apikey <ExternalLink size={10} />
                    </a>
                  </li>
                  <li>Click <strong>"Sign in with Google"</strong> using your regular Google Account.</li>
                  <li>Click <strong>"Create API key"</strong> in Google AI Studio.</li>
                  <li>Copy and paste your key below to immediately enable AI coding in AIPanel:</li>
                </ol>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSaveGoogle} className="space-y-3 pt-2">
                <div className="flex items-center gap-2 bg-[#0a0c13] border border-[#23293d] rounded-xl px-3 py-2">
                  <Key size={14} className="text-emerald-400 shrink-0" />
                  <input
                    type="password"
                    value={googleKey}
                    onChange={(e) => setGoogleKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-transparent text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-sans"
                  >
                    <span>Get Free Google API Key</span>
                    <ExternalLink size={11} />
                  </a>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950 font-sans"
                  >
                    {savedSuccess === "google" ? (
                      <>
                        <Check size={13} className="text-white" />
                        <span>Connected!</span>
                      </>
                    ) : (
                      <span>Save & Activate Gemini</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB 2: Kilo Code & Free Models ── */}
          {activeTab === "kilocode" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3">
                <Code2 size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-zinc-300 font-sans">
                  <span className="font-semibold text-indigo-400">What is Kilo Code?</span>
                  <p className="mt-1 text-[11.5px] text-zinc-300">
                    Kilo Code (<strong>kilo.ai</strong>) is an open-source AI coding agent (similar to Roo Code & Cline) that gives developers zero-markup access to 500+ models with specialized Architect, Coder, and Debugger workflows.
                  </p>
                </div>
              </div>

              {/* Free OpenRouter Models in Kilo Code */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-200 font-sans">
                  Free Tier Models Supported:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#0e1019] border border-[#23293d] flex items-center justify-between">
                    <span className="text-zinc-300">DeepSeek R1 Free</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">$0.00</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0e1019] border border-[#23293d] flex items-center justify-between">
                    <span className="text-zinc-300">Gemini 2.0 Flash Exp</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">$0.00</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0e1019] border border-[#23293d] flex items-center justify-between">
                    <span className="text-zinc-300">Llama 3.3 70B Free</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">$0.00</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0e1019] border border-[#23293d] flex items-center justify-between">
                    <span className="text-zinc-300">Qwen 2.5 Coder 32B</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">$0.00</span>
                  </div>
                </div>
              </div>

              {/* How to use in VS Code */}
              <div className="p-3.5 rounded-xl bg-[#0e1019] border border-[#23293d] space-y-2">
                <div className="text-xs font-semibold text-zinc-200 font-sans flex items-center gap-1.5">
                  <Terminal size={13} className="text-indigo-400" />
                  <span>Install Kilo Code Extension in VS Code:</span>
                </div>
                <div className="p-2 rounded bg-black/50 font-mono text-[11px] text-zinc-300 select-all border border-zinc-800">
                  code --install-extension KiloCode.kilo-code
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Once installed, open this workspace (<code>/Volumes/Mac2TB/Botdigit/Developer/Projects/aipanel</code>) in VS Code to pair program with Kilo Code.
                </p>
              </div>

              {/* OpenRouter Key for AIPanel */}
              <form onSubmit={handleSaveKilo} className="space-y-3 pt-1">
                <div className="text-xs font-medium text-zinc-300 font-sans">
                  Or enter your OpenRouter / Kilo API Key to use in AIPanel:
                </div>
                <div className="flex items-center gap-2 bg-[#0a0c13] border border-[#23293d] rounded-xl px-3 py-2">
                  <Key size={14} className="text-indigo-400 shrink-0" />
                  <input
                    type="password"
                    value={kiloKey}
                    onChange={(e) => setKiloKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-transparent text-xs text-zinc-200 outline-none font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-sans"
                  >
                    <span>Get Free OpenRouter Key</span>
                    <ExternalLink size={11} />
                  </a>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-950 font-sans"
                  >
                    {savedSuccess === "kilocode" ? (
                      <>
                        <Check size={13} className="text-white" />
                        <span>Connected!</span>
                      </>
                    ) : (
                      <span>Save & Activate</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB 3: Local Ollama (100% Free Offline) ── */}
          {activeTab === "ollama" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-3">
                <Zap size={20} className="text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-zinc-300 font-sans">
                  <span className="font-semibold text-purple-400">100% Free & Offline (Apple Silicon GPU):</span>
                  <p className="mt-1 text-[11.5px] text-zinc-300">
                    Run leading open-weight coding models directly on your Mac without internet connection, API keys, or costs.
                  </p>
                </div>
              </div>

              {/* Recommended models */}
              <div className="space-y-2 text-xs font-sans text-zinc-300">
                <div className="font-semibold text-zinc-100">Recommended Coding Models:</div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[#0e1019] border border-[#23293d]">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-purple-300 font-semibold">qwen2.5-coder:7b</span>
                      <span className="text-[10px] text-zinc-400">4.7 GB • Fast</span>
                    </div>
                    <div className="p-1.5 mt-2 bg-black/60 rounded font-mono text-[10.5px] text-zinc-300 select-all border border-zinc-800">
                      ollama run qwen2.5-coder:7b
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e1019] border border-[#23293d]">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-purple-300 font-semibold">deepseek-r1:8b</span>
                      <span className="text-[10px] text-zinc-400">4.9 GB • Reasoning</span>
                    </div>
                    <div className="p-1.5 mt-2 bg-black/60 rounded font-mono text-[10.5px] text-zinc-300 select-all border border-zinc-800">
                      ollama run deepseek-r1:8b
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1019] border border-[#23293d] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-200 font-sans">Default Ollama Endpoint</div>
                  <div className="text-[11px] font-mono text-zinc-400">http://localhost:11434</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectProvider?.("ollama");
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer font-sans"
                >
                  Activate Ollama
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
