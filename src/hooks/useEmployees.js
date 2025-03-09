import { useCallback, useEffect, useRef, useState } from "react";
import { API_ENDPOINTS, API_URL } from "../config/api";
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
   * Récupère tous les employés depuis l'API
   */
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      // Forcer l'URL correcte
      const apiUrl = API_URL || "http://localhost:5004";
      console.log(`[fetchEmployees] Utilisation de l'URL: ${apiUrl}`);

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Veuillez vous connecter pour accéder à cette page.");
      }

      // Utiliser fetch directement avec l'URL correcte
      const response = await fetch(`${apiUrl}/api/employees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du chargement des employés"
        );
      }

      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
      setError(null);
      return data;
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère un employé par son ID
   */
  const fetchEmployeeById = useCallback(async (id) => {
    setLoading(true);
    try {
      // Forcer l'URL correcte
      const apiUrl = API_URL || "http://localhost:5004";
      console.log(`[fetchEmployeeById] Utilisation de l'URL: ${apiUrl}`);

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Veuillez vous connecter pour accéder à cette page.");
      }

      // Utiliser fetch directement avec l'URL correcte
      const response = await fetch(`${apiUrl}/api/employees/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du chargement de l'employé"
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'employé ${id}:`,
        error
      );
      setError(error.message);
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
    try {
      // Supprimer hourlyRate des données pour éviter l'erreur
      const { hourlyRate, ...cleanedData } = employeeData;

      // Forcer l'URL correcte
      const apiUrl = API_URL || "http://localhost:5004";
      console.log(`[createEmployee] Utilisation de l'URL: ${apiUrl}`);

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Veuillez vous connecter pour accéder à cette page.");
      }

      // S'assurer que les données sont sérialisables
      const jsonData = JSON.parse(JSON.stringify(cleanedData));

      // Convertir les données en snake_case pour le backend
      const snakeCaseData = {};
      for (const key in jsonData) {
        if (key === "zipCode") {
          snakeCaseData["zip_code"] = jsonData[key];
        } else {
          snakeCaseData[
            key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          ] = jsonData[key];
        }
      }

      // Utiliser fetch directement avec l'URL correcte
      const response = await fetch(`${apiUrl}/api/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la création de l'employé"
        );
      }

      const data = await response.json();

      // Mettre à jour la liste des employés
      setEmployees((prevEmployees) => [
        ...prevEmployees,
        data.employee || data,
      ]);
      setError(null);

      return {
        success: true,
        employee: data.employee || data,
        message: "Employé créé avec succès",
      };
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      setError(error.message);
      return {
        success: false,
        error: error.message || "Erreur lors de la création de l'employé",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour un employé existant
   */
  const updateEmployee = useCallback(async (id, employeeData) => {
    setLoading(true);
    try {
      // Supprimer hourlyRate des données pour éviter l'erreur
      const { hourlyRate, ...cleanedData } = employeeData;

      // Forcer l'URL correcte
      const apiUrl = API_URL || "http://localhost:5004";
      console.log(`[updateEmployee] Utilisation de l'URL: ${apiUrl}`);

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Veuillez vous connecter pour accéder à cette page.");
      }

      // S'assurer que les données sont sérialisables
      const jsonData = JSON.parse(JSON.stringify(cleanedData));

      // Convertir les données en snake_case pour le backend
      const snakeCaseData = {};
      for (const key in jsonData) {
        if (key === "zipCode") {
          snakeCaseData["zip_code"] = jsonData[key];
        } else {
          snakeCaseData[
            key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          ] = jsonData[key];
        }
      }

      // Utiliser fetch directement avec l'URL correcte
      const response = await fetch(`${apiUrl}/api/employees/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(snakeCaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour de l'employé"
        );
      }

      const data = await response.json();

      // Mettre à jour la liste des employés
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === id ? { ...emp, ...(data.employee || data) } : emp
        )
      );

      return {
        success: true,
        message: "Employé mis à jour avec succès",
        data: data.employee || data,
      };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      setError(error.message);
      return {
        success: false,
        error: error.message || "Erreur lors de la mise à jour de l'employé",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Supprime un employé
   */
  const deleteEmployee = useCallback(async (id) => {
    setLoading(true);
    try {
      // Forcer l'URL correcte
      const apiUrl = API_URL || "http://localhost:5004";
      console.log(`[deleteEmployee] Utilisation de l'URL: ${apiUrl}`);

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Veuillez vous connecter pour accéder à cette page.");
      }

      // Utiliser fetch directement avec l'URL correcte
      const response = await fetch(`${apiUrl}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la suppression de l'employé"
        );
      }

      // Mettre à jour la liste des employés
      setEmployees((prevEmployees) =>
        prevEmployees.filter((emp) => emp.id !== id)
      );

      return {
        success: true,
        message: "Employé supprimé avec succès",
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
      setError(error.message);
      return {
        success: false,
        error: error.message || "Erreur lors de la suppression de l'employé",
      };
    } finally {
      setLoading(false);
    }
  }, []);

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

  /**
   * Récupère le solde d'heures d'un employé
   */
  const fetchEmployeeHourBalance = useCallback(
    async (id) => {
      try {
        // Ajouter un délai aléatoire pour éviter les requêtes simultanées
        const randomDelay = Math.floor(Math.random() * 200);
        await new Promise((resolve) => setTimeout(resolve, randomDelay));

        const response = await api.get(`/api/hour-balance/${id}`);

        // Vérifier si la réponse contient hour_balance ou balance
        if (
          response &&
          (response.hour_balance !== undefined ||
            response.balance !== undefined)
        ) {
          const balance =
            response.hour_balance !== undefined
              ? response.hour_balance
              : response.balance;

          // Mettre à jour l'état local des employés avec le nouveau solde d'heures
          setEmployees((prev) =>
            prev.map((emp) =>
              emp.id === id ? { ...emp, hour_balance: balance } : emp
            )
          );
          return balance;
        } else {
          console.warn(
            `Avertissement: Format de réponse inattendu pour l'employé #${id}`
          );
          return 0; // Retourner 0 par défaut
        }
      } catch (err) {
        // Éviter de logger l'erreur complète pour ne pas surcharger la console
        console.warn(
          `Avertissement: Impossible de récupérer le solde d'heures pour l'employé #${id}`
        );

        // Ne pas mettre à jour l'état pour éviter des re-rendus en cascade
        return 0; // Retourner 0 par défaut en cas d'erreur
      }
    },
    [api, setEmployees]
  );

  /**
   * Récupère le solde d'heures pour tous les employés
   * Utilise une approche séquentielle pour éviter de surcharger le navigateur
   */
  const fetchAllEmployeesHourBalances = useCallback(async () => {
    // Variable pour suivre si la fonction est déjà en cours d'exécution
    if (window._isFetchingHourBalances) {
      return;
    }

    try {
      // Marquer comme en cours d'exécution
      window._isFetchingHourBalances = true;

      // Traiter les employés un par un au lieu de par lots
      for (const employee of employees) {
        try {
          await fetchEmployeeHourBalance(employee.id);
          // Attendre 300ms entre chaque requête
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          // Ignorer les erreurs individuelles et continuer avec le prochain employé
          console.warn(
            `Erreur pour l'employé ${employee.id}, continuons avec le suivant`
          );
        }
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des soldes d'heures:", err);
    } finally {
      // Marquer comme terminé
      window._isFetchingHourBalances = false;
    }
  }, [employees, fetchEmployeeHourBalance]);

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
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token d'authentification manquant");
          setError("Vous devez être connecté pour accéder à ces données");
          setLoading(false);
          return;
        }

        const data = await api.get(API_ENDPOINTS.EMPLOYEES.BASE);

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

  // Charger les soldes d'heures après avoir chargé les employés
  // Utiliser une référence pour suivre si l'effet a déjà été exécuté
  const hourBalancesLoaded = useRef(false);

  useEffect(() => {
    // Ne charger les soldes d'heures que si les employés sont chargés et que l'effet n'a pas encore été exécuté
    if (employees.length > 0 && !hourBalancesLoaded.current) {
      // Marquer l'effet comme exécuté
      hourBalancesLoaded.current = true;

      // Ajouter un délai avant de charger les soldes d'heures
      // pour s'assurer que le composant est complètement monté
      const timer = setTimeout(() => {
        fetchAllEmployeesHourBalances();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [employees.length, fetchAllEmployeesHourBalances]);

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
    fetchEmployeeHourBalance,
    fetchAllEmployeesHourBalances,
  };
};

export default useEmployees;
