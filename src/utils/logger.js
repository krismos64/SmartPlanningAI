/**
 * Utilitaire pour gérer les logs et débogage côté client
 */

// Niveau de verbosité basé sur l'environnement
const VERBOSE =
  process.env.REACT_APP_DEBUG === "true" ||
  process.env.NODE_ENV !== "production";

/**
 * Logger personnalisé avec différents niveaux et formats
 */
const logger = {
  info: (message, ...args) => {
    if (VERBOSE) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  debug: (message, ...args) => {
    if (VERBOSE) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  error: (message, error, ...args) => {
    const formattedError =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    console.error(`[ERROR] ${message}`, formattedError, ...args);

    // Enregistrer des erreurs critiques dans la session pour débogge
    if (typeof window !== "undefined") {
      const errors = JSON.parse(sessionStorage.getItem("app_errors") || "[]");
      errors.push({
        timestamp: new Date().toISOString(),
        message,
        error: formattedError,
        location: window.location.href,
      });
      sessionStorage.setItem("app_errors", JSON.stringify(errors.slice(-20))); // Limiter à 20 erreurs
    }
  },

  // Utilitaire pour afficher l'état des requêtes API
  api: (method, url, status, data) => {
    if (VERBOSE) {
      const statusText = status >= 200 && status < 300 ? "✅" : "❌";
      console.groupCollapsed(
        `[API] ${statusText} ${method} ${url} (${status})`
      );
      console.log("Données:", data);
      console.groupEnd();
    }
  },

  // Récupérer toutes les erreurs stockées
  getStoredErrors: () => {
    if (typeof window !== "undefined") {
      return JSON.parse(sessionStorage.getItem("app_errors") || "[]");
    }
    return [];
  },

  // Nettoyer le stockage d'erreurs
  clearStoredErrors: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("app_errors");
    }
  },
};

export default logger;
