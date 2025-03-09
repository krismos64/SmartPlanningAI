import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { API_URL } from "../config/api";

/**
 * Hook personnalisé pour effectuer des appels API
 * @returns {Object} Méthodes pour effectuer des requêtes API
 */
const useApi = () => {
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
          toast.error(
            "Session expirée ou accès non autorisé. Veuillez vous reconnecter."
          );

          // Supprimer le token et l'utilisateur du localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Rediriger vers la page de connexion après un délai
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
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
        console.log(`[API] GET ${endpoint}`);
        const token = localStorage.getItem("token");

        if (!token) {
          console.error(
            "Token d'authentification manquant pour la requête GET"
          );
          toast.error("Vous devez être connecté pour accéder à ces données");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return { ok: false, status: 401, data: [] };
        }

        // Ajouter un timeout pour éviter que les requêtes ne restent bloquées
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout

        try {
          const response = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            signal: controller.signal,
          });

          // Annuler le timeout
          clearTimeout(timeoutId);

          return await handleResponse(response);
        } catch (fetchError) {
          // Gérer spécifiquement les erreurs d'abort
          if (fetchError.name === "AbortError") {
            console.warn(`La requête ${endpoint} a été interrompue (timeout)`);
            throw new Error(`Timeout de la requête après 5 secondes`);
          }
          throw fetchError;
        }
      } catch (error) {
        console.error(`[API] GET ${endpoint} Error:`, error);

        // Si l'erreur est liée à l'authentification, rediriger vers la page de connexion
        if (error.status === 401 || error.status === 403) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          // Ne pas afficher de toast pour les erreurs de timeout ou de réseau
          // pour éviter de surcharger l'interface
          if (
            !error.message.includes("Timeout") &&
            !error.message.includes("fetch")
          ) {
            toast.error(
              error.message || "Erreur lors de la récupération des données"
            );
          }
        }

        throw error;
      }
    };

    // Fonction utilitaire pour convertir camelCase en snake_case
    const camelToSnakeCase = (str) => {
      return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    };

    const post = async (endpoint, data) => {
      try {
        // Vérifier que les données sont valides
        if (!data || typeof data !== "object") {
          console.error("Données invalides pour la requête POST:", data);
          throw new Error("Données invalides pour la requête POST");
        }

        // Convertir les données en snake_case pour le backend
        const snakeCaseData = {};
        for (const key in data) {
          snakeCaseData[camelToSnakeCase(key)] = data[key];
        }

        // Récupérer le token d'authentification
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token d'authentification manquant");
          throw new Error(
            "Vous devez être connecté pour effectuer cette action"
          );
        }

        // Configurer les en-têtes de la requête
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Journaliser les détails de la requête (sans le token complet)
        console.log("Détails de la requête POST:", {
          endpoint,
          dataSize: JSON.stringify(snakeCaseData).length,
          headers: { ...headers, Authorization: "Bearer [MASQUÉ]" },
        });

        // Effectuer la requête avec un timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes de timeout

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "POST",
          headers,
          body: JSON.stringify(snakeCaseData),
          signal: controller.signal,
        });

        // Annuler le timeout
        clearTimeout(timeoutId);

        // Traiter la réponse
        return handleResponse(response);
      } catch (error) {
        // Gérer les erreurs spécifiques
        if (error.name === "AbortError") {
          console.error("La requête a été interrompue (timeout):", error);
          throw new Error(
            "La requête a pris trop de temps, veuillez réessayer"
          );
        }

        if (
          error.message.includes("NetworkError") ||
          error.message.includes("Failed to fetch")
        ) {
          console.error("Erreur réseau lors de la requête POST:", error);
          throw new Error(
            "Problème de connexion au serveur, veuillez vérifier votre connexion internet"
          );
        }

        // Journaliser et propager l'erreur
        console.error("Erreur lors de la requête POST:", error);
        throw error;
      }
    };

    const put = async (endpoint, data) => {
      try {
        console.log(`[API] PUT ${endpoint}`, data);
        const token = localStorage.getItem("token");

        // S'assurer que les données sont sérialisables
        const cleanData = JSON.parse(JSON.stringify(data));

        // Convertir les données en snake_case pour le backend
        const snakeCaseData = {};
        for (const key in cleanData) {
          snakeCaseData[camelToSnakeCase(key)] = cleanData[key];
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(snakeCaseData),
        });

        const result = await handleResponse(response);
        console.log(`[API] PUT ${endpoint} Response:`, result);
        return result;
      } catch (error) {
        console.error(`[API] PUT ${endpoint} Error:`, error);
        return {
          ok: false,
          status: 0,
          data: { message: error.message || "Erreur lors de la requête PUT" },
          headers: new Headers(),
        };
      }
    };

    const del = async (endpoint) => {
      try {
        console.log(`[API] DELETE ${endpoint}`);
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          credentials: "include",
        });

        const result = await handleResponse(response);
        console.log(`[API] DELETE ${endpoint} Response:`, result);
        return result;
      } catch (error) {
        console.error(`[API] DELETE ${endpoint} Error:`, error);
        return {
          ok: false,
          status: 0,
          data: {
            message: error.message || "Erreur lors de la requête DELETE",
          },
          headers: new Headers(),
        };
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
