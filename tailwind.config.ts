import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        main: "#7EC8E3",
        navy: "#131727",
        coral: "#DD6868",
      },
    },
  },
  plugins: [],
};

export default config;
