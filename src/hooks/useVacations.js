import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";
import useWebSocket from "./useWebSocket";

/**
 * Hook personnalisé pour gérer les congés
 */
const useVacations = () => {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();

  // Intégration WebSocket pour les mises à jour en temps réel
  const { socket, isConnected, notifyDataChange, fallbackMode } =
    useWebSocket();

  // Écouter les mises à jour WebSocket
  useEffect(() => {
    if (socket && isConnected) {
      // Fonction pour traiter les messages WebSocket
      const handleWebSocketMessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Si le message concerne une mise à jour de congé
          if (data.type === "VACATION_UPDATED" && data.vacation) {
            setVacations((prevVacations) => {
              // Vérifier si le congé existe déjà
              const exists = prevVacations.some(
                (vacation) => vacation.id === data.vacation.id
              );

              if (exists) {
                // Mettre à jour le congé existant
                return prevVacations.map((vacation) =>
                  vacation.id === data.vacation.id ? data.vacation : vacation
                );
              } else {
                // Ajouter le nouveau congé
                return [...prevVacations, data.vacation];
              }
            });

            toast.info("Demande de congé mise à jour en temps réel");
          }

          // Si le message concerne une suppression de congé
          if (data.type === "VACATION_DELETED" && data.vacationId) {
            setVacations((prevVacations) =>
              prevVacations.filter(
                (vacation) => vacation.id !== data.vacationId
              )
            );

            toast.info("Demande de congé supprimée en temps réel");
          }
        } catch (error) {
          console.error(
            "Erreur lors du traitement du message WebSocket:",
            error
          );
        }
      };

      // Ajouter l'écouteur d'événements
      socket.addEventListener("message", handleWebSocketMessage);

      // Nettoyer l'écouteur lors du démontage
      return () => {
        socket.removeEventListener("message", handleWebSocketMessage);
      };
    }
  }, [socket, isConnected]);

  /**
   * Fonction utilitaire pour réessayer une requête API
   * @param {Function} apiCall - Fonction d'appel API à réessayer
   * @param {number} maxRetries - Nombre maximum de tentatives
   * @param {number} delay - Délai entre les tentatives (en ms)
   * @returns {Promise} - Résultat de l'appel API
   */
  const retryApiCall = useCallback(
    async (apiCall, maxRetries = 3, delay = 1000) => {
      let lastError = null;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          return await apiCall();
        } catch (err) {
          lastError = err;
          retryCount++;

          // Si c'est la dernière tentative, ne pas attendre
          if (retryCount < maxRetries) {
            // Utiliser un délai exponentiel
            const retryDelay = delay * Math.pow(2, retryCount - 1);
            console.log(
              `Tentative ${retryCount}/${maxRetries} échouée, nouvelle tentative dans ${retryDelay}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      // Si toutes les tentatives ont échoué, lancer l'erreur
      throw lastError;
    },
    []
  );

  // Fonction pour charger les congés
  const fetchVacations = useCallback(async () => {
    let retryCount = 0;
    const maxRetries = 3;

    const loadVacations = async () => {
      if (retryCount >= maxRetries) {
        setError(
          "Erreur lors du chargement des congés après plusieurs tentatives"
        );
        setLoading(false);
        return;
      }

      try {
        console.log("Chargement des congés...");
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Token d'authentification manquant");
          setError("Vous devez être connecté pour accéder à ces données");
          setLoading(false);
          return;
        }

        const data = await api.get(API_ENDPOINTS.VACATIONS);
        console.log("Données des congés reçues:", data);

        if (Array.isArray(data)) {
          // Convertir les propriétés de snake_case à camelCase
          const formattedData = data.map((vacation) => {
            // Convertir les dates pour le calcul de la durée
            const startDate = vacation.start_date || vacation.startDate;
            const endDate = vacation.end_date || vacation.endDate;

            // Calculer la durée en jours ouvrables selon la législation française
            let duration = "-";
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);

              // Réinitialiser les heures pour éviter les problèmes de comparaison
              start.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);

              // Compter les jours ouvrables (lundi au samedi, hors jours fériés)
              let workableDays = 0;
              const currentDate = new Date(start);

              while (currentDate <= end) {
                // Si ce n'est pas un dimanche (0 = dimanche, 1-6 = lundi-samedi)
                if (currentDate.getDay() !== 0) {
                  workableDays++;
                }

                // Passer au jour suivant
                currentDate.setDate(currentDate.getDate() + 1);
              }

              duration = `${workableDays} jour${
                workableDays > 1 ? "s" : ""
              } ouvrable${workableDays > 1 ? "s" : ""}`;
            }

            // Créer un nouvel objet avec les propriétés converties
            return {
              ...vacation,
              // Assurer que employeeName est défini, même si employee_name ne l'est pas
              employeeName:
                vacation.employee_name ||
                vacation.employeeName ||
                "Employé inconnu",
              // Convertir les dates si nécessaire
              startDate: startDate,
              endDate: endDate,
              // Ajouter la durée calculée
              duration: duration,
              // Autres propriétés qui pourraient être en snake_case
              employeeId: vacation.employee_id || vacation.employeeId,
              approvedAt: vacation.approved_at || vacation.approvedAt,
              approvedBy: vacation.approved_by || vacation.approvedBy,
              rejectedAt: vacation.rejected_at || vacation.rejectedAt,
              rejectedBy: vacation.rejected_by || vacation.rejectedBy,
              rejectionReason:
                vacation.rejection_reason || vacation.rejectionReason,
              createdAt: vacation.created_at || vacation.createdAt,
              updatedAt: vacation.updated_at || vacation.updatedAt,
            };
          });

          console.log("Données des congés formatées:", formattedData);
          setVacations(formattedData);
          setError(null);
        } else {
          console.error("Format de données invalide:", data);
          setError("Format de données invalide");
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des congés:", err);
        setError(err.message || "Erreur lors du chargement des congés");

        // Réessayer avec un délai exponentiel
        retryCount++;
        setTimeout(loadVacations, 1000 * Math.pow(2, retryCount));
      }
    };

    setLoading(true);
    setError(null);
    await loadVacations();
  }, [api]);

  // Charger les congés au montage du composant
  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  /**
   * Crée une nouvelle demande de congé
   */
  const createVacation = useCallback(
    async (vacationData) => {
      try {
        setLoading(true);
        setError(null);

        console.log("Données originales de la demande de congé:", vacationData);

        // Vérifier que les données essentielles sont présentes
        if (!vacationData.employeeId && !vacationData.employee_id) {
          const errorMsg = "L'identifiant de l'employé est requis";
          toast.error(errorMsg);
          setLoading(false);
          return { success: false, error: errorMsg };
        }

        if (
          (!vacationData.startDate && !vacationData.start_date) ||
          (!vacationData.endDate && !vacationData.end_date)
        ) {
          const errorMsg = "Les dates de début et de fin sont requises";
          toast.error(errorMsg);
          setLoading(false);
          return { success: false, error: errorMsg };
        }

        // Formater les données pour correspondre à la structure de la base de données
        const formattedData = {
          employee_id: vacationData.employeeId || vacationData.employee_id,
          start_date: vacationData.startDate || vacationData.start_date,
          end_date: vacationData.endDate || vacationData.end_date,
          type: vacationData.type || "paid",
          reason: vacationData.reason || "",
          status: "pending",
        };

        // Convertir les dates au format YYYY-MM-DD si elles ne le sont pas déjà
        if (
          formattedData.start_date &&
          !formattedData.start_date.includes("-")
        ) {
          const startDate = new Date(formattedData.start_date);
          formattedData.start_date = startDate.toISOString().split("T")[0];
        }

        if (formattedData.end_date && !formattedData.end_date.includes("-")) {
          const endDate = new Date(formattedData.end_date);
          formattedData.end_date = endDate.toISOString().split("T")[0];
        }

        console.log(
          "Données formatées pour la création de congé:",
          formattedData
        );

        // Récupérer le token d'authentification
        const token = localStorage.getItem("token");
        console.log("Token d'authentification présent:", !!token);

        // Appel API avec retry en cas d'échec
        const apiCall = async () => {
          try {
            const response = await api.post(
              API_ENDPOINTS.VACATIONS,
              formattedData
            );
            console.log("Réponse de l'API:", response);

            // Mettre à jour l'état local
            setVacations((prevVacations) => [...prevVacations, response]);

            // Notifier le succès
            toast.success("Demande de congé créée avec succès");

            // Envoyer une notification WebSocket
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "VACATION_CREATED",
                  data: response,
                })
              );
            }

            return { success: true, data: response };
          } catch (error) {
            console.error(
              "Erreur lors de la création de la demande de congé:",
              error
            );

            // Afficher un message d'erreur plus précis si disponible
            const errorMessage =
              error.response?.data?.message ||
              error.response?.data?.error ||
              error.message ||
              "Erreur lors de la création de la demande de congé";

            toast.error(errorMessage);
            setError(errorMessage);

            throw error;
          }
        };

        // Exécuter l'appel API avec retry
        const result = await retryApiCall(apiCall, 2, 1000);
        setLoading(false);
        return result;
      } catch (error) {
        console.error(
          "Erreur finale lors de la création de la demande de congé:",
          error
        );
        setLoading(false);
        setError(
          error.message || "Erreur lors de la création de la demande de congé"
        );
        return { success: false, error: error.message };
      }
    },
    [api, retryApiCall, socket]
  );

  /**
   * Met à jour une demande de congé existante
   */
  const updateVacation = useCallback(
    async (id, vacationData) => {
      try {
        const apiCall = async () => {
          const response = await api.put(
            `${API_ENDPOINTS.VACATIONS}/${id}`,
            vacationData
          );

          if (!response.ok) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la mise à jour de la demande de congé"
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        setVacations((prev) =>
          prev.map((vacation) => (vacation.id === id ? data : vacation))
        );

        // Notifier les autres clients via WebSocket
        if (!fallbackMode && isConnected) {
          notifyDataChange("vacation", "update", id);
        }

        toast.success("Demande de congé mise à jour avec succès");
        return { success: true, vacation: data };
      } catch (err) {
        console.error(
          "Erreur lors de la mise à jour de la demande de congé:",
          err
        );
        const errorMessage = err.message || "Erreur inconnue";
        toast.error(
          `Erreur lors de la mise à jour de la demande de congé: ${errorMessage}`
        );
        return { success: false, error: errorMessage };
      }
    },
    [api, retryApiCall, fallbackMode, isConnected, notifyDataChange]
  );

  /**
   * Supprime une demande de congé
   */
  const deleteVacation = useCallback(
    async (id) => {
      try {
        const apiCall = async () => {
          const response = await api.delete(`${API_ENDPOINTS.VACATIONS}/${id}`);

          if (!response.ok) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la suppression de la demande de congé"
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        await retryApiCall(apiCall);

        setVacations((prev) => prev.filter((vacation) => vacation.id !== id));

        // Notifier les autres clients via WebSocket
        if (!fallbackMode && isConnected) {
          notifyDataChange("vacation", "delete", id);
        }

        toast.success("Demande de congé supprimée avec succès");
        return { success: true };
      } catch (err) {
        console.error(
          "Erreur lors de la suppression de la demande de congé:",
          err
        );
        const errorMessage = err.message || "Erreur inconnue";
        toast.error(
          `Erreur lors de la suppression de la demande de congé: ${errorMessage}`
        );
        return { success: false, error: errorMessage };
      }
    },
    [api, retryApiCall, fallbackMode, isConnected, notifyDataChange]
  );

  /**
   * Approuve ou rejette une demande de congé
   */
  const updateVacationStatus = useCallback(
    async (id, status, comment = "") => {
      try {
        const apiCall = async () => {
          const response = await api.put(
            `${API_ENDPOINTS.VACATIONS}/${id}/status`,
            {
              status,
              comment,
            }
          );

          if (!response.ok) {
            throw new Error(
              response.data?.message ||
                `Erreur lors de la ${
                  status === "approved" ? "validation" : "rejet"
                } de la demande de congé`
            );
          }

          return response.data;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        setVacations((prev) =>
          prev.map((vacation) => (vacation.id === id ? data : vacation))
        );

        // Notifier les autres clients via WebSocket
        if (!fallbackMode && isConnected) {
          notifyDataChange("vacation", "update", id);
        }

        toast.success(
          `Demande de congé ${
            status === "approved" ? "approuvée" : "rejetée"
          } avec succès`
        );
        return { success: true, vacation: data };
      } catch (err) {
        console.error(
          `Erreur lors de la ${
            status === "approved" ? "validation" : "rejet"
          } de la demande de congé:`,
          err
        );
        const errorMessage = err.message || "Erreur inconnue";
        toast.error(
          `Erreur lors de la ${
            status === "approved" ? "validation" : "rejet"
          } de la demande de congé: ${errorMessage}`
        );
        return { success: false, error: errorMessage };
      }
    },
    [api, retryApiCall, fallbackMode, isConnected, notifyDataChange]
  );

  /**
   * Filtre les congés par statut
   * @param {string|null} status - Le statut à filtrer (pending, approved, rejected) ou null pour tous
   * @returns {Array} - Les congés filtrés
   */
  const getVacationsByStatus = useCallback(
    (status) => {
      if (!status) return vacations;
      return vacations.filter((vacation) => vacation.status === status);
    },
    [vacations]
  );

  return {
    vacations,
    loading,
    error,
    fetchVacations,
    createVacation,
    updateVacation,
    deleteVacation,
    updateVacationStatus,
    getVacationsByStatus,
    approveVacation: (id) => updateVacationStatus(id, "approved"),
    rejectVacation: (id, comment) =>
      updateVacationStatus(id, "rejected", comment),
  };
};

export default useVacations;
