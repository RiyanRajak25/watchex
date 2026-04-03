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
        background: "#0a0a0a",
        foreground: "#ededed",
        primary: {
          DEFAULT: "#e81cff",
          hover: "#c012d6"
        },
        accent: {
          DEFAULT: "#ffb400",
          hover: "#e09f00"
        },
        surface: {
          light: "#1a1a1a",
          DEFAULT: "#121212",
          dark: "#050505"
        }
      },
      fontFamily: {
        heading: ["var(--font-playfair)"],
        subheading: ["var(--font-barlow)"],
        sans: ["var(--font-dm-sans)"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)',
      },
    },
  },
  plugins: [],
};
export default config;
