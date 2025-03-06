import styled from "styled-components";

// Composants stylisés
const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const StatsCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const ChartContainer = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => `${theme.colors.background}66`};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 1rem;
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
`;

const StatsItemValue = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

// Composant Stats
const Stats = () => {
  // Données fictives pour les statistiques
  const employeeStats = {
    total: 24,
    active: 22,
    onVacation: 2,
    departments: [
      { name: "Marketing", count: 6 },
      { name: "Développement", count: 8 },
      { name: "Design", count: 4 },
      { name: "RH", count: 3 },
      { name: "Finance", count: 3 },
    ],
  };

  const planningStats = {
    totalEvents: 156,
    thisWeek: 32,
    nextWeek: 28,
    completion: 87,
  };

  return (
    <StatsContainer>
      <PageHeader>
        <PageTitle>Statistiques</PageTitle>
        <PageDescription>
          Consultez les statistiques et les analyses de votre organisation.
        </PageDescription>
      </PageHeader>

      <StatsGrid>
        <StatsCard>
          <CardTitle>Employés</CardTitle>
          <ChartContainer>
            <ChartPlaceholder>
              <StatValue>{employeeStats.total}</StatValue>
              <StatLabel>Employés au total</StatLabel>
            </ChartPlaceholder>
          </ChartContainer>
          <StatsList>
            <StatsItem>
              <StatsItemLabel>Actifs</StatsItemLabel>
              <StatsItemValue>{employeeStats.active}</StatsItemValue>
            </StatsItem>
            <StatsItem>
              <StatsItemLabel>En congé</StatsItemLabel>
              <StatsItemValue>{employeeStats.onVacation}</StatsItemValue>
            </StatsItem>
            <StatsItem>
              <StatsItemLabel>Taux de présence</StatsItemLabel>
              <StatsItemValue>
                {Math.round((employeeStats.active / employeeStats.total) * 100)}
                %
              </StatsItemValue>
            </StatsItem>
          </StatsList>
        </StatsCard>

        <StatsCard>
          <CardTitle>Répartition par département</CardTitle>
          <ChartContainer>
            <ChartPlaceholder>
              Graphique de répartition par département
            </ChartPlaceholder>
          </ChartContainer>
          <StatsList>
            {employeeStats.departments.map((dept, index) => (
              <StatsItem key={index}>
                <StatsItemLabel>{dept.name}</StatsItemLabel>
                <StatsItemValue>{dept.count}</StatsItemValue>
              </StatsItem>
            ))}
          </StatsList>
        </StatsCard>

        <StatsCard>
          <CardTitle>Planning</CardTitle>
          <ChartContainer>
            <ChartPlaceholder>
              <StatValue color="#8338ec">{planningStats.totalEvents}</StatValue>
              <StatLabel>Événements planifiés</StatLabel>
            </ChartPlaceholder>
          </ChartContainer>
          <StatsList>
            <StatsItem>
              <StatsItemLabel>Cette semaine</StatsItemLabel>
              <StatsItemValue>{planningStats.thisWeek}</StatsItemValue>
            </StatsItem>
            <StatsItem>
              <StatsItemLabel>Semaine prochaine</StatsItemLabel>
              <StatsItemValue>{planningStats.nextWeek}</StatsItemValue>
            </StatsItem>
            <StatsItem>
              <StatsItemLabel>Taux de complétion</StatsItemLabel>
              <StatsItemValue>{planningStats.completion}%</StatsItemValue>
            </StatsItem>
          </StatsList>
          <ProgressBar value={planningStats.completion} color="#8338ec" />
        </StatsCard>
      </StatsGrid>
    </StatsContainer>
  );
};

export default Stats;
