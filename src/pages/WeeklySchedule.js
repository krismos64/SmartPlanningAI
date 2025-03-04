import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarDay,
  FaFilePdf,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import EmployeeScheduleForm from "../components/schedule/EmployeeScheduleForm";
import WeeklyScheduleGrid from "../components/schedule/WeeklyScheduleGrid";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import { FormInput, FormSelect } from "../components/ui/Form";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/ui/Spinner";
import useEmployees from "../hooks/useEmployees";
import useWeeklySchedules from "../hooks/useWeeklySchedules";
import {
  addWeeks,
  formatDate,
  formatDateForInput,
  getDayName,
  getDaysOfWeek,
  getWeekEnd,
  getWeekStart,
  isWeekend,
} from "../utils/dateUtils";

// Styles
const ScheduleContainer = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 768px) {
    padding: 2rem;
    gap: 2rem;
  }
`;

const ScheduleHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
`;

const ScheduleFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const WeekNavigation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const WeekActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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

const ExportAllButton = styled(ActionButton)`
  margin-left: auto;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    margin-top: 0.5rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 768px) {
    min-width: 200px;
    width: auto;
  }
`;

/* Composants styled non utilisés - commentés pour éviter les erreurs ESLint
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
*/

const FilterSelect = styled(FormSelect)`
  width: 100%;

  @media (min-width: 768px) {
    min-width: 200px;
    width: auto;
  }
`;

/* Composant styled non utilisé - commenté pour éviter les erreurs ESLint
const CurrentWeek = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  width: 100%;
`;
*/

const SearchContainer = styled.div`
  margin-bottom: 1rem;
  width: 100%;
`;

const EmployeeSearchInput = styled(FormInput)`
  width: 100%;
`;

const NoResultsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

/* Composant styled non utilisé - commenté pour éviter les erreurs ESLint
const ResponsiveButton = styled(Button)`
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;

  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }
`;
*/

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

/**
 * Page de gestion des plannings hebdomadaires
 */
