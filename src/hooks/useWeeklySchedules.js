import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { WeeklyScheduleService } from "../services/api";
import { formatDateForAPI } from "../utils/dateUtils";
import {
  parseScheduleFromApi,
  prepareScheduleForApi,
  standardizeScheduleData,
} from "../utils/scheduleUtils";
import useWebSocket from "./useWebSocket";

/**
 * Hook personnalisé pour gérer les plannings hebdomadaires
 */
const useWeeklySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Intégration WebSocket pour les mises à jour en temps réel
  const { socket, isConnected, notifyDataChange } = useWebSocket();

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
   * Récupère tous les plannings pour une semaine donnée
   * @param {string} weekStart - Date de début de semaine (format YYYY-MM-DD)
   * @returns {Promise<Array>} - Liste des plannings
   */
  const fetchSchedules = useCallback(async (weekStart) => {
    setLoading(true);
    setError(null);

    try {
      // Vérifier que la date est au bon format
      if (!weekStart) {
        throw new Error("Date de début de semaine non spécifiée");
      }

      // Vérifier que le token d'authentification est présent
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token d'authentification manquant");
        throw new Error("Vous devez être connecté pour accéder à ces données");
      }

      // S'assurer que la date est au format YYYY-MM-DD
      let formattedDate = weekStart;
      if (weekStart instanceof Date) {
        formattedDate = formatDateForAPI(weekStart);
      } else if (typeof weekStart === "string" && weekStart.includes("T")) {
        // Si la date contient un T (format ISO), extraire seulement la partie date
        formattedDate = weekStart.split("T")[0];
      }

      console.error(
        "Tentative de récupération des plannings pour la semaine du:",
        formattedDate
      );

      try {
        const result = await WeeklyScheduleService.getByWeek(formattedDate);

        if (!result.success) {
          console.error(
            "Échec de la récupération des plannings:",
            result.message,
            result.details || ""
          );
          throw new Error(
            result.message || "Erreur lors du chargement des horaires"
          );
        }

        // Standardiser les données
        const standardizedSchedules = result.schedules.map((schedule) =>
          parseScheduleFromApi(schedule)
        );

        setSchedules(standardizedSchedules);
        return standardizedSchedules;
      } catch (apiError) {
        console.error(
          "Erreur API lors de la récupération des plannings:",
          apiError
        );
        throw apiError;
      }
    } catch (err) {
      console.error("Erreur lors du chargement des horaires:", err);
      console.error("Détails de l'erreur:", JSON.stringify(err, null, 2));
      setError(
        "Erreur lors du chargement des horaires: " +
          (err.message || "Erreur inconnue")
      );
      toast.error("Erreur lors du chargement des horaires");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée un nouveau planning
   * @param {Object} scheduleData - Données du planning
   * @returns {Promise<Object>} - Résultat de la création
   */
  const createSchedule = useCallback(
    async (scheduleData) => {
      setLoading(true);
      try {
        // Standardiser et préparer les données pour l'API
        const apiData = prepareScheduleForApi(
          standardizeScheduleData(scheduleData)
        );

        const result = await WeeklyScheduleService.create(apiData);

        if (!result.success) {
          throw new Error(
            result.message || "Erreur lors de la création de l'horaire"
          );
        }

        // Ajouter le nouveau planning à la liste
        const newSchedule = parseScheduleFromApi(result.schedule);
        setSchedules((prev) => [...prev, newSchedule]);

        // Notifier les autres clients via WebSocket
        notifyDataChange("schedule", "create", newSchedule.id);

        toast.success("Planning créé avec succès");
        return { success: true, schedule: newSchedule };
      } catch (error) {
        console.error("Erreur lors de la création du planning:", error);
        toast.error(error.message || "Erreur lors de la création du planning");
        return { success: false, error: error.message };
      }
    },
    [notifyDataChange]
  );

  /**
   * Met à jour un planning existant
   * @param {number} id - ID du planning
   * @param {Object} scheduleData - Données du planning
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  const updateSchedule = useCallback(
    async (id, scheduleData) => {
      setLoading(true);
      try {
        // Standardiser et préparer les données pour l'API
        const apiData = prepareScheduleForApi(
          standardizeScheduleData(scheduleData)
        );

        const result = await WeeklyScheduleService.update(id, apiData);

        if (!result.success) {
          throw new Error(
            result.message || "Erreur lors de la mise à jour de l'horaire"
          );
        }

        // Mettre à jour le planning dans la liste
        const updatedSchedule = parseScheduleFromApi(result.schedule);
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === id ? updatedSchedule : schedule
          )
        );

        // Notifier les autres clients via WebSocket
        notifyDataChange("schedule", "update", id);

        toast.success("Planning mis à jour avec succès");
        return { success: true, schedule: updatedSchedule };
      } catch (error) {
        console.error("Erreur lors de la mise à jour du planning:", error);
        toast.error(
          error.message || "Erreur lors de la mise à jour du planning"
        );
        return { success: false, error: error.message };
      }
    },
    [notifyDataChange]
  );

  /**
   * Supprime un planning
   * @param {number} id - ID du planning
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  const deleteSchedule = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const result = await WeeklyScheduleService.delete(id);

        if (!result.success) {
          throw new Error(
            result.message || "Erreur lors de la suppression de l'horaire"
          );
        }

        // Supprimer le planning de la liste
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));

        // Notifier les autres clients via WebSocket
        notifyDataChange("schedule", "delete", id);

        toast.success("Planning supprimé avec succès");
        return { success: true };
      } catch (error) {
        console.error("Erreur lors de la suppression du planning:", error);
        toast.error(
          error.message || "Erreur lors de la suppression du planning"
        );
        return { success: false, error: error.message };
      }
    },
    [notifyDataChange]
  );

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

export default useWeeklySchedules;
