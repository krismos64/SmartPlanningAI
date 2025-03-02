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

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  const toggleNotificationsPanel = () => {
    setNotificationsPanelOpen(!notificationsPanelOpen);
  };

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

        <UserProfile>
          <div className="avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <div className="name">{user?.name || "Utilisateur"}</div>
            <div className="role">
              {user?.role === "admin" ? "Administrateur" : "Utilisateur"}
            </div>
          </div>
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
      </MobileMenu>
    </NavbarContainer>
  );
};

export default Navbar;
