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
   * Récupère la date d'expiration du token JWT
   * @returns {number|null} Timestamp d'expiration du token ou null si non disponible
   */
  getTokenExpiry: () => {
    try {
      // Récupérer le token JWT (stocké dans le cookie ou dans le localStorage)
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {});

      const jwtToken = cookies.accessToken || cookies.auth_token;

      if (!jwtToken) {
        return null;
      }

      // Décoder le token JWT pour extraire l'expiration
      const base64Url = jwtToken.split(".")[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Récupérer l'expiration (exp) et la convertir en millisecondes
      if (payload.exp) {
        return payload.exp * 1000; // Convertir les secondes en millisecondes
      }

      return null;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'expiration du token:",
        error
      );
      return null;
    }
  },

  /**
   * Tente de rafraîchir le token d'authentification
   * @returns {Promise<boolean>} True si le rafraîchissement a réussi, false sinon
   */
  refreshToken: async () => {
    console.log("🔄 Tentative de rafraîchissement du token...");

    // Éviter les appels multiples en parallèle
    if (AuthService._isRefreshing) {
      console.log(
        "⏳ Un rafraîchissement de token est déjà en cours, attente..."
      );
      try {
        await AuthService._refreshPromise;
        console.log("✅ Le rafraîchissement de token parallèle s'est terminé");
        return true;
      } catch (error) {
        console.error(
          "❌ Le rafraîchissement de token parallèle a échoué:",
          error
        );
        return false;
      }
    }

    // Créer une nouvelle promesse pour ce rafraîchissement
    AuthService._isRefreshing = true;
    AuthService._refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          "/api/auth/refresh",
          {},
          {
            withCredentials: true, // Important pour envoyer les cookies avec la requête
            timeout: 10000, // Timeout de 10 secondes
          }
        );

        if (response.data && response.data.success && response.data.user) {
          // Mettre à jour les informations utilisateur en stockage local
          localStorage.setItem("user_info", JSON.stringify(response.data.user));
          AuthService.currentUser = response.data.user;

          console.log("✅ Token rafraîchi avec succès");
          resolve(true);
          return true;
        } else {
          console.error(
            "❌ Réponse invalide du serveur lors du rafraîchissement:",
            response.data
          );
          reject(
            new Error("Échec du rafraîchissement du token: Réponse invalide")
          );
          return false;
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors du rafraîchissement du token:",
          error.message
        );

        // Journal plus détaillé pour les erreurs de réseau ou d'API
        if (error.response) {
          console.error(`Statut de l'erreur: ${error.response.status}`);
          console.error(
            `Message du serveur: ${JSON.stringify(error.response.data)}`
          );
        } else if (error.request) {
          console.error(`Erreur de réseau, pas de réponse: ${error.request}`);
        } else {
          console.error(`Erreur de configuration: ${error.message}`);
        }

        reject(error);
        return false;
      } finally {
        AuthService._isRefreshing = false;
      }
    });

    try {
      return await AuthService._refreshPromise;
    } catch (error) {
      return false;
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
      // Utiliser l'URL API complète en important getApiUrl
      const apiUrl = require("../utils/api").getApiUrl("/api/auth/login");
      console.log(`🔄 [AuthService] URL de connexion utilisée: ${apiUrl}`);

      const response = await axios.post(
        apiUrl,
        {
          email,
          password,
        },
        {
          withCredentials: true, // Important pour stocker les cookies
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
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

  /**
   * Récupère le token d'authentification
   * @returns {string|null} Le token d'authentification ou null
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Récupère le refresh token
   * @returns {string|null} Le refresh token ou null
   */
  getRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },

  /**
   * Vérifie si le token est expiré
   * @returns {boolean} True si le token est expiré
   */
  isTokenExpired: () => {
    const expiry = AuthService.getTokenExpiry();
    if (!expiry) return true;

    // Considérer le token comme expiré 30 secondes avant pour éviter les problèmes
    return expiry - 30000 < Date.now();
  },

  /**
   * Vérifie la validité du token d'authentification
   * @returns {Promise<boolean>} Retourne true si le token est valide, false sinon
   */
  checkTokenValidity: async () => {
    try {
      // Vérifier d'abord si l'utilisateur a un token
      if (!AuthService.isAuthenticated()) {
        console.warn("Aucun token d'authentification trouvé");
        return false;
      }

      // Vérifier si le token est expiré
      if (AuthService.isTokenExpired()) {
        console.warn("Token expiré, rafraîchissement nécessaire");
        return false;
      }

      // Si nous arrivons ici, le token est valide et non expiré
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return false;
    }
  },

  /**
   * Calcule la date d'expiration du token
   * @param {number} expiresIn Durée de validité du token en secondes
   * @returns {number} Timestamp d'expiration
   */
  calculateExpiryTime: (expiresIn) => {
    return Date.now() + expiresIn * 1000;
  },

  /**
   * Authentifie un utilisateur
   * @param {Object} credentials Les identifiants de connexion
   * @returns {Promise<Object>} Résultat de la connexion
   */
};

// Initialiser le service lors de l'importation
AuthService.init();

export default AuthService;
