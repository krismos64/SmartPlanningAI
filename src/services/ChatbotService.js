import axios from "axios";
import ChatbotRulesIntegration from "../components/ui/ChatbotRulesIntegration";
import AuthService from "./AuthService";

/**
 * Service pour interagir avec l'API du chatbot
 * Gère les requêtes vers le backend pour le traitement des messages et les réponses basées sur des règles
 */
class ChatbotService {
  static instance = null;
  static rulesIntegration = null;

  /**
   * Initialiser le service de chatbot
   * @param {Object} callbacks - Callbacks pour le chatbot
   */
  static initialize(callbacks) {
    if (!this.rulesIntegration) {
      this.rulesIntegration = new ChatbotRulesIntegration({
        onAddBotMessage: callbacks.onAddBotMessage || (() => {}),
        onStartScheduleGeneration:
          callbacks.onStartScheduleGeneration || (() => {}),
        onSetIsTyping: callbacks.onSetIsTyping || (() => {}),
        onHandleActionResult: callbacks.onHandleActionResult || (() => {}),
      });
      console.log("ChatbotService initialisé avec ChatbotRulesIntegration");
    }
  }

  /**
   * Obtenir les en-têtes d'authentification
   * @returns {Object} En-têtes d'authentification
   */
  getAuthHeader() {
    const user = AuthService.getUserInfo();
    // Si l'utilisateur est authentifié, on peut ajouter d'autres en-têtes si nécessaire
    return {
      "Content-Type": "application/json",
      // Les cookies de session seront automatiquement inclus par le navigateur
    };
  }

  /**
   * Traiter un message utilisateur
   * @param {string} message - Message à traiter
   * @returns {Promise<Object>} Résultat du traitement
   */
  static async processMessage(message) {
    if (!this.rulesIntegration) {
      console.error(
        "ChatbotService: ChatbotRulesIntegration n'est pas initialisé"
      );
      return {
        success: false,
        intent: "ERROR",
        message: "Le service de chatbot n'est pas initialisé",
      };
    }

    try {
      const result = await this.rulesIntegration.processMessage(message);

      // Adapter le format de réponse à l'ancien format pour compatibilité
      if (result.processed) {
        return {
          success: true,
          intent: result.action || "PROCESSED",
          entities: {},
          message: result.response || "",
        };
      } else {
        return {
          success: false,
          intent: "UNKNOWN",
          message: "Je ne comprends pas votre demande",
        };
      }
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
      return {
        success: false,
        intent: "ERROR",
        message: "Une erreur s'est produite",
      };
    }
  }

  /**
   * Détecter l'intention de base à partir d'un message
   * @param {string} message - Message à analyser
   * @returns {string} Intention détectée
   */
  static detectBasicIntent(message) {
    const normalizedMessage = message.toLowerCase().trim();

    // Intentions basiques pour le fallback
    if (
      normalizedMessage.includes("planning") ||
      normalizedMessage.includes("genere") ||
      normalizedMessage.includes("générer") ||
      normalizedMessage.includes("schedule")
    ) {
      return "GENERATE_SCHEDULE";
    }

    if (
      normalizedMessage.includes("congé") ||
      normalizedMessage.includes("vacances") ||
      normalizedMessage.includes("absence")
    ) {
      return "CHECK_VACATIONS";
    }

    if (
      normalizedMessage.includes("aide") ||
      normalizedMessage.includes("help") ||
      normalizedMessage.includes("assistance")
    ) {
      return "GET_HELP";
    }

    return "UNKNOWN";
  }

  /**
   * Obtenir une réponse pour une intention
   * @param {string} intent - Intention
   * @returns {string} Réponse textuelle
   */
  static getIntentResponse(intent) {
    switch (intent) {
      case "GENERATE_SCHEDULE":
        return "Je lance la génération de planning...";
      case "CHECK_VACATIONS":
        return "Voici les informations sur les congés.";
      case "GET_HELP":
        return "Voici comment je peux vous aider.";
      case "UNKNOWN":
      default:
        return "Je ne comprends pas votre demande. Pouvez-vous reformuler ?";
    }
  }

