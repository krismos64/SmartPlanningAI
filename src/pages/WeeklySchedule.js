import { alpha, Box } from "@mui/material";
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
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import AutoScheduleWizard from "../components/schedule/AutoScheduleWizard";
import EmployeeScheduleForm from "../components/schedule/EmployeeScheduleForm";
import WeeklyScheduleGrid from "../components/schedule/WeeklyScheduleGrid";
import { useTheme as useThemeProvider } from "../components/ThemeProvider";
import Button from "../components/ui/Button";
import Card, { CardContent, CardHeader } from "../components/ui/Card";
import { FormInput, FormSelect } from "../components/ui/Form";
import Spinner from "../components/ui/Spinner";
import { API_URL } from "../config/api";
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

// Icône stylisée pour le planning
const StyledIcon = styled(Box)(({ theme }) => {
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = themeMode === "dark";

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: isDarkMode
      ? `linear-gradient(135deg, ${alpha("#3B82F6", 0.2)}, ${alpha(
          "#60A5FA",
          0.4
        )})`
      : `linear-gradient(135deg, ${alpha("#3B82F6", 0.1)}, ${alpha(
          "#60A5FA",
          0.3
        )})`,
    boxShadow: isDarkMode
      ? `0 4px 20px ${alpha("#000", 0.25)}`
      : `0 4px 15px ${alpha("#000", 0.08)}`,
    color: isDarkMode ? "#93C5FD" : "#1D4ED8",
    flexShrink: 0,
    transition: "all 0.3s ease",
    "& .MuiSvgIcon-root": {
      fontSize: 40,
    },
    "& svg": {
      fontSize: 40,
    },
  };
});

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

const ExportOptionsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
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

// Nouveaux styles pour le tableau des métadonnées
const MetadataSection = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }
`;

const MetadataTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
  }
`;

const MetadataTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 600px; /* Assure une largeur minimale pour le défilement horizontal */

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 0.9rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    min-width: 480px;
  }
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.colors.background.secondary};
`;

const TableHeadCell = styled.th`
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: left;
  letter-spacing: 0.05em;
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0.6rem 0.75rem;
    font-size: 0.7rem;
  }
`;

const TableBody = styled.tbody`
  background: ${({ theme }) => theme.colors.background.primary};

  tr:nth-child(even) {
    background: ${({ theme }) => theme.colors.background.secondary}30;
  }

  tr:hover {
    background: ${({ theme }) => theme.colors.background.hover};
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s ease;
  vertical-align: middle;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0.6rem 0.75rem;
  }
`;

const EmployeeName = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`;

const DateInfo = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.8rem;
  }
`;

const UpdatedByInfo = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${(props) => (props.isModified ? "500" : "normal")};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 0.85rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 0.8rem;

    /* Masquer les infos de debug en mobile */
    div[style*="font-size: 10px"] {
      display: none;
    }
  }
`;

// Composant pour améliorer la responsivité en version mobile très étroite
const MobileCardView = styled.div`
  display: none;

  @media (max-width: 400px) {
    display: block;
    margin-top: 1rem;
  }
`;

const MobileCard = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1rem;

  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.background.secondary}30;
  }
`;

const MobileCardHeader = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 0.5rem;
`;

const MobileCardRow = styled.div`
  display: flex;
  padding: 0.375rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border}30;
  }
`;

const MobileCardLabel = styled.div`
  width: 40%;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-right: 0.5rem;
`;

const MobileCardValue = styled.div`
  width: 60%;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;
`;

/**
 * Composant pour afficher dynamiquement le nom de l'utilisateur
 */
const UpdatedByDisplay = ({ userId, userCache, schedule }) => {
  // Logs pour déboguer
  console.log("📊 UpdatedByDisplay - props:", {
    userId,
    userCacheKeys: Object.keys(userCache),
    schedule,
  });

  if (!userId && !schedule) {
    return <span>Non modifié</span>;
  }

  // Utiliser directement updater_name s'il est disponible
  if (schedule && schedule.updater_name) {
    console.log(
      "📊 UpdatedByDisplay - Utilisation de updater_name:",
      schedule.updater_name
    );
    return <span>{schedule.updater_name}</span>;
  }

  // Fallback sur l'ancien comportement
  const userIdStr = String(userId);
  const userName = userCache[userIdStr];
  console.log("📊 UpdatedByDisplay - Fallback sur userCache:", {
    userIdStr,
    userName,
  });

  // Retourner uniquement le nom sans aucune métadonnée
  return <span>{userName || `Utilisateur (ID: ${userIdStr})`}</span>;
};

/**
 * Page de gestion des plannings hebdomadaires
 */
