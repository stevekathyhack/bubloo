import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bubloo: {
          cloud: "#F4FAFF",
          mist: "#EAF5FF",
          sky: "#D6EAFE",
          dew: "#B8D3EA",
          cream: "#FFF8EF",
          ink: "#233347",
          muted: "#60758D",
          line: "#D7E7F3",
          accent: "#76A7CF",
        },
      },
      boxShadow: {
        "bubloo-soft": "0 18px 40px -24px rgba(49, 86, 122, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-heading)", "ui-serif", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
