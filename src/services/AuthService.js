import axios from "axios";

/**
 * Service d'authentification pour gérer les opérations liées à l'authentification
 */
const AuthService = {
  /**
   * Obtient le token d'authentification à partir du localStorage
   * @returns {string|null} Le token ou null si non authentifié
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean} Vrai si l'utilisateur est authentifié
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Obtient les informations de l'utilisateur connecté
   * @returns {Object|null} Les informations de l'utilisateur ou null
   */
  getUserInfo: () => {
    const userInfo = localStorage.getItem("user_info");
    if (!userInfo) return null;
    try {
      return JSON.parse(userInfo);
    } catch (e) {
      console.error("Erreur lors de la récupération des infos utilisateur:", e);
      return null;
    }
  },

  /**
   * Connecte un utilisateur
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Résultat de la connexion
   */
  login: async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_info", JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      return { success: false, message: "Authentification échouée" };
    } catch (error) {
      console.error("Erreur de connexion:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erreur lors de la connexion",
      };
    }
  },

  /**
   * Déconnecte l'utilisateur
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
  },

  /**
   * Obtient l'en-tête d'authentification pour les requêtes API
   * @returns {Object} L'en-tête d'authentification
   */
  getAuthHeader: () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Exporter le service par défaut et la fonction getAuthHeader individuellement
export default AuthService;
export const { getAuthHeader } = AuthService;
