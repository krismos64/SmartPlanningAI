import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { WeeklyScheduleService } from "../services/api";
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
      console.log(`Récupération des plannings pour la semaine du ${weekStart}`);

      const result = await WeeklyScheduleService.getByWeek(weekStart);

      if (!result.success) {
        throw new Error(
          result.message || "Erreur lors du chargement des horaires"
        );
      }

      // Standardiser les données
      const standardizedSchedules = result.schedules.map((schedule) =>
        parseScheduleFromApi(schedule)
      );

      console.log("Plannings récupérés:", standardizedSchedules);
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
  }, []);

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
      try {
        // Standardiser et préparer les données pour l'API
        const apiData = prepareScheduleForApi(
          standardizeScheduleData(scheduleData)
        );

        console.log(`Mise à jour du planning ${id}:`, apiData);

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
      try {
        console.log(`Suppression du planning ${id}`);

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
