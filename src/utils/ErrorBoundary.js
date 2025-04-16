import { Component } from "react";
import logger from "./logger";

/**
 * Composant de limite d'erreur pour capturer les erreurs React
 * et les afficher de manière élégante
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'interface de secours
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Journaliser l'erreur détaillée
    logger.error("Erreur capturée par ErrorBoundary:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez remplacer ce rendu par une interface utilisateur plus élégante
      return (
        <div
          style={{
            padding: "20px",
            margin: "10px",
            border: "1px solid #f44336",
            borderRadius: "4px",
            backgroundColor: "#ffebee",
          }}
        >
          <h2>Une erreur s'est produite</h2>
          <p>Nous sommes désolés, une erreur inattendue s'est produite.</p>
          <p style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              Rafraîchir la page
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retour à l'accueil
            </button>
          </div>
          {process.env.NODE_ENV !== "production" && this.state.errorInfo && (
            <details style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
              <summary>Détails techniques (développement uniquement)</summary>
              <p style={{ fontFamily: "monospace" }}>
                {this.state.errorInfo.componentStack}
              </p>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
