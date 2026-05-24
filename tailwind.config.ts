import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        rovix: {
          gold: "#FFD000",
          amber: "#FFB800",
          ink: "#050505",
          panel: "#111111",
          line: "rgba(255,255,255,0.12)"
        }
      },
      boxShadow: {
        gold: "0 0 35px rgba(255, 208, 0, 0.32)",
        "gold-strong": "0 0 55px rgba(255, 208, 0, 0.48)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial", "sans-serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"]
      },
      backgroundImage: {
        "radial-gold": "radial-gradient(circle at center, rgba(255,208,0,0.24), transparent 58%)",
        "premium-line": "linear-gradient(135deg, rgba(255,208,0,0.24), rgba(255,255,255,0.04) 45%, rgba(255,208,0,0.14))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(5deg)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.52", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.05)" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        marquee: "marquee 18s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
