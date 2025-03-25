import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";
import { AuthService } from "../services/api";

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
      // Utiliser ensureValidToken pour s'assurer d'avoir le token le plus récent
      const validToken = await ensureValidToken();

      if (validToken) {
        console.log("=== DEBUT RESTORATION DE SESSION ===");
        console.log(
          "Token valide trouvé:",
          validToken.substring(0, 15) + "..."
        );

        try {
          // Vérifier si le user a été sauvegardé en localStorage
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            try {
              console.log("Utilisateur trouvé dans localStorage");
              const parsedUser = JSON.parse(savedUser);
              console.log("Données utilisateur:", {
                id: parsedUser.id,
                email: parsedUser.email,
                role: parsedUser.role,
              });
              setUser(parsedUser);
              setIsAuthenticated(true);

              // Récupérer les employés associés à cet utilisateur
              try {
                const response = await fetch(
                  `${API_URL}/api/employees/by-user/${parsedUser.id}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${validToken}`,
                    },
                  }
                );

                if (response.ok) {
                  const employeesData = await response.json();
                  if (
                    employeesData.success &&
                    Array.isArray(employeesData.data)
                  ) {
                    // Extraire les IDs des employés
                    const employeeIds = employeesData.data.map((emp) => emp.id);
                    console.log(
                      "Employés associés à l'utilisateur:",
                      employeeIds
                    );
                    localStorage.setItem(
                      "userEmployees",
                      JSON.stringify(employeeIds)
                    );
                  }
                }
              } catch (error) {
                console.error(
                  "Erreur lors de la récupération des employés associés:",
                  error
                );
                // Fallback - stocker au moins l'ID de l'utilisateur comme employé
                localStorage.setItem(
                  "userEmployees",
                  JSON.stringify([parsedUser.id])
                );
              }
            } catch (e) {
              console.error("Erreur lors du parsing de l'utilisateur:", e);
              localStorage.removeItem("user");
            }
          }

          // Faire une requête vers le backend pour obtenir les informations à jour
          console.log("Tentative de récupération du profil depuis l'API");
          const authEndpoints = ["/api/auth/profile", "/api/user/profile"];

          let userData = null;
          let success = false;

          // Essayer les deux endpoints possibles
          for (const endpoint of authEndpoints) {
            try {
              console.log(`Tentative avec l'endpoint: ${API_URL}${endpoint}`);

              const response = await fetch(`${API_URL}${endpoint}`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${validToken}`,
                },
                credentials: "include",
              });

              console.log(`Réponse de ${endpoint}:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
              });

              if (response.ok) {
                userData = await response.json();
                console.log("Données de profil reçues:", {
                  id: userData.id,
                  email: userData.email,
                  role: userData.role,
                  profileImage: userData.profileImage ? "présent" : "absent",
                  company: userData.company || "non défini",
                  phone: userData.phone || "non défini",
                  jobTitle: userData.jobTitle || "non défini",
                });

                success = true;
                break; // Sortir de la boucle si la requête réussit
              }
            } catch (endpointError) {
              console.error(
                `Erreur avec l'endpoint ${endpoint}:`,
                endpointError
              );
            }
          }

          if (success && userData) {
            // Mettre à jour l'état et le localStorage avec toutes les données du profil
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            setIsAuthenticated(true);
          } else {
            console.error("Toutes les tentatives ont échoué, déconnexion");
            // Si toutes les requêtes échouent, supprimer les infos d'authentification
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Erreur lors de la restauration de session:", error);
        }
      }
      console.log("=== FIN RESTORATION DE SESSION ===");
      setIsLoading(false);
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
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

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

  // Modifier la fonction de login pour initialiser le WebSocket après connexion
  const login = async (email, password) => {
    setIsLoading(true);
    setLoginError(null);
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

    try {
      console.log("Démarrage de la procédure de connexion");

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
      console.log("Connexion réussie");

      // Stocker le token
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);

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
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = "/login";
    }, 300);
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
  }, []);

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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
