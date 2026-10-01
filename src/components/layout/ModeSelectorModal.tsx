import { useState } from "react";
import { Monitor, Server, Link2, Check, ArrowRight, ShieldCheck, Cpu, X } from "lucide-react";
import type { OperatingMode } from "../../lib/types";

interface ModeSelectorModalProps {
  currentMode: OperatingMode;
  onSelectMode: (mode: OperatingMode) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export default function ModeSelectorModal({
  currentMode,
  onSelectMode,
  onClose,
  isOpen,
}: ModeSelectorModalProps) {
  const [selected, setSelected] = useState<OperatingMode>(currentMode);
  const [remoteServerUrl, setRemoteServerUrl] = useState("https://vps.myinfra.net:9876");
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-zinc-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">How do you want to use AIPanel?</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                AIPanel runs as a local development IDE, a VPS server control panel, or a remote hybrid manager.
              </p>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Option 1: Desktop Development */}
          <div
            onClick={() => setSelected("desktop")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected === "desktop"
                ? "bg-indigo-950/30 border-indigo-500/80 shadow-md shadow-indigo-950/40"
                : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/70"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selected === "desktop"
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              <Monitor size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Desktop Development
                  {selected === "desktop" && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Selected
                    </span>
                  )}
                </h3>
                {selected === "desktop" && <Check size={16} className="text-indigo-400" />}
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Build, test, and manage applications from your personal computer.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {["Local IDE", "AI Agent", "Docker Stacks", "Git Branches", "Dev Tunnels", "Previews"].map(
                  (feature) => (
                    <span
                      key={feature}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-700/50"
                    >
                      {feature}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Option 2: Server Control Panel */}
          <div
            onClick={() => setSelected("server")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected === "server"
                ? "bg-sky-950/30 border-sky-500/80 shadow-md shadow-sky-950/40"
                : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/70"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selected === "server"
                  ? "bg-sky-500 text-white"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              <Server size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Server Control Panel (VPS Mode)
                  {selected === "server" && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      Selected
                    </span>
                  )}
                </h3>
                {selected === "server" && <Check size={16} className="text-sky-400" />}
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Manage a Linux VPS, orchestrate applications, domains, and host clients from your browser like a modern aaPanel.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {["VPS Health", "App Fleet", "SSL & Caddy", "Backups", "Hosting Plans", "Clients & CRM"].map(
                  (feature) => (
                    <span
                      key={feature}
                      className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-700/50"
                    >
                      {feature}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Option 3: Connect to Existing Server */}
          <div
            onClick={() => setSelected("remote_client")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
              selected === "remote_client"
                ? "bg-emerald-950/30 border-emerald-500/80 shadow-md shadow-emerald-950/40"
                : "bg-zinc-800/40 border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/70"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selected === "remote_client"
                  ? "bg-emerald-500 text-white"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
              }`}
            >
              <Link2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Connect to Existing Server
                  {selected === "remote_client" && (
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Selected
                    </span>
                  )}
                </h3>
                {selected === "remote_client" && <Check size={16} className="text-emerald-400" />}
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                Link this desktop app directly to a remote AIPanel Server Agent on your cloud VPS.
              </p>

              {selected === "remote_client" && (
                <div className="mt-3 p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 space-y-2">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Server Endpoint URL</label>
                    <input
                      type="text"
                      value={remoteServerUrl}
                      onChange={(e) => setRemoteServerUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      placeholder="https://server-ip:9876"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Agent API Key / Token</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      placeholder="bs_live_sec_..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>You can switch modes or connect multiple servers at any time.</span>
          </div>
          <button
            onClick={() => {
              onSelectMode(selected);
              if (onClose) onClose();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-950/60 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Launch AIPanel in {selected === "server" ? "Server Panel Mode" : selected === "remote_client" ? "Remote Client Mode" : "Desktop IDE Mode"}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
