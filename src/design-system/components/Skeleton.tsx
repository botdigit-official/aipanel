import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  className = "",
  style,
  ...props
}) => {
  const customStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      style={customStyle}
      className={`animate-pulse bg-white/5 border border-white/5 ${
        circle ? "rounded-full" : "rounded-md"
      } ${className}`}
      {...props}
    />
  );
};
