import PropTypes from "prop-types";
import { useRef, useState } from "react";
import styled from "styled-components";
import { getWeekDays } from "../../utils/dateUtils";

// Composants stylisés
const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: auto;
  margin-top: 1rem;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 250px repeat(7, 1fr);
  gap: 1px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
`;

const GridHeader = styled.div`
  display: contents;
`;

const HeaderCell = styled.div`
  background-color: #f5f5f5;
  padding: 0.75rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 2px solid #e0e0e0;

  &:first-child {
    text-align: left;
  }

  ${(props) =>
    props.$isWeekend &&
    `
    background-color: #f0f0f0;
    color: #666;
  `}
`;

const GridBody = styled.div`
  display: contents;
`;

const EmployeeRow = styled.div`
  display: contents;
`;

const EmployeeCell = styled.div`
  background-color: white;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid #e0e0e0;
`;

const DayCell = styled.div`
  background-color: white;
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  position: relative;
  cursor: ${(props) => (props.$readOnly ? "default" : "pointer")};

  ${(props) =>
    props.$isWeekend &&
    `
    background-color: #f9f9f9;
  `}

  ${(props) =>
    props.$isActive &&
    `
    background-color: #e6f7ff;
    border: 1px solid #1890ff;
  `}
`;

const HoursInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`;

const TotalRow = styled.div`
  display: contents;
`;

const TotalCell = styled.div`
  background-color: #f5f5f5;
  padding: 0.75rem;
  font-weight: 600;
  text-align: center;
  border-top: 2px solid #e0e0e0;

  &:first-child {
    text-align: left;
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContractHours = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const HoursDifference = styled.div`
  font-size: 0.85rem;
  margin-top: 0.25rem;
  font-weight: 600;
  color: ${(props) => {
    if (props.$difference > 0) return "#52c41a";
    if (props.$difference < 0) return "#f5222d";
    return "#666";
  }};
