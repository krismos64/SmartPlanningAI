import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { EMPLOYEE_DEPARTMENTS } from "../config/constants";

/**
 * Hook personnalisé pour gérer les départements
 * Récupère les départements depuis la base de données via les employés
 */
const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Récupère tous les départements depuis les employés existants
   */
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      // Récupérer les employés pour extraire les départements
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const employees = await response.json();

      // Extraire les départements uniques des employés
      const uniqueDepartments = [
        ...new Set(employees.map((emp) => emp.department).filter(Boolean)),
      ];

      // Transformer les données pour correspondre au format attendu par le frontend
      const transformedData = uniqueDepartments.map((deptName, index) => {
        // Trouver le département correspondant dans les constantes si possible
        const deptFromConstants = EMPLOYEE_DEPARTMENTS.find(
          (d) => d.value === deptName
        );

        return {
          id: index + 1,
          name: deptName,
          label: deptFromConstants?.label || deptName,
        };
      });

      setDepartments(transformedData);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la récupération des départements:", err);

      // En cas d'erreur, utiliser les départements des constantes comme fallback
      const fallbackDepartments = EMPLOYEE_DEPARTMENTS.map((dept, index) => ({
        id: index + 1,
        name: dept.value,
        label: dept.label,
      }));

      setDepartments(fallbackDepartments);
      setError("Erreur lors de la récupération des départements");
      setLoading(false);
    }
  }, []);

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
    getDepartmentById,
    getDepartmentByName,
  };
};

export default useDepartments;
