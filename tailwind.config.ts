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
        display: ["var(--font-barlow)", "sans-serif"],
        mono: ["var(--font-ibm-mono)", "monospace"],
      },
      colors: {
        gold: { DEFAULT: "#C9A84C", dim: "#7a6230" },
        pitch: {
          DEFAULT: "#080d18",
          surface: "#0d1526",
          surface2: "#131d2e",
          surface3: "#1a2540",
        },
        border: { DEFAULT: "#1e2d45", strong: "#263750" },
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        ticker: "ticker 30s linear infinite",
        "row-glow": "rowglow 1.5s ease-in-out infinite",
      },
      keyframes: {
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        rowglow: {
          "0%,100%": { backgroundColor: "rgba(201,168,76,0.06)" },
          "50%": { backgroundColor: "rgba(201,168,76,0.13)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
