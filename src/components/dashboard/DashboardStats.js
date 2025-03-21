import { FiUsers } from "react-icons/fi";
import styled from "styled-components";
import useEmployees from "../../hooks/useEmployees";

// Composants stylisés
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  flex-direction: column;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin-bottom: 0.5rem;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DashboardStats = () => {
  const { employees, loading: employeesLoading } = useEmployees();

  return (
    <StatsContainer>
      {employeesLoading ? (
        <LoadingIndicator>Chargement des statistiques...</LoadingIndicator>
      ) : (
        <>
          <StatCard>
            <StatHeader>
              <StatTitle>Total employés</StatTitle>
              <StatIcon color="#4F46E5">
                <FiUsers />
              </StatIcon>
            </StatHeader>
            <StatValue>{employees?.length || 0}</StatValue>
          </StatCard>
        </>
      )}
    </StatsContainer>
  );
};

export default DashboardStats;
