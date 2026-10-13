import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          500: "#2f6fed",
          600: "#1f57c9",
          700: "#1a46a1",
        },
      },
    },
  },
  plugins: [],
};
export default config;
