import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NotificationService } from "../services/api";
import { getSocket } from "../services/socket";
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

  // Référence pour éviter les appels en cascade
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const debounceTimerRef = useRef(null);

  // Récupérer les notifications depuis l'API
  const fetchNotifications = useCallback(
    async (options = {}) => {
      if (!user) return;

      // Protection contre les appels multiples rapprochés
      const now = Date.now();
      if (isFetchingRef.current) {
        console.log("Récupération des notifications déjà en cours, ignoré");
        return;
      }

      // Ne pas récupérer si moins de 2 secondes se sont écoulées depuis le dernier appel
      if (now - lastFetchTimeRef.current < 2000) {
        console.log("Dernière récupération trop récente, ignoré");
        return;
      }

      try {
        isFetchingRef.current = true;
        lastFetchTimeRef.current = now;
        setLoading(true);
        const { limit = 20, offset = 0, unreadOnly = false } = options;

        const response = await NotificationService.getNotifications({
          limit,
          offset,
          unreadOnly,
        });

        if (response.success) {
          // Ne mettre à jour que si les données ont changé
          const currentNotificationIds = new Set(
            notifications.map((n) => n.id)
          );
          const newNotificationIds = new Set(
            response.notifications.map((n) => n.id)
          );

          // Vérifier si les ensembles sont différents
          const hasChanges =
            currentNotificationIds.size !== newNotificationIds.size ||
            [...currentNotificationIds].some(
              (id) => !newNotificationIds.has(id)
            ) ||
            [...newNotificationIds].some(
              (id) => !currentNotificationIds.has(id)
            );

          if (hasChanges) {
            setNotifications(response.notifications);
            // Stocker dans localStorage pour rendre la restauration plus rapide
            localStorage.setItem(
              "lastNotifications",
              JSON.stringify(response.notifications)
            );
          }

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
        // Réinitialiser le flag après une durée de protection
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 3000);
      }
    },
    [user, notifications]
  );

  // Fonction debounced pour récupérer les notifications
  const debouncedFetchNotifications = useCallback(
    (options = {}) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchNotifications(options);
      }, 1000); // Attendre 1s avant de déclencher l'appel API
    },
    [fetchNotifications]
  );

  // Récupérer le nombre de notifications non lues
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    // Ne pas récupérer si moins de 5 secondes se sont écoulées depuis le dernier appel
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 5000) {
      return;
    }

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
        debouncedFetchNotifications();
        fetchUnreadCount();
      }
    },
    [
      user,
      isConnected,
      socket,
      sendMessage,
      debouncedFetchNotifications,
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
      debouncedFetchNotifications();
      fetchUnreadCount();
    }
  }, [
    user,
    isConnected,
    socket,
    sendMessage,
    debouncedFetchNotifications,
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
        debouncedFetchNotifications();
        fetchUnreadCount();
      }
    },
    [user, notifications, debouncedFetchNotifications, fetchUnreadCount]
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
      debouncedFetchNotifications();
      fetchUnreadCount();
    }
  }, [user, debouncedFetchNotifications, fetchUnreadCount]);

  // Créer une nouvelle notification
  const createNotification = useCallback(
    async (notificationData) => {
      if (!user) return { success: false, message: "Utilisateur non connecté" };

      try {
        return await NotificationService.createNotification(notificationData);
      } catch (error) {
        console.error("Erreur lors de la création de la notification:", error);
        return {
          success: false,
          message:
            error.message || "Erreur lors de la création de la notification",
        };
      }
    },
    [user]
  );

  // Créer et diffuser une notification à plusieurs utilisateurs
  const createBroadcastNotification = useCallback(
    async (notificationData) => {
      if (!user) return { success: false, message: "Utilisateur non connecté" };

      try {
        return await NotificationService.createBroadcastNotification(
          notificationData
        );
      } catch (error) {
        console.error("Erreur lors de la diffusion des notifications:", error);
        return {
          success: false,
          message:
            error.message || "Erreur lors de la diffusion des notifications",
        };
      }
    },
    [user]
  );

  // Gérer les messages WebSocket
  useEffect(() => {
    if (
      !isConnected ||
      !sendMessage ||
      !debouncedFetchNotifications ||
      !fetchUnreadCount
    )
      return;

    // Écouter les notifications depuis le socket
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notification) => {
      try {
        // S'assurer que le lien pointe vers la page activités
        if (notification) {
          notification.link = "/activities";
        }

        // Ajouter la nouvelle notification à la liste sans déclencher une requête complète
        setNotifications((prev) => {
          // Éviter les doublons
          const exists = prev.some((n) => n.id === notification.id);
          if (exists) return prev;
          return [notification, ...prev];
        });

        // Mettre à jour le compteur de notifications non lues
        if (!notification.read) {
          setUnreadCount((prev) => prev + 1);
        }

        // Afficher une notification système si le navigateur le permet
        if (Notification.permission === "granted") {
          const sysNotification = new Notification(notification.title, {
            body: notification.message,
            icon: "/logo192.png",
          });

          // Rediriger vers la page d'activités si l'utilisateur clique sur la notification
          sysNotification.onclick = () => {
            window.focus();
            window.location.href = "/activities";
          };
        }
      } catch (error) {
        console.error("Erreur lors du traitement de la notification:", error);
      }
    };

    const handleActivityLogged = () => {
      // Rafraîchir les notifications lorsqu'une activité est enregistrée
      // mais avec un debounce pour éviter les requêtes multiples
      debouncedFetchNotifications();
    };

    // Attacher les écouteurs d'événements
    socket.on("notification:new", handleNewNotification);
    socket.on("activity:logged", handleActivityLogged);

    // Nettoyer les écouteurs d'événements
    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("activity:logged", handleActivityLogged);
    };
  }, [isConnected, sendMessage, debouncedFetchNotifications, fetchUnreadCount]);

  // Récupérer les notifications du localStorage au premier chargement
  useEffect(() => {
    const savedNotifications = localStorage.getItem("lastNotifications");
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
          const unreadCount = parsed.filter((n) => !n.read).length;
          setUnreadCount(unreadCount);
          setLoading(false);
        }
      } catch (e) {
        console.error(
          "Erreur lors du chargement des notifications sauvegardées:",
          e
        );
      }
    }
  }, []);

  // Récupérer les notifications au chargement (une seule fois)
  useEffect(() => {
    if (user && !isFetchingRef.current) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications: debouncedFetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
    createBroadcastNotification,
    setNotifications,
  };
};

export default useNotifications;
