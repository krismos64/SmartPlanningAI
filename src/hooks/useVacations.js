import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les congés
 * Version optimisée sans WebSocket pour simplifier le chargement des données
 * Ce hook effectue un simple appel REST à l'API pour récupérer les données
 * sans nécessiter de mises à jour en temps réel ou de mécanismes complexes de mise en cache
 */
const useVacations = () => {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();
  const isComponentMountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Marquer le composant comme monté/démonté
  useEffect(() => {
    // Réinitialiser l'état au montage
    isComponentMountedRef.current = true;
    isFetchingRef.current = false;

    return () => {
      // Marquer comme démonté pour éviter les mises à jour d'état après démontage
      isComponentMountedRef.current = false;

      // Réinitialiser les références au démontage
      isFetchingRef.current = false;
    };
  }, []);

  // Fonction simplifiée pour charger les congés depuis l'API
  const fetchVacations = useCallback(async () => {
    // Éviter les appels API multiples simultanés
    if (isFetchingRef.current || !isComponentMountedRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour accéder à ces données");
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      const data = await api.get(API_ENDPOINTS.VACATIONS);

      if (isComponentMountedRef.current) {
        setVacations(data || []);
        setError(null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des congés:", error);
      if (isComponentMountedRef.current) {
        setError(
          "Erreur lors du chargement des congés. Veuillez réessayer plus tard."
        );
      }
    } finally {
      if (isComponentMountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [api]);

  // Rafraîchissement des données
  const refreshVacations = useCallback(
    () => fetchVacations(),
    [fetchVacations]
  );

  // Chargement initial des données
  useEffect(() => {
    if (isComponentMountedRef.current) {
      fetchVacations();
    }

    // Nettoyer lors du démontage
    return () => {
      // On ne fait rien ici car le nettoyage est géré dans le premier useEffect
    };
  }, [fetchVacations]);

  // Créer une nouvelle demande de congé
  const createVacation = useCallback(
    async (vacationData) => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);

        // S'assurer que la durée est calculée si elle n'est pas déjà définie
        let formattedData = {
          ...vacationData,
          status: vacationData.status || "pending",
        };

        // Si la durée n'est pas définie mais les dates de début et fin sont présentes,
        // calculer la durée en jours ouvrés
        if (
          !formattedData.duration &&
          formattedData.startDate &&
          formattedData.endDate
        ) {
          const start = new Date(formattedData.startDate);
          const end = new Date(formattedData.endDate);

          // Importer la fonction depuis les utils si nécessaire
          const { getWorkingDaysCount } = require("../utils/dateUtils");
          formattedData.duration = getWorkingDaysCount(start, end);
        }

        const response = await api.post(API_ENDPOINTS.VACATIONS, formattedData);

        if (isComponentMountedRef.current) {
          setVacations((prev) => [...prev, response]);
          toast.success("Demande de congé créée avec succès");

          // Uniquement si le composant est toujours monté
          if (isComponentMountedRef.current) {
            await fetchVacations(); // Rafraîchir les données pour s'assurer de la cohérence
          }
        }

        return { success: true, data: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la création de la demande de congé";

        if (isComponentMountedRef.current) {
          toast.error(errorMessage);
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [api, fetchVacations]
  );

  // Mettre à jour une demande de congé
  const updateVacation = useCallback(
    async (id, vacationData) => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);

        // S'assurer que la durée est calculée si elle n'est pas déjà définie
        let formattedData = { ...vacationData };

        // Si la durée n'est pas définie mais les dates de début et fin sont présentes,
        // calculer la durée en jours ouvrés
        if (
          !formattedData.duration &&
          formattedData.startDate &&
          formattedData.endDate
        ) {
          const start = new Date(formattedData.startDate);
          const end = new Date(formattedData.endDate);

          // Importer la fonction depuis les utils si nécessaire
          const { getWorkingDaysCount } = require("../utils/dateUtils");
          formattedData.duration = getWorkingDaysCount(start, end);
        }

        const response = await api.put(
          `${API_ENDPOINTS.VACATIONS}/${id}`,
          formattedData
        );

        if (isComponentMountedRef.current) {
          setVacations((prev) =>
            prev.map((vacation) =>
              vacation.id === id ? { ...vacation, ...response } : vacation
            )
          );
          toast.success("Demande de congé mise à jour avec succès");
        }

        return { success: true, data: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour de la demande de congé";

        if (isComponentMountedRef.current) {
          toast.error(errorMessage);
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [api]
  );

  // Supprimer une demande de congé
  const deleteVacation = useCallback(
    async (id) => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);
        await api.delete(`${API_ENDPOINTS.VACATIONS}/${id}`);

        if (isComponentMountedRef.current) {
          setVacations((prev) => prev.filter((vacation) => vacation.id !== id));
          toast.success("Demande de congé supprimée avec succès");
        }

        return { success: true };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la suppression de la demande de congé";

        if (isComponentMountedRef.current) {
          toast.error(errorMessage);
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [api]
  );

  // Mettre à jour le statut d'une demande de congé
  const updateVacationStatus = useCallback(
    async (id, status, comment = "") => {
      if (!isComponentMountedRef.current) return { success: false };

      try {
        setLoading(true);
        const response = await api.put(
          `${API_ENDPOINTS.VACATIONS}/${id}/status`,
          { status, comment }
        );

        if (isComponentMountedRef.current) {
          setVacations((prev) =>
            prev.map((vacation) =>
              vacation.id === id ? { ...vacation, ...response } : vacation
            )
          );

          const statusText =
            status === "approved"
              ? "approuvée"
              : status === "rejected"
              ? "rejetée"
              : "mise à jour";
          toast.success(`Demande de congé ${statusText} avec succès`);
        }

        return { success: true, data: response };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour du statut de la demande de congé";

        if (isComponentMountedRef.current) {
          toast.error(errorMessage);
          setError(errorMessage);
        }

        return { success: false, error: errorMessage };
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [api]
  );

  // Filtrer les congés par statut
  const getVacationsByStatus = useCallback(
    (status) => vacations.filter((vacation) => vacation.status === status),
    [vacations]
  );

  return {
    vacations,
    loading,
    error,
    createVacation,
    updateVacation,
    deleteVacation,
    updateVacationStatus,
    getVacationsByStatus,
    refreshVacations,
  };
};

export default useVacations;
