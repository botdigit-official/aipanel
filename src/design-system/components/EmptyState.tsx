import React from "react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border border-white/8 bg-[#11131A] max-w-md mx-auto my-6 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-sm">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" icon={actionIcon} onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
