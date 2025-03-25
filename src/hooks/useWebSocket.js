import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getSocket,
  initializeSocket,
  reinitializeSocket,
} from "../services/socket";

/**
 * Hook pour gérer les connexions WebSocket
 * @returns {Object} État et méthodes liés au WebSocket
 */
const useWebSocket = () => {
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user, getToken } = useAuth();
  const socketInitializedRef = useRef(false);

  // Initialiser la connexion WebSocket seulement si l'utilisateur est connecté
  useEffect(() => {
    const setupSocket = async () => {
      // Vérifier si l'utilisateur est authentifié et a un ID valide
      if (user && user.id && !socketInitializedRef.current) {
        try {
          // Obtenir le token le plus récent
          const token = await getToken();

          if (!token) {
            console.error(
              "Token non disponible pour l'initialisation du WebSocket"
            );
            return;
          }

          console.log("Initialisation du WebSocket avec token valide...");

          // Obtenir la socket existante ou en créer une nouvelle avec le token valide
          let socket = getSocket();

          if (!socket) {
            socket = initializeSocket(token);
          } else if (!socket.connected) {
            // Réinitialiser la socket avec le nouveau token si elle existe mais n'est pas connectée
            socket = reinitializeSocket(token);
          }

          if (socket) {
            socketInitializedRef.current = true;
            setIsConnected(socket.connected);

            // Si la socket n'est pas encore connectée, la connecter explicitement
            if (!socket.connected) {
              socket.connect();
            }
          }
        } catch (error) {
          console.error("Erreur lors de l'initialisation du WebSocket:", error);
        }
      }
    };

    setupSocket();

    // Nettoyage - ne pas déconnecter ici car d'autres composants peuvent utiliser la connexion
    return () => {
      // Ne rien faire, la déconnexion est gérée au niveau du service
    };
  }, [user, getToken]);

  // Fonction pour envoyer une notification de changement de données
  const notifyDataChange = useCallback(
    (type, action, entityId = null) => {
      try {
        const socket = getSocket();

        // Vérifier que la socket existe et est connectée
        if (!socket || !socket.connected) {
          console.error(
            "WebSocket non connecté - impossible d'envoyer la notification"
          );
          return;
        }

        const eventData = {
          type,
          action,
          entityId,
          userId: user?.id,
          timestamp: new Date().toISOString(),
        };

        console.log("Envoi d'une notification de changement:", eventData);
        socket.emit("dataChange", eventData);
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification:", error);
      }
    },
    [user]
  );

  // Fonction pour filtrer les activités par utilisateur
  const filterActivitiesByUser = useCallback((allActivities, userId) => {
    if (!userId || !Array.isArray(allActivities)) return [];

    // Convertir userId en nombre si c'est une chaîne
    const numericUserId =
      typeof userId === "string" ? parseInt(userId, 10) : userId;

    return allActivities.filter((activity) => {
      // Vérifier si l'activité est liée à l'utilisateur courant
      return (
        activity.userId === numericUserId ||
        activity.targetUserId === numericUserId ||
        activity.isPublic === true
      );
    });
  }, []);

  // Gestion des notifications
  const handleNotification = useCallback((notification) => {
    if (!notification) return;

    setNotifications((prev) => {
      // Éviter les doublons
      const exists = prev.some((n) => n.id === notification.id);
      if (exists) return prev;

      // Ajouter la nouvelle notification au début
      return [notification, ...prev].slice(0, 100); // Limiter à 100 notifications max
    });
  }, []);

  // Gestion des mises à jour d'activités
  const handleActivityUpdate = useCallback(
    (activity) => {
      if (!activity || !user) return;

      setActivities((prev) => {
        // Filtrer les activités pour cet utilisateur
        const filteredActivities = filterActivitiesByUser([activity], user.id);
        if (filteredActivities.length === 0) return prev;

        // Vérifier si l'activité existe déjà
        const activityExists = prev.some((a) => a.id === activity.id);

        if (activityExists) {
          // Mettre à jour l'activité existante
          return prev.map((a) => (a.id === activity.id ? activity : a));
        } else {
          // Ajouter la nouvelle activité au début
          return [activity, ...prev].slice(0, 100); // Limiter à 100 activités max
        }
      });
    },
    [user, filterActivitiesByUser]
  );

  // Fonction pour se déconnecter proprement du WebSocket
  const disconnect = useCallback(() => {
    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("Déconnexion du WebSocket...");
        socket.disconnect();
      }
      socketInitializedRef.current = false;
      setIsConnected(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion du WebSocket:", error);
    }
  }, []);

  return {
    isConnected,
    activities,
    notifications,
    notifyDataChange,
    handleNotification,
    handleActivityUpdate,
    disconnect,
  };
};

export default useWebSocket;
