import { toast as reactToast } from "react-toastify";

/**
 * Hook personnalisé pour gérer les notifications toast
 * @returns {Object} Fonctions pour afficher différents types de toast
 */
export const useToast = () => {
  // Configuration par défaut
  const defaultOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "light",
  };

  const toast = {
    /**
     * Affiche un toast informatif
     * @param {string} message - Message à afficher
     * @param {Object} options - Options additionnelles
     */
    info: (message, options = {}) => {
      if (!message) return;

      try {
        reactToast.info(message, {
          ...defaultOptions,
          ...options,
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage du toast info:", error);
      }
    },

    /**
     * Affiche un toast de succès
     * @param {string} message - Message à afficher
     * @param {Object} options - Options additionnelles
     */
    success: (message, options = {}) => {
      if (!message) return;

      try {
        reactToast.success(message, {
          ...defaultOptions,
          ...options,
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage du toast success:", error);
      }
    },

    /**
     * Affiche un toast d'avertissement
     * @param {string} message - Message à afficher
     * @param {Object} options - Options additionnelles
     */
    warning: (message, options = {}) => {
      if (!message) return;

      try {
        reactToast.warning(message, {
          ...defaultOptions,
          ...options,
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage du toast warning:", error);
      }
    },

    /**
     * Affiche un toast d'erreur
     * @param {string} message - Message à afficher
     * @param {Object} options - Options additionnelles
     */
    error: (message, options = {}) => {
      if (!message) return;

      try {
        reactToast.error(message, {
          ...defaultOptions,
          ...options,
        });
      } catch (error) {
        console.error("Erreur lors de l'affichage du toast error:", error);
      }
    },

    /**
     * Affiche un toast en fonction du type spécifié
     * @param {string} type - Type de toast (info, success, warning, error)
     * @param {string} message - Message à afficher
     * @param {Object} options - Options additionnelles
     */
    custom: (type, message, options = {}) => {
      if (!message) return;

      try {
        switch (type) {
          case "success":
            toast.success(message, options);
            break;
          case "warning":
            toast.warning(message, options);
            break;
          case "error":
            toast.error(message, options);
            break;
          default:
            toast.info(message, options);
        }
      } catch (error) {
        console.error("Erreur lors de l'affichage du toast custom:", error);
      }
    },
  };

  return { toast };
};

export default useToast;
