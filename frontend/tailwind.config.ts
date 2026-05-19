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
        "bg-primary": "#FFFFFF",
        "bg-secondary": "#f4f4f5", // a light grey for sections
        "bg-tertiary": "#CACACA",
        "bg-input": "#f8f9fa",
        "bg-inverse": "#000000",
        "brand-primary": "#282B5D",
        "brand-accent": "#110FFF",
        "brand-light": "#BCA2FF",
        "brand-dark": "#1a1c3d",
        "text-primary": "#000000",
        "text-secondary": "#6b7280",
        "text-muted": "#CACACA",
        "text-inverse": "#FFFFFF",
        "border-default": "#CACACA",
        "border-focus": "#110FFF",
        "accent-green": "#10B981",
        "accent-red": "#EF4444",
        "accent-amber": "#F59E0B",
        "accent-blue": "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 200ms ease",
        "slide-up": "slideUp 300ms ease",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
