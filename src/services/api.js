import { API_ENDPOINTS, apiRequest } from "../config/api";
import { formatDateForAPI } from "../utils/dateUtils";

export const AuthService = {
  login: async (email, password) => {
    console.log("🔐 Tentative de connexion avec:", { email, password: "***" });
    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, "POST", {
        email,
        password,
      });

      if (response.error) {
        console.error("❌ Erreur de connexion:", response.error);
        return { success: false, message: response.error };
      }

      if (response.token) {
        console.log("✅ Connexion réussie, token reçu");
        localStorage.setItem("token", response.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.id,
            email: response.email,
            role: response.role,
            first_name: response.first_name,
            last_name: response.last_name,
          })
        );
        return { success: true, user: response };
      } else {
        console.error("❌ Connexion échouée: pas de token reçu");
        return { success: false, message: "Erreur d'authentification" };
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      return {
        success: false,
        message: error.message || "Erreur de connexion",
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.REGISTER, "POST", {
        ...userData,
        first_name: userData.first_name,
        last_name: userData.last_name,
      });

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, user: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur d'inscription",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { success: true };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  },
};

export const EmployeeService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.EMPLOYEES.BASE, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, employees: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération des employés",
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BY_ID(id),
        "GET"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return {
        ...response,
        first_name: response.first_name,
        last_name: response.last_name,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération de l'employé",
      };
    }
  },

  create: async (employeeData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BASE,
        "POST",
        employeeData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, employee: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'employé",
      };
    }
  },

  update: async (id, employeeData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BY_ID(id),
        "PUT",
        employeeData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, employee: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour de l'employé",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.EMPLOYEES.BY_ID(id),
        "DELETE"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression de l'employé",
      };
    }
  },
};

export const VacationService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.VACATIONS, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, vacations: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération des congés",
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.VACATIONS}/${id}`,
        "GET"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, vacation: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du congé",
      };
    }
  },

  create: async (vacationData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.VACATIONS,
        "POST",
        vacationData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, vacation: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création du congé",
      };
    }
  },

  update: async (id, vacationData) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.VACATIONS}/${id}`,
        "PUT",
        vacationData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, vacation: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du congé",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.VACATIONS}/${id}`,
        "DELETE"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du congé",
      };
    }
  },
};

export const ActivityService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.ACTIVITIES.LIST, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activities: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des activités",
      };
    }
  },

  create: async (activityData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.CREATE,
        "POST",
        activityData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activity: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'activité",
      };
    }
  },

  update: async (id, activityData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.UPDATE(id),
        "PUT",
        activityData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, activity: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour de l'activité",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.ACTIVITIES.DELETE(id),
        "DELETE"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression de l'activité",
      };
    }
  },
};

