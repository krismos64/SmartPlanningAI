import { useCallback, useEffect, useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les départements
 * Récupère les départements depuis la base de données via les employés
 */
const useDepartments = () => {
  const [departments, setDepartments] = useState([
    // Départements par défaut toujours disponibles
    { id: "administration", name: "Administration" },
    { id: "commercial", name: "Commercial" },
    { id: "technique", name: "Technique" },
    { id: "caisses", name: "Caisses" },
    { id: "boutique", name: "Boutique" },
    { id: "informatique", name: "Informatique" },
    { id: "direction", name: "Direction" },
  ]);
  const [loading, setLoading] = useState(false); // Commencer avec loading à false
  const [error, setError] = useState(null);
  const api = useApi();

  /**
   * Récupère tous les départements depuis les employés existants
   * Version silencieuse qui n'affiche pas d'erreurs
   */
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Tentative de récupération des départements...");

      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.BASE);
      console.log("Réponse de l'API départements:", response);

      if (
        response.ok &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setDepartments(response.data);
        setError(null);
        console.log("Départements récupérés avec succès:", response.data);
      } else {
        console.log("Utilisation des départements par défaut");
        // Nous gardons les départements par défaut déjà définis dans le state initial
      }
    } catch (err) {
      console.error(
        "Erreur silencieuse lors du chargement des départements:",
        err
      );
      // Nous gardons les départements par défaut, pas besoin de les redéfinir
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
          return { success: true, department: response.data };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la création du département"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la création du département:", err);
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
          return { success: true, department: response.data };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la mise à jour du département"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour du département:", err);
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
          return { success: true };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la suppression du département"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la suppression du département:", err);
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
