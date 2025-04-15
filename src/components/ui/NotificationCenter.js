import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiInfo,
  FiTrash2,
  FiXCircle,
} from "react-icons/fi";
import styled, { css, keyframes } from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import useNotifications from "../../hooks/useNotifications";
import { getSocket } from "../../services/socket";
import { useToast } from "./useToast";

// Animations
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

// Suppression des composants non utilisés (commentaires pour documenter ce qui a été supprimé)
// NotificationBellContainer, BellIcon et NotificationBadge ne sont plus utilisés
// depuis que nous utilisons le DropdownMenu

const NotificationPanelContainer = styled(motion.div)`
  position: absolute;
  top: 60px;
  right: 20px;
  width: 380px;
  max-height: 500px;
  background-color: ${({ theme }) => theme.colors.surface || "#fff"};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text?.primary || "#333"};
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors.primary || "#3b82f6"};
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

const NotificationItem = styled(motion.div)`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  gap: 1rem;
  position: relative;

  ${({ $read }) =>
    !$read &&
    css`
      background-color: rgba(59, 130, 246, 0.08);

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: ${({ theme }) => theme.colors.primary || "#3b82f6"};
      }
    `}

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ $type }) => {
    const colors = {
      success: "rgba(16, 185, 129, 0.15)",
      error: "rgba(239, 68, 68, 0.15)",
      warning: "rgba(245, 158, 11, 0.15)",
      info: "rgba(59, 130, 246, 0.15)",
    };
    return $type ? colors[$type] : colors.info;
  }};
  color: ${({ $type }) => {
    const colors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    return $type ? colors[$type] : colors.info;
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const NotificationItemTitle = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text?.primary || "#333"};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text?.tertiary || "#888"};
  margin-top: 0.25rem;
`;

const NotificationItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const NotificationItemButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.primary || "#3b82f6"};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }
`;

const EmptyNotifications = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

// Styles pour la notification dropdown
const NotificationDropdownButton = styled.button`
  position: relative;
  padding: 8px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #3b82f6;
  }
`;

const NotificationCount = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;

// Animation variants pour framer-motion
const containerVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Composant de notification individuelle avec animations
const NotificationBell = ({ count, onClick }) => {
  console.log("NotificationBell rendered", { count });
  return (
    <NotificationDropdownButton id="notification-bell-button" onClick={onClick}>
      <FiBell size={20} />
      {count > 0 && (
        <NotificationCount>{count > 99 ? "99+" : count}</NotificationCount>
      )}
    </NotificationDropdownButton>
  );
};

// Styles pour le lien "Voir toutes les notifications"
const ViewAllLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary || "#3b82f6"};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
  transition: all 0.2s ease;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
    text-decoration: underline;
  }
`;

// Amélioration du bouton de suppression
const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text?.tertiary || "#888"};
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0;
  position: absolute;
  right: 10px;
  top: 10px;
  transform: translateY(0);

  ${NotificationItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #ef4444;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }
`;

