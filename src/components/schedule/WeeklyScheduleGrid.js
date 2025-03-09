import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaEdit,
  FaFilePdf,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import styled, { useTheme } from "styled-components";
import Button from "../../components/ui/Button";
import useHourBalance from "../../hooks/useHourBalance";
import { formatDate, getDayName, getDaysOfWeek } from "../../utils/dateUtils";
import {
  calculateTotalHours,
  isAbsent as isEmployeeAbsent,
  standardizeScheduleData,
} from "../../utils/scheduleUtils";

// Styles
const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: 250px repeat(7, 1fr) 100px 80px 80px;
  gap: 1px;
  background-color: ${({ theme }) => theme.colors.border.light};
  border-radius: 0.5rem;
  overflow-x: auto;
  width: 100%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-image: linear-gradient(
        to right,
        transparent,
        transparent 99%,
        ${({ theme }) => theme.colors.border.light} 99%,
        ${({ theme }) => theme.colors.border.light} 100%
      ),
      linear-gradient(
        to bottom,
        transparent,
        transparent 99%,
        ${({ theme }) => theme.colors.border.light} 99%,
        ${({ theme }) => theme.colors.border.light} 100%
      );
    background-size: 100% 100%;
    background-position: 0 0;
    background-repeat: repeat;
    z-index: 1;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 220px repeat(7, 1fr) 100px 80px 80px;
  }

  @media (max-width: 992px) {
    grid-template-columns: 180px repeat(7, minmax(80px, 1fr)) 100px 80px 80px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 150px repeat(7, minmax(70px, 1fr)) 100px 80px 80px;
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
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  &:hover {
    transform: translateZ(0);
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary.main}40;
  }

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
  cursor: ${(props) => (props.sortable ? "pointer" : "default")};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  &:hover {
    background-color: ${(props) =>
      props.sortable
        ? ({ theme }) => theme.colors.background.tertiary
        : "inherit"};
  }

  @media (max-width: 576px) {
    display: none;
  }
`;

const EmployeeCell = styled(GridCell)`
  justify-content: flex-start;
  font-weight: 600;
  position: sticky;
  left: 0;
  z-index: 3;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
  min-width: 150px;
  flex-direction: column;
  align-items: flex-start;
`;

const EmployeeName = styled.div`
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.primary.main};
  display: block;
  width: 100%;
  text-align: left;
