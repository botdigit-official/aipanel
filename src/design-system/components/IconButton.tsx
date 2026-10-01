import React from "react";

export type IconButtonVariant = "ghost" | "secondary" | "outline" | "danger" | "primary";
export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  title: string; // Accessible tooltip / label
  icon: React.ReactNode;
}

const variantStyles: Record<IconButtonVariant, string> = {
  ghost:
    "bg-transparent hover:bg-white/5 active:bg-white/10 text-zinc-400 hover:text-zinc-100 border border-transparent",
  secondary:
    "bg-[#161923] hover:bg-[#1B1E28] active:bg-[#222736] text-zinc-300 hover:text-white border border-white/10",
  outline:
    "bg-transparent hover:bg-white/5 active:bg-white/10 text-zinc-400 hover:text-white border border-white/10",
  primary:
    "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white border border-violet-500/30",
  danger:
    "bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 hover:text-rose-100 border border-rose-500/30",
};

const sizeStyles: Record<IconButtonSize, string> = {
  xs: "w-6 h-6 p-1 rounded-md text-xs",
  sm: "w-7 h-7 p-1.5 rounded-md text-sm",
  md: "w-8 h-8 p-1.5 rounded-lg text-base",
  lg: "w-10 h-10 p-2.5 rounded-lg text-lg",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "ghost", size = "sm", title, icon, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        title={title}
        aria-label={title}
        className={`inline-flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
