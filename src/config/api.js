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

// Détection automatique de l'URL backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Intercepteur principal qui ajoute les tokens d'authentification et CSRF
axiosInstance.interceptors.request.use((config) => {
  // Ajouter le token d'authentification depuis localStorage
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // Ajouter le token CSRF depuis les cookies
  const csrf = getCookie("XSRF-TOKEN");
  if (csrf && !config.headers["X-CSRF-Token"]) {
    config.headers["X-CSRF-Token"] = csrf;
  }

  // S'assurer que withCredentials est activé pour toutes les requêtes
  config.withCredentials = true;

  return config;
});

// Log global des appels API
axiosInstance.interceptors.request.use((config) => {
  console.log(
    `📡 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
  );
  return config;
});

// Log des réponses API
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [API OK] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `❌ [API ERROR] ${error.response?.status} ${error.config?.url}`
    );
    return Promise.reject(error);
  }
);

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

export default axiosInstance; // ✅ export par défaut obligatoire

// Ajouter un intercepteur pour ajouter automatiquement le token CSRF aux requêtes
axiosInstance.interceptors.request.use(
  async (config) => {
    // Ajouter le token CSRF à toutes les requêtes sauf GET, HEAD et OPTIONS
    const safeHttpMethods = ["get", "head", "options"];
    const method = config.method?.toLowerCase() || "get";

    // Vérifier si on a besoin d'un token CSRF (pour méthodes non sécurisées)
    if (!safeHttpMethods.includes(method)) {
      // Si on a déjà un token global, l'utiliser
      if (globalCsrfToken) {
        config.headers["X-CSRF-Token"] = globalCsrfToken;
        console.log(
          `🔒 [CSRF] Token ajouté à la requête ${method.toUpperCase()} ${
            config.url
          }:`,
          globalCsrfToken.substring(0, 10) + "..."
        );
      } else {
        // Sinon essayer d'en récupérer un nouveau (async)
        console.log(
          `⚠️ [CSRF] Pas de token pour la requête ${method.toUpperCase()} ${
            config.url
          }, récupération...`
        );
        try {
          // Tentative de récupération synchrone depuis le cookie pour éviter d'attendre
          const cookieToken = getCookie("XSRF-TOKEN");
          if (cookieToken) {
            // Mise à jour de la variable globale pour les futurs appels
            globalCsrfToken = cookieToken;
            localStorage.setItem("csrf_token", cookieToken);

            // Utilisation immédiate pour cette requête
            config.headers["X-CSRF-Token"] = cookieToken;
            console.log(
              `🔒 [CSRF] Token récupéré du cookie et ajouté à la requête:`,
              cookieToken.substring(0, 10) + "..."
            );
          } else {
            // Si pas de cookie, lancer une requête pour obtenir un token (pour les futurs appels)
            // Cette requête est lancée en parallèle et ne bloque pas la requête actuelle
            getCsrfToken()
              .then((token) => {
                console.log(
                  "🔄 [CSRF] Token obtenu pour les prochaines requêtes"
                );
              })
              .catch((err) => {
                console.error("❌ [CSRF] Échec de récupération du token:", err);
              });

            console.warn(
              `⚠️ [CSRF] Requête ${method.toUpperCase()} ${
                config.url
              } envoyée SANS token CSRF!`
            );
          }
        } catch (error) {
          console.error(
            `❌ [CSRF] Erreur lors de la récupération du token:`,
            error
          );
        }
      }
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
        // Mettre à jour la variable globale avec le token existant
        globalCsrfToken = existingToken;
        console.log(
          "♻️ [CSRF] Utilisation du token CSRF existant:",
          existingToken.substring(0, 10) + "..."
        );
        return existingToken;
      }

      // Toujours s'assurer qu'on utilise le préfixe /api/
      const csrfEndpoint = "/api/csrf-token";
      console.log(
        `🔄 [CSRF] Tentative ${
          attempt + 1
        }/${maxRetries} d'appel à ${API_URL}${csrfEndpoint}`
      );

      // Sinon on fait la requête pour en obtenir un nouveau
      const response = await axios.get(`${API_URL}${csrfEndpoint}`, {
        withCredentials: true,
      });

      // Vérifier que la réponse est de type JSON
      const contentType = response.headers["content-type"] || "";
      if (contentType.includes("text/html")) {
        console.error("⚠️ Mauvais type de réponse reçu : HTML au lieu de JSON");
        throw new Error("Le serveur a renvoyé du HTML au lieu du JSON attendu");
      }

      // Vérifier que la réponse est bien un objet avec un token CSRF
      if (response.data && response.data.csrfToken) {
        // Stocker le token pour les prochaines requêtes
        const token = response.data.csrfToken;
        localStorage.setItem("csrf_token", token);

        // Mise à jour de la variable globale pour les intercepteurs
        globalCsrfToken = token;

        console.log(
          "✅ [CSRF] Token récupéré et globalisé avec succès:",
          token.substring(0, 10) + "..."
        );
        return token;
      }

      // Extraire le token depuis les cookies
      const csrfToken = getCookieValue("XSRF-TOKEN");

      if (csrfToken) {
        // Stocker le token pour les prochaines requêtes
        localStorage.setItem("csrf_token", csrfToken);

        // Mise à jour de la variable globale pour les intercepteurs
        globalCsrfToken = csrfToken;

        console.log(
          "✅ [CSRF] Token récupéré depuis le cookie et globalisé:",
          csrfToken.substring(0, 10) + "..."
        );
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

      // Si l'erreur indique un problème de parsing JSON, afficher plus de détails
      if (error.message.includes("JSON")) {
        console.error(
          "❌ [CSRF] Erreur de parsing JSON. La réponse pourrait être du HTML."
        );
        // Si c'est une erreur Axios, tenter d'afficher le contenu de la réponse pour diagnostic
        if (error.response && error.response.data) {
          const preview =
            typeof error.response.data === "string"
              ? error.response.data.substring(0, 150)
              : JSON.stringify(error.response.data).substring(0, 150);
          console.error(`⚠️ Début du contenu reçu: ${preview}...`);
        }
      }

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
  // Si on a déjà un token stocké en variable globale, le retourner
  if (globalCsrfToken) {
    console.log(
      "♻️ [CSRF] Réutilisation du token global existant:",
      globalCsrfToken.substring(0, 10) + "..."
    );
    return globalCsrfToken;
  }

  console.log("🔍 [CSRF] Pas de token global, tentative de récupération...");

  // Sinon essayer d'en récupérer un nouveau via la méthode robuste
  // Cette fonction met déjà à jour globalCsrfToken
  const token = await fetchCsrfTokenRobust();
  if (token) {
    // On n'a pas besoin de mettre à jour globalCsrfToken ici car c'est déjà fait dans fetchCsrfTokenRobust
    console.log(
      "✅ [CSRF] Token récupéré et disponible pour tous les appels API"
    );
    return token;
  }

  // En dernier recours, essayer de récupérer depuis les cookies
  const cookieToken = getCookie("XSRF-TOKEN");
  if (cookieToken) {
    // Mettre à jour la variable globale et le localStorage
    globalCsrfToken = cookieToken;
    localStorage.setItem("csrf_token", cookieToken);
    console.log(
      "🍪 [CSRF] Token récupéré depuis le cookie et globalisé:",
      cookieToken.substring(0, 10) + "..."
    );
    return cookieToken;
  }

  console.warn("⚠️ [CSRF] Aucun token CSRF n'a pu être récupéré");
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

// Fonction pour configurer l'en-tête d'authentification
const setAuthHeader = (config, headers = {}) => {
  // Récupérer le token depuis localStorage
  const token = localStorage.getItem("token");

  // Si un token est trouvé, l'ajouter à l'en-tête
  if (token) {
    console.log(
      `🔑 [API] Ajout du token JWT (${token.substring(0, 15)}...) à la requête`
    );
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Si aucun token n'est trouvé, log d'avertissement
  console.warn(
    "⚠️ [API] Aucun token JWT trouvé dans localStorage pour l'authentification"
  );
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

    // Récupérer le token depuis localStorage pour l'authentification
    const token = localStorage.getItem("token");

    // En-têtes par défaut avec authentification
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Ajouter le token d'authentification s'il existe
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(
        `🔑 [API] Token JWT ajouté à la requête: ${token.substring(0, 15)}...`
      );
    } else if (
      endpoint.includes("/auth/") === false &&
      endpoint !== "/api/csrf-token"
    ) {
      // Ne pas afficher d'avertissement pour les endpoints d'authentification ou de CSRF
      console.warn(
        `⚠️ [API] Requête ${method} ${endpoint} sans token JWT (mode invité)`
      );
    }

    // Fusionner avec les en-têtes personnalisés
    const mergedHeaders = { ...headers, ...customHeaders };

    // Journaliser les en-têtes (sans Authorization complet pour la sécurité)
    const loggableHeaders = { ...mergedHeaders };
    if (loggableHeaders.Authorization) {
      loggableHeaders.Authorization =
        loggableHeaders.Authorization.substring(0, 20) + "...";
    }
    console.log(`🧩 [API] En-têtes de la requête:`, loggableHeaders);

    // Configuration de la requête
    const config = {
      method,
      headers: mergedHeaders,
      credentials: "include", // Pour envoyer les cookies
      ...(data && { body: JSON.stringify(data) }),
    };

    console.log(`📡 [API] ${method} ${url}`);
    if (data) {
      console.log(`📦 [API] Données envoyées:`, data);
    }

    // Exécuter la requête
    const response = await fetch(url, config);

    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      console.error("🔒 [API] Erreur d'authentification 401");

      // Si nous sommes déjà sur la page de login, ne pas rediriger à nouveau
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        console.warn(
          "🔄 [API] Redirection vers la page de connexion en raison d'un token invalide"
        );
        // Optionnel: rediriger vers la page de login
        // window.location.href = "/login?expired=true";
      }

      throw new Error("Authentification invalide. Veuillez vous reconnecter.");
    }

    // Autres erreurs
    if (!response.ok) {
      try {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ [API] Erreur ${response.status}:`, errorData);
        throw new Error(errorData.message || `Erreur ${response.status}`);
      } catch (parseError) {
        console.error(
          `❌ [API] Erreur ${response.status} - Impossible de parser la réponse`
        );
        throw new Error(
          `Erreur ${response.status}: Impossible de parser la réponse`
        );
      }
    }

    // Vérifier le Content-Type de la réponse
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text/html")) {
      console.error(
        "⚠️ [API] Mauvais type de réponse reçu : HTML au lieu de JSON"
      );
      // Récupérer le début du contenu HTML pour le diagnostic
      const htmlContent = await response.clone().text();
      const previewContent = htmlContent.substring(0, 150);
      console.error(`⚠️ [API] Début du contenu HTML: ${previewContent}...`);
      throw new Error("Le serveur a renvoyé du HTML au lieu du JSON attendu");
    }

    // Lire la réponse JSON
    try {
      const result = await response.json();
      console.log(`✅ [API] Réponse reçue pour ${method} ${endpoint}:`, result);
      return result;
    } catch (jsonError) {
      console.error(`❌ [API] Erreur de parsing JSON:`, jsonError);
      // Récupérer le contenu brut pour le diagnostic
      const textContent = await response.clone().text();
      const previewContent = textContent.substring(0, 150);
      console.error(`⚠️ [API] Contenu brut reçu (début): ${previewContent}...`);
      throw new Error("Erreur de parsing: la réponse n'est pas un JSON valide");
    }
  } catch (error) {
    console.error(`❌ [API Error] ${error.message}`, error);
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
