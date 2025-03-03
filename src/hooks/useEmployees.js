import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotification } from "../components/ui/Notification";
import { API_ROUTES, apiRequest } from "../config/api";
import { useAuth } from "../contexts/AuthContext";

export const useEmployees = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const { showNotification } = useNotification();
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState(null);

  const fetchEmployees = useCallback(async () => {
    // Ne pas effectuer la requête si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      setLoading(false);
      setError("Vous devez être connecté pour accéder à cette ressource");
      setEmployees([]);
      return;
    }

    try {
      // Utiliser apiRequest sans ajouter manuellement le token
      const data = await apiRequest(API_ROUTES.EMPLOYEES.BASE);

      // Vérifier si data est un tableau, sinon initialiser un tableau vide
      if (Array.isArray(data)) {
        // Transformer les données pour correspondre au format attendu par le frontend
        const transformedData = data.map((employee) => ({
          id: employee.id,
          firstName: employee.first_name,
          lastName: employee.last_name,
          email: employee.email,
          role: employee.role,
          department: employee.department,
          birthDate: employee.birth_date,
          startDate: employee.start_date,
          status: employee.status || "active",
          hoursWorked: employee.hours_worked,
          overtimeHours: employee.overtime_hours,
          createdAt: employee.created_at,
        }));

        setEmployees(transformedData);
      } else {
        console.error("Les données reçues ne sont pas un tableau:", data);
        setEmployees([]);
      }

      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      showNotification({
        type: "error",
        title: "Erreur",
        message: "Impossible de charger la liste des employés.",
      });
      setEmployees([]);
      setLoading(false);
      setError(error.message || "Erreur lors du chargement des employés");
    }
  }, [showNotification, isAuthenticated]);

  const addEmployee = useCallback(
    async (employeeData) => {
      try {
        // Transformer les données pour correspondre au format attendu par le backend
        const transformedData = {
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email || null,
          role: employeeData.role || null,
          department: employeeData.department || null,
          birth_date: employeeData.birthDate || null,
          start_date: employeeData.startDate || null,
          status: employeeData.status || "active",
        };

        await apiRequest(API_ROUTES.EMPLOYEES.BASE, {
          method: "POST",
          body: JSON.stringify(transformedData),
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
        // Transformer les données pour correspondre au format attendu par le backend
        const transformedData = {
          first_name: employeeData.firstName,
          last_name: employeeData.lastName,
          email: employeeData.email || null,
          role: employeeData.role || null,
          department: employeeData.department || null,
          birth_date: employeeData.birthDate || null,
          start_date: employeeData.startDate || null,
          status: employeeData.status || "active",
        };

        await apiRequest(API_ROUTES.EMPLOYEES.DETAIL(id), {
          method: "PUT",
          body: JSON.stringify(transformedData),
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
    // Ne charger les employés que si l'utilisateur est authentifié
    if (isAuthenticated) {
      fetchEmployees();
    } else {
      setLoading(false);
    }
  }, [fetchEmployees, isAuthenticated]);

  return {
    loading,
    employees: Array.isArray(employees) ? employees : [],
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeesByStatus,
    error,
  };
};
