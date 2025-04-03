/**
 * Configuration et utilitaires pour les appels API
 */

import axios from "axios";

// URL de base de l'API en production
const PROD_API_URL = "https://smartplanning.onrender.com";

// URL de base de l'API
export const API_URL =
  process.env.NODE_ENV === "production"
    ? PROD_API_URL
    : process.env.REACT_APP_API_URL || "http://localhost:5001";

// Création d'une instance Axios pour gérer les rafraîchissements de token
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable pour suivre si un rafraîchissement de token est en cours
let isRefreshing = false;
// File d'attente pour stocker les requêtes en attente pendant le rafraîchissement
let failedQueue = [];

// Fonction pour traiter la file d'attente
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Intercepteur pour gérer le rafraîchissement automatique des tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur n'est pas 401 ou si la requête a déjà été retentée, rejeter directement
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Marquer cette requête comme ayant déjà été retentée
    originalRequest._retry = true;

    // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Tentative de rafraîchissement du token
      const response = await axiosInstance.post(
        "/api/auth/refresh",
        {},
        {
          withCredentials: true,
          _retry: true, // Marquer cette requête de rafraîchissement pour éviter les boucles infinies
        }
      );

      if (response.data.success) {
        // Stocker le nouveau token si retourné
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.token}`;
        }

        // Mettre à jour les informations utilisateur
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        processQueue(null, response.data.token);
        return axiosInstance(originalRequest);
      } else {
        // Si le rafraîchissement échoue, vider la file d'attente et rejeter
        processQueue(new Error("Rafraîchissement du token échoué"));

        // Rediriger vers la page de connexion si nécessaire
        if (window.location.pathname !== "/login") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login?expired=true";
        }

        return Promise.reject(error);
      }
    } catch (refreshError) {
      processQueue(refreshError);

      // Rediriger vers la page de connexion si nécessaire
      if (window.location.pathname !== "/login") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?expired=true";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// Endpoints de l'API
export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  EMPLOYEES: {
    BASE: "/api/employees",
    BY_ID: (id) => `/api/employees/${id}`,
    SCHEDULES: (id) => `/api/employees/${id}/schedules`,
    VACATIONS: (id) => `/api/employees/${id}/vacations`,
  },
  WEEKLY_SCHEDULES: "/api/weekly-schedules",
  VACATIONS: {
    BASE: "/api/vacations",
    BY_ID: (id) => `/api/vacations/${id}`,
    UPDATE_STATUS: (id) => `/api/vacations/${id}/status`,
  },
  VACATIONS_MANAGER: "/api/vacations?manager=true",
  SHIFTS: {
    BASE: "/api/shifts",
    BY_ID: (id) => `/api/shifts/${id}`,
  },
  ACTIVITIES: {
    BASE: "/api/activities",
    BY_ID: (id) => `/api/activities/${id}`,
    LOG: "/api/activities/log",
    BY_USER: (userId) => `/api/activities/user/${userId}`,
    LIST: "/api/activities",
    CREATE: "/api/activities",
    UPDATE: (id) => `/api/activities/${id}`,
    DELETE: (id) => `/api/activities/${id}`,
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
    CHANGE_PASSWORD: "/api/users/change-password",
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
  SCHEDULE: {
    AUTO_GENERATE: "/api/schedule/auto-generate",
  },
  HEALTH: "", // Endpoint vide pour vérifier l'état de l'API
};

// Fonction pour vérifier si l'URL est correcte
export const validateApiUrl = () => {
  if (!API_URL) {
    throw new Error(`
⚠️ URL d'API non définie ⚠️
L'URL de l'API n'est pas configurée. Impossible d'effectuer des requêtes.
    `);
  }

  // En production, vérifier que l'URL est bien celle de Render
  if (process.env.NODE_ENV === "production" && API_URL !== PROD_API_URL) {
    throw new Error(`
