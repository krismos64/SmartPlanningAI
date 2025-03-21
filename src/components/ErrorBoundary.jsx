import { Box, Button, Container, Paper, Typography } from "@mui/material";
import React from "react";
import { formatError } from "../utils/errorHandling";

/**
 * Composant de gestion d'erreurs globales
 * Capture les erreurs non gérées dans les composants enfants
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Mise à jour de l'état lorsqu'une erreur est capturée
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Capture les détails de l'erreur et du stack trace
   */
  componentDidCatch(error, errorInfo) {
    // Conversion des objets d'erreur en chaînes de caractères
    const errorStr = formatError(error);
    console.error("ErrorBoundary a capturé une erreur:", errorStr);
    console.error("Détails:", errorInfo);

    // Mettre à jour l'état avec les informations d'erreur
    this.setState({
      errorInfo,
    });
  }

  /**
   * Réinitialiser l'état de l'erreur et tenter de récupérer
   */
  handleResetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    // Si une erreur a été capturée, afficher l'interface de gestion d'erreur
    if (this.state.hasError) {
      // Formatage du message d'erreur
      const errorMessage = formatError(this.state.error);

      return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom color="error">
              Une erreur est survenue
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {errorMessage}
            </Typography>

            <Box
              sx={{
                my: 2,
                p: 2,
                bgcolor: "#f5f5f5",
                borderRadius: 1,
                overflow: "auto",
                maxHeight: "200px",
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              >
                {this.state.errorInfo && this.state.errorInfo.componentStack
                  ? this.state.errorInfo.componentStack
                  : "Détails non disponibles"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleResetError}
              >
                Réessayer
              </Button>

              <Button
                variant="outlined"
                color="primary"
                onClick={() => (window.location.href = "/")}
              >
                Retour à l'accueil
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    // Si tout va bien, rendre les enfants normalement
    return this.props.children;
  }
}

export default ErrorBoundary;