`;

// Composant principal
const WeeklyScheduleGrid = ({
  employees,
  weekStart,
  scheduleData,
  onChange,
  readOnly = false,
}) => {
  const [activeCell, setActiveCell] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const weekDays = getWeekDays(weekStart);

  // Gérer le clic sur une cellule
  const handleCellClick = (employeeId, dayIndex) => {
    if (readOnly) return;

    setActiveCell({ employeeId, dayIndex });
    setInputValue(getHoursValue(employeeId, dayIndex));

    // Focus sur l'input après le rendu
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Gérer le changement de valeur dans l'input
  const handleInputChange = (e) => {
    // Accepter seulement les nombres et le point décimal
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setInputValue(value);
  };

  // Gérer la perte de focus de l'input
  const handleInputBlur = () => {
    if (activeCell) {
      const { employeeId, dayIndex } = activeCell;
      const hours = parseFloat(inputValue) || 0;

      // Mettre à jour les données du planning
      updateScheduleData(employeeId, dayIndex, hours);

      // Réinitialiser l'état
      setActiveCell(null);
      setInputValue("");
    }
  };

  // Gérer les touches spéciales (Enter, Escape, Tab)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setActiveCell(null);
      setInputValue("");
    }
  };

  // Obtenir la valeur des heures pour une cellule
  const getHoursValue = (employeeId, dayIndex) => {
    if (!scheduleData) return "0";

    const employeeSchedule = scheduleData.find(
      (item) => item.employeeId === employeeId
    );

    if (!employeeSchedule || !employeeSchedule.days[dayIndex]) {
      return "0";
    }

    return employeeSchedule.days[dayIndex].hours.toString();
  };

  // Mettre à jour les données du planning
  const updateScheduleData = (employeeId, dayIndex, hours) => {
    if (!scheduleData) return;

    const newScheduleData = [...scheduleData];
    const employeeIndex = newScheduleData.findIndex(
      (item) => item.employeeId === employeeId
    );

    if (employeeIndex === -1) {
      // Créer une nouvelle entrée pour cet employé
      const newEmployeeSchedule = {
        employeeId,
        days: Array(7)
          .fill()
          .map((_, i) => ({
            hours: i === dayIndex ? hours : 0,
          })),
      };
      newScheduleData.push(newEmployeeSchedule);
    } else {
      // Mettre à jour l'entrée existante
      newScheduleData[employeeIndex].days[dayIndex].hours = hours;
    }

    onChange(newScheduleData);
  };

  // Calculer le total des heures pour un employé
  const calculateEmployeeTotal = (employeeId) => {
    if (!scheduleData) return 0;

    const employeeSchedule = scheduleData.find(
      (item) => item.employeeId === employeeId
    );

    if (!employeeSchedule) return 0;

    return employeeSchedule.days.reduce(
      (total, day) => total + (parseFloat(day.hours) || 0),
      0
    );
  };

  // Calculer le total des heures pour un jour
  const calculateDayTotal = (dayIndex) => {
    if (!scheduleData) return 0;

    return scheduleData.reduce((total, employeeSchedule) => {
      if (!employeeSchedule.days[dayIndex]) return total;
      return total + (parseFloat(employeeSchedule.days[dayIndex].hours) || 0);
    }, 0);
  };

  // Calculer la différence entre les heures travaillées et les heures contractuelles
  const calculateHoursDifference = (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    if (!employee) return 0;

    const contractHours = parseFloat(employee.contractHours) || 0;
    const workedHours = calculateEmployeeTotal(employeeId);

    return (workedHours - contractHours).toFixed(1);
  };

  // Vérifier si un jour est un weekend
  const isWeekend = (dayIndex) => {
    return dayIndex === 5 || dayIndex === 6; // Samedi ou Dimanche
  };

  return (
    <GridContainer>
      <ScheduleGrid>
        <GridHeader>
          <HeaderCell>Employé</HeaderCell>
          {weekDays.map((day, index) => (
            <HeaderCell key={index} $isWeekend={isWeekend(index)}>
              {day.dayName}
              <br />
              {day.date}
            </HeaderCell>
          ))}
        </GridHeader>

        <GridBody>
          {employees.map((employee) => (
            <EmployeeRow key={employee.id}>
              <EmployeeCell>
                <EmployeeInfo>
                  <div>
                    <strong>
                      {employee.firstName} {employee.lastName}
                    </strong>
                  </div>
                  <ContractHours>
                    Heures contractuelles: {employee.contractHours}h
                  </ContractHours>
                  <HoursDifference
                    $difference={calculateHoursDifference(employee.id)}
                  >
                    {calculateHoursDifference(employee.id) > 0
                      ? `+${calculateHoursDifference(employee.id)}h`
                      : `${calculateHoursDifference(employee.id)}h`}
                  </HoursDifference>
                </EmployeeInfo>
              </EmployeeCell>

              {Array(7)
                .fill()
                .map((_, dayIndex) => (
                  <DayCell
                    key={dayIndex}
                    $isWeekend={isWeekend(dayIndex)}
                    $isActive={
                      activeCell &&
                      activeCell.employeeId === employee.id &&
                      activeCell.dayIndex === dayIndex
                    }
                    $readOnly={readOnly}
                    onClick={() => handleCellClick(employee.id, dayIndex)}
                  >
                    {activeCell &&
                    activeCell.employeeId === employee.id &&
                    activeCell.dayIndex === dayIndex ? (
                      <HoursInput
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      getHoursValue(employee.id, dayIndex)
                    )}
                  </DayCell>
                ))}
            </EmployeeRow>
          ))}

          <TotalRow>
            <TotalCell>Total</TotalCell>
            {Array(7)
              .fill()
              .map((_, dayIndex) => (
                <TotalCell key={dayIndex} $isWeekend={isWeekend(dayIndex)}>
                  {calculateDayTotal(dayIndex)}h
                </TotalCell>
              ))}
          </TotalRow>
        </GridBody>
      </ScheduleGrid>
    </GridContainer>
  );
};

WeeklyScheduleGrid.propTypes = {
  employees: PropTypes.array.isRequired,
  weekStart: PropTypes.instanceOf(Date).isRequired,
  scheduleData: PropTypes.array,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default WeeklyScheduleGrid;
