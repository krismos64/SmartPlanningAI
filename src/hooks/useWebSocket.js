import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook pour gérer les connexions WebSocket
 * @returns {Object} État et méthodes liés au WebSocket
 */
const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fallbackMode, setFallbackMode] = useState(false);
  const { user } = useAuth();

  // Note: Cette version est une simulation simplifiée pour le développement
  // Dans votre version réelle, vous devrez connecter à un vrai serveur WebSocket
  const connectWebSocket = useCallback(() => {
    console.log(
      "useWebSocket: Connexion WebSocket désactivée pour améliorer les performances"
    );
    setFallbackMode(true);
    return null;
  }, []);

  // Demander une mise à jour des activités
  const requestActivitiesUpdate = useCallback(() => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "REQUEST_ACTIVITIES_UPDATE",
        })
      );
    } else {
      console.log(
        "WebSocket non connecté, impossible de demander une mise à jour des activités"
      );
    }
  }, [socket]);

  // Filtrer les activités pour n'afficher que celles liées à l'utilisateur connecté
  const filterActivitiesByUser = useCallback(
    (activitiesList) => {
      if (!user || !user.id) return [];

      return activitiesList.filter((activity) => {
        // Si l'activité a un user_id, vérifier qu'il correspond à l'utilisateur connecté
        if (activity.user_id) {
          return activity.user_id.toString() === user.id.toString();
        }

        // Si l'activité a des détails avec created_by_id ou deleted_by_id, vérifier la correspondance
        if (activity.details) {
          const details =
            typeof activity.details === "string"
              ? JSON.parse(activity.details)
              : activity.details;

          if (details.created_by_id) {
            return details.created_by_id.toString() === user.id.toString();
          }

          if (details.deleted_by_id) {
            return details.deleted_by_id.toString() === user.id.toString();
          }
        }

        // Par défaut, ne pas inclure les activités sans attribution claire
        return false;
      });
    },
    [user]
  );

  // Gérer les événements WebSocket
  const handleWebSocketMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "ACTIVITIES_UPDATE":
            if (data.activities && Array.isArray(data.activities)) {
              // Filtrer les activités pour n'afficher que celles de l'utilisateur connecté
              const filteredActivities = filterActivitiesByUser(
                data.activities
              );
              setActivities(filteredActivities);
            }
            break;
          case "NEW_ACTIVITY":
            if (data.activity) {
              // Vérifier si l'activité est liée à l'utilisateur connecté
              const isUserActivity =
                filterActivitiesByUser([data.activity]).length > 0;

              if (isUserActivity) {
                setActivities((prevActivities) => [
                  data.activity,
                  ...prevActivities,
                ]);
              }
            }
            break;
          case "NEW_NOTIFICATION":
            if (data.notification) {
              setNotifications((prevNotifications) => [
                data.notification,
                ...prevNotifications,
              ]);
            }
            break;
          default:
            console.log("Type de message WebSocket inconnu:", data.type);
        }
      } catch (error) {
        console.error("Erreur lors du traitement du message WebSocket:", error);
      }
    },
    [filterActivitiesByUser]
  );

  // Connecter au WebSocket au montage du composant
  useEffect(() => {
    const newSocket = connectWebSocket();
    if (newSocket) {
      newSocket.addEventListener("message", handleWebSocketMessage);
      setSocket(newSocket);

      return () => {
        newSocket.removeEventListener("message", handleWebSocketMessage);
        newSocket.close();
      };
    }
  }, [connectWebSocket, handleWebSocketMessage]);

  return {
    socket,
    activities,
    notifications,
    requestActivitiesUpdate,
    fallbackMode,
  };
};

export default useWebSocket;
