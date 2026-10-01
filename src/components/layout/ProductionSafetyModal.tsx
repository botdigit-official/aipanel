import { useState } from "react";
import { ShieldAlert, AlertTriangle, Lock, X, Check } from "lucide-react";

interface ProductionSafetyModalProps {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  confirmationKeyword?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ProductionSafetyModal({
  isOpen,
  actionTitle,
  actionDescription,
  confirmationKeyword = "PRODUCTION",
  onConfirm,
  onCancel,
}: ProductionSafetyModalProps) {
  const [typedInput, setTypedInput] = useState("");

  if (!isOpen) return null;

  const isConfirmed = typedInput.trim().toUpperCase() === confirmationKeyword.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-zinc-900 border-2 border-rose-500/80 rounded-2xl shadow-2xl shadow-rose-950/50 max-w-lg w-full overflow-hidden text-zinc-100">
        {/* Urgent Red Banner */}
        <div className="p-5 bg-gradient-to-r from-rose-950/80 via-zinc-900 to-zinc-900 border-b border-rose-500/40 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white tracking-widest">
                🔴 PRODUCTION PROTECTED
              </span>
              <span className="text-xs text-rose-400 flex items-center gap-1">
                <Lock size={12} /> Safeguard Armed
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{actionTitle}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">{actionDescription}</p>

          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Explicit Confirmation Required
            </span>
            <p className="text-[11px] text-zinc-400">
              To prevent accidental production outages, please type{" "}
              <strong className="text-rose-300 font-mono underline">{confirmationKeyword}</strong> below to confirm execution.
            </p>
          </div>

          <div>
            <input
              type="text"
              autoFocus
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={`Type "${confirmationKeyword}" to authorize...`}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancel & Abort
          </button>

          <button
            disabled={!isConfirmed}
            onClick={() => {
              if (isConfirmed) {
                onConfirm();
                setTypedInput("");
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isConfirmed
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/60"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            }`}
          >
            <Check size={14} />
            <span>Authorize Production Action</span>
          </button>
        </div>
      </div>
    </div>
  );
}
