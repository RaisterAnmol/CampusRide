/**
 * CampusRide Design System Tokens
 * Master source of truth for color palettes, type scales, spacing, shadows, and motion curves.
 */

export const color = {
  background: {
    base: "#F5F6F3",
    canvas: "#FBFBFA",
    raised: "#FFFFFF",
    inverse: "#111111",
    subtle: "#F0F2ED",
  },
  foreground: {
    primary: "#111111",
    secondary: "#5B5F58",
    muted: "#8A9085",
    inverse: "#F5F6F3",
  },
  brand: {
    // Deep Campus Green
    primary: "#143D32",
    primaryHover: "#0F2E26",
    subtle: "#E8F4F0",
    border: "#20594B",
  },
  accent: {
    // Electric University Blue
    primary: "#1769FF",
    primaryHover: "#0F52CC",
    subtle: "#EBF2FF",
  },
  status: {
    success: "#1E8E5A",
    successSubtle: "#E7F6EE",
    warning: "#B45309",
    warningSubtle: "#FEF3C7",
    danger: "#C0392B",
    dangerSubtle: "#FDE8E7",
    info: "#0284C7",
    infoSubtle: "#E0F2FE",
  },
  border: {
    subtle: "#E4E5E1",
    strong: "#111111",
    focus: "#143D32",
  },
} as const;

export const type = {
  display: "clamp(2.5rem, 5vw, 4.5rem)",
  h1: "clamp(2rem, 3.5vw, 3rem)",
  h2: "clamp(1.5rem, 2.5vw, 2.25rem)",
  h3: "1.5rem",
  h4: "1.25rem",
  bodyLarge: "1.125rem",
  body: "1rem",
  small: "0.875rem",
  caption: "0.75rem",
  tiny: "0.6875rem",
} as const;

export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(17, 17, 17, 0.06)",
  md: "0 4px 12px rgba(17, 17, 17, 0.08)",
  lg: "0 12px 32px rgba(17, 17, 17, 0.12)",
  cardHover: "0 8px 24px rgba(20, 61, 50, 0.10)",
} as const;

export const radius = {
  none: "0px",
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
} as const;

export const motion = {
  duration: {
    instant: 0,
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
    deliberate: 0.6,
  },
  ease: {
    out: [0.16, 1, 0.3, 1],
    inOut: [0.65, 0, 0.35, 1],
    spring: { damping: 25, stiffness: 300 },
  },
} as const;
