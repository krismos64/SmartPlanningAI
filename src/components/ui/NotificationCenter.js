import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiInfo,
  FiTrash2,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import styled, { css, keyframes } from "styled-components";
import useNotifications from "../../hooks/useNotifications";

// Animations
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`;

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

// Composants stylisés
const NotificationBellContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const BellIcon = styled(FiBell)`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ hasUnread }) =>
    hasUnread &&
    css`
      animation: ${pulse} 2s infinite;
    `}
`;

const NotificationPanelContainer = styled(motion.div)`
  position: absolute;
  top: 60px;
  right: 20px;
  width: 380px;
  max-height: 500px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.large};
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
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
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
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
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
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const NotificationItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 1rem;
  position: relative;

  ${({ read, theme }) =>
    !read &&
    css`
      background-color: ${`${theme.colors.primary}08`};

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: ${theme.colors.primary};
      }
    `}

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }

  animation: ${slideIn} 0.3s ease-out;
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  ${({ type, theme }) => {
    switch (type) {
      case "success":
        return css`
          background-color: ${`${theme.colors.success}15`};
          color: ${theme.colors.success};
        `;
      case "error":
        return css`
          background-color: ${`${theme.colors.error}15`};
          color: ${theme.colors.error};
        `;
      case "warning":
        return css`
          background-color: ${`${theme.colors.warning}15`};
          color: ${theme.colors.warning};
        `;
      default:
        return css`
          background-color: ${`${theme.colors.primary}15`};
          color: ${theme.colors.primary};
        `;
    }
  }}
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
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const NotificationMessage = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
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
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const EmptyNotifications = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
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

// Composant principal
const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  // Fermer le panneau lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Formater la date relative
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };

  // Obtenir l'icône en fonction du type de notification
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle size={20} />;
      case "error":
        return <FiXCircle size={20} />;
      case "warning":
        return <FiAlertTriangle size={20} />;
      default:
        return <FiInfo size={20} />;
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Si la notification a un lien, naviguer vers ce lien
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <>
      <NotificationBellContainer onClick={() => setIsOpen(!isOpen)}>
        <BellIcon />
        {unreadCount > 0 && (
          <NotificationBadge hasUnread={unreadCount > 0}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </NotificationBadge>
        )}
      </NotificationBellContainer>

      <AnimatePresence>
        {isOpen && (
          <NotificationPanelContainer
            ref={panelRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationHeader>
              <NotificationTitle>Notifications</NotificationTitle>
              <NotificationActions>
                {notifications.length > 0 && (
                  <>
                    <ActionButton
                      onClick={markAllAsRead}
                      title="Marquer tout comme lu"
                    >
                      <FiCheckSquare size={18} />
                    </ActionButton>
                    <ActionButton
                      onClick={deleteAllNotifications}
                      title="Supprimer toutes les notifications"
                    >
                      <FiTrash2 size={18} />
                    </ActionButton>
                  </>
                )}
                <ActionButton onClick={() => setIsOpen(false)} title="Fermer">
                  <FiX size={18} />
                </ActionButton>
              </NotificationActions>
            </NotificationHeader>

            <NotificationList>
              {loading ? (
                <EmptyNotifications>
                  <EmptyText>Chargement des notifications...</EmptyText>
                </EmptyNotifications>
              ) : notifications.length === 0 ? (
                <EmptyNotifications>
                  <EmptyIcon>
                    <FiBell />
                  </EmptyIcon>
                  <EmptyText>Vous n'avez pas de notifications</EmptyText>
                </EmptyNotifications>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    read={notification.read}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <NotificationIcon type={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </NotificationIcon>
                    <NotificationContent>
                      <NotificationItemTitle>
                        {notification.title}
                      </NotificationItemTitle>
                      <NotificationMessage>
                        {notification.message}
                      </NotificationMessage>
                      <NotificationTime>
                        {formatRelativeTime(notification.created_at)}
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
                        <NotificationItemButton
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <FiTrash2 size={14} />
                          Supprimer
                        </NotificationItemButton>
                      </NotificationItemActions>
                    </NotificationContent>
                  </NotificationItem>
                ))
              )}
            </NotificationList>
          </NotificationPanelContainer>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter;
