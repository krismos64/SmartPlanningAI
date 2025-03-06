import DOMPurify from "dompurify";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarDay,
  FaFilePdf,
  FaPlus,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import thinkingAnimation from "../assets/animations/thinking.json";
import EmployeeScheduleForm from "../components/schedule/EmployeeScheduleForm";
import WeeklyScheduleForm from "../components/schedule/WeeklyScheduleForm";
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
import { standardizeScheduleData } from "../utils/scheduleUtils";

// Importer react-lottie avec require pour éviter les problèmes de compatibilité
const Lottie = require("react-lottie").default;

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
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
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

const PlanningTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const AnimationContainer = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
`;

/**
 * Page de gestion des plannings hebdomadaires
 */
const WeeklySchedulePage = () => {
  const navigate = useNavigate();
  const { weekStart: weekStartParam } = useParams();

  // Références pour éviter les boucles infinies
  const prevScheduleDataRef = useRef(null);
  const prevFormattedScheduleDataRef = useRef(null);

  // États pour la gestion des plannings
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    try {
      // Essayer de créer une date à partir de weekStartParam
      if (weekStartParam) {
        const date = new Date(weekStartParam);
        // Vérifier si la date est valide
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      // Si weekStartParam est invalide ou non fourni, utiliser la date actuelle
      return getWeekStart(new Date());
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de currentWeekStart:",
        error
      );
      return getWeekStart(new Date());
    }
  });
  const [scheduleData, setScheduleData] = useState([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Formater la date de début de semaine pour l'API
  const formattedWeekStart = useMemo(
    () => formatDateForInput(currentWeekStart),
    [currentWeekStart]
  );

  // Récupérer les employés
  const {
    employees,
    loading: employeesLoading,
    // eslint-disable-next-line no-unused-vars
    error: employeesError,
    fetchEmployees,
  } = useEmployees();

  // Récupérer les plannings
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
    fetchSchedules,
    createSchedule,
  } = useWeeklySchedules();

  // Formater les données de planning pour le composant WeeklyScheduleGrid
  const formattedScheduleData = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) {
      console.warn("Données de plannings invalides:", schedules);
      return [];
    }

    // Log pour débogage
    console.log("Données brutes des plannings:", schedules);

    // Standardiser les données de planning (incluant la conversion JSON si nécessaire)
    // La fonction standardizeScheduleData s'assure que les données JSON sont correctement parsées
    return schedules.map((schedule) => {
      try {
        const standardized = standardizeScheduleData(schedule);
        console.log(
          `Planning standardisé pour l'employé ${schedule.employee_id}:`,
          standardized
        );
        return standardized;
      } catch (error) {
        console.error(
          `Erreur lors de la standardisation du planning pour l'employé ${schedule.employee_id}:`,
          error
        );
        // Retourner un planning vide en cas d'erreur
        return {
          employeeId: schedule.employee_id,
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
    });
  }, [schedules]);

  // Mettre à jour les données de planning lorsque les plannings changent
  useEffect(() => {
    // Vérifier si les données ont changé pour éviter les boucles infinies
    const currentScheduleDataStr = JSON.stringify(scheduleData);
    const currentFormattedScheduleDataStr = JSON.stringify(
      formattedScheduleData
    );

    if (
      prevFormattedScheduleDataRef.current !==
        currentFormattedScheduleDataStr &&
      prevScheduleDataRef.current !== currentScheduleDataStr
    ) {
      prevFormattedScheduleDataRef.current = currentFormattedScheduleDataStr;
      prevScheduleDataRef.current = currentScheduleDataStr;

      console.log(
        "Mise à jour des données de planning:",
        formattedScheduleData
      );
      setScheduleData(formattedScheduleData);
    }
  }, [formattedScheduleData, scheduleData]);

  // Charger les plannings lorsque la semaine change
  useEffect(() => {
    console.log(
      `Récupération des plannings pour la semaine du ${formattedWeekStart}`
    );
    fetchSchedules(formattedWeekStart)
      .then((data) => {
        console.log("Plannings récupérés avec succès:", data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des plannings:", error);
      });
  }, [fetchSchedules, formattedWeekStart]);

  // Gérer les erreurs de chargement des plannings
  useEffect(() => {
    if (schedulesError) {
      console.error("Erreur de chargement des plannings:", schedulesError);
      toast.error(`Erreur lors du chargement des plannings: ${schedulesError}`);
    }
  }, [schedulesError]);

  // Obtenir l'employé en cours d'édition
  const editingEmployee = useMemo(() => {
    if (!editingEmployeeId || !employees) return null;
    return employees.find((emp) => emp.id === editingEmployeeId) || null;
  }, [editingEmployeeId, employees]);

  // Extraire les départements uniques
  const uniqueDepartments = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return [];
    const departments = [...new Set(employees.map((emp) => emp.department))];
    return departments.filter((dept) => dept && dept.trim() !== "");
  }, [employees]);

  // Extraire les rôles uniques
  const uniqueRoles = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return [];
    const roles = [...new Set(employees.map((emp) => emp.role))];
    return roles.filter((role) => role && role.trim() !== "");
  }, [employees]);

  // Mettre à jour l'URL lorsque la semaine change
  useEffect(() => {
    const formattedDate = formatDateForInput(currentWeekStart);
    navigate(`/weekly-schedule/${formattedDate}`, { replace: true });
  }, [currentWeekStart, navigate]);

  // Filtrer les employés en fonction des critères
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];

    let filtered = Array.isArray(employees) ? [...employees] : [];

    // Filtrer par département si sélectionné
    if (selectedDepartment) {
      filtered = filtered.filter(
        (emp) => emp.department === selectedDepartment
      );
    }

    // Filtrer par rôle si sélectionné
    if (selectedRole) {
      filtered = filtered.filter((emp) => emp.role === selectedRole);
    }

    // Filtrer par recherche si saisie
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(query) ||
          emp.lastName.toLowerCase().includes(query) ||
          (emp.email && emp.email.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [employees, selectedDepartment, selectedRole, searchQuery]);

  // Fonctions de navigation entre les semaines
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, -1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getWeekStart(new Date()));
  }, []);

  // Fonction pour gérer l'édition d'un employé
  const handleEditEmployee = useCallback((employeeId) => {
    setEditingEmployeeId(employeeId);
  }, []);

  // Fonction pour annuler l'édition
  const handleCancelEdit = useCallback(() => {
    setEditingEmployeeId(null);
  }, []);

  // Fonction pour gérer la recherche
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Fonction pour gérer le changement de département
  const handleDepartmentChange = useCallback((e) => {
    setSelectedDepartment(e.target.value);
  }, []);

  // Fonction pour gérer le changement de rôle
  const handleRoleChange = useCallback((e) => {
    setSelectedRole(e.target.value);
  }, []);

  // Fonction pour gérer le changement de planning
  const handleScheduleChange = useCallback((newScheduleData) => {
    setScheduleData(newScheduleData);
  }, []);

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

  // Ajouter la fonction de gestion de création
  const handleCreateSchedule = async (formData) => {
    try {
      const result = await createSchedule(formData);
      if (result.success) {
        setShowCreateForm(false);
        await fetchSchedules(formData.weekStart);
        toast.success("Planning créé avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la création du planning");
      }
    } catch (error) {
      console.error("Erreur lors de la création du planning:", error);
      toast.error("Erreur lors de la création du planning");
    }
  };

  // Afficher un spinner pendant le chargement
  if (employeesLoading || schedulesLoading) {
    return (
      <Spinner $center={true} $size="large" text="Chargement du planning..." />
    );
  }

  return (
    <div>
      <PageHeader title="Planning Hebdomadaire" />

      <ScheduleContainer>
        <ScheduleHeader>
          <HeaderLeft>
            <AnimationContainer>
              <Lottie
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: thinkingAnimation,
                  rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                  },
                }}
                height={80}
                width={80}
              />
            </AnimationContainer>
            <TitleContainer>
              <PageTitle>Planning Hebdomadaire</PageTitle>
              <PageDescription>
                Gérez les horaires de travail de vos employés
              </PageDescription>
            </TitleContainer>
          </HeaderLeft>
          <div>
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
                <ActionButton
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  <FaPlus /> Nouveau planning
                </ActionButton>
                <ExportAllButton
                  variant="secondary"
                  onClick={generateAllEmployeesPDF}
                >
                  <FaFilePdf /> Exporter planning global
                </ExportAllButton>
              </WeekActions>
            </WeekNavigation>
          </div>
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
                  value={selectedRole}
                  onChange={handleRoleChange}
                  placeholder="Tous les rôles"
                >
                  <option value="">Tous les rôles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </FilterSelect>
              </FilterContainer>
            </ScheduleFilters>

            <Card>
              <CardHeader>
                <PlanningTitle>
                  {filteredEmployees.length > 1
                    ? `Plannings hebdomadaires (${filteredEmployees.length})`
                    : "Planning hebdomadaire"}
                </PlanningTitle>
              </CardHeader>
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
                  onSave={handleScheduleChange}
                  onCancel={handleCancelEdit}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Ajouter le modal de création */}
        <WeeklyScheduleForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateSchedule}
          employees={employees}
        />
      </ScheduleContainer>
    </div>
  );
};

export default WeeklySchedulePage;
