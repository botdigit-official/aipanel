import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hoverable = false, className = "", children, ...props }, ref) => {
    let baseStyles =
      "bg-[#141724] border border-[#232a3e] rounded-xl p-5 shadow-md ring-1 ring-white/5";

    if (variant === "elevated") {
      baseStyles =
        "bg-[#171b2c] border border-[#283148] rounded-xl p-6 shadow-xl shadow-black/40 ring-1 ring-white/10";
    }

    const hoverStyles =
      hoverable || variant === "interactive"
        ? "transition-all duration-200 hover:border-violet-500/50 hover:bg-[#181d2e] hover:shadow-lg hover:shadow-violet-950/20 cursor-pointer"
        : "";

    return (
      <div ref={ref} className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
