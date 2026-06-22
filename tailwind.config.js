/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08090d",
          900: "#0d0f14",
          800: "#13161d",
          700: "#1b1f29",
          600: "#272c38",
        },
        accent: {
          DEFAULT: "#4ade80",
          soft: "#86efac",
        },
        brand: {
          blue: "#60a5fa",
          purple: "#a78bfa",
          pink: "#f472b6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "grad-accent": "linear-gradient(135deg, #4ade80, #60a5fa)",
        "grad-purple": "linear-gradient(135deg, #a78bfa, #f472b6)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(74, 222, 128, 0.35)",
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
