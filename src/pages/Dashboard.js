import Lottie from "lottie-react";
import styled from "styled-components";
import robotAnimation from "../assets/animations/robot.json";
import DashboardStats from "../components/dashboard/DashboardStats";
import RecentActivities from "../components/dashboard/RecentActivities";
import SearchBar from "../components/ui/SearchBar";
import { useAuth } from "../contexts/AuthContext";

// Composants stylisés
const DashboardContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const AnimationContainer = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};

  h1 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0 0 1rem 0;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    line-height: 1.5;
  }
`;

const SearchSection = styled.div`
  margin-bottom: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ color }) => `${color}22`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatEmployeesList = styled.div`
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmployeeItem = styled.div`
  padding: 0.25rem 0;
  border-bottom: 1px solid ${({ theme }) => `${theme.colors.border}44`};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActivitiesSection = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: 2rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ color }) => `${color}22`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 1rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActivityTime = styled.span`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`;

const ActivityUser = styled.span`
  display: flex;
  align-items: center;
`;

const ClockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "4px" }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Dashboard = () => {
  const { user } = useAuth();

  // Fonction pour obtenir le prénom et le nom de l'utilisateur
  const getUserFullName = () => {
    if (!user) return "Utilisateur";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || "Utilisateur";
  };

  const handleSearch = (query) => {
    // Implémentation de la recherche à ajouter
    console.log("Recherche:", query);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderLeft>
          <AnimationContainer>
            <Lottie
              animationData={robotAnimation}
              loop={true}
              style={{ width: "100%", height: "100%" }}
            />
          </AnimationContainer>
          <TitleContainer>
            <PageTitle>Tableau de bord</PageTitle>
            <PageDescription>
              Bienvenue sur votre assistant de planification intelligent
            </PageDescription>
          </TitleContainer>
        </HeaderLeft>
      </DashboardHeader>

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

      <DashboardStats />
      <RecentActivities />
    </DashboardContainer>
  );
};

export default Dashboard;
