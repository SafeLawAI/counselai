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
        brand: {
          50: "#f0f4ff",
          100: "#dde7ff",
          200: "#c3d2fe",
          300: "#9cb3fd",
          400: "#7489fa",
          500: "#5562f5",
          600: "#3f3fe9",
          700: "#332fce",
          800: "#2b29a7",
          900: "#282883",
          950: "#1a184d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
