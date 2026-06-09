import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: "#E8604C",
        teal: "#3DBFBF",
        gold: "#F5A623",
        "warm-white": "#FFF8F5",
        dark: {
          DEFAULT: "#111111",
          2: "#1C1C1C",
          3: "#252525",
          4: "#2F2F2F",
        },
      },
    },
  },
  plugins: [],
};

export default config;
