import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-medium border border-violet-500/30 shadow-sm shadow-violet-950/50",
  secondary:
    "bg-[#161923] hover:bg-[#1B1E28] active:bg-[#222736] text-zinc-200 font-medium border border-white/10 hover:border-white/20",
  outline:
    "bg-transparent hover:bg-white/5 active:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-white/25",
  ghost:
    "bg-transparent hover:bg-white/5 active:bg-white/10 text-zinc-400 hover:text-zinc-100 border border-transparent",
  danger:
    "bg-rose-600/90 hover:bg-rose-500 active:bg-rose-700 text-white font-medium border border-rose-500/30 shadow-sm shadow-rose-950/50",
  success:
    "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium border border-emerald-500/30 shadow-sm shadow-emerald-950/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2 py-1 text-xs gap-1.5 rounded-md",
  sm: "px-2.5 py-1.5 text-xs font-medium gap-1.5 rounded-md",
  md: "px-3.5 py-2 text-sm font-medium gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-base font-semibold gap-2.5 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      icon,
      iconRight,
      isLoading,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-0.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {iconRight && !isLoading && <span className="shrink-0 flex items-center">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
