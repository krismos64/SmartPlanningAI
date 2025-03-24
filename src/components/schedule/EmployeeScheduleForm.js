import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaSave, FaTimes, FaTrash } from "react-icons/fa";
import styled, { keyframes } from "styled-components";
import WeeklyScheduleService from "../../services/WeeklyScheduleService";
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

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  strong {
    font-weight: 600;
  }
`;

const EmployeeScheduleForm = ({
  employee,
  weekStart,
  weekDays,
  scheduleData,
  onSave,
  onDelete,
  onCancel,
  isSubmitting: externalIsSubmitting,
}) => {
  console.log("EmployeeScheduleForm - Props reçues:", {
    employee,
    weekStart,
    weekDays,
    scheduleData,
  });

  // Fonction pour convertir les données dans le bon format
  const convertToNewFormat = useCallback((day) => {
    if (!day)
      return {
        type: "work",
        hours: "0",
        absence: "",
        note: "",
        timeSlots: [],
      };

    // Si le jour a déjà le bon format, le retourner tel quel
    if (day.type && (day.hours !== undefined || day.timeSlots)) {
      return {
        type: day.type || "work",
        hours: day.hours || "0",
        absence: day.absence || "",
        note: day.note || "",
        timeSlots: day.timeSlots || [],
      };
    }

    // Convertir l'ancien format vers le nouveau
    return {
      type: day.absence ? "absence" : "work",
      hours: day.hours || "0",
      absence: day.absence || "",
      note: day.note || "",
      timeSlots: day.timeSlots || [],
    };
  }, []);

  // Fonction utilitaire pour calculer les heures d'un créneau
  const calculateDayHours = useCallback((timeSlots) => {
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
  }, []);

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
    console.log("Initialisation des données du formulaire:", {
      scheduleData,
      isArray: Array.isArray(scheduleData),
      hasScheduleData: scheduleData && scheduleData.schedule_data,
      hasDays: scheduleData && scheduleData.days,
    });

    // Si scheduleData est un tableau, l'utiliser directement
    if (Array.isArray(scheduleData)) {
      console.log("scheduleData est un tableau, conversion directe");
      return scheduleData.map((day) => convertToNewFormat(day));
    }

    // Si scheduleData est un objet avec une propriété schedule_data, utiliser schedule_data
    if (
      scheduleData &&
      scheduleData.schedule_data &&
      Array.isArray(scheduleData.schedule_data)
    ) {
      console.log("Utilisation de schedule_data dans scheduleData");
      return scheduleData.schedule_data.map((day) => convertToNewFormat(day));
    }

    // Si scheduleData est un objet avec une propriété days, utiliser days
    if (scheduleData && scheduleData.days && Array.isArray(scheduleData.days)) {
      console.log("Utilisation de days dans scheduleData");
      return scheduleData.days.map((day) => convertToNewFormat(day));
    }

    // Sinon, utiliser le tableau de jours vides
    console.log("Aucune donnée valide trouvée, utilisation de jours vides");
    return emptyDays;
  }, [scheduleData, emptyDays, convertToNewFormat]);

  const [formData, setFormData] = useState(initialScheduleData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Mettre à jour formData UNIQUEMENT lors du premier montage ou lorsque scheduleData change
  useEffect(() => {
    // Utiliser une référence pour suivre si c'est le premier rendu
    const isFirstRender = formData.length === 0;

    // Ne mettre à jour le formData que lors du premier rendu ou si scheduleData a changé
    if (
      isFirstRender &&
      initialScheduleData &&
      initialScheduleData.length > 0
    ) {
      console.log(
        "Mise à jour initiale du formData avec:",
        initialScheduleData
      );
      setFormData(initialScheduleData);
    }
  }, [initialScheduleData, formData.length]);

  // Générer weekDays si non fourni
  const internalWeekDays = useMemo(() => {
    if (weekDays && Array.isArray(weekDays) && weekDays.length === 7) {
      console.log("Utilisation des weekDays fournis:", weekDays);
      return weekDays;
    }

    // Générer les jours de la semaine si non fournis
    console.log(
      "Génération des jours de la semaine à partir de weekStart:",
      weekStart
    );
    return getDaysOfWeek(weekStart);
  }, [weekDays, weekStart]);

  // Vérifier si un jour est un weekend
  const isWeekend = useCallback((dayIndex) => {
    return dayIndex === 5 || dayIndex === 6; // Samedi ou Dimanche
  }, []);

  // Gérer le changement de type (travail ou absence)
  const handleTypeChange = useCallback(
    (dayIndex, type) => {
      console.log("handleTypeChange appelé:", { dayIndex, type, formData });

      if (!formData || !Array.isArray(formData) || !formData[dayIndex]) {
        console.error(
          "Données de formulaire invalides dans handleTypeChange:",
          formData
        );
        return;
      }

      setFormData((prevFormData) => {
        console.log("handleTypeChange - prevFormData:", prevFormData);

        // Créer une copie de sécurité au cas où prevFormData est null ou undefined
        const safePrevData = Array.isArray(prevFormData)
          ? prevFormData
          : [...emptyDays];

        const newFormData = [...safePrevData];
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

        console.log("handleTypeChange - newFormData:", newFormData);
        return newFormData;
      });
    },
    [formData, emptyDays, calculateDayHours]
  );

  // Gérer le changement du motif d'absence
  const handleAbsenceChange = useCallback(
    (dayIndex, value) => {
      console.log("handleAbsenceChange appelé:", { dayIndex, value, formData });

      if (!formData || !Array.isArray(formData) || !formData[dayIndex]) {
        console.error(
          "Données de formulaire invalides dans handleAbsenceChange:",
          formData
        );
        return;
      }

      setFormData((prevFormData) => {
        console.log("handleAbsenceChange - prevFormData:", prevFormData);

        // Créer une copie de sécurité au cas où prevFormData est null ou undefined
        const safePrevData = Array.isArray(prevFormData)
          ? prevFormData
          : [...emptyDays];

        const newFormData = [...safePrevData];
        newFormData[dayIndex] = {
          ...newFormData[dayIndex],
          absence: value,
        };

        console.log("handleAbsenceChange - newFormData:", newFormData);
        return newFormData;
      });
    },
    [formData, emptyDays]
  );

  // Gérer le changement de note
  const handleNoteChange = useCallback(
    (dayIndex, value) => {
      console.log("handleNoteChange appelé:", { dayIndex, value, formData });

      if (!formData || !Array.isArray(formData) || !formData[dayIndex]) {
        console.error(
          "Données de formulaire invalides dans handleNoteChange:",
          formData
        );
        return;
      }

      setFormData((prevFormData) => {
        console.log("handleNoteChange - prevFormData:", prevFormData);

        // Créer une copie de sécurité au cas où prevFormData est null ou undefined
        const safePrevData = Array.isArray(prevFormData)
          ? prevFormData
          : [...emptyDays];

        const newFormData = [...safePrevData];
        newFormData[dayIndex] = {
          ...newFormData[dayIndex],
          note: value,
        };

        console.log("handleNoteChange - newFormData:", newFormData);
        return newFormData;
      });
    },
    [formData, emptyDays]
  );

  // Ajouter un créneau horaire
  const addTimeSlot = useCallback(
    (dayIndex) => {
      console.log("addTimeSlot appelé:", { dayIndex, formData });

      if (!formData || !Array.isArray(formData) || !formData[dayIndex]) {
        console.error(
          "Données de formulaire invalides dans addTimeSlot:",
          formData
        );
        return;
      }

      setFormData((prevFormData) => {
        console.log("addTimeSlot - prevFormData:", prevFormData);

        // Créer une copie de sécurité au cas où prevFormData est null ou undefined
        const safePrevData = Array.isArray(prevFormData)
          ? prevFormData
          : [...emptyDays];

        const newFormData = [...safePrevData];
        const newTimeSlots = [
          ...(newFormData[dayIndex].timeSlots || []),
          { start: "09:00", end: "17:00" },
        ];

        newFormData[dayIndex] = {
          ...newFormData[dayIndex],
          timeSlots: newTimeSlots,
          hours: calculateDayHours(newTimeSlots),
        };

        console.log("addTimeSlot - newFormData:", newFormData);
        return newFormData;
      });
    },
    [formData, emptyDays, calculateDayHours]
  );

  // Supprimer un créneau horaire
  const removeTimeSlot = useCallback(
    (dayIndex, slotIndex) => {
      console.log("removeTimeSlot appelé:", { dayIndex, slotIndex, formData });

      if (
        !formData ||
        !Array.isArray(formData) ||
        !formData[dayIndex] ||
        !formData[dayIndex].timeSlots ||
        !Array.isArray(formData[dayIndex].timeSlots)
      ) {
        console.error(
          "Données de formulaire invalides dans removeTimeSlot:",
          formData
        );
        return;
      }

      setFormData((prevFormData) => {
        console.log("removeTimeSlot - prevFormData:", prevFormData);

        // Créer une copie de sécurité au cas où prevFormData est null ou undefined
        const safePrevData = Array.isArray(prevFormData)
          ? prevFormData
          : [...emptyDays];

        const newFormData = [...safePrevData];
        const newTimeSlots = [...(newFormData[dayIndex].timeSlots || [])];

        if (slotIndex >= 0 && slotIndex < newTimeSlots.length) {
          newTimeSlots.splice(slotIndex, 1);
        }

        newFormData[dayIndex] = {
          ...newFormData[dayIndex],
          timeSlots: newTimeSlots,
          hours: calculateDayHours(newTimeSlots),
        };

        console.log("removeTimeSlot - newFormData:", newFormData);
        return newFormData;
      });
    },
    [formData, emptyDays, calculateDayHours]
  );

  // Mettre à jour un créneau horaire
  const updateTimeSlot = useCallback(
    (dayIndex, slotIndex, field, value) => {
      console.log("updateTimeSlot appelé:", {
        dayIndex,
        slotIndex,
        field,
        value,
        formData,
      });

      if (
        !formData ||
        !Array.isArray(formData) ||
        !formData[dayIndex] ||
        !formData[dayIndex].timeSlots ||
        !Array.isArray(formData[dayIndex].timeSlots) ||
        slotIndex >= formData[dayIndex].timeSlots.length
      ) {
        console.error(
          "Données de formulaire invalides dans updateTimeSlot:",
          formData
        );
        return;
      }

      setFormData((prevFormData) => {
        console.log("updateTimeSlot - prevFormData:", prevFormData);

        // Créer une copie de sécurité au cas où prevFormData est null ou undefined
        const safePrevData = Array.isArray(prevFormData)
          ? prevFormData
          : [...emptyDays];

        const newFormData = [...safePrevData];
        const newTimeSlots = [...(newFormData[dayIndex].timeSlots || [])];

        if (slotIndex >= 0 && slotIndex < newTimeSlots.length) {
          newTimeSlots[slotIndex] = {
            ...newTimeSlots[slotIndex],
            [field]: value,
          };
        }

        newFormData[dayIndex] = {
          ...newFormData[dayIndex],
          timeSlots: newTimeSlots,
          hours: calculateDayHours(newTimeSlots),
        };

        console.log("updateTimeSlot - newFormData:", newFormData);
        return newFormData;
      });
    },
    [formData, emptyDays, calculateDayHours]
  );

  // Calculer le total des heures
  const calculateTotalHours = useCallback(() => {
    return formData
      .reduce((total, day) => total + (parseFloat(day.hours) || 0), 0)
      .toFixed(1);
  }, [formData]);

  // Gérer la sauvegarde du planning
  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Convertir le format pour la sauvegarde
      const formattedSchedule = formData.map((day) => ({
        hours: day.hours,
        absence: day.absence,
        note: day.note,
        timeSlots: day.timeSlots,
        type: day.type,
      }));

      // Préparer les données pour l'API
      const scheduleDataToSave = {
        employee_id: employee.id,
        week_start: formatDateForInput(weekStart),
        schedule_data: formattedSchedule,
        total_hours: calculateTotalHours(),
      };

      // Si on a un ID existant, l'ajouter aux données (pour que le service sache que c'est une mise à jour)
      if (scheduleData?.id) {
        scheduleDataToSave.id = scheduleData.id;
      }

      console.log("📝 Envoi des données au service:", scheduleDataToSave);
      console.log(
        "🧪 Données envoyées au backend:",
        JSON.stringify(scheduleDataToSave, null, 2)
      );

      let response;
      // Si nous avons un ID, utiliser updateSchedule, sinon createSchedule
      if (scheduleData?.id) {
        console.log("Mise à jour du planning existant ID:", scheduleData.id);
        response = await WeeklyScheduleService.updateSchedule(
          scheduleData.id,
          scheduleDataToSave
        );
      } else {
        console.log("Création d'un nouveau planning");
        response = await WeeklyScheduleService.createSchedule(
          scheduleDataToSave
        );
      }

      console.log("✅ Réponse du service:", response);

      if (!response.success) {
        throw new Error(
          response.message || "Erreur lors de l'enregistrement du planning"
        );
      }

      // Extraire les données du planning selon les différents formats de réponse possibles
      const responseData = response.data || response;
      const savedSchedule =
        responseData.schedule || responseData.data || responseData;

      // Informer le composant parent du succès et fermer le modal
      onSave(savedSchedule);
      onCancel();
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement du planning:", error);

      // Gestion de l'erreur pour affichage à l'utilisateur
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état qui n'est pas dans la plage 2xx
        console.error("Détails de l'erreur de réponse:", error.response);

        const errorMsg =
          error.response.data?.message ||
          error.response.data?.error ||
          `Erreur ${error.response.status}: ${error.response.statusText}`;

        setErrors({
          global: errorMsg,
        });
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        console.error("Aucune réponse reçue:", error.request);
        setErrors({
          global: "Aucune réponse du serveur. Vérifiez votre connexion.",
        });
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error("Erreur de configuration:", error.message);
        setErrors({
          global:
            error.message ||
            "Une erreur s'est produite lors de l'enregistrement",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    employee,
    weekStart,
    formData,
    scheduleData,
    onSave,
    onCancel,
    calculateTotalHours,
  ]);

  if (!employee) {
    console.log("Employee data manquante, affichage du message de chargement");
    return <div>Chargement des données d'employé...</div>;
  }

  if (!formData || formData.length === 0) {
    console.log(
      "formData manquant ou vide, affichage du message de chargement"
    );
    return <div>Préparation des données du planning...</div>;
  }

  console.log("Render du formulaire avec:", {
    employee,
    weekDays: internalWeekDays,
    formData,
    formDataLength: formData.length,
  });

  return (
    <FormContainer>
      <FormTitle>
        Édition du planning - {employee.first_name} {employee.last_name}
        <ButtonGroup>
          <ActionButton variant="danger" onClick={onCancel}>
            <FaTimes /> Annuler
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting || externalIsSubmitting}
          >
            <FaSave />{" "}
            {isSubmitting || externalIsSubmitting
              ? "Enregistrement..."
              : "Enregistrer"}
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

      {errors.global && (
        <ErrorMessage>
          <strong>Erreur:</strong> {errors.global}
        </ErrorMessage>
      )}

      <EmployeeInfo>
        <EmployeeName>
          {employee.first_name} {employee.last_name}
        </EmployeeName>
        <EmployeeDetails>
          <div>Département: {employee.department || "Non défini"}</div>
          <div>Heures contractuelles: {employee.contract_hours || 0}h</div>
        </EmployeeDetails>
      </EmployeeInfo>

      <WeekInfo>
        Ce planning est spécifique à la semaine du {formatDate(weekStart)} au{" "}
        {formatDate(internalWeekDays[6])}. Il n'affectera pas les autres
        semaines.
      </WeekInfo>

      <DaysGrid>
        {internalWeekDays.map((day, index) => (
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
  employee: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    department: PropTypes.string,
    contract_hours: PropTypes.number,
  }).isRequired,
  weekStart: PropTypes.instanceOf(Date).isRequired,
  weekDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  scheduleData: PropTypes.shape({
    id: PropTypes.number,
    days: PropTypes.arrayOf(
      PropTypes.shape({
        hours: PropTypes.string,
        absence: PropTypes.string,
        note: PropTypes.string,
        timeSlots: PropTypes.arrayOf(
          PropTypes.shape({
            start: PropTypes.string,
            end: PropTypes.string,
          })
        ),
        type: PropTypes.oneOf(["work", "absence"]),
      })
    ),
  }),
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default EmployeeScheduleForm;
