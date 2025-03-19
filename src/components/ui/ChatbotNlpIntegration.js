import { useCallback } from "react";
import ChatbotService from "../../services/ChatbotService";

/**
 * Composant d'intégration pour le chatbot et le service NLP
 * Expose des méthodes pour l'analyse de messages et la génération de plannings
 */
const ChatbotNlpIntegration = ({
  onProcessMessage,
  onStartScheduleGeneration,
  onAddMessage,
  onSetIsTyping,
}) => {
  /**
   * Traite un message utilisateur avec le service NLP et retourne l'intention détectée
   * @param {string} message - Message à traiter
   * @returns {Promise<Object>} Résultat du traitement
   */
  const processMessage = useCallback(
    async (message) => {
      try {
        onSetIsTyping(true);

        // Essayer d'utiliser le service NLP
        try {
          // Appeler l'API NLP
          const result = await ChatbotService.processMessage(message);

          console.log("Résultat de l'analyse NLP:", result);

          if (result.intent === "GENERATE_SCHEDULE") {
            onStartScheduleGeneration();
            return { processed: true };
          }

          if (result.intent !== "UNKNOWN") {
            onProcessMessage(result.intent, result.entities);
            return {
              processed: true,
              intent: result.intent,
              entities: result.entities,
            };
          }

          return { processed: false };
        } catch (error) {
          console.error("Erreur lors de l'utilisation du service NLP:", error);

          // Utiliser le fallback client
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
      } catch (error) {
        console.error("Erreur dans processMessage:", error);
        onAddMessage(
          "Désolé, j'ai rencontré une erreur lors du traitement de votre message.",
          "assistant"
        );
        return { processed: true, error: true };
      } finally {
        onSetIsTyping(false);
      }
    },
    [onProcessMessage, onStartScheduleGeneration, onAddMessage, onSetIsTyping]
  );

  /**
   * Génère un planning basé sur les données collectées
   * @param {Object} data - Données pour la génération du planning
   * @returns {Promise<Object>} Résultat de la génération
   */
  const generateSchedule = useCallback(async (data) => {
    try {
      // Préparer les données pour l'API
      const apiParams = {
        weekStart: data.weekStart,
        departmentId: data.department,
        minHoursPerEmployee: data.minHours,
        maxHoursPerEmployee: data.maxHours,
        openingHours: {
          monday: {
            start: data.openingHours?.start,
            end: data.openingHours?.end,
          },
          tuesday: {
            start: data.openingHours?.start,
            end: data.openingHours?.end,
          },
          wednesday: {
            start: data.openingHours?.start,
            end: data.openingHours?.end,
          },
          thursday: {
            start: data.openingHours?.start,
            end: data.openingHours?.end,
          },
          friday: {
            start: data.openingHours?.start,
            end: data.openingHours?.end,
          },
          saturday: { start: null, end: null },
          sunday: { start: null, end: null },
        },
      };

      // Si des employés spécifiques sont sélectionnés
      if (data.employeeSelection === "select" && data.selectedEmployees) {
        apiParams.employeeIds = data.selectedEmployees;
      }

      // Appeler le service pour générer le planning
      const result = await ChatbotService.generateSchedule(apiParams);
      return result;
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }, []);

  // Retourner les méthodes exposées
  return {
    processMessage,
    generateSchedule,
  };
};

export default ChatbotNlpIntegration;
