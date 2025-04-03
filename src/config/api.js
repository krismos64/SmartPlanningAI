// src/config/api.js

import axios from "axios";

// URL de fallback si aucune variable n'est définie
const DEFAULT_LOCAL_URL = "http://localhost:5001";
const DEFAULT_PROD_URL = "https://smartplanning.onrender.com";
const PROD_API_URL = DEFAULT_PROD_URL;

// Fonction pour déterminer dynamiquement l'URL selon le hostname
const resolveApiUrl = () => {
  const hostname = window.location.hostname;

  if (hostname.includes("localhost")) return DEFAULT_LOCAL_URL;
  if (hostname.includes("smartplanning")) return DEFAULT_PROD_URL;

  // fallback safe si on est sur un autre domaine
  return process.env.REACT_APP_API_URL || DEFAULT_PROD_URL;
};

// URL de base de l'API
export const API_URL = resolveApiUrl();

console.log("🌐 [API] API_URL utilisé :", API_URL);

// Création d'une instance Axios
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

// Fonction pour récupérer le token CSRF à partir des cookies
export const getCsrfToken = () => {
  try {
    // Obtenir tous les cookies
    const allCookies = document.cookie;

    // Vérifier que nous avons des cookies
    if (!allCookies || allCookies.trim() === "") {
      console.warn("⚠️ Aucun cookie trouvé");
      return null;
    }

    console.log("🔍 Recherche du token CSRF dans les cookies:", allCookies);

    // Diviser les cookies
    const cookies = allCookies.split(";");

    // Chercher le cookie XSRF-TOKEN
    for (let cookie of cookies) {
      cookie = cookie.trim();

      // Vérifier différentes variantes possibles du nom du cookie
      if (cookie.startsWith("XSRF-TOKEN=")) {
        const value = decodeURIComponent(
          cookie.substring("XSRF-TOKEN=".length)
        );
        console.log("✅ Token CSRF trouvé:", value.substring(0, 10) + "...");
        return value;
      } else if (cookie.startsWith("xsrf-token=")) {
        const value = decodeURIComponent(
          cookie.substring("xsrf-token=".length)
        );
        console.log(
          "✅ Token CSRF trouvé (minuscules):",
          value.substring(0, 10) + "..."
        );
        return value;
      } else if (cookie.startsWith("_csrf=")) {
        const value = decodeURIComponent(cookie.substring("_csrf=".length));
        console.log(
          "✅ Token CSRF trouvé (_csrf):",
          value.substring(0, 10) + "..."
        );
        return value;
      }
    }

    console.warn("⚠️ Aucun token CSRF trouvé dans les cookies");
    return null;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token CSRF:", error);
    return null;
  }
};

// Fonction utilitaire générique pour récupérer n'importe quel cookie par son nom
export const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
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

  const url = endpoint.startsWith("/") ? endpoint : buildApiUrl(endpoint);

  // Récupérer le token CSRF uniquement pour les méthodes non-GET
  let csrfToken = method !== "GET" ? getCsrfToken() : null;

  // Si on a besoin d'un token CSRF mais qu'il n'est pas disponible, essayer de le rafraîchir
  if (method !== "GET" && !csrfToken && !endpoint.includes("csrf-token")) {
    console.warn("⚠️ Token CSRF manquant, tentative de rafraîchissement...");
    console.log("Cookies actuels:", document.cookie);
    try {
      const csrfResponse = await fetch(`${API_URL}/api/csrf-token`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        console.log("✅ Réponse CSRF reçue:", csrfData.message || "OK");

        // Attendre un peu pour que le cookie soit défini
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Récupérer à nouveau le token
        csrfToken = getCsrfToken();
        console.log("Cookies après rafraîchissement:", document.cookie);
        if (csrfToken) {
          console.log(
            "✅ Token CSRF récupéré avec succès:",
            csrfToken.substring(0, 10) + "..."
          );
        } else {
          console.error(
            "❌ Le token CSRF n'a pas été défini dans les cookies après rafraîchissement"
          );
        }
      } else {
        console.error(
          "❌ Échec de l'obtention du token CSRF:",
          csrfResponse.status,
          csrfResponse.statusText
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement du token CSRF:", error);
    }
  }

  // Utiliser le token récupéré ou fraîchement rafraîchi
  const csrfHeader = csrfToken ? { "X-CSRF-Token": csrfToken } : {};

  // Log du token CSRF utilisé
  if (method !== "GET") {
    if (csrfToken) {
      console.log(`🔐 Envoi du token CSRF: ${csrfToken.substring(0, 10)}...`);
    } else {
      console.warn("⚠️ Aucun token CSRF disponible pour cette requête");
    }
  }

  const config = {
    method,
    url,
    headers: {
      "Content-Type": "application/json",
      ...csrfHeader,
      ...headers,
    },
    ...(data && { data }),
    withCredentials: true, // indispensable pour envoyer les cookies
  };

  console.log(
    `📡 [API] ${method} ${url} ${
      csrfToken ? "avec token CSRF" : "sans token CSRF"
    }`
  );

  try {
    if (method !== "GET" && !csrfToken) {
      console.warn(`⚠️ Requête ${method} sans token CSRF: ${url}`);
    }

    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // Vérifier s'il s'agit d'une erreur CSRF
    const isCsrfError =
      error.response?.status === 403 &&
      (error.response?.data?.error?.includes("CSRF") ||
        error.response?.data?.message?.includes("CSRF") ||
        error.response?.data?.message?.includes("csrf"));

    if (isCsrfError) {
      console.error("🔒 Erreur CSRF détectée:");
      console.error("- URL:", url);
      console.error("- Méthode:", method);
      console.error(
        "- Token utilisé:",
        csrfToken ? csrfToken.substring(0, 10) + "..." : "Aucun"
      );
      console.error("- Cookies disponibles:", document.cookie);
      console.error("- Réponse d'erreur:", error.response?.data);
    } else {
      console.error(
        `[apiRequest] Erreur lors de la requête ${method} ${url}:`,
        error?.response?.data?.message || error.message
      );
    }
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
