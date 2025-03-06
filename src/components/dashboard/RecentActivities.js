import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit,
  FiInfo,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import styled, { keyframes } from "styled-components";
import useActivities from "../../hooks/useActivities";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`;

// Composants stylisés
const ActivitiesContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const ActivitiesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.75rem;
`;

const ActivitiesTitle = styled.h3`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primaryLight};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary}22;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`;

const ActivitiesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all 0.3s ease;
  border-left: 3px solid ${({ color }) => color};
  background-color: ${({ theme, color }) => `${color}08`};

  &:hover {
    background-color: ${({ theme, color }) => `${color}15`};
    transform: translateX(5px);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ color }) => `${color}22`};
  color: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    animation: ${pulse} 1.5s infinite;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityDescription = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.4;
`;

const ActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ActivityTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActivityDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  svg {
    animation: spin 1s linear infinite;
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ViewAllButton = styled.button`
  display: block;
  width: 100%;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 0.75rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ color }) => color};
  color: white;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 0.5rem;
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
    case "reject":
      return "#EC4899"; // rose
    case "system":
      return "#8B5CF6"; // violet
    default:
      return "#4F46E5"; // indigo (par défaut)
  }
};

// Fonction pour obtenir l'icône en fonction du type d'activité
const getActivityIcon = (type) => {
  switch (type) {
    case "create":
      return <FiPlus />;
    case "update":
      return <FiEdit />;
    case "delete":
      return <FiTrash2 />;
    case "approve":
      return <FiCheck />;
    case "reject":
      return <FiX />;
    case "system":
      return <FiInfo />;
    default:
      return <FiInfo />;
  }
};

// Fonction pour obtenir le libellé en fonction du type d'activité
const getActivityTypeLabel = (type) => {
  switch (type) {
    case "create":
      return "Création";
    case "update":
      return "Modification";
    case "delete":
      return "Suppression";
    case "approve":
      return "Approbation";
    case "reject":
      return "Rejet";
    case "system":
      return "Système";
    default:
      return "Information";
  }
};

// Fonction pour formater la date et l'heure
const formatDateTime = (timestamp) => {
  if (!timestamp) return { date: "", time: "" };

  const date = new Date(timestamp);

  return {
    date: format(date, "dd MMMM yyyy", { locale: fr }),
    time: format(date, "HH:mm:ss", { locale: fr }),
  };
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

  // Variantes d'animation pour les éléments de la liste
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <ActivitiesContainer>
      <ActivitiesHeader>
        <ActivitiesTitle>
          <FiClock size={18} /> Activités récentes
          {!loading && activitiesList.length > 0 && (
            <Badge color="#4F46E5">{activitiesList.length}</Badge>
          )}
        </ActivitiesTitle>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualiser
        </RefreshButton>
      </ActivitiesHeader>

      {loading ? (
        <LoadingIndicator>
          <FiRefreshCw size={32} />
          <div>Chargement des activités...</div>
        </LoadingIndicator>
      ) : error ? (
        <ErrorMessage>
          <FiX size={32} />
          <div>Une erreur est survenue lors du chargement des activités.</div>
        </ErrorMessage>
      ) : activitiesList.length === 0 ? (
        <EmptyMessage>
          <FiInfo size={32} />
          <div>Aucune activité récente.</div>
        </EmptyMessage>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <ActivitiesList>
              {activitiesList.slice(0, 5).map((activity, index) => {
                const color = getActivityColor(activity.type);
                const { date, time } = formatDateTime(activity.timestamp);

                return (
                  <ActivityItem
                    key={activity.id || index}
                    color={color}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                  >
                    <ActivityIcon color={color}>
                      {getActivityIcon(activity.type)}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityDescription>
                        {formatActivityDescription(activity)}
                        <Badge color={color}>
                          {getActivityTypeLabel(activity.type)}
                        </Badge>
                      </ActivityDescription>
                      <ActivityMeta>
                        <ActivityTime>
                          <FiClock size={12} /> {time}
                        </ActivityTime>
                        <ActivityDate>
                          <FiCalendar size={12} /> {date}
                        </ActivityDate>
                      </ActivityMeta>
                    </ActivityContent>
                  </ActivityItem>
                );
              })}
            </ActivitiesList>
          </motion.div>

          {activitiesList.length > 5 && (
            <ViewAllButton>
              Voir toutes les activités ({activitiesList.length})
            </ViewAllButton>
          )}
        </>
      )}
    </ActivitiesContainer>
  );
};

export default RecentActivities;
