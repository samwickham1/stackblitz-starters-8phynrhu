import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0C1B1F",
        mist: "#F6F2EA",
        shell: "#F0E9DC",
        slate: "#475569",
        aurora: "#0EA5A4",
        ember: "#F97316",
        leaf: "#16A34A",
        gold: "#D6A74B"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      boxShadow: {
        soft: "0 18px 45px -25px rgba(12, 27, 31, 0.55)",
        insetGlow: "inset 0 0 0 1px rgba(12,27,31,0.08)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease both",
        fadeUpSlow: "fadeUp 0.9s ease both",
        shimmer: "shimmer 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
