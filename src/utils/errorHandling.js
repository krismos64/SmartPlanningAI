/**
 * Utilitaires pour la gestion des erreurs dans l'application
 */

// Flag pour éviter la récursion infinie entre console.error et logger
let isLoggingError = false;

/**
 * Formate les erreurs pour qu'elles soient lisibles
 * @param {Error|string|Object} error - L'erreur à formater
 * @returns {string} Message d'erreur formaté
 */
export const formatError = (error) => {
  // Si aucune erreur n'est fournie
  if (!error) {
    return "Erreur inconnue";
  }

  // Si l'erreur est déjà une chaîne
  if (typeof error === "string") {
    return replaceObjectObjectInString(error);
  }

  // Si l'erreur est un objet Error standard
  if (error instanceof Error) {
    return error.message || "Erreur sans message";
  }

  // Si l'erreur est une réponse API avec un message
  if (error.message && typeof error.message === "string") {
    return replaceObjectObjectInString(error.message);
  }

  // Si l'erreur est une réponse API avec un champ error
  if (error.error && typeof error.error === "string") {
    return replaceObjectObjectInString(error.error);
  }

  // Si l'erreur a un code et un message (format standard HTTP)
  if (error.status && error.statusText) {
    return `${error.status}: ${error.statusText}`;
  }

  // Pour les tableaux, formater chaque élément
  if (Array.isArray(error)) {
    try {
      return `[${error
        .map((item) =>
          typeof item === "object" ? formatError(item) : String(item)
        )
        .join(", ")}]`;
    } catch (e) {
      return "Tableau d'erreurs non formaté";
    }
  }

  // Tente de convertir en JSON de manière sécurisée
  try {
    if (typeof error === "object" && error !== null) {
      // Créer une version sécurisée de l'objet pour la sérialisation
      const safeError = Object.keys(error).reduce((acc, key) => {
        try {
          const value = error[key];
          if (
            typeof value === "object" &&
            value !== null &&
            !(value instanceof Date)
          ) {
            acc[key] = "[Objet complexe]";
          } else {
            acc[key] = value;
          }
        } catch (e) {
          acc[key] = "[Inaccessible]";
        }
        return acc;
      }, {});

      return replaceObjectObjectInString(JSON.stringify(safeError));
    }
    return replaceObjectObjectInString(JSON.stringify(error));
  } catch (e) {
    // Ne pas appeler logger.error ici pour éviter la récursion
    return "Erreur non formatée";
  }
};

/**
 * Remplace les occurrences de [object Object] par un message plus clair
 */
export const replaceObjectObjectInString = (str) => {
  if (typeof str !== "string") return str;
  return str.replace(/\[object Object\]/g, "Erreur inconnue");
};

/**
 * Configure un gestionnaire d'erreurs global sans créer de boucle infinie
 */
