import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { formatError, handleApiError } from "../utils/errorHandling";
import { useAuth } from "./AuthContext";

// Création du contexte
const ApiContext = createContext();

// Hook pour utiliser le contexte API
export const useApi = () => useContext(ApiContext);

// Fournisseur du contexte API
export const ApiProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [axiosInstance, setAxiosInstance] = useState(null);

  useEffect(() => {
    // Création d'une instance axios avec des configurations par défaut
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Intercepteur pour ajouter le token d'authentification à chaque requête
    instance.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les réponses et les erreurs
    instance.interceptors.response.use(
      (response) => {
        // Pour les réponses réussies, retourner directement les données ou normaliser la structure
        const data = response.data;

        // Normaliser les réponses pour avoir toujours une structure { success, message, data }
        if (data.success === undefined) {
          return {
            success: true,
            data: data,
            message: "Opération réussie",
          };
        }

        return data;
      },
      (error) => {
        console.error("API Error:", error);

        // Si l'erreur est une erreur d'authentification (401), déconnecter l'utilisateur
        if (error.response && error.response.status === 401) {
          logout();
        }

        // Utiliser notre formatage d'erreur standardisé
        const formattedError = handleApiError(error);
        console.log("Erreur formatée:", formattedError);

        return Promise.reject(formattedError);
      }
    );

    setAxiosInstance(instance);
  }, [getToken, logout]);

  // Méthodes HTTP principales exposées par le contexte
  const api = {
    get: async (url, config = {}) => {
      if (!axiosInstance) return null;
      try {
        const response = await axiosInstance.get(url, config);
        return response;
      } catch (error) {
        console.log("GET Error:", error);
        return {
          success: false,
          error: formatError(error),
          message: formatError(error),
          data: null,
        };
      }
    },
    post: async (url, data = {}, config = {}) => {
      if (!axiosInstance) return null;
      try {
        const response = await axiosInstance.post(url, data, config);
        return response;
      } catch (error) {
        console.log("POST Error:", error);
        return {
          success: false,
          error: formatError(error),
          message: formatError(error),
          data: null,
        };
      }
    },
    put: async (url, data = {}, config = {}) => {
      if (!axiosInstance) return null;
      try {
        const response = await axiosInstance.put(url, data, config);
        return response;
      } catch (error) {
        console.log("PUT Error:", error);
        return {
          success: false,
          error: formatError(error),
          message: formatError(error),
          data: null,
        };
      }
    },
    delete: async (url, config = {}) => {
      if (!axiosInstance) return null;
      try {
        const response = await axiosInstance.delete(url, config);
        return response;
      } catch (error) {
        console.log("DELETE Error:", error);
        return {
          success: false,
          error: formatError(error),
          message: formatError(error),
          data: null,
        };
      }
    },
  };

  return (
    <ApiContext.Provider value={{ api, axiosInstance }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