⚠️ Configuration invalide ⚠️
L'URL de l'API en production doit être ${PROD_API_URL}
URL actuelle: ${API_URL}
    `);
  }

  return true;
};

// Fonction pour construire une URL d'API complète
export const buildApiUrl = (endpoint) => {
  validateApiUrl();

  // Si l'endpoint est vide ou /, retourner l'URL de base
  if (!endpoint || endpoint === "/") {
    return API_URL;
  }

  // Si l'URL de base contient déjà /api, on retire /api/ de l'endpoint
  const cleanEndpoint = API_URL.includes("/api")
    ? endpoint.replace(/^\/api/, "")
    : endpoint;

  // Construire l'URL complète
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const finalEndpoint = cleanEndpoint.startsWith("/")
    ? cleanEndpoint
    : `/${cleanEndpoint}`;

  return `${baseUrl}${finalEndpoint}`;
};

// Constante pour activer/désactiver les logs de débogage API
export const API_DEBUG = process.env.NODE_ENV !== "production";

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

// Fonction utilitaire pour logger les messages de débogage API
export const apiDebug = (message, data = null) => {
  if (!API_DEBUG) return;
  if (data) {
    console.log(`[API Debug] ${message}`, data);
  } else {
    console.log(`[API Debug] ${message}`);
  }
};

/**
 * Fonction pour effectuer des requêtes API
 * @param {string} endpoint - Endpoint de la requête
 * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Données à envoyer (pour POST et PUT)
 * @param {object} headers - En-têtes HTTP supplémentaires
 * @returns {Promise} - Promesse avec les données de la réponse
 */
export const apiRequest = async (
  endpoint,
  method = "GET",
  data = null,
  headers = {}
) => {
  validateApiUrl();

  // Construire l'URL complète
  const url = endpoint.startsWith("/") ? endpoint : buildApiUrl(endpoint);

  apiDebug(`${method} ${url}`, data ? { payload: data } : null);

  try {
    // Récupérer le token CSRF pour toutes les requêtes
    const csrfToken = getCsrfToken();
    let csrfHeader = {};

    if (csrfToken && method !== "GET") {
      csrfHeader = { "X-CSRF-Token": csrfToken };
      console.log(`[apiRequest] Token CSRF ajouté pour la route ${url}`);
    }

    const config = {
      method,
      url,
      headers: {
        ...csrfHeader,
        ...headers,
      },
      ...(data && { data }),
    };

    console.log(`[apiRequest] Configuration:`, {
      method: config.method,
      url: config.url,
      headers: Object.keys(config.headers),
      hasData: !!data,
      authorization: csrfToken
        ? `CSRF Token: ${csrfToken.substring(0, 10)}...`
        : "Non fourni",
    });

    try {
      console.log(`[apiRequest] Envoi de la requête...`);
      const response = await axiosInstance(config);
      console.log(`[apiRequest] Réponse reçue:`, {
        status: response.status,
        statusText: response.statusText,
        responseType: typeof response.data,
        isObject: typeof response.data === "object",
        properties: response.data ? Object.keys(response.data) : [],
      });

      // Analyse détaillée de la réponse
      if (response.data) {
        if (typeof response.data === "object") {
          console.log("[apiRequest] Structure de la réponse:", {
            hasSuccess: "success" in response.data,
            hasData: "data" in response.data,
            hasMessage: "message" in response.data,
            successValue:
              "success" in response.data ? response.data.success : "non défini",
          });
        } else {
          console.log(
            "[apiRequest] La réponse n'est pas un objet:",
            typeof response.data
          );
        }
      }

      // Adaptation à la nouvelle structure de l'API
      if (response.data && typeof response.data === "object") {
        // Si la réponse a la nouvelle structure { success, message, data }
        if ("success" in response.data && "data" in response.data) {
          console.log(
            "[apiRequest] Retour de la réponse au format standardisé"
          );
          return {
            ...response.data.data,
            success: response.data.success,
            message: response.data.message,
            // Garder les données originales accessibles si nécessaire
            _originalResponse: response.data,
          };
        }
      }

      apiDebug(`${method} ${url} - Réponse`, response);
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

      // Propager l'erreur avec les détails selon la nouvelle structure de réponse
      let errorMessage = "Une erreur est survenue";
      let errorDetails = "";

      if (axiosError.response.data) {
        if (typeof axiosError.response.data === "object") {
          // Nouvelle structure { success: false, message: "..." }
          errorMessage = axiosError.response.data.message || errorMessage;
          errorDetails = axiosError.response.data.error || "";
        } else if (typeof axiosError.response.data === "string") {
          errorMessage = axiosError.response.data;
        }
      }

      console.error(`[apiRequest] Message d'erreur:`, errorMessage);
      console.error(`[apiRequest] Détails d'erreur:`, errorDetails);

      const error = new Error(errorMessage);
      error.details = errorDetails;
      error.status = axiosError.response.status;
      error.success = false;

      apiDebug(`${method} ${url} - Erreur`, error);
      throw error;
    }
  } catch (error) {
    console.error(
      `[apiRequest] Erreur lors de la requête ${method} ${url}:`,
      error
    );
    apiDebug(`${method} ${url} - Erreur`, error);
    throw error;
  }
};

