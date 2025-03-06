import { useCallback, useEffect, useState } from "react";
import { API_ROUTES, apiRequest } from "../config/api";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook personnalisé pour gérer les données d'activité des employés
 * @param {string} period - La période pour laquelle récupérer les données (week, month, year)
 */
const useEmployeeActivity = (period = "week") => {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  /**
   * Récupère les données d'activité pour la période spécifiée
   */
  const fetchActivityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest(
        `${API_ROUTES.SCHEDULE_STATS.ACTIVITY}?period=${period}`
      );

      if (response.success) {
        setActivityData(response.data || []);
        return response.data;
      } else {
        throw new Error(
          response.message ||
            "Erreur lors de la récupération des données d'activité"
        );
      }
    } catch (err) {
      console.error(
        `Erreur lors de la récupération des données d'activité (${period}):`,
        err
      );
      setError(
        err.message || "Erreur lors de la récupération des données d'activité"
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  // Récupérer les données d'activité lorsque la période change
  useEffect(() => {
    fetchActivityData();

    // Mettre à jour les données toutes les 5 minutes
    const interval = setInterval(() => {
      fetchActivityData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchActivityData, period]);

  return {
    activityData,
    loading,
    error,
    fetchActivityData,
  };
};

export default useEmployeeActivity;
