import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ru: {
          crimson: "#DC2626",
          blue: "#1D4ED8",
          emerald: "#059669",
          emeraldDark: "#022c22",
          emeraldDeep: "#064e3b",
          gold: "#FACC15",
          goldDark: "#F59E0B",
          slate: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["'Hind Siliguri'", "'Plus Jakarta Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
