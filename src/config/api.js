/**
 * Configuration et utilitaires pour les appels API
 */

import axios from "axios";

// URL de base de l'API
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Fonction pour vérifier si l'URL est correcte
console.log("API_URL configurée:", API_URL);

// Fonction utilitaire pour récupérer le token CSRF depuis les cookies
export const getCsrfToken = () => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith("XSRF-TOKEN=")) {
      return cookie.substring("XSRF-TOKEN=".length);
    }
  }
  return null;
};

// Routes de l'API
export const API_ENDPOINTS = {
  EMPLOYEES: {
    BASE: "/api/employees",
    BY_ID: (id) => `/api/employees/${id}`,
    SCHEDULES: (id) => `/api/employees/${id}/schedules`,
    VACATIONS: (id) => `/api/employees/${id}/vacations`,
  },
  WEEKLY_SCHEDULES: "/api/weekly-schedules",
  VACATIONS: "/api/vacations",
  SHIFTS: {
    BASE: "/api/shifts",
    BY_ID: (id) => `/api/shifts/${id}`,
  },
  ACTIVITIES: {
    BASE: "/api/activities",
    BY_ID: (id) => `/api/activities/${id}`,
    LOG: "/api/activities/log",
  },
  WORK_HOURS: {
    BASE: "/api/work-hours",
    BY_ID: (id) => `/api/work-hours/${id}`,
    BY_EMPLOYEE: (employeeId) => `/api/work-hours/employee/${employeeId}`,
  },
  HOUR_BALANCE: {
    BY_EMPLOYEE: (employeeId) => `/api/hour-balance/${employeeId}`,
  },
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VERIFY: "/api/auth/verify",
    RESET_PASSWORD: "/api/auth/reset-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    DELETE_ACCOUNT: "/api/auth/delete-account",
    REQUEST_ACCOUNT_DELETION: "/api/auth/request-account-deletion",
    CONFIRM_ACCOUNT_DELETION: "/api/auth/confirm-account-deletion",
    PROFILE: "/api/user/profile",
    UPDATE_PROFILE: "/api/user/profile",
  },
  DEPARTMENTS: {
    BASE: "/api/departments",
    BY_ID: (id) => `/api/departments/${id}`,
    EMPLOYEES: (id) => `/api/departments/${id}/employees`,
  },
  ROLES: {
    BASE: "/api/roles",
    BY_ID: (id) => `/api/roles/${id}`,
  },
  SETTINGS: {
    BASE: "/api/settings",
    BY_KEY: (key) => `/api/settings/${key}`,
  },
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    BY_ID: (id) => `/api/notifications/${id}`,
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/mark-all-read",
  },
};

/**
 * Fonction pour effectuer des requêtes API
 * @param {string} url - URL de la requête
 * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Données à envoyer (pour POST et PUT)
 * @param {object} headers - En-têtes HTTP supplémentaires
 * @returns {Promise} - Promesse avec les données de la réponse
 */
export const apiRequest = async (
  url,
  method = "GET",
  data = null,
  headers = {}
) => {
  try {
    const token = localStorage.getItem("token");
    console.log(
      `[apiRequest] ${method} ${url} - Token:`,
      token ? "Présent" : "Manquant"
    );

    // Ajouter le token CSRF pour les routes d'authentification
    let csrfHeader = {};
    if (url.startsWith("/api/auth/")) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        csrfHeader = { "X-CSRF-Token": csrfToken };
        console.log(`[apiRequest] Token CSRF ajouté pour la route ${url}`);
      } else {
        console.warn(
          `[apiRequest] Pas de token CSRF trouvé pour la route ${url}`
        );
      }
    }

    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...csrfHeader,
        ...headers,
      },
      ...(data && { data }),
      withCredentials: true, // Pour inclure les cookies dans les requêtes cross-origin
    };

    console.log(`[apiRequest] Configuration:`, {
      method: config.method,
      url: config.url,
      headers: config.headers,
      hasData: !!data,
    });

    try {
      const response = await axios(config);
      console.log(`[apiRequest] Réponse reçue:`, {
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
      });

      return response.data;
    } catch (axiosError) {
      console.error(
        `[apiRequest] Erreur Axios lors de la requête ${method} ${url}:`,
        axiosError
      );

      // Gérer les erreurs réseau
      if (!axiosError.response) {
        console.error("[apiRequest] Erreur réseau:", axiosError.message);
        throw new Error("Erreur réseau. Veuillez vérifier votre connexion.");
      }

      // Gérer les erreurs d'authentification
      if (axiosError.response.status === 401) {
        console.error("[apiRequest] Erreur d'authentification (401)");
        // Rediriger vers la page de connexion ou rafraîchir le token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      // Propager l'erreur avec les détails
      const errorMessage =
        axiosError.response.data.message || "Une erreur est survenue";
      const errorDetails = axiosError.response.data.details || "";
      console.error(`[apiRequest] Message d'erreur:`, errorMessage);
      console.error(`[apiRequest] Détails d'erreur:`, errorDetails);

      const error = new Error(errorMessage);
      error.details = errorDetails;
      error.status = axiosError.response.status;
      throw error;
    }
  } catch (error) {
    console.error(
      `[apiRequest] Erreur lors de la requête ${method} ${url}:`,
      error
    );
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return data.message || "Requête invalide";
      case 401:
        return "Non autorisé - Veuillez vous reconnecter";
      case 403:
        return "Accès refusé";
      case 404:
        return "Ressource non trouvée";
      case 409:
        return "Conflit - La ressource existe déjà";
      case 422:
        return "Données invalides";
      case 429:
        return "Trop de requêtes - Veuillez réessayer plus tard";
      case 500:
        return "Erreur serveur - Veuillez réessayer plus tard";
      default:
        return `Erreur ${status} - ${
          data.message || "Une erreur est survenue"
        }`;
    }
  }
  if (error.request) {
    return "Impossible de contacter le serveur";
  }
  return error.message || "Une erreur est survenue";
};

export default apiRequest;
