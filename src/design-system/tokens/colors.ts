// ── AIPanel Layered Surface & Semantic Color Tokens ─────────────────

export const colors = {
  // Layered Surfaces
  bgBase: "#090a0f",
  bgSidebar: "#0d0f16",
  bgTopbar: "#0d0f17",
  bgSurface: "#131622",
  bgElevated: "#171b2b",
  bgHover: "#1e2336",
  bgActive: "#262d44",

  // Borders
  borderSubtle: "rgba(255, 255, 255, 0.08)",
  borderDefault: "rgba(255, 255, 255, 0.12)",
  borderStrong: "rgba(255, 255, 255, 0.20)",
  borderActive: "rgba(139, 92, 246, 0.50)",

  // Brand / Primary
  primary: {
    DEFAULT: "#8B5CF6", // Violet 500
    hover: "#7C3AED",
    active: "#6D28D9",
    subtle: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.35)",
  },

  // Semantic States
  success: {
    DEFAULT: "#10B981", // Emerald 500
    subtle: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.30)",
  },
  warning: {
    DEFAULT: "#F59E0B", // Amber 500
    subtle: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.30)",
  },
  danger: {
    DEFAULT: "#EF4444", // Rose 500
    subtle: "rgba(239, 68, 68, 0.12)",
    border: "rgba(239, 68, 68, 0.30)",
  },
  info: {
    DEFAULT: "#3B82F6", // Blue 500
    subtle: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.30)",
  },
  neutral: {
    DEFAULT: "#94A3B8", // Slate 400
    subtle: "rgba(148, 163, 184, 0.10)",
    border: "rgba(148, 163, 184, 0.20)",
  },
} as const;

export type ColorTheme = typeof colors;
