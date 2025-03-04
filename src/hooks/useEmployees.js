import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

/**
 * Hook personnalisé pour gérer les employés
 */
const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère tous les employés
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

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

      const data = await response.json();

      // Transformer les données pour correspondre au format attendu par le frontend
      const transformedData = data.map((employee) => ({
        id: employee.id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        contractHours: employee.contract_hours || 0,
        birthDate: employee.birth_date,
        startDate: employee.start_date,
        status: employee.status || "active",
        hoursWorked: employee.hours_worked,
        overtimeHours: employee.overtime_hours,
        createdAt: employee.created_at,
      }));

      setEmployees(transformedData);
      return transformedData;
    } catch (err) {
      console.error("Erreur lors de la récupération des employés:", err);
      setError(err.message || "Erreur lors de la récupération des employés");
      toast.error("Erreur lors de la récupération des employés");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère un employé par son ID
   */
  const fetchEmployeeById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Transformer les données
      const transformedData = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: data.role,
        department: data.department,
        contractHours: data.contract_hours || 0,
        birthDate: data.birth_date,
        startDate: data.start_date,
        status: data.status || "active",
        hoursWorked: data.hours_worked,
        overtimeHours: data.overtime_hours,
        createdAt: data.created_at,
      };

      return transformedData;
    } catch (err) {
      console.error(`Erreur lors de la récupération de l'employé #${id}:`, err);
      setError(err.message || "Erreur lors de la récupération de l'employé");
      toast.error("Erreur lors de la récupération de l'employé");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée un nouvel employé
   */
  const createEmployee = useCallback(async (employeeData) => {
    setLoading(true);
    setError(null);

    try {
      // Transformer les données pour le backend
      const transformedData = {
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        email: employeeData.email,
        role: employeeData.role,
        department: employeeData.department,
        contract_hours: employeeData.contractHours,
        birth_date: employeeData.birthDate,
        start_date: employeeData.startDate,
        status: employeeData.status || "active",
      };

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Transformer les données reçues
      const newEmployee = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: data.role,
        department: data.department,
        contractHours: data.contract_hours || 0,
        birthDate: data.birth_date,
        startDate: data.start_date,
        status: data.status || "active",
        hoursWorked: data.hours_worked,
        overtimeHours: data.overtime_hours,
        createdAt: data.created_at,
      };

      setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
      toast.success("Employé créé avec succès");
      return newEmployee;
    } catch (err) {
      console.error("Erreur lors de la création de l'employé:", err);
      setError(err.message || "Erreur lors de la création de l'employé");
      toast.error("Erreur lors de la création de l'employé");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour un employé existant
   */
  const updateEmployee = useCallback(async (id, employeeData) => {
    setLoading(true);
    setError(null);

    try {
      // Transformer les données pour le backend
      const transformedData = {
        first_name: employeeData.firstName,
        last_name: employeeData.lastName,
        email: employeeData.email,
        role: employeeData.role,
        department: employeeData.department,
        contract_hours: employeeData.contractHours,
        birth_date: employeeData.birthDate,
        start_date: employeeData.startDate,
        status: employeeData.status || "active",
        hours_worked: employeeData.hoursWorked,
      };

      console.log("Données envoyées pour mise à jour:", transformedData);

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Transformer les données reçues
      const updatedEmployee = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: data.role,
        department: data.department,
        contractHours: data.contract_hours || 0,
        birthDate: data.birth_date,
        startDate: data.start_date,
        status: data.status || "active",
        hoursWorked: data.hours_worked,
        overtimeHours: data.overtime_hours,
        createdAt: data.created_at,
      };

      setEmployees((prevEmployees) =>
        prevEmployees.map((employee) =>
          employee.id === id ? updatedEmployee : employee
        )
      );

      toast.success("Employé mis à jour avec succès");
      return updatedEmployee;
    } catch (err) {
      console.error(`Erreur lors de la mise à jour de l'employé #${id}:`, err);
      setError(err.message || "Erreur lors de la mise à jour de l'employé");
      toast.error("Erreur lors de la mise à jour de l'employé");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime un employé
   */
  const deleteEmployee = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee.id !== id)
      );

      toast.success("Employé supprimé avec succès");
      return true;
    } catch (err) {
      console.error(`Erreur lors de la suppression de l'employé #${id}:`, err);
      setError(err.message || "Erreur lors de la suppression de l'employé");
      toast.error("Erreur lors de la suppression de l'employé");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Compte le nombre d'employés par statut
   * @returns {Object} Un objet avec le nombre d'employés par statut
   */
  const getEmployeesByStatus = useCallback(() => {
    const statusCounts = {
      all: employees.length,
      active: 0,
      inactive: 0,
      vacation: 0,
      sick: 0,
    };

    employees.forEach((employee) => {
      if (statusCounts[employee.status] !== undefined) {
        statusCounts[employee.status]++;
      }
    });

    return statusCounts;
  }, [employees]);

  // Charger les employés au montage du composant
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
