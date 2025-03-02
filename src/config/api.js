const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const API_ROUTES = {
  // Routes d'authentification
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    LOGOUT: `${API_URL}/auth/logout`,
    ME: `${API_URL}/auth/me`,
    USERS: `${API_URL}/auth/users`,
    USER_DETAIL: (id) => `${API_URL}/auth/users/${id}`,
  },

  // Routes des employés
  EMPLOYEES: {
    BASE: `${API_URL}/employees`,
    DETAIL: (id) => `${API_URL}/employees/${id}`,
  },

  // Routes des congés
  VACATIONS: {
    BASE: `${API_URL}/vacations`,
    DETAIL: (id) => `${API_URL}/vacations/${id}`,
  },

  // Routes du planning
  PLANNING: {
    BASE: `${API_URL}/planning`,
    DETAIL: (id) => `${API_URL}/planning/${id}`,
  },

  // Routes des statistiques
  STATS: {
    OVERVIEW: `${API_URL}/stats/overview`,
    EMPLOYEES: `${API_URL}/stats/employees`,
    VACATIONS: `${API_URL}/stats/vacations`,
    PLANNING: `${API_URL}/stats/planning`,
  },
};

// Configuration par défaut pour fetch
export const fetchConfig = {
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
};

// Helper pour les requêtes API
export const apiRequest = async (url, options = {}) => {
  try {
    console.log("API Request to:", url, "with options:", options);
    const response = await fetch(url, {
      ...fetchConfig,
      ...options,
      headers: {
        ...fetchConfig.headers,
        ...options.headers,
      },
    });

    console.log("API Response status:", response.status);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue");
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};

export default API_ROUTES;
