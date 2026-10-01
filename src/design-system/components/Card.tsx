import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", hoverable = false, className = "", children, ...props }, ref) => {
    let baseStyles = "bg-[#11131A] border border-white/10 rounded-xl p-4";

    if (variant === "elevated") {
      baseStyles = "bg-[#161923] border border-white/12 rounded-xl p-5 shadow-lg shadow-black/40";
    }

    const hoverStyles =
      hoverable || variant === "interactive"
        ? "transition-all duration-200 hover:border-violet-500/30 hover:bg-[#151722] hover:shadow-md cursor-pointer"
        : "";

    return (
      <div ref={ref} className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
