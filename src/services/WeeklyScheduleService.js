import { toast } from "react-hot-toast";
import { API_URL, axiosInstance } from "../config/api";
import { formatDateForAPI } from "../utils/dateUtils";

/**
 * Service pour les opérations CRUD sur les plannings hebdomadaires
 * Utilise serviceApiRequest au lieu d'axios directement pour une meilleure gestion des tokens
 */
class WeeklyScheduleService {
  // Référence pour suivre si un rafraîchissement de token est en cours
  static isRefreshingToken = false;

  /**
   * Récupère tous les plannings hebdomadaires
   * @returns {Promise<Object>} - Réponse avec les plannings récupérés
   */
  static async getSchedules(weekStart = null) {
    try {
      console.log("WeeklyScheduleService.getSchedules - Début");

      if (weekStart) {
        // Si une date de début de semaine est fournie, utiliser getSchedulesByWeek
        return await this.getSchedulesByWeek(weekStart);
      }

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules`;
      console.log(`WeeklyScheduleService.getSchedules - URL: ${url}`);

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            // Réessayer la requête avec le nouveau token
            return await this.getSchedules();
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(
          "WeeklyScheduleService.getSchedules - Erreur:",
          errorData
        );
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      console.log("WeeklyScheduleService.getSchedules - Succès");

      return {
        success: true,
        data: Array.isArray(data) ? data : data.data || [],
      };
    } catch (error) {
      console.error("WeeklyScheduleService.getSchedules - Exception:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des plannings",
        error,
      };
    }
  }

  /**
   * Récupère les plannings pour une semaine spécifique
   * @param {Date|string} weekStart - Date de début de semaine
   * @returns {Promise<Object>} - Réponse avec les plannings récupérés
   */
  static async getSchedulesByWeek(weekStart) {
    try {
      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return { success: false, message: "Date de début de semaine requise" };
      }

      // S'assurer que la date est au format YYYY-MM-DD
      const formattedDate = formatDateForAPI(weekStart);

      console.log(
        "WeeklyScheduleService.getSchedulesByWeek - Début",
        formattedDate
      );

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules/week/${formattedDate}`;
      console.log(`WeeklyScheduleService.getSchedulesByWeek - URL: ${url}`);

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            // Réessayer la requête avec le nouveau token
            return await this.getSchedulesByWeek(weekStart);
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(
          "WeeklyScheduleService.getSchedulesByWeek - Erreur:",
          errorData
        );
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      console.log("WeeklyScheduleService.getSchedulesByWeek - Succès");

      return {
        success: true,
        data: Array.isArray(data) ? data : data.data || [],
      };
    } catch (error) {
      console.error(
        "WeeklyScheduleService.getSchedulesByWeek - Exception:",
        error
      );
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des plannings",
        error,
      };
    }
  }

  /**
   * Récupère un planning par son ID
   * @param {string} id - ID du planning à récupérer
   * @returns {Promise<Object>} - Réponse avec le planning récupéré
   */
  static async getScheduleById(id) {
    try {
      console.log(`WeeklyScheduleService.getScheduleById - Début: ${id}`);

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules/${id}`;

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            // Réessayer la requête avec le nouveau token
            return await this.getScheduleById(id);
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error(
        "WeeklyScheduleService.getScheduleById - Exception:",
        error
      );
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du planning",
        error,
      };
    }
  }

  /**
   * Gère les erreurs d'authentification en tentant de rafraîchir le token
   * @returns {Promise<boolean>} Vrai si le token a été rafraîchi avec succès
   */
  static async handleAuthError() {
    try {
      console.log("Tentative de rafraîchissement du token...");

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/auth/refresh`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Échec du rafraîchissement du token:", response.status);
        // Si le rafraîchissement échoue, on supprime les tokens existants
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        // Rediriger vers la page de connexion si nécessaire
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }

        return false;
      }

      const data = await response.json();

      if (data.token) {
        console.log("Token rafraîchi avec succès");
        // Stocker le nouveau token
        if (localStorage.getItem("token")) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }

        // Mettre à jour les informations utilisateur si nécessaire
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return false;
    }
  }

  /**
   * Crée un nouveau planning hebdomadaire
   * @param {Object} scheduleData - Données du planning à créer
   * @returns {Promise<Object>} - Réponse avec le planning créé
   */
  static async createSchedule(scheduleData) {
    try {
      console.log("WeeklyScheduleService.createSchedule - Début", scheduleData);

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules`;

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("Token d'authentification manquant");
        return {
          success: false,
          message: "Authentification requise pour créer un planning",
          statusCode: 401,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log(
            "Erreur d'authentification 401 détectée, tentative de refresh du token"
          );
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            console.log(
              "Token rafraîchi avec succès, réessai de la création du planning"
            );
            // Réessayer la requête avec le nouveau token
            return await this.createSchedule(scheduleData);
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(
          "WeeklyScheduleService.createSchedule - Erreur:",
          errorData
        );
        toast.error(
          errorData.message || "Erreur lors de la création du planning"
        );
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      console.log("WeeklyScheduleService.createSchedule - Succès:", data);

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("WeeklyScheduleService.createSchedule - Exception:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la création du planning",
        error,
      };
    }
  }

  /**
   * Met à jour un planning hebdomadaire existant
   * @param {string} id - ID du planning à mettre à jour
   * @param {Object} scheduleData - Nouvelles données du planning
   * @returns {Promise<Object>} - Réponse avec le planning mis à jour
   */
  static async updateSchedule(id, scheduleData) {
    try {
      console.log(
        `WeeklyScheduleService.updateSchedule - Début: ${id}`,
        scheduleData
      );

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules/${id}`;

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("Token d'authentification manquant");
        return {
          success: false,
          message: "Authentification requise pour modifier un planning",
          statusCode: 401,
        };
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log(
            "Erreur d'authentification 401 détectée, tentative de refresh du token"
          );
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            console.log(
              "Token rafraîchi avec succès, réessai de la mise à jour du planning"
            );
            // Réessayer la requête avec le nouveau token
            return await this.updateSchedule(id, scheduleData);
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(
          "WeeklyScheduleService.updateSchedule - Erreur:",
          errorData
        );
        toast.error(
          errorData.message || "Erreur lors de la mise à jour du planning"
        );
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      console.log("WeeklyScheduleService.updateSchedule - Succès:", data);

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error("WeeklyScheduleService.updateSchedule - Exception:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du planning",
        error,
      };
    }
  }

  /**
   * Supprime un planning hebdomadaire
   * @param {string} id - ID du planning à supprimer
   * @returns {Promise<Object>} - Réponse indiquant le succès ou l'échec
   */
  static async deleteSchedule(id) {
    try {
      console.log(`WeeklyScheduleService.deleteSchedule - Début: ${id}`);

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules/${id}`;

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("Token d'authentification manquant");
        return {
          success: false,
          message: "Authentification requise pour supprimer un planning",
          statusCode: 401,
        };
      }

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        // Gérer spécifiquement les erreurs d'authentification
        if (response.status === 401) {
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            // Réessayer la requête avec le nouveau token
            return await this.deleteSchedule(id);
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(
          "WeeklyScheduleService.deleteSchedule - Erreur:",
          errorData
        );
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      console.log("WeeklyScheduleService.deleteSchedule - Succès");

      return {
        success: true,
        ...data,
      };
    } catch (error) {
      console.error("WeeklyScheduleService.deleteSchedule - Exception:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du planning",
        error,
      };
    }
  }

  /**
   * Génère un planning hebdomadaire automatiquement
   * @param {Object} generationParams - Paramètres pour la génération du planning
   * @returns {Promise<Object>} - Réponse avec le planning généré
   */
  static async generateSchedule(generationParams) {
    try {
      console.log(
        "WeeklyScheduleService.generateSchedule - Début",
        generationParams
      );

      const apiUrl = API_URL || "http://localhost:5001";
      const url = `${apiUrl}/api/weekly-schedules/generate`;

      // Récupérer le token d'authentification
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        console.error("Token d'authentification manquant");
        return {
          success: false,
          message: "Authentification requise pour générer un planning",
          statusCode: 401,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(generationParams),
        credentials: "include",
      });

      if (!response.ok) {
        // Gérer spécifiquement les erreurs d'authentification
        if (response.status === 401) {
          // Tenter de rafraîchir le token
          const refreshed = await this.handleAuthError();
          if (refreshed) {
            // Réessayer la requête avec le nouveau token
            return await this.generateSchedule(generationParams);
          } else {
            return {
              success: false,
              message: "Authentification invalide. Veuillez vous reconnecter.",
              statusCode: 401,
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        console.error(
          "WeeklyScheduleService.generateSchedule - Erreur:",
          errorData
        );
        return {
          success: false,
          message: errorData.message || `Erreur ${response.status}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      console.log("WeeklyScheduleService.generateSchedule - Succès:", data);

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      console.error(
        "WeeklyScheduleService.generateSchedule - Exception:",
        error
      );
      return {
        success: false,
        message: error.message || "Erreur lors de la génération du planning",
        error,
      };
    }
  }

  /**
   * Récupère les plannings pour une semaine spécifique
   * @param {string} weekStartDate - Date de début de semaine au format YYYY-MM-DD
   * @returns {Promise<Object>} Réponse API avec les plannings de la semaine
   */
  static async getByWeek(weekStartDate) {
    try {
      const response = await axiosInstance.get(
        `/api/weekly-schedules?week=${weekStartDate}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des plannings par semaine:",
        error
      );
      throw error;
    }
  }

  /**
   * Crée un nouveau planning hebdomadaire
   * @param {Object} scheduleData - Données du planning à créer
   * @returns {Promise<Object>} Réponse API avec le planning créé
   */
  static async createSchedule(scheduleData) {
    try {
      const response = await axiosInstance.post(
        "/api/weekly-schedules",
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du planning:", error);
      throw error;
    }
  }

  /**
   * Met à jour un planning existant
   * @param {string|number} id - Identifiant du planning à mettre à jour
   * @param {Object} scheduleData - Nouvelles données du planning
   * @returns {Promise<Object>} Réponse API avec le planning mis à jour
   */
  static async updateSchedule(id, scheduleData) {
    try {
      const response = await axiosInstance.put(
        `/api/weekly-schedules/${id}`,
        scheduleData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du planning #${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un planning
   * @param {string|number} id - Identifiant du planning à supprimer
   * @returns {Promise<Object>} Réponse API confirmant la suppression
   */
  static async deleteSchedule(id) {
    try {
      const response = await axiosInstance.delete(
        `/api/weekly-schedules/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du planning #${id}:`, error);
      throw error;
    }
  }
}

export default WeeklyScheduleService;
