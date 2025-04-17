const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Nom de clé utilisée pour stocker le token CSRF dans localStorage
const CSRF_TOKEN_KEY = "csrf_token";

/**
 * Récupère la valeur d'un cookie par son nom
 * @param {string} name - Nom du cookie à récupérer
 * @returns {string|null} Valeur du cookie ou null s'il n'existe pas
 */
export function getCookie(name) {
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Récupère le token CSRF depuis le cookie XSRF-TOKEN
 * @returns {string|null} Le token CSRF ou null s'il n'existe pas
 */
export function getCsrfTokenFromCookie() {
  const token = getCookie("XSRF-TOKEN");
  if (token) {
    console.log(
      `🍪 [CSRF] Token récupéré depuis le cookie: ${token.substring(0, 10)}...`
    );
  } else {
    console.warn("⚠️ [CSRF] Aucun token CSRF trouvé dans les cookies");
  }
  return token;
}

/**
 * Génère l'URL complète pour un endpoint API
 * @param {string} path - Chemin relatif de l'API
 * @returns {string} URL complète
 */
export function getApiUrl(path = "") {
  // Afficher des logs pour déboguer les problèmes d'URL
  console.log(`🔍 [API] getApiUrl appelé avec path: "${path}"`);
  console.log(`🔍 [API] API_BASE_URL: "${API_BASE_URL}"`);

  // Si le chemin est déjà une URL complète, la retourner telle quelle
  if (path.startsWith("http")) {
    return path;
  }

  // Cas spécial pour le endpoint CSRF - toujours utiliser /api/csrf-token
  if (path === "/csrf-token" || path === "csrf-token") {
    console.log(
      "🔀 [API] Redirection automatique de /csrf-token vers /api/csrf-token"
    );
    return `${API_BASE_URL}/api/csrf-token`;
  }

  // Cas spécial pour les routes d'authentification - toujours utiliser le préfixe /api
  if (
    path.includes("/auth/") ||
    path === "/auth/login" ||
    path === "auth/login"
  ) {
    if (!path.startsWith("/api")) {
      const authPath = path.startsWith("/") ? path : `/${path}`;
      console.log(
        `🔀 [API] Redirection automatique d'une route auth vers /api${authPath}`
      );
      return `${API_BASE_URL}/api${authPath}`;
    }
  }

  // Liste des endpoints qui ne nécessitent pas le préfixe /api
  const noApiPrefixEndpoints = ["/ping"];

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
    const finalUrl = `${API_BASE_URL}${normalizedPath}`;
    console.log(`🔧 [API] URL construite: ${finalUrl}`);
    return finalUrl;
  }

  // Vérifier si le chemin est un endpoint racine comme "vacations" ou "employees"
  // Tous ces endpoints devraient être préfixés par /api
  const finalUrl = `${API_BASE_URL}/api${normalizedPath}`;
  console.log(`🔧 [API] URL construite avec préfixe /api: ${finalUrl}`);
  return finalUrl;
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
    credentials: "include", // CRUCIAL pour envoyer/recevoir les cookies
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
  // Vérifier d'abord le cookie, qui est la source la plus fiable
  const csrfCookie = getCookie("XSRF-TOKEN");
  if (csrfCookie) {
    console.log("🍪 [CSRF] Token valide trouvé dans les cookies");
    // Mettre à jour le cache mémoire et localStorage
    saveTokenToStorage(csrfCookie);
    return csrfCookie;
  }

  // Vérifier ensuite le cache mémoire
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

  // Initialisation
  let attempt = 0;
  let lastError = null;

  // Boucle de tentatives
  while (attempt < maxRetries) {
    try {
      if (attempt > 0) {
        console.log(`🔁 [CSRF] Tentative ${attempt + 1}/${maxRetries}...`);
        // Délai progressif entre les tentatives
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * (attempt + 1))
        );
      }

      // Utiliser le nouvel endpoint /auth/reset-csrf qui est plus fiable
      const csrfUrl = `${API_BASE_URL}/api/auth/reset-csrf`;

      console.log(`📡 [CSRF] Appel à ${csrfUrl}`);

      // Utilisation de fetch avec credentials pour assurer la conservation des cookies
      const response = await fetch(csrfUrl, {
        method: "GET",
        credentials: "include", // CRUCIAL pour recevoir et envoyer les cookies
        cache: "no-cache", // Éviter le cache navigateur
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP: ${response.status} ${response.statusText}`
        );
      }

      // Vérifier d'abord le cookie qui a pu être défini par la réponse
      const newCookie = getCookie("XSRF-TOKEN");
      if (newCookie) {
        console.log("✅ [CSRF] Nouveau token récupéré depuis les cookies");
        saveTokenToStorage(newCookie);
        return newCookie;
      }

      // Sinon, essayer de récupérer le token depuis la réponse JSON
      try {
        const data = await response.json();
        if (data && data.csrfToken) {
          console.log("✅ [CSRF] Token récupéré depuis la réponse JSON");
          saveTokenToStorage(data.csrfToken);
          return data.csrfToken;
        } else {
          console.warn("⚠️ [CSRF] Aucun token dans la réponse JSON");
        }
      } catch (jsonError) {
        console.error(
          "❌ [CSRF] Erreur lors du parsing de la réponse JSON:",
          jsonError
        );
      }

      // Si on arrive ici, c'est qu'on n'a pas trouvé de token
      return null;
    } catch (error) {
      console.error(
        `❌ [CSRF] Erreur lors de la tentative ${attempt + 1}/${maxRetries}:`,
        error
      );
      lastError = error;
      attempt++;
    }
  }

  console.error(
    "❌ [CSRF] Échec de récupération du token après plusieurs tentatives"
  );
  throw lastError || new Error("Échec de récupération du token CSRF");
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

  // S'assurer que credentials est bien défini
  if (config.credentials !== "include") {
    console.warn(
      "⚠️ [API] credentials n'est pas 'include', correction automatique"
    );
    config.credentials = "include";
  }

  // Vérifier la méthode pour déterminer si un token CSRF est nécessaire
  const method = (config.method || "GET").toUpperCase();
  const requiresCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);

  // Vérifier si un token CSRF est déjà présent
  let csrfToken =
    config.headers["X-CSRF-Token"] || config.headers["x-csrf-token"];

  if (requiresCsrf && !csrfToken) {
    // Pour les méthodes non sécurisées, on a besoin d'un token CSRF
    console.log(`🔒 [API] Requête ${method} nécessite un token CSRF`);

    // Vérifier d'abord le cookie, qui est la source la plus fiable
    csrfToken = getCookie("XSRF-TOKEN");

    if (!csrfToken) {
      // Si aucun token n'est disponible, tenter d'en récupérer un nouveau
      console.log("🔄 [API] Récupération d'un token CSRF avant la requête");
      try {
        csrfToken = await fetchCsrfTokenRobust();
      } catch (error) {
        console.error("❌ [API] Impossible de récupérer un token CSRF:", error);
      }
    }

    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
      console.log(`✅ [API] Token CSRF ajouté à la requête ${method}`);
    } else {
      console.warn(
        `⚠️ [API] Requête ${method} sans token CSRF, risque d'échec`
      );
    }
  }

  // Construire l'URL complète
  const finalUrl = getApiUrl(url);
  console.log(`🔄 [API] Requête ${method} vers ${finalUrl}`);

  // Effectuer la requête
  try {
    const response = await fetch(finalUrl, config);

    // Vérifier si la réponse contient un nouveau token CSRF dans les en-têtes
    const newCsrfToken =
      response.headers.get("X-CSRF-Token") ||
      response.headers.get("csrf-token") ||
      response.headers.get("CSRF-Token");

    if (newCsrfToken) {
      console.log("✅ [API] Nouveau token CSRF reçu dans les en-têtes");
      saveTokenToStorage(newCsrfToken);
    }

    // Vérifier si un nouveau cookie CSRF a été défini
    const cookieToken = getCookie("XSRF-TOKEN");
    if (cookieToken && cookieToken !== csrfToken) {
      console.log("✅ [API] Nouveau token CSRF reçu dans les cookies");
      saveTokenToStorage(cookieToken);
    }

    return response;
  } catch (error) {
    // Si l'erreur est liée au CSRF, retenter avec un nouveau token
    if (error.message.includes("CSRF") || error.message.includes("csrf")) {
      console.warn("⚠️ [API] Possible erreur CSRF, nouvelle tentative...");

      // Forcer la récupération d'un nouveau token
      try {
        const newToken = await fetchCsrfTokenRobust(3, 500);
        if (newToken) {
          config.headers["X-CSRF-Token"] = newToken;
          console.log("🔄 [API] Nouvelle tentative avec un nouveau token CSRF");
          return fetch(finalUrl, config);
        }
      } catch (retryError) {
        console.error(
          "❌ [API] Échec de récupération d'un nouveau token CSRF:",
          retryError
        );
      }
    }

    throw error;
  }
}

