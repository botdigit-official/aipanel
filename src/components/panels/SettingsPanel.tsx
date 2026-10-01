import { useState } from "react";
import {
  Settings as SettingsIcon,
  Shield,
  Terminal,
  Globe,
  Save,
  Check,
  Lock,
} from "lucide-react";
import type { Environment } from "../layout/TopBar";

interface SettingsPanelProps {
  environment: Environment;
}

export default function SettingsPanel({ environment: _environment }: SettingsPanelProps) {
  const [tabSize, setTabSize] = useState(() => localStorage.getItem("aipanel_tab_size") || "2");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("aipanel_font_size") || "13");
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem("aipanel_auto_save") !== "false");
  const [prodGating, setProdGating] = useState(() => localStorage.getItem("aipanel_prod_gating") !== "false");

  const [dockerSocket, setDockerSocket] = useState(
    () => localStorage.getItem("aipanel_docker_socket") || "/var/run/docker.sock"
  );
  const [agentPort, setAgentPort] = useState(
    () => localStorage.getItem("aipanel_agent_port") || "9876"
  );
  const [tunnelDomain, setTunnelDomain] = useState(
    () => localStorage.getItem("aipanel_tunnel_domain") || "botdigit.site"
  );

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("aipanel_tab_size", tabSize);
    localStorage.setItem("aipanel_font_size", fontSize);
    localStorage.setItem("aipanel_auto_save", String(autoSave));
    localStorage.setItem("aipanel_prod_gating", String(prodGating));
    localStorage.setItem("aipanel_docker_socket", dockerSocket);
    localStorage.setItem("aipanel_agent_port", agentPort);
    localStorage.setItem("aipanel_tunnel_domain", tunnelDomain);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto select-none p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h1 className="text-sm font-semibold tracking-wide text-zinc-100">
              AIPANEL SYSTEM & PREFERENCES
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Configure local editor settings, environment isolation gates, Docker sockets, and tunnel domains.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          {saved ? <Check size={14} className="text-emerald-300" /> : <Save size={14} />}
          <span>{saved ? "Saved!" : "Save Changes"}</span>
        </button>
      </div>

      {/* ── Section 1: Code Editor & Buffer ── */}
      <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Terminal size={16} className="text-indigo-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Editor & Code Buffer
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Tab Indentation</label>
            <select
              value={tabSize}
              onChange={(e) => setTabSize(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="2">2 spaces (Recommended)</option>
              <option value="4">4 spaces</option>
            </select>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Editor Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="12">12px (Compact)</option>
              <option value="13">13px (Default)</option>
              <option value="14">14px (Medium)</option>
              <option value="16">16px (Large)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <div className="text-xs font-medium text-zinc-200">Auto-Save Buffer</div>
            <div className="text-[11px] text-zinc-400">
              Automatically persist open editor file changes to disk.
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* ── Section 2: Environment Safety & Isolation ── */}
      <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Shield size={16} className="text-rose-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Environment Isolation Guardrails
          </h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
              <span>Strict Production Release Gating</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono text-rose-400">
                RECOMMENDED
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Requires full pre-flight Doctor verification before any code or container can deploy to LIVE.
            </div>
          </div>
          <input
            type="checkbox"
            checked={prodGating}
            onChange={(e) => setProdGating(e.target.checked)}
            className="w-4 h-4 rounded accent-rose-600 cursor-pointer"
          />
        </div>

        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <Lock size={14} className="text-emerald-400" />
            <span>Hardware-Bound AES-256 Vault: ACTIVE</span>
          </div>
          <span className="text-[10px] text-zinc-500">Device Secure Enclave</span>
        </div>
      </div>

      {/* ── Section 3: Docker & Network Daemon ── */}
      <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
          <Globe size={16} className="text-emerald-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Infrastructure & Daemon Endpoints
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Docker Daemon Socket</label>
            <input
              type="text"
              value={dockerSocket}
              onChange={(e) => setDockerSocket(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">AIPanel Server Agent Port</label>
            <input
              type="text"
              value={agentPort}
              onChange={(e) => setAgentPort(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 mb-1 text-xs">Cloudflare Tunnel Root Domain</label>
          <input
            type="text"
            value={tunnelDomain}
            onChange={(e) => setTunnelDomain(e.target.value)}
            placeholder="botdigit.site"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
