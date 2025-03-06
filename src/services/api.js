import { API_ENDPOINTS, apiRequest } from "../config/api";

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
      const response = await apiRequest(
        `${API_ENDPOINTS.WEEKLY_SCHEDULES}?weekStart=${weekStart}`,
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
          "Erreur lors de la récupération des plannings pour cette semaine",
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
      const response = await apiRequest(
        `${API_ENDPOINTS.EMPLOYEES.SCHEDULES(
          employeeId
        )}?weekStart=${weekStart}`,
        "GET"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, schedule: response };
    } catch (error) {
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