/**
 * Récupère le token CSRF, d'abord du cache, puis du localStorage, puis du cookie,
 * et enfin fait une requête pour en obtenir un nouveau si nécessaire
 * @returns {Promise<string|null>} Le token CSRF ou null s'il n'existe pas
 */
export async function getCsrfToken() {
  // Vérifier d'abord le cache mémoire qui est plus rapide
  if (csrfTokenCache) {
    console.log("♻️ [CSRF] Utilisation du token CSRF en cache");
    return csrfTokenCache;
  }

  // Ensuite vérifier localStorage
  const storedToken = localStorage.getItem(CSRF_TOKEN_KEY);
  if (storedToken) {
    console.log("📦 [CSRF] Token récupéré depuis localStorage");
    csrfTokenCache = storedToken;
    csrfTokenTimestamp = Date.now();
    return storedToken;
  }

  // Ensuite vérifier les cookies
  const cookieToken = getCookie("XSRF-TOKEN");
  if (cookieToken) {
    console.log(
      `🍪 [CSRF] Token récupéré depuis le cookie: ${cookieToken.substring(
        0,
        10
      )}...`
    );
    // Mettre à jour le cache mémoire et le localStorage
    csrfTokenCache = cookieToken;
    csrfTokenTimestamp = Date.now();
    saveTokenToStorage(cookieToken);
    return cookieToken;
  }

  // Enfin, faire une requête pour obtenir un nouveau token
  console.log("🔄 [CSRF] Aucun token trouvé, tentative de récupération...");
  try {
    const token = await fetchCsrfTokenRobust();
    return token;
  } catch (error) {
    console.error("❌ [CSRF] Erreur lors de la récupération du token:", error);
    return null;
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

  /**
   * Teste le système CSRF complet, du token jusqu'à la vérification
   * @returns {Promise<Object>} Résultat du test
   */
  async testCsrf() {
    console.log("🧪 [TEST CSRF] Démarrage du test complet...");

    try {
      // 1. Vérifier si nous avons déjà un token CSRF
      let token = getStoredCsrfToken();
      console.log(
        `🔍 [TEST CSRF] Token CSRF existant: ${token ? "Oui" : "Non"}`
      );

      // 2. Si pas de token, en récupérer un nouveau
      if (!token) {
        console.log("🔄 [TEST CSRF] Récupération d'un nouveau token...");
        token = await fetchCsrfTokenRobust();

        if (!token) {
          throw new Error("Impossible de récupérer un token CSRF");
        }
        console.log("✅ [TEST CSRF] Nouveau token récupéré");
      }

      // 3. Vérifier la présence du cookie
      const hasCookie = document.cookie.includes("XSRF-TOKEN");
      console.log(
        `🍪 [TEST CSRF] Cookie XSRF-TOKEN: ${hasCookie ? "Présent" : "Absent"}`
      );

      // 4. Faire une requête GET (ne nécessite pas de vérification CSRF)
      console.log(
        "🔄 [TEST CSRF] Test 1/3: Requête GET (sans vérification)..."
      );
      const getResponse = await api.get("/test/csrf-check");
      const getResult = await getResponse.json();
      console.log("✅ [TEST CSRF] Test GET réussi:", getResult);

      // 5. Faire une requête POST (requiert une vérification CSRF)
      console.log(
        "🔄 [TEST CSRF] Test 2/3: Requête POST (avec vérification)..."
      );
      const postResponse = await api.post("/test/csrf-check", {
        test: true,
        timestamp: Date.now(),
      });
      const postResult = await postResponse.json();
      console.log("✅ [TEST CSRF] Test POST réussi:", postResult);

      // 6. Faire une requête avec un token invalide pour vérifier l'erreur
      console.log("🔄 [TEST CSRF] Test 3/3: Requête avec token invalide...");
      try {
        const invalidTokenResponse = await fetch(
          getApiUrl("/test/csrf-check"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": "token_invalide_pour_test",
            },
            credentials: "include",
            body: JSON.stringify({ test: true, isInvalidTokenTest: true }),
          }
        );

        const invalidResult = await invalidTokenResponse.json();
        console.log(
          "ℹ️ [TEST CSRF] Résultat avec token invalide:",
          invalidResult
        );

        // La requête devrait échouer avec un 403
        if (invalidTokenResponse.ok) {
          console.warn(
            "⚠️ [TEST CSRF] ATTENTION: La requête avec token invalide a réussi!"
          );
        } else {
          console.log(
            "✅ [TEST CSRF] Erreur attendue reçue avec token invalide"
          );
        }
      } catch (invalidError) {
        console.log(
          "✅ [TEST CSRF] Erreur attendue avec token invalide:",
          invalidError.message
        );
      }

      return {
        success: true,
        message: "Tests CSRF complets réussis",
        hasToken: !!token,
        hasCookie,
        getTest: getResult,
        postTest: postResult,
      };
    } catch (error) {
      console.error("❌ [TEST CSRF] Erreur lors du test:", error);
      return {
        success: false,
        message: "Tests CSRF échoués",
        error: error.message,
      };
    }
  },
};
