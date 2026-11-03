/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Biru muda jaket Himpunan Mahasiswa Matematika
        sky: {
          50: "#EEF7FE",
          100: "#D6ECFD",
          200: "#AEDAFB",
          300: "#79C1F6",
          400: "#3FA3EE",
          500: "#1A8FE3",
          600: "#0C74C6",
          700: "#0D5D9F",
          800: "#104E81",
          900: "#12416A",
          950: "#0B2945",
        },
        // Kuning khas logo HIMATIKA
        sun: {
          50: "#FFFDE6",
          100: "#FFF9C2",
          200: "#FFF285",
          300: "#FFEA3D",
          400: "#FFE500",
          500: "#F2CF00",
          600: "#C9A800",
          700: "#8F7600",
        },
        ink: {
          50: "#F6F8FB",
          100: "#EDF1F6",
          200: "#DCE3EC",
          300: "#C2CCD9",
          400: "#8D9AAD",
          500: "#647287",
          600: "#4A5668",
          700: "#364051",
          800: "#232B38",
          900: "#141A23",
        },
        accent: { red: "#D9342B" },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans Variable'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,40,70,.06), 0 4px 16px rgba(16,40,70,.06)",
        lift: "0 8px 30px rgba(12,116,198,.18)",
      },
    },
  },
  plugins: [],
};
