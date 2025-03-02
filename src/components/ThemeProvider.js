import { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { createGlobalStyle } from "styled-components";

// Thèmes
const lightTheme = {
  colors: {
    primary: "#4F46E5",
    secondary: "#10B981",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    text: {
      primary: "#111827",
      secondary: "#4B5563",
      disabled: "#9CA3AF",
      inverse: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    none: "0",
    small: "0.25rem",
    medium: "0.5rem",
    large: "1rem",
    round: "9999px",
  },
  shadows: {
    none: "none",
    small: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    medium:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    large:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
  transitions: {
    fast: "0.15s ease",
    normal: "0.3s ease",
    slow: "0.5s ease",
  },
};

const darkTheme = {
  colors: {
    primary: "#6366F1",
    secondary: "#34D399",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    info: "#60A5FA",
    background: "#111827",
    surface: "#1F2937",
    border: "#374151",
    text: {
      primary: "#F9FAFB",
      secondary: "#D1D5DB",
      disabled: "#6B7280",
      inverse: "#111827",
    },
  },
  typography: {
    ...lightTheme.typography,
  },
  spacing: {
    ...lightTheme.spacing,
  },
  borderRadius: {
    ...lightTheme.borderRadius,
  },
  shadows: {
    none: "none",
    small: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
    medium:
      "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
    large:
      "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.14)",
  },
  breakpoints: {
    ...lightTheme.breakpoints,
  },
  transitions: {
    ...lightTheme.transitions,
  },
};

// Styles globaux
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    font-size: 16px;
  }
  
  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: ${({ theme }) => theme.typography.lineHeights.normal};
    transition: background-color ${({ theme }) => theme.transitions.normal}, 
                color ${({ theme }) => theme.transitions.normal};
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
    line-height: ${({ theme }) => theme.typography.lineHeights.tight};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => {
        const color = theme.colors.primary;
        // Assombrir ou éclaircir selon le thème
        return theme === lightTheme ? darken(color, 0.2) : lighten(color, 0.2);
      }};
    }
  }
  
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }
  
  /* Animations de transition entre les thèmes */
  .theme-transition-enter {
    opacity: 0;
  }
  
  .theme-transition-enter-active {
    opacity: 1;
    transition: opacity 300ms;
  }
  
  .theme-transition-exit {
    opacity: 1;
  }
  
  .theme-transition-exit-active {
    opacity: 0;
    transition: opacity 300ms;
  }
  
  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${({ theme }) =>
      theme === lightTheme ? "#F3F4F6" : "#374151"};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
      theme === lightTheme ? "#D1D5DB" : "#6B7280"};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) =>
        theme === lightTheme ? "#9CA3AF" : "#9CA3AF"};
    }
  }
`;

// Fonctions utilitaires pour les couleurs
const darken = (color, amount) => {
  // Convertir la couleur hex en RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  // Assombrir
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));

  // Convertir en hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const lighten = (color, amount) => {
  // Convertir la couleur hex en RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);

  // Éclaircir
  r = Math.min(255, Math.floor(r + (255 - r) * amount));
  g = Math.min(255, Math.floor(g + (255 - g) * amount));
  b = Math.min(255, Math.floor(b + (255 - b) * amount));

  // Convertir en hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Contexte du thème
const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

// Hook pour utiliser le thème
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useTheme doit être utilisé à l'intérieur d'un ThemeProvider"
    );
  }
  return context;
};

// Composant ThemeProvider
const ThemeProvider = ({ children }) => {
  // Récupérer le thème depuis le localStorage ou utiliser le thème par défaut
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  // Mettre à jour le localStorage lorsque le thème change
  useEffect(() => {
    localStorage.setItem("theme", theme);

    // Mettre à jour l'attribut data-theme sur le document
    document.documentElement.setAttribute("data-theme", theme);

    // Mettre à jour la meta tag theme-color pour les appareils mobiles
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "light" ? "#FFFFFF" : "#111827"
      );
    }
  }, [theme]);

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Détecter les préférences du système
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Fonction pour mettre à jour le thème en fonction des préférences du système
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem("theme");
      // Ne mettre à jour que si l'utilisateur n'a pas explicitement choisi un thème
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    // Vérifier les préférences initiales
    if (!localStorage.getItem("theme")) {
      handleChange(mediaQuery);
    }

    // Écouter les changements de préférences
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  // Valeur du contexte
  const contextValue = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
