import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { WeeklyScheduleService } from "../services/api";
import ActivityLogger from "../utils/activityLogger";
import {
  parseScheduleFromApi,
  prepareScheduleForApi,
  standardizeScheduleData,
} from "../utils/scheduleUtils";
import useWebSocket from "./useWebSocket";

// Remplacer la fonction getByWeek si elle n'existe pas dans WeeklyScheduleService
const getSchedulesByWeek = async (formattedDate) => {
  try {
    console.log(
      "Tentative de récupération des plannings pour la semaine:",
      formattedDate
    );
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token d'authentification manquant");
      throw new Error("Vous devez être connecté pour accéder à ces données");
    }

    // Utiliser la bonne URL d'API pour récupérer les plannings par semaine
    const response = await fetch(
      `http://localhost:5001/api/weekly-schedules/week/${formattedDate}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur API:", errorData);
      throw new Error(errorData.message || "Erreur serveur");
    }

    const data = await response.json();
    console.log("Plannings récupérés avec succès:", data);

    return {
      success: true,
      schedules: data.schedules || data.data || [],
    };
  } catch (error) {
    console.error("Erreur dans getSchedulesByWeek:", error);
    throw error;
  }
};

/**
 * Hook personnalisé pour gérer les plannings hebdomadaires
 */
const useWeeklySchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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
   * Récupère les plannings pour une semaine donnée
   * @param {string} weekStart - Date de début de semaine (YYYY-MM-DD)
   * @returns {Promise<Array>} - Liste des plannings
   */
  const fetchSchedules = useCallback(async (weekStart) => {
    setLoading(true);
    try {
      console.log(`Récupération des plannings pour la semaine du ${weekStart}`);
      const result = await WeeklyScheduleService.getByWeek(weekStart);
      console.log("🔄 Résultat API des plannings:", result);

      if (!result || !result.success) {
        const errorMessage =
          result?.message ||
          "Erreur lors de la récupération des plannings, vérifiez votre connexion";
        console.error(errorMessage);
        setError(errorMessage);
        setSchedules([]);
        return [];
      }

      // Vérifier que result.schedules est un tableau
      if (!Array.isArray(result.schedules) && !Array.isArray(result.data)) {
        console.error(
          "⚠️ La réponse de l'API ne contient pas de tableau de plannings:",
          result
        );
        console.log("Type de result.schedules:", typeof result.schedules);
        console.log("Type de result.data:", typeof result.data);

        // Si schedules n'est pas un tableau mais un objet, essayer de l'extraire
        if (result.schedules && typeof result.schedules === "object") {
          console.log(
            "Tentative d'extraction des données d'un objet schedules:",
            Object.keys(result.schedules)
          );
        }

        // Si data n'est pas un tableau mais un objet, essayer de l'extraire
        if (result.data && typeof result.data === "object") {
          console.log(
            "Tentative d'extraction des données d'un objet data:",
            Object.keys(result.data)
          );
        }

        // Forcer schedules à être un tableau vide
        setSchedules([]);
        return [];
      }

      // Mise à jour de l'état avec les plannings récupérés
      const schedulesData = Array.isArray(result.schedules)
        ? result.schedules
        : Array.isArray(result.data)
        ? result.data
        : [];

      console.log("🔄 Plannings récupérés bruts:", schedulesData);
      console.log(
        "🔄 Structure des plannings:",
        schedulesData.map((s) => ({
          id: s.id,
          employee_id: s.employee_id,
          type_employee_id: typeof s.employee_id,
          week_start: s.week_start,
          created_at: s.created_at,
          updated_at: s.updated_at,
          updated_by: s.updated_by,
          has_schedule_data: !!s.schedule_data,
          schedule_data_type: typeof s.schedule_data,
        }))
      );

      // Standardiser tous les plannings pour garantir la cohérence
      const standardizedSchedules = schedulesData
        .map((schedule) => standardizeScheduleData(schedule))
        .filter(Boolean); // Filtrer les plannings null

      console.log("Plannings standardisés:", standardizedSchedules);
      setSchedules(standardizedSchedules);
      setError(null);
      return standardizedSchedules;
    } catch (error) {
      console.error("Erreur lors de la récupération des plannings:", error);
      const errorMessage =
        error.message || "Erreur lors de la récupération des plannings";
      setError(errorMessage);
      setSchedules([]);
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
        console.log("Données à envoyer à l'API:", scheduleData);

        // Préparer les données pour l'API
        const preparedData = prepareScheduleForApi(scheduleData);
        console.log("Données préparées pour l'API:", preparedData);

        // Appeler l'API pour créer le planning
        const response = await WeeklyScheduleService.createSchedule(
          preparedData
        );
        console.log("Réponse API création planning:", response);

        // Extraire le planning de la réponse (différents formats possibles)
        let newSchedule = response;
        if (response?.data) {
          newSchedule = response.data;
        } else if (response?.schedule) {
          newSchedule = response.schedule;
        }

        // Standardiser le nouveau planning
        const standardizedSchedule = standardizeScheduleData(newSchedule);
        console.log("Nouveau planning standardisé:", standardizedSchedule);

        if (standardizedSchedule?.id) {
          // Ajouter le nouveau planning à la liste
          setSchedules((prevSchedules) => {
            // Vérifier si le planning existe déjà (par ID ou par employeeId+weekStart)
            const existingIndex = prevSchedules.findIndex(
              (s) =>
                s.id === standardizedSchedule.id ||
                (s.employeeId === standardizedSchedule.employeeId &&
                  s.weekStart === standardizedSchedule.weekStart)
            );

            if (existingIndex >= 0) {
              // Remplacer le planning existant
              const updatedSchedules = [...prevSchedules];
              updatedSchedules[existingIndex] = standardizedSchedule;
              return updatedSchedules;
            } else {
              // Ajouter le nouveau planning
              return [...prevSchedules, standardizedSchedule];
            }
          });

          // Notifier les autres clients
          if (typeof notifyDataChange === "function") {
            notifyDataChange("schedule", "create", standardizedSchedule.id);
          } else {
            console.log(
              "Notification WebSocket non disponible, mise à jour locale uniquement"
            );
          }

          // Enregistrer l'activité côté client pour les statistiques
          if (user && user.id) {
            try {
              await ActivityLogger.logCreation({
                entity_type: "schedule",
                entity_id: standardizedSchedule.id,
                userId: user.id,
                description: `Planning créé pour l'employé ${standardizedSchedule.employeeId} (semaine du ${standardizedSchedule.weekStart})`,
              });
            } catch (logError) {
              console.error(
                "Erreur lors de l'enregistrement de l'activité:",
                logError
              );
            }
          }

          return standardizedSchedule;
        } else {
          console.error("Le planning créé n'a pas d'ID:", standardizedSchedule);
          throw new Error("Le planning créé n'a pas d'ID");
        }
      } catch (error) {
        console.error("Erreur lors de la création du planning:", error);
        toast.error(error.message || "Erreur lors de la création du planning");
        setError(error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [notifyDataChange, user]
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

        console.log(`Tentative de mise à jour du planning ID ${id}`, apiData);

        // Utiliser updateSchedule au lieu de update
        const response = await WeeklyScheduleService.updateSchedule(
          id,
          apiData
        );
        console.log(
          `Réponse API pour la mise à jour du planning ${id}:`,
          response
        );

        // Extraire les données de la réponse
        const result = response.data || response;

        if (!result.success) {
          console.error(
            `Échec de la mise à jour du planning ${id}:`,
            result.message
          );
          return {
            success: false,
            message:
              result.message || "Erreur lors de la mise à jour du planning",
            error: result.message,
          };
        }

        // Mettre à jour le planning dans la liste
        const updatedSchedule = parseScheduleFromApi(
          result.data || result.schedule
        );
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === id ? updatedSchedule : schedule
          )
        );

        // Notifier les autres clients via WebSocket
        if (typeof notifyDataChange === "function") {
          notifyDataChange("schedule", "update", id);
        } else {
          console.log(
            "Notification WebSocket non disponible, mise à jour locale uniquement"
          );
        }

        // Enregistrer l'activité côté client pour les statistiques
        if (user && user.id) {
          try {
            await ActivityLogger.logUpdate({
              entity_type: "schedule",
              entity_id: id,
              userId: user.id,
              description: `Planning mis à jour pour l'employé ${
                apiData.employee_id || scheduleData.employeeId
              } (semaine du ${apiData.week_start || scheduleData.weekStart})`,
            });
          } catch (logError) {
            console.error(
              "Erreur lors de l'enregistrement de l'activité:",
              logError
            );
          }
        }

        // Ne pas afficher de toast ici car il sera affiché par le composant qui appelle cette fonction
        return {
          success: true,
          schedule: updatedSchedule,
          message: "Planning mis à jour avec succès",
        };
      } catch (error) {
        console.error("Erreur lors de la mise à jour du planning:", error);
        // Ne pas afficher de toast ici car il sera affiché par le composant qui appelle cette fonction
        return {
          success: false,
          error: error.message,
          message: error.message || "Erreur lors de la mise à jour du planning",
        };
      } finally {
        setLoading(false);
      }
    },
    [notifyDataChange, user]
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
        console.log(`Tentative de suppression du planning ${id}`);

        // Récupérer les informations du planning avant suppression pour logger
        const scheduleToDelete = schedules.find((s) => s.id === id);
        const employeeId = scheduleToDelete
          ? scheduleToDelete.employee_id || scheduleToDelete.employeeId
          : "inconnu";
        const weekStart = scheduleToDelete
          ? scheduleToDelete.week_start || scheduleToDelete.weekStart
          : "inconnue";

        // Utiliser deleteSchedule au lieu de delete
        const response = await WeeklyScheduleService.deleteSchedule(id);
        console.log(`Résultat de la suppression du planning ${id}:`, response);

        // Extraire les données de la réponse
        const result = response.data || response;

        if (!result.success) {
          console.error(`Échec de la suppression du planning ${id}:`, result);
          throw new Error(
            result.message || "Erreur lors de la suppression de l'horaire"
          );
        }

        // Supprimer le planning de la liste
        setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));

        // Notifier les autres clients via WebSocket
        if (typeof notifyDataChange === "function") {
          notifyDataChange("schedule", "delete", id);
        } else {
          console.log(
            "Notification WebSocket non disponible, mise à jour locale uniquement"
          );
        }

        // Enregistrer l'activité côté client pour les statistiques
        if (user && user.id) {
          try {
            await ActivityLogger.logDeletion({
              entity_type: "schedule",
              entity_id: id,
              userId: user.id,
              description: `Planning supprimé pour l'employé ${employeeId} (semaine du ${weekStart})`,
            });
          } catch (logError) {
            console.error(
              "Erreur lors de l'enregistrement de l'activité:",
              logError
            );
          }
        }

        // Ne pas afficher de toast ici car il est déjà affiché dans le composant qui appelle cette fonction
        setLoading(false);
        return { success: true };
      } catch (error) {
        console.error("Erreur lors de la suppression du planning:", error);
        toast.error(
          error.message || "Erreur lors de la suppression du planning"
        );
        setLoading(false);
        return { success: false, error: error.message };
      }
    },
    [notifyDataChange, user, schedules]
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
