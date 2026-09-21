/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CampusRide Approved Architectural Palette (§28)
        primary: {
          DEFAULT: "#143D32", // Deep Campus Green
          50: "#edf5f2",
          100: "#d6e8e2",
          200: "#afd0c4",
          300: "#80b2a1",
          400: "#55937f",
          500: "#143D32",
          600: "#103229",
          700: "#0d2821",
          800: "#0a1f1a",
          900: "#061310",
        },
        campus: {
          50: "#edf5f2",
          100: "#d6e8e2",
          500: "#143D32",
          600: "#103229",
          700: "#0d2821",
          800: "#0a1f1a",
          900: "#061310",
        },
        canvas: "#F7F5F0", // Warm Canvas
        surface: "#FFFDFC", // Off-white Paper Surface
        ink: {
          primary: "#18201D", // Deep Ink Text
          secondary: "#5F6964", // Secondary Charcoal
          muted: "#8A938E", // Muted Slate
          tertiary: "#8A938E",
        },
        status: {
          success: "#3E8F6C",
          warning: "#B8892E",
          emergency: "#B8473D",
          info: "#4F8098",
        },
        brand: {
          50: "#edf5f2",
          100: "#d6e8e2",
          500: "#143D32",
          600: "#103229",
          700: "#0d2821",
        },
        line: {
          subtle: "#EAE7DF",
          base: "#DDD9CE",
          strong: "#B5B0A4",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(24, 32, 29, 0.04)",
        card: "0 1px 3px 0 rgba(24, 32, 29, 0.06), 0 1px 2px -1px rgba(24, 32, 29, 0.04)",
        dropdown: "0 4px 12px 0 rgba(24, 32, 29, 0.08)",
        modal: "0 12px 32px -4px rgba(24, 32, 29, 0.12)",
      },
      borderRadius: {
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
