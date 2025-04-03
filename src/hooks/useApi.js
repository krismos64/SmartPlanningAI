import { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { API_URL, fetchCsrfToken, getStoredCsrfToken } from "../config/api.js";

/**
 * Hook personnalisé pour effectuer des appels API
 * @returns {Object} Méthodes pour effectuer des requêtes API
 */
const useApi = () => {
  // Récupérer le token CSRF au chargement du hook
  useEffect(() => {
    const initCsrf = async () => {
      const csrfToken = getStoredCsrfToken();
      if (!csrfToken) {
        await fetchCsrfToken();
      }
    };

    initCsrf();
  }, []);

  const handleResponse = useCallback(async (response) => {
    try {
      // Récupérer les en-têtes pour le débogage
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      console.log("Réponse du serveur:", {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });

      // Vérifier si la réponse est au format JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      // Récupérer le corps de la réponse
      let data;
      if (isJson) {
        data = await response.json();
        console.log("Données JSON reçues:", data);
      } else {
        const text = await response.text();
        console.warn("Réponse non-JSON reçue:", text);
        try {
          // Essayer de parser le texte comme JSON
          data = JSON.parse(text);
          console.log("Texte parsé comme JSON:", data);
        } catch (e) {
          data = { message: text };
        }
      }

      // Gérer les différents codes de statut
      if (response.ok) {
        return data;
      } else {
        // Gérer les erreurs d'authentification (401, 403)
        if (response.status === 401 || response.status === 403) {
          console.error("Erreur d'authentification:", data);

          // Afficher un message d'erreur mais ne pas rediriger
          toast.error(
            "Session expirée ou accès non autorisé. Veuillez vous reconnecter."
          );

          // Ne pas supprimer le token et l'utilisateur du localStorage
          // Ne pas rediriger vers la page de connexion

          // Lancer une erreur avec un message clair
          const error = new Error(
            "Veuillez vous connecter pour accéder à cette page."
          );
          error.status = response.status;
          error.response = { status: response.status, data };
          throw error;
        }

        // Gérer les erreurs serveur (500)
        if (response.status === 500) {
          console.error("Erreur serveur:", data);
          console.error("URL:", response.url);
          console.error("Méthode:", response.method);

          // Journaliser plus de détails pour le débogage
          if (data.error) {
            console.error("Détails de l'erreur:", data.error);
          }
          if (data.stack) {
            console.error("Stack trace:", data.stack);
          }
        }

        // Construire un message d'erreur détaillé
        const errorMessage =
          data.message ||
          data.error ||
          response.statusText ||
          "Erreur inconnue";
        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = { status: response.status, data };

        throw error;
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la réponse:", error);
      throw error;
    }
  }, []);

  const api = useMemo(() => {
    const get = async (endpoint) => {
      try {
        // Vérifier que l'URL est correcte
        console.log(`[API] GET ${API_URL}${endpoint}`);

        // Gestion spéciale pour les départements - ne pas afficher d'erreurs
        const isDepartmentsEndpoint = endpoint.includes("/departments");

        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        // Pour les requêtes autres que les départements, vérifier si la réponse est OK
        if (!isDepartmentsEndpoint && !response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Erreur lors de la requête GET ${endpoint}`
          );
        }

        const result = await handleResponse(response);

        // Pour les départements, on retourne un objet structuré
        if (isDepartmentsEndpoint) {
          return {
            ok: response.ok,
            status: response.status,
            data: result,
            headers: response.headers,
          };
        }

        // Pour les autres requêtes, on retourne directement les données
        return result;
      } catch (error) {
        console.error(`[API] GET ${endpoint} Error:`, error);

        // Vérifier si c'est une requête pour les départements
        const isDepartmentsEndpoint = endpoint.includes("/departments");

        // Si c'est une requête pour les départements, retourner un objet structuré
        if (isDepartmentsEndpoint) {
          console.log("Erreur silencieuse pour les départements");
          return {
            ok: false,
            status: error.status || 0,
            data: { message: error.message || "Erreur lors de la requête GET" },
            headers: new Headers(),
          };
        }

        // Pour les autres requêtes, propager l'erreur
        throw error;
      }
    };

    // Fonction utilitaire pour convertir camelCase en snake_case
    const camelToSnakeCase = (str) => {
      // Cas spécial pour zipCode qui doit devenir zip_code
      if (str === "zipCode") {
        console.log(`Conversion spéciale: ${str} -> zip_code`);
        return "zip_code";
      }

      // Conversion normale
      const result = str.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      console.log(`Conversion camelCase -> snake_case: ${str} -> ${result}`);
      return result;
    };

    const post = async (endpoint, data) => {
      try {
        // Vérifier que les données sont valides
        if (!data || typeof data !== "object") {
          console.error("Données invalides pour la requête POST:", data);
          throw new Error("Données invalides pour la requête POST");
        }

        // Vérifier que l'URL est correcte
        console.log(`[API] POST ${API_URL}${endpoint}`);

        // Vérifier si le token est présent
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token d'authentification manquant");
          throw new Error("Veuillez vous connecter pour accéder à cette page.");
        }

        // S'assurer que les données sont sérialisables
        const cleanData = JSON.parse(JSON.stringify(data));

        // Supprimer hourlyRate des données pour éviter l'erreur
        if (cleanData.hourlyRate !== undefined) {
          console.log("Suppression de hourlyRate des données");
          delete cleanData.hourlyRate;
        }

        // Convertir les données en snake_case pour le backend
        const snakeCaseData = {};
        for (const key in cleanData) {
          snakeCaseData[camelToSnakeCase(key)] = cleanData[key];
        }
        console.log(
          "Données converties en snake_case pour POST:",
          snakeCaseData
        );

        // Récupérer le token CSRF
        const csrfToken = getStoredCsrfToken();

        // Configurer les en-têtes de la requête
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        };

        // Journaliser les détails de la requête (sans le token complet)
        console.log("Détails de la requête POST:", {
          endpoint,
          dataSize: JSON.stringify(snakeCaseData).length,
          headers: {
            ...headers,
            Authorization: "Bearer [MASQUÉ]",
            "X-CSRF-Token": csrfToken
              ? `${csrfToken.substring(0, 10)}...`
              : undefined,
          },
        });

        // Effectuer la requête avec un timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify(snakeCaseData),
          signal: controller.signal,
          credentials: "include",
        });

        // Annuler le timeout
        clearTimeout(timeoutId);

        return await handleResponse(response);
      } catch (error) {
        console.error(`[API] POST ${endpoint} Error:`, error);
        throw error;
      }
    };

    const put = async (endpoint, data) => {
      try {
        // Vérifier que les données sont valides
        if (!data || typeof data !== "object") {
          console.error("Données invalides pour la requête PUT:", data);
          throw new Error("Données invalides pour la requête PUT");
        }

        // Vérifier que l'URL est correcte
        console.log(`[API] PUT ${API_URL}${endpoint}`);

        // Vérifier si le token est présent
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token d'authentification manquant");
          throw new Error("Veuillez vous connecter pour accéder à cette page.");
        }

        // S'assurer que les données sont sérialisables
        const cleanData = JSON.parse(JSON.stringify(data));

        // Supprimer hourlyRate des données pour éviter l'erreur
        if (cleanData.hourlyRate !== undefined) {
          console.log("Suppression de hourlyRate des données");
          delete cleanData.hourlyRate;
        }

        // Convertir les données en snake_case pour le backend
        const snakeCaseData = {};
        for (const key in cleanData) {
          snakeCaseData[camelToSnakeCase(key)] = cleanData[key];
        }
        console.log(
          "Données converties en snake_case pour PUT:",
          snakeCaseData
        );

        // Récupérer le token CSRF
        const csrfToken = getStoredCsrfToken();

        // Configurer les en-têtes de la requête
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        };

        // Journaliser les détails de la requête
        console.log("Détails de la requête PUT:", {
          endpoint,
          dataSize: JSON.stringify(snakeCaseData).length,
          headers: {
            ...headers,
            Authorization: "Bearer [MASQUÉ]",
            "X-CSRF-Token": csrfToken
              ? `${csrfToken.substring(0, 10)}...`
              : undefined,
          },
        });

        // Effectuer la requête avec un timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(snakeCaseData),
          signal: controller.signal,
          credentials: "include",
        });

        // Annuler le timeout
        clearTimeout(timeoutId);

        return await handleResponse(response);
      } catch (error) {
        console.error(`[API] PUT ${endpoint} Error:`, error);
        throw error;
      }
    };

    const del = async (endpoint) => {
      try {
        // Vérifier que l'URL est correcte
        console.log(`[API] DELETE ${API_URL}${endpoint}`);

        // Vérifier si le token est présent
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token d'authentification manquant");
          throw new Error("Veuillez vous connecter pour accéder à cette page.");
        }

        // Récupérer le token CSRF
        const csrfToken = getStoredCsrfToken();

        // Configurer les en-têtes de la requête
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(csrfToken && { "X-CSRF-Token": csrfToken }),
        };

        // Journaliser les détails de la requête
        console.log("Détails de la requête DELETE:", {
          endpoint,
          headers: {
            ...headers,
            Authorization: "Bearer [MASQUÉ]",
            "X-CSRF-Token": csrfToken
              ? `${csrfToken.substring(0, 10)}...`
              : undefined,
          },
        });

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "DELETE",
          headers,
          credentials: "include",
        });

        return await handleResponse(response);
      } catch (error) {
        console.error(`[API] DELETE ${endpoint} Error:`, error);
        throw error;
      }
    };

    return {
      get,
      post,
      put,
      delete: del,
    };
  }, [handleResponse]);

  return api;
};

export default useApi;
