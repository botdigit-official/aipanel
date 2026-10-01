import React, { useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";

export interface DangerConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  targetName: string;
  confirmationKeyword?: string;
  confirmButtonText?: string;
  isProductionGate?: boolean;
}

export const DangerConfirmDialog: React.FC<DangerConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  targetName,
  confirmationKeyword,
  confirmButtonText = "Confirm Action",
  isProductionGate = false,
}) => {
  const [inputVal, setInputVal] = useState("");
  const requiresTyping = Boolean(confirmationKeyword);
  const isValid = !requiresTyping || inputVal.trim() === confirmationKeyword;

  const handleClose = () => {
    setInputVal("");
    onClose();
  };

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      handleClose();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isProductionGate
              ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
              : "bg-amber-500/10 border-amber-500/25 text-amber-400"
          }`}
        >
          {isProductionGate ? (
            <Lock className="w-5 h-5 text-rose-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{description}</p>

          <div className="mt-4 p-3 rounded-lg bg-[#0C0D12] border border-white/8">
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
              Target Entity
            </span>
            <span className="text-sm font-mono text-zinc-200 font-semibold mt-0.5 block">
              {targetName}
            </span>
          </div>

          {requiresTyping && (
            <div className="mt-4">
              <label className="text-xs text-zinc-300 block mb-1.5 font-medium">
                To proceed, type <span className="font-mono text-rose-400 font-bold">{confirmationKeyword}</span> below:
              </label>
              <Input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={confirmationKeyword}
                autoFocus
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant={isProductionGate ? "danger" : "primary"}
              size="sm"
              disabled={!isValid}
              onClick={handleConfirm}
            >
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
