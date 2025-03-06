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
        const response = await api.get(API_ENDPOINTS.ACTIVITIES.BASE);

        // Vérifier si la réponse est un tableau ou contient des données valides
        if (response && (Array.isArray(response) || response.data)) {
          // S'assurer que les données sont un tableau
          const activitiesData = Array.isArray(response)
            ? response
            : Array.isArray(response.data)
            ? response.data
            : [];

          setActivities(activitiesData);
          setError(null);
        } else {
          throw new Error(
            "Erreur lors du chargement des activités: format de réponse invalide"
          );
        }
      } catch (err) {
        console.error("Erreur lors du chargement des activités:", err);
        setError("Erreur lors du chargement des activités");
        toast.error("Erreur lors du chargement des activités");
        // En cas d'erreur, s'assurer que activities reste un tableau vide
        setActivities([]);
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const createActivity = useCallback(
    async (activityData) => {
      try {
        const response = await api.post(
          API_ENDPOINTS.ACTIVITIES.BASE,
          activityData
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
    [api]
  );

  const updateActivity = useCallback(
    async (id, activityData) => {
      try {
        const response = await api.put(
          `${API_ENDPOINTS.ACTIVITIES.BASE}/${id}`,
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
        const response = await api.delete(
          `${API_ENDPOINTS.ACTIVITIES.BASE}/${id}`
        );

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
   * Formate la description d'une activité
   * @param {Object} activity - L'activité à formater
   * @returns {string} - La description formatée
   */
  const formatActivityDescription = useCallback((activity) => {
    if (!activity) return "";

    const { type, entityType, entityId, userId, details } = activity;

    // Obtenir le nom de l'utilisateur qui a effectué l'action
    const userName = activity.userName || "Un utilisateur";

    // Formater le type d'entité
    const entityName =
      {
        employee: "un employé",
        schedule: "un planning",
        vacation: "une demande de congé",
        shift: "un horaire",
        user: "un utilisateur",
      }[entityType] || entityType;

    // Formater le type d'action
    const actionType =
      {
        create: "a créé",
        update: "a modifié",
        delete: "a supprimé",
        approve: "a approuvé",
        reject: "a rejeté",
      }[type] || type;

    // Construire la description
    let description = `${userName} ${actionType} ${entityName}`;

    // Ajouter des détails si disponibles
    if (details) {
      if (typeof details === "string") {
        description += ` : ${details}`;
      } else if (typeof details === "object") {
        const detailsStr = Object.entries(details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
        description += ` : ${detailsStr}`;
      }
    }

    return description;
  }, []);

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
  };
};

export default useActivities;
