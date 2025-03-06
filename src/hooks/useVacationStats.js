import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les statistiques de congés
 */
const useVacationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  /**
   * Récupère les statistiques de congés
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.VACATIONS_STATS);

      if (response.ok) {
        setStats(response.data);
        setError(null);
      } else {
        throw new Error(
          response.data?.message ||
            "Erreur lors du chargement des statistiques de congés"
        );
      }
    } catch (err) {
      console.error(
        "Erreur lors du chargement des statistiques de congés:",
        err
      );
      setError("Erreur lors du chargement des statistiques de congés");
      toast.error("Erreur lors du chargement des statistiques de congés");
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Charger les statistiques au montage du composant
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
};

export default useVacationStats;