`;

const EmployeeActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  width: 100%;
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

  ${({ isAbsent }) =>
    isAbsent &&
    `
    color: #ef4444;
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
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BreakInfo = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
`;

const HoursValue = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AbsenceValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #ef4444;
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

const QuickEditButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  opacity: 0;
  padding: 0.25rem;
  font-size: 0.7rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.main};

  ${DayCell}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled(Button)`
  padding: 0.4rem 0.6rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.3rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const WeeklyScheduleGrid = ({
  employees,
  weekStart,
  scheduleData,
  onChange,
  readOnly,
  onEditEmployee,
  onGeneratePDF,
}) => {
  const theme = useTheme();
  const { getEmployeeBalance } = useHourBalance();

  // S'assurer que employees est un tableau
  const employeesArray = Array.isArray(employees) ? employees : [];

  // S'assurer que scheduleData est un tableau
  const scheduleDataArray = useMemo(() => {
    return Array.isArray(scheduleData) ? scheduleData : [];
  }, [scheduleData]);

  // S'assurer que weekStart est une date valide
  const validWeekStart = useMemo(() => {
    try {
      const date = weekStart instanceof Date ? weekStart : new Date(weekStart);
      return !isNaN(date.getTime()) ? date : new Date();
    } catch (error) {
      console.error("Date de début de semaine invalide:", weekStart);
      return new Date();
    }
  }, [weekStart]);

  // État pour le tri
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Obtenir les jours de la semaine
  const daysOfWeek = getDaysOfWeek(validWeekStart);

  // Fonction pour trier les employés
  const sortedEmployees = [...employeesArray].sort((a, b) => {
    if (sortConfig.key === null) {
      return 0;
    }

    let aValue, bValue;

    if (sortConfig.key === "name") {
      aValue = `${a.lastName} ${a.firstName}`.toLowerCase();
      bValue = `${b.lastName} ${b.firstName}`.toLowerCase();
    } else if (sortConfig.key === "total") {
      aValue = parseFloat(calculateEmployeeTotal(a.id));
      bValue = parseFloat(calculateEmployeeTotal(b.id));
    } else {
      aValue = a[sortConfig.key];
      bValue = b[sortConfig.key];
    }

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Fonction pour changer le tri
  const requestSort = useCallback(
    (key) => {
      let direction = "ascending";
      if (sortConfig.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  // Obtenir l'icône de tri
  const getSortIcon = useCallback(
    (key) => {
      if (sortConfig.key !== key) {
        return null;
      }
      return sortConfig.direction === "ascending" ? (
        <FaSortAmountUp size={12} />
      ) : (
        <FaSortAmountDown size={12} />
      );
    },
    [sortConfig]
  );

  // Trouver le planning d'un employé
  const findEmployeeSchedule = useCallback(
    (employeeId) => {
      const schedule = scheduleDataArray.find(
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

      // Standardiser les données
      return standardizeScheduleData(schedule);
    },
    [scheduleDataArray]
  );

  // Gérer le clic sur le bouton d'édition
  const handleEditClick = useCallback(
    (employeeId) => {
      if (onEditEmployee) {
        onEditEmployee(employeeId);
      }
    },
    [onEditEmployee]
  );

  // Vérifier si un jour est un weekend
  const isWeekend = useCallback((dayIndex) => {
    return dayIndex === 5 || dayIndex === 6; // Samedi ou Dimanche
  }, []);

  // Vérifier si un employé est absent pour un jour donné
  const isAbsent = useCallback(
    (employeeId, dayIndex) => {
      const schedule = findEmployeeSchedule(employeeId);
      const day = schedule.days[dayIndex];
      return isEmployeeAbsent(day);
    },
    [findEmployeeSchedule]
  );

  // Formater l'affichage d'une cellule de jour
  const formatDayCell = useCallback(
    (employeeId, dayIndex) => {
      const schedule = findEmployeeSchedule(employeeId);
      const day = schedule.days[dayIndex];

      if (!day) return null;

      const hasTimeSlots = day.timeSlots && day.timeSlots.length > 0;

      return (
        <>
          {day.type === "absence" &&
          day.absence &&
          day.absence.trim() !== "" ? (
            <AbsenceValue>{day.absence}</AbsenceValue>
          ) : hasTimeSlots ? (
            day.timeSlots.map((slot, index) => (
              <TimeSlot key={index}>
                {slot.start} - {slot.end}
                {slot.break && <BreakInfo>Pause: {slot.break}h</BreakInfo>}
              </TimeSlot>
            ))
          ) : (
            <TimeSlot>-</TimeSlot>
          )}
          <HoursValue>{day.hours || "0"}h</HoursValue>
          {day.note && day.note.trim() !== "" && (
            <NoteText title={day.note}>{day.note}</NoteText>
          )}
        </>
      );
    },
    [findEmployeeSchedule]
  );

  // Calculer le total des heures pour un employé
  const calculateEmployeeTotal = useCallback(
    (employeeId) => {
      const schedule = findEmployeeSchedule(employeeId);
      return calculateTotalHours(schedule).toFixed(1);
    },
    [findEmployeeSchedule]
  );

  // Obtenir le compteur horaire d'un employé (heures contractuelles vs heures travaillées)
  const getEmployeeHoursCounter = useCallback(
    (employeeId) => {
      try {
        const employee = employees.find((emp) => emp.id === employeeId);
        if (!employee) return "N/A";

        // Vérifier si contractHours existe et est un nombre valide
        const contractHours = employee.contractHours
          ? parseFloat(employee.contractHours)
          : null;
        if (contractHours === null || isNaN(contractHours)) return "N/A";

        // Calculer les heures travaillées
        const workedHours = parseFloat(calculateEmployeeTotal(employeeId));
        if (isNaN(workedHours)) return "N/A";

        // Utiliser le solde d'heures de l'API si disponible
        if (employee.hour_balance !== undefined) {
          const balance = parseFloat(employee.hour_balance);
          if (!isNaN(balance)) {
            return balance === 0
              ? "0"
              : balance > 0
              ? `+${balance.toFixed(1)}`
              : balance.toFixed(1);
          }
        }

        // Sinon, calculer la différence localement
        const diff = workedHours - contractHours;

        return diff === 0
          ? "0"
          : diff > 0
          ? `+${diff.toFixed(1)}`
          : diff.toFixed(1);
      } catch (error) {
        console.error("Erreur lors du calcul du solde d'heures:", error);
        return "N/A";
      }
    },
    [employees, calculateEmployeeTotal]
  );

  // Charger le solde d'heures pour chaque employé
  useEffect(() => {
    const loadHourBalances = async () => {
      try {
        for (const employee of employees) {
          if (employee && employee.id) {
            try {
              const balance = await getEmployeeBalance(employee.id);
              if (balance !== null) {
                // Mettre à jour l'employé avec le solde d'heures
                employee.hour_balance = balance;
              }
            } catch (error) {
              console.warn(
                `Avertissement: Impossible de récupérer le solde d'heures pour l'employé ${employee.id}:`,
                error
              );
              // Continuer avec les autres employés même si une erreur se produit
            }
          }
        }
      } catch (error) {
        console.warn(
          "Avertissement lors du chargement des soldes d'heures:",
          error
        );
        // Ne pas afficher de toast d'erreur pour ne pas perturber l'utilisateur
      }
    };

    loadHourBalances();
  }, [employees, getEmployeeBalance]);

  // Fonction pour générer un PDF du planning d'un employé
  const generatePDF = (employee, days, weekStart) => {
    // Vérifier si weekStart est valide
    if (!weekStart || isNaN(new Date(weekStart).getTime())) {
      console.error(
        "Date de début de semaine invalide pour le PDF:",
        weekStart
      );
      toast.error("Impossible de générer le PDF: date invalide");
      return;
    }

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

    // Récupérer le prénom et le nom en tenant compte des différentes structures possibles
    const firstName = employee.firstName || employee.first_name || "Inconnu";
    const lastName = employee.lastName || employee.last_name || "Inconnu";

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
          <h2 style="margin-bottom: 5px; color: #2563eb; font-size: 24px; font-weight: bold;">${firstName} ${lastName}</h2>
          <p style="margin: 5px 0;">Poste: ${employee.role || "Inconnu"}</p>
          <p style="margin: 5px 0;">Département: ${
            employee.department || "Inconnu"
          }</p>
          <p style="margin: 5px 0;">Heures contractuelles: ${
            employee.contractHours || "0"
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
      pdf.save(`Planning_${firstName}_${lastName}_${formattedWeekStart}.pdf`);

      // Nettoyer
      document.body.removeChild(tempElement);
    });
  };

  const handleGeneratePDF = (employee) => {
    if (onGeneratePDF) {
      onGeneratePDF(employee);
      return;
    }

    // Vérifier si weekStart est une date valide
    if (!validWeekStart) {
      console.error("Date de début de semaine invalide");
      toast.error("Impossible de générer le PDF : date invalide");
      return;
    }

    const employeeSchedule = scheduleDataArray.find(
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

      generatePDF(employee, formattedDays, validWeekStart);
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
      generatePDF(employee, emptyDays, validWeekStart);
    }
  };

  // Fonction pour formater la cellule d'employé
  const formatEmployeeCell = useCallback((employee) => {
    console.log("Données de l'employé:", employee);

    // Récupérer le prénom et le nom en tenant compte des différentes structures possibles
    const firstName = employee.firstName || employee.first_name || "";
    const lastName = employee.lastName || employee.last_name || "";

    // Vérifiez si les noms sont définis
    if (!firstName || !lastName) {
      console.error("Nom ou prénom manquant pour l'employé:", employee);
    }

    return (
      <EmployeeName>
        {firstName} {lastName}
      </EmployeeName>
    );
  }, []);

  return (
    <ScheduleGrid>
      {/* En-tête avec les jours de la semaine */}
      <HeaderCell sortable onClick={() => requestSort("name")}>
        Employé {getSortIcon("name")}
      </HeaderCell>
      {daysOfWeek.map((day, index) => (
        <HeaderCell key={index}>{formatDate(day, "EEE dd/MM")}</HeaderCell>
      ))}
      <HeaderCell sortable onClick={() => requestSort("total")}>
        Total {getSortIcon("total")}
      </HeaderCell>
      <HeaderCell>Export</HeaderCell>
      <HeaderCell>Actions</HeaderCell>

      {/* Lignes pour chaque employé */}
      {sortedEmployees.map((employee) => {
        const schedule = scheduleDataArray.find(
          (s) => s.employeeId === employee.id
        );
        return (
          <EmployeeRow key={employee.id}>
            <EmployeeCell>{formatEmployeeCell(employee)}</EmployeeCell>

            {/* Cellules pour chaque jour */}
            {Array(7)
              .fill()
              .map((_, dayIndex) => (
                <DayCell
                  key={dayIndex}
                  isWeekend={isWeekend(dayIndex)}
                  isAbsent={isAbsent(employee.id, dayIndex)}
                  data-day={formatDate(daysOfWeek[dayIndex], "EEEE")}
                  onClick={() => !readOnly && onEditEmployee(employee.id)}
                >
                  {formatDayCell(employee.id, dayIndex)}
                  {!readOnly && (
                    <QuickEditButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEmployee(employee.id);
                      }}
                    >
                      <FaEdit />
                    </QuickEditButton>
                  )}
                </DayCell>
              ))}

            {/* Cellule de total */}
            <TotalCell>
              {calculateEmployeeTotal(employee.id)}h
              <br />
              <small
                style={{
                  color: getEmployeeHoursCounter(employee.id).startsWith("+")
                    ? theme.colors.success.main
                    : getEmployeeHoursCounter(employee.id).startsWith("-")
                    ? theme.colors.error.main
                    : "inherit",
                }}
              >
                {getEmployeeHoursCounter(employee.id)}
              </small>
            </TotalCell>

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
          </EmployeeRow>
        );
      })}
    </ScheduleGrid>
  );
};

WeeklyScheduleGrid.propTypes = {
  employees: PropTypes.array,
  weekStart: PropTypes.instanceOf(Date).isRequired,
  scheduleData: PropTypes.array,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  onEditEmployee: PropTypes.func,
  onGeneratePDF: PropTypes.func,
};

WeeklyScheduleGrid.defaultProps = {
  employees: [],
  scheduleData: [],
  onChange: () => {},
  readOnly: false,
  onEditEmployee: null,
  onGeneratePDF: null,
};

export default WeeklyScheduleGrid;
