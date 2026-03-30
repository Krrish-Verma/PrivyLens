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
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        surface: "#110f1a",
        "surface-elevated": "#171424",
        card: "#1d182c",
        "card-hover": "#241e36",
        border: "#2d2641",
        "border-subtle": "#241d34",
        accent: "#a78bfa",
        "accent-deep": "#8b5cf6",
        "accent-muted": "rgba(167, 139, 250, 0.16)",
        muted: "#6B7280",
        foreground: "#E6EDF3",
        "foreground-soft": "#9DA7B3",
        success: "#34d399",
        warning: "#fbbf24",
        danger: "#f87171",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(167, 139, 250, 0.28), 0 14px 34px -20px rgba(167, 139, 250, 0.45)",
        card: "0 10px 30px -22px rgba(0, 0, 0, 0.85)",
        soft: "0 8px 24px -18px rgba(0, 0, 0, 0.7)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(1100px 560px at 15% -10%, rgba(79, 156, 249, 0.2), transparent 42%), radial-gradient(800px 420px at 100% 0%, rgba(129, 140, 248, 0.13), transparent 40%)",
      },
    },
  },
  plugins: [],
};

export default config;
