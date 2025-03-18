import { useCallback } from "react";

/**
 * Hook personnalisé pour gérer une connexion WebSocket - DÉSACTIVÉ pour des raisons de performance
 * Cette version retourne uniquement des méthodes factices pour maintenir la compatibilité
 * tout en désactivant la fonctionnalité WebSocket qui ralentit l'application
 *
 * @returns {Object} - Objet contenant des fonctions factices
 */
const useWebSocket = () => {
  console.log(
    "useWebSocket: Connexion WebSocket désactivée pour améliorer les performances"
  );

  // Fonction factice pour envoyer un message
  const sendMessage = useCallback(() => {
    console.log("WebSocket désactivé: sendMessage n'a aucun effet");
    return Promise.resolve(null);
  }, []);

  // Fonction factice pour se connecter
  const connect = useCallback(() => {
    console.log("WebSocket désactivé: connect n'a aucun effet");
    return null;
  }, []);

  // Fonction factice pour se déconnecter
  const disconnect = useCallback(() => {
    console.log("WebSocket désactivé: disconnect n'a aucun effet");
  }, []);

  // Fonction factice pour ajouter un écouteur d'événements
  const addMessageListener = useCallback(() => {
    console.log("WebSocket désactivé: addMessageListener n'a aucun effet");
    // Retourner une fonction de nettoyage factice pour maintenir la compatibilité
    return () => {};
  }, []);

  // Fonction factice pour demander les activités
  const requestActivitiesUpdate = useCallback(() => {
    console.log("WebSocket désactivé: requestActivitiesUpdate n'a aucun effet");
    return false;
  }, []);

  // Fonction factice pour notifier les changements de données
  const notifyDataChange = useCallback(() => {
    console.log("WebSocket désactivé: notifyDataChange n'a aucun effet");
    return false;
  }, []);

  // Fonction factice pour effacer les messages
  const clearMessages = useCallback(() => {
    console.log("WebSocket désactivé: clearMessages n'a aucun effet");
  }, []);

  // Fonction factice pour réinitialiser le mode de secours
  const resetFallbackMode = useCallback(() => {
    console.log("WebSocket désactivé: resetFallbackMode n'a aucun effet");
  }, []);

  // Fonction factice pour activer le mode de secours
  const activateFallbackMode = useCallback(() => {
    console.log("WebSocket désactivé: activateFallbackMode n'a aucun effet");
  }, []);

  // Retourner l'interface du hook avec des fonctions factices
  return {
    socket: null,
    isConnected: false,
    fallbackMode: true,
    messages: [],
    activities: [],
    sendMessage,
    connect,
    disconnect,
    addMessageListener,
    requestActivitiesUpdate,
    notifyDataChange,
    clearMessages,
    resetFallbackMode,
    activateFallbackMode,
    setActivities: () => {},
  };
};

export default useWebSocket;
