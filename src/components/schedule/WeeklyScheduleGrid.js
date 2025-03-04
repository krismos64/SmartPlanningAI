import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import { formatDate, getDaysOfWeek } from "../../utils/dateUtils";
import Button from "../ui/Button";

// Styles
const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(7, 1fr) 100px 80px;
  gap: 1px;
  background-color: ${({ theme }) => theme.colors.border.light};
  border-radius: 0.5rem;
  overflow-x: auto;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 180px repeat(7, 1fr) 100px 80px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 150px repeat(7, minmax(80px, 1fr)) 100px 80px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 120px repeat(7, minmax(70px, 1fr)) 100px 80px;
    font-size: 0.85rem;
  }
`;

const GridCell = styled.div`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  transition: background-color 0.2s ease;
`;

const HeaderCell = styled(GridCell)`
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const EmployeeCell = styled(GridCell)`
  justify-content: flex-start;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  position: sticky;
  left: 0;
  z-index: 5;
`;

const TotalCell = styled(GridCell)`
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  position: sticky;
  right: 80px;
  z-index: 5;
`;

const DayCell = styled(GridCell)`
  ${({ isWeekend, theme }) =>
    isWeekend &&
    `
    background-color: ${theme.colors.background.tertiary};
  `}

  ${({ isAbsent, theme }) =>
    isAbsent &&
    `
    background-color: ${theme.mode === "dark" ? "#3d1a1a" : "#fee2e2"};
    color: ${theme.mode === "dark" ? "#f87171" : "#b91c1c"};
  `}
  
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  text-align: center;
`;

const TimeSlot = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const HoursValue = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
`;

const NoteText = styled.div`
  font-style: italic;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActionCell = styled(GridCell)`
  position: sticky;
  right: 0;
  z-index: 5;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 0.5rem;
`;

const ActionButton = styled(Button)`
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  width: 100%;
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

const WeeklyScheduleGrid = ({
  employees,
  weekStart,
  scheduleData,
  onChange,
  readOnly,
  onEditEmployee,
}) => {
  // Obtenir les jours de la semaine
  const daysOfWeek = getDaysOfWeek(weekStart);

  // Trouver le planning d'un employé
  const findEmployeeSchedule = (employeeId) => {
    const schedule = scheduleData.find(
      (schedule) => schedule.employeeId === employeeId
    );

    if (!schedule) {
      return {
        employeeId,
        days: Array(7)
          .fill()
          .map(() => ({
            type: "work",
            hours: "0",
            absence: "",
            note: "",
            timeSlots: [],
          })),
      };
    }

    // S'assurer que les jours sont au bon format
    const formattedDays = schedule.days.map((day) => convertToNewFormat(day));

    return {
      ...schedule,
      days: formattedDays,
    };
  };

  // Gérer le clic sur le bouton d'édition
  const handleEditClick = (employeeId) => {
    if (onEditEmployee) {
      onEditEmployee(employeeId);
    }
  };

  // Vérifier si un jour est un weekend
  const isWeekend = (dayIndex) => {
    return dayIndex === 5 || dayIndex === 6; // Samedi ou Dimanche
  };

  // Vérifier si un employé est absent pour un jour donné
  const isAbsent = (employeeId, dayIndex) => {
    const schedule = findEmployeeSchedule(employeeId);
    const day = schedule.days[dayIndex];
    return (
      day && day.type === "absence" && day.absence && day.absence.trim() !== ""
    );
  };

  // Formater l'affichage d'une cellule de jour
  const formatDayCell = (employeeId, dayIndex) => {
    const schedule = findEmployeeSchedule(employeeId);
    const day = schedule.days[dayIndex];

    if (!day) return null;

    return (
      <>
        {day.type === "absence" && day.absence && day.absence.trim() !== "" ? (
          <HoursValue>{day.absence}</HoursValue>
        ) : day.type === "work" && day.timeSlots && day.timeSlots.length > 0 ? (
          <>
            <HoursValue>{day.hours || "0"}h</HoursValue>
            {day.timeSlots.map((slot, index) => (
              <TimeSlot key={index}>
                {slot.start} - {slot.end}
              </TimeSlot>
            ))}
          </>
        ) : (
          <HoursValue>0h</HoursValue>
        )}

        {day.note && day.note.trim() !== "" && (
          <NoteText title={day.note}>{day.note}</NoteText>
        )}
      </>
    );
  };

  // Calculer le total des heures pour un employé
  const calculateEmployeeTotal = (employeeId) => {
    const schedule = findEmployeeSchedule(employeeId);
    return schedule.days
      .reduce((total, day) => total + (parseFloat(day.hours) || 0), 0)
      .toFixed(1);
  };

  // Obtenir le compteur horaire d'un employé (heures contractuelles vs heures travaillées)
  const getEmployeeHoursCounter = (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee || !employee.contractHours) return "N/A";

    const contractHours = parseFloat(employee.contractHours);
    const workedHours = parseFloat(calculateEmployeeTotal(employeeId));
    const difference = (workedHours - contractHours).toFixed(1);

    if (difference > 0) {
      return `+${difference}h`;
    } else if (difference < 0) {
      return `${difference}h`;
    } else {
      return "0h";
    }
  };

  return (
    <ScheduleGrid>
      {/* En-tête avec les jours de la semaine */}
      <HeaderCell>Employé</HeaderCell>
      {daysOfWeek.map((day, index) => (
        <HeaderCell key={index}>{formatDate(day, "EEE dd/MM")}</HeaderCell>
      ))}
      <HeaderCell>Total</HeaderCell>
      <HeaderCell>Actions</HeaderCell>

      {/* Lignes pour chaque employé */}
      {employees.map((employee) => (
        <React.Fragment key={employee.id}>
          <EmployeeCell>
            {employee.firstName} {employee.lastName}
          </EmployeeCell>

          {/* Cellules pour chaque jour */}
          {Array(7)
            .fill()
            .map((_, dayIndex) => (
              <DayCell
                key={dayIndex}
                isWeekend={isWeekend(dayIndex)}
                isAbsent={isAbsent(employee.id, dayIndex)}
              >
                {formatDayCell(employee.id, dayIndex)}
              </DayCell>
            ))}

          {/* Cellule de total */}
          <TotalCell>
            {calculateEmployeeTotal(employee.id)}h
            <br />
            <small
              style={{
                color: getEmployeeHoursCounter(employee.id).startsWith("+")
                  ? "#10b981"
                  : getEmployeeHoursCounter(employee.id).startsWith("-")
                  ? "#ef4444"
                  : "inherit",
              }}
            >
              {getEmployeeHoursCounter(employee.id)}
            </small>
          </TotalCell>

          {/* Cellule d'action */}
          <ActionCell>
            <ActionButton
              variant="primary"
              onClick={() => handleEditClick(employee.id)}
            >
              Modifier
            </ActionButton>
          </ActionCell>
        </React.Fragment>
      ))}
    </ScheduleGrid>
  );
};

WeeklyScheduleGrid.propTypes = {
  employees: PropTypes.array.isRequired,
  weekStart: PropTypes.instanceOf(Date).isRequired,
  scheduleData: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  onEditEmployee: PropTypes.func,
};

WeeklyScheduleGrid.defaultProps = {
  readOnly: false,
};

export default WeeklyScheduleGrid;