export const WeeklyScheduleService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ENDPOINTS.WEEKLY_SCHEDULES, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedules: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des plannings",
      };
    }
  },

  getByWeek: async (weekStart) => {
    try {
      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return { success: false, message: "Date de début de semaine requise" };
      }

      // Vérifier que le token d'authentification est présent
      const token = localStorage.getItem("token");
      console.error(
        "Token d'authentification:",
        token ? "Présent" : "Manquant",
        token ? `(${token.substring(0, 10)}...)` : ""
      );

      if (!token) {
        console.error("Token d'authentification manquant");
        return {
          success: false,
          message: "Vous devez être connecté pour accéder à ces données",
        };
      }

      console.error(
        "Appel API pour récupérer les plannings de la semaine:",
        weekStart
      );

      try {
        const response = await apiRequest(
          `${API_ENDPOINTS.WEEKLY_SCHEDULES}/week/${weekStart}`,
          "GET"
        );

        if (response.error) {
          console.error(
            "Erreur API lors de la récupération des plannings:",
            response.error
          );
          return {
            success: false,
            message: response.error,
            details: response.details || "",
          };
        }

        console.error(
          "Réponse API pour les plannings:",
          JSON.stringify(response).substring(0, 200) + "..."
        );

        return { success: true, schedules: response };
      } catch (apiError) {
        console.error("Exception lors de l'appel API:", apiError);
        return {
          success: false,
          message:
            apiError.message || "Erreur lors de la récupération des plannings",
          details: apiError.details || "",
        };
      }
    } catch (error) {
      console.error("Exception lors de la récupération des plannings:", error);
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des plannings pour cette semaine",
        details: error.details || "",
      };
    }
  },

  getByEmployee: async (employeeId) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.EMPLOYEES.SCHEDULES(employeeId)}`,
        "GET"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedules: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des plannings de l'employé",
      };
    }
  },

  getByEmployeeAndWeek: async (employeeId, weekStart) => {
    try {
      if (!employeeId) {
        console.error("ID employé non spécifié");
        return { success: false, message: "ID employé requis" };
      }

      if (!weekStart) {
        console.error("Date de début de semaine non spécifiée");
        return { success: false, message: "Date de début de semaine requise" };
      }

      // S'assurer que la date est au format YYYY-MM-DD
      let formattedDate = weekStart;
      if (weekStart instanceof Date) {
        formattedDate = formatDateForAPI(weekStart);
      } else if (typeof weekStart === "string" && weekStart.includes("T")) {
        // Si la date contient un T (format ISO), extraire seulement la partie date
        formattedDate = weekStart.split("T")[0];
      }

      console.error(
        "Appel API pour récupérer le planning de l'employé:",
        employeeId,
        "semaine du:",
        formattedDate
      );

      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/employee/${employeeId}/week/${formattedDate}`,
        "GET"
      );

      if (response.error) {
        console.error(
          "Erreur API lors de la récupération du planning:",
          response.error
        );
        return { success: false, message: response.error };
      }

      return response; // La réponse contient déjà success et schedule
    } catch (error) {
      console.error("Exception lors de la récupération du planning:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du planning",
      };
    }
  },

  create: async (scheduleData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.WEEKLY_SCHEDULES,
        "POST",
        scheduleData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedule: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création du planning",
      };
    }
  },

  update: async (id, scheduleData) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "PUT",
        scheduleData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedule: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du planning",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
        "DELETE"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du planning",
      };
    }
  },
};

export const HourBalanceService = {
  getByEmployee: async (employeeId) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.HOUR_BALANCE.BY_EMPLOYEE(employeeId),
        "GET"
      );

      if (response && response.error) {
        return { success: false, message: response.error };
      }

      if (response && typeof response.balance !== "undefined") {
        return { success: true, balance: response.balance };
      }

      if (response && typeof response === "object") {
        if (typeof response.hour_balance !== "undefined") {
          return { success: true, balance: response.hour_balance };
        }

        if (
          Object.keys(response).length === 1 &&
          typeof Object.values(response)[0] === "number"
        ) {
          return { success: true, balance: Object.values(response)[0] };
        }
      }

      console.warn(
        `Avertissement: Format de réponse inattendu pour le solde d'heures de l'employé ${employeeId}:`,
        response
      );
      return { success: true, balance: 0 };
    } catch (error) {
      console.warn(
        "Avertissement lors de la récupération du solde d'heures:",
        error
      );
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération du solde d'heures",
      };
    }
  },

  updateBalance: async (employeeId, balanceData) => {
    try {
      const response = await apiRequest(
        API_ENDPOINTS.HOUR_BALANCE.BY_EMPLOYEE(employeeId),
        "PUT",
        balanceData
      );

      if (response && response.error) {
        return { success: false, message: response.error };
      }

      return {
        success: true,
        balance:
          response.balance ||
          response.hour_balance ||
          (typeof response === "number" ? response : 0),
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du solde d'heures:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la mise à jour du solde d'heures",
      };
    }
  },
};

export const NotificationService = {
  getNotifications: async (params = {}) => {
    try {
      return await apiRequest({
        endpoint: "/notifications",
        method: "GET",
        params,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      return await apiRequest({
        endpoint: "/notifications/unread-count",
        method: "GET",
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de notifications non lues:",
        error
      );
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      return await apiRequest({
        endpoint: `/notifications/${notificationId}/read`,
        method: "PUT",
      });
    } catch (error) {
      console.error(
        "Erreur lors du marquage de la notification comme lue:",
        error
      );
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      return await apiRequest({
        endpoint: "/notifications/mark-all-read",
        method: "PUT",
      });
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      return await apiRequest({
        endpoint: `/notifications/${notificationId}`,
        method: "DELETE",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error);
      throw error;
    }
  },

  deleteAllNotifications: async () => {
    try {
      return await apiRequest({
        endpoint: "/notifications",
        method: "DELETE",
      });
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de toutes les notifications:",
        error
      );
      throw error;
    }
  },
};
