import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* Page + surfaces — warm ivory rather than pure white, so the
           champagne and blush accents have something to sit against. */
        canvas: {
          DEFAULT: "#FBF8F4",
          warm: "#F5EEE5",
          deep: "#EDE4D8",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FAF6F1",
        },
        /* Type. Warm near-black; pure #000 reads cheap on ivory. */
        ink: {
          DEFAULT: "#1F1A17",
          soft: "#5B524B",
          muted: "#7A6F66",
        },
        champagne: {
          DEFAULT: "#C9A227",
          light: "#E3C766",
          /* The only gold that clears 4.5:1 on ivory — use for text. */
          deep: "#8A6D14",
        },
        blush: {
          DEFAULT: "#F5E4E2",
          mid: "#E8C9C5",
          deep: "#C99A94",
        },
        sage: {
          DEFAULT: "#8FA79B",
          deep: "#5F7568",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.5rem, 6vw, 5.75rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.0", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.06", letterSpacing: "-0.02em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.32em" }],
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(115deg, transparent 20%, rgba(201,162,39,0.35) 45%, rgba(255,255,255,0.9) 50%, rgba(201,162,39,0.35) 55%, transparent 80%)",
        "quartz-fade":
          "linear-gradient(180deg, #FFFFFF 0%, #F5E4E2 45%, rgba(201,162,39,0.5) 100%)",
      },
      boxShadow: {
        /* Warm, wide, low-opacity — cool grey shadows muddy an ivory page. */
        glass:
          "0 24px 70px -30px rgba(90,66,45,0.28), 0 2px 10px -4px rgba(90,66,45,0.10), inset 0 1px 0 0 rgba(255,255,255,0.9)",
        lift: "0 30px 80px -34px rgba(90,66,45,0.34)",
        "glow-gold": "0 0 0 1px rgba(201,162,39,0.4), 0 18px 50px -22px rgba(201,162,39,0.5)",
      },
      transitionTimingFunction: {
        luxe: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        "pulse-slot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s cubic-bezier(0.22,1,0.36,1) infinite",
        "pulse-slot": "pulse-slot 2s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
