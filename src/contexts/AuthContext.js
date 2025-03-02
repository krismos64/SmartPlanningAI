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

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiRequest(API_ROUTES.AUTH.ME);
        setUser(response.user);
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
    const response = await apiRequest(API_ROUTES.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const register = async (userData) => {
    const response = await apiRequest(API_ROUTES.AUTH.REGISTER, {
      method: "POST",
      body: JSON.stringify(userData),
    });

    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  };

  const logout = async () => {
    await apiRequest(API_ROUTES.AUTH.LOGOUT, {
      method: "POST",
    });

    setUser(null);
    setIsAuthenticated(false);
  };

  // Fonction pour récupérer tous les utilisateurs (admin seulement)
  const getUsers = async () => {
    const token = localStorage.getItem("token");
    return await apiRequest(API_ROUTES.AUTH.USERS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Fonction pour mettre à jour un utilisateur (admin seulement)
  const updateUser = async (userId, userData) => {
    const token = localStorage.getItem("token");
    return await apiRequest(API_ROUTES.AUTH.USER_DETAIL(userId), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  };

  // Fonction pour supprimer un utilisateur (admin seulement)
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
