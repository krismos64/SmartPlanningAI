// src/config/api.js

import axios from "axios";

// URL de fallback si aucune variable n'est définie
const DEFAULT_LOCAL_URL = "http://localhost:5001";
const DEFAULT_PROD_URL = "https://smartplanning.onrender.com/api";
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

// Variable globale pour stocker le token CSRF
let globalCsrfToken = null;

// Création d'une instance Axios
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour détecter les appels à axiosInstance sans endpoint
axiosInstance.interceptors.request.use((config) => {
  if (!config.url || config.url === "/" || config.url === "") {
    console.warn("🚨 Requête axiosInstance détectée sans endpoint :", config);
    console.trace(); // pour voir l'origine exacte dans la console navigateur
  }
  return config;
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

// Ajouter un intercepteur pour ajouter automatiquement le token CSRF aux requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Ajouter le token CSRF à toutes les requêtes sauf GET
    if (config.method !== "get" && globalCsrfToken) {
      config.headers["X-CSRF-Token"] = globalCsrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
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
  CSRF: {
    TOKEN: "/csrf-token",
  },
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
    console.warn(
      "⚠️ [apiRequest] Appel détecté avec un endpoint vide ou '/' !"
    );
    console.trace(); // affiche la pile d'appels pour localiser l'origine
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

/**
 * Récupère un token CSRF depuis le serveur et le stocke globalement
 * @returns {Promise<string>} Le token CSRF
 */
export const fetchCsrfToken = async () => {
  try {
    console.log("🔒 Demande d'un nouveau token CSRF");
    const response = await axiosInstance.get(API_ENDPOINTS.CSRF.TOKEN);

    if (response.data && response.data.csrfToken) {
      globalCsrfToken = response.data.csrfToken;
      console.log(
        "✅ Token CSRF reçu:",
        globalCsrfToken.substring(0, 10) + "..."
      );
      return globalCsrfToken;
    } else {
      console.error("❌ Pas de token CSRF dans la réponse");
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token CSRF:", error);
    return null;
  }
};

/**
 * Récupère le token CSRF actuel ou en demande un nouveau s'il n'existe pas
 * @returns {Promise<string>} Le token CSRF
 */
export const getCsrfToken = async () => {
  if (globalCsrfToken) {
    return globalCsrfToken;
  }
  return fetchCsrfToken();
};

/**
 * Récupère immédiatement le token CSRF stocké globalement sans appel API
 * @returns {string|null} Le token CSRF ou null s'il n'existe pas
 */
export const getStoredCsrfToken = () => {
  return globalCsrfToken;
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

  // Pour les méthodes non-GET, s'assurer d'avoir un token CSRF
  if (
    method !== "GET" &&
    !globalCsrfToken &&
    !endpoint.includes("csrf-token")
  ) {
    console.log("🔒 Récupération du token CSRF avant requête", method);
    await fetchCsrfToken();
  }

  // Ajouter le token CSRF aux en-têtes pour les méthodes non-GET
  const csrfHeader =
    method !== "GET" && globalCsrfToken
      ? { "X-CSRF-Token": globalCsrfToken }
      : {};

  // Log du token CSRF utilisé
  if (method !== "GET") {
    if (globalCsrfToken) {
      console.log(
        `🔐 Envoi du token CSRF: ${globalCsrfToken.substring(0, 10)}...`
      );
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
      globalCsrfToken ? "avec token CSRF" : "sans token CSRF"
    }`
  );

  try {
    if (method !== "GET" && !globalCsrfToken) {
      console.warn(`⚠️ Requête ${method} sans token CSRF: ${url}`);
    }

    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    // Vérifier s'il s'agit d'une erreur CSRF
    const isCsrfError =
      error.response?.status === 403 &&
      (error.response?.data?.error === "CSRF_TOKEN_MISSING" ||
        error.response?.data?.error === "CSRF_TOKEN_INVALID");

    // Si c'est une erreur CSRF, essayer de rafraîchir le token et réessayer
    if (isCsrfError && !config._csrf_retry) {
      console.warn("🔄 Erreur CSRF, tentative de rafraîchissement du token");

      try {
        await fetchCsrfToken();

        if (globalCsrfToken) {
          // Marquer cette requête pour éviter les boucles infinies
          config._csrf_retry = true;

          // Mettre à jour l'en-tête CSRF
          config.headers["X-CSRF-Token"] = globalCsrfToken;

          // Réessayer la requête
          console.log("🔄 Réessai de la requête avec un nouveau token CSRF");
          const retryResponse = await axiosInstance(config);
          return retryResponse.data;
        }
      } catch (retryError) {
        console.error(
          "❌ Échec du rafraîchissement du token CSRF:",
          retryError
        );
      }
    }

    // Propager l'erreur
    throw handleApiError(error);
  }
};

// Fonction pour gérer les erreurs API de manière standardisée
export const handleApiError = (error) => {
  // Si c'est déjà un objet d'erreur normalisé, le retourner tel quel
  if (error.isApiError) {
    return error;
  }

  // Créer un nouvel objet d'erreur normalisé
  const apiError = new Error(
    error.response?.data?.message || error.message || "Erreur inconnue"
  );

  // Ajouter des propriétés pour faciliter le traitement
  apiError.isApiError = true;
  apiError.status = error.response?.status || 0;
  apiError.originalError = error;
  apiError.data = error.response?.data || {};

  // Journaliser l'erreur avec des détails
  console.error("❌ [API Error]", {
    message: apiError.message,
    status: apiError.status,
    data: apiError.data,
    url: error.config?.url,
    method: error.config?.method,
  });

  return apiError;
};

// Fonction pour normaliser les réponses API
export const normalizeApiResponse = (response) => {
  // Si la réponse est déjà un objet standard, la retourner
  if (response.success !== undefined && response.data !== undefined) {
    return response;
  }

  // Construire un objet standard
  return {
    success: true,
    data: response,
    message: null,
    meta: null,
  };
};

// Fonction pour normaliser les erreurs API
export const normalizeApiError = (error) => {
  // Si c'est déjà un objet d'erreur normalisé, le retourner tel quel
  if (error.isNormalizedApiError) {
    return error;
  }

  // Déterminer le statut HTTP
  const status = error.status || error.response?.status || 500;

  // Déterminer le message d'erreur à afficher
  let message = error.message || "Une erreur est survenue";
  if (error.response?.data?.message) {
    message = error.response.data.message;
  }

  // Construire un objet d'erreur standard
  const normalizedError = {
    isNormalizedApiError: true,
    success: false,
    status,
    message,
    error: error.response?.data?.error || "UNKNOWN_ERROR",
    data: error.response?.data || null,
    originalError: error,
  };

  return normalizedError;
};

export default apiRequest;
