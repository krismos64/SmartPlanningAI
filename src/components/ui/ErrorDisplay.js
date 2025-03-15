import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

/**
 * Composant pour afficher un message d'erreur avec une option pour réessayer
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.message - Le message d'erreur à afficher
 * @param {Function} props.onRetry - Fonction à appeler lors du clic sur le bouton "Réessayer"
 * @param {boolean} props.showHomeButton - Indique si le bouton "Retour à l'accueil" doit être affiché
 */
const ErrorDisplay = ({ message, onRetry, showHomeButton = true }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Oups ! Une erreur est survenue
        </Typography>

        <Box sx={{ width: "100%", mt: 2, mb: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {message ||
              "Une erreur inattendue s'est produite. Veuillez réessayer ultérieurement."}
          </Alert>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {onRetry && (
            <Button variant="contained" color="primary" onClick={onRetry}>
              Réessayer
            </Button>
          )}

          {showHomeButton && (
            <Button variant="outlined" color="primary" onClick={handleGoHome}>
              Retour à l'accueil
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ErrorDisplay;
