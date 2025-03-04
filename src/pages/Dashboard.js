import { useEffect, useState } from "react";
import styled from "styled-components";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import SearchBar from "../components/ui/SearchBar";
import { useAuth } from "../contexts/AuthContext";
import useEmployees from "../hooks/useEmployees";

// Composants stylisés
const DashboardContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const WelcomeSection = styled.div`
  flex: 1;
`;

const SearchSection = styled.div`
  width: 100%;
  max-width: 400px;

  @media (min-width: 768px) {
    width: 40%;
  }
`;

const WelcomeCard = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};

  h1 {
    font-size: 1.75rem;
    font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1rem;
    opacity: 0.9;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ color, theme }) =>
    `${color || theme.colors.primary}22`};
  color: ${({ color, theme }) => color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ positive, theme }) =>
    positive ? theme.colors.success : theme.colors.error};
`;

const ActivitiesSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ color, theme }) =>
    `${color || theme.colors.primary}22`};
  color: ${({ color, theme }) => color || theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActivityTime = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActivityUser = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
`;

// Icônes
const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    width="14"
    height="14"
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

// Composant Dashboard
const Dashboard = () => {
  const { user } = useAuth();
  const { employees, loading } = useEmployees();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: {},
    hoursWorked: 0,
    overtimeHours: 0,
  });
  const [activities] = useState([
    {
      id: 1,
      type: "employee_added",
      user: "Admin",
      timestamp: new Date(Date.now() - 3600000 * 2),
      details: "Nouvel employé ajouté: Jean Dupont",
    },
    {
      id: 2,
      type: "schedule_updated",
      user: "Admin",
      timestamp: new Date(Date.now() - 3600000 * 5),
      details: "Planning mis à jour pour la semaine du 10/04/2023",
    },
    {
      id: 3,
      type: "vacation_approved",
      user: "Admin",
      timestamp: new Date(Date.now() - 3600000 * 8),
      details: "Congé approuvé pour Marie Martin (15/05/2023 - 22/05/2023)",
    },
  ]);

  // Fonction pour obtenir le prénom et le nom de l'utilisateur
  const getUserFullName = () => {
    if (!user) return "Utilisateur";
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "Utilisateur";
  };

  // Mettre à jour les statistiques en fonction des données
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Calculer les statistiques à partir des données des employés
        const activeEmployees = employees.filter(
          (employee) => employee.status === "active"
        ).length;

        // Mettre à jour les statistiques
        setStats({
          totalEmployees: employees.length,
          activeEmployees: activeEmployees,
          departments: {},
          hoursWorked: 1842, // À remplacer par des données réelles
          overtimeHours: 24, // À remplacer par des données réelles
        });
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error
        );
      }
    };

    if (!loading) {
      fetchStats();
    }
  }, [employees, loading]); // Dépendance aux employés pour mettre à jour les statistiques

  const handleSearch = (query) => {
    // Implémentation de la recherche à ajouter
    console.log("Recherche:", query);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeSection>
          <WelcomeCard>
            <h1>Bonjour, {getUserFullName()}!</h1>
            <p>
              Bienvenue sur votre tableau de bord. Voici un aperçu de votre
              activité récente.
            </p>
          </WelcomeCard>
        </WelcomeSection>
        <SearchSection>
          <SearchBar
            placeholder="Rechercher un employé, un événement..."
            onSearch={handleSearch}
          />
        </SearchSection>
      </DashboardHeader>

      {loading ? (
        <LoadingIndicator>Chargement des données...</LoadingIndicator>
      ) : (
        <>
          <StatsGrid>
            <StatCard>
              <StatHeader>
                <StatTitle>Total des employés</StatTitle>
                <StatIcon color="#4F46E5">👥</StatIcon>
              </StatHeader>
              <StatValue>{stats.totalEmployees}</StatValue>
              <StatChange positive={stats.activeEmployees > 0}>
                {stats.activeEmployees > 0 ? "+12%" : "-3%"}
              </StatChange>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatTitle>Heures travaillées</StatTitle>
                <StatIcon color="#6366F1">⏱️</StatIcon>
              </StatHeader>
              <StatValue>{stats.hoursWorked}</StatValue>
              <StatChange positive={stats.hoursWorked > 0}>
                {stats.hoursWorked > 0 ? "+5%" : "-3%"}
              </StatChange>
            </StatCard>
            <StatCard>
              <StatHeader>
                <StatTitle>Congés approuvés</StatTitle>
                <StatIcon color="#10B981">✅</StatIcon>
              </StatHeader>
              <StatValue>{stats.overtimeHours}</StatValue>
              <StatChange positive={stats.overtimeHours > 0}>
                {stats.overtimeHours > 0 ? "+18%" : "-3%"}
              </StatChange>
            </StatCard>
          </StatsGrid>

          <DashboardCharts />

          <ActivitiesSection>
            <SectionTitle>Activités récentes</SectionTitle>
            {activities.length > 0 ? (
              <ActivityList>
                {activities.map((activity) => (
                  <ActivityItem key={activity.id}>
                    <ActivityIcon color={activity.color}>
                      {activity.icon}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle>{activity.title}</ActivityTitle>
                      <ActivityMeta>
                        <ActivityTime>
                          <ClockIcon /> {activity.time}
                        </ActivityTime>
                        <ActivityUser>
                          <UserIcon /> {activity.user}
                        </ActivityUser>
                      </ActivityMeta>
                    </ActivityContent>
                  </ActivityItem>
                ))}
              </ActivityList>
            ) : (
              <EmptyState>
                Aucune activité récente. Commencez à utiliser l'application pour
                voir apparaître vos activités ici.
              </EmptyState>
            )}
          </ActivitiesSection>
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;
