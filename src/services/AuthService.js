import axios from "axios";
import { getStoredCsrfToken } from "../config/api";

/**
 * Service d'authentification pour gérer les opérations liées à l'authentification
 */
const AuthService = {
  // Référence aux informations de l'utilisateur connecté
  currentUser: null,

  /**
   * Configure les intercepteurs Axios pour ajouter automatiquement le token CSRF
   * à toutes les requêtes qui modifient des données
   */
  setupAxiosInterceptors: () => {
    // Intercepteur pour les requêtes
    axios.interceptors.request.use(
      (config) => {
        // Ajouter le token CSRF pour les méthodes non-GET
        if (config.method !== "get") {
          const csrfToken = AuthService.getCsrfToken();
          if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
          }
        }

        // Configuration pour envoyer les cookies avec les requêtes
        config.withCredentials = true;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour les réponses
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si l'erreur est une erreur d'authentification (401) et qu'on n'a pas déjà tenté de rafraîchir le token
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Tenter de rafraîchir le token
            await AuthService.refreshToken();

            // Réessayer la requête d'origine avec le nouveau token
            return axios(originalRequest);
          } catch (refreshError) {
            // Si le rafraîchissement échoue, déconnecter l'utilisateur
            AuthService.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  },

  /**
   * Récupère le token CSRF
   * @returns {string|null} Le token CSRF ou null
   */
  getCsrfToken: () => {
    return getStoredCsrfToken();
  },

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean} Vrai si l'utilisateur est authentifié
   */
  isAuthenticated: () => {
    // L'utilisateur est authentifié s'il a des informations d'utilisateur stockées
    return !!AuthService.getUserInfo();
  },

  /**
   * Obtient les informations de l'utilisateur connecté
   * @returns {Object|null} Les informations de l'utilisateur ou null
   */
  getUserInfo: () => {
    // Si nous avons déjà récupéré l'utilisateur actuel, le renvoyer
    if (AuthService.currentUser) {
      return AuthService.currentUser;
    }

    // Sinon, essayer de le récupérer du stockage local
    const userInfo = localStorage.getItem("user_info");
    if (!userInfo) return null;

    try {
      AuthService.currentUser = JSON.parse(userInfo);
      return AuthService.currentUser;
    } catch (e) {
      console.error("Erreur lors de la récupération des infos utilisateur:", e);
      return null;
    }
  },

  /**
   * Tente de rafraîchir le token d'authentification
   * @returns {Promise<Object>} Les informations utilisateur mises à jour
   */
  refreshToken: async () => {
    try {
      const response = await axios.post(
        "/api/auth/refresh",
        {},
        {
          withCredentials: true, // Important pour envoyer les cookies avec la requête
        }
      );

      if (response.data && response.data.success && response.data.user) {
        // Mettre à jour les informations utilisateur en stockage local
        localStorage.setItem("user_info", JSON.stringify(response.data.user));
        AuthService.currentUser = response.data.user;

        return response.data.user;
      }

      throw new Error("Échec du rafraîchissement du token");
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      AuthService.logout();
      throw error;
    }
  },

  /**
   * Connecte un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Résultat de la connexion
   */
  login: async (email, password) => {
    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true, // Important pour stocker les cookies
        }
      );

      if (response.data && response.data.success && response.data.user) {
        // Stocker les informations utilisateur dans le stockage local
        localStorage.setItem("user_info", JSON.stringify(response.data.user));
        AuthService.currentUser = response.data.user;

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
   * @returns {Promise<Object>} Résultat de la déconnexion
   */
  logout: async () => {
    try {
      // Appeler l'API de déconnexion pour invalider les cookies côté serveur
      await axios.post(
        "/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Erreur lors de la déconnexion côté serveur:", error);
    } finally {
      // Supprimer les informations utilisateur du stockage local
      localStorage.removeItem("user_info");
      AuthService.currentUser = null;

      // Supprimer manuellement les cookies d'authentification côté client
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
      document.cookie =
        "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
      document.cookie =
        "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";
      document.cookie =
        "connect.sid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure";

      // Rediriger vers la page de connexion si nécessaire
      window.location.href = "/login";
    }
  },

  /**
   * Initialise le service d'authentification
   * Utilisé au démarrage de l'application
   */
  init: () => {
    // Configurer les intercepteurs Axios
    AuthService.setupAxiosInterceptors();

    // Vérifier périodiquement si le token est toujours valide
    setInterval(async () => {
      // Ne tenter de rafraîchir que si l'utilisateur est connecté
      if (AuthService.isAuthenticated()) {
        try {
          await AuthService.refreshToken();
        } catch (error) {
          // Si le rafraîchissement échoue, ne rien faire de plus
          // L'intercepteur de réponse s'occupera de la déconnexion si nécessaire
        }
      }
    }, 15 * 60 * 1000); // Vérifier toutes les 15 minutes
  },
};

// Initialiser le service lors de l'importation
AuthService.init();

export default AuthService;
