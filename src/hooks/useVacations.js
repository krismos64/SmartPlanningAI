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
  const { socket, isConnected, sendMessage, notifyDataChange, fallbackMode } =
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
          setVacations(data);
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
   * Vérifie si la base de données est accessible
   */
  const checkDatabaseConnection = useCallback(async () => {
    try {
      // Faire une requête simple pour vérifier la connexion
      const response = await api.get(API_ENDPOINTS.VACATIONS);

      // Si la requête échoue avec une erreur de connexion, la base de données n'est pas accessible
      if (!response.ok && (response.status === 0 || response.status >= 500)) {
        console.error("La base de données semble inaccessible:", response);
        return {
          connected: false,
          error: "La connexion à la base de données a échoué",
        };
      }

      return { connected: true };
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la connexion à la base de données:",
        error
      );
      return {
        connected: false,
        error:
          "Erreur lors de la vérification de la connexion à la base de données",
      };
    }
  }, [api]);

  /**
   * Crée une nouvelle demande de congé
   */
  const createVacation = useCallback(
    async (vacationData) => {
      setLoading(true);
      setError(null);

      try {
        // Vérifier que les données essentielles sont présentes
        if (!vacationData.employeeId) {
          toast.error("L'identifiant de l'employé est requis");
          setLoading(false);
          return {
            success: false,
            error: "L'identifiant de l'employé est requis",
          };
        }

        if (!vacationData.startDate || !vacationData.endDate) {
          toast.error("Les dates de début et de fin sont requises");
          setLoading(false);
          return {
            success: false,
            error: "Les dates de début et de fin sont requises",
          };
        }

        // Convertir les dates en objets Date
        const startDate = new Date(vacationData.startDate);
        const endDate = new Date(vacationData.endDate);

        // Vérifier que les dates sont valides
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          toast.error("Les dates fournies ne sont pas valides");
          setLoading(false);
          return {
            success: false,
            error: "Les dates fournies ne sont pas valides",
          };
        }

        // Vérifier que la date de début est avant la date de fin
        if (startDate > endDate) {
          toast.error("La date de début doit être antérieure à la date de fin");
          setLoading(false);
          return {
            success: false,
            error: "La date de début doit être antérieure à la date de fin",
          };
        }

        // Formater les données pour l'API - utiliser directement snake_case pour éviter les conversions
        const formattedData = {
          employee_id: String(vacationData.employeeId),
          type: vacationData.type || "paid",
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          reason: vacationData.reason || "",
          status: "pending",
          // Supprimer les champs qui n'existent pas dans la table
          // approved_by et approved_at ne sont pas dans la table
          // rejected_by et rejected_at ne sont pas dans la table
        };

        // Vérifier que les données sont valides pour le backend
        if (!formattedData.employee_id) {
          console.error("Erreur: employee_id manquant après formatage");
          toast.error("L'identifiant de l'employé est requis");
          return {
            success: false,
            error: "Erreur de formatage des données: employee_id manquant",
          };
        }

        // Vérifier que les dates sont au bon format
        if (!formattedData.start_date || !formattedData.end_date) {
          console.error("Erreur: dates mal formatées", {
            start_date: formattedData.start_date,
            end_date: formattedData.end_date,
          });
          toast.error("Les dates de début et de fin sont requises");
          return {
            success: false,
            error: "Erreur de formatage des dates",
          };
        }

        // Vérifier que le type est valide (paid, unpaid, sick, other)
        const validTypes = ["paid", "unpaid", "sick", "other"];
        if (!validTypes.includes(formattedData.type)) {
          console.warn(
            `Type de congé non standard: ${formattedData.type}, utilisation de 'paid' par défaut`
          );
          formattedData.type = "paid";
        }

        console.log("Données formatées pour l'API:", formattedData);

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
    [
      api,
      retryApiCall,
      socket,
      isConnected,
      notifyDataChange,
      fallbackMode,
      checkDatabaseConnection,
    ]
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
