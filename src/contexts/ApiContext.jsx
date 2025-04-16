import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  fetchCsrfTokenRobust,
  getApiUrl,
  getStoredCsrfToken,
} from "../utils/api";
import { useAuth } from "./AuthContext";

// Création du contexte
const ApiContext = createContext();

// Hook pour utiliser le contexte API
export const useApi = () => useContext(ApiContext);

// Fournisseur du contexte API
export function ApiProvider({ children }) {
  const { getToken, logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requestCount, setRequestCount] = useState(0);
  const navigate = useNavigate();

  // Référence pour éviter les appels multiples au CSRF
  const csrfFetchedOnce = useRef(false);

  // Effet pour initialiser le token CSRF une seule fois au démarrage
  useEffect(() => {
    const fetchOnce = async () => {
      if (csrfFetchedOnce.current) return;
      const token = await fetchCsrfTokenRobust();
      if (token) {
        csrfFetchedOnce.current = true;
        console.log("🎯 [CSRF] Token initialisé dans ApiContext");
      }
    };
    fetchOnce();
  }, []);

  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiUrl(),
      withCredentials: true,
      timeout: 20000, // Timeout après 20 secondes
    });

    // Ajout d'un intercepteur de requête pour ajouter les headers d'authentification
    instance.interceptors.request.use(
      async (config) => {
        // Incrémenter le compteur de requêtes
        setRequestCount((prev) => prev + 1);

        // Ajouter le token CSRF si disponible (sans appel API systématique)
        const csrfToken = getStoredCsrfToken();
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }

        // Ajouter le token d'authentification si disponible
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Détection du format de données pour Content-Type approprié
        if (config.data instanceof FormData) {
          config.headers["Content-Type"] = "multipart/form-data";
        } else if (config.headers["Content-Type"] === undefined) {
          config.headers["Content-Type"] = "application/json";
        }

        // Logger uniquement en développement
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `🚀 API Request [${config.method?.toUpperCase()}]:`,
            config.url
          );
        }

        return config;
      },
      (error) => {
        setRequestCount((prev) => Math.max(0, prev - 1));
        console.error("Erreur dans l'intercepteur de requête:", error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse pour gérer les erreurs de manière centralisée
    instance.interceptors.response.use(
      (response) => {
        setRequestCount((prev) => Math.max(0, prev - 1));

        // Logger uniquement en développement
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `✅ API Response [${response.status}]:`,
            response.config.url
          );
        }

        return response;
      },
      async (error) => {
        setRequestCount((prev) => Math.max(0, prev - 1));

        // Extraire les informations d'erreur
        const { response, request, config } = error;

        // Logger les erreurs
        console.error(`❌ API Error:`, {
          url: config?.url,
          method: config?.method?.toUpperCase(),
          status: response?.status,
          data: response?.data,
        });

        // Gestion spécifique selon le code d'erreur
        if (response) {
          // Erreur de réponse du serveur
          switch (response.status) {
            case 401: // Non authentifié
              localStorage.removeItem("token");
              setIsLoggedIn(false);

              // Redirection vers login sauf si déjà sur la page de login
              if (!window.location.pathname.includes("/login")) {
                toast.error(
                  "Votre session a expiré. Veuillez vous reconnecter."
                );
                navigate("/login", { replace: true });
              }
              break;

            case 403: // Accès interdit
              toast.error(
                "Vous n'avez pas les droits suffisants pour effectuer cette action."
              );
              break;

            case 419: // Token CSRF expiré (Laravel)
            case 422: // Erreur de validation (potentiellement CSRF)
              if (
                response.data?.message?.includes("CSRF") ||
                response.data?.message?.includes("csrf")
              ) {
                // Tentative de récupération d'un nouveau token CSRF
                localStorage.removeItem("csrfToken");
                try {
                  await fetchCsrfTokenRobust(3, 500);

                  // Réessayer la requête originale si possible
                  if (config) {
                    return instance(config);
                  }
                } catch (e) {
                  console.error(
                    "Échec de récupération d'un nouveau token CSRF:",
                    e
                  );
                }
              }
              break;

            case 429: // Too Many Requests
              toast.warning(
                "Vous avez effectué trop de requêtes. Veuillez patienter quelques instants."
              );
              break;

            case 500: // Erreur serveur
            case 502: // Bad Gateway
            case 503: // Service Unavailable
            case 504: // Gateway Timeout
              toast.error(
                "Le serveur rencontre des difficultés. Veuillez réessayer plus tard."
              );
              break;
          }

          // Retourner un format d'erreur standardisé
          return Promise.reject({
            status: response.status,
            message: response.data?.message || "Une erreur est survenue",
            errors: response.data?.errors || {},
            originalError: error,
          });
        } else if (request) {
          // La requête a été envoyée mais aucune réponse n'a été reçue
          toast.error(
            "Impossible de contacter le serveur. Vérifiez votre connexion internet."
          );
          return Promise.reject({
            status: 0,
            message: "Erreur de connexion au serveur",
            originalError: error,
          });
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          return Promise.reject({
            status: 0,
            message: "Erreur de configuration de la requête",
            originalError: error,
          });
        }
      }
    );

    return instance;
  }, [navigate]);

  const apiMethods = useMemo(
    () => ({
      async get(endpoint, config = {}) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.get(endpoint, config);
          return { success: true, data: response.data };
        } catch (err) {
          setError(err);
          return {
            success: false,
            error: err.message || "Une erreur est survenue",
            status: err.status,
            errors: err.errors,
          };
        } finally {
          setIsLoading(false);
        }
      },
      async post(endpoint, data, config = {}) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.post(endpoint, data, config);
          return { success: true, data: response.data };
        } catch (err) {
          setError(err);
          return {
            success: false,
            error: err.message || "Une erreur est survenue",
            status: err.status,
            errors: err.errors,
          };
        } finally {
          setIsLoading(false);
        }
      },
      async put(endpoint, data, config = {}) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.put(endpoint, data, config);
          return { success: true, data: response.data };
        } catch (err) {
          setError(err);
          return {
            success: false,
            error: err.message || "Une erreur est survenue",
            status: err.status,
            errors: err.errors,
          };
        } finally {
          setIsLoading(false);
        }
      },
      async delete(endpoint, config = {}) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.delete(endpoint, config);
          return { success: true, data: response.data };
        } catch (err) {
          setError(err);
          return {
            success: false,
            error: err.message || "Une erreur est survenue",
            status: err.status,
            errors: err.errors,
          };
        } finally {
          setIsLoading(false);
        }
      },
      // Nouvelle méthode d'upload de fichiers
      async upload(endpoint, files, additionalData = {}, config = {}) {
        setIsLoading(true);
        setError(null);

        const formData = new FormData();

        // Ajouter les fichiers à FormData
        if (Array.isArray(files)) {
          files.forEach((file, index) => {
            formData.append(`file[${index}]`, file);
          });
        } else {
          formData.append("file", files);
        }

        // Ajouter les données supplémentaires
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });

        try {
          const response = await axiosInstance.post(endpoint, formData, {
            ...config,
            headers: {
              ...config.headers,
              "Content-Type": "multipart/form-data",
            },
          });
          return { success: true, data: response.data };
        } catch (err) {
          setError(err);
          return {
            success: false,
            error:
              err.message ||
              "Une erreur s'est produite lors de l'upload du fichier",
            status: err.status,
            errors: err.errors,
          };
        } finally {
          setIsLoading(false);
        }
      },
    }),
    [axiosInstance]
  );

  // Si une erreur de configuration est détectée
  if (error) {
    return (
      <div className="api-error">
        <h3>Erreur de configuration API</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <ApiContext.Provider value={{ api: apiMethods, axiosInstance }}>
      {children}
    </ApiContext.Provider>
  );
}

export default ApiProvider;