export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    // Extraire le message d'erreur selon la nouvelle structure
    let errorMessage = "Une erreur est survenue";
    if (data && typeof data === "object" && "message" in data) {
      errorMessage = data.message;
    } else if (data && typeof data === "string") {
      errorMessage = data;
    }

    switch (status) {
      case 400:
        return errorMessage || "Requête invalide";
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
        return `Erreur ${status} - ${errorMessage}`;
    }
  }
  if (error.request) {
    return "Impossible de contacter le serveur";
  }
  return error.message || "Une erreur est survenue";
};

/**
 * Fonction utilitaire pour normaliser les réponses API
 * Permet de garantir une structure de données cohérente quelle que soit la version de l'API
 * @param {object} response - Réponse brute de l'API
 * @returns {object} - Réponse normalisée avec success, message, data
 */
export const normalizeApiResponse = (response) => {
  if (!response) {
    return { success: false, message: "Réponse vide", data: null };
  }

  // Si c'est déjà un format normalisé
  if (typeof response === "object" && "success" in response) {
    return {
      success: response.success,
      message: response.message || "",
      data: response.data || null,
      ...response, // Garder les autres propriétés éventuelles
    };
  }

  // Si c'est une structure issue de l'ancienne API où les données sont directement retournées
  if (typeof response === "object") {
    // Si c'est un tableau, on considère que ce sont directement les données
    if (Array.isArray(response)) {
      return {
        success: true,
        message: "Données récupérées avec succès",
        data: response,
      };
    }

    // Si c'est un objet mais pas au format attendu
    return {
      success: true,
      message: "Données récupérées avec succès",
      data: response,
    };
  }

  // Cas improbable mais on gère quand même
  return {
    success: true,
    message: "Données récupérées",
    data: response,
  };
};

/**
 * Fonction utilitaire pour gérer les erreurs API de manière uniforme
 * @param {Error} error - Erreur capturée
 * @returns {object} - Objet d'erreur normalisé
 */
export const normalizeApiError = (error) => {
  let errorMessage = error.message || "Une erreur est survenue";
  let errorData = null;

  // Si l'erreur contient une réponse (erreur HTTP)
  if (error.response) {
    const { status, data } = error.response;

    // Extraire le message selon la structure
    if (data) {
      if (typeof data === "object" && "message" in data) {
        errorMessage = data.message;
        errorData = data.error || data.data || null;
      } else if (typeof data === "string") {
        errorMessage = data;
      }
    }

    return {
      success: false,
      message: errorMessage,
      status: status,
      data: errorData,
      error: true,
    };
  }

  // Erreur réseau ou autre
  return {
    success: false,
    message: errorMessage,
    data: null,
    error: true,
    network: !error.response,
  };
};

export default apiRequest;