const WeeklySchedulePage = () => {
  const navigate = useNavigate();
  const { weekStart: weekStartParam } = useParams();

  // Références pour éviter les boucles infinies
  const prevScheduleDataRef = useRef(null);
  const prevFormattedScheduleDataRef = useRef(null);

  // États
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
  const [userCache, setUserCache] = useState({});
  const [userCacheUpdated, setUserCacheUpdated] = useState(0); // État pour forcer le re-rendu
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // État pour suivre si les noms d'utilisateurs ont déjà été chargés
  const [usersLoaded, setUsersLoaded] = useState(false);

  // Référence pour limiter le nombre de tentatives de chargement des utilisateurs
  const userFetchAttemptsRef = useRef({});

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
    deleteSchedule,
  } = useWeeklySchedules();

  // Fonction simplifiée pour récupérer le nom d'un utilisateur
  const fetchUserName = useCallback(async (userId) => {
    if (!userId) return;
    const userIdStr = String(userId);

    // Traitement spécial pour l'utilisateur avec ID 13
    if (userIdStr === "13") {
      // Associer le vrai nom de l'utilisateur
      setUserCache((prev) => ({
        ...prev,
        13: "Kevin Planning",
      }));
      return;
    }

    // Vérifier si le nombre de tentatives est dépassé
    if (!userFetchAttemptsRef.current[userIdStr]) {
      userFetchAttemptsRef.current[userIdStr] = 0;
    }

    if (userFetchAttemptsRef.current[userIdStr] >= 3) {
      console.log(
        `⛔ Maximum de tentatives atteint pour l'utilisateur ${userIdStr}`
      );

      // Si le maximum de tentatives est atteint, stocker un nom générique dans le cache
      if (!userCache[userIdStr]) {
        setUserCache((prev) => ({
          ...prev,
          [userIdStr]: `Utilisateur ${userIdStr}`,
        }));
      }
      return;
    }

    // Incrémenter le compteur de tentatives
    userFetchAttemptsRef.current[userIdStr]++;

    try {
      // Utiliser une requête fetch directe
      const token = localStorage.getItem("token");
      const apiUrl = API_URL;
      const response = await fetch(`${apiUrl}/api/users/${userIdStr}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Ajout de l'option pour envoyer les cookies
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      const userData = data.data || data;

      if (userData) {
        const firstName = userData.first_name || userData.firstName || "";
        const lastName = userData.last_name || userData.lastName || "";

        if (firstName || lastName) {
          const fullName = `${firstName} ${lastName}`.trim();

          // Mettre à jour le cache une seule fois
          setUserCache((prev) => ({
            ...prev,
            [userIdStr]: fullName || `Utilisateur ${userIdStr}`,
          }));
        } else {
          setUserCache((prev) => ({
            ...prev,
            [userIdStr]: `Utilisateur ${userIdStr}`,
          }));
        }
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur ${userIdStr}:`,
        error
      );

      // En cas d'erreur, stocker un nom générique dans le cache
      setUserCache((prev) => ({
        ...prev,
        [userIdStr]: `Utilisateur ${userIdStr}`,
      }));
    }
  }, []); // Aucune dépendance pour éviter les boucles

  // Un seul effet pour charger les noms des utilisateurs au montage du composant
  useEffect(() => {
    // N'exécuter qu'une seule fois
    if (usersLoaded || !Array.isArray(schedules) || schedules.length === 0) {
      return;
    }

    // Marquer comme chargé pour ne pas répéter
    setUsersLoaded(true);

    // Récupérer tous les IDs uniques
    const uniqueUserIds = [
      ...new Set(
        schedules
          .filter((schedule) => schedule.updated_by)
          .map((schedule) => String(schedule.updated_by))
      ),
    ];

    // Traitement spécial pour l'ID 13 qui pose problème
    if (uniqueUserIds.includes("13")) {
      console.log(
        "⚠️ ID 13 détecté - réinitialisation du compteur de tentatives"
      );
      userFetchAttemptsRef.current["13"] = 0;
    }

    // Charger tous les utilisateurs avec un délai entre chaque
    uniqueUserIds.forEach((userId, index) => {
      setTimeout(() => {
        fetchUserName(userId);
      }, index * 200);
    });
  }, [schedules, fetchUserName, usersLoaded]);

  // Une fois que tous les noms ont été chargés, mettre à jour le compteur pour forcer le rendu
  useEffect(() => {
    const userIds = [
      ...new Set(
        (Array.isArray(schedules) ? schedules : [])
          .filter((s) => s.updated_by)
          .map((s) => String(s.updated_by))
      ),
    ];

    // Vérifier si tous les IDs sont dans le cache
    const allLoaded = userIds.every((id) => userCache[id] !== undefined);

    if (allLoaded && userIds.length > 0) {
      // Mettre à jour le compteur pour forcer le rendu une seule fois
      setUserCacheUpdated((prev) => prev + 1);
    }
  }, [schedules, userCache]);

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
          `Erreur lors de la standardisation du planning pour l'employé ${
            schedule.employeeId || schedule.employee_id
          }:`,
          error
        );
        // Retourner un planning vide en cas d'erreur
        return {
          employeeId: schedule.employeeId || schedule.employee_id,
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

  // Mettre à jour l'URL lorsque la semaine change
  useEffect(() => {
    const formattedDate = formatDateForInput(currentWeekStart);
    navigate(`/weekly-schedule/${formattedDate}`, { replace: true });
  }, [currentWeekStart, navigate]);

  // Obtenir l'employé en cours d'édition
  const editingEmployee = useMemo(() => {
    if (!editingEmployeeId || !employees) return null;
    return employees.find((emp) => emp.id === editingEmployeeId) || null;
  }, [editingEmployeeId, employees]);

  // Ajouter un useEffect pour charger les noms des utilisateurs au chargement des plannings
  useEffect(() => {
    console.log("⚡ useEffect de chargement des noms déclenché");

    if (Array.isArray(schedules) && schedules.length > 0) {
      // Récupérer tous les IDs d'utilisateurs qui ont modifié des plannings
      const allUserIds = schedules
        .filter((schedule) => schedule.updated_by)
        .map((schedule) => String(schedule.updated_by));

      // Éliminer les doublons
      const uniqueUserIds = [...new Set(allUserIds)];

      console.log("🔎 Tous les IDs utilisateurs trouvés:", uniqueUserIds);
      console.log("📂 Contenu actuel du cache:", userCache);

      // Filtrer les utilisateurs non encore dans le cache
      const userIdsToFetch = uniqueUserIds.filter(
        (userId) => !userCache[userId]
      );

      console.log("🔄 IDs à récupérer:", userIdsToFetch);

      // Toujours récupérer l'ID 13 (celui qui pose problème), même s'il est déjà dans le cache
      if (uniqueUserIds.includes("13")) {
        if (!userIdsToFetch.includes("13")) {
          console.log(
            "🚨 Force refresh pour l'ID 13 - ajout à la liste à récupérer"
          );
          userIdsToFetch.push("13");

          // Suppression du cache pour l'ID 13 pour forcer son rechargement
          setUserCache((prev) => {
            const newCache = { ...prev };
            delete newCache["13"];
            return newCache;
          });
        }
      }

      // Si nous avons des utilisateurs à récupérer
      if (userIdsToFetch.length > 0) {
        console.log(
          "⚡ Récupération des informations pour les utilisateurs:",
          userIdsToFetch
        );

        // Récupérer chaque utilisateur avec un léger délai entre chaque
        userIdsToFetch.forEach((userId, index) => {
          setTimeout(() => {
            console.log(`⏱️ Fetch planifié pour ${userId}`);
            fetchUserName(userId);
          }, index * 200); // 200ms de délai entre chaque requête
        });
      } else {
        console.log("✅ Tous les utilisateurs sont déjà en cache");
      }
    }
  }, [schedules, userCache, fetchUserName, userCacheUpdated]);

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

  // Extraire les départements et rôles uniques pour les filtres
  const uniqueDepartments = useMemo(() => {
    if (!employees || !Array.isArray(employees)) {
      return [];
    }
    const departments = [
      ...new Set(
        employees.filter((emp) => emp.department).map((emp) => emp.department)
      ),
    ];
    return departments;
  }, [employees]);

  const uniqueRoles = useMemo(() => {
    if (!employees || !Array.isArray(employees)) {
      return [];
    }
    const roles = [
      ...new Set(employees.filter((emp) => emp.role).map((emp) => emp.role)),
    ];
    return roles;
  }, [employees]);

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

        console.log("Données du planning à enregistrer:", updatedScheduleData);

        // Cas où on édite un planning existant (déjà avec un ID)
        if (updatedScheduleData.id) {
          console.log(
            `Mise à jour du planning existant ID ${updatedScheduleData.id}`
          );

          // Utiliser directement l'ID existant
          const result = await updateSchedule(
            updatedScheduleData.id,
            updatedScheduleData
          );

          console.log("Résultat de la mise à jour:", result);

          if (result.success) {
            // Mettre à jour l'état local
            setScheduleData((prevData) => {
              const newData = [...prevData];
              const existingIndex = newData.findIndex(
                (s) => s.id === updatedScheduleData.id
              );

              if (existingIndex >= 0) {
                // Mettre à jour le planning existant
                newData[existingIndex] = {
                  ...updatedScheduleData,
                  id: result.schedule.id,
                };
              } else {
                // Étrangement, le planning existe en base mais pas dans l'état local
                console.log(
                  "Planning non trouvé dans l'état local, ajout:",
                  result.schedule
                );
                newData.push({
                  ...updatedScheduleData,
                  id: result.schedule.id,
                });
              }

              return newData;
            });

            // Fermer le formulaire d'édition
            setEditingEmployeeId(null);

            // Afficher un message de succès
            toast.success("Planning mis à jour avec succès");
            return;
          } else {
            // Gestion unifiée des erreurs
            const errorMessage =
              result.message ||
              result.error ||
              "Erreur lors de la mise à jour du planning";

            console.error("Échec de la mise à jour:", errorMessage);
            toast.error(errorMessage);
            return;
          }
        }

        // Si les données mises à jour concernent un employé (création ou mise à jour sans ID)
        if (updatedScheduleData.employeeId) {
          // Vérifier si un planning existe déjà pour cet employé et cette semaine
          console.log(
            "Vérification de l'existence d'un planning pour employé:",
            updatedScheduleData.employeeId,
            "semaine:",
            updatedScheduleData.weekStart
          );

          const existingScheduleResult =
            await WeeklyScheduleService.getByEmployeeAndWeek(
              updatedScheduleData.employeeId,
              updatedScheduleData.weekStart
            );

          console.log("Résultat de la vérification:", existingScheduleResult);

          let result;

          if (
            existingScheduleResult.success &&
            existingScheduleResult.schedule
          ) {
            // Mise à jour d'un planning existant
            console.log(
              "Planning existant trouvé, mise à jour:",
              existingScheduleResult.schedule
            );
            result = await updateSchedule(
              existingScheduleResult.schedule.id,
              updatedScheduleData
            );

            // Vérifier les erreurs
            if (!result.success) {
              const errorMessage =
                result.message ||
                result.error ||
                "Erreur lors de la mise à jour du planning";

              console.error("Échec de la mise à jour:", errorMessage);
              toast.error(errorMessage);
              return;
            }
          } else {
            // Création d'un nouveau planning
            console.log(
              "Aucun planning existant, création d'un nouveau planning"
            );
            result = await createSchedule(updatedScheduleData);

            if (!result.success) {
              const errorMessage =
                result.message ||
                result.error ||
                "Erreur lors de la création du planning";

              console.error("Échec de la création:", errorMessage);
              toast.error(errorMessage);
              return;
            }
          }

          console.log("Résultat de l'opération:", result);
          console.log("Planning à ajouter/mettre à jour:", result.schedule);

          if (!result.schedule || !result.schedule.id) {
            console.error("Planning retourné invalide:", result);
            toast.error("Erreur: le planning retourné est invalide");
            return;
          }

          // Mise à jour de l'état local
          setScheduleData((prevData) => {
            // Vérifier si le planning existe déjà par ID
            const existingIdIndex = prevData.findIndex(
              (s) => s.id === result.schedule.id
            );

            // Si pas trouvé par ID, chercher par employeeId
            const existingEmployeeIndex =
              existingIdIndex === -1
                ? prevData.findIndex(
                    (s) =>
                      s.employeeId === updatedScheduleData.employeeId ||
                      s.employeeId === updatedScheduleData.employee_id
                  )
                : -1;

            console.log(
              "Index par ID:",
              existingIdIndex,
              "Index par employeeId:",
              existingEmployeeIndex
            );

            const newData = [...prevData];

            if (existingIdIndex >= 0) {
              // Mettre à jour le planning existant par ID
              console.log("Mise à jour du planning existant par ID");
              newData[existingIdIndex] = {
                ...result.schedule,
              };
            } else if (existingEmployeeIndex >= 0) {
              // Mettre à jour le planning existant par employeeId
              console.log("Mise à jour du planning existant par employeeId");
              newData[existingEmployeeIndex] = {
                ...result.schedule,
              };
            } else {
              // Ajouter un nouveau planning
              console.log("Ajout d'un nouveau planning");
              newData.push({
                ...result.schedule,
              });
            }

            console.log("Nouvel état des plannings:", newData);
            return newData;
          });

          // Rechargement des plannings pour s'assurer que tout est à jour
          setTimeout(() => {
            fetchSchedules(formattedWeekStart);
          }, 500);

          // Fermer le formulaire d'édition
          setEditingEmployeeId(null);

          // Afficher un message de succès
          toast.success("Planning enregistré avec succès");
        } else {
          // Si c'est un tableau complet de plannings, remplacer tout
          setScheduleData(updatedScheduleData);
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement du planning:", error);

        // Éviter la répétition des messages d'erreur déjà affichés
        const errorAlreadyShown =
          error.message &&
          (error.message.includes("existe déjà pour cet employé") ||
            error.message.includes("Un planning existe déjà"));

        if (!errorAlreadyShown) {
          toast.error(
            error.message || "Erreur lors de l'enregistrement du planning"
          );
        }
      }
    },
    [updateSchedule, createSchedule, formattedWeekStart, fetchSchedules]
  );

  // Fonction pour gérer l'enregistrement du planning
  const handleSaveSchedule = useCallback(
    async (updatedScheduleData) => {
      try {
        console.log("Saving schedule with data:", updatedScheduleData);
        await handleScheduleChange(updatedScheduleData);
        setEditingEmployeeId(null); // Fermer le formulaire après la sauvegarde
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du planning:", error);
        toast.error("Erreur lors de la sauvegarde du planning");
      }
    },
    [handleScheduleChange]
  );

  // Fonction pour supprimer un planning
  const handleDeleteSchedule = useCallback(
    async (scheduleId) => {
      try {
        const result = await deleteSchedule(scheduleId);

        if (result.success) {
          // Fermer le formulaire d'édition
          setEditingEmployeeId(null);

          // Mettre à jour les données locales
          setScheduleData((prevData) =>
            prevData.filter((schedule) => schedule.id !== scheduleId)
          );

          // Recharger les plannings pour s'assurer que les données sont à jour
          await fetchSchedules(formattedWeekStart);

          toast.success("Planning supprimé avec succès");
        } else {
          toast.error(
            result.error || "Erreur lors de la suppression du planning"
          );
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du planning:", error);
        toast.error("Erreur lors de la suppression du planning");
      }
    },
    [deleteSchedule, fetchSchedules, formattedWeekStart]
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

    const formattedWeekStart = formatDate(weekStartDate, "dd/MM/yyyy");
    const formattedWeekEnd = formatDate(weekEndDate, "dd/MM/yyyy");

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

    // Créer le contenu HTML avec un design professionnel et attractif
    const content = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 10px; color: #333; max-width: 980px; margin: 0 auto; position: relative;">
        <!-- Date de génération en haut à droite en italique -->
        <div style="position: absolute; top: 10px; right: 15px; font-style: italic; font-size: 10px; color: #6B7280;">
          Document généré le ${exportDateTime}
        </div>

        <!-- En-tête avec logo de l'entreprise -->
        <div style="padding: 10px 0 15px 0; border-bottom: 3px solid #3B82F6;">
          <h1 style="margin: 0; color: #2C3E50; font-size: 28px; font-weight: 600;">Planning Hebdomadaire</h1>
        </div>
        
        <!-- Informations de l'employé -->
        <div style="display: flex; justify-content: space-between; margin: 15px 0;">
          <div style="flex: 2;">
            <h2 style="margin: 0 0 5px 0; color: #2C3E50; font-size: 24px; font-weight: 600;">${
              employee.firstName || employee.first_name || "Inconnu"
            } ${employee.lastName || employee.last_name || "Inconnu"}</h2>
            
            <!-- Informations en italique et plus petit -->
            <div style="font-style: italic; font-size: 12px; color: #6B7280; margin-top: 5px;">
              <p style="margin: 3px 0;">Poste: ${
                employee.role || "Non défini"
              }</p>
              <p style="margin: 3px 0;">Département: ${
                employee.department || "Non défini"
              }</p>
              <p style="margin: 3px 0;">Heures contractuelles: ${
                employee.contractHours || employee.contract_hours || 0
              }h</p>
              <p style="margin: 3px 0;">Total heures planifiées: ${totalHours.toFixed(
                1
              )}h</p>
            </div>
          </div>
          
          <div style="flex: 1; text-align: right;">
            <!-- Date du planning en rouge et bien en valeur -->
            <div style="color: #DC2626; font-weight: 600; font-size: 18px; padding: 10px; border: 2px solid #DC2626; border-radius: 8px; display: inline-block; background-color: #FEF2F2;">
              Du ${formattedWeekStart} au ${formattedWeekEnd}
            </div>
          </div>
        </div>
        
        <!-- Tableau des horaires avec design moderne -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #3B82F6;">
              <th style="padding: 12px; text-align: left; color: white; font-weight: 500; border-right: 1px solid rgba(255, 255, 255, 0.2);">Jour</th>
              <th style="padding: 12px; text-align: center; color: white; font-weight: 500; border-right: 1px solid rgba(255, 255, 255, 0.2); width: 15%;">Heures</th>
              <th style="padding: 12px; text-align: center; color: white; font-weight: 500; border-right: 1px solid rgba(255, 255, 255, 0.2); width: 35%;">Créneaux</th>
              <th style="padding: 12px; text-align: left; color: white; font-weight: 500; width: 25%;">Notes</th>
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
                  isWeekendDay ? "#F9FAFB" : "white"
                }; border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 12px; font-weight: ${
                    isWeekendDay ? "bold" : "normal"
                  }; color: ${
                  isWeekendDay ? "#4B5563" : "#1F2937"
                }; border-right: 1px solid #E5E7EB;">
                    <div style="font-weight: 600;">${getDayName(dayDate)}</div>
                    <div style="font-size: 12px; color: #6B7280;">${formatDate(
                      dayDate,
                      "dd/MM"
                    )}</div>
                  </td>
                  <td style="padding: 10px 12px; text-align: center; border-right: 1px solid #E5E7EB;">
                    ${
                      day.isAbsent
                        ? `<span style="color: #EF4444; font-weight: 500; background-color: #FEE2E2; padding: 3px 8px; border-radius: 4px; display: inline-block; font-size: 12px;">${
                            day.absenceReason || "Absent"
                          }</span>`
                        : `<span style="font-weight: 600; color: #10B981;">${day.hours}h</span>`
                    }
                  </td>
                  <td style="padding: 10px 12px; text-align: center; border-right: 1px solid #E5E7EB;">
                    ${
                      day.isAbsent
                        ? '<span style="color: #9CA3AF;">-</span>'
                        : (day.timeSlots || [])
                            .map(
                              (slot) =>
                                `<div style="margin: 3px 0; background-color: #F3F4F6; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 12px;">${slot.start} - ${slot.end}</div>`
                            )
                            .join(" ")
                    }
                  </td>
                  <td style="padding: 10px 12px; font-style: italic; color: #6B7280; font-size: 12px;">
                    ${day.notes || "-"}
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
        
        <!-- Pied de page avec légende -->
        <div style="margin-top: 5px; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <span style="width: 12px; height: 12px; background-color: #F9FAFB; border: 1px solid #E5E7EB; display: inline-block; margin-right: 5px;"></span>
              <span></span>
            </div>
            <div style="display: flex; align-items: center;">
            </div>
            <div>SmartPlanning</div>
          </div>
        </div>
      </div>
    `;

    // Ajouter le contenu à l'élément temporaire
    tempElement.innerHTML = DOMPurify.sanitize(content);
    document.body.appendChild(tempElement);

    // Générer le PDF avec options pour s'assurer qu'il tient sur une page
    html2canvas(tempElement, {
      scale: 1,
      useCORS: true,
      logging: false,
      windowWidth: 1000,
      windowHeight: 1414, // Rapport d'aspect A4 paysage
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Format paysage
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Ajustement pour s'assurer que tout tient sur une page
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

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

  // Ajouter un useEffect pour charger les noms des utilisateurs au chargement des plannings
  useEffect(() => {
    console.log("⚡ useEffect de chargement des noms déclenché");

    if (Array.isArray(schedules) && schedules.length > 0) {
      // Récupérer tous les IDs d'utilisateurs qui ont modifié des plannings
      const allUserIds = schedules
        .filter((schedule) => schedule.updated_by)
        .map((schedule) => String(schedule.updated_by));

      // Éliminer les doublons
      const uniqueUserIds = [...new Set(allUserIds)];

      console.log("🔎 Tous les IDs utilisateurs trouvés:", uniqueUserIds);
      console.log("📂 Contenu actuel du cache:", userCache);

      // Filtrer les utilisateurs non encore dans le cache
      const userIdsToFetch = uniqueUserIds.filter(
        (userId) => !userCache[userId]
      );

      console.log("🔄 IDs à récupérer:", userIdsToFetch);

      // Toujours récupérer l'ID 13 (celui qui pose problème), même s'il est déjà dans le cache
      if (uniqueUserIds.includes("13")) {
        if (!userIdsToFetch.includes("13")) {
          console.log(
            "🚨 Force refresh pour l'ID 13 - ajout à la liste à récupérer"
          );
          userIdsToFetch.push("13");

          // Suppression du cache pour l'ID 13 pour forcer son rechargement
          setUserCache((prev) => {
            const newCache = { ...prev };
            delete newCache["13"];
            return newCache;
          });
        }
      }

      // Si nous avons des utilisateurs à récupérer
      if (userIdsToFetch.length > 0) {
        console.log(
          "⚡ Récupération des informations pour les utilisateurs:",
          userIdsToFetch
        );

        // Récupérer chaque utilisateur avec un léger délai entre chaque
        userIdsToFetch.forEach((userId, index) => {
          setTimeout(() => {
            console.log(`⏱️ Fetch planifié pour ${userId}`);
            fetchUserName(userId);
          }, index * 200); // 200ms de délai entre chaque requête
        });
      } else {
        console.log("✅ Tous les utilisateurs sont déjà en cache");
      }
    }
  }, [schedules, userCache, fetchUserName, userCacheUpdated]);

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
            <StyledIcon>
              <FiCalendar />
            </StyledIcon>
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

                    {/* Logs de débogage */}
                    {console.log("🧪 Contenu de schedules:", schedules)}
                    {console.log(
                      "🧪 Type de schedules:",
                      typeof schedules,
                      Array.isArray(schedules),
                      schedules?.length
                    )}
                    {console.log(
                      "🧪 Contenu de filteredEmployees:",
                      filteredEmployees
                    )}
                    {console.log(
                      "🧪 Types d'IDs des employés filtrés:",
                      filteredEmployees.map((e) => ({
                        id: e.id,
                        type: typeof e.id,
                      }))
                    )}
                    {Array.isArray(schedules) &&
                      schedules.length > 0 &&
                      console.log(
                        "🧪 Propriétés des plannings:",
                        schedules.map((s) => ({
                          id: s.id,
                          employeeId: s.employeeId,
                          employee_id: s.employee_id,
                          weekStart: s.weekStart,
                          week_start: s.week_start,
                          hasDays: Array.isArray(s.days)
                            ? s.days.length
                            : s.days,
                        }))
                      )}
                    {console.log(
                      "🧪 Plannings après filtrage:",
                      Array.isArray(schedules)
                        ? schedules.filter((schedule) =>
                            filteredEmployees.some(
                              (emp) =>
                                Number(emp.id) ===
                                Number(
                                  schedule.employeeId || schedule.employee_id
                                )
                            )
                          )
                        : "Schedules n'est pas un tableau"
                    )}

                    {/* Tableau des métadonnées des plannings */}
                    <MetadataSection>
                      <MetadataTitle>
                        <FaCalendarDay /> Métadonnées des plannings
                      </MetadataTitle>

                      {/* Vue tableau standard avec défilement horizontal */}
                      <div
                        className="responsive-table-wrapper"
                        style={{
                          overflowX: "auto",
                          WebkitOverflowScrolling: "touch",
                        }}
                      >
                        <MetadataTable>
                          <TableHead>
                            <tr>
                              <TableHeadCell>Employé</TableHeadCell>
                              <TableHeadCell>Date de création</TableHeadCell>
                              <TableHeadCell>
                                Dernière modification
                              </TableHeadCell>
                              <TableHeadCell>Modifié par</TableHeadCell>
                            </tr>
                          </TableHead>
                          <TableBody>
                            {Array.isArray(schedules) &&
                            schedules.length > 0 ? (
                              schedules
                                .filter((schedule) =>
                                  filteredEmployees.some(
                                    (emp) =>
                                      Number(emp.id) ===
                                      Number(
                                        schedule.employeeId ||
                                          schedule.employee_id
                                      )
                                  )
                                )
                                .map((schedule) => {
                                  // Logs pour déboguer chaque schedule
                                  console.log(
                                    "🔍 Traitement du schedule:",
                                    schedule
                                  );

                                  // Trouver l'employé correspondant
                                  const employee = employees.find(
                                    (emp) =>
                                      Number(emp.id) ===
                                      Number(
                                        schedule.employeeId ||
                                          schedule.employee_id
                                      )
                                  );

                                  // Rechercher le nom de l'utilisateur qui a modifié le planning
                                  let updatedByName = "Non modifié";
                                  const isModified = !!schedule.updated_by;

                                  if (schedule.updated_by) {
                                    // Convertir l'ID en chaîne pour l'accès au cache
                                    const updatedById = String(
                                      schedule.updated_by
                                    );

                                    // Logs de diagnostic
                                    console.log(
                                      "🧠 userCache complet:",
                                      userCache
                                    );
                                    console.log(
                                      "🔍 Nom pour ID:",
                                      updatedById,
                                      "=",
                                      userCache[updatedById]
                                    );
                                    console.log(
                                      "🔢 Type de ID:",
                                      typeof updatedById,
                                      "Contenu:",
                                      updatedById
                                    );

                                    // Vérifier si le nom existe dans le cache
                                    if (userCache[updatedById]) {
                                      updatedByName = userCache[updatedById];
                                      console.log(
                                        `✅ Nom trouvé dans le cache pour ${updatedById}: ${updatedByName}`
                                      );
                                    } else {
                                      updatedByName = `Utilisateur (ID: ${updatedById})`;
                                      console.log(
                                        `⚠️ Nom non trouvé dans le cache pour ${updatedById}, contenu du cache:`,
                                        userCache
                                      );

                                      // Tenter de récupérer le nom si pas encore dans le cache
                                      console.log(
                                        `🔄 Tentative de récupération pour ${updatedById}`
                                      );
                                      fetchUserName(updatedById);

                                      // Pour test: forcer une seconde tentative après un délai
                                      setTimeout(() => {
                                        console.log(
                                          `⏱️ Retry forcé après délai pour ${updatedById}`
                                        );
                                        fetchUserName(updatedById);
                                      }, 1000);
                                    }
                                  }

                                  // Formater les dates en français
                                  const createdAtDate = new Date(
                                    schedule.created_at
                                  );
                                  const updatedAtDate = new Date(
                                    schedule.updated_at
                                  );

                                  const formattedCreatedAt =
                                    createdAtDate.toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });

                                  const formattedUpdatedAt =
                                    updatedAtDate.toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });

                                  return (
                                    <tr key={schedule.id}>
                                      <TableCell>
                                        <EmployeeName>
                                          {employee
                                            ? `${
                                                employee.first_name ||
                                                employee.firstName
                                              } ${
                                                employee.last_name ||
                                                employee.lastName
                                              }`
                                            : `Employé #${
                                                schedule.employeeId ||
                                                schedule.employee_id
                                              }`}
                                        </EmployeeName>
                                      </TableCell>
                                      <TableCell>
                                        <DateInfo>
                                          {formattedCreatedAt}
                                        </DateInfo>
                                      </TableCell>
                                      <TableCell>
                                        <DateInfo>
                                          {formattedUpdatedAt}
                                        </DateInfo>
                                      </TableCell>
                                      <TableCell key={schedule.id}>
                                        <UpdatedByInfo
                                          isModified={isModified}
                                          data-user-id={schedule.updated_by}
                                          data-cache-updated={userCacheUpdated} // Forcer le re-rendu quand le cache change
                                        >
                                          <UpdatedByDisplay
                                            userId={schedule.updated_by}
                                            userCache={userCache}
                                            schedule={schedule}
                                          />
                                        </UpdatedByInfo>
                                      </TableCell>
                                    </tr>
                                  );
                                })
                            ) : (
                              <tr>
                                <TableCell
                                  colSpan={4}
                                  style={{
                                    textAlign: "center",
                                    padding: "2rem",
                                  }}
                                >
                                  Aucune métadonnée disponible pour les
                                  plannings sélectionnés
                                </TableCell>
                              </tr>
                            )}
                          </TableBody>
                        </MetadataTable>
                      </div>

                      {/* Vue alternative pour les très petits écrans */}
                      <MobileCardView>
                        {Array.isArray(schedules) && schedules.length > 0 ? (
                          schedules
                            .filter((schedule) =>
                              filteredEmployees.some(
                                (emp) =>
                                  Number(emp.id) ===
                                  Number(
                                    schedule.employeeId || schedule.employee_id
                                  )
                              )
                            )
                            .map((schedule) => {
                              // Trouver l'employé correspondant
                              const employee = employees.find(
                                (emp) =>
                                  Number(emp.id) ===
                                  Number(
                                    schedule.employeeId || schedule.employee_id
                                  )
                              );

                              // Formater les dates en français
                              const createdAtDate = new Date(
                                schedule.created_at
                              );
                              const updatedAtDate = new Date(
                                schedule.updated_at
                              );

                              const formattedCreatedAt =
                                createdAtDate.toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });

                              const formattedUpdatedAt =
                                updatedAtDate.toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                });

                              return (
                                <MobileCard key={schedule.id}>
                                  <MobileCardHeader>
                                    {employee
                                      ? `${
                                          employee.first_name ||
                                          employee.firstName
                                        } ${
                                          employee.last_name ||
                                          employee.lastName
                                        }`
                                      : `Employé #${
                                          schedule.employeeId ||
                                          schedule.employee_id
                                        }`}
                                  </MobileCardHeader>

                                  <MobileCardRow>
                                    <MobileCardLabel>
                                      Date de création
                                    </MobileCardLabel>
                                    <MobileCardValue>
                                      {formattedCreatedAt}
                                    </MobileCardValue>
                                  </MobileCardRow>

                                  <MobileCardRow>
                                    <MobileCardLabel>
                                      Dernière modification
                                    </MobileCardLabel>
                                    <MobileCardValue>
                                      {formattedUpdatedAt}
                                    </MobileCardValue>
                                  </MobileCardRow>

                                  <MobileCardRow>
                                    <MobileCardLabel>
                                      Modifié par
                                    </MobileCardLabel>
                                    <MobileCardValue>
                                      {schedule.updater_name ||
                                        (schedule.updated_by
                                          ? userCache[
                                              String(schedule.updated_by)
                                            ] ||
                                            `Utilisateur (ID: ${schedule.updated_by})`
                                          : "Non modifié")}
                                    </MobileCardValue>
                                  </MobileCardRow>
                                </MobileCard>
                              );
                            })
                        ) : (
                          <MobileCard>
                            <MobileCardHeader>Information</MobileCardHeader>
                            <MobileCardRow>
                              <MobileCardValue
                                style={{ width: "100%", textAlign: "center" }}
                              >
                                Aucune métadonnée disponible pour les plannings
                                sélectionnés
                              </MobileCardValue>
                            </MobileCardRow>
                          </MobileCard>
                        )}
                      </MobileCardView>
                    </MetadataSection>
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
                      id: null, // Ajouter un id null par défaut pour les nouveaux plannings
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
                  onSave={handleSaveSchedule}
                  onCancel={handleCancelEdit}
                  onDelete={handleDeleteSchedule}
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
          <AutoScheduleWizard
            isOpen={isWizardOpen}
            onClose={() => setIsWizardOpen(false)}
            onSave={(generatedSchedule) => {
              // Transformation du planning généré automatiquement en format attendu par l'API
              console.log("Planning généré:", generatedSchedule);

              // Pour chaque employé sélectionné, créer un planning pour la semaine
              const selectedEmployeeIds = generatedSchedule.employees || [];
              const employeeRestPreferences =
                generatedSchedule.employeeRestPreferences || {};

              if (selectedEmployeeIds.length > 0) {
                let createdCount = 0;

                // Convertir les jours en français aux index de jours (0 = lundi, 6 = dimanche)
                const frenchDayToIndex = {
                  Lundi: 0,
                  Mardi: 1,
                  Mercredi: 2,
                  Jeudi: 3,
                  Vendredi: 4,
                  Samedi: 5,
                  Dimanche: 6,
                };

                // Parcourir chaque employé sélectionné
                selectedEmployeeIds.forEach(async (employeeId) => {
                  try {
                    // Récupérer les données de l'employé
                    const employee = employees.find((e) => e.id === employeeId);
                    if (!employee) {
                      console.error(
                        `Employé ${employeeId} non trouvé dans la liste des employés`
                      );
                      return;
                    }

                    const contractHours =
                      employee.contractHours || employee.contract_hours || 35;

                    // Récupérer les jours de repos préférés de cet employé
                    const restDays = employeeRestPreferences[employeeId] || [];
                    const restDayIndexes = restDays.map(
                      (day) => frenchDayToIndex[day]
                    );

                    // Calculer les heures quotidiennes en fonction des heures contractuelles
                    // et du nombre de jours travaillés (excluant les jours de repos)
                    const workDaysCount = 7 - restDayIndexes.length;
                    const dailyHours =
                      workDaysCount > 0
                        ? Math.round((contractHours / workDaysCount) * 2) / 2 // Arrondir à 0.5 près
                        : 0;

                    console.log(
                      `Employé: ${employee.first_name} ${employee.last_name} (ID: ${employeeId})`
                    );
                    console.log(`  Heures contractuelles: ${contractHours}h`);
                    console.log(
                      `  Jours de repos: ${restDays.join(
                        ", "
                      )} (indices: ${restDayIndexes.join(", ")})`
                    );
                    console.log(`  Jours travaillés: ${workDaysCount}`);
                    console.log(`  Heures par jour travaillé: ${dailyHours}h`);

                    // Créer les données du planning pour tous les jours de la semaine
                    const days = Array(7)
                      .fill()
                      .map((_, dayIndex) => {
                        // Si c'est un jour de repos préféré
                        if (restDayIndexes.includes(dayIndex)) {
                          return {
                            type: "absence",
                            hours: "0",
                            absence: "Repos",
                            note: "",
                            timeSlots: [],
                          };
                        }

                        // Sinon c'est un jour de travail
                        const timeSlots = [];
                        let remainingHours = dailyHours;

                        // Si les heures quotidiennes sont <= 4, une seule plage le matin
                        if (dailyHours <= 4) {
                          const endHour = Math.floor(9 + dailyHours);
                          const endMinutes = dailyHours % 1 > 0 ? "30" : "00";

                          timeSlots.push({
                            start: "09:00",
                            end: `${endHour}:${endMinutes}`,
                          });
                        } else {
                          // Première plage: 9h-13h (4h)
                          timeSlots.push({
                            start: "09:00",
                            end: "13:00",
                          });

                          // Deuxième plage: 14h-??h (heures restantes)
                          const afternoonHours = dailyHours - 4;
                          if (afternoonHours > 0) {
                            const endHour = Math.floor(14 + afternoonHours);
                            const endMinutes =
                              afternoonHours % 1 > 0 ? "30" : "00";

                            timeSlots.push({
                              start: "14:00",
                              end: `${endHour}:${endMinutes}`,
                            });
                          }
                        }

                        return {
                          type: "work",
                          hours: dailyHours.toString(),
                          absence: "",
                          note: "",
                          timeSlots: timeSlots,
                        };
                      });

                    // Calculer le total d'heures
                    const totalHours = days.reduce(
                      (sum, day) => sum + parseFloat(day.hours || "0"),
                      0
                    );
                    console.log(
                      `  Total d'heures planifiées: ${totalHours}h (cible: ${contractHours}h)`
                    );

                    // Créer un planning pour cet employé
                    const scheduleData = {
                      employeeId: employeeId,
                      weekStart: generatedSchedule.startDate,
                      weekEnd: generatedSchedule.endDate,
                      days: days,
                    };

                    // Sauvegarder le planning
                    const result = await createSchedule(scheduleData);

                    if (result.success) {
                      console.log(
                        `Planning créé avec succès pour l'employé ${employeeId}:`,
                        result
                      );
                      createdCount++;
                    } else {
                      console.error(
                        `Erreur lors de la création du planning pour l'employé ${employeeId}:`,
                        result.message
                      );
                    }
                  } catch (error) {
                    console.error(
                      `Erreur lors de la création du planning pour l'employé ${employeeId}:`,
                      error
                    );
                  }
                });

                // Afficher un message de succès
                setTimeout(() => {
                  toast.success(
                    `Planning(s) généré(s) avec succès pour ${createdCount} employé(s)!`
                  );

                  // Recharger les données
                  fetchSchedules(currentWeekStart);
                }, 1500); // Attendre 1,5 secondes pour que les plannings soient sauvegardés
              } else {
                toast.error(
                  "Aucun employé sélectionné pour la génération de planning"
                );
              }

              setIsWizardOpen(false);
            }}
            weekStart={currentWeekStart}
          />
        </WizardOverlay>
      )}
    </div>
  );
};

export default WeeklySchedulePage;
