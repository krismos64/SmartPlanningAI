/**
 * Intercepteur pour déboguer les erreurs [object Object]
 * Ce fichier met en place des intercepteurs pour diagnostiquer
 * les problèmes liés aux appels de handleError.
 */

import { formatError } from "./errorHandling";

// Flag pour éviter la récursion infinie
let isIntercepting = false;

/**
 * Configure des intercepteurs pour détecter et analyser les appels
 * à handleError qui produisent des erreurs [object Object].
 * Cet intercepteur doit être appelé au démarrage de l'application.
 */
export const setupErrorInterceptors = () => {
  // Intercepte toutes les erreurs au niveau global
  const originalConsoleError = console.error;
  console.error = function (...args) {
    // Éviter la récursion infinie
    if (isIntercepting) {
      return originalConsoleError.apply(console, args);
    }

    try {
      isIntercepting = true;

      // Si l'erreur contient [object Object], on l'analyse
      if (
        args.length > 0 &&
        typeof args[0] === "string" &&
        args[0].includes("[object Object]")
      ) {
        originalConsoleError.call(
          console,
          "❌ Intercepté une erreur [object Object]:",
          args
        );

        // Examiner le stacktrace pour identifier le problème
        try {
          const stack = new Error().stack;
          const stackLines = stack.split("\n");
          const relevantLines = stackLines.filter(
            (line) => line.includes("handleError") || line.includes("bundle.js")
          );

          originalConsoleError.call(
            console,
            "🔍 Contexte de handleError:",
            relevantLines
          );
        } catch (e) {
          originalConsoleError.call(
            console,
            "❌ Erreur lors de l'analyse du stacktrace:",
            formatError(e)
          );
        }
      }

      // Appeler la fonction originale avec les mêmes arguments
      return originalConsoleError.apply(console, args);
    } finally {
      isIntercepting = false;
    }
  };

  // Intercepter window.onerror pour capturer les erreurs liées à handleError
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (isIntercepting) {
      // Appeler le gestionnaire original si en cours d'interception pour éviter la récursion
      if (typeof originalOnError === "function") {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    }

    try {
      isIntercepting = true;

      if (message && message.toString().includes("[object Object]")) {
        originalConsoleError.call(
          console,
          "⚠️ Erreur window.onerror [object Object]:",
          {
            message,
            source,
            lineno,
            colno,
            errorStr: formatError(error),
            stack: error?.stack,
          }
        );
      }

      // Appeler le gestionnaire original s'il existe
      if (typeof originalOnError === "function") {
        return originalOnError(message, source, lineno, colno, error);
      }

      // Ne pas bloquer l'erreur
      return false;
    } finally {
      isIntercepting = false;
    }
  };

  // Remplacer temporairement la fonction handleError par notre version de débogage
  try {
    if (window.handleError) {
      const originalHandleError = window.handleError;
      originalConsoleError.call(
        console,
        "🔄 handleError intercepté sur window"
      );

      window.handleError = function (error) {
        if (isIntercepting) {
          return originalHandleError(error);
        }

        try {
          isIntercepting = true;
          originalConsoleError.call(
            console,
            "🔍 handleError appelé avec:",
            error
          );

          // Essayer d'utiliser notre formatError avant d'appeler l'original
          const formattedError = formatError(error);
          originalConsoleError.call(
            console,
            "✓ Erreur formatée:",
            formattedError
          );
          return originalHandleError(formattedError);
        } catch (e) {
          originalConsoleError.call(
            console,
            "❌ Erreur dans notre intercepteur:",
            formatError(e)
          );
          return originalHandleError(error);
        } finally {
          isIntercepting = false;
        }
      };
    } else {
      originalConsoleError.call(
        console,
        "⚠️ handleError non trouvé sur window"
      );

      // Définir une fonction handleError globale améliorée
      window.handleError = function (error) {
        if (isIntercepting) {
          return formatError(error);
        }

        try {
          isIntercepting = true;
          const formattedError = formatError(error);
          originalConsoleError.call(
            console,
            "🆕 Notre handleError appelé:",
            formattedError
          );
          return formattedError;
        } finally {
          isIntercepting = false;
        }
      };
    }
  } catch (e) {
    originalConsoleError.call(
      console,
      "❌ Erreur lors de l'interception de handleError:",
      formatError(e)
    );
  }

  return function cleanup() {
    console.error = originalConsoleError;
    window.onerror = originalOnError;
  };
};

/**
 * Hook pour réagir dynamiquement lorsqu'un élément avec l'ID est disponible
 */
export const interceptElementById = (elementId, callback) => {
  // Observer pour l'élément avec l'ID spécifié
  const observer = new MutationObserver((mutations) => {
    const element = document.getElementById(elementId);
    if (element) {
      callback(element);
      observer.disconnect();
    }
  });

  // Démarrer l'observation
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};

export default setupErrorInterceptors;
