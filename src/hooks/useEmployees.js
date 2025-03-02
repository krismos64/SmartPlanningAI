import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotification } from "../components/ui/Notification";

export const useEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const { showNotification } = useNotification();

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      showNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible de charger la liste des employés.",
      });
      setLoading(false);
    }
  }, [showNotification]);

  const addEmployee = useCallback(
    async (employeeData) => {
      try {
        const response = await fetch("/api/employees", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la sauvegarde");
        }

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
        const response = await fetch(`/api/employees/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la modification");
        }

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
        const response = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression");
        }

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
    return {
      all: employees.length,
      active: employees.filter((e) => e.status === "active").length,
      pending: employees.filter((e) => e.status === "pending").length,
      inactive: employees.filter((e) => e.status === "inactive").length,
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
    employees,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByStatus,
  };
};
