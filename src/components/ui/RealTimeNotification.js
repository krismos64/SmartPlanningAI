import { createContext, useContext, useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

// Contexte pour les notifications
const RealTimeNotificationContext = createContext({
  notifications: [],
  addNotification: () => {},
  markAsRead: () => {},
  clearAll: () => {},
});

// Animation d'entrée
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Conteneur des notifications
const NotificationsContainer = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  width: 320px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Notification individuelle
const NotificationItem = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-left: 4px solid
    ${({ theme, type }) =>
      type === "success"
        ? theme.colors.success
        : type === "warning"
        ? theme.colors.warning
        : type === "error"
        ? theme.colors.error
        : theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 12px 16px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${slideIn} 0.3s ease-out;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
`;

const NotificationTime = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const NotificationMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const NotificationBadge = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Formater la date
const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;

  return date.toLocaleDateString();
};

// Provider pour les notifications
export const RealTimeNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  // Simuler des notifications périodiques (à remplacer par une vraie API)
  useEffect(() => {
    if (!user) return;

    const types = ["info", "success", "warning", "error"];
    const messages = [
      {
        title: "Nouvelle demande de congés",
        message: "Un employé a soumis une nouvelle demande de congés.",
      },
      {
        title: "Mise à jour du planning",
        message: "Le planning a été mis à jour pour la semaine prochaine.",
      },
      {
        title: "Nouvel employé",
        message: "Un nouvel employé a été ajouté à l'équipe.",
      },
      { title: "Rappel de réunion", message: "Réunion d'équipe demain à 10h." },
    ];

    const interval = setInterval(() => {
      // 10% de chance d'avoir une notification
      if (Math.random() < 0.1) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomMessage =
          messages[Math.floor(Math.random() * messages.length)];

        addNotification({
          id: Date.now(),
          type: randomType,
          title: randomMessage.title,
          message: randomMessage.message,
          timestamp: new Date(),
          read: false,
        });
      }
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [user]);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
  };

  return (
    <RealTimeNotificationContext.Provider value={value}>
      {children}
      <NotificationsContainer>
        {notifications.slice(0, 5).map((notification) => (
          <NotificationItem
            key={notification.id}
            type={notification.type}
            onClick={() => markAsRead(notification.id)}
          >
            <NotificationHeader>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <NotificationTime>
                {formatTime(notification.timestamp)}
              </NotificationTime>
            </NotificationHeader>
            <NotificationMessage>{notification.message}</NotificationMessage>
          </NotificationItem>
        ))}
      </NotificationsContainer>
    </RealTimeNotificationContext.Provider>
  );
};

// Hook pour utiliser les notifications
export const useRealTimeNotifications = () => {
  const context = useContext(RealTimeNotificationContext);
  if (!context) {
    throw new Error(
      "useRealTimeNotifications doit être utilisé à l'intérieur d'un RealTimeNotificationProvider"
    );
  }
  return context;
};

// Composant de badge pour afficher le nombre de notifications non lues
export const NotificationBell = ({ onClick }) => {
  const { notifications } = useRealTimeNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationBadge onClick={onClick}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
          fill="currentColor"
        />
      </svg>
      {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
    </NotificationBadge>
  );
};

export default RealTimeNotificationProvider;
