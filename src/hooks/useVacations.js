import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

/**
 * Hook personnalisé pour gérer les demandes de congés
 */
const useVacations = () => {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Récupère toutes les demandes de congés
   */
  const fetchVacations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/vacations`, {
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
      const transformedData = data.map((vacation) => ({
        id: vacation.id,
        employeeId: vacation.employee_id,
        employeeName: vacation.employee_name || "Employé inconnu",
        startDate: vacation.start_date,
        endDate: vacation.end_date,
        type: vacation.type || "Congés payés",
        reason: vacation.reason,
        status: vacation.status,
        approvedBy: vacation.approved_by || "Administrateur",
        approvedAt: vacation.approved_at,
        rejectedBy: vacation.rejected_by || "Administrateur",
        rejectedAt: vacation.rejected_at,
        rejectionReason: vacation.rejection_reason,
        createdAt: vacation.created_at,
        duration: calculateDuration(vacation.start_date, vacation.end_date),
        attachment: vacation.attachment,
      }));

      setVacations(transformedData);
      return transformedData;
    } catch (err) {
      console.error("Erreur lors de la récupération des congés:", err);
      setError(err.message || "Erreur lors de la récupération des congés");
      toast.error("Erreur lors de la récupération des congés");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calcule la durée entre deux dates en jours ouvrés
   */
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return "0 jour";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calcul simple pour le moment (à améliorer avec les jours ouvrés)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de fin

    return diffDays === 1 ? "1 jour" : `${diffDays} jours`;
  };

  /**
   * Récupère une demande de congé par son ID
   */
  const fetchVacationById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/vacations/${id}`, {
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
        employeeId: data.employee_id,
        employeeName: data.employee_name || "",
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type || "Congés payés",
        reason: data.reason,
        status: data.status,
        approvedBy: data.approved_by,
        approvedAt: data.approved_at,
        rejectedBy: data.rejected_by,
        rejectedAt: data.rejected_at,
        rejectionReason: data.rejection_reason,
        createdAt: data.created_at,
        duration: calculateDuration(data.start_date, data.end_date),
        attachment: data.attachment,
      };

      return transformedData;
    } catch (err) {
      console.error(`Erreur lors de la récupération du congé #${id}:`, err);
      setError(err.message || "Erreur lors de la récupération du congé");
      toast.error("Erreur lors de la récupération du congé");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée une nouvelle demande de congé
   */
  const createVacation = useCallback(async (vacationData) => {
    setLoading(true);
    setError(null);

    try {
      // Transformer les données pour le backend
      const transformedData = {
        employee_id: vacationData.employeeId,
        start_date: vacationData.startDate,
        end_date: vacationData.endDate,
        type: vacationData.type,
        reason: vacationData.reason,
        attachment: vacationData.attachment,
      };

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/vacations`, {
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
      const newVacation = {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee_name || "",
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type || "Congés payés",
        reason: data.reason,
        status: data.status,
        createdAt: data.created_at,
        duration: calculateDuration(data.start_date, data.end_date),
        attachment: data.attachment,
      };

      setVacations((prevVacations) => [...prevVacations, newVacation]);
      toast.success("Demande de congé créée avec succès");
      return newVacation;
    } catch (err) {
      console.error("Erreur lors de la création de la demande de congé:", err);
      setError(
        err.message || "Erreur lors de la création de la demande de congé"
      );
      toast.error("Erreur lors de la création de la demande de congé");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Met à jour une demande de congé existante
   */
  const updateVacation = useCallback(async (id, vacationData) => {
    setLoading(true);
    setError(null);

    try {
      // Transformer les données pour le backend
      const transformedData = {
        employee_id: vacationData.employeeId,
        start_date: vacationData.startDate,
        end_date: vacationData.endDate,
        type: vacationData.type,
        reason: vacationData.reason,
        status: vacationData.status,
        rejection_reason: vacationData.rejectionReason,
        attachment: vacationData.attachment,
      };

      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/vacations/${id}`, {
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
      const updatedVacation = {
        id: data.id,
        employeeId: data.employee_id,
        employeeName: data.employee_name || "",
        startDate: data.start_date,
        endDate: data.end_date,
        type: data.type || "Congés payés",
        reason: data.reason,
        status: data.status,
        approvedBy: data.approved_by,
        approvedAt: data.approved_at,
        rejectedBy: data.rejected_by,
        rejectedAt: data.rejected_at,
        rejectionReason: data.rejection_reason,
        createdAt: data.created_at,
        duration: calculateDuration(data.start_date, data.end_date),
        attachment: data.attachment,
      };

      setVacations((prevVacations) =>
        prevVacations.map((vacation) =>
          vacation.id === id ? updatedVacation : vacation
        )
      );

      toast.success("Demande de congé mise à jour avec succès");
      return updatedVacation;
    } catch (err) {
      console.error(
        `Erreur lors de la mise à jour de la demande de congé #${id}:`,
        err
      );
      setError(
        err.message || "Erreur lors de la mise à jour de la demande de congé"
      );
      toast.error("Erreur lors de la mise à jour de la demande de congé");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Approuve une demande de congé
   */
  const approveVacation = useCallback(
    async (id) => {
      return updateVacation(id, { status: "approved" });
    },
    [updateVacation]
  );

  /**
   * Rejette une demande de congé
   */
  const rejectVacation = useCallback(
    async (id, rejectionReason) => {
      return updateVacation(id, {
        status: "rejected",
        rejectionReason,
      });
    },
    [updateVacation]
  );

  /**
   * Supprime une demande de congé
   */
  const deleteVacation = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/vacations/${id}`, {
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

      setVacations((prevVacations) =>
        prevVacations.filter((vacation) => vacation.id !== id)
      );

      toast.success("Demande de congé supprimée avec succès");
      return true;
    } catch (err) {
      console.error(
        `Erreur lors de la suppression de la demande de congé #${id}:`,
        err
      );
      setError(
        err.message || "Erreur lors de la suppression de la demande de congé"
      );
      toast.error("Erreur lors de la suppression de la demande de congé");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filtre les demandes de congés par statut
   */
  const getVacationsByStatus = useCallback(
    (status) => {
      if (!status || status === "all") return vacations;
      return vacations.filter((vacation) => vacation.status === status);
    },
    [vacations]
  );

  /**
   * Exporte les congés en PDF
   */
  const exportVacationsToPdf = useCallback(
    (vacationsToExport, isGlobal = false) => {
      // Cette fonction sera implémentée plus tard
      console.log("Export des congés en PDF", { vacationsToExport, isGlobal });
      toast.info("Fonctionnalité d'export en cours de développement");
    },
    []
  );

  /**
   * Met à jour le statut d'une demande de congé
   */
  const updateVacationStatus = useCallback(
    async (id, status, rejectionReason = null) => {
      try {
        setLoading(true);

        // Vérifier que le statut est valide
        if (!["pending", "approved", "rejected"].includes(status)) {
          throw new Error("Statut invalide");
        }

        const response = await fetch(
          `${API_BASE_URL}/api/vacations/${id}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              status,
              rejectionReason,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Mettre à jour l'état local
        setVacations((prevVacations) =>
          prevVacations.map((vacation) =>
            vacation.id === id
              ? {
                  ...vacation,
                  status,
                  ...(status === "rejected" && {
                    rejectionReason,
                  }),
                }
              : vacation
          )
        );

        // Afficher un message de succès
        toast.success(
          `Demande de congé ${
            status === "approved"
              ? "approuvée"
              : status === "rejected"
              ? "refusée"
              : "mise en attente"
          } avec succès`
        );

        return true;
      } catch (err) {
        console.error("Erreur lors de la mise à jour du statut:", err);
        setError(err.message || "Erreur lors de la mise à jour du statut");
        toast.error("Erreur lors de la mise à jour du statut");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Charger les demandes de congés au montage du composant
  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  return {
    vacations,
    loading,
    error,
    fetchVacations,
    fetchVacationById,
    createVacation,
    updateVacation,
    approveVacation,
    rejectVacation,
    deleteVacation,
    getVacationsByStatus,
    exportVacationsToPdf,
    updateVacationStatus,
  };
};

export default useVacations;
