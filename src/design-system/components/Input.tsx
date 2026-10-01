import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  shortcut?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, shortcut, error, className = "", ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3 text-zinc-500 flex items-center pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#11131A] text-zinc-100 placeholder-zinc-500 text-sm rounded-lg border border-white/10 px-3.5 py-2 transition-all duration-150 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/40 disabled:opacity-50 disabled:bg-zinc-900 ${
            icon ? "pl-9" : ""
          } ${shortcut ? "pr-12" : ""} ${error ? "border-rose-500/50 focus:border-rose-500" : ""} ${className}`}
          {...props}
        />
        {shortcut && (
          <span className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-medium font-mono text-zinc-400 bg-white/5 border border-white/10 rounded pointer-events-none">
            {shortcut}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
