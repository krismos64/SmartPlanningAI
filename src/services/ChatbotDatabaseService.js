import axios from "axios";
import AuthService from "./AuthService";

// Données de démonstration pour les tests sans backend
const DEMO_DATA = {
  absentToday: [
    { id: 1, name: "Jean Dupont", reason: "Congés payés" },
    { id: 2, name: "Marie Martin", reason: "RTT" },
    { id: 3, name: "Thomas Bernard", reason: "Maladie" },
  ],
  upcomingVacations: [
    {
      id: 1,
      name: "Sophie Petit",
      start_date: "15/08/2023",
      end_date: "28/08/2023",
    },
    {
      id: 2,
      name: "Pierre Leblanc",
      start_date: "20/08/2023",
      end_date: "27/08/2023",
    },
    {
      id: 3,
      name: "Mathilde Durand",
      start_date: "01/09/2023",
      end_date: "15/09/2023",
    },
  ],
  missingSchedules: [
    { id: 1, name: "Équipe Commercial", week: "Semaine 35" },
    { id: 2, name: "Équipe Technique", week: "Semaine 36" },
  ],
  negativeHours: [
    { id: 1, name: "Alexandre Dubois", balance: -4.5 },
    { id: 2, name: "Claire Moreau", balance: -2.0 },
    { id: 3, name: "Lucas Fournier", balance: -8.75 },
  ],
};

/**
 * Service pour accéder aux données de la base de données pour le chatbot
 */
class ChatbotDatabaseService {
  /**
   * Obtenir les en-têtes d'authentification
   * @returns {Object} En-têtes d'authentification
   */
  static getAuthHeader() {
    const user = AuthService.getUserInfo();
    return {
      "Content-Type": "application/json",
      // Les cookies de session seront automatiquement inclus par le navigateur
    };
  }

  /**
   * Vérifier si le backend est disponible
   * @returns {Promise<boolean>} Si le backend est disponible
   */
  static async isBackendAvailable() {
    try {
      const response = await axios.get("/api/health", {
        timeout: 1000,
      });
      return response.status === 200;
    } catch (error) {
      console.warn("Backend non disponible, utilisation des données de démo");
      return false;
    }
  }

