import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_URL, apiDebug, validateApiUrl } from "../config/api";
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
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Valider l'URL de l'API avant de créer l'instance
      validateApiUrl();

      // Création d'une instance axios avec des configurations par défaut
      const instance = axios.create({
        baseURL: API_URL,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Ajouter un timeout pour éviter les requêtes infinies
        timeout: 10000,
      });

      // Intercepteur pour ajouter le token d'authentification à chaque requête
      instance.interceptors.request.use(
        async (config) => {
          apiDebug(`Requête ${config.method.toUpperCase()} vers ${config.url}`);
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => {
          apiDebug("Erreur lors de la préparation de la requête", error);
          return Promise.reject(error);
        }
      );

      // Intercepteur pour gérer les réponses et les erreurs
      instance.interceptors.response.use(
        (response) => {
          apiDebug("Réponse reçue", response.data);
          const data = response.data;

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
          apiDebug("Erreur API reçue", error);

          // Gérer les erreurs d'authentification
          if (error.response?.status === 401) {
            logout();
            return Promise.reject({
              success: false,
              message: "Session expirée. Veuillez vous reconnecter.",
              error: true,
              status: 401,
            });
          }

          // Gérer les erreurs de timeout
          if (error.code === "ECONNABORTED") {
            return Promise.reject({
              success: false,
              message: "La requête a pris trop de temps. Veuillez réessayer.",
              error: true,
              status: 408,
            });
          }

          // Gérer les erreurs de connexion
          if (!error.response) {
            return Promise.reject({
              success: false,
              message:
                "Impossible de se connecter au serveur. Vérifiez votre connexion.",
              error: true,
              status: 0,
            });
          }

          const formattedError = handleApiError(error);
          return Promise.reject(formattedError);
        }
      );

      setAxiosInstance(instance);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Erreur lors de l'initialisation de l'API:", err);
    }
  }, [getToken, logout]);

  // Si une erreur de configuration est détectée
  if (error) {
    return (
      <div className="api-error">Erreur de configuration API: {error}</div>
    );
  }

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
