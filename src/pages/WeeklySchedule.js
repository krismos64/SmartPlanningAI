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
  FaRobot,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import thinkingAnimation from "../assets/animations/thinking.json";
import AutoScheduleWizard from "../components/schedule/AutoScheduleWizard";
import EmployeeScheduleForm from "../components/schedule/EmployeeScheduleForm";
import WeeklyScheduleGrid from "../components/schedule/WeeklyScheduleGrid";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import EnhancedLottie from "../components/ui/EnhancedLottie";
import { FormInput, FormSelect } from "../components/ui/Form";
import Spinner from "../components/ui/Spinner";
import useEmployees from "../hooks/useEmployees";
import useWeeklySchedules from "../hooks/useWeeklySchedules";
import { WeeklyScheduleService } from "../services/api";
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
    align-items: center;
    justify-content: space-between;
  }
`;

const FiltersGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
  }
`;

// Nouveau style pour la navigation de semaine
const WeekNavigation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  @media (min-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    min-width: 320px;
  }
`;

// Nouveau style pour l'affichage de la semaine
const WeekDisplay = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.colors.primary}10;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
    animation: shimmer 2s infinite linear;
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const WeekActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;

// Nouveau style pour les boutons d'action
const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 12px;
  font-weight: 500;
  padding: 0.75rem 1rem;
  position: relative;
  overflow: hidden;
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0;
    background: ${({ theme }) => theme.colors.primary}20;
    transition: height 0.3s ease;
    z-index: -1;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);

    &::after {
      height: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: scale(1.2);
  }
`;

// Nouveau style pour le bouton d'export
const ExportAllButton = styled(ActionButton)`
  grid-column: 1 / -1;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  color: white;
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  @media (min-width: 768px) {
    grid-column: 3;
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

const ExportOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: 0.5rem;
  margin-top: 1rem;
`;

const ExportOptionsTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExportOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ExportOptionCard = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background.primary};
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const ExportOptionTitle = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExportOptionDescription = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

// Ajouter ce style après les autres styles
const InfoMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.info.light};
  color: ${({ theme }) => theme.colors.info.dark};
  border-left: 4px solid ${({ theme }) => theme.colors.info.main};
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Nouveau style pour le bouton de génération automatique
const AutoScheduleButton = styled(Button)`
  background: linear-gradient(135deg, #7269ef, #4e46e5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 4px 15px rgba(114, 105, 239, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* Effet pulse */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    box-shadow: 0 0 0 0 rgba(114, 105, 239, 0.7);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(114, 105, 239, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(114, 105, 239, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(114, 105, 239, 0);
    }
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(114, 105, 239, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1.25rem;
    animation: robotMove 1.5s ease-in-out infinite;
  }

  @keyframes robotMove {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
`;

const WizardOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const CloseWizardButton = styled(Button)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 101;
  background: white;
  border-radius: 50%;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background: #f1f1f1;
  }

  svg {
    font-size: 1.25rem;
    color: #333;
  }
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

  // État pour l'ouverture du wizard de génération automatique
  const [isWizardOpen, setIsWizardOpen] = useState(false);

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
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);

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
  } = useEmployees();

  // Récupérer les plannings
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
    fetchSchedules,
    createSchedule,
    updateSchedule,
  } = useWeeklySchedules();

  // Formater les données de planning pour le composant WeeklyScheduleGrid
  const formattedScheduleData = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) {
      console.warn("Données de plannings invalides:", schedules);
      return [];
    }

    // Log pour débogage

    // Standardiser les données de planning (incluant la conversion JSON si nécessaire)
    // La fonction standardizeScheduleData s'assure que les données JSON sont correctement parsées
    return schedules.map((schedule) => {
      try {
        const standardized = standardizeScheduleData(schedule);
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

      setScheduleData(formattedScheduleData);
    }
  }, [formattedScheduleData, scheduleData]);

  // Charger les plannings lorsque la semaine change
  useEffect(() => {
    fetchSchedules(formattedWeekStart)
      .then((data) => {
        // Mettre à jour l'état local avec les plannings récupérés
        setScheduleData(data); // Assurez-vous que 'data' contient les plannings
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
    if (!employees || !Array.isArray(employees)) {
      return [];
    }

    let filtered = employees;

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
          (emp.firstName && emp.firstName.toLowerCase().includes(query)) ||
          (emp.lastName && emp.lastName.toLowerCase().includes(query)) ||
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
  const handleScheduleChange = useCallback(
    async (updatedScheduleData) => {
      try {
        // S'assurer que la date de début de semaine est correctement définie
        if (!updatedScheduleData.weekStart) {
          updatedScheduleData.weekStart = formattedWeekStart;
        }

        // Si les données mises à jour concernent un seul employé
        if (updatedScheduleData.employeeId) {
          // Vérifier si un planning existe déjà pour cet employé et cette semaine spécifique
          // en utilisant le service getByEmployeeAndWeek
          const existingScheduleResult =
            await WeeklyScheduleService.getByEmployeeAndWeek(
              updatedScheduleData.employeeId,
              updatedScheduleData.weekStart
            );

          let result;

          if (
            existingScheduleResult.success &&
            existingScheduleResult.schedule
          ) {
            // Mettre à jour le planning existant dans la base de données
            result = await updateSchedule(
              existingScheduleResult.schedule.id,
              updatedScheduleData
            );
          } else {
            // Créer un nouveau planning dans la base de données
            result = await createSchedule(updatedScheduleData);
          }

          if (result.success) {
            // Mettre à jour l'état local
            setScheduleData((prevData) => {
              const existingIndex = prevData.findIndex(
                (s) => s.employeeId === updatedScheduleData.employeeId
              );

              const newData = [...prevData];

              if (existingIndex >= 0) {
                // Mettre à jour le planning existant
                newData[existingIndex] = {
                  ...updatedScheduleData,
                  id: result.schedule.id, // Ajouter l'ID retourné par l'API
                };
              } else {
                // Ajouter un nouveau planning
                newData.push({
                  ...updatedScheduleData,
                  id: result.schedule.id, // Ajouter l'ID retourné par l'API
                });
              }

              return newData;
            });

            // Fermer le formulaire d'édition
            setEditingEmployeeId(null);

            // Afficher un message de succès
            toast.success(
              "Planning enregistré avec succès dans la base de données"
            );
          } else {
            // Afficher un message d'erreur
            toast.error(
              result.error || "Erreur lors de l'enregistrement du planning"
            );
          }
        } else {
          // Si c'est un tableau complet de plannings, remplacer tout
          setScheduleData(updatedScheduleData);
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du planning:", error);
        toast.error("Erreur lors de l'enregistrement du planning");
      }
    },
    [updateSchedule, createSchedule, formattedWeekStart]
  );

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

    // Date et heure d'exportation
    const exportDateTime = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

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
          <p style="margin: 5px 0; font-style: italic; text-align: right;">Document généré le ${exportDateTime}</p>
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
                const totalHours = employeeSchedule
                  ? employeeSchedule.days.reduce(
                      (sum, day) =>
                        sum +
                        (day.type === "absence"
                          ? 0
                          : parseFloat(day.hours || 0)),
                      0
                    )
                  : 0;

                return `
                <tr>
                  <td style="padding: 10px; border: 1px solid #d1d5db; text-align: left;">
                    <strong>${
                      employee.firstName || employee.first_name || "Inconnu"
                    } ${
                  employee.lastName || employee.last_name || "Inconnu"
                }</strong><br>
                    <small>${employee.role || "Inconnu"}</small>
                  </td>
                  ${getDaysOfWeek(currentWeekStart)
                    .map((dayDate, index) => {
                      const isWeekendDay = isWeekend(dayDate);

                      // Récupérer les données du jour pour cet employé
                      const dayData = employeeSchedule
                        ? employeeSchedule.days[index]
                        : null;

                      // Déterminer le contenu de la cellule
                      let cellContent = "-";
                      if (dayData) {
                        if (
                          dayData.type === "absence" &&
                          dayData.absence &&
                          dayData.absence.trim() !== ""
                        ) {
                          cellContent = `<span style="color: #ef4444;">${
                            dayData.absence || "Absent"
                          }</span>`;
                        } else if (
                          dayData.timeSlots &&
                          dayData.timeSlots.length > 0
                        ) {
                          cellContent = dayData.timeSlots
                            .map((slot) => `${slot.start}-${slot.end}`)
                            .join("<br>");

                          // Ajouter les heures si disponibles
                          if (dayData.hours) {
                            cellContent += `<br><small>${dayData.hours}h</small>`;
                          }
                        } else if (dayData.hours) {
                          cellContent = `${dayData.hours}h`;
                        }
                      }

                      return `
                      <td style="padding: 8px; border: 1px solid #d1d5db; text-align: center; ${
                        isWeekendDay ? "background-color: #f9fafb;" : ""
                      }">
                        ${cellContent}
                      </td>
                    `;
                    })
                    .join("")}
                  <td style="padding: 10px; border: 1px solid #d1d5db; text-align: center; font-weight: bold;">
                    ${totalHours.toFixed(1)}h
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

  // Fonction pour générer un PDF par département
  const generateDepartmentPDF = (department) => {
    // Filtrer les employés du département
    const departmentEmployees = filteredEmployees.filter(
      (emp) => emp.department === department
    );

    if (departmentEmployees.length === 0) {
      toast.info(`Aucun employé trouvé dans le département ${department}`);
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

    // Date et heure d'exportation
    const exportDateTime = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Créer le contenu HTML
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="text-align: center; color: #2563eb;">Planning Hebdomadaire Département: ${department}</h2>
        <h3 style="text-align: center; margin-bottom: 20px;">Du ${formattedWeekStart} au ${formattedWeekEnd}</h3>
        
        <div style="margin-bottom: 20px;">
          <p style="margin: 5px 0;">Nombre d'employés: ${
            departmentEmployees.length
          }</p>
          <p style="margin: 5px 0; font-style: italic; text-align: right;">Document généré le ${exportDateTime}</p>
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
            ${departmentEmployees
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
                    ${employee.firstName || employee.first_name || "Inconnu"} ${
                  employee.lastName || employee.last_name || "Inconnu"
                }<br>
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
        `Planning_${department}_${formatDate(
          currentWeekStart,
          "yyyy-MM-dd"
        )}.pdf`
      );

      // Nettoyer
      document.body.removeChild(tempElement);

      toast.success(
        `Planning du département ${department} exporté avec succès`
      );
    });
  };

  // Fonction pour générer un PDF pour un employé spécifique
  const generateEmployeePDF = (employee) => {
    if (!employee) {
      toast.error("Employé non trouvé");
      return;
    }

    // Trouver le planning de l'employé
    const employeeSchedule = scheduleData.find(
      (s) => s.employeeId === employee.id
    );

    if (!employeeSchedule) {
      toast.info(
        `Aucun planning trouvé pour ${
          employee.firstName || employee.first_name || "Inconnu"
        } ${employee.lastName || employee.last_name || "Inconnu"}`
      );
      return;
    }

    // Convertir les jours au format attendu
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

    // Créer un élément temporaire pour le rendu
    const tempElement = document.createElement("div");
    tempElement.style.position = "absolute";
    tempElement.style.left = "-9999px";
    tempElement.style.top = "-9999px";
    tempElement.style.width = "1000px"; // Plus large pour le format paysage

    // Formater les dates
    const weekStartDate = new Date(currentWeekStart);
    const weekEndDate = new Date(currentWeekStart);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const formattedWeekStart = formatDate(weekStartDate);
    const formattedWeekEnd = formatDate(weekEndDate);

    // Date et heure d'exportation
    const exportDateTime = new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculer le total des heures
    const totalHours = formattedDays.reduce((sum, day) => {
      return sum + (day.isAbsent ? 0 : parseFloat(day.hours || 0));
    }, 0);

    // Créer le contenu HTML
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center;">
        <h2 style="text-align: center; color: #2563eb;">Planning Hebdomadaire</h2>
        <h3 style="text-align: center; margin-bottom: 10px;">Du ${formattedWeekStart} au ${formattedWeekEnd}</h3>
        
        <div style="margin-bottom: 20px; text-align: center;">
          <h2 style="margin-bottom: 5px; color: #2563eb; font-size: 24px; font-weight: bold;">${
            employee.firstName || employee.first_name || "Inconnu"
          } ${employee.lastName || employee.last_name || "Inconnu"}</h2>
          <p style="margin: 5px 0;">Poste: ${employee.role}</p>
          <p style="margin: 5px 0;">Département: ${employee.department}</p>
          <p style="margin: 5px 0;">Heures contractuelles: ${
            employee.contractHours
          }h</p>
          <p style="margin: 5px 0;">Total heures planifiées: ${totalHours.toFixed(
            1
          )}h</p>
          <p style="margin: 5px 0; font-style: italic;">Document généré le ${exportDateTime}</p>
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
            ${formattedDays
              .map((day, index) => {
                const dayDate = new Date(currentWeekStart);
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
                    ${day.notes || "-"}
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
        `Planning_${employee.firstName || employee.first_name || "Inconnu"}_${
          employee.lastName || employee.last_name || "Inconnu"
        }_${formatDate(currentWeekStart, "yyyy-MM-dd")}.pdf`
      );

      // Nettoyer
      document.body.removeChild(tempElement);

      toast.success(
        `Planning de ${
          employee.firstName || employee.first_name || "Inconnu"
        } ${
          employee.lastName || employee.last_name || "Inconnu"
        } exporté avec succès`
      );
    });
  };

  // Ajouter la fonction de gestion de création
  // eslint-disable-next-line no-unused-vars
  const handleCreateSchedule = async (formData) => {
    try {
      // S'assurer que la date de début de semaine est correctement définie
      if (!formData.weekStart) {
        formData.weekStart = formattedWeekStart;
      }

      const result = await createSchedule(formData);
      if (result.success) {
        await fetchSchedules(formData.weekStart);
        toast.success(
          "Planning créé avec succès pour la semaine du " +
            formatDate(new Date(formData.weekStart))
        );
      } else {
        toast.error(result.error || "Erreur lors de la création du planning");
      }
    } catch (error) {
      console.error("Erreur lors de la création du planning:", error);
      toast.error("Erreur lors de la création du planning");
    }
  };

  // Vérifier si le token d'authentification est présent
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(
      "Token d'authentification dans WeeklySchedule:",
      token ? "Présent" : "Manquant",
      token ? `(${token.substring(0, 10)}...)` : ""
    );

    if (!token) {
      console.error("Token d'authentification manquant dans WeeklySchedule");
      toast.error("Vous devez être connecté pour accéder à cette page");
      navigate("/login");
    }
  }, [navigate]);

  // Afficher un spinner pendant le chargement
  if (employeesLoading || schedulesLoading) {
    return (
      <Spinner $center={true} $size="large" text="Chargement du planning..." />
    );
  }

  return (
    <div>
      <ScheduleContainer>
        <ScheduleHeader>
          <HeaderLeft>
            <AnimationContainer>
              <EnhancedLottie
                animationData={thinkingAnimation}
                loop={true}
                autoplay={true}
                height={80}
                width={80}
                rendererSettings={{
                  preserveAspectRatio: "xMidYMid slice",
                }}
              />
            </AnimationContainer>
            <TitleContainer>
              <PageTitle>Planning Hebdomadaire</PageTitle>
              <PageDescription>
                Gérez les horaires de travail de vos employés pour la semaine
                sélectionnée. Chaque semaine a son propre planning indépendant.
              </PageDescription>
            </TitleContainer>
          </HeaderLeft>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <AutoScheduleButton onClick={() => setIsWizardOpen(true)}>
              <FaRobot /> Génération automatique IA
            </AutoScheduleButton>
            <WeekNavigation>
              <WeekDisplay>
                <h3>
                  Semaine du {formatDate(currentWeekStart)} au{" "}
                  {formatDate(getWeekEnd(currentWeekStart))}
                </h3>
              </WeekDisplay>
              <WeekActions>
                <ActionButton variant="outline" onClick={goToPreviousWeek}>
                  <FaArrowLeft /> Précédente
                </ActionButton>
                <ActionButton variant="outline" onClick={goToCurrentWeek}>
                  <FaCalendarDay /> Actuelle
                </ActionButton>
                <ActionButton variant="outline" onClick={goToNextWeek}>
                  Suivante <FaArrowRight />
                </ActionButton>
              </WeekActions>
            </WeekNavigation>
          </div>
        </ScheduleHeader>

        {!editingEmployeeId && (
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
              <FiltersGroup>
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
              </FiltersGroup>

              <ExportAllButton
                onClick={() => setShowExportOptions(!showExportOptions)}
                style={{ minWidth: "200px" }}
              >
                <FaFilePdf /> Options d'export
              </ExportAllButton>
            </ScheduleFilters>

            {showExportOptions && (
              <ExportOptions>
                <ExportOptionsTitle>
                  <FaFilePdf /> Options d'exportation PDF
                </ExportOptionsTitle>
                <ExportOptionsGrid>
                  <ExportOptionCard onClick={generateAllEmployeesPDF}>
                    <ExportOptionTitle>
                      <FaUsers /> Planning global
                    </ExportOptionTitle>
                    <ExportOptionDescription>
                      Exporter le planning de tous les employés affichés dans un
                      seul document PDF
                    </ExportOptionDescription>
                  </ExportOptionCard>

                  {uniqueDepartments.map((dept) => (
                    <ExportOptionCard
                      key={dept}
                      onClick={() => generateDepartmentPDF(dept)}
                    >
                      <ExportOptionTitle>
                        <FaUsers /> Département: {dept}
                      </ExportOptionTitle>
                      <ExportOptionDescription>
                        Exporter uniquement le planning des employés du
                        département {dept}
                      </ExportOptionDescription>
                    </ExportOptionCard>
                  ))}
                </ExportOptionsGrid>
              </ExportOptions>
            )}

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
                  <>
                    <WeeklyScheduleGrid
                      employees={filteredEmployees}
                      weekStart={currentWeekStart}
                      scheduleData={scheduleData}
                      onChange={handleScheduleChange}
                      readOnly={false}
                      onEditEmployee={handleEditEmployee}
                      onGeneratePDF={generateEmployeePDF}
                    />
                  </>
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
                  scheduleData={
                    scheduleData.find(
                      (s) => s.employeeId === editingEmployeeId
                    ) || {
                      employeeId: editingEmployeeId,
                      days: Array(7)
                        .fill()
                        .map(() => ({
                          type: "work",
                          hours: "0",
                          absence: "",
                          note: "",
                          timeSlots: [],
                        })),
                    }
                  }
                  onSave={handleScheduleChange}
                  onCancel={handleCancelEdit}
                />
              )}
            </CardContent>
          </Card>
        )}
      </ScheduleContainer>

      {/* Assistant de génération automatique (modal) */}
      {isWizardOpen && (
        <WizardOverlay>
          <CloseWizardButton onClick={() => setIsWizardOpen(false)}>
            <FaTimes />
          </CloseWizardButton>
          <AutoScheduleWizard />
        </WizardOverlay>
      )}
    </div>
  );
};

export default WeeklySchedulePage;
