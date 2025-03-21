import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiPieChart,
  FiSun,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import robotAnimation from "../assets/animations/robot.json";
import RecentActivities from "../components/dashboard/RecentActivities";
import EnhancedLottie from "../components/ui/EnhancedLottie";
import SearchBar from "../components/ui/SearchBar";
import { useAuth } from "../contexts/AuthContext";
import useEmployees from "../hooks/useEmployees";
import useVacations from "../hooks/useVacations";
import { formatDate } from "../utils/dateUtils";

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

const WelcomeSection = styled(motion.div)`
  margin-bottom: 2rem;
`;

const WelcomeCard = styled(motion.div)`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primary}dd
  );
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  color: white;
  position: relative;
  overflow: hidden;

  h1 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  p {
    margin: 0;
    line-height: 1.5;
    opacity: 0.9;
    max-width: 80%;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1;
  }
`;

const SearchSection = styled(motion.div)`
  margin-bottom: 2rem;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
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

const StatInfo = styled.div`
  font-size: 0.875rem;
  color: ${({ theme, positive }) =>
    positive
      ? theme.colors.success
      : positive === false
      ? theme.colors.error
      : theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const DashboardSections = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuickActionsSection = styled(motion.div)`
  margin-bottom: 2rem;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const QuickActionCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    background-color: ${({ theme, color }) =>
      color ? `${color}11` : theme.colors.backgroundAlt};
  }
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ color }) => `${color}22`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const ActionTitle = styled.h3`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const UpcomingSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  height: fit-content;
`;

const UpcomingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UpcomingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme, color }) =>
    color ? `${color}11` : theme.colors.backgroundAlt};
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const UpcomingIcon = styled.div`
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
  flex-shrink: 0;
`;

const UpcomingContent = styled.div`
  flex: 1;
`;

const UpcomingTitle = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
  font-weight: 500;
`;

const UpcomingDate = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ViewAllLink = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ChartSection = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: 2rem;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

// Animations
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();
  const { vacations, isLoading: isLoadingVacations } = useVacations();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingVacations: 0,
    upcomingVacations: [],
    todayAbsent: 0,
  });
  const [searchResults, setSearchResults] = useState([]);

  // Fonction pour obtenir le prénom et le nom de l'utilisateur
  const getUserFullName = () => {
    if (!user) return "Utilisateur";
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username || "Utilisateur";
  };

  // Fonction pour obtenir les résultats de recherche
  const getSearchResults = (query) => {
    if (!query || query.length < 2) return [];

    const lowercaseQuery = query.toLowerCase();

    // Filtrer les employés
    let filteredEmployees = employees.filter(
      (employee) =>
        employee.first_name.toLowerCase().includes(lowercaseQuery) ||
        employee.last_name.toLowerCase().includes(lowercaseQuery) ||
        employee.email.toLowerCase().includes(lowercaseQuery) ||
        (employee.department &&
          employee.department.toLowerCase().includes(lowercaseQuery))
    );

    // Filtrer les congés
    let filteredVacations = vacations.filter((vacation) => {
      const employeeName =
        `${vacation.employee_first_name} ${vacation.employee_last_name}`.toLowerCase();
      const startDate = new Date(vacation.start_date).toLocaleDateString(
        "fr-FR"
      );
      const endDate = new Date(vacation.end_date).toLocaleDateString("fr-FR");
      const dateRange = `${startDate} - ${endDate}`;

      return (
        employeeName.includes(lowercaseQuery) ||
        (vacation.type &&
          vacation.type.toLowerCase().includes(lowercaseQuery)) ||
        dateRange.includes(lowercaseQuery)
      );
    });

    // Préparer les résultats
    const results = [];

    if (filteredEmployees.length > 0) {
      results.push({
        title: "Employés",
        items: filteredEmployees.map((employee) => ({
          id: employee.id,
          type: "employee",
          name: `${employee.first_name} ${employee.last_name}`,
          role: employee.department || "Non spécifié",
          color: "#4F46E5",
        })),
      });
    }

    if (filteredVacations.length > 0) {
      results.push({
        title: "Congés",
        items: filteredVacations.map((vacation) => {
          // Déterminer la couleur et l'icône en fonction du statut
          let color = "#F59E0B"; // Par défaut (pending)

          if (vacation.status === "approved") {
            color = "#10B981";
          } else if (vacation.status === "rejected") {
            color = "#EF4444";
          }

          const startDate = new Date(vacation.start_date).toLocaleDateString(
            "fr-FR"
          );
          const endDate = new Date(vacation.end_date).toLocaleDateString(
            "fr-FR"
          );

          return {
            id: vacation.id,
            type: "vacation",
            name: vacation.type || "Congé",
            employee: `${vacation.employee_first_name} ${vacation.employee_last_name}`,
            dates: `${startDate} - ${endDate}`,
            status: vacation.status,
            color: color,
          };
        }),
      });
    }

    return results;
  };

  // Gérer la recherche
  const handleSearch = (query) => {
    if (typeof query === "string") {
      const results = getSearchResults(query);
      setSearchResults(results);
    } else {
      // Si un élément de résultat est cliqué
      console.log("Élément sélectionné:", query);

      // Rediriger vers la page appropriée en fonction du type
      if (query.type === "employee") {
        navigate(`/employees/${query.id}`);
      } else if (query.type === "vacation") {
        navigate(`/vacations/${query.id}`);
      }
    }
  };

  // Calculer les statistiques
  useEffect(() => {
    if (!isLoadingEmployees && !isLoadingVacations) {
      // Total des employés
      const totalEmployees = employees?.length || 0;

      // Demandes de congés en attente
      const pendingVacations =
        vacations?.filter((v) => v.status === "pending")?.length || 0;

      // Prochains congés (approuvés, à venir)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingVacations =
        vacations
          ?.filter((v) => {
            const startDate = new Date(v.start_date);
            return v.status === "approved" && startDate >= today;
          })
          ?.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          ?.slice(0, 5) || [];

      // Employés absents aujourd'hui
      const todayAbsent =
        vacations?.filter((v) => {
          const startDate = new Date(v.start_date);
          const endDate = new Date(v.end_date);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return (
            v.status === "approved" && today >= startDate && today <= endDate
          );
        })?.length || 0;

      setStats({
        totalEmployees,
        pendingVacations,
        upcomingVacations,
        todayAbsent,
      });
    }
  }, [employees, vacations, isLoadingEmployees, isLoadingVacations]);

  // Naviguer vers différentes pages
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderLeft>
          <AnimationContainer>
            <EnhancedLottie
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

      <WelcomeSection initial="hidden" animate="visible" variants={fadeInUp}>
        <WelcomeCard>
          <h1>Bonjour, {getUserFullName()}!</h1>
          <p>
            Bienvenue sur votre tableau de bord. Voici un aperçu de votre
            activité récente et des tâches à venir.
          </p>
        </WelcomeCard>
      </WelcomeSection>

      <SearchSection initial="hidden" animate="visible" variants={fadeInUp}>
        <SearchBar
          placeholder="Rechercher un employé, un congé..."
          onSearch={handleSearch}
          initialResults={searchResults}
          customGetResults={true}
        />
      </SearchSection>

      <StatsGrid initial="hidden" animate="visible" variants={staggerContainer}>
        <StatCard variants={fadeInUp}>
          <StatHeader>
            <StatTitle>Total employés</StatTitle>
            <StatIcon color="#4F46E5">
              <FiUsers />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.totalEmployees}</StatValue>
          <StatInfo>Équipe complète</StatInfo>
        </StatCard>

        <StatCard variants={fadeInUp}>
          <StatHeader>
            <StatTitle>Demandes en attente</StatTitle>
            <StatIcon color="#F59E0B">
              <FiClock />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.pendingVacations}</StatValue>
          <StatInfo positive={stats.pendingVacations === 0}>
            {stats.pendingVacations === 0
              ? "Aucune demande en attente"
              : "Nécessite votre attention"}
          </StatInfo>
        </StatCard>

        <StatCard variants={fadeInUp}>
          <StatHeader>
            <StatTitle>Absents aujourd'hui</StatTitle>
            <StatIcon color="#EC4899">
              <FiSun />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.todayAbsent}</StatValue>
          <StatInfo>
            {stats.todayAbsent === 0
              ? "Tout le monde est présent"
              : `${stats.todayAbsent} employé(s) absent(s)`}
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <QuickActionsSection
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <SectionTitle>
          <FiBarChart2 size={18} color="#4F46E5" />
          Actions rapides
        </SectionTitle>
        <QuickActionsGrid>
          <QuickActionCard
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("/employees")}
            color="#4F46E5"
          >
            <ActionIcon color="#4F46E5">
              <FiUsers />
            </ActionIcon>
            <ActionTitle>Gérer les employés</ActionTitle>
            <ActionDescription>
              Ajouter, modifier ou supprimer des employés
            </ActionDescription>
          </QuickActionCard>

          <QuickActionCard
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("/vacations")}
            color="#EC4899"
          >
            <ActionIcon color="#EC4899">
              <FiSun />
            </ActionIcon>
            <ActionTitle>Gérer les congés</ActionTitle>
            <ActionDescription>
              Approuver ou rejeter les demandes de congés
            </ActionDescription>
          </QuickActionCard>

          <QuickActionCard
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("/schedule")}
            color="#10B981"
          >
            <ActionIcon color="#10B981">
              <FiCalendar />
            </ActionIcon>
            <ActionTitle>Planning</ActionTitle>
            <ActionDescription>
              Consulter et modifier le planning
            </ActionDescription>
          </QuickActionCard>

          <QuickActionCard
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigateTo("/stats")}
            color="#F59E0B"
          >
            <ActionIcon color="#F59E0B">
              <FiPieChart />
            </ActionIcon>
            <ActionTitle>Statistiques</ActionTitle>
            <ActionDescription>
              Consulter les statistiques de l'entreprise
            </ActionDescription>
          </QuickActionCard>
        </QuickActionsGrid>
      </QuickActionsSection>

      <DashboardSections>
        <UpcomingSection initial="hidden" animate="visible" variants={fadeInUp}>
          <SectionTitle>
            <FiCalendar size={18} color="#EC4899" />
            Prochains congés
          </SectionTitle>

          {stats.upcomingVacations.length === 0 ? (
            <ChartPlaceholder>Aucun congé à venir</ChartPlaceholder>
          ) : (
            <UpcomingList>
              {stats.upcomingVacations.map((vacation, index) => (
                <UpcomingItem key={index} color="#EC4899">
                  <UpcomingIcon color="#EC4899">
                    <FiSun />
                  </UpcomingIcon>
                  <UpcomingContent>
                    <UpcomingTitle>
                      {vacation.employee_name ||
                        `Employé #${vacation.employee_id}`}
                    </UpcomingTitle>
                    <UpcomingDate>
                      <FiCalendar size={12} />
                      {formatDate(vacation.start_date)} -{" "}
                      {formatDate(vacation.end_date)}
                    </UpcomingDate>
                  </UpcomingContent>
                </UpcomingItem>
              ))}

              <ViewAllLink onClick={() => navigateTo("/vacations")}>
                Voir tous les congés{" "}
                <FiArrowRight size={14} style={{ marginLeft: "4px" }} />
              </ViewAllLink>
            </UpcomingList>
          )}
        </UpcomingSection>
      </DashboardSections>

      <RecentActivities />
    </DashboardContainer>
  );
};

export default Dashboard;
