import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";
import { formatDateForMySQL } from "../utils/dateUtils";

/**
 * Hook personnalisé pour gérer les plannings hebdomadaires
 */
const useWeeklySchedules = () => {
  const [weeklySchedules, setWeeklySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère tous les plannings hebdomadaires
   */
  const fetchWeeklySchedules = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/api/weekly-schedules`;

      // Ajouter les filtres à l'URL si nécessaire
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value);
          }
        });

        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Transformer les données si nécessaire
      const formattedSchedules = data.map((schedule) => ({
        ...schedule,
        schedule_data:
          typeof schedule.schedule_data === "string"
            ? JSON.parse(schedule.schedule_data)
            : schedule.schedule_data,
      }));

      setWeeklySchedules(formattedSchedules);
      return formattedSchedules;
    } catch (err) {
      console.error("Erreur lors de la récupération des plannings:", err);
      setError(err.message || "Erreur lors de la récupération des plannings");
      toast.error("Erreur lors de la récupération des plannings hebdomadaires");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère un planning hebdomadaire par son ID
   */
  const fetchWeeklyScheduleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/weekly-schedules/${id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Transformer les données si nécessaire
      const formattedSchedule = {
        ...data,
        schedule_data:
          typeof data.schedule_data === "string"
            ? JSON.parse(data.schedule_data)
            : data.schedule_data,
      };

      return formattedSchedule;
    } catch (err) {
      console.error(`Erreur lors de la récupération du planning #${id}:`, err);
      setError(err.message || "Erreur lors de la récupération du planning");
      toast.error("Erreur lors de la récupération du planning");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée un nouveau planning hebdomadaire
   */
  const createWeeklySchedule = useCallback(async (scheduleData) => {
    setLoading(true);
    setError(null);

    try {
      // Formater les dates si nécessaire
      const formattedData = {
        ...scheduleData,
        week_start: formatDateForMySQL(scheduleData.week_start),
        week_end: scheduleData.week_end
          ? formatDateForMySQL(scheduleData.week_end)
          : undefined,
        schedule_data:
          typeof scheduleData.schedule_data === "object"
            ? JSON.stringify(scheduleData.schedule_data)
            : scheduleData.schedule_data,
      };

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/weekly-schedules`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      toast.success("Planning créé avec succès");
      return data;
    } catch (err) {
      console.error("Erreur lors de la création du planning:", err);
      setError(err.message || "Erreur lors de la création du planning");
      toast.error("Erreur lors de la création du planning");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour un planning hebdomadaire existant
   */
  const updateWeeklySchedule = useCallback(async (id, scheduleData) => {
    setLoading(true);
    setError(null);

    try {
      // Formater les dates si nécessaire
      const formattedData = {
        ...scheduleData,
        week_start: formatDateForMySQL(scheduleData.week_start),
        week_end: scheduleData.week_end
          ? formatDateForMySQL(scheduleData.week_end)
          : undefined,
        schedule_data:
          typeof scheduleData.schedule_data === "object"
            ? JSON.stringify(scheduleData.schedule_data)
            : scheduleData.schedule_data,
      };

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/weekly-schedules/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      toast.success("Planning mis à jour avec succès");
      return data;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour du planning #${id}:`, err);
      setError(err.message || "Erreur lors de la mise à jour du planning");
      toast.error("Erreur lors de la mise à jour du planning");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime un planning hebdomadaire
   */
  const deleteWeeklySchedule = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/weekly-schedules/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      toast.success("Planning supprimé avec succès");
      return true;
    } catch (err) {
      console.error(`Erreur lors de la suppression du planning #${id}:`, err);
      setError(err.message || "Erreur lors de la suppression du planning");
      toast.error("Erreur lors de la suppression du planning");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weeklySchedules,
    loading,
    error,
    fetchWeeklySchedules,
    fetchWeeklyScheduleById,
    createWeeklySchedule,
    updateWeeklySchedule,
    deleteWeeklySchedule,
  };
};

export default useWeeklySchedules;
