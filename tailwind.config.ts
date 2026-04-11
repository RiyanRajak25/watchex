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
        background: "#050505",
        foreground: "#ededed",
        primary: {
          DEFAULT: "#00E5FF", // Cinematic Teal
          hover: "#00c4db"
        },
        accent: {
          DEFAULT: "#FF5A00", // Cinematic Orange
          hover: "#e04e00"
        },
        surface: {
          light: "#1a1a24",
          DEFAULT: "#0f0f13",
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
