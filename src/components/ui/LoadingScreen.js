import { Box, CircularProgress, Container, Typography } from "@mui/material";

/**
 * Composant pour afficher un écran de chargement
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.message - Le message à afficher pendant le chargement
 * @param {number} props.size - La taille du spinner de chargement
 */
const LoadingScreen = ({ message = "Chargement en cours...", size = 60 }) => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        py: 8,
      }}
    >
      <CircularProgress
        size={size}
        thickness={4}
        color="primary"
        sx={{ mb: 3 }}
      />

      <Box sx={{ textAlign: "center" }}>
        <Typography
          variant="h6"
          component="h2"
          color="text.secondary"
          sx={{
            animation: "pulse 1.5s infinite ease-in-out",
            "@keyframes pulse": {
              "0%": { opacity: 0.6 },
              "50%": { opacity: 1 },
              "100%": { opacity: 0.6 },
            },
          }}
        >
          {message}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, maxWidth: 500, mx: "auto" }}
        >
          Merci de patienter pendant que nous chargeons vos données...
        </Typography>
      </Box>
    </Container>
  );
};

export default LoadingScreen;
