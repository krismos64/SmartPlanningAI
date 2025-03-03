import { useState, useEffect, useCallback, useTransition } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_ROUTES, apiRequest } from "../config/api";

export const useShifts = () => {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const fetchShifts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(API_ROUTES.SHIFTS.BASE, "GET");
      if (response.error) {
        setError(response.error);
        return;
      }
      startTransition(() => {
        setShifts(response);
      });
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des shifts");
    } finally {
      setLoading(false);
    }
  }, []);

  const createShift = async (shiftData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(
        API_ROUTES.SHIFTS.BASE,
        "POST",
        shiftData
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }
      startTransition(() => {
        setShifts((prev) => [...prev, response]);
      });
      return response;
    } catch (err) {
      setError(err.message || "Erreur lors de la création du shift");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateShift = async (id, shiftData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(
        API_ROUTES.SHIFTS.DETAIL(id),
        "PUT",
        shiftData
      );
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }
      startTransition(() => {
        setShifts((prev) =>
          prev.map((shift) => (shift.id === id ? response : shift))
        );
      });
      return response;
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour du shift");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteShift = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiRequest(API_ROUTES.SHIFTS.DETAIL(id), "DELETE");
      if (response.error) {
        setError(response.error);
        throw new Error(response.error);
      }
      startTransition(() => {
        setShifts((prev) => prev.filter((shift) => shift.id !== id));
      });
      return true;
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression du shift");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchShifts();
    } else {
      setLoading(false);
    }
  }, [fetchShifts, isAuthenticated]);

  return {
    loading: loading || isPending,
    shifts,
    error,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift,
  };
};
