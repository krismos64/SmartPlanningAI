// src/config/api.js

import axios from "axios";
import { getApiUrl } from "../utils/api";

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
  return getApiUrl() || DEFAULT_PROD_URL;
};

// URL de base de l'API
export const API_URL = resolveApiUrl();

console.log("🌐 [API] API_URL utilisé :", API_URL);

// Variable globale pour stocker le token CSRF
let globalCsrfToken = null;

// Création d'une instance Axios - Utiliser directement l'URL de base sans modification
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

  // Liste des endpoints qui fonctionnent sans préfixe /api
  const noApiPrefixEndpoints = ["/csrf-token", "/ping"];

  // Vérifier si l'URL est déjà absolue (commence par http ou https)
  if (config.url.startsWith("http")) {
    return config;
  }

  // Déterminer si nous devons ajouter le préfixe /api
  const useApiPrefix =
    !config.url.startsWith("/api") &&
    !noApiPrefixEndpoints.includes(config.url);

  // S'assurer que l'URL commence par /api si nécessaire
  if (useApiPrefix) {
    console.log(`Ajout du préfixe /api à l'URL: ${config.url}`);
    config.url = `/api${
      config.url.startsWith("/") ? config.url : `/${config.url}`
    }`;
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
        "/auth/refresh",
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
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  EMPLOYEES: {
    BASE: "/employees",
    BY_ID: (id) => `/employees/${id}`,
    SCHEDULES: (id) => `/employees/${id}/schedules`,
    VACATIONS: (id) => `/employees/${id}/vacations`,
  },
  WEEKLY_SCHEDULES: "/weekly-schedules",
  VACATIONS: {
    BASE: "/vacations",
    BY_ID: (id) => `/vacations/${id}`,
    UPDATE_STATUS: (id) => `/vacations/${id}/status`,
  },
  VACATIONS_MANAGER: "/vacations?manager=true",
  SHIFTS: {
    BASE: "/shifts",
    BY_ID: (id) => `/shifts/${id}`,
  },
  ACTIVITIES: {
    BASE: "/activities",
    BY_ID: (id) => `/activities/${id}`,
    LOG: "/activities/log",
    BY_USER: (userId) => `/activities/user/${userId}`,
    LIST: "/activities",
    CREATE: "/activities",
    UPDATE: (id) => `/activities/${id}`,
    DELETE: (id) => `/activities/${id}`,
  },
  WORK_HOURS: {
    BASE: "/work-hours",
    BY_ID: (id) => `/work-hours/${id}`,
    BY_EMPLOYEE: (employeeId) => `/work-hours/employee/${employeeId}`,
  },
  HOUR_BALANCE: {
    BY_EMPLOYEE: (employeeId) => `/hour-balance/${employeeId}`,
  },
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY: "/auth/verify",
    RESET_PASSWORD: "/auth/reset-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    DELETE_ACCOUNT: "/auth/delete-account",
    REQUEST_ACCOUNT_DELETION: "/auth/request-account-deletion",
    CONFIRM_ACCOUNT_DELETION: "/auth/confirm-account-deletion",
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
    CHANGE_PASSWORD: "/users/change-password",
  },
  DEPARTMENTS: {
    BASE: "/departments",
    BY_ID: (id) => `/departments/${id}`,
    EMPLOYEES: (id) => `/departments/${id}/employees`,
  },
  ROLES: {
    BASE: "/roles",
    BY_ID: (id) => `/roles/${id}`,
  },
  SETTINGS: {
    BASE: "/settings",
    BY_KEY: (key) => `/settings/${key}`,
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_ID: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
  },
  SCHEDULE: {
    AUTO_GENERATE: "/schedule/auto-generate",
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

  // Liste des endpoints qui fonctionnent sans préfixe /api
  const noApiPrefixEndpoints = ["/csrf-token", "/ping"];

  // Si l'endpoint est déjà une URL complète, la retourner telle quelle
  if (endpoint.startsWith("http")) {
    return endpoint;
  }

  // LOGIQUE STANDARDISÉE:
  // 1. Si l'endpoint commence déjà par /api/, on ne touche à rien
  // 2. Si l'endpoint est dans la liste des exceptions spéciales, pas de préfixe
  // 3. Dans tous les autres cas, on ajoute /api/ de façon standardisée

  // Déterminer si on doit ajouter le préfixe /api
  const needsApiPrefix =
    !endpoint.startsWith("/api") && !noApiPrefixEndpoints.includes(endpoint);

  // Construire l'URL
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const finalUrl = needsApiPrefix
    ? `${baseUrl}/api${cleanEndpoint}`
    : `${baseUrl}${cleanEndpoint}`;

  console.log(`🔧 URL API construite: ${endpoint} → ${finalUrl}`);

  return finalUrl;
};

// Constante pour activer/désactiver les logs de débogage API
export const API_DEBUG = process.env.NODE_ENV !== "production";

/**
 * Récupère le token CSRF stocké localement
 * @returns {string|null} - Token CSRF stocké ou null si non trouvé
 */
export const getStoredCsrfToken = () => {
  return localStorage.getItem("csrf_token");
};

/**
 * Récupère la valeur d'un cookie par son nom
 * @param {string} name - Nom du cookie à récupérer
 * @returns {string|null} - Valeur du cookie ou null si non trouvé
 */
