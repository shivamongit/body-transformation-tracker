/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0b0b0f",
          surface: "#161d16",
          elevated: "#242c24",
          highest: "#2f372e",
          lowest: "#091009",
          border: "#26262f",
          hover: "#242c24",
        },
        text: {
          primary: "#dce5d9",
          secondary: "#bccbb9",
          muted: "#869585",
        },
        accent: {
          DEFAULT: "#22c55e",
          hover: "#4be277",
          subtle: "#003915",
          on: "#003915",
          text: "#4be277",
        },
      },
      fontFamily: {
        sans: ["Geist", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.2)",
        glow: "0 0 12px rgba(34,197,94,0.3)",
        "glow-lg": "0 0 20px rgba(34,197,94,0.4)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
