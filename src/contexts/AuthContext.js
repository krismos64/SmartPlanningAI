import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";
import { AuthService } from "../services/api";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
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
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Restaurer l'utilisateur à partir de localStorage
          setToken(token);
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);

          // Optionnel: Vérifier que le token est toujours valide avec le serveur
          try {
            const response = await AuthService.me(token);
            if (response.data && response.data.user) {
              const userData = response.data.user;
              setUserWithAdminRole(userData);
            }
          } catch (error) {
            console.warn("Échec de la validation du token:", error);
            // On ne déconnecte pas l'utilisateur en cas d'erreur serveur
          }
        } catch (error) {
          console.error("Erreur lors de la restauration de session:", error);
        }
      }
      setIsLoading(false);
    };

    checkInitialAuth();
  }, []);

  // Fonction pour mettre à jour le profil utilisateur
  const updateUserProfile = async (userData) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser((prevUser) => ({ ...prevUser, ...data }));

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

  // Fonction pour se connecter
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setLoginError(null);

      console.log("Tentative de connexion avec:", { email, password: "***" });

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      console.log(
        "Réponse de connexion:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erreur de connexion (${response.status})`
        );
      }

      const data = await response.json();
      console.log("Données de connexion reçues:", {
        ...data,
        token: data.token ? "***" : null,
      });

      // Stocker le token et les informations utilisateur
      localStorage.setItem("token", data.token);
      setToken(data.token);

      // S'assurer que les champs optionnels sont définis
      const sanitizedUserData = {
        ...data,
        profileImage: data.profileImage || null,
        company: data.company || null,
        phone: data.phone || null,
        jobTitle: data.jobTitle || null,
      };

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole(sanitizedUserData);

      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));

      // Notifier le WebSocket de la connexion
      notifyDataChange("auth", "login", adminUser.id);

      return true;
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setLoginError(err.message || "Erreur de connexion au serveur");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
