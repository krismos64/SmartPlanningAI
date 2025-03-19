import axios from "axios";
import { getAuthHeader } from "./AuthService";

/**
 * Service pour interagir avec l'API du chatbot
 * Gère les requêtes vers le backend pour le traitement des messages et la génération de planning
 */
class ChatbotService {
  /**
   * Traiter un message utilisateur avec le service NLP
   * @param {string} message - Message à traiter
   * @returns {Promise<Object>} Résultat du traitement NLP
   */
  async processMessage(message) {
    try {
      const response = await axios.post(
        "/api/chatbot/process",
        { message },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);

      // Simulation de réponse en cas d'échec de l'API
      // Détection basique d'intention côté client
      const intent = this.detectBasicIntent(message);

      return {
        intent,
        score: 0.7,
        entities: {},
        message,
        fromFallback: true,
      };
    }
  }

  /**
   * Détection basique d'intention côté client (fallback)
   * @param {string} message - Message à analyser
   * @returns {string} Intention détectée
   */
  detectBasicIntent(message) {
    message = message.toLowerCase();

    if (/aide|help|comment|fonctionne/.test(message)) {
      return "HELP";
    }

    if (/génér|créer|faire|nouveau|planning/.test(message)) {
      return "GENERATE_SCHEDULE";
    }

    if (/voir|affiche|consulter|montre|planning|horaire/.test(message)) {
      return "VIEW_SCHEDULE";
    }

    if (/congé|vacance|absence|repos/.test(message)) {
      if (/poser|demande|créer|nouveau/.test(message)) {
        return "CREATE_VACATION_REQUEST";
      }
      if (/vérif|check|puis-je|possible/.test(message)) {
        return "CHECK_VACATION_AVAILABILITY";
      }
    }

    if (/statistique|stat|rapport|bilan|heure/.test(message)) {
      return "GET_STATS";
    }

    if (/optimis|meilleur|suggère|améliore/.test(message)) {
      return "GET_OPTIMAL_SCHEDULE";
    }

    if (/liste|employé|équipe|collaborateur/.test(message)) {
      return "LIST_EMPLOYEES";
    }

    return "UNKNOWN";
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
        { headers: getAuthHeader() }
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
        { headers: getAuthHeader() }
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
        headers: getAuthHeader(),
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      throw error;
    }
  }
}

export default new ChatbotService();
