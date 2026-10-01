// ── AIPanel Elevation & Shadow Tokens ──────────────────────────────

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.4)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)",
  glowPurple: "0 0 20px -5px rgba(139, 92, 246, 0.35)",
  glowGreen: "0 0 20px -5px rgba(16, 185, 129, 0.35)",
  glowRed: "0 0 20px -5px rgba(239, 68, 68, 0.35)",
} as const;

export type Shadows = typeof shadows;
