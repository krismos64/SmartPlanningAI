import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import Lottie from "lottie-react";
import planningAnimation from "../../assets/animations/planning-animation.json";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import {
  NotificationBell,
  useRealTimeNotifications,
} from "../ui/RealTimeNotification";

// Composants stylisés
const NavbarContainer = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background-color: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.small};
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const LogoAnimation = styled.div`
  width: 40px;
  height: 40px;
  margin-right: ${({ theme }) => theme.spacing.sm};
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.secondary};
  font-weight: ${({ theme, active }) =>
    active
      ? theme.typography.fontWeights.semiBold
      : theme.typography.fontWeights.medium};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  }

  .user-info {
    display: none;

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
      display: block;
    }

    .name {
      font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
      color: ${({ theme }) => theme.colors.text.primary};
    }

    .role {
      font-size: ${({ theme }) => theme.typography.sizes.xs};
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const UserMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    color: ${({ theme }) => theme.colors.primary};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const UserMenuDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => `${theme.spacing.xs} 0`};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 24px;
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.medium};
    padding: ${({ theme }) => theme.spacing.lg};
    z-index: 1000;
  }
`;

const MobileNavLink = styled(NavLink)`
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  display: block;
`;

const NotificationsPanel = styled.div`
  position: absolute;
  top: 60px;
  right: 20px;
  width: 350px;
  max-height: 500px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.large};
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

const NotificationsPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const NotificationsPanelTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NotificationItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme, read }) =>
    read ? theme.colors.background : `${theme.colors.primary}11`};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}22`};
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotificationTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const NotificationTime = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
`;

const NotificationMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const EmptyNotifications = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Icônes
const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 12H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 18H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
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

const SunIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 1V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 21V23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.22 4.22L5.64 5.64"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.36 18.36L19.78 19.78"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 12H3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.22 19.78L5.64 18.36"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.36 5.64L19.78 4.22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1582 17.4668C18.1126 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.748 21.1181 10.0795 20.7461C8.41104 20.3741 6.88302 19.5345 5.67425 18.3258C4.46548 17.117 3.62593 15.589 3.25393 13.9205C2.88193 12.252 2.99274 10.5121 3.57348 8.9043C4.15423 7.29651 5.18085 5.88737 6.53324 4.84175C7.88562 3.79614 9.5078 3.15731 11.21 3C10.2134 4.34827 9.73385 6.00945 9.85853 7.68141C9.98322 9.35338 10.7039 10.9251 11.8894 12.1106C13.0749 13.2961 14.6466 14.0168 16.3186 14.1415C17.9906 14.2662 19.6517 13.7866 21 12.79Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Composant Navbar
const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { notifications, markAsRead, clearAll } = useRealTimeNotifications();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getUserFullName = () => {
    if (!user) return "Utilisateur";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "Utilisateur";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return getInitials(user.username || "Utilisateur");
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  const toggleNotificationsPanel = () => {
    setNotificationsPanelOpen(!notificationsPanelOpen);
    if (!notificationsPanelOpen) {
      setUserMenuOpen(false);
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    if (!userMenuOpen) {
      setNotificationsPanelOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection sera gérée par le contexte d'authentification
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Icônes pour le menu utilisateur
  const ProfileIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const SettingsIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const LogoutIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <NavbarContainer>
      <Logo to="/">
        <LogoAnimation>
          <Lottie animationData={planningAnimation} loop={true} />
        </LogoAnimation>
        SmartPlanning AI
      </Logo>

      <NavLinks>
        <NavLink to="/dashboard" active={isActive("/dashboard")}>
          Tableau de bord
        </NavLink>
        <NavLink to="/employees" active={isActive("/employees")}>
          Employés
        </NavLink>
        <NavLink to="/planning" active={isActive("/planning")}>
          Planning
        </NavLink>
        <NavLink to="/vacations" active={isActive("/vacations")}>
          Congés
        </NavLink>
        <NavLink to="/stats" active={isActive("/stats")}>
          Statistiques
        </NavLink>
        {user && user.role === "admin" && (
          <NavLink to="/users" active={isActive("/users")}>
            Utilisateurs
          </NavLink>
        )}
      </NavLinks>

      <NavActions>
        <div style={{ position: "relative" }}>
          <div onClick={toggleNotificationsPanel}>
            <NotificationBell />
          </div>

          <NotificationsPanel isOpen={notificationsPanelOpen}>
            <NotificationsPanelHeader>
              <NotificationsPanelTitle>Notifications</NotificationsPanelTitle>
              <ClearButton onClick={clearAll}>Tout effacer</ClearButton>
            </NotificationsPanelHeader>

            <NotificationsList>
              {notifications.length === 0 ? (
                <EmptyNotifications>
                  Aucune notification pour le moment
                </EmptyNotifications>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    read={notification.read}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <NotificationHeader>
                      <NotificationTitle>
                        {notification.title}
                      </NotificationTitle>
                      <NotificationTime>
                        {new Date(notification.timestamp).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </NotificationTime>
                    </NotificationHeader>
                    <NotificationMessage>
                      {notification.message}
                    </NotificationMessage>
                  </NotificationItem>
                ))
              )}
            </NotificationsList>
          </NotificationsPanel>
        </div>

        <ThemeToggle onClick={toggleTheme}>
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </ThemeToggle>

        <UserProfile onClick={toggleUserMenu}>
          <div className="avatar">{getUserInitials()}</div>
          <div className="user-info">
            <div className="name">{getUserFullName()}</div>
            <div className="role">
              {user?.role === "admin" ? "Administrateur" : "Utilisateur"}
            </div>
          </div>

          <UserMenu isOpen={userMenuOpen}>
            <UserMenuItem to="/profile">
              <ProfileIcon />
              Mon profil
            </UserMenuItem>
            <UserMenuItem to="/settings">
              <SettingsIcon />
              Paramètres
            </UserMenuItem>
            <UserMenuDivider />
            <UserMenuButton onClick={handleLogout}>
              <LogoutIcon />
              Déconnexion
            </UserMenuButton>
          </UserMenu>
        </UserProfile>

        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </MobileMenuButton>
      </NavActions>

      <MobileMenu isOpen={mobileMenuOpen}>
        <NavLink to="/dashboard" active={isActive("/dashboard")}>
          Tableau de bord
        </NavLink>
        <NavLink to="/employees" active={isActive("/employees")}>
          Employés
        </NavLink>
        <NavLink to="/planning" active={isActive("/planning")}>
          Planning
        </NavLink>
        <NavLink to="/vacations" active={isActive("/vacations")}>
          Congés
        </NavLink>
        <NavLink to="/stats" active={isActive("/stats")}>
          Statistiques
        </NavLink>
        {user && user.role === "admin" && (
          <NavLink to="/users" active={isActive("/users")}>
            Utilisateurs
          </NavLink>
        )}
        <NavLink to="/profile" active={isActive("/profile")}>
          Mon profil
        </NavLink>
        <NavLink to="/settings" active={isActive("/settings")}>
          Paramètres
        </NavLink>
      </MobileMenu>
    </NavbarContainer>
  );
};

export default Navbar;
