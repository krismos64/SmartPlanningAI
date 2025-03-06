import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import useWebSocket from "../hooks/useWebSocket";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loginError: null,
  updateUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loginError, setLoginError] = useState(null);
  const { notifyDataChange } = useWebSocket();

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
    const checkAuth = async () => {
      try {
        // Vérifier si le token est présent dans localStorage
        const token = localStorage.getItem("token");
        console.log("Token au chargement:", token);

        // Vérifier si l'utilisateur est déjà dans localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser && token) {
          const parsedUser = JSON.parse(storedUser);
          // Définir l'utilisateur comme admin
          const adminUser = setUserWithAdminRole(parsedUser);
          setUser(adminUser);
          console.log("Utilisateur restauré depuis localStorage:", adminUser);
        } else if (token) {
          // Si token mais pas d'utilisateur, essayer de récupérer l'utilisateur depuis l'API
          try {
            // Note: Cette fonctionnalité n'est pas disponible dans la nouvelle API
            // Nous utilisons simplement les données stockées localement
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("token");
          } catch (error) {
            console.error(
              "Erreur lors de la récupération de l'utilisateur:",
              error
            );
            // Si erreur, supprimer le token et l'utilisateur
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Ni token ni utilisateur
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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
    // Notifier le WebSocket de la déconnexion
    if (user) {
      notifyDataChange("auth", "logout", user.id);
    }

    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    register,
    logout,
    loginError,
    updateUser,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
