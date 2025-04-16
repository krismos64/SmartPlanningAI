const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Nom de clé utilisée pour stocker le token CSRF dans localStorage
const CSRF_TOKEN_KEY = "csrf_token";

/**
 * Génère l'URL complète pour un endpoint API
 * @param {string} path - Chemin relatif de l'API
 * @returns {string} URL complète
 */
export function getApiUrl(path = "") {
  // Si le chemin est déjà une URL complète, la retourner telle quelle
  if (path.startsWith("http")) {
    return path;
  }

  // Liste des endpoints qui ne nécessitent pas le préfixe /api
  const noApiPrefixEndpoints = ["/csrf-token", "/ping"];

  // Si le chemin est vide, retourner l'URL de base
  if (!path) {
    return API_BASE_URL || "http://localhost:5001";
  }

  // Normaliser le chemin pour s'assurer qu'il commence par /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Vérifier si le chemin pointe vers une URL d'API standard
  // 1. Les chemins qui commencent déjà par /api
  // 2. Les chemins qui sont dans la liste des exceptions
  if (
    normalizedPath.startsWith("/api") ||
    noApiPrefixEndpoints.includes(normalizedPath)
  ) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  // Vérifier si le chemin est un endpoint racine comme "vacations" ou "employees"
  // Tous ces endpoints devraient être préfixés par /api
  return `${API_BASE_URL}/api${normalizedPath}`;
}

/**
 * Cache en mémoire pour le token CSRF (variable globale au module)
 */
let csrfTokenCache = null;
let csrfTokenTimestamp = 0;

// Durée de vie du token en mémoire (20 minutes)
const TOKEN_EXPIRY = 20 * 60 * 1000;

/**
 * Vérifie si le token CSRF en cache est encore valide
 * @returns {boolean} true si le token est valide, false sinon
 */
function isTokenCacheValid() {
  return csrfTokenCache && Date.now() - csrfTokenTimestamp < TOKEN_EXPIRY;
}

/**
 * Récupère le token CSRF stocké soit en mémoire soit dans localStorage
 * @returns {string|null} Le token CSRF ou null s'il n'existe pas
 */
export function getStoredCsrfToken() {
  // Vérifier d'abord le cache mémoire qui est plus rapide
  if (isTokenCacheValid()) {
    return csrfTokenCache;
  }

  // Ensuite vérifier localStorage
  const storedToken = localStorage.getItem(CSRF_TOKEN_KEY);

  // Si trouvé dans localStorage, rafraîchir le cache mémoire
  if (storedToken) {
    csrfTokenCache = storedToken;
    csrfTokenTimestamp = Date.now();
    return storedToken;
  }

  return null;
}

/**
 * Sauvegarde le token CSRF dans localStorage et dans le cache mémoire
 * @param {string} token - Le token CSRF à sauvegarder
 */
export function saveTokenToStorage(token) {
  if (!token) return;

  // Mettre à jour le cache en mémoire
  csrfTokenCache = token;
  csrfTokenTimestamp = Date.now();

  // Sauvegarder dans localStorage pour persistance
  try {
    localStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch (error) {
    console.warn(
      "❌ [CSRF] Erreur lors de la sauvegarde du token dans localStorage:",
      error
    );
  }
}

/**
 * Configuration par défaut pour toutes les requêtes fetch
 * @returns {Object} Configuration fetch par défaut avec credentials
 */
function getDefaultFetchConfig() {
  return {
    credentials: "include", // Important pour envoyer/recevoir les cookies
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  };
}

/**
 * Effectue une requête pour récupérer un token CSRF avec retry
 * @param {number} maxRetries - Nombre maximum de tentatives (défaut: 3)
 * @param {number} retryDelay - Délai entre les tentatives en ms (défaut: 1000)
 * @returns {Promise<string|null>} Le token CSRF ou null en cas d'erreur
 */
export async function fetchCsrfTokenRobust(maxRetries = 3, retryDelay = 1000) {
  // Vérifier d'abord le cache pour éviter des requêtes inutiles
  if (isTokenCacheValid()) {
    console.log("♻️ [CSRF] Token valide présent en cache mémoire");
    return csrfTokenCache;
  }

  // Vérifier ensuite dans localStorage
  const stored = localStorage.getItem(CSRF_TOKEN_KEY);
  if (stored) {
    console.log("📦 [CSRF] Token récupéré depuis localStorage");
    csrfTokenCache = stored;
    csrfTokenTimestamp = Date.now();
    return stored;
  }

  console.log("🔄 [CSRF] Récupération d'un nouveau token...");

  // Tentatives de récupération avec retry
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(
        getApiUrl("/csrf-token"),
        getDefaultFetchConfig()
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.csrfToken) {
        // Sauvegarder le token
        saveTokenToStorage(data.csrfToken);
        console.log("✅ [CSRF] Token récupéré et mis en cache");

        // Vérifier si le cookie a été également défini
        const hasCookie = document.cookie.includes("XSRF-TOKEN");
        console.log(
          `🍪 [CSRF] Cookie XSRF-TOKEN: ${hasCookie ? "Présent" : "Absent"}`
        );

        return data.csrfToken;
      } else {
        console.warn("⚠️ [CSRF] La réponse ne contient pas de token:", data);
        lastError = new Error("Réponse sans token CSRF");
      }
    } catch (error) {
      console.warn(
        `⚠️ [CSRF] Tentative ${attempt + 1}/${maxRetries} échouée:`,
        error.message
      );
      lastError = error;
    }

    // Attendre avant de réessayer (délai exponentiel)
    const backoffDelay = retryDelay * Math.pow(1.5, attempt);
    console.log(
      `⏱️ [CSRF] Attente de ${backoffDelay}ms avant nouvelle tentative`
    );
    await new Promise((r) => setTimeout(r, backoffDelay));
    attempt++;
  }

  console.error("❌ [CSRF] Échec après plusieurs tentatives:", lastError);
  return null;
}

/**
 * Effectue une requête HTTP avec les bonnes pratiques
 * @param {string} url - URL de la requête
 * @param {Object} options - Options fetch
 * @returns {Promise<Response>} Réponse de fetch
 */
export async function fetchWithCsrf(url, options = {}) {
  // Fusionner avec la configuration par défaut
  const config = {
    ...getDefaultFetchConfig(),
    ...options,
    headers: {
      ...getDefaultFetchConfig().headers,
      ...options.headers,
    },
  };

  // Ajouter le token CSRF s'il existe
  const csrfToken = await getStoredCsrfToken();
  if (csrfToken && !config.headers["X-CSRF-Token"]) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  // Effectuer la requête
  try {
    const response = await fetch(getApiUrl(url), config);

    // Vérifier si un nouveau token CSRF est présent dans la réponse
    try {
      const data = await response.clone().json();
      if (data && data.csrfToken) {
        saveTokenToStorage(data.csrfToken);
      }
    } catch (e) {
      // Ignorer les erreurs de parsing JSON
    }

    return response;
  } catch (error) {
    console.error(`❌ [API] Erreur lors de la requête vers ${url}:`, error);
    throw error;
  }
}

// Exporter les fonctions d'API courantes
export const api = {
  async get(url, options = {}) {
    return fetchWithCsrf(url, { method: "GET", ...options });
  },

  async post(url, data = {}, options = {}) {
    return fetchWithCsrf(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  },

  async put(url, data = {}, options = {}) {
    return fetchWithCsrf(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  },

  async delete(url, options = {}) {
    return fetchWithCsrf(url, { method: "DELETE", ...options });
  },
};
