import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import styled from "styled-components";
import axiosInstance, { apiRequest } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";
import {
  fetchCsrfTokenRobust as fetchCsrfToken,
  getApiUrl,
  getStoredCsrfToken,
  saveTokenToStorage,
} from "../utils/api";
import { getCookie } from "../utils/cookies";

// URL de l'API définie ici mais utilisée via getApiUrl() plus loin
// const API_URL = getApiUrl();

console.log("🧪 axiosInstance =", axiosInstance);

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
  // Ces valeurs ne sont plus utilisées depuis la désactivation de l'authentification automatique
  // const localStorageToken = localStorage.getItem("token");
  // const localStorageUser = JSON.parse(localStorage.getItem("user") || "null");

  // Désactiver l'authentification automatique par localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const { notifyDataChange, disconnect } = useWebSocket();
  // const { showNotification } = useNotifications();

  // État pour gérer l'inactivité de l'utilisateur
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [inactivityLogoutTimer, setInactivityLogoutTimer] = useState(null);
  const [inactivityCheckTimer, setInactivityCheckTimer] = useState(null);

  // Constantes pour les timeouts d'inactivité
  const INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes en millisecondes
  const LOGOUT_WARNING_DURATION = 60 * 1000; // 1 minute en millisecondes

  // Fonction pour mettre à jour les informations utilisateur
  const updateUser = useCallback(
    (userData) => {
      if (!userData) {
        console.error(
          "Tentative de mise à jour avec des données utilisateur nulles"
        );
        return null;
      }

      // Mettre à jour l'état et le stockage local sans affecter de rôle par défaut
      console.log("Mise à jour des données utilisateur:", userData);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      notifyDataChange("user"); // Notifier les autres onglets

      return userData;
    },
    [notifyDataChange]
  );

  // Fonction pour rafraîchir le token CSRF - déclarée tôt pour être utilisée dans refreshToken
  const refreshCsrfToken = useCallback(async () => {
    console.log("🔄 Tentative de rafraîchissement du token CSRF");

    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;

    // Essayer d'abord avec /auth/reset-csrf qui est plus fiable
    try {
      console.log("🔄 Tentative avec /auth/reset-csrf...");
      const resetResponse = await fetch(getApiUrl("/auth/reset-csrf"), {
        method: "GET",
        credentials: "include",
      });

      if (resetResponse.ok) {
        const data = await resetResponse.json();
        if (data.csrfToken) {
          saveTokenToStorage(data.csrfToken);
          console.log(
            "✅ Token CSRF récupéré via reset-csrf:",
            data.csrfToken.substring(0, 10) + "..."
          );
          return true;
        }
      } else {
        console.warn(
          `⚠️ /auth/reset-csrf a répondu avec ${resetResponse.status}: ${resetResponse.statusText}`
        );
      }
    } catch (resetError) {
      console.error("❌ Erreur avec /auth/reset-csrf:", resetError);
    }

    // Si reset-csrf a échoué, utiliser la méthode originale avec plusieurs tentatives
    while (retryCount < MAX_RETRIES && !success) {
      try {
        if (retryCount > 0) {
          console.log(
            `🔁 Nouvelle tentative (${retryCount}/${MAX_RETRIES}) de récupération du token CSRF`
          );
          // Utiliser un délai indépendant de retryCount dans la fonction setTimeout
          const delay = retryCount * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        // Obtenir un nouveau token CSRF
        const csrfUrl = getApiUrl("/csrf-token");
        const response = await fetch(csrfUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP lors de la récupération du CSRF: ${response.status}`
          );
        }

        const data = await response.json();
        if (data && data.csrfToken) {
          getStoredCsrfToken(data.csrfToken);
          saveTokenToStorage(data.csrfToken);
          success = true;
          return true;
        }

        const csrfCookie = getCookie("XSRF-TOKEN");
        if (csrfCookie) {
          success = true;
          return true;
        } else {
          retryCount++;
        }
      } catch (error) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          return false;
        }
      }
    }

    return success;
  }, []);

  // Déclaration anticipée de logout pour permettre son utilisation dans useCallback
  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (disconnect) disconnect();
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      return { success: true };
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      return { success: false };
    }
  }, [disconnect]);

  // Déclaration anticipée de refreshToken
  const refreshToken = useCallback(async () => {
    try {
      console.log("Rafraîchissement du token d'authentification...");

      // Rafraîchir d'abord le token CSRF
      await refreshCsrfToken();

      const response = await apiRequest("/auth/refresh", "POST");
      console.log("Réponse de rafraîchissement reçue:", response);

      if (response && response.success) {
        // Récupérer le nouveau token
        const newToken = response.token || response.accessToken;
        if (newToken) {
          console.log("Nouveau token reçu");
          localStorage.setItem("token", newToken);
          localStorage.setItem("accessToken", newToken);
          setToken(newToken);
        }

        // Mettre à jour les informations utilisateur si disponibles
        if (response.user) {
          updateUser(response.user);
        }

        return { success: true };
      } else {
        console.warn("Échec du rafraîchissement du token");
        return { success: false };
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      return { success: false };
    }
  }, [refreshCsrfToken, updateUser]);

  // Vérification du token et restauration de la session au chargement
  useEffect(() => {
    // Nouvelle fonction pour restaurer la session depuis l'API /me
    const restoreSession = async () => {
      try {
        const res = await axiosInstance.get("/auth/verify"); // Appelle le backend pour vérifier la session
        const { user } = res.data;
        console.log("🔐 Session restaurée :", user);
        setUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.warn("🚪 Aucune session active, mode invité");
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Désactiver la restauration automatique de session
    // restoreSession();

    // Nettoyer les données d'authentification stockées localement
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Simplement définir isLoading à false sans tenter de restaurer la session
    setIsLoading(false);

    // Effacer les données d'authentification locales pour s'assurer qu'aucune connexion automatique ne se produit
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "🔒 Mode d'authentification manuelle activé - pas de restauration automatique de session"
      );
    }
  }, []); // ✅ Une seule fois au montage

  // Fonction pour réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowInactivityModal(false);

    // Effacer le timer de déconnexion s'il existe
    if (inactivityLogoutTimer) {
      clearTimeout(inactivityLogoutTimer);
      setInactivityLogoutTimer(null);
    }
  }, [inactivityLogoutTimer]);

  // Fonction pour vérifier périodiquement l'inactivité
  const checkInactivity = useCallback(() => {
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
  }, [lastActivity, showInactivityModal, logout]);

  // Configurer les écouteurs d'événements pour suivre l'activité
  useEffect(() => {
    // Uniquement initialiser les écouteurs si l'utilisateur est authentifié
    if (!isAuthenticated) return;

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
  }, [isAuthenticated, resetInactivityTimer, checkInactivity]); // Dépend uniquement de isAuthenticated

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
  }, [isAuthenticated, refreshToken]);

  // Au chargement initial, obtenir un token CSRF et vérifier l'authentification
  useEffect(() => {
    // Initialiser le token CSRF
    const initApp = async () => {
      try {
        // Variable pour suivre la progression de l'initialisation
        console.log("🚀 Initialisation de l'application...");

        // 1. Récupérer un token CSRF au démarrage (une seule fois)
        await fetchCsrfToken();
        console.log(
          "✅ CSRF Token initial récupéré :",
          getCookie("XSRF-TOKEN")
        );

        // 2. Ne pas vérifier l'authentification automatiquement
        // await checkInitialAuth(); // Désactivé pour mode d'authentification manuelle

        console.log(
          "✅ Initialisation complète - mode authentification manuelle"
        );
        setIsLoading(false);
      } catch (error) {
        console.error(
          "❌ Erreur lors de l'initialisation de l'application:",
          error
        );
        setIsLoading(false);
      }
    };

    initApp();
  }, []); // ✅ Une seule fois au montage

  // Vérifier l'authentification initiale - cette fonction n'est plus utilisée
  const checkInitialAuth = async () => {
    console.log(
      "Mode d'authentification manuelle activé - pas de vérification automatique"
    );
    setIsLoading(false);
    return false;
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

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (userData) => {
    try {
      console.log("📝 Tentative de mise à jour du profil avec:", userData);

      const response = await apiRequest("/user/profile", "PUT", userData);
      console.log("📝 Réponse de mise à jour du profil:", response);

      if (response && response.success) {
        // Mettre à jour les informations utilisateur localement
        const updatedUser = {
          ...user,
          ...response.user,
        };

        console.log("✅ Données utilisateur mises à jour:", updatedUser);

        // Mettre à jour à la fois dans le state et dans le localStorage
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Notifier autres onglets/fenêtres
        notifyDataChange("user");

        return {
          success: true,
          message: "Profil mis à jour avec succès",
          user: updatedUser,
        };
      } else {
        console.error("❌ Échec de mise à jour du profil:", response?.message);
        return {
          success: false,
          message:
            response?.message || "Erreur lors de la mise à jour du profil",
        };
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du profil:", error);
      return {
        success: false,
        message: error.message || "Erreur lors de la mise à jour du profil",
      };
    }
  };

  // Fonction pour se connecter
  const login = async (email, password) => {
    let csrfToken = getStoredCsrfToken();
    if (!csrfToken) {
      csrfToken = getCookie("XSRF-TOKEN");
    }

    try {
      if (!csrfToken) {
        // Essai avec reset-csrf d'abord
        try {
          const resetResponse = await fetch(getApiUrl("/auth/reset-csrf"), {
            method: "GET",
            credentials: "include",
          });

          if (resetResponse.ok) {
            const data = await resetResponse.json();
            if (data.csrfToken) {
              saveTokenToStorage(data.csrfToken);
              csrfToken = data.csrfToken;
              console.log(
                "✅ Nouveau token CSRF récupéré via reset-csrf:",
                csrfToken.substring(0, 10) + "..."
              );
            }
          } else {
            console.warn(
              "⚠️ Échec de récupération d'un nouveau token via reset-csrf"
            );
          }
        } catch (resetError) {
          console.error(
            "❌ Erreur lors de la récupération du token via reset-csrf:",
            resetError
          );
        }

        // Si reset-csrf a échoué, essayer avec csrf-token
        if (!csrfToken) {
          try {
            const csrfResponse = await fetch(getApiUrl("/csrf-token"), {
              method: "GET",
              credentials: "include",
            });

            if (csrfResponse.ok) {
              const data = await csrfResponse.json();
              if (data.csrfToken) {
                saveTokenToStorage(data.csrfToken);
                csrfToken = data.csrfToken;
                console.log(
                  "✅ Nouveau token CSRF récupéré via csrf-token:",
                  csrfToken.substring(0, 10) + "..."
                );
              }
            } else {
              console.warn(
                "⚠️ Échec de récupération d'un nouveau token via csrf-token"
              );
            }
          } catch (csrfError) {
            console.error(
              "❌ Erreur lors de la récupération du token via csrf-token:",
              csrfError
            );
          }
        }

        // Attendre un peu que le cookie soit défini
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Vérifier le cookie
        const cookieToken = getCookie("XSRF-TOKEN");
        if (cookieToken) {
          console.log(
            "✅ Token CSRF trouvé dans les cookies:",
            cookieToken.substring(0, 10) + "..."
          );
          csrfToken = cookieToken;
        }
      }

      // Vérifier qu'on a bien un token CSRF
      if (!csrfToken) {
        throw new Error("❌ Impossible de récupérer un token CSRF valide");
      }

      console.log(
        "🔐 Tentative de connexion avec token CSRF:",
        csrfToken.substring(0, 10) + "..."
      );

      const res = await axiosInstance.post(
        "/auth/login",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
      );

      const user = res.data?.user;

      // Vérifier si les données utilisateur sont complètes
      if (!user || !user.email) {
        console.error("❌ Données utilisateur incomplètes:", user);
        throw new Error("Données utilisateur incomplètes ou invalides");
      }

      console.log("✅ Données utilisateur complètes:", {
        id: user.id || user._id,
        email: user.email,
        name: user.name || user.username,
        role: user.role,
      });

      // Stocker l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(user));

      // Stocker le token si présent dans la réponse
      if (res.data?.token || res.data?.accessToken) {
        const token = res.data?.token || res.data?.accessToken;
        localStorage.setItem("token", token);
        setToken(token);
        console.log("✅ Token stocké dans localStorage");
      }

      // Mettre à jour l'état
      setUser(user);
      setIsAuthenticated(true);
      console.log("✅ Connexion réussie :", user);

      return {
        success: true,
        message: "Connexion réussie",
        user: user,
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la connexion :",
        error.response?.data?.message || error.message
      );
      setUser(null);
      setIsAuthenticated(false);

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la connexion",
      };
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
      const response = await apiRequest("/auth/register", "POST", userData);
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

  // Fonction pour se connecter avec Google (redirection)
  const loginWithGoogle = async () => {
    try {
      window.location.href = getApiUrl("/auth/google");
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
        "/auth/request-account-deletion",
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
        "/auth/confirm-account-deletion",
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

  // Fonction pour changer le mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Rafraîchir le token CSRF avant le changement de mot de passe
      await refreshCsrfToken();

      const response = await apiRequest("/users/change-password", "POST", {
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

  // Fonction pour préparer le changement de mot de passe
  const preparePasswordChange = useCallback(async () => {
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
  }, [refreshCsrfToken]);

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
