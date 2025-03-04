import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import WeeklyScheduleGrid from "../components/schedule/WeeklyScheduleGrid";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import { FormSelect } from "../components/ui/Form";
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
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ScheduleFilters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const WeekNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const WeekActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
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
  min-width: 200px;
`;

const CurrentWeek = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`;

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
  const [isEditing, setIsEditing] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const { employees, loading: loadingEmployees } = useEmployees();
  const {
    weeklySchedules,
    loading: loadingSchedules,
    fetchWeeklySchedules,
    updateWeeklySchedule,
    createWeeklySchedule,
  } = useWeeklySchedules();

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

  // Filtrer les employés en fonction du département et du statut
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

      setFilteredEmployees(filtered);
    }
  }, [employees, selectedDepartment, selectedStatus]);

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

  // Activer le mode édition
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Annuler l'édition
  const handleCancelClick = () => {
    setIsEditing(false);
  };

  // Préparer les données du planning pour l'affichage
  useEffect(() => {
    const fetchSchedules = async () => {
      if (weeklySchedules.length > 0 && filteredEmployees.length > 0) {
        // Transformer les données pour le composant de grille
        const formattedData = weeklySchedules.map((schedule) => ({
          employeeId: schedule.employee_id,
          days: schedule.schedule_data,
        }));

        setScheduleData(formattedData);
      } else {
        setScheduleData([]);
      }
    };

    fetchSchedules();
  }, [weeklySchedules, filteredEmployees]);

  // Enregistrer les modifications
  const handleSaveClick = async () => {
    try {
      // Pour chaque employé dans le planning
      for (const employeeSchedule of scheduleData) {
        const employeeId = employeeSchedule.employeeId;
        const days = employeeSchedule.days;

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
      }

      toast.success("Planning enregistré avec succès");
      setIsEditing(false);

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
              <Button onClick={goToPreviousWeek} variant="outline">
                Semaine précédente
              </Button>
              <Button onClick={goToCurrentWeek} variant="outline">
                Semaine actuelle
              </Button>
              <Button onClick={goToNextWeek} variant="outline">
                Semaine suivante
              </Button>
            </WeekActions>

            {isEditing ? (
              <div>
                <Button onClick={handleSaveClick} variant="primary">
                  Enregistrer
                </Button>
                <Button onClick={handleCancelClick} variant="outline">
                  Annuler
                </Button>
              </div>
            ) : (
              <Button onClick={handleEditClick} variant="primary">
                Modifier
              </Button>
            )}
          </WeekNavigation>
        </ScheduleHeader>

        <FilterContainer>
          <FilterSelect
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            placeholder="Tous les départements"
          >
            <option value="">Tous les départements</option>
            <option value="IT">IT</option>
            <option value="RH">RH</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Ventes">Ventes</option>
          </FilterSelect>

          <FilterSelect
            value={selectedStatus}
            onChange={handleStatusChange}
            placeholder="Tous les statuts"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </FilterSelect>
        </FilterContainer>

        <Card>
          <CardHeader>Planning hebdomadaire</CardHeader>
          <CardContent>
            {filteredEmployees.length === 0 ? (
              <div>Aucun employé trouvé avec les filtres sélectionnés.</div>
            ) : (
              <WeeklyScheduleGrid
                employees={filteredEmployees}
                weekStart={currentWeekStart}
                scheduleData={scheduleData}
                onChange={handleScheduleChange}
                readOnly={!isEditing}
              />
            )}
          </CardContent>
        </Card>
      </ScheduleContainer>
    </div>
  );
};

export default WeeklySchedulePage;
