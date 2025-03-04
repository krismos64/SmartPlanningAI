import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import useEmployees from "../../hooks/useEmployees";
import {
  formatDate,
  formatDateForInput,
  getWeekEnd,
  getWeekStart,
} from "../../utils/dateUtils";
import Button from "../ui/Button";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { FormGroup, FormInput, FormLabel } from "../ui/Form";
import { Spinner } from "../ui/Spinner";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";

// Composants stylisés
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormColumn = styled.div`
  flex: 1;
`;

const EmployeeSelectionContainer = styled.div`
  margin-bottom: 20px;
`;

const EmployeeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const EmployeeItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: ${({ selected }) => (selected ? "#e6f7ff" : "#f5f5f5")};
  border: 1px solid ${({ selected }) => (selected ? "#1890ff" : "#d9d9d9")};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: ${({ selected }) => (selected ? "#e6f7ff" : "#e8e8e8")};
  }
`;

const EmployeeCheckbox = styled.input`
  margin-right: 8px;
`;

const EmployeeName = styled.span`
  font-size: 0.9rem;
`;

const SummaryContainer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
`;

const SummaryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #e0e0e0;
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;

const WeeklyScheduleForm = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    weekStart: formatDateForInput(getWeekStart(new Date())),
    selectedEmployees: [],
    scheduleData: {},
  });
  const [errors, setErrors] = useState({});

  const { employees, loading } = useEmployees();

  // Initialiser le formulaire avec les données existantes si disponibles
  useEffect(() => {
    if (initialData) {
      setFormData({
        weekStart:
          initialData.week_start ||
          formatDateForInput(getWeekStart(new Date())),
        selectedEmployees: initialData.employee_ids || [],
        scheduleData: initialData.schedule_data || {},
      });
    }
  }, [initialData]);

  // Gérer le changement de date de début de semaine
  const handleWeekStartChange = (e) => {
    setFormData({
      ...formData,
      weekStart: e.target.value,
    });
  };

  // Gérer la sélection/désélection d'un employé
  const handleEmployeeToggle = (employeeId) => {
    const isSelected = formData.selectedEmployees.includes(employeeId);
    let newSelectedEmployees;

    if (isSelected) {
      // Désélectionner l'employé
      newSelectedEmployees = formData.selectedEmployees.filter(
        (id) => id !== employeeId
      );

      // Supprimer les données de planning pour cet employé
      const newScheduleData = { ...formData.scheduleData };
      delete newScheduleData[employeeId];

      setFormData({
        ...formData,
        selectedEmployees: newSelectedEmployees,
        scheduleData: newScheduleData,
      });
    } else {
      // Sélectionner l'employé
      newSelectedEmployees = [...formData.selectedEmployees, employeeId];

      // Initialiser les données de planning pour cet employé
      const newScheduleData = { ...formData.scheduleData };
      newScheduleData[employeeId] = Array(7).fill(0);

      setFormData({
        ...formData,
        selectedEmployees: newSelectedEmployees,
        scheduleData: newScheduleData,
      });
    }
  };

  // Gérer les changements dans la grille de planning
  const handleScheduleChange = (newScheduleData) => {
    setFormData({
      ...formData,
      scheduleData: newScheduleData,
    });
  };

  // Calculer le total des heures pour un employé
  const calculateEmployeeTotal = (employeeId) => {
    if (!formData.scheduleData[employeeId]) {
      return 0;
    }

    return formData.scheduleData[employeeId].reduce(
      (total, hours) => total + (hours || 0),
      0
    );
  };

  // Calculer le total des heures pour tous les employés
  const calculateTotalHours = () => {
    let total = 0;

    formData.selectedEmployees.forEach((employeeId) => {
      total += calculateEmployeeTotal(employeeId);
    });

    return total;
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Valider le formulaire
    if (formData.selectedEmployees.length === 0) {
      toast.error("Veuillez sélectionner au moins un employé");
      return;
    }

    // Préparer les données pour l'API
    const schedulesToSubmit = formData.selectedEmployees.map((employeeId) => {
      const employeeSchedule =
        formData.scheduleData[employeeId] || Array(7).fill(0);
      const totalHours = employeeSchedule.reduce(
        (sum, hours) => sum + (hours || 0),
        0
      );

      // Convertir les données pour l'API
      const scheduleDataForApi = {};
      employeeSchedule.forEach((hours, index) => {
        scheduleDataForApi[index] = hours || 0;
      });

      return {
        employee_id: parseInt(employeeId),
        week_start: formData.weekStart,
        schedule_data: scheduleDataForApi,
        total_hours: totalHours,
        status: "published",
      };
    });

    // Soumettre les données
    onSubmit(schedulesToSubmit);
  };

  // Calculer la plage de dates
  const weekStart = new Date(formData.weekStart);
  const weekEnd = getWeekEnd(weekStart);
  const dateRangeText = `${formatDate(weekStart, "DD/MM/YYYY")} - ${formatDate(
    weekEnd,
    "DD/MM/YYYY"
  )}`;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Spinner size="large" center />
        </CardContent>
      </Card>
    );
  }

  return (
    <FormContainer>
      <Card>
        <CardHeader>
          <FormHeader>
            <FormTitle>
              {isEditing ? "Modifier le planning" : "Créer un nouveau planning"}
            </FormTitle>
          </FormHeader>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FormRow>
              <FormColumn>
                <FormGroup>
                  <FormLabel htmlFor="weekStart">Semaine du</FormLabel>
                  <FormInput
                    id="weekStart"
                    type="date"
                    value={formData.weekStart}
                    onChange={handleWeekStartChange}
                    required
                  />
                  <small>{dateRangeText}</small>
                </FormGroup>
              </FormColumn>
            </FormRow>

            <EmployeeSelectionContainer>
              <FormLabel>Sélectionner les employés</FormLabel>
              <EmployeeList>
                {employees.map((employee) => (
                  <EmployeeItem
                    key={employee.id}
                    selected={formData.selectedEmployees.includes(employee.id)}
                    onClick={() => handleEmployeeToggle(employee.id)}
                  >
                    <EmployeeCheckbox
                      type="checkbox"
                      checked={formData.selectedEmployees.includes(employee.id)}
                      onChange={() => {}}
                    />
                    <EmployeeName>
                      {employee.first_name} {employee.last_name}
                    </EmployeeName>
                  </EmployeeItem>
                ))}
              </EmployeeList>
            </EmployeeSelectionContainer>

            {formData.selectedEmployees.length > 0 && (
              <>
                <WeeklyScheduleGrid
                  employees={employees.filter((emp) =>
                    formData.selectedEmployees.includes(emp.id)
                  )}
                  weekStart={formData.weekStart}
                  scheduleData={formData.scheduleData}
                  onScheduleChange={handleScheduleChange}
                  readOnly={false}
                />

                <SummaryContainer>
                  <SummaryTitle>Résumé des heures</SummaryTitle>
                  {employees
                    .filter((emp) =>
                      formData.selectedEmployees.includes(emp.id)
                    )
                    .map((employee) => (
                      <SummaryItem key={employee.id}>
                        <span>
                          {employee.first_name} {employee.last_name}
                        </span>
                        <span>
                          {calculateEmployeeTotal(employee.id)} heures
                        </span>
                      </SummaryItem>
                    ))}
                  <SummaryItem>
                    <span>Total</span>
                    <span>{calculateTotalHours()} heures</span>
                  </SummaryItem>
                </SummaryContainer>
              </>
            )}

            <ButtonGroup>
              <Button variant="outline" type="button" onClick={onCancel}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                {isEditing ? "Mettre à jour" : "Créer le planning"}
              </Button>
            </ButtonGroup>
          </form>
        </CardContent>
      </Card>
    </FormContainer>
  );
};

WeeklyScheduleForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

WeeklyScheduleForm.defaultProps = {
  initialData: null,
  isEditing: false,
};

export default WeeklyScheduleForm;
