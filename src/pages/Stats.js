import { BarChart } from "@mui/icons-material";
import { alpha, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiPieChart,
  FiRefreshCw,
  FiSun,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import styled from "styled-components";
import { useTheme as useThemeProvider } from "../components/ThemeProvider";
import useEmployees from "../hooks/useEmployees";
import useVacations from "../hooks/useVacations";

// Icône stylisée pour les statistiques
const StyledIcon = styled(Box)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = themeMode === "dark";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: isDarkMode
      ? `linear-gradient(135deg, ${alpha("#10B981", 0.2)}, ${alpha(
          "#059669",
          0.4
        )})`
      : `linear-gradient(135deg, ${alpha("#10B981", 0.1)}, ${alpha(
          "#059669",
          0.3
        )})`,
    boxShadow: isDarkMode
      ? `0 4px 20px ${alpha("#000", 0.25)}`
      : `0 4px 15px ${alpha("#000", 0.08)}`,
    color: isDarkMode ? "#6EE7B7" : "#059669",
    flexShrink: 0,
    transition: "all 0.3s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 40,
    },
  };
});

// Composants stylisés
const StatsContainer = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: 1.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  margin: 0;
`;

const RefreshButton = styled.button`
  // Supprimer tout le composant
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatsCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardIcon = styled.div`
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

const ChartContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.colors.background}66`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
  position: relative;
`;

const ChartPlaceholder = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${({ theme, color }) => color || theme.colors.primary};
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: ${({ theme }) => `${theme.colors.border}`};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ value }) => `${value}%`};
    background-color: ${({ theme, color }) => color || theme.colors.primary};
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
`;

const StatsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StatsItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const StatsItemLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsItemValue = styled.div`
  font-weight: 500;
  color: ${({ theme, color }) => color || theme.colors.text.primary};
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-right: 0.5rem;
`;

const VacationTypesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const VacationTypeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const VacationTypeLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const VacationTypeBar = styled.div`
  flex: 1;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  margin: 0 1rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ percentage }) => `${percentage}%`};
    background-color: ${({ color }) => color};
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
`;

