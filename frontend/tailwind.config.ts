import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: "#080c12",
        "surface-elevated": "#0d1219",
        card: "#111923",
        "card-hover": "#151d2e",
        border: "#243044",
        "border-subtle": "#1a2433",
        accent: "#38bdf8",
        "accent-deep": "#0ea5e9",
        "accent-muted": "rgba(56, 189, 248, 0.12)",
        muted: "#8b9cb3",
        foreground: "#e8eef6",
        "foreground-soft": "#c4d0e0",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56, 189, 248, 0.15), 0 24px 48px -12px rgba(0, 0, 0, 0.45)",
        card: "0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 12px 40px -16px rgba(0, 0, 0, 0.55)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent 0%, #080c12 100%), linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