  /**
   * Générer un planning optimisé
   * @param {string|Date} startDate - Date de début du planning
   * @param {string|Date} endDate - Date de fin du planning
   * @param {string|Array} employees - Liste des employés ou "tous"
   * @returns {Promise<Object>} Planning généré
   */
  async generateSchedule(startDate, endDate, employees) {
    try {
      // Conversion des paramètres au format attendu par l'API
      const params = {
        weekStart: startDate,
        departmentId: null, // À ajuster selon le contexte
        minHoursPerEmployee: 0, // Valeurs par défaut
        maxHoursPerEmployee: 40,
        openingHours: null,
        employeeIds: Array.isArray(employees) ? employees : null,
        priorityRules: [],
      };

      const response = await axios.post(
        "/api/chatbot/generate-schedule",
        {
          week_start: params.weekStart,
          department_id: params.departmentId,
          min_hours_per_employee: params.minHoursPerEmployee,
          max_hours_per_employee: params.maxHoursPerEmployee,
          opening_hours: params.openingHours,
          employee_ids: params.employeeIds,
          priority_rules: params.priorityRules,
        },
        { headers: this.getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la génération du planning:", error);
      // Retourner un format d'erreur standardisé
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Erreur lors de la génération du planning",
      };
    }
  }

  /**
   * Générer un planning localement (pour le mode privé)
   * @param {Object} data - Données pour la génération
   * @returns {Promise<Object>} Planning généré localement
   */
  async generateScheduleLocally(data) {
    try {
      // Simuler un traitement local
      // En production, cette méthode utiliserait des algorithmes locaux
      console.log("Génération locale du planning avec les données:", data);

      // Créer un planning simulé
      const schedule = {
        id: "local-" + Date.now(),
        title: "Planning généré localement",
        startDate: data.startDate,
        endDate: data.endDate,
        shifts: [],
        employees:
          data.employees === "tous" ? ["Tous les employés"] : data.employees,
      };

      // Simuler quelques shifts dans le planning
      const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
      const shifts = ["Matin", "Après-midi", "Soir"];

      for (let i = 0; i < 5; i++) {
        schedule.shifts.push({
          id: `shift-${i}`,
          day: days[i % days.length],
          time: shifts[i % shifts.length],
          employee:
            Array.isArray(data.employees) && data.employees.length > 0
              ? data.employees[i % data.employees.length]
              : "Employé " + (i + 1),
        });
      }

      return {
        success: true,
        schedule,
      };
    } catch (error) {
      console.error("Erreur lors de la génération locale du planning:", error);
      return {
        success: false,
        message: "Erreur lors de la génération locale du planning",
      };
    }
  }

  /**
   * Suggérer des modifications à un planning existant
   * @param {string} scheduleId - ID du planning à modifier
   * @param {Object} constraints - Contraintes pour les suggestions
   * @returns {Promise<Object>} Suggestions de modifications
   */
  async suggestModifications(scheduleId, constraints) {
    try {
      const response = await axios.post(
        "/api/chatbot/suggest-modifications",
        {
          schedule_id: scheduleId,
          constraints,
        },
        { headers: this.getAuthHeader() }
      );

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suggestion de modifications:", error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques personnalisées pour l'utilisateur
   * @returns {Promise<Object>} Statistiques utilisateur
   */
  async getUserStats() {
    try {
      const response = await axios.get("/api/chatbot/user-stats", {
        headers: this.getAuthHeader(),
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }

  /**
   * Traiter une action
   * @param {string} action - Action à traiter
   * @returns {Promise<Object>} Résultat de l'action
   */
  static async handleAction(action) {
    if (!this.rulesIntegration) {
      console.error(
        "ChatbotService: ChatbotRulesIntegration n'est pas initialisé"
      );
      return {
        success: false,
        message: "Le service de chatbot n'est pas initialisé",
      };
    }

    try {
      const result = await this.rulesIntegration.handleAction(action);

      // Adapter le format de réponse à l'ancien format pour compatibilité
      return {
        success: result.success || false,
        response: result.response || "",
        suggestions: result.suggestions || [],
      };
    } catch (error) {
      console.error("Erreur lors du traitement de l'action:", error);
      return {
        success: false,
        response: "Une erreur s'est produite",
      };
    }
  }
}

export default ChatbotService;
