import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import {
  parseScheduleFromApi,
  prepareScheduleForApi,
  standardizeScheduleData,
} from "../utils/scheduleUtils";
import useApi from "./useApi";
import useWebSocket from "./useWebSocket";

/**
 * Hook personnalisé pour gérer les plannings hebdomadaires
 */
const useWeeklySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  // Intégration WebSocket pour les mises à jour en temps réel
  const { socket, isConnected, sendMessage, notifyDataChange, fallbackMode } =
    useWebSocket();

  // Écouter les mises à jour WebSocket
  useEffect(() => {
    if (socket && isConnected) {
      // Fonction pour traiter les messages WebSocket
      const handleWebSocketMessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Si le message concerne une mise à jour de planning
          if (data.type === "SCHEDULE_UPDATED" && data.schedule) {
            setSchedules((prevSchedules) => {
              // Vérifier si le planning existe déjà
              const exists = prevSchedules.some(
                (schedule) => schedule.id === data.schedule.id
              );

              if (exists) {
                // Mettre à jour le planning existant
                return prevSchedules.map((schedule) =>
                  schedule.id === data.schedule.id
                    ? parseScheduleFromApi(data.schedule)
                    : schedule
                );
              } else {
                // Ajouter le nouveau planning
                return [...prevSchedules, parseScheduleFromApi(data.schedule)];
              }
            });

            toast.info("Planning mis à jour en temps réel");
          }

          // Si le message concerne une suppression de planning
          if (data.type === "SCHEDULE_DELETED" && data.scheduleId) {
            setSchedules((prevSchedules) =>
              prevSchedules.filter(
                (schedule) => schedule.id !== data.scheduleId
              )
            );

            toast.info("Planning supprimé en temps réel");
          }
        } catch (error) {
          console.error(
            "Erreur lors du traitement du message WebSocket:",
            error
          );
        }
      };

      // Ajouter l'écouteur d'événements
      socket.addEventListener("message", handleWebSocketMessage);

      // Nettoyer l'écouteur lors du démontage
      return () => {
        socket.removeEventListener("message", handleWebSocketMessage);
      };
    }
  }, [socket, isConnected]);

  /**
   * Fonction utilitaire pour réessayer une requête API
   * @param {Function} apiCall - Fonction d'appel API à réessayer
   * @param {number} maxRetries - Nombre maximum de tentatives
   * @param {number} delay - Délai entre les tentatives (en ms)
   * @returns {Promise} - Résultat de l'appel API
   */
  const retryApiCall = useCallback(
    async (apiCall, maxRetries = 3, delay = 1000) => {
      let lastError = null;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          return await apiCall();
        } catch (err) {
          lastError = err;
          retryCount++;

          // Si c'est la dernière tentative, ne pas attendre
          if (retryCount < maxRetries) {
            // Utiliser un délai exponentiel
            const retryDelay = delay * Math.pow(2, retryCount - 1);
            console.log(
              `Tentative ${retryCount}/${maxRetries} échouée, nouvelle tentative dans ${retryDelay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      // Si toutes les tentatives ont échoué, lancer l'erreur
      throw lastError;
    },
    []
  );

  /**
   * Récupère les plannings pour une semaine spécifique
   * @param {string} weekStart - Date de début de semaine (format YYYY-MM-DD)
   * @returns {Promise<Array>} - Liste des plannings
   */
  const fetchSchedules = useCallback(
    async (weekStart) => {
      try {
        setLoading(true);
        setError(null);

        const apiCall = async () => {
          const response = await api.get(
            `${API_ENDPOINTS.WEEKLY_SCHEDULES}?weekStart=${weekStart}`
          );

          if (!response.ok) {
            throw new Error(
              response.data?.message || "Erreur lors du chargement des horaires"
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        // Standardiser les données
        const standardizedSchedules = data.map((schedule) =>
          parseScheduleFromApi(schedule)
        );

        setSchedules(standardizedSchedules);
        return standardizedSchedules;
      } catch (err) {
        console.error("Erreur lors du chargement des horaires:", err);
        setError(
          "Erreur lors du chargement des horaires: " +
            (err.message || "Erreur inconnue")
        );
        toast.error("Erreur lors du chargement des horaires");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [api, retryApiCall]
  );

  /**
   * Crée un nouveau planning
   * @param {Object} scheduleData - Données du planning
   * @returns {Promise<Object>} - Résultat de la création
   */
  const createSchedule = useCallback(
    async (scheduleData) => {
      try {
        // Standardiser et préparer les données pour l'API
        const apiData = prepareScheduleForApi(
          standardizeScheduleData(scheduleData)
        );

        console.log("Données envoyées à l'API:", apiData);

        const apiCall = async () => {
          const response = await api.post(
            API_ENDPOINTS.WEEKLY_SCHEDULES,
            apiData
          );

          if (!response.ok) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la création de l'horaire"
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        // Standardiser les données reçues
        const standardizedSchedule = parseScheduleFromApi(data);

        setSchedules((prev) => [...prev, standardizedSchedule]);

        // Notifier les autres clients via WebSocket
        if (!fallbackMode && isConnected) {
          notifyDataChange("schedule", "create", standardizedSchedule.id);
        }

        toast.success("Horaire créé avec succès");
        return { success: true, schedule: standardizedSchedule };
      } catch (err) {
        console.error("Erreur lors de la création de l'horaire:", err);
        const errorMessage = err.message || "Erreur inconnue";
        toast.error(`Erreur lors de la création de l'horaire: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    },
    [api, retryApiCall, fallbackMode, isConnected, notifyDataChange]
  );

  /**
   * Met à jour un planning existant
   * @param {number} id - ID du planning
   * @param {Object} scheduleData - Données du planning
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  const updateSchedule = useCallback(
    async (id, scheduleData) => {
      try {
        // Standardiser et préparer les données pour l'API
        const apiData = prepareScheduleForApi(
          standardizeScheduleData(scheduleData)
        );

        const apiCall = async () => {
          const response = await api.put(
            `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`,
            apiData
          );

          if (!response.ok) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la mise à jour de l'horaire"
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        // Standardiser les données reçues
        const standardizedSchedule = parseScheduleFromApi(data);

        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === id ? standardizedSchedule : schedule
          )
        );

        // Notifier les autres clients via WebSocket
        if (!fallbackMode && isConnected) {
          notifyDataChange("schedule", "update", id);
        }

        toast.success("Horaire mis à jour avec succès");
        return { success: true, schedule: standardizedSchedule };
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'horaire:", err);
        const errorMessage = err.message || "Erreur inconnue";
        toast.error(
          `Erreur lors de la mise à jour de l'horaire: ${errorMessage}`
        );
        return { success: false, error: errorMessage };
      }
    },
    [api, retryApiCall, fallbackMode, isConnected, notifyDataChange]
  );

  /**
   * Supprime un planning
   * @param {number} id - ID du planning
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  const deleteSchedule = useCallback(
    async (id) => {
      try {
        const apiCall = async () => {
          const response = await api.delete(
            `${API_ENDPOINTS.WEEKLY_SCHEDULES}/${id}`
          );

          if (!response.ok) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la suppression de l'horaire"
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        await retryApiCall(apiCall);

        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));

        // Notifier les autres clients via WebSocket
        if (!fallbackMode && isConnected) {
          notifyDataChange("schedule", "delete", id);
        }

        toast.success("Horaire supprimé avec succès");
        return { success: true };
      } catch (err) {
        console.error("Erreur lors de la suppression de l'horaire:", err);
        const errorMessage = err.message || "Erreur inconnue";
        toast.error(
          `Erreur lors de la suppression de l'horaire: ${errorMessage}`
        );
        return { success: false, error: errorMessage };
      }
    },
    [api, retryApiCall, fallbackMode, isConnected, notifyDataChange]
  );

  // Fonction pour charger les plannings hebdomadaires
  const fetchWeeklySchedules = useCallback(async () => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadWeeklySchedules = async () => {
      if (retryCount >= maxRetries) {
        setError(
          "Erreur lors du chargement des plannings après plusieurs tentatives"
        );
        setLoading(false);
        return;
      }

      try {
        console.log("Chargement des plannings hebdomadaires...");
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token d'authentification manquant");
          setError("Vous devez être connecté pour accéder à ces données");
          setLoading(false);
          return;
        }

        const data = await api.get(API_ENDPOINTS.WEEKLY_SCHEDULES);
        console.log("Données des plannings reçues:", data);

        if (Array.isArray(data)) {
          setSchedules(data);
          setError(null);
        } else {
          console.error("Format de données invalide:", data);
          setError("Format de données invalide");
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des plannings:", err);
        setError(err.message || "Erreur lors du chargement des plannings");

        // Réessayer avec un délai exponentiel
        retryCount++;
        setTimeout(loadWeeklySchedules, 1000 * Math.pow(2, retryCount));
      }
    };

    setLoading(true);
    setError(null);
    await loadWeeklySchedules();
  }, [api]);

  // Charger les plannings au montage du composant
  useEffect(() => {
    fetchWeeklySchedules();
  }, [fetchWeeklySchedules]);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    fetchWeeklySchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

export default useWeeklySchedules;
