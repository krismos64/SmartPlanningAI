import { Box, Divider, Typography } from "@mui/material";
import { memo } from "react";
import { useTheme } from "../ThemeProvider";

/**
 * Composant d'en-tête de page avec titre, sous-titre et icône
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Le titre principal de la page
 * @param {string} props.subtitle - Le sous-titre de la page
 * @param {string} props.icon - L'icône à afficher (emoji ou composant)
 * @param {Object} props.actions - Les éléments d'action à afficher (boutons, etc.)
 */
const PageHeader = memo(({ title, subtitle, icon, actions }) => {
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
                mr: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                color={isDarkMode ? "#D1D5DB" : "text.secondary"}
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        {actions && <Box sx={{ ml: 2 }}>{actions}</Box>}
      </Box>

      <Divider sx={{ mt: 2, mb: 3 }} />
    </Box>
  );
});

PageHeader.displayName = "PageHeader";

export default PageHeader;
