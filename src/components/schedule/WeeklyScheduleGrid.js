import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";
import { formatDate, getDaysOfWeek } from "../../utils/dateUtils";
import Button from "../ui/Button";

// Styles
const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(7, 1fr) 80px;
  gap: 1px;
  background-color: ${({ theme }) => theme.colors.border.light};
  border-radius: 0.5rem;
  overflow-x: auto;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 180px repeat(7, 1fr) 80px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 150px repeat(7, minmax(80px, 1fr)) 80px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 120px repeat(7, minmax(70px, 1fr)) 80px;
    font-size: 0.85rem;
  }
`;

const GridCell = styled.div`
  padding: 0.75rem;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`;

const HeaderCell = styled(GridCell)`
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.background.light};
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const EmployeeCell = styled(GridCell)`
  justify-content: flex-start;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.background.light};
  position: sticky;
  left: 0;
  z-index: 5;
`;

const DayCell = styled(GridCell)`
  ${({ isWeekend }) =>
    isWeekend &&
    `
    background-color: #f9fafb;
  `}

  ${({ isAbsent }) =>
    isAbsent &&
    `
    background-color: #fee2e2;
    color: #b91c1c;
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

const ActionCell = styled(GridCell)`
  position: sticky;
  right: 0;
  z-index: 5;
  background-color: ${({ theme }) => theme.colors.background.light};
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

    if (day.type === "absence" && day.absence && day.absence.trim() !== "") {
      return <HoursValue>{day.absence}</HoursValue>;
    }

    if (day.type === "work" && day.timeSlots && day.timeSlots.length > 0) {
      return (
        <>
          <HoursValue>{day.hours || "0"}h</HoursValue>
          {day.timeSlots.map((slot, index) => (
            <TimeSlot key={index}>
              {slot.start} - {slot.end}
            </TimeSlot>
          ))}
        </>
      );
    }

    return <HoursValue>0h</HoursValue>;
  };

  return (
    <ScheduleGrid>
      {/* En-tête avec les jours de la semaine */}
      <HeaderCell>Employé</HeaderCell>
      {daysOfWeek.map((day, index) => (
        <HeaderCell key={index}>{formatDate(day, "EEE dd/MM")}</HeaderCell>
      ))}
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
