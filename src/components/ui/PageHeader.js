import { Box, Divider, Typography } from "@mui/material";
import { useTheme } from "../ThemeProvider";

/**
 * Composant d'en-tête de page avec titre, sous-titre et icône
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Le titre principal de la page
 * @param {string} props.subtitle - Le sous-titre de la page
 * @param {string} props.icon - L'icône à afficher (emoji ou composant)
 * @param {Object} props.action - Un élément d'action à afficher (bouton, etc.)
 */
const PageHeader = ({ title, subtitle, icon, action }) => {
  const { theme: themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {icon && (
            <Box
              sx={{
                fontSize: { xs: "2rem", md: "2.5rem" },
                mr: 2,
                display: "flex",
                alignItems: "center",
              }}
            >
              {icon}
            </Box>
          )}

          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                color: isDarkMode ? "#F9FAFB" : "inherit",
              }}
            >
              {title}
            </Typography>

            {subtitle && (
              <Typography
                variant="subtitle1"
                color={isDarkMode ? "#F9FAFB" : "text.secondary"}
                sx={{
                  mt: 0.5,
                  ml: icon ? 7 : 0,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {action && <Box sx={{ ml: 2 }}>{action}</Box>}
      </Box>

      <Divider sx={{ mt: 2, mb: 3 }} />
    </Box>
  );
};

export default PageHeader;
