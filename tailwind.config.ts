import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  content: ["./app/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Clash Grotesk"', "Inter", "system-ui", "sans-serif"],
        display: ['"Clash Grotesk"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 19, 37, 0.04)",
        popover: "0 12px 32px rgba(17, 19, 37, 0.14)",
      },
      colors: {
        line: "#E9EAF0",
        butter: {
          DEFAULT: "#F5C518",
          50: "#FFFBEA",
          100: "#FFF3C4",
          200: "#FCE588",
          300: "#FADB5F",
          400: "#F7C948",
          500: "#F5C518",
          600: "#D4A017",
          700: "#AB7A14",
          800: "#8A5E15",
          900: "#744B15",
        },
        primary: {
          DEFAULT: "#917CFF",
          50: "#FAF8FF",
          100: "#F3F1FF",
          200: "#E4DEFF",
          300: "#D3CBFF",
          400: "#B4A6FF",
          500: "#917CFF",
          600: "#7A68D6",
          700: "#6354AD",
          800: "#4B4085",
          900: "#372F61",
          950: "#241F40",
        },
        "primary-dark": {
          DEFAULT: "#2D3261",
          50: "#F5F5F7",
          100: "#E8E8EE",
          200: "#CBCCD8",
          300: "#ABADC0",
          400: "#707494",
          500: "#2D3261",
          600: "#262A51",
          700: "#1F2242",
          800: "#171A32",
          900: "#111325",
          950: "#0B0D18",
        },
      },
    },
  },
};
