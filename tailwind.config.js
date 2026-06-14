/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A warm, candle-lit Orthodox palette: deep wax, incense gold, icon red.
        wax: {
          950: "#15100b",
          900: "#1a1410",
          800: "#241b14",
          700: "#2f231a",
          600: "#413124",
        },
        gold: {
          300: "#e8cf9a",
          400: "#d9b876",
          500: "#c79a4b",
          600: "#a87c33",
        },
        icon: {
          red: "#8a2f2a",
          deep: "#5c1f1c",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      keyframes: {
        breathe: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.04)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        breathe: "breathe 5.5s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
