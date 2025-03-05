import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loginError: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState(null);

  // Fonction pour définir l'utilisateur avec le rôle admin
  const setUserWithAdminRole = (userData) => {
    // Attribuer automatiquement le rôle admin à tous les utilisateurs
    const userWithAdminRole = {
      ...userData,
      role: "admin", // Tous les utilisateurs ont le rôle admin
      profileImage: userData.profileImage || null,
      company: userData.company || "",
      phone: userData.phone || "",
      jobTitle: userData.jobTitle || "",
    };
    setUser(userWithAdminRole);
    setIsAuthenticated(true);
    return userWithAdminRole;
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

  const login = async (email, password) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log("Tentative de connexion avec:", { email, password: "***" });

      const response = await fetch(`http://localhost:5001/api/auth/login`, {
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

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole({
        ...data,
        profileImage: data.profileImage || null,
        company: data.company || "",
        phone: data.phone || "",
        jobTitle: data.jobTitle || "",
      });

      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));

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
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erreur d'inscription (${response.status})`
        );
      }

      const data = await response.json();

      // Stocker le token si présent dans la réponse
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole(data);
      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));

      return true;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    loginError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