const WeeklySchedulePage = () => {
  const { weekStartParam } = useParams();
  const navigate = useNavigate();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    weekStartParam ? new Date(weekStartParam) : getWeekStart(new Date())
  );
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { employees, loading: loadingEmployees } = useEmployees();
  const {
    scheduleData: schedulesData,
    loading: schedulesLoading,
    error: schedulesError,
    saveEmployeeSchedule,
    saveSchedules,
  } = useWeeklySchedules(currentWeekStart);

  // Gérer les erreurs de chargement des plannings
  useEffect(() => {
    if (schedulesError) {
      toast.error("Erreur lors du chargement des plannings");
    }
  }, [schedulesError]);

  // Obtenir l'employé en cours d'édition
  const editingEmployee = useMemo(() => {
    if (!editingEmployeeId) return null;
    return employees.find((emp) => emp.id === editingEmployeeId) || null;
  }, [editingEmployeeId, employees]);

  // Extraire les départements uniques des employés
  const uniqueDepartments = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    const departments = employees
      .map((emp) => emp.department)
      .filter((dept, index, self) => dept && self.indexOf(dept) === index);

    return departments.sort();
  }, [employees]);

  // Mettre à jour l'URL lorsque la semaine change
  useEffect(() => {
    const formattedDate = formatDateForInput(currentWeekStart);
    navigate(`/weekly-schedule/${formattedDate}`, { replace: true });
  }, [currentWeekStart, navigate]);

  // Filtrer les employés en fonction du département, du statut et de la recherche
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

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (emp) =>
            emp.firstName.toLowerCase().includes(query) ||
            emp.lastName.toLowerCase().includes(query) ||
            (emp.email && emp.email.toLowerCase().includes(query))
        );
      }

      setFilteredEmployees(filtered);
    }
  }, [employees, selectedDepartment, selectedStatus, searchQuery]);

  // Préparer les données du planning pour l'affichage
  useEffect(() => {
    if (schedulesData.length > 0 && filteredEmployees.length > 0) {
      // Transformer les données pour le composant de grille
      const formattedData = [];

      // Pour chaque employé filtré, chercher son planning ou en créer un vide
      for (const employee of filteredEmployees) {
        const existingSchedule = schedulesData.find(
          (schedule) => schedule.employeeId === employee.id
        );

        if (existingSchedule) {
          // Utiliser directement les données déjà transformées
          formattedData.push({
            employeeId: existingSchedule.employeeId,
            id: existingSchedule.id,
            days: existingSchedule.days.map((day) => convertToNewFormat(day)),
          });
        } else {
          // Créer un planning vide pour cet employé avec le nouveau format
          formattedData.push({
            employeeId: employee.id,
            days: Array(7)
              .fill()
              .map(() => ({
                type: "work",
                hours: "0",
                absence: "",
                note: "",
                timeSlots: [],
              })),
          });
        }
      }

      setScheduleData(formattedData);
    } else {
      setScheduleData([]);
    }
  }, [schedulesData, filteredEmployees]);

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

  // Gestion de la recherche d'employé
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Activer le mode édition pour un employé spécifique
  const handleEditEmployee = (employeeId) => {
    setEditingEmployeeId(employeeId);
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
  };

  // Gérer la sauvegarde du planning d'un employé
  const handleSaveEmployeeSchedule = async (updatedSchedule) => {
    setIsSubmitting(true);
    try {
      // Trouver le planning existant pour cet employé
      const existingSchedule = scheduleData.find(
        (schedule) => schedule.employeeId === updatedSchedule.employeeId
      );

      // Si un planning existe déjà, ajouter son ID à la mise à jour
      if (existingSchedule && existingSchedule.id) {
        updatedSchedule.id = existingSchedule.id;
      }

      await saveEmployeeSchedule(updatedSchedule);
      toast.success("Planning enregistré avec succès");
      setEditingEmployeeId(null);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du planning:", error);
      toast.error("Erreur lors de l'enregistrement du planning");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gérer les changements dans le planning
  const handleScheduleChange = (newScheduleData) => {
    saveSchedules(newScheduleData);
  };

  // Fonction pour générer un PDF global de tous les employés
  const generateAllEmployeesPDF = () => {
    // Filtrer les employés actifs (non absents toute la semaine)
    const activeEmployees = filteredEmployees.filter((employee) => {
      const employeeSchedule = scheduleData.find(
        (s) => s.employeeId === employee.id
      );
      if (!employeeSchedule) return true; // Inclure les employés sans planning

      // Vérifier si l'employé est absent toute la semaine
      const isAbsentAllWeek = employeeSchedule.days.every(
        (day) =>
          day.type === "absence" && day.absence && day.absence.trim() !== ""
      );
      return !isAbsentAllWeek;
    });

    if (activeEmployees.length === 0) {
      toast.info("Aucun employé actif trouvé pour cette semaine");
      return;
    }

    // Créer un élément temporaire pour le rendu
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px";
    tempElement.style.top = "-9999px";
    tempElement.style.width = "1200px"; // Plus large pour le format paysage

    // Formater les dates
    const weekStartDate = new Date(currentWeekStart);
    const weekEndDate = new Date(currentWeekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const formattedWeekStart = formatDate(weekStartDate);
    const formattedWeekEnd = formatDate(weekEndDate);

    // Créer le contenu HTML
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="text-align: center; color: #2563eb;">Planning Hebdomadaire Global</h2>
        <h3 style="text-align: center; margin-bottom: 20px;">Du ${formattedWeekStart} au ${formattedWeekEnd}</h3>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 5px 0;">Département: ${
            selectedDepartment || "Tous"
          }</p>
          <p style="margin: 5px 0;">Nombre d'employés: ${
            activeEmployees.length
          }</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #e5e7eb;">
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">Employé</th>
              ${getDaysOfWeek(currentWeekStart)
                .map(
                  (day) => `
                <th style="padding: 10px; border: 1px solid #d1d5db; text-align: center; ${
                  isWeekend(day) ? "background-color: #f3f4f6;" : ""
                }">
                  ${getDayName(day, true)} ${formatDate(day, "dd/MM")}
                </th>
              `
                )
                .join("")}
              <th style="padding: 10px; border: 1px solid #d1d5db; text-align: center; background-color: #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${activeEmployees
              .map((employee) => {
                const employeeSchedule = scheduleData.find(
                  (s) => s.employeeId === employee.id
                );
                const days = employeeSchedule
                  ? employeeSchedule.days.map((day) => ({
                      isAbsent:
                        day.type === "absence" &&
                        day.absence &&
                        day.absence.trim() !== "",
                      absenceReason: day.absence || "",
                      hours: day.hours || "0",
                      timeSlots: day.timeSlots || [],
                      notes: day.note || "",
                    }))
                  : Array(7)
                      .fill()
                      .map(() => ({
                        isAbsent: false,
                        absenceReason: "",
                        hours: "0",
                        timeSlots: [],
                        notes: "",
                      }));

                // Calculer le total des heures
                const totalHours = days.reduce((sum, day) => {
                  return sum + (day.isAbsent ? 0 : parseFloat(day.hours || 0));
                }, 0);

                // Déterminer la couleur du total (rouge si < heures contractuelles, vert si >=)
                const totalColor =
                  totalHours < employee.contractHours ? "#ef4444" : "#10b981";

                return `
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db; font-weight: bold;">
                    ${employee.firstName} ${employee.lastName}<br>
                    <span style="font-weight: normal; font-size: 0.9em;">${
                      employee.role
                    }</span>
                  </td>
                  ${days
                    .map((day, index) => {
                      const dayDate = new Date(currentWeekStart);
                      dayDate.setDate(dayDate.getDate() + index);
                      const isWeekendDay = isWeekend(dayDate);

                      return `
                      <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; ${
                        isWeekendDay ? "background-color: #f9fafb;" : ""
                      }">
                        ${
                          day.isAbsent
                            ? `<span style="color: #ef4444; font-weight: bold;">${
                                day.absenceReason || "Absent"
                              }</span>`
                            : `
                            <div style="font-weight: bold; font-size: 1.2em;">${(
                              day.timeSlots || []
                            )
                              .map((slot) => `${slot.start}-${slot.end}`)
                              .join("<br>")}</div>
                            <div style="font-size: 0.8em; margin-top: 3px;">${
                              day.hours
                            }h</div>
                            ${
                              day.notes
                                ? `<div style="font-style: italic; font-size: 0.8em; color: #6b7280;">${DOMPurify.sanitize(
                                    day.notes
                                  )}</div>`
                                : ""
                            }
                          `
                        }
                      </td>
                    `;
                    })
                    .join("")}
                  <td style="padding: 10px; border: 1px solid #d1d5db; text-align: center; font-weight: bold; color: ${totalColor};">
                    ${totalHours.toFixed(1)}h<br>
                    <span style="font-size: 0.8em; font-weight: normal;">(${
                      employee.contractHours
                    }h)</span>
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
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(
        `Planning_Global_${formatDate(currentWeekStart, "yyyy-MM-dd")}.pdf`
      );

      // Nettoyer
      document.body.removeChild(tempElement);
    });
  };

  // Afficher un spinner pendant le chargement
  if (loadingEmployees || schedulesLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="Planning Hebdomadaire" />

      <ScheduleContainer>
        <ScheduleHeader>
          <WeekNavigation>
            <div>
              <h3>
                Semaine du {formatDate(currentWeekStart)} au{" "}
                {formatDate(getWeekEnd(currentWeekStart))}
              </h3>
            </div>
            <WeekActions>
              <ActionButton variant="outline" onClick={goToPreviousWeek}>
                <FaArrowLeft /> Semaine précédente
              </ActionButton>
              <ActionButton variant="outline" onClick={goToCurrentWeek}>
                <FaCalendarDay /> Semaine actuelle
              </ActionButton>
              <ActionButton variant="outline" onClick={goToNextWeek}>
                Semaine suivante <FaArrowRight />
              </ActionButton>
              <ExportAllButton
                variant="secondary"
                onClick={generateAllEmployeesPDF}
              >
                <FaFilePdf /> Exporter tous les plannings
              </ExportAllButton>
            </WeekActions>
          </WeekNavigation>
        </ScheduleHeader>

        {!editingEmployee && (
          <>
            <SearchContainer>
              <EmployeeSearchInput
                type="text"
                placeholder="Rechercher un employé par nom, prénom ou email..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </SearchContainer>

            <ScheduleFilters>
              <FilterContainer>
                <FilterSelect
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  placeholder="Tous les départements"
                >
                  <option value="">Tous les départements</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </FilterSelect>
              </FilterContainer>

              <FilterContainer>
                <FilterSelect
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  placeholder="Tous les statuts"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="vacation">En congé</option>
                  <option value="sick">Malade</option>
                </FilterSelect>
              </FilterContainer>
            </ScheduleFilters>

            <Card>
              <CardHeader>Planning hebdomadaire</CardHeader>
              <CardContent>
                {filteredEmployees.length === 0 ? (
                  <NoResultsMessage>
                    {searchQuery
                      ? "Aucun employé trouvé avec cette recherche."
                      : "Aucun employé trouvé avec les filtres sélectionnés."}
                  </NoResultsMessage>
                ) : (
                  <WeeklyScheduleGrid
                    employees={filteredEmployees}
                    weekStart={currentWeekStart}
                    scheduleData={scheduleData}
                    onChange={handleScheduleChange}
                    readOnly={true}
                    onEditEmployee={handleEditEmployee}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {editingEmployeeId && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2>Modifier le planning</h2>
                <Button variant="secondary" onClick={handleCancelEdit}>
                  Annuler
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingEmployee && (
                <EmployeeScheduleForm
                  employee={editingEmployee}
                  weekStart={currentWeekStart}
                  scheduleData={scheduleData}
                  onSave={handleSaveEmployeeSchedule}
                  onCancel={handleCancelEdit}
                  isSubmitting={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        )}
      </ScheduleContainer>
    </div>
  );
};

export default WeeklySchedulePage;
