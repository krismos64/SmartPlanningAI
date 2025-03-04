import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import EmployeeScheduleForm from "../components/schedule/EmployeeScheduleForm";
import WeeklyScheduleGrid from "../components/schedule/WeeklyScheduleGrid";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import { FormInput, FormSelect } from "../components/ui/Form";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import useEmployees from "../hooks/useEmployees";
import useWeeklySchedules from "../hooks/useWeeklySchedules";
import {
  addWeeks,
  formatDate,
  formatDateForInput,
  getWeekEnd,
  getWeekStart,
} from "../utils/dateUtils";

// Styles
const ScheduleContainer = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
    gap: 2rem;
  }
`;

const ScheduleHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
`;

const ScheduleFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const WeekNavigation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const WeekActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 768px) {
    min-width: 200px;
    width: auto;
  }
`;

const SummaryContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  font-weight: 500;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: ${(props) => (props.isNegative ? "#ef4444" : "#10b981")};
`;

const FilterSelect = styled(FormSelect)`
  width: 100%;

  @media (min-width: 768px) {
    min-width: 200px;
    width: auto;
  }
`;

const CurrentWeek = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 1.25rem;
    text-align: left;
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const EmployeeSearchInput = styled(FormInput)`
  width: 100%;
`;

const NoResultsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResponsiveButton = styled(Button)`
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;

  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
`;

// Fonction utilitaire pour convertir les données existantes au nouveau format
const convertToNewFormat = (day) => {
  // Si le jour a déjà le format attendu, le retourner tel quel
  if (day.type) {
    return { ...day };
  }

  // Sinon, convertir au nouveau format
  return {
    type: day.absence ? "absence" : "work",
    hours: day.hours || "0",
    absence: day.absence || "",
    note: day.note || "",
    timeSlots:
      day.timeSlots ||
      (day.hours && parseFloat(day.hours) > 0
        ? [{ start: "09:00", end: "17:00" }]
        : []),
  };
};

/**
 * Page de gestion des plannings hebdomadaires
 */
