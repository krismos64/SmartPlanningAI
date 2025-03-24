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
  FiSun,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import useActivities from "../../hooks/useActivities";

// Animations
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

const ActivityEmployee = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
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
const getActivityColor = (type, entity_type) => {
  // Si c'est une activité liée aux congés, utiliser une couleur spécifique
  if (entity_type === "vacation") {
    return "#6366F1"; // indigo pour les congés
  }

  // Sinon, utiliser la couleur en fonction du type d'activité
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
    case "vacation_status_update":
      return "#6366F1"; // indigo
    default:
      return "#4F46E5"; // indigo (par défaut)
  }
};

// Fonction pour obtenir l'icône en fonction du type d'activité
const getActivityIcon = (type, entity_type) => {
  // Si c'est une activité liée aux congés, utiliser une icône spécifique
  if (entity_type === "vacation") {
    return <FiSun />;
  }

  // Sinon, utiliser l'icône en fonction du type d'activité
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
    case "vacation_status_update":
      return <FiSun />;
    default:
      return <FiInfo />;
  }
};

// Fonction pour obtenir le libellé en fonction du type d'activité
const getActivityTypeLabel = (type, entity_type, details) => {
  // Si c'est une activité liée aux congés, utiliser un libellé spécifique
  if (entity_type === "vacation") {
    switch (type) {
      case "create":
        return `Nouvelle demande`;
      case "update":
        return `Modification congé`;
      case "delete":
        return `Suppression congé`;
      case "approve":
        return `Approbation congé`;
      case "reject":
        return `Rejet congé`;
      case "vacation_status_update":
        // Récupérer le nouveau statut si disponible
        let statusText = "";
        if (details && typeof details === "object" && details.new_status) {
          statusText = translateVacationStatus(details.new_status);
        }
        return `Congé ${statusText}`;
      default:
        return `Congé`;
    }
  }

  // Sinon, utiliser le libellé en fonction du type d'activité
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
    case "vacation_status_update":
      return "Mise à jour statut";
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

// Fonction pour traduire le statut de congé en français
const translateVacationStatus = (status) => {
  switch (status) {
    case "approved":
      return "approuvé";
    case "rejected":
      return "rejeté";
    case "pending":
      return "en attente";
    default:
      return status || "non spécifié";
  }
};

const RecentActivities = () => {
  const navigate = useNavigate();
  const {
    activities,
    loading,
    error,
    fetchActivities,
    formatActivityDescription,
  } = useActivities();

  const handleRefresh = () => {
    fetchActivities(true);
  };

  const handleViewAllActivities = () => {
    navigate("/activities");
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

  // Fonction pour extraire les détails pertinents d'une activité
  const extractActivityDetails = (activity) => {
    if (!activity || !activity.details) return {};

    let details = activity.details;
    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch (e) {
        return {};
      }
    }

    // Extraire les informations pertinentes
    return {
      employeeName: details.employee_name || "",
      employeeId: details.employee_id || "",
      vacationType: details.type || details.vacation_type || "",
      startDate: details.start_date || "",
      endDate: details.end_date || "",
      status: details.status || details.new_status || "",
      previousStatus: details.previous_status || "",
    };
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
                const color = getActivityColor(
                  activity.type,
                  activity.entity_type
                );
                const { date, time } = formatDateTime(activity.timestamp);
                const details = extractActivityDetails(activity);

                // Traduire le type et le statut de congé si c'est une activité liée aux congés
                if (activity.entity_type === "vacation") {
                  // Les traductions sont utilisées directement dans getActivityTypeLabel, pas besoin de stocker ici
                }

                return (
                  <ActivityItem
                    key={activity.id || index}
                    color={color}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                  >
                    <ActivityIcon color={color}>
                      {getActivityIcon(activity.type, activity.entity_type)}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityDescription>
                        {formatActivityDescription(activity)}
                        <Badge color={color}>
                          {getActivityTypeLabel(
                            activity.type,
                            activity.entity_type,
                            activity.details
                          )}
                        </Badge>
                      </ActivityDescription>
                      <ActivityMeta>
                        <ActivityTime>
                          <FiClock size={12} /> {time}
                        </ActivityTime>
                        <ActivityDate>
                          <FiCalendar size={12} /> {date}
                        </ActivityDate>
                        {activity.entity_type === "vacation" &&
                          details.employeeName && (
                            <ActivityEmployee>
                              <FiUser size={12} /> {details.employeeName}
                            </ActivityEmployee>
                          )}
                      </ActivityMeta>
                    </ActivityContent>
                  </ActivityItem>
                );
              })}
            </ActivitiesList>
          </motion.div>

          {activitiesList.length > 5 && (
            <ViewAllButton onClick={handleViewAllActivities}>
              Voir toutes les activités ({activitiesList.length})
            </ViewAllButton>
          )}
        </>
      )}
    </ActivitiesContainer>
  );
};

export default RecentActivities;
