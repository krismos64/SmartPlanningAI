import { createContext, useContext, useState, useEffect } from "react";

// Définition des thèmes
const lightTheme = {
  mode: "light",
  primary: "#4361ee",
  secondary: "#3f37c9",
  background: "#f8f9fa",
  backgroundAlt: "#f1f3f5",
  cardBackground: "#ffffff",
  text: "#212529",
  textSecondary: "#495057",
  border: "#dee2e6",
  error: "#e63946",
  success: "#2a9d8f",
  warning: "#f9c74f",
};

const darkTheme = {
  mode: "dark",
  primary: "#4cc9f0",
  secondary: "#4895ef",
  background: "#121212",
  backgroundAlt: "#1e1e1e",
  cardBackground: "#242424",
  text: "#f8f9fa",
  textSecondary: "#adb5bd",
  border: "#495057",
  error: "#e63946",
  success: "#2a9d8f",
  warning: "#f9c74f",
};

// Création du contexte
const ThemeContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useTheme = () => useContext(ThemeContext);

// Fournisseur du contexte
export const ThemeProvider = ({ children }) => {
  // Vérifier si un thème est déjà enregistré dans le localStorage
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark" ? darkTheme : lightTheme;
    }

    // Utiliser les préférences du système si aucun thème n'est enregistré
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? darkTheme : lightTheme;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Mettre à jour le localStorage lorsque le thème change
  useEffect(() => {
    localStorage.setItem("theme", theme.mode);

    // Mettre à jour les variables CSS pour le thème
    document.documentElement.style.setProperty(
      "--color-primary",
      theme.primary
    );
    document.documentElement.style.setProperty(
      "--color-background",
      theme.background
    );
    document.documentElement.style.setProperty("--color-text", theme.text);

    // Mettre à jour la couleur de fond du body
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
  }, [theme]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme.mode === "light" ? darkTheme : lightTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
