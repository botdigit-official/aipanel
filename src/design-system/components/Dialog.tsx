import React, { useEffect } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  className = "",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthMap[maxWidth]} bg-[#161923] border border-white/10 rounded-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150 ${className}`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-white/8 shrink-0">
            <div>
              {title && <h2 className="text-base font-semibold text-zinc-100">{title}</h2>}
              {description && <p className="text-xs text-zinc-400 mt-1">{description}</p>}
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              title="Close Dialog"
              icon={<X className="w-4 h-4 text-zinc-400" />}
              onClick={onClose}
            />
          </div>
        )}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
