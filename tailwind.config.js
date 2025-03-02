module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Mode clair
        light: {
          50: "#FFFFFF", // Fond principal
          100: "#F3F4F6", // Fond secondaire
          200: "#E5E7EB", // Bordures
          300: "#D1D5DB", // Bordures secondaires
          400: "#9CA3AF", // Texte secondaire
          500: "#4B5563", // Texte secondaire
          600: "#1F2937", // Texte principal
        },
        // Mode sombre
        dark: {
          50: "#0A0F1A", // Fond principal
          100: "#1F2937", // Fond secondaire
          200: "#374151", // Bordures
          300: "#4B5563", // Bordures secondaires
          400: "#9CA3AF", // Texte secondaire
          500: "#F3F4F6", // Texte principal
        },
        // Accents
        primary: {
          DEFAULT: "#4F46E5", // Couleur principale
          light: "#6366F1", // Couleur secondaire
          dark: "#4338CA", // Couleur sombre
        },
        // États spécifiques
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ['"Inter"', "sans-serif"], // Police moderne et lisible
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["dark"],
      textColor: ["dark"],
      borderColor: ["dark"],
    },
  },
  plugins: [],
};
