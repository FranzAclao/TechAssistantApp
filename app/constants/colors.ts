export const COLORS = {
  // Base backgrounds
  BACKGROUND: "#0A0A0F",
  BACKGROUND_DEEP: "#050508",
  SURFACE: "#12121A",
  SURFACE_ELEVATED: "#1A1A28",

  // Glass effect simulation
  GLASS: "rgba(255, 255, 255, 0.06)",
  GLASS_BORDER: "rgba(255, 255, 255, 0.12)",
  GLASS_HIGHLIGHT: "rgba(255, 255, 255, 0.18)",

  // Primary accent
  PRIMARY: "#6B8AFF",
  PRIMARY_GLOW: "rgba(107, 138, 255, 0.3)",
  PRIMARY_DEEP: "#3D5AFE",

  // Semantic colors
  SUCCESS: "#30D158",
  SUCCESS_GLOW: "rgba(48, 209, 88, 0.25)",
  DANGER: "#FF453A",
  DANGER_GLOW: "rgba(255, 69, 58, 0.25)",
  WARNING: "#FFD60A",
  WARNING_GLOW: "rgba(255, 214, 10, 0.25)",

  // Category accent gradients
  BUDGETING_START: "#FF6B6B",
  BUDGETING_END: "#FF8E53",
  DEBT_START: "#FF453A",
  DEBT_END: "#FF2D8A",
  SAVINGS_START: "#30D158",
  SAVINGS_END: "#00C6FF",
  INVESTING_START: "#6B8AFF",
  INVESTING_END: "#A855F7",
  BENEFITS_START: "#FFD60A",
  BENEFITS_END: "#FF9F0A",

  // Text
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "rgba(255, 255, 255, 0.6)",
  TEXT_TERTIARY: "rgba(255, 255, 255, 0.35)",
  TEXT_PLACEHOLDER: "rgba(255, 255, 255, 0.25)",

  // Borders
  BORDER: "rgba(255, 255, 255, 0.08)",
  BORDER_BRIGHT: "rgba(255, 255, 255, 0.15)",

  // Disclaimer
  DISCLAIMER: "rgba(255, 255, 255, 0.4)",
} as const;

export default COLORS;
