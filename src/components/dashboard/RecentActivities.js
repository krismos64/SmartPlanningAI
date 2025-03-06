import { FiRefreshCw } from "react-icons/fi";
import styled from "styled-components";
import useActivities from "../../hooks/useActivities";

// Composants stylisés
const ActivitiesContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: 1.5rem;
`;

const ActivitiesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ActivitiesTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActivitiesList = styled.div`
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
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.error};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ViewAllButton = styled.button`
  display: block;
  width: 100%;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
  }
`;

// Fonction pour obtenir la couleur en fonction du type d'activité
const getActivityColor = (type) => {
  switch (type) {
    case "create":
      return "#10B981"; // vert
    case "update":
      return "#F59E0B"; // orange
    case "delete":
      return "#EF4444"; // rouge
    case "approve":
      return "#3B82F6"; // bleu
    default:
      return "#4F46E5"; // violet (par défaut)
  }
};

// Fonction pour obtenir l'icône en fonction du type d'activité
const getActivityIcon = (type) => {
  switch (type) {
    case "create":
      return "+";
    case "update":
      return "✎";
    case "delete":
      return "−";
    case "approve":
      return "✓";
    default:
      return "•";
  }
};

const RecentActivities = () => {
  const {
    activities,
    loading,
    error,
    fetchActivities,
    formatActivityDescription,
    formatActivityDate,
  } = useActivities();

  const handleRefresh = () => {
    fetchActivities(true);
  };

  // S'assurer que activities est un tableau
  const activitiesList = Array.isArray(activities) ? activities : [];

  return (
    <ActivitiesContainer>
      <ActivitiesHeader>
        <ActivitiesTitle>Activités récentes</ActivitiesTitle>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={16} />
          Rafraîchir
        </RefreshButton>
      </ActivitiesHeader>

      {loading ? (
        <LoadingIndicator>Chargement des activités...</LoadingIndicator>
      ) : error ? (
        <ErrorMessage>
          Une erreur est survenue lors du chargement des activités.
        </ErrorMessage>
      ) : activitiesList.length === 0 ? (
        <EmptyMessage>Aucune activité récente.</EmptyMessage>
      ) : (
        <>
          <ActivitiesList>
            {activitiesList.slice(0, 5).map((activity) => (
              <ActivityItem key={activity.id}>
                <ActivityIcon color={getActivityColor(activity.type)}>
                  {getActivityIcon(activity.type)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityDescription>
                    {formatActivityDescription(activity)}
                  </ActivityDescription>
                  <ActivityTime>
                    {formatActivityDate(activity.timestamp)}
                  </ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivitiesList>

          {activitiesList.length > 5 && (
            <ViewAllButton>Voir toutes les activités</ViewAllButton>
          )}
        </>
      )}
    </ActivitiesContainer>
  );
};

export default RecentActivities;
