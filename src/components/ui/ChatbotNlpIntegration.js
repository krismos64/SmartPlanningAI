import { useCallback } from "react";
import ChatbotService from "../../services/ChatbotService";

/**
 * Composant d'intégration pour le chatbot et le système de règles
 * Expose des méthodes pour l'analyse de messages et la gestion des actions
 */
const ChatbotRulesIntegration = ({
  onProcessMessage,
  onStartScheduleGeneration,
  onAddMessage,
  onSetIsTyping,
  onHandleAction,
}) => {
  /**
   * Traite un message utilisateur avec le service de règles
   * @param {string} message - Message à traiter
   * @returns {Promise<Object>} Résultat du traitement
   */
  const processMessage = useCallback(
    async (message) => {
      try {
        onSetIsTyping(true);

        // Appeler l'API du chatbot
        const result = await ChatbotService.processMessage(message);

        console.log("Résultat du traitement:", result);

        // Si la réponse contient du texte, l'afficher directement
        if (result.message) {
          onAddMessage({
            id: Date.now(),
            text: result.message,
            sender: "bot",
            timestamp: new Date(),
            actions: result.actions || [],
          });

          onSetIsTyping(false);
          return { processed: true };
        }

        // Si des actions sont disponibles, les proposer
        if (result.actions && result.actions.length > 0) {
          onAddMessage({
            id: Date.now(),
            text:
              result.text || ChatbotService.getIntentResponse(result.intent),
            sender: "bot",
            timestamp: new Date(),
            actions: result.actions,
          });

          onSetIsTyping(false);
          return { processed: true, actions: result.actions };
        }

        // Si une intention spécifique est détectée
        if (result.intent === "GENERATE_SCHEDULE") {
          onStartScheduleGeneration();
          return { processed: true };
        }

        if (result.intent !== "UNKNOWN" && result.intent !== "ERROR") {
          onProcessMessage(result.intent, result.entities);
          return {
            processed: true,
            intent: result.intent,
            entities: result.entities,
          };
        }

        // En cas d'erreur spécifique
        if (result.error) {
          onAddMessage({
            id: Date.now(),
            text: result.text || "Désolé, une erreur est survenue.",
            sender: "bot",
            timestamp: new Date(),
            error: true,
          });

          onSetIsTyping(false);
          return { processed: true, error: true };
        }

        // Fallback pour les cas non gérés
        return { processed: false };
      } catch (error) {
        console.error("Erreur lors du traitement du message:", error);
        onSetIsTyping(false);

        // Utiliser le fallback client en cas d'erreur
        const intent = ChatbotService.detectBasicIntent(message);

        if (intent === "GENERATE_SCHEDULE") {
          onStartScheduleGeneration();
          return { processed: true };
        }

        if (intent !== "UNKNOWN") {
          onProcessMessage(intent, {});
          return { processed: true, intent, entities: {} };
        }

        return { processed: false };
      }
    },
    [onAddMessage, onProcessMessage, onSetIsTyping, onStartScheduleGeneration]
  );

  /**
   * Gère une action de suggestion
   * @param {string} action - L'action à exécuter
   */
  const handleAction = useCallback(
    async (action) => {
      try {
        onSetIsTyping(true);

        const actionResult = await ChatbotService.handleAction(action);

        // Si l'action a une réponse directe
        if (actionResult.response) {
          onAddMessage({
            id: Date.now(),
            text: actionResult.response,
            sender: "bot",
            timestamp: new Date(),
          });
        }

        // Si l'action nécessite une redirection
        if (actionResult.redirect) {
          onHandleAction({ type: "redirect", path: actionResult.redirect });
        }

        // Si l'action génère une nouvelle requête
        if (actionResult.query) {
          // Attendre un peu avant de traiter la nouvelle requête
          setTimeout(() => {
            processMessage(actionResult.query);
          }, 1000);
        }

        onSetIsTyping(false);
        return true;
      } catch (error) {
        console.error("Erreur lors du traitement de l'action:", error);
        onSetIsTyping(false);
        return false;
      }
    },
    [onAddMessage, onSetIsTyping, onHandleAction, processMessage]
  );

  return {
    processMessage,
    handleAction,
  };
};

export default ChatbotRulesIntegration;