export const setupGlobalErrorHandler = () => {
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  // Remplacer console.error pour capturer les erreurs sans créer de boucle infinie
  console.error = function (...args) {
    // Si on est déjà en train de loguer une erreur, on utilise directement la fonction originale
    // pour éviter la récursion infinie
    if (isLoggingError) {
      return originalConsoleError.apply(console, args);
    }

    try {
      isLoggingError = true;

      // Formater les arguments
      const formattedArgs = args.map((arg) => {
        if (typeof arg === "object" && arg !== null) {
          try {
            return formatError(arg);
          } catch (e) {
            return "Erreur lors du formatage";
          }
        }
        return arg;
      });

      // Utiliser la fonction originale
      originalConsoleError.apply(console, formattedArgs);
    } finally {
      isLoggingError = false;
    }
  };

  // Sécuriser également console.log pour éviter les [object Object]
  console.log = function (...args) {
    if (isLoggingError) {
      return originalConsoleLog.apply(console, args);
    }

    try {
      isLoggingError = true;

      const formattedArgs = args.map((arg) => {
        if (typeof arg === "object" && arg !== null) {
          try {
            // Pour les objets en log, utiliser une version simplifiée pour éviter d'alourdir les logs
            if (arg instanceof Error) {
              return arg.message || "Erreur sans message";
            }

            // Pour les objets DOM ou les objets circulaires, éviter la sérialisation
            if (arg instanceof Element || arg instanceof Node) {
              return "[Élément DOM]";
            }

            return arg.toString !== Object.prototype.toString
              ? arg.toString()
              : JSON.stringify(arg);
          } catch (e) {
            return "[Objet non affichable]";
          }
        }
        return arg;
      });

      originalConsoleLog.apply(console, formattedArgs);
    } finally {
      isLoggingError = false;
    }
  };

  // Gestionnaire pour les erreurs non capturées sans créer de boucle infinie
  const errorHandler = (event) => {
    const { error, message } = event;
    try {
      isLoggingError = true;
      const formattedError = formatError(error || message);
      originalConsoleError.call(
        console,
        "Erreur globale non capturée:",
        formattedError
      );

      // Si window.handleError existe, on s'assure qu'elle reçoit des erreurs formatées
      if (window.handleError && typeof window.handleError === "function") {
        try {
          window.handleError(formattedError);
        } catch (e) {
          originalConsoleError.call(
            console,
            "Échec lors de l'appel à handleError:",
            formatError(e)
          );
        }
      }
    } finally {
      isLoggingError = false;
    }
  };

  // Gestionnaire pour les rejets de promesses non gérés
  const unhandledRejectionHandler = (event) => {
    try {
      isLoggingError = true;
      const formattedError = formatError(event.reason);
      originalConsoleError.call(
        console,
        "Promesse rejetée non gérée:",
        formattedError
      );

      // Si window.handleError existe, on s'assure qu'elle reçoit des erreurs formatées
      if (window.handleError && typeof window.handleError === "function") {
        try {
          window.handleError(formattedError);
        } catch (e) {
          originalConsoleError.call(
            console,
            "Échec lors de l'appel à handleError:",
            formatError(e)
          );
        }
      }
    } finally {
      isLoggingError = false;
    }
  };

  // Ajouter les écouteurs d'événements
  window.addEventListener("error", errorHandler);
  window.addEventListener("unhandledrejection", unhandledRejectionHandler);

  // Fonction de nettoyage
  return () => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    window.removeEventListener("error", errorHandler);
    window.removeEventListener("unhandledrejection", unhandledRejectionHandler);
  };
};

/**
 * Gère les erreurs provenant des appels API
 * @param {Error|Object} error - L'erreur à gérer
 * @returns {Object} Réponse d'erreur normalisée
 */
export const handleApiError = (error) => {
  const formattedError = formatError(error);

  // Utiliser directement console.error avec le drapeau isLoggingError
  try {
    isLoggingError = true;
    console.error("Erreur API:", formattedError);
  } finally {
    isLoggingError = false;
  }

  // Structure normalisée de la réponse d'erreur
  return {
    success: false,
    message: formattedError,
    error: true,
    status: error.status || 500,
    data: null,
  };
};

/**
 * Injecte notre formatage d'erreur dans window.handleError si elle existe
 */
export const injectErrorFormatting = () => {
  // Exposer notre formateur dans window
  window.formatErrorFromUtils = formatError;

  // Si handleError existe déjà, on l'intercepte
  if (window.handleError) {
    const original = window.handleError;
    window.handleError = (error) => {
      const formatted = formatError(error);
      try {
        isLoggingError = true;
        console.log(
          "handleError appelé avec:",
          error,
          "formaté en:",
          formatted
        );
      } finally {
        isLoggingError = false;
      }
      return original(formatted);
    };
  } else {
    // Sinon, on surveille sa création
    Object.defineProperty(window, "handleError", {
      configurable: true,
      enumerable: true,
      get: function () {
        return this._handleError;
      },
      set: function (newFunc) {
        if (typeof newFunc === "function") {
          this._handleError = (error) => {
            const formatted = formatError(error);
            try {
              isLoggingError = true;
              console.log(
                "handleError défini appelé avec:",
                error,
                "formaté en:",
                formatted
              );
            } finally {
              isLoggingError = false;
            }
            return newFunc(formatted);
          };
        } else {
          this._handleError = newFunc;
        }
      },
    });
  }
};

// Exporter une fonction pour initialiser tous les traitements d'erreur
export const initializeErrorHandling = () => {
  const cleanup = setupGlobalErrorHandler();
  injectErrorFormatting();
  return cleanup;
};
