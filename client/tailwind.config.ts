import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: "#059669",
        "primary-container": "#d1fae5",
        "primary-fixed": "#a7f3d0",
        "primary-fixed-dim": "#6ee7b7",
        "on-primary": "#ffffff",
        "on-primary-container": "#064e3b",
        "on-primary-fixed-variant": "#047857",

        // Secondary
        secondary: "#0d9488",
        "secondary-container": "#ccfbf1",
        "secondary-fixed": "#99f6e4",
        "secondary-fixed-dim": "#5eead4",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#134e4a",
        "on-secondary-fixed": "#0f766e",

        // Tertiary
        tertiary: "#4f46e5",
        "tertiary-container": "#e0e7ff",
        "tertiary-fixed": "#c7d2fe",
        "on-tertiary-fixed": "#312e81",
        "on-tertiary-fixed-variant": "#4338ca",

        // Surfaces
        background: "#f8fafc",
        surface: "#ffffff",
        "surface-dim": "#f1f5f9",
        "surface-bright": "#ffffff",
        "surface-variant": "#e2e8f0",
        "surface-container": "#f8fafc",
        "surface-container-low": "#f1f5f9",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#cbd5e1",

        // Text
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "text-main": "#0f172a",

        // Outline
        outline: "#94a3b8",
        "outline-variant": "#cbd5e1",

        // Error
        error: "#dc2626",
        "error-container": "#fee2e2",
        "on-error": "#ffffff",
        "on-error-container": "#7f1d1d",

        // Semantic / Custom
        "status-warning": "#f59e0b",
        "occupancy-male": "#3b82f6",
        "occupancy-female": "#ec4899",
        "sage-deep": "#059669",
        "teal-soft": "#34d399",
        "hope-white": "#ffffff",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["40px", { lineHeight: "48px", fontWeight: "700" }],
        "headline-lg": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      boxShadow: {
        card: "0 4px 20px rgba(149, 213, 178, 0.12)",
        "card-green": "0 4px 20px rgba(64, 145, 108, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
