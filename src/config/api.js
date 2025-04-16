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
 * Récupère un token CSRF depuis le serveur et le stocke globalement
 * @returns {Promise<string>} Le token CSRF
 */
export const fetchCsrfToken = async () => {
  try {
    console.log("🔒 Demande d'un nouveau token CSRF");

    // Utiliser directement l'URL du token CSRF
    const csrfUrl = "/csrf-token";
    console.log("URL du token CSRF:", csrfUrl);

    const response = await axiosInstance.get(csrfUrl);

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
    console.error(
      "❌ Erreur lors de la récupération du token CSRF avec axiosInstance:",
      error
    );
    console.error("Détails de l'erreur:", error.message);

    // En cas d'échec, essayer avec l'URL alternative
    try {
      console.log("🔄 Tentative avec URL alternative pour le token CSRF");

      // Essayer avec le préfixe /api
      const alternativeUrl = "/api/csrf-token";
      console.log("URL alternative:", alternativeUrl);

      const response = await axiosInstance.get(alternativeUrl);

      if (response.data && response.data.csrfToken) {
        globalCsrfToken = response.data.csrfToken;
        console.log(
          "✅ Token CSRF reçu (2ème tentative):",
          globalCsrfToken.substring(0, 10) + "..."
        );
        return globalCsrfToken;
      }
    } catch (retryError) {
      console.error(
        "❌ Échec de toutes les tentatives de récupération du token CSRF:",
        retryError.message
      );
    }

    return null;
  }
};

/**
 * Récupère le token CSRF actuel ou en demande un nouveau s'il n'existe pas
 * @returns {Promise<string>} Le token CSRF
 */
export const getCsrfToken = async () => {
  // Si nous avons déjà un token, le retourner
  if (globalCsrfToken) {
    console.log("✅ Token CSRF existant utilisé");
    return globalCsrfToken;
  }

  // Sinon, demander un nouveau token avec plusieurs tentatives
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      console.log(`🔄 Tentative #${retries + 1} de récupération du token CSRF`);
      const token = await fetchCsrfToken();

      if (token) {
        console.log(`✅ Token CSRF obtenu après ${retries + 1} tentative(s)`);
        return token;
      }

      retries++;
      if (retries < maxRetries) {
        console.log(`⏱️ Attente avant tentative #${retries + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Attendre 1s entre les tentatives
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la tentative #${retries + 1}:`, error);
      retries++;

      if (retries < maxRetries) {
        console.log(`⏱️ Attente avant tentative #${retries + 1}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Attendre 1s entre les tentatives
      }
    }
  }

  console.error(
    `❌ Échec après ${maxRetries} tentatives de récupération du token CSRF`
  );
  return null;
};

/**
 * Récupère immédiatement le token CSRF stocké globalement sans appel API
 * @param {string|null} [newToken] - Si fourni, définit le token CSRF global
 * @returns {string|null} Le token CSRF ou null s'il n'existe pas
 */
export const getStoredCsrfToken = (newToken = null) => {
  if (newToken !== null) {
    globalCsrfToken = newToken;
    console.log(`✅ Token CSRF défini: ${newToken.substring(0, 10)}...`);
  }
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

  // Vérification pour une utilisation cohérente des préfixes
  // On privilégie l'utilisation explicite de /api/ dans les routes pour éviter les confusions
  if (
    !endpoint.startsWith("/api") &&
    !endpoint.startsWith("http") &&
    !["/csrf-token", "/ping"].includes(endpoint)
  ) {
    console.warn(`⚠️ Route sans préfixe /api/ explicite détectée: ${endpoint}`);
    console.warn(
      "Pour une meilleure cohérence, préférez utiliser le format: /api/xxxx"
    );
  }

  // Construire l'URL en utilisant la fonction standardisée
  const url = endpoint.startsWith("http") ? endpoint : buildApiUrl(endpoint);
  console.log(`📡 [apiRequest] ${method} → ${url}`);

  // Pour les méthodes non-GET, s'assurer d'avoir un token CSRF
  if (
    method !== "GET" &&
    !globalCsrfToken &&
    !endpoint.includes("csrf-token")
  ) {
    console.log("🔒 Récupération du token CSRF avant requête", method);
    try {
      await getCsrfToken(); // Utiliser getCsrfToken qui inclut des tentatives multiples
    } catch (csrfError) {
      console.error("❌ Impossible d'obtenir un token CSRF:", csrfError);
    }
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
      Accept: "application/json",
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
        globalCsrfToken = null; // Réinitialiser pour forcer une nouvelle demande
        await getCsrfToken();

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

    // Amélioration de la journalisation des erreurs
    console.error("❌ Erreur API:", {
      url: config.url,
      method: config.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

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

/**
 * Vérifie proactivement la disponibilité de l'API et du token CSRF
 * @returns {Promise<{apiAvailable: boolean, csrfAvailable: boolean, error: string|null}>}
 */
export const checkApiHealth = async () => {
  try {
    console.log(`Vérification de la santé de l'API sur ${API_URL}`);

    // Essayer d'abord avec l'endpoint /api/auth/verify
    try {
      const verifyResponse = await axiosInstance.get("/api/auth/verify", {
        timeout: 5000,
      });

      if (verifyResponse && verifyResponse.status === 200) {
        console.log("API en bonne santé via /api/auth/verify");
        return { isHealthy: true, endpoint: "/api/auth/verify" };
      }
    } catch (verifyError) {
      console.log(
        "Échec avec /api/auth/verify, tentative avec l'endpoint /api/employees"
      );
    }

    // Si verify échoue, essayer avec endpoint /api/employees comme fallback
    const response = await axiosInstance.get("/api/employees", {
      timeout: 5000,
    });

    console.log("Réponse du serveur:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    return { isHealthy: true, endpoint: "/api/employees" };
  } catch (error) {
    console.error("❌ API non disponible:", error);
    console.error("Statut:", error.response?.status);
    console.error("Message:", error.response?.data?.message || error.message);

    return {
      isHealthy: false,
      error: error.message,
      status: error.response?.status,
      endpoint: "/api/employees",
    };
  }
};

export default apiRequest;
