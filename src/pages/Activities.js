import { motion } from "framer-motion";
import { useState } from "react";
import {
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiEdit,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSun,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import styled from "styled-components";
import useActivities from "../hooks/useActivities";
import {
  getActivityColor,
  getActivityIcon,
  getActivityTypeLabel,
} from "../utils/activityUtils";
import { formatDateTime } from "../utils/dateUtils";

// Composants stylisés
const PageContainer = styled.div`
  padding: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primaryLight : theme.colors.background};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FilterDropdown = styled.div`
  position: relative;
`;

const DropdownButton = styled(FilterButton)`
  min-width: 150px;
  justify-content: space-between;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 200px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 10;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAlt};
  }

  svg {
    color: ${({ theme, selected }) =>
      selected ? theme.colors.primary : "transparent"};
  }
`;

const ActiveFiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ActiveFilter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: ${({ theme, color }) =>
    color ? `${color}15` : theme.colors.primaryLight};
  border: 1px solid ${({ theme, color }) => color || theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.8rem;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: ${({ theme }) => theme.colors.text.secondary};
    padding: 0;
    margin-left: 0.25rem;

    &:hover {
      color: ${({ theme }) => theme.colors.error};
    }
  }
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  width: 150px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: none;
  background-color: ${({ theme }) => theme.colors.primaryLight};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}22;
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
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  transition: all 0.3s ease;
  border-left: 3px solid ${({ color }) => color};
  background-color: ${({ theme, color }) => `${color}08`};
  box-shadow: ${({ theme }) => theme.shadows.small};

  &:hover {
    background-color: ${({ theme, color }) => `${color}15`};
    transform: translateX(5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primaryLight : theme.colors.background};
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.text.primary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

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

// Types d'activités disponibles
const ACTIVITY_TYPES = [
  { id: "create", label: "Création", icon: <FiPlus /> },
  { id: "update", label: "Modification", icon: <FiEdit /> },
  { id: "delete", label: "Suppression", icon: <FiTrash2 /> },
  { id: "approve", label: "Approbation", icon: <FiCheck /> },
  { id: "reject", label: "Rejet", icon: <FiX /> },
  {
    id: "vacation_status_update",
    label: "Mise à jour statut",
    icon: <FiSun />,
  },
];

// Types d'entités disponibles
const ENTITY_TYPES = [
  { id: "vacation", label: "Congés", icon: <FiSun /> },
  { id: "employee", label: "Employés", icon: <FiUser /> },
  { id: "schedule", label: "Planning", icon: <FiCalendar /> },
];

// Types de congés disponibles
const VACATION_TYPES = [
  { id: "paid", label: "Congé payé" },
  { id: "unpaid", label: "Congé non payé" },
  { id: "sick", label: "Congé maladie" },
  { id: "other", label: "Autre congé" },
];

const Activities = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    activityTypes: [],
    entityTypes: [],
    vacationTypes: [],
    dateRange: {
      startDate: "",
      endDate: "",
    },
  });

  // États pour les dropdowns
  const [openDropdown, setOpenDropdown] = useState(null);

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

  // Gérer l'ouverture/fermeture des dropdowns
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Gérer la sélection d'un filtre
  const toggleFilter = (type, value) => {
    setFilters((prev) => {
      const currentFilters = [...prev[type]];
      const index = currentFilters.indexOf(value);

      if (index === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(index, 1);
      }

      return {
        ...prev,
        [type]: currentFilters,
      };
    });

    // Réinitialiser la pagination
    setCurrentPage(1);
  };

  // Gérer la suppression d'un filtre
  const removeFilter = (type, value) => {
    setFilters((prev) => {
      const currentFilters = [...prev[type]];
      const index = currentFilters.indexOf(value);

      if (index !== -1) {
        currentFilters.splice(index, 1);
      }

      return {
        ...prev,
        [type]: currentFilters,
      };
    });
  };

  // Gérer la modification de la plage de dates
  const handleDateChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value,
      },
    }));

    // Réinitialiser la pagination
    setCurrentPage(1);
  };

  // Filtrer les activités en fonction des filtres sélectionnés
  const filteredActivities = Array.isArray(activities)
    ? activities.filter((activity) => {
        // Filtrer par terme de recherche
        const description = formatActivityDescription(activity);
        const matchesSearch = description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Filtrer par type d'activité
        const matchesActivityType =
          filters.activityTypes.length === 0 ||
          filters.activityTypes.includes(activity.type);

        // Filtrer par type d'entité
        const matchesEntityType =
          filters.entityTypes.length === 0 ||
          filters.entityTypes.includes(activity.entity_type);

        // Filtrer par type de congé (uniquement pour les activités de type congé)
        let matchesVacationType = true;
        if (
          activity.entity_type === "vacation" &&
          filters.vacationTypes.length > 0
        ) {
          const details = extractActivityDetails(activity);
          matchesVacationType = filters.vacationTypes.includes(
            details.vacationType
          );
        }

        // Filtrer par plage de dates
        let matchesDateRange = true;
        if (filters.dateRange.startDate || filters.dateRange.endDate) {
          const activityDate = new Date(activity.timestamp);

          if (filters.dateRange.startDate) {
            const startDate = new Date(filters.dateRange.startDate);
            startDate.setHours(0, 0, 0, 0);
            matchesDateRange = matchesDateRange && activityDate >= startDate;
          }

          if (filters.dateRange.endDate) {
            const endDate = new Date(filters.dateRange.endDate);
            endDate.setHours(23, 59, 59, 999);
            matchesDateRange = matchesDateRange && activityDate <= endDate;
          }
        }

        return (
          matchesSearch &&
          matchesActivityType &&
          matchesEntityType &&
          matchesVacationType &&
          matchesDateRange
        );
      })
    : [];

  // Calculer les activités à afficher pour la pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentActivities = filteredActivities.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);

  // Générer les boutons de pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

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

  // Obtenir les filtres actifs pour l'affichage
  const getActiveFilters = () => {
    const activeFilters = [];

    // Filtres de type d'activité
    filters.activityTypes.forEach((type) => {
      const activityType = ACTIVITY_TYPES.find((t) => t.id === type);
      if (activityType) {
        activeFilters.push({
          type: "activityTypes",
          id: type,
          label: activityType.label,
          color: getActivityColor(type, null),
        });
      }
    });

    // Filtres de type d'entité
    filters.entityTypes.forEach((type) => {
      const entityType = ENTITY_TYPES.find((t) => t.id === type);
      if (entityType) {
        activeFilters.push({
          type: "entityTypes",
          id: type,
          label: entityType.label,
          color: type === "vacation" ? "#6366F1" : "#4F46E5",
        });
      }
    });

    // Filtres de type de congé
    filters.vacationTypes.forEach((type) => {
      const vacationType = VACATION_TYPES.find((t) => t.id === type);
      if (vacationType) {
        activeFilters.push({
          type: "vacationTypes",
          id: type,
          label: vacationType.label,
          color: "#6366F1",
        });
      }
    });

    return activeFilters;
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Historique des activités</PageTitle>
        <RefreshButton onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Actualiser
        </RefreshButton>
      </PageHeader>

      <FiltersContainer>
        <SearchInput>
          <FiSearch size={16} />
          <input
            type="text"
            placeholder="Rechercher dans les activités..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInput>

        {/* Filtre par type d'activité */}
        <FilterDropdown>
          <DropdownButton
            onClick={() => toggleDropdown("activityTypes")}
            active={filters.activityTypes.length > 0}
          >
            Type d'activité
            <FiChevronDown size={16} />
          </DropdownButton>
          {openDropdown === "activityTypes" && (
            <DropdownMenu>
              {ACTIVITY_TYPES.map((type) => (
                <DropdownItem
                  key={type.id}
                  onClick={() => toggleFilter("activityTypes", type.id)}
                  selected={filters.activityTypes.includes(type.id)}
                >
                  <FiCheck size={16} />
                  {type.icon} {type.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </FilterDropdown>

        {/* Filtre par type d'entité */}
        <FilterDropdown>
          <DropdownButton
            onClick={() => toggleDropdown("entityTypes")}
            active={filters.entityTypes.length > 0}
          >
            Type d'entité
            <FiChevronDown size={16} />
          </DropdownButton>
          {openDropdown === "entityTypes" && (
            <DropdownMenu>
              {ENTITY_TYPES.map((type) => (
                <DropdownItem
                  key={type.id}
                  onClick={() => toggleFilter("entityTypes", type.id)}
                  selected={filters.entityTypes.includes(type.id)}
                >
                  <FiCheck size={16} />
                  {type.icon} {type.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </FilterDropdown>

        {/* Filtre par type de congé */}
        <FilterDropdown>
          <DropdownButton
            onClick={() => toggleDropdown("vacationTypes")}
            active={filters.vacationTypes.length > 0}
          >
            Type de congé
            <FiChevronDown size={16} />
          </DropdownButton>
          {openDropdown === "vacationTypes" && (
            <DropdownMenu>
              {VACATION_TYPES.map((type) => (
                <DropdownItem
                  key={type.id}
                  onClick={() => toggleFilter("vacationTypes", type.id)}
                  selected={filters.vacationTypes.includes(type.id)}
                >
                  <FiCheck size={16} />
                  {type.label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          )}
        </FilterDropdown>

        {/* Filtre par plage de dates */}
        <DateRangeContainer>
          <DateInput
            type="date"
            placeholder="Date de début"
            value={filters.dateRange.startDate}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
          />
          <span>-</span>
          <DateInput
            type="date"
            placeholder="Date de fin"
            value={filters.dateRange.endDate}
            onChange={(e) => handleDateChange("endDate", e.target.value)}
          />
        </DateRangeContainer>
      </FiltersContainer>

      {/* Affichage des filtres actifs */}
      {getActiveFilters().length > 0 && (
        <ActiveFiltersContainer>
          {getActiveFilters().map((filter) => (
            <ActiveFilter
              key={`${filter.type}-${filter.id}`}
              color={filter.color}
            >
              {filter.label}
              <button onClick={() => removeFilter(filter.type, filter.id)}>
                <FiX size={14} />
              </button>
            </ActiveFilter>
          ))}
        </ActiveFiltersContainer>
      )}

      {loading ? (
        <LoadingIndicator>
          <FiRefreshCw size={32} />
          <div>Chargement des activités...</div>
        </LoadingIndicator>
      ) : error ? (
        <ErrorMessage>
          <div>Une erreur est survenue lors du chargement des activités.</div>
        </ErrorMessage>
      ) : filteredActivities.length === 0 ? (
        <EmptyMessage>
          <div>Aucune activité trouvée.</div>
        </EmptyMessage>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <ActivitiesList>
              {currentActivities.map((activity, index) => {
                const color = getActivityColor(
                  activity.type,
                  activity.entity_type
                );
                const { date, time } = formatDateTime(activity.timestamp);
                const details = extractActivityDetails(activity);

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

          {totalPages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </PaginationButton>

              {pageNumbers.map((number) => (
                <PaginationButton
                  key={number}
                  active={currentPage === number}
                  onClick={() => setCurrentPage(number)}
                >
                  {number}
                </PaginationButton>
              ))}

              <PaginationButton
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default Activities;
