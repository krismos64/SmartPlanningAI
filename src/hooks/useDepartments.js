import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config/api";

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

  /**
   * Récupère tous les départements depuis les employés existants
   * Version silencieuse qui n'affiche pas d'erreurs
   */
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Tentative de récupération des départements...");

      const token = localStorage.getItem("token");

      // Construire l'URL explicitement avec le préfixe /api
      const baseUrl = API_URL || "http://localhost:5001";
      const url = `${baseUrl}/api/departments`;
      console.log("URL des départements:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Réponse de l'API départements:", data);

        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
          setError(null);
          console.log("Départements récupérés avec succès:", data);
        } else if (
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          // Format alternatif de réponse
          setDepartments(data.data);
          setError(null);
          console.log(
            "Départements récupérés avec succès (format alternatif):",
            data.data
          );
        } else {
          console.log("Utilisation des départements par défaut (réponse vide)");
          // Nous gardons les départements par défaut déjà définis dans le state initial
        }
      } else {
        console.log(
          `Erreur ${response.status} - Utilisation des départements par défaut`
        );
        // Nous gardons les départements par défaut
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
  }, []);

  const createDepartment = useCallback(async (departmentData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const baseUrl = API_URL || "http://localhost:5001";
      const url = `${baseUrl}/api/departments`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(departmentData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments((prev) => [...prev, data]);
        return { success: true, department: data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la création du département"
        );
      }
    } catch (err) {
      console.error("Erreur lors de la création du département:", err);
      return { success: false, error: err.message };
    }
  }, []);

  const updateDepartment = useCallback(async (id, departmentData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const baseUrl = API_URL || "http://localhost:5001";
      const url = `${baseUrl}/api/departments/${id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(departmentData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments((prev) =>
          prev.map((dept) => (dept.id === id ? { ...dept, ...data } : dept))
        );
        return { success: true, department: data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la mise à jour du département"
        );
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du département:", err);
      return { success: false, error: err.message };
    }
  }, []);

  const deleteDepartment = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const baseUrl = API_URL || "http://localhost:5001";
      const url = `${baseUrl}/api/departments/${id}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        setDepartments((prev) => prev.filter((dept) => dept.id !== id));
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Erreur lors de la suppression du département"
        );
      }
    } catch (err) {
      console.error("Erreur lors de la suppression du département:", err);
      return { success: false, error: err.message };
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
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartmentByName,
  };
};

export default useDepartments;
