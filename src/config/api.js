/**
 * Configuration et utilitaires pour les appels API
 */

import axios from "axios";

// URL de base de l'API
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

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
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    VERIFY: "/api/auth/verify",
    RESET_PASSWORD: "/api/auth/reset-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
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

    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...(data && { data }),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    // Gérer les erreurs réseau
    if (!error.response) {
      throw new Error("Erreur réseau. Veuillez vérifier votre connexion.");
    }

    // Gérer les erreurs d'authentification
    if (error.response.status === 401) {
      // Rediriger vers la page de connexion ou rafraîchir le token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Propager l'erreur avec les détails
    throw new Error(error.response.data.message || "Une erreur est survenue");
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
