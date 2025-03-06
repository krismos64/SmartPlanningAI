import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled, { css, keyframes } from "styled-components";

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

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const progressAnimation = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

// Icônes
const SuccessIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 4L12 14.01L9 11.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 9L9 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 9L15 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16V12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8H12.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.6415 19.6871 1.81442 19.9905C1.98734 20.2939 2.23586 20.5467 2.53679 20.7239C2.83772 20.9012 3.1808 20.9962 3.53 21H20.47C20.8192 20.9962 21.1623 20.9012 21.4632 20.7239C21.7641 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 9V13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 17H12.01"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6L18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Styles pour les différents types de notifications
const notificationTypes = {
  success: css`
    background-color: ${({ theme }) => theme.colors.success};
    color: white;

    .notification-progress {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `,
  error: css`
    background-color: ${({ theme }) => theme.colors.error};
    color: white;

    .notification-progress {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `,
  warning: css`
    background-color: ${({ theme }) => theme.colors.warning};
    color: ${({ theme }) => theme.colors.text.primary};

    .notification-progress {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `,
  info: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;

    .notification-progress {
      background-color: rgba(255, 255, 255, 0.3);
    }
  `,
};

// Composants stylisés
const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 100%;
  pointer-events: none;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  max-width: 400px;
  pointer-events: auto;
  position: relative;
  overflow: hidden;

  ${({ type }) => notificationTypes[type] || notificationTypes.info}

  animation: ${({ $isClosing }) =>
    $isClosing ? slideOut : slideIn} 0.3s ease-in-out;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h4`
  margin: 0 0 4px;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
`;

const Message = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.4;
  word-break: break-word;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  transition: width 0.1s linear;
`;

// Contexte pour les notifications
const NotificationContext = React.createContext({
  notifications: [],
  showNotification: () => {},
  hideNotification: () => {},
});

export const useNotification = () => React.useContext(NotificationContext);

// Composant de notification individuelle
const Notification = React.memo(({ notification, onClose }) => {
  const { id, type, title, message, duration, isClosing } = notification;
  const [progressWidth, setProgressWidth] = useState(100);
  const timeoutRef = React.useRef(null);

  // Gérer la fermeture automatique
  useEffect(() => {
    if (duration > 0) {
      // Démarrer l'animation de progression
      const startTime = Date.now();
      const endTime = startTime + duration;

      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const percent = (remaining / duration) * 100;

        setProgressWidth(percent);

        if (percent > 0) {
          timeoutRef.current = requestAnimationFrame(updateProgress);
        } else {
          onClose();
        }
      };

      timeoutRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (timeoutRef.current) {
        cancelAnimationFrame(timeoutRef.current);
      }
    };
  }, [duration, onClose]);

  // Récupérer l'icône en fonction du type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <SuccessIcon />;
      case "error":
        return <ErrorIcon />;
      case "warning":
        return <WarningIcon />;
      case "info":
      default:
        return <InfoIcon />;
    }
  };

  return (
    <NotificationItem type={type} $isClosing={isClosing}>
      <IconContainer>{getIcon()}</IconContainer>
      <ContentContainer>
        {title && <Title>{title}</Title>}
        {message && <Message>{message}</Message>}
      </ContentContainer>
      <CloseButton onClick={onClose}>
        <CloseIcon />
      </CloseButton>
      {duration > 0 && (
        <ProgressBar
          className="notification-progress"
          style={{ width: `${progressWidth}%` }}
        />
      )}
    </NotificationItem>
  );
});

Notification.displayName = "Notification";

// Composant fournisseur de notifications
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Afficher une notification
  const showNotification = React.useCallback((param1, param2, param3) => {
    // Vérifier le format des paramètres
    let type = "info";
    let title = "";
    let message = "";
    let duration = 5000;

    // Si le premier paramètre est un objet, utiliser ses propriétés
    if (typeof param1 === "object" && param1 !== null) {
      type = param1.type || "info";
      title = param1.title || "";
      message = param1.message || "";
      duration = param1.duration || 5000;
    }
    // Si le premier paramètre est une chaîne et le deuxième est une chaîne, considérer param1 comme message et param2 comme type
    else if (typeof param1 === "string" && typeof param2 === "string") {
      message = param1;
      type = param2;
      duration = param3 || 5000;
    }
    // Si le premier paramètre est une chaîne mais pas le deuxième, considérer param1 comme message
    else if (typeof param1 === "string") {
      message = param1;
      duration = param2 || 5000;
    }

    console.log("Affichage d'une notification:", { type, title, message });

    const id = Date.now().toString();

    setNotifications((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        message,
        duration,
        createdAt: new Date(),
      },
    ]);

    return id;
  }, []);

  // Masquer une notification
  const hideNotification = React.useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isClosing: true }
          : notification
      )
    );

    // Supprimer la notification après l'animation
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== id)
      );
    }, 300);
  }, []);

  // Valeur du contexte
  const contextValue = React.useMemo(
    () => ({
      notifications,
      showNotification,
      hideNotification,
    }),
    [notifications, showNotification, hideNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <NotificationContainer>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onClose={() => hideNotification(notification.id)}
            />
          ))}
        </NotificationContainer>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};

// Hooks personnalisés pour les notifications
export const useSuccessNotification = () => {
  const { showNotification } = useNotification();
  return (title, message, duration) =>
    showNotification({ type: "success", title, message, duration });
};

export const useErrorNotification = () => {
  const { showNotification } = useNotification();
  return (title, message, duration) =>
    showNotification({ type: "error", title, message, duration });
};

export const useWarningNotification = () => {
  const { showNotification } = useNotification();
  return (title, message, duration) =>
    showNotification({ type: "warning", title, message, duration });
};

export const useInfoNotification = () => {
  const { showNotification } = useNotification();
  return (title, message, duration) =>
    showNotification({ type: "info", title, message, duration });
};

// Fonctions d'aide pour les notifications (à utiliser dans les composants)
export const showSuccess = (title, message, duration) => {
  console.warn("Deprecated: Use useSuccessNotification hook instead");
  // Cette implémentation ne fonctionnera que dans un composant React
  // et est conservée pour la compatibilité
  const { showNotification } = window.__NOTIFICATION_CONTEXT__ || {
    showNotification: () => {},
  };
  return showNotification({ type: "success", title, message, duration });
};

export const showError = (title, message, duration) => {
  console.warn("Deprecated: Use useErrorNotification hook instead");
  const { showNotification } = window.__NOTIFICATION_CONTEXT__ || {
    showNotification: () => {},
  };
  return showNotification({ type: "error", title, message, duration });
};

export const showWarning = (title, message, duration) => {
  console.warn("Deprecated: Use useWarningNotification hook instead");
  const { showNotification } = window.__NOTIFICATION_CONTEXT__ || {
    showNotification: () => {},
  };
  return showNotification({ type: "warning", title, message, duration });
};

export const showInfo = (title, message, duration) => {
  console.warn("Deprecated: Use useInfoNotification hook instead");
  const { showNotification } = window.__NOTIFICATION_CONTEXT__ || {
    showNotification: () => {},
  };
  return showNotification({ type: "info", title, message, duration });
};

// Exporter un objet nommé au lieu d'un export anonyme
const NotificationModule = {
  NotificationProvider,
  useNotification,
  useSuccessNotification,
  useErrorNotification,
  useWarningNotification,
  useInfoNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
};

export default NotificationModule;