export const getCookieValue = (name) => {
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? decodeURIComponent(match[2]) : null;
};

/**
 * Récupération robuste du token CSRF avec mécanisme de retry
 * @param {number} maxRetries - Nombre maximum de tentatives
 * @param {number} retryDelay - Délai entre les tentatives en ms
 * @returns {Promise<string|null>} - Le token CSRF ou null en cas d'échec
 */
export const fetchCsrfTokenRobust = async (
  maxRetries = 3,
  retryDelay = 1000
) => {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      // Si on a déjà un token CSRF en mémoire, on le retourne
      const existingToken = getStoredCsrfToken();
      if (existingToken) {
        return existingToken;
      }

      // Sinon on fait la requête pour en obtenir un nouveau
      const response = await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
      });

      // Extraire le token depuis les cookies
      const csrfToken = getCookieValue("XSRF-TOKEN");

      if (csrfToken) {
        // Stocker le token pour les prochaines requêtes
        localStorage.setItem("csrf_token", csrfToken);
        return csrfToken;
      } else {
        console.warn(
          `⚠️ Échec de récupération du token CSRF (tentative ${
            attempt + 1
          }/${maxRetries}): Pas de token dans la réponse`
        );
        lastError = new Error("Token CSRF non reçu dans la réponse");
      }
    } catch (error) {
      console.warn(
        `⚠️ Échec de récupération du token CSRF (tentative ${
          attempt + 1
        }/${maxRetries}):`,
        error.message
      );
      lastError = error;
    }

    // Attendre avant de réessayer
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
    attempt++;
  }

  console.error(
    `❌ Échec de récupération du token CSRF après ${maxRetries} tentatives.`
  );
  return null;
};

/**
 * Vérifie la santé de l'API
 * @returns {Promise<boolean>} - true si l'API est disponible, false sinon
 */
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/health`, {
      timeout: 3000,
      withCredentials: true,
    });
    return response.status === 200;
  } catch (error) {
    console.error("❌ API indisponible:", error.message);
    return false;
  }
};

// Mise à jour de getCsrfToken pour utiliser la nouvelle méthode robuste
export const getCsrfToken = async () => {
  // Si on a déjà un token stocké, le retourner
  if (globalCsrfToken) {
    return globalCsrfToken;
  }

  // Sinon essayer d'en récupérer un nouveau
  const token = await fetchCsrfTokenRobust();
  if (token) {
    globalCsrfToken = token;
    return token;
  }

  // En dernier recours, essayer de récupérer depuis les cookies
  const cookieToken = getCookie("XSRF-TOKEN");
  if (cookieToken) {
    globalCsrfToken = cookieToken;
    return cookieToken;
  }

  console.warn("⚠️ Aucun token CSRF n'a pu être récupéré");
  return null;
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

// Avant d'exécuter une requête, vérifier et ajouter l'en-tête d'autorisation
const setAuthHeader = (config, headers = {}) => {
  // Récupérer le token depuis différentes sources possibles
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  if (token) {
    console.log("🔑 Token trouvé, ajout à l'en-tête Authorization");
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }

  console.warn("⚠️ Aucun token d'authentification trouvé");
  return headers;
};

// Créer une URL d'API complète avec le préfixe /api
export const buildCompleteApiUrl = (endpoint) => {
  // Assurer que l'API_URL est définie
  if (!API_URL) {
    console.error("API_URL non définie, utilisation de l'URL par défaut");
    return `http://localhost:5001/api${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;
  }

  let url = API_URL;
  console.log(`📍 Construction URL pour endpoint: ${endpoint}`);
  console.log(`📍 API_URL de base: ${url}`);

  // S'assurer que l'URL se termine sans slash
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
    console.log(`📍 URL sans slash final: ${url}`);
  }

  // Si l'endpoint ne commence pas par /, l'ajouter
  let formattedEndpoint = endpoint;
  if (!formattedEndpoint.startsWith("/")) {
    formattedEndpoint = `/${formattedEndpoint}`;
  }

  // Assurer que l'endpoint contient bien le préfixe /api
  if (!formattedEndpoint.startsWith("/api")) {
    formattedEndpoint = `/api${formattedEndpoint}`;
    console.log(`📍 Endpoint avec préfixe /api ajouté: ${formattedEndpoint}`);
  }

  const finalUrl = `${url}${formattedEndpoint}`;
  console.log(`📍 URL finale construite: ${finalUrl}`);

  return finalUrl;
};

// Fonction principale pour les requêtes API
export const apiRequest = async (
  endpoint,
  method = "GET",
  data = null,
  customHeaders = {}
) => {
  try {
    // URL complète de l'API avec préfixe /api
    const url = buildCompleteApiUrl(endpoint);

    // En-têtes par défaut avec authentification
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...setAuthHeader(null, customHeaders),
    };

    // Configuration de la requête
    const config = {
      method,
      headers,
      credentials: "include", // Pour envoyer les cookies
      ...(data && { body: JSON.stringify(data) }),
    };

    console.log(`📡 [API] ${method} ${url}`);

    // Exécuter la requête
    const response = await fetch(url, config);

    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      console.error("🔒 Erreur d'authentification 401");
      throw new Error("Authentification invalide. Veuillez vous reconnecter.");
    }

    // Autres erreurs
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    // Lire la réponse JSON
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`❌ [API Error] ${error.message}`);
    throw error;
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
