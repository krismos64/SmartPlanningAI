import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotification } from "../components/ui/Notification";
import { API_ROUTES, apiRequest } from "../config/api";

export const useEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const { showNotification } = useNotification();

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await apiRequest(API_ROUTES.EMPLOYEES.BASE);

      // Vérifier si data est un tableau, sinon initialiser un tableau vide
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        console.error("Les données reçues ne sont pas un tableau:", data);
        setEmployees([]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      showNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible de charger la liste des employés.",
      });
      setEmployees([]);
      setLoading(false);
    }
  }, [showNotification]);

  const addEmployee = useCallback(
    async (employeeData) => {
      try {
        await apiRequest(API_ROUTES.EMPLOYEES.BASE, {
          method: "POST",
          body: JSON.stringify(employeeData),
        });

        showNotification({
          type: "success",
          title: "Succès",
          message: "Nouvel employé ajouté avec succès",
        });

        await fetchEmployees();
        return true;
      } catch (error) {
        console.error("Erreur:", error);
        showNotification({
          type: "error",
          title: "Erreur",
          message: "Une erreur est survenue lors de la sauvegarde.",
        });
        return false;
      }
    },
    [fetchEmployees, showNotification]
  );

  const updateEmployee = useCallback(
    async (id, employeeData) => {
      try {
        await apiRequest(API_ROUTES.EMPLOYEES.DETAIL(id), {
          method: "PUT",
          body: JSON.stringify(employeeData),
        });

        showNotification({
          type: "success",
          title: "Succès",
          message: "Employé modifié avec succès",
        });

        await fetchEmployees();
        return true;
      } catch (error) {
        console.error("Erreur:", error);
        showNotification({
          type: "error",
          title: "Erreur",
          message: "Une erreur est survenue lors de la modification.",
        });
        return false;
      }
    },
    [fetchEmployees, showNotification]
  );

  const deleteEmployee = useCallback(
    async (id) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
        return false;
      }

      try {
        await apiRequest(API_ROUTES.EMPLOYEES.DETAIL(id), {
          method: "DELETE",
        });

        showNotification({
          type: "success",
          title: "Succès",
          message: "Employé supprimé avec succès",
        });

        await fetchEmployees();
        return true;
      } catch (error) {
        console.error("Erreur:", error);
        showNotification({
          type: "error",
          title: "Erreur",
          message: "Une erreur est survenue lors de la suppression.",
        });
        return false;
      }
    },
    [fetchEmployees, showNotification]
  );

  const employeesByStatus = useMemo(() => {
    // S'assurer que employees est un tableau avant d'appeler filter
    const employeesArray = Array.isArray(employees) ? employees : [];

    return {
      all: employeesArray.length,
      active: employeesArray.filter((e) => e.status === "active").length,
      pending: employeesArray.filter((e) => e.status === "pending").length,
      inactive: employeesArray.filter((e) => e.status === "inactive").length,
    };
  }, [employees]);

  const getEmployeesByStatus = useCallback(
    () => employeesByStatus,
    [employeesByStatus]
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    loading,
    employees: Array.isArray(employees) ? employees : [],
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByStatus,
  };
};