const WeeklySchedulePage = () => {
  const navigate = useNavigate();
  const { weekParam } = useParams();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    weekParam ? new Date(weekParam) : getWeekStart(new Date())
  );
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const { employees, loading: loadingEmployees } = useEmployees();
  const {
    weeklySchedules,
    loading: loadingSchedules,
    fetchWeeklySchedules,
    updateWeeklySchedule,
    createWeeklySchedule,
  } = useWeeklySchedules();

  // Obtenir l'employé en cours d'édition
  const editingEmployee = useMemo(() => {
    if (!editingEmployeeId) return null;
    return employees.find((emp) => emp.id === editingEmployeeId) || null;
  }, [editingEmployeeId, employees]);

  // Extraire les départements uniques des employés
  const uniqueDepartments = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    const departments = employees
      .map((emp) => emp.department)
      .filter((dept, index, self) => dept && self.indexOf(dept) === index);

    return departments.sort();
  }, [employees]);

  // Charger les données au montage et lors du changement de semaine
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Formater la date pour l'API
        const formattedDate = formatDateForInput(currentWeekStart);

        // Mettre à jour l'URL sans recharger la page
        navigate(`/weekly-schedule/${formattedDate}`, { replace: true });

        // Récupérer les plannings pour la semaine sélectionnée
        await fetchWeeklySchedules({ week_start: formattedDate });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des plannings");
      }
    };

    fetchData();
  }, [currentWeekStart, fetchWeeklySchedules, navigate]);

  // Filtrer les employés en fonction du département, du statut et de la recherche
  useEffect(() => {
    if (employees.length > 0) {
      let filtered = [...employees];

      if (selectedDepartment) {
        filtered = filtered.filter(
          (emp) => emp.department === selectedDepartment
        );
      }

      if (selectedStatus) {
        filtered = filtered.filter((emp) => emp.status === selectedStatus);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (emp) =>
            emp.firstName.toLowerCase().includes(query) ||
            emp.lastName.toLowerCase().includes(query) ||
            (emp.email && emp.email.toLowerCase().includes(query))
        );
      }

      setFilteredEmployees(filtered);
    }
  }, [employees, selectedDepartment, selectedStatus, searchQuery]);

  // Préparer les données du planning pour l'affichage
  useEffect(() => {
    if (weeklySchedules.length > 0 && filteredEmployees.length > 0) {
      // Transformer les données pour le composant de grille
      const formattedData = [];

      // Pour chaque employé filtré, chercher son planning ou en créer un vide
      for (const employee of filteredEmployees) {
        const existingSchedule = weeklySchedules.find(
          (schedule) => schedule.employee_id === employee.id
        );

        if (existingSchedule) {
          // Convertir les données au nouveau format si nécessaire
          const days = existingSchedule.schedule_data.map((day) =>
            convertToNewFormat(day)
          );

          formattedData.push({
            employeeId: existingSchedule.employee_id,
            days: days,
          });
        } else {
          // Créer un planning vide pour cet employé avec le nouveau format
          formattedData.push({
            employeeId: employee.id,
            days: Array(7)
              .fill()
              .map(() => ({
                type: "work",
                hours: "0",
                absence: "",
                note: "",
                timeSlots: [],
              })),
          });
        }
      }

      setScheduleData(formattedData);
    } else {
      setScheduleData([]);
    }
  }, [weeklySchedules, filteredEmployees]);

  // Navigation vers la semaine précédente
  const goToPreviousWeek = () => {
    const prevWeek = addWeeks(currentWeekStart, -1);
    setCurrentWeekStart(prevWeek);
  };

  // Navigation vers la semaine suivante
  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(nextWeek);
  };

  // Navigation vers la semaine courante
  const goToCurrentWeek = () => {
    const currentWeek = getWeekStart(new Date());
    setCurrentWeekStart(currentWeek);
  };

  // Gestion du changement de département
  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  // Gestion du changement de statut
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Gestion de la recherche d'employé
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Activer le mode édition pour un employé spécifique
  const handleEditEmployee = (employeeId) => {
    setEditingEmployeeId(employeeId);
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
  };

  // Enregistrer les modifications pour un employé spécifique
  const handleSaveEmployeeSchedule = async (updatedSchedule) => {
    try {
      const employeeId = updatedSchedule.employeeId;
      const days = updatedSchedule.days;

      // Calculer le total des heures
      const totalHours = days.reduce(
        (sum, day) => sum + (parseFloat(day.hours) || 0),
        0
      );

      // Vérifier si un planning existe déjà pour cet employé cette semaine
      const existingSchedule = weeklySchedules.find(
        (schedule) =>
          schedule.employee_id === employeeId &&
          formatDateForInput(new Date(schedule.week_start)) ===
            formatDateForInput(currentWeekStart)
      );

      const scheduleData = {
        employee_id: employeeId,
        week_start: formatDateForInput(currentWeekStart),
        week_end: formatDateForInput(getWeekEnd(currentWeekStart)),
        schedule_data: days,
        total_hours: totalHours,
        status: "active",
      };

      if (existingSchedule) {
        // Mettre à jour le planning existant
        await updateWeeklySchedule(existingSchedule.id, scheduleData);
      } else {
        // Créer un nouveau planning
        await createWeeklySchedule(scheduleData);
      }

      toast.success("Planning enregistré avec succès");
      setEditingEmployeeId(null);

      // Recharger les données
      const formattedDate = formatDateForInput(currentWeekStart);
      await fetchWeeklySchedules({ week_start: formattedDate });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du planning:", error);
      toast.error("Erreur lors de l'enregistrement du planning");
    }
  };

  // Gérer les modifications du planning
  const handleScheduleChange = (newScheduleData) => {
    setScheduleData(newScheduleData);
  };

  // Afficher un spinner pendant le chargement
  if (loadingEmployees || loadingSchedules) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="Planning hebdomadaire" />

      <ScheduleContainer>
        <ScheduleHeader>
          <div>
            <CurrentWeek>
              Semaine du {formatDate(currentWeekStart)} au{" "}
              {formatDate(getWeekEnd(currentWeekStart))}
            </CurrentWeek>
          </div>

          <WeekNavigation>
            <WeekActions>
              <ResponsiveButton onClick={goToPreviousWeek} variant="outline">
                Semaine précédente
              </ResponsiveButton>
              <ResponsiveButton onClick={goToCurrentWeek} variant="outline">
                Semaine actuelle
              </ResponsiveButton>
              <ResponsiveButton onClick={goToNextWeek} variant="outline">
                Semaine suivante
              </ResponsiveButton>
            </WeekActions>
          </WeekNavigation>
        </ScheduleHeader>

        {!editingEmployee && (
          <>
            <SearchContainer>
              <EmployeeSearchInput
                type="text"
                placeholder="Rechercher un employé par nom, prénom ou email..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </SearchContainer>

            <ScheduleFilters>
              <FilterContainer>
                <FilterSelect
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  placeholder="Tous les départements"
                >
                  <option value="">Tous les départements</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </FilterSelect>
              </FilterContainer>

              <FilterContainer>
                <FilterSelect
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  placeholder="Tous les statuts"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="vacation">En congé</option>
                  <option value="sick">Malade</option>
                </FilterSelect>
              </FilterContainer>
            </ScheduleFilters>

            <Card>
              <CardHeader>Planning hebdomadaire</CardHeader>
              <CardContent>
                {filteredEmployees.length === 0 ? (
                  <NoResultsMessage>
                    {searchQuery
                      ? "Aucun employé trouvé avec cette recherche."
                      : "Aucun employé trouvé avec les filtres sélectionnés."}
                  </NoResultsMessage>
                ) : (
                  <WeeklyScheduleGrid
                    employees={filteredEmployees}
                    weekStart={currentWeekStart}
                    scheduleData={scheduleData}
                    onChange={handleScheduleChange}
                    readOnly={true}
                    onEditEmployee={handleEditEmployee}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {editingEmployee && (
          <EmployeeScheduleForm
            employee={editingEmployee}
            weekStart={currentWeekStart}
            scheduleData={scheduleData}
            onSave={handleSaveEmployeeSchedule}
            onCancel={handleCancelEdit}
          />
        )}
      </ScheduleContainer>
    </div>
  );
};

export default WeeklySchedulePage;
