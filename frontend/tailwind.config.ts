import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      fontSize: {
        "display-sm": ["1.75rem", { lineHeight: "2rem" }],
        "display-md": ["2rem", { lineHeight: "2.5rem" }],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.05)",
        card: "0 1px 3px rgba(0,0,0,0.05)",
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
      },
      colors: {
        primary: {
          DEFAULT: "#1E3A8A",
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#1E3A8A",
          600: "#1E40AF",
          700: "#1D4ED8",
        },
        success: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          100: "#D1FAE5",
          600: "#059669",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          600: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          600: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};

export default config;

