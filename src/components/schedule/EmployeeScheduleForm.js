import PropTypes from "prop-types";
import { useCallback, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  calculateHours,
  formatDate,
  getDaysOfWeek,
} from "../../utils/dateUtils";
import Button from "../ui/Button";
import { FormInput } from "../ui/Form";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FormContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 8px;
  box-shadow: 0 4px 12px
    ${({ theme }) =>
      theme.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"};
  padding: 1.5rem;
  margin: 1rem 0;
  animation: ${fadeIn} 0.3s ease-out;
  max-width: 100%;
  overflow-x: auto;
  transition: background-color 0.2s ease, color 0.2s ease;
`;

const FormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const EmployeeName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const EmployeeDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};

  @media (min-width: 768px) {
    align-items: flex-end;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DayCard = styled.div`
  background-color: ${({ $isWeekend, theme }) =>
    $isWeekend
      ? theme.colors.background.tertiary
      : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 1rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px
      ${({ theme }) =>
        theme.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)"};
  }
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const DayName = styled.div`
  font-weight: 600;
  color: ${({ $isWeekend, theme }) =>
    $isWeekend ? theme.colors.text.secondary : theme.colors.text.primary};
`;

const DayDate = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InputGroup = styled.div`
  margin-bottom: 0.75rem;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const TotalHours = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
`;

const TimeSlotContainer = styled.div`
  margin-bottom: 0.5rem;
`;

const TimeSlot = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const TimeInput = styled(FormInput)`
  width: 100%;
  max-width: 120px;
  background-color: ${({ theme }) => theme.colors.background.input};
  color: ${({ theme }) => theme.colors.text.primary};
  border-color: ${({ theme }) => theme.colors.border};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px
      ${({ theme }) =>
        theme.mode === "dark"
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(59, 130, 246, 0.2)"};
  }
`;

const AddSlotButton = styled(Button)`
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const RemoveSlotButton = styled(Button)`
  padding: 0.25rem;
  font-size: 0.8rem;
  min-width: auto;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RadioInput = styled.input`
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary.main};
`;

const StyledFormInput = styled(FormInput)`
  background-color: ${({ theme }) => theme.colors.background.input};
  color: ${({ theme }) => theme.colors.text.primary};
  border-color: ${({ theme }) => theme.colors.border};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px
      ${({ theme }) =>
        theme.mode === "dark"
          ? "rgba(59, 130, 246, 0.3)"
          : "rgba(59, 130, 246, 0.2)"};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.placeholder};
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

// Fonction utilitaire pour calculer les heures d'un créneau
const calculateDayHours = (timeSlots) => {
  if (!timeSlots || timeSlots.length === 0) return "0";

  let totalHours = 0;

  timeSlots.forEach((slot) => {
    if (slot.start && slot.end) {
      const startParts = slot.start.split(":").map(Number);
      const endParts = slot.end.split(":").map(Number);

      if (startParts.length === 2 && endParts.length === 2) {
        const startDate = new Date();
        startDate.setHours(startParts[0], startParts[1], 0);

        const endDate = new Date();
        endDate.setHours(endParts[0], endParts[1], 0);

        // Si l'heure de fin est avant l'heure de début, on considère que c'est le jour suivant
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        const hours = calculateHours(startDate, endDate);
        totalHours += hours;
      }
    }
  });

  return totalHours.toFixed(1);
};

const EmployeeScheduleForm = ({
  employee,
  weekStart,
  scheduleData,
  onSave,
  onCancel,
}) => {
  // Initialiser le planning avec une fonction d'initialisation
  const [schedule, setSchedule] = useState(() => {
    if (!employee || !scheduleData) return [];

    const employeeSchedule = scheduleData.find(
      (item) => item.employeeId === employee.id
    );

    if (employeeSchedule) {
      // Convertir le format existant au nouveau format
      return employeeSchedule.days.map((day) => convertToNewFormat(day));
    } else {
      // Créer un planning vide avec le nouveau format
      return Array(7)
        .fill()
        .map(() => ({
          type: "work",
          absence: "",
          note: "",
          hours: "0",
          timeSlots: [],
        }));
    }
  });

  const weekDays = getDaysOfWeek(weekStart);

  // Vérifier si un jour est un weekend
  const isWeekend = useCallback((dayIndex) => {
    return dayIndex === 5 || dayIndex === 6; // Samedi ou Dimanche
  }, []);

  // Gérer le changement de type (travail ou absence)
  const handleTypeChange = useCallback((dayIndex, type) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        type: type,
        // Si on passe en mode absence, on vide les créneaux horaires
        timeSlots: type === "absence" ? [] : newSchedule[dayIndex].timeSlots,
        // Si on passe en mode travail, on vide le motif d'absence
        absence: type === "work" ? "" : newSchedule[dayIndex].absence,
        // Mettre à jour les heures
        hours:
          type === "absence"
            ? "0"
            : calculateDayHours(newSchedule[dayIndex].timeSlots),
      };
      return newSchedule;
    });
  }, []);

  // Gérer le changement du motif d'absence
  const handleAbsenceChange = useCallback((dayIndex, value) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        absence: value,
      };
      return newSchedule;
    });
  }, []);

  // Gérer le changement de note
  const handleNoteChange = useCallback((dayIndex, value) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule];
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        note: value,
      };
      return newSchedule;
    });
  }, []);

  // Ajouter un créneau horaire
  const addTimeSlot = useCallback((dayIndex) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule];
      const newTimeSlots = [
        ...(newSchedule[dayIndex].timeSlots || []),
        { start: "09:00", end: "17:00" },
      ];

      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        timeSlots: newTimeSlots,
        hours: calculateDayHours(newTimeSlots),
      };

      return newSchedule;
    });
  }, []);

  // Supprimer un créneau horaire
  const removeTimeSlot = useCallback((dayIndex, slotIndex) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule];
      const newTimeSlots = [...newSchedule[dayIndex].timeSlots];
      newTimeSlots.splice(slotIndex, 1);

      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        timeSlots: newTimeSlots,
        hours: calculateDayHours(newTimeSlots),
      };

      return newSchedule;
    });
  }, []);

  // Mettre à jour un créneau horaire
  const updateTimeSlot = useCallback((dayIndex, slotIndex, field, value) => {
    setSchedule((prevSchedule) => {
      const newSchedule = [...prevSchedule];
      const newTimeSlots = [...newSchedule[dayIndex].timeSlots];

      newTimeSlots[slotIndex] = {
        ...newTimeSlots[slotIndex],
        [field]: value,
      };

      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        timeSlots: newTimeSlots,
        hours: calculateDayHours(newTimeSlots),
      };

      return newSchedule;
    });
  }, []);

  // Calculer le total des heures
  const calculateTotalHours = useCallback(() => {
    return schedule
      .reduce((total, day) => total + (parseFloat(day.hours) || 0), 0)
      .toFixed(1);
  }, [schedule]);

  // Gérer la sauvegarde du planning
  const handleSave = useCallback(() => {
    // Convertir le format pour la sauvegarde
    const formattedSchedule = schedule.map((day) => ({
      hours: day.hours,
      absence: day.absence,
      note: day.note,
      timeSlots: day.timeSlots,
      type: day.type,
    }));

    const updatedScheduleData = {
      employeeId: employee.id,
      days: formattedSchedule,
    };

    onSave(updatedScheduleData);
  }, [employee, onSave, schedule]);

  if (!employee || !weekDays || schedule.length === 0) {
    return null;
  }

  return (
    <FormContainer>
      <FormTitle>
        Planning hebdomadaire
        <ButtonGroup>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Enregistrer
          </Button>
        </ButtonGroup>
      </FormTitle>

      <EmployeeInfo>
        <EmployeeName>
          {employee.firstName} {employee.lastName}
        </EmployeeName>
        <EmployeeDetails>
          <div>Département: {employee.department || "Non défini"}</div>
          <div>Heures contractuelles: {employee.contractHours}h</div>
        </EmployeeDetails>
      </EmployeeInfo>

      <DaysGrid>
        {weekDays.map((day, index) => (
          <DayCard key={index} $isWeekend={isWeekend(index)}>
            <DayHeader>
              <DayName $isWeekend={isWeekend(index)}>
                {formatDate(day, "EEEE")}
              </DayName>
              <DayDate>{formatDate(day, "dd/MM")}</DayDate>
            </DayHeader>

            <RadioGroup>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name={`day-type-${index}`}
                  checked={schedule[index]?.type === "work"}
                  onChange={() => handleTypeChange(index, "work")}
                />
                Travail
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name={`day-type-${index}`}
                  checked={schedule[index]?.type === "absence"}
                  onChange={() => handleTypeChange(index, "absence")}
                />
                Absence
              </RadioLabel>
            </RadioGroup>

            {schedule[index]?.type === "work" ? (
              <TimeSlotContainer>
                <InputLabel>
                  Créneaux horaires ({schedule[index]?.hours || "0"}h)
                </InputLabel>

                {schedule[index]?.timeSlots?.map((slot, slotIndex) => (
                  <TimeSlot key={slotIndex}>
                    <TimeInput
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateTimeSlot(
                          index,
                          slotIndex,
                          "start",
                          e.target.value
                        )
                      }
                    />
                    <span>-</span>
                    <TimeInput
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateTimeSlot(index, slotIndex, "end", e.target.value)
                      }
                    />
                    <RemoveSlotButton
                      variant="danger"
                      onClick={() => removeTimeSlot(index, slotIndex)}
                    >
                      ×
                    </RemoveSlotButton>
                  </TimeSlot>
                ))}

                <AddSlotButton
                  variant="outline"
                  onClick={() => addTimeSlot(index)}
                >
                  + Ajouter un créneau
                </AddSlotButton>
              </TimeSlotContainer>
            ) : (
              <InputGroup>
                <InputLabel>Motif d'absence</InputLabel>
                <StyledFormInput
                  type="text"
                  value={schedule[index]?.absence || ""}
                  onChange={(e) => handleAbsenceChange(index, e.target.value)}
                  placeholder="Saisir le motif d'absence..."
                />
              </InputGroup>
            )}

            <InputGroup>
              <InputLabel>Note (optionnelle)</InputLabel>
              <StyledFormInput
                type="text"
                value={schedule[index]?.note || ""}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                placeholder="Ajouter une note..."
              />
            </InputGroup>
          </DayCard>
        ))}
      </DaysGrid>

      <TotalHours>
        <span>Total des heures:</span>
        <span>{calculateTotalHours()}h</span>
      </TotalHours>
    </FormContainer>
  );
};

EmployeeScheduleForm.propTypes = {
  employee: PropTypes.object.isRequired,
  weekStart: PropTypes.instanceOf(Date).isRequired,
  scheduleData: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EmployeeScheduleForm;
