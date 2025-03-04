import axios from "axios";
import { useCallback, useState } from "react";

// Correction de la définition de l'URL de base pour éviter la duplication du chemin /api
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Hook personnalisé pour centraliser les appels API
 * @returns {Object} Méthodes pour effectuer des appels API
 */
const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fonction générique pour effectuer des appels API
   * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
   * @param {string} endpoint - Endpoint de l'API (sans la base URL)
   * @param {Object} data - Données à envoyer (pour POST, PUT)
   * @returns {Promise} Promesse contenant la réponse
   */
  const apiCall = useCallback(async (method, endpoint, data = null) => {
    setIsLoading(true);
    setError(null);

    // Construire l'URL complète
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    // Journaliser l'appel API pour le débogage
    console.log(`API ${method}:`, url, data ? data : "");

    try {
      // Récupérer le token d'authentification s'il existe
      const token = localStorage.getItem("token");

      const config = {
        method,
        url,
        data,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true, // Pour inclure les cookies
      };

      const response = await axios(config);

      // Gérer les réponses vides (204 No Content)
      if (response.status === 204) {
        setIsLoading(false);
        return { data: null, success: true };
      }

      // Vérifier si la réponse contient du JSON
      let responseData;
      if (response.headers["content-type"]?.includes("application/json")) {
        responseData = response.data;
      } else {
        // Pour les réponses non-JSON, retourner le texte brut
        responseData =
          typeof response.data === "string"
            ? response.data
            : { message: "Réponse non-JSON reçue" };
      }

      setIsLoading(false);
      return { data: responseData, success: true };
    } catch (err) {
      setIsLoading(false);

      // Extraire le message d'erreur
      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Erreur inconnue";

      // Définir l'erreur pour l'affichage
      setError(errorMessage);

      // Journaliser l'erreur pour le débogage
      console.error(`Erreur API ${method} ${url}:`, err);

      // Retourner un objet d'erreur standardisé
      return {
        data: null,
        success: false,
        error: errorMessage,
        status: err.response?.status,
      };
    }
  }, []);

  // Méthodes HTTP spécifiques
  const get = useCallback((endpoint) => apiCall("GET", endpoint), [apiCall]);
  const post = useCallback(
    (endpoint, data) => apiCall("POST", endpoint, data),
    [apiCall]
  );
  const put = useCallback(
    (endpoint, data) => apiCall("PUT", endpoint, data),
    [apiCall]
  );
  const del = useCallback((endpoint) => apiCall("DELETE", endpoint), [apiCall]);

  return {
    get,
    post,
    put,
    delete: del,
    isLoading,
    error,
  };
};

export default useApi;
