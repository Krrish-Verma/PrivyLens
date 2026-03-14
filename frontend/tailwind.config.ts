import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#0f1419",
        card: "#1a2332",
        border: "#2d3a4f",
        accent: "#3b82f6",
        muted: "#64748b",
      },
    },
  },
  plugins: [],
};

export default config;
