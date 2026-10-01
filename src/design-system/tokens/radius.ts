// ── AIPanel Border Radius Tokens ───────────────────────────────────

export const radius = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

export type Radius = typeof radius;
