import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_URL } from "../config/constants";
import { fetchCsrfTokenRobust, getStoredCsrfToken } from "../utils/api";
import { useAuth } from "./AuthContext";

// Constante de timeout par défaut (pour remplacer l'import qui pose problème)
const API_TIMEOUT = 30000; // 30 secondes par défaut

// Objet TokenStorage simplifié pour remplacer l'import manquant
const TokenStorage = {
  getAccessToken: () => localStorage.getItem("token"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setAccessToken: (token) => localStorage.setItem("token", token),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),
  clearTokens: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
};

// Création du contexte
export const ApiContext = createContext();

// Hook personnalisé pour utiliser l'API
export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi doit être utilisé dans un ApiProvider");
  }
  return context;
};

const ApiProvider = ({ children }) => {
  const { getToken, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Référence pour éviter les appels multiples au CSRF
  const csrfFetchedOnce = useRef(false);

  // Effet pour initialiser le token CSRF une seule fois au démarrage
  useEffect(() => {
    const fetchOnce = async () => {
      if (csrfFetchedOnce.current) return;

      try {
        console.log("🔄 [ApiContext] Initialisation du token CSRF...");
        const token = await fetchCsrfTokenRobust();

        if (token) {
          csrfFetchedOnce.current = true;
          console.log(
            "✅ [ApiContext] Token CSRF initialisé avec succès:",
            token
          );

          // Vérifier si le cookie est présent
          const hasCookie = document.cookie.includes("XSRF-TOKEN");
          console.log(
            `🍪 [ApiContext] Cookie XSRF-TOKEN: ${
              hasCookie ? "Présent" : "Absent"
            }`
          );

          if (!hasCookie) {
            console.warn(
              "⚠️ [ApiContext] Le cookie XSRF-TOKEN n'a pas été défini correctement"
            );
          }
        } else {
          console.error(
            "❌ [ApiContext] Échec de l'initialisation du token CSRF"
          );
        }
      } catch (error) {
        console.error(
          "❌ [ApiContext] Erreur lors de l'initialisation du token CSRF:",
          error
        );
      }
    };

    fetchOnce();
  }, []);

  // Vérification des erreurs de configuration
  const configError = !API_URL ? "L'URL de l'API n'est pas configurée" : null;

  // Création de l'instance Axios - useMemo est maintenant appelé inconditionnellement
  const axiosInstance = useMemo(() => {
    // La condition est déplacée à l'intérieur du hook
    if (configError) {
      return axios.create();
    }

    const instance = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      withCredentials: true, // CRUCIAL pour envoyer et recevoir des cookies
    });

    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });

      failedQueue = [];
    };

    // Intercepteur pour les requêtes
    instance.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Ajout du CSRF token si disponible
        const csrfToken = getStoredCsrfToken();
        if (csrfToken) {
          config.headers["X-CSRF-TOKEN"] = csrfToken;
          console.log(
            "🔒 [ApiContext] Token CSRF ajouté à la requête:",
            csrfToken.substring(0, 8) + "..."
          );
        } else {
          console.warn("⚠️ [ApiContext] Requête sans token CSRF:", config.url);
        }

        // Vérifier si credentials est défini
        if (config.withCredentials !== true) {
          console.warn(
            "⚠️ [ApiContext] withCredentials n'est pas activé pour la requête:",
            config.url
          );
          config.withCredentials = true;
        }

        // Increment request count
        setRequestCount((prev) => prev + 1);

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour les réponses
    instance.interceptors.response.use(
      (response) => {
        // Gestion du CSRF token s'il est présent dans la réponse
        if (response.headers["x-csrf-token"]) {
          console.log("🎯 [CSRF] Token récupéré dans la réponse");
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Gestion des erreurs 401 (Non autorisé)
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          if (isRefreshing) {
            return new Promise(function (resolve, reject) {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers["Authorization"] = "Bearer " + token;
                return instance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Essayer de rafraîchir le token
            const refreshToken = TokenStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const response = await instance.post("/auth/refresh-token", {
              refresh_token: refreshToken,
            });

            if (response.data.access_token) {
              TokenStorage.setAccessToken(response.data.access_token);
              TokenStorage.setRefreshToken(response.data.refresh_token);
              instance.defaults.headers.common["Authorization"] =
                "Bearer " + response.data.access_token;

              // Mettre à jour le token pour la requête originale
              originalRequest.headers["Authorization"] =
                "Bearer " + response.data.access_token;

              processQueue(null, response.data.access_token);
              return instance(originalRequest);
            } else {
              throw new Error("Failed to refresh token");
            }
          } catch (err) {
            processQueue(err, null);
            // Déconnecter l'utilisateur et rediriger vers la page de connexion
            TokenStorage.clearTokens();
            setIsLoggedIn(false);
            if (
              location.pathname !== "/login" &&
              location.pathname !== "/register"
            ) {
              toast.error("Votre session a expiré. Veuillez vous reconnecter.");
              navigate("/login", {
                state: { from: location, message: "Session expirée" },
              });
            }
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        }

        // Gestion des erreurs 403 (Interdit)
        if (error.response && error.response.status === 403) {
          console.error("Accès interdit:", error.response.data);
        }

        // Gestion des erreurs 429 (Trop de requêtes)
        if (error.response && error.response.status === 429) {
          console.error("Trop de requêtes:", error.response.data);
        }

        // Gestion des erreurs 500 (Erreur serveur)
        if (error.response && error.response.status >= 500) {
          console.error("Erreur serveur:", error.response.data);
        }

        // Structurer les données d'erreur
        const errorData = {
          message:
            error.response?.data?.message ||
            error.message ||
            "Une erreur est survenue",
          status: error.response?.status,
          errors: error.response?.data?.errors || {},
        };

        return Promise.reject(errorData);
      }
    );

    return instance;
  }, [location.pathname, navigate, configError]); // Ajout de configError comme dépendance

  // Fonction pour créer des méthodes de requête HTTP
  const makeRequest = useMemo(
    () =>
      (method) =>
      async (url, data = null, options = {}) => {
        setIsLoading(true);
        setError(null);

        try {
          const config = {
            method,
            url,
            ...options,
          };

          if (data) {
            if (method === "GET") {
              config.params = data;
            } else {
              config.data = data;
            }
          }

          const response = await axiosInstance(config);
          return response.data;
        } catch (error) {
          setError(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
    [axiosInstance]
  );

  // Fonction pour gérer les uploads de fichiers
  const uploadFile = useMemo(
    () =>
      async (url, file, options = {}) => {
        setIsLoading(true);
        setError(null);

        try {
          const formData = new FormData();
          formData.append("file", file);

          // Ajouter des données supplémentaires si fournies
          if (options.data) {
            Object.keys(options.data).forEach((key) => {
              formData.append(key, options.data[key]);
            });
          }

          const config = {
            method: "POST",
            url,
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
            ...options,
          };

          const response = await axiosInstance(config);
          return response.data;
        } catch (error) {
          setError(error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
    [axiosInstance]
  );

  // Création de l'élément de rendu pour les erreurs
  const errorElement = configError ? (
    <div className="api-error">
      <h3>Erreur de configuration API</h3>
      <p>{configError}</p>
    </div>
  ) : null;

  // Création du contexte d'API avec les méthodes principales
  const api = useMemo(() => {
    // Initialiser l'objet API
    const apiMethods = {
      get: makeRequest("GET"),
      post: makeRequest("POST"),
      put: makeRequest("PUT"),
      patch: makeRequest("PATCH"),
      delete: makeRequest("DELETE"),
      upload: uploadFile,
    };

    // Vérifier les erreurs de configuration à l'intérieur du hook
    if (configError) {
      console.error("⚠️ [API] Erreur de configuration:", configError);
      return {
        ...apiMethods,
        error: configError,
        isError: true,
      };
    }

    return apiMethods;
  }, [requestCount, navigate, configError, makeRequest, uploadFile]);

  return (
    <ApiContext.Provider value={{ api: api, axiosInstance }}>
      {errorElement || children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
