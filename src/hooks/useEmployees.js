import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les employés
 */
const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  /**
   * Récupère tous les employés
   */
  const fetchEmployees = useCallback(async () => {
    if (!loading) setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.EMPLOYEES.BASE);

      if (response.ok) {
        // S'assurer que les données sont un tableau
        const employeesData = Array.isArray(response.data) ? response.data : [];
        setEmployees(employeesData);
        setError(null);
      } else {
        throw new Error(
          response.data?.message || "Erreur lors du chargement des employés"
        );
      }
    } catch (err) {
      console.error("Erreur lors du chargement des employés:", err);
      setError("Erreur lors du chargement des employés");
      toast.error("Erreur lors du chargement des employés");
      // En cas d'erreur, s'assurer que employees reste un tableau vide
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [api, loading]);

  /**
   * Récupère un employé par son ID
   */
  const fetchEmployeeById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(API_ENDPOINTS.EMPLOYEES.BY_ID(id));

        if (response.ok) {
          return response.data;
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la récupération de l'employé"
          );
        }
      } catch (err) {
        console.error(
          `Erreur lors de la récupération de l'employé #${id}:`,
          err
        );
        setError(err.message || "Erreur lors de la récupération de l'employé");
        toast.error("Erreur lors de la récupération de l'employé");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  /**
   * Crée un nouvel employé
   */
  const createEmployee = useCallback(
    async (employeeData) => {
      try {
        console.log("Données envoyées à l'API pour création:", employeeData);

        // Convertir les valeurs numériques
        const formattedData = {
          ...employeeData,
          contractHours: parseFloat(employeeData.contractHours) || 35,
          hourlyRate: parseFloat(employeeData.hourlyRate) || 0,
        };

        const response = await api.post(
          API_ENDPOINTS.EMPLOYEES.BASE,
          formattedData
        );

        console.log("Réponse de l'API pour création:", response);

        // Vérifier si la réponse contient un indicateur de succès
        if (response && response.success === false) {
          console.error(
            "Erreur API:",
            response.message || "Erreur lors de la création de l'employé"
          );
          return {
            success: false,
            error:
              response.message || "Erreur lors de la création de l'employé",
          };
        }

        // Si la réponse contient un employé, c'est un succès
        if (response && response.employee) {
          // Mettre à jour l'état local
          setEmployees((prev) => [...prev, response.employee]);
          return { success: true, employee: response.employee };
        }

        // Si la réponse est un objet mais ne contient pas d'employé, vérifier s'il y a un message d'erreur
        if (response && typeof response === "object") {
          if (response.message && response.message.includes("erreur")) {
            return { success: false, error: response.message };
          }

          // Si la réponse est l'employé lui-même
          if (response.id) {
            setEmployees((prev) => [...prev, response]);
            return { success: true, employee: response };
          }
        }

        // Fallback pour les anciennes API qui renvoient directement l'employé
        setEmployees((prev) => [...prev, response]);
        return { success: true, employee: response };
      } catch (err) {
        console.error("Erreur lors de la création de l'employé:", err);

        // Extraire un message d'erreur plus précis si possible
        let errorMessage = "Erreur lors de la création de l'employé";

        if (err.response && err.response.data) {
          errorMessage = err.response.data.message || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }

        return { success: false, error: errorMessage };
      }
    },
    [api]
  );

  /**
   * Met à jour un employé existant
   */
  const updateEmployee = useCallback(
    async (id, employeeData) => {
      try {
        if (!id) {
          console.error("ID d'employé non valide:", id);
          return { success: false, error: "ID d'employé non valide" };
        }

        console.log("Données envoyées à l'API pour mise à jour:", employeeData);

        // Convertir les valeurs numériques
        const formattedData = {
          ...employeeData,
          contractHours: parseFloat(employeeData.contractHours) || 35,
          hourlyRate: parseFloat(employeeData.hourlyRate) || 0,
        };

        const response = await api.put(
          API_ENDPOINTS.EMPLOYEES.BY_ID(id),
          formattedData
        );

        console.log("Réponse de l'API pour mise à jour:", response);

        if (!response.ok) {
          const errorMessage =
            response.data?.message ||
            "Erreur lors de la mise à jour de l'employé";
          console.error("Erreur API:", errorMessage);
          return { success: false, error: errorMessage };
        }

        // Mettre à jour l'état local
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === id ? { ...emp, ...response.data } : emp
          )
        );

        return { success: true, employee: response.data };
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'employé:", err);
        return { success: false, error: err.message || "Erreur inconnue" };
      }
    },
    [api]
  );

  /**
   * Supprime un employé
   */
  const deleteEmployee = useCallback(
    async (id) => {
      try {
        if (!id) {
          console.error("ID d'employé non valide pour suppression:", id);
          return { success: false, error: "ID d'employé non valide" };
        }

        console.log("Tentative de suppression de l'employé avec ID:", id);

        const response = await api.delete(API_ENDPOINTS.EMPLOYEES.BY_ID(id));

        console.log("Réponse de l'API pour suppression:", response);

        // Vérifier si la réponse contient success: true
        if (response && response.success === true) {
          // Mettre à jour l'état local
          setEmployees((prev) => prev.filter((emp) => emp.id !== id));
          return { success: true };
        } else {
          const errorMessage =
            response?.message || "Erreur lors de la suppression de l'employé";
          console.error("Erreur API:", errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'employé:", err);
        return { success: false, error: err.message || "Erreur inconnue" };
      }
    },
    [api]
  );

  /**
   * Filtre les employés par statut
   * @param {string|null} status - Le statut à filtrer (active, inactive, vacation, sick) ou null pour tous
   * @returns {Array} - Les employés filtrés
   */
  const getEmployeesByStatus = useCallback(
    (status) => {
      if (!status || status === "all") return employees;
      return employees.filter((employee) => employee.status === status);
    },
    [employees]
  );

  // Charger les employés au montage du composant
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const loadEmployees = async () => {
      if (retryCount >= maxRetries) {
        if (mounted) {
          setError(
            "Erreur lors du chargement des employés après plusieurs tentatives"
          );
          setLoading(false);
        }
        return;
      }

      try {
        console.log("Chargement des employés...");
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token d'authentification manquant");
          setError("Vous devez être connecté pour accéder à ces données");
          setLoading(false);
          return;
        }

        const data = await api.get(API_ENDPOINTS.EMPLOYEES.BASE);
        console.log("Données des employés reçues:", data);

        if (mounted) {
          if (Array.isArray(data)) {
            setEmployees(data);
            setError(null);
          } else {
            console.error("Format de données invalide:", data);
            setError("Format de données invalide");
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Erreur lors du chargement des employés:", err);
          setError(err.message || "Erreur lors du chargement des employés");

          // Réessayer avec un délai exponentiel
          retryCount++;
          setTimeout(loadEmployees, 1000 * Math.pow(2, retryCount));
        }
      }
    };

    loadEmployees();

    return () => {
      mounted = false;
    };
  }, [api]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByStatus,
  };
};

export default useEmployees;