  /**
   * Obtenir les employés absents aujourd'hui
   * @returns {Promise<Object>} Liste des employés absents
   */
  static async getAbsentEmployeesToday() {
    try {
      // Vérifier si le backend est disponible
      const backendAvailable = await this.isBackendAvailable();

      if (backendAvailable) {
        const response = await axios.get("/api/chatbot/absences/today", {
          headers: this.getAuthHeader(),
        });
        return response.data;
      } else {
        // Utiliser les données de démo
        return {
          success: true,
          message: "Données de démonstration",
          data: DEMO_DATA.absentToday,
        };
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des absences:", error);

      // En cas d'erreur, retourner les données de démo
      return {
        success: true,
        message: "Données de démonstration (fallback d'erreur)",
        data: DEMO_DATA.absentToday,
      };
    }
  }

  /**
   * Obtenir les prochains employés en congés
   * @returns {Promise<Object>} Liste des prochains employés en congés
   */
  static async getUpcomingVacations() {
    try {
      // Vérifier si le backend est disponible
      const backendAvailable = await this.isBackendAvailable();

      if (backendAvailable) {
        const response = await axios.get("/api/chatbot/vacations/upcoming", {
          headers: this.getAuthHeader(),
        });
        return response.data;
      } else {
        // Utiliser les données de démo
        return {
          success: true,
          message: "Données de démonstration",
          data: DEMO_DATA.upcomingVacations,
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des congés à venir:",
        error
      );

      // En cas d'erreur, retourner les données de démo
      return {
        success: true,
        message: "Données de démonstration (fallback d'erreur)",
        data: DEMO_DATA.upcomingVacations,
      };
    }
  }

  /**
   * Vérifier s'il manque des plannings pour la semaine prochaine
   * @returns {Promise<Object>} Informations sur les plannings manquants
   */
  static async getMissingSchedules() {
    try {
      // Vérifier si le backend est disponible
      const backendAvailable = await this.isBackendAvailable();

      if (backendAvailable) {
        const response = await axios.get("/api/chatbot/schedules/missing", {
          headers: this.getAuthHeader(),
        });
        return response.data;
      } else {
        // Utiliser les données de démo
        return {
          success: true,
          message: "Données de démonstration",
          data: DEMO_DATA.missingSchedules,
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification des plannings manquants:",
        error
      );

      // En cas d'erreur, retourner les données de démo
      return {
        success: true,
        message: "Données de démonstration (fallback d'erreur)",
        data: DEMO_DATA.missingSchedules,
      };
    }
  }

  /**
   * Obtenir les employés avec un solde d'heures négatif
   * @returns {Promise<Object>} Liste des employés avec un solde d'heures négatif
   */
  static async getNegativeHourBalances() {
    try {
      // Vérifier si le backend est disponible
      const backendAvailable = await this.isBackendAvailable();

      if (backendAvailable) {
        const response = await axios.get(
          "/api/chatbot/employees/negative-hours",
          {
            headers: this.getAuthHeader(),
          }
        );
        return response.data;
      } else {
        // Utiliser les données de démo
        return {
          success: true,
          message: "Données de démonstration",
          data: DEMO_DATA.negativeHours,
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des soldes d'heures négatifs:",
        error
      );

      // En cas d'erreur, retourner les données de démo
      return {
        success: true,
        message: "Données de démonstration (fallback d'erreur)",
        data: DEMO_DATA.negativeHours,
      };
    }
  }

  /**
   * Obtenir les questions personnalisées basées sur les données
   * @returns {Promise<Array>} Liste des questions personnalisées
   */
  static async getPersonalizedQuestions() {
    try {
      // Vérifier si le backend est disponible
      const backendAvailable = await this.isBackendAvailable();

      if (backendAvailable) {
        const response = await axios.get(
          "/api/chatbot/personalized-questions",
          {
            headers: this.getAuthHeader(),
          }
        );
        return response.data;
      } else {
        // Utiliser les questions prédéfinies
        const personalizedQuestions = [
          {
            id: "absences_today",
            text: "Qui ne travaille pas aujourd'hui ?",
            action: "get_absences_today",
            dynamicResponse: true,
          },
          {
            id: "upcoming_vacations",
            text: "Qui sont les prochaines personnes en congés ?",
            action: "get_upcoming_vacations",
            dynamicResponse: true,
          },
          {
            id: "missing_schedules",
            text: "Manque-t-il des plannings à faire pour la semaine prochaine ?",
            action: "get_missing_schedules",
            dynamicResponse: true,
          },
          {
            id: "negative_hours",
            text: "Qui a un solde d'heures négatif ?",
            action: "get_negative_hours",
            dynamicResponse: true,
          },
        ];

        return {
          success: true,
          data: personalizedQuestions,
        };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des questions personnalisées:",
        error
      );
      return {
        success: false,
        message: "Impossible de récupérer les questions personnalisées.",
        data: [],
      };
    }
  }

  /**
   * Exécuter une requête dynamique basée sur l'action
   * @param {string} action - L'action à exécuter
   * @returns {Promise<Object>} Résultat de la requête
   */
  static async executeDataQuery(action) {
    try {
      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const headers = {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeader(),
      };

      let endpoint = "";
      switch (action) {
        case "get_absences_today":
          endpoint = "/api/chatbot/absences/today";
          break;
        case "get_upcoming_vacations":
          endpoint = "/api/chatbot/vacations/upcoming";
          break;
        case "get_missing_schedules":
          endpoint = "/api/chatbot/schedules/missing";
          break;
        case "get_negative_hours":
          endpoint = "/api/chatbot/employees/negative-hours";
          break;
        default:
          return {
            success: false,
            message: "Action non reconnue",
          };
      }

      console.log(`[ChatbotDatabaseService] Appel API: ${baseURL}${endpoint}`);
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers,
        withCredentials: true,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Erreur serveur");
      }

      return response.data;
    } catch (error) {
      console.error("[ChatbotDatabaseService] Erreur:", error);
      throw error;
    }
  }
}

export default ChatbotDatabaseService;
