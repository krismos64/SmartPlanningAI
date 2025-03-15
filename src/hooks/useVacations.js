import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../config/api";
import useApi from "./useApi";

/**
 * Hook personnalisé pour gérer les congés
 * Version sans WebSocket pour éviter les problèmes de navigation
 */
const useVacations = () => {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();
  const isComponentMountedRef = useRef(true);
  const pollingIntervalRef = useRef(null);
  const POLLING_INTERVAL = 60000; // 60 secondes entre chaque vérification

  // Marquer le composant comme monté/démonté
  useEffect(() => {
    isComponentMountedRef.current = true;

    return () => {
      isComponentMountedRef.current = false;

      // Nettoyer l'intervalle de polling lors du démontage
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

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
  const fetchVacations = useCallback(
    async (forceRefresh = false) => {
      if (!isComponentMountedRef.current) return;

      let retryCount = 0;
      const maxRetries = 2;

      // Vérifier si les données sont déjà en cache et récentes (moins de 5 minutes)
      const cachedData = localStorage.getItem("cachedVacations");
      const cachedTimestamp = localStorage.getItem("cachedVacationsTimestamp");

      if (!forceRefresh && cachedData && cachedTimestamp) {
        const now = new Date().getTime();
        const cacheTime = parseInt(cachedTimestamp);
        const fiveMinutes = 5 * 60 * 1000;

        // Si le cache est récent (moins de 5 minutes), utiliser les données en cache
        if (now - cacheTime < fiveMinutes) {
          try {
            const parsedData = JSON.parse(cachedData);
            console.log("Utilisation des données en cache pour les congés");
            if (isComponentMountedRef.current) {
              setVacations(parsedData);
              setLoading(false);
            }
            return;
          } catch (e) {
            console.error("Erreur lors de la lecture du cache:", e);
            // Continuer avec le chargement normal si le cache est invalide
          }
        }
      }

      const loadVacations = async () => {
        if (retryCount >= maxRetries || !isComponentMountedRef.current) {
          if (isComponentMountedRef.current) {
            setError(
              "Erreur lors du chargement des congés après plusieurs tentatives"
            );
            setLoading(false);
          }
          return;
        }

        try {
          console.log("Chargement des congés...");
          const token = localStorage.getItem("token");

          if (!token) {
            console.error("Token d'authentification manquant");
            if (isComponentMountedRef.current) {
              setError("Vous devez être connecté pour accéder à ces données");
              setLoading(false);
            }
            return;
          }

          const data = await api.get(API_ENDPOINTS.VACATIONS);
          console.log("Données des congés reçues:", data);

          if (!isComponentMountedRef.current) return;

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

            if (isComponentMountedRef.current) {
              setVacations(formattedData);
              setError(null);
            }

            // Mettre en cache les données formatées
            try {
              localStorage.setItem(
                "cachedVacations",
                JSON.stringify(formattedData)
              );
              localStorage.setItem(
                "cachedVacationsTimestamp",
                new Date().getTime().toString()
              );
            } catch (e) {
              console.error("Erreur lors de la mise en cache des données:", e);
              // Continuer même si la mise en cache échoue
            }
          } else {
            console.error("Format de données invalide:", data);
            if (isComponentMountedRef.current) {
              setError("Format de données invalide");
            }
          }

          if (isComponentMountedRef.current) {
            setLoading(false);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des congés:", err);

          if (isComponentMountedRef.current) {
            setError(err.message || "Erreur lors du chargement des congés");
          }

          // Réessayer avec un délai exponentiel mais plus court
          retryCount++;
          const retryDelay = 500 * Math.pow(2, retryCount); // Délai plus court
          console.log(
            `Nouvelle tentative dans ${retryDelay}ms (${retryCount}/${maxRetries})`
          );

          // Utiliser setTimeout avec une vérification du montage
          const timeoutId = setTimeout(() => {
            if (isComponentMountedRef.current) {
              loadVacations();
            }
          }, retryDelay);

          // Nettoyer le timeout si le composant est démonté
          return () => clearTimeout(timeoutId);
        }
      };

      if (isComponentMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      await loadVacations();
    },
    [api]
  );

  // Charger les congés au montage du composant et configurer le polling
  useEffect(() => {
    // Charger les données initiales
    fetchVacations();

    // Configurer un intervalle pour rafraîchir les données périodiquement
    pollingIntervalRef.current = setInterval(() => {
      if (isComponentMountedRef.current) {
        console.log("Rafraîchissement périodique des données de congés");
        fetchVacations(true); // forceRefresh = true pour ignorer le cache
      }
    }, POLLING_INTERVAL);

    // Nettoyer lors du démontage
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
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

        // Rafraîchir les données après création
        fetchVacations(true);

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
    [api, retryApiCall, fetchVacations]
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

          // Vérifier si la réponse est un objet avec une propriété ok
          if (
            response &&
            typeof response === "object" &&
            "ok" in response &&
            !response.ok
          ) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la mise à jour de la demande de congé"
            );
          }

          return response;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        setVacations((prev) =>
          prev.map((vacation) => (vacation.id === id ? data : vacation))
        );

        toast.success("Demande de congé mise à jour avec succès");

        // Rafraîchir les données après mise à jour
        fetchVacations(true);

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
    [api, retryApiCall, fetchVacations]
  );

  /**
   * Supprime une demande de congé
   */
  const deleteVacation = useCallback(
    async (id) => {
      try {
        const apiCall = async () => {
          const response = await api.delete(`${API_ENDPOINTS.VACATIONS}/${id}`);

          // Vérifier si la réponse est un objet avec une propriété ok
          if (
            response &&
            typeof response === "object" &&
            "ok" in response &&
            !response.ok
          ) {
            throw new Error(
              response.data?.message ||
                "Erreur lors de la suppression de la demande de congé"
            );
          }

          return response;
        };

        // Utiliser la fonction de retry
        await retryApiCall(apiCall);

        setVacations((prev) => prev.filter((vacation) => vacation.id !== id));

        toast.success("Demande de congé supprimée avec succès");

        // Rafraîchir les données après suppression
        fetchVacations(true);

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
    [api, retryApiCall, fetchVacations]
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

          // Vérifier si la réponse est un objet avec une propriété ok
          if (
            response &&
            typeof response === "object" &&
            "ok" in response &&
            !response.ok
          ) {
            throw new Error(
              response.data?.message ||
                `Erreur lors de la ${
                  status === "approved" ? "validation" : "rejet"
                } de la demande de congé`
            );
          }

          return response;
        };

        // Utiliser la fonction de retry
        const data = await retryApiCall(apiCall);

        setVacations((prev) =>
          prev.map((vacation) => (vacation.id === id ? data : vacation))
        );

        toast.success(
          `Demande de congé ${
            status === "approved" ? "approuvée" : "rejetée"
          } avec succès`
        );

        // Rafraîchir les données après mise à jour du statut
        fetchVacations(true);

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
    [api, retryApiCall, fetchVacations]
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

  // Fonction pour forcer un rafraîchissement des données
  const refreshVacations = useCallback(() => {
    return fetchVacations(true);
  }, [fetchVacations]);

  return {
    vacations,
    loading,
    error,
    fetchVacations,
    refreshVacations,
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
