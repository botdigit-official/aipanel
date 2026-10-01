import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hoverable = false, className = "", children, ...props }, ref) => {
    let baseStyles =
      "bg-[#131622] border border-[#23293d] rounded-xl p-4 shadow-md shadow-black/40 ring-1 ring-white/5";

    if (variant === "elevated") {
      baseStyles =
        "bg-[#171b2b] border border-[#2a324b] rounded-xl p-5 shadow-xl shadow-black/50 ring-1 ring-white/10";
    }

    const hoverStyles =
      hoverable || variant === "interactive"
        ? "transition-all duration-200 hover:border-violet-500/50 hover:bg-[#1a1f32] hover:shadow-lg hover:shadow-violet-950/20 cursor-pointer"
        : "";

    return (
      <div ref={ref} className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
