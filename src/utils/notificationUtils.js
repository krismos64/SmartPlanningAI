/**
 * Utilitaires pour la gestion des notifications toast
 * Centralise la logique de notification pour toute l'application
 */

import { toast } from "react-hot-toast";

// Variable pour stocker le dernier message affiché afin d'éviter les doublons
let lastMessage = {
  text: "",
  type: "",
  timestamp: 0,
};

/**
 * Affiche une notification toast tout en évitant les doublons
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (success, error, info, warning)
 * @param {function} setErrorFunc - Fonction optionnelle pour mettre à jour l'état d'erreur local
 */
export const displayNotification = (
  message,
  type = "error",
  setErrorFunc = null
) => {
  // Éviter les messages vides ou invalides
  if (!message || typeof message !== "string") return;

  // Éviter les doublons dans un court laps de temps (1 seconde)
  const now = Date.now();
  if (
    message === lastMessage.text &&
    type === lastMessage.type &&
    now - lastMessage.timestamp < 1000
  ) {
    return; // Ne pas afficher le même message deux fois en moins d'une seconde
  }

  // Mettre à jour le dernier message
  lastMessage = {
    text: message,
    type,
    timestamp: now,
  };

  // Afficher la notification Toast selon le type
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "warning":
      toast.warning(message);
      break;
    default:
      toast(message);
  }

  // Ne mettre à jour l'état d'erreur que si nous avons une fonction setError
  // et seulement pour les messages d'erreur (pas les succès)
  if (setErrorFunc && type === "error") {
    setErrorFunc(message);
  }
};

/**
 * Affiche une notification de succès
 * @param {string} message - Le message à afficher
 */
export const notifySuccess = (message) => {
  displayNotification(message, "success");
};

/**
 * Affiche une notification d'erreur
 * @param {string} message - Le message à afficher
 * @param {function} setErrorFunc - Fonction optionnelle pour mettre à jour l'état d'erreur local
 */
export const notifyError = (message, setErrorFunc = null) => {
  displayNotification(message, "error", setErrorFunc);
};

/**
 * Affiche une notification d'information
 * @param {string} message - Le message à afficher
 */
export const notifyInfo = (message) => {
  displayNotification(message, "info");
};

/**
 * Affiche une notification d'avertissement
 * @param {string} message - Le message à afficher
 */
export const notifyWarning = (message) => {
  displayNotification(message, "warning");
};

export default {
  displayNotification,
  notifySuccess,
  notifyError,
  notifyInfo,
  notifyWarning,
};
