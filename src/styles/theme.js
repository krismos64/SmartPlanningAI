const lightTheme = {
  colors: {
    primary: "#3a86ff",
    secondary: "#8338ec",
    accent: "#ff006e",
    success: "#06d6a0",
    warning: "#ffbe0b",
    error: "#ef476f",
    background: "#f8f9fa",
    surface: "#ffffff",
    text: {
      primary: "#212529",
      secondary: "#495057",
      disabled: "#adb5bd",
      hint: "#6c757d",
    },
    border: "#dee2e6",
    divider: "#e9ecef",
  },
  shadows: {
    small: "0 2px 4px rgba(0,0,0,0.05)",
    medium: "0 4px 6px rgba(0,0,0,0.07)",
    large: "0 10px 15px rgba(0,0,0,0.1)",
    button: "0 4px 6px rgba(58, 134, 255, 0.25)",
  },
  animation: {
    fast: "0.2s",
    medium: "0.3s",
    slow: "0.5s",
  },
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px",
    round: "50%",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
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
  breakpoints: {
    xs: "0px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
    "2xl": "1400px",
  },
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: "#4d9fff",
    secondary: "#9355f1",
    accent: "#ff4b93",
    background: "#121212",
    surface: "#1e1e1e",
    text: {
      primary: "#f8f9fa",
      secondary: "#e9ecef",
      disabled: "#6c757d",
      hint: "#adb5bd",
    },
    border: "#2d2d2d",
    divider: "#333333",
  },
  shadows: {
    small: "0 2px 4px rgba(0,0,0,0.2)",
    medium: "0 4px 6px rgba(0,0,0,0.25)",
    large: "0 10px 15px rgba(0,0,0,0.3)",
    button: "0 4px 6px rgba(77, 159, 255, 0.3)",
  },
};

export { lightTheme, darkTheme };
