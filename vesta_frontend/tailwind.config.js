module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: "#f0f4f8",
          text: "#1a202c",
          primary: "#3b82f6",
          secondary: "#8b5cf6",
          card: "#ffffff",
          border: "#e2e8f0",
        },
        dark: {
          background: "#121212",
          text: "#e2e8f0",
          primary: "#0bc5ea",
          secondary: "#805ad5",
          card: "#1a202c",
          border: "#2d3748",
        },
      },
    },
  },
  plugins: [],
};