import { createContext, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { API_URL } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";
import { AuthService } from "../services/api";

// Style de la modale d'inactivité
const StyledInactivityModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const StyledModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;

  h2 {
    color: #e74c3c;
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1rem;
    color: #333;
  }

  button {
    background-color: #3498db;
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #2980b9;
    }
  }
`;

// Modifier la fonction pour récupérer le token CSRF avec une meilleure gestion des erreurs
const getCsrfToken = () => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Chercher le cookie CSRF, qui pourrait avoir différents noms selon la configuration du serveur
    if (
      cookie.startsWith("csrf-token=") ||
      cookie.startsWith("XSRF-TOKEN=") ||
      cookie.startsWith("_csrf=")
    ) {
      return decodeURIComponent(cookie.split("=")[1]);
    }
  }
  return null;
};

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  getToken: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  register: async () => {},
  loginError: null,
  updateUser: async () => {},
  requestAccountDeletion: async () => {},
  confirmAccountDeletion: async () => {},
  preparePasswordChange: async () => {},
  refreshToken: async () => {},
  changePassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Vérifier si l'utilisateur est déjà authentifié dans localStorage
  const localStorageToken = localStorage.getItem("token");
  const localStorageUser = JSON.parse(localStorage.getItem("user") || "null");

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorageToken);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(localStorageUser);
  const [token, setToken] = useState(localStorageToken);
  const [loginError, setLoginError] = useState(null);
  const { notifyDataChange, disconnect } = useWebSocket();

  // État pour gérer l'inactivité de l'utilisateur
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityLogoutTimer, setInactivityLogoutTimer] = useState(null);
  const [inactivityCheckTimer, setInactivityCheckTimer] = useState(null);

  // Constantes pour les timeouts d'inactivité
  const INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes en millisecondes
  const LOGOUT_WARNING_DURATION = 60 * 1000; // 1 minute en millisecondes

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = () => {
    setLastActivity(Date.now());
    setShowInactivityModal(false);

    // Effacer le timer de déconnexion s'il existe
    if (inactivityLogoutTimer) {
      clearTimeout(inactivityLogoutTimer);
      setInactivityLogoutTimer(null);
    }
  };

  // Fonction pour vérifier périodiquement l'inactivité
  const checkInactivity = () => {
    const now = Date.now();
    const inactiveTime = now - lastActivity;

    if (inactiveTime >= INACTIVITY_THRESHOLD && !showInactivityModal) {
      // L'utilisateur est inactif depuis plus de 15 minutes, afficher la modale
      setShowInactivityModal(true);

      // Définir un timer pour déconnecter après 1 minute supplémentaire
      const timer = setTimeout(() => {
        // Déconnecter l'utilisateur si toujours inactif
        if (
          Date.now() - lastActivity >=
          INACTIVITY_THRESHOLD + LOGOUT_WARNING_DURATION
        ) {
          console.log("Déconnexion automatique pour inactivité");
          logout();
          window.location.href = "/login?reason=inactivity";
        }
      }, LOGOUT_WARNING_DURATION);

      setInactivityLogoutTimer(timer);
    }
  };

  // Configurer les écouteurs d'événements pour suivre l'activité
  useEffect(() => {
    // Uniquement initialiser les écouteurs si l'utilisateur est authentifié
    if (isAuthenticated) {
      // Liste des événements à suivre pour l'activité de l'utilisateur
      const activityEvents = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
        "keydown",
      ];

      // Fonction de gestionnaire pour réinitialiser le timer
      const handleUserActivity = () => {
        resetInactivityTimer();
      };

      // Ajouter les écouteurs d'événements
      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity);
      });

      // Configurer une vérification périodique de l'inactivité (toutes les minutes)
      const checkTimer = setInterval(checkInactivity, 60 * 1000);
      setInactivityCheckTimer(checkTimer);

      // Nettoyer les écouteurs et timers au démontage
      return () => {
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });

        if (inactivityLogoutTimer) {
          clearTimeout(inactivityLogoutTimer);
        }

        if (checkTimer) {
          clearInterval(checkTimer);
        }
      };
    }
  }, [isAuthenticated, lastActivity]);

  // Configurer le rafraîchissement périodique du token
  useEffect(() => {
    // Uniquement initialiser si l'utilisateur est authentifié
    if (isAuthenticated) {
      // Fonction pour vérifier et rafraîchir le token si nécessaire
      const checkTokenExpiration = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          // Décoder le payload du token pour obtenir l'expiration
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expirationTime = payload.exp * 1000; // Convertir en millisecondes
          const currentTime = Date.now();

          // Si le token expire dans moins de 5 minutes, le rafraîchir
          if (expirationTime - currentTime < 5 * 60 * 1000) {
            console.log("Token proche de l'expiration, rafraîchissement...");
            await refreshToken();
          }
        } catch (error) {
          console.error(
            "Erreur lors de la vérification de l'expiration du token:",
            error
          );
        }
      };

      // Vérifier immédiatement au chargement
      checkTokenExpiration();

      // Puis vérifier toutes les 5 minutes
      const tokenCheckInterval = setInterval(
        checkTokenExpiration,
        5 * 60 * 1000
      );

      // Nettoyer l'intervalle au démontage
      return () => {
        clearInterval(tokenCheckInterval);
      };
    }
  }, [isAuthenticated]);

  // Fonction pour vérifier et renouveler le token si nécessaire
  const ensureValidToken = async () => {
    // Récupérer le token du localStorage
    let currentToken = localStorage.getItem("token");

    // Récupérer le token des cookies (qui pourrait être plus récent)
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (
        cookie.startsWith("accessToken=") ||
        cookie.startsWith("auth_token=")
      ) {
        const cookieToken = decodeURIComponent(cookie.split("=")[1]);
        // Si le token du cookie est différent de celui du localStorage, utiliser celui du cookie
        if (cookieToken && cookieToken !== currentToken) {
          console.log("Token mis à jour depuis les cookies");
          localStorage.setItem("token", cookieToken);
          setToken(cookieToken);
          currentToken = cookieToken;
        }
      }
    }

    // S'il n'y a toujours pas de token valide, essayer de se reconnecter
    if (!currentToken) {
      console.log("Aucun token valide trouvé");
      return null;
    }

    return currentToken;
  };

  // Modifier getToken pour utiliser ensureValidToken
  const getToken = async () => {
    // Si le token est déjà dans l'état, vérifier quand même qu'il est à jour
    return await ensureValidToken();
  };

  // Fonction pour définir l'utilisateur avec le rôle admin
  const setUserWithAdminRole = (userData) => {
    // Attribuer automatiquement le rôle admin à tous les utilisateurs
    const userWithAdminRole = {
      ...userData,
      role: "admin", // Tous les utilisateurs ont le rôle admin
      profileImage: userData.profileImage || null,
      company: userData.company || null,
      phone: userData.phone || null,
      jobTitle: userData.jobTitle || null,
    };
    setUser(userWithAdminRole);
    setIsAuthenticated(true);
    return userWithAdminRole;
  };

  // Fonction pour mettre à jour les données utilisateur
  const updateUser = (userData) => {
    console.log("Mise à jour des données utilisateur:", userData);
    const updatedUser = {
      ...user,
      ...userData,
      profileImage: userData.profileImage || user?.profileImage || null,
      company: userData.company || user?.company || "",
      phone: userData.phone || user?.phone || "",
      jobTitle: userData.jobTitle || user?.jobTitle || "",
    };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        console.log("=== DEBUT RESTORATION DE SESSION ===");

        // Tentative de récupération du token CSRF
        await refreshCsrfToken();

        // Vérifier la session d'authentification actuelle avec le backend
        const response = await fetch(`${API_URL}/api/auth/check`, {
          method: "GET",
          credentials: "include", // Envoyer les cookies avec la requête
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.isAuthenticated) {
            console.log("Session valide trouvée", data);
            // Mettre à jour les infos utilisateur depuis la réponse du serveur
            setUser(data.user);
            setIsAuthenticated(true);

            // Si la réponse contient un token, le mettre à jour également
            if (data.token) {
              localStorage.setItem("token", data.token);
              setToken(data.token);
            }

            // Enregistrer l'utilisateur dans le localStorage
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            console.log("Aucune session valide trouvée");
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log(
            "Erreur lors de la vérification de session:",
            response.status
          );
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialAuth();
  }, []);

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (userData) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      // Récupérer le token le plus récent
      const currentToken = await getToken();

      console.log("===== Appel à updateUserProfile =====");
      console.log("Token disponible:", !!currentToken);
      console.log("Données envoyées:", {
        ...userData,
        profileImage: userData.profileImage ? "[IMAGE]" : null,
      });

      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      console.log("Réponse du serveur:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Données de profil reçues:", {
          ...data,
          profileImage: data.profileImage ? "[IMAGE]" : null,
        });

        // S'assurer que les données du profil sont complètes
        const updatedUserData = {
          ...user,
          ...data,
          // Préserver ces champs s'ils sont envoyés, sinon utiliser les valeurs existantes
          profileImage:
            userData.profileImage ||
            data.profileImage ||
            user.profileImage ||
            null,
          phone: userData.phone || data.phone || user.phone || null,
          company: userData.company || data.company || user.company || null,
          jobTitle: userData.jobTitle || data.jobTitle || user.jobTitle || null,
        };

        // Mettre à jour l'état et le stockage local
        setUser(updatedUserData);
        localStorage.setItem("user", JSON.stringify(updatedUserData));

        // Notifier le WebSocket du changement de profil
        notifyDataChange("profile", "update", user.id);

        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        setLoginError(
          errorData.message || "Erreur lors de la mise à jour du profil"
        );
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      const errorMessage =
        err.message || "Erreur lors de la mise à jour du profil";
      setLoginError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier la fonction pour récupérer un nouveau token CSRF avec retry
  const refreshCsrfToken = async (retryCount = 3, delay = 1000) => {
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        console.log(
          `Tentative de récupération du token CSRF (${
            attempt + 1
          }/${retryCount})...`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes

        const response = await fetch(`${API_URL}/api/csrf-token`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log("Nouveau token CSRF obtenu avec succès");

          // Vérifier si le token est bien défini dans les cookies après la réponse
          const csrfToken = getCsrfToken();
          if (!csrfToken) {
            console.warn(
              "Le token CSRF n'a pas été correctement défini dans les cookies"
            );
          }

          return true;
        } else {
          console.error(
            `Échec de l'obtention du token CSRF: ${response.status} - ${response.statusText}`
          );
          if (attempt < retryCount - 1) {
            console.log(`Nouvelle tentative dans ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.error("La requête de token CSRF a expiré");
        } else {
          console.error("Erreur lors de la récupération du token CSRF:", error);
        }

        if (attempt < retryCount - 1) {
          console.log(`Nouvelle tentative dans ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(
      `Échec après ${retryCount} tentatives de récupération du token CSRF`
    );
    return false;
  };

  // Fonction pour préparer le changement de mot de passe
  const preparePasswordChange = async () => {
    try {
      // Récupérer un token CSRF frais
      const csrfSuccess = await refreshCsrfToken();
      if (!csrfSuccess) {
        throw new Error("Impossible de récupérer le token CSRF");
      }

      // Récupérer le token CSRF depuis les cookies
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error(
          "Token CSRF non trouvé dans les cookies après rafraîchissement"
        );
      }

      // Récupérer le token JWT
      const token = await getToken();
      if (!token) {
        throw new Error("Aucun token d'authentification disponible");
      }

      return { token, csrfToken };
    } catch (error) {
      console.error(
        "Erreur lors de la préparation du changement de mot de passe:",
        error
      );
      throw error;
    }
  };

  // Modifier la fonction de login pour initialiser le WebSocket après connexion
  const login = async (email, password) => {
    setIsLoading(true);
    setLoginError(null);
    try {
      console.log("Démarrage de la procédure de connexion");
      console.log("Email utilisé pour la connexion:", email);
      console.log("Longueur du mot de passe:", password ? password.length : 0);

      // Récupérer le token CSRF avec retry
      const csrfSuccess = await refreshCsrfToken();
      if (!csrfSuccess) {
        throw new Error(
          "Impossible de récupérer le token CSRF après plusieurs tentatives"
        );
      }

      // Récupérer le token du cookie
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        throw new Error("Token CSRF non trouvé dans les cookies");
      }

      console.log("Token CSRF récupéré avec succès");

      // Effectuer la requête de connexion
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10 secondes

      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Réponse login:", {
        status: loginResponse.status,
        ok: loginResponse.ok,
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erreur de connexion (${loginResponse.status})`
        );
      }

      const data = await loginResponse.json();
      console.log("Connexion réussie", data);

      // Stocker le token
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // Stocker l'utilisateur
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // Définir l'authentification
      setIsAuthenticated(true);

      console.log("État après login:", {
        token: data.token ? data.token.substring(0, 15) + "..." : null,
        user: data.user ? data.user.email : null,
        isAuthenticated: true,
      });

      // Initialiser la connexion WebSocket avec le token
      try {
        const { initializeSocket } = require("../services/socket");
        const socket = initializeSocket(data.token);
        if (socket) {
          console.log("Initialisation WebSocket après connexion réussie");
          // Connecter explicitement la socket - important pour éviter les connexions automatiques
          socket.connect();
        }
      } catch (socketError) {
        console.error(
          "Erreur lors de l'initialisation du WebSocket après connexion:",
          socketError
        );
        // Ne pas faire échouer le login si le WebSocket échoue
      }

      return true;
    } catch (error) {
      if (error.name === "AbortError") {
        setLoginError(
          "Délai d'attente dépassé lors de la connexion. Veuillez réessayer."
        );
      } else {
        console.error("Erreur lors de la connexion:", error);
        setLoginError(error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier la fonction de register pour initialiser le WebSocket après inscription
  const register = async (userData) => {
    setIsLoading(true);
    try {
      // S'assurer que les champs optionnels sont null et non undefined
      const sanitizedUserData = {
        ...userData,
        profileImage: userData.profileImage || null,
        company: userData.company || null,
        phone: userData.phone || null,
        jobTitle: userData.jobTitle || null,
      };

      console.log("Tentative d'inscription avec:", {
        ...sanitizedUserData,
        password: sanitizedUserData.password ? "***" : null,
        profileImageLength: sanitizedUserData.profileImage
          ? sanitizedUserData.profileImage.length
          : 0,
      });

      // Récupérer le token CSRF depuis les cookies
      const csrfToken = getCsrfToken();
      console.log(
        "Token CSRF pour inscription trouvé:",
        csrfToken ? "Oui" : "Non"
      );

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken || "", // Ajout du token CSRF dans l'en-tête
        },
        body: JSON.stringify(sanitizedUserData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erreur d'inscription (${response.status})`
        );
      }

      const data = await response.json();
      console.log("Données d'inscription reçues:", {
        ...data,
        token: data.token ? "***" : null,
        profileImageLength: data.profileImage ? data.profileImage.length : 0,
      });

      // Stocker le token si présent dans la réponse
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole({
        ...data,
        profileImage: data.profileImage || null,
        company: data.company || null,
        phone: data.phone || null,
        jobTitle: data.jobTitle || null,
      });

      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));

      // Initialiser la connexion WebSocket avec le token
      try {
        const { initializeSocket } = require("../services/socket");
        const socket = initializeSocket(data.token);
        if (socket) {
          console.log("Initialisation WebSocket après inscription réussie");
          // Connecter explicitement la socket - important pour éviter les connexions automatiques
          socket.connect();
        }
      } catch (socketError) {
        console.error(
          "Erreur lors de l'initialisation du WebSocket après inscription:",
          socketError
        );
        // Ne pas faire échouer l'inscription si le WebSocket échoue
      }

      // Notifier le WebSocket de la connexion
      notifyDataChange("auth", "login", adminUser.id);

      return true;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    return new Promise((resolve) => {
      // Notifier le WebSocket de la déconnexion et fermer proprement la connexion
      if (user) {
        try {
          notifyDataChange("auth", "logout", user.id);
          // Déconnecter proprement le WebSocket
          disconnect();
        } catch (error) {
          console.error("Erreur lors de la déconnexion WebSocket:", error);
        }
      }

      // Attendre un court instant pour permettre au WebSocket de se fermer proprement
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userEmployees");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        // Ne pas rediriger ici, renvoyer le contrôle au composant
        resolve(true);
      }, 300);
    });
  };

  // Fonction pour se connecter avec Google
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setLoginError(null);

      console.log("Redirection vers l'authentification Google");

      // Rediriger vers l'endpoint d'authentification Google
      window.location.href = `${API_URL}/api/auth/google`;

      // Cette fonction ne retourne rien car elle redirige l'utilisateur
      return true;
    } catch (err) {
      console.error("Erreur lors de la connexion avec Google:", err);
      setLoginError(err.message || "Erreur lors de la connexion avec Google");
      setIsLoading(false);
      return false;
    }
  };

  // Vérifier si l'utilisateur revient d'une authentification OAuth
  useEffect(() => {
    const checkOAuthRedirect = async () => {
      // Vérifier si nous avons un token dans l'URL (après redirection OAuth)
      const urlParams = new URLSearchParams(window.location.search);
      const oauthToken = urlParams.get("token");
      const oauthError = urlParams.get("error");

      if (oauthToken) {
        try {
          // Stocker le token
          localStorage.setItem("token", oauthToken);
          setToken(oauthToken);

          // Récupérer les informations de l'utilisateur
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${oauthToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();

            // Définir l'utilisateur comme admin
            const adminUser = setUserWithAdminRole(userData);
            localStorage.setItem("user", JSON.stringify(adminUser));

            // Nettoyer l'URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            // Notifier le WebSocket de la connexion
            notifyDataChange("auth", "login", adminUser.id);
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur après OAuth:",
            error
          );
          setLoginError(
            "Erreur lors de la récupération des données utilisateur"
          );
        } finally {
          setIsLoading(false);
        }
      } else if (oauthError) {
        setLoginError(`Erreur d'authentification: ${oauthError}`);
        setIsLoading(false);
        // Nettoyer l'URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    };

    checkOAuthRedirect();
  }, [API_URL, notifyDataChange]);

  // Demander la suppression du compte (envoi d'un lien par email)
  const requestAccountDeletion = async () => {
    try {
      setIsLoading(true);
      const result = await AuthService.requestAccountDeletion();

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la demande de suppression de compte:",
        error
      );
      return {
        success: false,
        message:
          error.message ||
          "Une erreur est survenue lors de la demande de suppression",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmer la suppression du compte avec le token reçu par email
  const confirmAccountDeletion = async (token) => {
    try {
      setIsLoading(true);
      const result = await AuthService.confirmAccountDeletion(token);

      if (result.success) {
        // Supprimer les données locales et déconnecter l'utilisateur
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Déconnecter du websocket si nécessaire
        disconnect && disconnect();

        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error(
        "Erreur lors de la confirmation de suppression de compte:",
        error
      );
      return {
        success: false,
        message:
          error.message ||
          "Une erreur est survenue lors de la suppression du compte",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour rafraîchir le token d'accès
  const refreshToken = async () => {
    try {
      setIsLoading(true);
      console.log("Tentative de rafraîchissement du token...");

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include", // Important pour envoyer les cookies avec la requête
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Token rafraîchi avec succès");

        // Mettre à jour le token dans le localStorage si présent dans la réponse
        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
        }

        // Mettre à jour les infos utilisateur si présentes
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }

        setIsAuthenticated(true);
        setLoginError(null);

        // Redémarrer le timer d'inactivité
        resetInactivityTimer();

        return true;
      } else {
        console.error("Échec du rafraîchissement du token:", data.message);
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        logout();
        return false;
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      // En cas d'erreur, déconnecter l'utilisateur
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error(
          "Vous devez être connecté pour changer votre mot de passe"
        );
      }

      const csrfToken = getCsrfToken();
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Erreur lors du changement de mot de passe"
        );
      }

      return data;
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      throw error;
    }
  };

  // Ajouter le composant de modal d'inactivité
  const InactivityModal = () => {
    if (!showInactivityModal) return null;

    return (
      <StyledInactivityModal>
        <StyledModalContent>
          <h2>Session inactive</h2>
          <p>Vous allez être déconnecté pour inactivité.</p>
          <p>Cliquez n'importe où pour rester connecté.</p>
          <button onClick={resetInactivityTimer}>Rester connecté</button>
        </StyledModalContent>
      </StyledInactivityModal>
    );
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    getToken,
    login,
    loginWithGoogle,
    logout,
    register,
    loginError,
    updateUser,
    updateUserProfile,
    requestAccountDeletion,
    confirmAccountDeletion,
    preparePasswordChange,
    refreshToken,
    changePassword,
    showInactivityModal,
    resetInactivityTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showInactivityModal && <InactivityModal />}
    </AuthContext.Provider>
  );
};
