import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les départements
 * Récupère les départements depuis la base de données via les employés
 */
const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  /**
   * Récupère tous les départements depuis les employés existants
   */
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.BASE);

      if (response.ok) {
        setDepartments(response.data);
        setError(null);
      } else {
        throw new Error(
          response.data?.message || "Erreur lors du chargement des départements"
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des départements:", err);
      setError("Erreur lors du chargement des départements");
      toast.error("Erreur lors du chargement des départements");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createDepartment = useCallback(
    async (departmentData) => {
      try {
        const response = await api.post(
          API_ENDPOINTS.DEPARTMENTS.BASE,
          departmentData
        );

        if (response.ok) {
          setDepartments((prev) => [...prev, response.data]);
          toast.success("Département créé avec succès");
          return { success: true, department: response.data };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la création du département"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la création du département:", err);
        toast.error("Erreur lors de la création du département");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  const updateDepartment = useCallback(
    async (id, departmentData) => {
      try {
        const response = await api.put(
          API_ENDPOINTS.DEPARTMENTS.BY_ID(id),
          departmentData
        );

        if (response.ok) {
          setDepartments((prev) =>
            prev.map((dept) =>
              dept.id === id ? { ...dept, ...response.data } : dept
            )
          );
          toast.success("Département mis à jour avec succès");
          return { success: true, department: response.data };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la mise à jour du département"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour du département:", err);
        toast.error("Erreur lors de la mise à jour du département");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  const deleteDepartment = useCallback(
    async (id) => {
      try {
        const response = await api.delete(API_ENDPOINTS.DEPARTMENTS.BY_ID(id));

        if (response.ok) {
          setDepartments((prev) => prev.filter((dept) => dept.id !== id));
          toast.success("Département supprimé avec succès");
          return { success: true };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la suppression du département"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la suppression du département:", err);
        toast.error("Erreur lors de la suppression du département");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  /**
   * Récupère un département par son ID
   */
  const getDepartmentById = useCallback(
    (id) => {
      return departments.find((dept) => dept.id === id) || null;
    },
    [departments]
  );

  /**
   * Récupère un département par son nom
   */
  const getDepartmentByName = useCallback(
    (name) => {
      return departments.find((dept) => dept.name === name) || null;
    },
    [departments]
  );

  // Charger les départements au montage du composant
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartmentByName,
  };
};

export default useDepartments;
