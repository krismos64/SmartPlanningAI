import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiCheck, FiEdit, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../contexts/AuthContext";
import useApi from "./useApi";
import useWebSocket from "./useWebSocket";

/**
 * Hook personnalisé pour gérer les activités
 */
const useActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = useApi();
  const { user } = useAuth();

  // Utiliser le hook WebSocket pour recevoir les mises à jour en temps réel
  const {
    activities: wsActivities,
    socket,
    requestActivitiesUpdate,
    fallbackMode,
  } = useWebSocket();

  /**
   * Récupère toutes les activités
   * @param {boolean} refresh - Indique si on doit forcer le rafraîchissement des données
   */
  const fetchActivities = useCallback(
    async (refresh = false) => {
      try {
        setLoading(true);

        // Vérifier si l'utilisateur est connecté
        if (!user || !user.id) {
          console.warn(
            "Aucun utilisateur connecté, impossible de récupérer les activités personnelles"
          );
          setActivities([]);
          setError("Vous devez être connecté pour voir vos activités");
          setLoading(false);
          return;
        }

        // Utiliser l'endpoint BY_USER pour récupérer uniquement les activités de l'utilisateur actuel
        const response = await api.get(
          API_ENDPOINTS.ACTIVITIES.BY_USER(user.id)
        );

        console.log("Réponse des activités:", response);

        // Vérifier si la réponse est au format attendu (success, message, data)
        if (response && response.success === true && response.data) {
          // S'assurer que les activités sont bien un tableau
          const activitiesData = Array.isArray(response.data.activities)
            ? response.data.activities
            : [];

          console.log("Activités récupérées et formatées:", activitiesData);
          setActivities(activitiesData);
          setError(null);
        }
        // Compatibilité avec l'ancien format de réponse (tableau direct)
        else if (response && Array.isArray(response)) {
          console.log(
            "Format de réponse ancien (tableau):",
            response.length,
            "activités"
          );
          setActivities(response);
          setError(null);
        }
        // Si le format est différent mais contient des données sous forme d'array
        else if (response && Array.isArray(response.data)) {
          console.log(
            "Format de réponse différent avec données en tableau:",
            response.data.length,
            "activités"
          );
          setActivities(response.data);
          setError(null);
        } else {
          console.error("Format de réponse invalide:", response);
          throw new Error(
            "Erreur lors du chargement des activités: format de réponse invalide"
          );
        }
      } catch (err) {
        console.error("Erreur lors du chargement des activités:", err);
        setError(
          "Erreur lors du chargement des activités: " +
            (err.message || "Erreur inconnue")
        );
        toast.error("Erreur lors du chargement des activités");
        // En cas d'erreur, s'assurer que activities reste un tableau vide
        setActivities([]);
      } finally {
        setLoading(false);
      }
    },
    [api, user]
  );

  const createActivity = useCallback(
    async (activityData) => {
      try {
        // Ajouter l'ID de l'utilisateur actuel aux données de l'activité
        const activityWithUserId = {
          ...activityData,
          user_id: user?.id,
        };

        const response = await api.post(
          API_ENDPOINTS.ACTIVITIES.CREATE,
          activityWithUserId
        );

        if (response.ok) {
          setActivities((prev) => [...prev, response.data]);
          toast.success("Activité créée avec succès");
          return { success: true, activity: response.data };
        } else {
          throw new Error(
            response.data?.message || "Erreur lors de la création de l'activité"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la création de l'activité:", err);
        toast.error("Erreur lors de la création de l'activité");
        return { success: false, error: err.message };
      }
    },
    [api, user]
  );

  const updateActivity = useCallback(
    async (id, activityData) => {
      try {
        const response = await api.put(
          API_ENDPOINTS.ACTIVITIES.UPDATE(id),
          activityData
        );

        if (response.ok) {
          setActivities((prev) =>
            prev.map((activity) =>
              activity.id === id ? { ...activity, ...response.data } : activity
            )
          );
          toast.success("Activité mise à jour avec succès");
          return { success: true, activity: response.data };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la mise à jour de l'activité"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la mise à jour de l'activité:", err);
        toast.error("Erreur lors de la mise à jour de l'activité");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  const deleteActivity = useCallback(
    async (id) => {
      try {
        const response = await api.delete(API_ENDPOINTS.ACTIVITIES.DELETE(id));

        if (response.ok) {
          setActivities((prev) =>
            prev.filter((activity) => activity.id !== id)
          );
          toast.success("Activité supprimée avec succès");
          return { success: true };
        } else {
          throw new Error(
            response.data?.message ||
              "Erreur lors de la suppression de l'activité"
          );
        }
      } catch (err) {
        console.error("Erreur lors de la suppression de l'activité:", err);
        toast.error("Erreur lors de la suppression de l'activité");
        return { success: false, error: err.message };
      }
    },
    [api]
  );

  /**
   * Traduit le type de congé en français
   * @param {string} type - Le type de congé en anglais
   * @returns {string} - Le type de congé en français
   */
  const translateVacationType = useCallback((type) => {
    switch (type) {
      case "paid":
        return "payé";
      case "unpaid":
        return "non payé";
      case "sick":
        return "maladie";
      case "other":
        return "autre";
      default:
        return type || "non spécifié";
    }
  }, []);

  /**
   * Traduit le statut de congé en français
   * @param {string} status - Le statut de congé en anglais
   * @returns {string} - Le statut de congé en français
   */
  const translateVacationStatus = useCallback((status) => {
    switch (status) {
      case "approved":
        return "approuvé";
      case "rejected":
        return "rejeté";
      case "pending":
        return "en attente";
      default:
        return status || "non spécifié";
    }
  }, []);

  /**
   * Formate les dates de début et de fin d'un congé
   * @param {string} startDate - La date de début
   * @param {string} endDate - La date de fin
   * @returns {string} - Les dates formatées
   */
  const formatVacationDates = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Formater les dates
    const startFormatted = start.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const endFormatted = end.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `du ${startFormatted} au ${endFormatted}`;
  }, []);

  /**
   * Formate la description d'une activité
   * @param {Object} activity - L'activité à formater
   * @returns {string} - La description formatée
   */
  const formatActivityDescription = useCallback(
    (activity) => {
      if (!activity) return "";

      // Si l'activité a une description, l'utiliser directement
      if (activity.description) {
        return activity.description;
      }

      const { type, entity_type, entity_id, user_id, details, user } = activity;

      // Obtenir le nom de l'utilisateur qui a effectué l'action
      const userName = user && user.name ? user.name : "Un utilisateur";

      // Formater le type d'entité
      const entityName =
        {
          employee: "un employé",
          schedule: "un planning",
          vacation: "une demande de congé",
          shift: "un horaire",
          user: "un utilisateur",
        }[entity_type] || entity_type;

      // Formater le type d'action
      const actionType =
        {
          create: "a créé",
          update: "a modifié",
          delete: "a supprimé",
          approve: "a approuvé",
          reject: "a rejeté",
          vacation_status_update: "a mis à jour le statut de",
        }[type] || type;

      // Construire la description
      let description = `${userName} ${actionType} ${entityName}`;

      // Ajouter des détails si disponibles
      if (details) {
        let parsedDetails;
        try {
          parsedDetails =
            typeof details === "string" ? JSON.parse(details) : details;
        } catch (e) {
          parsedDetails = details;
        }

        // Cas spécial pour les employés
        if (entity_type === "employee") {
          // Pour la création d'employé
          if (type === "create" && parsedDetails.employee_name) {
            // Si on a le créateur de l'employé et l'employé créé
            if (parsedDetails.created_by && parsedDetails.employee_name) {
              return `${parsedDetails.created_by} a créé un nouvel employé : ${parsedDetails.employee_name}`;
            }
            // Fallback sur le format standard avec le nom de l'employé
            return `${userName} a créé un nouvel employé : ${parsedDetails.employee_name}`;
          }

          // Pour la suppression d'employé
          if (type === "delete" && parsedDetails.employee_name) {
            // Si on a l'auteur de la suppression et l'employé supprimé
            if (parsedDetails.deleted_by && parsedDetails.employee_name) {
              return `${parsedDetails.deleted_by} a supprimé l'employé : ${parsedDetails.employee_name}`;
            }
            // Fallback sur le format standard avec le nom de l'employé
            return `${userName} a supprimé l'employé : ${parsedDetails.employee_name}`;
          }

          // Pour les modifications de solde d'heures
          if (
            parsedDetails.action &&
            (parsedDetails.action === "Ajout d'heures" ||
              parsedDetails.action === "Soustraction d'heures")
          ) {
            const employeeName =
              parsedDetails.employeeName || `Employé #${entity_id}`;
            const hours = parsedDetails.hours || "?";
            const action =
              parsedDetails.action === "Ajout d'heures"
                ? "ajouté"
                : "soustrait";

            return `${userName} a ${action} ${hours}h au solde d'heures de ${employeeName}`;
          }
        }

        // Cas spécial pour les demandes de congés
        if (entity_type === "vacation") {
          // Pour la création de congés
          if (
            type === "create" &&
            parsedDetails.employee_name &&
            parsedDetails.start_date &&
            parsedDetails.end_date
          ) {
            const employeeName = parsedDetails.employee_name;
            const dateRange = formatVacationDates(
              parsedDetails.start_date,
              parsedDetails.end_date
            );
            const creator = parsedDetails.created_by || userName;

            // Clarification pour éviter toute ambiguïté
            if (creator === employeeName) {
              return `${employeeName} a créé une demande de congés ${dateRange}`;
            } else {
              return `${creator} a créé une demande de congés pour ${employeeName} ${dateRange}`;
            }
          }

          // Pour la mise à jour du statut des congés
          if (type === "vacation_status_update" && parsedDetails.new_status) {
            const newStatus = parsedDetails.new_status;
            const employeeName =
              parsedDetails.employee_name ||
              `Employé #${parsedDetails.employee_id || entity_id}`;
            const approverName = parsedDetails.approver_name || userName;
            const dateRange =
              parsedDetails.start_date && parsedDetails.end_date
                ? ` du ${new Date(parsedDetails.start_date).toLocaleDateString(
                    "fr-FR"
                  )} au ${new Date(parsedDetails.end_date).toLocaleDateString(
                    "fr-FR"
                  )}`
                : "";

            // Vérifier s'il s'agit d'un passage d'un statut à un autre (et non d'une création)
            const hasPreviousStatus =
              parsedDetails.previous_status &&
              parsedDetails.previous_status !== "";

            if (newStatus === "pending" && hasPreviousStatus) {
              // Uniquement pour les vraies remises en attente (pas pour les créations)
              return `La demande de congés de ${employeeName}${dateRange} a été remise en attente par ${approverName}`;
            } else if (newStatus === "approved") {
              return `Demande de congés de ${employeeName}${dateRange} approuvée par ${approverName}`;
            } else if (newStatus === "rejected") {
              return `Demande de congés de ${employeeName}${dateRange} rejetée par ${approverName}`;
            } else {
              // Cas par défaut
              let statusText = translateVacationStatus(newStatus);
              return `Demande de congés de ${employeeName}${dateRange} - statut: ${statusText}`;
            }
          }

          // Pour la mise à jour générale des congés
          if (type === "update") {
            const employeeName =
              parsedDetails.employee_name ||
              `Employé #${parsedDetails.employee_id || entity_id}`;
            const dateRange =
              parsedDetails.start_date && parsedDetails.end_date
                ? formatVacationDates(
                    parsedDetails.start_date,
                    parsedDetails.end_date
                  )
                : "";
            const typeConge = parsedDetails.vacation_type
              ? translateVacationType(parsedDetails.vacation_type)
              : "";

            return `${userName} a modifié la demande de congé${
              typeConge ? " " + typeConge : ""
            } de ${employeeName}${dateRange ? " " + dateRange : ""}`;
          }

          // Pour la suppression des congés
          if (type === "delete") {
            const employeeName =
              parsedDetails.employee_name ||
              `Employé #${parsedDetails.employee_id || entity_id}`;
            const dateRange =
              parsedDetails.start_date && parsedDetails.end_date
                ? formatVacationDates(
                    parsedDetails.start_date,
                    parsedDetails.end_date
                  )
                : "";
            const typeConge = parsedDetails.vacation_type
              ? translateVacationType(parsedDetails.vacation_type)
              : "";

            return `${userName} a supprimé la demande de congé${
              typeConge ? " " + typeConge : ""
            } de ${employeeName}${dateRange ? " " + dateRange : ""}`;
          }
        }

        if (typeof parsedDetails === "string") {
          description += ` : ${parsedDetails}`;
        } else if (typeof parsedDetails === "object") {
          // Ne pas ajouter les détails sous forme d'objet pour éviter [object Object]
          if (parsedDetails.employeeName && entity_type === "employee") {
            description += ` : ${parsedDetails.employeeName}`;
          }
        }
      }

      return description;
    },
    [formatVacationDates, translateVacationType, translateVacationStatus]
  );

  /**
   * Formate la date d'une activité
   * @param {string} timestamp - Le timestamp à formater
   * @returns {string} - La date formatée
   */
  const formatActivityDate = useCallback((timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    // Formater la date en fonction de son ancienneté
    if (diffSec < 60) {
      return "à l'instant";
    } else if (diffMin < 60) {
      return `il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
    } else if (diffHour < 24) {
      return `il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`;
    } else if (diffDay < 7) {
      return `il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }, []);

  /**
   * Obtient l'icône en fonction du type d'activité
   * @param {string} type - Le type d'activité
   * @returns {JSX.Element} - L'icône correspondante
   */
  const getActivityIcon = useCallback((type) => {
    switch (type) {
      case "create":
        return <FiPlus />;
      case "update":
        return <FiEdit />;
      case "delete":
        return <FiTrash2 />;
      case "approve":
        return <FiCheck />;
      case "reject":
        return <FiX />;
      default:
        return null;
    }
  }, []);

  // Mettre à jour les activités lorsque de nouvelles activités sont reçues via WebSocket
  useEffect(() => {
    if (
      wsActivities &&
      Array.isArray(wsActivities) &&
      wsActivities.length > 0
    ) {
      console.log("Nouvelles activités reçues via WebSocket:", wsActivities);

      setActivities((prevActivities) => {
        // S'assurer que prevActivities est un tableau
        const prevActivitiesArray = Array.isArray(prevActivities)
          ? prevActivities
          : [];

        // Créer un nouvel ensemble d'activités en combinant les anciennes et les nouvelles
        const newActivitiesMap = new Map();

        // Ajouter d'abord les nouvelles activités
        wsActivities.forEach((activity) => {
          newActivitiesMap.set(activity.id, activity);
        });

        // Ajouter les anciennes activités qui ne sont pas dans les nouvelles
        prevActivitiesArray.forEach((activity) => {
          if (!newActivitiesMap.has(activity.id)) {
            newActivitiesMap.set(activity.id, activity);
          }
        });

        // Convertir la Map en tableau et trier par date (plus récent en premier)
        return Array.from(newActivitiesMap.values()).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
      });

      // Indiquer que le chargement est terminé
      setLoading(false);
    }
  }, [wsActivities]);

  // Charger les activités au montage du composant
  useEffect(() => {
    fetchActivities(); // Forcer le rafraîchissement initial

    // Mettre à jour les activités toutes les 2 minutes
    const interval = setInterval(() => {
      fetchActivities(); // Forcer le rafraîchissement
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchActivities]);

  // Écouter les changements de connexion WebSocket
  useEffect(() => {
    if (socket && !fallbackMode) {
      console.log("WebSocket connecté, on va rafraîchir les activités");
      requestActivitiesUpdate();
    } else if (fallbackMode) {
      console.log("Mode de secours WebSocket actif, utilisation de l'API REST");
      fetchActivities();
    }
  }, [socket, requestActivitiesUpdate, fallbackMode, fetchActivities]);

  // Écouter les changements de mode de secours
  useEffect(() => {
    if (fallbackMode) {
      console.log(
        "Passage en mode de secours, récupération des activités via API REST"
      );
      fetchActivities();
    }
  }, [fallbackMode, fetchActivities]);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    getActivityIcon,
    formatActivityDescription,
    formatActivityDate,
    formatVacationDates,
    translateVacationType,
    translateVacationStatus,
  };
};

export default useActivities;