const VacationTypeValue = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 40px;
  text-align: right;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.text.secondary};

  svg {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const VacationStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatusCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const StatusIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${({ color }) => `${color}22`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 1rem;
`;

const StatusValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: ${({ theme, color }) => color || theme.colors.text.primary};
`;

const StatusLabel = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
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

// Composant Stats
const Stats = () => {
  const [stats, setStats] = useState({
    employees: {
      total: 0,
      active: 0,
      onVacation: 0,
      departments: [],
    },
    vacations: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      byType: {
        vacation: 0,
        sick: 0,
        personal: 0,
        other: 0,
      },
    },
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Utiliser les hooks personnalisés pour les données
  const {
    employees,
    loading: employeesLoading,
    refresh: refreshEmployees,
  } = useEmployees();

  const {
    vacations,
    loading: vacationsLoading,
    refreshVacations,
  } = useVacations();

  const handleRefresh = () => {
    // Supprimer toute la fonction
  };

  // Calculer les statistiques
  useEffect(() => {
    if (!employeesLoading && !vacationsLoading && employees && vacations) {
      // Statistiques des employés
      const totalEmployees = employees.length;

      // Employés actuellement en congé
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const employeesOnVacation = vacations
        .filter((v) => {
          const startDate = new Date(v.start_date);
          const endDate = new Date(v.end_date);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          return (
            v.status === "approved" && today >= startDate && today <= endDate
          );
        })
        .map((v) => v.employee_id);

      // Éliminer les doublons
      const uniqueEmployeesOnVacation = [...new Set(employeesOnVacation)];
      const onVacationCount = uniqueEmployeesOnVacation.length;

      // Employés actifs (non en congé)
      const activeEmployees = totalEmployees - onVacationCount;

      // Départements (à implémenter si les données sont disponibles)
      const departments = [];

      // Statistiques des congés
      const totalVacations = vacations.length;
      const pendingVacations = vacations.filter(
        (v) => v.status === "pending"
      ).length;
      const approvedVacations = vacations.filter(
        (v) => v.status === "approved"
      ).length;
      const rejectedVacations = vacations.filter(
        (v) => v.status === "rejected"
      ).length;

      // Congés par type
      const paidVacations = vacations.filter((v) => v.type === "paid").length;
      const unpaidVacations = vacations.filter(
        (v) => v.type === "unpaid"
      ).length;
      const sickVacations = vacations.filter((v) => v.type === "sick").length;
      const otherVacations = vacations.filter((v) => v.type === "other").length;

      // Congés par mois
      const vacationsByMonth = {};

      vacations.forEach((vacation) => {
        const startDate = new Date(vacation.start_date);
        const month = startDate.getMonth();
        const year = startDate.getFullYear();
        const key = `${year}-${month}`;

        if (!vacationsByMonth[key]) {
          vacationsByMonth[key] = {
            month,
            year,
            count: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
          };
        }

        vacationsByMonth[key].count++;

        if (vacation.status === "approved") {
          vacationsByMonth[key].approved++;
        } else if (vacation.status === "pending") {
          vacationsByMonth[key].pending++;
        } else if (vacation.status === "rejected") {
          vacationsByMonth[key].rejected++;
        }
      });

      setStats({
        employees: {
          total: totalEmployees,
          active: activeEmployees,
          onVacation: onVacationCount,
          departments,
        },
        vacations: {
          total: totalVacations,
          pending: pendingVacations,
          approved: approvedVacations,
          rejected: rejectedVacations,
          byType: {
            vacation: paidVacations,
            sick: sickVacations,
            personal: unpaidVacations,
            other: otherVacations,
          },
        },
      });
    }
  }, [employees, vacations, employeesLoading, vacationsLoading]);

  // Calculer les pourcentages pour les types de congés
  const getVacationTypePercentage = (type) => {
    if (stats.vacations.total === 0) return 0;
    return Math.round(
      (stats.vacations.byType[type] / stats.vacations.total) * 100
    );
  };

  // Calculer le taux de présence
  const getPresenceRate = () => {
    if (stats.employees.total === 0) return 0;
    return Math.round((stats.employees.active / stats.employees.total) * 100);
  };

  // Calculer le taux d'approbation des congés
  const getApprovalRate = () => {
    const processedVacations =
      stats.vacations.approved + stats.vacations.rejected;
    if (processedVacations === 0) return 0;
    return Math.round((stats.vacations.approved / processedVacations) * 100);
  };

  return (
    <StatsContainer>
      <Box
        component="div"
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <StyledIcon>
              <BarChart />
            </StyledIcon>

            <Box component="div" sx={{ ml: 2 }}>
              <PageTitle>Statistiques</PageTitle>
              <PageDescription>
                Consultez les statistiques et les analyses de votre organisation
              </PageDescription>
            </Box>
          </Box>
        </Box>
      </Box>

      {employeesLoading || vacationsLoading || isRefreshing ? (
        <LoadingIndicator>
          <FiRefreshCw size={24} />
          <div>Chargement des statistiques...</div>
        </LoadingIndicator>
      ) : (
        <>
          <SectionTitle>
            <FiBarChart2 size={18} color="#4F46E5" />
            Vue d'ensemble
          </SectionTitle>

          <VacationStatusGrid>
            <StatusCard>
              <StatusIcon color="#4F46E5">
                <FiUsers />
              </StatusIcon>
              <StatusValue>{stats.employees.total}</StatusValue>
              <StatusLabel>Employés au total</StatusLabel>
            </StatusCard>

            <StatusCard>
              <StatusIcon color="#F59E0B">
                <FiClock />
              </StatusIcon>
              <StatusValue>{stats.vacations.pending}</StatusValue>
              <StatusLabel>Demandes en attente</StatusLabel>
            </StatusCard>

            <StatusCard>
              <StatusIcon color="#10B981">
                <FiCheckCircle />
              </StatusIcon>
              <StatusValue>{stats.vacations.approved}</StatusValue>
              <StatusLabel>Demandes approuvées</StatusLabel>
            </StatusCard>

            <StatusCard>
              <StatusIcon color="#EF4444">
                <FiXCircle />
              </StatusIcon>
              <StatusValue>{stats.vacations.rejected}</StatusValue>
              <StatusLabel>Demandes rejetées</StatusLabel>
            </StatusCard>
          </VacationStatusGrid>

          <StatsGrid
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <StatsCard variants={fadeInUp}>
              <CardHeader>
                <CardTitle>
                  <FiUsers size={18} color="#4F46E5" />
                  Employés
                </CardTitle>
                <CardIcon color="#4F46E5">
                  <FiUsers />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                {employeesLoading ? (
                  <LoadingIndicator>
                    <FiRefreshCw size={24} />
                    <div>Chargement...</div>
                  </LoadingIndicator>
                ) : (
                  <ChartPlaceholder>
                    <StatValue color="#4F46E5">
                      {stats.employees.total}
                    </StatValue>
                    <StatLabel>Employés au total</StatLabel>
                  </ChartPlaceholder>
                )}
              </ChartContainer>
              <StatsList>
                <StatsItem>
                  <StatsItemLabel>
                    <StatusIndicator color="#10B981" />
                    Actifs
                  </StatsItemLabel>
                  <StatsItemValue>{stats.employees.active}</StatsItemValue>
                </StatsItem>
                <StatsItem>
                  <StatsItemLabel>
                    <StatusIndicator color="#EC4899" />
                    En congé
                  </StatsItemLabel>
                  <StatsItemValue>{stats.employees.onVacation}</StatsItemValue>
                </StatsItem>
                <StatsItem>
                  <StatsItemLabel>
                    <StatusIndicator color="#4F46E5" />
                    Taux de présence
                  </StatsItemLabel>
                  <StatsItemValue>{getPresenceRate()}%</StatsItemValue>
                </StatsItem>
              </StatsList>
              <ProgressBar value={getPresenceRate()} color="#4F46E5" />
            </StatsCard>

            <StatsCard variants={fadeInUp}>
              <CardHeader>
                <CardTitle>
                  <FiSun size={18} color="#EC4899" />
                  Types de congés
                </CardTitle>
                <CardIcon color="#EC4899">
                  <FiSun />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                {vacationsLoading ? (
                  <LoadingIndicator>
                    <FiRefreshCw size={24} />
                    <div>Chargement...</div>
                  </LoadingIndicator>
                ) : (
                  <ChartPlaceholder>
                    <StatValue color="#EC4899">
                      {stats.vacations.total}
                    </StatValue>
                    <StatLabel>Demandes de congés</StatLabel>
                  </ChartPlaceholder>
                )}
              </ChartContainer>
              <VacationTypesList>
                <VacationTypeItem>
                  <VacationTypeLabel>
                    <StatusIndicator color="#4F46E5" />
                    Congés payés
                  </VacationTypeLabel>
                  <VacationTypeBar
                    percentage={getVacationTypePercentage("vacation")}
                    color="#4F46E5"
                  />
                  <VacationTypeValue>
                    {stats.vacations.byType.vacation}
                  </VacationTypeValue>
                </VacationTypeItem>

                <VacationTypeItem>
                  <VacationTypeLabel>
                    <StatusIndicator color="#F59E0B" />
                    Congés maladie
                  </VacationTypeLabel>
                  <VacationTypeBar
                    percentage={getVacationTypePercentage("sick")}
                    color="#F59E0B"
                  />
                  <VacationTypeValue>
                    {stats.vacations.byType.sick}
                  </VacationTypeValue>
                </VacationTypeItem>

                <VacationTypeItem>
                  <VacationTypeLabel>
                    <StatusIndicator color="#10B981" />
                    Congés non payés
                  </VacationTypeLabel>
                  <VacationTypeBar
                    percentage={getVacationTypePercentage("personal")}
                    color="#10B981"
                  />
                  <VacationTypeValue>
                    {stats.vacations.byType.personal}
                  </VacationTypeValue>
                </VacationTypeItem>

                <VacationTypeItem>
                  <VacationTypeLabel>
                    <StatusIndicator color="#8B5CF6" />
                    Autres congés
                  </VacationTypeLabel>
                  <VacationTypeBar
                    percentage={getVacationTypePercentage("other")}
                    color="#8B5CF6"
                  />
                  <VacationTypeValue>
                    {stats.vacations.byType.other}
                  </VacationTypeValue>
                </VacationTypeItem>
              </VacationTypesList>
            </StatsCard>

            <StatsCard variants={fadeInUp}>
              <CardHeader>
                <CardTitle>
                  <FiPieChart size={18} color="#10B981" />
                  Statut des demandes
                </CardTitle>
                <CardIcon color="#10B981">
                  <FiPieChart />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                {vacationsLoading ? (
                  <LoadingIndicator>
                    <FiRefreshCw size={24} />
                    <div>Chargement...</div>
                  </LoadingIndicator>
                ) : (
                  <ChartPlaceholder>
                    <StatValue color="#10B981">{getApprovalRate()}%</StatValue>
                    <StatLabel>Taux d'approbation</StatLabel>
                  </ChartPlaceholder>
                )}
              </ChartContainer>
              <StatsList>
                <StatsItem>
                  <StatsItemLabel>
                    <StatusIndicator color="#F59E0B" />
                    En attente
                  </StatsItemLabel>
                  <StatsItemValue color="#F59E0B">
                    {stats.vacations.pending}
                  </StatsItemValue>
                </StatsItem>
                <StatsItem>
                  <StatsItemLabel>
                    <StatusIndicator color="#10B981" />
                    Approuvées
                  </StatsItemLabel>
                  <StatsItemValue color="#10B981">
                    {stats.vacations.approved}
                  </StatsItemValue>
                </StatsItem>
                <StatsItem>
                  <StatsItemLabel>
                    <StatusIndicator color="#EF4444" />
                    Rejetées
                  </StatsItemLabel>
                  <StatsItemValue color="#EF4444">
                    {stats.vacations.rejected}
                  </StatsItemValue>
                </StatsItem>
              </StatsList>
              <ProgressBar value={getApprovalRate()} color="#10B981" />
            </StatsCard>
          </StatsGrid>
        </>
      )}
    </StatsContainer>
  );
};

export default Stats;
