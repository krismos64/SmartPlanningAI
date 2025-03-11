import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NotificationService } from "../services/api";
import useWebSocket from "./useWebSocket";

/**
 * Hook personnalisé pour gérer les notifications en temps réel
 * @returns {Object} - Objet contenant les notifications et les fonctions pour les gérer
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { socket, isConnected, sendMessage } = useWebSocket();

  // Récupérer les notifications depuis l'API
  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!user) return;

      try {
        setLoading(true);
        const { limit = 20, offset = 0, unreadOnly = false } = options;

        const response = await NotificationService.getNotifications({
          limit,
          offset,
          unreadOnly,
        });

        if (response.success) {
          setNotifications(response.notifications);

          // Mettre à jour le compteur de notifications non lues
          const unreadNotifications = response.notifications.filter(
            (n) => !n.read
          );
          setUnreadCount(unreadNotifications.length);
        } else {
          setError(
            response.message ||
              "Erreur lors de la récupération des notifications"
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications:",
          error
        );
        setError(
          error.message || "Erreur lors de la récupération des notifications"
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Récupérer le nombre de notifications non lues
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await NotificationService.getUnreadCount();

      if (response.success) {
        setUnreadCount(response.count);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du nombre de notifications non lues:",
        error
      );
    }
  }, [user]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user) return;

      try {
        // Mettre à jour l'état local immédiatement pour une meilleure UX
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );

        // Mettre à jour le compteur de notifications non lues
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Si le WebSocket est connecté, utiliser le WebSocket
        if (isConnected && socket) {
          sendMessage({
            type: "MARK_NOTIFICATION_READ",
            notificationId,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Sinon, utiliser l'API REST
          await NotificationService.markAsRead(notificationId);
        }
      } catch (error) {
        console.error(
          "Erreur lors du marquage de la notification comme lue:",
          error
        );

        // Annuler les changements locaux en cas d'erreur
        fetchNotifications();
        fetchUnreadCount();
      }
    },
    [
      user,
      isConnected,
      socket,
      sendMessage,
      fetchNotifications,
      fetchUnreadCount,
    ]
  );

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);

      // Si le WebSocket est connecté, utiliser le WebSocket
      if (isConnected && socket) {
        sendMessage({
          type: "MARK_ALL_NOTIFICATIONS_READ",
          timestamp: new Date().toISOString(),
        });
      } else {
        // Sinon, utiliser l'API REST
        await NotificationService.markAllAsRead();
      }
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications comme lues:",
        error
      );

      // Annuler les changements locaux en cas d'erreur
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [
    user,
    isConnected,
    socket,
    sendMessage,
    fetchNotifications,
    fetchUnreadCount,
  ]);

  // Supprimer une notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!user) return;

      try {
        // Mettre à jour l'état local immédiatement pour une meilleure UX
        const notificationToDelete = notifications.find(
          (n) => n.id === notificationId
        );
        const wasUnread = notificationToDelete && !notificationToDelete.read;

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        // Utiliser l'API REST pour supprimer la notification
        await NotificationService.deleteNotification(notificationId);
      } catch (error) {
        console.error(
          "Erreur lors de la suppression de la notification:",
          error
        );

        // Annuler les changements locaux en cas d'erreur
        fetchNotifications();
        fetchUnreadCount();
      }
    },
    [user, notifications, fetchNotifications, fetchUnreadCount]
  );

  // Supprimer toutes les notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setNotifications([]);
      setUnreadCount(0);

      // Utiliser l'API REST pour supprimer toutes les notifications
      await NotificationService.deleteAllNotifications();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de toutes les notifications:",
        error
      );

      // Annuler les changements locaux en cas d'erreur
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Gérer les messages WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleWebSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_NOTIFICATION" && data.notification) {
          // Ajouter la nouvelle notification à la liste
          setNotifications((prev) => [data.notification, ...prev]);

          // Mettre à jour le compteur de notifications non lues
          if (!data.notification.read) {
            setUnreadCount((prev) => prev + 1);
          }

          // Afficher une notification système si le navigateur le permet
          if (Notification.permission === "granted") {
            const notification = new Notification(data.notification.title, {
              body: data.notification.message,
              icon: "/logo192.png",
            });

            // Rediriger vers le lien de la notification si l'utilisateur clique dessus
            notification.onclick = () => {
              window.focus();
              if (data.notification.link) {
                window.location.href = data.notification.link;
              }
              markAsRead(data.notification.id);
            };
          }
        } else if (
          data.type === "NOTIFICATIONS" &&
          Array.isArray(data.notifications)
        ) {
          // Mettre à jour la liste des notifications
          setNotifications(data.notifications);

          // Mettre à jour le compteur de notifications non lues
          const unreadNotifications = data.notifications.filter((n) => !n.read);
          setUnreadCount(unreadNotifications.length);
        } else if (
          data.type === "NOTIFICATION_MARKED_READ" &&
          data.notificationId
        ) {
          // Mettre à jour la notification marquée comme lue
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === data.notificationId ? { ...n, read: true } : n
            )
          );

          // Mettre à jour le compteur de notifications non lues
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } else if (data.type === "ALL_NOTIFICATIONS_MARKED_READ") {
          // Mettre à jour toutes les notifications comme lues
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadCount(0);
        }
      } catch (error) {
        console.error("Erreur lors du traitement du message WebSocket:", error);
      }
    };

    // Ajouter l'écouteur d'événements
    socket.addEventListener("message", handleWebSocketMessage);

    // Demander les notifications non lues au serveur
    sendMessage({
      type: "REQUEST_NOTIFICATIONS",
      unreadOnly: true,
      timestamp: new Date().toISOString(),
    });

    // Nettoyer l'écouteur d'événements
    return () => {
      socket.removeEventListener("message", handleWebSocketMessage);
    };
  }, [socket, isConnected, sendMessage, markAsRead]);

  // Demander la permission pour les notifications système
  useEffect(() => {
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Récupérer les notifications au chargement
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};

export default useNotifications;
