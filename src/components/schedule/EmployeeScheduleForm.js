import PropTypes from "prop-types";
import { useCallback, useMemo, useState } from "react";
import { FaSave, FaTimes, FaTrash } from "react-icons/fa";
import styled, { keyframes } from "styled-components";
import {
  calculateHours,
  formatDate,
  formatDateForInput,
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

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
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
  gap: 0.5rem;
  margin-top: 1rem;

  @media (max-width: 576px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dangerHover};
  }

  @media (max-width: 576px) {
    flex: 1;
  }
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

// Ajouter ce style après les autres styles
const WeekInfo = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.info.dark};
  background-color: ${({ theme }) => theme.colors.info.light};
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 3px solid ${({ theme }) => theme.colors.info.main};
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
  onDelete,
}) => {
  // Créer un tableau de jours vides
  const emptyDays = Array(7)
    .fill()
    .map(() => ({
      type: "work",
      hours: "0",
      absence: "",
      note: "",
      timeSlots: [],
    }));

  // Initialiser les données du formulaire
  const initialScheduleData = useMemo(() => {
    // Si scheduleData est un tableau, l'utiliser directement
    if (Array.isArray(scheduleData)) {
      return scheduleData;
    }

    // Si scheduleData est un objet avec une propriété days, utiliser days
    if (scheduleData && scheduleData.days && Array.isArray(scheduleData.days)) {
      return scheduleData.days;
    }

    // Sinon, utiliser le tableau de jours vides
    return emptyDays;
  }, [scheduleData]);

  const [formData, setFormData] = useState(initialScheduleData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const weekDays = getDaysOfWeek(weekStart);

  // Vérifier si un jour est un weekend
  const isWeekend = useCallback((dayIndex) => {
    return dayIndex === 5 || dayIndex === 6; // Samedi ou Dimanche
  }, []);

  // Gérer le changement de type (travail ou absence)
  const handleTypeChange = useCallback((dayIndex, type) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      newFormData[dayIndex] = {
        ...newFormData[dayIndex],
        type: type,
        // Si on passe en mode absence, on vide les créneaux horaires
        timeSlots: type === "absence" ? [] : newFormData[dayIndex].timeSlots,
        // Si on passe en mode travail, on vide le motif d'absence
        absence: type === "work" ? "" : newFormData[dayIndex].absence,
        // Mettre à jour les heures
        hours:
          type === "absence"
            ? "0"
            : calculateDayHours(newFormData[dayIndex].timeSlots),
      };
      return newFormData;
    });
  }, []);

  // Gérer le changement du motif d'absence
  const handleAbsenceChange = useCallback((dayIndex, value) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      newFormData[dayIndex] = {
        ...newFormData[dayIndex],
        absence: value,
      };
      return newFormData;
    });
  }, []);

  // Gérer le changement de note
  const handleNoteChange = useCallback((dayIndex, value) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      newFormData[dayIndex] = {
        ...newFormData[dayIndex],
        note: value,
      };
      return newFormData;
    });
  }, []);

  // Ajouter un créneau horaire
  const addTimeSlot = useCallback((dayIndex) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      const newTimeSlots = [
        ...(newFormData[dayIndex].timeSlots || []),
        { start: "09:00", end: "17:00" },
      ];

      newFormData[dayIndex] = {
        ...newFormData[dayIndex],
        timeSlots: newTimeSlots,
        hours: calculateDayHours(newTimeSlots),
      };

      return newFormData;
    });
  }, []);

  // Supprimer un créneau horaire
  const removeTimeSlot = useCallback((dayIndex, slotIndex) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      const newTimeSlots = [...newFormData[dayIndex].timeSlots];
      newTimeSlots.splice(slotIndex, 1);

      newFormData[dayIndex] = {
        ...newFormData[dayIndex],
        timeSlots: newTimeSlots,
        hours: calculateDayHours(newTimeSlots),
      };

      return newFormData;
    });
  }, []);

  // Mettre à jour un créneau horaire
  const updateTimeSlot = useCallback((dayIndex, slotIndex, field, value) => {
    setFormData((prevFormData) => {
      const newFormData = [...prevFormData];
      const newTimeSlots = [...newFormData[dayIndex].timeSlots];

      newTimeSlots[slotIndex] = {
        ...newTimeSlots[slotIndex],
        [field]: value,
      };

      newFormData[dayIndex] = {
        ...newFormData[dayIndex],
        timeSlots: newTimeSlots,
        hours: calculateDayHours(newTimeSlots),
      };

      return newFormData;
    });
  }, []);

  // Calculer le total des heures
  const calculateTotalHours = useCallback(() => {
    return formData
      .reduce((total, day) => total + (parseFloat(day.hours) || 0), 0)
      .toFixed(1);
  }, [formData]);

  // Gérer la sauvegarde du planning
  const handleSave = useCallback(() => {
    // Convertir le format pour la sauvegarde
    const formattedSchedule = formData.map((day) => ({
      hours: day.hours,
      absence: day.absence,
      note: day.note,
      timeSlots: day.timeSlots,
      type: day.type,
    }));

    const updatedScheduleData = {
      employeeId: employee.id,
      weekStart: formatDateForInput(weekStart),
      days: formattedSchedule,
    };

    onSave(updatedScheduleData);
  }, [employee, onSave, formData, weekStart]);

  if (!employee || !weekDays || formData.length === 0) {
    return null;
  }

  return (
    <FormContainer>
      <FormTitle>
        Édition du planning - {employee.firstName} {employee.lastName}
        <ButtonGroup>
          <ActionButton variant="danger" onClick={onCancel}>
            <FaTimes /> Annuler
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </ActionButton>
          {scheduleData && scheduleData.id && (
            <DeleteButton
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Êtes-vous sûr de vouloir supprimer ce planning ? Cette action est irréversible."
                  )
                ) {
                  onDelete(scheduleData.id);
                }
              }}
            >
              <FaTrash /> Supprimer
            </DeleteButton>
          )}
        </ButtonGroup>
      </FormTitle>

      <EmployeeInfo>
        <EmployeeName>
          {employee.first_name} {employee.last_name}
        </EmployeeName>
        <EmployeeDetails>
          <div>Département: {employee.department || "Non défini"}</div>
          <div>Heures contractuelles: {employee.contractHours}h</div>
        </EmployeeDetails>
      </EmployeeInfo>

      <WeekInfo>
        Ce planning est spécifique à la semaine du {formatDate(weekStart)} au{" "}
        {formatDate(weekDays[6])}. Il n'affectera pas les autres semaines.
      </WeekInfo>

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
                  checked={formData[index]?.type === "work"}
                  onChange={() => handleTypeChange(index, "work")}
                />
                Travail
              </RadioLabel>
              <RadioLabel>
                <RadioInput
                  type="radio"
                  name={`day-type-${index}`}
                  checked={formData[index]?.type === "absence"}
                  onChange={() => handleTypeChange(index, "absence")}
                />
                Absence
              </RadioLabel>
            </RadioGroup>

            {formData[index]?.type === "work" ? (
              <TimeSlotContainer>
                <InputLabel>
                  Créneaux horaires ({formData[index]?.hours || "0"}h)
                </InputLabel>

                {formData[index]?.timeSlots?.map((slot, slotIndex) => (
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
                  value={formData[index]?.absence || ""}
                  onChange={(e) => handleAbsenceChange(index, e.target.value)}
                  placeholder="Saisir le motif d'absence..."
                />
              </InputGroup>
            )}

            <InputGroup>
              <InputLabel>Note (optionnelle)</InputLabel>
              <StyledFormInput
                type="text"
                value={formData[index]?.note || ""}
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
  onDelete: PropTypes.func.isRequired,
};

export default EmployeeScheduleForm;
