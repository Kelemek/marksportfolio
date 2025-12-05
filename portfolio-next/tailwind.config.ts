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
        pink: "#ff3258",
        black: "#000000",
        white: "#f0e9f2",
        "white-1": "#e5e5e6da",
        "border-light": "rgb(36, 35, 35)",
      },
      fontFamily: {
        sans: ["Hk Grotesk", "sans-serif"],
        heading: ["Jost", "sans-serif"],
      },
      fontSize: {
        small: "1.125rem", // 18px
        normal: "1.375rem", // 22px
        medium: "1.75rem", // 28px
        "medium-1": "2.25rem", // 36px
        large: "3.4375rem", // 55px
        huge: "4.6875rem", // 75px
      },
      maxWidth: {
        container: "1180px",
        "container-normal": "800px",
        "container-medium": "700px",
        "container-small": "500px",
      },
      spacing: {
        "gutter-huge": "12rem",
        "gutter-medium": "6rem",
        "gutter-normal": "3rem",
        "gutter-small-1": "2.5rem",
        "gutter-small": "2rem",
        "gutter-x-small": "1rem",
      },
      lineHeight: {
        normal: "1.7",
        small: "1.2",
      },
    },
  },
  plugins: [],
};

export default config;
