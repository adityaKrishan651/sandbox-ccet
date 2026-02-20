import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(2, 6, 23, 0.10)",
      },
      colors: {
        ink: {
          950: "#0b1220",
        },
      },
    },
  },
  plugins: [],
};

export default config;

