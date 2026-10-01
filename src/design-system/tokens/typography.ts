// ── AIPanel Typography Tokens ──────────────────────────────────────

export const typography = {
  display: {
    fontSize: "28px",
    lineHeight: "1.2",
    fontWeight: "700",
  },
  pageTitle: {
    fontSize: "22px",
    lineHeight: "1.3",
    fontWeight: "600",
  },
  heading: {
    fontSize: "16px",
    lineHeight: "1.4",
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: "11px",
    lineHeight: "1.4",
    fontWeight: "700",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  },
  body: {
    fontSize: "14px",
    lineHeight: "1.5",
    fontWeight: "400",
  },
  secondary: {
    fontSize: "13px",
    lineHeight: "1.5",
    fontWeight: "400",
  },
  caption: {
    fontSize: "12px",
    lineHeight: "1.4",
    fontWeight: "500",
  },
  metadata: {
    fontSize: "11px",
    lineHeight: "1.4",
    fontWeight: "500",
  },
} as const;

export type Typography = typeof typography;
