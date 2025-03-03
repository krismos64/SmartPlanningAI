import { createContext, useContext, useState, useEffect } from "react";
import { API_ROUTES, apiRequest } from "../config/api";

const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  getUsers: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
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

      if (!email || !password) {
        setLoginError("Email et mot de passe requis");
        setIsLoading(false);
        return false;
      }

      const response = await apiRequest(API_ROUTES.LOGIN, "POST", {
        email,
        password,
      });

      if (response.error) {
        console.error("Erreur de connexion:", response.error);
        setLoginError(response.error);
        setIsLoading(false);
        return false;
      }

      console.log("Réponse de login:", {
        ...response,
        token: response.token ? "***" : null,
      });

      // Stocker le token si présent dans la réponse
      if (response.token) {
        localStorage.setItem("token", response.token);
        console.log("Token stocké avec succès");
      } else {
        console.error("Pas de token dans la réponse");
        setLoginError("Pas de token dans la réponse");
        setIsLoading(false);
        return false;
      }

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole(response);

      setUser(adminUser);
      localStorage.setItem("user", JSON.stringify(adminUser));

      console.log("Utilisateur connecté:", { ...adminUser, token: "***" });
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setLoginError(error.message || "Erreur de connexion");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(API_ROUTES.REGISTER, "POST", userData);

      if (response.error) {
        console.error("Erreur d'inscription:", response.error);
        return false;
      }

      // Stocker le token si présent dans la réponse
      if (response.token) {
        localStorage.setItem("token", response.token);
        console.log("Token stocké après inscription:", response.token);
      } else {
        console.error("Pas de token dans la réponse d'inscription");
      }

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole(response);

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

  // Fonction pour récupérer tous les utilisateurs
  const getUsers = async () => {
    // Cette fonctionnalité n'est pas disponible dans la nouvelle API
    console.warn("La fonctionnalité getUsers n'est pas implémentée");
    return []; // Retourner un tableau vide au lieu d'un objet
  };

  // Fonction pour mettre à jour un utilisateur
  const updateUser = async (userId, userData) => {
    // Cette fonctionnalité n'est pas disponible dans la nouvelle API
    console.warn("La fonctionnalité updateUser n'est pas implémentée");
    return { success: false, message: "Fonctionnalité non implémentée" };
  };

  // Fonction pour supprimer un utilisateur
  const deleteUser = async (userId) => {
    // Cette fonctionnalité n'est pas disponible dans la nouvelle API
    console.warn("La fonctionnalité deleteUser n'est pas implémentée");
    return { success: false, message: "Fonctionnalité non implémentée" };
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
