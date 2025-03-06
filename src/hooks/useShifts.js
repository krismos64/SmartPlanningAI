import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.SHIFTS.BASE);

      if (response.ok) {
        setShifts(response.data);
        setError(null);
      } else {
        throw new Error(
          response.data?.message || "Erreur lors du chargement des horaires"
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des horaires:", err);
      setError("Erreur lors du chargement des horaires");
      toast.error("Erreur lors du chargement des horaires");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createShift = useCallback(
    async (shiftData) => {
      try {
        const response = await api.post(API_ENDPOINTS.SHIFTS.BASE, shiftData);

        if (response.ok) {
          setShifts((prev) => [...prev, response.data]);
          toast.success("Horaire créé avec succès");
          return { success: true, shift: response.data };
        } else {
          throw new Error(
            response.data?.message || "Erreur lors de la création de l'horaire"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la création de l'horaire:", err);
        toast.error("Erreur lors de la création de l'horaire");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  const updateShift = useCallback(
    async (id, shiftData) => {
      try {
        const response = await api.put(
          API_ENDPOINTS.SHIFTS.BY_ID(id),
          shiftData
        );

        if (response.ok) {
          setShifts((prev) =>
            prev.map((shift) =>
              shift.id === id ? { ...shift, ...response.data } : shift
            )
          );
          toast.success("Horaire mis à jour avec succès");
          return { success: true, shift: response.data };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la mise à jour de l'horaire"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'horaire:", err);
        toast.error("Erreur lors de la mise à jour de l'horaire");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  const deleteShift = useCallback(
    async (id) => {
      try {
        const response = await api.delete(API_ENDPOINTS.SHIFTS.BY_ID(id));

        if (response.ok) {
          setShifts((prev) => prev.filter((shift) => shift.id !== id));
          toast.success("Horaire supprimé avec succès");
          return { success: true };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la suppression de l'horaire"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'horaire:", err);
        toast.error("Erreur lors de la suppression de l'horaire");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    shifts,
    loading,
    error,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift,
  };
};

export default useShifts;
