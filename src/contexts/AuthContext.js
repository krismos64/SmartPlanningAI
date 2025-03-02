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
  const [error, setError] = useState(null);

  // Définir l'utilisateur avec le rôle admin
  const setUserWithAdminRole = (userData) => {
    if (userData) {
      return {
        ...userData,
        role: "admin",
      };
    }
    return userData;
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest(API_ROUTES.AUTH.ME);
        // Définir l'utilisateur comme admin
        const adminUser = setUserWithAdminRole(response.user);
        setUser(adminUser);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(API_ROUTES.AUTH.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole(response);

      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(adminUser));
      return true;
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError(error.message || "Erreur lors de la connexion");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest(API_ROUTES.AUTH.REGISTER, {
        method: "POST",
        body: JSON.stringify(userData),
      });

      // Définir l'utilisateur comme admin
      const adminUser = setUserWithAdminRole(response);

      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(adminUser));
      return true;
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setError(error.message || "Erreur lors de l'inscription");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiRequest(API_ROUTES.AUTH.LOGOUT, {
      method: "POST",
    });

    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  // Fonction pour récupérer tous les utilisateurs (accessible à tous)
  const getUsers = async () => {
    const token = localStorage.getItem("token");
    return await apiRequest(API_ROUTES.AUTH.USERS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fonction pour mettre à jour un utilisateur (accessible à tous)
  const updateUser = async (userId, userData) => {
    const token = localStorage.getItem("token");
    // S'assurer que le rôle est admin
    const adminUserData = {
      ...userData,
      role: "admin",
    };

    return await apiRequest(API_ROUTES.AUTH.USER_DETAIL(userId), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(adminUserData),
    });
  };

  // Fonction pour supprimer un utilisateur (accessible à tous)
  const deleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    return await apiRequest(API_ROUTES.AUTH.USER_DETAIL(userId), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    register,
    getUsers,
    updateUser,
    deleteUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
