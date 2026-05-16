import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        electric: "#3b82f6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Georgia", "Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
