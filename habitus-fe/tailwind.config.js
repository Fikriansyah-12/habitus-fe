/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        "xs": "360px",
      },
      container: {
        center: true,
        padding: "1.5rem",
        screens: {
          "sm": "540px",
          "md": "720px",
          "lg": "960px",
          "xl": "1140px",
          "2xl": "1320px",
        },
      },
      colors: {
        brand: "#F3C76F",
        brandSecondary: "#9C855B",
        whiteAccent: "#F1F1F1",
        blackAccent: "#1D1D1D",
      },
    },
  },
  plugins: [],
}
