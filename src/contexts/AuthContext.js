import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";
import { AuthService } from "../services/api";

// Fonction utilitaire pour récupérer le token CSRF depuis les cookies
const getCsrfToken = () => {
  try {
    const cookies = document.cookie.split(";");
    console.log("Tous les cookies disponibles:", document.cookie);

    for (let cookie of cookies) {
      cookie = cookie.trim();
      console.log("Vérifiant cookie:", cookie);

      if (cookie.startsWith("XSRF-TOKEN=")) {
        const token = cookie.substring("XSRF-TOKEN=".length);
        console.log(
          "Token CSRF trouvé dans les cookies:",
          token.substring(0, 10) + "..."
        );
        return token;
      }
    }

    // Si aucun cookie XSRF-TOKEN n'est trouvé, récupérer un nouveau token
    console.log("Aucun token CSRF trouvé dans les cookies");
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du token CSRF:", error);
    return null;
  }
};

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
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken) {
        setToken(savedToken);

        console.log("=== DEBUT RESTORATION DE SESSION ===");
        console.log(
          "Token trouvé dans localStorage:",
          savedToken.substring(0, 15) + "..."
        );

        try {
          // Vérifier si le user a été sauvegardé en localStorage
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
                      Authorization: `Bearer ${savedToken}`,
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
                  Authorization: `Bearer ${savedToken}`,
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

      console.log("===== Appel à updateUserProfile =====");
      console.log("Token disponible:", !!token);
      console.log("Données envoyées:", {
        ...userData,
        profileImage: userData.profileImage ? "[IMAGE]" : null,
      });

      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  // Fonction pour se connecter
  const login = async (email, password) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log("Démarrage de la procédure de connexion");

      // Récupérer le token CSRF
      const csrfResponse = await fetch(`${API_URL}/api/csrf-token`, {
        method: "GET",
        credentials: "include",
      });

      if (!csrfResponse.ok) {
        throw new Error("Impossible de récupérer le token CSRF");
      }

      const { csrfToken } = await csrfResponse.json();
      console.log("Token CSRF reçu du serveur:", csrfToken);

      // Récupérer le token du cookie
      const csrfCookie = getCsrfToken();
      console.log("Token CSRF du cookie:", csrfCookie);

      // Effectuer la requête de connexion
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfCookie || csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("Réponse login:", {
        status: loginResponse.status,
        ok: loginResponse.ok,
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(
          errorData.message || `Erreur de connexion (${loginResponse.status})`
        );
      }

      const data = await loginResponse.json();
      console.log("Connexion réussie");

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setLoginError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer un nouveau token CSRF
  const refreshCsrfToken = async () => {
    try {
      console.log("Récupération d'un nouveau token CSRF...");
      const response = await fetch(`${API_URL}/api/csrf-token`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Nouveau token CSRF obtenu avec succès.");
        // Le token est automatiquement stocké dans les cookies par le serveur
        return true;
      } else {
        console.error("Échec de l'obtention du token CSRF:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du token CSRF:", error);
      return false;
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