// Ajouter un bouton de marquer comme lu
const MarkAsReadButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text?.tertiary || "#888"};
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0;
  position: absolute;
  right: 45px;
  top: 10px;
  transform: translateY(0);

  ${NotificationItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #10b981;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }
`;

// Amélioration des styles pour les états vides
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
  text-align: center;
`;

const EmptyStateTitle = styled.h4`
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text?.primary || "#333"};
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
  max-width: 80%;
`;

const StyledNotificationPanel = styled.div`
  position: absolute;
  z-index: 1000;
  top: 45px;
  right: 0;
  width: 380px;
  max-height: 450px;
  background-color: ${({ theme }) => theme.colors.surface || "#ffffff"};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ViewAllContainer = styled.div`
  cursor: pointer;
  border-top: 1px solid ${({ theme }) => theme.colors.border || "#eee"};
`;

// Amélioration du rendu du NotificationCenter
const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
  const menuRef = useRef(null);
  const {
    notifications,
    markAllAsRead,
    markAsRead,
    deleteAllNotifications,
    deleteNotification,
  } = useNotifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const socket = getSocket();

  // Gérer le clic sur une notification
  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification) return;

      // Marquer la notification comme lue
      if (!notification.read && markAsRead) {
        markAsRead(notification.id);
      }

      // Rediriger vers la page d'activités, indépendamment du lien stocké dans la notification
      window.location.href = "/activities";
    },
    [markAsRead]
  );

  // Gérer la suppression d'une notification
  const handleDeleteNotification = useCallback(
    (e, notificationId) => {
      e.stopPropagation(); // Éviter le déclenchement du clic sur la notification

      if (deleteNotification && notificationId) {
        deleteNotification(notificationId);
        toast.success("Notification supprimée");
      }
    },
    [deleteNotification, toast]
  );

  // Gérer la suppression de toutes les notifications
  const handleDeleteAllNotifications = useCallback(() => {
    if (deleteAllNotifications && notifications.length > 0) {
      deleteAllNotifications();
      toast.success("Toutes les notifications ont été supprimées");
    }
  }, [deleteAllNotifications, notifications, toast]);

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle size={20} />;
      case "error":
        return <FiXCircle size={20} />;
      case "warning":
        return <FiAlertTriangle size={20} />;
      case "info":
      default:
        return <FiInfo size={20} />;
    }
  };

  const renderNotifications = () => {
    if (!notifications || notifications.length === 0) {
      return (
        <EmptyState>
          <FiBell size={32} />
          <EmptyStateTitle>Aucune notification</EmptyStateTitle>
          <EmptyStateText>
            Vous n'avez pas de notifications non lues pour le moment.
          </EmptyStateText>
        </EmptyState>
      );
    }

    // Fonction utilitaire pour formater la date de façon sécurisée
    const formatTimeAgo = (dateString) => {
      try {
        if (!dateString) return "Date inconnue";

        // Vérifier si la date est valide
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.warn("Date invalide:", dateString);
          return "Date inconnue";
        }

        return formatDistanceToNow(date, {
          addSuffix: true,
          locale: fr,
        });
      } catch (error) {
        console.error("Erreur de formatage de date:", error, dateString);
        return "Date inconnue";
      }
    };

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        {notifications.map((notification) => (
          <motion.div
            key={notification.id || `notification-${Math.random()}`}
            variants={itemVariants}
            layoutId={`notification-${notification.id || Math.random()}`}
          >
            <NotificationItem
              $read={notification.read}
              onClick={() => handleNotificationClick(notification)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              whileHover={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                scale: 1.01,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <NotificationIcon $type={notification.type}>
                {renderNotificationIcon(notification.type)}
              </NotificationIcon>
              <NotificationContent>
                <NotificationItemTitle>
                  {notification.title || "Notification"}
                </NotificationItemTitle>
                <NotificationMessage>
                  {notification.message || ""}
                </NotificationMessage>
                <NotificationTime>
                  {formatTimeAgo(
                    notification.createdAt || notification.created_at
                  )}
                </NotificationTime>
                <NotificationItemActions>
                  {!notification.read && (
                    <NotificationItemButton
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      <FiCheck size={14} />
                      Marquer comme lu
                    </NotificationItemButton>
                  )}
                </NotificationItemActions>
              </NotificationContent>
              {!notification.read && (
                <MarkAsReadButton
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  title="Marquer comme lu"
                >
                  <FiCheck size={16} />
                </MarkAsReadButton>
              )}
              <DeleteButton
                onClick={(e) => handleDeleteNotification(e, notification.id)}
                title="Supprimer la notification"
              >
                <FiTrash2 size={16} />
              </DeleteButton>
            </NotificationItem>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  // Amélioration des actions de notification
  const enhancedMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);
    try {
      await markAllAsRead();
      toast.success("Toutes les notifications ont été marquées comme lues");
    } catch (error) {
      toast.error("Impossible de marquer les notifications comme lues");
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // Gestionnaire de clic extérieur pour fermer le dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* Bouton de notification simple */}
      <NotificationDropdownButton
        id="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiBell size={20} />
        {notifications.filter((n) => !n.read).length > 0 && (
          <NotificationCount>
            {notifications.filter((n) => !n.read).length > 99
              ? "99+"
              : notifications.filter((n) => !n.read).length}
          </NotificationCount>
        )}
      </NotificationDropdownButton>

      {/* Menu de notifications affiché conditionnellement */}
      {isOpen && (
        <StyledNotificationPanel>
          <NotificationHeader>
            <NotificationTitle>Notifications</NotificationTitle>
            <NotificationActions>
              <ActionButton
                onClick={enhancedMarkAllAsRead}
                disabled={markingAllAsRead || notifications.length === 0}
                title="Marquer toutes comme lues"
              >
                <FiCheck />
              </ActionButton>
              <ActionButton
                onClick={handleDeleteAllNotifications}
                disabled={notifications.length === 0}
                title="Supprimer toutes les notifications"
              >
                <FiTrash2 />
              </ActionButton>
            </NotificationActions>
          </NotificationHeader>

          <NotificationList>
            <AnimatePresence>{renderNotifications()}</AnimatePresence>
          </NotificationList>

          <ViewAllContainer
            onClick={() => (window.location.href = "/activities")}
          >
            <ViewAllLink>Voir toutes les notifications</ViewAllLink>
          </ViewAllContainer>
        </StyledNotificationPanel>
      )}
    </div>
  );
};

export default NotificationCenter;
