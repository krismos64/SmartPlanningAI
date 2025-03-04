import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PropTypes from "prop-types";
import { FaEdit, FaFilePdf } from "react-icons/fa";
import styled from "styled-components";
import { formatDate, getDayName, getDaysOfWeek } from "../../utils/dateUtils";
import Button from "../ui/Button";

// Styles
const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 200px repeat(7, 1fr) 100px 80px 80px;
  gap: 1px;
  background-color: ${({ theme }) => theme.colors.border.light};
  border-radius: 0.5rem;
  overflow-x: auto;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: 180px repeat(7, 1fr) 100px 80px 80px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 150px repeat(7, minmax(80px, 1fr)) 100px 80px 80px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 120px repeat(7, minmax(70px, 1fr)) 100px 80px 80px;
    font-size: 0.85rem;
  }

  @media (max-width: 576px) {
    display: block;
    overflow-x: visible;
    background-color: transparent;
    gap: 0;
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

  @media (max-width: 576px) {
    padding: 0.5rem;
    min-height: auto;
  }
`;

const HeaderCell = styled(GridCell)`
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 10;

  @media (max-width: 576px) {
    display: none;
  }
`;

const EmployeeCell = styled(GridCell)`
  justify-content: flex-start;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  position: sticky;
  left: 0;
  z-index: 5;

  @media (max-width: 576px) {
    position: static;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    margin-top: 1rem;
    font-size: 1.1rem;
    justify-content: center;
  }
`;

const TotalCell = styled(GridCell)`
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  position: sticky;
  right: 160px;
  z-index: 5;

  @media (max-width: 576px) {
    position: static;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    margin-bottom: 1rem;
  }
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

  @media (max-width: 576px) {
    display: grid;
    grid-template-columns: 100px 1fr;
    text-align: left;
    border-radius: 0;
    margin: 0;

    &::before {
      content: attr(data-day);
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }
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

  @media (max-width: 576px) {
    position: static;
    padding: 0.5rem;
  }
`;

const ExportCell = styled(GridCell)`
  position: sticky;
  right: 80px;
  z-index: 5;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 0.5rem;

  @media (max-width: 576px) {
    position: static;
    padding: 0.5rem;
  }
`;

const ActionButton = styled(Button)`
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const EmployeeRow = styled.div`
  display: contents;

  @media (max-width: 576px) {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 2px 8px
      ${({ theme }) =>
        theme.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)"};
    margin-bottom: 1.5rem;
  }
`;

const ActionRow = styled.div`
  @media (max-width: 576px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.75rem;
    background-color: ${({ theme }) => theme.colors.background.secondary};
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

  // Fonction pour générer un PDF du planning d'un employé
  const generatePDF = (employee, days, weekStart) => {
    // Créer un élément temporaire pour le rendu
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px";
    tempElement.style.top = "-9999px";
    tempElement.style.width = "1000px"; // Plus large pour le format paysage

    // Formater les dates
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const formattedWeekStart = formatDate(weekStartDate);
    const formattedWeekEnd = formatDate(weekEndDate);

    // Calculer le total des heures
    const totalHours = days.reduce((sum, day) => {
      return sum + (day.isAbsent ? 0 : parseFloat(day.hours || 0));
    }, 0);

    // Créer le contenu HTML
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center;">
        <h2 style="text-align: center; color: #2563eb;">Planning Hebdomadaire</h2>
        <h3 style="text-align: center; margin-bottom: 10px;">Du ${formattedWeekStart} au ${formattedWeekEnd}</h3>
        
        <div style="margin-bottom: 20px; text-align: center;">
          <h2 style="margin-bottom: 5px; color: #2563eb; font-size: 24px; font-weight: bold;">${
            employee.firstName
          } ${employee.lastName}</h2>
          <p style="margin: 5px 0;">Poste: ${employee.role}</p>
          <p style="margin: 5px 0;">Département: ${employee.department}</p>
          <p style="margin: 5px 0;">Heures contractuelles: ${
            employee.contractHours
          }h</p>
          <p style="margin: 5px 0;">Total heures planifiées: ${totalHours.toFixed(
            1
          )}h</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 0 auto; max-width: 900px;">
          <thead>
            <tr style="background-color: #e5e7eb;">
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Jour</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Heures</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Créneaux</th>
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${days
              .map((day, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + index);
                const isWeekendDay = isWeekend(dayDate);

                return `
                <tr style="background-color: ${
                  isWeekendDay ? "#f9fafb" : "white"
                };">
                  <td style="padding: 10px; border: 1px solid #d1d5db; font-weight: ${
                    isWeekendDay ? "bold" : "normal"
                  };">
                    ${getDayName(dayDate)} ${formatDate(dayDate, "dd/MM")}
                  </td>
                  <td style="padding: 10px; border: 1px solid #d1d5db;">
                    ${
                      day.isAbsent
                        ? `<span style="color: #ef4444; font-weight: bold;">${
                            day.absenceReason || "Absent"
                          }</span>`
                        : `${day.hours}h`
                    }
                  </td>
                  <td style="padding: 10px; border: 1px solid #d1d5db;">
                    ${
                      day.isAbsent
                        ? "-"
                        : (day.timeSlots || [])
                            .map((slot) => `${slot.start} - ${slot.end}`)
                            .join("<br>")
                    }
                  </td>
                  <td style="padding: 10px; border: 1px solid #d1d5db; font-style: italic;">
                    ${day.notes ? DOMPurify.sanitize(day.notes) : ""}
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    // Ajouter le contenu à l'élément temporaire
    tempElement.innerHTML = DOMPurify.sanitize(content);
    document.body.appendChild(tempElement);

    // Générer le PDF
    html2canvas(tempElement, {
      scale: 1,
      useCORS: true,
      logging: false,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Format paysage
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `Planning_${employee.firstName}_${employee.lastName}_${formattedWeekStart}.pdf`
      );

      // Nettoyer
      document.body.removeChild(tempElement);
    });
  };

  const handleGeneratePDF = (employee) => {
    const employeeSchedule = scheduleData.find(
      (schedule) => schedule.employeeId === employee.id
    );

    if (employeeSchedule) {
      // Convertir les jours au format attendu par generatePDF
      const formattedDays = employeeSchedule.days.map((day) => {
        return {
          isAbsent:
            day.type === "absence" && day.absence && day.absence.trim() !== "",
          absenceReason: day.absence || "",
          hours: day.hours || "0",
          timeSlots: day.timeSlots || [],
          notes: day.note || "",
        };
      });

      generatePDF(employee, formattedDays, weekStart);
    } else {
      // Créer un planning vide si aucun n'existe
      const emptyDays = Array(7)
        .fill()
        .map(() => ({
          isAbsent: false,
          absenceReason: "",
          hours: "0",
          timeSlots: [],
          notes: "",
        }));
      generatePDF(employee, emptyDays, weekStart);
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
      <HeaderCell>Export</HeaderCell>
      <HeaderCell>Actions</HeaderCell>

      {/* Lignes pour chaque employé */}
      {employees.map((employee) => (
        <EmployeeRow key={employee.id}>
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
                data-day={formatDate(daysOfWeek[dayIndex], "EEEE")}
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

          <ActionRow>
            {/* Cellule d'export */}
            <ExportCell>
              <ActionButton
                variant="secondary"
                onClick={() => handleGeneratePDF(employee)}
              >
                <FaFilePdf /> PDF
              </ActionButton>
            </ExportCell>

            {/* Cellule d'action */}
            <ActionCell>
              <ActionButton
                variant="primary"
                onClick={() => handleEditClick(employee.id)}
              >
                <FaEdit /> Modifier
              </ActionButton>
            </ActionCell>
          </ActionRow>
        </EmployeeRow>
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
