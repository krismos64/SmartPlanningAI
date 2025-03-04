/**
 * Configuration et utilitaires pour les appels API
 */

// URL de base de l'API
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5001";

// Routes de l'API
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    VERIFY: "/api/auth/verify",
    REFRESH: "/api/auth/refresh",
  },
  EMPLOYEES: {
    BASE: "/api/employees",
    DETAIL: (id) => `/api/employees/${id}`,
  },
  PLANNING: {
    BASE: "/api/planning",
    DETAIL: (id) => `/api/planning/${id}`,
  },
  VACATIONS: {
    BASE: "/api/vacations",
    DETAIL: (id) => `/api/vacations/${id}`,
    APPROVE: (id) => `/api/vacations/${id}/approve`,
    REJECT: (id) => `/api/vacations/${id}/reject`,
  },
  WEEKLY_SCHEDULES: {
    BASE: "/api/weekly-schedules",
    DETAIL: (id) => `/api/weekly-schedules/${id}`,
    BY_WEEK: (weekStart) => `/api/weekly-schedules/week/${weekStart}`,
    BY_EMPLOYEE: (employeeId) => `/api/weekly-schedules/employee/${employeeId}`,
  },
};

/**
 * Fonction pour effectuer des requêtes API
 * @param {string} url - URL de la requête
 * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
 * @param {Object} data - Données à envoyer (pour POST, PUT)
 * @param {Object} headers - En-têtes HTTP supplémentaires
 * @returns {Promise} - Promesse avec les données de la réponse
 */
export const apiRequest = async (
  url,
  method = "GET",
  data = null,
  headers = {}
) => {
  try {
    // Récupérer le token d'authentification du localStorage
    const token = localStorage.getItem("token");

    // Afficher le token utilisé (pour le débogage)
    console.log("🔑 Token utilisé:", token ? "Présent" : "Absent");

    // Préparer les en-têtes de la requête
    const requestHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Ajouter le token d'authentification si disponible
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    // Préparer les options de la requête
    const options = {
      method,
      headers: requestHeaders,
      credentials: "include",
    };

    // Ajouter le corps de la requête pour les méthodes POST et PUT
    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    // Construire l'URL complète
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

    // Afficher les détails de la requête (pour le débogage)
    console.log(`📤 Envoi de la requête: ${method} ${fullUrl}`);

    // Effectuer la requête
    const response = await fetch(fullUrl, options);

    // Vérifier si la réponse est OK
    if (!response.ok) {
      // Si la réponse contient du JSON, l'extraire pour l'erreur
      const errorData = await response.json().catch(() => ({}));
      // eslint-disable-next-line no-throw-literal
      throw {
        status: response.status,
        message: errorData.message || response.statusText,
        data: errorData,
      };
    }

    // Vérifier si la réponse est vide
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: true };
    }

    // Extraire les données JSON de la réponse
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    // Gérer les erreurs réseau
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      console.error("🌐 Erreur réseau:", error);
      // eslint-disable-next-line no-throw-literal
      throw {
        status: 0,
        message: "Erreur de connexion au serveur",
        originalError: error,
      };
    }

    // Propager l'erreur
    console.error("❌ Erreur API:", error);
    throw error;
  }
};
