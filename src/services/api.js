import { API_ROUTES, apiRequest } from "../config/api";

export const AuthService = {
  login: async (email, password) => {
    console.log("🔐 Tentative de connexion avec:", { email, password: "***" });
    try {
      const response = await apiRequest(API_ROUTES.LOGIN, "POST", {
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
            firstName: response.firstName,
            lastName: response.lastName,
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
      const response = await apiRequest(API_ROUTES.REGISTER, "POST", userData);

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
      const response = await apiRequest(API_ROUTES.EMPLOYEES, "GET");

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
      const response = await apiRequest(`${API_ROUTES.EMPLOYEES}/${id}`, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, employee: response };
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
        API_ROUTES.EMPLOYEES,
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
        `${API_ROUTES.EMPLOYEES}/${id}`,
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
        `${API_ROUTES.EMPLOYEES}/${id}`,
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
      const response = await apiRequest(API_ROUTES.VACATIONS, "GET");

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
      const response = await apiRequest(`${API_ROUTES.VACATIONS}/${id}`, "GET");

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
        API_ROUTES.VACATIONS,
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
        `${API_ROUTES.VACATIONS}/${id}`,
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
        `${API_ROUTES.VACATIONS}/${id}`,
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

export const PlanningService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ROUTES.PLANNING, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, planning: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du planning",
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest(`${API_ROUTES.PLANNING}/${id}`, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, event: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération de l'événement",
      };
    }
  },

  create: async (eventData) => {
    try {
      const response = await apiRequest(API_ROUTES.PLANNING, "POST", eventData);

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, event: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création de l'événement",
      };
    }
  },

  update: async (id, eventData) => {
    try {
      const response = await apiRequest(
        `${API_ROUTES.PLANNING}/${id}`,
        "PUT",
        eventData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, event: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la mise à jour de l'événement",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(
        `${API_ROUTES.PLANNING}/${id}`,
        "DELETE"
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la suppression de l'événement",
      };
    }
  },
};

export const ShiftService = {
  getAll: async () => {
    try {
      const response = await apiRequest(API_ROUTES.SHIFTS, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, shifts: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération des shifts",
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await apiRequest(`${API_ROUTES.SHIFTS}/${id}`, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, shift: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la récupération du shift",
      };
    }
  },

  create: async (shiftData) => {
    try {
      const response = await apiRequest(API_ROUTES.SHIFTS, "POST", shiftData);

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, shift: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la création du shift",
      };
    }
  },

  update: async (id, shiftData) => {
    try {
      const response = await apiRequest(
        `${API_ROUTES.SHIFTS}/${id}`,
        "PUT",
        shiftData
      );

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, shift: response };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du shift",
      };
    }
  },

  delete: async (id) => {
    try {
      const response = await apiRequest(`${API_ROUTES.SHIFTS}/${id}`, "DELETE");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Erreur lors de la suppression du shift",
      };
    }
  },
};

export const StatsService = {
  getOverview: async () => {
    try {
      const response = await apiRequest(`${API_ROUTES.STATS}/overview`, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, stats: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message || "Erreur lors de la récupération des statistiques",
      };
    }
  },

  getEmployeeStats: async () => {
    try {
      const response = await apiRequest(`${API_ROUTES.STATS}/employees`, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, stats: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des statistiques des employés",
      };
    }
  },

  getVacationStats: async () => {
    try {
      const response = await apiRequest(`${API_ROUTES.STATS}/vacations`, "GET");

      if (response.error) {
        return { success: false, message: response.error };
      }

      return { success: true, stats: response };
    } catch (error) {
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des statistiques des congés",
      };
    }
  },
};
