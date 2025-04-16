import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { apiRequest, fetchCsrfToken, getStoredCsrfToken } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";
import { getApiUrl } from "../utils/api";

// Définir l'URL de l'API
const API_URL = getApiUrl();

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
  const { notifyDataChange, disconnect, connect } = useWebSocket();

  // État pour gérer l'inactivité de l'utilisateur
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityLogoutTimer, setInactivityLogoutTimer] = useState(null);
  const [inactivityCheckTimer, setInactivityCheckTimer] = useState(null);

  // Vérification du token et restauration de la session au chargement
  useEffect(() => {
    const verifySessionToken = async () => {
      try {
        // Récupérer le token depuis le localStorage
        const storedToken = localStorage.getItem("token");

        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        // Appeler l'API pour vérifier le token
        const res = await apiRequest("/api/auth/verify", "GET", null, {
          Authorization: `Bearer ${storedToken}`,
        });

        // Si l'utilisateur est trouvé, restaurer la session
        if (res && res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
          setToken(storedToken);
        } else {
          // Sinon déconnecter l'utilisateur
          logout();
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySessionToken();
  }, []);

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

  // Au chargement initial, obtenir un token CSRF et vérifier l'authentification
  useEffect(() => {
    // Initialiser le token CSRF
    const initApp = async () => {
      // Récupérer un token CSRF au démarrage
      await fetchCsrfToken();

      // Vérifier l'authentification
      await checkInitialAuth();
    };

    initApp();
  }, []);

  // Vérifier l'authentification initiale
  const checkInitialAuth = async () => {
    console.log("Vérification de l'authentification initiale...");
    setIsLoading(true);

    // Ajouter un timeout de sécurité pour éviter le blocage indéfini
    const timeoutId = setTimeout(() => {
      console.warn("Timeout lors de la vérification d'authentification");
      setIsLoading(false);
      setUser(null);
    }, 8000); // 8 secondes maximum

    try {
      // Vérifier s'il y a un token en local storage (vérifier les deux clés possibles)
      const storedToken =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!storedToken) {
        console.log("Aucun token trouvé dans le localStorage");
        clearTimeout(timeoutId);
        setIsLoading(false);
        return;
      }

      // Stocker le token sous les deux formats pour assurer la compatibilité
      localStorage.setItem("token", storedToken);
      localStorage.setItem("accessToken", storedToken);

      // Vérifier le token auprès du serveur - CORRECTION: utiliser /api/auth/verify au lieu de /auth/verify
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${storedToken}`, // Ajouter explicitement le token dans l'en-tête
        },
      });

      console.log("Réponse de vérification:", response.data);

      // Vérifier si l'utilisateur est authentifié selon la nouvelle structure
      if (response.data.isAuthenticated) {
        // Stocker les informations de l'utilisateur
        setUser(response.data.user);

        // Mettre à jour le localStorage si nécessaire
        if (
          !localStorage.getItem("user") ||
          JSON.parse(localStorage.getItem("user")?._id) !==
            response.data.user._id
        ) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Initialiser la connexion WebSocket
        if (connect) {
          connect();
        }
      } else {
        // Non authentifié - message facultatif dans la console
        console.log(
          "Vérification d'authentification: non authentifié",
          response.data.message
        );
        // Effacer les données utilisateur
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification initiale:",
        error
      );
      // En cas d'erreur, considérer l'utilisateur comme non authentifié
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Fonction pour vérifier et renouveler le token si nécessaire
  const ensureValidToken = async () => {
    // Récupérer le token du localStorage
    let currentToken = localStorage.getItem("token");

    if (!currentToken) {
      console.warn("Aucun token d'authentification trouvé");
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      return null;
    }

    return currentToken;
  };

  // Fonction pour récupérer le token authentifié
  const getToken = async () => {
    return await ensureValidToken();
  };

  // Fonction pour définir l'utilisateur avec le rôle admin par défaut
  const setUserWithAdminRole = (userData) => {
    // S'assurer que l'utilisateur a un rôle (admin par défaut)
    const userWithRole = {
      ...userData,
      role: userData.role || "admin",
    };

    // Mettre à jour l'état
    setUser(userWithRole);
    localStorage.setItem("user", JSON.stringify(userWithRole));

    return userWithRole;
  };

  // Fonction pour mettre à jour les informations utilisateur
  const updateUser = (userData) => {
    if (!userData) {
      console.error(
        "Tentative de mise à jour avec des données utilisateur nulles"
      );
      return null;
    }

    // Mettre à jour l'état et le stockage local
    const updatedUser = setUserWithAdminRole(userData);
    console.log("Utilisateur mis à jour:", updatedUser);
    notifyDataChange("user"); // Notifier les autres onglets

    return updatedUser;
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (userData) => {
    try {
      const response = await apiRequest("/user/profile", "PUT", userData);

      if (response && response.success) {
        // Mettre à jour les informations utilisateur localement
        const updatedUser = {
          ...user,
          ...response.user,
        };
        updateUser(updatedUser);
        return {
          success: true,
          message: "Profil mis à jour avec succès",
        };
      } else {
        return {
          success: false,
          message:
            response?.message || "Erreur lors de la mise à jour du profil",
        };
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du profil",
      };
    }
  };

  // Fonction pour rafraîchir le token CSRF
  const refreshCsrfToken = async () => {
    console.log("🔄 Tentative de rafraîchissement du token CSRF");

    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;

    while (retryCount < MAX_RETRIES && !success) {
      try {
        if (retryCount > 0) {
          console.log(
            `🔁 Nouvelle tentative (${retryCount}/${MAX_RETRIES}) de récupération du token CSRF`
          );
          // Attendre un délai progressif avant de réessayer (1s, 2s, 3s)
          await new Promise((resolve) =>
            setTimeout(resolve, retryCount * 1000)
          );
        }

        // Vérifier le cookie CSRF existant
        const existingCsrf = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("XSRF-TOKEN="));

        console.log(
          `🔍 Cookie CSRF existant: ${existingCsrf ? "Présent" : "Absent"}`
        );

        // Construire l'URL complète pour le token CSRF
        const csrfUrl = getApiUrl("/csrf-token");
        console.log(`📡 URL de la requête CSRF: ${csrfUrl}`);

        // Effectuer la requête pour obtenir un nouveau token CSRF
        // Utiliser fetch directement pour contourner les problèmes potentiels avec axios
        const response = await fetch(csrfUrl, {
          method: "GET",
          credentials: "include", // Important pour les cookies
        });

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP lors de la récupération du CSRF: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("📥 Réponse CSRF reçue:", data);

        // Vérifier si la réponse contient le token CSRF
        if (data && data.csrfToken) {
          console.log("✅ Nouveau token CSRF reçu dans la réponse");
          // Stocker le token si présent dans la réponse
          getStoredCsrfToken(data.csrfToken);
        }

        // Vérifier le cookie après la requête
        const newCsrf = document.cookie
          .split(";")
          .find((cookie) => cookie.trim().startsWith("XSRF-TOKEN="));

        if (newCsrf) {
          console.log("✅ Cookie CSRF bien mis à jour");
          // Extraire et stocker la valeur du cookie
          const csrfValue = newCsrf.split("=")[1];
          console.log(
            `🔑 Nouvelle valeur du cookie CSRF: ${csrfValue.substring(
              0,
              10
            )}...`
          );
          success = true;
          return true;
        } else {
          console.warn("⚠️ Cookie CSRF non trouvé après la requête");
          retryCount++;
        }
      } catch (error) {
        console.error(
          `❌ Erreur lors de la tentative ${
            retryCount + 1
          }/${MAX_RETRIES} de récupération du token CSRF:`,
          error
        );
        retryCount++;

        // Si c'est la dernière tentative, propager l'erreur
        if (retryCount >= MAX_RETRIES) {
          return false;
        }
      }
    }

    // Si toutes les tentatives ont échoué
    if (!success) {
      console.error(
        "❌ Échec de récupération du token CSRF après plusieurs tentatives"
      );
      return false;
    }

    return true;
  };

  // Fonction pour préparer le changement de mot de passe
  const preparePasswordChange = async () => {
    try {
      // Rafraîchir le token CSRF avant de changer le mot de passe
      await refreshCsrfToken();

      return {
        success: true,
        message: "Préparation au changement de mot de passe réussie",
      };
    } catch (error) {
      console.error(
        "Erreur lors de la préparation au changement de mot de passe:",
        error
      );
      return {
        success: false,
        message:
          "Erreur lors de la préparation au changement de mot de passe: " +
          error.message,
      };
    }
  };

  // Fonction pour se connecter
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      console.log("🔐 Tentative de connexion pour:", email);

      // Effectuer la requête de connexion directement
      console.log("📡 Envoi de la requête de connexion au serveur");
      const response = await apiRequest("/api/auth/login", "POST", {
        email,
        password,
      });

      // Log complet de la réponse de login
      console.log("📥 Réponse login reçue:", response);
      console.log("🧪 document.cookie après login:", document.cookie);

      if (
        response &&
        (response.success === true || response.token || response.accessToken)
      ) {
        // Afficher un message de connexion réussie
        console.log("✅ Connexion réussie");

        // Récupérer le token et les informations utilisateur
        const userToken = response.token || response.accessToken;
        const refreshToken = response.refreshToken;
        const userInfo = response.user || response.data || response;

        console.log(
          "🔑 Token reçu:",
          userToken ? "Oui, longueur: " + userToken.length : "Non"
        );
        console.log("🔄 RefreshToken reçu:", refreshToken ? "Oui" : "Non");
        console.log("👤 User info reçues:", userInfo ? "Oui" : "Non");

        // Stocker le token dans localStorage sous les deux formats pour compatibilité
        if (userToken) {
          localStorage.setItem("token", userToken);
          localStorage.setItem("accessToken", userToken);
          setToken(userToken);
          console.log("✅ Token stocké dans localStorage avec succès");
        } else {
          console.error("❌ Pas de token reçu dans la réponse");
          setLoginError("Authentification échouée: token non reçu");
          return {
            success: false,
            message: "Pas de token reçu du serveur",
          };
        }

        // S'assurer que nous avons des informations utilisateur
        if (userInfo) {
          // Normaliser les données utilisateur pour garantir une structure cohérente
          const normalizedUser = {
            id: userInfo.id || userInfo.userId || userInfo._id,
            email: userInfo.email,
            username: userInfo.username || userInfo.email,
            first_name: userInfo.first_name || userInfo.firstName || "",
            last_name: userInfo.last_name || userInfo.lastName || "",
            role: userInfo.role || "user",
            // autres propriétés utiles...
          };

          // Mettre à jour l'utilisateur et la session
          setUser(normalizedUser);
          localStorage.setItem("user", JSON.stringify(normalizedUser));
          console.log("👤 Informations utilisateur normalisées et stockées");
        } else {
          console.warn(
            "⚠️ Pas d'informations utilisateur dans la réponse, tentative alternative"
          );

          // Tenter de récupérer les informations utilisateur séparément
          try {
            const userResponse = await apiRequest("/api/user/profile", "GET");
            if (userResponse && (userResponse.user || userResponse.data)) {
              const profileData = userResponse.user || userResponse.data;
              console.log(
                "👤 Profil utilisateur récupéré séparément:",
                profileData
              );
              setUser(profileData);
              localStorage.setItem("user", JSON.stringify(profileData));
            } else {
              // Si on ne peut pas obtenir les infos utilisateur, créer un utilisateur minimal
              const minimalUser = {
                id: Date.now(), // ID temporaire
                email: email,
                username: email.split("@")[0],
                role: "user",
              };
              console.log(
                "⚠️ Création d'un profil utilisateur minimal:",
                minimalUser
              );
              setUser(minimalUser);
              localStorage.setItem("user", JSON.stringify(minimalUser));
            }
          } catch (profileError) {
            console.error(
              "❌ Erreur lors de la récupération du profil:",
              profileError
            );
            // Créer un utilisateur minimal en cas d'échec
            const fallbackUser = {
              id: Date.now(),
              email: email,
              username: email.split("@")[0],
              role: "user",
            };
            console.log(
              "⚠️ Utilisation d'un profil utilisateur de secours:",
              fallbackUser
            );
            setUser(fallbackUser);
            localStorage.setItem("user", JSON.stringify(fallbackUser));
          }
        }

        setIsAuthenticated(true);
        setLoginError(null);

        // Si le WebSocket est configuré, se connecter
        if (connect) {
          connect();
        }

        return {
          success: true,
          message: "Connexion réussie",
          user: userInfo,
        };
      } else {
        const errorMsg = response?.message || "Erreur lors de la connexion";
        console.error("❌ Échec de connexion:", errorMsg);
        setLoginError(errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }
    } catch (error) {
      console.error("❌ Exception lors de la connexion:", error);

      let errorMsg = "Erreur lors de la connexion";

      // Extraire le message d'erreur le plus précis possible
      if (error.message) {
        errorMsg = error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.statusText) {
        errorMsg = `${error.response.statusText} (${error.response.status})`;
      }

      console.error(`❌ Message d'erreur: ${errorMsg}`);
      setLoginError(errorMsg);

      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setIsLoading(false);
      console.log("🏁 Fin du processus de connexion");
    }
  };

  // Fonction pour s'inscrire
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      // Rafraîchir le token CSRF avant l'inscription
      await refreshCsrfToken();

      // Effectuer la requête d'inscription
      const response = await apiRequest("/api/auth/register", "POST", userData);
      console.log("Réponse d'inscription reçue:", response);

      if (response && response.success) {
        // Récupérer le token et les informations utilisateur
        const userToken = response.token || response.accessToken;
        const refreshToken = response.refreshToken;
        const userInfo = response.user;

        console.log("Token reçu:", userToken ? "Oui" : "Non");
        console.log("RefreshToken reçu:", refreshToken ? "Oui" : "Non");
        console.log("User info reçues:", userInfo ? "Oui" : "Non");

        // Stocker le token dans localStorage
        if (userToken) {
          localStorage.setItem("token", userToken);
          setToken(userToken);
        }

        // Mettre à jour les informations utilisateur
        if (userInfo) {
          updateUser(userInfo);
        }

        setIsAuthenticated(true);
        setLoginError(null);

        return {
          success: true,
          message: "Inscription réussie",
          user: userInfo,
        };
      } else {
        const errorMsg = response?.message || "Erreur lors de l'inscription";
        setLoginError(errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      const errorMsg = error.message || "Erreur lors de l'inscription";
      setLoginError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    try {
      // Supprimer les informations d'authentification
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Fermer les connexions WebSocket
      disconnect();

      // Mettre à jour l'état
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      // Effectuer une requête de déconnexion au backend (sans attendre la réponse)
      apiRequest("/api/auth/logout", "POST").catch((error) => {
        console.error("Erreur lors de la déconnexion:", error);
      });

      return {
        success: true,
        message: "Déconnexion réussie",
      };
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la déconnexion",
      };
    }
  };

  // Fonction pour se connecter avec Google (redirection)
  const loginWithGoogle = async () => {
    try {
      window.location.href = getApiUrl("/api/auth/google");
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la redirection vers Google:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la connexion avec Google",
      };
    }
  };

  // Fonction pour demander la suppression du compte
  const requestAccountDeletion = async () => {
    try {
      // Rafraîchir le token CSRF avant la demande
      await refreshCsrfToken();

      const response = await apiRequest(
        "/api/auth/request-account-deletion",
        "POST"
      );

      return {
        success: true,
        message: response?.message || "Demande de suppression envoyée",
      };
    } catch (error) {
      console.error("Erreur lors de la demande de suppression:", error);
      return {
        success: false,
        message:
          error.message || "Erreur lors de la demande de suppression de compte",
      };
    }
  };

  // Fonction pour confirmer la suppression du compte
  const confirmAccountDeletion = async (token) => {
    try {
      // Rafraîchir le token CSRF avant la confirmation
      await refreshCsrfToken();

      const response = await apiRequest(
        "/api/auth/confirm-account-deletion",
        "POST",
        { token }
      );

      // Si la suppression est réussie, déconnecter l'utilisateur
      if (response && response.success) {
        logout();
      }

      return {
        success: true,
        message: response?.message || "Compte supprimé avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la confirmation de suppression:", error);
      return {
        success: false,
        message:
          error.message ||
          "Erreur lors de la confirmation de suppression de compte",
      };
    }
  };

  // Fonction pour rafraîchir le token d'authentification
  const refreshToken = async () => {
    try {
      console.log("Rafraîchissement du token d'authentification...");

      // Rafraîchir d'abord le token CSRF
      await refreshCsrfToken();

      const response = await apiRequest("/api/auth/refresh", "POST");
      console.log("Réponse de rafraîchissement reçue:", response);

      if (response && response.success) {
        // Récupérer le nouveau token
        const newToken = response.token || response.accessToken;
        const refreshToken = response.refreshToken;

        console.log("Nouveau token reçu:", newToken ? "Oui" : "Non");
        console.log("Nouveau refreshToken reçu:", refreshToken ? "Oui" : "Non");

        if (newToken) {
          console.log("Nouveau token reçu");
          localStorage.setItem("token", newToken);
          localStorage.setItem("accessToken", newToken);
          setToken(newToken);
        } else {
          console.warn("Aucun token dans la réponse de rafraîchissement");
        }

        // Mettre à jour les informations utilisateur si disponibles
        if (response.user) {
          updateUser(response.user);
        }

        return {
          success: true,
          message: "Token rafraîchi avec succès",
        };
      } else {
        console.warn("Échec du rafraîchissement du token:", response?.message);
        return {
          success: false,
          message: response?.message || "Échec du rafraîchissement du token",
        };
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return {
        success: false,
        message: error.message || "Erreur lors du rafraîchissement du token",
      };
    }
  };

  // Fonction pour changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Rafraîchir le token CSRF avant le changement de mot de passe
      await refreshCsrfToken();

      const response = await apiRequest("/api/users/change-password", "POST", {
        currentPassword,
        newPassword,
      });

      if (response && response.success) {
        return {
          success: true,
          message: response.message || "Mot de passe changé avec succès",
        };
      } else {
        return {
          success: false,
          message:
            response?.message || "Erreur lors du changement de mot de passe",
        };
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      return {
        success: false,
        message: error.message || "Erreur lors du changement de mot de passe",
      };
    }
  };

  // Composant pour la modale d'inactivité
  const InactivityModal = () => {
    if (!showInactivityModal) return null;

    return (
      <StyledInactivityModal>
        <StyledModalContent>
          <h2>Session inactive</h2>
          <p>
            Vous serez déconnecté automatiquement dans 1 minute en raison
            d'inactivité.
          </p>
          <button onClick={resetInactivityTimer}>Rester connecté</button>
        </StyledModalContent>
      </StyledInactivityModal>
    );
  };

  // Valeur du contexte à fournir
  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    token,
    getToken,
    login,
    loginWithGoogle,
    logout,
    register,
    loginError,
    updateUser: updateUserProfile,
    requestAccountDeletion,
    confirmAccountDeletion,
    preparePasswordChange,
    refreshToken,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <InactivityModal />
    </AuthContext.Provider>
  );
};
